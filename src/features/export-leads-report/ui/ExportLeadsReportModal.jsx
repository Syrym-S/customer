import { useState } from 'react';
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';

import {
   Alert,
   Box,
   Button,
   DialogActions,
   DialogContent,
   DialogTitle,
   Stack,
   TextField,
   Typography,
} from '@mui/material';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';

import { exportLeadsReport } from '../../../widgets/customer-leads/api/leads.repository';
import {
   downloadBlob,
   getExportReportFilename,
   getTodayDateInputValue,
   isDateRangeValid,
   parseBlobErrorMessage,
} from '../model/export-leads-report.helpers';
import { AppDialog } from '../../../shared/ui/AppDialog';

export function ExportLeadsReportModal({ open, onClose }) {
   const { t } = useTranslation();

   const [dateFrom, setDateFrom] = useState('');
   const [dateTo, setDateTo] = useState('');
   const [isExporting, setIsExporting] = useState(false);
   const [exportError, setExportError] = useState('');

   const today = getTodayDateInputValue();
   const isRangeValid = isDateRangeValid(dateFrom, dateTo);

   function handleClose() {
      if (isExporting) {
         return;
      }

      setExportError('');
      onClose();
   }

   async function handleExport() {
      if (!isRangeValid || isExporting) {
         return;
      }

      try {
         setIsExporting(true);
         setExportError('');

         const { blob, contentDisposition } = await exportLeadsReport({
            dateFrom,
            dateTo,
         });

         downloadBlob(
            blob,
            getExportReportFilename(contentDisposition, dateFrom, dateTo),
         );

         onClose();
      } catch (error) {
         setExportError(
            await parseBlobErrorMessage(
               error,
               t("exportReport.failed"),
            ),
         );
      } finally {
         setIsExporting(false);
      }
   }

   return (
      <AppDialog open={open} onClose={handleClose} fullWidth maxWidth='xs'>
         <DialogTitle sx={{ px: 3, pt: 3, pb: 2 }}>
            <Stack direction='row' spacing={1.75} sx={{ alignItems: 'center' }}>
               <Box
                  sx={{
                     width: 44,
                     height: 44,
                     borderRadius: '50%',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     bgcolor: 'primary.light',
                     color: 'primary.contrastText',
                     flexShrink: 0,
                  }}
               >
                  <SummarizeOutlinedIcon />
               </Box>

               <Typography
                  variant='h6'
                  component='div'
                  sx={{ fontWeight: 500, fontSize: { xs: 18, sm: 20 } }}
               >
                  {t("exportReport.action")}
               </Typography>
            </Stack>
         </DialogTitle>

         <DialogContent>
            <Stack spacing={2}>
               <Alert severity='info' variant='outlined' sx={{ borderRadius: 2 }}>
                  {t("exportReport.hint")}
               </Alert>

               <TextField
                  label={t("common.fields.dateFrom")}
                  type='date'
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  fullWidth
                  size='small'
                  slotProps={{
                     inputLabel: { shrink: true },
                     htmlInput: { max: today },
                  }}
               />

               <TextField
                  label={t("common.fields.dateTo")}
                  type='date'
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  fullWidth
                  size='small'
                  slotProps={{
                     inputLabel: { shrink: true },
                     htmlInput: { max: today, min: dateFrom || undefined },
                  }}
               />

               {dateFrom && dateTo && !isRangeValid && (
                  <Alert severity='warning'>
                     {t("exportReport.dateOrder")}
                  </Alert>
               )}

               {exportError && <Alert severity='error'>{exportError}</Alert>}
            </Stack>
         </DialogContent>

         <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} disabled={isExporting}>
               {t("common.actions.cancel")}
            </Button>

            <Button
               variant='contained'
               onClick={handleExport}
               disabled={!isRangeValid || isExporting}
               sx={{ minWidth: 156 }}
            >
               {isExporting ? t("exportReport.inProgress") : t("exportReport.submit")}
            </Button>
         </DialogActions>
      </AppDialog>
   );
}

ExportLeadsReportModal.propTypes = {
   open: PropTypes.bool.isRequired,
   onClose: PropTypes.func.isRequired,
};
