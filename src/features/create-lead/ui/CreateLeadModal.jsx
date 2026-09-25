import { Box, Dialog, DialogContent } from '@mui/material';
import PropTypes from 'prop-types';
import { useLayoutEffect, useRef, useState } from 'react';
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

const steps = ['Маршрут', 'Груз', 'Экспедитор', 'Документы', 'Проверка'];

function createInitialCargo() {
    return {
        name: '',
        description: '',
        weight_kg: '',
        type: 'Не указан',
        width_cm: '',
        height_cm: '',
        length_cm: '',
        cargo_price: '',
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
        currency: 'KZT',
        vat: true,
        pass_verify: false,
        comment: '',

        forwarderId: '',
        forwarder: null,

        documents: [],
    };
}

const staticStepFields = [
    null,
    ['cargos', 'price', 'currency'],
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
    const [activeStep, setActiveStep] = useState(0);
    const [maxAvailableStep, setMaxAvailableStep] = useState(0);
    const stepContentRef = useRef(null);
    const [stepContentHeight, setStepContentHeight] = useState(null);
    const {
        control,
        handleSubmit,
        reset,
        trigger,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: createInitialForm(),
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const { prependLead } = useLeadsContext();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resultModal, setResultModal] = useState({
        open: false,
        type: null,
        title: '',
        message: '',
    });

    const formValues = useWatch({ control });

    useLayoutEffect(() => {
        const node = stepContentRef.current;

        if (!node) {
            return undefined;
        }

        const observer = new ResizeObserver(([entry]) => {
            setStepContentHeight(entry.contentRect.height);
        });

        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    const isFirstStep = activeStep === 0;
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
                title: 'Заказ создан',
                message: documentsUploadFailed
                    ? 'Заказ создан, но часть документов не загрузилась'
                    : `Заказ успешно создан${createdLeadId ? `: ${createdLeadId}` : ''}`,
            });
        } catch (error) {
            setResultModal({
                open: true,
                type: 'error',
                title: 'Ошибка создания',
                message:
                    error.response?.data?.message ||
                    error.message ||
                    'Не удалось создать заказ',
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
            return <CargoStep control={control} errors={errors} />;
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
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="md"
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 4,
                        },
                    },
                }}
            >
                <Box component="div">
                    <CreateLeadHeader
                        activeStep={activeStep}
                        stepsCount={steps.length}
                    />

                    <DialogContent
                        sx={{
                            px: {
                                xs: 1.5,
                                sm: 2,
                                md: 3,
                            },
                        }}
                    >
                        <CreateLeadStepTabs
                            steps={steps}
                            activeStep={activeStep}
                            maxAvailableStep={maxAvailableStep}
                            hasStepErrors={hasStepErrors}
                            onStepClick={handleStepClick}
                        />

                        <Box
                            sx={{
                                height: stepContentHeight ?? 'auto',
                                overflow: 'hidden',
                                transition: 'height 200ms ease',
                            }}
                        >
                            <Box ref={stepContentRef}>{renderStepContent()}</Box>
                        </Box>
                    </DialogContent>

                    <CreateLeadActions
                        isFirstStep={isFirstStep}
                        isLastStep={isLastStep}
                        hasCurrentStepErrors={hasCurrentStepErrors}
                        isSubmitting={isSubmitting}
                        onClose={handleClose}
                        onBack={handleBack}
                        onNext={handleNext}
                        onSubmit={handleSubmitClick}
                    />
                </Box>
            </Dialog>

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
