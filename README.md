# Inventory Management (Multi-Tenant) — README

## Overview

Inventory Management is a full-stack multi-tenant retail inventory app built with:

- Next.js 14+ (App Router)
- TypeScript
- React Context
- TanStack Query
- Cloudinary for image upload
- LocalStorage + offline sync queue for offline-first capability

Backend (conceptually):

- Multi-tenant API with `businessId` for data isolation across:
  - Users
  - Products
  - Suppliers
  - Sales
  - Stock movements
  - Categories

## Architecture

### 1. App Layers

- `app/`: Next.js pages and route segments
- `components/`: UI + forms
- `context/`: global state
- `hooks/`: custom utilities (offline sync, toast, business config)
- `lib/`: types, API client, storage, config
- `public/`: static assets
- `styles/`: global CSS

### 2. Authentication

- `components/auth/{LoginForm,RegisterForm}`
- `context/AuthContext.tsx`
  - `user` object has `businessId`
  - stores state in localStorage (`erp_system_state`)
  - `login`, `logout`, credentials update, business update
- `middleware/auth` (backend) assigns `req.businessId` from JWT

### 3. Multi-Tenancy

- New `Business` model + `businessId` references across all resources
- Scoped user data:
  - `user.businessId`
  - `business` in AuthContext
- Business setup:
  - onboarding forms use `POST /business/setup`
  - settings update uses `PUT /business/setup`

### 4. Data Context (offline + online)

- `context/DataContext.tsx`
  - `useQuery` for:
    - `products`, `suppliers`, `sales`, `stockMovements`
  - Query keys contain `businessId`
  - CRUD actions:
    - `addProduct`, `updateProduct`, `addSupplier`, `updateSupplier`, `addSale`, `addStockMovement`
  - Offline sync uses `useOfflineSync`:
    - queue actions if offline
    - sync once online
  - `storage.{get,set}` for local fallback

### 5. Settings

- `context/SettingsContext.tsx`
  - loads from localStorage and business config
  - applies currency from `business.currency`
  - updates business settings via API + local merge
- UI components:
  - `BusinessSettings`, `CurrencySettings`, `CombinedGeneralSettings`, `UnitsSettings`, `NotificationSettings`, `CredentialsSettings`

## Features

### Core

- Product management
- Supplier management
- Sales recording
- Stock movement tracking
- Offline support for create operations
- User session and settings persistence (localStorage)
- Dashboard pages
- Authentication roles (admin/manager/sales/accountant)

### Multi-Tenant

- Each request scoped by `businessId`
- Data segregation by business on fetch/mutations
- Business setup via onboarding flow
- Support for business-level settings (currency, thresholds, alerts)

### Data & sync

- Real-time-ish polling (60 sec)
- On offline writes, queue for sync
- Sync modal + notifications for pending items
- local-first retrieval with fallback to API

## Workflow

### 1. Onboarding

1. User signs up via `/auth/register`
2. Login through `/auth/login`
3. Admin onboarding in `/onboarding`
   - `BusinessSetupForm` saves business profile
   - `POST /business/setup`
4. `AuthContext` updates `business`
5. app redirects `/dashboard`

### 2. Normal user flow

- `AuthContext` user + token persists
- `DataContext` loads entities via API, filtered by business
- CRUD forms:
  - `ProductForm`, `SupplierForm`, `SalesForm`, `StockMovementForm`
  - compose payloads + call context actions
  - context ensures `businessId` in payload and offline queue

### 3. Offline mode

- `useOfflineSync` detects `navigator.onLine`
- writes are queued by `DataContext`
- when online:
  - queue flush in background (API POST/PUT)
  - notification via `sync` components

### 4. Settings flow

- On login, `SettingsContext` reads `business.currency`
- users update business settings in /dashboard/settings
- settings saved to API and local app state

## Data model summary (`lib/types.ts`)

- `User`:
  - `id`, `username`, `role`, `businessId`, optional `businessSetup`, `token`
- `Business`:
  - `id`, `ownerId`, `currency`, `lowStockThreshold`, alert flags, etc.
- `Product`, `Supplier`, `Sale`, `StockMovement`, `Category` include `businessId`
- `AppSettings`: currency/units/notifications/general/credentials

## Build & run

```bash
pnpm install
pnpm run dev
pnpm run build
pnpm run lint
```

## Notes

- The app currently keeps `businessSetup` in `User` for transition but uses separate `Business`.
- `DataContext` ensures `businessId` is attached in all CRUD calls.
- Adjust backend to explicitly return business object in login or provide endpoint `/business/{id}`.
- localStorage key may be expanded to include business-id namespace for multi-business user session.

## Contributing

- Add/adjust tests for: `DataContext`, `AuthContext`, `SettingsContext`, `offline sync`.
- Validate boundary case: `user.businessId` missing, onboarding incomplete.
- Keep backend filter enforcement as primary security; frontend only helps UX.
