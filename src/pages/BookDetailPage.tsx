import { useParams, useNavigate } from "react-router-dom";
import { BookDetail } from "@/components/books/BookDetail";
import { Button } from "@/components/ui/button";

export default function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();

  if (!bookId) return null;

  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      {/* Back link – civilised, expected */}
      <div className="max-w-[560px] mx-auto p-4">
        <button
              onClick={() => navigate(-1)}
              className="mt-1 text-sm font-semibold text-primary hover:underline"
            >
          ← Back to library
        </button>
      </div>

      <div className="max-w-[560px] mx-auto px-4 pb-16">
        <BookDetail bookId={bookId} />
      </div>
    </div>
  );
}
