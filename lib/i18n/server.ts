import { cookies } from "next/headers";
import type { Locale } from "./dictionaries";

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
