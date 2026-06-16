import { Box, Button, Stack } from '@mui/material';
import { tenderPropType } from '../../model/tenders.propTypes';

import { TenderInfoSection } from './sections/TenderInfoSection';
import { TenderParticipantsSection } from './sections/TenderParticipantsSection';
import { TenderBetsSection } from './sections/TenderBetsSection';
import { TenderTransportSection } from './sections/TenderTransportSection';
import { TenderDocumentsSection } from './sections/TenderDocumentsSection';

export function TenderDetailsContent({
   tender,
   isActionLoading = false,
   onAcceptWinner,
   onCancelTender,
   onDeleteTender,
   onDeleteParticipant,
   onStartTender,
}) {
   const documents = tender.lead?.documents || tender.lead?.files || [];

   return (
      <Stack spacing={2}>
         <TenderTransportSection tender={tender} />

         <TenderInfoSection tender={tender} />

         <TenderDocumentsSection documents={documents} />

         <Box
            sx={{
               display: 'flex',
               justifyContent: 'flex-end',
               gap: 1,
               flexWrap: 'wrap',
            }}
         >
            {tender.status === 'new' && (
               <Button
                  color='success'
                  variant='contained'
                  onClick={onStartTender}
                  disabled={isActionLoading}
               >
                  Запустить тендер
               </Button>
            )}
            {tender.status !== 'closed' && tender.status !== 'cancelled' && (
               <Button
                  color='warning'
                  variant='outlined'
                  onClick={onCancelTender}
                  disabled={isActionLoading}
               >
                  Отменить тендер
               </Button>
            )}

            <Button
               color='error'
               variant='outlined'
               onClick={onDeleteTender}
               disabled={isActionLoading}
            >
               Удалить тендер
            </Button>
         </Box>

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
               tenderStatus={tender.status}
               isActionLoading={isActionLoading}
               onDeleteParticipant={onDeleteParticipant}
            />

            <TenderBetsSection
               bets={tender.bets || []}
               tenderStatus={tender.status}
               isActionLoading={isActionLoading}
               onAcceptWinner={onAcceptWinner}
            />
         </Box>
      </Stack>
   );
}

TenderDetailsContent.propTypes = {
   tender: tenderPropType.isRequired,
};
