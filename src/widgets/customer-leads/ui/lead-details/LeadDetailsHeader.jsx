import { Box, Chip, DialogTitle, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export function LeadDetailsHeader({ lead }) {
   return (
      <DialogTitle
         sx={{
            px: 3,
            pt: 3,
            pb: 1.5,
         }}
      >
         <Box
            sx={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'flex-start',
               gap: 2,
               flexWrap: 'wrap',
            }}
         >
            <Box>
               <Typography
                  sx={{
                     fontSize: {
                        xs: '18px',
                        sm: '20px',
                     },
                     fontWeight: 600,
                     lineHeight: 1.3,
                  }}
               >
                  Информация о лиде
               </Typography>

               <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mt: 0.5 }}
               >
                  Подробные данные по заявке
               </Typography>
            </Box>

            <Stack
               direction='row'
               spacing={1}
               sx={{
                  flexWrap: 'wrap',
               }}
               useFlexGap
            >
               <Chip
                  label={`Лид #${lead.num || '—'}`}
                  color='primary'
                  variant='outlined'
                  size='small'
                  sx={{
                     borderRadius: 999,
                     fontWeight: 600,
                     backgroundColor: 'rgba(33, 150, 243, 0.04)',
                  }}
               />

               <Chip
                  label={lead.status}
                  size='small'
                  sx={{
                     borderRadius: 999,
                     fontWeight: 500,
                     backgroundColor: 'grey.100',
                     color: 'text.secondary',
                  }}
               />
            </Stack>
         </Box>
      </DialogTitle>
   );
}

LeadDetailsHeader.propTypes = {
   lead: PropTypes.object.isRequired,
};
