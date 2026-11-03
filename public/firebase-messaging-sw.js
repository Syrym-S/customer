// Service worker веб-пушей: отдельная программа, которую браузер запускает при
// получении пуша — в том числе когда сайт полностью закрыт. Здесь нет DOM,
// React, i18n и данных пользователя; воркер умеет только нарисовать системную
// плашку и обработать клик по ней. Разрешение у пользователя спрашивает и
// FCM-токен получает приложение (src/services/firebase.js), не этот файл.
//
// Файл должен лежать в корне своего контура: /firebase-messaging-sw.js на
// проде и /staging/firebase-messaging-sw.js со scope /staging/. Воркер
// контролирует только страницы по своему адресу и ниже, поэтому рядом с
// бандлом в js/workspace он бесполезен — раскладывает их deploy.js.

// Файл копируется из public/ как есть, сборщик его не трогает, поэтому SDK
// подключается с CDN в compat-варианте, а не импортом из npm. Мажорную версию
// держать общей с пакетом firebase в package.json.
importScripts(
   'https://www.gstatic.com/firebasejs/13.2.0/firebase-app-compat.js',
);
importScripts(
   'https://www.gstatic.com/firebasejs/13.2.0/firebase-messaging-compat.js',
);

// Конфиг хардкодом: в воркере нет import.meta.env. Секретом эти значения не
// являются — те же поля уезжают в клиентский бандл и видны в DevTools, они
// идентифицируют проект, а не дают доступ к нему.
firebase.initializeApp({
   apiKey: 'AIzaSyBOstfMi_fwSXZ7f5ULud-QY2hKBh9j54A',
   projectId: 'logistics-d2ca7',
   messagingSenderId: '102491456805',
   appId: '1:102491456805:web:ddd19352a0949d106586cc',
});

const messaging = firebase.messaging();

// Рядом с самим воркером: у каждого контура своя копия, и абсолютный путь от
// корня для staging-копии вёл бы в никуда.
const ICON_URL = new URL('icon-192.png', self.location.href).href;
const FALLBACK_TITLE = '360Logistics';
const PUSH_NAVIGATE_MESSAGE = 'push-navigate';

const APP_PATH_PREFIX = '/customer';
const ENTITY_PATH_SEGMENTS = ['leads', 'tenders', 'factorings'];

// Без этого новая версия воркера ждёт закрытия всех старых вкладок, и правки
// в обработке пушей доезжают до пользователей через дни.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) =>
   event.waitUntil(self.clients.claim()),
);

// Сервис уведомлений шлёт только data-only: ключа notification в сообщении
// нет, поэтому плашку целиком рисует воркер. В data четыре строки — title,
// body, link и type; link бывает пустым.
messaging.onBackgroundMessage((payload) => {
   const data = payload.data || {};

   self.registration.showNotification(data.title || FALLBACK_TITLE, {
      body: data.body || '',
      icon: ICON_URL,
      // Ключа id в payload нет, но type уникален для события
      // (shipping.loading_started.{id}), поэтому повторная доставка одного и
      // того же уведомления не плодит отдельные плашки.
      tag: data.type || undefined,
      data: { url: resolveNotificationUrl(data.link) },
   });
});

self.addEventListener('notificationclick', (event) => {
   event.notification.close();

   event.waitUntil(openNotificationTarget(event.notification.data?.url || ''));
});

async function openNotificationTarget(url) {
   const windowClients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
   });

   // Фокусим только вкладку приложения своего контура: на том же origin живут
   // и WordPress, который push-navigate слушать не умеет, и второй контур,
   // который виден прод-воркеру, потому что его scope — корень.
   const appPrefix = `${getBasename()}${APP_PATH_PREFIX}`;

   const appClient = windowClients.find((client) => {
      const clientUrl = new URL(client.url);

      return (
         clientUrl.origin === self.location.origin &&
         startsWithSegment(clientUrl.pathname, appPrefix)
      );
   });

   // Приложение уже открыто: фокусируем вкладку и просим её перейти роутером.
   // Это мгновенно и сохраняет состояние приложения, тогда как openWindow
   // перезагрузил бы SPA целиком. Сообщение слушает src/widgets/app-layout.
   if (appClient) {
      await appClient.focus();

      if (url) {
         appClient.postMessage({ type: PUSH_NAVIGATE_MESSAGE, url });
      }

      return;
   }

   await self.clients.openWindow(url || `${self.location.origin}${appPrefix}`);
}

// Приводит ссылку из уведомления к адресу внутри приложения: расхлопывает
// JSON-экранирование (в сокет-уведомлениях ссылки приходят как \/leads\/5),
// отбрасывает чужой origin и достраивает префикс /customer, если бэк прислал
// путь без него. Пустая строка означает «переходить некуда».
function resolveNotificationUrl(link) {
   const normalizedLink = String(link || '')
      .replaceAll('\\/', '/')
      .trim();

   if (!normalizedLink) {
      return '';
   }

   let url;

   try {
      url = new URL(normalizedLink, self.location.origin);
   } catch {
      return '';
   }

   if (url.origin !== self.location.origin) {
      return '';
   }

   const basename = getBasename();
   const pathname = startsWithSegment(url.pathname, basename)
      ? url.pathname.slice(basename.length) || '/'
      : url.pathname;

   const appPath = resolveAppPath(pathname);

   // Ссылка ведёт не в SPA (например, в /wp-admin) — открываем как есть.
   if (!appPath) {
      return url.href;
   }

   return `${url.origin}${basename}${appPath}${url.search}${url.hash}`;
}

// Контур определяется собственным scope воркера: '' на проде и '/staging' у
// копии со scope /staging/. Полагаться на то, что бэк пришлёт префикс в link,
// нельзя — одна и та же ссылка может прийти в оба контура.
function getBasename() {
   return new URL(self.registration.scope).pathname.replace(/\/$/, '');
}

function startsWithSegment(pathname, prefix) {
   if (!prefix) {
      return false;
   }

   return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

// Копия resolveCustomerNotificationAppPath из
// src/widgets/customer-notifications/model/notifications.helpers.js — classic
// service worker не может импортировать ESM-оригинал. Менять их вместе.
function resolveAppPath(pathname) {
   for (const segment of ENTITY_PATH_SEGMENTS) {
      if (pathname.startsWith(`${APP_PATH_PREFIX}/${segment}/`)) {
         return pathname;
      }

      if (pathname.startsWith(`/${segment}/`)) {
         return `${APP_PATH_PREFIX}${pathname}`;
      }
   }

   return '';
}
