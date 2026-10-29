import PropTypes from 'prop-types';
import i18n from '../../../../shared/i18n';
import { useTranslation } from "react-i18next";
import { Box, CircularProgress, Typography } from '@mui/material';

import { CustomerMapView } from '../../../customer-map/ui/CustomerMapView';
import {
   getLocationDescription,
   getLocationPosition,
} from '../../model/lead-details-map.helpers';
import { formatLeadDate, isLeadTrackingActive } from '../../model/lead.helpers';
import { getWaypointTypeLabel } from '../../model/lead-route.helpers';

function getPassedStateLine(location) {
   return location?.is_passed ? i18n.t("enums.verificationCheck.passedMark") : i18n.t("enums.verificationCheck.notPassed");
}

function withPassedState(description, location) {
   return `${description} · ${getPassedStateLine(location)}`;
}

export function LeadDetailsMap({
   map,
   lead,
   route,
   routePoints = [],
   geoPoints = [],
   geoCurrentPoint = null,
   isRouteLoading = false,
}) {
   const { t } = useTranslation();

   const hasRoutePoints = routePoints.length >= 2;
   const hasGeoPoints = geoPoints.length > 0;

   const geoRoutePoints = geoPoints.map((point) => [
      point.latitude,
      point.longitude,
   ]);

   const waypoints = Array.isArray(lead.waypoints) ? lead.waypoints : [];

   const fromPosition = getLocationPosition(lead.from_location);
   const toPosition = getLocationPosition(lead.to_location);

   const waypointMarkers = waypoints
      .map((waypoint, index) => {
         const position = getLocationPosition(waypoint);

         if (!position) {
            return null;
         }

         const baseTitle = t("route.waypoint", { index: index + 1 });
         const typeLabel = getWaypointTypeLabel(waypoint.type);

         return {
            id: `route-waypoint-${index}`,
            position,
            title: typeLabel ? `${baseTitle} · ${typeLabel}` : baseTitle,
            description: withPassedState(
               getLocationDescription(waypoint, baseTitle),
               waypoint,
            ),
         };
      })
      .filter(Boolean);

   const routeMarkers =
      hasRoutePoints || fromPosition || toPosition || waypointMarkers.length
         ? [
              fromPosition
                 ? {
                      id: 'route-start',
                      position: fromPosition,
                      title: t("common.fields.origin"),
                      description: withPassedState(
                         getLocationDescription(
                            lead.from_location,
                            t("common.empty.notSpecifiedN"),
                         ),
                         lead.from_location,
                      ),
                   }
                 : hasRoutePoints
                   ? {
                        id: 'route-start',
                        position: routePoints[0],
                        title: t("common.fields.origin"),
                        description: withPassedState(
                           getLocationDescription(
                              lead.from_location,
                              t("common.empty.notSpecifiedN"),
                           ),
                           lead.from_location,
                        ),
                     }
                   : null,

              ...waypointMarkers,

              toPosition
                 ? {
                      id: 'route-end',
                      position: toPosition,
                      title: t("common.fields.destination"),
                      description: withPassedState(
                         getLocationDescription(
                            lead.to_location,
                            t("common.empty.notSpecifiedN"),
                         ),
                         lead.to_location,
                      ),
                   }
                 : hasRoutePoints
                   ? {
                        id: 'route-end',
                        position: routePoints[routePoints.length - 1],
                        title: t("common.fields.destination"),
                        description: withPassedState(
                           getLocationDescription(
                              lead.to_location,
                              t("common.empty.notSpecifiedN"),
                           ),
                           lead.to_location,
                        ),
                     }
                   : null,
           ].filter(Boolean)
         : [];

   const hasLiveDriverMarker =
      Boolean(geoCurrentPoint) && isLeadTrackingActive(lead.status);

   const geoMarkers = hasLiveDriverMarker
      ? [
           {
              id: 'geo-current-point',
              position: [geoCurrentPoint.latitude, geoCurrentPoint.longitude],
              title: t("leads.map.driverPosition"),
              description: geoCurrentPoint.recordedAt
                 ? t("leads.map.lastUpdate", { time: formatLeadDate(geoCurrentPoint.recordedAt) })
                 : t("leads.map.coordsViaWebSocket"),
           },
        ]
      : [];

   const markers = [...routeMarkers, ...geoMarkers];

   const mapCenter = fromPosition
      ? fromPosition
      : hasRoutePoints
        ? routePoints[0]
        : hasGeoPoints
          ? geoRoutePoints[geoRoutePoints.length - 1]
          : map.center;

   const routeBoundsKey = [
      lead?.id,
      routePoints.length,
      geoRoutePoints.length,
      markers.length,
      routePoints[0]?.join(','),
      routePoints[routePoints.length - 1]?.join(','),
      waypointMarkers.map((marker) => marker.position.join(',')).join('|'),
   ]
      .filter(Boolean)
      .join('|');

   return (
      <Box
         sx={{
            position: 'relative',
            height: {
               xs: 220,
               sm: 280,
            },
            minHeight: 220,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            mb: 3,
            mt: 1,
         }}
      >
         {isRouteLoading && (
            <Box
               sx={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.72)',
                  backdropFilter: 'blur(1px)',
                  pointerEvents: 'auto',
               }}
            >
               <CircularProgress size={28} />

               <Typography
                  color="text.secondary"
                  sx={{
                     fontSize: 13,
                     fontWeight: 500,
                  }}
               >
                  {t("leads.map.loadingRoute")}
               </Typography>
            </Box>
         )}

         <CustomerMapView
            center={mapCenter}
            zoom={hasRoutePoints ? 7 : hasGeoPoints ? 13 : map.zoom}
            markers={markers}
            route={route}
            status={lead.status}
            routePoints={hasRoutePoints ? routePoints : []}
            geoRoutePoints={hasGeoPoints ? geoRoutePoints : []}
            fitBoundsKey={routeBoundsKey}
            borderRadius={3}
            handleMarkerClick={map.handleMarkerClick}
         />
      </Box>
   );
}

LeadDetailsMap.propTypes = {
   map: PropTypes.shape({
      center: PropTypes.array.isRequired,
      zoom: PropTypes.number.isRequired,
      markers: PropTypes.array.isRequired,
      routePoints: PropTypes.array,
      handleMarkerClick: PropTypes.func.isRequired,
   }).isRequired,
   lead: PropTypes.shape({
      from_location: PropTypes.string,
      to_location: PropTypes.string,
      status: PropTypes.string,
   }).isRequired,
   route: PropTypes.object,
   routePoints: PropTypes.array,
   geoPoints: PropTypes.arrayOf(
      PropTypes.shape({
         id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
         latitude: PropTypes.number.isRequired,
         longitude: PropTypes.number.isRequired,
         altitude: PropTypes.number,
         recordedAt: PropTypes.string,
      }),
   ),
   geoCurrentPoint: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
      altitude: PropTypes.number,
      recordedAt: PropTypes.string,
   }),
   isRouteLoading: PropTypes.bool,
};
