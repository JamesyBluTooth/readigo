import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const adminEmail = Deno.env.get("ADMIN_EMAIL");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CorrectionRequest {
  submissionId: string;
}

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "Not available";
  if (Array.isArray(value)) return value.join(", ") || "None";
  return String(value);
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submissionId }: CorrectionRequest = await req.json();
    console.log("Processing notification for submission:", submissionId);

    if (!adminEmail) {
      throw new Error("ADMIN_EMAIL not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the submission details
    const { data: submission, error: fetchError } = await supabase
      .from("book_correction_submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (fetchError || !submission) {
      console.error("Failed to fetch submission:", fetchError);
      throw new Error("Submission not found");
    }

    console.log("Submission found:", submission.isbn);

    // Generate tokens for approve and reject actions
    const approveToken = generateToken();
    const rejectToken = generateToken();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours

    // Store tokens
    const { error: tokenError } = await supabase
      .from("correction_action_tokens")
      .insert([
        { submission_id: submissionId, token: approveToken, action: "approve", expires_at: expiresAt },
        { submission_id: submissionId, token: rejectToken, action: "reject", expires_at: expiresAt },
      ]);

    if (tokenError) {
      console.error("Failed to create tokens:", tokenError);
      throw new Error("Failed to create action tokens");
    }

    console.log("Tokens created successfully");

    // Build action URLs
    const baseUrl = `${supabaseUrl}/functions/v1/process-correction`;
    const approveUrl = `${baseUrl}?token=${approveToken}`;
    const rejectUrl = `${baseUrl}?token=${rejectToken}`;

    // Build comparison table
    const originalData = submission.original_data as Record<string, unknown>;
    const proposedChanges = submission.proposed_changes as Record<string, unknown>;
    
    const fieldLabels: Record<string, string> = {
      title: "Title",
      author: "Author",
      total_pages: "Total Pages",
      genres: "Genres",
      cover_url: "Cover URL",
      description: "Description",
    };

    const changedFields = Object.keys(proposedChanges).filter((key) => {
      const originalValue = originalData[key];
      const proposedValue = proposedChanges[key];
      if (Array.isArray(originalValue) && Array.isArray(proposedValue)) {
        return JSON.stringify(originalValue) !== JSON.stringify(proposedValue);
      }
      return originalValue !== proposedValue;
    });

    const changesHtml = changedFields
      .map(
        (field) => `
        <tr>
          <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 500;">${fieldLabels[field] || field}</td>
          <td style="padding: 12px; border: 1px solid #e5e7eb; color: #dc2626; text-decoration: line-through;">${formatValue(originalData[field])}</td>
          <td style="padding: 12px; border: 1px solid #e5e7eb; color: #16a34a; font-weight: 500;">${formatValue(proposedChanges[field])}</td>
        </tr>
      `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📚 Book Correction Submitted</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="margin-top: 0;">A user has submitted a correction for review:</p>
          
          <div style="background: white; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 0 0 8px 0;"><strong>ISBN:</strong> ${submission.isbn}</p>
            <p style="margin: 0;"><strong>Book Title:</strong> ${formatValue(originalData.title)}</p>
          </div>
          
          <h3 style="margin-bottom: 12px;">Proposed Changes:</h3>
          
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Field</th>
                <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Original</th>
                <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Proposed</th>
              </tr>
            </thead>
            <tbody>
              ${changesHtml}
            </tbody>
          </table>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="${approveUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 8px;">✓ Approve</a>
            <a href="${rejectUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 8px;">✗ Reject</a>
          </div>
          
          <p style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center;">
            These action links expire in 48 hours.
          </p>
        </div>
      </body>
      </html>
    `;

    console.log("Sending email to:", adminEmail);

    const emailResponse = await resend.emails.send({
      from: "Book Corrections <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `📚 Book Correction: ${formatValue(originalData.title)} (${submission.isbn})`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in notify-book-correction:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
