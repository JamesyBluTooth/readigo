import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

interface OriginalData {
  title?: string;
  author?: string;
  total_pages?: number;
  genres?: string[];
  cover_url?: string;
  description?: string;
}

interface SubmitCorrectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  isbn: string;
  originalData: OriginalData;
  proposedChanges: OriginalData;
  onSuccess: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  author: "Author",
  total_pages: "Total Pages",
  genres: "Genres",
  cover_url: "Cover URL",
  description: "Description",
};

export const SubmitCorrectionDialog = ({
  open,
  onOpenChange,
  bookId,
  isbn,
  originalData,
  proposedChanges,
  onSuccess,
}: SubmitCorrectionDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const changedFields = Object.keys(proposedChanges).filter((key) => {
    const originalValue = originalData[key as keyof OriginalData];
    const proposedValue = proposedChanges[key as keyof OriginalData];
    
    if (Array.isArray(originalValue) && Array.isArray(proposedValue)) {
      return JSON.stringify(originalValue) !== JSON.stringify(proposedValue);
    }
    return originalValue !== proposedValue;
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit corrections.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('book_correction_submissions')
        .insert([{
          isbn,
          book_id: bookId,
          submitted_by: user.id,
          original_data: JSON.parse(JSON.stringify(originalData)) as Json,
          proposed_changes: JSON.parse(JSON.stringify(proposedChanges)) as Json,
        }])
        .select('id')
        .single();

      if (error) throw error;

      // Trigger email notification to admin
      const { error: notifyError } = await supabase.functions.invoke('notify-book-correction', {
        body: { submissionId: data.id },
      });

      if (notifyError) {
        console.error('Failed to send notification:', notifyError);
        // Don't fail the submission, just log the error
      }

      toast({
        title: "Correction Submitted",
        description: "Your correction has been submitted and the admin has been notified.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting correction:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit correction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "Not available";
    if (Array.isArray(value)) return value.join(", ") || "None";
    return String(value);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Submit Correction for Review
          </AlertDialogTitle>
          <AlertDialogDescription>
            Your proposed changes will be reviewed by an admin. If approved, they will be applied to improve the book data for all users.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                ISBN: {isbn}
              </h4>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Proposed Changes</h4>
              
              {changedFields.length === 0 ? (
                <p className="text-sm text-muted-foreground">No changes detected.</p>
              ) : (
                changedFields.map((field) => (
                  <div key={field} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{FIELD_LABELS[field] || field}</Badge>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">Original:</span>
                        <span className="text-destructive/80 line-through">
                          {formatValue(originalData[field as keyof OriginalData])}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">Proposed:</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {formatValue(proposedChanges[field as keyof OriginalData])}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </ScrollArea>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={isSubmitting || changedFields.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit for Review"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
