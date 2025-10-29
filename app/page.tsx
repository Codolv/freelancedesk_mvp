"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  // Animation variants for sections
  const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.6 } },
  };

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAVBAR */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center space-x-2">
                <Image src="/logo.png" alt="FreelanceDesk Logo" width={40} height={40} priority />
              </div>
            <span className="font-semibold text-lg tracking-tight">
              FreelanceDesk
            </span>
          </Link>

          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="#funktionen" className="hover:text-primary transition-colors">
              Funktionen
            </Link>
            <Link href="#preise" className="hover:text-primary transition-colors">
              Preise
            </Link>
            <Button asChild variant="outline" className="rounded-lg">
              <Link href="/signin">Login</Link>
            </Button>
          </nav>
        </div>
      </motion.header>

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <motion.h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Das smarte Kundenportal für Freelancer —{" "}
            <span className="text-primary">einfach, sicher, professionell.</span>
          </motion.h1>
          <motion.p
            className="text-lg text-muted-foreground max-w-prose"
          >
            Verwalte Projekte, Rechnungen und Dateien mit deinen Kunden – alles
            an einem Ort. Keine E-Mail-Flut, keine Verwirrung.
          </motion.p>
          
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-wrap gap-4"
          >
            <motion.div>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl">
                <Link href="/signup">Kostenlos starten</Link>
              </Button>
            </motion.div>
            <motion.div>
              <Button asChild variant="outline" className="px-6 py-3 rounded-xl">
                <Link href="#funktionen">Mehr erfahren</Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="h-80 rounded-2xl shadow-lg overflow-hidden bg-gradient-to-br from-[#F4FAF0] to-white border border-border flex items-center justify-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-center text-slate-500 text-sm"
            >
              <div className="text-3xl mb-2">📊</div>
              <p>Dashboard-Vorschau</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section id="funktionen" className="max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-3xl font-bold mb-2">Alles, was Freelancer brauchen</h2>
          <p className="text-muted-foreground">
            Ein Portal für Projekte, Rechnungen, Dateien und Kommunikation –
            klar strukturiert für professionelle Kundenarbeit.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {[
            { icon: "📋", title: "Projektmanagement", desc: "Status, To-Dos und Deadlines – Kunden sehen nur, was sie brauchen." },
            { icon: "💶", title: "Rechnungen & Zahlungen", desc: "PDF-Rechnungen, Stripe-Integration und Zahlungstracking." },
            { icon: "📁", title: "Dateifreigabe", desc: "Sichere Ablage, Versionierung und Download-Tracking." },
            { icon: "🎨", title: "Branding & White-Label", desc: "Logo, Farben und E-Mails im Stil deiner Marke." },
            { icon: "🔔", title: "Benachrichtigungen", desc: "E-Mails bei neuen Nachrichten, Dateien oder Rechnungen." },
            { icon: "🔒", title: "Sicherheit", desc: "Rolle-basierte Zugänge und DSGVO-konforme Speicherung." },
          ].map((f) => (
            <motion.div
              key={f.title}
              className="p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* PRICING SECTION */}
      <motion.section
        id="preise"
        initial="hidden"
        whileInView="show"
        variants={fadeIn}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-6 py-20 bg-muted/30 rounded-3xl"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Preise</h2>
          <p className="text-muted-foreground">
            Wähle einen Plan, der zu dir passt – monatlich kündbar.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { name: "Free", price: "0 €", features: "1 Kunde • 1 Projekt • Branding sichtbar", text: "Starten" },
            { name: "Starter", price: "9 €/Monat", features: "Bis 5 Kunden • PDF-Rechnungen • Branding anpassbar", text: "Wählen" },
            { name: "Pro", price: "29 €/Monat", features: "Unbegrenzt • Stripe • White-Label", text: "Wählen" },
            { name: "Agentur", price: "79 €/Monat", features: "Teams • Kundengruppen • Branding", text: "Kontakt" },
          ].map((plan, i) => (
            <motion.div
              key={plan.name}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className={`p-6 rounded-2xl border text-center bg-card shadow-sm ${i === 1 || i === 2 ? "border-primary/50 shadow-md" : "border-border"
                }`}
            >
              <h3 className="font-semibold text-lg">{plan.name}</h3>
              <div className="text-2xl font-bold mt-3">{plan.price}</div>
              <p className="text-sm text-muted-foreground mt-2">{plan.features}</p>
              <Button
                className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {plan.text}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* CTA SECTION */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-6 py-20"
      >
        <div className="rounded-2xl p-8 bg-primary text-primary-foreground shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold">Bereit, professioneller aufzutreten?</h3>
            <p className="opacity-90">
              Teste FreelanceDesk kostenlos und überzeuge deine Kunden mit einem eigenen Portal.
            </p>
          </div>
          <Button asChild variant="secondary" className="bg-white text-primary hover:bg-slate-100">
            <Link href="/signup">Jetzt starten</Link>
          </Button>
        </div>
      </motion.section>

      {/* FOOTER */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="border-t py-8 text-sm text-muted-foreground"
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="font-semibold text-foreground">FreelanceDesk</div>
            <p className="text-muted-foreground">Professionelles Kundenportal für Freelancer</p>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/impressum" className="hover:text-primary transition-colors">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-primary transition-colors">
              Datenschutz
            </Link>
          </div>
          <div>© {new Date().getFullYear()} FreelanceDesk</div>
        </div>
      </motion.footer>
    </main>
  );
}
