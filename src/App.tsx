import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { supabase } from "@/integrations/supabase/client";
import Loading from "@/components/ui/loading";

import Index from "./pages/Index";
import AvatarCustomization from "./pages/AvatarCustomization";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import BookDetailPage from "./pages/BookDetailPage";
import { Dashboard } from "./pages/Dashboard";
import { Books } from "./pages/Books";
import Profile from "./pages/Profile";
import { Social } from "./pages/Social";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any | undefined>(undefined);

  // -----------------------------------
  // Global Auth Boot Gate
  // -----------------------------------
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // -----------------------------------
  // Full-Screen Boot Loader
  // -----------------------------------
  if (session === undefined) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loading />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index session={session} />}>
              <Route index element={<Navigate to="/books" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="books" element={<Books />} />
              <Route path="social" element={<Social />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="book/:bookId" element={<BookDetailPage />} />
            </Route>

            <Route path="/customize-avatar" element={<AvatarCustomization />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Analytics />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
