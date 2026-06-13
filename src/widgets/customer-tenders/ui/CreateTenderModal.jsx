import {
   Alert,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
} from '@mui/material';
import PropTypes from 'prop-types';

export function CreateTenderModal({ open, onClose }) {
   return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
         <DialogTitle>Создание тендера</DialogTitle>

         <DialogContent>
            <Alert severity='info'>Форма создания тендера</Alert>
         </DialogContent>

         <DialogActions>
            <Button onClick={onClose}>Закрыть</Button>
         </DialogActions>
      </Dialog>
   );
}

CreateTenderModal.propTypes = {
   open: PropTypes.bool.isRequired,
   onClose: PropTypes.func.isRequired,
};
