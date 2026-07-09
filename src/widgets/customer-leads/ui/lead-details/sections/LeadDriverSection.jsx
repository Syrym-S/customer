import PropTypes from 'prop-types';

import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

import { DetailSection } from '../components/DetailSection';
import { InfoBadge } from '../components/InfoBadge';
import { normalizePersonValue } from '../../../model/lead-edit-form.helpers';

export function LeadDriverSection({ lead }) {
   return (
      <DetailSection icon={<PersonOutlineOutlinedIcon />} title='Водитель'>
         <InfoBadge
            label='ФИО'
            value={normalizePersonValue(lead.driver)}
            fullWidth
         />
      </DetailSection>
   );
}

LeadDriverSection.propTypes = {
   lead: PropTypes.object.isRequired,
   isEditing: PropTypes.bool.isRequired,
   editForm: PropTypes.object.isRequired,
   onEditChange: PropTypes.func.isRequired,
};
