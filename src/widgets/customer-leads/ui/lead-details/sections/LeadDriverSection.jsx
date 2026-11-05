import PropTypes from 'prop-types';
import i18n from '../../../../../shared/i18n';
import { useTranslation } from "react-i18next";
import { Box } from '@mui/material';

import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

import { DetailSection } from '../components/DetailSection';
import { InfoBadge } from '../components/InfoBadge';
import { normalizePersonValue } from '../../../model/lead-edit-form.helpers';
// import { TaxationRegimeInfo } from '../../../../../shared/kgd-taxation/ui/TaxationRegimeInfo';

function getDriverFields(driver, { hideDirectorFio } = {}) {
   if (!driver || typeof driver !== 'object') {
      return [];
   }

   return [
      { label: i18n.t("common.fields.fullName"), value: driver.fio || driver.fullName || driver.name },
      { label: i18n.t("common.fields.phone"), value: driver.phone },
      {
         label: i18n.t("common.fields.directorFio"),
         value: hideDirectorFio ? undefined : driver.director_fio,
      },
      { label: 'Email', value: driver.email },
   ].filter(({ value }) => typeof value === 'string' && value.trim());
}

export function LeadDriverSection({ lead, hideDirectorFio = false }) {
   const { t } = useTranslation();

   const driver = lead.raw?.driver ?? lead.driver;
   const driverFields = getDriverFields(driver, { hideDirectorFio });
   // const driverId = driver && typeof driver === 'object' ? driver.id : null;

   return (
      <DetailSection icon={<PersonOutlineOutlinedIcon />} title={t("common.fields.driver")}>
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
               label={t("common.fields.fullName")}
               value={normalizePersonValue(lead.driver)}
               fullWidth
            />
         )}

         {/* {driverId && (
            <Box sx={{ mt: 1 }}>
               <TaxationRegimeInfo role="driver" entityId={driverId} />
            </Box>
         )} */}
      </DetailSection>
   );
}

LeadDriverSection.propTypes = {
   lead: PropTypes.object.isRequired,
   hideDirectorFio: PropTypes.bool,
   isEditing: PropTypes.bool,
   editForm: PropTypes.object,
   onEditChange: PropTypes.func,
};
