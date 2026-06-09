import PropTypes from 'prop-types';

import {
   Box,
   Button,
   IconButton,
   Stack,
   TextField,
   Typography,
} from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';

import { StepSection } from '../components/StepSection';
import { useState } from 'react';

function createLocalDocument({ name, context, file }) {
   return {
      id: `create-doc-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: name || file.name,
      context: context || '',
      file,
      fileName: file.name,
      fileType: file.type,
      fileUrl: URL.createObjectURL(file),
   };
}

export function DocumentsStep({ form, setValue }) {
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

      const document = createLocalDocument({
         name: formData.get('name'),
         context: formData.get('context'),
         file,
      });

      setValue('documents', [...(form.documents || []), document], {
         shouldDirty: true,
         shouldValidate: true,
      });

      setSelectedFileName('');
      event.currentTarget.reset();
   }

   function handleDeleteDocument(documentId) {
      setValue(
         'documents',
         (form.documents || []).filter(
            (document) => document.id !== documentId,
         ),
         {
            shouldDirty: true,
            shouldValidate: true,
         },
      );
   }

   return (
      <Box sx={{ display: 'grid', gap: 2 }}>
         <StepSection title='Документы'>
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

               {form.documents?.length ? (
                  <Stack spacing={1}>
                     {form.documents.map((document) => (
                        <Box
                           key={document.id}
                           sx={{
                              p: 1.5,
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 2,
                              backgroundColor: 'grey.50',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 1.5,
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

                           <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                 sx={{
                                    fontSize: 13,
                                    fontWeight: 400,
                                    lineHeight: 1.35,
                                 }}
                              >
                                 {document.name || 'Документ'}
                              </Typography>

                              <Typography
                                 color='text.secondary'
                                 sx={{
                                    mt: 0.25,
                                    fontSize: 12,
                                    fontWeight: 400,
                                    lineHeight: 1.35,
                                 }}
                              >
                                 {document.context || 'Описание не указано'}
                              </Typography>

                              <Typography
                                 color='text.secondary'
                                 sx={{
                                    mt: 0.5,
                                    fontSize: 11,
                                    fontWeight: 400,
                                    lineHeight: 1.35,
                                    wordBreak: 'break-word',
                                 }}
                              >
                                 {document.fileName || 'Файл'}
                              </Typography>
                           </Box>

                           <IconButton
                              size='small'
                              color='error'
                              onClick={() => handleDeleteDocument(document.id)}
                           >
                              <DeleteOutlineOutlinedIcon fontSize='small' />
                           </IconButton>
                        </Box>
                     ))}
                  </Stack>
               ) : (
                  <Typography
                     color='text.secondary'
                     sx={{
                        fontSize: 12,
                        color: 'grey.600',
                     }}
                  >
                     Документы не добавлены
                  </Typography>
               )}
            </Stack>
         </StepSection>
      </Box>
   );
}

DocumentsStep.propTypes = {
   form: PropTypes.shape({
      documents: PropTypes.array,
   }).isRequired,
   setValue: PropTypes.func.isRequired,
};
