"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getCurrentSession } from "@/app/actions/auth";

// Mimicking NextAuth's useSession structure to minimize refactoring
type CustomSessionContext = {
  data: {
    user: {
      id: string;
      email?: string;
      role: string;
      name?: string;
      image?: string;
      permissions?: string[];
    };
  } | null;
  status: "loading" | "authenticated" | "unauthenticated";
};

const Context = createContext<CustomSessionContext>({
  data: null,
  status: "loading",
});

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [customSession, setCustomSession] = useState<CustomSessionContext["data"]>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const router = useRouter();
  // Use a ref to keep a stable client instance across renders
  const supabaseRef = useRef<SupabaseClient | null>(null);
  if (!supabaseRef.current) {
    supabaseRef.current = createClient();
  }
  const supabase = supabaseRef.current;

  useEffect(() => {
    const updateCustomSession = async (sbSession: Session | null) => {
      if (!sbSession) {
        setCustomSession(null);
        setStatus("unauthenticated");
        return;
      }
      try {
        const serverSession = await getCurrentSession();
        if (serverSession) {
          setCustomSession(serverSession);
          setStatus("authenticated");
        } else {
          setCustomSession(null);
          setStatus("unauthenticated");
        }
      } catch (err) {
        console.error("Failed to fetch server session", err);
        setCustomSession(null);
        setStatus("unauthenticated");
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      updateCustomSession(session);
      if (event === "SIGNED_OUT") {
        router.refresh();
      }
    });

    // Initial fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateCustomSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // stable ref — no deps needed

  const value: CustomSessionContext = {
    data: customSession,
    status,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useSession = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSession must be used inside SupabaseProvider");
  }
  return context;
};

// Polyfill for next-auth/react's signOut
export const signOut = async ({ callbackUrl = "/" } = {}) => {
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.assign(callbackUrl);
};
