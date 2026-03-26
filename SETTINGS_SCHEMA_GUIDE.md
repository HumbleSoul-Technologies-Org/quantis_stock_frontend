# Settings Schema Guide

## Overview

The application uses a centralized settings management system through `AppSettings` interface. All configuration, regardless of section (currency, units, notifications, credentials), is stored in a single schema and persisted through localStorage.

## Settings Architecture

### 1. AppSettings Schema (lib/types.ts)

```typescript
interface AppSettings {
  currency: {
    /* Currency config */
  };
  units: {
    /* Measurement units */
  };
  notifications: {
    /* Alert preferences */
  };
  general: {
    /* Company info & theme */
  };
  credentials: {
    /* Team users & password policy */
  };
}
```

### 2. Storage Layer (lib/storage.ts)

- **Persistence**: localStorage with key `erp_system_state`
- **Default Settings**: `DEFAULT_SETTINGS` constant
- **Methods**:
  - `getSettings()`: Retrieve current settings
  - `updateSettings(partial)`: Update settings (deep merge)

### 3. Context Layer (context/SettingsContext.tsx)

- **Provider**: `SettingsProvider` wraps app in layout
- **Hook**: `useSettings()` for settings access
- **Features**:
  - Auto-loads settings on mount
  - Provides `updateSettings()` method
  - Formats currency using settings

---

## Settings Sections

### 1. Currency Settings

**Path**: `settings.currency`

```typescript
{
  symbol: string; // e.g., "$", "€", "KSh"
  code: string; // e.g., "USD", "EUR", "KES"
  decimalPlaces: number; // 0-3 decimal places
}
```

**Component**: `CurrencySettings.tsx`
**Usage**: `formatCurrency()` hook method

---

### 2. Units Settings

**Path**: `settings.units`

```typescript
{
  weight: string; // e.g., "kg", "lbs", "oz", "g"
  volume: string; // e.g., "L", "ml", "gallons", "fl oz"
  count: string; // e.g., "units", "boxes", "pieces", "cartons", "tablets"
}
```

**Component**: `UnitsSettings.tsx`
**Features**: Dynamically loads available units from business config
**Usage**: Product forms, inventory management

---

### 3. Notification Settings

**Path**: `settings.notifications`

```typescript
{
  emailAlerts: boolean; // Email notifications enabled
  smsAlerts: boolean; // SMS notifications enabled
  lowStockAlerts: boolean; // Low stock alerts enabled
  saleNotifications: boolean; // Sale completion notifications
}
```

**Component**: `NotificationSettings.tsx`
**Usage**: Alert system integration

---

### 4. General Settings (Company Info & Theme)

**Path**: `settings.general`

```typescript
{
  companyName: string; // e.g., "My Stock Manager"
  contactEmail: string; // e.g., "contact@company.com"
  theme: "light" | "dark"; // UI theme
}
```

**Component**: `CombinedGeneralSettings.tsx`
**Usage**: Header, footer, UI styling

---

### 5. Credentials Settings (Team Users & Password Policy)

**Path**: `settings.credentials`

```typescript
interface Credentials {
  teamUsers: TeamUser[];
  passwordPolicy?: {
    minLength: number; // Minimum 8 characters
    requireMixedCase: boolean; // A-Z and a-z
    requireNumbers: boolean; // 0-9
    requireSpecialChars: boolean; // !@#$%^&*
  };
  sessionTimeout?: number; // Minutes
}

interface TeamUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "sales" | "accountant" | "manager";
  createdAt: string;
  lastLogin: string | null;
}
```

**Component**: `CredentialsSettings.tsx`
**Admin Only**: Team user management
**Usage**: User authentication, team management

---

## Global Usage Example

### Accessing Settings

```tsx
import { useSettings } from "@/context/SettingsContext";

export function MyComponent() {
  const { settings, updateSettings, formatCurrency } = useSettings();

  // Access settings
  const currencySymbol = settings.currency.symbol;
  const weightUnit = settings.units.weight;
  const emailAlertsEnabled = settings.notifications.emailAlerts;
  const teamUsers = settings.credentials.teamUsers;

  // Format currency
  const formatted = formatCurrency(100);

  // Update settings
  const handleUpdate = () => {
    updateSettings({
      units: { ...settings.units, weight: "lbs" },
    });
  };
}
```

### Persisting Settings

All `updateSettings()` calls automatically:

1. Update React state (immediate UI update)
2. Persist to localStorage (durability)
3. Deep merge nested properties (no data loss)

---

## Data Flow

```
User Action (Settings Component)
    ↓
updateSettings() called with Partial<AppSettings>
    ↓
SettingsContext processes & updates React state
    ↓
AppSettings stored in localStorage via storage.ts
    ↓
format/update reflected throughout app via useSettings()
```

---

## Deep Merge Strategy

When updating settings, nested objects are automatically merged:

```typescript
// Before update
currency: { symbol: '$', code: 'USD', decimalPlaces: 2 }

// Update with
updateSettings({ currency: { decimalPlaces: 3 } })

// After merge
currency: { symbol: '$', code: 'USD', decimalPlaces: 3 }
```

This prevents accidental data loss when updating specific fields.

---

## Component Integration Pattern

### Settings Component Template

```tsx
interface ComponentProps {
  settings: AppSettings;
  onUpdate: (settings: Partial<AppSettings>) => void;
}

export function MySettingsComponent({ settings, onUpdate }: ComponentProps) {
  const [formData, setFormData] = useState(settings.section);

  const handleSave = () => {
    onUpdate({ section: formData });
  };

  return (
    <Card>
      {/* Form fields */}
      <Button onClick={handleSave}>Save</Button>
    </Card>
  );
}
```

---

## Best Practices

✅ **DO**:

- Use `useSettings()` hook for all setting access
- Call `updateSettings()` from settings components only
- Deep merge when updating nested objects
- Validate settings before updating
- Show success/error messages after updates

❌ **DON'T**:

- Access localStorage directly (use storage.ts)
- Mutate settings state directly
- Store settings in multiple places
- Use hardcoded defaults instead of settings
- Update settings from non-settings components

---

## Migration Checklist

- [x] Team users moved from localStorage to AppSettings
- [x] Password policy added to credentials section
- [x] Session timeout configuration available
- [x] Deep merge strategy for nested updates
- [x] All settings components use centralized provider
- [x] Settings fully persisted and retrieved
- [x] Global access via useSettings() hook

---

## Future Enhancements

- [ ] Settings versioning for migrations
- [ ] Settings export/import functionality
- [ ] Audit log for settings changes
- [ ] Role-based settings visibility
- [ ] Settings syncing across multiple tabs
- [ ] Settings backup & restore
