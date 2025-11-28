import { cookies } from "next/headers";
import type { Locale } from "./dictionaries";
import { dictionaries } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("locale")?.value as Locale | undefined;
	
	// Check for locale in cookie first
	if (cookieLocale && ["de", "en"].includes(cookieLocale)) {
		return cookieLocale;
	}
	
	// Fallback to default locale (changed from de to en)
	return "en";
}

export async function getT() {
	const locale = await getLocale();
	const dict = dictionaries[locale];
	return (key: string) => dict[key] ?? key;
}
