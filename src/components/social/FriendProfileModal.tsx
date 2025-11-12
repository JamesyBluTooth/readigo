import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Star, UserMinus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FriendProfile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  friend_code: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  rating: number | null;
  review: string | null;
  is_completed: boolean;
  current_page: number;
  total_pages: number;
}

interface Mutual {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
}

interface FriendProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  onUnfollow: () => void;
}

export const FriendProfileModal = ({
  open,
  onOpenChange,
  userId,
  onUnfollow
}: FriendProfileModalProps) => {
  const [profile, setProfile] = useState<FriendProfile | null>(null);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [mutuals, setMutuals] = useState<Mutual[]>([]);
  const [loading, setLoading] = useState(true);
  const [unfollowing, setUnfollowing] = useState(false);
  const [readingStreak, setReadingStreak] = useState(0);

  useEffect(() => {
    if (userId && open) {
      loadFriendProfile();
    }
  }, [userId, open]);

  const loadFriendProfile = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Get current reading book
      const { data: currentBookData } = await supabase
        .from("books")
        .select("*")
        .eq("user_id", userId)
        .eq("is_completed", false)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setCurrentBook(currentBookData);

      // Get recent completed books
      const { data: recentBooksData } = await supabase
        .from("books")
        .select("*")
        .eq("user_id", userId)
        .eq("is_completed", true)
        .order("updated_at", { ascending: false })
        .limit(5);

      setRecentBooks(recentBooksData || []);

      // Calculate reading streak (consecutive days with challenges completed)
      const { data: challenges } = await supabase
        .from("daily_challenges")
        .select("challenge_date, is_completed")
        .eq("user_id", userId)
        .order("challenge_date", { ascending: false })
        .limit(30);

      let streak = 0;
      if (challenges) {
        for (const challenge of challenges) {
          if (challenge.is_completed) {
            streak++;
          } else {
            break;
          }
        }
      }
      setReadingStreak(streak);

      // Get mutual friends
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: myFriends } = await supabase
          .from("friendships")
          .select("following_id")
          .eq("follower_id", user.id);

        const { data: theirFriends } = await supabase
          .from("friendships")
          .select("following_id")
          .eq("follower_id", userId);

        if (myFriends && theirFriends) {
          const myFollowingIds = myFriends.map(f => f.following_id);
          const theirFollowingIds = theirFriends.map(f => f.following_id);
          const mutualIds = myFollowingIds.filter(id => theirFollowingIds.includes(id));

          if (mutualIds.length > 0) {
            const { data: mutualProfiles } = await supabase
              .from("profiles")
              .select("user_id, display_name, avatar_url")
              .in("user_id", mutualIds);

            setMutuals(mutualProfiles || []);
          }
        }
      }
    } catch (error) {
      console.error("Error loading friend profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!userId) return;

    setUnfollowing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", userId);

      if (error) throw error;

      toast.success("Unfollowed");
      onUnfollow();
      onOpenChange(false);
    } catch (error) {
      console.error("Error unfollowing:", error);
      toast.error("Failed to unfollow");
    } finally {
      setUnfollowing(false);
    }
  };

  if (!profile || loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Friend Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {profile.display_name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile.display_name}</h2>
              <p className="text-muted-foreground font-mono">{profile.friend_code}</p>
              <div className="flex items-center gap-2 mt-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold">{readingStreak} day streak</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnfollow}
              disabled={unfollowing}
            >
              <UserMinus className="w-4 h-4 mr-2" />
              Unfollow
            </Button>
          </div>

          {/* Currently Reading */}
          {currentBook && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Currently Reading</h3>
              <div className="flex gap-3">
                {currentBook.cover_url && (
                  <img
                    src={currentBook.cover_url}
                    alt={currentBook.title}
                    className="w-16 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{currentBook.title}</h4>
                  <p className="text-sm text-muted-foreground">{currentBook.author}</p>
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground mb-1">
                      {currentBook.current_page} / {currentBook.total_pages} pages
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${(currentBook.current_page / currentBook.total_pages) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Recent Books */}
          {recentBooks.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Recently Finished</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {recentBooks.map((book) => (
                  <div key={book.id} className="flex-shrink-0">
                    {book.cover_url ? (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-24 h-36 object-cover rounded shadow-md"
                      />
                    ) : (
                      <div className="w-24 h-36 bg-muted rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground text-center p-2">
                          {book.title}
                        </span>
                      </div>
                    )}
                    {book.rating && (
                      <div className="flex items-center gap-1 mt-1 justify-center">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        <span className="text-xs">{book.rating}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Latest Review */}
          {recentBooks[0]?.review && (
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Latest Review</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {recentBooks[0].title}
              </p>
              <p className="text-sm line-clamp-3">{recentBooks[0].review}</p>
              {recentBooks[0].rating && (
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < recentBooks[0].rating!
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Mutual Friends */}
          {mutuals.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Mutual Friends ({mutuals.length})</h3>
              <div className="flex gap-2 flex-wrap">
                {mutuals.slice(0, 5).map((mutual) => (
                  <div key={mutual.user_id} className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={mutual.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {mutual.display_name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{mutual.display_name}</span>
                  </div>
                ))}
                {mutuals.length > 5 && (
                  <Badge variant="secondary">+{mutuals.length - 5} more</Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
