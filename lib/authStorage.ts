import { User } from "@/lib/types";

const USER_SESSION_KEY = "erp_user_session";

export function getUserSession(): User | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(USER_SESSION_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as User;
  } catch (error) {
    console.error("Failed to read user session from localStorage:", error);
    return null;
  }
}

export function saveUserSession(user: User | null): void {
  if (typeof window === "undefined") return;

  try {
    if (!user) {
      localStorage.removeItem(USER_SESSION_KEY);
      return;
    }

    const sessionUser = { ...user } as User;
    delete (sessionUser as Partial<User>).password;
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(sessionUser));
  } catch (error) {
    console.error("Failed to save user session to localStorage:", error);
  }
}

export function clearUserSession(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(USER_SESSION_KEY);
    localStorage.removeItem("userData");  
    localStorage.removeItem("businessData");  
    localStorage.removeItem("state");  
    localStorage.removeItem("businessSettings");  
      localStorage.removeItem("erp_system_state");  

  } catch (error) {
    console.error("Failed to clear user session from localStorage:", error);
  }
}
