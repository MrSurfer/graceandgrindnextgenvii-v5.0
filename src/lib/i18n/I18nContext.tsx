"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { dictionaries, Locale, Dictionary } from "./dictionaries";

interface I18nContextProps {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: Dictionary;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Load saved locale
  useEffect(() => {
    const saved = localStorage.getItem("gng-locale") as Locale;
    if (saved && (saved === "en" || saved === "am")) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (loc: Locale) => {
    setLocaleState(loc);
    localStorage.setItem("gng-locale", loc);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: dictionaries[locale] }}>
      <div dir={locale === 'am' ? 'ltr' : 'ltr'}>
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    // If used outside provider, default to English
    return { locale: "en" as Locale, setLocale: () => {}, t: dictionaries.en };
  }
  return context;
}
