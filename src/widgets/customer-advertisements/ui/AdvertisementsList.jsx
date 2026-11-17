import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
   Alert,
   Box,
   Stack,
   ToggleButton,
   ToggleButtonGroup,
   Typography,
} from '@mui/material';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';

import { CardsListSkeleton } from '../../../shared/ui/skeletons/CardsListSkeleton';
import { LeadsPagination } from '../../customer-leads/ui/LeadsPagination';
import { useAdvertisementsContext } from '../model/useAdvertisementsContext';
import { AdvertisementCard } from './AdvertisementCard';
import { AdvertisementDetailsModal } from './AdvertisementDetailsModal';
import { AdvertisementsTable } from './AdvertisementsTable';
import { CreateAdvertisementButton } from './CreateAdvertisementButton';

const ADVERTISEMENTS_VIEW_MODES = {
   TABLE: 'table',
   CARDS: 'cards',
};

export function AdvertisementsList() {
   const { t } = useTranslation();

   const { advertisements, isLoading, error, page, pagesCount, setPage } =
      useAdvertisementsContext();

   const [viewMode, setViewMode] = useState(ADVERTISEMENTS_VIEW_MODES.TABLE);
   const [openedAdvertisement, setOpenedAdvertisement] = useState(null);

   function handleViewModeChange(_, nextViewMode) {
      if (!nextViewMode) {
         return;
      }

      setViewMode(nextViewMode);
   }

   function handlePageChange(_, nextPage) {
      setPage(nextPage);
   }

   function handleOpenAdvertisement(advertisement) {
      setOpenedAdvertisement(advertisement);
   }

   function handleCloseAdvertisement() {
      setOpenedAdvertisement(null);
   }

   return (
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', mt: 2 }}>
         <Stack spacing={3}>
            <Stack spacing={1.5}>
               <Box
                  sx={{
                     display: 'flex',
                     justifyContent: 'space-between',
                     gap: 2,
                     alignItems: { xs: 'flex-start', sm: 'center' },
                     flexDirection: { xs: 'column', sm: 'row' },
                  }}
               >
                  <Box>
                     <Typography variant="h6" fontWeight={600}>
                        {t('advertisements.title')}
                     </Typography>

                     <Typography color="text.secondary" fontSize={14}>
                        {t('advertisements.subtitle')}
                     </Typography>
                  </Box>

                  <ToggleButtonGroup
                     value={viewMode}
                     exclusive
                     onChange={handleViewModeChange}
                     size="small"
                     color="primary"
                     aria-label={t('advertisements.viewToggle')}
                     sx={{
                        direction: 'ltr',
                        flexShrink: 0,
                        alignSelf: { xs: 'flex-start', sm: 'center' },
                        '& .MuiToggleButton-root': {
                           px: 1.5,
                           minWidth: 40,
                        },
                     }}
                  >
                     <ToggleButton
                        value={ADVERTISEMENTS_VIEW_MODES.TABLE}
                        aria-label={t('common.view.showAsTable')}
                        title={t('common.view.table')}
                     >
                        <ViewListRoundedIcon fontSize="small" />
                     </ToggleButton>

                     <ToggleButton
                        value={ADVERTISEMENTS_VIEW_MODES.CARDS}
                        aria-label={t('common.view.showAsCards')}
                        title={t('common.view.cards')}
                     >
                        <GridViewRoundedIcon fontSize="small" />
                     </ToggleButton>
                  </ToggleButtonGroup>
               </Box>

               <Box sx={{ alignSelf: 'flex-start' }}>
                  <CreateAdvertisementButton />
               </Box>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            <Box sx={{ borderRadius: 3, overflow: 'hidden' }}>
               {viewMode === ADVERTISEMENTS_VIEW_MODES.TABLE ? (
                  <AdvertisementsTable
                     advertisements={advertisements}
                     isLoading={isLoading}
                     onOpen={handleOpenAdvertisement}
                  />
               ) : isLoading ? (
                  <CardsListSkeleton padding={0} />
               ) : advertisements.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                     <Typography color="text.secondary">
                        {t('advertisements.notFound')}
                     </Typography>
                  </Box>
               ) : (
                  <Stack spacing={2} sx={{ maxWidth: 760, mx: 'auto' }}>
                     {advertisements.map((advertisement) => (
                        <AdvertisementCard
                           key={advertisement.id}
                           advertisement={advertisement}
                           onOpen={handleOpenAdvertisement}
                        />
                     ))}
                  </Stack>
               )}

               <LeadsPagination
                  page={page}
                  count={pagesCount}
                  onChange={handlePageChange}
               />
            </Box>
         </Stack>

         <AdvertisementDetailsModal
            advertisement={openedAdvertisement}
            open={Boolean(openedAdvertisement)}
            onClose={handleCloseAdvertisement}
         />
      </Box>
   );
}
