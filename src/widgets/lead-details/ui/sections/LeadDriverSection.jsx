
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

import { DetailSection } from '../../../../shared/ui/DetailSection';
import { InfoBadge } from '../components/InfoBadge';
import { normalizePersonValue } from '../../../../features/edit-lead/model/lead-edit-form.helpers';

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

