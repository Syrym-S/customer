# Capacitor (Android): что установлено и как этим пользоваться

Статус: платформа поднята, сборка и `cap sync` проходят, вход на staging
работает на эмуляторе. Для пушей нужен `google-services.json`, для релиза —
keystore и иконки (см. §5).

---

## 1. Что установлено

Capacitor 8 и восемь плагинов — все подхватываются `cap sync`:

| Пакет | Для чего в коде |
|---|---|
| `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` | платформа |
| `@capacitor/app` | кнопка «Назад» (`useAndroidBackButton`) |
| `@capacitor/browser` | внешние ссылки и подписание (`external-link.js`) |
| `@capacitor/filesystem` + `@capacitor-community/file-opener` + `@capacitor/share` | сохранение и открытие файлов (`download-file.js`) |
| `@capacitor/camera` | «Сделать фото» (`pick-files.js`) |
| `@capacitor/push-notifications` | пуши (`services/firebase.js`, `usePushNavigation`) |
| `@capacitor/preferences` | поставлен заранее под перенос хранилища сессии |

Хелперы раньше читали плагины через `window.Capacitor.Plugins`, потому что
пакетов не было. Теперь всё на обычных импортах; `isNative` по-прежнему
решает, какая ветка исполняется, поэтому веб не задет.

---

## 2. Команды

```
npm run cap:sync               # сборка + cap sync android (prod API)
npm run cap:sync:dev           # сборка + cap sync android (staging API)
npm run cap:sync:staging       # то же, но без обфускации (staging API)
```

APK собирается и запускается из Android Studio: в package.json команд для
этого нет, синк кладёт бандл в `android/app/src/main/assets/public`, дальше
кнопка Run.

Веб не затронут: `npm run dev`, `build`, `build:public`, `deploy` работают как
раньше.

### Чем нативная сборка отличается от веб-сборки

| | веб (`vite.config.js`) | мобилка (`vite.config.capacitor.js`) |
|---|---|---|
| формат | IIFE-библиотека для WordPress | обычный SPA с `index.html` |
| `base` | `/customer` | `./` (в WebView нужны относительные пути) |
| выход | `dist/` | `dist-app/` |
| `publicDir` | `public/` | выключен — `firebase-messaging-sw.js` в WebView не нужен |
| `VITE_API_MODE` | из `.env.production` | зашит как `api`, моки исключены |
| роутер | `createBrowserRouter`, basename `/` или `/staging` | `createHashRouter`, basename всегда `/` |

Роутер выбран hash-овый: в WebView это снимает зависимость от серверного
фолбэка на `index.html` при перезагрузке на вложенном пути. Пути роутов
(`customer/...`) не менялись, адреса внутри приложения выглядят как
`#/customer/leads/5`.

---

## 3. CORS — проверено, доработок не требуется

**Решение: `CapacitorHttp` не включаем.** Он снимает CORS, но в ряде версий
ломает `responseType: 'blob'`, а на блобах держится всё скачивание файлов и
предпросмотр документов. Поэтому запросы идут обычным `fetch`/XHR из WebView,
и CORS действует так же, как в браузере.

`androidScheme` выставлен в `https`, значит origin приложения —
**`https://localhost`**. Бэкенд уже отдаёт нужные заголовки (проверено
19.11.2026):

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce
Access-Control-Expose-Headers: Content-Disposition
```

Preflight `OPTIONS` отвечает `200` на `auth/v2/auth`, `auth/v2/register`,
`auth/v2/forgot-password`, `app/v1/support`; сервис уведомлений
(`notification.v2.360logistics.kz`) — `204` с теми же заголовками.

`*` покрывает `https://localhost`, `Authorization` разрешён — Bearer проходит.
`Accept-Language` в списке нет, но он safelisted и preflight не требует.
`Expose-Headers: Content-Disposition` нужен для имён скачиваемых файлов.
`Access-Control-Allow-Credentials` не нужен: в нативе `withCredentials`
выключен.

Вход и выход на staging проверены на эмуляторе — работают.

---

## 4. Пуши: нужен `google-services.json`

Без него Gradle молча не применяет плагин Google Services и пуши не работают —
`android/app/build.gradle` проверяет наличие файла и пишет об этом в лог.

1. Firebase Console → проект **`logistics-d2ca7`** (тот же, что в
   `src/services/firebase.js`).
2. Add app → Android, package name **`kz.logistics.customer`**.
3. Скачать `google-services.json` и положить в `android/app/`.
4. `npm run cap:sync`.

Файл добавлен в `.gitignore` — он содержит ключи проекта, в репозиторий не
коммитим, передаём отдельно.

Уже настроено: разрешение `POST_NOTIFICATIONS`, канал уведомлений
`customer-notifications` (создаётся из кода при регистрации токена и объявлен
в манифесте как канал по умолчанию), иконка уведомления.

---

## 5. Что осталось до релизной сборки

- [ ] `google-services.json` (§4) — иначе пуши не поднимутся.
- [ ] Иконки и сплэш: `@capacitor/assets` вместо дефолтных
      `ic_launcher` (сейчас стоит заглушка Capacitor).
- [ ] Keystore вне репозитория и `signingConfig` для release-сборки;
      `*.keystore` и `*.jks` уже в `.gitignore`.
- [ ] `versionCode`/`versionName` в `android/app/build.gradle` (сейчас `1`/`1.0`).
- [ ] Safe area (`env(safe-area-inset-*)`), клавиатура, статус-бар — пункты
      из `CAPACITOR_MIGRATION.md` §7.
- [ ] Хранилище сессии на `@capacitor/preferences` (пакет уже стоит; сейчас
      `localStorage`, всё изолировано в `shared/model/session.storage.js`).
- [ ] Реконнект сокетов по `App.resume`/`pause`.
- [ ] Обработчик `appUrlOpen` — intent-фильтры объявлены, но JS-навигации по
      deep link нет, ссылка открывает приложение на стартовом роуте.

### Deep links

В манифесте объявлены два intent-filter: `https://customer.360logistics.kz/customer/*`
(с `autoVerify`) и кастомная схема `kz.logistics.customer://`. Чтобы первый
заработал, на домене нужен `/.well-known/assetlinks.json` с отпечатком
подписи — это делается после того, как появится релизный keystore.

Возврат после подписания договора deep link **не** требует: он построен на
событии закрытия `Browser`, см. `contract.store.js`.

---

## 6. Как проверять

На устройстве или эмуляторе:

```
npm run cap:sync:dev
```

Дальше Run в Android Studio. Порядок именно такой: `android/app/src/main/assets/public`
лежит в `.gitignore`, и без синка в APK уедет бандл с прошлой сборки — молча,
без ошибки сборки.

В браузере нативную ветку можно включить, не собирая приложение — добавить
перед `<script type="module">` в `index.html`:

```html
<script>
  window.Capacitor = {
    isNativePlatform: () => true,
    getPlatform: () => 'android',
  };
</script>
```

Так проверяются v2-эндпоинты, Bearer, стор сессии, флаги функций и переходы.
Плагины при этом недоступны, поэтому камера, сохранение файлов, пуши и кнопка
«Назад» проверяются только на устройстве. Строку обязательно убрать — в
репозиторий ей нельзя.
