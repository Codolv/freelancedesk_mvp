import { NextResponse } from "next/server";
import { getServerSupabaseAction } from "@/lib/supabase/server";

export async function GET(request: Request) {
	const supabase = await getServerSupabaseAction();
	const requestUrl = new URL(request.url);
	
	console.log('OAuth callback received:', request.url);
	console.log('APP_URL:', process.env.APP_URL);
	
	try {
		const { data, error } = await supabase.auth.exchangeCodeForSession(request.url);
		
		if (error) {
			console.error('OAuth callback error:', error);
			console.error('Error details:', error.message, error.code);
			return NextResponse.redirect(new URL("/signin?error=oauth_failed", process.env.APP_URL || "http://localhost:3000"));
		}
		
		if (!data.session) {
			console.error('No session returned from OAuth callback');
			return NextResponse.redirect(new URL("/signin?error=no_session", process.env.APP_URL || "http://localhost:3000"));
		}
		
		console.log('OAuth session established successfully:', data.session.user.email);
		
		return NextResponse.redirect(new URL("/dashboard", process.env.APP_URL || "http://localhost:3000"));
	} catch (err) {
		console.error('Unexpected error in OAuth callback:', err);
		return NextResponse.redirect(new URL("/signin?error=oauth_failed", process.env.APP_URL || "http://localhost:3000"));
	}
}
