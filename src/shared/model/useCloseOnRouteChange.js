import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function useCloseOnRouteChange(onRouteChange) {
   const location = useLocation();
   const handlerRef = useRef(onRouteChange);
   const pathnameRef = useRef(location.pathname);

   useEffect(() => {
      handlerRef.current = onRouteChange;
   });

   useEffect(() => {
      if (pathnameRef.current === location.pathname) {
         return;
      }

      pathnameRef.current = location.pathname;
      handlerRef.current?.();
   }, [location.pathname]);
}
