# Resource Notifications Hook

Global toasting notifications using `sonner` library for consistent resource CRUD feedback.

## Installation & Setup

The hook is already set up in your project:

- Hook: `hooks/useResourceNotifications.ts`
- Provider: `components/providers.tsx` (Toaster is already configured)

## Usage

### Basic Import

```typescript
import { useResourceNotifications } from "@/hooks/useResourceNotifications";

function MyComponent() {
  const { productCreated, productError } = useResourceNotifications();

  // Use in your component
}
```

## Available Methods

### Generic Methods

```typescript
const {
  notifySuccess, // Custom success notification
  notifyError, // Custom error notification
  notifyLoading, // Show loading toast, returns toastId
  dismissToast, // Dismiss a specific toast
  updateToast, // Update a loading toast to success/error
} = useResourceNotifications();
```

### Product Operations

```typescript
const {
  productCreated, // notifySuccess with product name
  productUpdated, // notifySuccess with product name
  productDeleted, // notifySuccess with product name
  productError, // notifyError for product operations
} = useResourceNotifications();

// Usage examples
productCreated("Widget Pro"); // "Product created successfully"
productUpdated("Widget Pro"); // "Product updated successfully"
productDeleted("Widget Pro"); // "Product deleted successfully"
productError("created", "API error"); // "Failed to create product: API error"
```

### Inventory Operations

```typescript
const {
  inventoryMovementCreated, // notifySuccess with type and product name
  inventoryMovementUpdated, // notifySuccess with product name
  inventoryMovementDeleted, // notifySuccess with product name
  inventoryError, // notifyError for inventory operations
} = useResourceNotifications();

// Usage examples
inventoryMovementCreated("Stock In", "Widget Pro");
inventoryMovementUpdated("Widget Pro");
inventoryMovementDeleted("Widget Pro");
inventoryError("created", "Stock level invalid");
```

### Sales Operations

```typescript
const {
  saleCreated, // notifySuccess with sale number and amount
  saleUpdated, // notifySuccess with sale number
  saleDeleted, // notifySuccess with sale number
  saleError, // notifyError for sales operations
} = useResourceNotifications();

// Usage examples
saleCreated("SALE-001", "$150.00");
saleUpdated("SALE-001");
saleDeleted("SALE-001");
saleError("created", "Product out of stock");
```

## Real-World Example: Products Page

```typescript
import { useResourceNotifications } from "@/hooks/useResourceNotifications";

function ProductsPageContent() {
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const { productCreated, productUpdated, productDeleted, productError } =
    useResourceNotifications();

  const handleAddProduct = (product: Product) => {
    try {
      if (editingProduct) {
        updateProduct(editingProduct?.id, product);
        productUpdated(product.name);
      } else {
        addProduct(product);
        productCreated(product.name);
      }
      setShowDialog(false);
    } catch (error) {
      productError("created", error.message);
    }
  };

  const handleDeleteProduct = (id: string) => {
    try {
      const product = products.find((p) => p.id === id);
      deleteProduct(id);
      productDeleted(product.name);
    } catch (error) {
      productError("deleted", error.message);
    }
  };
}
```

## Advanced: Loading State with Async Operations

```typescript
const { notifyLoading, updateToast, dismissToast } = useResourceNotifications();

const handleAsyncCreate = async (product: Product) => {
  // Show loading toast
  const toastId = notifyLoading({
    resourceType: "Product",
    action: "created",
  });

  try {
    await apiRequest("POST", "/products", product);

    // Update to success
    updateToast(
      toastId,
      {
        resourceType: "Product",
        action: "created",
        resourceName: product.name,
      },
      true,
    );
  } catch (error) {
    // Update to error
    updateToast(
      toastId,
      {
        resourceType: "Product",
        action: "created",
        error: error.message,
      },
      false,
    );
  }
};
```

## Toast Configuration

The Toaster is configured in `components/providers.tsx` with:

- **Position**: `top-right`
- **Theme**: `light` (respects system theme)
- **Close Button**: Enabled
- **Rich Colors**: Enabled (color-coded by type)
- **Expand**: Enabled (stacks vertically)

### Customizing Position

Edit `components/providers.tsx`:

```typescript
<Toaster
  position="top-center"  // Options: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
  richColors
  closeButton
  theme="light"
  expand={true}
/>
```

## Toast Types & Duration

- **Success**: 3000ms (3 seconds)
- **Error**: 4000ms (4 seconds)
- **Loading**: Infinite (must be dismissed or updated manually)

All toasts support custom descriptions for additional context.
