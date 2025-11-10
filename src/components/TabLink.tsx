import { cn } from "@/lib/utils";

interface TabLinkProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const TabLink = ({ active, onClick, children }: TabLinkProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
};
