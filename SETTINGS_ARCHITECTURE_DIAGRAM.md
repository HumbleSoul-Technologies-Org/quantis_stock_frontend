# Settings Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        SETTINGS SYSTEM                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      React Components                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │  Dashboard   │ │   Inventory  │ │   Products   │ ...         │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘             │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                        │
│                   useSettings() Hook                             │
│                          │                                        │
└──────────────────────────┼────────────────────────────────────────┘
                           │
┌──────────────────────────┼────────────────────────────────────────┐
│                SettingsContext Provider                           │
│  ┌──────────────────────────────────────────────────┐             │
│  │  • Loads settings on mount                        │             │
│  │  • updateSettings(Partial<AppSettings>)           │             │
│  │  • formatCurrency() method                        │             │
│  │  • Provides to all child components              │             │
│  └──────────────────────────────────────────────────┘             │
│                          │                                        │
│                   updateSettings()                               │
│                          │                                        │
└──────────────────────────┼────────────────────────────────────────┘
                           │
┌──────────────────────────┼────────────────────────────────────────┐
│              Storage Layer (lib/storage.ts)                       │
│  ┌──────────────────────────────────────────────────┐             │
│  │  • getSettings(): AppSettings                    │             │
│  │  • updateSettings(Partial<AppSettings>)          │             │
│  │  • Deep merge strategy for nested objects        │             │
│  │  • Validates data before saving                  │             │
│  └──────────────────────────────────────────────────┘             │
│                          │                                        │
│              localStorage.setItem()                              │
│                          │                                        │
└──────────────────────────┼────────────────────────────────────────┘
                           │
┌──────────────────────────┼────────────────────────────────────────┐
│              localStorage (Browser)                               │
│  ┌──────────────────────────────────────────────────┐             │
│  │  Key: 'erp_system_state'                         │             │
│  │  Value: JSON(AppSettings)                        │             │
│  │  Persists across page refreshes                  │             │
│  └──────────────────────────────────────────────────┘             │
└──────────────────────────────────────────────────────────────────┘
```

---

## AppSettings Schema Structure

```
AppSettings
│
├─ currency
│  ├─ symbol: "$"
│  ├─ code: "USD"
│  └─ decimalPlaces: 2
│
├─ units
│  ├─ weight: "kg"
│  ├─ volume: "L"
│  └─ count: "units"
│
├─ notifications
│  ├─ emailAlerts: true
│  ├─ smsAlerts: false
│  ├─ lowStockAlerts: true
│  └─ saleNotifications: true
│
├─ general
│  ├─ companyName: "My Stock Manager"
│  ├─ contactEmail: "contact@company.com"
│  └─ theme: "light"
│
└─ credentials
   ├─ teamUsers: [
   │  ├─ {
   │  │  ├─ id: "1234567"
   │  │  ├─ name: "John Doe"
   │  │  ├─ email: "john@company.com"
   │  │  ├─ password: "hashed_password"
   │  │  ├─ role: "sales"
   │  │  ├─ createdAt: "2024-03-26T..."
   │  │  └─ lastLogin: "2024-03-26T..." | null
   │  │ }
   │  └─ ...more users
   │ ]
   ├─ passwordPolicy: {
   │  ├─ minLength: 8
   │  ├─ requireMixedCase: true
   │  ├─ requireNumbers: true
   │  └─ requireSpecialChars: false
   │ }
   └─ sessionTimeout: 30
```

---

## Update Flow Diagram

```
Settings Component
       ↓
  [User Action]
       ↓
  handleSave()
       ↓
  onUpdate(Partial<AppSettings>)
       ↓
  SettingsContext.updateSettings()
       ↓
  storage.updateSettings()
       ↓
  Deep Merge Applied
  ├─ Existing settings preserved
  ├─ New values merged in
  ├─ Nested objects combined
  └─ Arrays replaced
       ↓
  localStorage.setItem('erp_system_state', JSON.stringify(...))
       ↓
  setState() → React re-render
       ↓
  All useSettings() consumers updated
       ↓
  UI reflects changes immediately
```

---

## Component Integration Map

```
                    Settings Page
                    (dashboard/settings)
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   General Settings   Currency Settings   Units Settings
   (general section)  (currency section)  (units section)
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                ┌───────────┼───────────┐
                │           │           │
                ▼           ▼           ▼
        Notifications   Credentials    [Future]
        (notifications) (credentials)
        Settings        Settings
```

---

## Deep Merge Example

```
BEFORE UPDATE:
{
  currency: { symbol: "$", code: "USD", decimalPlaces: 2 },
  units: { weight: "kg", volume: "L", count: "units" },
  notifications: { emailAlerts: true, ... },
  credentials: { teamUsers: [...], passwordPolicy: {...} }
}

UPDATE WITH:
{
  currency: { decimalPlaces: 3 }
}

MERGE PROCESS:
1. Identify nested object: currency
2. Get existing currency: { symbol: "$", code: "USD", decimalPlaces: 2 }
3. Apply update: { decimalPlaces: 3 }
4. Result: { symbol: "$", code: "USD", decimalPlaces: 3 }
5. Preserve other sections: units, notifications, credentials

AFTER UPDATE:
{
  currency: { symbol: "$", code: "USD", decimalPlaces: 3 },  ← UPDATED
  units: { weight: "kg", volume: "L", count: "units" },      ← UNCHANGED
  notifications: { emailAlerts: true, ... },                ← UNCHANGED
  credentials: { teamUsers: [...], passwordPolicy: {...} }  ← UNCHANGED
}
```

---

## Settings Access Pattern

```
Component Tree
      │
      ├─ SettingsProvider (wraps entire app)
      │
      └─ Any Component
         │
         └─ useSettings()
            ├─ settings: AppSettings (read access)
            ├─ updateSettings(): (write access)
            └─ formatCurrency(): (utility)
```

---

## Data Flow: Create User Example

```
User clicks "Add User" in CredentialsSettings
         │
         ▼
    Fills form
         │
         ▼
    Submits form
         │
         ▼
    handleCreateUser() validates
         │
         ▼
    Creates new TeamUser object
         │
         ▼
    Gets existing teamUsers from settings
         │
         ▼
    Adds new user: [...existingUsers, newUser]
         │
         ▼
    Calls updateSettings({
      credentials: {
        ...settings.credentials,
        teamUsers: [...existingUsers, newUser]
      }
    })
         │
         ▼
    SettingsContext receives update
         │
         ▼
    storage.updateSettings() applies deep merge
         │
         ▼
    Merged result saved to localStorage
         │
         ▼
    React state updated
         │
         ▼
    Component re-renders
         │
         ▼
    Table shows new user
         │
         ▼
    Success message displayed
         │
         ▼
    User persists on page refresh ✓
```

---

## Settings Usage Throughout App

```
┌─────────────────────────────────────────────┐
│        Settings Context (Global)            │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴───────┬───────────┬──────────┐
       │               │           │          │
       ▼               ▼           ▼          ▼
   Dashboard     ProductForm   InventoryView  AlertSystem
   formatCurrency  useUnits()   useSettings() checkNotifications()
   getTheme()      getUnits()   ...
   ...
```

---

## Error Handling Flow

```
updateSettings(partial)
       │
       ▼
   Try {
       Deep merge
           │
       ├─ Success: save to localStorage
       │
       └─ Error: catch + display error message
   }
       │
       ▼
   setState() or setMessage()
       │
       ▼
   Component updates
```

---

## Persistence Lifecycle

```
App Load
   │
   ▼
Check localStorage for 'erp_system_state'
   │
   ├─ Found: Parse JSON → Load as settings
   │
   └─ Not found: Use DEFAULT_SETTINGS
   │
   ▼
SettingsProvider initializes with settings
   │
   ▼
Components access via useSettings()
   │
   ▼
User makes changes
   │
   ▼
updateSettings() called
   │
   ▼
storage.updateSettings() + localStorage.setItem()
   │
   ▼
User refreshes page
   │
   ▼
Settings reloaded from localStorage ✓
```

---

## Type Safety Chain

```
AppSettings (interface)
       │
       ├─ Types.ts defines structure
       │
       ├─ Storage.ts uses type
       │
       ├─ SettingsContext enforces type
       │
       ├─ Components receive typed props
       │
       └─ TypeScript lints all access
          → Compile-time error prevention
```

---

## Comparison: Before vs After

```
BEFORE (localStorage in components)
├─ Team users: localStorage.getItem("team_users")
├─ Currency: AppSettings.currency
├─ Units: AppSettings.units
├─ Notifications: AppSettings.notifications
├─ General: AppSettings.general
│
└─ Problems:
   ├─ Inconsistent storage
   ├─ No centralized updates
   ├─ Data silos
   └─ Hard to maintain

AFTER (Centralized AppSettings)
├─ Team users: AppSettings.credentials.teamUsers ✓
├─ Currency: AppSettings.currency ✓
├─ Units: AppSettings.units ✓
├─ Notifications: AppSettings.notifications ✓
├─ General: AppSettings.general ✓
│
└─ Benefits:
   ├─ Single source of truth
   ├─ Consistent updates
   ├─ Deep merge strategy
   ├─ Global access via hook
   ├─ Type-safe
   └─ Easy to maintain
```

---

## Component Communication

```
CurrencySettings
       │
       ├─ Receives: settings, onUpdate
       ├─ Emits: updateSettings({currency: {...}})
       │
       └─ SettingsContext
          │
          ├─ Updates state
          ├─ Persists to storage
          │
          └─ Broadcasts to all consumers
             │
             └─ Dashboard (formatCurrency)
             └─ ProductForm (any component using settings)
             └─ Other settings components
             └─ Alert system
             └─ ... any consumer
```

---

## Configuration Hierarchy

```
DEFAULT_SETTINGS (lib/storage.ts)
       │
       ├─ Fallback for missing values
       ├─ Ensures all fields present
       │
       ▼
localStorage (if exists)
       │
       ├─ Persisted user preferences
       ├─ Overrides defaults
       │
       ▼
Runtime AppSettings
       │
       └─ Accessible via useSettings()
```

---

## Future Enhancement Points

```
Current Implementation
└─ Core settings management ✓

Potential Enhancements
├─ Settings versioning
├─ Settings export/import
├─ Audit log for changes
├─ Role-based visibility
├─ Sync across tabs
├─ Settings backup/restore
├─ Scheduled backups
└─ Settings templates
```
