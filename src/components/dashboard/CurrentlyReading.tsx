import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen } from "lucide-react";

interface CurrentlyReadingProps {
  book?: {
    id: string;
    title: string;
    author?: string;
    cover_url?: string;
    current_page: number;
    total_pages: number;
  };
  onContinue: (bookId: string) => void;
}

export const CurrentlyReading = ({ book, onContinue }: CurrentlyReadingProps) => {
  // No book? Show the “empty state” card.
  if (!book) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Currently Reading
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No books in progress. Start reading a book!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress =
    book.total_pages && book.total_pages > 0
      ? (book.current_page / book.total_pages) * 100
      : 0;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Currently Reading
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-4">
          {book.cover_url && (
            <img
              src={book.cover_url}
              alt={book.title}
              className="w-20 h-28 object-cover rounded-lg shadow-md"
            />
          )}

          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-foreground line-clamp-2">
              {book.title}
            </h3>

            {book.author && (
              <p className="text-sm text-muted-foreground">{book.author}</p>
            )}

            <div className="space-y-1">
              {book.total_pages && book.total_pages > 0 ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {book.current_page} / {book.total_pages} pages
                    </span>
                    <span className="font-medium text-primary">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </>
              ) : (
                <div className="text-sm text-amber-600 dark:text-amber-500">
                  ⚠️ Page count unknown
                </div>
              )}
            </div>
          </div>
        </div>

        <Button onClick={() => onContinue(book.id)} className="w-full">
          Continue Reading
        </Button>
      </CardContent>
    </Card>
  );
};
