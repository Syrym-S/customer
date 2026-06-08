import PropTypes from 'prop-types';
import {
   Box,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   Typography,
} from '@mui/material';

const modalStyles = {
   success: {
      borderColor: '#66bb6a',
      backgroundColor: '#f1f8e9',
      titleColor: '#2e7d32',
   },
   error: {
      borderColor: '#ef5350',
      backgroundColor: '#ffebee',
      titleColor: '#c62828',
   },
};

export function CreateLeadResultModal({ open, type, title, message, onClose }) {
   const styles = modalStyles[type] ?? modalStyles.success;

   return (
      <Dialog
         open={open}
         onClose={onClose}
         maxWidth='xs'
         fullWidth
         slotProps={{
            paper: {
               sx: {
                  borderRadius: 4,
                  border: '2px solid',
                  borderColor: styles.borderColor,
                  backgroundColor: styles.backgroundColor,
               },
            },
         }}
      >
         <DialogContent>
            <Box
               sx={{
                  textAlign: 'center',
                  py: 2,
               }}
            >
               <Typography
                  variant='h6'
                  sx={{
                     color: styles.titleColor,
                     fontWeight: 700,
                     mb: 1,
                  }}
               >
                  {title}
               </Typography>

               <Typography color='text.secondary'>{message}</Typography>
            </Box>
         </DialogContent>

         <DialogActions
            sx={{
               justifyContent: 'center',
               pb: 2.5,
            }}
         >
            <Button
               variant='contained'
               onClick={onClose}
               color={type === 'error' ? 'error' : 'success'}
            >
               Понятно
            </Button>
         </DialogActions>
      </Dialog>
   );
}

CreateLeadResultModal.propTypes = {
   open: PropTypes.bool.isRequired,
   type: PropTypes.oneOf(['success', 'error']),
   title: PropTypes.string.isRequired,
   message: PropTypes.string.isRequired,
   onClose: PropTypes.func.isRequired,
};
