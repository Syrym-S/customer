import PropTypes from 'prop-types';
import { Box, Stack, Typography } from '@mui/material';

import { StatusDot } from '../../../shared/ui/StatusDot';
import { formatDate } from '../../customer-factorings/model/factorings.helpers';
import {
   getComplaintResponseLabel,
   getComplaintStatusColor,
   getComplaintStatusLabel,
   getComplaintTargetLabel,
   getComplaintTargetTypeLabel,
} from '../model/complaints.helpers';

function truncate(text, maxLength = 140) {
   if (!text || text.length <= maxLength) {
      return text || '';
   }

   return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function ComplaintCard({ complaint, onOpen }) {
   const targetLabel = getComplaintTargetLabel(complaint.target);
   const targetTypeLabel = getComplaintTargetTypeLabel(complaint.target);

   return (
      <Box
         onClick={() => onOpen(complaint)}
         role="button"
         tabIndex={0}
         sx={{
            p: { xs: 2, sm: 2.5 },
            border: '2px solid',
            borderColor: 'divider',
            borderRadius: 4,
            backgroundColor: 'background.paper',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            transition: '0.2s ease',
            cursor: 'pointer',
            '&:hover': {
               borderColor: 'primary.light',
               boxShadow: '0 8px 24px rgba(33, 150, 243, 0.12)',
            },
         }}
      >
         <Stack spacing={1.25}>
            <Stack
               direction="row"
               justifyContent="space-between"
               alignItems="flex-start"
               spacing={2}
            >
               <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                  {truncate(complaint.request)}
               </Typography>

               <StatusDot
                  label={getComplaintStatusLabel(complaint)}
                  color={getComplaintStatusColor(complaint)}
                  sx={{ flexShrink: 0 }}
               />
            </Stack>

            {targetLabel && (
               <Typography fontSize={13} color="text.secondary">
                  {targetTypeLabel}: {targetLabel}
               </Typography>
            )}

            <Stack direction="row" justifyContent="space-between" alignItems="center">
               <Typography fontSize={12} color="text.secondary">
                  {formatDate(complaint.created_at)}
               </Typography>

               <Typography fontSize={12} fontWeight={600} color="text.secondary">
                  {getComplaintResponseLabel(complaint)}
               </Typography>
            </Stack>
         </Stack>
      </Box>
   );
}

ComplaintCard.propTypes = {
   complaint: PropTypes.shape({
      id: PropTypes.string.isRequired,
      request: PropTypes.string,
      created_at: PropTypes.string,
      final_status: PropTypes.oneOf(['completed', 'rejected', null]),
      response: PropTypes.string,
      target: PropTypes.object,
   }).isRequired,
   onOpen: PropTypes.func.isRequired,
};
