import PropTypes from 'prop-types';
import { Box, Link, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import {
   getComplaintTargetLabel,
   getComplaintTargetTypeLabel,
} from '../../../model/complaints.helpers';

export function ComplaintTargetSection({ target }) {
   const navigate = useNavigate();

   if (!target) {
      return null;
   }

   const label = getComplaintTargetLabel(target);
   const typeLabel = getComplaintTargetTypeLabel(target);

   function handleOpenTarget() {
      if (target.type === 'lead') {
         navigate(`/customer/leads/${target.id}`);
         return;
      }

      navigate(`/customer/factorings/${target.id}`);
   }

   return (
      <Box>
         <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.75 }}>
            {typeLabel}
         </Typography>

         <Link component="button" onClick={handleOpenTarget} sx={{ fontWeight: 600 }}>
            {label}
         </Link>
      </Box>
   );
}

ComplaintTargetSection.propTypes = {
   target: PropTypes.shape({
      type: PropTypes.oneOf(['lead', 'factoring']),
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   }),
};
