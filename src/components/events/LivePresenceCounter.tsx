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
  // Disabled: do not show fake active, reading, or hearing counts
  return null;
}
