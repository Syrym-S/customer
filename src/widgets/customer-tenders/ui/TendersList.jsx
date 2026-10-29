import {
   Alert,
   Box,
   CircularProgress,
   InputAdornment,
   Stack,
   TextField,
   ToggleButton,
   ToggleButtonGroup,
   Typography,
} from '@mui/material';
import { useTranslation } from "react-i18next";
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import { TenderCard } from './TenderCard';
import { TenderDetailsModal } from './TenderDetailsModal';
import { useTendersContext } from '../model/useTendersContext';
import { TendersPagination } from './TendersPagination';
import { useState } from 'react';
import { TendersTable } from './TendersTable';
import { CreateTenderButton } from './CreateTenderButton';

const TENDERS_VIEW_MODES = {
   TABLE: 'table',
   CARDS: 'cards',
};

export function TendersList() {
   const { t } = useTranslation();

   const {
      tenders,
      page,
      setPage,
      perPage,
      count,
      isLoading,
      error,
      search,
      setSearch,
   } = useTendersContext();

   const [viewMode, setViewMode] = useState(TENDERS_VIEW_MODES.TABLE);

   const pagesCount = Math.max(1, Math.ceil(count / perPage));

   function handlePageChange(_, value) {
      setPage(value);
   }

   function handleSearchChange(event) {
      setSearch(event.target.value);
   }

   function handleViewModeChange(_, nextViewMode) {
      if (!nextViewMode) {
         return;
      }

      setViewMode(nextViewMode);
   }

   return (
      <Box
         sx={{
            width: '100%',
            maxWidth: 1200,
            mx: 'auto',
         }}
      >
         <Stack spacing={3}>
            <Stack spacing={1.5}>
               <Box
                  sx={{
                     display: 'flex',
                     justifyContent: 'space-between',
                     gap: 2,
                     alignItems: {
                        xs: 'flex-start',
                        sm: 'center',
                     },
                     flexDirection: {
                        xs: 'column',
                        sm: 'row',
                     },
                  }}
               >
                  <Box>
                     <Typography variant="h6" fontWeight={600}>
                        {t("tenders.title")}
                     </Typography>

                     <Typography color="text.secondary" fontSize={14}>
                        {t("tenders.subtitle")}
                     </Typography>
                  </Box>

                  <Stack
                     direction={{
                        xs: 'column',
                        sm: 'row',
                     }}
                     spacing={1}
                     sx={{
                        width: {
                           xs: '100%',
                           sm: 'auto',
                        },
                        alignItems: {
                           xs: 'stretch',
                           sm: 'center',
                        },
                     }}
                  >
                     <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={handleViewModeChange}
                        size="small"
                        color="primary"
                        aria-label={t("tenders.viewToggle")}
                        sx={{
                           alignSelf: {
                              xs: 'stretch',
                              sm: 'auto',
                           },
                           '& .MuiToggleButton-root': {
                              px: 1.5,
                              minWidth: 40,
                           },
                        }}
                     >
                        <ToggleButton
                           value={TENDERS_VIEW_MODES.TABLE}
                           aria-label={t("common.view.showAsTable")}
                           title={t("common.view.table")}
                        >
                           <ViewListRoundedIcon fontSize="small" />
                        </ToggleButton>

                        <ToggleButton
                           value={TENDERS_VIEW_MODES.CARDS}
                           aria-label={t("common.view.showAsCards")}
                           title={t("common.view.cards")}
                        >
                           <GridViewRoundedIcon fontSize="small" />
                        </ToggleButton>
                     </ToggleButtonGroup>
                  </Stack>
               </Box>

               <Box sx={{ alignSelf: 'flex-start' }}>
                  <CreateTenderButton />
               </Box>
            </Stack>

            <TextField
               value={search}
               onChange={handleSearchChange}
               placeholder={t("common.search.byDirection")}
               fullWidth
               size="small"
               slotProps={{
                  input: {
                     startAdornment: (
                        <InputAdornment position="start">
                           <SearchRoundedIcon color="action" fontSize="small" />
                        </InputAdornment>
                     ),
                  },
               }}
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Box
               sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
               }}
            >
               {isLoading ? (
                  <Box
                     sx={{
                        minHeight: 240,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                     }}
                  >
                     <CircularProgress size={32} />
                  </Box>
               ) : (
                  <>
                     {viewMode === TENDERS_VIEW_MODES.TABLE ? (
                        <TendersTable tenders={tenders} />
                     ) : tenders.length === 0 ? (
                        <Box
                           sx={{
                              py: 4,
                              textAlign: 'center',
                           }}
                        >
                           <Typography color="text.secondary">
                              {t("tenders.notFound")}
                           </Typography>
                        </Box>
                     ) : (
                        <Box sx={{ p: 2 }}>
                           <Stack
                              spacing={2}
                              sx={{
                                 maxWidth: 720,
                                 mx: 'auto',
                              }}
                           >
                              {tenders.map((tender) => (
                                 <TenderCard key={tender.id} tender={tender} />
                              ))}
                           </Stack>
                        </Box>
                     )}

                     <TendersPagination
                        page={page}
                        count={pagesCount}
                        onChange={handlePageChange}
                     />
                  </>
               )}
            </Box>
         </Stack>

         <TenderDetailsModal />
      </Box>
   );
}
