import { Box, Dialog, DialogContent } from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { CreateRouteActions } from './create-route-modal/CreateRouteActions';
import { CreateRouteStepTabs } from './create-route-modal/CreateRouteStepTabs';
import { CreateRouteHeader } from './create-route-modal/CreateRouteHeader';
import { ForwarderStep } from './create-route-modal/steps/ForwarderStep';
import { CargoStep } from './create-route-modal/steps/CargoStep';
import { ConfirmStep } from './create-route-modal/steps/ConfirmStep';
import { RouteStep } from './create-route-modal/steps/RouteStep';

const steps = ['Маршрут', 'Груз', 'Экспедитор', 'Проверка'];

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
   ['forwarderId'],
];

export function CreateRouteModal({ open, onClose }) {
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

   function handleClose() {
      setActiveStep(0);
      setMaxAvailableStep(0);
      reset(initialForm);
      onClose();
   }

   function handleCreateRoute(data) {
      const payload = {
         fromLocation: data.fromLocation,
         fromLat: data.fromLat,
         fromLng: data.fromLng,
         toLocation: data.toLocation,
         toLat: data.toLat,
         toLng: data.toLng,
         loadingDate: data.loadingDate,

         cargoType: data.cargoType,
         weightKg: data.weightKg,
         cargoLengthCm: data.cargoLengthCm,
         cargoWidthCm: data.cargoWidthCm,
         cargoHeightCm: data.cargoHeightCm,
         price: data.price,
         currency: data.currency,
         vat: data.vat,
         comment: data.comment,

         forwarderId: data.forwarderId,
      };

      console.log('create route payload:', payload);
      handleClose();
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
         return <ForwarderStep control={control} errors={errors} />;
      }

      return <ConfirmStep form={formValues} />;
   }

   function hasStepErrors(stepIndex) {
      const fields = stepFields[stepIndex] || [];

      return fields.some((fieldName) => Boolean(errors[fieldName]));
   }

   return (
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
         <CreateRouteHeader activeStep={activeStep} stepsCount={steps.length} />

         <DialogContent sx={{ px: 3 }}>
            <CreateRouteStepTabs
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

         <CreateRouteActions
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            hasCurrentStepErrors={hasCurrentStepErrors}
            onClose={handleClose}
            onBack={handleBack}
            onNext={handleNext}
            onCreate={handleSubmit(handleCreateRoute)}
         />
      </Dialog>
   );
}

CreateRouteModal.propTypes = {
   open: PropTypes.bool.isRequired,
   onClose: PropTypes.func.isRequired,
};
