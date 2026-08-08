import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export function TimeLeftBadge({ value, dense = false }) {
   return (
      <Box
         sx={{
            px: dense ? 1 : 1.25,
            py: dense ? 0.4 : 0.45,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 999,
            backgroundColor: 'grey.50',
            display: 'flex',
            alignItems: 'center',
            gap: dense ? 0.5 : 0.75,
         }}
      >
         <Typography
            sx={{
               fontSize: 11,
               lineHeight: 1.2,
               color: 'text.secondary',
            }}
         >
            Осталось
         </Typography>

         <Typography
            sx={{
               fontSize: 12,
               lineHeight: 1.2,
               fontWeight: 600,
               color: 'text.primary',
            }}
         >
            {value || 'Не указано'}
         </Typography>
      </Box>
   );
}

TimeLeftBadge.propTypes = {
   value: PropTypes.node,
   dense: PropTypes.bool,
};
