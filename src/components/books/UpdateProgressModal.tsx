import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CompleteBookModal } from "./CompleteBookModal";

interface UpdateProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  currentPage: number;
  totalPages: number;
  onUpdate: () => void;
}

export const UpdateProgressModal = ({
  open,
  onOpenChange,
  bookId,
  currentPage,
  totalPages,
  onUpdate,
}: UpdateProgressModalProps) => {
  const [pagesRead, setPagesRead] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [loading, setLoading] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const { toast } = useToast();

  const clampPage = (value: number) => {
      if (value < currentPage + 1) return currentPage + 1;
      if (value > totalPages) return totalPages;
      return value;
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newCurrentPage = parseInt(pagesRead);
      const minutes = parseInt(timeSpent);

      if (
        isNaN(newCurrentPage) ||
        isNaN(minutes) ||
        newCurrentPage <= currentPage ||
        newCurrentPage > totalPages ||
        minutes <= 0
      ) {
        toast({
          title: "Invalid input",
          description: `Please enter a page between ${currentPage + 1} and ${totalPages}, and a positive number for time spent.`,
          variant: "destructive",
        });
        return;
      }

      const pagesReadThisSession = newCurrentPage - currentPage;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

      if (!profile) throw new Error("Profile not found");

      const { error: progressError } = await supabase
      .from("progress_entries")
      .insert({
        book_id: bookId,
        user_id: profile.user_id,
        pages_read: pagesReadThisSession,
        time_spent_minutes: minutes,
      });

      if (progressError) throw progressError;

      // Update book current page
      const { error: updateError } = await supabase
        .from("books")
        .update({ current_page: newCurrentPage })
        .eq("id", bookId);

      if (updateError) throw updateError;

      toast({
        title: "Progress updated",
        description: `You've read ${pagesReadThisSession} pages in ${minutes} minutes.`,
      });

      setPagesRead("");
      setTimeSpent("");
      onUpdate();

      if (newCurrentPage >= totalPages) {
        setCompleteModalOpen(true);
      } else {
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating progress.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Progress</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pages">Current page</Label>
            <Input
              id="currentPage"
              type="number"
              min={currentPage + 1}
              max={totalPages}
              placeholder={`e.g., ${currentPage + 25}`}
              value={pagesRead}
              onChange={(e) => setPagesRead(e.target.value)}
              onBlur={() => {
                if (!pagesRead) return;

                let parsed = parseInt(pagesRead);
                if (isNaN(parsed)) {
                  setPagesRead("");
                  return;
                }

                if (parsed < currentPage + 1) parsed = currentPage + 1;
                if (parsed > totalPages) parsed = totalPages;

                setPagesRead(parsed.toString());
              }}
              onInvalid={(e) => e.preventDefault()} // <- suppress browser warning
              required
            />
            <p className="text-xs text-muted-foreground">
              You're on page {Math.min(parseInt(pagesRead) || currentPage, totalPages)} of {totalPages}.
            </p>

          </div>
          <div className="space-y-2">
            <Label htmlFor="time">How long did it take? (minutes)</Label>
            <Input
              id="time"
              type="number"
              min="1"
              placeholder="e.g., 30"
              value={timeSpent}
              onChange={(e) => setTimeSpent(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Progress"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
