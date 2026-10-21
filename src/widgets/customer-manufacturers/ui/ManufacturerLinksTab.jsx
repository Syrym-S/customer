import { useMemo, useState } from 'react';
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
   Select,
   Stack,
   TextField,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';

import {
   EMPTY_ROW_SELECTION,
   getSelectedRowIds,
} from '../../../shared/helpers/data-grid.helpers';
import {
   ALL_ROW_STATUSES_VALUE,
   MANUFACTURER_ROW_STATUSES,
   buildManufacturerRows,
   countLeadsByManufacturer,
   filterManufacturerRowsByStatus,
   getManufacturerBin,
   getManufacturerId,
   getManufacturerName,
   getManufacturerRowStatusOptions,
   getRowIdsByStatus,
} from '../model/manufacturers.helpers';
import { useManufacturerLinkActions } from '../model/useManufacturerLinkActions';
import { useManufacturerRequests } from '../model/useManufacturerRequests';
import { ManufacturersTable } from './ManufacturersTable';
import { ManufacturerDetailsModal } from './ManufacturerDetailsModal';
import { AddManufacturerModal } from './AddManufacturerModal';

export function ManufacturerLinksTab({
   manufacturers,
   isLoading,
   error,
   leads,
   reloadManufacturers,
   reloadLeads,
   onOpenManufacturerLeads,
}) {
   const [search, setSearch] = useState('');
   const [statusValue, setStatusValue] = useState(ALL_ROW_STATUSES_VALUE);
   const [selectionModel, setSelectionModel] = useState(EMPTY_ROW_SELECTION);
   const [selectedId, setSelectedId] = useState(null);
   const [isSendOpen, setIsSendOpen] = useState(false);

   async function handleListChanged() {
      await reloadManufacturers();
      await reloadLeads();
   }

   const {
      requests,
      isLoading: isRequestsLoading,
      error: requestsError,
      isSubmitting: isRequestSubmitting,
      approveRequests,
      rejectRequests,
      withdrawRequests,
      sendRequest,
   } = useManufacturerRequests({ onSuccess: handleListChanged });

   const {
      attachLeads,
      detachLeads,
      removeManufacturer,
      isSubmitting: isLinkSubmitting,
   } = useManufacturerLinkActions({ onSuccess: handleListChanged });

   const isSubmitting = isLinkSubmitting || isRequestSubmitting;

   const statusOptions = useMemo(() => getManufacturerRowStatusOptions(), []);

   const leadsCounts = useMemo(() => countLeadsByManufacturer(leads), [leads]);

   const rows = useMemo(
      () => buildManufacturerRows(manufacturers, requests),
      [manufacturers, requests],
   );

   const visibleRows = useMemo(() => {
      const byStatus = filterManufacturerRowsByStatus(rows, statusValue);
      const normalizedSearch = search.trim().toLowerCase();

      if (!normalizedSearch) {
         return byStatus;
      }

      return byStatus.filter((row) =>
         [getManufacturerName(row), getManufacturerBin(row)].some((field) =>
            field.toLowerCase().includes(normalizedSearch),
         ),
      );
   }, [rows, search, statusValue]);

   const selectedIds = getSelectedRowIds(
      selectionModel,
      visibleRows,
      getManufacturerId,
   );

   const selectedIncomingIds = getRowIdsByStatus(visibleRows, selectedIds, [
      MANUFACTURER_ROW_STATUSES.INCOMING,
   ]);

   const selectedOutgoingIds = getRowIdsByStatus(visibleRows, selectedIds, [
      MANUFACTURER_ROW_STATUSES.OUTGOING,
   ]);

   const selectedManufacturer =
      manufacturers.find(
         (manufacturer) => getManufacturerId(manufacturer) === selectedId,
      ) ?? null;

   async function handleRemoveManufacturer(manufacturer) {
      const manufacturerId = getManufacturerId(manufacturer);

      const removed = await removeManufacturer(manufacturerId);

      if (removed && selectedId === manufacturerId) {
         setSelectedId(null);
      }
   }

   async function runSelectionAction(action, manufacturerIds) {
      const done = await action(manufacturerIds);

      if (done) {
         setSelectionModel(EMPTY_ROW_SELECTION);
      }
   }

   async function handleSendRequest(manufacturerId) {
      const sent = await sendRequest(manufacturerId);

      if (sent) {
         setIsSendOpen(false);
      }
   }

   return (
      <Stack spacing={2}>
         <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск по названию или БИН"
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

         <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
         >
            <FormControl size="small" sx={{ minWidth: 220 }}>
               <InputLabel id="manufacturer-links-status-label">Статус</InputLabel>

               <Select
                  labelId="manufacturer-links-status-label"
                  label="Статус"
                  value={statusValue}
                  onChange={(event) => setStatusValue(event.target.value)}
               >
                  <MenuItem value={ALL_ROW_STATUSES_VALUE}>Все статусы</MenuItem>

                  {statusOptions.map((option) => (
                     <MenuItem key={option.value} value={option.value}>
                        {option.label}
                     </MenuItem>
                  ))}
               </Select>
            </FormControl>

            <Box sx={{ flexGrow: 1 }} />

            <Button
               variant="contained"
               startIcon={<SendRoundedIcon />}
               onClick={() => setIsSendOpen(true)}
               disabled={isSubmitting}
               sx={{ flexShrink: 0 }}
            >
               Отправить заявку
            </Button>
         </Stack>

         <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, minHeight: 36 }}
         >
            <Chip
               size="small"
               variant="outlined"
               label={`Выбрано: ${selectedIds.length}`}
            />

            <Button
               size="small"
               variant="contained"
               color="success"
               startIcon={<CheckRoundedIcon />}
               disabled={selectedIncomingIds.length === 0 || isSubmitting}
               onClick={() => runSelectionAction(approveRequests, selectedIncomingIds)}
            >
               Одобрить заявки
            </Button>

            <Button
               size="small"
               variant="outlined"
               color="error"
               startIcon={<CloseRoundedIcon />}
               disabled={selectedIncomingIds.length === 0 || isSubmitting}
               onClick={() => runSelectionAction(rejectRequests, selectedIncomingIds)}
            >
               Отклонить заявки
            </Button>

            <Button
               size="small"
               variant="outlined"
               startIcon={<UndoRoundedIcon />}
               disabled={selectedOutgoingIds.length === 0 || isSubmitting}
               onClick={() =>
                  runSelectionAction(withdrawRequests, selectedOutgoingIds)
               }
            >
               Отозвать заявки
            </Button>
         </Stack>

         {(error || requestsError) && (
            <Alert severity="error">{error || requestsError}</Alert>
         )}

         {isLoading || isRequestsLoading ? (
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
            <ManufacturersTable
               manufacturers={visibleRows}
               leadsCounts={leadsCounts}
               selectionModel={selectionModel}
               onSelectionModelChange={setSelectionModel}
               onOpenDetails={(manufacturer) =>
                  setSelectedId(getManufacturerId(manufacturer))
               }
               onOpenLeads={(manufacturer) =>
                  onOpenManufacturerLeads(getManufacturerId(manufacturer))
               }
               onRemove={handleRemoveManufacturer}
               onApprove={approveRequests}
               onReject={rejectRequests}
               onWithdraw={withdrawRequests}
               isSubmitting={isSubmitting}
            />
         )}

         {selectedManufacturer && (
            <ManufacturerDetailsModal
               manufacturer={selectedManufacturer}
               leads={leads}
               isSubmitting={isSubmitting}
               onClose={() => setSelectedId(null)}
               onAttachLeads={attachLeads}
               onDetachLeads={detachLeads}
            />
         )}

         <AddManufacturerModal
            open={isSendOpen}
            attachedIds={rows.map(getManufacturerId)}
            title="Отправить заявку производителю"
            submitLabel="Отправить"
            submittingLabel="Отправляем..."
            attachedLabel="Заявка уже отправлена"
            isSubmitting={isSubmitting}
            onClose={() => setIsSendOpen(false)}
            onSubmit={handleSendRequest}
         />
      </Stack>
   );
}

ManufacturerLinksTab.propTypes = {
   manufacturers: PropTypes.array.isRequired,
   isLoading: PropTypes.bool,
   error: PropTypes.string,
   leads: PropTypes.array.isRequired,
   reloadManufacturers: PropTypes.func.isRequired,
   reloadLeads: PropTypes.func.isRequired,
   onOpenManufacturerLeads: PropTypes.func.isRequired,
};
