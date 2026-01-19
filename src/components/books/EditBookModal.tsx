import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { saveBookEdit, BookEdit } from "@/lib/bookUserEdits";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditBookModalProps {
  bookId: string;
  isbn?: string;
  currentData: {
    title: string;
    author?: string;
    total_pages?: number;
    genres?: string[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export const EditBookModal = ({
  bookId,
  isbn,
  currentData,
  open,
  onOpenChange,
  onSave,
}: EditBookModalProps) => {
  const [formData, setFormData] = useState({
    title: currentData.title,
    author: currentData.author || "",
    total_pages: currentData.total_pages?.toString() || "",
    genres: currentData.genres?.join(", ") || "",
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, currentData]);

  const resetForm = () => {
    setFormData({
      title: currentData.title,
      author: currentData.author || "",
      total_pages: currentData.total_pages?.toString() || "",
      genres: currentData.genres?.join(", ") || "",
    });
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const genresArray = formData.genres.split(",").map(g => g.trim()).filter(g => g);

      const edit: BookEdit = {
        title: formData.title !== currentData.title ? formData.title : undefined,
        author: formData.author !== (currentData.author || "") ? formData.author : undefined,
        total_pages: formData.total_pages && parseInt(formData.total_pages) !== (currentData.total_pages || 0) 
          ? parseInt(formData.total_pages) 
          : undefined,
        genres: JSON.stringify(genresArray) !== JSON.stringify(currentData.genres || []) 
          ? genresArray 
          : undefined,
      };

      // Only save if there are actual changes
      const hasChanges = edit.title !== undefined || edit.author !== undefined || edit.total_pages !== undefined || edit.genres !== undefined;
      
      if (hasChanges) {
        const result = await saveBookEdit(bookId, edit);
        if (!result) {
          throw new Error("Failed to save edit");
        }
        
        toast({
          title: "Changes saved",
          description: "Your book details have been updated.",
        });
      }

      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Book Details</DialogTitle>
          <DialogDescription>
            Update your book's information
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-primary/30 bg-primary/5">
          <Users className="h-4 w-4 text-primary" />
          <AlertDescription className="text-xs">
            Your changes will be saved directly to your book record and will be reflected immediately in your library.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Book title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="Author name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pages">Total Pages</Label>
            <Input
              id="pages"
              type="number"
              value={formData.total_pages}
              onChange={(e) => setFormData({ ...formData, total_pages: e.target.value })}
              placeholder="Number of pages"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genres">Genres (comma-separated)</Label>
            <Input
              id="genres"
              value={formData.genres}
              onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
              placeholder="Fiction, Mystery, Thriller"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
