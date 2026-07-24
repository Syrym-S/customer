const generatedRoutesCache = new Map();
const pendingGeneratedRouteRequests = new Map();

const MAX_CACHE_SIZE = 200;

function trimRouteCache() {
   if (generatedRoutesCache.size <= MAX_CACHE_SIZE) {
      return;
   }

   const oldestKey = generatedRoutesCache.keys().next().value;

   if (oldestKey) {
      generatedRoutesCache.delete(oldestKey);
   }
}

export function buildGeneratedRouteCacheKey(payload) {
   if (!payload) {
      return "";
   }

   try {
      return JSON.stringify(payload);
   } catch {
      return "";
   }
}

export async function getGeneratedRouteWithCache(cacheKey, fetchRoute) {
   if (!cacheKey) {
      return fetchRoute();
   }

   const cachedRoute = generatedRoutesCache.get(cacheKey);

   if (cachedRoute) {
      generatedRoutesCache.delete(cacheKey);
      generatedRoutesCache.set(cacheKey, cachedRoute);

      return cachedRoute;
   }

   const pendingRequest = pendingGeneratedRouteRequests.get(cacheKey);

   if (pendingRequest) {
      return pendingRequest;
   }

   const request = fetchRoute()
      .then((route) => {
         if (route) {
            generatedRoutesCache.set(cacheKey, route);
            trimRouteCache();
         }

         return route;
      })
      .finally(() => {
         pendingGeneratedRouteRequests.delete(cacheKey);
      });

   pendingGeneratedRouteRequests.set(cacheKey, request);

   return request;
}

export function clearGeneratedRoutesCache() {
   generatedRoutesCache.clear();
   pendingGeneratedRouteRequests.clear();
}
