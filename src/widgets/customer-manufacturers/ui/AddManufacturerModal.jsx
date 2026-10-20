import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
   Alert,
   Box,
   Button,
   CircularProgress,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   InputAdornment,
   List,
   ListItemButton,
   ListItemText,
   Stack,
   TextField,
   Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import {
   getManufacturerBin,
   getManufacturerId,
   getManufacturerName,
} from '../model/manufacturers.helpers';
import { useManufacturersSearch } from '../model/useManufacturers';

export function AddManufacturerModal({
   open,
   attachedIds,
   isSubmitting = false,
   onClose,
   onSubmit,
}) {
   const [query, setQuery] = useState('');
   const [selectedId, setSelectedId] = useState('');

   const { results, isLoading, error } = useManufacturersSearch(query);

   useEffect(() => {
      if (open) {
         setQuery('');
         setSelectedId('');
      }
   }, [open]);

   function handleClose() {
      if (isSubmitting) {
         return;
      }

      onClose();
   }

   return (
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
         <DialogTitle>Добавить производителя</DialogTitle>

         <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
               <TextField
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Поиск по названию или БИН"
                  fullWidth
                  size="small"
                  autoFocus
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
                     minHeight: 220,
                     maxHeight: 320,
                     overflowY: 'auto',
                     border: '1px solid',
                     borderColor: 'divider',
                     borderRadius: 2,
                  }}
               >
                  {isLoading ? (
                     <Box
                        sx={{
                           height: 220,
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                        }}
                     >
                        <CircularProgress size={24} />
                     </Box>
                  ) : results.length === 0 ? (
                     <Box sx={{ p: 2 }}>
                        <Typography color="text.secondary" fontSize={14}>
                           {query.trim()
                              ? 'Производители не найдены'
                              : 'Введите название или БИН производителя'}
                        </Typography>
                     </Box>
                  ) : (
                     <List disablePadding>
                        {results.map((manufacturer) => {
                           const manufacturerId = getManufacturerId(manufacturer);
                           const isAttached = attachedIds.includes(manufacturerId);

                           return (
                              <ListItemButton
                                 key={manufacturerId}
                                 selected={selectedId === manufacturerId}
                                 disabled={isAttached}
                                 onClick={() => setSelectedId(manufacturerId)}
                              >
                                 <ListItemText
                                    primary={getManufacturerName(manufacturer)}
                                    secondary={
                                       isAttached
                                          ? 'Уже добавлен'
                                          : `БИН ${getManufacturerBin(manufacturer)}`
                                    }
                                 />
                              </ListItemButton>
                           );
                        })}
                     </List>
                  )}
               </Box>
            </Stack>
         </DialogContent>

         <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} disabled={isSubmitting}>
               Отмена
            </Button>

            <Button
               variant="contained"
               onClick={() => onSubmit(selectedId)}
               disabled={isSubmitting || !selectedId}
            >
               {isSubmitting ? 'Добавляем...' : 'Добавить'}
            </Button>
         </DialogActions>
      </Dialog>
   );
}

AddManufacturerModal.propTypes = {
   open: PropTypes.bool.isRequired,
   attachedIds: PropTypes.array.isRequired,
   isSubmitting: PropTypes.bool,
   onClose: PropTypes.func.isRequired,
   onSubmit: PropTypes.func.isRequired,
};
