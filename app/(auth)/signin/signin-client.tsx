"use client";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n/client";

export default function SignInClient() {
	const { t } = useT();
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleGoogle = async () => {
		const supabase = getBrowserSupabase();
		await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/auth/callback` } });
	};

	const handleEmailPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setMessage(null);
		setError(null);
		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			setError(t("signin.error.email"));
			return;
		}
		if (!password || password.length < 6) {
			setError(t("signin.error.password"));
			return;
		}
		setLoading(true);
		try {
			const supabase = getBrowserSupabase();
			const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
			if (err) {
				setError(err.message);
			} else if (data.session) {
				router.replace("/dashboard");
			} else {
				setMessage(t("signin.redirect"));
				router.replace("/dashboard");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="grid gap-4">
			<form onSubmit={handleEmailPassword} className="grid gap-3 rounded-lg border p-4 bg-white/5">
				<div className="grid gap-1.5">
					<Label htmlFor="email">{t("signin.email")}</Label>
					<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="du@firma.de" />
				</div>
				<div className="grid gap-1.5">
					<Label htmlFor="password">{t("signin.password")}</Label>
					<Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Dein Passwort" />
				</div>
				<Button disabled={loading} type="submit" className="button bg-[color:var(--accent)] text-[color:var(--accent-foreground)] hover:brightness-110">
					{loading ? t("signin.loading") : t("signin.email.cta")}
				</Button>
				{message && <div className="text-sm text-green-600 dark:text-green-400">{message}</div>}
				{error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
			</form>
			<div className="text-center text-sm opacity-60">{t("signin.or")}</div>
			<Button onClick={handleGoogle} variant="outline">{t("signin.google")}</Button>
		</div>
	);
}
