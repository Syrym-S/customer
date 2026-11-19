import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { isNative } from '../config/platform';
import { useSessionStore } from './session.store';

const LOGIN_ROUTE = '/auth/login';

export function useSessionGuard() {
   const navigate = useNavigate();

   const token = useSessionStore((state) => state.token);
   const acknowledgeSessionExpiry = useSessionStore(
      (state) => state.acknowledgeSessionExpiry,
   );

   const isAuthorized = !isNative || Boolean(token);

   useEffect(() => {
      if (isAuthorized) {
         return;
      }

      acknowledgeSessionExpiry();
      navigate(LOGIN_ROUTE, { replace: true });
   }, [isAuthorized, acknowledgeSessionExpiry, navigate]);

   return isAuthorized;
}
