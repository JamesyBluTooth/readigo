import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, CheckCircle2, Trophy, Star, Flame } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FriendActivity {
  id: string;
  friendName: string;
  type: 'book_completed' | 'challenge_completed' | 'review_left' | 'streak_milestone';
  description: string;
  timestamp: Date;
}

export const FriendFeed = () => {
  // Mock data - can be replaced with real data later
  const activities: FriendActivity[] = [
    {
      id: "1",
      friendName: "Sarah Chen",
      type: "book_completed",
      description: "completed 'The Great Gatsby'",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "2",
      friendName: "Alex Johnson",
      type: "streak_milestone",
      description: "reached a 30-day reading streak!",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      id: "3",
      friendName: "Maria Garcia",
      type: "review_left",
      description: "rated 'To Kill a Mockingbird' 5 stars",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "4",
      friendName: "James Wilson",
      type: "challenge_completed",
      description: "completed today's challenge",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ];

  const getIcon = (type: FriendActivity['type']) => {
    switch (type) {
      case 'book_completed':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'challenge_completed':
        return <Trophy className="w-4 h-4 text-secondary" />;
      case 'review_left':
        return <Star className="w-4 h-4 text-warning" />;
      case 'streak_milestone':
        return <Flame className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Friend Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 animate-slide-up">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{activity.friendName}</span>{" "}
                    <span className="text-muted-foreground">{activity.description}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
