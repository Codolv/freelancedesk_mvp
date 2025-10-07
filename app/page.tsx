"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/lib/i18n/client";

export default function Home() {
  const { t } = useT();
  return (
    <div className="min-h-screen">
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="FreelanceDesk Logo" width={240} height={64} priority />
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="#features" className="opacity-80 hover:opacity-100 transition-colors">{t("nav.features")}</Link>
          <Link href="#pricing" className="opacity-80 hover:opacity-100 transition-colors">{t("nav.pricing")}</Link>
          <Button asChild>
            <Link href="/signin">{t("nav.signin")}</Link>
          </Button>
        </nav>
      </header>

      <main className="px-6 sm:px-10">
        {/* Hero */}
        <section className="grid gap-8 sm:gap-12 lg:grid-cols-2 items-center py-10 sm:py-16">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-medium rounded-full px-3 py-1 border border-white/10 bg-white/5">
              <span className="w-2 h-2 rounded-full bg-[color:var(--accent)] animate-pulse" />
              {t("hero.badge")}
            </div>
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">{t("hero.title")}</h1>
            <p className="text-base sm:text-lg opacity-80 max-w-prose">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/signin">{t("hero.cta.start")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="#pricing">{t("hero.cta.pricing")}</Link>
              </Button>
            </div>
            <ul className="grid gap-2 text-sm opacity-80">
              <li>• Kunden sicher einladen</li>
              <li>• Dateien und Updates teilen</li>
              <li>• Rechnungen und Zahlungen im Blick</li>
            </ul>
          </div>
          <div className="grid gap-4">
            <Card className="card bg-white/5 border-white/15 backdrop-blur">
              <CardContent className="relative aspect-[16/9]">
                <Image src="/feature-portal.svg" alt="Portal-Übersicht" fill className="object-contain p-6" />
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-4">
              <Card className="card bg-white/5 border-white/15 backdrop-blur">
                <CardContent className="relative aspect-[4/3]">
                  <Image src="/feature-projects.svg" alt="Projekte" fill className="object-contain p-6" />
                </CardContent>
              </Card>
              <Card className="card bg-white/5 border-white/15 backdrop-blur">
                <CardContent className="relative aspect-[4/3]">
                  <Image src="/feature-invoices.svg" alt="Rechnungen" fill className="object-contain p-6" />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-10 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-8">Alles, was Ihre Kunden brauchen</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="card bg-white/5 border-white/15 backdrop-blur">
              <CardHeader>
                <CardTitle>Projekte</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="relative aspect-[4/3]">
                  <Image src="/feature-projects.svg" alt="Projekte" fill className="object-contain p-4" />
                </div>
                <p className="text-sm opacity-80">Projekte anlegen, Fristen setzen und alle auf Kurs halten.</p>
              </CardContent>
            </Card>
            <Card className="card bg-white/5 border-white/15 backdrop-blur">
              <CardHeader>
                <CardTitle>Rechnungen</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="relative aspect-[4/3]">
                  <Image src="/feature-invoices.svg" alt="Rechnungen" fill className="object-contain p-4" />
                </div>
                <p className="text-sm opacity-80">Rechnungen erstellen, Status verfolgen und Zahlungen akzeptieren.</p>
              </CardContent>
            </Card>
            <Card className="card bg-white/5 border-white/15 backdrop-blur">
              <CardHeader>
                <CardTitle>Dateien</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="relative aspect-[4/3]">
                  <Image src="/feature-files.svg" alt="Dateien" fill className="object-contain p-4" />
                </div>
                <p className="text-sm opacity-80">Lieferungen hochladen, Assets teilen und Versionen im Blick behalten.</p>
              </CardContent>
            </Card>
            <Card className="card bg-white/5 border-white/15 backdrop-blur">
              <CardHeader>
                <CardTitle>Updates</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="relative aspect-[4/3]">
                  <Image src="/feature-updates.svg" alt="Updates" fill className="object-contain p-4" />
                </div>
                <p className="text-sm opacity-80">Fortschritt in Markdown posten und Kunden automatisch informieren.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-8">Preise</h2>
          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[ 
              { name: "Free", price: "0€", features: ["1 Kunde", "1 Projekt", "Branding sichtbar"], cta: t("hero.cta.start") },
              { name: "Starter", price: "9€", features: ["Bis 5 Kunden", "PDF-Export", "Branding"], cta: "Starter wählen" },
              { name: "Pro", price: "19–29€", features: ["Unbegrenzt", "Stripe", "Alle Funktionen"], cta: "Pro wählen" },
              { name: "Agentur", price: "49–99€", features: ["Teams", "White-Label", "Kundengruppen"], cta: "Agentur wählen" },
            ].map((plan, i) => (
              <Card key={plan.name} className="card bg-white/5 border-white/15 backdrop-blur">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {i === 2 && <span className="text-xs px-2 py-1 rounded-full bg-[color:var(--accent)] text-[color:var(--accent-foreground)]">Beliebt</span>}
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold mt-2">{plan.price}<span className="text-base opacity-70">/Monat</span></div>
                  <ul className="mt-4 grid gap-2 text-sm opacity-90">
                    {plan.features.map((f) => (<li key={f}>• {f}</li>))}
                  </ul>
                  <div className="mt-6">
                    <Button asChild>
                      <Link href="/signin">{plan.cta}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
        </section>
      </main>

      <footer className="px-6 py-10 text-center opacity-70 text-sm">
        © {new Date().getFullYear()} FreelanceDesk
      </footer>
    </div>
  );
}
