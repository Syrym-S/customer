import { MANUFACTURER_REQUEST_DIRECTIONS } from './manufacturers.helpers';
import { mockManufacturersCatalog } from './manufacturers.mock';

const DAY_MS = 24 * 60 * 60 * 1000;

const REQUEST_SEEDS = [
   {
      catalogIndex: 5,
      direction: MANUFACTURER_REQUEST_DIRECTIONS.INCOMING,
      daysAgo: 1,
   },
   {
      catalogIndex: 6,
      direction: MANUFACTURER_REQUEST_DIRECTIONS.INCOMING,
      daysAgo: 3,
   },
   {
      catalogIndex: 7,
      direction: MANUFACTURER_REQUEST_DIRECTIONS.OUTGOING,
      daysAgo: 6,
   },
];

function buildInitialRequests() {
   const requests = new Map();

   REQUEST_SEEDS.forEach(({ catalogIndex, direction, daysAgo }) => {
      const manufacturer = mockManufacturersCatalog[catalogIndex];

      if (!manufacturer) {
         return;
      }

      requests.set(manufacturer.id, {
         direction,
         linkedAt: new Date(Date.now() - daysAgo * DAY_MS).toISOString(),
      });
   });

   return requests;
}

export const mockManufacturerRequests = buildInitialRequests();
