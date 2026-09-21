import { alpha, Box, Tooltip, Typography, useTheme } from '@mui/material';
import PropTypes from 'prop-types';

import { LeadStatusChip } from '../../dashboard/ui/DashboardLeadItem';
import { getRouteStatusStyle } from '../../customer-map/model/route-status-style';
import {
   getLeadOptionCargoLabel,
   getLeadOptionDateLabel,
   getLeadOptionNumberLabel,
   getLeadOptionPriceLabel,
   getLeadOptionRoute,
   getStopsHint,
} from '../model/tender-lead-option.helpers';

const BADGE_SIZE = 22;

function RouteBadge({ letter, color }) {
   return (
      <Box
         sx={{
            width: BADGE_SIZE,
            height: BADGE_SIZE,
            borderRadius: '50%',
            backgroundColor: color,
            color: 'common.white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            lineHeight: 1,
            flexShrink: 0,
         }}
      >
         {letter}
      </Box>
   );
}

RouteBadge.propTypes = {
   letter: PropTypes.string.isRequired,
   color: PropTypes.string.isRequired,
};

function RouteAddress({ line }) {
   return (
      <Tooltip
         title={line.full}
         placement="top-start"
         enterDelay={500}
         disableInteractive
      >
         <Typography
            noWrap
            sx={{
               fontSize: 13,
               lineHeight: `${BADGE_SIZE}px`,
               minWidth: 0,
            }}
         >
            {line.text || 'Не указано'}
         </Typography>
      </Tooltip>
   );
}

RouteAddress.propTypes = {
   line: PropTypes.shape({
      text: PropTypes.string,
      full: PropTypes.string,
   }).isRequired,
};

export function TenderLeadOption({ option }) {
   const theme = useTheme();

   const color = getRouteStatusStyle(option.status, theme).color;
   const [fromLine, toLine] = getLeadOptionRoute(option);
   const numberLabel = getLeadOptionNumberLabel(option);
   const cargoLabel = getLeadOptionCargoLabel(option);
   const priceLabel = getLeadOptionPriceLabel(option);
   const dateLabel = getLeadOptionDateLabel(option);
   const stopsHint = getStopsHint(option.waypointsCount);

   return (
      <Box
         sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
            width: '100%',
            minWidth: 0,
         }}
      >
         <Box
            sx={{
               display: 'flex',
               alignItems: 'center',
               gap: 1.5,
               minWidth: 0,
            }}
         >
            <Typography
               noWrap
               sx={{ fontSize: 14, fontWeight: 700, minWidth: 0, flex: 1 }}
            >
               {numberLabel}

               {cargoLabel && (
                  <Box
                     component="span"
                     sx={{ fontWeight: 500, color: 'text.secondary' }}
                  >
                     {numberLabel ? ' · ' : ''}
                     {cargoLabel}
                  </Box>
               )}
            </Typography>

            <Box
               sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  flexShrink: 0,
               }}
            >
               {dateLabel && (
                  <Typography
                     noWrap
                     color="text.secondary"
                     sx={{ fontSize: 12 }}
                  >
                     {dateLabel}
                  </Typography>
               )}

               {option.status && <LeadStatusChip status={option.status} />}

               {priceLabel && (
                  <Typography noWrap sx={{ fontSize: 13, fontWeight: 600 }}>
                     {priceLabel}
                  </Typography>
               )}
            </Box>
         </Box>

         <Box
            sx={{
               display: 'grid',
               gridTemplateColumns: `${BADGE_SIZE}px minmax(0, 1fr)`,
               columnGap: 1.25,
            }}
         >
            <RouteBadge letter={'А'} color={color} />
            <RouteAddress line={fromLine} />

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
               <Box
                  sx={{
                     width: 0,
                     borderLeft: '2px dotted',
                     borderColor: alpha(color, 0.6),
                     minHeight: stopsHint ? 18 : 8,
                  }}
               />
            </Box>

            <Typography
               noWrap
               color="text.secondary"
               sx={{ fontSize: 12, lineHeight: '18px', minWidth: 0 }}
            >
               {stopsHint}
            </Typography>

            <RouteBadge letter={'Б'} color={color} />
            <RouteAddress line={toLine} />
         </Box>
      </Box>
   );
}

TenderLeadOption.propTypes = {
   option: PropTypes.shape({
      status: PropTypes.string,
      num: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      shortId: PropTypes.string,
      cargo: PropTypes.string,
      cargoNames: PropTypes.arrayOf(PropTypes.string),
      from: PropTypes.string,
      to: PropTypes.string,
      fromCity: PropTypes.string,
      toCity: PropTypes.string,
      price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      waypointsCount: PropTypes.number,
      pointSchedules: PropTypes.array,
   }).isRequired,
};
