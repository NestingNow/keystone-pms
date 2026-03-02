"use client";

import { createBrowserClient } from "@supabase/ssr";
import { createContext, useContext, useState, ReactNode } from "react";

type SupabaseContextType = {
  supabase: ReturnType<typeof createBrowserClient>;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabaseClient] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  return (
    <SupabaseContext.Provider value={{ supabase: supabaseClient }}>
      {children}
    </SupabaseContext.Provider>
  );
}

// Optional hook for future use (projects page, remnants, etc.)
export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within SupabaseProvider");
  }
  return context;
};