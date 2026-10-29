import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";
import { Box, Typography } from '@mui/material';

export function ComplaintRequestSection({ request }) {
   const { t } = useTranslation();

   return (
      <Box>
         <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.75 }}>
            {t("complaints.create.subject")}
         </Typography>

         <Typography sx={{ whiteSpace: 'pre-wrap' }}>{request || '—'}</Typography>
      </Box>
   );
}

ComplaintRequestSection.propTypes = {
   request: PropTypes.string,
};
