"use client";

import * as React from "react";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useT } from '@/lib/i18n/client';

interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: Date | string;
  onChange?: (date: Date | undefined) => void;
  locale?: string;
}

export function DatePicker({
  value,
  onChange,
  locale: providedLocale,
  className,
  ...props
}: DatePickerProps) {
  const [internalValue, setInternalValue] = React.useState<Date | undefined>(() => {
    if (typeof value === 'string') return value ? new Date(value) : undefined;
    return value || undefined;
  });
  
  const { locale } = useT();
  const currentLocale = providedLocale || locale;

  // Sync internal state with external value prop
  React.useEffect(() => {
    if (typeof value === 'string') {
      const date = value ? new Date(value) : undefined;
      if (date && date.toString() !== "Invalid Date") {
        setInternalValue(date);
      } else if (!value) {
        setInternalValue(undefined);
      }
    } else {
      setInternalValue(value || undefined);
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    setInternalValue(date);
    if (onChange) {
      onChange(date);
    }
  };

  const formatDateForDisplay = (date: Date | undefined): string => {
    if (!date) return "";
    
    const dateLocale = currentLocale === "de" ? de : enUS;
    if (currentLocale === "de") {
      return format(date, "dd.MM.yyyy", { locale: dateLocale });
    } else {
      return format(date, "MM/dd/yyyy", { locale: dateLocale });
    }
  };

  return (
    <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !internalValue && "text-muted-foreground",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {internalValue ? formatDateForDisplay(internalValue) : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={internalValue}
            onSelect={handleDateSelect}
            initialFocus
            locale={currentLocale === "de" ? de : enUS}
          />
        </PopoverContent>
      </Popover>
      
      {/* Hidden input to maintain form compatibility */}
      <input
        type="hidden"
        name={props.name}
        value={internalValue ? internalValue.toISOString().split('T')[0] : ""}
        {...props}
      />
    </div>
  );
}

export function DatePickerInput({
  value,
  onChange,
  defaultValue,
  locale: providedLocale,
  className,
  ...props
}: DatePickerProps & { defaultValue?: string }) {
  const { locale } = useT();
  const currentLocale = providedLocale || locale;
  const [inputValue, setInputValue] = React.useState<string>(() => {
    if (typeof value === 'string') return value;
    if (typeof defaultValue === 'string') return defaultValue;
    return value ? formatDateForLocale(value, currentLocale) : "";
  });

  // Sync input value with external value prop
  React.useEffect(() => {
    if (typeof value === 'string') {
      setInputValue(value);
    } else if (value) {
      setInputValue(formatDateForLocale(value, currentLocale));
    } else if (typeof defaultValue === 'string') {
      setInputValue(defaultValue);
    } else {
      setInputValue("");
    }
  }, [value, defaultValue, currentLocale]);

  const formatDateForLocale = (date: Date | string, locale: string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!dateObj || dateObj.toString() === "Invalid Date") return "";
    
    if (locale === "de") {
      return format(dateObj, "dd.MM.yyyy");
    } else {
      return format(dateObj, "MM/dd/yyyy");
    }
  };

  const parseDateFromInput = (inputValue: string): Date | undefined => {
    if (!inputValue) return undefined;
    
    // Handle German format (dd.mm.yyyy)
    if (currentLocale === "de") {
      const germanDateMatch = inputValue.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
      if (germanDateMatch) {
        const [, day, month, year] = germanDateMatch;
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (date.getFullYear() === parseInt(year) && 
            date.getMonth() === parseInt(month) - 1 && 
            date.getDate() === parseInt(day)) {
          return date;
        }
      }
    }
    
    // Handle US format (mm/dd/yyyy)
    const usDateMatch = inputValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (usDateMatch) {
      const [, month, day, year] = usDateMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (date.getFullYear() === parseInt(year) && 
          date.getMonth() === parseInt(month) - 1 && 
          date.getDate() === parseInt(day)) {
        return date;
      }
    }
    
    // Try ISO format
    const parsedDate = new Date(inputValue);
    if (parsedDate.toString() !== "Invalid Date") {
      return parsedDate;
    }
    
    return undefined;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Only call onChange if the input is a valid date or empty
    const parsedDate = parseDateFromInput(newValue);
    if (newValue === "" || parsedDate) {
      if (onChange) {
        onChange(newValue === "" ? undefined : parsedDate);
      }
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = formatDateForLocale(date, currentLocale);
      setInputValue(formattedDate);
      if (onChange) {
        onChange(date);
      }
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={currentLocale === "de" ? "TT.MM.JJJJ" : "MM/DD/YYYY"}
        className={cn("pr-8", className)}
        {...props}
      />
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align="end">
          <Calendar
            mode="single"
            selected={parseDateFromInput(inputValue)}
            onSelect={handleDateSelect}
            initialFocus
            locale={currentLocale === "de" ? de : enUS}
          />
        </PopoverContent>
      </Popover>
      {/* Hidden input to maintain form compatibility */}
      <input
        type="hidden"
        name={props.name}
        value={inputValue ? parseDateFromInput(inputValue)?.toISOString().split('T')[0] : ""}
        {...props}
      />
    </div>
  );
}
