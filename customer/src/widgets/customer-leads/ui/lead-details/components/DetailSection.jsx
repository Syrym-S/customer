import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export function DetailSection({ icon, title, children }) {
   return (
      <Box
         sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            backgroundColor: 'background.paper',
         }}
      >
         <Box
            sx={{
               display: 'flex',
               alignItems: 'center',
               gap: 1,
               mb: 1.5,
            }}
         >
            <Box
               sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  backgroundColor: 'rgba(33, 150, 243, 0.08)',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '& svg': {
                     fontSize: 20,
                  },
               }}
            >
               {icon}
            </Box>

            <Typography
               sx={{
                  fontSize: '15px',
                  fontWeight: 600,
               }}
            >
               {title}
            </Typography>
         </Box>

         {children}
      </Box>
   );
}

DetailSection.propTypes = {
   icon: PropTypes.node.isRequired,
   title: PropTypes.string.isRequired,
   children: PropTypes.node.isRequired,
};
