'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getProfile } from '@/lib/supabase/profile';

type Theme = 'light' | 'dark';

interface BrandingColors {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  logo_url?: string;
  company_name?: string;
  custom_css?: string;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  branding: BrandingColors;
  updateBranding: (colors: BrandingColors) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children, 
  defaultTheme = 'light' 
}: { 
  children: ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [branding, setBranding] = useState<BrandingColors>({
    primary_color: '#3B4B2F',
    secondary_color: '#4F5F40',
    accent_color: '#2E3A25',
  });

  useEffect(() => {
    // Load user branding preferences
    const loadBranding = async () => {
      try {
        const profile = await getProfile();
        setBranding({
          primary_color: profile.primary_color || '#3B4B2F',
          secondary_color: profile.secondary_color || '#4F5F40',
          accent_color: profile.accent_color || '#2E3A25',
          logo_url: profile.logo_url,
          company_name: profile.company_name,
          custom_css: profile.custom_css,
        });
      } catch (error) {
        console.warn('Could not load user branding, using defaults');
        setBranding({
          primary_color: '#3B4B2F',
          secondary_color: '#4F5F40',
          accent_color: '#2E3A25',
        });
      }
    };

    loadBranding();

    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    // Check system preference as fallback
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setThemeState(savedTheme);
    } else if (systemPrefersDark) {
      setThemeState('dark');
    } else {
      setThemeState(defaultTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
    
    // Save theme preference
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Apply branding colors as CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', branding.primary_color || '#3B4B2F');
    root.style.setProperty('--brand-secondary', branding.secondary_color || '#4F5F40');
    root.style.setProperty('--brand-accent', branding.accent_color || '#2E3A25');

    // Apply custom CSS if provided
    if (branding.custom_css) {
      const styleId = 'custom-branding-css';
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = branding.custom_css;
    } else {
      const existingStyle = document.getElementById('custom-branding-css');
      if (existingStyle) {
        existingStyle.remove();
      }
    }
  }, [branding, theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const updateBranding = (newBranding: BrandingColors) => {
    setBranding(prev => ({ ...prev, ...newBranding }));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, branding, updateBranding }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
