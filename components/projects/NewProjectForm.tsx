"use client";

import { useState } from "react";
import { Motion } from "@/components/custom/Motion";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarIcon, FileText, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function NewProjectForm({
  createAction,
}: {
  createAction: (formData: FormData) => Promise<void> | void;
}) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      if (date) formData.set("deadline", date.toISOString().split("T")[0]);
      await createAction(formData);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Motion
      className="max-w-2xl mx-auto py-10 px-4 relative"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md z-50"
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            <p className="text-muted-foreground text-sm">Projekt wird erstellt...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Neues Projekt
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Lege ein neues Kundenprojekt mit Frist und Beschreibung an.  
          Organisiere deine Arbeit effizienter mit FreelanceDesk.
        </p>
      </div>

      {/* Form Card */}
      <Card className="border-border/50 bg-card/70 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <FileText className="h-5 w-5 text-primary" />
            Projektdetails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.form
            action={handleSubmit}
            className="grid gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {/* Projektname */}
            <div className="grid gap-2">
              <Label htmlFor="name">Projektname</Label>
              <Input
                id="name"
                name="name"
                placeholder="Website-Relaunch"
                required
                className="focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
              />
            </div>

            {/* Beschreibung */}
            <div className="grid gap-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Projektumfang, Ziele, Notizen..."
                rows={4}
                className="focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
              />
            </div>

            {/* Date Picker */}
            <div className="grid gap-2">
              <Label>Frist</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !date && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd.MM.yyyy", { locale: de }) : "Datum auswählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    locale={de}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Submit */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all"
              >
                {loading ? "Wird erstellt..." : "Projekt erstellen"}
              </Button>
            </motion.div>
          </motion.form>
        </CardContent>
      </Card>
    </Motion>
  );
}
