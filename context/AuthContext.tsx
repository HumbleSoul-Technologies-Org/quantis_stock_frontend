'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import { storage } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateCredentials: (newUsername: string, newPassword: string, oldPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from storage on mount
  useEffect(() => {
    const currentUser = storage.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    const loggedInUser = storage.login(username, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      return true;
    }
    return false;
  };

  const logout = (): void => {
    storage.logout();
    setUser(null);
  };

  const updateCredentials = (newUsername: string, newPassword: string, oldPassword: string): boolean => {
    if (!user || user.password !== oldPassword) {
      return false;
    }

    const success = storage.updateUserCredentials(user.id, newUsername, newPassword);
    if (success) {
      // Update local user
      const updatedUser = { ...user, username: newUsername, password: newPassword };
      setUser(updatedUser);
      return true;
    }
    return false;
  };

  return <AuthContext.Provider value={{ user, isLoading, login, logout, updateCredentials }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
