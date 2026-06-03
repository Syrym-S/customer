import { TextField } from '@mui/material';
import PropTypes from 'prop-types';

import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

import { DetailSection } from '../components/DetailSection';
import { InfoBadge } from '../components/InfoBadge';

export function LeadDriverSection({ lead, isEditing, editForm, onEditChange }) {
   return (
      <DetailSection icon={<PersonOutlineOutlinedIcon />} title='Водитель'>
         {isEditing ? (
            <TextField
               name='driver'
               label='ФИО'
               value={editForm.driver}
               onChange={onEditChange}
               fullWidth
               size='small'
            />
         ) : (
            <InfoBadge label='ФИО' value={lead.driver} fullWidth />
         )}
      </DetailSection>
   );
}

LeadDriverSection.propTypes = {
   lead: PropTypes.object.isRequired,
   isEditing: PropTypes.bool.isRequired,
   editForm: PropTypes.object.isRequired,
   onEditChange: PropTypes.func.isRequired,
};
