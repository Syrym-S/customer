import { Box, Dialog, DialogContent } from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { CreateRouteActions } from './create-route-modal/CreateRouteActions';
import { CreateRouteStepTabs } from './create-route-modal/CreateRouteStepTabs';
import { CreateRouteHeader } from './create-route-modal/CreateRouteHeader';
import { CustomerStep } from './create-route-modal/steps/CustomerStep';
import { CargoStep } from './create-route-modal/steps/CargoStep';
import { ConfirmStep } from './create-route-modal/steps/ConfirmStep';
import { RouteStep } from './create-route-modal/steps/RouteStep';

const steps = ['Маршрут', 'Заказчик', 'Груз', 'Проверка'];

const initialForm = {
   customer: 'AKE Plast (АКЕ Пласт) ТОО',
   contactName: 'Suleimenov Syrym',
   phone: '+7 777 777 77 77',

   fromLocation: '',
   fromLat: '',
   fromLng: '',

   toLocation: '',
   toLat: '',
   toLng: '',

   loadingDate: '2026-06-10',

   cargoType: 'Не указан',
   weightKg: '1200',
   cargoLengthCm: '',
   cargoWidthCm: '',
   cargoHeightCm: '',
   price: '250000',
   currency: 'KZT',
   vat: true,
   comment: '',
};

const stepFields = [
   ['fromLocation', 'toLocation', 'loadingDate'],
   ['customer', 'contactName', 'phone'],
   [
      'cargoType',
      'weightKg',
      'cargoLengthCm',
      'cargoWidthCm',
      'cargoHeightCm',
      'price',
      'currency',
   ],
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
      console.log('create route:', data);
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
         return <CustomerStep control={control} errors={errors} />;
      }

      if (activeStep === 2) {
         return <CargoStep control={control} errors={errors} />;
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
