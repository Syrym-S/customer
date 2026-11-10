import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";

import {
   Box,
   Button,
   DialogActions,
   DialogContent,
   DialogTitle,
   IconButton,
   Tooltip,
   Typography,
} from '@mui/material';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';

import { DocumentPreview } from './DocumentPreview';
import { AppDialog } from '../../../../../../shared/ui/AppDialog';

export function DocumentPreviewDialog({ document, onClose }) {
   const { t } = useTranslation();

   return (
      <AppDialog
         open={Boolean(document)}
         onClose={onClose}
         fullWidth
         maxWidth='lg'
         slotProps={{
            paper: {
               sx: {
                  borderRadius: 3,
                  width: 'min(1180px, calc(100vw - 32px))',
                  maxHeight: 'calc(100vh - 32px)',
               },
            },
         }}
      >
         <DialogTitle>{document?.name || t("common.fields.document")}</DialogTitle>

         <DialogContent
            sx={{
               px: 2,
               pb: 2,
               overflow: 'hidden',
            }}
         >
            <Typography
               color='text.secondary'
               sx={{
                  fontSize: 13,
                  mb: 2,
               }}
            >
               {document?.context || t("common.empty.descriptionNotSpecified")}
            </Typography>

            <DocumentPreview document={document} />
         </DialogContent>

         <DialogActions
            sx={{
               px: 3,
               pb: 2,
               gap: 1,
               justifyContent: 'space-between',
            }}
         >
            <Box sx={{ display: 'flex', gap: 1 }}>
               {document?.fileUrl && document.fileUrl !== '#' && (
                  <>
                     <Tooltip title={t("common.actions.openInNewTab")}>
                        <IconButton
                           component='a'
                           href={document.fileUrl}
                           target='_blank'
                           rel='noreferrer'
                           aria-label={t("common.actions.openInNewTab")}
                        >
                           <OpenInNewOutlinedIcon />
                        </IconButton>
                     </Tooltip>

                     <Tooltip title={t("common.actions.download")}>
                        <IconButton
                           component='a'
                           href={document.fileUrl}
                           download={document.fileName || document.name || true}
                           aria-label={t("common.actions.download")}
                        >
                           <DownloadOutlinedIcon />
                        </IconButton>
                     </Tooltip>
                  </>
               )}
            </Box>

            <Button onClick={onClose}>{t("common.actions.close")}</Button>
         </DialogActions>
      </AppDialog>
   );
}

DocumentPreviewDialog.propTypes = {
   document: PropTypes.shape({
      name: PropTypes.string,
      context: PropTypes.string,
      fileName: PropTypes.string,
      fileUrl: PropTypes.string,
      fileType: PropTypes.string,
   }),
   onClose: PropTypes.func.isRequired,
};
