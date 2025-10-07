import { getServerSupabaseAction, getServerSupabaseComponent } from "@/lib/supabase/server";
import ReactMarkdown from "react-markdown";
import { revalidatePath } from "next/cache";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

async function addMessage(projectId: string, formData: FormData) {
	"use server";
	const supabase = await getServerSupabaseAction();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return;
	const content = (formData.get("content")?.toString() || "").trim();
	if (!content) return;
	await supabase.from("project_messages").insert({ project_id: projectId, user_id: user.id, content });
	revalidatePath(`/projects/${projectId}`);
}

async function uploadFile(projectId: string, formData: FormData) {
	"use server";
	const supabase = await getServerSupabaseAction();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return;
	const file = formData.get("file") as File | null;
	if (!file) return;
	const path = `${projectId}/${file.name}`;
	await supabase.storage.from("files").upload(path, file, { upsert: true });
	revalidatePath(`/projects/${projectId}`);
}

async function deleteInvoice(projectId: string, invoiceId: string) {
	"use server";
	const supabase = await getServerSupabaseAction();
	await supabase.from("project_invoice_items").delete().eq("invoice_id", invoiceId);
	await supabase.from("project_invoices").delete().eq("id", invoiceId);
	revalidatePath(`/projects/${projectId}`);
}

async function markInvoicePaid(projectId: string, invoiceId: string) {
	"use server";
	const supabase = await getServerSupabaseAction();
	const {data, error } = await supabase.from("project_invoices").update({ status: "Paid" }).eq("id", invoiceId);
	if(error) {
		console.log(error);
	}
	revalidatePath(`/projects/${projectId}`);
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const supabase = await getServerSupabaseComponent();
	const { data: project } = await supabase
		.from("projects")
		.select("id, name, description, deadline")
		.eq("id", id)
		.single();

	const { data: messages } = await supabase
		.from("project_messages")
		.select("id, content, created_at")
		.eq("project_id", id)
		.order("created_at", { ascending: false });

	const { data: list } = await supabase.storage.from("files").list(id, { sortBy: { column: "name", order: "asc" } });

	const { data: invoices } = await supabase
		.from("project_invoices")
		.select("id, title, amount_cents, status, created_at")
		.eq("project_id", id)
		.order("created_at", { ascending: false });

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">{project?.name ?? "Projekt"}</h1>
			</div>
			{project?.description && <p className="opacity-80 max-w-prose">{project.description}</p>}
			{project?.deadline && <div className="text-sm opacity-70">Frist: {new Date(project.deadline).toLocaleDateString('de-DE')}</div>}

			<Tabs defaultValue="messages" className="w-full">
				<TabsList className="mb-2">
					<TabsTrigger value="messages">Nachrichten</TabsTrigger>
					<TabsTrigger value="files">Dateien</TabsTrigger>
					<TabsTrigger value="invoices">Rechnungen</TabsTrigger>
				</TabsList>

				<TabsContent value="messages" className="grid gap-3">
					<form action={addMessage.bind(null, id)} className="grid gap-2 max-w-2xl">
						<Label htmlFor="content">Nachricht (Markdown unterstützt)</Label>
						<Textarea id="content" name="content" rows={4} placeholder="Update schreiben..." />
						<Button type="submit">Posten</Button>
					</form>
					<div className="grid gap-3">
						{(messages || []).length === 0 && <div className="opacity-70 text-sm">Noch keine Nachrichten.</div>}
						{(messages || []).map((m: any) => (
							<div key={m.id} className="card rounded-lg border border-white/15 p-4 bg-white/5">
								<div className="text-xs opacity-70 mb-2">{new Date(m.created_at).toLocaleString('de-DE')}</div>
								<ReactMarkdown>{m.content}</ReactMarkdown>
							</div>
						))}
					</div>
				</TabsContent>

				<TabsContent value="files" className="grid gap-3">
					<form action={uploadFile.bind(null, id)} className="flex items-center gap-2">
						<Input type="file" name="file" />
						<Button type="submit">Hochladen</Button>
					</form>
					<div className="grid gap-2">
						{(list || []).length === 0 && <div className="opacity-70 text-sm">Noch keine Dateien.</div>}
						{(list || []).map((f) => (
							<div key={f.name} className="flex items-center justify-between text-sm">
								<span>{f.name}</span>
								<a className="underline" target="_blank" rel="noreferrer" href="#">Download</a>
							</div>
						))}
					</div>
				</TabsContent>

				<TabsContent value="invoices" className="grid gap-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold">Rechnungen</h2>
						<Button asChild><Link href={`/projects/${id}/invoices/new`}>Neue Rechnung</Link></Button>
					</div>
					<div className="grid gap-2">
						{(invoices || []).length === 0 && <div className="opacity-70 text-sm">Noch keine Rechnungen.</div>}
						{(invoices || []).map((inv: any) => (
							<div key={inv.id} className="flex items-center justify-between text-sm rounded-md border p-3 bg-white/5 gap-3">
								<div className="min-w-0 flex-1">
									<div className="font-medium truncate">{inv.title}</div>
									<div className="opacity-70">
										{(inv.amount_cents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} • {inv.status}
									</div>
								</div>
								<div className="opacity-70 text-xs">
									{new Date(inv.created_at).toLocaleDateString('de-DE')}
								</div>
								<div className="flex items-center gap-2">
									{(inv.status == "Open") ?
									<form action={markInvoicePaid.bind(null, id, inv.id)}>
										<Button className="px-3 py-1 rounded-md border">Bezahlt</Button>
									</form> : <div/>
									}
									<form action={deleteInvoice.bind(null, id, inv.id)}>
										<Button className="px-3 py-1 rounded-md border">Löschen</Button>
									</form>
								</div>
							</div>
						))}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
