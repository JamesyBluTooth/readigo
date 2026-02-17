import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loading from "../ui/loading";

interface Friend {
  user_id: string;
  display_name: string;
  friend_code: string;
  current_book_title: string | null;
  current_book_progress: number;
}

interface FriendShelfProps {
  onFriendClick: (userId: string) => void;
}

export const FriendShelf = ({ onFriendClick }: FriendShelfProps) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: friendships, error: friendshipsError } = await supabase
        .from("friendships")
        .select("following_id")
        .eq("follower_id", user.id);

      if (friendshipsError) throw friendshipsError;

      if (!friendships || friendships.length === 0) {
        setFriends([]);
        return;
      }

      const followingIds = friendships.map(f => f.following_id);

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, display_name, friend_code")
        .in("user_id", followingIds);

      if (profilesError) throw profilesError;

      const friendsWithBooks = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: currentBook } = await supabase
            .from("books")
            .select("title, current_page, total_pages")
            .eq("user_id", profile.user_id)
            .eq("is_completed", false)
            .order("updated_at", { ascending: false })
            .limit(1)
            .single();

          const progress = currentBook
            ? Math.round((currentBook.current_page / currentBook.total_pages) * 100)
            : 0;

          return {
            user_id: profile.user_id,
            display_name: profile.display_name || "Anonymous",
            friend_code: profile.friend_code,
            current_book_title: currentBook?.title || null,
            current_book_progress: progress,
          };
        })
      );

      setFriends(friendsWithBooks);
    } catch (error) {
      console.error("Error loading friends:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Loading></Loading>
    );
  }

  if (friends.length === 0) {
    return (
      <Card variant="empty">
        <CardHeader>
          Friends
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        Friends
      </CardHeader>


      <div className="flex flex-col">
        {friends.map((friend) => (
          <button
            key={friend.user_id}
            onClick={() => onFriendClick(friend.user_id)}
            className="
              flex items-center justify-between
              py-2
              border-b border-border
              last:border-b-0
              active:translate-y-[1px]
              transition-transform
              text-left
            "
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="font-bold text-sm text-muted-foreground">
                  {friend.display_name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="font-semibold text-sm text-foreground">
                  {friend.display_name}
                </div>

                {friend.current_book_title && (
                  <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                    Reading: {friend.current_book_title}
                  </div>
                )}
              </div>
            </div>

            {friend.current_book_progress > 0 && (
              <div className="text-xs font-semibold text-muted-foreground">
                {friend.current_book_progress}%
              </div>
            )}
          </button>
        ))}
      </div>
    </Card>
  );
};
