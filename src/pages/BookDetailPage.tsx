import { useParams, useNavigate } from "react-router-dom";
import { BookDetail } from "@/components/books/BookDetail";
import { Button } from "@/components/ui/button";
import { Books } from "./Books";

export default function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();

  if (!bookId) return null;

  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      {/* Back link – civilised, expected */}
      <div className="max-w-[560px] mx-auto p-4">
        <Button variant="link"
              onClick={() => navigate(`/books`)}
            >
          ← Back to library
        </Button>
      </div>

      <div className="max-w-[560px] mx-auto px-4 pb-16">
        <BookDetail bookId={bookId} />
      </div>
    </div>
  );
}
