"use client";

import { getBrowserSupabase } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Motion } from "@/components/custom/Motion"
import Image from "next/image";

export default function SignUpClient() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Bitte gib eine gültige E-Mail-Adresse ein.");
            return;
        }

        if (password.length < 6) {
            setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
            return;
        }

        if (password !== confirm) {
            setError("Die Passwörter stimmen nicht überein.");
            return;
        }

        setLoading(true);
        try {
            const supabase = getBrowserSupabase();
            const { data, error: err } = await supabase.auth.signUp({
                email,
                password,
            });

            if (err) {
                setError(err.message);
            } else if (data?.user) {
                setMessage(
                    "Registrierung erfolgreich! Überprüfe deine E-Mail, um den Account zu bestätigen."
                );
                supabase.from("profiles")
                .insert({id: data.user.id, email: email})
                .single();
                setTimeout(() => router.replace("/dashboard"), 3000);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Motion
            className="min-h-screen flex flex-col justify-center items-center px-6 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-background dark:to-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
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
                        width={240}
                        height={40}
                        className="rounded-md"
                    />
                </div>
                <p className="text-muted-foreground mt-2 text-sm">
                    Erstelle dein Konto, um loszulegen.
                </p>
            </Motion>

            {/* Form */}
            <motion.form
                onSubmit={handleSignup}
                className="w-full max-w-sm bg-white/70 dark:bg-white/5 backdrop-blur-md border border-border rounded-2xl shadow-md p-6 space-y-4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="grid gap-1.5">
                    <Label htmlFor="email">E-Mail-Adresse</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="du@firma.de"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="grid gap-1.5">
                    <Label htmlFor="password">Passwort</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Dein Passwort"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="grid gap-1.5">
                    <Label htmlFor="confirm">Passwort bestätigen</Label>
                    <Input
                        id="confirm"
                        type="password"
                        placeholder="Passwort wiederholen"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                    />
                </div>

                <Button
                    disabled={loading}
                    type="submit"
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                >
                    {loading ? "Registriere..." : "Konto erstellen"}
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
                Bereits ein Konto?{" "}
                <button
                    onClick={() => router.push("/signin")}
                    className="text-blue-600 hover:underline font-medium"
                >
                    Anmelden
                </button>
            </Motion>
        </Motion>
    );
}
