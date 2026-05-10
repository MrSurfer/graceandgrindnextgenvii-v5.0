"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { CurrencyCode } from "./currency";
import { CURRENCY_LIST } from "./currency";
export type { CurrencyCode };
export { CURRENCY_LIST };

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  rates: Record<string, number>;
  formatPrice: (priceInUSD: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children, initialRates }: { children: React.ReactNode, initialRates: Record<string, number> }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");

  useEffect(() => {
    const saved = localStorage.getItem("preferred_currency");
    if (saved && ["USD", "EUR", "GBP", "CAD"].includes(saved)) {
      setCurrencyState(saved as CurrencyCode);
    }
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem("preferred_currency", code);
  };

  const formatPrice = (priceInUSD: number) => {
    if (priceInUSD === 0) return "Free";
    const rate = initialRates[currency] || 1;
    const converted = priceInUSD * rate;
    const currencyInfo = CURRENCY_LIST.find(c => c.code === currency) || CURRENCY_LIST[0];
    
    return `${currencyInfo.symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates: initialRates, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
