import { getServerSupabaseAction, getServerSupabaseComponent } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ItemsField } from "./ItemsField";

async function createInvoiceAction(projectId: string, formData: FormData) {
	"use server";
	const supabase = await getServerSupabaseAction();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return;
	const title = (formData.get("title")?.toString() || "").trim();
	if (!title) return;
	// Parse items JSON
	const itemsRaw = formData.get("items")?.toString() || "[]";
	let items: Array<{ description: string; qty: number; unit_price_cents: number }> = [];
	try { items = JSON.parse(itemsRaw); } catch {}
	if (items.length === 0) return;
	const amount_cents = items.reduce((sum, it) => sum + Math.round(it.qty * it.unit_price_cents), 0);
	const { data: inv, error } = await supabase
		.from("project_invoices")
		.insert({ project_id: projectId, user_id: user.id, title, amount_cents, status: "Open" })
		.select("id")
		.single();
	if (error || !inv?.id) return;
	await supabase.from("project_invoice_items").insert(
		items.map((it) => ({ invoice_id: inv.id, description: it.description, qty: it.qty, unit_price_cents: it.unit_price_cents }))
	);
	redirect(`/projects/${projectId}`);
}

export default async function NewInvoicePage({ params }: { params: { id: string } }) {
	const supabase = await getServerSupabaseComponent();
	const { data: project } = await supabase.from("projects").select("id, name").eq("id", params.id).single();
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Rechnung für {project?.name}</h1>
			<form action={createInvoiceAction.bind(null, params.id)} className="grid gap-4 max-w-2xl">
				<div className="grid gap-1.5">
					<Label htmlFor="title">Titel</Label>
					<Input id="title" name="title" placeholder="Projekt-Rechnung" />
				</div>
				<ItemsField />
				<Button type="submit">Rechnung speichern</Button>
			</form>
		</div>
	);
}
