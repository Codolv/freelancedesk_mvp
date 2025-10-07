import { NextResponse } from "next/server";
import { getServerSupabaseAction } from "@/lib/supabase/server";

export async function GET(request: Request) {
	const supabase = await getServerSupabaseAction();
	await supabase.auth.exchangeCodeForSession(request.url);
	return NextResponse.redirect(new URL("/dashboard", process.env.APP_URL || "http://localhost:3000"));
}
