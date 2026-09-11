import { Box, Stack, Typography } from '@mui/material';
import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import TripOriginIcon from '@mui/icons-material/TripOrigin';
import {
   getTimeLeft,
   tenderStatusLabels,
   tenderStatusStyles,
} from '../model/tender.helpers';
import { useTendersContext } from '../model/useTendersContext';
import PropTypes from 'prop-types';
import { tenderPropType } from '../model/tenders.prop-types';
import { normalizeLocationValue } from '../model/tender-edit-form.helpers';
import { StatusDot } from '../../../shared/ui/StatusDot';

function getShortTenderId(id) {
   if (!id) {
      return '—';
   }

   const value = String(id);

   if (value.length <= 12) {
      return value;
   }

   return `${value.slice(0, 4)}...${value.slice(-5)}`;
}

export function TenderCard({ tender }) {
   const { openTenderDetails } = useTendersContext();

   const isCancelled = tender.status === 'cancelled';

   const shouldShowTimeLeft =
      tender.status !== 'closed' && tender.status !== 'cancelled';

   const fromLocationLabel = normalizeLocationValue(tender.from_location);
   const toLocationLabel = normalizeLocationValue(tender.to_location);

   const fullTenderIdLabel = tender.id ? `#${tender.id}` : '#—';
   const shortTenderIdLabel = tender.id
      ? `#${getShortTenderId(tender.id)}`
      : '#—';

   function handleOpenTender() {
      openTenderDetails(tender);
   }

   return (
      <Box
         onClick={handleOpenTender}
         onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
               event.preventDefault();
               handleOpenTender();
            }
         }}
         role="button"
         tabIndex={0}
         sx={{
            p: 3,
            border: '2px solid',
            borderColor: isCancelled ? 'grey.300' : 'divider',
            borderRadius: 4,
            backgroundColor: isCancelled ? 'grey.100' : 'background.paper',
            boxShadow: isCancelled ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.06)',
            transition: '0.2s ease',
            cursor: 'pointer',
            opacity: isCancelled ? 0.82 : 1,
            '&:hover': {
               borderColor: isCancelled ? 'grey.400' : 'primary.light',
               boxShadow: isCancelled
                  ? '0 4px 12px rgba(0, 0, 0, 0.06)'
                  : '0 8px 24px rgba(33, 150, 243, 0.12)',
            },
         }}
      >
         <Stack spacing={2.5}>
            <Box
               sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 2,
                  flexWrap: 'wrap',
               }}
            >
               <Box>
                  <Typography
                     variant="body2"
                     color="text.secondary"
                     sx={{ mb: 0.75 }}
                  >
                     Аукцион
                  </Typography>

                  <Typography
                     sx={{
                        lineHeight: 1.3,
                        fontSize: {
                           xs: '16px',
                           sm: '18px',
                        },
                        fontWeight: 500,
                        wordBreak: 'break-word',
                     }}
                  >
                     <Box
                        component="span"
                        sx={{
                           display: {
                              xs: 'inline',
                              md: 'none',
                           },
                        }}
                     >
                        {shortTenderIdLabel}
                     </Box>

                     <Box
                        component="span"
                        sx={{
                           display: {
                              xs: 'none',
                              md: 'inline',
                           },
                        }}
                     >
                        {fullTenderIdLabel}
                     </Box>
                  </Typography>
               </Box>

               <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{
                     flexWrap: 'wrap',
                     justifyContent: {
                        xs: 'flex-start',
                        sm: 'flex-end',
                     },
                  }}
               >
                  {shouldShowTimeLeft && (
                     <TimeLeftBadge
                        value={getTimeLeft(tender.endDateTime, tender.status)}
                     />
                  )}

                  <StatusDot
                     label={tenderStatusLabels[tender.status] || tender.status}
                     color={
                        (tenderStatusStyles[tender.status] ||
                           tenderStatusStyles.new).color
                     }
                  />
               </Stack>
            </Box>

            <Box
               sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: 1.5,

                  '@media (min-width: 1100px)': {
                     gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
                     alignItems: 'stretch',
                  },
               }}
            >
               <Box
                  sx={{
                     flex: 1,
                     minWidth: 0,
                     minHeight: 86,
                     p: 1.5,
                     border: '1px solid',
                     borderColor: 'divider',
                     borderRadius: 2,
                     backgroundColor: isCancelled ? 'grey.200' : 'grey.50',
                     display: 'flex',
                     flexDirection: 'column',
                     justifyContent: 'flex-start',
                  }}
               >
                  <Typography
                     variant="caption"
                     sx={{
                        display: 'block',
                        color: 'text.secondary',
                        mb: 0.5,
                     }}
                  >
                     Откуда
                  </Typography>

                  <Box
                     sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1,
                        minWidth: 0,
                     }}
                  >
                     <TripOriginIcon
                        sx={{ fontSize: 18, color: 'primary.main' }}
                     />

                     <Typography
                        fontWeight={500}
                        sx={{
                           fontSize: 14,
                           lineHeight: 1.35,
                           minWidth: 0,
                           overflowWrap: 'anywhere',
                           wordBreak: 'break-word',
                        }}
                     >
                        {fromLocationLabel || 'Не указано'}
                     </Typography>
                  </Box>
               </Box>

               <Box
                  sx={{
                     display: 'none',

                     '@media (min-width: 1100px)': {
                        display: 'flex',
                     },

                     alignItems: 'center',
                     justifyContent: 'center',
                     px: 0.5,
                  }}
               >
                  <ArrowRightAltRoundedIcon
                     sx={{
                        color: 'text.secondary',
                        fontSize: 28,
                     }}
                  />
               </Box>

               <Box
                  sx={{
                     flex: 1,
                     minWidth: 0,
                     minHeight: 96,
                     p: 1.5,
                     border: '1px solid',
                     borderColor: 'divider',
                     borderRadius: 2,
                     backgroundColor: isCancelled ? 'grey.200' : 'grey.50',
                     display: 'flex',
                     flexDirection: 'column',
                     justifyContent: 'flex-start',
                  }}
               >
                  <Typography
                     variant="caption"
                     sx={{
                        display: 'block',
                        color: 'text.secondary',
                        mb: 0.5,
                     }}
                  >
                     Куда
                  </Typography>

                  <Box
                     sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1,
                        minWidth: 0,
                     }}
                  >
                     <LocationOnOutlinedIcon
                        sx={{ fontSize: 18, color: 'primary.main' }}
                     />

                     <Typography
                        fontWeight={500}
                        sx={{
                           fontSize: 14,
                           lineHeight: 1.35,
                           minWidth: 0,
                           overflowWrap: 'anywhere',
                           wordBreak: 'break-word',
                        }}
                     >
                        {toLocationLabel || 'Не указано'}
                     </Typography>
                  </Box>
               </Box>
            </Box>
         </Stack>
      </Box>
   );
}

function TimeLeftBadge({ value }) {
   return (
      <Box
         sx={{
            px: 1.25,
            py: 0.45,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 999,
            backgroundColor: 'grey.50',
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
         }}
      >
         <Typography
            sx={{
               fontSize: 11,
               lineHeight: 1.2,
               color: 'text.secondary',
            }}
         >
            Осталось
         </Typography>

         <Typography
            sx={{
               fontSize: 12,
               lineHeight: 1.2,
               fontWeight: 600,
               color: 'text.primary',
            }}
         >
            {value || 'Не указано'}
         </Typography>
      </Box>
   );
}

TenderCard.propTypes = {
   tender: tenderPropType.isRequired,
};

TimeLeftBadge.propTypes = {
   value: PropTypes.node,
};
