import { Box } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { TenderDetailSection } from './TenderDetailSection';
import { TenderInfoBadge } from './TenderInfoBadge';
import { tenderPropType } from '../../../model/tenders.propTypes';

const tenderTypeLabels = {
   forwarder: 'Для экспедиторов',
   shipper: 'Для грузоотправителей',
};

const publicationTypeLabels = {
   public: 'Публичный',
   private: 'Не публичный',
};

export function TenderInfoSection({ tender }) {
   return (
      <TenderDetailSection
         icon={<InfoOutlinedIcon />}
         title='Информация о тендере'
      >
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
                  publicationTypeLabels[tender.publication_type] || 'Не указано'
               }
            />

            <TenderInfoBadge
               label='Макс. участников'
               value={
                  tender.max_participants === 0
                     ? 'Без лимита'
                     : tender.max_participants || 'Не указано'
               }
            />

            <TenderInfoBadge
               label='Участников'
               value={tender.participants_count ?? 0}
            />

            <TenderInfoBadge label='Ставок' value={tender.bets_count ?? 0} />
         </Box>
      </TenderDetailSection>
   );
}

TenderInfoSection.propTypes = {
   tender: tenderPropType.isRequired,
};
