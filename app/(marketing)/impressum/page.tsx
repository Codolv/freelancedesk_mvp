// app/(marketing)/impressum/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Footer from "@/components/layout/Footer";

export default function ImpressumPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-4xl mx-auto py-12 px-6 w-full">
        <Card>
          <CardHeader>
            <CardTitle>Impressum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <section>
              <h3 className="font-semibold">Angaben gemäß § 5 TMG</h3>
              <p className="mt-2">
                <strong>FreelanceDesk UG (haftungsbeschränkt)</strong><br />
                Musterstraße 12<br />
                12345 Berlin<br />
                Deutschland
              </p>
              <p>
                <strong>Vertreten durch:</strong><br />
                Max Mustermann (Geschäftsführer)
              </p>
              <p>
                <strong>Kontakt:</strong><br />
                Telefon: +49 (0) 30 12345678<br />
                E-Mail: <a href="mailto:info@freelancedesk.io" className="text-blue-600">info@freelancedesk.io</a><br />
                Web: <Link href="https://freelancedesk.io">https://freelancedesk.io</Link>
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold">Registereintrag</h3>
              <p className="mt-2">
                Eintragung im Handelsregister.<br />
                Registergericht: Amtsgericht Berlin-Charlottenburg<br />
                Registernummer: HRB 123456
              </p>
              <p>
                <strong>Umsatzsteuer-ID:</strong><br />
                Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE123456789
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h3>
              <p className="mt-2">
                Max Mustermann<br />
                Musterstraße 12<br />
                12345 Berlin
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold">Haftungsausschluss (Disclaimer)</h3>
              <p className="mt-2">
                <strong>Haftung für Inhalte</strong><br />
                Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
                Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
              </p>
              <p className="mt-2">
                <strong>Haftung für Links</strong><br />
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
                Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
              </p>
              <p className="mt-2">
                <strong>Urheberrecht</strong><br />
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.
                Beiträge Dritter sind als solche gekennzeichnet.
              </p>
            </section>

            <Separator />

            <section>
              <p className="text-sm text-gray-600">Stand: Oktober 2025</p>
              <p className="text-sm">
                Weitere Hinweise: Datenschutz finden Sie hier: <Link href="/datenschutz">Datenschutzerklärung</Link>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
