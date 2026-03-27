# Notification System - Implementation Guide

## Overview

A fully functional in-app notification system has been implemented with support for:

- 🔔 Real-time notifications
- 📱 Notification sidebar (right-aligned)
- 🔴 Unread count badge on bell icon
- 🎯 Multiple notification types
- 💾 Notification history

## Notification Types

### 1. **Low Stock Alert** (`low_stock`)

Triggered when product stock falls to reorder level

```typescript
notifyLowStock("Product Name");
```

- **Color**: Amber
- **Icon**: AlertTriangle
- **Priority**: High

### 2. **Stock Out** (`stock_out`)

Triggered when product stock reaches zero

```typescript
notifyStockOut("Product Name");
```

- **Color**: Red
- **Icon**: AlertCircle
- **Priority**: High

### 3. **New Sale** (`new_sale`)

Triggered when a sale is completed

```typescript
notifyNewSale("S-1234567890", "$1,234.56");
```

- **Color**: Green
- **Icon**: ShoppingCart
- **Priority**: Medium

### 4. **New Product** (`new_product`)

Triggered when a new product is added to inventory

```typescript
notifyNewProduct("Product Name");
```

- **Color**: Blue
- **Icon**: Package
- **Priority**: Low

### 5. **Data Sync** (`data_sync`)

Triggered when data is synchronized

```typescript
notifyDataSync("Custom sync message");
```

- **Color**: Purple
- **Icon**: Zap
- **Priority**: Low

### 6. **No Internet** (`no_internet`)

Triggered when internet connection is lost

```typescript
notifyNoInternet();
```

- **Color**: Gray
- **Icon**: Wifi
- **Priority**: High

### 7. **Credentials Change** (`credentials_change`)

Triggered when user credentials are modified

```typescript
notifyCredentialsChange("Password changed");
```

- **Color**: Orange
- **Icon**: Key
- **Priority**: High

### 8. **Generic Notifications**

Custom success, error, warning, and info messages

```typescript
notifySuccess("Title", "Message");
notifyError("Title", "Message");
notifyWarning("Title", "Message");
notifyInfo("Title", "Message");
```

## Usage in Components

### Using the Hook

```typescript
import { useNotificationActions } from '@/hooks/useNotificationActions';

export function MyComponent() {
  const { notifyNewSale, notifySuccess } = useNotificationActions();

  const handleSale = (sale) => {
    // Do something
    notifyNewSale(sale.saleNumber, formatCurrency(sale.totalAmount));
  };

  return <div>Your component</div>;
}
```

### Direct Context Usage

```typescript
import { useNotifications } from '@/context/NotificationContext';

export function MyComponent() {
  const { addNotification, removeNotification } = useNotifications();

  const handleCustomNotification = () => {
    const notificationId = addNotification(
      'low_stock',
      'Stock Alert',
      'Make extra checks before going out',
      'high'
    );

    // Remove after 5 seconds
    setTimeout(() => removeNotification(notificationId), 5000);
  };

  return <div>Your component</div>;
}
```

## Component Architecture

### 1. **NotificationContext** (`context/NotificationContext.tsx`)

- Manages notification state
- Provides methods to add/remove/read notifications
- Stores up to 50 notifications in session

### 2. **NotificationSidebar** (`components/notifications/NotificationSidebar.tsx`)

- Right-aligned sidebar panel
- Shows all notifications with timestamps
- Mark as read / Clear all functionality
- Color-coded by notification type

### 3. **TopNav Integration** (`components/shared/TopNav.tsx`)

- Bell icon with unread count badge
- Click to toggle notification sidebar
- Displays unread notification count in red badge

### 4. **useNotificationActions Hook** (`hooks/useNotificationActions.ts`)

- Pre-configured notification methods
- Type-safe notification creation
- Simplified API for components

## Integrated Locations

### Sales Page (`app/dashboard/sales/page.tsx`)

- ✅ `notifyNewSale` - When sale is completed
- ✅ Passes sale number and total amount

### Products Page (`app/dashboard/products/page.tsx`)

- ✅ `notifyNewProduct` - When product is added
- ✅ `notifySuccess` - When product is updated

### Inventory Page (`app/dashboard/inventory/page.tsx`)

- ✅ `notifyLowStock` - When product reaches reorder level
- ✅ `notifyStockOut` - When product stock is zero
- ✅ `notifySuccess` - When stock in/out movement completes
- ✅ Automatic detection of stock status changes

## Provider Setup

The notification system is already integrated in the provider hierarchy:

```
Providers (providers.tsx)
├── ThemeProvider
├── QueryClientProvider
├── AuthProvider
├── SettingsProvider
├── DataProvider
└── NotificationProvider ← NEW
    └── All app content has access to notifications
```

## Features

### ✅ Real-time Updates

Notifications appear instantly when triggered

### ✅ Unread Count

Badge shows number of unread notifications, updates automatically

### ✅ History

Up to 50 notifications stored and accessible from sidebar

### ✅ Dismiss Actions

- Click notification to mark as read
- Click X to remove notification
- "Mark All Read" button
- "Clear All" button

### ✅ Color Coding

Each notification type has distinct color for quick visual identification

### ✅ Timestamps

All notifications show creation time in "MMM dd, p" format

### ✅ Icons

Each notification type has a relevant icon for quick recognition

## Testing the System

### 1. Test New Sale Notification

1. Go to Sales page
2. Complete a sale form
3. After submission, check notification sidebar (bell icon)
4. Should see "Sale Completed" notification with sale number

### 2. Test New Product Notification

1. Go to Products page
2. Click "Add Product"
3. Fill form and save
4. Check notification sidebar
5. Should see "New Product Added" notification

### 3. Test Stock Notifications

1. Go to Inventory page
2. Create a stock movement that brings product to reorder level
3. Check notification sidebar for low stock alert
4. Create another that brings it to zero
5. Should see stock out notification

### 4. Test Sidebar

1. Click bell icon in top nav
2. Sidebar should slide in from right
3. Click notification to mark as read
4. Click X to remove
5. Use "Mark All Read" and "Clear All" buttons
6. Close overlay to close sidebar

## Persistence

**Current Implementation:**

- Notifications persist during session (in component state)
- Notifications clear on page refresh
- Up to 50 notifications stored at any time

**Future Enhancement** (if needed):

- Save notifications to localStorage
- Sync with backend database
- Filter notifications by date range

## Customization

To add new notification types, edit:

1. `lib/types.ts` - Add to `NotificationType` union
2. `hooks/useNotificationActions.ts` - Add helper method
3. `components/notifications/NotificationSidebar.tsx` - Add color/icon mapping

Example:

```typescript
// In types.ts
type NotificationType = '...' | 'my_new_type';

// In useNotificationActions.ts
notifyMyNewType: (message: string) =>
  addNotification(
    'my_new_type',
    'My Title',
    message,
    'high'
  ),

// In NotificationSidebar.tsx
case 'my_new_type':
  return <MyIcon className="w-5 h-5 text-purple-600" />;
```

## Files Created/Modified

### Created:

- ✅ `context/NotificationContext.tsx`
- ✅ `components/notifications/NotificationSidebar.tsx`
- ✅ `hooks/useNotificationActions.ts`

### Modified:

- ✅ `lib/types.ts` - Added Notification interfaces
- ✅ `components/providers.tsx` - Added NotificationProvider
- ✅ `components/shared/TopNav.tsx` - Added bell icon + sidebar toggle
- ✅ `app/dashboard/sales/page.tsx` - Added new sale notifications
- ✅ `app/dashboard/products/page.tsx` - Added product notifications
- ✅ `app/dashboard/inventory/page.tsx` - Added stock notifications

## Next Steps

The notification system is fully functional and ready to use. You can:

1. **Extend triggers** - Add notifications to more pages/actions
2. **Add persistence** - Save to localStorage or database
3. **Enable email/SMS** - Integrate with email/SMS providers for important notifications
4. **Add filters** - Let users filter notifications by type
5. **Set auto-dismiss** - Automatically dismiss notifications after time period

---

**Status**: ✅ Fully Implemented and Integrated
**Last Updated**: March 26, 2026
