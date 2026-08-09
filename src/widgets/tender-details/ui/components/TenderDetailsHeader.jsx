import { Box, Chip, Stack, Typography } from '@mui/material';

import {
   getTimeLeft,
   tenderStatusLabels,
   tenderStatusStyles,
} from '../../../../entities/tender/model/tender.helpers';
import { TimeLeftBadge } from '../../../../entities/tender/ui/TimeLeftBadge';
import { formatCompactId } from '../../../../shared/lib/format-id.helpers';

export function TenderDetailsHeader({ tender }) {
   const shouldShowTimeLeft =
      tender.status !== 'closed' && tender.status !== 'cancelled';

   const tenderId = tender.id || '—';
   const compactTenderId = formatCompactId(tenderId, {
      prefixLength: 8,
      suffixLength: 4,
      threshold: 14,
   });

   return (
      <Box
         sx={{
            px: {
               xs: 2,
               sm: 3,
            },
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 2,
            flexWrap: 'wrap',
            minWidth: 0,
         }}
      >
         <Box sx={{ minWidth: 0 }}>
            <Typography variant='body2' color='text.secondary'>
               Тендер
            </Typography>

            <Typography
               variant='h6'
               fontWeight={600}
               title={`#${tenderId}`}
               sx={{
                  maxWidth: {
                     xs: 220,
                     sm: 360,
                     md: 'none',
                  },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: {
                     xs: 17,
                     sm: 20,
                  },
               }}
            >
               #{compactTenderId}
            </Typography>
         </Box>

         <Stack
            direction='row'
            spacing={1}
            useFlexGap
            sx={{
               flexWrap: 'wrap',
               justifyContent: {
                  xs: 'flex-start',
                  sm: 'flex-end',
               },
            }}
         >
            {shouldShowTimeLeft && (
               <TimeLeftBadge
                  value={getTimeLeft(tender.endDateTime, tender.status)}
               />
            )}

            <Chip
               label={tenderStatusLabels[tender.status] || tender.status}
               variant='outlined'
               size='small'
               sx={{
                  borderRadius: 999,
                  fontWeight: 600,
                  ...(tenderStatusStyles[tender.status] ||
                     tenderStatusStyles.new),
               }}
            />
         </Stack>
      </Box>
   );
}

