import { Box, MenuItem, TextField } from '@mui/material';
import { useTranslation } from "react-i18next";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { TenderDetailsSection } from './TenderDetailsSection';
import { TenderInfoBadge } from './TenderInfoBadge';
import {
   tenderEditFormPropType,
   tenderPropType,
} from '../../../model/tenders.prop-types';
import { getPublicationTypeLabel } from '../../../model/tender.helpers';
import PropTypes from 'prop-types';

const TENDER_TYPE_LABEL_KEYS = {
   forwarder: 'tenders.details.audienceForwarders',
   shipper: 'tenders.details.audienceShippers',
};

export function TenderInfoSection({
   tender,
   isEditing = false,
   editForm,
   onEditChange,
}) {
   const { t } = useTranslation();

   return (
      <TenderDetailsSection
         icon={<InfoOutlinedIcon />}
         title={t("tenders.details.info")}
      >
         {isEditing ? (
            <Box
               sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                     xs: '1fr',
                     md: 'repeat(2, 1fr)',
                  },
                  gap: 1.5,
               }}
            >
               <TextField
                  label={t("tenders.create.name")}
                  placeholder={t("tenders.create.namePlaceholder")}
                  value={editForm?.name || ''}
                  onChange={(event) => onEditChange('name', event.target.value)}
                  fullWidth
                  size='small'
                  sx={{
                     gridColumn: {
                        md: '1 / -1',
                     },
                  }}
               />

               <TextField
                  label={t("common.fields.endDate")}
                  type='datetime-local'
                  value={editForm?.endDateTime || ''}
                  onChange={(event) =>
                     onEditChange('endDateTime', event.target.value)
                  }
                  fullWidth
                  size='small'
                  slotProps={{
                     inputLabel: {
                        shrink: true,
                     },
                  }}
               />

               <TextField
                  select
                  label={t("tenders.details.publicationType")}
                  value={editForm?.publicationType || 'public'}
                  onChange={(event) =>
                     onEditChange('publicationType', event.target.value)
                  }
                  fullWidth
                  size='small'
               >
                  <MenuItem value='public'>{t("enums.publicationType.public")}</MenuItem>
                  <MenuItem value='private'>{t("enums.publicationType.private")}</MenuItem>
               </TextField>

               {(editForm?.publicationType || 'public') === 'public' && (
                  <TextField
                     label={t("tenders.details.maxParticipantsShort")}
                     type='number'
                     value={editForm?.maxParticipants ?? 0}
                     onChange={(event) =>
                        onEditChange('maxParticipants', event.target.value)
                     }
                     fullWidth
                     size='small'
                     slotProps={{
                        htmlInput: {
                           min: 0,
                        },
                     }}
                  />
               )}
            </Box>
         ) : (
            <Box
               sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                     xs: '1fr',
                     md: 'repeat(3, 1fr)',
                  },
                  gap: 1,
               }}
            >
               <TenderInfoBadge
                  label={t("common.fields.name")}
                  value={tender.name || t("common.empty.notSpecifiedN")}
                  sx={{
                     gridColumn: {
                        md: '1 / -1',
                     },
                  }}
               />

               <TenderInfoBadge
                  label={t("tenders.details.audience")}
                  value={
                     TENDER_TYPE_LABEL_KEYS[tender.type]
                        ? t(TENDER_TYPE_LABEL_KEYS[tender.type])
                        : t("common.empty.notSpecifiedN")
                  }
               />

               <TenderInfoBadge
                  label={t("tenders.details.publicationType")}
                  value={
                     getPublicationTypeLabel(tender.publication_type) ||
                     t("common.empty.notSpecifiedN")
                  }
               />

               <TenderInfoBadge
                  label={t("tenders.details.maxParticipantsShort")}
                  value={
                     tender.max_participants === 0
                        ? t("common.empty.unlimited")
                        : tender.max_participants || t("common.empty.notSpecifiedN")
                  }
               />

               <TenderInfoBadge
                  label={t("tenders.details.participantsCountLabel")}
                  value={tender.participants_count ?? 0}
               />

               <TenderInfoBadge label={t("tenders.details.bidsCountLabel")} value={tender.bets_count ?? 0} />
            </Box>
         )}
      </TenderDetailsSection>
   );
}

TenderInfoSection.propTypes = {
   tender: tenderPropType.isRequired,
   isEditing: PropTypes.bool,
   editForm: tenderEditFormPropType,
   onEditChange: PropTypes.func,
};
