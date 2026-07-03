# Plantation Tracker

A full-stack plantation tracking and monitoring platform built for managing tree-planting initiatives at scale. Features satellite-based NDVI vegetation analysis, AI-powered verification, a token-based gamification system, and comprehensive reporting dashboards.

## Overview

Plantation Tracker provides end-to-end management of afforestation and reforestation programs. It is designed for government agencies, NGOs, research institutions, and private organizations that need to track plantation sites, monitor tree survival rates, verify planting authenticity through AI and satellite imagery, and incentivize participants through a token economy.

## Features

- **Dashboard** — Real-time overview of plantation metrics, recent activities, and key performance indicators
- **Organization Management** — Register and manage government bodies, NGOs, private companies, community groups, and research institutions
- **Nursery & Stock Tracking** — Track nursery locations, capacities, species inventory, and seedling health status
- **Plantation Management** — Create and manage plantation sites with GPS coordinates, area measurements, species selection, and hierarchical geographic tagging (division, district, upazila, union, mouza)
- **Field Monitoring** — Record monitoring visits with survival rates, growth stage assessments, pest/disease observations, and GPS-verified photos
- **Satellite NDVI Analysis** — Integrate Sentinel-2 satellite imagery for vegetation health monitoring with NDVI, EVI, SAVI, GNDVI, and NDWI indices
- **AI Verification** — Automated verification of plantation claims through count validation, species identification, fraud detection, and geolocation verification
- **Analytics** — Comprehensive data analytics with interactive charts and trend analysis
- **Reporting** — Generate plantation summaries, monitoring reports, NDVI analyses, and survival analyses
- **Notification System** — Real-time alerts for monitoring due dates, low survival rates, NDVI anomalies, and token rewards
- **Token Economy** — Gamified reward system with tokens for planting, monitoring, and verification activities, plus achievement badges and leaderboards

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite 7 |
| **Styling** | Tailwind CSS 3.4, shadcn/ui, Radix UI |
| **Backend** | Hono 4, tRPC 11 |
| **Database** | MySQL (via Drizzle ORM) |
| **Maps** | MapLibre GL JS |
| **Charts** | Recharts |
| **Authentication** | Kimi OAuth (JWT-based session cookies) |
| **Validation** | Zod 4 |
| **Storage** | AWS S3 (presigned URLs) |
| **Testing** | Vitest |
| **Deployment** | Vercel (serverless) / Node.js (self-hosted) |

## Project Structure

```
plantation-tracker-next/
├── api/                          # Backend (Hono + tRPC)
│   ├── boot.ts                   # App entry point & server setup
│   ├── router.ts                 # Root tRPC router
│   ├── context.ts                # tRPC request context (auth)
│   ├── middleware.ts              # tRPC procedures (public, authed, admin)
│   ├── auth-router.ts            # Authentication endpoints
│   ├── organization-router.ts    # Organization CRUD
│   ├── nursery-router.ts         # Nursery & stock management
│   ├── plantation-router.ts      # Plantation CRUD & management
│   ├── monitoring-router.ts      # Field monitoring visits
│   ├── satellite-router.ts       # NDVI satellite records
│   ├── verification-router.ts    # AI verification endpoints
│   ├── analytics-router.ts       # Analytics & statistics
│   ├── report-router.ts          # Report generation
│   ├── notification-router.ts    # Notification management
│   ├── token-router.ts           # Token economy & badges
│   ├── kimi/                     # Kimi OAuth integration
│   │   ├── auth.ts               # OAuth callback & token exchange
│   │   ├── session.ts            # JWT session signing & verification
│   │   ├── platform.ts           # Kimi platform API client
│   │   └── types.ts              # OAuth type definitions
│   ├── lib/                      # Shared backend utilities
│   │   ├── env.ts                # Environment variable validation
│   │   ├── http.ts               # HTTP helpers
│   │   ├── cookies.ts            # Cookie configuration
│   │   └── vite.ts               # Static file serving (Node.js)
│   └── queries/                  # Database query helpers
│       ├── connection.ts         # MySQL connection pool
│       └── users.ts              # User lookup queries
├── api-server/                   # Vercel serverless entry point
│   └── index.ts                  # Hono app wrapped for Vercel
├── contracts/                    # Shared types & constants
│   ├── constants.ts              # Session config, paths, error messages
│   ├── errors.ts                 # Standardized error definitions
│   └── types.ts                  # Re-exported DB types
├── db/                           # Database layer
│   ├── schema.ts                 # Drizzle ORM schema (13 tables)
│   ├── relations.ts              # Table relationships
│   ├── seed.ts                   # Seed data script
│   └── migrations/               # Generated SQL migrations
├── src/                          # Frontend source
│   ├── App.tsx                   # Root component & route definitions
│   ├── main.tsx                  # React DOM entry point
│   ├── const.ts                  # Navigation menu & app constants
│   ├── providers/
│   │   └── trpc.tsx              # tRPC + React Query provider
│   ├── hooks/
│   │   ├── useAuth.ts            # Authentication hook
│   │   └── use-mobile.ts         # Responsive breakpoint hook
│   ├── components/
│   │   ├── AuthLayout.tsx        # Authenticated layout (sidebar + content)
│   │   ├── AuthLayoutSkeleton.tsx
│   │   └── ui/                   # 40+ shadcn/ui components
│   └── pages/
│       ├── Dashboard.tsx
│       ├── Organizations.tsx
│       ├── Nurseries.tsx
│       ├── Plantations.tsx
│       ├── Monitoring.tsx
│       ├── Satellite.tsx
│       ├── Verification.tsx
│       ├── Analytics.tsx
│       ├── Reports.tsx
│       ├── Notifications.tsx
│       ├── Tokens.tsx
│       ├── Login.tsx
│       └── NotFound.tsx
├── vercel.json                   # Vercel deployment configuration
├── vite.config.ts                # Vite build & dev server config
├── drizzle.config.ts             # Drizzle Kit migration config
├── tailwind.config.js            # Tailwind CSS theme configuration
├── .env.example                  # Required environment variables
└── package.json
```

## Database Schema

The application uses **13 MySQL tables** managed by Drizzle ORM:

| Table | Purpose |
|-------|---------|
| `users` | OAuth-authenticated users with roles (user / admin) |
| `organizations` | Registered organizations (government, NGO, private, community, research) |
| `nurseries` | Nursery locations with capacity and GPS coordinates |
| `species` | Tree species catalog with botanical data and conservation status |
| `nursery_stock` | Seedling inventory per nursery (quantity, health, batch) |
| `plantations` | Plantation sites with geographic hierarchy and status tracking |
| `monitoring_visits` | Field visit records (survival rate, growth stage, health, photos) |
| `ai_verifications` | AI-powered verification results (count, species, fraud, geolocation) |
| `satellite_records` | Sentinel-2 NDVI and vegetation index data per plantation |
| `notifications` | User notification queue with types and action links |
| `tokens` | Token economy ledger (earn, spend, penalties) |
| `badges` | Achievement badges with levels and metadata |
| `leaderboard` | Ranking tables (weekly, monthly, yearly, all-time) |
| `activity_log` | Audit trail for all user actions |

## Getting Started

### Prerequisites

- **Node.js** 20+
- **MySQL** 8.0+ (or a managed MySQL service like PlanetScale, TiDB Cloud, AWS RDS)
- **Kimi Developer Account** (for OAuth authentication)

### 1. Clone and Install

```bash
git clone https://github.com/moniruzjaman/plantation-tracker-next.git
cd plantation-tracker-next
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Application credentials (from Kimi Developer Console)
APP_ID=your_app_id
APP_SECRET=your_app_secret

# MySQL connection string
DATABASE_URL=mysql://user:password@localhost:3306/plantation_tracker

# Kimi OAuth endpoints
KIMI_AUTH_URL=https://auth.kimi.com
KIMI_OPEN_URL=https://open.kimi.com

# Frontend (exposed to browser via Vite)
VITE_KIMI_AUTH_URL=https://auth.kimi.com
VITE_APP_ID=your_app_id

# Admin user (gets "admin" role on first login)
OWNER_UNION_ID=your_kimi_union_id
```

### 3. Set Up Database

```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE plantation_tracker"

# Push schema to database
npm run db:push

# (Optional) Seed with sample data
npx tsx db/seed.ts
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`. The Hono API dev server runs alongside Vite with hot module replacement for both frontend and backend.

### 5. Build for Production (Self-Hosted)

```bash
npm run build
npm start
```

This builds the Vite frontend to `dist/public` and bundles the Hono API server to `dist/boot.js`. The production server runs on the `PORT` environment variable (default: 3000).

## Deploy to Vercel

### Prerequisites

- A [Vercel](https://vercel.com) account
- A MySQL database accessible from Vercel (PlanetScale, TiDB Cloud, or AWS RDS with SSL)

### Steps

1. **Push to GitHub** — Ensure your code is pushed to this repository.

2. **Import on Vercel** — Go to [vercel.com/new](https://vercel.com/new) and import `moniruzjaman/plantation-tracker-next`.

3. **Configure Environment Variables** — In the Vercel project settings, add all variables from `.env.example` (without the `VITE_` prefix for backend-only vars, though they won't cause harm).

4. **Deploy** — Vercel will automatically detect `vercel.json` and use the `build:vercel` script.

### How Vercel Deployment Works

| Component | Build Output | Serving |
|-----------|-------------|---------|
| Frontend (React) | `dist/public/` (static) | Vercel Edge CDN |
| Backend API | `api-server/index.ts` | Vercel Serverless Function (Node.js 20) |

The `vercel.json` configuration:
- Builds only the Vite frontend (`npm run build:vercel`)
- Routes all `/api/*` requests to the Hono serverless function
- Serves frontend assets directly from `dist/public/`
- Sets long cache headers for `/assets/*`

### Environment Variables on Vercel

Set these in **Vercel Project Settings > Environment Variables**:

| Variable | Required | Description |
|----------|----------|-------------|
| `APP_ID` | Yes | Kimi OAuth application ID |
| `APP_SECRET` | Yes | Kimi OAuth application secret |
| `DATABASE_URL` | Yes | MySQL connection string |
| `KIMI_AUTH_URL` | Yes | Kimi auth server URL |
| `KIMI_OPEN_URL` | Yes | Kimi Open Platform URL |
| `OWNER_UNION_ID` | No | Union ID for admin user |
| `VITE_KIMI_AUTH_URL` | Yes | OAuth URL for frontend |
| `VITE_APP_ID` | Yes | App ID for frontend |
| `NODE_ENV` | Auto | Set to `production` by Vercel |

## API Architecture

The backend uses **tRPC** over **Hono** for end-to-end type safety between client and server.

### Request Flow

```
Browser → Vercel/Vite → Hono → tRPC → Drizzle ORM → MySQL
```

### Authentication

- OAuth 2.0 via Kimi Platform
- Access tokens verified against Kimi's JWKS endpoint
- Session managed via JWT cookies (`kimi_sid`, 365-day expiry)
- Three procedure levels: `publicQuery` (open), `authedQuery` (logged in), `adminQuery` (admin only)

### API Endpoints

| Route | Handler | Auth |
|-------|---------|------|
| `GET /api/oauth/callback` | Kimi OAuth callback | Public |
| `/api/trpc/ping.query` | Health check | Public |
| `/api/trpc/auth.*` | Auth operations | Public |
| `/api/trpc/organization.*` | Organization CRUD | Authed |
| `/api/trpc/nursery.*` | Nursery management | Authed |
| `/api/trpc/plantation.*` | Plantation CRUD | Authed |
| `/api/trpc/monitoring.*` | Monitoring visits | Authed |
| `/api/trpc/satellite.*` | NDVI records | Authed |
| `/api/trpc/verification.*` | AI verification | Authed |
| `/api/trpc/analytics.*` | Analytics data | Authed |
| `/api/trpc/report.*` | Report generation | Authed |
| `/api/trpc/notification.*` | Notifications | Authed |
| `/api/trpc/token.*` | Token economy | Authed |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Vite + Hono) on port 3000 |
| `npm run build` | Build for production (Vite + esbuild) |
| `npm run build:vercel` | Build frontend only (for Vercel) |
| `npm start` | Run production server |
| `npm run check` | Type-check with TypeScript |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |
| `npm run test` | Run tests with Vitest |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:push` | Push schema changes directly to DB |

## UI Components

The project includes **40+ shadcn/ui components** pre-installed:

Accordion, Alert Dialog, Alert, Aspect Ratio, Avatar, Badge, Breadcrumb, Button Group, Button, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Command, Context Menu, Dialog, Drawer, Dropdown Menu, Empty State, Field, Form, Hover Card, Input Group, Input OTP, Input, Item, KBD, Label, Menubar, Navigation Menu, Pagination, Popover, Progress, Radio Group, Resizable, Scroll Area, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner (Toast), Spinner, Switch, Table, Tabs, Textarea, Toggle Group, Toggle, Tooltip

## License

This project is licensed under the terms of the [LICENSE](LICENSE) file in this repository.