import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export function CreateLeadStepTabs({
   steps,
   activeStep,
   maxAvailableStep,
   hasStepErrors,
   onStepClick,
}) {
   return (
      <Box
         sx={{
            mb: 2,
            display: 'grid',
            gridTemplateColumns: {
               xs: '1fr 1fr',
               sm: 'repeat(4, 1fr)',
            },
            gap: 1,
         }}
      >
         {steps.map((step, index) => {
            const isActive = index === activeStep;
            const isAvailable = index <= maxAvailableStep;
            const isCompleted = index < maxAvailableStep && !isActive;
            const isInvalid = hasStepErrors(index);

            return (
               <Box
                  key={step}
                  onClick={() => onStepClick(index)}
                  role='button'
                  tabIndex={isAvailable ? 0 : -1}
                  sx={{
                     p: 1.25,
                     border: '1px solid',
                     borderColor: isInvalid
                        ? 'error.light'
                        : isActive || isCompleted || isAvailable
                          ? 'primary.light'
                          : 'divider',
                     borderRadius: 2,
                     backgroundColor: isInvalid
                        ? 'rgba(211, 47, 47, 0.06)'
                        : isActive || isCompleted || isAvailable
                          ? 'rgba(33, 150, 243, 0.06)'
                          : 'grey.50',
                     cursor: isAvailable ? 'pointer' : 'default',
                     opacity: isAvailable ? 1 : 0.55,
                     transition: '0.2s ease',
                     '&:hover': {
                        borderColor: isInvalid
                           ? 'error.light'
                           : isAvailable
                             ? 'primary.light'
                             : 'divider',
                        backgroundColor: isInvalid
                           ? 'rgba(211, 47, 47, 0.08)'
                           : isAvailable
                             ? 'rgba(33, 150, 243, 0.08)'
                             : 'grey.50',
                     },
                  }}
               >
                  <Typography
                     sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: isInvalid
                           ? 'error.main'
                           : isActive || isCompleted || isAvailable
                             ? 'primary.main'
                             : 'text.primary',
                     }}
                  >
                     {index + 1}. {step}
                  </Typography>

                  <Typography
                     sx={{
                        mt: 0.25,
                        fontSize: 11,
                        color: 'text.secondary',
                     }}
                  >
                     {' '}
                  </Typography>
               </Box>
            );
         })}
      </Box>
   );
}

CreateLeadStepTabs.propTypes = {
   steps: PropTypes.arrayOf(PropTypes.string).isRequired,
   activeStep: PropTypes.number.isRequired,
   maxAvailableStep: PropTypes.number.isRequired,
   hasStepErrors: PropTypes.func.isRequired,
   onStepClick: PropTypes.func.isRequired,
};
