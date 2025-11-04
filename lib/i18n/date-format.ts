import { de, enUS } from "date-fns/locale";
import { format, formatDistanceToNow } from "date-fns";
import type { Locale } from "./dictionaries";

export function getDateLocale(locale: Locale) {
  return locale === "de" ? de : enUS;
}

export function formatDate(date: string | Date, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (options) {
    return dateObj.toLocaleDateString(getDateLocale(locale).code as Locale, options);
  }
  
   const dateLocale = getDateLocale(locale);
  
   return format(dateObj, "PPP", { locale: dateLocale });
}

export function formatDateTime(date: string | Date, locale: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (locale === "de") {
    return dateObj.toLocaleString("de-DE");
  } else {
    return dateObj.toLocaleString("en-US");
  }
}

export function formatDateWithTime(date: string | Date, locale: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dateLocale = getDateLocale(locale);
  
  return format(dateObj, "PPP p", { locale: dateLocale });
}

export function formatDateSimple(date: string | Date, locale: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dateLocale = getDateLocale(locale);
  
  return format(dateObj, "PP", { locale: dateLocale });
}

export function formatDistanceToNowLocalized(date: string | Date, locale: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dateLocale = getDateLocale(locale);
  
  return formatDistanceToNow(dateObj, { 
    locale: dateLocale,
    addSuffix: true 
  });
}

// Specific format functions for common use cases
export function formatInvoiceDate(date: string | Date, locale: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dateLocale = getDateLocale(locale);
  
  return format(dateObj, "PPP", { locale: dateLocale });
}

export function formatTodoDate(date: string | Date, locale: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dateLocale = getDateLocale(locale);
  
  return format(dateObj, "PPP", { locale: dateLocale });
}

export function formatFileDate(date: string | Date, locale: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (locale === "de") {
    return dateObj.toLocaleDateString("de-DE");
  } else {
    return dateObj.toLocaleDateString("en-US");
  }
}
