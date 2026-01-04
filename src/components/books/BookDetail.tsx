import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { UpdateProgressModal } from "./UpdateProgressModal";
import { AddNoteModal } from "./AddNoteModal";
import { CompleteBookModal } from "./CompleteBookModal";
import { EditBookModal } from "./EditBookModal";
import { TimelineItem } from "./TimelineItem";
import { getUserEdit, applyUserEdits } from "@/lib/bookUserEdits";

interface BookDetailProps {
  bookId: string;
  onUpdate?: () => void;
}

interface Book {
  id: string;
  isbn?: string;
  title: string;
  author?: string;
  genres: string[];
  cover_url?: string;
  total_pages: number;
  current_page: number;
  is_completed: boolean;
}

interface TimelineEntry {
  id: string;
  type: "progress" | "note";
  created_at: string;
  pages_read?: number;
  time_spent_minutes?: number;
  content?: string;
}

export const BookDetail = ({ bookId, onUpdate }: BookDetailProps) => {
  const [book, setBook] = useState<Book | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchBook();
    fetchTimeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, refreshKey]);

  const fetchBook = async () => {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .single();

    if (error || !data) return;

    if (data.isbn) {
      const { data: auth } = await supabase.auth.getUser();
      if (auth.user) {
        const edit = await getUserEdit(data.isbn, auth.user.id);
        if (edit) {
          setBook(applyUserEdits(data, edit));
          return;
        }
      }
    }

    setBook(data);
  };

  const fetchTimeline = async () => {
    const [progress, notes] = await Promise.all([
      supabase
        .from("progress_entries")
        .select("*")
        .eq("book_id", bookId),
      supabase
        .from("notes")
        .select("*")
        .eq("book_id", bookId),
    ]);

    const items: TimelineEntry[] = [];

    progress.data?.forEach((p) =>
      items.push({
        id: p.id,
        type: "progress",
        created_at: p.created_at,
        pages_read: p.pages_read,
        time_spent_minutes: p.time_spent_minutes,
      })
    );

    notes.data?.forEach((n) =>
      items.push({
        id: n.id,
        type: "note",
        created_at: n.created_at,
        content: n.content,
      })
    );

    items.sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    );

    setTimeline(items);
  };

  if (!book) return null;

  const percent =
    book.total_pages > 0
      ? Math.round((book.current_page / book.total_pages) * 100)
      : 0;

  return (
    <>
      <div className="bg-white border-2 border-border rounded-[22px] p-6 shadow-[0_6px_0_#e5e7eb] flex flex-col gap-6">

        {/* HEADER */}
        <div className="flex gap-5">
          <div className="w-[112px] h-[168px] rounded-[14px] bg-[#e9ecff] flex items-center justify-center text-muted-foreground font-bold">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-full h-full object-cover rounded-[14px]"
              />
            ) : (
              <BookOpen />
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold">{book.title}</h1>
            {book.author && (
              <p className="text-muted-foreground mt-1">
                {book.author}
              </p>
            )}

            <div className="mt-1 text-sm font-semibold text-primary">
              Currently reading · Last read today
            </div>

            <button
              onClick={() => setShowEditModal(true)}
              className="mt-1 text-sm font-semibold text-primary hover:underline"
            >
              Edit book details
            </button>

            {book.total_pages > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>
                    {book.current_page}/{book.total_pages} pages
                  </span>
                  <span>{percent}%</span>
                </div>
                <div className="h-[14px] bg-[#eef1ff] rounded-[14px] overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PRIMARY ACTION */}
        <Button
          className="w-full h-[56px] text-lg font-bold"
          onClick={() => {
            if (!book.total_pages) {
              toast({
                title: "Missing page count",
                description:
                  "Add total pages before logging progress.",
                variant: "destructive",
              });
              return;
            }
            setShowProgressModal(true);
          }}
        >
          Log Reading
        </Button>

        <hr />

        {/* DESCRIPTION (HARDCODED) */}
        <p className="text-sm leading-relaxed text-[#444]">
          A bleak and unsettling vision of a totalitarian future where
          truth is mutable, surveillance is constant, and rebellion
          begins quietly — in thought.
        </p>

        <hr />

        {/* TIMELINE */}
        <div>
          <div className="text-xs font-bold uppercase text-muted-foreground mb-2">
            Recent activity
          </div>

          <ScrollArea className="max-h-[260px] pr-2">
            <div className="flex flex-col gap-4">
              {timeline.map((entry) => (
                <TimelineItem key={entry.id} entry={entry} />
              ))}
            </div>
          </ScrollArea>
        </div>

        <hr />

        {/* READING STATS (HARDCODED) */}
        <div>
          <div className="text-xs font-bold uppercase text-muted-foreground mb-3">
            Reading stats
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>3h 40m</strong>
              <span className="block text-xs text-muted-foreground">
                Total time
              </span>
            </div>
            <div>
              <strong>24 min</strong>
              <span className="block text-xs text-muted-foreground">
                Avg session
              </span>
            </div>
            <div>
              <strong>2.1</strong>
              <span className="block text-xs text-muted-foreground">
                Pages / min
              </span>
            </div>
            <div>
              <strong>4 days</strong>
              <span className="block text-xs text-muted-foreground">
                Est. finish
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <UpdateProgressModal
        open={showProgressModal}
        onOpenChange={setShowProgressModal}
        bookId={bookId}
        currentPage={book.current_page}
        totalPages={book.total_pages}
        onUpdate={() => {
          setRefreshKey((k) => k + 1);
          onUpdate?.();
        }}
      />

      <AddNoteModal
        open={showNoteModal}
        onOpenChange={setShowNoteModal}
        bookId={bookId}
        onUpdate={fetchTimeline}
      />

      <CompleteBookModal
        open={showCompleteModal}
        onOpenChange={setShowCompleteModal}
        bookId={bookId}
        totalPages={book.total_pages}
        onUpdate={() => {
          setRefreshKey((k) => k + 1);
          onUpdate?.();
        }}
      />

      <EditBookModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        bookId={bookId}
        isbn={book.isbn}
        currentData={{
          title: book.title,
          author: book.author,
          total_pages: book.total_pages,
          genres: book.genres,
        }}
        onSave={() => setRefreshKey((k) => k + 1)}
      />
    </>
  );
};
