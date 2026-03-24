# StockOS Navigation & Routes

## Complete Navigation Structure

### Route Map
All routes are organized under `/dashboard` with role-based access control:

```
/ (Entry Point)
├── /auth/login                 (Login Page - Public)
└── /dashboard                  (Main App - Protected)
    ├── /                       (Dashboard Home)
    ├── /products              (Product Management)
    ├── /inventory             (Inventory Management)
    ├── /sales                 (Sales Management)
    ├── /suppliers             (Supplier Management)
    ├── /reports               (Reports & Analytics)
    ├── /settings              (Application Settings)
    └── /help                  (Help & Support)
```

## Navigation Components

### 1. **Sidebar Navigation** (`components/shared/Sidebar.tsx`)
- Primary navigation with all main sections
- Role-based visibility (Admin, Manager, Sales)
- Active state highlighting based on current route
- User profile info at bottom with logout option

**Visible Routes by Role:**
- **Admin**: All routes except none (full access)
- **Manager**: Products, Inventory, Sales, Suppliers, Reports, Settings, Help
- **Sales**: Sales, Help only

### 2. **Top Navigation Bar** (`components/shared/TopNav.tsx`)
- Dynamic page title that updates based on current route
- Theme toggle (Light/Dark mode)
- Logout button
- Breadcrumb-ready header

### 3. **Breadcrumb Navigation** (`components/shared/Breadcrumb.tsx`)
- Hierarchical navigation path
- Shows current location within the app
- Links back to parent sections
- Hidden on dashboard home page

## Page Descriptions

### Dashboard (`/dashboard`)
- **Purpose**: Overview of all business operations
- **Features**: Cards showing totals, recent activity, sales trends
- **Roles**: Admin, Manager

### Products (`/dashboard/products`)
- **Purpose**: Manage product catalog
- **Features**: 
  - Add/Edit/Delete products
  - Search and filter
  - View all products in table
  - Pagination support
- **Roles**: Admin, Manager

### Inventory (`/dashboard/inventory`)
- **Purpose**: Track stock levels and movements
- **Features**:
  - Record stock additions/removals
  - View stock movement history
  - Low stock warnings
  - Real-time stock levels
- **Roles**: Admin, Manager

### Sales (`/dashboard/sales`)
- **Purpose**: Record and manage sales transactions
- **Features**:
  - Create new sales
  - Select multiple products
  - Auto-deduct from inventory
  - View sales history
- **Roles**: Admin, Manager, Sales

### Suppliers (`/dashboard/suppliers`)
- **Purpose**: Manage supplier information
- **Features**:
  - Add/Edit/Delete suppliers
  - Link suppliers to products
  - Contact information management
- **Roles**: Admin, Manager

### Reports (`/dashboard/reports`)
- **Purpose**: Business analytics and reporting
- **Features**:
  - Inventory reports with valuations
  - Sales trends over time
  - Low stock reports
  - CSV export functionality
- **Roles**: Admin, Manager

### Settings (`/dashboard/settings`)
- **Purpose**: Configure application preferences
- **Features**:
  - Currency settings (USD, EUR, GBP, JPY, INR, CAD, AUD)
  - Unit settings (Weight, Volume, Count)
  - Change username/password
  - Enable/disable notifications
  - Theme preferences
- **Roles**: Admin (full access), Manager (limited)

### Help (`/dashboard/help`)
- **Purpose**: User support and documentation
- **Features**:
  - FAQs with expandable answers
  - Step-by-step demo guide
  - Developer contact form
  - Keyboard shortcuts reference
  - Troubleshooting section
- **Roles**: Admin, Manager, Sales

## Navigation Flow

### User Journey
1. **Entry**: User visits `/` → redirects to `/auth/login`
2. **Login**: User authenticates with credentials
3. **Dashboard**: Redirected to `/dashboard` after successful login
4. **Navigation**: User can navigate using:
   - Sidebar menu (primary navigation)
   - Breadcrumb (location indicator)
   - Page title in TopNav (context awareness)
5. **Logout**: Click logout button to return to login page

### Link Structure
- All sidebar links use Next.js `<Link>` component for client-side navigation
- Active route is highlighted in the sidebar
- Current page title displays in TopNav header
- Breadcrumb shows navigation path

## Authentication & Protected Routes

### Route Protection
- All `/dashboard/*` routes require authentication
- Unauthorized users are redirected to `/auth/login`
- Auth state managed via `AuthContext`
- Role-based menu filtering prevents access to restricted sections

### Session Management
- Session persisted in localStorage
- Auto-logout on browser close (can be modified)
- Re-login required for security-sensitive operations

## Keyboard Shortcuts (Future Implementation)
The help page documents these shortcuts for users:
- `Ctrl + K` / `Cmd + K`: Search/Quick navigation
- `Ctrl + Shift + S`: Settings
- `Ctrl + Shift + H`: Help
- `Esc`: Close modals/forms

## Notes
- All routes use the dashboard layout wrapper
- Sidebar and TopNav persist across all pages
- Theme preference saved in localStorage
- Settings applied globally across app
