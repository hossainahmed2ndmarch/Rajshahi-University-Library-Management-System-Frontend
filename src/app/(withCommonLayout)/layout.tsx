import React from "react";
import { Navbar } from "@/components/ruil/shared/Navbar";
import { Footer } from "@/components/ruil/shared/Footer";
import { IslamicPattern } from "@/components/ruil/shared/IslamicPattern";
import { PortalTracker } from "@/components/shared/PortalTracker";

export default function CommonLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground transition-colors overflow-x-hidden">
      {/* Persist "ruil" as active portal so Dashboard shows RUIL logo */}
      <PortalTracker portal="ruil" />
      {/* Global Background Pattern for all CommonLayout pages */}
      <IslamicPattern
        variant="light"
        fixed
        opacity={0.85}
        className="dark:hidden"
      />
      <IslamicPattern
        variant="dark"
        fixed
        opacity={0.85}
        className="hidden dark:block"
      />

      {/* Main Foreground Layout */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}