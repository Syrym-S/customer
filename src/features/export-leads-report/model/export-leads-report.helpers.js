import { saveBlobAsFile } from '../../../shared/lib/download-file';

const REPORT_TIMEZONE = 'Asia/Almaty';

export function getTodayDateInputValue() {
   return new Intl.DateTimeFormat('en-CA', {
      timeZone: REPORT_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
   }).format(new Date());
}

export function isDateRangeValid(dateFrom, dateTo) {
   if (!dateFrom || !dateTo) {
      return false;
   }

   return dateFrom <= dateTo;
}

function getFilenameFromContentDisposition(contentDisposition) {
   if (!contentDisposition) {
      return null;
   }

   const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);

   return match ? decodeURIComponent(match[1]) : null;
}

export function getExportReportFilename(contentDisposition, dateFrom, dateTo) {
   return (
      getFilenameFromContentDisposition(contentDisposition) ||
      `leads-report_${dateFrom}_${dateTo}.xlsx`
   );
}

export function downloadBlob(blob, filename) {
   return saveBlobAsFile(blob, filename);
}

export async function parseBlobErrorMessage(error, fallbackMessage) {
   const data = error?.response?.data;

   if (!(data instanceof Blob)) {
      return (
         error?.response?.data?.message || error?.message || fallbackMessage
      );
   }

   try {
      const text = await data.text();
      const parsed = JSON.parse(text);

      return parsed?.message || parsed?.error || fallbackMessage;
   } catch {
      return fallbackMessage;
   }
}
