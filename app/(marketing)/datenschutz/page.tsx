// app/(marketing)/datenschutz/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Footer from "@/components/layout/Footer";

export default function DatenschutzPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-4xl mx-auto py-12 px-6 w-full">
        <Card>
          <CardHeader>
            <CardTitle>Datenschutzerklärung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <section>
              <h3 className="font-semibold">1. Verantwortlicher</h3>
              <p className="mt-2">
                <strong>FreelanceDesk UG (haftungsbeschränkt)</strong><br />
                Musterstraße 12<br />
                12345 Berlin<br />
                Deutschland<br />
                E-Mail: <a href="mailto:info@freelancedesk.io" className="text-blue-600">info@freelancedesk.io</a>
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold">2. Allgemeines zur Datenverarbeitung</h3>
              <p className="mt-2">
                Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies
                zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist.
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold">3. Zugriffsdaten (Server-Logs)</h3>
              <p className="mt-2">
                Beim Besuch unserer Website werden automatisch Informationen erfasst (Browsertyp, Betriebssystem, Referrer, IP),
                die nicht bestimmten Personen zugeordnet werden.
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold">4. Registrierung und Benutzerkonten</h3>
              <p className="mt-2">
                Bei Registrierung speichern wir die von Ihnen eingegebenen Daten (z. B. Name, E-Mail) zum Zweck der Vertragserfüllung.
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold">5. Zahlungsabwicklung (Stripe)</h3>
              <p className="mt-2">
                Für die Zahlungsabwicklung nutzen wir Stripe (Stripe Payments Europe, Ltd., Irland). Stripe verarbeitet
                Zahlungsdaten z. B. Kreditkarteninformationen. Weitere Informationen: <a href="https://stripe.com/de/privacy" className="text-blue-600">https://stripe.com/de/privacy</a>.
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold">6. Datenverarbeitung durch Supabase</h3>
              <p className="mt-2">
                Unsere Plattform nutzt Supabase für Auth & Datenhaltung. Supabase verarbeitet Nutzerdaten in Rechenzentren.
                Ein AV-Vertrag (Art. 28 DSGVO) ist möglich/vereinbar.
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold">7. Hosting / Vercel</h3>
              <p className="mt-2">
                Hosting erfolgt über Vercel. Vercel kann technische Logdaten verarbeiten. Relevante EU-/SCC-Regelungen sind zu beachten.
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold">8. Kontakt / Kommunikation</h3>
              <p className="mt-2">
                Bei Kontaktanfragen per E-Mail werden Ihre Angaben zur Bearbeitung gespeichert (Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO).
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold">9. Cookies & lokale Speicherung</h3>
              <p className="mt-2">
                Wir verwenden Cookies und lokale Speicherung, um Sitzungen und Präferenzen zu verwalten. Sie können Cookies in Ihrem Browser deaktivieren.
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold">10. Rechte der betroffenen Personen</h3>
              <p className="mt-2">
                Sie haben Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch.
                Zur Ausübung: <a href="mailto:info@freelancedesk.io" className="text-blue-600">info@freelancedesk.io</a>.
              </p>
            </section>

            <Separator />

            <section>
              <p className="text-sm text-gray-600">Stand: Oktober 2025</p>
            </section>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
