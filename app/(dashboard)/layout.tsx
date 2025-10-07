import { getServerSupabaseComponent } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClientSidebarNav } from "./client-nav";
import Image from "next/image";

const items = [
	{ href: "/dashboard", key: "dashboard.overview" },
	{ href: "/projects", key: "dashboard.projects" },
	{ href: "/settings", key: "dashboard.settings" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	const supabase = await getServerSupabaseComponent();
	const { data } = await supabase.auth.getUser();
	if (!data.user) redirect("/signin");
	return (
		<div className="min-h-screen grid grid-cols-[220px_1fr]">
			<aside className="border-r p-4 space-y-4">
				<div className="flex items-center gap-2">
					<Image src="/logo.png" alt="FreelanceDesk Logo" width={140} height={36} priority />
				</div>
				<ClientSidebarNav items={items} />
			</aside>
			<main className="p-6">{children}</main>
		</div>
	);
}
