import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  suffix?: string;
}

export const StatCard = ({ title, value, icon: Icon, suffix }: StatCardProps) => {
  return (
    <Card className="animate-fade-in hover-scale">
      <Card.Title className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Card.Header>{title}</Card.Header>
            <p className="text-3xl font-bold text-foreground">
              {value}
              {suffix && <span className="text-lg ml-1 text-muted-foreground">{suffix}</span>}
            </p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </Card.Title>
    </Card>
  );
};
