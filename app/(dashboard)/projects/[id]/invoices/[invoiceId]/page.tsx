import { redirect } from "next/navigation";

export default async function InvoicePage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string; invoiceId: string }>;
}) {
  const params = await paramsPromise;
  
  // Redirect to the view page by default
  redirect(`/projects/${params.id}/invoices/${params.invoiceId}/view`);
}
