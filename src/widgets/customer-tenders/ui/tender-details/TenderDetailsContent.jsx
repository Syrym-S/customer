import { Box, Stack } from '@mui/material';
import {
   tenderPropType,
   tenderEditFormPropType,
} from '../../model/tenders.prop-types';
import PropTypes from 'prop-types';

import { TenderInfoSection } from './sections/TenderInfoSection';
import { TenderParticipantsSection } from './sections/TenderParticipantsSection';
import { TenderBetsSection } from './sections/TenderBetsSection';
import { TenderTransportSection } from './sections/TenderTransportSection';
import { TenderDocumentsSection } from './sections/TenderDocumentsSection';

export function TenderDetailsContent({
   tender,
   isActionLoading = false,
   isEditing = false,
   editForm,
   onEditChange,
   onAcceptWinner,
   onDeleteParticipant,
   onAddParticipants,
}) {
   const documents = tender.lead?.documents || tender.lead?.files || [];

   return (
      <Stack spacing={2}>
         <TenderTransportSection tender={tender} />

         <TenderInfoSection
            tender={tender}
            isEditing={isEditing}
            editForm={editForm}
            onEditChange={onEditChange}
         />

         <TenderDocumentsSection documents={documents} />

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
               onAddParticipants={onAddParticipants}
            />

            <TenderBetsSection
               bets={tender.bets || []}
               onAcceptWinner={onAcceptWinner}
               isActionLoading={isActionLoading}
               tenderStatus={tender.status}
            />
         </Box>
      </Stack>
   );
}

TenderDetailsContent.propTypes = {
   tender: tenderPropType.isRequired,
   isActionLoading: PropTypes.bool,
   isEditing: PropTypes.bool,
   editForm: tenderEditFormPropType,
   onEditChange: PropTypes.func,
   onAcceptWinner: PropTypes.func,
   onDeleteParticipant: PropTypes.func,
   onAddParticipants: PropTypes.func,
};
