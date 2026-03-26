"use client";

import { ReactNode, useEffect, useState } from "react";

/**
 * ClientOnly wrapper - prevents component from rendering on server
 * This fixes hydration issues with context hooks
 */
export function ClientOnly({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <>{children}</>;
}
