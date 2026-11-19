import { useEffect, useRef } from 'react';

import { isNative } from '../config/platform';
import { pushBackHandler } from './back-handlers';

export function useBackHandler(handler) {
   const handlerRef = useRef(handler);

   handlerRef.current = handler;

   const isActive = isNative && Boolean(handler);

   useEffect(() => {
      if (!isActive) {
         return undefined;
      }

      return pushBackHandler(() => {
         handlerRef.current?.();
      });
   }, [isActive]);
}
