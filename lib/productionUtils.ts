export interface BomComponentInput {
  componentId?: string;
  quantity?: number;
  unit?: string;
}

export interface BomUsageEntry {
  componentId: string;
  requiredQuantity: number;
  unit: string;
}

export function computeProduced(
  openingStock = 0,
  closingStock = 0,
  sales = 0,
  damagedQuantity = 0,
): number {
  return (
    Number(closingStock || 0) +
    Number(sales || 0) +
    Number(damagedQuantity || 0) -
    Number(openingStock || 0)
  );
}

export function computeBomUsage(
  bom: BomComponentInput[] = [],
  producedUnits = 0,
): BomUsageEntry[] {
  if (!Array.isArray(bom) || producedUnits <= 0) return [];

  return bom.map((component) => ({
    componentId: component.componentId || "",
    requiredQuantity: Number(component.quantity || 0) * producedUnits,
    unit: component.unit || "units",
  }));
}

export function formatBulkUnitLabel(
  bulkUnitKey?: string,
  bulkUnitValue?: string,
): string {
  const key = String(bulkUnitKey || "").trim();
  const value = String(bulkUnitValue || "").trim();

  if (key && value) return `${key} ${value}`;
  if (key) return key;
  return value;
}
