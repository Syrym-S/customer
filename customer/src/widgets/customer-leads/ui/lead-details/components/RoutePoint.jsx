import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export function RoutePoint({ label, value, icon }) {
   return (
      <Box
         sx={{
            flex: 1,
            minWidth: 220,
            minHeight: 86,
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'grey.50',
         }}
      >
         <Typography
            variant='caption'
            sx={{
               display: 'block',
               color: 'text.secondary',
               mb: 0.5,
            }}
         >
            {label}
         </Typography>

         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
               sx={{
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  '& svg': {
                     fontSize: 18,
                  },
               }}
            >
               {icon}
            </Box>

            <Typography
               sx={{
                  fontSize: '14px',
                  lineHeight: 1.35,
                  fontWeight: 500,
               }}
            >
               {value || 'Не указано'}
            </Typography>
         </Box>
      </Box>
   );
}

RoutePoint.propTypes = {
   label: PropTypes.string.isRequired,
   value: PropTypes.string,
   icon: PropTypes.node.isRequired,
};
