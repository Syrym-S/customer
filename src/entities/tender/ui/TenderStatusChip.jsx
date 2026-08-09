import { Chip } from '@mui/material';

import { tenderStatusLabels, tenderStatusStyles } from '../model/tender.helpers';

export function TenderStatusChip({ status, dense = false }) {
   const label = tenderStatusLabels[status] || status || 'Не указан';
   const styles = tenderStatusStyles[status] || tenderStatusStyles.new;

   return (
      <Chip
         label={label}
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
            ...styles,
         }}
      />
   );
}
