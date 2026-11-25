import { apiClient } from '../../../shared/api/api-client';
import { getPlatform } from '../../../shared/config/platform';
import { getCurrentAppInfo } from '../model/app-version.service';

export async function getAppVersionInfo() {
   const currentInfo = await getCurrentAppInfo();

   const response = await apiClient.get('app/v1/version', {
      params: {
         platform: getPlatform(),
         version_code: currentInfo.build,
      },
      skipContractGate: true,
   });

   return response.data;
}
