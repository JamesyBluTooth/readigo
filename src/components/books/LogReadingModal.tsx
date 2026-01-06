import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface LogReadingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  currentPage: number;
  totalPages: number;
  onSuccess?: () => void;
}

export const LogReadingModal = ({
  open,
  onOpenChange,
  bookId,
  currentPage,
  totalPages,
  onSuccess,
}: LogReadingModalProps) => {
  const [pageInput, setPageInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [showTime, setShowTime] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newPage = parseInt(pageInput, 10);
      const minutes = timeInput ? parseInt(timeInput, 10) : null;

      if (isNaN(newPage) || newPage <= currentPage || newPage > totalPages) {
        throw new Error(
          `Enter a page between ${currentPage + 1} and ${totalPages}.`
        );
      }

      if (minutes !== null && minutes <= 0) {
        throw new Error("Time spent must be a positive number.");
      }

      const pagesReadThisSession = newPage - currentPage;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("progress_entries").insert({
        book_id: bookId,
        user_id: user.id,
        pages_read: pagesReadThisSession,
        time_spent_minutes: minutes,
        notes: notesInput.trim() || null,
      });

      if (error) throw error;

      await supabase
        .from("books")
        .update({ current_page: newPage })
        .eq("id", bookId);

      toast({
        title: "Reading logged",
        description: "Carry on reading 📖",
      });

      setPageInput("");
      setTimeInput("");
      setNotesInput("");
      setShowTime(false);
      setShowNotes(false);

      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message ?? "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="px-6 pb-6 will-change-transform backface-hidden translate-z-0">
        {/* Back link */}
        <div className="mb-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-sm font-semibold text-primary hover:underline"
          >
            ← Back
          </button>
        </div>

        <DrawerHeader className="px-0 pt-0 text-left">
          <DrawerTitle>Log reading</DrawerTitle>
        </DrawerHeader>

        <form onSubmit={handleSave} className="mt-4 space-y-5">
          {/* Required page */}
          <div className="space-y-2">
            <Label>Current page</Label>
            <Input
              type="number"
              min={currentPage + 1}
              max={totalPages}
              placeholder={`e.g. ${currentPage + 10}`}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              You’re on{" "}
              {Math.min(parseInt(pageInput) || currentPage, totalPages)} of{" "}
              {totalPages}
            </p>
          </div>

          {/* Optional actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowTime(!showTime)}
              className={cn(
                "flex-1 rounded-lg border-2 border-dashed px-3 py-2 text-sm font-medium",
                showTime && "border-solid bg-muted"
              )}
            >
              Add time
            </button>

            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className={cn(
                "flex-1 rounded-lg border-2 border-dashed px-3 py-2 text-sm font-medium",
                showNotes && "border-solid bg-muted"
              )}
            >
              Add notes
            </button>
          </div>

          {showTime && (
            <div className="space-y-2">
              <Label>Time read (minutes)</Label>
              <Input
                type="number"
                min={1}
                placeholder="Optional"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
              />
            </div>
          )}

          {showNotes && (
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                rows={4}
                placeholder="Optional thoughts, reflections, grumbles…"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="resize-none"
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : "Save & carry on reading"}
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
};
