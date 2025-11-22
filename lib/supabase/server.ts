import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

// Use in Server Components (RSC): cookies can only be read, not modified
export async function getServerSupabaseComponent() {
	const cookieStore = await cookies();
	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return cookieStore.get(name)?.value;
				},
				set(name: string, value: string, options: CookieOptions) {
					// In Server Components, we silently ignore cookie modifications
					// since they cannot be modified here. The actual cookie operations
					// will be handled by Server Actions or Route Handlers when needed.
					console.warn(`Cookie modification attempted in Server Component: ${name}. This will be handled by Server Actions/Route Handlers.`);
				},
				remove(name: string, options: CookieOptions) {
					// In Server Components, we silently ignore cookie removals
					// since they cannot be modified here. The actual cookie operations
					// will be handled by Server Actions or Route Handlers when needed.
					console.warn(`Cookie removal attempted in Server Component: ${name}. This will be handled by Server Actions/Route Handlers.`);
				},
			},
		}
	);
	return supabase;
}

// Use in Server Actions or Route Handlers: cookies can be modified
export async function getServerSupabaseAction() {
	const cookieStore = await cookies();
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
						maxAge: 0,
					});
				},
			},
		}
	);
	return supabase;
}
