import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    description?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export const EditBookModal = ({
  bookId,
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
    description: currentData.description || "",
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setFormData({
        title: currentData.title,
        author: currentData.author || "",
        total_pages: currentData.total_pages?.toString() || "",
        genres: currentData.genres?.join(", ") || "",
        description: currentData.description || "",
      });
    }
  }, [open, currentData]);

  const handleSave = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const genresArray = formData.genres
        .split(",")
        .map(g => g.trim())
        .filter(Boolean);

      const edit: BookEdit = {
        title: formData.title !== currentData.title ? formData.title : undefined,
        author: formData.author !== (currentData.author || "") ? formData.author : undefined,
        total_pages:
          formData.total_pages &&
          parseInt(formData.total_pages) !== (currentData.total_pages || 0)
            ? parseInt(formData.total_pages)
            : undefined,
        genres:
          JSON.stringify(genresArray) !== JSON.stringify(currentData.genres || [])
            ? genresArray
            : undefined,

        description:
          formData.description !== (currentData.description || "")
            ? formData.description
            : undefined,
      };

      const hasChanges = Object.values(edit).some(v => v !== undefined);

      if (hasChanges) {
        const result = await saveBookEdit(bookId, edit);
        if (!result) throw new Error("Failed to save edit");

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

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this book?");
    if (!confirmed) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId);

      if (error) throw error;

      toast({ title: 'Book deleted successfully!', description: 'The book has been removed from your library.' });
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Error deleting book', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="rounded-t-[22px] border-2 border-border border-b-0">

        {/* HEADER */}
        <DrawerHeader className="text-left px-6 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DrawerTitle>Edit book details</DrawerTitle>
              <DrawerDescription>
                These changes apply only to your library.
              </DrawerDescription>
            </div>

            <DrawerClose asChild>
              <button
                aria-label="Close"
                className="text-xl text-muted-foreground hover:text-foreground"
              >
                &times;
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* FORM */}
        <div className="space-y-4 px-6 py-4">
          <div className="flex flex-col gap-1">
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Author</Label>
            <Input
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Total Pages</Label>
            <Input
              type="number"
              value={formData.total_pages}
              onChange={(e) =>
                setFormData({ ...formData, total_pages: e.target.value })
              }
              min="0"
            />
          </div>

          {/* Hardcoded fields from HTML */}
          <div className="flex flex-col gap-1">
            <Label>Description</Label>
            <textarea
              className="min-h-[90px] rounded-[14px] border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="flex gap-4 items-center">
            <div className="h-[120px] w-[80px] rounded-[14px] bg-muted flex items-center justify-center font-bold text-muted-foreground">
              {formData.title.slice(0, 4)}
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <Label>Cover image URL</Label>
              <Input placeholder="https://…" />
            </div>
          </div>
        </div>

        <hr className="mx-6 border-border" />

        {/* ACTIONS */}
        <DrawerFooter className="px-6">
          <div className="flex gap-3">
            <DrawerClose asChild>
              <Button variant="secondary" className="flex-1" disabled={loading}>
                Discard
              </Button>
            </DrawerClose>

            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving…" : "Save changes"}
            </Button>
          </div>

          {/* DANGER ZONE — hardcoded */}
          <div className="mt-4 rounded-[16px] border border-red-200 bg-red-50 p-4">
            <h3 className="text-sm font-semibold text-red-600">
              Remove book
            </h3>
            <p className="text-xs text-red-700 mt-1">
              This also removes its progress and notes. No going back.
            </p>
            <Button
              className="mt-3 w-full"
              variant="destructive"
              onClick={handleDelete}
            >
              Remove from library
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
