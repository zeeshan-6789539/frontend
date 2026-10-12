# RMS Frontend

Restaurant Management System frontend built on Next.js 16 (App Router + Turbopack).

## Stack

| Concern    | Choice                                     |
| ---------- | ------------------------------------------ |
| Framework  | Next.js 16.3 / React 19.3                  |
| Styling    | Tailwind CSS 4 (CSS-first `@theme` tokens) |
| i18n       | next-intl 4 — English / Urdu with RTL      |
| Theming    | next-themes — light / dark / system        |
| Data       | TanStack Query 5 + Axios                   |
| Validation | Zod 4                                      |
| Icons      | lucide-react                               |

## Getting started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The frontend runs on **:5001** and expects the RMS backend on **:5000**:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

That URL is the backend host plus its global prefix (`API_PREFIX=api`) and URI version
(`API_VERSION=1`). The backend must allow `http://localhost:5001` in its `CORS_ORIGINS`.

Scripts: `dev`, `build`, `start`, `lint`, `typecheck`.

## Folder structure

```
src/
├── app/
│   ├── [locale]/            # Localised routes (en, ur)
│   │   ├── layout.tsx       # Root html/body, dir, fonts, providers
│   │   ├── login/           # Login page — no app chrome
│   │   └── (dashboard)/     # Everything behind the auth guard
│   │       ├── layout.tsx   # Sidebar + main shell
│   │       ├── page.tsx     # Dashboard overview
│   │       ├── companies/   # Company administration
│   │       ├── users/       # User administration
│   │       ├── properties/  # Dealer listings
│   │       ├── requirements/ # Dealer seeker requests + matches
│   │       ├── contacts/    # Dealer owners and seekers
│   │       ├── locations/   # Dealer cities and their areas
│   │       ├── property-types/ # Dealer property types
│   │       └── facilities/  # Dealer facilities (bedrooms, attached bath, furnished…)
│   └── globals.css          # Theme tokens + base layer
├── components/
│   ├── layout/              # Sidebar, nav, user menu, role guard, switchers
│   ├── providers/           # Theme, TanStack Query, toast providers
│   └── ui/                  # Presentational primitives (table, modal, badge…)
├── config/                  # Site, auth, roles, navigation, pagination, property enums, limits
├── features/                # Feature slices
│   ├── auth/
│   ├── companies/
│   ├── contacts/
│   ├── dashboard/
│   ├── facilities/
│   ├── locations/
│   ├── properties/
│   ├── property-requirements/
│   ├── property-types/
│   └── users/
│       ├── api/             # Client fetchers + query keys
│       ├── components/      # View, table, form dialog
│       ├── hooks/           # useQuery / useMutation wrappers
│       ├── schemas/         # Zod input schemas
│       └── types/           # Component prop interfaces
├── hooks/                   # Shared hooks (form state, debounce, toast)
├── i18n/                    # routing, navigation, request config
├── lib/                     # Axios instance, query client, session cookies
├── types/                   # Shared interfaces (I-prefixed)
├── utils/                   # Generic helpers (cn, format, cookie, query-params…)
└── proxy.ts                 # Locale + auth proxy (Next 16 middleware convention)
messages/                    # en.json, ur.json
```

## Super admin flow

`/companies` and `/users` are super_admin-only on the backend, and the UI mirrors that:
the sidebar hides both links for other roles, and each page is wrapped in
[`RequireRole`](src/components/layout/require-role.tsx), which reads `GET /auth/me`.

Both screens follow the same shape, matching the backend's list contract — paginated,
searchable, newest first:

- debounced search, plus filters (status; role and company on users),
- a create/edit dialog validated with Zod schemas that mirror the backend DTOs, so the
  common mistakes are caught before a request goes out,
- deactivate/reactivate through a confirm dialog. `DELETE` is a soft delete: it flips
  `status` to false and `PATCH /:id/restore` flips it back, so rows are never lost.

Backend rules the forms reflect: a `super_admin` cannot belong to a company, a company
cannot be deactivated while it still has active users, and passwords cannot be changed
through `PATCH /users/:id` — `UpdateUserDto` omits the field, so the edit dialog does not
offer it.

The dashboard reads its counters from the same list endpoints (`meta.totalItems` with
`limit=1`), so no extra backend route is needed.

## Dealer (client admin) flow

A `client_admin` is a property dealer. The sidebar shows **Properties**, **Requirements**,
**Contacts**, **Cities & areas**, **Property types** and **Facilities** only to that role, and each page is wrapped in
[`DealerOnly`](src/components/layout/dealer-only.tsx). The backend scopes every query to the
dealer's own company, so the screens never pass a company id.

- **Properties** — sale and rent listings, filtered by purpose, type and property status
  from one row beside the **New property** button. The property status (`available` / `sold` / `rented`) changes straight from the
  table; a sale listing only offers sold and a rental only rented. Area is in square feet,
  and the security deposit field only appears for rentals. City and area are dropdowns fed by
  **Cities & areas**; the area list only shows the chosen city's areas and clears when the city changes.
- **Requirements** — what a walk-in client wants (buy or rent, type, budget, a preferred
  city with any number of its areas in a multi-select, facilities), with an `open` / `matched` / `closed` status. **Matches** opens
  the active, available listings that fit, from `GET /property-requirements/:id/matches`;
  a listing must have every facility the requirement asks for. A **Match level** slider (0 / 25 / 50 / 75 / 100%)
  relaxes this by ignoring facilities, then area, then budget, then type and city. **Choose** on a match marks
  that listing sold or rented and the requirement matched, via
  `PATCH /property-requirements/:id/match`. The full flow, from page
  load to matching and closing, is in [docs/requirements-flow.md](docs/requirements-flow.md).
- **Contacts** — owners and seekers; phone numbers are unique per dealer.
- **Cities & areas** (`/locations`) — two panes: cities on the left, the selected city's areas
  on the right. Areas are added inline (type a name, press Enter, type the next), and the edit
  dialog renames an area, moves it to another city or changes its status. A city with active
  areas cannot be deactivated until its areas are.
- **Property types** — built-in types are read-only; dealers add and manage their own.
- **Facilities** — same rules as property types. Listings and requirements (sale or rent) pick
  any number of them through the searchable [`MultiSelect`](src/components/ui/multi-select.tsx),
  which opens inline below the field so it is never clipped inside a modal.

Owner, seeker, type and facility pickers load the newest 100 active records and narrow them with the
select's own search.

The dashboard (`/`) is role-aware: super admins get the platform overview, and dealers get their
own one — a greeting with quick links, KPI cards (active listings, open requirements, closed
deals, contacts), listing inventory by status and purpose, the requirements pipeline with its
match rate, and the newest listings and requirements. Like the super admin counters, every figure
comes from the existing list endpoints with `limit=1`, aggregated in
[`useDealerStats`](src/features/dashboard/hooks/use-dealer-stats.ts).

## Language switching

Locale lives in the URL (`/en/...`, `/ur/...`) and is resolved by [src/proxy.ts](src/proxy.ts).
`<html lang dir>` is set per request, and Urdu loads Noto Nastaliq Urdu automatically.

Use logical CSS properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`) so
layouts mirror correctly in RTL.

Add a locale by extending `locales` in [src/i18n/routing.ts](src/i18n/routing.ts) and adding a
matching file in [messages/](messages/); mark it RTL in [src/utils/direction.ts](src/utils/direction.ts).

## Theming

Colours are OKLCH custom properties in [src/app/globals.css](src/app/globals.css): `:root` for
light, `.dark` for dark, exposed to Tailwind via `@theme inline`. Use semantic classes
(`bg-card`, `text-muted-foreground`, `border-border`) rather than raw palette values.

## Data fetching

Every call goes through the shared Axios instance in
[src/lib/api-client.ts](src/lib/api-client.ts), which:

- prefixes `NEXT_PUBLIC_API_BASE_URL`,
- attaches `Authorization: Bearer <access token>` from the session cookie,
- unwraps the backend `{ success, message, data, error }` envelope so callers receive `data`,
- normalises every failure into `IApiError` (`status`, `code`, `message`, `details`),
- on a `401`, refreshes once through `/auth/refresh` and replays the request; concurrent
  401s share a single refresh call. If the refresh fails, the session is cleared and the
  user is sent to the login page.

Feature slices own their fetchers, query keys and hooks — see
[src/features/auth/](src/features/auth/). Query keys are centralised per feature
(`authKeys`) so invalidation stays predictable.

Server components may still prefetch into a per-request `QueryClient` and pass it through
`HydrationBoundary`; client hooks then read the hydrated cache without a second request.

## Auth

`POST /auth/login` returns a token pair plus the user. Tokens are stored in the
`rms_access_token` / `rms_refresh_token` cookies (see
[src/lib/auth-session.ts](src/lib/auth-session.ts)) so that
[src/proxy.ts](src/proxy.ts) can guard routes at the edge: an anonymous request to any
route is redirected to `/{locale}/login`, and a signed-in request to the login page is
redirected back to `/{locale}`.

Cookies are written client-side and are therefore readable by JavaScript. If the backend
later sets `httpOnly` cookies itself, drop `auth-session.ts` and read the cookie names
directly in the proxy.

Route names and cookie names live in [src/config/auth.ts](src/config/auth.ts).
