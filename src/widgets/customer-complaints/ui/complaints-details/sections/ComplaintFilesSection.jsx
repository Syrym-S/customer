import { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';
import { Box, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import PictureAsPdfOutlined from '@mui/icons-material/PictureAsPdfOutlined';
import VideocamOutlined from '@mui/icons-material/VideocamOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import DownloadOutlined from '@mui/icons-material/DownloadOutlined';

import {
   isImageFileName,
   isPreviewableImageByName,
   isPreviewableVideoByName,
   isVideoFileName,
} from '../../../model/complaints.helpers';
import { fetchComplaintFileApi } from '../../../api/complaints.api';
import { saveBlobAsFile } from '../../../../../shared/lib/download-file';
import { notifyError } from '../../../../../shared/model/notifications.store';

function getFileTypeIcon(name) {
   if (isImageFileName(name)) {
      return <ImageOutlined fontSize="small" />;
   }

   if (isVideoFileName(name)) {
      return <VideocamOutlined fontSize="small" />;
   }

   if (name?.toLowerCase().endsWith('.pdf')) {
      return <PictureAsPdfOutlined fontSize="small" />;
   }

   return <DescriptionOutlined fontSize="small" />;
}

// Already-uploaded files only ever come back as { index, name, url } — no
// mime type or size — so icon/preview eligibility goes off the file
// extension here, unlike ComplaintAttachmentsField's pending (local File)
// rows, which still have a real mime type to work with.
function FileRow({ complaintId, file }) {
   const { t } = useTranslation();

   const [isPreviewOpen, setIsPreviewOpen] = useState(false);
   const [isDownloading, setIsDownloading] = useState(false);
   const [previewUrl, setPreviewUrl] = useState('');

   const canPreview =
      isPreviewableImageByName(file.name) || isPreviewableVideoByName(file.name);

   async function loadFile() {
      return fetchComplaintFileApi(complaintId, file.index, file.name);
   }

   function reportFailure(error) {
      notifyError(
         error.response?.data?.message ||
            error.message ||
            t("common.actions.download"),
      );
   }

   async function handleDownload() {
      if (isDownloading) {
         return;
      }

      setIsDownloading(true);

      try {
         const { blob, fileName } = await loadFile();

         saveBlobAsFile(blob, fileName || file.name);
      } catch (error) {
         reportFailure(error);
      } finally {
         setIsDownloading(false);
      }
   }

   async function handleTogglePreview() {
      if (isPreviewOpen) {
         setIsPreviewOpen(false);
         return;
      }

      setIsPreviewOpen(true);

      if (previewUrl) {
         return;
      }

      try {
         const { blob } = await loadFile();

         setPreviewUrl(URL.createObjectURL(blob));
      } catch (error) {
         setIsPreviewOpen(false);
         reportFailure(error);
      }
   }

   useEffect(() => {
      return () => {
         if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
         }
      };
   }, [previewUrl]);

   return (
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.25 }}>
         <Stack direction="row" alignItems="center" spacing={1.25}>
            {getFileTypeIcon(file.name)}

            <Box sx={{ minWidth: 0, flex: 1 }}>
               <Typography noWrap fontSize={13} fontWeight={600}>
                  {file.name}
               </Typography>
            </Box>

            {canPreview && (
               <IconButton
                  size="small"
                  onClick={handleTogglePreview}
                  aria-label={t("common.actions.preview")}
               >
                  <VisibilityOutlined fontSize="small" />
               </IconButton>
            )}

            <IconButton
               size="small"
               onClick={handleDownload}
               disabled={isDownloading}
               aria-label={t("common.actions.download")}
            >
               {isDownloading ? (
                  <CircularProgress size={16} />
               ) : (
                  <DownloadOutlined fontSize="small" />
               )}
            </IconButton>
         </Stack>

         {isPreviewOpen && !previewUrl && (
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
               <CircularProgress size={20} />
            </Box>
         )}

         {isPreviewOpen && previewUrl && isImageFileName(file.name) && (
            <Box
               component="img"
               src={previewUrl}
               alt={file.name}
               sx={{ mt: 1, maxWidth: '100%', maxHeight: 220, borderRadius: 1 }}
            />
         )}

         {isPreviewOpen && previewUrl && isVideoFileName(file.name) && (
            <Box
               component="video"
               src={previewUrl}
               controls
               sx={{ mt: 1, maxWidth: '100%', maxHeight: 220, borderRadius: 1 }}
            />
         )}
      </Box>
   );
}

FileRow.propTypes = {
   complaintId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   file: PropTypes.shape({
      index: PropTypes.number,
      url: PropTypes.string,
      name: PropTypes.string,
   }).isRequired,
};

export function ComplaintFilesSection({ complaintId, files }) {
   const { t } = useTranslation();

   if (!files || files.length === 0) {
      return null;
   }

   return (
      <Box>
         <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.75 }}>
            {t("common.fields.files")}
         </Typography>

         <Stack spacing={1}>
            {files.map((file) => (
               <FileRow key={file.index} complaintId={complaintId} file={file} />
            ))}
         </Stack>
      </Box>
   );
}

ComplaintFilesSection.propTypes = {
   complaintId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   files: PropTypes.array,
};
