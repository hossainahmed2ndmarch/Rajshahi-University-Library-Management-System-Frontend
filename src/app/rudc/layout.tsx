import React from "react";
import { RudcNavbar } from "@/components/rudc/RudcNavbar";
import { RudcFooter } from "@/components/rudc/RudcFooter";
import { IslamicPattern } from "@/components/shared/IslamicPattern";

export const metadata = {
  title: "Rajshahi University Dawah Community (RUDC)",
  description:
    "A social, non-political, and service-oriented campus-based Dawah organization at Rajshahi University.",
};

export default function RudcLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground transition-colors overflow-x-hidden">
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
