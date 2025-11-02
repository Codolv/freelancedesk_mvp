"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Locale } from "./dictionaries";

export async function switchLocale(locale: Locale) {
  // Set the locale cookie
  (await cookies()).set("locale", locale, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
    sameSite: "strict",
  });
  
  // Redirect to refresh with new locale
  redirect("/");
}
