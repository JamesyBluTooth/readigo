import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface ProfileAvatarProps {
  profile: Profile;
  size?: string; // tailwind size override like "h-12 w-12"
}

export function ProfileAvatar({ profile, size }: ProfileAvatarProps) {
  const initials =
    profile.display_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "R";

  return (
    <Avatar className={size}>
      {profile.avatar_url && (
        <AvatarImage
          src={profile.avatar_url}
          alt={`${profile.display_name ?? "User"} avatar`}
        />
      )}
      <AvatarFallback>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
