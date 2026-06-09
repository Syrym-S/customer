import { useState } from 'react';
import PropTypes from 'prop-types';

import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';

import { DetailSection } from '../components/DetailSection';
import { LeadDocumentCard } from '../components/documents/LeadDocumentCard';
import { DocumentPreviewDialog } from '../components/documents/DocumentPreviewDialog';

export function LeadDocumentsSection({
   documents,
   onAddDocument,
   onDeleteDocument,
}) {
   const [selectedDocument, setSelectedDocument] = useState(null);
   const [selectedFileName, setSelectedFileName] = useState('');

   function handleFileChange(event) {
      const file = event.target.files?.[0];

      setSelectedFileName(file?.name || '');
   }

   function handleSubmit(event) {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);
      const file = formData.get('file');

      if (!file || !file.name) {
         return;
      }

      onAddDocument({
         name: formData.get('name'),
         context: formData.get('context'),
         file,
      });

      setSelectedFileName('');
      event.currentTarget.reset();
   }

   return (
      <DetailSection icon={<DescriptionOutlinedIcon />} title='Документы'>
         <Stack spacing={2}>
            <Box
               component='form'
               onSubmit={handleSubmit}
               sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                     xs: '1fr',
                     md: '1fr 1fr auto',
                  },
                  gap: 1,
                  alignItems: 'flex-start',
               }}
            >
               <TextField
                  name='name'
                  label='Название документа'
                  size='small'
                  fullWidth
               />

               <TextField
                  name='context'
                  label='Описание'
                  size='small'
                  fullWidth
               />

               <Box>
                  <Button
                     component='label'
                     variant={selectedFileName ? 'contained' : 'outlined'}
                     startIcon={<UploadFileOutlinedIcon />}
                     sx={{
                        minHeight: 40,
                        width: {
                           xs: '100%',
                           md: 'auto',
                        },
                     }}
                  >
                     {selectedFileName ? 'Файл выбран' : 'Файл'}

                     <input
                        name='file'
                        type='file'
                        hidden
                        onChange={handleFileChange}
                     />
                  </Button>

                  {selectedFileName && (
                     <Typography
                        sx={{
                           mt: 0.5,
                           fontSize: 11,
                           lineHeight: 1.3,
                           color: 'text.secondary',
                           maxWidth: {
                              xs: '100%',
                              md: 180,
                           },
                           overflow: 'hidden',
                           textOverflow: 'ellipsis',
                           whiteSpace: 'nowrap',
                        }}
                        title={selectedFileName}
                     >
                        {selectedFileName}
                     </Typography>
                  )}
               </Box>

               <Button
                  type='submit'
                  variant='contained'
                  sx={{
                     gridColumn: {
                        xs: '1',
                        md: '1 / -1',
                     },
                     justifySelf: 'flex-start',
                  }}
               >
                  Добавить документ
               </Button>
            </Box>

            {documents.length === 0 ? (
               <Typography color='text.secondary' fontSize={14}>
                  Документы не добавлены
               </Typography>
            ) : (
               <Stack spacing={1}>
                  {documents.map((document) => (
                     <LeadDocumentCard
                        key={document.id}
                        document={document}
                        onOpen={setSelectedDocument}
                        onDelete={onDeleteDocument}
                     />
                  ))}
               </Stack>
            )}
         </Stack>

         <DocumentPreviewDialog
            document={selectedDocument}
            onClose={() => setSelectedDocument(null)}
         />
      </DetailSection>
   );
}

LeadDocumentsSection.propTypes = {
   documents: PropTypes.arrayOf(
      PropTypes.shape({
         id: PropTypes.string.isRequired,
         name: PropTypes.string,
         context: PropTypes.string,
         fileName: PropTypes.string,
         fileUrl: PropTypes.string,
         fileType: PropTypes.string,
      }),
   ).isRequired,
   onAddDocument: PropTypes.func.isRequired,
   onDeleteDocument: PropTypes.func.isRequired,
};
