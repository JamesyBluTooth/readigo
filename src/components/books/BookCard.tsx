import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Check, Pencil } from "lucide-react";
import { useState } from "react";
import { EditBookModal } from "./EditBookModal";

interface BookCardProps {
  id: string;
  isbn?: string;
  title: string;
  author?: string;
  coverUrl?: string;
  currentPage: number;
  totalPages: number;
  isCompleted: boolean;
  onClick: () => void;
}

export const BookCard = ({
  id,
  isbn,
  title,
  author,
  coverUrl,
  currentPage,
  totalPages,
  isCompleted,
  onClick,
}: BookCardProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const progress = totalPages && totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  const handleSave = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <Card 
        className="cursor-pointer group overflow-hidden "
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="w-24 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0 shadow-md">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-lg text-foreground line-clamp-2 flex-1">
                  {title}
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleEditClick}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              {author && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                  {author}
                </p>
              )}
            
            <div className="space-y-2">
              {isCompleted ? (
                <Badge className="bg-success text-success-foreground">
                  <Check className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              ) : totalPages === null || totalPages === 0 ? (
                <div className="text-sm text-amber-600 dark:text-amber-500">
                  ⚠️ Page count unknown - <button onClick={handleEditClick} className="underline">add details</button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">
                      {currentPage} / {totalPages} pages
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(progress)}% complete
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <EditBookModal
      bookId={id}
      isbn={isbn}
      currentData={{
        title,
        author,
        total_pages: totalPages,
      }}
      open={showEditModal}
      onOpenChange={setShowEditModal}
      onSave={handleSave}
    />
    </>
  );
};
