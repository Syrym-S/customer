import PropTypes from 'prop-types';

import {
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Typography,
} from '@mui/material';

import { DocumentPreview } from './DocumentPreview';

export function DocumentPreviewDialog({ document, onClose }) {
   return (
      <Dialog
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
         <DialogTitle>{document?.name || 'Документ'}</DialogTitle>

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
               {document?.context || 'Описание не указано'}
            </Typography>

            <DocumentPreview document={document} />
         </DialogContent>

         <DialogActions sx={{ px: 3, pb: 2 }}>
            {document?.fileUrl && document.fileUrl !== '#' && (
               <>
                  <Button
                     component='a'
                     href={document.fileUrl}
                     target='_blank'
                     rel='noreferrer'
                  >
                     Открыть в новой вкладке
                  </Button>
                  <Button
                     component='a'
                     href={document.fileUrl}
                     download={document.fileName || document.name || true}
                  >
                     Скачать
                  </Button>
               </>
            )}

            <Button onClick={onClose}>Закрыть</Button>
         </DialogActions>
      </Dialog>
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
