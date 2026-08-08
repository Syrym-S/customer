import { Box } from '@mui/material';
import { CreateLeadButton } from '../../../features/create-lead/ui/CreateLeadButton';
import { useLeadsContext } from '../../../entities/lead/model/useLeadsContext';

export function LeadsToolbar() {
   const { prependLead } = useLeadsContext();

   return (
      <Box
         sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 2,
         }}
      >
         <CreateLeadButton onLeadCreated={prependLead} />
      </Box>
   );
}
