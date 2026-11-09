import {
   Alert,
   Box,
   Button,
   FormControl,
   InputAdornment,
   InputLabel,
   MenuItem,
   Select,
   Stack,
   TextField,
   ToggleButton,
   ToggleButtonGroup,
   Typography,
} from '@mui/material';
import { useTranslation } from "react-i18next";
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { useLeadsContext } from '../model/useLeadsContext';
import {
   getActiveLeadStatusFilterOptions,
   getLeadStatusFilterOptions,
   isArchivedLeadStatus,
} from '../model/lead.helpers';
import { leadsScopes } from '../model/leads-scope.constants';
import { LeadCard } from './LeadCard';
import { CardsListSkeleton } from '../../../shared/ui/skeletons/CardsListSkeleton';
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
   const { t } = useTranslation();

   const {
      leads,
      page,
      setPage,
      perPage,
      count,
      setStatusFilter,
      scope,
      setScopeFilter,
      search,
      setSearch,
      num,
      setNum,
      dateFrom,
      setDateFrom,
      dateTo,
      setDateTo,
      isDateRangeValid,
      resetFilters,
      isLoading,
      error,
   } = useLeadsContext();

   const [viewMode, setViewMode] = useState(LEADS_VIEW_MODES.TABLE);
   const [selectedStatusValue, setSelectedStatusValue] = useState(
      ALL_STATUSES_VALUE,
   );

   const statusFilterOptions = useMemo(
      () =>
         scope === leadsScopes.ACTIVE
            ? getActiveLeadStatusFilterOptions()
            : getLeadStatusFilterOptions(),
      [scope],
   );

   const isTotalScope = scope === leadsScopes.ALL;

   const hasActiveFilters = Boolean(search || num || dateFrom || dateTo);

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

   function handleScopeChange(_, nextScope) {
      if (!nextScope) {
         return;
      }

      // A terminal status cannot survive the switch to the active list: keep it
      // selected and the list would always come back empty.
      if (
         nextScope === leadsScopes.ACTIVE &&
         isArchivedLeadStatus(selectedStatusValue)
      ) {
         setSelectedStatusValue(ALL_STATUSES_VALUE);
         setStatusFilter('');
      }

      setScopeFilter(nextScope);
   }

   function handleStatusFilterChange(event) {
      const nextValue = event.target.value;

      setSelectedStatusValue(nextValue);
      setStatusFilter(nextValue === ALL_STATUSES_VALUE ? '' : nextValue);
   }

   function handleSearchChange(event) {
      setSearch(event.target.value);
   }

   function handleNumChange(event) {
      setNum(event.target.value);
   }

   function handleDateFromChange(event) {
      setDateFrom(event.target.value);
   }

   function handleDateToChange(event) {
      setDateTo(event.target.value);
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
                     {t("leads.title")}
                  </Typography>

                  <Typography color="text.secondary" fontSize={14}>
                     {t("leads.subtitle")}
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
                     value={scope}
                     exclusive
                     onChange={handleScopeChange}
                     size="small"
                     color="primary"
                     aria-label={t("leads.scope.toggle")}
                     sx={{
                        alignSelf: {
                           xs: 'stretch',
                           sm: 'auto',
                        },
                        '& .MuiToggleButton-root': {
                           px: 2,
                           whiteSpace: 'nowrap',
                           textTransform: 'none',
                        },
                     }}
                  >
                     <ToggleButton value={leadsScopes.ALL}>
                        {t("leads.scope.all")}
                     </ToggleButton>

                     <ToggleButton value={leadsScopes.ACTIVE}>
                        {t("leads.scope.active")}
                     </ToggleButton>
                  </ToggleButtonGroup>

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
                        {t("common.fields.status")}
                     </InputLabel>

                     <Select
                        labelId="leads-status-filter-label"
                        label={t("common.fields.status")}
                        value={selectedStatusValue}
                        onChange={handleStatusFilterChange}
                     >
                        <MenuItem value={ALL_STATUSES_VALUE}>
                           {t("enums.leadStatusFilter.all")}
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
                     aria-label={t("leads.viewToggle")}
                     sx={{
                        direction: "ltr",
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
                        aria-label={t("common.view.showAsTable")}
                        title={t("common.view.table")}
                     >
                        <ViewListRoundedIcon fontSize="small" />
                     </ToggleButton>

                     <ToggleButton
                        value={LEADS_VIEW_MODES.CARDS}
                        aria-label={t("common.view.showAsCards")}
                        title={t("common.view.cards")}
                     >
                        <GridViewRoundedIcon fontSize="small" />
                     </ToggleButton>

                     {/* <ToggleButton
                        value={LEADS_VIEW_MODES.KANBAN}
                        aria-label={t("leads.view.showAsKanban")}
                        title={t("leads.view.kanban")}
                     >
                        <ViewKanbanRoundedIcon fontSize="small" />
                     </ToggleButton> */}
                  </ToggleButtonGroup>
               </Stack>
            </Box>

            <Stack spacing={1.5}>
               <Stack
                  direction={{
                     xs: 'column',
                     md: 'row',
                  }}
                  spacing={1.5}
                  sx={{
                     alignItems: {
                        xs: 'stretch',
                        md: 'flex-start',
                     },
                  }}
               >
                  <TextField
                     value={search}
                     onChange={handleSearchChange}
                     placeholder={t("common.search.byDirection")}
                     size="small"
                     sx={{ flexGrow: 1 }}
                     slotProps={{
                        input: {
                           startAdornment: (
                              <InputAdornment position="start">
                                 <SearchRoundedIcon
                                    color="action"
                                    fontSize="small"
                                 />
                              </InputAdornment>
                           ),
                        },
                     }}
                  />

                  {isTotalScope && (
                     <>
                        <TextField
                           label={t("common.fields.number")}
                           value={num}
                           onChange={handleNumChange}
                           size="small"
                           sx={{
                              width: {
                                 xs: '100%',
                                 md: 140,
                              },
                           }}
                           slotProps={{
                              inputLabel: { shrink: true },
                           }}
                        />

                        <TextField
                           label={t("common.fields.dateFrom")}
                           type="date"
                           value={dateFrom}
                           onChange={handleDateFromChange}
                           size="small"
                           sx={{
                              width: {
                                 xs: '100%',
                                 md: 170,
                              },
                           }}
                           slotProps={{
                              inputLabel: { shrink: true },
                              htmlInput: { max: dateTo || undefined },
                           }}
                        />

                        <TextField
                           label={t("common.fields.dateTo")}
                           type="date"
                           value={dateTo}
                           onChange={handleDateToChange}
                           size="small"
                           sx={{
                              width: {
                                 xs: '100%',
                                 md: 170,
                              },
                           }}
                           slotProps={{
                              inputLabel: { shrink: true },
                              htmlInput: { min: dateFrom || undefined },
                           }}
                        />
                     </>
                  )}

                  {hasActiveFilters && (
                     <Button
                        onClick={resetFilters}
                        size="small"
                        color="inherit"
                        startIcon={<CloseRoundedIcon fontSize="small" />}
                        sx={{
                           whiteSpace: 'nowrap',
                           alignSelf: {
                              xs: 'stretch',
                              md: 'center',
                           },
                        }}
                     >
                        {t("common.actions.clear")}
                     </Button>
                  )}
               </Stack>

               {!isDateRangeValid && (
                  <Alert severity="warning">
                     {t("common.validation.dateOrder")}
                  </Alert>
               )}
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            <Box
               sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
               }}
            >
               {/* Каждый вид показывает загрузку сам: таблица —
                   скелетон-оверлеем сетки, карточки и канбан — через
                   CardsListSkeleton. Пустое состояние не должно
                   выигрывать у загрузки: пока запрос в полёте, лидов
                   ещё нет. */}
               {viewMode === LEADS_VIEW_MODES.TABLE ? (
                  <LeadsTable leads={leads} isLoading={isLoading} />
               ) : viewMode === LEADS_VIEW_MODES.CARDS ? (
                  isLoading ? (
                     <CardsListSkeleton maxWidth={720} padding={2} />
                  ) : leads.length === 0 ? (
                     <Box
                        sx={{
                           py: 4,
                           textAlign: 'center',
                        }}
                     >
                        <Typography color="text.secondary">
                           {t("leads.notFound")}
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
               ) : isLoading ? (
                  <CardsListSkeleton maxWidth={720} padding={2} />
               ) : (
                  <LeadsKanbanBoard leads={leads} />
               )}

               <LeadsPagination
                  page={page}
                  count={pagesCount}
                  onChange={handlePageChange}
               />
            </Box>
         </Stack>

         <LeadDetailsModal />
      </Box>
   );
}
