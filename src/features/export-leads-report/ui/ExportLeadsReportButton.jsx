import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Box, Button } from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import { ExportLeadsReportModal } from './ExportLeadsReportModal';

// Ниже 350px полная подпись не влезает в строку и кнопка становится
// двухэтажной, поэтому там остаётся одно существительное.
const NARROW_QUERY = '@media (max-width: 349.95px)';

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
            aria-label={t("exportReport.action")}
            sx={{ whiteSpace: 'nowrap' }}
         >
            <Box
               component='span'
               sx={{
                  [NARROW_QUERY]: {
                     display: 'none',
                  },
               }}
            >
               {t("exportReport.action")}
            </Box>

            <Box
               component='span'
               sx={{
                  display: 'none',

                  [NARROW_QUERY]: {
                     display: 'inline',
                  },
               }}
            >
               {t("exportReport.actionShort")}
            </Box>
         </Button>

         <ExportLeadsReportModal
            open={isExportModalOpen}
            onClose={handleCloseExportModal}
         />
      </>
   );
}
