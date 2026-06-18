import { Box, Dialog, DialogContent } from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
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

const steps = ['Маршрут', 'Груз', 'Экспедитор', 'Документы', 'Проверка'];

const initialForm = {
   // customer: 'AKE Plast (АКЕ Пласт) ТОО',
   // contactName: 'Suleimenov Syrym',
   // phone: '+7 777 777 77 77',

   fromLocation: '',
   fromLat: '',
   fromLng: '',

   toLocation: '',
   toLat: '',
   toLng: '',

   loadingDate: '2026-06-10',

   cargoType: 'Не указан',
   weightKg: '1200',
   cargoLengthCm: '50',
   cargoWidthCm: '50',
   cargoHeightCm: '70',
   price: '250000',
   currency: 'KZT',
   vat: true,
   comment: '',

   forwarderId: '',
   forwarder: null,

   documents: [],
};

const stepFields = [
   ['fromLocation', 'toLocation', 'loadingDate'],
   [
      'cargoType',
      'weightKg',
      'cargoLengthCm',
      'cargoWidthCm',
      'cargoHeightCm',
      'price',
      'currency',
   ],
   [],
   [],
];

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
   const {
      control,
      handleSubmit,
      reset,
      trigger,
      setValue,
      formState: { errors },
   } = useForm({
      defaultValues: initialForm,
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

   const isFirstStep = activeStep === 0;
   const isLastStep = activeStep === steps.length - 1;

   const currentStepFields = stepFields[activeStep] || [];

   const hasCurrentStepErrors = currentStepFields.some((fieldName) =>
      Boolean(errors[fieldName]),
   );

   function handleBack() {
      setActiveStep((prevStep) => prevStep - 1);
   }

   async function handleNext() {
      const fields = stepFields[activeStep] || [];

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

      const fields = stepFields[activeStep] || [];

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
      reset(initialForm);
      onClose();
   }

   async function handleCreateLead(data) {
      try {
         setIsSubmitting(true);

         const documents = mapCreateLeadDocumentsToApiDocuments(data);
         const payload = mapCreateLeadFormToApi(data);
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
            title: 'Перевозка создана',
            message: documentsUploadFailed
               ? 'Лид создан, но часть документов не загрузилась'
               : `Лид успешно создан${createdLeadId ? `: ${createdLeadId}` : ''}`,
         });
      } catch (error) {
         setResultModal({
            open: true,
            type: 'error',
            title: 'Ошибка создания',
            message:
               error.response?.data?.message ||
               error.message ||
               'Не удалось создать перевозку',
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
      const fields = stepFields[stepIndex] || [];

      return fields.some((fieldName) => Boolean(errors[fieldName]));
   }

   return (
      <>
         <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth='md'
            slotProps={{
               paper: {
                  sx: {
                     borderRadius: 4,
                  },
               },
            }}
         >
            <Box component='div'>
               <CreateLeadHeader
                  activeStep={activeStep}
                  stepsCount={steps.length}
               />

               <DialogContent sx={{ px: 3 }}>
                  <CreateLeadStepTabs
                     steps={steps}
                     activeStep={activeStep}
                     maxAvailableStep={maxAvailableStep}
                     hasStepErrors={hasStepErrors}
                     onStepClick={handleStepClick}
                  />

                  <Box
                     sx={{
                        minHeight: 360,
                     }}
                  >
                     {renderStepContent()}
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
