import { Box, Stack } from '@mui/material';
import { tenderPropType } from '../../model/tenders.propTypes';

import { TenderInfoSection } from './sections/TenderInfoSection';
import { TenderParticipantsSection } from './sections/TenderParticipantsSection';
import { TenderBetsSection } from './sections/TenderBetsSection';
import { TenderTransportSection } from './sections/TenderTransportSection';

export function TenderDetailsContent({ tender }) {
   return (
      <Stack spacing={2}>
         <TenderTransportSection tender={tender} />

         <TenderInfoSection tender={tender} />

         <Box
            sx={{
               display: 'grid',
               gridTemplateColumns: {
                  xs: '1fr',
                  md: '1fr 1fr',
               },
               gap: 2,
               alignItems: 'start',
            }}
         >
            <TenderParticipantsSection
               participants={tender.participants || []}
               maxParticipants={tender.max_participants}
            />

            <TenderBetsSection bets={tender.bets || []} />
         </Box>
      </Stack>
   );
}

TenderDetailsContent.propTypes = {
   tender: tenderPropType.isRequired,
};
