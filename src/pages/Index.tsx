import { useEffect, useState } from "react";
import { AuthPage } from "@/components/auth/AuthPage";
import { Sidebar } from "@/components/Sidebar";
import { RightPanel } from "@/components/RightPanel";
import { MobileNav } from "@/components/MobileNav";
import { FriendFeed } from "@/components/social/FriendFeed";
import { Outlet, useLocation } from "react-router-dom";
import { HomePage } from "@/pages/Home";
import { supabase } from "@/integrations/supabase/client";

interface IndexProps {
  session: any | null;
}

const Index = ({ session }: IndexProps) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const location = useLocation();

  // -----------------------------------
  // Profile + Theme logic
  // -----------------------------------
  useEffect(() => {
    if (!session?.user) {
      setShowOnboarding(false);
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed, theme_preference")
          .eq("user_id", session.user.id)
          .single();

        if (!cancelled) {
          setShowOnboarding(!profile?.onboarding_completed);

          if (profile?.theme_preference) {
            applyTheme(profile.theme_preference);
          }
        }
      } catch {
        if (!cancelled) {
          setShowOnboarding(false);
        }
      }
    };

    return () => {
      console.log(import.meta.env.DEV, "Cleaning up Index effect");
      cancelled = true;
    };
  }, [session?.user]);

  // -----------------------------------
  // Theme application logic
  // -----------------------------------
  useEffect(() => {
    const applySystemTheme = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.remove('light', 'dark', 'bookish');
      document.documentElement.classList.add(isDark ? 'dark' : 'light');
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', applySystemTheme);

    return () => mediaQuery.removeEventListener('change', applySystemTheme);
  }, []);

  const applyTheme = (theme: string) => {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('light', 'dark', 'bookish');

      if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.add(isDark ? 'dark' : 'light');
      } else {
        document.documentElement.classList.add(theme);
      }
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // -----------------------------------
  // Auth gate
  // -----------------------------------
  if (!session) {
    const params = new URLSearchParams(location.search);
    const isLoggingIn = params.get("isLoggingIn") === "true";
    const isSigningUp = params.get("isSigningUp") === "true";

    if (isLoggingIn) return <AuthPage initialMode="login" />;
    if (isSigningUp) return <AuthPage initialMode="signup" />;

    return <HomePage />;
  }

  // -----------------------------------
  // Layout
  // -----------------------------------
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar onSignOut={handleSignOut} />

      <main className="flex-1 overflow-y-auto h-screen pb-20 lg:pb-0 relative" id="drawer-boundary">
        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-6xl">
          <Outlet />
        </div>

        {/* Mobile: Show right panel content below main content */}
        <div className="lg:hidden container mx-auto px-4 pb-6 space-y-4">
          <FriendFeed />
        </div>
      </main>

      <RightPanel />

      <MobileNav onSignOut={handleSignOut} />
    </div>
  );
};

export default Index;
