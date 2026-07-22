function hasCoordinate(value) {
   return value !== null && value !== undefined && value !== '';
}

export function getLocationPosition(location) {
   if (!location || typeof location !== 'object') {
      return null;
   }

   const lat = location.lat ?? location.latitude;
   const lng = location.lng ?? location.lon ?? location.longitude;

   if (!hasCoordinate(lat) || !hasCoordinate(lng)) {
      return null;
   }

   return [Number(lat), Number(lng)];
}

export function getLocationDescription(location, fallback) {
   if (!location || typeof location !== 'object') {
      return location || fallback;
   }

   return location.address || location.label || location.city || fallback;
}
