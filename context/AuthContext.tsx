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

interface AuthContextType {
  user: User | null;
  business: Business | null; // New: separate business state
  isLoading: boolean;
  loginWithApiData: (userData: User) => void;
  logout: () => void;
  updateCredentials: (
    newUsername: string,
    newPassword: string,
    oldPassword: string,
  ) => boolean;
  updateBusinessSetup: (businessSetup: BusinessSetup) => boolean;
  updateBusiness: (business: Business | null) => void; // New: set business data
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeBusiness = (businessData: any): Business | null => {
  if (!businessData) return null;
  const settings = businessData.settings ?? businessData.businessSettings;
  return { ...businessData, settings } as Business;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null); // New: business state
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from user session on mount
  useEffect(() => {
    const cachedUserdata = localStorage.getItem("userData");
    if (cachedUserdata) {
      const parsed = JSON.parse(cachedUserdata) as User;
      setUser(parsed);
      setBusiness(normalizeBusiness(parsed.business));
      setIsLoading(false);
    } else {
      const currentUser = getUserSession();

      if (currentUser) {
        setUser(currentUser);
        setBusiness(normalizeBusiness(currentUser.business));
        localStorage.setItem("userData", JSON.stringify(currentUser));
      }
    }

    setIsLoading(false);
  }, []);

  const loginWithApiData = (userData: User): void => {
    const sanitizedUserData = { ...userData } as User;
    delete (sanitizedUserData as Partial<User>).password;

    setUser(sanitizedUserData);
    setBusiness(normalizeBusiness(sanitizedUserData.business));
    saveUserSession(sanitizedUserData);
    localStorage.setItem("userData", JSON.stringify(sanitizedUserData));
  };
  const logout = (): void => {
    clearUserSession();
    setUser(null);
    setBusiness(null); // Clear business on logout
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
