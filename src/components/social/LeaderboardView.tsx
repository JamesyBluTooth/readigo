import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, BookOpen, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_minutes: number;
  total_pages: number;
  books_completed: number;
}

export const LeaderboardView = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<{ position: number; stats: LeaderboardEntry } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get start of current week (Monday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      monday.setHours(0, 0, 0, 0);
      const weekStart = monday.toISOString().split('T')[0];

      // Get all friendships
      const { data: friendships } = await supabase
        .from("friendships")
        .select("following_id")
        .eq("follower_id", user.id);

      const friendIds = friendships?.map(f => f.following_id) || [];
      const allUserIds = [...friendIds, user.id];

      // Get or create stats for all users
      const { data: stats, error: statsError } = await supabase
        .from("reading_stats")
        .select("*")
        .in("user_id", allUserIds)
        .eq("week_start", weekStart);

      if (statsError) throw statsError;

      // Create stats for users who don't have them yet
      const existingUserIds = stats?.map(s => s.user_id) || [];
      const missingUserIds = allUserIds.filter(id => !existingUserIds.includes(id));

      if (missingUserIds.length > 0) {
        await Promise.all(
          missingUserIds.map(userId =>
            supabase.from("reading_stats").insert({
              user_id: userId,
              week_start: weekStart,
              total_minutes: 0,
              total_pages: 0,
              books_completed: 0
            })
          )
        );

        // Reload stats
        const { data: updatedStats } = await supabase
          .from("reading_stats")
          .select("*")
          .in("user_id", allUserIds)
          .eq("week_start", weekStart);

        if (updatedStats) {
          stats.push(...updatedStats.filter(s => missingUserIds.includes(s.user_id)));
        }
      }

      // Get profiles for all users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", allUserIds);

      // Combine stats with profiles
      const leaderboardData: LeaderboardEntry[] = (stats || [])
        .map(stat => {
          const profile = profiles?.find(p => p.user_id === stat.user_id);
          return {
            user_id: stat.user_id,
            display_name: profile?.display_name || "Anonymous",
            avatar_url: profile?.avatar_url || null,
            total_minutes: stat.total_minutes,
            total_pages: stat.total_pages,
            books_completed: stat.books_completed
          };
        })
        .sort((a, b) => b.total_minutes - a.total_minutes);

      setLeaderboard(leaderboardData);

      // Find my rank
      const myPosition = leaderboardData.findIndex(entry => entry.user_id === user.id);
      if (myPosition !== -1) {
        setMyRank({
          position: myPosition + 1,
          stats: leaderboardData[myPosition]
        });
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (position: number) => {
    if (position === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (position === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (position === 3) return <Trophy className="w-5 h-5 text-amber-600" />;
    return <span className="text-muted-foreground font-semibold">#{position}</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* My Rank Card */}
      {myRank && (
        <Card className="p-4 bg-primary/5 border-primary">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold">
              {getRankBadge(myRank.position)}
            </div>
            <Avatar className="w-12 h-12">
              <AvatarImage src={myRank.stats.avatar_url || undefined} />
              <AvatarFallback>
                {myRank.stats.display_name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">Your Rank</h3>
              <p className="text-sm text-muted-foreground">
                {myRank.stats.total_minutes} minutes this week
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Leaderboard Tabs */}
      <Tabs defaultValue="time" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="time">
            <Clock className="w-4 h-4 mr-2" />
            Time
          </TabsTrigger>
          <TabsTrigger value="pages">
            <BookOpen className="w-4 h-4 mr-2" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="books">
            <Trophy className="w-4 h-4 mr-2" />
            Books
          </TabsTrigger>
        </TabsList>

        <TabsContent value="time" className="space-y-2">
          {[...leaderboard]
            .sort((a, b) => b.total_minutes - a.total_minutes)
            .map((entry, index) => (
              <Card key={entry.user_id} className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 text-center">
                    {getRankBadge(index + 1)}
                  </div>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={entry.avatar_url || undefined} />
                    <AvatarFallback>
                      {entry.display_name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{entry.display_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.total_minutes} minutes
                    </p>
                  </div>
                </div>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="pages" className="space-y-2">
          {[...leaderboard]
            .sort((a, b) => b.total_pages - a.total_pages)
            .map((entry, index) => (
              <Card key={entry.user_id} className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 text-center">
                    {getRankBadge(index + 1)}
                  </div>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={entry.avatar_url || undefined} />
                    <AvatarFallback>
                      {entry.display_name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{entry.display_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.total_pages} pages
                    </p>
                  </div>
                </div>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="books" className="space-y-2">
          {[...leaderboard]
            .sort((a, b) => b.books_completed - a.books_completed)
            .map((entry, index) => (
              <Card key={entry.user_id} className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 text-center">
                    {getRankBadge(index + 1)}
                  </div>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={entry.avatar_url || undefined} />
                    <AvatarFallback>
                      {entry.display_name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{entry.display_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.books_completed} books
                    </p>
                  </div>
                </div>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
