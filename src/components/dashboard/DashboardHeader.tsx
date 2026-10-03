"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Bell,
  Crown,
  LogOut,
  Shield,
  User,
  UserCog,
} from "lucide-react";
import { ThemeToggle } from "@/components/ruil/shared/ThemeToggle";
import { useGetMe, useLogout } from "@/hooks/useAuth";
import logo from "../../assets/logo/white-version.png";
import rudcLogo from "../../assets/logo/rudc_logo.jpg";

// Safe SSR-compatible client check
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsClient() {
  return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}

export function DashboardHeader() {
  const pathname = usePathname();
  const isClient = useIsClient();
  const { data: user } = useGetMe();
  const { logout } = useLogout();
  const [notifOpen, setNotifOpen] = useState(false);

  // Clean Portal Detection:
  // 1. Checks if current URL path includes "rudc"
  // 2. Checks if URL query string has ?portal=rudc or ?from=rudc
  // 3. Checks temporary sessionStorage (cleared when tab closes)
  const isRudc = React.useMemo(() => {
    if (pathname?.includes("rudc")) return true;

    if (isClient) {
      const searchParams = new URLSearchParams(window.location.search);
      const portalParam = searchParams.get("portal") || searchParams.get("from");
      if (portalParam === "rudc") return true;

      const sessionPortal = sessionStorage.getItem("active_portal");
      if (sessionPortal === "rudc") return true;
    }

    return false; // Default to RUIL Logo
  }, [pathname, isClient]);

  const notifications = [
    { id: 1, title: "System Ready", time: "Just now", text: "Welcome to RU Islamic Library Management System." },
    { id: 2, title: "Counter Desk", time: "10m ago", text: "Shifter desk active for book checkouts." },
  ];

  const profileHref =
    user?.role === "SHIFTER"
      ? "/dashboard/shifter/profile"
      : user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
      ? "/dashboard/admin/profile"
      : "/dashboard/member/profile";

  // Role icon badge helper
  const getRoleBadge = (role?: string) => {
    if (!role) return null;

    let Icon = User;
    let colorClass = "bg-blue-400/20 text-blue-300 border-blue-400/40";

    switch (role) {
      case "SUPER_ADMIN":
        Icon = Crown;
        colorClass = "bg-amber-400/20 text-amber-300 border-amber-400/40";
        break;
      case "ADMIN":
        Icon = Shield;
        colorClass = "bg-emerald-400/20 text-emerald-300 border-emerald-400/40";
        break;
      case "SHIFTER":
        Icon = UserCog;
        colorClass = "bg-cyan-400/20 text-cyan-300 border-cyan-400/40";
        break;
      case "MEMBER":
      default:
        Icon = User;
        colorClass = "bg-blue-400/20 text-blue-300 border-blue-400/40";
        break;
    }

    return (
      <span
        title={`Role: ${role}`}
        className={`inline-flex items-center justify-center h-6 w-6 rounded-full border ${colorClass} shadow-xs shrink-0`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 w-full items-center justify-between border-b border-border bg-[#003824] lg:bg-card/80 backdrop-blur-md px-4 sm:px-6 text-white lg:text-card-foreground shadow-2xs">
      {/* Left: Mobile Logo + Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Logo */}
        <Link
          href={isRudc ? "/rudc" : "/"}
          className="lg:hidden flex items-center gap-2 shrink-0"
        >
          <Image
            src={isRudc ? rudcLogo : logo}
            alt={isRudc ? "RUDC Logo" : "RUIL Logo"}
            priority
            className="h-8 w-8 rounded-full object-cover"
          />
          <div className="leading-tight">
            <span className="text-[11px] font-black tracking-tight text-white block">
              {isRudc ? "RU Dawah Center" : "RU Islamic Lib"}
            </span>
            <span className="text-[9px] text-amber-300 font-mono block uppercase">
              {isRudc ? "RUDC Portal" : "Portal"}
            </span>
          </div>
        </Link>

        {/* Desktop Title + Role Icon Badge */}
        <div className="hidden lg:flex items-center gap-2.5">
          <h1 className="text-base font-bold text-foreground tracking-tight">
            Dashboard Workspace
          </h1>
          {getRoleBadge(user?.role)}
        </div>

        {/* Mobile Role Icon Badge */}
        <div className="lg:hidden flex items-center">
          {getRoleBadge(user?.role)}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md border border-emerald-700/60 lg:border-input bg-emerald-900/40 lg:bg-background text-emerald-200 lg:text-muted-foreground hover:bg-emerald-800/60 lg:hover:bg-accent lg:hover:text-foreground transition-colors"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-card p-4 shadow-xl text-xs z-50 animate-in fade-in-50">
              <div className="flex items-center justify-between pb-2 border-b border-border mb-2 font-bold text-foreground">
                <span>Notifications</span>
                <span className="text-[10px] text-primary cursor-pointer">Mark read</span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="rounded-lg border border-border/60 bg-muted/40 p-2.5 space-y-1">
                    <div className="flex justify-between font-semibold text-foreground">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-muted-foreground">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Avatar / Info */}
        {user && (
          <div className="flex items-center gap-2 border-l border-emerald-700/50 lg:border-border pl-2 sm:pl-3">
            <Link
              href={profileHref}
              className="hidden md:flex flex-col items-end text-right leading-tight hover:opacity-80 transition-opacity"
              title="Go to My Profile"
            >
              <span className="text-xs font-bold text-foreground block">{user.name}</span>
              <span className="text-[10px] text-muted-foreground block">{user.email}</span>
            </Link>

            <Link href={profileHref} title="My Profile">
              <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-emerald-600/60 lg:border-border shrink-0 bg-[#004F32] flex items-center justify-center text-white text-xs font-bold shadow-xs">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
                )}
              </div>
            </Link>

            <button
              onClick={logout}
              className="hidden lg:flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-destructive hover:bg-destructive/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default DashboardHeader;