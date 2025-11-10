import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock } from "lucide-react";

export const DailyChallenge = () => {
  // Mock data - can be replaced with real data later
  const challenge = {
    title: "Read for 30 minutes today",
    progress: 45, // percentage
    timeLeft: "8 hours left",
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-secondary" />
          Daily Challenge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="font-medium text-foreground">{challenge.title}</p>
          <Progress value={challenge.progress} className="h-2" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{challenge.progress}% complete</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              {challenge.timeLeft}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
