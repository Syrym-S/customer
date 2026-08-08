import PropTypes from 'prop-types';

import { Box, Typography } from '@mui/material';

function isPdfDocument(document) {
   const fileType = document?.fileType || '';
   const fileName = document?.fileName || '';

   return (
      fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')
   );
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

export function DocumentPreview({ document }) {
   if (!document) {
      return null;
   }

   if (!hasPreviewUrl(document)) {
      return (
         <PreviewFallback text='Для этого mock-документа нет файла для предпросмотра' />
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
               alt={document.name || document.fileName || 'Документ'}
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
      <PreviewFallback text='Предпросмотр для этого типа файла пока не поддерживается' />
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

const documentPropType = PropTypes.shape({
   name: PropTypes.string,
   context: PropTypes.string,
   fileName: PropTypes.string,
   fileUrl: PropTypes.string,
   fileType: PropTypes.string,
});

DocumentPreview.propTypes = {
   document: documentPropType,
};

PreviewFallback.propTypes = {
   text: PropTypes.string.isRequired,
};
