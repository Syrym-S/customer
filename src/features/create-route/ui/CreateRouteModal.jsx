import {
   Box,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

export function CreateRouteModal({ open, onClose }) {
   return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
         <DialogTitle>Создание маршрута</DialogTitle>

         <DialogContent>
            <Box
               sx={{
                  minHeight: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
               }}
            >
               <Typography color='text.secondary'>Create route</Typography>
            </Box>
         </DialogContent>

         <DialogActions>
            <Button onClick={onClose}>Закрыть</Button>
         </DialogActions>
      </Dialog>
   );
}

CreateRouteModal.propTypes = {
   open: PropTypes.bool.isRequired,
   onClose: PropTypes.func.isRequired,
};
