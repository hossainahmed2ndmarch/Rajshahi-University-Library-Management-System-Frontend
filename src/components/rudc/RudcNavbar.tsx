"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import rudcLogo from "@/assets/logo/rudc_logo.webp";
import {
  BookOpen,
  HeartHandshake,
  LogIn,
  LogOut,
  Menu,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  X,
  FileText,
  Calendar,
  Layers,
  Phone,
} from "lucide-react";
import { ThemeToggle } from "../shared/ThemeToggle";
import { LanguageSwitcher } from "../shared/LanguageSwitcher";
import { useGetMe, useLogout } from "@/hooks/useAuth";
import { getDefaultDashboardRoute } from "@/proxy";

export function RudcNavbar() {
  const pathname = usePathname();
  const { data: user } = useGetMe();
  const { logout } = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const dashboardRoute = getDefaultDashboardRoute(user?.role);

  const navLinks = [
    { label: "Home", href: "/rudc" },
    { label: "Activities", href: "/rudc/activities", icon: Layers },
    { label: "Events", href: "/rudc/events", icon: Calendar },
    { label: "Publications", href: "/rudc/publications", icon: FileText },
    { label: "Terms & Conditions", href: "/rudc/terms", icon: UserCheck },
    { label: "Contact", href: "/rudc/contact", icon: Phone },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full transition-colors bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-md border-b border-border/70">
      {/* Tier 1: Main Brand Bar */}
      <div className="border-b border-border/50 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 sm:gap-6">
          {/* Brand Logo & Title */}
          <Link href="/rudc" className="flex items-center space-x-3 shrink-0 group">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-emerald-500/20 bg-white shadow-xs p-0.5">
              <Image
                src={rudcLogo}
                alt="RUDC Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-[#004F32] dark:text-emerald-400 block leading-tight">
                  Rajshahi University Dawah Community
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-[#C78700] dark:text-amber-400 border border-amber-500/20">
                  RUDC
                </span>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground tracking-wide block">
                Social, Non-political & Campus-based Dawah Organization
              </span>
            </div>
          </Link>

          {/* Right Action Controls: Switch to RUIL, Language, Theme, User CTA */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Direct Switcher to RUIL Landing Page */}
            <Link
              href="/"
              className="flex items-center space-x-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[#004F32] dark:text-emerald-300 shadow-xs transition-colors"
              title="Navigate to RU Islamic Library"
            >
              <BookOpen className="h-4 w-4 text-[#C78700] dark:text-amber-400 shrink-0" />
              <span className="hidden sm:inline font-bold">RU Islamic Library</span>
              <span className="sm:hidden font-bold">RUIL</span>
            </Link>

            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <ThemeToggle />

            {/* User Dropdown or Sign In */}
            {user ? (
              <div className="relative pl-1">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 rounded-xl border border-border bg-card hover:bg-muted px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors cursor-pointer"
                >
                  <div className="h-6 w-6 rounded-full overflow-hidden bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[12px] font-bold text-[#004F32] dark:text-emerald-400 shrink-0 border border-[#004F32] dark:border-emerald-400">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name || "User"}
                        className="h-full w-full object-cover"
                      />
                    ) : user.name ? (
                      user.name.charAt(0).toUpperCase()
                    ) : (
                      "U"
                    )}
                  </div>
                  <span className="max-w-[80px] sm:max-w-[100px] truncate hidden sm:inline">
                    {user.name || "Account"}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-card border border-border py-2 shadow-2xl z-50 animate-in fade-in-50 text-foreground">
                    <div className="px-4 py-2 border-b border-border text-xs">
                      <p className="font-bold truncate text-foreground">{user.name}</p>
                      <p className="text-muted-foreground text-[10px] truncate">{user.email}</p>
                    </div>
                    <Link
                      href={dashboardRoute}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2.5 text-xs font-medium hover:bg-muted transition-colors"
                    >
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span>Control Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard/member/rudc"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs font-medium hover:bg-muted transition-colors"
                    >
                      <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>My RUDC Status</span>
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left flex items-center space-x-2 px-4 py-2.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors border-t border-border mt-1 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 text-xs font-semibold border border-border transition-colors"
              >
                <LogIn className="h-3.5 w-3.5 text-[#004F32] dark:text-emerald-400" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Join RUDC Primary CTA Button */}
            <Link
              href="/rudc/join"
              className="hidden md:flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-[#004F32] to-[#016842] hover:from-[#003e27] hover:to-[#004F32] dark:from-emerald-600 dark:to-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all"
            >
              <UserPlus className="h-3.5 w-3.5 text-amber-300" />
              <span>Join RUDC</span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-xl border border-border bg-muted/50 text-foreground lg:hidden hover:bg-muted transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-[#004F32] dark:text-emerald-400" />
              ) : (
                <Menu className="h-5 w-5 text-[#004F32] dark:text-emerald-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tier 2: Category & Page Links */}
      <div className="hidden lg:block px-4 sm:px-6 lg:px-8 py-1.5 bg-emerald-50/40 dark:bg-slate-900/60 border-b border-border/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <nav className="flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "text-[#004F32] dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 font-bold shadow-xs"
                      : "text-muted-foreground hover:text-[#004F32] dark:hover:text-emerald-400 hover:bg-card/70"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/rudc/terms"
              className="text-[11px] font-semibold text-muted-foreground hover:text-[#004F32] dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="h-3.5 w-3.5 text-[#C78700] dark:text-amber-400" />
              <span>Membership Code of Conduct</span>
            </Link>

            <Link
              href="/rudc/join"
              className="flex items-center space-x-1.5 rounded-full bg-[#004F32] dark:bg-emerald-600 hover:bg-[#003d27] dark:hover:bg-emerald-700 px-3.5 py-1 text-xs font-bold text-white shadow-xs transition-colors"
            >
              <HeartHandshake className="h-3.5 w-3.5 text-amber-300" />
              <span>Volunteer Application</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border/70 bg-card px-4 py-3 space-y-1 animate-in fade-in-50 text-foreground">
          {/* Switcher in Mobile Drawer */}
          <div className="pb-2.5 mb-2.5 border-b border-border/60 flex items-center justify-between gap-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-600/30 text-xs font-bold text-[#004F32] dark:text-emerald-400"
            >
              <BookOpen className="h-4 w-4 text-[#C78700]" />
              <span>Switch to RU Islamic Library</span>
            </Link>
            <LanguageSwitcher />
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                pathname === link.href
                  ? "bg-emerald-600 text-white font-bold"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/rudc/join"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center space-x-2 px-3 py-2.5 text-xs font-bold bg-[#004F32] text-white hover:bg-[#003d27] rounded-xl shadow-xs mt-2"
          >
            <UserPlus className="h-4 w-4 text-amber-300" />
            <span>Join RUDC as Volunteer</span>
          </Link>

          {!user && (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center space-x-2 px-3 py-2 text-xs font-semibold text-foreground bg-muted hover:bg-muted/80 rounded-xl border border-border mt-1 transition-colors"
            >
              <LogIn className="h-4 w-4 text-[#004F32] dark:text-emerald-400" />
              <span>Sign In to Account</span>
            </Link>
          )}

          {user && (
            <Link
              href={dashboardRoute}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted rounded-xl"
            >
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Control Dashboard</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
