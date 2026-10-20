import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
   Alert,
   Box,
   Button,
   CircularProgress,
   InputAdornment,
   Stack,
   TextField,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

import {
   countLeadsByManufacturer,
   getManufacturerBin,
   getManufacturerId,
   getManufacturerName,
} from '../model/manufacturers.helpers';
import { useManufacturerLinkActions } from '../model/useManufacturerLinkActions';
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
   const [selectedId, setSelectedId] = useState(null);
   const [isAddOpen, setIsAddOpen] = useState(false);

   const leadsCounts = useMemo(() => countLeadsByManufacturer(leads), [leads]);

   const visibleManufacturers = useMemo(() => {
      const normalizedSearch = search.trim().toLowerCase();

      if (!normalizedSearch) {
         return manufacturers;
      }

      return manufacturers.filter((manufacturer) =>
         [getManufacturerName(manufacturer), getManufacturerBin(manufacturer)].some(
            (field) => field.toLowerCase().includes(normalizedSearch),
         ),
      );
   }, [manufacturers, search]);

   const selectedManufacturer =
      manufacturers.find(
         (manufacturer) => getManufacturerId(manufacturer) === selectedId,
      ) ?? null;

   async function handleListChanged() {
      await reloadManufacturers();
      await reloadLeads();
   }

   const {
      attachLeads,
      detachLeads,
      addManufacturer,
      removeManufacturer,
      isSubmitting,
   } = useManufacturerLinkActions({ onSuccess: handleListChanged });

   async function handleAddManufacturer(manufacturerId) {
      const added = await addManufacturer(manufacturerId);

      if (added) {
         setIsAddOpen(false);
      }
   }

   async function handleRemoveManufacturer(manufacturer) {
      const manufacturerId = getManufacturerId(manufacturer);

      const removed = await removeManufacturer(manufacturerId);

      if (removed && selectedId === manufacturerId) {
         setSelectedId(null);
      }
   }

   return (
      <Stack spacing={2}>
         <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
         >
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

            <Button
               variant="contained"
               startIcon={<AddRoundedIcon />}
               onClick={() => setIsAddOpen(true)}
               disabled={isSubmitting}
               sx={{ flexShrink: 0 }}
            >
               Добавить производителя
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
            <ManufacturersTable
               manufacturers={visibleManufacturers}
               leadsCounts={leadsCounts}
               onOpenDetails={(manufacturer) =>
                  setSelectedId(getManufacturerId(manufacturer))
               }
               onOpenLeads={(manufacturer) =>
                  onOpenManufacturerLeads(getManufacturerId(manufacturer))
               }
               onRemove={handleRemoveManufacturer}
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
            open={isAddOpen}
            attachedIds={manufacturers.map(getManufacturerId)}
            isSubmitting={isSubmitting}
            onClose={() => setIsAddOpen(false)}
            onSubmit={handleAddManufacturer}
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
