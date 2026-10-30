import { useState } from 'react';
import { useTranslation } from "react-i18next";
import {
   Alert,
   Box,
   CircularProgress,
   Stack,
   ToggleButton,
   ToggleButtonGroup,
   Typography,
} from '@mui/material';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';

import { useComplaintsContext } from '../model/useComplaintsContext';
import { ComplaintCard } from './ComplaintCard';
import { ComplaintsTable } from './ComplaintsTable';
import { ComplaintDetailsModal } from './ComplaintDetailsModal';
import { ComplaintFormButton } from './ComplaintFormButton';

const COMPLAINTS_VIEW_MODES = {
   TABLE: 'table',
   CARDS: 'cards',
};

export function ComplaintsList() {
   const { t } = useTranslation();

   const { complaints, isLoading, error, setOpenComplaint } =
      useComplaintsContext();

   const [viewMode, setViewMode] = useState(COMPLAINTS_VIEW_MODES.TABLE);

   function handleViewModeChange(_, nextViewMode) {
      if (!nextViewMode) {
         return;
      }

      setViewMode(nextViewMode);
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
                        {t("complaints.title")}
                     </Typography>

                     <Typography color="text.secondary" fontSize={14}>
                        {t("complaints.subtitle")}
                     </Typography>
                  </Box>

                  <ToggleButtonGroup
                     value={viewMode}
                     exclusive
                     onChange={handleViewModeChange}
                     size="small"
                     color="primary"
                     aria-label={t("complaints.viewToggle")}
                     sx={{
                        direction: "ltr",
                        flexShrink: 0,
                        alignSelf: {
                           xs: 'flex-start',
                           sm: 'center',
                        },
                        '& .MuiToggleButton-root': {
                           px: 1.5,
                           minWidth: 40,
                        },
                     }}
                  >
                     <ToggleButton
                        value={COMPLAINTS_VIEW_MODES.TABLE}
                        aria-label={t("common.view.showAsTable")}
                        title={t("common.view.table")}
                     >
                        <ViewListRoundedIcon fontSize="small" />
                     </ToggleButton>

                     <ToggleButton
                        value={COMPLAINTS_VIEW_MODES.CARDS}
                        aria-label={t("common.view.showAsCards")}
                        title={t("common.view.cards")}
                     >
                        <GridViewRoundedIcon fontSize="small" />
                     </ToggleButton>
                  </ToggleButtonGroup>
               </Box>

               <Box sx={{ alignSelf: 'flex-start' }}>
                  <ComplaintFormButton />
               </Box>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            {isLoading ? (
               <Box
                  sx={{
                     minHeight: 240,
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                  }}
               >
                  <CircularProgress />
               </Box>
            ) : viewMode === COMPLAINTS_VIEW_MODES.TABLE ? (
               <ComplaintsTable complaints={complaints} />
            ) : complaints.length === 0 ? (
               <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                     {t("complaints.emptyLast30Days")}
                  </Typography>
               </Box>
            ) : (
               <Stack spacing={2} sx={{ maxWidth: 760, mx: 'auto' }}>
                  {complaints.map((complaint) => (
                     <ComplaintCard
                        key={complaint.id}
                        complaint={complaint}
                        onOpen={setOpenComplaint}
                     />
                  ))}
               </Stack>
            )}
         </Stack>

         <ComplaintDetailsModal />
      </Box>
   );
}
