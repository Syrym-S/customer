import { Box, Button, DialogActions } from '@mui/material';
import PropTypes from 'prop-types';

export function CreateLeadActions({
   isFirstStep,
   isLastStep,
   hasCurrentStepErrors,
   isSubmitting,
   onClose,
   onBack,
   onNext,
   onSubmit,
}) {
   return (
      <DialogActions
         sx={{
            px: 3,
            pb: 3,
            pt: 2,
            justifyContent: 'space-between',
         }}
      >
         <Button type='button' onClick={onClose} disabled={isSubmitting}>
            Отмена
         </Button>

         <Box sx={{ display: 'flex', gap: 1 }}>
            {!isFirstStep && (
               <Button type='button' onClick={onBack} disabled={isSubmitting}>
                  Назад
               </Button>
            )}

            {isLastStep ? (
               <Button
                  type='button'
                  variant='contained'
                  disabled={isSubmitting || hasCurrentStepErrors}
                  onClick={onSubmit}
               >
                  {isSubmitting ? 'Создание...' : 'Создать маршрут'}
               </Button>
            ) : (
               <Button
                  type='button'
                  variant='contained'
                  disabled={hasCurrentStepErrors || isSubmitting}
                  onClick={onNext}
               >
                  Дальше
               </Button>
            )}
         </Box>
      </DialogActions>
   );
}

CreateLeadActions.propTypes = {
   isFirstStep: PropTypes.bool.isRequired,
   isLastStep: PropTypes.bool.isRequired,
   hasCurrentStepErrors: PropTypes.bool.isRequired,
   isSubmitting: PropTypes.bool.isRequired,
   onClose: PropTypes.func.isRequired,
   onBack: PropTypes.func.isRequired,
   onNext: PropTypes.func.isRequired,
   onSubmit: PropTypes.func.isRequired,
};
