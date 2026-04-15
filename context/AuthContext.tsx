"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, BusinessSetup, Business } from "@/lib/types";
import { storage } from "@/lib/storage";
import { apiRequest } from "@/lib/queryClient";
import { set } from "date-fns";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null); // New: business state
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from storage on mount
  useEffect(() => {
    var savedUser = localStorage.getItem("userData");

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setBusiness(parsedUser.business as Business); // Set business if available
      } catch (error) {
        console.error("Failed to parse saved user data:", error);
      }
    } else {
      const currentUser = storage.getCurrentUser();
      setUser(currentUser);
      setBusiness(currentUser?.business as Business); // Set business if available
      localStorage.setItem("userData", JSON.stringify(currentUser));
    }

    setIsLoading(false);
  }, []);

  const loginWithApiData = (userData: User): void => {
    setUser(userData);
    // TODO: Set business if available in userData or fetch separately
    setBusiness((userData.business as Business) || null); // For now, set to null
    localStorage.setItem("userData", JSON.stringify(userData));
    // Also store in localStorage for persistence
    try {
      const state = JSON.parse(
        localStorage.getItem("erp_system_state") || "{}",
      );
      state.currentUser = userData;
      localStorage.setItem("erp_system_state", JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save user to localStorage:", error);
      // Continue without localStorage - user is still logged in via state
    }
  };
  const logout = (): void => {
    storage.logout();
    setUser(null);
    setBusiness(null); // Clear business on logout
  };
  const updateCredentials = (
    newUsername: string,
    newPassword: string,
    oldPassword: string,
  ): boolean => {
    if (!user || user.password !== oldPassword) {
      return false;
    }

    const success = storage.updateUserCredentials(
      user.id,
      newUsername,
      newPassword,
    );
    if (success) {
      // Update local user
      const updatedUser = {
        ...user,
        username: newUsername,
        password: newPassword,
      };
      setUser(updatedUser);
      return true;
    }
    return false;
  };

  const updateBusinessSetup = (businessSetup: BusinessSetup): boolean => {
    if (!user) return false;
    const success = storage.updateBusinessSetup(user.id, businessSetup);
    if (success) {
      const updatedUser = { ...user, business: businessSetup };
      setUser(updatedUser);
      return true;
    }
    return false;
  };

  const updateBusiness = (newBusiness: Business | null): void => {
    setBusiness(newBusiness);

    // Persist business data to localStorage
    try {
      const state = JSON.parse(
        localStorage.getItem("erp_system_state") || "{}",
      );
      state.currentBusiness = newBusiness;
      localStorage.setItem("erp_system_state", JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save business to localStorage:", error);
      // Continue - business is still in state
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
