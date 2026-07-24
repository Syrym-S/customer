const geoRoutesCache = new Map();

const GEO_ROUTES_CACHE_TTL = 60 * 1000;
const MAX_GEO_ROUTES_CACHE_SIZE = 200;

function trimGeoRoutesCache() {
   if (geoRoutesCache.size <= MAX_GEO_ROUTES_CACHE_SIZE) {
      return;
   }

   const oldestKey = geoRoutesCache.keys().next().value;

   if (oldestKey) {
      geoRoutesCache.delete(oldestKey);
   }
}

function getCacheKey(leadId) {
   return String(leadId || "");
}

function setGeoRouteCacheEntry(leadId, entry) {
   const cacheKey = getCacheKey(leadId);

   if (!cacheKey) {
      return;
   }

   geoRoutesCache.set(cacheKey, {
      ...entry,
      cachedAt: Date.now(),
   });

   trimGeoRoutesCache();
}

export function getCachedGeoRouteEntry(leadId) {
   const cacheKey = getCacheKey(leadId);

   if (!cacheKey) {
      return null;
   }

   const cachedEntry = geoRoutesCache.get(cacheKey);

   if (!cachedEntry) {
      return null;
   }

   const isExpired = Date.now() - cachedEntry.cachedAt > GEO_ROUTES_CACHE_TTL;

   if (isExpired) {
      geoRoutesCache.delete(cacheKey);
      return null;
   }

   geoRoutesCache.delete(cacheKey);
   geoRoutesCache.set(cacheKey, cachedEntry);

   return cachedEntry;
}

export function setCachedGeoRoute(leadId, route) {
   if (!leadId || !route) {
      return;
   }

   setGeoRouteCacheEntry(leadId, {
      status: "route",
      route,
   });
}

export function setCachedEmptyGeoRoute(leadId) {
   if (!leadId) {
      return;
   }

   setGeoRouteCacheEntry(leadId, {
      status: "empty",
      route: null,
   });
}

export function deleteCachedGeoRoute(leadId) {
   const cacheKey = getCacheKey(leadId);

   if (!cacheKey) {
      return;
   }

   geoRoutesCache.delete(cacheKey);
}

export function clearGeoRoutesCache() {
   geoRoutesCache.clear();
}
