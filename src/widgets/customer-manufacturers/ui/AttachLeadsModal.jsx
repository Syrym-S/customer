import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';
import {
   Button,
   DialogActions,
   DialogContent,
   DialogTitle,
   InputAdornment,
   Stack,
   TextField,
   Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import {
   EMPTY_ROW_SELECTION,
   getSelectedRowIds,
} from '../../../shared/helpers/data-grid.helpers';
import { searchLeads } from '../model/manufacturers.helpers';
import { CompactLeadsGrid } from './CompactLeadsGrid';
import { AppDialog } from '../../../shared/ui/AppDialog';

export function AttachLeadsModal({
   open,
   manufacturerName,
   leads,
   isSubmitting = false,
   onClose,
   onSubmit,
}) {
   const { t } = useTranslation();

   const [search, setSearch] = useState('');
   const [selectionModel, setSelectionModel] = useState(EMPTY_ROW_SELECTION);

   useEffect(() => {
      if (open) {
         setSearch('');
         setSelectionModel(EMPTY_ROW_SELECTION);
      }
   }, [open]);

   const visibleLeads = useMemo(() => searchLeads(leads, search), [leads, search]);

   const selectedLeadIds = getSelectedRowIds(selectionModel, visibleLeads);

   function handleClose() {
      if (isSubmitting) {
         return;
      }

      onClose();
   }

   return (
      <AppDialog open={open} onClose={handleClose} fullWidth maxWidth="md">
         <DialogTitle>{t("manufacturers.tabs.linking")}</DialogTitle>

         <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
               <Typography color="text.secondary" fontSize={14}>
                  {t("manufacturers.link.freeShipmentsHint", { name: manufacturerName })}
               </Typography>

               <TextField
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("manufacturers.shipments.searchByNumber")}
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

               <CompactLeadsGrid
                  leads={visibleLeads}
                  selectionModel={selectionModel}
                  onSelectionModelChange={setSelectionModel}
                  noRowsLabel={t("manufacturers.link.freeShipmentsNotFound")}
                  height={360}
               />
            </Stack>
         </DialogContent>

         <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} disabled={isSubmitting}>
               {t("common.actions.cancel")}
            </Button>

            <Button
               variant="contained"
               onClick={() => onSubmit(selectedLeadIds)}
               disabled={isSubmitting || selectedLeadIds.length === 0}
            >
               {isSubmitting
                  ? t("manufacturers.link.inProgress")
                  : t("manufacturers.link.actionWithCount", { count: selectedLeadIds.length })}
            </Button>
         </DialogActions>
      </AppDialog>
   );
}

AttachLeadsModal.propTypes = {
   open: PropTypes.bool.isRequired,
   manufacturerName: PropTypes.string.isRequired,
   leads: PropTypes.array.isRequired,
   isSubmitting: PropTypes.bool,
   onClose: PropTypes.func.isRequired,
   onSubmit: PropTypes.func.isRequired,
};
