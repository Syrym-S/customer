import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";
import { Alert, Box, Typography } from '@mui/material';

export function ComplaintResponseSection({ complaint }) {
   const { t } = useTranslation();

   const { response, final_status: finalStatus } = complaint;

   if (!response && !finalStatus) {
      return (
         <Alert severity="info">{t("complaints.answer.pending")}</Alert>
      );
   }

   return (
      <Box>
         <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.75 }}>
            {t("complaints.answer.title")}
         </Typography>

         {response ? (
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{response}</Typography>
         ) : (
            <Typography color="text.secondary">
               {finalStatus === 'rejected'
                  ? t("complaints.answer.rejected")
                  : t("complaints.answer.notAdded")}
            </Typography>
         )}
      </Box>
   );
}

ComplaintResponseSection.propTypes = {
   complaint: PropTypes.shape({
      response: PropTypes.string,
      final_status: PropTypes.oneOf(['completed', 'rejected', null]),
   }).isRequired,
};
