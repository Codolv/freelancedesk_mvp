"use client";

import { Motion } from "@/components/custom/Motion";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Book, HelpCircle } from "lucide-react";

export default function HelpPage() {
  return (
    <Motion
      className="max-w-4xl mx-auto py-10 space-y-10"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Hilfe & Support</h1>
        <p className="text-muted-foreground">
          Antworten auf häufige Fragen und Unterstützung rund um FreelanceDesk.
        </p>
      </div>

      {/* FAQ Section */}
      <Card className="bg-background/80 border-border/60 backdrop-blur-sm shadow-sm">
        <CardHeader className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Häufige Fragen</h2>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="what-is">
              <AccordionTrigger>
                Was ist FreelanceDesk?
              </AccordionTrigger>
              <AccordionContent>
                FreelanceDesk ist ein professionelles Tool für Freelancer und
                ihre Kunden – zur Verwaltung von Projekten, Kommunikation,
                Rechnungen und Dateien an einem zentralen Ort.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="how-to-invite">
              <AccordionTrigger>
                Wie kann ich Kunden zu Projekten einladen?
              </AccordionTrigger>
              <AccordionContent>
                Öffne ein Projekt, klicke auf „Kunden einladen“ und gib die
                E-Mail-Adresse des Kunden ein. Er erhält automatisch eine
                Einladung mit einem sicheren Link zum Beitritt.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="how-to-invoice">
              <AccordionTrigger>
                Wie erstelle ich eine Rechnung?
              </AccordionTrigger>
              <AccordionContent>
                Im Tab „Rechnungen“ deines Projekts findest du die Option „Neue
                Rechnung“. Füge Posten hinzu, überprüfe die Summe und speichere
                sie. Du kannst Rechnungen später als PDF exportieren.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="security">
              <AccordionTrigger>
                Wie sicher sind meine Daten?
              </AccordionTrigger>
              <AccordionContent>
                Deine Daten werden sicher in europäischen Rechenzentren
                gespeichert und durch moderne Authentifizierung und SSL/TLS
                Verschlüsselung geschützt.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Section */}
      <Motion
        className="text-center space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold">Noch Fragen?</h2>
        <p className="text-muted-foreground">
          Unser Support-Team hilft dir gerne weiter.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild variant="default">
            <a href="mailto:support@freelancedesk.de">
              <Mail className="mr-2 h-4 w-4" />
              Kontakt per E-Mail
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="/docs">
              <Book className="mr-2 h-4 w-4" />
              Zur Dokumentation
            </a>
          </Button>
        </div>
      </Motion>
    </Motion>
  );
}
