import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import type { Tables } from "@/integrations/supabase/types"
import { getStartOfWeek } from "@/lib/date"
import { BookStage } from "./BookStage"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import Loading from "../ui/loading"

type FriendChallengeRow = Tables<"friend_challenges">
type ReadingStatsRow = Tables<"reading_stats">

interface Props {
  userId: string
}

export default function FriendChallenge({ userId }: Props) {
  const [challenge, setChallenge] = useState<FriendChallengeRow | null>(null)
  const [stats, setStats] = useState<ReadingStatsRow[]>([])
  const [loading, setLoading] = useState(true)

  const weekStart = getStartOfWeek()
  const [yourPages, setYourPages] = useState(0)
  const [friendPages, setFriendPages] = useState(0)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const { data: challengeData } = await supabase
          .from("friend_challenges")
          .select("*")
          .eq("week_start", weekStart)
          .or(`user_a.eq.${userId},user_b.eq.${userId}`)
          .maybeSingle()

        if (!challengeData) {
          setChallenge(null)
          setStats([])
          setYourPages(0)
          setFriendPages(0)
          setLoading(false)
          return
        }

        setChallenge(challengeData)

        const { data: statsData } = await supabase
          .from("reading_stats")
          .select("*")
          .eq("week_start", weekStart)
          .in("user_id", [challengeData.user_a, challengeData.user_b])

        const statsList = statsData ?? []
        setStats(statsList)

        // Separate your pages and your friend's pages
        const yourStat = statsList.find(s => s.user_id === userId)
        const friendStat = statsList.find(s => s.user_id !== userId)

        setYourPages(yourStat?.total_pages ?? 0)
        setFriendPages(friendStat?.total_pages ?? 0)

      } catch (err) {
        console.error(err)
        setChallenge(null)
        setStats([])
        setYourPages(0)
        setFriendPages(0)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, weekStart])

  if (loading) return (
    <Card>
      <Loading />
    </Card>
  )

  if (!challenge) return (
    <Card variant="empty">
      <CardHeader>Friend Challenge</CardHeader>
      <CardTitle>No friend challenge for this week</CardTitle>
      <CardContent>Relax and read a good book</CardContent>
    </Card>
  )

  const totalPages = challenge.target_value ?? 100
  const yourPercent = Math.min(100, (yourPages / totalPages) * 100)
  const friendPercent = Math.min(100, (friendPages / totalPages) * 100)

  // Avatar initials
  const leftInitials = userId === challenge.user_a ? "JM" : "AR"
  const rightInitials = userId === challenge.user_b ? "JM" : "AR"

  return (
    <Card>
      <CardHeader>Friend Challenge</CardHeader>

      {/* Book Stage */}
      <BookStage
        totalPages={totalPages}
        currentPage={yourPages}
        leftInitials={leftInitials}
        rightInitials={rightInitials}
      />

      {/* Title */}
      <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>
        Read {totalPages} pages together
      </div>

      {/* Progress */}
      <div style={{ height: "14px", borderRadius: "999px", background: "#e5e7eb", overflow: "hidden", marginBottom: "8px" }}>
        <div style={{
          height: "100%",
          width: `${yourPercent}%`,
          background: "linear-gradient(90deg, #517efe, #4971e5)",
          transition: "width 0.4s ease"
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#6b6b6b", marginBottom: "16px" }}>
        <span>{yourPages} / {totalPages} pages</span>
        <span>This week</span>
      </div>

      {/* Participants */}
      <div style={{ display: "grid", gap: "8px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#517efe" }} /> You
          </div>
          <span>{yourPages} pages</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#517efe" }} /> Friend
          </div>
          <span>{friendPages} pages</span>
        </div>
      </div>
    </Card>
  )
}
