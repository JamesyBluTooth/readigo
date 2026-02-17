import { useEffect, useState } from "react";
import type { Tables } from "@/integrations/supabase/types"
import { ProfileAvatar } from "@/components/profile/profile-avatar"


interface BookStageProps {
  totalPages: number;
  currentPage: number;
  leftProfile: Tables<"profiles"> | null;
  rightProfile: Tables<"profiles"> | null;
}


export const BookStage = ({
  totalPages,
  currentPage: initialPage,
  leftProfile,
  rightProfile,
}: BookStageProps) => {
  const [animatedPage, setAnimatedPage] = useState(0); // start at 0 to animate

  useEffect(() => {

    // Animate each line one by one
    let current = 0;
    const step = () => {
      if (current <= initialPage) {
        setAnimatedPage(current);
        current++;
        requestAnimationFrame(step); // smooth animation frame
      }
    };
    step();
  }, [initialPage]);

  const getVisibleLines = () => {
    const totalLines = 12; // 6 left + 6 right
    if (animatedPage === 0) return 0;
    if (animatedPage >= totalPages) return totalLines;

    const usableLines = totalLines - 1;
    let visible = Math.ceil((animatedPage / totalPages) * usableLines);
    return Math.max(1, visible);
  };

  const visibleLines = getVisibleLines();

  const lineWidths = [
    "w-full","w-[55%]","w-full","w-[75%]","w-[55%]","w-full",
    "w-[75%]","w-[55%]","w-full","w-[75%]","w-[55%]","w-full",
  ];

const renderLines = (startIdx: number) =>
  Array(6)
    .fill(0)
    .map((_, idx) => {
      const lineIndex = startIdx + idx;
      const usableLines = 12 - 1;
      const visibleLines = Math.max(
        1,
        Math.ceil((initialPage / totalPages) * usableLines)
      );
      const isVisible = lineIndex < visibleLines;
      const widthClass = lineWidths[lineIndex];

      return (
        <div
  key={lineIndex}
  className={`h-[8px] rounded ${widthClass} ${
    isVisible ? "animate-appear bg-[#3c3c3c]" : "opacity-[0.15] bg-[#3c3c3c]"
  }`}
  style={{
    animationDelay: isVisible ? `${lineIndex * 0.15}s` : "0s",
    opacity: isVisible ? 0 : 0.15, // start invisible
  }}
/>

      );
    });



  return (
    <div className="relative mb-4 grid h-[140px] place-items-center rounded-[16px] bg-gradient-to-b from-[rgba(81,126,254,0.12)] to-[rgba(81,126,254,0.04)]">
      {/* Left Avatar */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
  {leftProfile && <ProfileAvatar profile={leftProfile} size="180" />}
</div>


      {/* Book */}
      <div className="grid h-[100px] w-[90%] max-w-[150px] grid-cols-[1fr_4px_1fr] rounded-[12px] bg-[#fdfdfb] px-3 py-3 shadow-[0_2px_0_#e5e7eb]">
        <div className="grid auto-rows-min gap-1 pr-1">{renderLines(0)}</div>
        <div className="rounded bg-gradient-to-r from-transparent via-[#e5e7eb] to-transparent" />
        <div className="grid auto-rows-min gap-1 pl-1">{renderLines(6)}</div>
      </div>

      {/* Right Avatar */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
  {rightProfile && <ProfileAvatar profile={rightProfile} size="56" />}
</div>

    </div>
  );
};
