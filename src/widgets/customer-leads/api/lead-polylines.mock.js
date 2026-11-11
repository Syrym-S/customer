import polyline from '@mapbox/polyline';

import { leadPolylineStatuses } from './lead-polylines.api';
import { buildFallbackLeadRoutePoints } from '../lib/route-polyline.helpers';
import { getLeadId, isLeadTrackingActive } from '../model/lead.helpers';

const MOCK_FALLBACK_POINTS = [
   [52.2873, 76.9674],
   [51.1694, 71.4491],
];

const MOCK_TRAVELLED_RATIO = 0.6;

function getMockRoutePoints(lead) {
   const fallbackPoints = buildFallbackLeadRoutePoints(lead);

   return fallbackPoints.length >= 2 ? fallbackPoints : MOCK_FALLBACK_POINTS;
}

function interpolateRoutePoints(points) {
   const densePoints = [];

   points.forEach((point, index) => {
      densePoints.push(point);

      const nextPoint = points[index + 1];

      if (!nextPoint) {
         return;
      }

      densePoints.push([
         (point[0] + nextPoint[0]) / 2,
         (point[1] + nextPoint[1]) / 2,
      ]);
   });

   return densePoints;
}

export async function fetchLeadPolylinesMock(leads) {
   return leads.map((lead) => {
      const leadId = String(getLeadId(lead));
      const routePoints = interpolateRoutePoints(getMockRoutePoints(lead));

      if (!isLeadTrackingActive(lead?.status)) {
         return {
            lead_id: leadId,
            status: leadPolylineStatuses.NO_TRACKING,
            polyline: '',
            route_polyline: polyline.encode(routePoints),
            token: null,
            websocket: null,
         };
      }

      const travelledCount = Math.max(
         2,
         Math.ceil(routePoints.length * MOCK_TRAVELLED_RATIO),
      );

      return {
         lead_id: leadId,
         status: leadPolylineStatuses.OK,
         polyline: polyline.encode(routePoints.slice(0, travelledCount)),
         route_polyline: polyline.encode(routePoints),
         token: null,
         websocket: null,
      };
   });
}
