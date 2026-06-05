import PropTypes from 'prop-types';

import { Box } from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';

import { DetailSection } from '../components/DetailSection';
import { InfoBadge } from '../components/InfoBadge';

export function LeadForwarderSection({ lead }) {
   const forwarder = lead.forwarder;

   return (
      <DetailSection icon={<BusinessOutlinedIcon />} title='Экспедитор'>
         <Box
            sx={{
               display: 'grid',
               gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
               },
               gap: 1,
            }}
         >
            <InfoBadge label='ФИО' value={forwarder?.fullName || 'Не указан'} />

            <InfoBadge
               label='Компания'
               value={forwarder?.companyName || 'Не указано'}
            />

            <InfoBadge
               label='БИН'
               value={forwarder?.companyBin || 'Не указан'}
            />

            <InfoBadge
               label='Телефон'
               value={forwarder?.phone || 'Не указан'}
            />
         </Box>
      </DetailSection>
   );
}

LeadForwarderSection.propTypes = {
   lead: PropTypes.shape({
      forwarder: PropTypes.shape({
         fullName: PropTypes.string,
         companyName: PropTypes.string,
         companyBin: PropTypes.string,
         phone: PropTypes.string,
      }),
   }).isRequired,
};
