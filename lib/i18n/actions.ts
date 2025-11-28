"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { Locale } from "./dictionaries";

export async function switchLocale(locale: Locale) {
  // Get the current path from the referer header or default to "/"
  const headersList = await headers();
  const referer = headersList.get("referer");
  const currentPath = referer ? new URL(referer).pathname : "/";
  
  // Set the locale cookie
  (await cookies()).set("locale", locale, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
    sameSite: "strict",
  });
  
  // Redirect to current page to refresh with new locale
  redirect(currentPath);
}
