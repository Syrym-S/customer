import { useState } from 'react';
import PropTypes from 'prop-types';

import {
   Alert,
   Box,
   Button,
   Dialog,
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

export function ExportLeadsReportModal({ open, onClose }) {
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
               'Не удалось выгрузить отчет. Попробуйте позже',
            ),
         );
      } finally {
         setIsExporting(false);
      }
   }

   return (
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='xs'>
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
                  Выгрузить отчет
               </Typography>
            </Stack>
         </DialogTitle>

         <DialogContent>
            <Stack spacing={2}>
               <Alert severity='info' variant='outlined' sx={{ borderRadius: 2 }}>
                  В отчет попадут только завершенные перевозки за выбранный
                  период.
               </Alert>

               <TextField
                  label='Дата от'
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
                  label='Дата до'
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
                     Дата «от» не может быть позже даты «до»
                  </Alert>
               )}

               {exportError && <Alert severity='error'>{exportError}</Alert>}
            </Stack>
         </DialogContent>

         <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} disabled={isExporting}>
               Отмена
            </Button>

            <Button
               variant='contained'
               onClick={handleExport}
               disabled={!isRangeValid || isExporting}
               sx={{ minWidth: 156 }}
            >
               {isExporting ? 'Выгрузка...' : 'Выгрузить'}
            </Button>
         </DialogActions>
      </Dialog>
   );
}

ExportLeadsReportModal.propTypes = {
   open: PropTypes.bool.isRequired,
   onClose: PropTypes.func.isRequired,
};
