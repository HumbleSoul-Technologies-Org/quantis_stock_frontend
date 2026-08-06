## 9. Asset Register Structure

### 9.1 Asset

```ts
type Asset = {
  id: string;
  businessId: string;
  branchId?: string;
  categoryId: string;
  name: string;
  description?: string;
  code?: string;
  assetType:
    | "property"
    | "equipment"
    | "vehicle"
    | "furniture"
    | "tool"
    | "other";
  acquisitionDate: string;
  acquisitionCost: number;
  currentValue?: number;
  depreciationMethod?: "straightLine" | "reducingBalance" | "none";
  usefulLifeYears?: number;
  status: "inUse" | "stored" | "maintenance" | "disposed" | "lost";
  location?: string;
  custodianId?: string;
  purchaseInvoiceRef?: string;
  createdAt?: string;
  updatedAt?: string;
};
```

### 9.2 Asset Category

```ts
type AssetCategory = {
  id: string;
  name: string;
  type: "property" | "equipment" | "vehicle" | "furniture" | "tool" | "other";
};
```

### 9.3 Asset Valuation

```ts
type AssetValuation = {
  id: string;
  assetId: string;
  recordedAt: string;
  bookValue: number;
  depreciationAmount?: number;
  note?: string;
};
```

### 9.4 Asset Maintenance

```ts
type AssetMaintenance = {
  id: string;
  assetId: string;
  maintenanceDate: string;
  description: string;
  cost: number;
  performedBy?: string;
  status: "scheduled" | "completed" | "pending";
};
```

### 9.5 Asset Transfer

```ts
type AssetTransfer = {
  id: string;
  assetId: string;
  fromLocation?: string;
  toLocation?: string;
  transferredAt: string;
  transferredBy?: string;
  note?: string;
};
```

### 9.6 Asset Disposal

```ts
type AssetDisposal = {
  id: string;
  assetId: string;
  disposalDate: string;
  disposalType: "sold" | "scrapped" | "writtenOff" | "transferred";
  amount?: number;
  note?: string;
};
```

### 9.7 Recommended Sub-features

- asset registration
- asset categories
- location and custodian tracking
- valuation and depreciation
- maintenance history
- transfer tracking
- disposal tracking
- reports by branch, category, or status

This gives the business a practical asset lifecycle model for property, equipment, vehicles, and other owned resources.
