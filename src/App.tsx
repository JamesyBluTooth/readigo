import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";
import AvatarCustomization from "./pages/AvatarCustomization";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import BookDetailPage from "./pages/BookDetailPage";
import { Dashboard } from "./pages/Dashboard";
import { Books } from "./pages/Books";
import Profile from "./pages/Profile";
import ChallengeHistory from "./pages/ChallengeHistory";
import { Social } from "./pages/Social";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />}>
            <Route index element={<Navigate to="/books" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="books" element={<Books />} />
            <Route path="challenge-history" element={<ChallengeHistory />} />
            <Route path="social" element={<Social />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />

            <Route path="book/:bookId" element={<BookDetailPage />} />
          </Route>

          <Route path="/customize-avatar" element={<AvatarCustomization />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
