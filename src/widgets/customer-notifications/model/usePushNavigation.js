import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { appBasename } from '../../../shared/api/api-client';

const PUSH_NAVIGATE_MESSAGE = 'push-navigate';

// Клик по фоновому уведомлению: воркер сфокусировал эту вкладку и прислал
// адрес. Переходим роутером, а не перезагрузкой, чтобы не терять состояние
// приложения. Отправляет сообщение public/firebase-messaging-sw.js.
export function usePushNavigation() {
   const navigate = useNavigate();

   useEffect(() => {
      if (!('serviceWorker' in navigator)) {
         return;
      }

      function handleMessage(event) {
         if (event.data?.type !== PUSH_NAVIGATE_MESSAGE || !event.data.url) {
            return;
         }

         const url = new URL(event.data.url);
         const basename = appBasename === '/' ? '' : appBasename;

         navigate(
            `${url.pathname.slice(basename.length)}${url.search}${url.hash}`,
         );
      }

      navigator.serviceWorker.addEventListener('message', handleMessage);

      return () => {
         navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
   }, [navigate]);
}
