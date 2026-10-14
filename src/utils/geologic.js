import { apiClient } from '../shared/api/api-client';

function normalizeNumber(value) {
   if (value === null || value === undefined || value === '') {
      return null;
   }

   const numberValue = Number(value);

   return Number.isNaN(numberValue) ? null : numberValue;
}

function normalizeGeoPoint(point, index) {
   const latitude = normalizeNumber(
      point?.latitude ?? point?.lat ?? point?.coords?.latitude,
   );

   const longitude = normalizeNumber(
      point?.longitude ?? point?.lng ?? point?.lon ?? point?.coords?.longitude,
   );

   if (latitude === null || longitude === null) {
      return null;
   }

   return {
      id: point?.id ?? point?._id ?? `${latitude}-${longitude}-${index}`,
      latitude,
      longitude,
      altitude: normalizeNumber(point?.altitude ?? point?.alt) ?? 0,
      recordedAt:
         point?.recorded_at ??
         point?.recordedAt ??
         point?.created_at ??
         point?.timestamp ??
         null,
      raw: point,
   };
}

export function normalizeGeoPoints(points) {
   return (points || [])
      .map(normalizeGeoPoint)
      .filter(Boolean)
      .sort((firstPoint, secondPoint) => {
         if (firstPoint.id !== null && secondPoint.id !== null) {
            return Number(firstPoint.id) - Number(secondPoint.id);
         }

         if (firstPoint.recordedAt && secondPoint.recordedAt) {
            return (
               new Date(firstPoint.recordedAt) -
               new Date(secondPoint.recordedAt)
            );
         }

         return 0;
      });
}

export function mergeGeoPointsById(prevPoints, nextPoints) {
   const pointsMap = new Map();

   [...prevPoints, ...nextPoints].forEach((point) => {
      pointsMap.set(String(point.id), point);
   });

   return Array.from(pointsMap.values()).sort((firstPoint, secondPoint) => {
      const firstId = Number(firstPoint.id);
      const secondId = Number(secondPoint.id);

      if (!Number.isNaN(firstId) && !Number.isNaN(secondId)) {
         return firstId - secondId;
      }

      if (firstPoint.recordedAt && secondPoint.recordedAt) {
         return (
            new Date(firstPoint.recordedAt) - new Date(secondPoint.recordedAt)
         );
      }

      return 0;
   });
}

export function geoPointToLatLng(point) {
   return [point.latitude, point.longitude];
}

function isFalsyGeoResponse(response) {
   return (
      !response ||
      response.success === false ||
      response.status === false ||
      response.error
   );
}

export async function fetchLeadGeoWsToken(leadId, type = 'read', { signal } = {}) {
   if (!leadId) {
      throw new Error('Lead ID is missing');
   }

   const response = await apiClient.post(
      '/geows/v1/token',
      {
         lead_id: leadId,
         type,
      },
      {
         signal,
      },
   );

   const data = response.data;

   if (isFalsyGeoResponse(data)) {
      throw new Error(data?.message || 'GeoWS token endpoint returned error');
   }

   if (!data?.token) {
      throw new Error('GeoWS token was not returned');
   }

   return data;
}
