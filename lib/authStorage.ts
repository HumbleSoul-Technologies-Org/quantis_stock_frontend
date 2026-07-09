import { User } from "@/lib/types";
import { encryptedStorageService } from "@/lib/encryptedStorage";
import { sessionKeyManager } from "@/lib/sessionKeyManager";

const USER_SESSION_KEY = "erp_user_session";

/**
 * Get user session from localStorage with automatic decryption
 * Handles both encrypted and legacy unencrypted formats
 */
export async function getUserSession(): Promise<User | null> {
  if (typeof window === "undefined") return null;

  try {
    // Try to get decrypted version first
    if (sessionKeyManager.isInitialized()) {
      const decrypted =
        await encryptedStorageService.getDecrypted<User>(USER_SESSION_KEY);
      if (decrypted) {
        return decrypted;
      }
    }

    // Fallback for legacy unencrypted data
    const stored = localStorage.getItem(USER_SESSION_KEY);
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored);
      // Check if this looks like encrypted data
      if (parsed.ciphertext && parsed.iv) {
        return null;
      }
      return parsed as User;
    } catch {
      return null;
    }
  } catch (error) {
    console.error("[AUTH_STORAGE] Failed to read user session:", error);
    return null;
  }
}

/**
 * Save user session to localStorage with automatic encryption
 * Requires session key to be initialized first
 */
export async function saveUserSession(user: User | null): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    if (!user) {
      // Clear on logout
      if (sessionKeyManager.isInitialized()) {
        await encryptedStorageService.secureDelete(USER_SESSION_KEY);
      } else {
        localStorage.removeItem(USER_SESSION_KEY);
      }
      return;
    }

    // Strip password before storing
    const sessionUser = { ...user } as User;
    delete (sessionUser as Partial<User>).password;

    // Encrypt if key is available, otherwise save unencrypted
    if (sessionKeyManager.isInitialized()) {
      await encryptedStorageService.setEncrypted(USER_SESSION_KEY, sessionUser);
    } else {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(sessionUser));
    }
  } catch (error) {
    console.error("[AUTH_STORAGE] Failed to save user session:", error);
    // Don't throw - let app continue even if encryption fails
  }
}

/**
 * Clear all user-related data with secure deletion
 */
export async function clearUserSession(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    // Use encryptedStorageService to clear all encrypted keys at once
    await encryptedStorageService.clearAllEncrypted();

    // Also clear any remaining non-encrypted keys
    const additionalKeys = ["state", "notificationState"];
    for (const key of additionalKeys) {
      localStorage.removeItem(key);
    }

    // Lock the encryption key
    sessionKeyManager.lockKey();
  } catch (error) {
    console.error("[AUTH_STORAGE] Failed to clear user session:", error);
    // Fallback: force remove all sensitive keys manually
    const fallbackKeys = [
      USER_SESSION_KEY,
      "userData",
      "businessData",
      "state",
      "businessSettings",
      "erp_system_state",
      "erp_system_merged_cache",
      "erp_system_offline_items",
      "teamUsers",
      "notificationState",
    ];
    for (const key of fallbackKeys) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`[AUTH_STORAGE] Failed to remove key "${key}":`, e);
      }
    }
  }
}
