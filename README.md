# ConsentHub — Frontend

Consent and privacy management interface for SLT-Mobitel. React, TypeScript,
Vite and Tailwind.

Talks to the [ConsentHub backend](../ConsentHub-Backend). This repo contains no
server code.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
```

The backend must be running on `http://localhost:3001` (or set `VITE_API_URL`).

| Script | Does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Serve the built output |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

`npm run build` uses esbuild and does **not** typecheck. Run `npm run typecheck`
separately; it currently reports 171 pre-existing errors, so treat the count as
a baseline that should go down rather than a pass/fail gate until it reaches zero.

### Environment

| Variable | Purpose |
|---|---|
| `VITE_API_URL` / `VITE_GATEWAY_API_URL` | Backend origin |
| `VITE_API_BASE_URL` | Versioned base, defaults to `<origin>/api/v1` |

## Layout

```
src/
  components/
    auth/        Login, signup, forgot password
    customer/    Customer portal — consents, preferences, VAS, notices, DSAR
    csr/         CSR tooling — search, consent history, notifications
    admin/       Admin console — 16 modules
    enterprise/  Partner registration, activation, campaigns
    shared/      Notifications, connection status, dialog focus management
  services/      API clients, one per domain
  contexts/      Auth and notification providers
  i18n/          English, Sinhala, Tamil
  config/api.ts  Backend origin and base path
```

## Roles

`RoleBasedDashboard` picks the dashboard from the signed-in user's role:
`admin`, `csr`, `customer` or `enterprise`. An unrecognised role gets an
explicit "no dashboard" notice rather than falling through to an admin view.

`ProtectedRoute` takes an optional `roles` list for route-level restriction.

## Accessibility

Worth knowing before adding UI, because these are enforced app-wide:

- Every form control has an accessible name, usually via `aria-label` taken from
  its visible label. `aria-label` rather than `htmlFor`/`id` because ids collide
  in list rendering.
- Controls rendered per row carry the row's identity in their name, so they are
  not all announced identically.
- All `<th>` elements declare `scope="col"`.
- Modals use `role="dialog"` with `aria-modal="true"`, named by `aria-label` or
  `aria-labelledby`. `DialogFocusManager`, mounted once in `App`, moves focus
  into the dialog, wraps Tab inside it and restores focus on close.
- Each dashboard has a skip link to `#main-content`.
- A global `:focus-visible` ring, `prefers-reduced-motion` support and 44px
  minimum touch targets on coarse pointers live in `index.css`.

New icon-only buttons need an `aria-label`. New form fields need a name.

## Conventions

- Source files use LF line endings. This matters: with CR endings, JSX collapses
  the space before an interpolated expression, which previously rendered text
  like "Showing0 of 0" and "permissions(48 total users)" throughout the app.
- Colours come from Tailwind's default palette. The custom `brand` and `myslt`
  scales were removed — they duplicated Tailwind's blues under different names.
- Motion should carry meaning. Skeleton loaders and request spinners report real
  state; hover transforms and permanently pulsing indicators do not.

## Known issues

- 171 TypeScript errors, invisible to `npm run build`.
- `multiServiceApiClient` maintains 11 axios instances all pointed at the same
  origin; one would do.
- Modals do not close on Escape — see the note in `DialogFocusManager`.
- No test suite.
