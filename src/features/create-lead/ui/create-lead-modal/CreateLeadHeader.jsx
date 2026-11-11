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
               // Перенос чипа «Шаг N из 5» на свою строку добавлял модалке
               // лишний ряд по высоте: ниже ~338px заголовку не хватало
               // места рядом с ним. Вместо переноса сжимается блок с
               // заголовком — подзаголовок переносится внутри себя.
               flexWrap: 'nowrap',

               '@media (max-width: 379.95px)': {
                  gap: 1,
               },
            }}
         >
            <Box sx={{ minWidth: 0 }}>
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
                  flexShrink: 0,
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
