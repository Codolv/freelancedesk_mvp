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
import { useT } from "@/lib/i18n/client";

export default function SignUpClient() {
  const { t } = useT();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("auth.email.required"));
      return;
    }
    if (!password || password.length < 6) {
      setError(t("auth.password.min"));
      return;
    }
    if (!name.trim()) {
      setError(t("auth.name.required"));
      return;
    }

    setLoading(true);
    try {
      const supabase = getBrowserSupabase();
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (err) {
        setError(err.message);
      } else {
        setMessage(t("auth.signup.success"));
        setTimeout(() => router.replace("/dashboard"), 2500);
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
              {t("hero.subtitle")}
            </p>
          </Motion>

          {/* Form Card */}
          <motion.form
            onSubmit={handleSignup}
            className="w-full max-w-sm bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-border rounded-2xl shadow-lg p-6 space-y-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="name">{t("auth.name.label")}</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Max Mustermann"
                required
                className="focus:ring-primary/40"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="email">{t("signin.email")}</Label>
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
              <Label htmlFor="password">{t("signin.password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
                className="focus:ring-primary/40"
              />
            </div>

            <Button
              disabled={loading}
              type="submit"
              className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 rounded-lg"
            >
              {loading ? t("auth.signup.loading") : t("auth.signup")}
            </Button>

            {message && (
              <div className="text-sm text-green-600 dark:text-green-400 text-center">
                {message}
              </div>
            )}
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 text-center">
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
            {t("auth.has.account")}{" "}
            <button
              onClick={() => router.push("/signin")}
              className="text-primary hover:underline font-medium"
            >
              {t("auth.account.signin")}
            </button>
          </Motion>
        </Motion>
      </div>
      <Footer />
    </div>
  );
}
