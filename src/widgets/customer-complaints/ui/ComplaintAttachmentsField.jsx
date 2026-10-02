import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
   Alert,
   Box,
   Button,
   IconButton,
   Stack,
   Typography,
} from '@mui/material';
import AttachFileOutlined from '@mui/icons-material/AttachFileOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import VideocamOutlined from '@mui/icons-material/VideocamOutlined';
import PictureAsPdfOutlined from '@mui/icons-material/PictureAsPdfOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';

import {
   COMPLAINT_ATTACHMENT_MAX_COUNT,
   COMPLAINT_ATTACHMENT_MAX_SIZE_MB,
   formatFileSize,
   isPreviewableImage,
   isPreviewableVideo,
   validateComplaintAttachmentFile,
} from '../model/complaints.helpers';

function getFileTypeIcon(file) {
   if (file.type?.startsWith('image/')) {
      return <ImageOutlined fontSize="small" />;
   }

   if (file.type?.startsWith('video/')) {
      return <VideocamOutlined fontSize="small" />;
   }

   if (file.type === 'application/pdf') {
      return <PictureAsPdfOutlined fontSize="small" />;
   }

   return <DescriptionOutlined fontSize="small" />;
}

// Renders a pending (not-yet-uploaded) attachment row. Its object URL is
// created lazily — only once the user clicks "Просмотр" — and revoked as
// soon as the row unmounts/is removed, so selecting files never eagerly
// allocates blob URLs for large videos/images (per spec).
function PendingAttachmentRow({ attachment, onRemove }) {
   const [previewUrl, setPreviewUrl] = useState(null);
   const previewUrlRef = useRef(null);

   useEffect(() => {
      return () => {
         if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
         }
      };
   }, []);

   function handleTogglePreview() {
      if (previewUrl) {
         URL.revokeObjectURL(previewUrl);
         previewUrlRef.current = null;
         setPreviewUrl(null);
         return;
      }

      const url = URL.createObjectURL(attachment.file);

      previewUrlRef.current = url;
      setPreviewUrl(url);
   }

   const canPreview =
      isPreviewableImage(attachment.file.type, attachment.file.size) ||
      isPreviewableVideo(attachment.file.type);

   return (
      <Box
         sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 1.25,
         }}
      >
         <Stack direction="row" alignItems="center" spacing={1.25}>
            {getFileTypeIcon(attachment.file)}

            <Box sx={{ minWidth: 0, flex: 1 }}>
               <Typography noWrap fontSize={13} fontWeight={600}>
                  {attachment.file.name}
               </Typography>

               <Typography fontSize={12} color="text.secondary">
                  {formatFileSize(attachment.file.size)}
               </Typography>
            </Box>

            {canPreview && (
               <IconButton
                  size="small"
                  onClick={handleTogglePreview}
                  aria-label="Предпросмотр"
               >
                  <VisibilityOutlined fontSize="small" />
               </IconButton>
            )}

            <IconButton
               size="small"
               onClick={() => onRemove(attachment.id)}
               aria-label="Удалить файл"
            >
               <CloseOutlined fontSize="small" />
            </IconButton>
         </Stack>

         {previewUrl && attachment.file.type.startsWith('image/') && (
            <Box
               component="img"
               src={previewUrl}
               alt={attachment.file.name}
               sx={{ mt: 1, maxWidth: '100%', maxHeight: 220, borderRadius: 1 }}
            />
         )}

         {previewUrl && attachment.file.type.startsWith('video/') && (
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

PendingAttachmentRow.propTypes = {
   attachment: PropTypes.shape({
      id: PropTypes.string.isRequired,
      file: PropTypes.instanceOf(File).isRequired,
   }).isRequired,
   onRemove: PropTypes.func.isRequired,
};

let attachmentIdCounter = 0;

export function ComplaintAttachmentsField({ attachments, onChange }) {
   const [fieldError, setFieldError] = useState('');
   const inputRef = useRef(null);

   function handleFilesSelected(event) {
      const selectedFiles = Array.from(event.target.files || []);

      event.target.value = '';

      if (selectedFiles.length === 0) {
         return;
      }

      if (attachments.length + selectedFiles.length > COMPLAINT_ATTACHMENT_MAX_COUNT) {
         setFieldError(
            `Можно прикрепить не более ${COMPLAINT_ATTACHMENT_MAX_COUNT} файлов`,
         );
         return;
      }

      const nextAttachments = [...attachments];
      let firstError = '';

      for (const file of selectedFiles) {
         const validationError = validateComplaintAttachmentFile(file);

         if (validationError) {
            firstError = firstError || `${file.name}: ${validationError}`;
            continue;
         }

         attachmentIdCounter += 1;

         nextAttachments.push({
            id: `pending-attachment-${attachmentIdCounter}`,
            file,
         });
      }

      setFieldError(firstError);
      onChange(nextAttachments);
   }

   function handleRemove(attachmentId) {
      onChange(attachments.filter((item) => item.id !== attachmentId));
   }

   return (
      <Stack spacing={1.25}>
         <Box>
            <Button
               variant="outlined"
               size="small"
               component="label"
               startIcon={<AttachFileOutlined />}
               disabled={attachments.length >= COMPLAINT_ATTACHMENT_MAX_COUNT}
            >
               Прикрепить файлы
               <input
                  ref={inputRef}
                  type="file"
                  multiple
                  hidden
                  accept="image/*,video/*,application/pdf,.docx"
                  onChange={handleFilesSelected}
               />
            </Button>

            <Typography
               component="span"
               sx={{ ml: 1.5, fontSize: 12 }}
               color="text.secondary"
            >
               Не более {COMPLAINT_ATTACHMENT_MAX_COUNT} файлов, до{' '}
               {COMPLAINT_ATTACHMENT_MAX_SIZE_MB} МБ каждый
            </Typography>
         </Box>

         {fieldError && <Alert severity="error">{fieldError}</Alert>}

         {attachments.length > 0 && (
            <Stack spacing={1}>
               {attachments.map((attachment) => (
                  <PendingAttachmentRow
                     key={attachment.id}
                     attachment={attachment}
                     onRemove={handleRemove}
                  />
               ))}
            </Stack>
         )}
      </Stack>
   );
}

ComplaintAttachmentsField.propTypes = {
   attachments: PropTypes.arrayOf(
      PropTypes.shape({
         id: PropTypes.string.isRequired,
         file: PropTypes.instanceOf(File).isRequired,
      }),
   ).isRequired,
   onChange: PropTypes.func.isRequired,
};
