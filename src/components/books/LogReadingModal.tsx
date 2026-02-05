import { useEffect, useRef, useState } from "react";
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

/* ======================
   Types
====================== */

interface LogReadingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  currentPage: number;
  totalPages: number;
  onUpdate: () => Promise<void>;
}

/* ======================
   Helpers
====================== */

const formatISO = (d: Date) => d.toISOString().split("T")[0];

const today = () => new Date();

const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
};

/* ======================
   Component
====================== */

export const LogReadingModal = ({
  open,
  onOpenChange,
  bookId,
  currentPage,
  totalPages,
  onUpdate,
}: LogReadingModalProps) => {
  const { toast } = useToast();

  /* ----- flow ----- */
  const [step, setStep] = useState<0 | 1 | 2>(0);

  /* ----- form ----- */
  const [logDate, setLogDate] = useState(new Date());
  const [pageInput, setPageInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [loading, setLoading] = useState(false);

  /* ----- date picker ----- */
  type DatePreset = "today" | "yesterday" | "custom";

const [datePreset, setDatePreset] = useState<DatePreset>("today");


  /* ----- swipe ----- */
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartTime = useRef(0);
  const dragging = useRef(false);

  /* ======================
     Effects
  ====================== */

useEffect(() => {
  if (datePreset === "today") setLogDate(today());
  if (datePreset === "yesterday") setLogDate(yesterday());
}, [datePreset]);


  /* ======================
     Swipe handlers
  ====================== */

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
    dragging.current = true;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current || !trackRef.current) return;

    const diff = e.touches[0].clientX - touchStartX.current;
    const percent =
      (diff / trackRef.current.offsetWidth) * 100 * 0.35;

    trackRef.current.style.transition = "none";
    trackRef.current.style.transform = `translateX(${
      -step * 100 + percent
    }%)`;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!dragging.current) return;

    const diff = e.changedTouches[0].clientX - touchStartX.current;
    const velocity =
      Math.abs(diff) / (Date.now() - touchStartTime.current);

    let nextStep = step;

    if (diff < -80 && velocity > 0.35 && step < 2) {
      nextStep = (step + 1) as any;
    }

    if (diff > 80 && velocity > 0.35 && step > 0) {
      nextStep = (step - 1) as any;
    }

    setStep(nextStep);
    dragging.current = false;
  };

  /* ======================
     Save
  ====================== */

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newPage = parseInt(pageInput, 10);
      const minutes = timeInput ? parseInt(timeInput, 10) : null;

      if (
        isNaN(newPage) ||
        newPage <= currentPage ||
        newPage > totalPages
      ) {
        throw new Error(
          `Enter a page between ${currentPage + 1} and ${totalPages}.`
        );
      }

      if (minutes !== null && minutes <= 0) {
        throw new Error("Time spent must be positive.");
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      await supabase.from("progress_entries").insert({
        book_id: bookId,
        user_id: user.id,
        pages_read: newPage - currentPage,
        time_spent_minutes: minutes,
        notes: notesInput.trim() || null,
        logged_date: formatISO(logDate),
      });

      await supabase
        .from("books")
        .update({ current_page: newPage })
        .eq("id", bookId);

      toast({
        title: "Reading logged",
        description: "Carry on reading 📖",
      });

      await onUpdate();
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

  /* ======================
     JSX
  ====================== */

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[75vh] px-6 pb-6 overflow-hidden">
        <button
          onClick={() =>
            step > 0
              ? setStep((s) => (s - 1) as any)
              : onOpenChange(false)
          }
          className="mb-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>

        <DrawerHeader className="px-0 pt-0 text-left">
          <DrawerTitle>Log reading</DrawerTitle>
        </DrawerHeader>

        {/* Dots */}
        <div className="mb-4 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "h-2 w-2 rounded-full bg-border transition",
                step === i && "scale-125 bg-primary"
              )}
            />
          ))}
        </div>

        {/* Steps */}
        <div className="flex-1 overflow-hidden">
          <div
            ref={trackRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="flex h-full transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]"
            style={{ transform: `translateX(-${step * 100}%)` }}
          >
            {/* STEP 1 */}
            <div className="w-full flex-shrink-0 pr-2 overflow-y-auto">
              <div className="mb-5">
  <Label>Date</Label>

  <div className="mt-1 flex gap-2">
    {(["today", "yesterday", "custom"] as const).map((preset) => (
      <Button
        key={preset}
        type="button"
        variant="secondary"
        className={cn(
          "flex-1",
          datePreset === preset && "border-primary"
        )}
        onClick={() => setDatePreset(preset)}
      >
        {preset === "today"
          ? "Today"
          : preset === "yesterday"
          ? "Yesterday"
          : "Pick date"}
      </Button>
    ))}
  </div>

  {datePreset === "custom" && (
    <Input
      type="date"
      className="mt-2"
      value={formatISO(logDate)}
      onChange={(e) => setLogDate(new Date(e.target.value))}
    />
  )}
</div>


              <Label>Current page</Label>
              <Input
                type="number"
                min={currentPage + 1}
                max={totalPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                required
              />

              <Button
                type="button"
                className="mt-6 w-full"
                onClick={() => setStep(1)}
              >
                Continue
              </Button>
            </div>

            {/* STEP 2 */}
            <div className="w-full flex-shrink-0 pr-2 overflow-y-auto">
              <Label>Minutes read (optional)</Label>
              <Input
                type="number"
                min={1}
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
              />

              <Button
                type="button"
                className="mt-6 w-full"
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>

            {/* STEP 3 */}
            <div className="w-full flex-shrink-0 pr-2 overflow-y-auto">
              <Label>Notes (optional)</Label>
              <Textarea
                rows={4}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
              />

              <Button
                type="submit"
                variant="secondary"
                disabled={loading}
                className="mt-6 w-full"
                onClick={handleSave}
              >
                {loading ? "Saving…" : "Log reading"}
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
