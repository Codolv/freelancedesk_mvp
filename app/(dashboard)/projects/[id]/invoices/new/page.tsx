import { getServerSupabaseComponent } from "@/lib/supabase/server";
import NewInvoiceForm from "@/components/invoices/NewInvoiceForm";
import { createInvoiceAction } from "./actions";

export default async function NewInvoicePage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
 const params = await paramsPromise;
  const supabase = await getServerSupabaseComponent();
  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", params.id)
    .single();

  return (
    <NewInvoiceForm
      projectId={params.id}
      projectName={project?.name}
      createAction={createInvoiceAction}
    />
  );
}
