import { useCallback, useEffect, useState } from 'react';

import { getPlatform, isNative } from '../../../shared/config/platform';
import { getAppVersionInfo } from '../api/app-version.api';

export function useAppVersionCheck() {
   const [updateInfo, setUpdateInfo] = useState(null);

   const checkVersion = useCallback(async () => {
      if (!isNative) {
         return;
      }

      try {
         const response = await getAppVersionInfo();
         const serverInfo = response?.data || response;

         if (!serverInfo?.update_available) {
            setUpdateInfo(null);

            return;
         }

         setUpdateInfo({
            latestVersion: serverInfo.latest_version,
            shortDescription: serverInfo.short_description,
            description: serverInfo.description,
            updateUrl:
               getPlatform() === 'ios'
                  ? serverInfo.update_url_ios
                  : serverInfo.update_url,
            isForced: Boolean(serverInfo.update_required || serverInfo.force_update),
         });
      } catch {
         setUpdateInfo(null);
      }
   }, []);

   useEffect(() => {
      checkVersion();
   }, [checkVersion]);

   return { updateInfo, recheckVersion: checkVersion };
}
