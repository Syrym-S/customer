import { Typography } from '@mui/material';
import { useTranslation } from "react-i18next";

import { PageContainer } from '../../shared/ui/PageContainer';
import { TnvedTable } from '../../widgets/customer-tnved/ui/TnvedTable';

export function TnvedPage() {
   const { t } = useTranslation();

   return (
      <PageContainer>
         <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            {t("nav.tnved")}
         </Typography>

         <TnvedTable />
      </PageContainer>
   );
}
