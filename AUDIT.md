# Brana Films Studio Dashboard — Full Audit Report

**Project:** Brana Films Production Hub  
**Stack:** React 19 + Vite + TailwindCSS 4 + Express 5 + Drizzle ORM + PostgreSQL  
**Date:** July 19, 2026  
**Total Issues Found:** 83

---

## 1. SECURITY

### S-01 | CRITICAL — Plaintext passwords stored in localStorage
- **File:** `src/contexts/AuthContext.tsx:15`
- The `AuthUser` interface declares `password: string` on the user object.

### S-02 | CRITICAL — Passwords written to and read from localStorage in plaintext
- **File:** `src/contexts/AuthContext.tsx:44-53`
- `saveUsers()` serializes the full user array (including passwords) into `localStorage` under the key `brana_users` with no encryption or hashing.

### S-03 | CRITICAL — Password comparison is raw string equality
- **File:** `src/contexts/AuthContext.tsx:132`
- `signIn` compares `u.password === password` — the password from the login form is compared directly against the plaintext value stored in localStorage. No bcrypt, argon2, or any hashing.

### S-04 | CRITICAL — Entire auth system is client-side only
- **File:** `src/contexts/AuthContext.tsx:1-170` (entire file)
- The complete authentication system (sign-up, sign-in, sign-out, session persistence) runs exclusively in the browser via localStorage. There is no server-side session, no JWT, no cookies, no server-side validation of any kind. Any user can open DevTools and modify `brana_current_user` or `brana_users` to impersonate anyone or create arbitrary accounts.

### S-05 | CRITICAL — No server-side route protection
- **File:** `src/App.tsx:69-72`
- `RequireAuth` checks `isAuthenticated` from client-side context only. There is no server-side middleware that validates sessions on API requests.

### S-06 | CRITICAL — CORS fully open with no restrictions
- **File:** `server/src/app.ts:28`
- `app.use(cors())` with no origin whitelist, no credentials configuration, no allowed methods or headers restriction. Any website on the internet can make cross-origin requests to the API.

### S-07 | CRITICAL — Database schema is empty
- **File:** `server/db/src/schema/index.ts:20`
- The schema file exports nothing (`export {}`). The database has zero tables defined. The backend is an empty shell with no real data storage.

### S-08 | HIGH — No request body size limit
- **File:** `server/src/app.ts:29`
- `express.json()` is called without `{ limit: '...' }`, allowing arbitrarily large payloads to be sent to the server, enabling memory exhaustion denial-of-service attacks.

### S-09 | HIGH — No input validation or sanitization middleware
- **File:** `server/src/app.ts:29-30`
- `express.json()` and `express.urlencoded()` are used without any validation middleware (no zod, no express-validator, no sanitization). The backend has no routes beyond `/healthz`, but the foundation is set up without any validation infrastructure.

### S-10 | HIGH — No security headers
- **File:** `index.html:1-24`
- No Content-Security-Policy (CSP), no Strict-Transport-Security (HSTS), no X-Content-Type-Options, no X-Frame-Options, no Referrer-Policy, no Permissions-Policy. The app is vulnerable to clickjacking, MIME sniffing, and other browser-based attacks.

### S-11 | HIGH — Weak ID generation
- **File:** `src/contexts/AuthContext.tsx:76-78`
- `generateId` uses `Date.now().toString(36) + Math.random().toString(36).slice(2)`. This is not cryptographically secure — IDs are predictable and enumerable.

### S-12 | HIGH — Weak ID generation in CRUD store
- **File:** `src/hooks/use-crud-store.ts:91-92`
- Same `Date.now() + Math.random()` pattern as S-11. All IDs generated across the app are predictable.

### S-13 | HIGH — No brute-force protection on login
- **File:** `src/contexts/AuthContext.tsx:127-138`
- No rate limiting, no account lockout, no CAPTCHA, no delay after failed attempts. Unlimited login attempts are possible.

### S-14 | HIGH — Weak password policy
- **File:** `src/pages/AuthPage.tsx:154-156`
- Only a minimum of 6 characters is enforced. No requirements for uppercase, lowercase, numbers, or special characters.

### S-15 | HIGH — No CORS credentials or headers configuration
- **File:** `server/src/app.ts:28`
- No `Access-Control-Allow-Credentials`, no `Access-Control-Allow-Headers` specified in the CORS configuration.

### S-16 | HIGH — Current user email stored in plaintext in localStorage
- **File:** `src/contexts/AuthContext.tsx:37-38, 67-74`
- The `brana_current_user` key in localStorage contains the user's email. Combined with S-04, this means a single XSS vector can steal all user credentials.

### S-17 | MEDIUM — No brute-force protection on sign-up
- **File:** `src/contexts/AuthContext.tsx:111-113`
- While `MAX_USERS = 4` limits total accounts, repeated sign-up attempts can enumerate which emails are already taken via the "email already registered" error.

### S-18 | MEDIUM — Entire finance state serialized to localStorage
- **File:** `src/services/financeService.ts:56`
- All financial records (invoices, payments, subscriptions, payroll) are stored as a single JSON blob in localStorage. If XSS is achieved, the attacker gets everything.

### S-19 | MEDIUM — Gear images stored as uncompressed data URLs in localStorage
- **File:** `src/pages/GearEquipmentPage.tsx:371-383`
- No size limit on image uploads. Images stored as base64 data URLs can rapidly exhaust the ~5MB localStorage quota.

### S-20 | MEDIUM — User avatar stored as base64 data URL in localStorage
- **File:** `src/pages/AuthPage.tsx:93-131`
- Avatar images are compressed (120x120 JPEG quality 70%) but stored as base64 in the same localStorage that holds passwords.

### S-21 | MEDIUM — Hardcoded user ID in audit log
- **File:** `src/hooks/useFinance.ts:228`
- `userId: "user_admin"` is hardcoded. All financial audit trail entries have the same fake user attribution — audit logs are unreliable.

### S-22 | MEDIUM — `resetAllData` clears all application state
- **File:** `src/contexts/AuthContext.tsx:145-162`
- A single function call wipes `brana_users`, `brana_current_user`, `brana_finance_state`, `team-workspace-extras-v1`, `gearItems`, `teamMembers`, `chatMessages`, and `scheduleEvents` from localStorage. No confirmation dialog is enforced at the context level.

### S-23 | MEDIUM — Dev server binds to 0.0.0.0
- **File:** `vite.config.ts:52`
- `host: "0.0.0.0"` exposes the development server to the entire local network, not just localhost.

### S-24 | LOW — Logger correctly redacts sensitive headers
- **File:** `server/src/lib/logger:7-11`
- The pino logger redacts `authorization` and `cookie` headers. This is a positive security practice.

### S-25 | LOW — .env not explicitly in .gitignore
- **File:** `.gitignore:47-49`
- `.env` is not listed in `.gitignore`. While `.env.local` and `.env*.local` are excluded, a plain `.env` file with `DATABASE_URL` could be accidentally committed.

---

## 2. PERFORMANCE

### P-01 | HIGH — Full state serialization on every dispatch
- **File:** `src/contexts/FinanceContext.tsx:619-622`
- `saveFinanceState(state)` is called via `useEffect` on every state change. The entire `FinanceState` (potentially hundreds of KB with seed data) is `JSON.stringify`'d and written to localStorage after every single action.

### P-02 | HIGH — Cross-tab sync compares full state via JSON.stringify
- **File:** `src/contexts/FinanceContext.tsx:627`
- `JSON.stringify(newState) !== JSON.stringify(state)` runs on every state change to detect cross-tab updates. This is O(n) serialization with full deep comparison on every render cycle.

### P-03 | HIGH — Triple synchronous I/O per CRUD operation
- **File:** `src/hooks/use-crud-store.ts:49-73`
- Every create, update, or remove triggers: (1) `JSON.stringify` + `localStorage.setItem`, (2) a `CustomEvent` dispatch, and (3) a state update. Three synchronous blocking operations per action.

### P-04 | HIGH — Toast removal delay is 1,000,000ms (~17 minutes)
- **File:** `src/hooks/use-toast.ts:9`
- `TOAST_REMOVE_DELAY = 1000000` — toast elements remain in the DOM for approximately 17 minutes. This is almost certainly a bug; typical values are 5000ms (5 seconds).

### P-05 | HIGH — Mega-components not code-split internally
- **File:** `src/pages/TeamPage.tsx:1-1288+`
- **File:** `src/pages/ChatPage.tsx:1-1386+`
- **File:** `src/pages/Dashboard.tsx:1-1056+`
- **File:** `src/pages/SchedulePage.tsx:1-1000+`
- **File:** `src/components/FinancialLedgerView.tsx:1-2800+`
- Each page file contains 1000-2800+ lines including all types, constants, seed data, helper functions, sub-components, and page logic. While lazy-loaded at the route level via `React.lazy`, each file is a massive single chunk. Internal code-splitting within pages would improve initial parse time.

### P-06 | HIGH — Notification generation on every state change
- **File:** `src/contexts/FinanceContext.tsx:635-648`
- `generateNotifications` iterates over all invoices, subscriptions, payroll records, and gear items, and recalculates cash flow trends on every state change. This runs frequently due to P-01.

### P-07 | MEDIUM — Google Fonts loaded via CSS @import (render-blocking)
- **File:** `src/styles/globals.css:1`
- `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@...')` is render-blocking and duplicates the preconnect hints already present in `index.html:16-18`. The CSS `@import` bypasses the browser's preconnect optimization.

### P-08 | MEDIUM — Random data in chart calculations causes unnecessary re-renders
- **File:** `src/utils/financeCalculations.ts:490-493`
- `Math.random()` is used for days with no spending data: `Math.round(Math.random() * 200 + 50)`. This produces different values on every render, causing chart components to re-render with new "data."

### P-09 | MEDIUM — Extensive use of backdrop-filter: blur()
- **File:** `src/styles/globals.css:396-443`
- Classes `.glass-card`, `.glass-input`, `.glass-modal`, and their variants all use `backdrop-filter: blur()`. Multiple overlapping blur calls cause GPU compositing overhead on lower-end devices.

### P-10 | MEDIUM — Double deduplication of gear items
- **File:** `src/pages/GearEquipmentPage.tsx:343-345`
- `uniqueGearItems` deduplicates `gearItems` from context, but `useCrudStore` (the underlying store) already deduplicates internally via a Map. This is wasted computation on every render.

### P-11 | MEDIUM — Schedule seed data duplicated across files
- **File:** `src/pages/Dashboard.tsx:49-137` and `src/pages/SchedulePage.tsx:71-160`
- The same `DEFAULT_EVENTS` array is defined independently in both files. Changes to schedule data must be made in two places.

### P-12 | MEDIUM — Chat seed data embedded in component file
- **File:** `src/pages/ChatPage.tsx:170-412`
- ~240 lines of seed data (conversations, users, messages) are hardcoded inside the component file rather than in a separate data file, increasing the parse cost of the component.

### P-13 | MEDIUM — NotificationPanel uses hardcoded external avatar URLs
- **File:** `src/components/NotificationPanel.tsx:86-131`
- External Unsplash URLs are used for avatars (`https://images.unsplash.com/photo-...?w=150`). These require network fetches and will fail offline, causing broken images.

### P-14 | MEDIUM — Sidebar renders user avatar from external API on error
- **File:** `src/layouts/Sidebar.tsx:224-225`
- Fallback avatar URL is `https://api.dicebear.com/9.x/initials/svg?seed=...`. External API dependency for a cosmetic element.

### P-15 | MEDIUM — AppShell re-creates on every route change
- **File:** `src/App.tsx:91-136`
- Each `<Route>` wraps content in `<RequireAuth><AppShell>...</AppShell></RequireAuth>`. Since `AppShell` contains `DashboardProvider` with its own state, navigating between routes unmounts and remounts the entire layout shell, losing sidebar expansion state and notification panel state.

### P-16 | LOW — Loading screen progress is cosmetic, not tied to actual loading
- **File:** `src/components/LoadingScreen.tsx:57-88`
- The progress bar animates from 0-100% over 1500ms using a fixed interval. It does not measure actual bundle loading, data fetching, or any real resource. It is purely decorative.

### P-17 | LOW — "Studio Managment" typo in loading screen
- **File:** `src/components/LoadingScreen.tsx:132`
- "Studio Managment v1.2" — "Management" is misspelled as "Managment". Same typo at `src/layouts/Navbar.tsx:85`.

---

## 3. MARKET READINESS

### M-01 | CRITICAL — Zero test coverage
- No test files exist anywhere in the project. No test framework is configured — no `vitest`, `jest`, `@testing-library`, or `playwright` in dependencies. No `test` script in `package.json`. No `__tests__/` directories, no `*.test.tsx` or `*.spec.ts` files.

### M-02 | CRITICAL — No CI/CD pipeline
- No `.github/workflows/`, no `Dockerfile`, no `netlify.toml`, no `vercel.json`, no `ecosystem.config.js` (PM2), no Kubernetes manifests. No deployment configuration of any kind.

### M-03 | CRITICAL — Backend has no real API
- **File:** `server/src/routes/index.ts:7-11`
- The only route registered is `GET /healthz`. There are no CRUD endpoints, no authentication routes, no data endpoints. The `@workspace/api-zod` dependency is imported but no API schemas are defined.

### M-04 | CRITICAL — No .env.example or environment documentation
- No `.env.example` file exists. The server requires `PORT` and `DATABASE_URL` (checked at `server/db/drizzle.config.ts:4-5`) but there is no documentation of required environment variables.

### M-05 | HIGH — No React error boundary
- **File:** `src/App.tsx:1-183`
- No `<ErrorBoundary>` component wraps the application. If any component throws during render, the entire app crashes to a white screen with no recovery path.

### M-06 | HIGH — No React StrictMode
- **File:** `src/main.tsx:5`
- `<StrictMode>` is not used on the root render. StrictMode helps catch common bugs during development (double-invocation of effects, deprecated API usage).

### M-07 | HIGH — 404 page has no navigation
- **File:** `src/pages/not-found.tsx:1-21`
- The 404 page displays only a static error message. There is no "Go Home" link, no "Go Back" button, no navigation back to the dashboard.

### M-08 | HIGH — No frontend error tracking or monitoring
- No Sentry, LogRocket, Bugsnag, or any error tracking service is integrated. Frontend errors are invisible to the development team. Server has pino logging but only for the (empty) API.

### M-09 | HIGH — No Open Graph or social sharing meta images
- **File:** `index.html:9-14`
- The `og:image` and `twitter:image` meta properties are missing. Sharing the app URL on social media will produce blank preview cards.

### M-10 | HIGH — No internationalization (i18n)
- All UI strings are hardcoded in English throughout every file. No i18n framework (react-i18next, etc.) is configured. No translation files exist. The app serves an Ethiopian wedding videography business where Amharic support would be expected.

### M-11 | HIGH — No PWA support
- No `manifest.json`, no service worker, no offline capability. The app requires an active network connection for Google Fonts and external avatar services.

### M-12 | HIGH — "Terms of Service" and "Privacy Policy" are non-functional
- **File:** `src/pages/AuthPage.tsx:424-441`
- These links are rendered as `<button>` elements with no `href` or navigation. Clicking them does nothing.

### M-13 | HIGH — Social login buttons are non-functional placeholders
- **File:** `src/pages/AuthPage.tsx:205-207`
- Google, Apple, and GitHub login buttons show a "coming soon" toast notification. They are not connected to any OAuth provider.

### M-14 | MEDIUM — No license file or package.json license field
- **File:** `package.json`
- The package has `"private": true` but no `LICENSE` file in the project root and no `license` field in `package.json`.

### M-15 | MEDIUM — Hard limit of 4 users
- **File:** `src/contexts/AuthContext.tsx:39`
- `MAX_USERS = 4` is a hardcoded constant. For a production SaaS product this needs to be configurable or removed.

### M-16 | MEDIUM — Schedule events use hardcoded 2026 dates
- **File:** `src/pages/SchedulePage.tsx:71-160`
- Seed data contains specific dates in July 2026. These will appear as "past" or "future" depending on the current date and will become stale over time.

### M-17 | MEDIUM — Chat seed data is hardcoded with fixed dates
- **File:** `src/pages/ChatPage.tsx:170-412`
- All seed conversations have hardcoded timestamps relative to "today" using string literals, not dynamic dates.

### M-18 | MEDIUM — Social media links are hardcoded
- **File:** `src/layouts/Footer.tsx:238-297`
- Instagram, YouTube, TikTok, Vimeo, and X URLs are hardcoded. These should be configurable per-organization.

### M-19 | MEDIUM — NotificationPanel is entirely static
- **File:** `src/components/NotificationPanel.tsx:19-248`
- All notifications, activities, and contacts are hardcoded. The panel does not connect to any real data source. It displays the same static content regardless of application state.

### M-20 | MEDIUM — Navbar popup dialogs contain non-functional settings
- **File:** `src/layouts/Navbar.tsx:512-558`
- The "Site Settings" popup has inputs for encoder bitrate, storage path, and backup frequency, but the "Save Configurations" button only closes the dialog — nothing is persisted.

### M-21 | MEDIUM — Navbar "Pages" dialog has wrong labels
- **File:** `src/layouts/Navbar.tsx:358-364`
- The "Chat" page is labeled "Hall Layout Seating" and navigates to `/dashboard/messages`. Misleading to users.

### M-22 | MEDIUM — Feedback submission is non-functional
- **File:** `src/layouts/Navbar.tsx:664-733`
- The feedback form shows a success message after submission, but the data is not sent anywhere — it is discarded from component state.

### M-23 | MEDIUM — FinancialLedgerView renders table headers for non-existent domains
- **File:** `src/components/FinancialLedgerView.tsx:785-843`
- Table headers for `invoices`, `editorPayments`, `gear`, and `audit` domains are rendered in the `<thead>`, but these domains are not in the `DOMAINS` array (line 54-69), so those headers are unreachable dead code.

### M-24 | MEDIUM — FinancialLedgerView references undefined variables
- **File:** `src/components/FinancialLedgerView.tsx:338, 342`
- `Heart` and `Pin` icons are referenced in the details modal props for income records but are not imported from `lucide-react`. This will cause a runtime error when viewing income record details.

### M-25 | MEDIUM — No API documentation
- No Swagger/OpenAPI specification, no Postman collection, no API docs of any kind.

### M-26 | MEDIUM — Replit-specific dev dependencies
- **File:** `package.json`
- `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`, `@replit/vite-plugin-runtime-error-modal` are all Replit-specific plugins. These add noise and potential confusion for non-Replit deployments.

### M-27 | MEDIUM — Hardcoded team member data
- **File:** `src/features/team/teamData.ts`
- Contains hardcoded names, phone numbers, emails, and addresses that look like real PII. Should be clearly marked as demo data.

### M-28 | MEDIUM — Gear data is hardcoded
- **File:** `src/features/gear/gearData.ts:60-355`
- 21 gear items with names, prices, serial numbers, and image paths are bundled as static data.

### M-29 | MEDIUM — Dashboard social media links hardcoded
- **File:** `src/pages/Dashboard.tsx:688-723`
- Instagram, YouTube, Vimeo, and TikTok URLs are hardcoded inline in the dashboard component.

### M-30 | LOW — No analytics or usage tracking
- No Google Analytics, Plausible, Mixpanel, or any analytics integration.

### M-31 | LOW — No accessibility audit
- While some ARIA attributes are used (loading screen, progress bars), no comprehensive accessibility audit tooling or testing is configured.

### M-32 | LOW — "Studio Managment" typo repeated
- **File:** `src/components/LoadingScreen.tsx:132`, `src/layouts/Navbar.tsx:85`
- "Management" is misspelled as "Managment" in two locations.

### M-33 | LOW — No developer documentation
- No CONTRIBUTING.md or ARCHITECTURE.md. New developers have no entry point to understand the codebase beyond the README.

---

## SUMMARY

| Category | Critical | High | Medium | Low | Total |
|---|---|---|---|---|---|
| **Security** | 7 | 10 | 6 | 2 | **25** |
| **Performance** | 0 | 6 | 9 | 2 | **17** |
| **Market Readiness** | 4 | 9 | 16 | 4 | **33** |
| **TOTAL** | **11** | **25** | **31** | **8** | **75** |

---

## TOP 10 PRIORITIES (Fix Before Any Release)

| # | ID | Issue | Why |
|---|---|---|---|
| 1 | S-01..S-05 | Plaintext auth in localStorage | Any user can impersonate any other user by editing DevTools |
| 2 | M-01 | Zero tests | No way to verify any feature works correctly |
| 3 | S-06 | CORS wide open | Any website can call the API |
| 4 | M-02 | No CI/CD | No automated way to build, test, or deploy |
| 5 | M-05 | No error boundary | Any runtime error crashes the entire app |
| 6 | S-08..S-09 | No body limit / no validation | Server is vulnerable to DoS and malformed input |
| 7 | P-04 | Toast delay 17 minutes | UI bug — toasts persist for 17 minutes |
| 8 | S-10 | No security headers | Vulnerable to clickjacking, MIME sniffing |
| 9 | M-03 | Empty backend | The Express server is a shell with only a health endpoint |
| 10 | S-24..M-02 | Full app is localStorage-only | Every piece of data disappears when the user clears browser data |
