import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { getServerSupabaseAction } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await getServerSupabaseAction();

  // Fetch invoice + items
  const { data: invoice } = await supabase
    .from("project_invoices")
    .select("id, title, amount_cents, status, created_at, project_id")
    .eq("id", params.id)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Rechnung nicht gefunden." }, { status: 404 });
  }

  const { data: items } = await supabase
    .from("project_invoice_items")
    .select("description, qty, unit_price_cents")
    .eq("invoice_id", params.id);

    
  // Prepare PDF
  const doc = new PDFDocument({ margin: 50 });
  const chunks: any[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => {});

  // Header
  doc
    .fontSize(20)
    .text("Rechnung", { align: "right" })
    .moveDown(0.5)
    .fontSize(12)
    .text(`Rechnungsnummer: ${invoice.id}`, { align: "right" })
    .text(`Datum: ${new Date(invoice.created_at).toLocaleDateString("de-DE")}`, {
      align: "right",
    })
    .moveDown(2);

  // Project / Company Info
  doc
    .fontSize(14)
    .text(invoice.title, { align: "left" })
    .moveDown(1);

  // Table header
  doc.fontSize(12).text("Beschreibung", 50, doc.y, { width: 250 });
  doc.text("Menge", 300, doc.y, { width: 60, align: "right" });
  doc.text("Einzelpreis", 380, doc.y, { width: 80, align: "right" });
  doc.text("Gesamt", 480, doc.y, { width: 80, align: "right" });
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.8);

  // Table rows
  let total = 0;
  (items || []).forEach((it) => {
    const lineTotal = (it.qty * it.unit_price_cents) / 100;
    total += lineTotal;
    doc.text(it.description, 50, doc.y, { width: 250 });
    doc.text(it.qty.toString(), 300, doc.y, { width: 60, align: "right" });
    doc.text(
      (it.unit_price_cents / 100).toLocaleString("de-DE", {
        style: "currency",
        currency: "EUR",
      }),
      380,
      doc.y,
      { width: 80, align: "right" }
    );
    doc.text(
      lineTotal.toLocaleString("de-DE", { style: "currency", currency: "EUR" }),
      480,
      doc.y,
      { width: 80, align: "right" }
    );
    doc.moveDown(0.5);
  });

  // Footer total
  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.8);
  doc.fontSize(12).text("Gesamtbetrag:", 380, doc.y, { width: 80, align: "right" });
  doc.font("Helvetica-Bold")
    .text(total.toLocaleString("de-DE", { style: "currency", currency: "EUR" }), 480, doc.y, {
      width: 80,
      align: "right",
    });

  doc.end();

  const buffer = await new Promise<Buffer>((resolve) => {
    const buf = Buffer.concat(chunks);
    resolve(buf);
  });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="invoice-${invoice.id}.pdf"`,
    },
  });
}
