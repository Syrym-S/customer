import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Link, Stack, Typography } from '@mui/material';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import PictureAsPdfOutlined from '@mui/icons-material/PictureAsPdfOutlined';
import VideocamOutlined from '@mui/icons-material/VideocamOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import DownloadOutlined from '@mui/icons-material/DownloadOutlined';

import {
   formatFileSize,
   isPreviewableImage,
   isPreviewableVideo,
} from '../../../model/complaints.helpers';

function getFileTypeIcon(mimeType) {
   if (mimeType?.startsWith('image/')) {
      return <ImageOutlined fontSize="small" />;
   }

   if (mimeType?.startsWith('video/')) {
      return <VideocamOutlined fontSize="small" />;
   }

   if (mimeType === 'application/pdf') {
      return <PictureAsPdfOutlined fontSize="small" />;
   }

   return <DescriptionOutlined fontSize="small" />;
}

// Already-uploaded files are served from a real URL (not a local File), so
// there's no object URL to create/revoke here — "lazy" just means the
// <img>/<video> element itself isn't mounted until the user asks for it,
// same restraint as ComplaintAttachmentsField applies to pending uploads.
function FileRow({ file }) {
   const [isPreviewOpen, setIsPreviewOpen] = useState(false);

   const canPreview =
      isPreviewableImage(file.mime_type, file.size) ||
      isPreviewableVideo(file.mime_type);

   return (
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.25 }}>
         <Stack direction="row" alignItems="center" spacing={1.25}>
            {getFileTypeIcon(file.mime_type)}

            <Box sx={{ minWidth: 0, flex: 1 }}>
               <Typography noWrap fontSize={13} fontWeight={600}>
                  {file.filename}
               </Typography>

               <Typography fontSize={12} color="text.secondary">
                  {formatFileSize(file.size)}
               </Typography>
            </Box>

            {canPreview && (
               <IconButton
                  size="small"
                  onClick={() => setIsPreviewOpen((prev) => !prev)}
                  aria-label="Предпросмотр"
               >
                  <VisibilityOutlined fontSize="small" />
               </IconButton>
            )}

            <IconButton
               size="small"
               component={Link}
               href={file.url}
               download={file.filename}
               aria-label="Скачать"
            >
               <DownloadOutlined fontSize="small" />
            </IconButton>
         </Stack>

         {isPreviewOpen && file.mime_type?.startsWith('image/') && (
            <Box
               component="img"
               src={file.url}
               alt={file.filename}
               sx={{ mt: 1, maxWidth: '100%', maxHeight: 220, borderRadius: 1 }}
            />
         )}

         {isPreviewOpen && file.mime_type?.startsWith('video/') && (
            <Box
               component="video"
               src={file.url}
               controls
               sx={{ mt: 1, maxWidth: '100%', maxHeight: 220, borderRadius: 1 }}
            />
         )}
      </Box>
   );
}

FileRow.propTypes = {
   file: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      url: PropTypes.string,
      filename: PropTypes.string,
      mime_type: PropTypes.string,
      size: PropTypes.number,
   }).isRequired,
};

export function ComplaintFilesSection({ files }) {
   if (!files || files.length === 0) {
      return null;
   }

   return (
      <Box>
         <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.75 }}>
            Файлы
         </Typography>

         <Stack spacing={1}>
            {files.map((file) => (
               <FileRow key={file.id} file={file} />
            ))}
         </Stack>
      </Box>
   );
}

ComplaintFilesSection.propTypes = {
   files: PropTypes.array,
};
