"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* === Navigation === */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image src="/logo.png" alt="FreelanceDesk Logo" width={240} height={64} priority />
          </div>

          <div className="flex items-center gap-4">
            <Link href="/signin">
              <Button variant="default">Login</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* === Hero Section === */}
      <main className="flex flex-col items-center justify-center flex-grow text-center px-6 py-20">
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Dein Kundenportal für Freelancer.
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          Behalte Projekte, Rechnungen und Kundenkommunikation an einem Ort.
          Professionell, sicher und einfach.
        </motion.p>

        <motion.div
          className="flex gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          <Link href="/signup">
            <Button size="lg" className="text-lg">
              Jetzt starten
            </Button>
          </Link>
          <Link href="#preise">
            <Button size="lg" variant="outline" className="text-lg">
              Preise ansehen
            </Button>
          </Link>
        </motion.div>
      </main>

      <section id="funktionen" className="py-24 bg-white px-6">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Alles, was du für dein Freelancer-Business brauchst
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            FreelanceDesk bündelt Kommunikation, Projekte und Rechnungen in einem
            übersichtlichen Kundenportal.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {[
            {
              title: "Projektmanagement",
              desc: "Verwalte deine Kundenprojekte mit Status, Aufgaben und Deadlines – einfach und transparent.",
              icon: "📁",
            },
            {
              title: "Rechnungen & Zahlungen",
              desc: "Erstelle professionelle Rechnungen und akzeptiere Zahlungen direkt über Stripe.",
              icon: "💶",
            },
            {
              title: "Dateifreigabe",
              desc: "Lade Dateien hoch, teile sie sicher mit Kunden und behalte die Kontrolle über Versionen.",
              icon: "📂",
            },
            {
              title: "Kundenportal",
              desc: "Deine Kunden sehen Fortschritte, Dateien und Rechnungen zentral in ihrem eigenen Login.",
              icon: "👥",
            },
            {
              title: "Benachrichtigungen",
              desc: "Automatische Updates bei neuen Dateien, Rechnungen oder Nachrichten – per E-Mail oder Portal.",
              icon: "🔔",
            },
            {
              title: "White Label Branding",
              desc: "Gestalte dein Portal mit eigenem Logo und Farben – ganz im Stil deines Unternehmens.",
              icon: "🎨",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              className="p-8 bg-gradient-to-b from-white to-blue-50 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === Pricing Section === */}
      <section id="preise" className="bg-white py-24 px-6">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ein Preis für jede Phase deiner Selbstständigkeit
          </h2>
          <p className="text-gray-600">
            Starte kostenlos und wachse mit deinen Kunden.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {[
            { name: "Free", price: "0 €", features: ["1 Kunde", "1 Projekt", "Branding sichtbar"] },
            { name: "Starter", price: "9 €/Monat", features: ["5 Kunden", "PDF-Rechnungen", "Branding anpassbar"] },
            { name: "Pro", price: "29 €/Monat", features: ["Unbegrenzt", "Stripe-Zahlungen", "Dateifreigabe"] },
            { name: "Agentur", price: "79 €/Monat", features: ["Teams", "White-Label", "Kundengruppen"] },
          ].map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="shadow-md hover:shadow-lg transition rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">{plan.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold mb-4 text-blue-600">{plan.price}</p>
                  <ul className="space-y-2 text-gray-600 mb-6">
                    {plan.features.map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                  </ul>
                  <Button className="w-full">Jetzt wählen</Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === Call to Action === */}
      <section className="bg-blue-600 text-white py-20 text-center px-6">
        <motion.h3
          className="text-3xl md:text-4xl font-semibold mb-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Bereit, dein Freelancer-Business zu vereinfachen?
        </motion.h3>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg">
              Kostenlos starten
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* === Footer === */}
      <footer className="border-t py-6 text-center text-sm text-gray-500 bg-white">
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8">
          <Link href="/impressum" className="hover:text-blue-600">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:text-blue-600">
            Datenschutz
          </Link>
        </div>
        <p className="mt-4">© {new Date().getFullYear()} FreelanceDesk — Alle Rechte vorbehalten.</p>
      </footer>
    </div>
  );
}
