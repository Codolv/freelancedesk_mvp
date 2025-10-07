import { redirect } from "next/navigation";
import { getServerSupabaseComponent } from "@/lib/supabase/server";
import SignInClient from "./signin-client";

export default async function SignInPage() {
	const supabase = await getServerSupabaseComponent();
	const { data } = await supabase.auth.getUser();
	if (data.user) redirect("/dashboard");
	return (
		<div className="min-h-screen flex items-center justify-center p-8">
			<div className="max-w-sm w-full space-y-4 text-center">
				<h1 className="text-2xl font-semibold">Anmelden</h1>
				<SignInClient />
			</div>
		</div>
	);
}
