# UniSwap SA — Production-Ready Frontend

> **Connect. Swap. Thrive.**  
> *The student marketplace for affordable fashion, smarter exchanges, and a more sustainable campus.*  
> Tailored for Sol Plaatje University (SPU), Kimberley, South Africa.

---

## 1. Project Overview & Architecture

UniSwap SA is a South African university student clothing marketplace built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and **TanStack Query (React Query v5)**. It communicates with a **Django 5.x / Django REST Framework (DRF)** backend and PostgreSQL / SQLite database via JWT authentication (`SimpleJWT`).

### Core Architectural Principles
* **Zero Fabricated Runtime Data**: Every listing, user profile, category, message, notification, report, and metric is retrieved live from the Django REST Framework API. If zero listings exist, authentic empty states are displayed.
* **Student-Centric Safety**: Enforces `@spu.ac.za` student verification awareness and integrates Sol Plaatje University designated Safe Meetup Zones (Zone A: Library Atrium, Zone B: Luka Jantjie Security Desk, Zone C: Moroka Residence Desk).
* **Robust State & Cache Management**: Utilizes TanStack Query for caching, debounced searching, pagination preservation, and optimistic mutations with rollback.
* **Defensive Security**: Input sanitization, password strength validation, safe CSV exports resistant to formula injection (`=`, `+`, `-`, `@`), and zero exposure of secrets in the client bundle.

---

## 2. Directory Structure

```
frontend/
├── dist/                     # Optimized production build artifacts
├── public/
│   ├── assets/               # Brand assets (logo.png, katlego.png)
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── common/           # Button, Badge, Modal, EmptyState, LoadingSkeleton, ErrorState
│   │   ├── guards/           # ProtectedRoute, AdminRoute
│   │   ├── layout/           # AppShell, Navbar (with live unread counts), Footer
│   │   └── marketplace/      # ListingCard (with Emerald Green Save), FilterSidebar
│   ├── context/
│   │   ├── AuthContext.tsx   # Session management, token persistence, login/register/logout
│   │   └── ThemeContext.tsx  # Dark/Light theme mode with local storage persistence
│   ├── pages/
│   │   ├── admin/            # AdminDashboardPage, AdminModerationPage, AdminReportsPage
│   │   ├── auth/             # LoginPage, RegisterPage, ForgotPasswordPage, VerifyEmailPage
│   │   ├── marketplace/      # MarketplaceFeedPage, ListingDetailPage, CreateListingPage, EditListingPage
│   │   ├── public/           # LandingPage, CampusSafetyPage, TermsPage, PrivacyPage
│   │   └── student/          # FavouritesPage, MessagesPage, NotificationsPage, MyListingsPage, ProfilePage
│   ├── services/
│   │   ├── apiClient.ts      # Axios instance with JWT interceptor, auto token refresh, error normalizer
│   │   ├── authService.ts    # Login, register, universities, me, profile updates
│   │   ├── favouriteService.ts # Live favourites CRUD
│   │   ├── listingService.ts # Marketplace feed, search, filters, listing CRUD, photo uploads
│   │   ├── messagingService.ts # Student inbox, conversation threads, send message, mark read
│   │   ├── moderationService.ts # Reports submission, admin queue, audit logs, moderation stats
│   │   └── notificationService.ts # Student notifications, unread counts, mark read
│   ├── styles/
│   │   └── index.css         # Tailwind directives, CSS variables, accessible focus rings
│   ├── tests/
│   │   ├── auth.test.ts      # SPU email format & password requirement tests
│   │   ├── csv.test.ts       # CSV formula injection security & export tests
│   │   └── formatters.test.ts # ZAR currency, dates, and relative timestamps tests
│   ├── types/
│   │   └── index.ts          # Strongly typed models mirroring DRF serializers
│   ├── utils/
│   │   ├── avatar.ts         # SPU student initial avatar generator
│   │   └── formatters.ts     # ZAR currency, date formatters, safe CSV generation
│   ├── App.tsx               # Application routes and React Query provider
│   └── main.tsx              # DOM mounting point
├── .env.example              # Template environment variables
├── package.json              # Project dependencies & scripts
├── tailwind.config.js        # Design tokens: Navy, Campus Blue, Emerald Green
├── tsconfig.app.json         # TypeScript configuration
└── vite.config.ts            # Vite bundler configuration with dev server API proxy
```

---

## 3. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default Development Value |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL for Django REST Framework API. In development, leave blank or set to `/` when using Vite proxy. In standalone production, set to your backend host (e.g. `https://api.uniswap.co.za`). | `http://127.0.0.1:8000` |

---

## 4. Development & Build Commands

All commands should be executed from the `frontend/` directory:

### Install Dependencies
```bash
npm install
```

### Start Local Development Server
```bash
npm run dev
```
* Starts Vite dev server on `http://localhost:5173`.
* Automatically proxies `/api` and `/media` requests to `http://127.0.0.1:8000`.

### Run Automated Unit Tests
```bash
npm run test
```
* Runs Vitest test suite (`src/tests/*.test.ts`).

### Build Production Bundle
```bash
npm run build
```
* Executes `tsc -b` (strict TypeScript validation) and `vite build`.
* Output generated in `dist/`.

### Preview Production Build
```bash
npm run preview
```
* Serves the compiled `dist/` directory locally.

---

## 5. API Integration & Real Backend Contract

| Domain | Frontend Service | Django REST Endpoint | Method | Purpose |
|---|---|---|---|---|
| **Auth** | `authService.getUniversities` | `/api/accounts/universities/` | `GET` | Populate registration university selector |
| **Auth** | `authService.register` | `/api/accounts/register/` | `POST` | Register student with SPU verification |
| **Auth** | `authService.login` | `/api/accounts/login/` | `POST` | Exchange credentials for JWT access/refresh |
| **Auth** | `authService.refreshToken` | `/api/accounts/token/refresh/` | `POST` | Silent renewal of expired access tokens |
| **Auth** | `authService.getMe` | `/api/accounts/me/` | `GET` | Retrieve logged-in student profile |
| **Auth** | `authService.updateProfile` | `/api/accounts/me/` | `PATCH` | Update residence, faculty, or avatar |
| **Listings** | `listingService.getCategories` | `/api/listings/categories/` | `GET` | Populate category sidebar & listing form |
| **Listings** | `listingService.getListings` | `/api/listings/` | `GET` | Feed with query params (`category`, `listing_type`, `condition`, `min_price`, `max_price`, `search`, `ordering`, `status`, `mine`) |
| **Listings** | `listingService.getListing` | `/api/listings/:id/` | `GET` | Retrieve single listing detail |
| **Listings** | `listingService.createListing` | `/api/listings/` | `POST` | Create new listing (initial status: `PENDING`) |
| **Listings** | `listingService.updateListing` | `/api/listings/:id/` | `PATCH` | Edit owned listing |
| **Listings** | `listingService.deleteListing` | `/api/listings/:id/` | `DELETE` | Permanently remove owned listing |
| **Listings** | `listingService.uploadImage` | `/api/listings/:id/images/` | `POST` | Multipart photo upload (max 5 MB) |
| **Listings** | `listingService.reserveListing` | `/api/listings/:id/reserve/` | `POST` | Reserve listing during in-person trade |
| **Listings** | `listingService.completeTrade` | `/api/listings/:id/complete_trade/` | `POST` | Finalize trade and award sustainability badges |
| **Favourites**| `favouriteService.getFavourites` | `/api/favourites/` | `GET` | Retrieve saved items for current student |
| **Favourites**| `favouriteService.toggleFavourite`| `/api/favourites/toggle/` | `POST` | Toggle listing favourite status |
| **Messaging** | `messagingService.getThreads` | `/api/messaging/threads/` | `GET` | Retrieve conversation thread summaries |
| **Messaging** | `messagingService.getConversation`| `/api/messaging/with_user/?user_id=:id` | `GET` | Retrieve direct message history with student |
| **Messaging** | `messagingService.sendMessage` | `/api/messaging/` | `POST` | Send message linked to conversation and listing |
| **Notifications** | `notificationService.getNotifications` | `/api/notifications/` | `GET` | Retrieve real student notifications |
| **Notifications** | `notificationService.markAllAsRead` | `/api/notifications/mark_all_read/` | `POST` | Mark all notifications read |
| **Moderation**| `moderationService.submitReport` | `/api/moderation/reports/` | `POST` | Report suspicious listing |
| **Moderation**| `moderationService.getReports` | `/api/moderation/reports/` | `GET` | Admin queue of pending reports |
| **Moderation**| `moderationService.dismissReport`| `/api/moderation/reports/:id/dismiss/` | `POST` | Dismiss flagged report |
| **Moderation**| `moderationService.approveListing`| `/api/moderation/approve/` | `POST` | Admin approval (`PENDING` -> `LIVE`) |
| **Moderation**| `moderationService.flagListing` | `/api/moderation/flag/` | `POST` | Admin flagging with audit log |
| **Moderation**| `moderationService.removeListing` | `/api/moderation/remove/` | `POST` | Admin removal with audit log |
| **Moderation**| `moderationService.getStats` | `/api/moderation/stats/` | `GET` | Real counts of active, pending, and flagged items |
| **Moderation**| `moderationService.getLogs` | `/api/moderation/logs/` | `GET` | Moderation audit log history |

---

## 6. SPU Campus Safety Design Tokens

* **Primary Palette**: Navy Blue (`#0b2545`) representing institutional trust and academic heritage.
* **Secondary Palette**: SPU Campus Blue (`#0284c7`) providing accessible contrast on buttons and active states.
* **Accent Palette**: Emerald Green (`#10b981`) utilized for the primary "Save to Favourites" action, positive verification badges, and sustainability diversion metrics.
* **Designated SPU Safe Meetup Zones**:
  1. **Zone A**: Central Campus Library Ground Floor Atrium (High foot traffic, monitored)
  2. **Zone B**: Luka Jantjie Security Wing Front Desk (24/7 security presence)
  3. **Zone C**: Moroka Residence Front Reception Lobby (Controlled access)

---

## 7. Handover Notes & Backend Alignment

1. **Email Verification**: The Django user model includes `is_verified` (boolean). Outbound transactional SMTP token links are pending configuration on the university mail relay; the frontend transparently presents current verification standing without fake confirmations.
2. **Password Recovery**: No backend password reset endpoint currently exists; the interface clearly instructs students to contact SPU Student Affairs / Admin.
3. **Ratings**: The backend tracks `trust_score` (percentage) on each user account. The frontend displays this authentic metric and items diverted, avoiding synthetic star ratings.
