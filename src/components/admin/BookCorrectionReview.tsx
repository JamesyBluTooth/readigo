import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Loader2, AlertCircle, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Submission {
  id: string;
  isbn: string;
  book_id: string | null;
  submitted_by: string;
  original_data: Record<string, unknown>;
  proposed_changes: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  author: "Author",
  total_pages: "Total Pages",
  genres: "Genres",
  cover_url: "Cover URL",
  description: "Description",
};

export const BookCorrectionReview = () => {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['book-corrections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('book_correction_submissions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Submission[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (submission: Submission) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update canonical_books with the proposed changes
      const { error: canonicalError } = await supabase
        .from('canonical_books')
        .update({
          title: submission.proposed_changes.title as string || undefined,
          authors: submission.proposed_changes.author as string || undefined,
          page_count: submission.proposed_changes.total_pages as number || undefined,
          categories: submission.proposed_changes.genres as string[] || undefined,
          cover_url: submission.proposed_changes.cover_url as string || undefined,
          description: submission.proposed_changes.description as string || undefined,
          community_edited: true,
          last_edited_by: user.id,
          missing_fields: [],
        })
        .eq('isbn', submission.isbn);

      if (canonicalError) {
        // If canonical book doesn't exist, create it
        const { error: insertError } = await supabase
          .from('canonical_books')
          .insert({
            isbn: submission.isbn,
            title: (submission.proposed_changes.title as string) || (submission.original_data.title as string) || 'Unknown',
            authors: (submission.proposed_changes.author as string) || (submission.original_data.author as string),
            page_count: (submission.proposed_changes.total_pages as number) || (submission.original_data.total_pages as number),
            categories: (submission.proposed_changes.genres as string[]) || (submission.original_data.genres as string[]),
            cover_url: (submission.proposed_changes.cover_url as string) || (submission.original_data.cover_url as string),
            description: (submission.proposed_changes.description as string) || (submission.original_data.description as string),
            community_edited: true,
            last_edited_by: user.id,
            missing_fields: [],
          });

        if (insertError) throw insertError;
      }

      // Mark submission as approved
      const { error: updateError } = await supabase
        .from('book_correction_submissions')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', submission.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast({
        title: "Correction Approved",
        description: "The book data has been updated for all users.",
      });
      queryClient.invalidateQueries({ queryKey: ['book-corrections'] });
      setSelectedSubmission(null);
    },
    onError: (error) => {
      console.error('Error approving correction:', error);
      toast({
        title: "Error",
        description: "Failed to approve correction.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ submission, reason }: { submission: Submission; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('book_correction_submissions')
        .update({
          status: 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', submission.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Correction Rejected",
        description: "The submission has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ['book-corrections'] });
      setSelectedSubmission(null);
      setIsRejectDialogOpen(false);
      setRejectionReason("");
    },
    onError: (error) => {
      console.error('Error rejecting correction:', error);
      toast({
        title: "Error",
        description: "Failed to reject correction.",
        variant: "destructive",
      });
    },
  });

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "Not available";
    if (Array.isArray(value)) return value.join(", ") || "None";
    return String(value);
  };

  const getChangedFields = (submission: Submission) => {
    return Object.keys(submission.proposed_changes).filter((key) => {
      const originalValue = submission.original_data[key];
      const proposedValue = submission.proposed_changes[key];
      
      if (Array.isArray(originalValue) && Array.isArray(proposedValue)) {
        return JSON.stringify(originalValue) !== JSON.stringify(proposedValue);
      }
      return originalValue !== proposedValue;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">No Pending Corrections</h3>
          <p className="text-muted-foreground text-sm mt-1">
            All book corrections have been reviewed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {submissions.map((submission) => {
          const changedFields = getChangedFields(submission);
          
          return (
            <Card key={submission.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {formatValue(submission.original_data.title || submission.proposed_changes.title)}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      ISBN: {submission.isbn} • {changedFields.length} field(s) changed
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {changedFields.map((field) => (
                    <div key={field} className="flex items-start gap-4 text-sm">
                      <span className="text-muted-foreground min-w-[100px]">
                        {FIELD_LABELS[field] || field}:
                      </span>
                      <div className="flex-1 space-y-1">
                        <div className="text-destructive/70 line-through text-xs">
                          {formatValue(submission.original_data[field])}
                        </div>
                        <div className="text-green-600 dark:text-green-400 font-medium">
                          {formatValue(submission.proposed_changes[field])}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setIsRejectDialogOpen(true);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => approveMutation.mutate(submission)}
                    disabled={approveMutation.isPending}
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-1" />
                    )}
                    Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Reject Correction
            </DialogTitle>
            <DialogDescription>
              The user will keep their local changes, but they won't be applied globally.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rejection Reason (optional)</label>
            <Textarea
              placeholder="Explain why this correction was rejected..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedSubmission) {
                  rejectMutation.mutate({ submission: selectedSubmission, reason: rejectionReason });
                }
              }}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                "Reject Correction"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
