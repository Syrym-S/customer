import { Box, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export function TenderDetailSection({
   icon,
   title,
   subtitle,
   action,
   children,
}) {
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
         <Stack spacing={1.5}>
            <Box
               sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 2,
                  width: '100%',
               }}
            >
               <Stack
                  direction='row'
                  spacing={1}
                  alignItems='flex-start'
                  sx={{
                     minWidth: 0,
                  }}
               >
                  {icon && (
                     <Box
                        sx={{
                           display: 'flex',
                           color: 'primary.main',
                           mt: 0.25,
                        }}
                     >
                        {icon}
                     </Box>
                  )}

                  <Box sx={{ minWidth: 0 }}>
                     <Typography fontWeight={700}>{title}</Typography>

                     {subtitle && (
                        <Typography
                           color='text.secondary'
                           sx={{ fontSize: 13 }}
                        >
                           {subtitle}
                        </Typography>
                     )}
                  </Box>
               </Stack>

               {action && (
                  <Box
                     sx={{
                        flexShrink: 0,
                        ml: 'auto',
                     }}
                  >
                     {action}
                  </Box>
               )}
            </Box>

            {children}
         </Stack>
      </Box>
   );
}

TenderDetailSection.propTypes = {
   icon: PropTypes.node.isRequired,
   title: PropTypes.string.isRequired,
   subtitle: PropTypes.node,
   action: PropTypes.node,
   children: PropTypes.node,
};
