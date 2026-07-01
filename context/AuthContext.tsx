"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, BusinessSetup, Business } from "@/lib/types";
import {
  getUserSession,
  saveUserSession,
  clearUserSession,
} from "@/lib/authStorage";
import { useSessionKey } from "@/hooks/useSessionKey";
import { sessionKeyManager } from "@/lib/sessionKeyManager";

interface AuthContextType {
  user: User | null;
  business: Business | null; // New: separate business state
  isLoading: boolean;
  loginWithApiData: (userData: User) => void;
  logout: () => Promise<void>;
  updateCredentials: (
    newUsername: string,
    newPassword: string,
    oldPassword: string,
  ) => boolean;
  updateBusinessSetup: (businessSetup: BusinessSetup) => boolean;
  updateBusiness: (business: Business | null) => void; // New: set business data
  updateTrialStatus: (
    trialExpires: string | null,
    productKeyVerified: boolean,
  ) => void; // New: update trial status
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeBusiness = (businessData: any): Business | null => {
  if (!businessData) return null;
  const settings = businessData.settings ?? businessData.businessSettings;
  return { ...businessData, settings } as Business;
};

const getBusinessIdFromUser = (
  userData: Partial<User> & { business?: any },
) => {
  return (
    userData.businessId ||
    userData.business?._id ||
    userData.business?.id ||
    userData.business?.businessId ||
    undefined
  );
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isInitialized: keyInitialized, error: keyInitError } =
    useSessionKey();

  // Initialize from encrypted user session on mount
  useEffect(() => {
    if (!keyInitialized && !keyInitError) {
      console.log("[AUTH_CONTEXT] Waiting for encryption key to initialize...");
      return; // Wait for key to initialize or fail
    }

    const initializeAuth = async () => {
      try {
        // Try encrypted session first
        const currentUser = await getUserSession();

        if (currentUser) {
          console.log("[AUTH_CONTEXT] Loaded user from encrypted session");
          setUser(currentUser);
          setBusiness(normalizeBusiness(currentUser.business));
        }
      } catch (error) {
        console.error("[AUTH_CONTEXT] Error loading user session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [keyInitialized]);

  const loginWithApiData = (userData: User): void => {
    const sanitizedUserData = { ...userData } as User;
    delete (sanitizedUserData as Partial<User>).password;

    const businessId = getBusinessIdFromUser(sanitizedUserData as any);
    if (businessId) {
      sanitizedUserData.businessId = businessId;
    }

    setUser(sanitizedUserData);
    setBusiness(normalizeBusiness(sanitizedUserData.business));

    // Save encrypted session (fire and forget, with error logging)
    saveUserSession(sanitizedUserData).catch((error) => {
      console.error("[AUTH_CONTEXT] Failed to save user session:", error);
    });
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    setBusiness(null);
    localStorage.clear();

    // Clear encrypted session
    await clearUserSession().catch((error) => {
      console.error("[AUTH_CONTEXT] Failed to clear user session:", error);
    });

    // Clear encryption key from session
    try {
      sessionKeyManager.lockKey();
    } catch (error) {
      console.error("[AUTH_CONTEXT] Failed to lock encryption key:", error);
    }
  };

  const updateCredentials = (
    newUsername: string,
    newPassword: string,
    oldPassword: string,
  ): boolean => {
    console.warn(
      "updateCredentials is not supported in API-only auth mode. Implement this using a backend endpoint.",
    );
    return false;
  };

  const updateBusinessSetup = (businessSetup: BusinessSetup): boolean => {
    if (!user) return false;
    const updatedUser = { ...user, business: businessSetup };
    setUser(updatedUser);
    setBusiness(businessSetup as unknown as Business);
    saveUserSession(updatedUser);
    return true;
  };

  const updateBusiness = (newBusiness: Business | null): void => {
    setBusiness(newBusiness);

    const updatedUser = user ? { ...user, business: newBusiness as any } : null;
    if (updatedUser) {
      setUser(updatedUser);
      saveUserSession(updatedUser);
    }
  };

  const updateTrialStatus = (
    trialExpires: string | null,
    productKeyVerified: boolean,
  ): void => {
    if (!user) return;
    const updatedUser = {
      ...user,
      trial_expires: trialExpires || undefined,
      product_key_verified: productKeyVerified,
    };
    setUser(updatedUser);
    saveUserSession(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business, // New: include business in context
        isLoading,
        loginWithApiData,
        logout,
        updateCredentials,
        updateBusinessSetup,
        updateBusiness, // New: include updateBusiness in context
        updateTrialStatus, // New: include updateTrialStatus in context
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
