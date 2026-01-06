import { format, isToday, isYesterday } from "date-fns";

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

  if (entry.type === "note" || entry.content) {
    metaBits.push("Note added");
  }

  return (
    <div className="flex justify-between gap-4 pb-3 border-b border-border last:border-b-0">
      <div className="flex-1">
        <strong className="block text-sm text-foreground">
          {primaryText}
        </strong>

        {metaBits.length > 0 && (
          <small className="block mt-1 text-xs text-muted-foreground leading-relaxed">
            {metaBits.join(" · ")}
          </small>
        )}
      </div>

      <div className="text-xs font-semibold text-primary whitespace-nowrap opacity-90">
        {dayLabel} · {timeLabel}
      </div>
    </div>
  );
};
