# Обфускация и защита Android-сборки

Документ описывает, что сделано для прод-сборки мобильного приложения customer
(Capacitor + Android) и как это проверять. Референс — `driver-mobile`.

## 1. Удаление комментариев, debug и console

`vite.config.capacitor.js`:

- `esbuild.drop: ['console', 'debugger']` — вырезает вызовы `console.*` и
  `debugger` на этапе трансформации. В customer стоит **Vite 6 + esbuild**,
  поэтому рецепт из driver-mobile (`build.rolldownOptions.output.minify.compress.dropConsole`,
  Vite 8 + rolldown) здесь не применим.
- `esbuild.legalComments: 'none'` + `terserOptions.format.comments: false` —
  комментарии и баннеры лицензий не попадают в бандл.
- `build.minify: 'terser'` с `drop_console` / `drop_debugger` — вторая линия
  поверх esbuild, заодно даёт более агрессивный dead-code elimination.
- `build.sourcemap: false` — `.map` не генерируются вообще.

Всё это включается только при `mode !== 'staging'` — см. раздел «Отладочная
сборка».

Остаточные вхождения `console` в бандле (все — внутри библиотек, не в нашем коде):

| Источник | Что это |
|---|---|
| `firebase/installations` | `.catch(console.error)` — передача ссылки, не вызов; статически не вырезается |
| `pusher-js` | `window.console.*` внутри своего логгера, выключенного по умолчанию (`logToConsole`) |
| `react-i18next` | `console!=null&&console.warn` — проверка существования |
| `@capacitor/core` | `e.console.error` — обращение через объект, не глобальный `console` |

Наш код в бандле не содержит ни одного `console.*` (проверено грепом по
`dist-app/assets/index-*.js`).

## 2. Обфускация JS

Плагин `vite-plugins/obfuscate.plugin.js` на `javascript-obfuscator` 5.10.

Применяется **только к нашему коду**: через `build.rollupOptions.output.manualChunks`
весь `node_modules` выносится в чанк `vendor`, обфускации подвергается только
entry-чанк (хук `renderChunk` обфусцирует, после чего terser дожимает результат —
такой порядок даёт на ~300 КБ меньше, чем обфускация после минификации).

Включено:

- `identifierNamesGenerator: 'mangled-shuffled'` — переименование функций,
  классов, переменных.
- `stringArray` + `stringArrayEncoding: ['base64']`, `stringArrayThreshold: 1`,
  rotate / shuffle / indexShift, 2 chained-call обёртки — все строковые
  литералы и константы вынесены в зашифрованный массив с ротацией.
- `numbersToExpressions`, `simplify` — числовые константы превращаются в
  выражения.
- `compact`, `target: 'browser'`, `sourceMap: false`.

Сознательно **выключено**, чтобы не ломать Capacitor / React / MUI:

| Опция | Почему выключена |
|---|---|
| `renameGlobals` | переименовала бы `Capacitor`, `cordova`, `androidBridge` — мост JS↔native перестал бы работать |
| `renameProperties` | ломает props MUI/React, ключи API-ответов и i18n |
| `transformObjectKeys` | то же, плюс ломает объекты, уходящие в нативные плагины |
| `controlFlowFlattening`, `deadCodeInjection` | ×1.5–2 размер и заметная просадка рендера React |
| `selfDefending`, `debugProtection` | ломаются при последующей минификации и могут подвешивать WebView |
| `splitStrings` | +292 КБ при почти нулевой добавке к защите поверх base64-массива. Включается строкой `splitStrings: true` в плагине, если потребуется |

Страховки: `reservedNames` (`Capacitor`, `CapacitorCustomPlatform`,
`androidBridge`, `cordova`, `APP_DATA`, …) и `reservedStrings` (имена
нативных плагинов, `capacitor://localhost`, `https://localhost`).

Цена: entry-чанк 1 535 КБ → 2 717 КБ, итого бандл 3 743 КБ → 4 565 КБ (**+22 %**).

Проверка, что строки действительно скрыты (все дают 0 вхождений в
обфусцированном чанке): `customer_session`, `wp-json`, `customer-notifications`,
`AIzaSy…`. Единственное исключение — `X-WP-Nonce` (4 вхождения): это ключ в
объектном литерале заголовков, а `transformObjectKeys` выключен. Значение
публичное, не секрет.

## 3. Лишний код и исходники в assets

- Новый плагин `vite-plugins/strip-mocks.plugin.js` заменяет все `*.mock.js` и
  `*.mock-api.js` на пустые заглушки с теми же именами экспортов. Tree-shaking
  их не вытряхивал: в модулях есть вычисления на верхнем уровне (`Array.from`,
  IIFE), и Rollup считал их side-effect'ами. До фикса в APK лежали 60
  фиктивных заявок, объявления, каталог ТНВЭД, мок-аналитика.
- Исключение — `chat.mock.js`: его экспорты (`SUPPORT_CHAT_ID`,
  `CHAT_CATEGORIES`, `createMockMessageId`, `createMockAttachmentId`,
  `createSupportChat`) реально используются в прод-UI чата. Он оставлен как есть.
- `aaptOptions.ignoreAssetsPattern` дополнен `!*.map:!*.md:!*.ts:!*.jsx:!*.LICENSE.txt`.
- `packagingOptions.resources.excludes` убирает `META-INF/*.version`,
  `*.kotlin_module`, `DebugProbesKt.bin`, `kotlin-tooling-metadata.json`, `**/*.map`.
- `publicDir: false` (было до задачи) — `firebase-messaging-sw.js`, `vite.svg`
  и прочий web-only контент в APK не попадают.

Итоговое содержимое `assets/public` в APK: `index.html`, один JS-чанк приложения,
один vendor-чанк, CSS, logo.png, `cordova.js`, `cordova_plugins.js`. Ни одного
`.map`, `.md`, `.ts`, `.jsx`.

## 4. AndroidManifest

| Параметр | Было | Стало |
|---|---|---|
| `android:allowBackup` | `true` | `false` |
| `android:fullBackupContent` | — | `false` |
| `android:dataExtractionRules` | — | `@xml/data_extraction_rules` (запрет cloud-backup и device-transfer для всех домен) |
| `android:usesCleartextTraffic` | — | `false` (в коде нет ни одного `http://`) |
| `androidx.profileinstaller.ProfileInstallReceiver` | exported=true | удалён через `tools:node="remove"` |

`android:debuggable` в манифесте сознательно **не** прописан: AGP подставляет его
сам по buildType (в release — отсутствует), а хардкод сломал бы debug-сборку.
Проверено по собранному release-APK: атрибута `debuggable` в merged-манифесте нет.

Exported-компоненты в release-APK после чистки — ровно два, оба обязательные:

- `kz.logistics360.customer.MainActivity` — LAUNCHER + deep links
  (`https://customer.360logistics.kz/customer`, `kz.logistics360.customer://`);
- `com.google.firebase.iid.FirebaseInstanceIdReceiver` — FCM, защищён
  `android:permission="com.google.android.c2dm.permission.SEND"`.

WebView debugging: `webContentsDebuggingEnabled` в `capacitor.config.json`
сознательно **не** задан — Capacitor берёт значение из `FLAG_DEBUGGABLE`
(`CapConfig.java`), то есть в release `chrome://inspect` не видит WebView, а в
debug-сборке отладка остаётся рабочей. Так же сделано в driver-mobile. Явный
`false` отключал бы инспектор и в debug, что мешает разработке.
`loggingBehavior` оставлен по умолчанию (`debug`) по той же причине: он выключает
нативные логи Capacitor именно в release, а `"none"` убил бы их и при разработке.

## 5. R8 / ProGuard / dex

`android/app/build.gradle`, buildType `release`:

```
minifyEnabled true
shrinkResources true
proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
```

`android/gradle.properties`: `android.enableR8.fullMode=true` (это и так дефолт
AGP 8.13, зафиксировано явно).

Результат на одном и том же коде:

| | без R8 | с R8 |
|---|---|---|
| dex | 8.60 МБ + 6.54 МБ (2 файла) | **2.25 МБ** (один файл) |
| resources.arsc | 1.34 МБ | 0.92 МБ |
| APK | 11.50 МБ | **6.33 МБ** |

Переименование классов подтверждено по dex: `com.getcapacitor.a`,
`com.getcapacitor.b`, … Не переименованы только то, что держат правила.

`android/app/proguard-rules.pro` (был стоковый шаблон без единого правила):

- `-keepattributes SourceFile,LineNumberTable` + `-renamesourcefileattribute SourceFile`
  — чтобы `mapping.txt` позволял retrace стектрейсов из Play Console.
- `-keep class com.getcapacitor.MessageHandler { @android.webkit.JavascriptInterface <methods>; }`
  — этот класс регистрируется как `addJavascriptInterface(this, "androidBridge")`
  и не является наследником `Plugin`; через его `postMessage()` идут все вызовы JS → native.
- `-keepattributes RuntimeVisibleAnnotations,RuntimeVisibleParameterAnnotations,AnnotationDefault`
  и `-keep @interface com.getcapacitor.**` — Capacitor читает имя плагина,
  алиасы разрешений и `PluginMethod.returnType` через `getAnnotation()`;
  R8 в full mode иначе выбрасывает аннотации.
- `-keepclassmembers,allowobfuscation class * { @com.google.gson.annotations.SerializedName <fields>; }`
  — модели `io.ionic.libs` (камера) размечены `@SerializedName`, своих
  consumer-rules библиотека не поставляет.

Остальное покрыто и дублировать не нужно: `proguard-android-optimize.txt` (методы
`@JavascriptInterface`, native-методы, `CREATOR`, `values()/valueOf()`),
consumer-rules `@capacitor/android` (все наследники `com.getcapacitor.Plugin`,
то есть все 11 плагинов из `capacitor.plugins.json`, грузимых через
`Class.forName`), AAPT-правила (классы и конструкторы всех компонентов манифеста),
consumer-rules `firebase-messaging`.

`mapping.txt` лежит в `android/app/build/outputs/mapping/release/` — его нужно
сохранять на каждый релиз и загружать в Play Console.

## 6. Хранение токенов

Было: вся сессия (включая bearer-token) лежала в `localStorage` WebView открытым
текстом — файл `/data/data/kz.logistics360.customer/app_webview/Local Storage/leveldb`,
который при `allowBackup=true` вытаскивался через `adb backup` без root.

Стало (`src/shared/model/session.storage.js`, по образцу
`driver-mobile/src/app/services/authStorage.js`):

- на нативе сессия пишется в `@aparajita/capacitor-secure-storage` — Android
  Keystore (в dex подтверждено наличие `AndroidKeyStore` и
  `KeyGenParameterSpec`);
- на web поведение не изменилось: тот же `localStorage`, тот же ключ
  `customer_session`;
- миграция: при первом запуске нативной сборки существующая сессия
  переносится из `localStorage` в secure storage, после успешной записи
  копия в `localStorage` удаляется; `removeStoredSession()` чистит оба
  хранилища, чтобы не осталось legacy-копии.

Так как secure storage асинхронный, добавлены:

- `hydrateSession()` в `src/shared/model/session.store.js`;
- `await hydrateSession()` в `src/main.jsx` до `createRoot(...).render(...)`.

Это важно именно для нативной сборки: `App.jsx` определяет экран входа как
`isNative && !sessionToken`, и без ожидания гидратации пользователь на каждом
холодном старте видел бы вспышку экрана логина и уход роутера на `/auth`.

Прочие записи в `localStorage` проверены — там только язык интерфейса и
таймстамп кулдауна повторной отправки письма, ничего чувствительного.

## 7. API-ключи

Грепом по `src`, по бандлу и по `classes.dex` секретов не найдено:

- в dex нет ни `AIzaSy…`, ни VAPID-ключа, ни `wp-json`, ни `customer_session` —
  весь JS лежит в assets, а не в dex;
- `apiKey`/`messagingSenderId`/`appId` Firebase и VAPID-ключ в
  `src/services/firebase.js` — публичные по дизайну значения (идентификаторы
  проекта, а не секреты); доступ ограничивается правилами Firebase и
  ограничениями ключа в Google Cloud Console, а не их сокрытием;
- найденные в dex строки `keystore` и `password` безобидны:
  `android.security.keystore.KeyGenParameterSpec` (это как раз secure storage) и
  строка описания accessibility-узла;
- `src/widgets/customer-map/model/customer-map.constants.js` содержит `key=…` в
  URL тайлов CartoDB — публичный ключ базовой карты, ограничивается на стороне
  CartoDB по Referer/домену.

Рекомендация, не входящая в задачу: проверить в Google Cloud Console, что
Firebase API key ограничен по package name + SHA-1 подписи.

## 8. Чего нет

- **Подпись release** не настраивалась (решение пользователя). Сейчас
  `assembleRelease` даёт `app-release-unsigned.apk`. Для Play нужно добавить
  `signingConfigs.release` с чтением пароля из `android/local.properties` —
  как в `driver-mobile/android/app/build.gradle`.
- `android/local.properties` создан локально (`sdk.dir`), в git не попадает.
- Веб-сборки (`vite.config.js`, `vite.config.public.js`) **не затронуты**, чтобы
  не задеть прод-сайт. При необходимости strip-mocks и удаление `console`
  переносятся туда теми же тремя строками.

## Отладочная сборка

По аналогии с `--mode staging` в driver-mobile добавлен режим, в котором JS
собирается без защиты — чтобы отлаживать на устройстве с живыми логами:

```bash
npm run cap:sync:staging   # staging-режим + dev API, затем cap sync
```

| | `cap:sync` / `cap:sync:dev` | `cap:sync:staging` |
|---|---|---|
| обфускация | да | нет |
| удаление `console` / `debugger` | да | **нет**, логи видны в Logcat |
| минификация | terser | esbuild |
| mock-модули | вырезаны | вырезаны |
| API | prod / staging | staging |

Размер entry-чанка: 1 923 КБ в staging против 2 717 КБ в прод-сборке.

Важно: Android Studio по умолчанию ставит **debug**-вариант, где
`minifyEnabled false`, то есть R8/ProGuard и релизный манифест в нём не
проверяются. Чтобы прогнать release-вариант локально, пока не настроена подпись,
можно временно добавить в `buildTypes.release` строку
`signingConfig signingConfigs.debug` и убрать её перед реальным релизом.

## Как проверять после изменений

```bash
npm run cap:sync
cd android && ./gradlew assembleRelease
```

Чек-лист по собранному APK:

```bash
# console в нашем чанке
grep -c "console\." dist-app/assets/index-*.js      # ожидается 0

# строки скрыты
grep -c "customer_session\|wp-json" dist-app/assets/index-*.js   # 0

# нет mock-данных
grep -c "mock-lead\|mock-advertisement" dist-app/assets/index-*.js   # 0

# манифест
aapt2 dump xmltree app-release-unsigned.apk --file AndroidManifest.xml | grep -iE "debuggable|allowBackup|cleartext"

# секреты в dex
grep -ac "AIzaSy\|customer_session" classes.dex     # 0
```

Ручной прогон на устройстве после включения обфускации обязателен:
вход/выход и перезапуск приложения (secure storage + гидратация), push-уведомления
и переход по ним, камера и загрузка документов, карта и маршруты, чат (WebSocket),
открытие и шаринг файлов, deep link.
