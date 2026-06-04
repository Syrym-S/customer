import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export function StepSection({ title, children }) {
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
         <Typography
            sx={{
               fontSize: 15,
               fontWeight: 600,
               mb: 1.5,
            }}
         >
            {title}
         </Typography>

         {children}
      </Box>
   );
}

StepSection.propTypes = {
   title: PropTypes.string.isRequired,
   children: PropTypes.node.isRequired,
};
