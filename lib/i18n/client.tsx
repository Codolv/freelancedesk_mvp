"use client";
import { createContext, useContext, useMemo, useState } from "react";
import type { Locale } from "./dictionaries";
import { dictionaries } from "./dictionaries";

const I18nContext = createContext<{ t: (key: string) => string; locale: Locale; setLocale: (l: Locale) => void } | null>(null);

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
	const [locale, setLocale] = useState<Locale>(initialLocale);
	const t = useMemo(() => {
		const dict = dictionaries[locale];
		return (key: string) => dict[key] ?? key;
	}, [locale]);
	return <I18nContext.Provider value={{ t, locale, setLocale }}>{children}</I18nContext.Provider>;
}

export function useT() {
	const ctx = useContext(I18nContext);
	if (!ctx) throw new Error("useT must be used within I18nProvider");
	return ctx;
}
