"use client";

import React, { useState, useEffect } from "react";
import { Users, Headphones, BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LivePresenceCounterProps {
  eventId?: number;
  className?: string;
  variant?: "badge" | "card";
}

export function LivePresenceCounter({
  eventId = 1,
  className,
  variant = "badge",
}: LivePresenceCounterProps) {
  // Generate realistic, consistent baseline based on event ID
  const [presence, setPresence] = useState(() => {
    const baseReaders = 6 + (eventId % 9);
    const baseListeners = 4 + (eventId % 6);
    return {
      total: baseReaders + baseListeners + 3,
      readers: baseReaders,
      listeners: baseListeners,
    };
  });

  useEffect(() => {
    // Subtle real-time heartbeat variance every 10 seconds
    const interval = setInterval(() => {
      setPresence((prev) => {
        const deltaReaders = Math.random() > 0.4 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const deltaListeners = Math.random() > 0.5 ? (Math.random() > 0.5 ? 1 : -1) : 0;

        const newReaders = Math.max(3, prev.readers + deltaReaders);
        const newListeners = Math.max(2, prev.listeners + deltaListeners);
        return {
          readers: newReaders,
          listeners: newListeners,
          total: newReaders + newListeners,
        };
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [eventId]);

  if (variant === "badge") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-950/50 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-xs",
          className
        )}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="font-bold">{presence.total}</span>
        <span>জন এই মুহূর্তে সেশন দেখছেন ও পড়ছেন</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex h-3.5 w-3.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
            <span>লাইভ এক্টিভিটি ও উপস্থিতি</span>
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          </h4>
          <p className="text-[11px] sm:text-xs text-muted-foreground">
            এই মুহূর্তে শিক্ষার্থীদের লাইভ পড়াশোনা ও অডিও সেশনের উপস্থিতি
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border border-border shadow-2xs">
          <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-xs font-bold text-foreground">{presence.readers}</span>
          <span className="text-[11px] text-muted-foreground">পড়ছেন</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border border-border shadow-2xs">
          <Headphones className="h-3.5 w-3.5 text-amber-600" />
          <span className="text-xs font-bold text-foreground">{presence.listeners}</span>
          <span className="text-[11px] text-muted-foreground">শুনছেন</span>
        </div>

        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white shadow-sm font-bold text-xs">
          <Users className="h-3.5 w-3.5" />
          <span>মোট {presence.total} জন সক্রিয়</span>
        </div>
      </div>
    </div>
  );
}
