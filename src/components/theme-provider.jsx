"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Silence the React 19 client-side script injection warning in development
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      args[0] &&
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

export function ThemeProvider({ children, ...props }) {
  return (
    <NextThemesProvider
      {...props}
      enableColorScheme={false}
      scriptProps={{ "data-cfasync": "false" }}
    >
      {children}
    </NextThemesProvider>
  )
}