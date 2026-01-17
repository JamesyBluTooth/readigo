import { format, isToday, isYesterday } from "date-fns";
import { useState } from "react";
import { ViewNoteModal } from "./ViewNoteModal";

interface TimelineEntry {
  id: string;
  type: "progress" | "note" | "completion" | "incomplete";
  created_at: string;
  pages_read?: number;
  time_spent_minutes?: number;
  content?: string;
}

interface TimelineItemProps {
  entry: TimelineEntry;
}

export const TimelineItem = ({ entry }: TimelineItemProps) => {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const date = new Date(entry.created_at);

  const dayLabel = isToday(date)
    ? "Today"
    : isYesterday(date)
    ? "Yesterday"
    : format(date, "dd MMM");

  const timeLabel = format(date, "h:mm a");

  /* ---------- Primary line ---------- */

  let primaryText = "";

  switch (entry.type) {
    case "progress":
      primaryText = `Read ${entry.pages_read} pages`;
      break;
    case "note":
      primaryText = "Note added";
      break;
    case "completion":
      primaryText = "Finished the book";
      break;
    case "incomplete":
      primaryText = "Marked as incomplete";
      break;
  }

  /* ---------- Secondary metadata ---------- */

  const metaBits: string[] = [];
if (entry.time_spent_minutes) {
  metaBits.push(`${entry.time_spent_minutes} minutes`);
}

// Keep track of note separately
const hasNote = Boolean(entry.content);

return (
  <>
    <div className="flex justify-between gap-4 pb-3 border-b border-border last:border-b-0">
      <div className="flex-1">
        <strong className="block text-sm text-foreground">
          {primaryText}
        </strong>

        {(metaBits.length > 0 || hasNote) && (
          <small className="block mt-1 text-xs text-muted-foreground leading-relaxed">
            {metaBits.join(" · ")}
            {hasNote && (
              <>
                {metaBits.length > 0 && " · "}
                <span
                  className="cursor-pointer hover:underline text-primary"
                  onClick={() => setShowNoteModal(true)}
                >
                  Note added
                </span>
              </>
            )}
          </small>
        )}
      </div>

      <div className="text-xs font-semibold text-primary whitespace-nowrap opacity-90">
        {dayLabel} · {timeLabel}
      </div>
    </div>

    {hasNote && entry.content && (
      <ViewNoteModal
        open={showNoteModal}
        onOpenChange={setShowNoteModal}
        note={{
          content: entry.content,
          duration: entry.time_spent_minutes ? `${entry.time_spent_minutes} minutes` : undefined,
          date: dayLabel,
        }}
      />
    )}
  </>
);

};
