import { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';
import {
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   FormControl,
   InputLabel,
   MenuItem,
   Select,
   Stack,
   Typography,
} from '@mui/material';

import {
   getManufacturerBin,
   getManufacturerId,
   getManufacturerName,
} from '../model/manufacturers.helpers';

export function AttachManufacturerModal({
   open,
   leadIds,
   manufacturers,
   currentManufacturerId = '',
   isSubmitting = false,
   onClose,
   onSubmit,
}) {
   const { t } = useTranslation();

   const [manufacturerId, setManufacturerId] = useState('');

   useEffect(() => {
      if (open) {
         setManufacturerId(currentManufacturerId || '');
      }
   }, [open, currentManufacturerId]);

   function handleClose() {
      if (isSubmitting) {
         return;
      }

      onClose();
   }

   function handleSubmit() {
      if (!manufacturerId) {
         return;
      }

      onSubmit(manufacturerId);
   }

   const leadsCount = leadIds.length;

   return (
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
         <DialogTitle>{t("manufacturers.link.title")}</DialogTitle>

         <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
               <Typography color="text.secondary" fontSize={14}>
                  {t('manufacturers.link.overwriteWarning', {
                     shipments: t('common.shipmentCount', { count: leadsCount }),
                  })}
               </Typography>

               <FormControl size="small" fullWidth>
                  <InputLabel id="attach-manufacturer-label">
                     {t("common.fields.manufacturer")}
                  </InputLabel>

                  <Select
                     labelId="attach-manufacturer-label"
                     label={t("common.fields.manufacturer")}
                     value={manufacturerId}
                     onChange={(event) => setManufacturerId(event.target.value)}
                  >
                     {manufacturers.map((manufacturer) => (
                        <MenuItem
                           key={getManufacturerId(manufacturer)}
                           value={getManufacturerId(manufacturer)}
                        >
                           {t("manufacturers.card.nameWithBin", { name: getManufacturerName(manufacturer), bin: getManufacturerBin(manufacturer) })}
                        </MenuItem>
                     ))}
                  </Select>
               </FormControl>
            </Stack>
         </DialogContent>

         <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} disabled={isSubmitting}>
               {t("common.actions.cancel")}
            </Button>

            <Button
               variant="contained"
               onClick={handleSubmit}
               disabled={isSubmitting || !manufacturerId || leadsCount === 0}
            >
               {isSubmitting ? t("manufacturers.link.inProgress") : t("manufacturers.link.action")}
            </Button>
         </DialogActions>
      </Dialog>
   );
}

AttachManufacturerModal.propTypes = {
   open: PropTypes.bool.isRequired,
   leadIds: PropTypes.array.isRequired,
   manufacturers: PropTypes.array.isRequired,
   currentManufacturerId: PropTypes.string,
   isSubmitting: PropTypes.bool,
   onClose: PropTypes.func.isRequired,
   onSubmit: PropTypes.func.isRequired,
};
