import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { ChevronLeft } from "lucide-react";

interface ViewNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: {
    content: string;
    page?: number;
    duration?: string;
    date?: string;
  };
  bookTitle?: string;
}

export const ViewNoteModal = ({
  open,
  onOpenChange,
  note,
  bookTitle,
}: ViewNoteModalProps) => {
  const handleBackClick = () => {
    onOpenChange(false);
  };

  const formatMetadata = () => {
    const parts = [];
    if (note.page) parts.push(`${note.page} pages`);
    if (note.duration) parts.push(note.duration);
    if (note.date) parts.push(note.date);
    return parts.join(" · ");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] border-2 border-[#e5e7eb] bg-white p-6 rounded-[22px] shadow-[0_10px_0_#e5e7eb]">
        <div className="flex flex-col gap-[1.2rem]">
          {/* Header */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <button
                onClick={handleBackClick}
                className="inline-block text-[0.75rem] font-bold text-[#517efe] no-underline hover:underline active:opacity-60 transition-opacity mb-2"
              >
                ← Back to book
              </button>

              <h2 className="text-[1.2rem] font-semibold m-0 text-[#3c3c3c]">
                Reading note
              </h2>

              {(note.page || note.duration || note.date) && (
                <div className="text-[0.8rem] text-[#6b6b6b] mt-[0.2rem]">
                  {formatMetadata()}
                </div>
              )}
            </div>
          </div>

          {/* Note Content */}
          <div className="text-[0.95rem] leading-[1.6] text-[#444] whitespace-pre-wrap break-words">
            {note.content}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
