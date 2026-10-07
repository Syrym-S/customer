import { Box } from '@mui/material';
import { CreateLeadButton } from '../../features/create-lead/ui/CreateLeadButton';
import { ExportLeadsReportButton } from '../../features/export-leads-report/ui/ExportLeadsReportButton';

export function CustomerToolbar() {
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
         <ExportLeadsReportButton />
         <CreateLeadButton />
      </Box>
   );
}
