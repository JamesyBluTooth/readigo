import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { LogReadingModal } from "./LogReadingModal";
import { CompleteBookModal } from "./CompleteBookModal";
import { EditBookModal } from "./EditBookModal";
import { TimelineItem } from "./TimelineItem";

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
  description?: string;
}

interface TimelineEntry {
  id: string;
  type: "progress";
  created_at: string;
  pages_read?: number;
  time_spent_minutes?: number;
  content?: string;
}

interface ProgressEntry {
  id: string;
  pages_read: number;
  time_spent_minutes: number;
  created_at: string;
  notes?: string;
}

export const BookDetail = ({ bookId, onUpdate }: BookDetailProps) => {
  const [book, setBook] = useState<Book | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [showLogReadingModal, setShowLogReadingModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchBook();
    fetchTimeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, refreshKey]);

  /**
   * AUTO-OPEN COMPLETE MODAL
   * Opens exactly once when the book is finished
   */
  useEffect(() => {
    if (
      book &&
      book.total_pages > 0 &&
      book.current_page >= book.total_pages &&
      !book.is_completed
    ) {
      setShowCompleteModal(true);
    }
  }, [book]);

  const fetchBook = async () => {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .single();

    if (error || !data) return;

    setBook(data);
  };

  const fetchTimeline = async () => {
  const { data: progress } = await supabase
    .from("progress_entries")
    .select("*")
    .eq("book_id", bookId);

  setProgressEntries(progress ?? []);

  const items: TimelineEntry[] = [];

  progress?.forEach((p) => {
    items.push({
      id: p.id,
      type: "progress",
      created_at: p.created_at,
      pages_read: p.pages_read,
      time_spent_minutes: p.time_spent_minutes,
      content: p.notes?.trim() || undefined, // attach note inline
    });
  });

  items.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  setTimeline(items);
};



  if (!book) return null;

  /* =====================
     READING STATS
     ===================== */

  const totalMinutes = progressEntries.reduce(
    (sum, p) => sum + (p.time_spent_minutes || 0),
    0
  );

  const totalPagesRead = progressEntries.reduce(
    (sum, p) => sum + (p.pages_read || 0),
    0
  );

  const sessionCount = progressEntries.length;

  const avgSessionMinutes =
    sessionCount > 0 ? Math.round(totalMinutes / sessionCount) : 0;

  const pagesPerMinute =
    totalMinutes > 0
      ? (totalPagesRead / totalMinutes).toFixed(1)
      : "—";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const totalTimeLabel =
    hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  let estFinishLabel: string = "—";

  if (
    sessionCount > 1 &&
    totalPagesRead > 0 &&
    book.total_pages > book.current_page
  ) {
    const timestamps = progressEntries.map((p) =>
      new Date(p.created_at).getTime()
    );

    const daysActive =
      Math.max(
        1,
        (Math.max(...timestamps) - Math.min(...timestamps)) /
          (1000 * 60 * 60 * 24)
      );

    const sessionsPerDay = Math.min(
      Math.max(sessionCount / daysActive, 0.1),
      5
    );

    const avgPagesPerSession = totalPagesRead / sessionCount;
    const pagesRemaining = book.total_pages - book.current_page;

    const sessionsNeeded = pagesRemaining / avgPagesPerSession;

    const daysRemaining = Math.ceil(
      sessionsNeeded / sessionsPerDay
    );

    estFinishLabel = `${daysRemaining} days`;
  }

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
              Currently reading
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
            setShowLogReadingModal(true);
          }}
        >
          Log Reading
        </Button>

        <hr />

        <div className="flex flex-col gap-6">
          {book.description}
        </div>

        <hr />

        {/* TIMELINE */}
        <div>
          <div className="text-xs font-bold uppercase text-muted-foreground mb-2">
            Recent activity
          </div>

          <div className="flex flex-col gap-4">
            {timeline.map((entry) => (
              <TimelineItem key={entry.id} entry={entry} />
            ))}
          </div>
        </div>

        <hr />

        {/* READING STATS */}
        <div>
          <div className="text-xs font-bold uppercase text-muted-foreground mb-3">
            Reading stats
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>{totalTimeLabel}</strong>
              <span className="block text-xs text-muted-foreground">
                Total time
              </span>
            </div>
            <div>
              <strong>{avgSessionMinutes} min</strong>
              <span className="block text-xs text-muted-foreground">
                Avg session
              </span>
            </div>
            <div>
              <strong>{pagesPerMinute}</strong>
              <span className="block text-xs text-muted-foreground">
                Pages / min
              </span>
            </div>
            <div>
              <strong>{estFinishLabel}</strong>
              <span className="block text-xs text-muted-foreground">
                Est. finish
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <LogReadingModal
        open={showLogReadingModal}
        onOpenChange={setShowLogReadingModal}
        bookId={bookId}
        currentPage={book.current_page}
        totalPages={book.total_pages}
        onUpdate={async () => {
          await fetchBook();
          await fetchTimeline();
          onUpdate?.();
        }}
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
