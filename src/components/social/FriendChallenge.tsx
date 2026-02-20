import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import type { Tables } from "@/integrations/supabase/types"
import { getStartOfWeek } from "@/lib/date"
import { BookStage } from "./BookStage"
import { Card } from "../ui/card"
import Loading from "../ui/loading"
import { Timer } from "lucide-react"
import { cn } from "@/lib/utils"


type FriendChallengeRow = Tables<"friend_challenges">
type ReadingStatsRow = Tables<"reading_stats">

interface Props {
  userId: string
}

export default function FriendChallenge({ userId }: Props) {
  const weekStart = getStartOfWeek()

  const [challenge, setChallenge] = useState<FriendChallengeRow | null>(null)
  const [loading, setLoading] = useState(true)

  const [yourPages, setYourPages] = useState(0)
  const [friendPages, setFriendPages] = useState(0)

  const [yourProfile, setYourProfile] = useState<Tables<"profiles"> | null>(null)
  const [friendProfile, setFriendProfile] = useState<Tables<"profiles"> | null>(null)

  const [timeLeft, setTimeLeft] = useState<{ value: number; unit: "days" | "hours" }>({
    value: 0,
    unit: "days",
  })

  const completionKey = `friend_challenge_completed_seen_${weekStart}`
  const [hasSeenCompletion, setHasSeenCompletion] = useState(false)
  const [shouldAnimateCompletion, setShouldAnimateCompletion] = useState(false)

  /* =========================
     Countdown
  ========================== */
  useEffect(() => {
    const deadline = new Date(weekStart)
    deadline.setDate(deadline.getDate() + 7)

    function updateCountdown() {
      const now = new Date()
      const diff = deadline.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft({ value: 0, unit: "days" })
        return
      }

      const totalHours = diff / (1000 * 60 * 60)
      const totalDays = totalHours / 24

      if (totalHours < 24) {
        setTimeLeft({
          value: Math.ceil(totalHours),
          unit: "hours",
        })
      } else {
        setTimeLeft({
          value: Math.ceil(totalDays),
          unit: "days",
        })
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [weekStart])

  /* =========================
     Fetch Data
  ========================== */
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
          setYourPages(0)
          setFriendPages(0)
          setLoading(false)
          return
        }

        setChallenge(challengeData)

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", [challengeData.user_a, challengeData.user_b])

        const profiles = profileData ?? []
        const yourProfile = profiles.find(p => p.user_id === userId)
        const friendProfile = profiles.find(p => p.user_id !== userId)

        setYourProfile(yourProfile ?? null)
        setFriendProfile(friendProfile ?? null)

        const { data: statsData } = await supabase
          .from("reading_stats")
          .select("*")
          .eq("week_start", weekStart)
          .in("user_id", [challengeData.user_a, challengeData.user_b])

        const statsList = statsData ?? []

        const yourStat = statsList.find(s => s.user_id === userId)
        const friendStat = statsList.find(s => s.user_id !== userId)

        setYourPages(yourStat?.total_pages ?? 0)
        setFriendPages(friendStat?.total_pages ?? 0)

      } catch (err) {
        console.error(err)
        setChallenge(null)
        setYourPages(0)
        setFriendPages(0)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, weekStart])

 /* =========================
   Derived Values
========================== */
const totalPages = challenge?.target_value ?? 100

const rawProgressPages = yourPages + friendPages
const isCompleted = rawProgressPages >= totalPages

// Freeze values once completed
const progressPages = isCompleted ? totalPages : rawProgressPages

const adjustedYourPages = isCompleted
  ? Math.min(yourPages, totalPages)
  : yourPages

const adjustedFriendPages = isCompleted
  ? Math.min(friendPages, totalPages - adjustedYourPages)
  : friendPages

const yourPercent = Math.min(100, (adjustedYourPages / totalPages) * 100)
const friendPercent = Math.min(100, (adjustedFriendPages / totalPages) * 100)
const progressPercent = yourPercent + friendPercent

  /* =========================
     Completion Logic
  ========================== */
  useEffect(() => {
    if (!isCompleted) {
      setHasSeenCompletion(false)
      setShouldAnimateCompletion(false)
      return
    }

    const seen = localStorage.getItem(completionKey)

    if (!seen) {
      setShouldAnimateCompletion(true)
      localStorage.setItem(completionKey, "true")
    } else {
      setHasSeenCompletion(true)
    }
  }, [isCompleted, completionKey])

  useEffect(() => {
    if (!shouldAnimateCompletion) return

    const timeout = setTimeout(() => {
      setShouldAnimateCompletion(false)
      setHasSeenCompletion(true)
    }, 600)

    return () => clearTimeout(timeout)
  }, [shouldAnimateCompletion])

  const showCompletedStyle =
    isCompleted && (hasSeenCompletion || shouldAnimateCompletion)

  /* =========================
     Render States
  ========================== */
  if (loading) {
    return (
      <Card>
        <Loading />
      </Card>
    )
  }

  if (!challenge) {
    return (
      <Card variant="empty">
        <Card.Header>
          <Card.Title>Friend Challenge</Card.Title>
        </Card.Header>
        <Card.Content>No friend challenge for this week</Card.Content>
      </Card>
    )
  }

  const friendDisplayName =
    friendProfile?.display_name?.trim() || "Friend"

  /* =========================
     Render
  ========================== */
  return (
    <Card
  className={cn(
    "transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]",
    showCompletedStyle &&
      "border-2 opacity-90"
  )}
>
  <div
    className={cn(
      "pointer-events-none absolute inset-0 bg-secondary/10 opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]",
      showCompletedStyle && "opacity-100"
    )}
  />
      <Card.Header
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
       Friend Challenge

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "14px",
            color: "#6b7280",
            fontWeight: 700,
          }}
        >
          <Timer size={24} />
          {timeLeft.value === 0
            ? "Ends soon"
            : timeLeft.unit === "days"
            ? `${timeLeft.value}D`
            : `${timeLeft.value}h`}
        </div>
      </Card.Header>

      <BookStage
        totalPages={totalPages}
        currentPage={progressPages}
        leftProfile={yourProfile}
        rightProfile={friendProfile}
      />

      <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>
        Read {totalPages} pages together
      </div>

      <div
        style={{
          height: "14px",
          borderRadius: "999px",
          background: "#e5e7eb",
          overflow: "hidden",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPercent}%`,
            background: "linear-gradient(90deg, #517efe, #4971e5)",
            transition: "width 0.4s ease",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "14px",
          color: "#6b6b6b",
          marginBottom: "16px",
        }}
      >
        <span>{progressPages} / {totalPages} pages</span>
        <span>This week</span>
      </div>

      <div style={{ display: "grid", gap: "8px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
          <span>You</span>
          <span>{adjustedYourPages} pages</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
          <span>{friendDisplayName}</span>
          <span>{adjustedFriendPages} pages</span>
        </div>
      </div>
      
    </Card>
  )
}