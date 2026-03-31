"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";
import { useThemeContext } from "@/components/theme-provider";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useThemeContext();

  return (
    <Sonner
      theme={theme === "dark" ? "dark" : "light"}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
