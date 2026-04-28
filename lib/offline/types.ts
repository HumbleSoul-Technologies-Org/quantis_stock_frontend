export type OperationType =
  | "CREATE_SUPPLIER"
  | "UPDATE_SUPPLIER"
  | "DELETE_SUPPLIER"
  | "CREATE_PRODUCT"
  | "UPDATE_PRODUCT"
  | "DELETE_PRODUCT"
  | "STOCK_IN"
  | "CREATE_SALE"
  | "UPDATE_SALE"
  | "DELETE_SALE"
  | "PROCESS_SALE_RETURN";

export type OperationStatus = "pending" | "processing" | "done" | "failed";

export interface Operation {
  id: string;
  type: OperationType | string;
  endpoint?: string;
  method?: string;
  payload: any;
  status: OperationStatus;
  retries: number;
  createdAt: number;
  updatedAt: number;
  dependsOn?: string[];
}

export interface IdMapping {
  tempId: string;
  realId: string;
  createdAt: number;
}
