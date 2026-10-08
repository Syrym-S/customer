import PropTypes from 'prop-types';
import { Box } from '@mui/material';

import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

import { DetailSection } from '../components/DetailSection';
import { InfoBadge } from '../components/InfoBadge';
import { normalizePersonValue } from '../../../model/lead-edit-form.helpers';

function getDriverFields(driver) {
   if (!driver || typeof driver !== 'object') {
      return [];
   }

   return [
      { label: 'ФИО', value: driver.fio || driver.fullName || driver.name },
      { label: 'Телефон', value: driver.phone },
      { label: 'Email', value: driver.email },
   ].filter(({ value }) => typeof value === 'string' && value.trim());
}

export function LeadDriverSection({ lead }) {
   const driverFields = getDriverFields(lead.raw?.driver ?? lead.driver);

   return (
      <DetailSection icon={<PersonOutlineOutlinedIcon />} title='Водитель'>
         {driverFields.length > 0 ? (
            <Box
               sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                     xs: '1fr',
                     sm: 'repeat(2, 1fr)',
                     md: 'repeat(3, 1fr)',
                  },
                  gap: 1,
               }}
            >
               {driverFields.map(({ label, value }) => (
                  <InfoBadge
                     key={label}
                     label={label}
                     value={value}
                     sx={{ wordBreak: 'break-word' }}
                  />
               ))}
            </Box>
         ) : (
            <InfoBadge
               label='ФИО'
               value={normalizePersonValue(lead.driver)}
               fullWidth
            />
         )}
      </DetailSection>
   );
}

LeadDriverSection.propTypes = {
   lead: PropTypes.object.isRequired,
   isEditing: PropTypes.bool,
   editForm: PropTypes.object,
   onEditChange: PropTypes.func,
};
