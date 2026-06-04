import { isMockApi } from '../../../shared/config/api.config';
import { generateRouteApi } from './lead-route.api';
import { generateRouteMock } from './lead-route.mock';

export function generateRoute(payload) {
   if (isMockApi) {
      return generateRouteMock(payload);
   }

   return generateRouteApi(payload);
}
