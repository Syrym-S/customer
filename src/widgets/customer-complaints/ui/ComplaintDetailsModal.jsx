import {
   Dialog,
   DialogContent,
   DialogTitle,
   Stack,
   Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

import { DialogCloseButton } from '../../../shared/ui/DialogCloseButton';
import { StatusDot } from '../../../shared/ui/StatusDot';
import { useComplaintsContext } from '../model/useComplaintsContext';
import {
   getComplaintStatusColor,
   getComplaintStatusLabel,
} from '../model/complaints.helpers';
import { ComplaintRequestSection } from './complaints-details/sections/ComplaintRequestSection';
import { ComplaintTargetSection } from './complaints-details/sections/ComplaintTargetSection';
import { ComplaintResponseSection } from './complaints-details/sections/ComplaintResponseSection';
import { ComplaintFilesSection } from './complaints-details/sections/ComplaintFilesSection';

export function ComplaintDetailsModal() {
   const navigate = useNavigate();
   const { complaintId } = useParams();
   const { openComplaint, setOpenComplaint } = useComplaintsContext();

   function handleClose() {
      setOpenComplaint(null);

      if (complaintId) {
         navigate('/customer/complaints', { replace: true });
      }
   }

   if (!openComplaint) {
      return null;
   }

   return (
      <Dialog
         open={Boolean(openComplaint)}
         onClose={handleClose}
         fullWidth
         maxWidth="md"
         slotProps={{
            paper: {
               sx: { borderRadius: 4, position: 'relative' },
            },
         }}
      >
         <DialogCloseButton onClick={handleClose} />

         <DialogTitle sx={{ pl: 3, pr: 7, pt: 3, pb: 1.5 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
               <Typography
                  sx={{
                     fontSize: { xs: '18px', sm: '20px' },
                     fontWeight: 600,
                     lineHeight: 1.3,
                  }}
               >
                  Жалоба
               </Typography>

               <StatusDot
                  label={getComplaintStatusLabel(openComplaint)}
                  color={getComplaintStatusColor(openComplaint)}
               />
            </Stack>
         </DialogTitle>

         <DialogContent sx={{ px: 3 }}>
            <Stack spacing={2.5}>
               <ComplaintRequestSection request={openComplaint.request} />
               <ComplaintTargetSection target={openComplaint.target} />
               <ComplaintResponseSection complaint={openComplaint} />
               <ComplaintFilesSection files={openComplaint.files} />
            </Stack>
         </DialogContent>
      </Dialog>
   );
}
