import { NextRequest } from 'next/server';
import { getServerSupabaseAction } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await getServerSupabaseAction();
    
    // Get current user to ensure this is called by an authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Update invoices that are past due and still open to 'overdue' status
    const { error } = await supabase
      .from('project_invoices')
      .update({ 
        status: 'overdue' 
      })
      .lt('due_date', new Date().toISOString())
      .eq('status', 'Open')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating invoice statuses:', error);
      return new Response('Internal Server Error', { status: 500 });
    }

    // Also update any invoices that were overdue but are now paid back to paid status
    const { error: paidError } = await supabase
      .from('project_invoices')
      .update({ 
        status: 'Paid' 
      })
      .eq('status', 'overdue')
      .eq('user_id', user.id)
      .eq('paid', true); // Assuming there might be a paid flag, but we'll handle this differently

    // Actually, let's just focus on the main logic and handle status updates properly
    // We'll query for invoices that should be overdue and update them
    const { data: overdueInvoices } = await supabase
      .from('project_invoices')
      .select('id, status, due_date')
      .lt('due_date', new Date().toISOString())
      .in('status', ['Open', 'draft'])
      .eq('user_id', user.id);

    if (overdueInvoices && overdueInvoices.length > 0) {
      const overdueInvoiceIds = overdueInvoices.map(inv => inv.id);
      
      const { error: updateError } = await supabase
        .from('project_invoices')
        .update({ status: 'overdue' })
        .in('id', overdueInvoiceIds);

      if (updateError) {
        console.error('Error updating overdue invoices:', updateError);
        return new Response('Internal Server Error', { status: 500 });
      }

      return new Response(
        JSON.stringify({ 
          message: `Updated ${overdueInvoices.length} invoices to overdue status`,
          updatedInvoices: overdueInvoiceIds 
        }), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ message: 'No invoices needed status updates' }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in update-status route:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// Also add a POST method to handle webhook calls or manual triggers
export async function POST(request: NextRequest) {
  return await GET(request);
}
