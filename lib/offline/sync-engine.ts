import { API_BASE_URL } from "@/lib/config";
import { addOperation, getOperationById, getPendingOperations, updateOperation } from "./db";
import { replaceTempIds, setMapping } from "./id-mapper";
import { cleanPayloadForSync, isDuplicateKeyError } from "@/lib/errors";
import { getUserSession } from "@/lib/authStorage";
import { storage } from "@/lib/storage";
import { Operation, OperationType } from "./types";

let isSyncing = false;

type SyncResult = Record<string, "success" | "failed">;

function getPayloadId(payload: any): string {
  return payload?.id || payload?._id || payload?.saleId || payload?.productId || payload?.supplierId || "";
}

function getEffectiveToken(token?: string): string | undefined {
  if (token) {
    return token;
  }

  const sessionUser = getUserSession();
  if (sessionUser?.token) {
    console.log("🔁 [SYNC ENGINE] Loaded fallback token from stored user session", {
      tokenPreview: sessionUser.token.substring(0, 20) + '...',
      tokenLength: sessionUser.token.length,
    });
    return sessionUser.token;
  }

  return undefined;
}

function getEndpoint(op: Operation): string {
  if (op.endpoint) {
    return op.endpoint;
  }

  switch (op.type) {
    case "CREATE_SUPPLIER":
      return "/suppliers/create";
    case "UPDATE_SUPPLIER":
      return `/suppliers/${getPayloadId(op.payload)}/update`;
    case "DELETE_SUPPLIER":
      return `/suppliers/${getPayloadId(op.payload)}/delete`;
    case "CREATE_PRODUCT":
      return "/products/new";
    case "UPDATE_PRODUCT":
      return `/products/${getPayloadId(op.payload)}/update`;
    case "DELETE_PRODUCT":
      return `/products/${getPayloadId(op.payload)}/delete`;
    case "STOCK_IN":
      return "/inventory/movement";
    case "CREATE_SALE":
      return "/sales/create";
    case "UPDATE_SALE":
      return `/sales/${getPayloadId(op.payload)}/update`;
    case "DELETE_SALE":
      return `/sales/${getPayloadId(op.payload)}/delete`;
    case "PROCESS_SALE_RETURN":
      return "/sales/return";
    default:
      throw new Error(`Unknown operation type: ${op.type}`);
  }
}

function getMethod(op: Operation): string {
  if (op.method) {
    return op.method;
  }

  switch (op.type) {
    case "DELETE_SUPPLIER":
    case "DELETE_PRODUCT":
    case "DELETE_SALE":
      return "DELETE";
    default:
      return "POST";
  }
}

function getOfflineItemType(opType: OperationType): 'product' | 'supplier' | 'sale' | 'saleReturn' | 'stockMovement' | null {
  switch (opType) {
    case "CREATE_PRODUCT":
    case "UPDATE_PRODUCT":
    case "DELETE_PRODUCT":
      return "product";
    case "CREATE_SUPPLIER":
    case "UPDATE_SUPPLIER":
    case "DELETE_SUPPLIER":
      return "supplier";
    case "CREATE_SALE":
    case "UPDATE_SALE":
    case "DELETE_SALE":
      return "sale";
    case "PROCESS_SALE_RETURN":
      return "saleReturn";
    case "STOCK_IN":
      return "stockMovement";
    default:
      return null;
  }
}


function throwIfNotOk(response: Response, body: string) {
  if (!response.ok) {
    const error = new Error(`Sync request failed: ${response.status} ${response.statusText}`) as any;
    error.status = response.status;
    error.statusText = response.statusText;
    error.responseText = body;
    error.contentType = response.headers.get('content-type');
    throw error;
  }
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isDependencySatisfied(op: Operation): Promise<boolean> {
  if (!op.dependsOn?.length) {
    return true;
  }

  const dependencies = await Promise.all(op.dependsOn.map(getOperationById));
  return dependencies.every((dependency) => dependency?.status === "done");
}

export async function processOperation(op: Operation, token: string): Promise<void> {
  const opStartTime = performance.now();
  const endpoint = getEndpoint(op);
  const method = getMethod(op);
  
  // Build URL with businessId as query parameter for server
  const currentBusinessId = getUserSession()?.businessId || op.payload?.businessId;
  const queryParams = new URLSearchParams();
  if (currentBusinessId) {
    queryParams.append('businessId', currentBusinessId);
  }
  const queryString = queryParams.toString();
  const fullUrl = `${API_BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`;

  console.log("📤 [SYNC ENGINE] Processing operation", {
    id: op.id,
    type: op.type,
    retries: op.retries,
    endpoint,
    method,
    payloadId: op.payload?.id || op.payload?.tempId,
    urlWithBusinessId: fullUrl,
  });

  try {
    await updateOperation(op.id, { status: "processing", updatedAt: Date.now() });

    try {
      const payload = await replaceTempIds(op.payload);
      console.log("🔄 [SYNC ENGINE] Temp IDs replaced", { id: op.id, hasPayload: !!payload });
    } catch (tempIdError) {
      console.warn("⚠️ [SYNC ENGINE] Failed to replace temp IDs", {
        id: op.id,
        error: tempIdError instanceof Error ? tempIdError.message : String(tempIdError),
      });
    }

    const payload = await replaceTempIds(op.payload);
    const cleanedPayload = cleanPayloadForSync(payload, method);

    console.log("🧹 [SYNC ENGINE] Payload cleaned for sync", {
      id: op.id,
      payloadKeys: Object.keys(cleanedPayload || {}),
      payloadSize: JSON.stringify(cleanedPayload).length,
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Idempotency-Key": op.id,
    };

    console.log("🔐 [SYNC ENGINE] Token check before Authorization header", {
      id: op.id,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'MISSING',
      tokenLength: token ? token.length : 0,
    });

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log("✅ [SYNC ENGINE] Authorization header added", {
        id: op.id,
        headerValue: headers["Authorization"].substring(0, 30) + '...',
      });
    } else {
      console.error("❌ [SYNC ENGINE] CRITICAL: Token missing, NO Authorization header", {
        id: op.id,
        token,
        tokenIsUndefined: token === undefined,
        tokenIsNull: token === null,
      });
    }

    const config: RequestInit = { method, headers };
    if (method !== "GET" && method !== "HEAD" && method !== "DELETE") {
      config.body = JSON.stringify(cleanedPayload);
    }

    console.log("🌐 [SYNC ENGINE] Initiating fetch", {
      id: op.id,
      url: fullUrl,
      method,
      hasAuth: !!token,
      bodySize: typeof config.body === 'string' ? config.body.length : 0,
    });

    const fetchStart = performance.now();
    let response: Response;
    let rawBody: string;

    try {
      response = await fetch(fullUrl, config);
      rawBody = await response.text();
    } catch (fetchError) {
      const fetchDuration = performance.now() - fetchStart;
      console.error("🔌 [SYNC ENGINE] FETCH FAILED - Network/Connection Error", {
        id: op.id,
        type: op.type,
        url: fullUrl,
        method,
        errorName: fetchError?.constructor?.name,
        errorMsg: fetchError instanceof Error ? fetchError.message : String(fetchError),
        errorStack: fetchError instanceof Error ? fetchError.stack?.split('\n').slice(0, 3).join(' | ') : undefined,
        durationMs: fetchDuration.toFixed(2),
        retries: op.retries,
        endpoint,
      });
      throw fetchError;
    }

    const fetchDuration = performance.now() - fetchStart;
    console.log("📨 [SYNC ENGINE] Response received", {
      id: op.id,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      durationMs: fetchDuration.toFixed(2),
      bodyLength: rawBody.length,
    });

    if (rawBody.length > 0) {
      console.log("📄 [SYNC ENGINE] Response preview", {
        id: op.id,
        preview: rawBody.substring(0, 300),
      });
    }

    throwIfNotOk(response, rawBody);

    let data: any = null;
    try {
      data = JSON.parse(rawBody);
      console.log("✅ [SYNC ENGINE] Response parsed", {
        id: op.id,
        dataKeys: Object.keys(data || {}),
        createdId: data?.id || data?._id,
      });
    } catch (parseError) {
      console.warn("⚠️ [SYNC ENGINE] Failed to parse response JSON", {
        id: op.id,
        parseError: parseError instanceof Error ? parseError.message : String(parseError),
        rawBody: rawBody.substring(0, 200),
      });
      data = null;
    }

    const createdId = data?.id || data?._id || null;
    if (op.payload?.tempId && createdId) {
      console.log("🔗 [SYNC ENGINE] ID mapping", {
        id: op.id,
        tempId: op.payload.tempId,
        createdId,
      });
      await setMapping(op.payload.tempId, createdId);
    }

    await updateOperation(op.id, { status: "done", retries: op.retries, updatedAt: Date.now() });

    const offlineItemType = getOfflineItemType(op.type as OperationType);
    if (offlineItemType && op.payload?.id) {
      try {
        storage.removeOfflineItem(offlineItemType, op.payload.id);
        console.log("🗑️ [SYNC ENGINE] Removed from offline storage", {
          id: op.id,
          itemType: offlineItemType,
          itemId: op.payload.id,
        });
      } catch (removeError) {
        console.warn("⚠️ [SYNC ENGINE] Failed to remove offline item after sync, keeping for retry", {
          id: op.id,
          itemType: offlineItemType,
          error: removeError instanceof Error ? removeError.message : String(removeError),
        });
      }
    }

    const totalDuration = performance.now() - opStartTime;
    console.log("✅ [SYNC ENGINE] Operation succeeded", {
      id: op.id,
      type: op.type,
      durationMs: totalDuration.toFixed(2),
      createdId,
    });
  } catch (error) {
    const totalDuration = performance.now() - opStartTime;

    if (error instanceof Error && (error as any).status) {
      const httpError = error as any;
      console.error("❌ [SYNC ENGINE] HTTP ERROR RESPONSE", {
        id: op.id,
        type: op.type,
        status: httpError.status,
        statusText: httpError.statusText,
        url: `${API_BASE_URL}${endpoint}`,
        method,
        payloadId: op.payload?.id,
        durationMs: totalDuration.toFixed(2),
        currentRetry: op.retries,
        maxRetries: 5,
        responseBody: httpError.responseText?.substring(0, 500),
        contentType: httpError.contentType,
        errorMsg: httpError.message,
      });
    } else if (error instanceof TypeError) {
      console.error("❌ [SYNC ENGINE] NETWORK/CONNECTION ERROR", {
        id: op.id,
        type: op.type,
        url: `${API_BASE_URL}${endpoint}`,
        method,
        errorMsg: error.message,
        errorName: error.name,
        durationMs: totalDuration.toFixed(2),
        currentRetry: op.retries,
        possibleCauses: [
          'Network connectivity lost',
          'API endpoint unavailable',
          'CORS error',
          'DNS resolution failure',
          'Timeout',
        ],
      });
    } else if (error instanceof ReferenceError || error instanceof SyntaxError) {
      console.error("❌ [SYNC ENGINE] CODE ERROR (likely corrupted data)", {
        id: op.id,
        type: op.type,
        errorName: error.name,
        errorMsg: error.message,
        durationMs: totalDuration.toFixed(2),
        payload: op.payload,
      });
    } else {
      console.error("❌ [SYNC ENGINE] UNEXPECTED ERROR", {
        id: op.id,
        type: op.type,
        errorName: error?.constructor?.name,
        errorMsg: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack?.substring(0, 300) : undefined,
        durationMs: totalDuration.toFixed(2),
        currentRetry: op.retries,
      });
    }

    // Check for MongoDB E11000 duplicate key errors
    if (error instanceof Error && (error as any).status) {
      const httpError = error as any;
      
      // Try to parse response body for better error detection
      let enhancedError = httpError;
      try {
        if (httpError.responseText) {
          const responseData = JSON.parse(httpError.responseText);
          enhancedError = { ...httpError, response: { data: responseData } };
        }
      } catch (parseError) {
        // If parsing fails, use original error
      }
      
      // If this is a duplicate key error, treat as successful
      if (isDuplicateKeyError(enhancedError)) {
        console.log("✅ [SYNC ENGINE] Duplicate key error detected - treating as success", {
          id: op.id,
          type: op.type,
          errorMsg: httpError.message,
        });
        
        // Mark operation as done (successful)
        await updateOperation(op.id, { status: "done", retries: op.retries, updatedAt: Date.now() });
        
        // Remove from offline storage since it already exists on server
        const offlineItemType = getOfflineItemType(op.type as OperationType);
        if (offlineItemType && op.payload?.id) {
          storage.removeOfflineItem(offlineItemType, op.payload.id);
          console.log("🗑️ [SYNC ENGINE] Removed duplicate item from offline storage", {
            id: op.id,
            itemType: offlineItemType,
            itemId: op.payload.id,
          });
        }
        
        // Don't call handleFailure - exit successfully
        return;
      }
    }

    await handleFailure(op);
    throw error;
  }
}

async function handleFailure(op: Operation): Promise<void> {
  const retries = op.retries + 1;

  if (retries > 5) {
    console.log("⛔ [SYNC ENGINE] Max retries exceeded", { id: op.id, type: op.type, totalRetries: retries });
    await updateOperation(op.id, { status: "failed", retries, updatedAt: Date.now() });
    return;
  }

  const backoffMs = 2 ** retries * 1000;
  console.warn("⏳ [SYNC ENGINE] Retry scheduled", { id: op.id, retry: retries, maxRetries: 5, backoffSec: (backoffMs / 1000).toFixed(1) });

  await updateOperation(op.id, {
    status: "pending",
    retries,
    updatedAt: Date.now(),
  });

  await delay(backoffMs);
}

export async function syncQueue(token?: string): Promise<SyncResult> {
  console.log("📊 [SYNC ENGINE] syncQueue called", {
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'MISSING',
    tokenValue: token,
    tokenType: typeof token,
  });

  const results: SyncResult = {};

  if (isSyncing) {
    console.warn("⚠️ [SYNC ENGINE] Sync already in progress, skipping");
    return results;
  }

  token = getEffectiveToken(token);
  if (!token) {
    console.error("🚨 [SYNC ENGINE] CRITICAL: Skipping sync - NO AUTH TOKEN PROVIDED", {
      tokenIsUndefined: token === undefined,
      tokenIsNull: token === null,
      tokenIsEmpty: token === '',
      tokenType: typeof token,
    });
    return results;
  }

  isSyncing = true;
  const syncStartTime = performance.now();

  try {
    const operations = await getPendingOperations();
    const statistics = {
      total: operations.length,
      pending: operations.filter((o) => o.status === "pending").length,
      processing: operations.filter((o) => o.status === "processing").length,
      failed: operations.filter((o) => o.status === "failed").length,
    };

    console.log("📋 [SYNC ENGINE] Queue statistics", statistics);

    for (const operation of operations) {
      if (operation.status !== "pending" && operation.status !== "processing") {
        continue;
      }

      if (!(await isDependencySatisfied(operation))) {
        console.log("⏸️ [SYNC ENGINE] Dependency not satisfied", { id: operation.id, payload: operation.payload });
        continue;
      }

      try {
        await processOperation(operation, token);
        results[operation.id] = "success";
      } catch (error) {
        console.log("🔴 [SYNC ENGINE] Operation failed", { id: operation.id, error: error instanceof Error ? error.message : String(error) });
        results[operation.id] = "failed";
      }
    }

    const syncDuration = performance.now() - syncStartTime;
    const successCount = Object.values(results).filter((r) => r === "success").length;
    console.log("🏁 [SYNC ENGINE] Queue sync finished", { successful: successCount, failed: Object.values(results).filter((r) => r === "failed").length, totalDurationSec: (syncDuration / 1000).toFixed(2) });
  } finally {
    isSyncing = false;
  }

  return results;
}

export async function enqueueOfflineOperation(operation: Operation): Promise<string> {
  return addOperation(operation);
}
