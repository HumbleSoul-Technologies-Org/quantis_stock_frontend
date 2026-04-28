import { getMapping, upsertMapping } from "./db";
import { IdMapping } from "./types";

async function resolveTempId(value: string, cache: Map<string, string | null>) {
  if (!value?.startsWith("temp_")) {
    return value;
  }

  if (cache.has(value)) {
    return cache.get(value) ?? value;
  }

  const mapping = await getMapping(value);
  const realId = mapping?.realId ?? null;
  cache.set(value, realId);
  return realId ?? value;
}

export async function setMapping(tempId: string, realId: string): Promise<void> {
  await upsertMapping(tempId, realId);
}

export async function getRealId(tempId: string): Promise<string | null> {
  const mapping = await getMapping(tempId);
  return mapping?.realId ?? null;
}

export async function replaceTempIds(payload: any): Promise<any> {
  const cache = new Map<string, string | null>();

  async function recurse(value: any): Promise<any> {
    if (Array.isArray(value)) {
      return Promise.all(value.map(recurse));
    }

    if (value && typeof value === "object") {
      const next: Record<string, any> = {};
      const entries = Object.entries(value);
      for (const [key, item] of entries) {
        next[key] = await recurse(item);
      }
      return next;
    }

    if (typeof value === "string") {
      return resolveTempId(value, cache);
    }

    return value;
  }

  return recurse(payload);
}
