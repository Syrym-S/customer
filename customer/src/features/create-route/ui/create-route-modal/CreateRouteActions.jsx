import { Box, Button, DialogActions } from '@mui/material';
import PropTypes from 'prop-types';

export function CreateRouteActions({
   isFirstStep,
   isLastStep,
   hasCurrentStepErrors,
   onClose,
   onBack,
   onNext,
   onCreate,
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
         <Button onClick={onClose}>Отмена</Button>

         <Box sx={{ display: 'flex', gap: 1 }}>
            {!isFirstStep && <Button onClick={onBack}>Назад</Button>}

            <Button
               variant='contained'
               disabled={!isLastStep && hasCurrentStepErrors}
               onClick={isLastStep ? onCreate : onNext}
            >
               {isLastStep ? 'Создать маршрут' : 'Дальше'}
            </Button>
         </Box>
      </DialogActions>
   );
}

CreateRouteActions.propTypes = {
   isFirstStep: PropTypes.bool.isRequired,
   isLastStep: PropTypes.bool.isRequired,
   hasCurrentStepErrors: PropTypes.bool.isRequired,
   onClose: PropTypes.func.isRequired,
   onBack: PropTypes.func.isRequired,
   onNext: PropTypes.func.isRequired,
   onCreate: PropTypes.func.isRequired,
};
