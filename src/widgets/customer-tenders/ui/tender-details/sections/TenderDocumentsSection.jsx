import { useState } from 'react';
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import {
   Box,
   Button,
   DialogActions,
   DialogContent,
   DialogTitle,
   IconButton,
   Stack,
   Tooltip,
   Typography,
} from '@mui/material';

import { TenderDetailsSection } from './TenderDetailsSection';
import { tenderDocumentPropType } from '../../../model/tenders.prop-types';
import { AppDialog } from '../../../../../shared/ui/AppDialog';

function isPdfDocument(document) {
   const fileType = document?.fileType || '';
   const fileName = document?.fileName?.toLowerCase() || '';

   return fileType === 'application/pdf' || fileName.endsWith('.pdf');
}

function isImageDocument(document) {
   const fileType = document?.fileType || '';
   const fileName = document?.fileName?.toLowerCase() || '';

   return (
      fileType.startsWith('image/') ||
      fileName.endsWith('.jpg') ||
      fileName.endsWith('.jpeg') ||
      fileName.endsWith('.png') ||
      fileName.endsWith('.webp')
   );
}

function isVideoDocument(document) {
   const fileType = document?.fileType || '';
   const fileName = document?.fileName?.toLowerCase() || '';

   return (
      fileType.startsWith('video/') ||
      fileName.endsWith('.mp4') ||
      fileName.endsWith('.webm') ||
      fileName.endsWith('.mov') ||
      fileName.endsWith('.avi')
   );
}

function hasPreviewUrl(document) {
   return Boolean(document?.fileUrl && document.fileUrl !== '#');
}

function TenderDocumentPreview({ document }) {
   const { t } = useTranslation();

   if (!document) {
      return null;
   }

   if (!hasPreviewUrl(document)) {
      return (
         <PreviewFallback text={t("common.filePreview.noFile")} />
      );
   }

   if (isPdfDocument(document)) {
      return (
         <Box
            sx={{
               height: {
                  xs: '70vh',
                  sm: '75vh',
               },
               border: '1px solid',
               borderColor: 'divider',
               borderRadius: 2,
               overflow: 'hidden',
               backgroundColor: 'grey.100',
            }}
         >
            <Box
               component='iframe'
               src={`${document.fileUrl}#view=FitH`}
               title={document.fileName || document.name || 'PDF preview'}
               sx={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  border: 0,
               }}
            />
         </Box>
      );
   }

   if (isImageDocument(document)) {
      return (
         <Box
            sx={{
               maxHeight: '75vh',
               border: '1px solid',
               borderColor: 'divider',
               borderRadius: 2,
               overflow: 'auto',
               backgroundColor: 'grey.100',
               display: 'flex',
               justifyContent: 'center',
               p: 2,
            }}
         >
            <Box
               component='img'
               src={document.fileUrl}
               alt={document.name || document.fileName || t("common.fields.document")}
               sx={{
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block',
               }}
            />
         </Box>
      );
   }

   if (isVideoDocument(document)) {
      return (
         <Box
            sx={{
               maxHeight: '75vh',
               border: '1px solid',
               borderColor: 'divider',
               borderRadius: 2,
               overflow: 'hidden',
               backgroundColor: 'common.black',
            }}
         >
            <Box
               component='video'
               src={document.fileUrl}
               controls
               sx={{
                  display: 'block',
                  width: '100%',
                  maxHeight: '75vh',
               }}
            />
         </Box>
      );
   }

   return (
      <PreviewFallback text={t("common.filePreview.unsupported")} />
   );
}

function PreviewFallback({ text }) {
   return (
      <Box
         sx={{
            minHeight: 260,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'grey.50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            p: 3,
         }}
      >
         <Typography color='text.secondary' sx={{ fontSize: 14 }}>
            {text}
         </Typography>
      </Box>
   );
}

function TenderDocumentPreviewDialog({ document, onClose }) {
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

            <TenderDocumentPreview document={document} />
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

function TenderDocumentCard({ document, onOpen }) {
   const { t } = useTranslation();

   return (
      <Box
         component='button'
         type='button'
         onClick={() => onOpen(document)}
         sx={{
            p: 1.5,
            width: '100%',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            backgroundColor: 'grey.50',
            textAlign: 'left',
            color: 'inherit',
            cursor: 'pointer',
            transition: '0.2s ease',
            font: 'inherit',
            '&:hover': {
               borderColor: 'primary.light',
               backgroundColor: 'rgba(33, 150, 243, 0.04)',
            },
         }}
      >
         <Box
            sx={{
               width: 42,
               height: 42,
               borderRadius: 2,
               backgroundColor: 'primary.main',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               flexShrink: 0,
            }}
         >
            <InsertDriveFileOutlinedIcon
               sx={{
                  color: 'common.white',
                  fontSize: 24,
               }}
            />
         </Box>

         <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
               sx={{
                  fontSize: 13,
                  fontWeight: 500,
                  lineHeight: 1.35,
               }}
            >
               {document.name || t("common.fields.document")}
            </Typography>

            <Typography
               color='text.secondary'
               sx={{
                  mt: 0.25,
                  fontSize: 12,
                  lineHeight: 1.35,
               }}
            >
               {document.context || t("common.empty.descriptionNotSpecified")}
            </Typography>

            <Typography
               color='text.secondary'
               sx={{
                  mt: 0.5,
                  fontSize: 11,
                  lineHeight: 1.35,
                  wordBreak: 'break-word',
               }}
            >
               {document.fileName || t("common.fields.file")}
            </Typography>
         </Box>
      </Box>
   );
}

export function TenderDocumentsSection({ documents = [] }) {
   const { t } = useTranslation();

   const [selectedDocument, setSelectedDocument] = useState(null);

   return (
      <TenderDetailsSection
         icon={<DescriptionOutlinedIcon />}
         title={t("tenders.details.orderDocuments")}
      >
         {documents.length === 0 ? (
            <Typography color='text.secondary' fontSize={14}>
               {t("common.documents.empty")}
            </Typography>
         ) : (
            <Stack spacing={1}>
               {documents.map((document) => (
                  <TenderDocumentCard
                     key={document.id}
                     document={document}
                     onOpen={setSelectedDocument}
                  />
               ))}
            </Stack>
         )}

         <TenderDocumentPreviewDialog
            document={selectedDocument}
            onClose={() => setSelectedDocument(null)}
         />
      </TenderDetailsSection>
   );
}

TenderDocumentPreview.propTypes = {
   document: tenderDocumentPropType.isRequired,
};

PreviewFallback.propTypes = {
   text: PropTypes.string.isRequired,
};

TenderDocumentPreviewDialog.propTypes = {
   document: tenderDocumentPropType,
   onClose: PropTypes.func.isRequired,
};

TenderDocumentCard.propTypes = {
   document: tenderDocumentPropType.isRequired,
   onOpen: PropTypes.func.isRequired,
};

TenderDocumentsSection.propTypes = {
   documents: PropTypes.arrayOf(tenderDocumentPropType),
};
