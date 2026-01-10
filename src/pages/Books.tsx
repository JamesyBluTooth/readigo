import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AddBookForm } from "@/components/books/AddBookForm";
import { BookCard } from "@/components/books/BookCard";
import { BookMarked } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReadingOverview } from "@/components/books/ReadingOverview";

interface Book {
  id: string;
  isbn?: string;
  title: string;
  author?: string;
  cover_url?: string;
  current_page: number;
  total_pages: number;
  is_completed: boolean;
  updated_at?: string;
}

type Filter = "all" | "in-progress" | "finished";

export const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  const navigate = useNavigate();

  const totalBooks = books.length;

  const finishedBooks = books.filter((b) => b.is_completed).length;

  const inProgressBooks = books.filter(
    (b) => !b.is_completed && b.current_page > 0
  ).length;

  const mostRecentlyRead = [...books]
    .filter((b) => b.current_page > 0 && b.updated_at)
    .sort(
      (a, b) =>
        new Date(b.updated_at!).getTime() -
        new Date(a.updated_at!).getTime()
    )[0];

  const filteredBooks = books.filter((book) => {
    if (filter === "all") return true;
    if (filter === "finished") return book.is_completed;
    if (filter === "in-progress")
      return !book.is_completed && book.current_page > 0;
    return true;
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching books:", error);
    } else {
      setBooks(data || []);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* ADD BOOK */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Add a Book</h2>
          <AddBookForm onBookAdded={fetchBooks} />
        </div>

        {/* BOOKS */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">My Books</h2>

          {!loading && books.length > 0 && (
            <ReadingOverview
              total={totalBooks}
              inProgress={inProgressBooks}
              finished={finishedBooks}
              mostRecentTitle={mostRecentlyRead?.title}
            />
          )}

          {/* FILTERS */}
          {!loading && books.length > 0 && (
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="font-semibold">Showing:</span>

              {(["all", "in-progress", "finished"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2 py-1 rounded-md font-semibold transition
                    ${
                      filter === f
                        ? "text-primary bg-primary/10 underline"
                        : "hover:underline"
                    }`}
                >
                  {f === "all"
                    ? "All"
                    : f === "in-progress"
                    ? "In progress"
                    : "Finished"}
                </button>
              ))}
            </div>
          )}

          {/* CONTENT */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading…
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookMarked className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>
                No books yet. Add your first book by entering an ISBN above!
              </p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {filter === "finished" && (
                <p>No finished books yet. Every library starts somewhere.</p>
              )}
              {filter === "in-progress" && (
                <p>
                  Nothing here — for now. When you start a book, it’ll appear
                  here.
                </p>
              )}
              {filter === "all" && (
                <p>This shelf is feeling unusually tidy.</p>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  isbn={book.isbn}
                  title={book.title}
                  author={book.author}
                  coverUrl={book.cover_url}
                  currentPage={book.current_page}
                  totalPages={book.total_pages}
                  isCompleted={book.is_completed}
                  onClick={() => navigate(`/book/${book.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
