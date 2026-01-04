import { Home, Library, User, Trophy, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";

interface MobileNavProps {
  onSignOut: () => void;
}

export const MobileNav = ({ onSignOut }: MobileNavProps) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border shadow-lg z-50">
      <div className="flex justify-around items-center py-3">
        <NavLink
          to="/dashboard"
          className="flex flex-col items-center gap-1 transition-colors text-muted-foreground"
          activeClassName="text-primary"
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">Home</span>
        </NavLink>

        <NavLink
          to="/books"
          className="flex flex-col items-center gap-1 transition-colors text-muted-foreground"
          activeClassName="text-primary"
        >
          <Library className="w-6 h-6" />
          <span className="text-xs font-medium">Library</span>
        </NavLink>

        <NavLink
          to="/challenge-history"
          className="flex flex-col items-center gap-1 transition-colors text-muted-foreground"
          activeClassName="text-primary"
        >
          <Trophy className="w-6 h-6" />
          <span className="text-xs font-medium">Challenges</span>
        </NavLink>

        <NavLink
          to="/social"
          className="flex flex-col items-center gap-1 transition-colors text-muted-foreground"
          activeClassName="text-primary"
        >
          <Users className="w-6 h-6" />
          <span className="text-xs font-medium">Friends</span>
        </NavLink>

        <NavLink
          to="/profile"
          className="flex flex-col items-center gap-1 transition-colors text-muted-foreground"
          activeClassName="text-primary"
        >
          <User className="w-6 h-6" />
          <span className="text-xs font-medium">Profile</span>
        </NavLink>

        <button
          onClick={onSignOut}
          className="flex flex-col items-center gap-1 transition-colors text-destructive"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-xs font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
};
