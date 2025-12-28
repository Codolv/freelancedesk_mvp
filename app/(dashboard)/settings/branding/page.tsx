"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Motion } from "@/components/custom/Motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { getProfile, updateProfile } from "@/lib/supabase/profile";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useT } from "@/lib/i18n/client";
import { getBrowserSupabase } from "@/lib/supabase/client";

interface BrandingSettings {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  logo_url: string;
  company_name: string;
  custom_css: string;
}

export default function BrandingSettingsPage() {
  const { t } = useT();
  const { branding, updateBranding } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>({
    primary_color: '#3B4B2F',
    secondary_color: '#4F5F40',
    accent_color: '#2E3A25',
    logo_url: '',
    company_name: '',
    custom_css: '',
  });

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const profile = await getProfile();
        setBrandingSettings({
          primary_color: profile.primary_color || '#3B4B2F',
          secondary_color: profile.secondary_color || '#4F5F40',
          accent_color: profile.accent_color || '#2E3A25',
          logo_url: profile.logo_url || '',
          company_name: profile.company_name || '',
          custom_css: profile.custom_css || '',
        });
      } catch (error) {
        console.error('Error loading branding settings:', error);
      }
    };
    loadBranding();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(brandingSettings);
      await updateBranding(brandingSettings);
      setMessage(t("settings.logout.success"));
      setEditing(false);
    } catch (e) {
      setMessage(t("dashboard.settings"));
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (field: keyof BrandingSettings, value: string) => {
    setBrandingSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInputChange = (field: keyof BrandingSettings, value: string) => {
    setBrandingSettings(prev => ({
      ...prev,
      [field]: value
    }));
 };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const supabase = getBrowserSupabase();
    const userData = await supabase.auth.getUser();
    const user = userData.data.user;
    if (!user) return alert("Not authenticated");

    // Upload to branding logos bucket
    const { data: list } = await supabase.storage.from("branding-logos").list(user.id);
    if (list) {
      const filesToRemove = list.map((x) => `${user.id}/${x.name}`);
      await supabase.storage.from("branding-logos").remove(filesToRemove);
    }

    const { data, error } = await supabase.storage
      .from("branding-logos")
      .upload(`${user.id}/${file.name}`, file, { upsert: true });
    if (error) return alert(error.message);
    
    // Get signed URL for the uploaded logo
    const { data: signedUrlData } = await supabase.storage
      .from("branding-logos")
      .createSignedUrl(`${user.id}/${file.name}`, 60 * 24 * 365); // 1 year expiry

    if (signedUrlData) {
      setBrandingSettings(prev => ({
        ...prev,
        logo_url: signedUrlData.signedUrl
      }));
    }
  };

  return (
    <Motion
      className="max-w-2xl mx-auto py-10 space-y-8"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl font-bold tracking-tight mb-2">{t("dashboard.branding")}</h1>
      <p className="text-muted-foreground mb-6">
        {t("branding.description")}
      </p>

      <Card className="shadow-md border border-border/50 bg-background/80 backdrop-blur-sm">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>{t("branding.colors")}</CardTitle>
          {!editing && (
            <div className="flex justify-end gap-3 pt-4">
              <Button onClick={() => setEditing(true)}>{t("settings.edit.branding")}</Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            {!editing ? (
              <Motion
                key="view-mode"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Color Preview */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-lg mx-auto mb-2 border"
                      style={{ backgroundColor: brandingSettings.primary_color }}
                    />
                    <p className="text-xs text-muted-foreground">Primary</p>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-lg mx-auto mb-2 border"
                      style={{ backgroundColor: brandingSettings.secondary_color }}
                    />
                    <p className="text-xs text-muted-foreground">Secondary</p>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-lg mx-auto mb-2 border"
                      style={{ backgroundColor: brandingSettings.accent_color }}
                    />
                    <p className="text-xs text-muted-foreground">Accent</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t("branding.company")}</p>
                    <p>{brandingSettings.company_name || t("settings.none")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("branding.logo")}</p>
                    <p>{brandingSettings.logo_url ? t("branding.uploaded") : t("settings.none")}</p>
                  </div>
                </div>
              </Motion>
            ) : (
              <Motion
                key="edit-mode"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Color Pickers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">{t("branding.primary")}</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="primary_color"
                        type="color"
                        value={brandingSettings.primary_color}
                        onChange={(e) => handleColorChange('primary_color', e.target.value)}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={brandingSettings.primary_color}
                        onChange={(e) => handleColorChange('primary_color', e.target.value)}
                        className="flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">{t("branding.secondary")}</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={brandingSettings.secondary_color}
                        onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={brandingSettings.secondary_color}
                        onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                        className="flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accent_color">{t("branding.accent")}</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="accent_color"
                        type="color"
                        value={brandingSettings.accent_color}
                        onChange={(e) => handleColorChange('accent_color', e.target.value)}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={brandingSettings.accent_color}
                        onChange={(e) => handleColorChange('accent_color', e.target.value)}
                        className="flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">{t("branding.company")}</Label>
                    <Input
                      id="company_name"
                      value={brandingSettings.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      placeholder={t("branding.company.placeholder")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo">{t("branding.logo")}</Label>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                    {brandingSettings.logo_url && (
                      <div className="mt-2">
                        <img 
                          src={brandingSettings.logo_url} 
                          alt="Current logo" 
                          className="w-16 h-16 object-contain rounded border"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom_css">{t("branding.custom_css")}</Label>
                    <textarea
                      id="custom_css"
                      value={brandingSettings.custom_css}
                      onChange={(e) => handleInputChange('custom_css', e.target.value)}
                      placeholder={t("branding.custom_css.placeholder")}
                      className="w-full p-2 border rounded-md font-mono text-sm min-h-[100px]"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditing(false)}
                    disabled={loading}
                  >
                    {t("settings.cancel")}
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("invoice.edit")}...
                      </>
                    ) : (
                      t("settings.save")
                    )}
                  </Button>
                </div>

                {message && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {message}
                  </p>
                )}
              </Motion>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </Motion>
  );
}
