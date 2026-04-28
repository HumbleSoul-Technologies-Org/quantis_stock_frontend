import Dexie, { Table } from "dexie";
import { IdMapping, Operation } from "./types";

class OfflineDatabase extends Dexie {
  operations!: Table<Operation, string>;
  mappings!: Table<IdMapping, string>;

  constructor() {
    super("erp-offline-db");
    this.version(1).stores({
      operations: "id, type, status, createdAt, updatedAt",
      mappings: "tempId",
    });
  }
}

export const db = new OfflineDatabase();

export async function addOperation(operation: Operation): Promise<string> {
  return db.operations.add(operation);
}

export async function getPendingOperations(): Promise<Operation[]> {
  return db.operations
    .where("status")
    .anyOf(["pending", "processing"])
    .sortBy("createdAt");
}

export async function getOperationById(id: string): Promise<Operation | undefined> {
  return db.operations.get(id);
}

export async function updateOperation(
  id: string,
  updates: Partial<Omit<Operation, "id" | "createdAt">>,
): Promise<number> {
  return db.operations.update(id, {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deleteOperation(id: string): Promise<void> {
  await db.operations.delete(id);
}

export async function getMapping(tempId: string): Promise<IdMapping | undefined> {
  return db.mappings.get(tempId);
}

export async function upsertMapping(tempId: string, realId: string): Promise<string> {
  return db.mappings.put({ tempId, realId, createdAt: Date.now() });
}
