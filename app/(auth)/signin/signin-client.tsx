"use client";

import { getBrowserSupabase } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Motion } from "@/components/custom/Motion";
import Image from "next/image";
import Footer from "@/components/layout/Footer";

export default function SignInClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }

    setLoading(true);
    try {
      const supabase = getBrowserSupabase();
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) {
        setError(err.message);
      } else if (data.session) {
        router.replace("/dashboard");
      } else {
        setMessage("Erfolgreich angemeldet! Weiterleitung...");
        router.replace("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Motion
          className="min-h-screen flex flex-col justify-center items-center px-6 bg-gradient-to-br from-background to-muted text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <Motion
            className="flex flex-col items-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="FreelanceDesk Logo"
                width={220}
                height={40}
                className="rounded-md"
              />
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              Willkommen zurück! Melde dich an, um fortzufahren.
            </p>
          </Motion>

          {/* Form Card */}
          <motion.form
            onSubmit={handleEmailPassword}
            className="w-full max-w-sm bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-border rounded-2xl shadow-lg p-6 space-y-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="email">E-Mail-Adresse</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="du@firma.de"
                required
                className="focus:ring-primary/40"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••"
                required
                className="focus:ring-primary/40"
              />
            </div>

            <Button
              disabled={loading}
              type="submit"
              className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 rounded-lg"
            >
              {loading ? "Wird angemeldet..." : "Anmelden"}
            </Button>

            {message && (
              <div className="text-sm text-green-600 dark:text-green-400 text-center">
                {message}
              </div>
            )}
            {error && (
              <div className="text-sm text-red-600 dark:text-red-40 text-center">
                {error}
              </div>
            )}
          </motion.form>

          {/* Footer */}
          <Motion
            className="mt-6 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Noch kein Konto?{" "}
            <button
              onClick={() => router.push("/signup")}
              className="text-primary hover:underline font-medium"
            >
              Jetzt registrieren
            </button>
          </Motion>
        </Motion>
      </div>
      <Footer />
    </div>
 );
}
