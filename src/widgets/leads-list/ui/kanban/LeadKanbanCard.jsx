import { Box, Paper, Stack, Typography } from '@mui/material';

import {
   getLeadCargoLabel,
   getLeadForwarderName,
   getLeadPriceLabel,
   getLeadResponsibleLabel,
   getLeadRouteLabel,
} from './lead-kanban.helpers';

export function LeadKanbanCard({ lead, onOpen }) {
   const forwarderName = getLeadForwarderName(lead);
   const routeLabel = getLeadRouteLabel(lead);
   const responsibleLabel = getLeadResponsibleLabel(lead);

   return (
      <Paper
         elevation={0}
         onClick={() => onOpen(lead)}
         sx={{
            p: 1.25,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            cursor: 'pointer',
            backgroundColor: 'background.paper',
            transition: '0.15s ease',
            '&:hover': {
               borderColor: 'primary.light',
               boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            },
         }}
      >
         <Stack spacing={0.5} sx={{ minWidth: 0 }}>
            <Box
               sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 1,
               }}
            >
               <Typography
                  title={forwarderName}
                  sx={{
                     fontSize: 13,
                     fontWeight: 700,
                     lineHeight: 1.25,
                     minWidth: 0,
                     overflow: 'hidden',
                     textOverflow: 'ellipsis',
                     whiteSpace: 'nowrap',
                  }}
               >
                  {forwarderName}
               </Typography>
            </Box>

            <Typography
               title={routeLabel}
               sx={{
                  fontSize: 12,
                  color: 'primary.main',
                  fontWeight: 600,
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
               }}
            >
               {routeLabel}
            </Typography>

            <Typography
               title={getLeadCargoLabel(lead)}
               sx={{
                  fontSize: 12,
                  color: 'text.secondary',
                  lineHeight: 1.25,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
               }}
            >
               {getLeadCargoLabel(lead)}
            </Typography>

            <Typography
               sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  lineHeight: 1.25,
                  color: 'text.primary',
               }}
            >
               {getLeadPriceLabel(lead)}
            </Typography>

            <Typography
               title={responsibleLabel}
               sx={{
                  fontSize: 12,
                  color: 'text.secondary',
                  lineHeight: 1.25,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
               }}
            >
               {responsibleLabel}
            </Typography>
         </Stack>
      </Paper>
   );
}
