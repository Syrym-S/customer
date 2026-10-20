import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
   Box,
   Button,
   Chip,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Stack,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableRow,
   Typography,
} from '@mui/material';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';

import { DialogCloseButton } from '../../../shared/ui/DialogCloseButton';
import {
   EMPTY_ROW_SELECTION,
   getSelectedRowIds,
} from '../../../shared/helpers/data-grid.helpers';
import { formatLeadDate } from '../../customer-leads/model/lead.helpers';
import {
   getManufacturerBin,
   getManufacturerId,
   getManufacturerLinkedAt,
   getManufacturerName,
} from '../model/manufacturers.helpers';
import { CompactLeadsGrid } from './CompactLeadsGrid';
import { AttachLeadsModal } from './AttachLeadsModal';

function ManufacturerDataTable({ manufacturer }) {
   const linkedAt = getManufacturerLinkedAt(manufacturer);

   const rows = [
      { label: 'Название', value: getManufacturerName(manufacturer) },
      { label: 'БИН', value: getManufacturerBin(manufacturer) },
      { label: 'ID', value: getManufacturerId(manufacturer) || '—' },
      {
         label: 'Привязан к заказчику',
         value: linkedAt ? formatLeadDate(linkedAt) : '—',
      },
   ];

   return (
      <Box
         sx={{
            p: { xs: 1.25, sm: 1.5 },
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
         }}
      >
         <Typography
            sx={{
               fontSize: 13,
               fontWeight: 600,
               color: 'text.secondary',
               mb: 0.5,
            }}
         >
            Данные производителя
         </Typography>

         <TableContainer component={Box}>
            <Table size="small">
               <TableBody>
                  {rows.map((row) => (
                     <TableRow key={row.label}>
                        <TableCell
                           sx={{ width: '40%', color: 'text.secondary', pl: 0 }}
                        >
                           {row.label}:
                        </TableCell>

                        <TableCell sx={{ fontWeight: 500 }}>{row.value}</TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </TableContainer>
      </Box>
   );
}

ManufacturerDataTable.propTypes = {
   manufacturer: PropTypes.object.isRequired,
};

export function ManufacturerDetailsModal({
   manufacturer,
   leads,
   isSubmitting = false,
   onClose,
   onAttachLeads,
   onDetachLeads,
}) {
   const [selectionModel, setSelectionModel] = useState(EMPTY_ROW_SELECTION);
   const [isAttachLeadsOpen, setIsAttachLeadsOpen] = useState(false);

   const manufacturerId = getManufacturerId(manufacturer);

   const attachedLeads = useMemo(
      () => leads.filter((lead) => lead.manufacturer?.id === manufacturerId),
      [leads, manufacturerId],
   );

   const freeLeads = useMemo(
      () => leads.filter((lead) => !lead.manufacturer?.id),
      [leads],
   );

   const selectedLeadIds = getSelectedRowIds(selectionModel, attachedLeads);

   async function handleDetach(leadIds) {
      const detached = await onDetachLeads(leadIds);

      if (detached) {
         setSelectionModel(EMPTY_ROW_SELECTION);
      }
   }

   async function handleAttach(leadIds) {
      const attached = await onAttachLeads(manufacturerId, leadIds);

      if (attached) {
         setIsAttachLeadsOpen(false);
      }
   }

   return (
      <Dialog
         open
         onClose={isSubmitting ? undefined : onClose}
         fullWidth
         maxWidth="md"
         slotProps={{
            paper: {
               sx: { borderRadius: 4, position: 'relative' },
            },
         }}
      >
         <DialogCloseButton onClick={onClose} disabled={isSubmitting} />

         <DialogTitle sx={{ pl: 3, pr: 7, pt: 3, pb: 1.5 }}>
            <Typography
               sx={{
                  fontSize: { xs: '18px', sm: '20px' },
                  fontWeight: 600,
                  lineHeight: 1.3,
               }}
            >
               {getManufacturerName(manufacturer)}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
               <Chip
                  size="small"
                  variant="outlined"
                  label={`БИН ${getManufacturerBin(manufacturer)}`}
               />

               <Chip
                  size="small"
                  variant="outlined"
                  label={`Перевозок: ${attachedLeads.length}`}
               />
            </Stack>
         </DialogTitle>

         <DialogContent sx={{ px: 3 }}>
            <Stack spacing={2}>
               <ManufacturerDataTable manufacturer={manufacturer} />

               <Box>
                  <Stack
                     direction={{ xs: 'column', sm: 'row' }}
                     spacing={1}
                     sx={{
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'space-between',
                        mb: 1,
                     }}
                  >
                     <Typography sx={{ fontSize: 15, fontWeight: 600 }}>
                        Привязанные перевозки
                     </Typography>

                     <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        <Button
                           size="small"
                           variant="contained"
                           startIcon={<LinkRoundedIcon />}
                           onClick={() => setIsAttachLeadsOpen(true)}
                           disabled={isSubmitting}
                        >
                           Привязать перевозки
                        </Button>

                        <Button
                           size="small"
                           color="error"
                           variant="outlined"
                           startIcon={<LinkOffRoundedIcon />}
                           onClick={() => handleDetach(selectedLeadIds)}
                           disabled={isSubmitting || selectedLeadIds.length === 0}
                        >
                           {`Открепить (${selectedLeadIds.length})`}
                        </Button>
                     </Stack>
                  </Stack>

                  <CompactLeadsGrid
                     leads={attachedLeads}
                     selectionModel={selectionModel}
                     onSelectionModelChange={setSelectionModel}
                     rowActionLabel="Открепить"
                     onRowAction={(lead) => handleDetach([lead.id])}
                     isRowActionDisabled={isSubmitting}
                     noRowsLabel="К производителю не привязано ни одной перевозки"
                  />
               </Box>
            </Stack>
         </DialogContent>

         <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose} disabled={isSubmitting}>
               Закрыть
            </Button>
         </DialogActions>

         {isAttachLeadsOpen && (
            <AttachLeadsModal
               open
               manufacturerName={getManufacturerName(manufacturer)}
               leads={freeLeads}
               isSubmitting={isSubmitting}
               onClose={() => setIsAttachLeadsOpen(false)}
               onSubmit={handleAttach}
            />
         )}
      </Dialog>
   );
}

ManufacturerDetailsModal.propTypes = {
   manufacturer: PropTypes.object.isRequired,
   leads: PropTypes.array.isRequired,
   isSubmitting: PropTypes.bool,
   onClose: PropTypes.func.isRequired,
   onAttachLeads: PropTypes.func.isRequired,
   onDetachLeads: PropTypes.func.isRequired,
};
