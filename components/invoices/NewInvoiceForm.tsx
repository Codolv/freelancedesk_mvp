"use client";

import { Motion } from "@/components/custom/Motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ItemsField } from "@/app/(dashboard)/projects/[id]/invoices/new/ItemsField";
import { FileText } from "lucide-react";

export default function NewInvoiceForm({
  projectId,
  projectName,
  createAction,
}: {
  projectId: string;
  projectName?: string;
  createAction: (projectId: string, formData: FormData) => void;
}) {
  return (
    <Motion
      className="max-w-2xl mx-auto py-10"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          Rechnung für {projectName ?? "Projekt"}
        </h1>
        <p className="text-muted-foreground">
          Erstelle eine neue Rechnung mit Positionen und Beträgen.
        </p>
      </div>

      <Card className="border-border/60 bg-background/80 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Rechnungsdetails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createAction.bind(null, projectId)} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="title">Titel</Label>
              <Input id="title" name="title" placeholder="Projekt-Rechnung" />
            </div>

            {/* Interactive items field */}
            <ItemsField />

            <Button type="submit" size="lg" className="w-full">
              Rechnung speichern
            </Button>
          </form>
        </CardContent>
      </Card>
    </Motion>
  );
}
