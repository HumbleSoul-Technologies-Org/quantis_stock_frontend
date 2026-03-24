# Visual Navigation Guide

## Application Layout with Navigation

```
┌─────────────────────────────────────────────────────────┐
│                    Top Navigation Bar                   │
│  ┌─────────────┐              ┌──────────────────────┐  │
│  │ Page Title  │              │ Theme | Logout       │  │
│  │ (Dynamic)   │              │ Toggle                 │  │
│  └─────────────┘              └──────────────────────┘  │
├─────────────┬───────────────────────────────────────────┤
│             │                                           │
│ SIDEBAR     │        MAIN CONTENT AREA                │
│             │                                           │
│  StockOS    │  ┌─────────────────────────────────────┐ │
│             │  │ Breadcrumb Navigation               │ │
│  Dashboard  │  │ Home > Products                     │ │
│  Products   │  └─────────────────────────────────────┘ │
│  Inventory  │                                           │
│  Sales      │  ┌─────────────────────────────────────┐ │
│  Suppliers  │  │      Page Content                   │ │
│  Reports    │  │ (Products, Inventory, etc.)         │ │
│  Settings   │  │                                     │ │
│  Help       │  │                                     │ │
│             │  │                                     │ │
│ ┌─────────┐ │  └─────────────────────────────────────┘ │
│ │ User    │ │                                           │
│ │ Logout  │ │                                           │
│ └─────────┘ │                                           │
└─────────────┴───────────────────────────────────────────┘
```

## Sidebar Navigation Structure

```
┌─────────────────────┐
│      StockOS        │
│  Stock Management   │
└─────────────────────┘
        │
        ├─── 📊 Dashboard          [ACTIVE: green]
        │
        ├─── 📦 Products
        │
        ├─── 🚚 Inventory
        │
        ├─── 🛒 Sales
        │
        ├─── 👥 Suppliers
        │
        ├─── 📈 Reports
        │
        ├─── ⚙️ Settings
        │
        └─── ❓ Help
                │
        ┌───────────────┐
        │ Logged in as  │
        │ admin         │
        │ (Admin Role)  │
        │ [Logout]      │
        └───────────────┘
```

## Navigation Routes Map

```
ROOT ENTRY
    │
    ├─ /                    ──> Redirect to /auth/login
    │
    └─ /auth/login          ──> Login Form
                                 │
                                 └─> [Authenticate]
                                     │
                                     └─> Redirect to /dashboard

    
DASHBOARD (Protected Routes)
    │
    ├─ /dashboard           ──> Dashboard Home
    │                           ├─ Overview Cards
    │                           ├─ Quick Navigation
    │                           └─ Recent Activity
    │
    ├─ /dashboard/products  ──> Products Management
    │                           ├─ Product Table
    │                           ├─ Add Product Form
    │                           └─ Product Actions
    │
    ├─ /dashboard/inventory ──> Inventory Management
    │                           ├─ Stock Levels
    │                           ├─ Movement Forms
    │                           └─ History Table
    │
    ├─ /dashboard/sales     ──> Sales Management
    │                           ├─ Sales Form
    │                           ├─ Sales Table
    │                           └─ Sales History
    │
    ├─ /dashboard/suppliers ──> Supplier Management
    │                           ├─ Supplier Table
    │                           ├─ Add Supplier Form
    │                           └─ Supplier Details
    │
    ├─ /dashboard/reports   ──> Reports & Analytics
    │                           ├─ Inventory Report
    │                           ├─ Sales Report
    │                           ├─ Charts
    │                           └─ CSV Export
    │
    ├─ /dashboard/settings  ──> Application Settings
    │                           ├─ General Settings
    │                           ├─ Currency Settings
    │                           ├─ Units Settings
    │                           ├─ Credentials
    │                           └─ Notifications
    │
    └─ /dashboard/help      ──> Help & Support
                                ├─ FAQs
                                ├─ Demo Guide
                                ├─ Contact Form
                                └─ Shortcuts
```

## Navigation Flow Sequence

```
User Journey Flow:

Start
  │
  └─> [Load App]
       │
       └─> [Check Auth]
            │
            ├─ NOT Authenticated ──> /auth/login ──> [Show Login Form]
            │                            │
            │                            └─ [User Enters Credentials]
            │                                 │
            │                                 └─ [Validate Credentials]
            │                                      │
            │                                      └─ /dashboard (Success)
            │
            └─ Authenticated ──> /dashboard [Show Layout with Sidebar]
                                   │
                                   ├─ [User Clicks Sidebar Item]
                                   │   │
                                   │   └─ [Navigate to Route]
                                   │       │
                                   │       └─ [Update TopNav Title]
                                   │       │
                                   │       └─ [Show Breadcrumb]
                                   │       │
                                   │       └─ [Highlight Sidebar Item]
                                   │       │
                                   │       └─ [Render Page Content]
                                   │
                                   ├─ [User Clicks Quick Nav]
                                   │   └─ [Navigate to Route]
                                   │
                                   ├─ [User Clicks Breadcrumb]
                                   │   └─ [Navigate to Parent]
                                   │
                                   └─ [User Clicks Logout]
                                       └─ /auth/login [Clear Auth]
```

## Breadcrumb Navigation Examples

```
Dashboard Home:
(Breadcrumb Hidden)

Products Page:
Home > Products

Inventory Page:
Home > Inventory

Sales Details (if exists):
Home > Sales > Details
```

## Quick Navigation Grid (Dashboard Only)

```
┌─────────────────────────────────────────────────┐
│       Quick Navigation                          │
├─────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐│
│ │📦        │ │🚚        │ │🛒        │ │👥    ││
│ │Products  │ │Inventory │ │Sales     │ │Suppli││
│ └──────────┘ └──────────┘ └──────────┘ └──────┘│
│ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │📈        │ │⚙️        │ │❓        │         │
│ │Reports   │ │Settings  │ │Help      │         │
│ └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────┘
```

## Top Navigation Bar Details

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Products                      🌙 🚪            │
│                                                 │
└─────────────────────────────────────────────────┘
   ↑                             ↑   ↑
   └─ Dynamic Title              │   └─ Logout Button
     (Updates per page)          │
                                 └─ Theme Toggle
```

## Role-Based Menu Visibility

```
ADMIN USER:
├─ Dashboard     ✓
├─ Products      ✓
├─ Inventory     ✓
├─ Sales         ✓
├─ Suppliers     ✓
├─ Reports       ✓
├─ Settings      ✓
└─ Help          ✓
Total: 8/8 items visible

MANAGER USER:
├─ Dashboard     ✓
├─ Products      ✓
├─ Inventory     ✓
├─ Sales         ✓
├─ Suppliers     ✓
├─ Reports       ✓
├─ Settings      ✓
└─ Help          ✓
Total: 8/8 items visible

SALES USER:
├─ Dashboard     ✗
├─ Products      ✗
├─ Inventory     ✗
├─ Sales         ✓
├─ Suppliers     ✗
├─ Reports       ✗
├─ Settings      ✗
└─ Help          ✓
Total: 2/8 items visible
```

## Navigation State Changes

```
User Clicks Navigation Link
    │
    └─> Route Changes (/dashboard/products)
        │
        ├─> usePathname() detects new route
        │
        ├─> Sidebar highlights "Products" item (green background)
        │
        ├─> TopNav updates title to "Products"
        │
        ├─> Breadcrumb shows "Home > Products"
        │
        └─> Products page component renders
```

## Active Route Detection

```
Current Route: /dashboard/products

Sidebar Item Check:
├─ href: /dashboard                    ✗ NOT ACTIVE
├─ href: /dashboard/products           ✓ ACTIVE (exact match)
├─ href: /dashboard/inventory          ✗ NOT ACTIVE
├─ href: /dashboard/sales              ✗ NOT ACTIVE
└─ ... (rest not active)

Active Item Styling:
├─ Background: green-100
├─ Text Color: green-700
├─ Font Weight: semibold
└─ Visual Style: [HIGHLIGHTED]
```

## Responsive Navigation Behavior

```
MOBILE (< 768px):
┌──────────────┐
│ Sidebar (fixed left) │   Quick Nav: 2 columns
│ ┌──────────┐│        │
│ │Dashboard ││
│ │Products  ││
│ │...       ││
└──────────────┘

TABLET (768-1024px):
┌──────────────────┐
│ Sidebar (left)   │ Quick Nav: 3 columns
│ Products         │
│ Inventory        │
│ Sales            │
└──────────────────┘

DESKTOP (> 1024px):
┌─────────────────────────┐
│ Sidebar    │ Main Area  │ Quick Nav: 4 columns
│ Dashboard  │            │
│ Products   │ Content    │
│ Inventory  │            │
│ Sales      │            │
│ Suppliers  │            │
│ Reports    │            │
│ Settings   │            │
│ Help       │            │
└─────────────────────────┘
```

## Navigation Component Hierarchy

```
app/dashboard/layout.tsx
    │
    ├─── Sidebar.tsx
    │    ├─ Navigation Items (8 sections)
    │    ├─ Role-based Filtering
    │    └─ Active State Highlighting
    │
    ├─── TopNav.tsx
    │    ├─ Dynamic Page Title
    │    ├─ Theme Toggle
    │    └─ Logout Button
    │
    ├─── Breadcrumb.tsx
    │    ├─ Current Path Detection
    │    ├─ Navigation Links
    │    └─ Breadcrumb Display
    │
    └─── Main Content Area
         └─ Child Pages
            ├─ Dashboard (includes QuickNav.tsx)
            ├─ Products
            ├─ Inventory
            ├─ Sales
            ├─ Suppliers
            ├─ Reports
            ├─ Settings
            └─ Help
```

## Click Flow Diagram

```
                     ┌─────────────────┐
                     │  User Interface │
                     └────────┬────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
                    ▼         ▼         ▼
              ┌─────────┐┌──────────┐┌────────┐
              │ Sidebar ││ TopNav   ││ Breadcr│
              │ Links   ││ Buttons  ││ umbs   │
              └────┬────┘└────┬─────┘└───┬────┘
                   │          │          │
                   ▼          ▼          ▼
              ┌─────────────────────────────────┐
              │  Navigation Handler             │
              │  (useRouter/Link)               │
              └──────────┬──────────────────────┘
                         │
                         ▼
              ┌─────────────────────────────────┐
              │  Route Change                   │
              │  (/dashboard/products)          │
              └──────────┬──────────────────────┘
                         │
                ┌────────┴────────┐
                │                 │
                ▼                 ▼
        ┌──────────────┐  ┌─────────────────┐
        │Update URL    │  │Update Components│
        │              │  │┌────────────────┤
        │pathname      │  ││- TopNav title  │
        │changes       │  ││- Breadcrumb    │
        │              │  ││- Sidebar state │
        │              │  │└────────────────┘
        └──────────────┘  └─────────────────┘
```

This visual guide helps understand the complete navigation system architecture and user interaction flows.
