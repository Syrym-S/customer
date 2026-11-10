import { Box, DialogContent } from '@mui/material';
import i18n from '../../../shared/i18n';
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
    mapCreatedLeadToUi,
    mapCreateLeadDocumentsToApiDocuments,
    mapCreateLeadFormToApi,
} from '../model/create-lead.adapter';
import { CreateLeadActions } from './create-lead-modal/CreateLeadActions';
import { CreateLeadStepTabs } from './create-lead-modal/CreateLeadStepTabs';
import { CreateLeadHeader } from './create-lead-modal/CreateLeadHeader';
import { ForwarderStep } from './create-lead-modal/steps/ForwarderStep';
import { CargoStep } from './create-lead-modal/steps/CargoStep';
import { ConfirmStep } from './create-lead-modal/steps/ConfirmStep';
import { RouteStep } from './create-lead-modal/steps/RouteStep';
import { CreateLeadResultModal } from './create-lead-modal/components/CreateLeadResultModal';
import { useLeadsContext } from '../../../widgets/customer-leads/model/useLeadsContext';
import { createLead } from '../api/create-lead.repository';
import { DocumentsStep } from './create-lead-modal/steps/DocumentsStep';
import { uploadLeadDocument } from '../../../widgets/customer-leads/api/lead-documents.api';
import { buildPointScheduleFields } from '../lib/point-schedule.helpers';
import { AppDialog } from '../../../shared/ui/AppDialog';

const STEP_KEYS = [
    'createLead.steps.route',
    'common.fields.cargo',
    'common.fields.forwarder',
    'createLead.steps.documents',
    'createLead.steps.confirm',
];

function createInitialCargo() {
    return {
        name: '',
        description: '',
        weight_kg: '',
        type: i18n.t("common.empty.notSpecifiedM"),
        width_cm: '',
        height_cm: '',
        length_cm: '',
        volume_m3: '',
        isVolumeManual: false,
        cargo_price: '',
        tnved: null,
    };
}

function createInitialLocation() {
    return {
        country: '',
        region: '',
        city: '',
        address: '',
    };
}

function createInitialForm() {
    return {
        fromLocation: '',
        fromLat: '',
        fromLng: '',
        from_location: createInitialLocation(),
        fromStartAt: '',
        fromEndAt: '',

        toLocation: '',
        toLat: '',
        toLng: '',
        to_location: createInitialLocation(),
        toStartAt: '',
        toEndAt: '',

        waypoints: [],

        cargos: [createInitialCargo()],

        price: '',
        gracePeriodDays: '',
        currency: 'KZT',
        vat: true,
        pass_verify: false,
        is_international: false,
        comment: '',

        loadingType: '',
        packagingType: '',
        compositionType: '',
        transportType: '',

        forwarderId: '',
        forwarder: null,

        documents: [],
    };
}

const staticStepFields = [
    null,
    ['cargos', 'price', 'gracePeriodDays', 'currency'],
    [],
    [],
];

function getRouteStepFields(waypoints) {
    const normalizedWaypoints = Array.isArray(waypoints) ? waypoints : [];
    const points = buildPointScheduleFields(normalizedWaypoints);

    return [
        'fromLocation',
        'toLocation',
        ...normalizedWaypoints.map((_, index) => `waypoints.${index}.location`),
        ...points.flatMap((point) => [point.startField, point.endField]),
    ];
}

function getStepFields(stepIndex, formValues) {
    if (stepIndex === 0) {
        return getRouteStepFields(formValues.waypoints);
    }

    return staticStepFields[stepIndex] || [];
}

function getNestedFieldError(errors, fieldName) {
    return fieldName
        .split('.')
        .reduce((value, key) => (value ? value[key] : undefined), errors);
}

function getCreatedLeadId(response) {
    return (
        response?.data?.id ||
        response?.data?.lead_id ||
        response?.id ||
        response?.lead_id ||
        response?.result?.id ||
        null
    );
}

async function uploadCreateLeadDocuments(leadId, documents = []) {
    if (!leadId || !documents.length) {
        return;
    }

    const documentsWithFiles = documents.filter((document) => document.file);

    for (const document of documentsWithFiles) {
        await uploadLeadDocument(leadId, {
            file: document.file,
            context: document.context || document.name || '',
        });
    }
}

export function CreateLeadModal({ open, onClose }) {
    const { t } = useTranslation();

    const [activeStep, setActiveStep] = useState(0);
    const [maxAvailableStep, setMaxAvailableStep] = useState(0);
    const contentRef = useRef(null);
    const {
        control,
        handleSubmit,
        reset,
        trigger,
        setValue,
        getValues,
        formState: { errors },
    } = useForm({
        defaultValues: createInitialForm(),
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const { prependLead } = useLeadsContext();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [resultModal, setResultModal] = useState({
        open: false,
        type: null,
        title: '',
        message: '',
    });

    const formValues = useWatch({ control });

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [activeStep]);

    const isFirstStep = activeStep === 0;
    const steps = STEP_KEYS.map((key) => t(key));

    const isLastStep = activeStep === steps.length - 1;

    const currentStepFields = getStepFields(activeStep, formValues);

    const hasCurrentStepErrors = currentStepFields.some((fieldName) =>
        Boolean(getNestedFieldError(errors, fieldName)),
    );

    function handleBack() {
        setActiveStep((prevStep) => prevStep - 1);
    }

    async function handleNext() {
        const fields = getStepFields(activeStep, formValues);

        const isStepValid = await trigger(fields);

        if (!isStepValid) {
            return;
        }

        const nextStep = activeStep + 1;

        setMaxAvailableStep((prevStep) => Math.max(prevStep, nextStep));
        setActiveStep(nextStep);
    }

    async function handleStepClick(targetStep) {
        if (targetStep === activeStep) {
            return;
        }

        if (targetStep < activeStep) {
            setActiveStep(targetStep);
            return;
        }

        if (targetStep > maxAvailableStep) {
            return;
        }

        const fields = getStepFields(activeStep, formValues);

        const isStepValid = await trigger(fields);

        if (!isStepValid) {
            return;
        }

        setActiveStep(targetStep);
    }

    async function handleSubmitClick() {
        if (!isLastStep) {
            return;
        }

        await handleSubmit(handleCreateLead)();
    }

    async function handleSaveDraft() {
        if (isSubmitting || isSavingDraft) {
            return;
        }

        try {
            setIsSavingDraft(true);

            const data = getValues();
            const payload = { ...mapCreateLeadFormToApi(data), is_draft: true };
            const response = await createLead(payload);

            const createdLead = mapCreatedLeadToUi(data, response);

            prependLead(createdLead);
            handleClose();

            setResultModal({
                open: true,
                type: 'success',
                title: t("createLead.result.draftSaved"),
                message: t("createLead.result.savedAsDraft"),
            });
        } catch (error) {
            setResultModal({
                open: true,
                type: 'error',
                title: t("createLead.result.saveError"),
                message:
                    error.response?.data?.message ||
                    error.message ||
                    t("createLead.result.draftSaveFailed"),
            });
        } finally {
            setIsSavingDraft(false);
        }
    }

    function handleClose() {
        setActiveStep(0);
        setMaxAvailableStep(0);
        reset(createInitialForm());
        onClose();
    }

    async function handleCreateLead(data) {
        try {
            setIsSubmitting(true);

            const documents = mapCreateLeadDocumentsToApiDocuments(data);
            const payload = mapCreateLeadFormToApi(data);
            console.log('create lead payload:', payload);
            const response = await createLead(payload);

            const createdLeadId = getCreatedLeadId(response);

            let documentsUploadFailed = false;

            if (documents.length > 0 && createdLeadId) {
                try {
                    await uploadCreateLeadDocuments(createdLeadId, documents);
                } catch (documentError) {
                    documentsUploadFailed = true;
                    console.error(
                        'Create lead documents upload failed:',
                        documentError,
                    );
                }
            }

            const createdLead = mapCreatedLeadToUi(data, response);

            prependLead(createdLead);
            handleClose();

            setResultModal({
                open: true,
                type: documentsUploadFailed ? 'warning' : 'success',
                title: t("createLead.result.created"),
                message: documentsUploadFailed
                    ? t("createLead.result.createdWithDocumentErrors")
                    : createdLeadId
                      ? t('createLead.result.createdSuccessWithId', {
                           id: createdLeadId,
                        })
                      : t('createLead.result.createdSuccess'),
            });
        } catch (error) {
            setResultModal({
                open: true,
                type: 'error',
                title: t("createLead.result.createError"),
                message:
                    error.response?.data?.message ||
                    error.message ||
                    t("createLead.result.createFailed"),
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    function renderStepContent() {
        if (activeStep === 0) {
            return (
                <RouteStep
                    control={control}
                    errors={errors}
                    form={formValues}
                    setValue={setValue}
                    trigger={trigger}
                />
            );
        }

        if (activeStep === 1) {
            return (
                <CargoStep
                    control={control}
                    errors={errors}
                    setValue={setValue}
                    getValues={getValues}
                />
            );
        }

        if (activeStep === 2) {
            return (
                <ForwarderStep
                    control={control}
                    errors={errors}
                    setValue={setValue}
                />
            );
        }

        if (activeStep === 3) {
            return <DocumentsStep form={formValues} setValue={setValue} />;
        }

        return <ConfirmStep form={formValues} />;
    }

    function hasStepErrors(stepIndex) {
        const fields = getStepFields(stepIndex, formValues);

        return fields.some((fieldName) =>
            Boolean(getNestedFieldError(errors, fieldName)),
        );
    }

    return (
        <>
            <AppDialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="md"
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 4,
                            m: { xs: 1, sm: 4 },
                            width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 64px)' },
                            maxHeight: {
                                xs: 'calc(100% - 16px)',
                                sm: 'calc(100% - 64px)',
                            },
                        },
                    },
                }}
            >
                <CreateLeadHeader
                    activeStep={activeStep}
                    stepsCount={steps.length}
                />

                <Box
                    sx={{
                        px: {
                            xs: 1.5,
                            sm: 2,
                            md: 3,
                        },
                        flexShrink: 0,
                    }}
                >
                    <CreateLeadStepTabs
                        steps={steps}
                        activeStep={activeStep}
                        maxAvailableStep={maxAvailableStep}
                        hasStepErrors={hasStepErrors}
                        onStepClick={handleStepClick}
                    />
                </Box>

                <DialogContent
                    ref={contentRef}
                    dividers
                    sx={{
                        px: {
                            xs: 1.5,
                            sm: 2,
                            md: 3,
                        },
                    }}
                >
                    {renderStepContent()}
                </DialogContent>

                <CreateLeadActions
                    isFirstStep={isFirstStep}
                    isLastStep={isLastStep}
                    hasCurrentStepErrors={hasCurrentStepErrors}
                    isSubmitting={isSubmitting}
                    isSavingDraft={isSavingDraft}
                    onClose={handleClose}
                    onBack={handleBack}
                    onNext={handleNext}
                    onSubmit={handleSubmitClick}
                    onSaveDraft={handleSaveDraft}
                />
            </AppDialog>

            <CreateLeadResultModal
                open={resultModal.open}
                type={resultModal.type}
                title={resultModal.title}
                message={resultModal.message}
                onClose={() =>
                    setResultModal({
                        open: false,
                        type: null,
                        title: '',
                        message: '',
                    })
                }
            />
        </>
    );
}

CreateLeadModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};
