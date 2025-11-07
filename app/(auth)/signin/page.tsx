import { redirect } from "next/navigation";
import { getServerSupabaseComponent } from "@/lib/supabase/server";
import SignInClient from "./signin-client";

export default async function SignInPage() {
	const supabase = await getServerSupabaseComponent();
	const { data } = await supabase.auth.getUser();
	
	if (data.user) {
		// Clear any potential error parameters from URL after successful auth
	redirect("/dashboard");
	}
	
	return (
		<SignInClient />
	);
}
