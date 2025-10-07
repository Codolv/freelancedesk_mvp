import { getServerSupabaseComponent } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProjectsPage() {
	const supabase = await getServerSupabaseComponent();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	let projects: Array<{ id: string; name: string; description: string | null; deadline: string | null }>= [];
	if (user) {
		const { data } = await supabase
			.from("projects")
			.select("id, name, description, deadline")
			.eq("user_id", user.id)
			.order("created_at", { ascending: false });
		projects = (data as any) || [];
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Projekte</h1>
				<Button asChild><Link href="/projects/new">Neues Projekt</Link></Button>
			</div>

			<div className="grid gap-3">
				{projects.length === 0 && <div className="opacity-70 text-sm">Noch keine Projekte.</div>}
				{projects.map((p) => (
					<Link key={p.id} href={`/projects/${p.id}`} className="card rounded-lg border border-white/15 p-4 bg-white/5 block">
						<div className="font-medium">{p.name}</div>
						{p.description && <p className="text-sm opacity-80 mt-1 line-clamp-2">{p.description}</p>}
						{p.deadline && <div className="text-xs opacity-70 mt-2">Frist: {new Date(p.deadline).toLocaleDateString('de-DE')}</div>}
					</Link>
				))}
			</div>
		</div>
	);
}
