import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
   Alert,
   Box,
   Button,
   Chip,
   CircularProgress,
   FormControl,
   InputAdornment,
   InputLabel,
   MenuItem,
   Pagination,
   Select,
   Stack,
   TextField,
   Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';

import {
   EMPTY_ROW_SELECTION,
   getSelectedRowIds,
} from '../../../shared/helpers/data-grid.helpers';
import { getLeadStatusFilterOptions } from '../../customer-leads/model/lead.helpers';
import {
   MANUFACTURER_LEADS_PER_PAGE,
   MANUFACTURER_LINK_FILTERS,
   filterLeadsByManufacturer,
   getManufacturerId,
   getManufacturerName,
   hasAttachedManufacturer,
   paginate,
   searchLeads,
} from '../model/manufacturers.helpers';
import { useManufacturerLinkActions } from '../model/useManufacturerLinkActions';
import { ManufacturerLeadsTable } from './ManufacturerLeadsTable';
import { ManufacturerLeadDetailsModal } from './ManufacturerLeadDetailsModal';
import { AttachManufacturerModal } from './AttachManufacturerModal';

const ALL_STATUSES_VALUE = 'all';

export const ALL_MANUFACTURERS_VALUE = 'all';

export function ManufacturerLeadsTab({
   leads,
   isLoading,
   error,
   reloadLeads,
   manufacturerOptions,
   manufacturerFilter,
   onManufacturerFilterChange,
}) {
   const [search, setSearch] = useState('');
   const [statusValue, setStatusValue] = useState(ALL_STATUSES_VALUE);
   const [linkState, setLinkState] = useState(MANUFACTURER_LINK_FILTERS.ALL);
   const [selectionModel, setSelectionModel] = useState(EMPTY_ROW_SELECTION);
   const [page, setPage] = useState(1);
   const [openLeadId, setOpenLeadId] = useState(null);
   const [attachTargetIds, setAttachTargetIds] = useState([]);
   const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);

   const statusFilterOptions = useMemo(() => getLeadStatusFilterOptions(), []);

   const filteredLeads = useMemo(() => {
      const byManufacturer = filterLeadsByManufacturer(leads, {
         manufacturerId:
            manufacturerFilter === ALL_MANUFACTURERS_VALUE ? '' : manufacturerFilter,
         linkState: linkState === MANUFACTURER_LINK_FILTERS.ALL ? '' : linkState,
      });

      const byStatus =
         statusValue === ALL_STATUSES_VALUE
            ? byManufacturer
            : byManufacturer.filter((lead) => lead.status === statusValue);

      return searchLeads(byStatus, search);
   }, [leads, linkState, manufacturerFilter, search, statusValue]);

   useEffect(() => {
      setPage(1);
   }, [search, statusValue, linkState, manufacturerFilter]);

   async function handleMutationSuccess() {
      setSelectionModel(EMPTY_ROW_SELECTION);

      await reloadLeads();
   }

   const { attachLeads, detachLeads, isSubmitting } = useManufacturerLinkActions({
      onSuccess: handleMutationSuccess,
   });

   const pagesCount = Math.max(
      1,
      Math.ceil(filteredLeads.length / MANUFACTURER_LEADS_PER_PAGE),
   );

   const pageLeads = paginate(filteredLeads, page, MANUFACTURER_LEADS_PER_PAGE);

   const selectedLeadIds = getSelectedRowIds(selectionModel, pageLeads);

   const selectedAttachedIds = selectedLeadIds.filter((leadId) =>
      hasAttachedManufacturer(leads.find((lead) => lead.id === leadId)),
   );

   const openLead = leads.find((lead) => lead.id === openLeadId) ?? null;

   const attachTargetLead =
      attachTargetIds.length === 1
         ? leads.find((lead) => lead.id === attachTargetIds[0])
         : null;

   function handleOpenAttachModal(leadIds) {
      if (leadIds.length === 0) {
         return;
      }

      setAttachTargetIds(leadIds);
      setIsAttachModalOpen(true);
   }

   function handleCloseAttachModal() {
      setIsAttachModalOpen(false);
      setAttachTargetIds([]);
   }

   async function handleAttachSubmit(manufacturerId) {
      const attached = await attachLeads(manufacturerId, attachTargetIds);

      if (attached) {
         handleCloseAttachModal();
      }
   }

   return (
      <Stack spacing={2}>
         <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            sx={{ alignItems: { xs: 'stretch', md: 'center' } }}
         >
            <TextField
               value={search}
               onChange={(event) => setSearch(event.target.value)}
               placeholder="Поиск по номеру, направлению или производителю"
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

            <FormControl size="small" sx={{ minWidth: 180 }}>
               <InputLabel id="manufacturer-leads-status-label">Статус</InputLabel>

               <Select
                  labelId="manufacturer-leads-status-label"
                  label="Статус"
                  value={statusValue}
                  onChange={(event) => setStatusValue(event.target.value)}
               >
                  <MenuItem value={ALL_STATUSES_VALUE}>Все статусы</MenuItem>

                  {statusFilterOptions.map((option) => (
                     <MenuItem key={option.value} value={option.value}>
                        {option.label}
                     </MenuItem>
                  ))}
               </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 220 }}>
               <InputLabel id="manufacturer-leads-manufacturer-label">
                  Производитель
               </InputLabel>

               <Select
                  labelId="manufacturer-leads-manufacturer-label"
                  label="Производитель"
                  value={manufacturerFilter}
                  onChange={(event) => onManufacturerFilterChange(event.target.value)}
               >
                  <MenuItem value={ALL_MANUFACTURERS_VALUE}>
                     Все производители
                  </MenuItem>

                  {manufacturerOptions.map((manufacturer) => (
                     <MenuItem
                        key={getManufacturerId(manufacturer)}
                        value={getManufacturerId(manufacturer)}
                     >
                        {getManufacturerName(manufacturer)}
                     </MenuItem>
                  ))}
               </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180 }}>
               <InputLabel id="manufacturer-leads-link-state-label">
                  Привязка
               </InputLabel>

               <Select
                  labelId="manufacturer-leads-link-state-label"
                  label="Привязка"
                  value={linkState}
                  onChange={(event) => setLinkState(event.target.value)}
               >
                  <MenuItem value={MANUFACTURER_LINK_FILTERS.ALL}>Все</MenuItem>

                  <MenuItem value={MANUFACTURER_LINK_FILTERS.ATTACHED}>
                     С производителем
                  </MenuItem>

                  <MenuItem value={MANUFACTURER_LINK_FILTERS.FREE}>
                     Без производителя
                  </MenuItem>
               </Select>
            </FormControl>
         </Stack>

         <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, minHeight: 36 }}
         >
            <Chip
               size="small"
               variant="outlined"
               label={`Выбрано: ${selectedLeadIds.length}`}
            />

            <Button
               size="small"
               variant="contained"
               startIcon={<LinkRoundedIcon />}
               disabled={selectedLeadIds.length === 0 || isSubmitting}
               onClick={() => handleOpenAttachModal(selectedLeadIds)}
            >
               Привязать производителя
            </Button>

            <Button
               size="small"
               color="error"
               variant="outlined"
               startIcon={<LinkOffRoundedIcon />}
               disabled={selectedAttachedIds.length === 0 || isSubmitting}
               onClick={() => detachLeads(selectedAttachedIds)}
            >
               Открепить
            </Button>
         </Stack>

         {error && <Alert severity="error">{error}</Alert>}

         {isLoading ? (
            <Box
               sx={{
                  minHeight: 280,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
               }}
            >
               <CircularProgress />
            </Box>
         ) : (
            <ManufacturerLeadsTable
               leads={pageLeads}
               selectionModel={selectionModel}
               onSelectionModelChange={setSelectionModel}
               onOpenLead={(lead) => setOpenLeadId(lead.id)}
               onAttachLead={(lead) => handleOpenAttachModal([lead.id])}
               onDetachLead={(lead) => detachLeads([lead.id])}
               isSubmitting={isSubmitting}
            />
         )}

         {!isLoading && pagesCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
               <Pagination
                  page={page}
                  count={pagesCount}
                  onChange={(_, nextPage) => setPage(nextPage)}
                  color="primary"
                  shape="rounded"
               />
            </Box>
         )}

         {!isLoading && filteredLeads.length > 0 && (
            <Typography
               color="text.secondary"
               fontSize={13}
               sx={{ textAlign: 'center' }}
            >
               Всего перевозок: {filteredLeads.length}
            </Typography>
         )}

         {openLead && (
            <ManufacturerLeadDetailsModal
               lead={openLead}
               isSubmitting={isSubmitting}
               onClose={() => setOpenLeadId(null)}
               onAttach={(lead) => handleOpenAttachModal([lead.id])}
               onDetach={(lead) => detachLeads([lead.id])}
            />
         )}

         <AttachManufacturerModal
            open={isAttachModalOpen}
            leadIds={attachTargetIds}
            manufacturers={manufacturerOptions}
            currentManufacturerId={
               attachTargetLead?.manufacturer
                  ? getManufacturerId(attachTargetLead.manufacturer)
                  : ''
            }
            isSubmitting={isSubmitting}
            onClose={handleCloseAttachModal}
            onSubmit={handleAttachSubmit}
         />
      </Stack>
   );
}

ManufacturerLeadsTab.propTypes = {
   leads: PropTypes.array.isRequired,
   isLoading: PropTypes.bool,
   error: PropTypes.string,
   reloadLeads: PropTypes.func.isRequired,
   manufacturerOptions: PropTypes.array.isRequired,
   manufacturerFilter: PropTypes.string.isRequired,
   onManufacturerFilterChange: PropTypes.func.isRequired,
};
