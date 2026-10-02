import { Typography } from '@mui/material';

import { PageContainer } from '../../shared/ui/PageContainer';
import { TnvedTable } from '../../widgets/customer-tnved/ui/TnvedTable';

export function TnvedPage() {
   return (
      <PageContainer>
         <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            ТН ВЭД
         </Typography>

         <TnvedTable />
      </PageContainer>
   );
}
