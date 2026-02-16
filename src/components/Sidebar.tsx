import { BookMarked, Home, Library, User, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";

interface SidebarProps {
  onSignOut: () => void;
}

export const Sidebar = ({ onSignOut }: SidebarProps) => {
  return (
    <aside className="hidden lg:flex flex-col w-[220px] h-screen bg-card border-r border-border p-4 justify-between overflow-hidden">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center">
          <img src="/favicon.svg" alt="Readigo logo" className="w-32 h-32" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Readigo</h1>
      </div>

      <nav className="flex flex-col gap-1">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          activeClassName="bg-muted text-foreground shadow-sm"
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </NavLink>

        <NavLink
          to="/books"
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          activeClassName="bg-muted text-foreground shadow-sm"
        >
          <Library className="w-5 h-5" />
          <span className="font-medium">Books</span>
        </NavLink>

        <NavLink
          to="/social"
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          activeClassName="bg-muted text-foreground shadow-sm"
        >
          <Users className="w-5 h-5" />
          <span className="font-medium">Friends</span>
        </NavLink>

        <NavLink
          to="/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          activeClassName="bg-muted text-foreground shadow-sm"
        >
          <User className="w-5 h-5" />
          <span className="font-medium">Profile</span>
        </NavLink>
      </nav>

      <button
        onClick={onSignOut}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all mt-4"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Log Out</span>
      </button>
    </aside>
  );
};
