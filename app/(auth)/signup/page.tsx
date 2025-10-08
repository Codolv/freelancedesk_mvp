import { redirect } from "next/navigation";
import { getServerSupabaseComponent } from "@/lib/supabase/server";
import SignUpClient from "./signup-client";

export default async function SignInPage() {
    const supabase = await getServerSupabaseComponent();
    const { data } = await supabase.auth.getUser();
    if (data.user) redirect("/dashboard");
    return (
        <SignUpClient />
    );
}