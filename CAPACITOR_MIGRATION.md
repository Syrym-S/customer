# Перенос `customer` под Capacitor (Android) — аудит и план

Статус: **только аудит**, код не менялся. Документ фиксирует, что мешает
собрать текущий воркспейс как Android-приложение, и что нужно добавить.

Отправная точка: проект — не самостоятельный SPA, а **бандл-плагин для
WordPress**. Он собирается в IIFE-библиотеку (`vite.config.js`, `build.lib`),
грузится в страницу, которую отдаёт WP, и получает оттуда окружение через
`window.APP_DATA`, cookie-сессию и `X-WP-Nonce`. В нативном WebView ничего из
этого нет. Основная часть работы — не «обернуть в Capacitor», а **отвязать
приложение от WP-страницы как от рантайма**.

Легенда приоритетов:
- **P0** — блокер, без этого приложение не запустится/не авторизуется.
- **P1** — запустится, но ключевой сценарий сломан.
- **P2** — качество, UX, релизная гигиена.

---

## 1. Сборка и точка входа

### 1.1 P0 — Добавить обычную SPA-сборку
Сейчас `vite.config.js` собирает `lib` + `formats: ['iife']`, `fileName:
index.js`, а `index.html` в корне используется только dev-сервером и ссылается
на `/src/main.jsx`. В `dist/` нет `index.html` — Capacitor нечего положить в
`webDir`.

Нужно:
- [ ] `vite.config.capacitor.js`: обычная сборка приложения (без `build.lib`),
      `base: './'` (в WebView пути должны быть относительными),
      `build.outDir: 'dist-app'`, `emptyOutDir: true`.
- [ ] Отдельный `index.html` для нативной сборки (или вынести общий шаблон) —
      с `viewport-fit=cover`, без ссылок на WP-ассеты.
- [ ] Скрипты в `package.json`: `build:capacitor`, `cap:sync`, `cap:android`.
- [ ] Не трогать `vite.config.js` / `vite.config.public.js` / `deploy.js` —
      веб-контур (FTP, `/customer`, shared-бандл) остаётся как есть.
- [ ] Убрать из нативной сборки `public/firebase-messaging-sw.js` (service
      worker в WebView не нужен и бесполезен, см. §4).

### 1.2 P0 — Снять `define: process.env.NODE_ENV = 'production'`
В нативной сборке этот хак из `vite.config.js` не нужен и мешает dev-режиму
(`import.meta.env.DEV` уже используется в
`src/widgets/customer-leads/ui/lead-details/sections/AvrSection.jsx:289`).

### 1.3 P1 — Флаг платформы
- [ ] `src/shared/config/platform.js`: `isNative`, `platform` (на базе
      `Capacitor.isNativePlatform()` / `getPlatform()`).
- [ ] Весь нативный код изолировать за этим флагом, чтобы веб-бандл собирался
      из того же `src/` без регрессий.

---

## 2. Окружение: `window.APP_DATA` → bootstrap-запрос

### 2.1 P0 — Источник конфигурации
`window.APP_DATA` читается в 27 местах, 15 файлов:

| Файл | Что читает |
|---|---|
| `src/shared/api/api-client.js` | `rest_url`, `nonce`, `mode` |
| `src/auth/api/client.js` | `rest_url`, `nonce`, `mode` |
| `src/shared/config/feature-flags.js` | `features.*` (factoring, tender, manufacturer, advertisement_customer) |
| `src/shared/helpers/current-user.helpers.js` | `user_id` |
| `src/shared/model/contract.store.js` | флаг контрактного гейта |
| `src/shared/i18n/language.js` | язык по умолчанию |
| `src/shared/ui/SupportContacts.jsx` | контакты поддержки |
| `src/auth/pages/Login.jsx`, `Register.jsx` | `nonce` |
| `src/auth/shared/ecp-login.helpers.js` | `features.login_ecp` |
| `src/auth/shared/verify-registered.helpers.js` | контакты поддержки |
| `src/widgets/header/Header.jsx` | `mode` |
| `src/widgets/customer-notifications/lib/transports/reverb.transport.js` | конфиг сокета |
| `src/utils/geoTrackingV2.js` | + отдельный `window.GeoWS_Config` |
| `src/main-public.jsx` | только веб (shared-lead), в нативе не участвует |

Нужно:
- [ ] Эндпоинт на бэке `GET /customer/v1/bootstrap`, отдающий то же, что WP
      сейчас инлайнит: `mode`, `features`, `user_id`, контакты поддержки,
      конфиг гео-сокета (`GeoWS_Config`), конфиг уведомлений.
- [ ] Слой `src/shared/config/app-data.js`: единая точка доступа
      (`getAppData()`), с асинхронной инициализацией **до** монтирования React.
- [ ] Перевести все 15 файлов на `getAppData()` вместо `window.APP_DATA`.
      Критично для `feature-flags.js` — там значения читаются **на уровне
      модуля** (`const features = window?.APP_DATA?.features || {}`), то есть
      до любого запроса; в нативе это гарантированно пустой объект и все
      разделы включатся по умолчанию (`?? true`).
- [ ] Экран загрузки/ошибки bootstrap: в вебе страница не могла не содержать
      `APP_DATA`, в нативе запрос может упасть (нет сети при старте).

### 2.2 P0 — Base URL
`DEFAULT_BASE_URL = 'https://customer.360logistics.kz/wp-json/'` захардкожен в
двух клиентах (`src/shared/api/api-client.js:5`, `src/auth/api/client.js:5`),
а реальный берётся из `APP_DATA.rest_url`.

- [ ] `.env.capacitor` c `VITE_API_MODE=api` и обязательным
      `VITE_API_BASE_URL` — в нативе относительных путей к API нет.
- [ ] Отдельные значения для prod/staging контуров (сейчас контур определяется
      по `window.location.pathname === '/staging'` — в нативе это не работает,
      см. §3).

---

## 3. Авторизация и навигация

### 3.1 P0 — Cookie + nonce не работают в WebView
Сейчас: `apiClient` — `withCredentials: true` + `X-WP-Nonce` из страницы;
логин (`POST /auth/v1/auth`) просто создаёт WP-cookie, и приложение
полагается на неё. В нативе origin WebView — `https://localhost`, домен API
другой: cookie становится third-party, nonce взять негде.

Нужно (требует работы на бэке):
- [ ] Токенная авторизация для мобильного клиента (Bearer/JWT) — выдача на
      `/auth/v1/auth` и `/auth/v1/register`, refresh, отзыв на logout.
- [ ] Хранение токена в `@capacitor/preferences` (или secure storage), **не** в
      `localStorage`.
- [ ] Интерсептор `Authorization` в **обоих** axios-клиентах.
- [ ] Обработка `401`: очистка токена + переход на `/auth/login` роутером.
- [ ] Если cookie всё же остаётся: `androidScheme: 'https'` + CORS на бэке с
      `Access-Control-Allow-Origin: https://localhost` и
      `Access-Control-Allow-Credentials: true`. Это хрупкий путь, токены
      предпочтительнее.

### 3.2 P0 — Роутер и basename
`src/router/router.jsx` — `createBrowserRouter` с `basename: appBasename`,
который вычисляется из `window.location.pathname` (`'/'` или `'/staging'`), а
все пути лежат под префиксом `customer/...`. В нативе путь всегда `/`, а
префикс `customer` — артефакт WP-роутинга.

- [ ] Решить: `createHashRouter` (безопаснее для WebView, не ломает deep-reload)
      либо `createBrowserRouter` с `basename: '/'`.
- [ ] Убрать `/customer` из путей для нативной сборки (в `src/` ~136 вхождений
      строк `/customer...`) **или** оставить префикс как есть и просто не
      использовать его в ссылках. Второе дешевле, но оставляет мусор в URL.
- [ ] `HIDDEN_SECTION_ELEMENT` = `<Navigate to="/customer/dashboard">` —
      абсолютный путь, зависит от решения выше.
- [ ] `appBasename` (`src/shared/api/api-client.js`) больше не может
      определять staging — вынести контур в env/bootstrap.

### 3.3 P0 — Жёсткие редиректы `window.location`
Все эти места в нативе перезагружают WebView по несуществующему пути:

| Файл | Что делает |
|---|---|
| `src/auth/pages/Login.jsx:66,69` | после логина → `redirect_url` или `/customer` |
| `src/auth/pages/Register.jsx:246` | после регистрации → `/customer` |
| `src/widgets/header/Header.jsx:168` | logout → `/auth/login` |
| `src/pages/profile/ProfilePage.jsx:406` | удаление аккаунта → `/auth/login` |
| `src/shared/ui/ErrorScreen.jsx:102` | `location.reload()` |

- [ ] Заменить на `useNavigate()` / `navigate(..., { replace: true })`.
- [ ] `redirect_url` с бэка в нативе игнорировать (это WP-URL) — маппить на
      внутренний роут.

### 3.4 P1 — Внешние URL и возврат в приложение
`window.location.href = url` и `window.open(url, '_blank')` ведут на внешние
сервисы подписания/ЭЦП:

| Файл | Поток |
|---|---|
| `src/auth/shared/EcpLoginButton.jsx:26` | вход по ЭЦП (`/auth/v1/ecp` → внешний URL) |
| `src/shared/model/contract.store.js:104` | подписание договора (Aitu `sign_url`) |
| `src/widgets/customer-factorings/model/FactoringsProvider.jsx:250` | подписание факторинга |
| `src/widgets/customer-factorings/ui/factorings-details/sections/FactoringVerificationSection.jsx:154` | то же |
| `src/widgets/customer-leads/ui/lead-details/sections/AvrSection.jsx:249` | подписание АВР |
| `src/widgets/customer-leads/ui/lead-details/LeadShareButton.jsx:118` | шаринг ссылки на заявку |
| `src/widgets/customer-notifications/ui/NotificationDetailsModal.jsx:48-60` | ссылки из уведомлений |

- [ ] `@capacitor/browser` (`Browser.open`) вместо `window.open`/`location.href`.
- [ ] `@capacitor/share` для `LeadShareButton` — нативный шит вместо нового окна.
- [ ] **Возврат после подписания**: deep link (`App.addListener('appUrlOpen')`) +
      intent-filter в манифесте + согласование redirect-URI с бэком/Aitu/ЭЦП.
- [ ] Маркер `CONTRACT_SIGN_REDIRECT_MARKER_KEY` в `sessionStorage`
      (`contract.store.js:103`, `useContractGate.js:33`) рассчитан на
      перезагрузку той же вкладки. С `Browser.open` вкладка не перезагружается —
      логику ожидания результата подписания нужно переписать на событие
      закрытия браузера / deep link / поллинг статуса.
- [ ] `NotificationDetailsModal.jsx:48` строит URL через
      `window.location.origin` — в нативе это `https://localhost`, внутренние
      ссылки нужно распознавать по домену из bootstrap.

---

## 4. Push-уведомления

Сейчас — **web push**: `firebase/messaging`, VAPID-ключ, регистрация
`public/firebase-messaging-sw.js` (`src/services/firebase.js`), а переход по
клику приходит сообщением от service worker
(`src/widgets/customer-notifications/model/usePushNavigation.js`). В Android
WebView это не работает.

- [ ] `@capacitor/push-notifications` + FCM: `google-services.json`, Gradle-плагин.
- [ ] Нативная ветка в `src/services/firebase.js`: `register()`,
      `addListener('registration')` вместо `getToken({ vapidKey, swRegistration })`.
      Сохранить публичный контракт модуля (`isWebPushSupported`,
      `getWebPushPermission`, `requestWebPushToken`, `refreshWebPushToken`,
      `deleteWebPushToken`), чтобы `push-notifications.store.js` не переписывать.
- [ ] `src/widgets/customer-notifications/api/push.api.js`: `device: 'web'` → `'android'`
      (бэк должен принимать это значение; иначе отвязка устройства при logout —
      `Header.jsx` → `unbindCurrentDevice()` — будет бить не по тому токену).
- [ ] Замена `usePushNavigation`: `pushNotificationActionPerformed` → `navigate()`.
- [ ] Foreground-уведомления: в WebView системная «шторка» не показывается при
      открытом приложении — показывать свой тост (`NotificationsColumn` уже есть).
- [ ] Android 13+: runtime-запрос `POST_NOTIFICATIONS`.
- [ ] Notification channel (иконка, звук, importance), иконка статус-бара.
- [ ] Deep-link payload: бэк присылает абсолютные WP-ссылки — нужен маппинг в
      роуты приложения (та же проблема, что в §3.4).

---

## 5. Файлы: загрузка и скачивание

### 5.1 P1 — Выбор файлов
`<input type="file">` в Android WebView работает, но без доступа к камере и с
плохим UX. Точки:
`src/auth/shared/DocumentUploadField.jsx:135`,
`src/features/create-lead/ui/create-lead-modal/steps/DocumentsStep.jsx:128`,
`src/widgets/chat-widget/ui/ChatDetailView.jsx:1101`,
`src/widgets/customer-complaints/ui/ComplaintAttachmentsField.jsx:215`,
`src/widgets/customer-leads/ui/lead-details/sections/LeadDocumentsSection.jsx:120`,
`src/widgets/customer-profile/ui/AvatarCropModal.jsx:374`,
`src/widgets/customer-profile/ui/ProfileDocumentUpdateField.jsx:137`.

- [ ] `@capacitor/camera` (`pickImages` / `getPhoto`) для фото и аватара,
      `@capacitor-community/file-opener` или `@capawesome/capacitor-file-picker`
      для документов/видео.
- [ ] Разрешения: `CAMERA`, `READ_MEDIA_IMAGES`/`READ_MEDIA_VIDEO` (Android 13+).
- [ ] `AvatarCropModal` + `avatar-crop.helpers.js` работают с `File`/`Blob` и
      `URL.createObjectURL` — проверить, что путь из Camera (`webPath`)
      конвертируется в `Blob` корректно.
- [ ] Видео до десятков МБ (`accept` в `DocumentsStep`/`LeadDocumentsSection`
      допускает mp4/mkv/avi) — проверить лимиты памяти WebView и таймауты axios.

### 5.2 P1 — Скачивание
Паттерн «`new Blob` → `createObjectURL` → `<a download>` → `click()`» в
WebView молча ничего не делает. Точки:
`src/features/export-leads-report/model/export-leads-report.helpers.js:38-42`,
`src/widgets/chat-widget/ui/ChatDetailView.jsx:222-226,873`,
`src/widgets/customer-leads/ui/lead-details/sections/AvrSection.jsx:44-51`,
`src/widgets/customer-leads/ui/lead-details/components/documents/DocumentPreviewDialog.jsx:88`,
`src/widgets/customer-profile/ui/ContractDocumentCard.jsx:54-61`,
`src/widgets/customer-factorings/ui/file-input/LegalDocumentViewer.jsx:28-32`,
`src/widgets/customer-complaints/ui/complaints-details/sections/ComplaintFilesSection.jsx:72`,
`src/widgets/customer-tenders/ui/tender-details/sections/TenderDocumentsSection.jsx:255`.

- [ ] Единый хелпер `saveAndOpenFile(blob, filename)`:
      `@capacitor/filesystem` (запись в `Directory.Cache`/`Documents`) →
      `FileOpener` / `Share`.
- [ ] Прокинуть его во все перечисленные точки (там сейчас дублируется один и
      тот же код — заодно повод вынести его в `shared`).
- [ ] PDF-просмотр (`DocumentPreviewDialog`, `LegalDocumentViewer`) — в WebView
      встроенного PDF-вьюера нет: открывать системным приложением.

---

## 6. Realtime и карты

- [ ] P1 — WebSocket (`laravel-echo` + `pusher-js`): сам транспорт в WebView
      работает. Нужно: переподключение по `App.addListener('resume')` и
      отключение на `pause` — иначе после сворачивания соединение «висит» мёртвым.
      Точки: `src/shared/lib/realtime/create-reverb-echo.js`,
      `src/widgets/customer-notifications/lib/transports/*`,
      `src/utils/geoTrackingV2.js`.
- [ ] P1 — `window.GeoWS_Config` (`geoTrackingV2.js:17`) инлайнится бэком в
      страницу → перенести в bootstrap (§2.1). Без него живой трекинг молча
      отключается (`console.warn` и `return null`).
- [ ] P2 — Захардкоженные хосты: `notification.360logistics.kz`,
      `notification.v2/staging...` (`notification-realtime-config.js:12,19-20`),
      `geo.v2.360logistics.kz` — вынести в env/bootstrap, иначе переключение
      контура в приложении невозможно.
- [ ] P2 — Leaflet: тайлы грузятся по сети, нужен внятный оффлайн-стейт;
      проверить жесты (pinch-zoom) и конфликт со скроллом страницы.

---

## 7. Нативная обвязка и UX

- [ ] P0 — `capacitor.config.json`: `appId`, `appName`, `webDir: 'dist-app'`,
      `server.androidScheme: 'https'`. `allowNavigation` **не** открывать
      (внешние URL — через `@capacitor/browser`).
- [ ] P0 — `npx cap add android`, `android/` в репозиторий, `.gitignore` для
      build-артефактов и keystore.
- [ ] P1 — `AndroidManifest.xml`: `INTERNET`, `POST_NOTIFICATIONS`, `CAMERA`,
      `READ_MEDIA_*`, intent-filter для deep links, `FileProvider` для шаринга.
- [ ] P1 — Аппаратная кнопка «Назад»: `App.addListener('backButton')` —
      закрывать модалки/дровер, а на корневом роуте спрашивать выход. Модалок в
      проекте много (`AppDialog`, детали заявки/тендера/факторинга, бургер в
      `Header`), без обработчика «назад» будет выкидывать из приложения.
- [ ] P1 — `src/shared/ui/MobileViewportModal.jsx` — модалка «откройте на
      компьютере» показывается при `breakpoints.down('sm')`, то есть в
      приложении будет выскакивать всегда. Отключить при `isNative`.
- [ ] P1 — Safe area: `viewport-fit=cover` + `env(safe-area-inset-*)` в
      `AppLayout`, `Header`, нижних панелях и `AppDialog`.
- [ ] P1 — `@capacitor/keyboard`: `resize` mode, подскролл активного инпута
      (длинные формы регистрации/создания заявки), `scrollAssist`.
- [ ] P2 — `@capacitor/splash-screen`, `@capacitor/status-bar` (цвет под тему,
      учесть RTL/тёмную тему из `src/theme/`).
- [ ] P2 — CSS для WebView: `overscroll-behavior: none`,
      `-webkit-tap-highlight-color: transparent`, запрет выделения текста на
      кнопках, запрет double-tap zoom.
- [ ] P2 — Иконки и сплэш: `@capacitor/assets` (есть только `public/icon.png`,
      `icon-192.png`).
- [ ] P2 — `@capacitor/network`: баннер «нет сети» вместо пустых экранов —
      сейчас весь UI рассчитан на постоянное соединение.

---

## 8. Технический долг после мерджа `auth`

Последний коммит перенёс `src/auth/**` «как есть». Перед нативной сборкой это
стоит свести, иначе каждую правку (токен, язык, base URL) придётся делать
дважды:

- [ ] P1 — **Два axios-клиента**: `src/auth/api/client.js` и
      `src/shared/api/api-client.js`. Дублируют `DEFAULT_BASE_URL`, `isStaging`,
      чтение `nonce`. У auth-клиента при этом **нет** `withCredentials` и нет
      интерсепторов языка/контрактного гейта. Объединить в один клиент.
- [ ] P1 — **Два инстанса i18n**: `src/shared/i18n/index.js` (глобальный) и
      `src/auth/i18n/index.js` (`createInstance`), оба на одном ключе
      `localStorage['language']`, но с разными кодами (`kz` против `kk`, в
      auth-ветке есть маппинг-костыль `savedLanguage === "kz" ? "kk"`). Наборы
      локалей тоже расходятся: в shared есть `uk`, в auth — нет. Свести к одному
      инстансу и одному словарю кодов.
- [ ] P1 — `localStorage`/`sessionStorage` → `@capacitor/preferences`:
      `src/auth/i18n/index.js:19,53`, `src/shared/i18n/language.js:23,35`,
      `src/shared/model/contract.store.js:103`,
      `src/shared/model/useContractGate.js:33`,
      `src/widgets/customer-verification/model/email-verification.helpers.js:49,60,75`.
      В WebView `localStorage` может быть вычищен системой при очистке кеша —
      для языка это терпимо, для токена (§3.1) недопустимо.
- [ ] P2 — `src/auth/**` использует двойные кавычки и 2 пробела, остальной
      проект — одинарные и 3 пробела; `eslint.config.js` это не ловит. Привести
      к одному стилю, иначе диффы будут шумными.
- [ ] P2 — Хардкод русских строк в `Login.jsx`/`ecp-login.helpers.js`
      (`"Введите email"`, `"В доступе отказано"`) прогоняется через `t()` как
      ключ — работает, но ломает переводы. Вынести в локали.

---

## 9. Релиз и проверка

- [ ] P2 — `npm run build:capacitor && npx cap sync android` в одной команде.
- [ ] P2 — Версионирование: `versionCode`/`versionName` из `package.json`.
- [ ] P2 — Подпись: keystore вне репозитория, сборка release-AAB.
- [ ] P2 — Опционально live-update (`@capgo/capacitor-updater`) — чтобы правки
      фронта не требовали релиза в Google Play.
- [ ] P2 — Чек-лист ручной проверки на устройстве: логин (пароль + ЭЦП),
      регистрация с загрузкой документов, подписание договора и возврат в
      приложение, push в foreground/background/при убитом приложении, выгрузка
      отчёта и открытие PDF, чат с вложениями, карта и живой трекинг, смена
      языка и RTL, logout и повторный вход, поведение «назад» на всех экранах.

---

## Порядок работ (предлагаемый)

1. **Фундамент**: SPA-сборка (§1) + `capacitor.config` + `cap add android` (§7) —
   получить запускаемое приложение с заглушкой вместо API.
2. **Окружение**: bootstrap-эндпоинт и `app-data.js` (§2) — убрать `APP_DATA`.
3. **Авторизация**: токены на бэке и в клиенте, роутер, редиректы (§3) —
   довести до «вошёл и вижу дашборд».
4. **Консолидация auth-модуля** (§8) — до того, как нативных ветвлений станет
   много.
5. **Нативные фичи**: push (§4), файлы (§5), внешние URL и deep links (§3.4).
6. **Полировка**: realtime-реконнект (§6), UX и safe area (§7), релиз (§9).

Пункты 2 и 3 требуют доработок на бэкенде (bootstrap + токенная авторизация +
redirect-URI для подписания) — их стоит согласовать до начала работ, это
критический путь.
