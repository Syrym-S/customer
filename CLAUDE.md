# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

`360-customer` is the customer-facing portal for 360 Logistics, built with React 18 + Vite. It is **not** deployed as a standalone SPA: Vite builds it as an IIFE library (`window.CustomerApp`, entry `src/main.jsx`, output `dist/index.js` + `dist/index.css`) that gets embedded into a WordPress page. Runtime config (REST base URL, nonce, staging flag) is read from a `window.APP_DATA` global injected by the host page (`src/shared/api/api-client.js`). The API is a WordPress REST backend under `/wp-json/` (routes like `/customer/v1/leads`, `/auth/v1/logout`), authenticated via cookies + `X-WP-Nonce`.

## Commands

- `npm run dev` — start dev server (`vite --mode mock`)
- `npm run dev:api` — start dev server against the real API (`vite --mode api`)
- `npm run build` — production build (`vite build --mode production`), outputs to `dist/`
- `npm run preview` — preview the production build locally
- `npm run deploy` — build, then upload `dist/` via FTP using `deploy.js` (requires a local `.env.ftp`, see `.env.ftp.example`)
- Lint: no `lint` script is defined; run directly with `npx eslint .`
- There is no test setup/script in this repo.

Vite modes (`mock`/`api`/`production`) load `.env.mock` / `.env.api` / `.env.production`, which set `VITE_API_MODE` and `VITE_API_BASE_URL`. Note these are currently **not read anywhere in `src/`** — `apiClient` always talks to `window.APP_DATA.rest_url` (falling back to a hardcoded production URL), so the mock/api mode distinction is presently a no-op left over from an in-progress refactor (see below).

## Architecture: Feature-Sliced Design

`src/` follows Feature-Sliced Design layering, top to bottom:

- `app` — `App.jsx`, `main.jsx`, `theme/`, `router/` (router config + breadcrumbs)
- `pages` — route-level components (`src/pages/<page>/XxxPage.jsx`), wired up in `src/router/router.jsx`
- `widgets` — composite UI blocks combining features/entities for a page (e.g. `lead-details`, `leads-list`, `header`, `dashboard`)
- `features` — user actions/use-cases (e.g. `create-lead`, `edit-lead-route`, `invite-forwarder`, `verify-email`)
- `entities` — core domain models and their API/state (e.g. `lead`, `tender`, `factoring`, `forwarder`, `driver`, `cargo-type`)
- `shared` — framework-agnostic reusable code: `shared/api` (axios client, auth), `shared/ui` (map primitives), `shared/lib`, `shared/model` (cross-cutting events/stores), `shared/config`

Within a slice, code is further split by `api/` (HTTP calls via `apiClient`), `model/` (state, adapters, context/provider), `lib/` (pure helpers), and `ui/` (components). Not every slice has all four. Imports are plain relative paths — there are no path aliases configured in `vite.config.js`.

**This repo is mid-migration** (current branch `refactor/customer-structure` is moving code from an older `widgets/customer-*` structure into the entities/features/widgets split above). Several old directories still coexist with their replacements (e.g. `widgets/customer-leads` next to `entities/lead` + `widgets/lead-details`, `widgets/customer-profile` next to `features/edit-profile`). Some files currently have stale imports pointing at paths already deleted in this branch (e.g. `src/router/router.jsx` still imports `pages/tender/TenderPage`, which no longer exists — `pages/tenders/TendersPage.jsx` is its replacement; `src/widgets/header/Header.jsx` imports from deleted `features/profile-edit` and `widgets/customer-profile` paths). Run `git status` before assuming a file referenced by an import actually exists, and expect to fix dangling imports as part of any work that touches routing, leads, forwarders, factorings, or profile code.

## Key patterns

- **Per-entity state**: entities that need shared state expose a Context + Provider + `use<Entity>Context` hook trio in `model/` (e.g. `entities/lead/model/{LeadsContext,LeadsProvider,useLeadsContext}.js`), backed by a `fetchX`/adapter pair in `api/` + `model/x.adapter.js` that normalizes the WP REST response shape into camelCase domain objects.
- **Cross-slice notifications**: `shared/model/notification-domain-events.js` is a small pub/sub used to notify other slices of domain changes (e.g. a lead being created triggers `leadsChanged`, which `LeadsProvider` subscribes to for a silent reload) — prefer this over prop-drilling or importing another entity's provider directly.
- **Toasts**: global toast/notification state is a zustand store (`shared/model/toast.store.js`) with helper functions (`notifyError`, `notifySuccess`, `notifyWarning`, `notifyRealtimeNotification`, `notifyEmailVerificationRequired`) rather than importing the store directly in components.
- **MUI**: components are built on MUI v9 (`@mui/material`, `@mui/icons-material`, `@mui/x-data-grid`) with a shared theme in `src/theme/theme.js`.
- **Maps**: Leaflet/`react-leaflet` primitives live in `shared/ui/map/`; route/geo helpers live in `shared/lib/route` and per-feature `lib/` (e.g. `features/track-lead-location`, `features/view-lead-routes`).
- Text/labels in the UI are in Russian; keep new user-facing strings consistent with that.

## Session status — 2026-08-08

Picking up from a multi-turn session that took this branch from a broken, mid-migration state to a clean, committed build (`dd44277`). The "mid-migration" paragraph above describing dangling imports in `router.jsx`/`Header.jsx` is now **stale** — those were fixed this session; leaving the paragraph as historical context rather than rewriting it.

**Completed and committed:**
- All broken imports fixed: 143 → 0. `npm run build` succeeds (1764 modules, no errors).
- All 10 findings from a first architectural audit resolved (layer violations between `shared`/`features`/`router`; `DetailSection`/`TenderDetailsSection`/`TimeLeftBadge` duplication consolidated; colliding `lead-route.helpers.js` filenames renamed; missing `ForwardersProvider` added to `entities/forwarder`; `ProfilePage` split into data/mutation hooks; `ForwardersDetailsModal` renamed to match its export; `lead-details/lead-details` double-nesting flattened; `BannedScreen.jsx` explicitly left as-is, no backing data source exists for it).
- 16 ESLint `no-unused-vars`/`no-undef` errors fixed, including two real runtime bugs (traced, not silenced): `LeadsMap.jsx`'s undefined `selectedLeadId` (now derived from `openLead` via `useLeadsContext()`), and 5x undefined `formatMapLocation` in `lead-route-markers.helpers.js` (renamed to the existing `formatLocation` from `shared/lib/location/location.helpers.js`).
- A manually-reported runtime bug in `FactoringDetailsModal.jsx` fixed: `leadForMap` was read before its `const` declaration (temporal-dead-zone `ReferenceError`) — declaration reordered above its use.
- `npm run build` and `npx eslint src/` both verified clean, aside from the deferred prop-types errors below.

**Resolved: `CustomerStep`/`LeadCustomerSection` removed.**
The open question from the second audit — whether a "Customer" step/section was intentionally dropped from lead creation/details, or lost accidentally during the FSD migration — was answered: it was mistakenly implemented early on and is intentionally not needed in the customer-facing app. `features/create-lead/ui/create-lead-modal/steps/CustomerStep.jsx` and `widgets/lead-details/ui/sections/LeadCustomerSection.jsx` have been deleted (both were confirmed zero-importer dead code; the shared components they used — `StepSection`, `DetailSection`, `InfoBadge` — are still used elsewhere and were left in place). `npm run build` verified clean after removal (1764 modules, no errors).

**Second audit's duplicate-component findings — all resolved:**
- `LeadsPagination`/`TendersPagination` → consolidated into `shared/ui/Pagination.jsx`.
- `LeadStatusChip` (2 copies) → consolidated into `entities/lead/ui/LeadStatusChip.jsx`; `TenderStatusChip` (2 copies) → `entities/tender/ui/TenderStatusChip.jsx`. Both take a `dense` prop to preserve the two different fontSize behaviors (responsive `{xs,sm}` for tables vs flat `0.75rem` for dashboard cards) that existed pre-consolidation.
- `getShortTenderId` (2 copies) + `getCompactId` (3rd independent reimplementation) → consolidated into `shared/lib/format-id.helpers.js`'s `formatCompactId(id, { prefixLength, suffixLength, threshold })`; each of the 3 call sites keeps its original visual output via those params, ellipsis character standardized to `…`.
- `hasCoordinate`/`getLocationPoint` (`shared/ui/map/map.helpers.js`) vs `hasCoordinate`/`getLocationPosition` (`entities/lead/lib/lead-details-map.helpers.js`) → the entity file is deleted; its sole non-duplicate export (`getLocationDescription`) was moved into `shared/ui/map/map.helpers.js`, and `RouteDetailsMap.jsx` (its only consumer) now imports everything from the shared file.

**Second audit's dead-code findings — partially actioned:**
- 11 of the 13 originally-reported fully-vestigial exports deleted (a fresh re-scan at cleanup time found 19 total — the number drifted as other work in this session removed/introduced dead code; see below for the 6 deliberately kept and the rest were removed): `normalizeLeadsResponse`, `isFinishedLead`, `getCustomerName`, `getForwarderName` (`entities/factoring/model/factorings.helpers.js`); `mapForwarderSearchItemFromApi` (`entities/forwarder/model/forwarder.adapter.js`); `getForwarderInviteCode`, `hasForwarderInviteLink` (`entities/forwarder/model/forwarder.helpers.js`); `mapProfileFormToApi` (`features/edit-profile/model/profile-form.helpers.js`, superseded by the diff-based `mapProfileFormToChangedApi`); `HEADER_HEIGHT`, `SIDEBAR_WIDTH`, `CONTENT_MAX_WIDTH` (`shared/config/constants.js`, superseded by `CUSTOMER_NAV_WIDTH`); `getLeadColumnTotal`/`getLeadColumnTotalLabel` (`widgets/leads-list/ui/kanban/lead-kanban.helpers.js` — confirmed `LeadKanbanColumn.jsx` renders no per-column total at all, formatted or raw, so treated as abandoned rather than near-future).
- `BannedScreen.jsx` remains explicitly left as-is (no backing data source exists for it) — unchanged from the first audit's conclusion.
- 6 geo-tracking exports deliberately kept — see "Known dead code, intentionally not removed" below.
- The ~25 exported-but-internal-only exports (used only within their own module, don't need the `export` keyword) from the second audit are still unactioned.

**Deliberately deferred:** ~446 `react/prop-types` ESLint errors, a direct consequence of deleting `tenders.prop-types.js` earlier in the session per explicit instruction. Not a regression — just not yet addressed.

## Known dead code, intentionally not removed

These 6 exports have zero call sites anywhere in `src/`, same as the deleted dead code above — but were kept because they read as deferred/unwired capabilities, not accidental leftovers. Don't delete without a product decision first.

- `clearGeoRoutesCache` (`features/track-lead-location/model/geo-routes.cache.js`) — bulk-clear for the geo-route cache; likely meant for a "reset on logout/lead-switch" flow that doesn't exist yet.
- `clearGeneratedRoutesCache` (`features/view-lead-routes/model/generated-route.cache.js`) — same pattern, sibling cache module; probably belongs to the same not-yet-built reset flow as above.
- `getBrowserLocation` (`features/track-lead-location/api/geows.js`) — reads the browser's own Geolocation API; part of an apparent "report my own GPS" capability this customer portal doesn't currently use (it only reads driver locations, never sends its own).
- `sendGeoPoint` / `sendGeoPoints` (same file) — outbound point-senders over the geo WebSocket, paired with `getBrowserLocation` above; same deferred-capability read.
- `requestGeoAdminPoints` (same file) — stub matching the WS "admin mode" documented in the file's own header comment (`GEO_WS_MESSAGE_TYPES.ADMIN`, backend pushes without a request); the mode is documented but not yet driven from this app.
