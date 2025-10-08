"use client";

import { Motion } from "@/components/custom/Motion";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar, FileText } from "lucide-react";

export default function NewProjectForm({
  createAction,
}: {
  createAction: (formData: FormData) => void;
}) {
  return (
    <Motion
      className="max-w-2xl mx-auto py-10"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          Neues Projekt
        </h1>
        <p className="text-muted-foreground">
          Lege ein neues Kundenprojekt mit Frist und Beschreibung an.
        </p>
      </div>

      {/* Form */}
      <Card className="border-border/60 bg-background/80 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Projektdetails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createAction} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="name">Projektname</Label>
              <Input
                id="name"
                name="name"
                placeholder="Website-Relaunch"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Projektumfang, Ziele, Notizen..."
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="deadline">Frist</Label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  className="pl-8"
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full">
              Projekt erstellen
            </Button>
          </form>
        </CardContent>
      </Card>
    </Motion>
  );
}
