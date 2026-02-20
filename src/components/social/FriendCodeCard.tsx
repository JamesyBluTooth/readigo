import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

interface FriendCodeCardProps {
  friendCode: string;
}

export const FriendCodeCard = ({ friendCode }: FriendCodeCardProps) => {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(friendCode);
    toast.success("Friend code copied!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Readigo Friend Code",
          text: `Add me on Readigo! My friend code is ${friendCode}`,
        });
      } catch {
        // User cancelled — perfectly respectable
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card variant="important">
      <Card.Header>Your Friend Code</Card.Header>

      <Card.DisplayBlock>
        <span className="text-lg">{friendCode}</span>

        <div className="flex gap-1">
          <Button
            variant="link"
            size="icon"
            onClick={handleCopy}
            className="text-secondary hover:bg-transparent"
            aria-label="Copy friend code"
          >
            <Copy className="h-4 w-4" />
          </Button>

          <Button
            variant="link"
            size="icon"
            onClick={handleShare}
            className="text-secondary hover:bg-transparent"
            aria-label="Share friend code"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </Card.DisplayBlock>
    </Card>
  );
};
