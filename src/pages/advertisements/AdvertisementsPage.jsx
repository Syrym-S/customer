import { PageContainer } from '../../shared/ui/PageContainer';
import { AdvertisementsProvider } from '../../widgets/customer-advertisements/model/AdvertisementsProvider';
import { AdvertisementsList } from '../../widgets/customer-advertisements/ui/AdvertisementsList';

export function AdvertisementsPage() {
   return (
      <AdvertisementsProvider>
         <PageContainer>
            <AdvertisementsList />
         </PageContainer>
      </AdvertisementsProvider>
   );
}
