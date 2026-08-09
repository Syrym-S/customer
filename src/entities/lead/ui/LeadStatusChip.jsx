import { Chip } from '@mui/material';

import { getLeadStatusLabel, getLeadStatusStyles } from '../model/lead.helpers';

export function LeadStatusChip({ status, dense = false }) {
   return (
      <Chip
         label={getLeadStatusLabel(status)}
         variant='outlined'
         size='small'
         sx={{
            borderRadius: 999,
            fontWeight: 600,
            fontSize: dense
               ? '0.75rem'
               : {
                    xs: '0.7rem',
                    sm: '0.8rem',
                 },
            ...getLeadStatusStyles(status),
         }}
      />
   );
}
