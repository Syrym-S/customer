import { Box, MenuItem, TextField } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { TenderDetailsSection } from './TenderDetailsSection';
import { TenderInfoBadge } from './TenderInfoBadge';
import {
   tenderEditFormPropType,
   tenderPropType,
} from '../../../model/tenders.prop-types';
import PropTypes from 'prop-types';

const tenderTypeLabels = {
   forwarder: 'Для экспедиторов',
   shipper: 'Для грузоотправителей',
};

const publicationTypeLabels = {
   public: 'Публичный',
   private: 'Приватный',
};

export function TenderInfoSection({
   tender,
   isEditing = false,
   editForm,
   onEditChange,
}) {
   return (
      <TenderDetailsSection
         icon={<InfoOutlinedIcon />}
         title='Информация о тендере'
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
                  label='Дата окончания'
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
                  label='Тип публикации'
                  value={editForm?.publicationType || 'public'}
                  onChange={(event) =>
                     onEditChange('publicationType', event.target.value)
                  }
                  fullWidth
                  size='small'
               >
                  <MenuItem value='public'>Публичный</MenuItem>
                  <MenuItem value='private'>Приватный</MenuItem>
               </TextField>

               {(editForm?.publicationType || 'public') === 'public' && (
                  <TextField
                     label='Макс. участников'
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
                     xs: '1fr 1fr',
                     md: 'repeat(3, 1fr)',
                  },
                  gap: 1,
               }}
            >
               <TenderInfoBadge
                  label='Для кого'
                  value={tenderTypeLabels[tender.type] || 'Не указано'}
               />

               <TenderInfoBadge
                  label='Тип публикации'
                  value={
                     publicationTypeLabels[tender.publication_type] ||
                     'Не указано'
                  }
               />

               <TenderInfoBadge
                  label='Макс. участников'
                  value={
                     tender.max_participants === 0
                        ? 'Не ограничено'
                        : tender.max_participants || 'Не указано'
                  }
               />

               <TenderInfoBadge
                  label='Участников'
                  value={tender.participants_count ?? 0}
               />

               <TenderInfoBadge label='Ставок' value={tender.bets_count ?? 0} />
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
