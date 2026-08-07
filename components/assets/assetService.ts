import { apiRequest } from "@/lib/queryClient";
import type {
  Asset,
  AssetCategory,
  AssetPayload,
  AssetCategoryPayload,
} from "@/lib/types";

export async function fetchAssetCategories(
  token?: string,
  businessId?: string,
) {
  const response = await apiRequest(
    "GET",
    "/assets/categories",
    businessId ? { businessId } : {},
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to load asset categories");
  }

  const payload = await response.json();
  return Array.isArray(payload?.data) ? (payload.data as AssetCategory[]) : [];
}

export async function createAssetCategory(
  payload: AssetCategoryPayload,
  token?: string,
) {
  const response = await apiRequest(
    "POST",
    "/assets/categories",
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to create asset category");
  }

  const data = await response.json();
  return data?.data as AssetCategory;
}

export async function updateAssetCategory(
  id: string,
  payload: Partial<AssetCategoryPayload>,
  token?: string,
) {
  const response = await apiRequest(
    "PUT",
    `/assets/categories/${id}`,
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to update asset category");
  }

  const data = await response.json();
  return data?.data as AssetCategory;
}

export async function deleteAssetCategory(id: string, token?: string) {
  const response = await apiRequest(
    "DELETE",
    `/assets/categories/${id}`,
    undefined,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to delete asset category");
  }

  const data = await response.json();
  return data?.data as AssetCategory;
}

export async function fetchAssets(
  token?: string,
  businessId?: string,
  branchId?: string,
  categoryId?: string,
  assetType?: string,
  status?: string,
) {
  const response = await apiRequest(
    "GET",
    "/assets",
    {
      businessId,
      branchId,
      categoryId,
      assetType,
      status,
    },
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to load assets");
  }

  const payload = await response.json();
  return Array.isArray(payload?.data) ? (payload.data as Asset[]) : [];
}

export async function createAsset(payload: AssetPayload, token?: string) {
  const response = await apiRequest(
    "POST",
    "/assets",
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to create asset");
  }

  const data = await response.json();
  return data?.data as Asset;
}

export async function updateAsset(
  id: string,
  payload: Partial<AssetPayload>,
  token?: string,
) {
  const response = await apiRequest(
    "PUT",
    `/assets/${id}`,
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to update asset");
  }

  const data = await response.json();
  return data?.data as Asset;
}

export async function deleteAsset(id: string, token?: string) {
  const response = await apiRequest(
    "DELETE",
    `/assets/${id}`,
    undefined,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to delete asset");
  }

  const data = await response.json();
  return data?.data as Asset;
}
