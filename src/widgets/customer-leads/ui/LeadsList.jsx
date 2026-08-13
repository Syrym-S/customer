import {
   Alert,
   Box,
   CircularProgress,
   FormControl,
   InputLabel,
   MenuItem,
   Select,
   Stack,
   ToggleButton,
   ToggleButtonGroup,
   Typography,
} from '@mui/material';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded';

import { useLeadsContext } from '../model/useLeadsContext';
import { getLeadStatusFilterOptions } from '../model/lead.helpers';
import { LeadCard } from './LeadCard';
import { LeadDetailsModal } from './LeadDetailsModal';
import { LeadsPagination } from './LeadsPagination';
import { useMemo, useState } from 'react';
import { LeadsTable } from './LeadsTable';
import { LeadsKanbanBoard } from './kanban/LeadsKanbanBoard';

const ALL_STATUSES_VALUE = 'all';

const LEADS_VIEW_MODES = {
   TABLE: 'table',
   CARDS: 'cards',
   // KANBAN: 'kanban',
};

export function LeadsList() {
   const {
      leads,
      page,
      setPage,
      perPage,
      count,
      setStatusFilter,
      isLoading,
      error,
   } = useLeadsContext();

   const [viewMode, setViewMode] = useState(LEADS_VIEW_MODES.TABLE);
   const [selectedStatusValue, setSelectedStatusValue] = useState(
      ALL_STATUSES_VALUE,
   );

   const statusFilterOptions = useMemo(() => getLeadStatusFilterOptions(), []);

   const pagesCount = Math.max(1, Math.ceil(count / perPage));

   const handlePageChange = (_, value) => {
      setPage(value);
   };

   function handleViewModeChange(_, nextViewMode) {
      if (!nextViewMode) {
         return;
      }

      setViewMode(nextViewMode);
   }

   function handleStatusFilterChange(event) {
      const nextValue = event.target.value;

      setSelectedStatusValue(nextValue);
      setStatusFilter(nextValue === ALL_STATUSES_VALUE ? '' : nextValue);
   }

   return (
      <Box
         sx={{
            width: '100%',
            maxWidth: 1200,
            mx: 'auto',
            mt: 4,
         }}
      >
         <Stack spacing={3}>
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
                     Лиды
                  </Typography>

                  <Typography color="text.secondary" fontSize={14}>
                     Список заявок на перевозку
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
                  <FormControl
                     size="small"
                     sx={{
                        minWidth: 200,
                        alignSelf: {
                           xs: 'stretch',
                           sm: 'auto',
                        },
                     }}
                  >
                     <InputLabel id="leads-status-filter-label">
                        Статус
                     </InputLabel>

                     <Select
                        labelId="leads-status-filter-label"
                        label="Статус"
                        value={selectedStatusValue}
                        onChange={handleStatusFilterChange}
                     >
                        <MenuItem value={ALL_STATUSES_VALUE}>
                           Все статусы
                        </MenuItem>

                        {statusFilterOptions.map((option) => (
                           <MenuItem key={option.value} value={option.value}>
                              {option.label}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>

                  <ToggleButtonGroup
                     value={viewMode}
                     exclusive
                     onChange={handleViewModeChange}
                     size="small"
                     color="primary"
                     aria-label="Переключение отображения лидов"
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
                        value={LEADS_VIEW_MODES.TABLE}
                        aria-label="Показать таблицей"
                        title="Таблица"
                     >
                        <ViewListRoundedIcon fontSize="small" />
                     </ToggleButton>

                     <ToggleButton
                        value={LEADS_VIEW_MODES.CARDS}
                        aria-label="Показать карточками"
                        title="Карточки"
                     >
                        <GridViewRoundedIcon fontSize="small" />
                     </ToggleButton>

                     {/* <ToggleButton
                        value={LEADS_VIEW_MODES.KANBAN}
                        aria-label="Показать канбаном"
                        title="Канбан"
                     >
                        <ViewKanbanRoundedIcon fontSize="small" />
                     </ToggleButton> */}
                  </ToggleButtonGroup>
               </Stack>
            </Box>

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
                     <CircularProgress />
                  </Box>
               ) : (
                  <>
                     {viewMode === LEADS_VIEW_MODES.TABLE ? (
                        <LeadsTable leads={leads} />
                     ) : viewMode === LEADS_VIEW_MODES.CARDS ? (
                        leads.length === 0 ? (
                           <Box
                              sx={{
                                 py: 4,
                                 textAlign: 'center',
                              }}
                           >
                              <Typography color="text.secondary">
                                 Лиды не найдены
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
                                 {leads.map((lead) => (
                                    <LeadCard key={lead.id} lead={lead} />
                                 ))}
                              </Stack>
                           </Box>
                        )
                     ) : (
                        <LeadsKanbanBoard leads={leads} />
                     )}

                     <LeadsPagination
                        page={page}
                        count={pagesCount}
                        onChange={handlePageChange}
                     />
                  </>
               )}
            </Box>
         </Stack>

         <LeadDetailsModal />
      </Box>
   );
}
