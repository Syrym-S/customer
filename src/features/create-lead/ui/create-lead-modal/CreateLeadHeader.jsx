import { Box, Chip, DialogTitle, Typography } from '@mui/material';
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';

export function CreateLeadHeader({ activeStep, stepsCount }) {
   const { t } = useTranslation();

   return (
      <DialogTitle
         sx={{
            px: 3,
            pt: 3,
            pb: 1.5,
         }}
      >
         <Box
            sx={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'flex-start',
               gap: 2,
               flexWrap: 'wrap',
            }}
         >
            <Box>
               <Typography
                  sx={{
                     fontSize: {
                        xs: '18px',
                        sm: '20px',
                     },
                     fontWeight: 600,
                     lineHeight: 1.3,
                  }}
               >
                  {t("createLead.title")}
               </Typography>

               <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mt: 0.5 }}
               >
                  {t("createLead.subtitle")}
               </Typography>
            </Box>

            <Chip
               label={t("createLead.step", { current: activeStep + 1, total: stepsCount })}
               color='primary'
               variant='outlined'
               size='small'
               sx={{
                  borderRadius: 999,
                  fontWeight: 600,
                  backgroundColor: 'rgba(33, 150, 243, 0.04)',
               }}
            />
         </Box>
      </DialogTitle>
   );
}

CreateLeadHeader.propTypes = {
   activeStep: PropTypes.number.isRequired,
   stepsCount: PropTypes.number.isRequired,
};
