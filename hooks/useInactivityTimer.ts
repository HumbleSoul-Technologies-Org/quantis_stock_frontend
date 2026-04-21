import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";

export function useInactivityTimer() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = () => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Don't set timer if auto-logout is disabled or user is not logged in
    const autoLogoutTimeout = settings?.security?.autoLogoutTimeout ?? 0;
    if (autoLogoutTimeout === 0 || !user) {
      return;
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      console.warn("Inactivity timeout reached - logging out");
      logout();
    }, autoLogoutTimeout);

    lastActivityRef.current = Date.now();
  };

  useEffect(() => {
    // Only set up timer if user is logged in and auto-logout is enabled
    const autoLogoutTimeout = settings?.security?.autoLogoutTimeout ?? 0;
    if (!user || autoLogoutTimeout === 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Activity event handler
    const handleActivity = () => {
      resetTimer();
    };

    // Attach event listeners
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [user, settings?.security?.autoLogoutTimeout, logout]);
}
