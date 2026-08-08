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
