import { cookies } from "next/headers";
import type { Locale } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
	const store = await Promise.resolve(cookies());
	const c = store.get("locale")?.value as Locale | undefined;
	return c ?? "de";
}
