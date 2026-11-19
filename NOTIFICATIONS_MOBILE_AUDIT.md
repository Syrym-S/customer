# Уведомления и пуши под мобилку: аудит перед реализацией

Сверка контракта бэка (вход v2, notif-токен, push-токен, Reverb, история) с
текущим кодом.

> **Статус на 2026-11-19:** реализованы §2.1–§2.5 (стор сессии, вход v2,
> Authorization/403, `notifws` и `user_id` из стора), §3.1 (`device` по
> платформе) и §3.2 (фикс `is_viewed`). Остальное ждёт установки Capacitor и
> ответов бэка — см. §5.

Хорошая новость: **формы запросов §2–§6 почти целиком совпадают с тем, что уже
есть**. Переписывать транспорт и API не нужно — основная работа в том, откуда
берутся токен и конфиг `notifws`: сейчас это cookie-сессия WP и
`window.NotifWS_Config`, которые инлайнит страница.

Приоритеты: **P0** — без этого уведомления не заработают, **P1** — работают, но
со сломанным поведением, **P2** — чистка.

---

## 1. Что уже соответствует контракту

| Пункт контракта | Где в коде | Статус |
|---|---|---|
| §2 `GET /notif/v1/token` | `api/notifications-ws.api.js` | путь совпадает; `readTokenResponseFields` понимает `token`/`access_token`, `success: false` ловится `isFalsyTokenResponse` |
| §3 `POST {push}` | `api/push.api.js` → `savePushTokenApi` | совпадает полностью: `Authorization: Bearer <notif-токен>`, тело `{ token, role, device }` |
| §4 `DELETE {push}` | `api/push.api.js` → `deletePushTokenApi` | совпадает, токен в теле передаётся (`data`) |
| §5 канал `private-notifications.customer.{user}` | `lib/notification-realtime-config.js` → `resolveNotificationChannelName` | собирает `notifications.{role}.{userId}`, префикс `private-` добавляет сам Echo в `.private()` |
| §5 событие `notification` | `lib/transports/reverb.transport.js` | слушает `.notification` (с точкой) — это laravel-echo-синтаксис для события без namespace, то есть именно `notification` |
| §5 `POST https://{host}/api/broadcasting/auth` | `notification-realtime-config.js` → `authEndpoint`, `shared/lib/realtime/create-reverb-echo.js` | собирается как `https://{reverb_host}/api/broadcasting/auth`, Bearer notif-токена уходит в `auth.headers` |
| §5 `wss://{host}/app/{key}` | `create-reverb-echo.js` | `broadcaster: 'reverb'`, `wssPort: 443`, `forceTLS` — путь `/app/{key}` формирует pusher-js сам |
| §5 payload события | `lib/notification-payload.js` | `theme`/`message`/`link`/`type` разбираются, `extractNotificationFromPayload` переживает любую вложенность |
| §6 `GET /customer/v1/notifications` | `api/notifications.api.js` | путь и `page`/`per_page` совпадают, `normalizeNotificationsResponse` читает `results` |
| §1 `verify_registered`/`support` в v2 | `auth/shared/verify-registered.helpers.js` → `getResponseBody` | уже умеет вложенный `data` у v2-эндпоинтов |

Вывод: `push.api.js`, `create-reverb-echo.js`, `notification-payload.js` и
`notifications.api.js` можно не трогать вообще.

---

## 2. P0 — Блокеры

### 2.1 Вход идёт на v1 и не сохраняет токен
`src/auth/pages/Login.jsx` зовёт `loginRequest` → `POST /auth/v1/auth` с
`X-WP-Nonce`, а из ответа читает только `redirect_url` и редиректит браузер.
Токена нет, потому что в вебе его заменяет cookie.

- [ ] Переключить вход на `POST /auth/v2/auth`. **Функция уже есть** —
      `loginRequestDriver` в `src/auth/api/auth.js` бьёт ровно туда и без nonce;
      переименовать в нейтральное имя и использовать из `Login.jsx`.
- [ ] Читать из ответа `data.token`, `data.user_id`, `data.notifws`.
- [ ] Уточнить у бэка: отдаёт ли v2 `verify_registered`, `support` и
      `redirect_url`. Первые два разберутся сами (`getResponseBody` уже
      поддерживает вложенный `data`), а `redirect_url` в мобилке не нужен —
      это WP-URL.
- [ ] То же для регистрации: `registerRequestDriver` → `/auth/v2/register`
      существует, но вернёт ли он `token` + `notifws` — вопрос к бэку.

### 2.2 Нет хранилища сессии
Ни токена, ни `user_id`, ни `notifws` сейчас хранить негде.

- [ ] Стор сессии (`src/shared/model/session.store.js`) с persist в
      `@capacitor/preferences`: `token`, `userId`, `notifws`.
- [ ] Интерсептор `Authorization: Bearer <token>` в `shared/api/api-client.js`
      (и в `auth/api/client.js`, пока клиенты не слиты — см.
      `CAPACITOR_MIGRATION.md` §8).
- [ ] Очистка стора на logout и на `401`.

### 2.3 `notifws` приходит из логина, а код читает его из `window`
`getNotificationRealtimeConfig()` читает `window.NotifWS_Config` /
`window.NotificationWS_Config`, которые инлайнит WP-страница. В мобилке их нет,
а по контракту тот же набор (`user`, `push`, `reverb_host`, `reverb_key`)
приходит в ответе на вход.

- [ ] Переписать `getNotificationRealtimeConfig()` на чтение из стора сессии с
      фоллбэком на `window.*` (чтобы веб-сборка не поехала).
- [ ] `isNotificationRealtimeConfigPresent()` — то же.
- [ ] `lib/notification-transport.js` поллит конфиг до 10 с
      (`CONFIG_WAIT_TIMEOUT_MS`, `CONFIG_POLL_INTERVAL_MS`), потому что WP мог
      отдать `<script>` позже бандла. При чтении из стора поллинг не нужен —
      убрать для нативной ветки, иначе получим лишнюю задержку подключения.

### 2.4 `user_id` берётся из `window.APP_DATA`
`shared/helpers/current-user.helpers.js` → `getCurrentUserId()` читает
`APP_DATA.user_id`. В мобилке вернёт `null`, и тогда
`resolveNotificationChannelName()` отдаст пустую строку, а транспорт бросит
`channel is unknown` — сокет не поднимется молча.

- [ ] Источник — `data.user_id` (и дубль `data.notifws.user`) из стора сессии.

### 2.5 notif-токен запрашивается по cookie, а не по Bearer
`fetchNotificationWsTokenApi` идёт через `apiClient`, у которого
`withCredentials` + nonce. По контракту §2 нужен `Authorization: Bearer
<bearer-токен входа>`.

- [ ] Решается интерсептором из §2.2 — отдельных правок в файле не нужно.

---

## 3. P1 — Работает, но неправильно

### 3.1 `device` захардкожен как `web`
`api/push.api.js`: `{ role, token: pushToken, device: 'web' }`.

- [ ] `device` = `Capacitor.getPlatform()` (`ios` | `android` | `web`), как в §3.
      Иначе бэк будет считать мобильное устройство браузерным, и отвязка
      устройства при logout ударит не по тому токену.

### 3.2 `is_viewed: 0` не распознаётся как «непрочитано»
`model/notifications.helpers.js:123`:

```js
return notification?.is_viewed === false;
```

Контракт §6 отдаёт **число** (`"is_viewed": 0`). `0 === false` → `false`, значит
все уведомления из истории считаются прочитанными: бейдж на колокольчике всегда
0, подсветки в списке нет. Это уже баг, а не только мобильная тема.

- [ ] Нормализовать: непрочитано, если `is_viewed` равно `0`, `false`, `'0'`,
      `null` или отсутствует.

### 3.3 Отметка «прочитано» живёт только в стейте
`Notifications.jsx` ставит `is_viewed: true` локально (строки 141, 169, 186), а
серверную отметку, видимо, делает `GET /customer/v1/notifications/{id}`
(`fetchCustomerNotificationByIdApi`). **В контракте этого эндпоинта нет.**

- [ ] Спросить бэк: существует ли `/customer/v1/notifications/{id}`, отмечает ли
      он прочитанное, и есть ли отдельный `mark-as-read`. Без него после
      перезапуска приложения всё снова непрочитано.

### 3.4 Транспорт может уйти на легаси-сокет
`resolveNotificationTransportDriver()` возвращает `reverb` только если в
конфиге есть и `reverb_host`, и `reverb_key`; иначе — `raw-ws`, который полезет
на хардкод `wss://notification.360logistics.kz/socket`
(`DEFAULT_NOTIFICATION_WS_URL`). Контракт описывает только Reverb.

- [ ] В мобильной ветке зафиксировать `reverb` и не падать на `raw-ws`: лучше
      явная ошибка, чем тихое подключение к другому контуру.
- [ ] `DEFAULT_PUSH_ENDPOINT` (там зашит ещё и `notification.staging...`) больше
      не нужен — `push` приходит в `notifws`.

### 3.5 FCM-токен получается через web-push
`services/firebase.js` — VAPID + регистрация service worker'а
(`public/firebase-messaging-sw.js`). В WebView это не работает; подробности и
план в `CAPACITOR_MIGRATION.md` §4. Контракт на это не влияет (ему нужен просто
`<FCM-токен>`), но получать его придётся из `@capacitor/push-notifications`.

- [ ] Нативная ветка получения токена с сохранением публичного контракта модуля,
      чтобы `model/push-notifications.store.js` не переписывать.

### 3.6 Порядок инициализации push-стора
`push-notifications.store.js` → `init()` сначала тянет профиль, затем, если
`pushEnabled` и разрешение выдано, сам дёргает токен. `unbindCurrentDevice()`
молча выходит, если `token` в сторе пустой — а на мобилке токен приходит
асинхронно, из нативного listener'а `registration`.

- [ ] Пересобрать на подписку: listener кладёт токен в стор → стор зовёт
      `savePushTokenApi`. Регистрировать после каждого входа и при ротации
      токена, как требует §3.
- [ ] `unbindCurrentDevice()` должен брать токен из нативного API, если в сторе
      пусто, иначе logout оставит устройство подписанным.

### 3.7 Ссылка из уведомления — абсолютный WP-URL
`link: "https://customer.360logistics.kz/..."`.
`NotificationDetailsModal.jsx:48` резолвит его относительно
`window.location.origin` (в мобилке это `https://localhost`), а
`resolveCustomerNotificationAppPath` знает только `leads`, `tenders`,
`factorings`.

- [ ] Сопоставлять по хосту из конфига, а не по `location.origin`.
- [ ] Добавить `complaints` и `advertisements` — сейчас они уйдут во внешний
      браузер.
- [ ] Поле `type` (`"lead.status.123"`) уже парсится `resolveNotificationType`,
      но для роутинга не используется. Это более надёжный источник перехода,
      чем URL — стоит задействовать.

---

## 4. P2 — Чистка и мелочи

- [ ] `expires_at` из §2 игнорируется. Сейчас notif-токен запрашивается заново
      на каждый вызов (`savePushTokenApi`, `deletePushTokenApi` и старт сокета —
      три запроса на цикл), а переполучается только при auth-ошибке канала
      (`MAX_AUTH_RETRIES = 2`). Закэшировать по `expires_at`.
- [ ] История грузится только первой страницей: `loadNotifications()` зовёт
      `fetchCustomerNotificationsApi()` без аргументов, хотя ответ отдаёт
      `total`/`page`/`per_page`, а сама функция параметры принимает. На мобилке
      нужна подгрузка.
- [ ] Хардкоды хостов в `notification-realtime-config.js:12,19-20` убрать после
      перехода на `notifws`.
- [ ] `role` в `notifws` контрактом не передаётся — остаётся
      `NOTIFICATION_CHANNEL_ROLE = 'customer'`, это ок, но стоит зафиксировать,
      что источник один.
- [ ] Реконнект сокета по `App.resume` / отключение по `App.pause`
      (`CAPACITOR_MIGRATION.md` §6) — без этого после сворачивания соединение
      висит мёртвым и уведомления перестают доходить.

---

## 5. Вопросы к бэкенду (до начала реализации)

1. `/auth/v2/auth` — отдаёт ли `verify_registered`, `support`, `redirect_url`?
2. `/auth/v2/register` — возвращает ли `token` и `notifws`, или после
   регистрации нужен отдельный вход?
3. Есть ли `GET /customer/v1/notifications/{id}` и чем отмечать уведомление
   прочитанным?
4. `is_viewed` — всегда число (`0`/`1`)?
5. Время жизни bearer-токена входа и есть ли refresh.
6. Нужен ли `notifws` где-то ещё, кроме ответа на вход (например, эндпоинт, чтобы
   перечитать его без повторного логина)?

---

## 6. Порядок реализации

1. Стор сессии + Authorization-интерсептор (§2.2) и вход через v2 (§2.1).
2. `notifws` и `user_id` из стора вместо `window` (§2.3, §2.4) — после этого
   сокет и push-токены начнут работать существующим кодом.
3. `device` по платформе (§3.1) и фикс `is_viewed` (§3.2) — две мелкие правки с
   заметным эффектом.
4. Нативный FCM и пересборка push-стора (§3.5, §3.6).
5. Роутинг по ссылке/типу (§3.7), пагинация и кэш токена (§4).
