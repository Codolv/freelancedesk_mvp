import { NextRequest } from 'next/server';
import { getServerSupabaseAction } from '@/lib/supabase/server';
import { generateEnhancedInvoicePDF } from '@/lib/invoice-pdf-generator';
import { getLocale } from '@/lib/i18n/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await getServerSupabaseAction();
    
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

    // Get locale for date formatting
    const locale = await getLocale();
    // Generate enhanced PDF
    const pdfBytes = await generateEnhancedInvoicePDF(invoice, items, locale);
    
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
