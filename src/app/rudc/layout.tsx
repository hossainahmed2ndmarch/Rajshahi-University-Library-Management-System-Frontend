import React from "react";
import type { Metadata } from "next"; // Imported Metadata type
import { RudcNavbar } from "@/components/rudc/shared/RudcNavbar";
import { RudcFooter } from "@/components/rudc/shared/RudcFooter";
import { IslamicPattern } from "@/components/ruil/shared/IslamicPattern";
import { PortalTracker } from "@/components/shared/PortalTracker";

export const metadata: Metadata = {
  title: "Rajshahi University Dawah Community (RUDC)",
  description:
    "A social, non-political, and service-oriented campus-based Dawah organization at Rajshahi University.",
  icons: {
    icon: "/rudc-favicon.ico", // 👈 Overrides root favicon for all RUDC routes
    // You can also add shortcut or apple icons if needed:
    // shortcut: "/rudc-favicon.ico",
    // apple: "/rudc-apple-icon.png",
  },
};

export default function RudcLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground transition-colors overflow-x-hidden">
      {/* Persist "rudc" as active portal so Dashboard shows RUDC logo */}
      <PortalTracker portal="rudc" />
      {/* Global Background Pattern */}
      <IslamicPattern
        variant="light"
        fixed
        opacity={0.7}
        className="dark:hidden"
      />
      <IslamicPattern
        variant="dark"
        fixed
        opacity={0.7}
        className="hidden dark:block"
      />

      {/* Main Foreground Layout with RudcNavbar & RudcFooter */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <RudcNavbar />
        <main className="flex-1 pt-[104px] lg:pt-[110px]">{children}</main>
        <RudcFooter />
      </div>
    </div>
  );
}