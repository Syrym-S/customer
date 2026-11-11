import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const COMPACT_STEPS_QUERY = '@media (max-width: 670px)';

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
            gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
            gap: 0.75,

            [COMPACT_STEPS_QUERY]: {
               display: 'flex',
               alignItems: 'stretch',
               gap: 0.5,
            },
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
                  aria-current={isActive ? 'step' : undefined}
                  // Номер без подписи ничего не говорит о шаге, поэтому в
                  // сжатом виде название уходит в title и в aria-label.
                  title={`${index + 1}. ${step}`}
                  aria-label={`${index + 1}. ${step}`}
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

                     [COMPACT_STEPS_QUERY]: {
                        py: 0.75,
                        borderRadius: 1.5,
                        minWidth: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        ...(isActive
                           ? {
                                px: 0.75,
                                flex: '0 1 auto',
                                minWidth: 104,
                             }
                           : {
                                px: 0.5,
                                flex: '1 1 auto',
                             }),
                     },
                  }}
               >
                  <Typography
                     component='span'
                     sx={{
                        display: 'block',
                        minWidth: 0,
                        fontSize: 12,
                        fontWeight: 600,
                        color: isInvalid
                           ? 'error.main'
                           : isActive || isCompleted || isAvailable
                             ? 'primary.main'
                             : 'text.primary',

                        [COMPACT_STEPS_QUERY]: {
                           display: 'flex',
                           alignItems: 'center',
                        },
                     }}
                  >
                     <Box component='span' sx={{ flexShrink: 0 }}>
                        {index + 1}
                     </Box>

                     <Box
                        component='span'
                        sx={{
                           minWidth: 0,

                           [COMPACT_STEPS_QUERY]: isActive
                              ? {
                                   overflow: 'hidden',
                                   textOverflow: 'ellipsis',
                                   whiteSpace: 'nowrap',
                                }
                              : {
                                   display: 'none',
                                },
                        }}
                     >
                        . {step}
                     </Box>
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
