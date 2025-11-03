import { NextRequest } from 'next/server';
import { getServerSupabaseComponent } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await getServerSupabaseComponent();
    
    // Fetch invoice data
    const { data: invoice } = await supabase
      .from('project_invoices')
      .select('*, projects(name)')
      .eq('id', id)
      .single();

    if (!invoice) {
      return new Response('Invoice not found', { status: 404 });
    }

    // Fetch invoice items
    const { data: items } = await supabase
      .from('project_invoice_items')
      .select('*')
      .eq('invoice_id', id);

    if (!items) {
      return new Response('Invoice items not found', { status: 404 });
    }

    // Calculate total amount
    const totalAmount = items.reduce(
      (sum, item) => sum + Math.round(item.quantity * item.unit_price_cents),
      0
    );

    // Create PDF using pdf-lib
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    
    // Add a page
    const page = pdfDoc.addPage([595, 842]); // A4 size
    
    // Add content to the page (simplified example)
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Title
    page.drawText('Rechnung', {
      x: 50,
      y: 750,
      size: 24,
      font: font,
    });
    
    // Invoice details
    page.drawText(`Rechnung #${invoice.id.substring(0, 8)}`, {
      x: 50,
      y: 720,
      size: 12,
      font: font,
    });
    
    page.drawText(`Datum: ${format(new Date(invoice.created_at), 'dd.MM.yyyy', { locale: de })}`, {
      x: 50,
      y: 700,
      size: 12,
      font: font,
    });
    
    page.drawText(`Projekt: ${invoice.projects?.name || invoice.project_id}`, {
      x: 50,
      y: 680,
      size: 12,
      font: font,
    });
    
    page.drawText(`Titel: ${invoice.title}`, {
      x: 50,
      y: 660,
      size: 12,
      font: font,
    });
    
    // Items header
    page.drawText('Beschreibung', {
      x: 50,
      y: 620,
      size: 10,
      font: font,
    });
    
    page.drawText('Menge', {
      x: 300,
      y: 620,
      size: 10,
      font: font,
    });
    
    page.drawText('Preis', {
      x: 380,
      y: 620,
      size: 10,
      font: font,
    });
    
    page.drawText('Gesamt', {
      x: 460,
      y: 620,
      size: 10,
      font: font,
    });
    
    // Draw items
    let yPosition = 600;
    for (const item of items) {
      page.drawText(item.description || '', {
        x: 50,
        y: yPosition,
        size: 10,
        font: font,
      });
      
      page.drawText(item.quantity.toString(), {
        x: 300,
        y: yPosition,
        size: 10,
        font: font,
      });
      
      page.drawText(
        (item.unit_price_cents / 100).toLocaleString('de-DE', {
          style: 'currency',
          currency: 'EUR',
        }),
        {
          x: 380,
          y: yPosition,
          size: 10,
          font: font,
        }
      );
      
      page.drawText(
        (Math.round(item.quantity * item.unit_price_cents) / 100).toLocaleString('de-DE', {
          style: 'currency',
          currency: 'EUR',
        }),
        {
          x: 460,
          y: yPosition,
          size: 10,
          font: font,
        }
      );
      
      yPosition -= 15;
      
      if (yPosition < 100) {
        // Add new page if needed
        const newPage = pdfDoc.addPage([595, 842]);
        page.drawText('... (Fortsetzung)', {
          x: 50,
          y: 50,
          size: 10,
          font: font,
        });
        break;
      }
    }
    
    // Total amount
    page.drawText('Gesamtbetrag:', {
      x: 380,
      y: yPosition - 20,
      size: 12,
      font: font,
    });
    
    page.drawText(
      (totalAmount / 100).toLocaleString('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }),
      {
        x: 460,
        y: yPosition - 20,
        size: 12,
        font: font,
      }
    );
    
    // Serialize the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Convert to Buffer for Next.js response
    const buffer = Buffer.from(pdfBytes);
    
    // Return the PDF as a response
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rechnung-${invoice.id.substring(0, 8)}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
