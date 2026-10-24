import type { Sale } from "@/lib/types";

export function getSaleCreatorId(
  createdBy: Sale["createdBy"],
): string | undefined {
  return typeof createdBy === "string"
    ? createdBy
    : createdBy?.id || createdBy?._id;
}
