"use client";

import { useEffect } from "react";

/** Marks the lesson as started and accumulates time-on-lesson while the tab is visible (30 s heartbeats). */
export function LessonTracker({ lessonId }: { lessonId: string }) {
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/lessons/${lessonId}/start`, { method: "POST" }).catch(() => {});
    const beat = setInterval(() => {
      if (cancelled || document.visibilityState !== "visible") return;
      fetch(`/api/lessons/${lessonId}/time`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seconds: 30 }),
        keepalive: true,
      }).catch(() => {});
    }, 30_000);
    return () => {
      cancelled = true;
      clearInterval(beat);
    };
  }, [lessonId]);
  return null;
}
