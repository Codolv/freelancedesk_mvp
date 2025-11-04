import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price_cents: number;
}

interface InvoiceData {
  id: string;
  title: string;
  created_at: string;
  status: string;
  project_id: string;
  projects?: { name: string };
}

export async function generateEnhancedInvoicePDF(
  invoice: InvoiceData,
  items: InvoiceItem[],
  companyInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
  }
) {
  const pdfDoc = await PDFDocument.create();

  // === Fonts ===
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // === Colors ===
  const primary = rgb(0.15, 0.35, 0.55);
  const secondary = rgb(0.35, 0.65, 0.4);
  const text = rgb(0.1, 0.1, 0.1);
  const lightGray = rgb(0.93, 0.93, 0.93);
  const border = rgb(0.75, 0.75, 0.75);

  let page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();
  let y = height - 60;

  // === Header ===
  page.drawRectangle({ x: 0, y: height - 100, width, height: 100, color: primary });
  page.drawText(companyInfo?.name || "FREELANCE DESK", {
    x: 50,
    y: height - 60,
    size: 22,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  page.drawText("Professionelle Rechnung", {
    x: 50,
    y: height - 85,
    size: 12,
    font: helveticaOblique,
    color: rgb(1, 1, 1),
  });

  // Optional Logo
  if (companyInfo?.logoUrl) {
    try {
      const imgBytes = await fetch(companyInfo.logoUrl).then((res) => res.arrayBuffer());
      const image = await pdfDoc.embedPng(imgBytes);
      const scale = 50 / image.height;
      page.drawImage(image, {
        x: width - 100,
        y: height - 90,
        width: image.width * scale,
        height: image.height * scale,
      });
    } catch (e) {
      console.warn("Logo konnte nicht geladen werden:", e);
    }
  }

  y -= 120;

  // === Invoice Details ===
  page.drawText(invoice.title || "Rechnung", {
    x: 50,
    y,
    size: 18,
    font: helveticaBold,
    color: text,
  });
  y -= 25;

  page.drawText(`Rechnungsnummer: ${invoice.id.slice(0, 8)}`, { x: 50, y, size: 11, font: helvetica, color: text });
  y -= 15;
  page.drawText(`Datum: ${format(new Date(invoice.created_at), "dd.MM.yyyy", { locale: de })}`, { x: 50, y, size: 11, font: helvetica, color: text });
  y -= 15;
  page.drawText(`Projekt: ${invoice.projects?.name || "Unbekannt"}`, { x: 50, y, size: 11, font: helvetica, color: text });
  y -= 25;

  // Status Badge
  const isPaid = invoice.status === "Paid";
  const badgeColor = isPaid ? secondary : rgb(0.8, 0.55, 0.2);
  page.drawRectangle({ x: 50, y: y - 5, width: 70, height: 18, color: badgeColor });
  page.drawText(isPaid ? "Bezahlt" : "Offen", { x: 60, y: y + 2, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });
  y -= 40;

  // === Table Header ===
  const drawTableHeader = () => {
    page.drawRectangle({ x: 50, y: y - 20, width: width - 100, height: 20, color: lightGray });
    page.drawText("Beschreibung", { x: 60, y: y - 14, size: 11, font: helveticaBold, color: text });
    page.drawText("Menge", { x: 330, y: y - 14, size: 11, font: helveticaBold, color: text });
    page.drawText("Einzelpreis", { x: 400, y: y - 14, size: 11, font: helveticaBold, color: text });
    page.drawText("Gesamt", { x: 490, y: y - 14, size: 11, font: helveticaBold, color: text });
    y -= 30;
  };

  drawTableHeader();

  // === Table Rows ===
  let totalCents = 0;
  for (const [i, item] of items.entries()) {
    const itemTotal = item.quantity * item.unit_price_cents;
    totalCents += itemTotal;

    if (y < 120) {
      page = pdfDoc.addPage([595, 842]);
      y = height - 100;
      drawTableHeader();
    }

    if (i % 2 === 0) {
      page.drawRectangle({ x: 50, y: y - 20, width: width - 100, height: 20, color: lightGray });
    }

    page.drawText(item.description, { x: 60, y: y - 14, size: 10, font: helvetica, color: text });
    page.drawText(item.quantity.toString(), { x: 330, y: y - 14, size: 10, font: helvetica, color: text });
    page.drawText((item.unit_price_cents / 100).toFixed(2) + " €", { x: 400, y: y - 14, size: 10, font: helvetica, color: text });
    page.drawText((itemTotal / 100).toFixed(2) + " €", { x: 490, y: y - 14, size: 10, font: helveticaBold, color: text });
    y -= 25;
  }

  // === Totals (with VAT) ===
  const taxRate = 0.19;
  const net = totalCents / 100;
  const tax = net * taxRate;
  const gross = net + tax;

  y -= 20;
  page.drawLine({ start: { x: 350, y }, end: { x: width - 50, y }, color: border, thickness: 1 });
  y -= 25;
  page.drawText("Zwischensumme:", { x: 360, y, size: 11, font: helvetica, color: text });
  page.drawText(net.toFixed(2) + " €", { x: 490, y, size: 11, font: helvetica, color: text });
  y -= 15;
  page.drawText("zzgl. 19% MwSt.:", { x: 360, y, size: 11, font: helvetica, color: text });
  page.drawText(tax.toFixed(2) + " €", { x: 490, y, size: 11, font: helvetica, color: text });
  y -= 20;
  page.drawRectangle({ x: 350, y: y - 5, width: 200, height: 25, color: lightGray });
  page.drawText("Gesamtbetrag:", { x: 360, y, size: 12, font: helveticaBold, color: text });
  page.drawText(gross.toFixed(2) + " €", { x: 490, y, size: 12, font: helveticaBold, color: secondary });
  y -= 50;

  // === Footer ===
  page.drawLine({ start: { x: 50, y: 80 }, end: { x: width - 50, y: 80 }, color: border, thickness: 1 });
  page.drawText("Vielen Dank für Ihre Zusammenarbeit!", { x: 50, y: 65, size: 10, font: helveticaOblique, color: text });

  if (companyInfo) {
    page.drawText(`${companyInfo.email || ""} | ${companyInfo.phone || ""}`, {
      x: 50,
      y: 45,
      size: 8,
      font: helvetica,
      color: text,
    });
    if (companyInfo.address)
      page.drawText(companyInfo.address, { x: 50, y: 35, size: 8, font: helvetica, color: text });
  }

  page.drawText("© 2025 Freelance Desk – Professionelle Projektverwaltung", {
    x: width - 300,
    y: 35,
    size: 8,
    font: helvetica,
    color: text,
  });

  return await pdfDoc.save();
}
