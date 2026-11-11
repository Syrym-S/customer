const leadPolylinesCache = new Map();
const pendingLeadPolylinesRequests = new Map();

const LEAD_POLYLINES_CACHE_TTL = 60 * 1000;
const MAX_LEAD_POLYLINES_CACHE_SIZE = 200;

function trimLeadPolylinesCache() {
   if (leadPolylinesCache.size <= MAX_LEAD_POLYLINES_CACHE_SIZE) {
      return;
   }

   const oldestKey = leadPolylinesCache.keys().next().value;

   if (oldestKey) {
      leadPolylinesCache.delete(oldestKey);
   }
}

function getCacheKey(leadId) {
   return String(leadId || '');
}

export function getCachedLeadPolylineEntry(leadId) {
   const cacheKey = getCacheKey(leadId);

   if (!cacheKey) {
      return null;
   }

   const cachedEntry = leadPolylinesCache.get(cacheKey);

   if (!cachedEntry) {
      return null;
   }

   const isExpired =
      Date.now() - cachedEntry.cachedAt > LEAD_POLYLINES_CACHE_TTL;

   if (isExpired) {
      leadPolylinesCache.delete(cacheKey);

      return null;
   }

   leadPolylinesCache.delete(cacheKey);
   leadPolylinesCache.set(cacheKey, cachedEntry);

   return cachedEntry;
}

export function setCachedLeadPolylineEntry(leadId, entry) {
   const cacheKey = getCacheKey(leadId);

   if (!cacheKey || !entry) {
      return;
   }

   leadPolylinesCache.set(cacheKey, {
      ...entry,
      cachedAt: Date.now(),
   });

   trimLeadPolylinesCache();
}

export function updateCachedLeadGeoRoute(leadId, geoRoute) {
   const cacheKey = getCacheKey(leadId);

   if (!cacheKey) {
      return;
   }

   const cachedEntry = leadPolylinesCache.get(cacheKey);

   if (!cachedEntry) {
      return;
   }

   leadPolylinesCache.set(cacheKey, {
      ...cachedEntry,
      geoRoute,
   });
}

export function deleteCachedLeadPolylineEntry(leadId) {
   const cacheKey = getCacheKey(leadId);

   if (!cacheKey) {
      return;
   }

   leadPolylinesCache.delete(cacheKey);
}

export function clearLeadPolylinesCache() {
   leadPolylinesCache.clear();
   pendingLeadPolylinesRequests.clear();
}

export function buildLeadPolylinesRequestKey(leadIds) {
   return [...leadIds].sort().join('|');
}

export function fetchLeadPolylinesWithRequestCache(requestKey, fetchPolylines) {
   if (!requestKey) {
      return fetchPolylines();
   }

   const pendingRequest = pendingLeadPolylinesRequests.get(requestKey);

   if (pendingRequest) {
      return pendingRequest;
   }

   const request = fetchPolylines().finally(() => {
      pendingLeadPolylinesRequests.delete(requestKey);
   });

   pendingLeadPolylinesRequests.set(requestKey, request);

   return request;
}
