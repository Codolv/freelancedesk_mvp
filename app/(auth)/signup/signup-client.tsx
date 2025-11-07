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
  const [oauthLoading, setOauthLoading] = useState(false);
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

  const handleGoogleSignUp = async () => {
    setOauthLoading(true);
    setError(null);
    try {
      const supabase = getBrowserSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      }
      // The redirect happens automatically after successful OAuth flow
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setOauthLoading(false);
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

            {/* Google OAuth Button */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t("auth.or.continue.with")}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={oauthLoading}
              onClick={handleGoogleSignUp}
              className="w-full flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {oauthLoading ? t("auth.signup.loading") : t("auth.google.signup")}
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
