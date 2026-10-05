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
   isImageFileName,
   isPreviewableImageByName,
   isPreviewableVideoByName,
   isVideoFileName,
} from '../../../model/complaints.helpers';

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
function FileRow({ file }) {
   const [isPreviewOpen, setIsPreviewOpen] = useState(false);

   const canPreview =
      isPreviewableImageByName(file.name) || isPreviewableVideoByName(file.name);

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
               download={file.name}
               aria-label="Скачать"
            >
               <DownloadOutlined fontSize="small" />
            </IconButton>
         </Stack>

         {isPreviewOpen && isImageFileName(file.name) && (
            <Box
               component="img"
               src={file.url}
               alt={file.name}
               sx={{ mt: 1, maxWidth: '100%', maxHeight: 220, borderRadius: 1 }}
            />
         )}

         {isPreviewOpen && isVideoFileName(file.name) && (
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
      index: PropTypes.number,
      url: PropTypes.string,
      name: PropTypes.string,
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
               <FileRow key={file.index} file={file} />
            ))}
         </Stack>
      </Box>
   );
}

ComplaintFilesSection.propTypes = {
   files: PropTypes.array,
};
