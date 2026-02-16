import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import type { Tables } from "@/integrations/supabase/types"
import { getStartOfWeek } from "@/lib/date"
import { BookStage } from "./BookStage"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import Loading from "../ui/loading"
import { Timer } from "lucide-react"

type FriendChallengeRow = Tables<"friend_challenges">
type ReadingStatsRow = Tables<"reading_stats">

interface Props {
  userId: string
}

let loading = true;

export default function FriendChallenge({ userId }: Props) {
  const [challenge, setChallenge] = useState<FriendChallengeRow | null>(null)
  const [stats, setStats] = useState<ReadingStatsRow[]>([])
  const [loading, setLoading] = useState(true)

  const weekStart = getStartOfWeek()
  const [currentPage, setCurrentPage] = useState(0)

  const avatarColours = [
    "#517efe", "#dfab14", "#5c9ead", "#c06c84",
    "#6a994e", "#8d6cab", "#e76f51", "#3a86ff"
  ]

  function randomColour() {
    return avatarColours[Math.floor(Math.random() * avatarColours.length)]
  }

  function getTextColour(bg: string) {
    const r = parseInt(bg.substr(1,2),16)
    const g = parseInt(bg.substr(3,2),16)
    const b = parseInt(bg.substr(5,2),16)
    const brightness = (r*299 + g*587 + b*114) / 1000
    return brightness > 160 ? "#222" : "#fff"
  }

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
          setLoading(false)
          return
        }
        setChallenge(challengeData)

        const { data: statsData } = await supabase
          .from("reading_stats")
          .select("*")
          .eq("week_start", weekStart)
          .in("user_id", [challengeData.user_a, challengeData.user_b])

        setStats(statsData ?? [])
        setCurrentPage(statsData?.reduce((sum, s) => sum + (s.total_pages ?? 0), 0) ?? 0)
      } catch (err) {
        console.error(err)
        setChallenge(null)
        setStats([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [userId, weekStart])

  if (loading) return (
    <Card>
      <Loading></Loading>
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
  const percent = Math.min(100, (currentPage / totalPages) * 100)

  // Get participant names & pages
  const userA = stats.find(s => s.user_id === challenge.user_a)
  const userB = stats.find(s => s.user_id === challenge.user_b)
  const userAPages = userA?.total_pages ?? 0
  const userBPages = userB?.total_pages ?? 0

  // Avatar initials
  const avatarLeftInitials = "You" === userId ? "JM" : "??"
  const avatarRightInitials = "You" !== userId ? "AR" : "??"
  const avatarLeftColor = randomColour()
  const avatarRightColor = randomColour()

  return (
    <Card>
      <CardHeader>
        Friend Challenge
        
      </CardHeader>

      {/* Book Stage */}
      <BookStage
  totalPages={totalPages}
  currentPage={currentPage}
  leftInitials={avatarLeftInitials}
  rightInitials={avatarRightInitials}
/>


      {/* Title */}
      <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>
        Read {totalPages} pages together
      </div>

      {/* Progress */}
      <div style={{ height: "14px", borderRadius: "999px", background: "#e5e7eb", overflow: "hidden", marginBottom: "8px" }}>
        <div style={{
          height: "100%",
          width: `${percent}%`,
          background: "linear-gradient(90deg, #517efe, #4971e5)",
          transition: "width 0.4s ease"
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#6b6b6b", marginBottom: "16px" }}>
        <span>{currentPage} / {totalPages} pages</span>
        <span>This week</span>
      </div>

      {/* Participants */}
      <div style={{ display: "grid", gap: "8px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#517efe" }} /> You
          </div>
          <span>{userAPages} pages</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#517efe" }} /> Friend
          </div>
          <span>{userBPages} pages</span>
        </div>
      </div>
    </Card>
  )
}
