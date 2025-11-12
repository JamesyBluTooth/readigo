import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface Friend {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
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

      // Get all friendships
      const { data: friendships, error: friendshipsError } = await supabase
        .from("friendships")
        .select("following_id")
        .eq("follower_id", user.id);

      if (friendshipsError) throw friendshipsError;

      if (!friendships || friendships.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      // Get profiles for all friends
      const followingIds = friendships.map(f => f.following_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, friend_code")
        .in("user_id", followingIds);

      if (profilesError) throw profilesError;

      // Get current reading info for each friend
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
            avatar_url: profile.avatar_url,
            friend_code: profile.friend_code,
            current_book_title: currentBook?.title || null,
            current_book_progress: progress
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
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No friends yet. Add some using their friend codes!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {friends.map((friend) => (
        <Card
          key={friend.user_id}
          className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
          onClick={() => onFriendClick(friend.user_id)}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={friend.avatar_url || undefined} />
                <AvatarFallback className="text-lg">
                  {friend.display_name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {friend.current_book_progress > 0 && (
                <svg className="absolute inset-0 w-20 h-20 -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="38"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-muted"
                    opacity="0.2"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="38"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-primary"
                    strokeDasharray={`${2 * Math.PI * 38}`}
                    strokeDashoffset={`${2 * Math.PI * 38 * (1 - friend.current_book_progress / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
            <div className="text-center w-full">
              <h3 className="font-semibold text-foreground truncate">
                {friend.display_name}
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                {friend.friend_code}
              </p>
              {friend.current_book_title ? (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  Reading: {friend.current_book_title}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  No current book
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
