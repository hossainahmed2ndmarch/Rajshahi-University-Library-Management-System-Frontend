"use client";

import { useEffect } from "react";

/**
 * PortalTracker — a tiny client component that persists which portal
 * the user is currently browsing (RUDC or RUIL) to localStorage &
 * sessionStorage so the Dashboard sidebar/header can show the correct logo.
 *
 * Mount this in the respective layout:
 *   - <PortalTracker portal="rudc" /> in RUDC layout
 *   - <PortalTracker portal="ruil" /> in RUIL layout
 */
export function PortalTracker({ portal }: { portal: "rudc" | "ruil" }) {
  useEffect(() => {
    try {
      localStorage.setItem("active_portal", portal);
      sessionStorage.setItem("active_portal", portal);
    } catch {
      // Ignore storage errors (private browsing / quota exceeded)
    }
  }, [portal]);

  return null; // Renders nothing — purely a side-effect component
}
