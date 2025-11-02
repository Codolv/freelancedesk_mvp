"use client";

import { useT } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { switchLocale } from "@/lib/i18n/actions";

export function LanguageSwitcher() {
  const { locale, setLocale } = useT();

  const toggleLanguage = async (newLocale: "de" | "en") => {
    // Update the client-side state
    setLocale(newLocale);
    // Update the html lang attribute for accessibility
    document.documentElement.lang = newLocale;
    // Store the preference in localStorage
    localStorage.setItem("preferredLocale", newLocale);
    
    // Call the server action to update the cookie
    try {
      await switchLocale(newLocale);
    } catch (error) {
      console.error("Failed to update locale preference:", error);
      // Fallback: just update client-side if server action fails
      setLocale(newLocale);
      document.documentElement.lang = newLocale;
      localStorage.setItem("preferredLocale", newLocale);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Sprache wechseln</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50">
        <DropdownMenuItem
          onClick={() => toggleLanguage("de")}
          className={locale === "de" ? "font-semibold" : ""}
        >
          🇩🇪 Deutsch
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => toggleLanguage("en")}
          className={locale === "en" ? "font-semibold" : ""}
        >
          🇬🇧 English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
