"use client";

import SupabaseProvider from "@/components/providers/SupabaseProvider";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import { I18nProvider } from "@/lib/i18n/I18nContext";
import { CurrencyProvider } from "@/lib/CurrencyContext";

export default function Providers({ children, initialRates }: { children: ReactNode, initialRates: Record<string, number> }) {
  return (
    <SupabaseProvider>
      <I18nProvider>
        <CurrencyProvider initialRates={initialRates}>
          {children}
        </CurrencyProvider>
      </I18nProvider>
      <Toaster position="bottom-right" theme="dark" richColors />
    </SupabaseProvider>
  );
}
