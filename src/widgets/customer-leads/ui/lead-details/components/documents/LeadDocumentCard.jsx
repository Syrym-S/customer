import PropTypes from 'prop-types';

import { Box, IconButton, Typography } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

export function LeadDocumentCard({ document, onOpen, onDelete }) {
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
            justifyContent: 'space-between',
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

         <Box
            sx={{
               display: 'flex',
               gap: 0.5,
               flexShrink: 0,
            }}
            onClick={(event) => {
               event.preventDefault();
               event.stopPropagation();
            }}
         >
            <IconButton
               size='small'
               color='error'
               onClick={() => onDelete(document.id)}
            >
               <DeleteOutlineOutlinedIcon fontSize='small' />
            </IconButton>
         </Box>
      </Box>
   );
}

LeadDocumentCard.propTypes = {
   document: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      context: PropTypes.string,
      fileName: PropTypes.string,
      fileUrl: PropTypes.string,
      fileType: PropTypes.string,
   }).isRequired,
   onOpen: PropTypes.func.isRequired,
   onDelete: PropTypes.func.isRequired,
};
