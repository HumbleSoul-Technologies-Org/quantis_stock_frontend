"use client";

import { useInactivityTimer } from "@/hooks/useInactivityTimer";

export function InactivityTimer() {
  // The hook handles all the inactivity timer logic
  useInactivityTimer();

  // This component doesn't render anything, just sets up the timer
  return null;
}
