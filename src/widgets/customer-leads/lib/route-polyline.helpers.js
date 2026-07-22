import polyline from '@mapbox/polyline';

export function decodeRoutePolyline(encodedPolyline) {
   if (!encodedPolyline) {
      return [];
   }

   try {
      return polyline.decode(encodedPolyline).map(([lat, lng]) => [lat, lng]);
   } catch (error) {
      console.error('Ошибка декодирования polyline:', error);

      return [];
   }
}

function getLocationPoint(location) {
   if (!location || typeof location !== 'object') {
      return null;
   }

   const lat = location.lat ?? location.latitude;
   const lng = location.lng ?? location.lon ?? location.longitude;

   if (
      lat === null ||
      lat === undefined ||
      lat === '' ||
      lng === null ||
      lng === undefined ||
      lng === ''
   ) {
      return null;
   }

   return [Number(lat), Number(lng)];
}

export function buildFallbackLeadRoutePoints(lead) {
   const points = [];

   const fromPoint = getLocationPoint(lead?.from_location);
   const toPoint = getLocationPoint(lead?.to_location);

   if (fromPoint) {
      points.push(fromPoint);
   }

   if (Array.isArray(lead?.waypoints)) {
      lead.waypoints.forEach((waypoint) => {
         const point = getLocationPoint(waypoint);

         if (point) {
            points.push(point);
         }
      });
   }

   if (toPoint) {
      points.push(toPoint);
   }

   return points.length >= 2 ? points : [];
}

export function getRoutesFromGeneratedRoute(generatedRoute) {
   if (Array.isArray(generatedRoute?.routes)) {
      return generatedRoute.routes;
   }

   if (generatedRoute?.data && Array.isArray(generatedRoute.data.routes)) {
      return generatedRoute.data.routes;
   }

   if (generatedRoute?.polyline || generatedRoute?.encodedPolyline) {
      return [generatedRoute];
   }

   return [];
}

export function getEncodedPolylineFromRoute(route) {
   return (
      route?.polyline?.encodedPolyline ||
      route?.encodedPolyline ||
      route?.polyline ||
      ''
   );
}

function hasValue(value) {
   return value !== null && value !== undefined && value !== '';
}

function normalizeText(value) {
   return String(value ?? '').trim();
}

function getCoordinate(point, keys) {
   for (const key of keys) {
      if (!hasValue(point?.[key])) {
         continue;
      }

      const coordinate = Number(point[key]);

      if (!Number.isNaN(coordinate)) {
         return coordinate;
      }
   }

   return null;
}

function buildLocationText(location) {
   if (!location) {
      return '';
   }

   if (typeof location === 'string') {
      return normalizeText(location);
   }

   return Object.values(location)
      .filter((value) => {
         if (!hasValue(value)) {
            return false;
         }

         if (typeof value === 'object') {
            return false;
         }

         return normalizeText(value) !== '';
      })
      .map(normalizeText)
      .join(', ');
}

function getLocationCoordinate(location, keys) {
   if (!location || typeof location !== 'object') {
      return null;
   }

   return getCoordinate(location, keys);
}

function normalizeWaypointForRoutePayload(waypoint = {}) {
   const source = waypoint.raw || waypoint;

   const lat = getCoordinate(source, ['lat', 'latitude']);
   const lon = getCoordinate(source, ['lon', 'lng', 'longitude']);

   if (!hasValue(lat) || !hasValue(lon)) {
      return null;
   }

   return {
      country: source.country ?? waypoint.country ?? null,
      region: source.region ?? waypoint.region ?? null,
      city: source.city ?? waypoint.city ?? null,
      address:
         source.address ??
         source.label ??
         waypoint.address ??
         waypoint.location ??
         null,
      lat,
      lon,
   };
}

function getLeadWaypointsForRoutePayload(lead) {
   if (!Array.isArray(lead?.waypoints)) {
      return [];
   }

   return lead.waypoints.map(normalizeWaypointForRoutePayload).filter(Boolean);
}

export function buildLeadRoutePayload(lead) {
   if (!lead?.id) {
      console.warn('Не хватает id лида для генерации маршрута:', lead);

      return null;
   }

   const rawRoute = lead?.raw?.route;

   const from =
      rawRoute?.from || lead?.from_location || lead?.raw?.from_location || null;

   const to =
      rawRoute?.to || lead?.to_location || lead?.raw?.to_location || null;

   const fromLat =
      getCoordinate(from, ['lat', 'latitude', 'from_lat']) ??
      getLocationCoordinate(lead?.from_location, ['lat', 'latitude']);

   const fromLon =
      getCoordinate(from, ['lng', 'lon', 'longitude', 'from_lon']) ??
      getLocationCoordinate(lead?.from_location, ['lng', 'lon', 'longitude']);

   const toLat =
      getCoordinate(to, ['lat', 'latitude', 'to_lat']) ??
      getLocationCoordinate(lead?.to_location, ['lat', 'latitude']);

   const toLon =
      getCoordinate(to, ['lng', 'lon', 'longitude', 'to_lon']) ??
      getLocationCoordinate(lead?.to_location, ['lng', 'lon', 'longitude']);

   const waypoints = getLeadWaypointsForRoutePayload(lead);

   const hasCoordinates =
      hasValue(fromLat) &&
      hasValue(fromLon) &&
      hasValue(toLat) &&
      hasValue(toLon);

   if (hasCoordinates) {
      const payload = {
         id: lead.id,
         lead_id: lead.id,
         from_lat: fromLat,
         from_lon: fromLon,
         to_lat: toLat,
         to_lon: toLon,
      };

      if (waypoints.length) {
         payload.waypoints = waypoints;
      }

      return payload;
   }

   const fromText =
      buildLocationText(from) || normalizeText(lead?.from_location);

   const toText = buildLocationText(to) || normalizeText(lead?.to_location);

   if (!fromText || !toText) {
      console.warn('Не хватает данных для генерации маршрута:', {
         id: lead.id,
         lead_id: lead.id,
         from,
         to,
         from_location: lead?.from_location,
         to_location: lead?.to_location,
         waypoints: lead?.waypoints,
      });

      return {
         id: lead.id,
         lead_id: lead.id,
      };
   }

   return {
      id: lead.id,
      lead_id: lead.id,
      from: fromText,
      to: toText,
   };
}
