import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

// Use in Server Components (RSC): cookies cannot be modified here.
export async function getServerSupabaseComponent() {
	const cookieStore = await Promise.resolve(cookies());
	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return cookieStore.get(name)?.value;
				},
				set(name: string, value: string, options: CookieOptions) {
					// Set secure cookies in production
					cookieStore.set({ 
						name, 
						value, 
						...options,
						secure: process.env.NODE_ENV === 'production',
						sameSite: 'lax',
						path: '/',
					});
				},
				remove(name: string, options: CookieOptions) {
					cookieStore.set({ 
						name, 
						value: "", 
						...options,
						secure: process.env.NODE_ENV === 'production',
						sameSite: 'lax',
						path: '/',
					});
				},
			},
		}
	);
	return supabase;
}

// Use in Server Actions or Route Handlers: cookies can be modified.
export async function getServerSupabaseAction() {
	const cookieStore = await Promise.resolve(cookies());
	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return cookieStore.get(name)?.value;
				},
				set(name: string, value: string, options: CookieOptions) {
					cookieStore.set({ 
						name, 
						value, 
						...options,
						secure: process.env.NODE_ENV === 'production',
						sameSite: 'lax',
						path: '/',
					});
				},
				remove(name: string, options: CookieOptions) {
					cookieStore.set({ 
						name, 
						value: "", 
						...options,
						secure: process.env.NODE_ENV === 'production',
						sameSite: 'lax',
						path: '/',
					});
				},
			},
		}
	);
	return supabase;
}
