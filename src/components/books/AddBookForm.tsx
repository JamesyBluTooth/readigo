import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Search, AlertTriangle } from "lucide-react";
import { lookupBookByISBN, CanonicalBook } from "@/lib/hybridBookLookup";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookUserEdit } from "@/lib/bookUserEdits";
import { Card } from "../ui/card";

interface AddBookFormProps {
  onBookAdded: () => void;
}

export const AddBookForm = ({ onBookAdded }: AddBookFormProps) => {
  const [isbn, setIsbn] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewBook, setPreviewBook] = useState<CanonicalBook | null>(null);
  const [communityEdit, setCommunityEdit] = useState<BookUserEdit | null>(null);
  const [useCommunityEdit, setUseCommunityEdit] = useState<boolean | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  const isSheetOpen = !!previewBook;


  const handleSearch = async () => {
    if (!isbn.trim()) return;
    
    setLoading(true);
    setPreviewBook(null);
    setCommunityEdit(null);
    setUseCommunityEdit(null);

    try {
      const bookData = await lookupBookByISBN(isbn);
      
      if (!bookData) {
        toast({
          title: "Book not found",
          description: "No book found with that ISBN in Google Books or Open Library. Please check and try again.",
          variant: "destructive",
        });
        return;
      }

      setPreviewBook(bookData);
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


  const handleAddBook = async () => {
    if (!previewBook) return;
    
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Determine which data to use
      const useEdit = useCommunityEdit && communityEdit;
      
      const bookData = {
        user_id: user.id,
        isbn: previewBook.isbn,
        title: useEdit && communityEdit.title ? communityEdit.title : previewBook.title,
        author: useEdit && communityEdit.author ? communityEdit.author : previewBook.authors,
        genres: useEdit && communityEdit.genres ? communityEdit.genres : (previewBook.categories || []),
        cover_url: useEdit && communityEdit.cover_url ? communityEdit.cover_url : previewBook.cover_url,
        total_pages: useEdit && communityEdit.total_pages ? communityEdit.total_pages : previewBook.page_count,
      };

      const { error } = await supabase.from("books").insert(bookData);

      if (error) throw error;

      const hasIncompleteData = previewBook.missing_fields.length > 0 && !useEdit;

      if (hasIncompleteData) {
        toast({
          title: "Book added with incomplete data",
          description: "Some details are missing. You can edit them in the book details to help improve the data.",
        });
      } else {
        toast({
          title: "Book added!",
          description: `${bookData.title} has been added to your collection.`,
        });
      }

      setIsbn("");
      setPreviewBook(null);
      setCommunityEdit(null);
      setUseCommunityEdit(null);
      onBookAdded();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (previewBook) {
      await handleAddBook();
    } else {
      await handleSearch();
    }
  };

  const handleReset = () => {
    setPreviewBook(null);
    setCommunityEdit(null);
    setUseCommunityEdit(null);
    setIsbn("");
  };

  // Determine if user needs to make a choice about community edit
  const needsCommunityEditChoice = communityEdit && useCommunityEdit === null;

  return (
    <Card variant="default">
      <form onSubmit={handleSubmit}>
  
    <Card.Header
    >
      Enter ISBN
    </Card.Header>

    <div className="flex gap-2.5">
      <Input
        id="isbn"
        placeholder="9780141036144"
        inputMode="numeric"
        value={isbn}
        onChange={(e) => {
          setIsbn(e.target.value);
          if (previewBook) {
            setPreviewBook(null);
            setCommunityEdit(null);
            setUseCommunityEdit(null);
          }
        }}
        required
        disabled={loading}
        className="flex-1"
      />

      <Button
        type="submit"
        size="sm"
        variant="primary"
        disabled={loading || needsCommunityEditChoice}
        className="flex items-center gap-1.5"
      >
        <Search className="w-5 h-5" />
        {loading ? "Searching…" : previewBook ? "Search" : "Search"}
      </Button>
    </div>

    <small className="block mt-2 text-xs text-muted-foreground">
      ISBN-10 or ISBN-13
    </small>

</form>

    <Drawer open={isSheetOpen} onOpenChange={(open) => !open && handleReset()}>
      <DrawerContent>
        <DrawerHeader>
          {/* Book preview header */}
          <div className="flex gap-4">
            {previewBook?.cover_url ? (
              <img
                src={previewBook.cover_url}
                alt={previewBook.title}
                className="w-[72px] h-[108px] object-cover rounded-sm bg-muted"
              />
            ) : (
              <div className="w-[72px] h-[108px] rounded-sm bg-muted grid place-items-center text-muted-foreground font-bold">
                ?
              </div>
            )}

            <div className="min-w-0">
              <h2 className="text-lg font-semibold truncate">
                {previewBook?.title || "Unknown title"}
              </h2>
              <p className="text-sm text-muted-foreground truncate">
                {previewBook?.authors || "Unknown author"}
              </p>
              {previewBook?.page_count && (
                <small className="text-xs text-muted-foreground">
                  {previewBook.page_count} pages
                </small>
              )}
            </div>
          </div>
        </DrawerHeader>

        <div className="px-4 space-y-4">

          {/* Warnings / completeness */}
          {!useCommunityEdit && previewBook?.missing_fields.length > 0 && (
            <div className="flex items-start gap-2 text-xs text-amber-600">
              <AlertTriangle className="w-4 h-4 mt-0.5" />
              <span>
                Some details are missing. You can edit them later to improve data quality.
              </span>
            </div>
          )}
        </div>

        <DrawerFooter>
          <Button
            onClick={handleAddBook}
            disabled={loading || needsCommunityEditChoice}
          >
            Add to Library
          </Button>

          <DrawerClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>

    </Card>
  );
};
