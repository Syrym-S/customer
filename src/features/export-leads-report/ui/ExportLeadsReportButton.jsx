import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Button } from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import { ExportLeadsReportModal } from './ExportLeadsReportModal';

export function ExportLeadsReportButton() {
   const { t } = useTranslation();

   const [isExportModalOpen, setIsExportModalOpen] = useState(false);

   const handleOpenExportModal = () => setIsExportModalOpen(true);

   const handleCloseExportModal = () => setIsExportModalOpen(false);

   return (
      <>
         <Button
            variant='outlined'
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={handleOpenExportModal}
         >
            {t("exportReport.action")}
         </Button>

         <ExportLeadsReportModal
            open={isExportModalOpen}
            onClose={handleCloseExportModal}
         />
      </>
   );
}
