import { getServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const schema = z.object({
	name: z.string().min(1).max(120),
	description: z.string().max(2000).optional().default(""),
	deadline: z.string().optional(),
});

async function create(formData: FormData) {
	"use server";
	const supabase = await getServerSupabase();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return;

	const raw = {
		name: formData.get("name")?.toString() || "",
		description: formData.get("description")?.toString() || "",
		deadline: formData.get("deadline")?.toString() || "",
	};
	const parsed = schema.safeParse(raw);
	if (!parsed.success) return;

	const payload = {
		name: parsed.data.name,
		description: parsed.data.description,
		deadline: parsed.data.deadline ? new Date(parsed.data.deadline).toISOString() : null,
		user_id: user.id,
	};
	const { data, error } = await supabase.from("projects").insert(payload).select("id").single();
	if (!error && data?.id) redirect(`/projects/${data.id}`);
}

export default async function NewProjectPage() {
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Neues Projekt</h1>
			<form action={create} className="grid gap-3 max-w-xl rounded-lg border border-white/15 p-4 bg-white/5">
				<div className="grid gap-1.5">
					<Label htmlFor="name">Name</Label>
					<Input id="name" name="name" placeholder="Website-Relaunch" required />
				</div>
				<div className="grid gap-1.5">
					<Label htmlFor="description">Beschreibung</Label>
					<Textarea id="description" name="description" placeholder="Umfang, Ziele, Notizen" rows={4} />
				</div>
				<div className="grid gap-1.5">
					<Label htmlFor="deadline">Frist</Label>
					<Input id="deadline" name="deadline" type="date" />
				</div>
				<Button type="submit">Projekt erstellen</Button>
			</form>
		</div>
	);
}
