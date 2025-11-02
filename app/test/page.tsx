"use client";

import { useT } from "@/lib/i18n/client";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export default function TestPage() {
  const { t, locale } = useT();

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Language Test Page</h1>
          <LanguageSwitcher />
        </div>
        
        <div className="space-y-6">
          <div className="bg-muted p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Current Locale: {locale}</h2>
            <p className="text-muted-foreground">This page demonstrates the language switching functionality.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-3">Navigation Items</h3>
              <ul className="space-y-2">
                <li><strong>Features:</strong> {t("nav.features")}</li>
                <li><strong>Pricing:</strong> {t("nav.pricing")}</li>
                <li><strong>Sign In:</strong> {t("nav.signin")}</li>
                <li><strong>Language:</strong> {t("nav.language")}</li>
              </ul>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-3">Dashboard Items</h3>
              <ul className="space-y-2">
                <li><strong>Overview:</strong> {t("dashboard.overview")}</li>
                <li><strong>Projects:</strong> {t("dashboard.projects")}</li>
                <li><strong>Invoices:</strong> {t("dashboard.invoices")}</li>
                <li><strong>Clients:</strong> {t("dashboard.clients")}</li>
              </ul>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-3">Sidebar Items</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Dashboard:</strong> {t("sidebar.dashboard")}</p>
                <p><strong>Projects:</strong> {t("sidebar.projects")}</p>
                <p><strong>Invoices:</strong> {t("sidebar.invoices")}</p>
              </div>
              <div>
                <p><strong>Clients:</strong> {t("sidebar.clients")}</p>
                <p><strong>New Project:</strong> {t("sidebar.new.project")}</p>
                <p><strong>Profile:</strong> {t("sidebar.profile")}</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-3">Language Switcher Labels</h3>
            <p><strong>Switch Language:</strong> {t("language.switch")}</p>
            <p><strong>German:</strong> {t("language.german")}</p>
            <p><strong>English:</strong> {t("language.english")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
