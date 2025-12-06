import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function htmlResponse(title: string, message: string, success: boolean): Response {
  const bgColor = success ? "#16a34a" : "#dc2626";
  const icon = success ? "✓" : "✗";
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f9fafb;">
      <div style="text-align: center; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); max-width: 400px;">
        <div style="width: 80px; height: 80px; border-radius: 50%; background: ${bgColor}; color: white; font-size: 40px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
          ${icon}
        </div>
        <h1 style="margin: 0 0 12px; color: #111827;">${title}</h1>
        <p style="margin: 0; color: #6b7280; font-size: 16px;">${message}</p>
        <p style="margin-top: 30px; font-size: 14px; color: #9ca3af;">You can close this tab.</p>
      </div>
    </body>
    </html>
  `;
  
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return htmlResponse("Invalid Request", "No token provided.", false);
    }

    console.log("Processing correction with token:", token.substring(0, 8) + "...");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the token
    const { data: tokenData, error: tokenError } = await supabase
      .from("correction_action_tokens")
      .select("*")
      .eq("token", token)
      .single();

    if (tokenError || !tokenData) {
      console.error("Token not found:", tokenError);
      return htmlResponse("Invalid Token", "This link is invalid or has already been used.", false);
    }

    // Check if expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return htmlResponse("Link Expired", "This review link has expired. Please ask the user to resubmit.", false);
    }

    // Check if already used
    if (tokenData.used_at) {
      return htmlResponse("Already Processed", "This correction has already been reviewed.", false);
    }

    console.log("Token valid, action:", tokenData.action);

    // Fetch the submission
    const { data: submission, error: submissionError } = await supabase
      .from("book_correction_submissions")
      .select("*")
      .eq("id", tokenData.submission_id)
      .single();

    if (submissionError || !submission) {
      console.error("Submission not found:", submissionError);
      return htmlResponse("Error", "The correction submission was not found.", false);
    }

    const action = tokenData.action as "approve" | "reject";

    if (action === "approve") {
      // Apply changes to canonical_books
      const proposedChanges = submission.proposed_changes as Record<string, unknown>;
      
      // Map field names from user book format to canonical format
      const canonicalUpdates: Record<string, unknown> = {
        community_edited: true,
        updated_at: new Date().toISOString(),
      };

      if (proposedChanges.title) canonicalUpdates.title = proposedChanges.title;
      if (proposedChanges.author) canonicalUpdates.authors = proposedChanges.author;
      if (proposedChanges.total_pages) canonicalUpdates.page_count = proposedChanges.total_pages;
      if (proposedChanges.genres) canonicalUpdates.categories = proposedChanges.genres;
      if (proposedChanges.cover_url) canonicalUpdates.cover_url = proposedChanges.cover_url;
      if (proposedChanges.description) canonicalUpdates.description = proposedChanges.description;

      // Recalculate missing fields
      const fieldsToCheck = ['title', 'authors', 'page_count', 'categories', 'cover_url', 'description'];
      const currentData = { ...canonicalUpdates };
      const missingFields = fieldsToCheck.filter(field => {
        const value = currentData[field];
        return !value || (Array.isArray(value) && value.length === 0);
      });
      canonicalUpdates.missing_fields = missingFields;

      console.log("Updating canonical_books for ISBN:", submission.isbn);

      const { error: updateError } = await supabase
        .from("canonical_books")
        .update(canonicalUpdates)
        .eq("isbn", submission.isbn);

      if (updateError) {
        console.error("Failed to update canonical_books:", updateError);
        return htmlResponse("Error", "Failed to apply the correction. Please try again.", false);
      }

      console.log("Canonical book updated successfully");
    }

    // Update submission status
    const { error: statusError } = await supabase
      .from("book_correction_submissions")
      .update({
        status: action === "approve" ? "approved" : "rejected",
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", submission.id);

    if (statusError) {
      console.error("Failed to update submission status:", statusError);
    }

    // Mark token as used
    await supabase
      .from("correction_action_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", tokenData.id);

    // Also mark the other token for this submission as used
    await supabase
      .from("correction_action_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("submission_id", submission.id)
      .neq("id", tokenData.id);

    console.log("Correction processed successfully:", action);

    if (action === "approve") {
      return htmlResponse(
        "Correction Approved",
        "The book data has been updated for all users. Thank you!",
        true
      );
    } else {
      return htmlResponse(
        "Correction Rejected",
        "The correction has been rejected. The submitter's local changes will remain.",
        true
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in process-correction:", errorMessage);
    return htmlResponse("Error", "An unexpected error occurred. Please try again.", false);
  }
};

serve(handler);
