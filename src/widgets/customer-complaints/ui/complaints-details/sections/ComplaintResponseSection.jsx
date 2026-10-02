import PropTypes from 'prop-types';
import { Alert, Box, Typography } from '@mui/material';

export function ComplaintResponseSection({ complaint }) {
   const { response, final_status: finalStatus } = complaint;

   if (!response && !finalStatus) {
      return (
         <Alert severity="info">Ответ от администрации пока не получен</Alert>
      );
   }

   return (
      <Box>
         <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.75 }}>
            Ответ администрации
         </Typography>

         {response ? (
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{response}</Typography>
         ) : (
            <Typography color="text.secondary">
               {finalStatus === 'rejected'
                  ? 'Жалоба отклонена'
                  : 'Ответ пока не добавлен'}
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
