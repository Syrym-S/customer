import { TextField } from '@mui/material';
import { useTranslation } from "react-i18next";
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
   const { t } = useTranslation();

   return (
      <DetailSection icon={<BusinessOutlinedIcon />} title={t("common.fields.customer")}>
         {isEditing ? (
            <TextField
               name='customer'
               label={t("common.fields.name")}
               value={editForm.customer}
               onChange={onEditChange}
               fullWidth
               size='small'
            />
         ) : (
            <InfoBadge label={t("common.fields.name")} value={lead.customer} fullWidth />
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
