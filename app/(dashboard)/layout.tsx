import { getServerSupabaseComponent } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

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
    <div className="flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}
