import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { toast } from "sonner";

interface AddFriendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  myFriendCode: string;
  onFriendAdded: () => void;
}

interface FoundUser {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  friend_code: string;
}

export const AddFriendModal = ({
  open,
  onOpenChange,
  myFriendCode,
  onFriendAdded,
}: AddFriendModalProps) => {
  const [searchCode, setSearchCode] = useState("");
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);

  const resetState = () => {
    setSearchCode("");
    setFoundUser(null);
  };

  const handleSearch = async () => {
    if (!searchCode || searchCode.length !== 6) {
      toast.error("Please enter a valid 6-character friend code");
      return;
    }

    setSearching(true);
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, friend_code")
        .eq("friend_code", searchCode.toUpperCase())
        .single();

      if (error || !profile) {
        toast.error("Friend code not found");
        setFoundUser(null);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user && profile.user_id === user.id) {
        toast.error("You can’t add yourself, even conceptually");
        setFoundUser(null);
        return;
      }

      setFoundUser(profile);
    } catch {
      toast.error("Failed to search for friend");
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async () => {
    if (!foundUser) return;

    setAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existing } = await supabase
        .from("friendships")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", foundUser.user_id)
        .single();

      if (existing) {
        toast.info("You’re already following this user");
        return;
      }

      const { error } = await supabase.from("friendships").insert({
        follower_id: user.id,
        following_id: foundUser.user_id,
      });

      if (error) throw error;

      toast.success(`Now following ${foundUser.display_name}`);
      resetState();
      onFriendAdded();
      onOpenChange(false);
    } catch {
      toast.error("Failed to add friend");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(open) => {
        if (!open) resetState();
        onOpenChange(open);
      }}
      shouldScaleBackground={false}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add Friend</DrawerTitle>
          <DrawerDescription>
            Enter a friend code to find and follow other readers
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 space-y-6">
          {/* Search */}
          <div className="flex gap-2">
            <Input
              placeholder="ABC123"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="font-mono uppercase"
            />
            <Button onClick={handleSearch} disabled={searching}>
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Found User */}
          {foundUser && (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={foundUser.avatar_url || undefined} />
                  <AvatarFallback>
                    {foundUser.display_name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <h4 className="font-semibold truncate">
                    {foundUser.display_name}
                  </h4>
                  <p className="text-sm text-muted-foreground font-mono">
                    {foundUser.friend_code}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleAddFriend}
                disabled={adding}
                className="w-full"
              >
                {adding ? "Adding…" : "Follow"}
              </Button>
            </div>
          )}
        </div>

        <DrawerFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
