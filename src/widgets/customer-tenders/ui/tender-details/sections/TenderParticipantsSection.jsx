import { useState } from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PropTypes from 'prop-types';
import { participantPropType } from '../../../model/tenders.propTypes';

import { TenderDetailSection } from './TenderDetailSection';

const INITIAL_VISIBLE_COUNT = 3;

const participantTypeLabels = {
   forwarder: 'Экспедитор',
   shipper: 'Грузоотправитель',
};

function formatDateTime(value) {
   if (!value) return 'Не указано';

   const date = new Date(value);

   if (Number.isNaN(date.getTime())) {
      return value;
   }

   return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
   });
}

export function TenderParticipantsSection({ participants, maxParticipants }) {
   const [isExpanded, setIsExpanded] = useState(false);

   const hasHiddenItems = participants.length > INITIAL_VISIBLE_COUNT;

   const visibleParticipants = isExpanded
      ? participants
      : participants.slice(0, INITIAL_VISIBLE_COUNT);

   const hiddenItemsCount = participants.length - INITIAL_VISIBLE_COUNT;

   function handleToggleExpanded() {
      setIsExpanded((prev) => !prev);
   }

   return (
      <TenderDetailSection
         icon={<GroupsOutlinedIcon />}
         title='Участники'
         subtitle={`${participants.length} из ${
            maxParticipants === 0 ? '∞' : maxParticipants || '—'
         }`}
      >
         {participants.length === 0 ? (
            <Typography color='text.secondary' sx={{ py: 2 }}>
               Участники пока не добавлены
            </Typography>
         ) : (
            <Stack
               spacing={1.25}
               sx={{
                  maxHeight:
                     isExpanded && participants.length > 6 ? 420 : 'none',
                  overflowY:
                     isExpanded && participants.length > 6 ? 'auto' : 'visible',
                  pr: isExpanded && participants.length > 6 ? 0.5 : 0,
               }}
            >
               {visibleParticipants.map((participant) => (
                  <Box
                     key={participant.participant_id}
                     sx={{
                        p: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        backgroundColor: 'grey.50',
                     }}
                  >
                     <Stack
                        direction='row'
                        justifyContent='space-between'
                        alignItems='flex-start'
                        spacing={1}
                        useFlexGap
                        sx={{ flexWrap: 'wrap' }}
                     >
                        <Box>
                           <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                              {participant.name ||
                                 participant.participant_id ||
                                 'Участник'}
                           </Typography>

                           <Typography
                              color='text.secondary'
                              sx={{ fontSize: 12, mt: 0.5 }}
                           >
                              Добавлен: {formatDateTime(participant.date)}
                           </Typography>
                        </Box>

                        <Chip
                           label={
                              participantTypeLabels[participant.type] ||
                              participant.type ||
                              'Не указано'
                           }
                           size='small'
                           sx={{
                              borderRadius: 999,
                              fontWeight: 500,
                              backgroundColor: 'grey.100',
                              color: 'text.secondary',
                           }}
                        />
                     </Stack>
                  </Box>
               ))}

               {hasHiddenItems && (
                  <Button
                     size='small'
                     onClick={handleToggleExpanded}
                     sx={{
                        alignSelf: 'flex-start',
                        textTransform: 'none',
                     }}
                  >
                     {isExpanded
                        ? 'Скрыть'
                        : `Показать всех (+${hiddenItemsCount})`}
                  </Button>
               )}
            </Stack>
         )}
      </TenderDetailSection>
   );
}

TenderParticipantsSection.propTypes = {
   participants: PropTypes.arrayOf(participantPropType).isRequired,
   maxParticipants: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
