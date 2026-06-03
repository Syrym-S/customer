import { TextField } from '@mui/material';
import PropTypes from 'prop-types';

import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';

import { DetailSection } from '../components/DetailSection';
import { InfoBadge } from '../components/InfoBadge';

export function LeadCustomerSection({
   lead,
   isEditing,
   editForm,
   onEditChange,
}) {
   return (
      <DetailSection icon={<BusinessOutlinedIcon />} title='Заказчик'>
         {isEditing ? (
            <TextField
               name='customer'
               label='Название'
               value={editForm.customer}
               onChange={onEditChange}
               fullWidth
               size='small'
            />
         ) : (
            <InfoBadge label='Название' value={lead.customer} fullWidth />
         )}
      </DetailSection>
   );
}

LeadCustomerSection.propTypes = {
   lead: PropTypes.object.isRequired,
   isEditing: PropTypes.bool.isRequired,
   editForm: PropTypes.object.isRequired,
   onEditChange: PropTypes.func.isRequired,
};
