import { Box, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export function TenderDetailSection({ icon, title, subtitle, children }) {
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
         <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
            spacing={2}
            sx={{ mb: 2 }}
         >
            <Stack direction='row' alignItems='center' spacing={1}>
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

               <Box>
                  <Typography fontWeight={700}>{title}</Typography>

                  {subtitle && (
                     <Typography color='text.secondary' sx={{ fontSize: 12 }}>
                        {subtitle}
                     </Typography>
                  )}
               </Box>
            </Stack>
         </Stack>

         {children}
      </Box>
   );
}

TenderDetailSection.propTypes = {
   icon: PropTypes.node.isRequired,
   title: PropTypes.string.isRequired,
   subtitle: PropTypes.node,
   children: PropTypes.node,
};
