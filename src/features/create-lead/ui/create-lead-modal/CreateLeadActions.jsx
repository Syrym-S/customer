import { Box, Button, DialogActions } from '@mui/material';
import PropTypes from 'prop-types';

const actionButtonSx = {
   fontSize: {
      xs: 12,
      sm: 14,
   },
   px: {
      xs: 1,
      sm: 2,
   },
};

export function CreateLeadActions({
   isFirstStep,
   isLastStep,
   hasCurrentStepErrors,
   isSubmitting,
   isSavingDraft = false,
   onClose,
   onBack,
   onNext,
   onSubmit,
   onSaveDraft,
}) {
   const isAnyActionPending = isSubmitting || isSavingDraft;

   return (
      <DialogActions
         sx={{
            px: 3,
            pb: 3,
            pt: 2,
            justifyContent: 'space-between',
         }}
      >
         <Button
            type='button'
            onClick={onClose}
            disabled={isAnyActionPending}
            sx={actionButtonSx}
         >
            Отмена
         </Button>

         <Box sx={{ display: 'flex', gap: 1 }}>
            {onSaveDraft && (
               <Button
                  type='button'
                  onClick={onSaveDraft}
                  disabled={isAnyActionPending}
                  sx={actionButtonSx}
               >
                  {isSavingDraft ? 'Сохранение...' : 'Сохранить как черновик'}
               </Button>
            )}

            {!isFirstStep && (
               <Button
                  type='button'
                  onClick={onBack}
                  disabled={isAnyActionPending}
                  sx={actionButtonSx}
               >
                  Назад
               </Button>
            )}

            {isLastStep ? (
               <Button
                  type='button'
                  variant='contained'
                  disabled={isAnyActionPending || hasCurrentStepErrors}
                  onClick={onSubmit}
                  sx={actionButtonSx}
               >
                  {isSubmitting ? 'Создание...' : 'Создать заказ'}
               </Button>
            ) : (
               <Button
                  type='button'
                  variant='contained'
                  disabled={hasCurrentStepErrors || isAnyActionPending}
                  onClick={onNext}
                  sx={actionButtonSx}
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
   isSavingDraft: PropTypes.bool,
   onClose: PropTypes.func.isRequired,
   onBack: PropTypes.func.isRequired,
   onNext: PropTypes.func.isRequired,
   onSubmit: PropTypes.func.isRequired,
   onSaveDraft: PropTypes.func,
};
