import React from "react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="h-4 w-4 rounded-full border-2 border-border bg-muted animate-dot-cycle" />
      <div className="h-4 w-4 rounded-full border-2 border-border bg-muted animate-dot-cycle [animation-delay:0.2s]" />
      <div className="h-4 w-4 rounded-full border-2 border-border bg-muted animate-dot-cycle [animation-delay:0.4s]" />
    </div>
  )
}
