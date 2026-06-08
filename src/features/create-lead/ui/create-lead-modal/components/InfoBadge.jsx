import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export function InfoBadge({ label, value, accent = false }) {
   return (
      <Box
         sx={{
            px: 1.5,
            py: 1,
            border: '1px solid',
            borderColor: accent ? 'primary.light' : 'divider',
            borderRadius: 2,
            backgroundColor: accent ? 'rgba(33, 150, 243, 0.06)' : 'grey.50',
            minWidth: 0,
         }}
      >
         <Typography
            sx={{
               fontSize: 11,
               lineHeight: 1.2,
               color: 'text.secondary',
               mb: 0.25,
            }}
         >
            {label}
         </Typography>

         <Typography
            sx={{
               fontSize: 14,
               lineHeight: 1.35,
               color: accent ? 'primary.main' : 'text.primary',
               fontWeight: accent ? 600 : 500,
            }}
         >
            {value || 'Не указано'}
         </Typography>
      </Box>
   );
}

InfoBadge.propTypes = {
   label: PropTypes.string.isRequired,
   value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   accent: PropTypes.bool,
};
