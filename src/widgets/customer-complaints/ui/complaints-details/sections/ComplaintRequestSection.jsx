import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

export function ComplaintRequestSection({ request }) {
   return (
      <Box>
         <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.75 }}>
            Суть жалобы
         </Typography>

         <Typography sx={{ whiteSpace: 'pre-wrap' }}>{request || '—'}</Typography>
      </Box>
   );
}

ComplaintRequestSection.propTypes = {
   request: PropTypes.string,
};
