# Контракт бэка для мобилки (роль customer): аудит

Сверка пяти требований бэкендера с текущим кодом.
Дополняет `CAPACITOR_MIGRATION.md` и `NOTIFICATIONS_MOBILE_AUDIT.md` — где
план меняется, это отмечено.

> **Статус на 2026-11-19:** реализован пункт 1 целиком, кроме §1.7 (письма) и
> регистрации: есть `platform.js`, стор сессии, вход `/auth/v2/auth`,
> `logout`/`forgot`/`reset` на v2 в нативе, интерсепторы `Authorization` и 403.
> Пункт 4 не требовал работы. Пункты 2 (флаги) и 5 (`Browser.open`) не начаты.

Главное уточнение к прошлым аудитам: **отдельный bootstrap-эндпоинт не нужен**.
В `CAPACITOR_MIGRATION.md` §2.1 я предлагал завести `GET /customer/v1/bootstrap`,
чтобы заменить `window.APP_DATA`. Теперь видно, что его роль играет ответ
`/auth/v2/auth` (`token`, `rest_url`, `home_url`, `user_id`, `mode`, `geows`,
`notifws`) плюс `GET /customer/v1/features`. Тот пункт плана снимается.

---

## 1. Два режима в одном коде

### 1.1 Флага платформы нет
- [ ] `src/shared/config/platform.js` с `isNative` (`Capacitor.isNativePlatform()`).
      Пока его нет, ветвить нечем. См. `CAPACITOR_MIGRATION.md` §1.3.

### 1.2 Источник окружения
Сейчас всё читается из `window` синхронно, на уровне модулей: `APP_DATA`
(15 файлов, 27 обращений), `NotifWS_Config`, `GeoWS_Config`, `ChatWS_Config`.
Соответствие полей ответа v2 текущим местам чтения:

| Поле из `data` | Где сейчас читается | Что делать |
|---|---|---|
| `token` | — | нет хранилища сессии, нужен стор + `Authorization` |
| `rest_url` | `APP_DATA.rest_url` в `shared/api/api-client.js:5` и `auth/api/client.js` | после входа `baseURL` берётся отсюда |
| `home_url` | — | **решает проблему внутренних ссылок**, см. §1.6 |
| `user_id` | `APP_DATA.user_id` в `shared/helpers/current-user.helpers.js` | в стор; без него не собирается канал сокета |
| `mode` | `APP_DATA.mode` → `isStaging` в двух клиентах | в стор |
| `notifws` | `window.NotifWS_Config` в `notification-realtime-config.js` | см. `NOTIFICATIONS_MOBILE_AUDIT.md` §2.3 |
| `geows` | `window.GeoWS_Config` в `utils/geoTrackingV2.js:17` (`config.key`, `config.ws`) | **уточнить состав полей** — у `notifws` это `user/push/reverb_host/reverb_key`, у `geows` неизвестно, а код ждёт `key` и `ws` |
| — | `window.ChatWS_Config` | в списке бэкенда есть, в коде `customer` не нашёл ни одного чтения. Уточнить, нужен ли он роли customer вообще |

- [ ] Стор сессии с persist в `@capacitor/preferences`, все поля выше.
- [ ] `getNotificationRealtimeConfig()` и `getGeoWsConfig()` — читать из стора с
      фоллбэком на `window.*`, чтобы веб-сборка не поехала.

### 1.3 Base URL до входа и после
Тонкость порядка: `rest_url` приходит **в ответе на вход**, а сам вход куда-то
отправить надо. Это ровно то, что уже сделано флагами сборки:

```
npm run build:dev    → https://customer.360logistics.kz/staging/wp-json/
npm run build:prod   → https://customer.360logistics.kz/wp-json/
```

- [ ] Этот URL — только для входа и восстановления пароля. После входа
      `baseURL` переключается на `data.rest_url`.
- [ ] `rest_url` сохранять в стор: при повторном запуске приложения токен уже
      есть, а логина, который отдал бы URL, не будет.

### 1.4 Авторизация запросов
`shared/api/api-client.js` сейчас: `withCredentials: true` + `X-WP-Nonce` из
страницы. Response-интерсептора **нет вообще** — только два request-овых
(язык и контрактный гейт).

- [ ] Request-интерсептор: `Authorization: Bearer <token>`, без `X-WP-Nonce`,
      при `isNative`.
- [ ] Response-интерсептор на `403`: чистить стор и уводить на повторный вход.
      Токен живёт 7 дней, то есть это штатный сценарий, а не край.
- [ ] Отличать «403 из-за токена» от «403 по правам» — иначе любое отказанное
      действие выкинет пользователя из приложения. Нужен признак от бэка
      (код/`message`) — **вопрос к бэкенду**.
- [ ] `withCredentials` в нативе выключить.

### 1.5 Эндпоинты входа и пароля — сейчас v1
| Операция | Сейчас | Нужно | Файл |
|---|---|---|---|
| вход | `POST /auth/v1/auth` + nonce | `/auth/v2/auth` | `auth/api/auth.js`, зовётся из `auth/pages/Login.jsx` |
| выход | `POST /auth/v1/logout` | `/auth/v2/logout` | `shared/api/auth.api.js` |
| забыли пароль | `POST /auth/v1/forgot-password` | `/auth/v2/forgot-password` | `auth/api/auth.js` |
| сброс пароля | `POST /auth/v1/reset-password` | `/auth/v2/reset-password` | `auth/api/auth.js` |
| регистрация | `POST /auth/v1/register` + nonce | `/auth/v2/register`? | **в списке не названа** |

- [ ] `loginRequestDriver` и `registerRequestDriver` в `auth/api/auth.js` **уже
      бьют в v2** (`/auth/v2/auth`, `/auth/v2/register`) и без nonce — остались
      от драйверского приложения. Переименовать и переиспользовать, а не писать
      заново.
- [ ] Не названы v2-аналоги для `/auth/v1/claim-info` (инвайт-регистрация) и
      `/auth/v1/ecp` (вход по ЭЦП) — **вопросы к бэкенду**.

### 1.6 `home_url` закрывает дыру с внутренними ссылками
`NotificationDetailsModal.jsx:48` резолвит ссылку из уведомления относительно
`window.location.origin`, который в нативе равен `https://localhost`. С
`home_url` появляется, с чем сравнивать.

- [ ] Распознавать внутренние ссылки по `home_url`, а не по `location.origin`.
      Снимает пункт §3.7 из `NOTIFICATIONS_MOBILE_AUDIT.md` наполовину —
      остаётся расширить `resolveCustomerNotificationAppPath`, который знает
      только `leads`, `tenders`, `factorings`.

### 1.7 Письма со ссылками на сайт
`ResetPasswordForm.jsx:26-27` читает `user_id` и `reset_token` из query, а
`AuthLayout.jsx:10` — `?invite=`. Эти ссылки приходят письмом и ведут на
WP-сайт, то есть в мобилке по ним откроется браузер, а не приложение.

- [ ] Решить сценарий: либо deep link на оба случая, либо пользователь
      завершает сброс/приём инвайта в браузере и затем входит в приложении.
      **Вопрос к бэкенду** — какой адрес он кладёт в письмо.

---

## 2. Флаги функций

### 2.1 Эндпоинт уже реализован, но используется на четверть
`GET /customer/v1/features` уже есть — `fetchFeatureFlags()` в
`shared/api/contract.api.js` (с `skipContractGate`), опрашивается из
`useContractGate.js:39`. Но из ответа берётся **только** `contract_signing`
(`contract.store.js:59-66`).

Остальные четыре флага живут отдельно и синхронно, в
`shared/config/feature-flags.js`:

```js
const features = window?.APP_DATA?.features || {};
export const isFactoringEnabled = features.factoring ?? true;
```

В нативе `APP_DATA` пуст → все четыре станут `true` по фоллбэку `?? true`, то
есть **выключенные разделы откроются**.

- [ ] Перевести четыре флага на тот же ответ `/customer/v1/features`.
- [ ] Уточнить состав ответа: комментарий в `contract.api.js` обещает
      `{ aitu_iin_verification, contract_signing }`, а в `APP_DATA.features`
      лежат ещё `factoring`, `tender`, `manufacturer`,
      `advertisement_customer`, `login_ecp`. **Вопрос к бэкенду** — отдаёт ли
      `/features` весь набор.

### 2.2 Флаги вычисляются на импорте — это главная сложность пункта
Асинхронные флаги ломают три места, где значение читается **до рендера**:

| Файл | Что именно |
|---|---|
| `src/router/router.jsx:82-160` | `element:` каждого флагового роута выбирается при импорте модуля — роутер создаётся один раз на уровне модуля |
| `src/pages/dashboard/DashboardPage.jsx:19,33` | `const FactoringsBoundary = isFactoringEnabled ? FactoringsProvider : Fragment` и то же для тендеров — тоже уровень модуля |
| `src/widgets/dashboard/model/stats.config.js:28-35` | внутри функции, но читает те же module-level константы |

`Header.jsx:236-290` и `Dashboard.jsx:85-100` читают флаги внутри компонентов —
они переживут переход на стор без правок.

- [ ] Создавать роутер после загрузки флагов (или заменить тернарники на
      guard-компонент, который читает стор).
- [ ] `DashboardPage` — убрать два module-level `const`.
- [ ] Экран ожидания флагов. В `App.jsx` уже есть такой паттерн для
      контрактного гейта (`hasValidContract === null` → `CircularProgress`) —
      можно встроить туда же, а не плодить второй.

---

## 3. Уведомления, пуши, сокет

Разобрано отдельно в `NOTIFICATIONS_MOBILE_AUDIT.md`. Коротко: формы запросов
§2–§6 памятки уже совпадают с кодом, работа — в источнике токена и `notifws`.
Два найденных там бага остаются в силе: `is_viewed: 0` не считается
непрочитанным (`notifications.helpers.js:123`) и `device: 'web'` захардкожен
(`push.api.js`).

---

## 4. Multipart только POST

**Требование уже соблюдено, правок не нужно.** Проверил все три `PUT` в проекте
— ни один не отправляет `FormData`:

| Вызов | Тело |
|---|---|
| `chat.api.js:81` — правка сообщения в чате лида | `{ message }`, JSON |
| `chat.api.js:142` — правка сообщения в чате поддержки | `{ message }`, JSON |
| `tender.api.js:119` — обновление тендера | объект, JSON |

`PATCH` в проекте нет. Все семь загрузок с `FormData` (профиль ×2, аватар, чат,
жалобы, документы лида, регистрация) идут через `POST`.

- [ ] Зафиксировать правило на будущее: загрузка файлов — только `POST`.
- [ ] Не выставлять `Content-Type` для `FormData` вручную, иначе потеряется
      `boundary`. В `api-client.js:35` он закомментирован — так и оставить.

---

## 5. Ссылки наружу через `Browser.open`

Точки перечислены в `CAPACITOR_MIGRATION.md` §3.4 (семь мест:
`window.location.href` и `window.open(..., '_blank')`). Уточнения по новым
вводным:

- [ ] Подписание `/sign/{token}` — это `sign_url` из `contract.store.js:104`
      (договор с сервисом), `FactoringsProvider.jsx:250`,
      `FactoringVerificationSection.jsx:154` (факторинг) и `AvrSection.jsx:249`
      (АВР). Все четыре — `Browser.open`.
- [ ] Возврат после подписания: `contract.store.js` кладёт маркер в
      `sessionStorage` и ждёт перезагрузки вкладки. С `Browser.open` вкладка не
      перезагружается — нужна либо реакция на закрытие браузера, либо поллинг
      `/customer/contract/v1/status`.
- [ ] **Страница расшаренного лида в мобильную сборку не входит вообще.** Это
      отдельный бандл: `src/PublicApp.jsx` + `src/main-public.jsx` +
      `vite.config.public.js`, со своим `BrowserRouter` и маршрутом
      `shared/:leadId/:token`. В мобилке `LeadShareButton.jsx:118` просто отдаёт
      ссылку наружу — лучше через `@capacitor/share`, а не `Browser.open`:
      пользователь эту ссылку отправляет, а не открывает.

---

## 6. Вопросы к бэкенду

Накопилось поверх шести из `NOTIFICATIONS_MOBILE_AUDIT.md` §5:

1. Состав `data.geows` — код ждёт `key` и `ws` (как в `window.GeoWS_Config`).
2. Нужен ли роли customer `ChatWS_Config` — в коде нет ни одного чтения.
3. Отдаёт ли `GET /customer/v1/features` все флаги (`factoring`, `tender`,
   `manufacturer`, `advertisement_customer`, `login_ecp`), или только
   `contract_signing` и `aitu_iin_verification`?
4. Как отличить `403` из-за истёкшего токена от `403` по правам доступа?
5. Регистрация в мобилке — `/auth/v2/register`? Отдаёт ли она сразу `token` и
   остальной `data`, как вход?
6. v2-аналоги `/auth/v1/claim-info` (инвайт) и `/auth/v1/ecp` (вход по ЭЦП)?
7. Какой адрес в письме сброса пароля и в инвайте — сайт или deep link?

---

## 7. Порядок реализации

1. `platform.js` с `isNative` — без него ветвить нечем.
2. Стор сессии (`token`, `rest_url`, `home_url`, `user_id`, `mode`, `notifws`,
   `geows`) + вход на `/auth/v2/auth` + интерсепторы `Authorization` и `403`.
3. Остальные v2-эндпоинты: logout, forgot/reset password.
4. Флаги через `/customer/v1/features` + разбор трёх module-level мест (§2.2) —
   самый трудоёмкий пункт, лучше делать отдельным шагом.
5. `notifws`/`geows` из стора → сокет, пуши и геотрекинг заводятся уже
   существующим кодом.
6. `Browser.open` / `Share` на внешних ссылках и возврат после подписания.

Пункты 4 и 5 независимы и могут идти параллельно.
