"use client";

import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  Users,
  ShieldAlert,
  Package,
  HeartHandshake,
  BookMarked,
  Receipt,
  History,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Barcode,
  User,
  Newspaper,
  Calendar,
  MoreHorizontal,
  X,
  Globe,
  Layers,
  CalendarDays,
} from "lucide-react";
import { useGetMe, useLogout } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";
import logo from "@/assets/logo/white-version.png";

// Optional: Language store import (Replace with your actual store if available)
// import { useLanguageStore } from "@/store/useLanguageStore";

// ─── Multilingual Nav Labels Config ──────────────────────────────────────────

export type SupportedLang = "en" | "bn" | "ar";

export interface NavTranslation {
  en: string;
  bn: string;
  ar: string;
}

export interface NavItemConfig {
  key: string;
  href: string;
  icon: React.ElementType;
  label: NavTranslation;
}

// Relatable & Concise Multilingual Mapping
export const NAV_TRANSLATIONS: Record<string, NavItemConfig> = {
  // Overviews
  superAdminOverview: {
    key: "superAdminOverview",
    href: "/dashboard/super-admin",
    icon: LayoutDashboard,
    label: { en: "Overview", bn: "ওভারভিউ", ar: "نظرة عامة" },
  },
  adminOverview: {
    key: "adminOverview",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
    label: { en: "Overview", bn: "ওভারভিউ", ar: "نظرة عامة" },
  },
  shifterOverview: {
    key: "shifterOverview",
    href: "/dashboard/shifter/overview",
    icon: LayoutDashboard,
    label: { en: "Overview", bn: "ওভারভিউ", ar: "نظرة عامة" },
  },
  memberOverview: {
    key: "memberOverview",
    href: "/dashboard/member",
    icon: LayoutDashboard,
    label: { en: "Overview", bn: "ওভারভিউ", ar: "نظرة عامة" },
  },

  // Management & Desks
  posDesk: {
    key: "posDesk",
    href: "/dashboard/shifter",
    icon: Barcode,
    label: { en: "POS Desk", bn: "কাউন্টার ডেস্ক", ar: "نقطة البيع" },
  },
  books: {
    key: "books",
    href: "/dashboard/admin/books",
    icon: Package,
    label: { en: "Book Catalog", bn: "বইয়ের ক্যাটালগ", ar: "كتالوج الكتب" },
  },
  shifterBooks: {
    key: "shifterBooks",
    href: "/dashboard/shifter/books",
    icon: Package,
    label: { en: "Book Directory", bn: "বইয়ের ডিরেক্টরি", ar: "دليل الكتب" },
  },
  borrows: {
    key: "borrows",
    href: "/dashboard/admin/borrows",
    icon: BookMarked,
    label: { en: "Circulation", bn: "ইস্যু ও ধার", ar: "الإعارات" },
  },
  shifterBorrows: {
    key: "shifterBorrows",
    href: "/dashboard/shifter/borrows",
    icon: BookMarked,
    label: { en: "Borrow Desk", bn: "ধার মঞ্জুরি", ar: "مكتب الإعارة" },
  },
  donations: {
    key: "donations",
    href: "/dashboard/admin/donations",
    icon: HeartHandshake,
    label: { en: "Donations", bn: "অনুদান অনুমোদন", ar: "التبرعات" },
  },
  shifterDonations: {
    key: "shifterDonations",
    href: "/dashboard/shifter/donations",
    icon: HeartHandshake,
    label: { en: "Donation Desk", bn: "অনুদান শেল্ভিং", ar: "مكتب التبرعات" },
  },
  members: {
    key: "members",
    href: "/dashboard/admin/members",
    icon: Users,
    label: { en: "Members", bn: "সদস্য তালিকা", ar: "الأعضاء" },
  },
  shifterMembers: {
    key: "shifterMembers",
    href: "/dashboard/shifter/members",
    icon: Users,
    label: { en: "Members Directory", bn: "সদস্য ডিরেক্টরি", ar: "دليل الأعضاء" },
  },
  publications: {
    key: "publications",
    href: "/dashboard/admin/publications",
    icon: Newspaper,
    label: { en: "Publications", bn: "প্রকাশনা", ar: "المنشورات" },
  },
  superPublications: {
    key: "superPublications",
    href: "/dashboard/super-admin/publications",
    icon: Newspaper,
    label: { en: "Publications", bn: "প্রকাশনা", ar: "المنشورات" },
  },
  activities: {
    key: "activities",
    href: "/dashboard/admin/activities",
    icon: Layers,
    label: { en: "Activities", bn: "কার্যক্রম", ar: "الأنشطة" },
  },
  superActivities: {
    key: "superActivities",
    href: "/dashboard/super-admin/activities",
    icon: Layers,
    label: { en: "Activities", bn: "কার্যক্রম", ar: "الأنشطة" },
  },
  events: {
    key: "events",
    href: "/dashboard/admin/events",
    icon: CalendarDays,
    label: { en: "Events", bn: "ইভেন্টস", ar: "الفعاليات" },
  },
  superEvents: {
    key: "superEvents",
    href: "/dashboard/super-admin/events",
    icon: CalendarDays,
    label: { en: "Events", bn: "ইভেন্টস", ar: "الفعاليات" },
  },
  userRoles: {
    key: "userRoles",
    href: "/dashboard/super-admin/users",
    icon: ShieldAlert,
    label: { en: "User Roles", bn: "ইউজার রোলস", ar: "صلاحيات المستخدمين" },
  },
  purchases: {
    key: "purchases",
    href: "/dashboard/admin/purchases",
    icon: Receipt,
    label: { en: "Purchases", bn: "ক্রয়সমূহ", ar: "المشتريات" },
  },
  shifterPurchases: {
    key: "shifterPurchases",
    href: "/dashboard/shifter/purchases",
    icon: Receipt,
    label: { en: "Purchases List", bn: "সকল ক্রয়", ar: "قائمة المشتريات" },
  },
  shiftLogs: {
    key: "shiftLogs",
    href: "/dashboard/admin/shift-logs",
    icon: History,
    label: { en: "Shift Logs", bn: "শিফট লগ", ar: "سجل الورديات" },
  },
  superShiftLogs: {
    key: "superShiftLogs",
    href: "/dashboard/super-admin/shift-logs",
    icon: History,
    label: { en: "Shift Audit Logs", bn: "শিফট অডিট লগ", ar: "سجل التدقيق" },
  },
  shifterLogs: {
    key: "shifterLogs",
    href: "/dashboard/shifter/shift-logs",
    icon: History,
    label: { en: "Shift Handover", bn: "শিফট হ্যান্ডওভার", ar: "تسليم الوردية" },
  },
  shifterSchedules: {
    key: "shifterSchedules",
    href: "/dashboard/admin/shifter-schedules",
    icon: Calendar,
    label: { en: "Duty Rosters", bn: "ডিউটি রোস্টার", ar: "جدول الورديات" },
  },
  superSchedules: {
    key: "superSchedules",
    href: "/dashboard/super-admin/shifter-schedules",
    icon: Calendar,
    label: { en: "Duty Rosters", bn: "ডিউটি রোস্টার", ar: "جدول الورديات" },
  },
  reviews: {
    key: "reviews",
    href: "/dashboard/admin/reviews",
    icon: Sparkles,
    label: { en: "Reviews", bn: "রিভিউ মডারেশন", ar: "المراجعات" },
  },

  // Personal Space
  profile: {
    key: "profile",
    href: "/dashboard/member/profile",
    icon: User,
    label: { en: "My Profile", bn: "মাই প্রোফাইল", ar: "ملفي الشخصي" },
  },
  adminProfile: {
    key: "adminProfile",
    href: "/dashboard/admin/profile",
    icon: User,
    label: { en: "My Profile", bn: "মাই প্রোফাইল", ar: "ملفي الشخصي" },
  },
  shifterProfile: {
    key: "shifterProfile",
    href: "/dashboard/shifter/profile",
    icon: User,
    label: { en: "My Profile", bn: "মাই প্রোফাইল", ar: "ملفي الشخصي" },
  },
  myBorrows: {
    key: "myBorrows",
    href: "/dashboard/member/my-borrows",
    icon: BookMarked,
    label: { en: "My Borrows", bn: "আমার বই ধার", ar: "استعاراتي" },
  },
  adminMyBorrows: {
    key: "adminMyBorrows",
    href: "/dashboard/admin/my-borrows",
    icon: BookMarked,
    label: { en: "My Borrows", bn: "আমার বই ধার", ar: "استعاراتي" },
  },
  shifterMyBorrows: {
    key: "shifterMyBorrows",
    href: "/dashboard/shifter/my-borrows",
    icon: BookMarked,
    label: { en: "My Borrows", bn: "আমার বই ধার", ar: "استعاراتي" },
  },
  myPurchases: {
    key: "myPurchases",
    href: "/dashboard/member/purchases",
    icon: Receipt,
    label: { en: "My Purchases", bn: "আমার ক্রয়", ar: "مشترياتي" },
  },
  adminMyPurchases: {
    key: "adminMyPurchases",
    href: "/dashboard/admin/my-purchases",
    icon: Receipt,
    label: { en: "My Purchases", bn: "আমার ক্রয়", ar: "مشترياتي" },
  },
  shifterMyPurchases: {
    key: "shifterMyPurchases",
    href: "/dashboard/shifter/my-purchases",
    icon: Receipt,
    label: { en: "My Purchases", bn: "আমার ক্রয়", ar: "مشترياتي" },
  },
  myDonations: {
    key: "myDonations",
    href: "/dashboard/member/donations",
    icon: HeartHandshake,
    label: { en: "My Donations", bn: "আমার অনুদান", ar: "تبرعاتي" },
  },
  adminMyDonations: {
    key: "adminMyDonations",
    href: "/dashboard/admin/my-donations",
    icon: HeartHandshake,
    label: { en: "My Donations", bn: "আমার অনুদান", ar: "تبرعاتي" },
  },
  shifterMyDonations: {
    key: "shifterMyDonations",
    href: "/dashboard/shifter/my-donations",
    icon: HeartHandshake,
    label: { en: "My Donations", bn: "আমার অনুদান", ar: "تبرعاتي" },
  },
};

// Role-to-Nav-Keys Mapping
const ROLE_NAV_KEYS: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    "superAdminOverview",
    "posDesk",
    "books",
    "borrows",
    "donations",
    "members",
    "superPublications",
    "superActivities",
    "superEvents",
    "userRoles",
    "purchases",
    "superShiftLogs",
    "superSchedules",
    "reviews",
    "adminProfile",
    "adminMyBorrows",
    "adminMyPurchases",
    "adminMyDonations",
  ],
  ADMIN: [
    "adminOverview",
    "posDesk",
    "books",
    "borrows",
    "donations",
    "members",
    "publications",
    "activities",
    "events",
    "purchases",
    "shiftLogs",
    "shifterSchedules",
    "reviews",
    "adminProfile",
    "adminMyBorrows",
    "adminMyPurchases",
    "adminMyDonations",
  ],
  SHIFTER: [
    "shifterOverview",
    "posDesk",
    "shifterBooks",
    "shifterBorrows",
    "shifterDonations",
    "shifterMembers",
    "shifterPurchases",
    "shifterLogs",
    "shifterProfile",
    "shifterMyBorrows",
    "shifterMyPurchases",
    "shifterMyDonations",
  ],
  MEMBER: ["memberOverview", "profile", "myBorrows", "myPurchases", "myDonations"],
};

const BOTTOM_NAV_VISIBLE = 4;

// ─── PC Responsive Sidebar Component ─────────────────────────────────────────

export function Sidebar({
  collapsed,
  setCollapsed,
  lang = "en",
}: {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  lang?: SupportedLang;
}) {
  const pathname = usePathname();
  const { data: user } = useGetMe();
  const { logout } = useLogout();

  const userRole: UserRole = user?.role || "MEMBER";
  const navKeys = ROLE_NAV_KEYS[userRole] || ROLE_NAV_KEYS.MEMBER;

  const isRtl = lang === "ar";

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen sticky top-0 z-40 border-r border-emerald-900/40 bg-[#003824] text-white transition-all duration-300 ease-in-out select-none ${
        collapsed ? "w-20" : "w-64"
      }`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* 1. Header & Brand Logo */}
      <div className="flex h-16 items-center justify-between px-2 border-b border-emerald-900/60 shrink-0">
        <Link href="/" className="flex items-center space-x-2 shrink-0 group">
          <div className="flex h-11 w-11 items-center justify-center">
            <Image
              src={logo}
              alt="RUIL Logo"
              priority
              className="h-10 w-10 object-contain"
            />
          </div>
          {!collapsed && (
            <div className="truncate">
              <span className="font-bold text-sm tracking-tight text-white block">
                RU Islamic Lib
              </span>
              <span className="text-[10px] text-amber-300 font-mono block uppercase">
                Portal
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-0.5 text-emerald-200/80 hover:bg-emerald-800/80 hover:text-white transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label="Toggle Sidebar"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* 2. Logged-in User Role Badge */}
      {!collapsed && (
        <div className="px-4 py-2.5 border-b border-emerald-900/40 bg-emerald-950/40 shrink-0">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] text-emerald-200 font-medium">
              Logged in as:
            </span>
          </div>
          <p className="text-xs font-bold text-amber-300 uppercase tracking-widest mt-0.5 font-mono">
            {userRole}
          </p>
        </div>
      )}

      {/* 3. Navigation List (Scrollable Container with Custom Styling) */}
      <div
        className="flex-1 space-y-1 p-3 overflow-y-auto overflow-x-hidden 
        [scrollbar-width:thin] [scrollbar-color:#065f46_transparent]
        [&::-webkit-scrollbar]:w-1.5 
        [&::-webkit-scrollbar-track]:bg-transparent 
        [&::-webkit-scrollbar-thumb]:bg-emerald-800/60 
        [&::-webkit-scrollbar-thumb]:rounded-full 
        hover:[&::-webkit-scrollbar-thumb]:bg-emerald-600"
      >
        {navKeys.map((key) => {
          const item = NAV_TRANSLATIONS[key];
          if (!item) return null;

          const labelText = item.label[lang] || item.label.en;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <div key={item.key} className="relative group">
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 relative ${
                  isActive
                    ? "bg-[#C78700] text-white shadow-md shadow-amber-950/20"
                    : "text-emerald-100/80 hover:bg-emerald-900/60 hover:text-white"
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-md bg-amber-200" />
                )}

                <item.icon className="h-4 w-4 shrink-0" />

                {!collapsed && (
                  <span className="truncate leading-none">{labelText}</span>
                )}
              </Link>

              {/* Responsive Floating Tooltip for Desktop Collapsed State */}
              {collapsed && (
                <div
                  className={`absolute top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-md bg-emerald-950 text-amber-300 px-2.5 py-1.5 text-xs font-medium shadow-xl whitespace-nowrap border border-emerald-800/80 ${
                    isRtl ? "right-full mr-2" : "left-full ml-2"
                  }`}
                >
                  {labelText}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Sidebar Footer Links */}
      <div className="p-3 border-t border-emerald-900/60 space-y-1 shrink-0 bg-emerald-950/20">
        {/* Public Catalog Link */}
        <div className="relative group">
          <Link
            href="/books"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-amber-300 hover:bg-emerald-900/60 transition-colors"
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <span>
                {lang === "bn"
                  ? "পাবলিক ক্যাটালগ"
                  : lang === "ar"
                  ? "الكتالوج العام"
                  : "Public Catalog"}
              </span>
            )}
          </Link>
          {collapsed && (
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity rounded-md bg-emerald-950 text-amber-300 px-2.5 py-1.5 text-xs font-medium border border-emerald-800 whitespace-nowrap">
              Public Catalog
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <div className="relative group">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <span>
                {lang === "bn"
                  ? "সাইন আউট"
                  : lang === "ar"
                  ? "تسجيل الخروج"
                  : "Sign Out"}
              </span>
            )}
          </button>
          {collapsed && (
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity rounded-md bg-red-950 text-red-200 px-2.5 py-1.5 text-xs font-medium border border-red-800 whitespace-nowrap">
              Sign Out
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── Mobile Bottom Navigation Component ───────────────────────────────────────

export function MobileBottomNav({ lang = "en" }: { lang?: SupportedLang }) {
  const pathname = usePathname();
  const { data: user } = useGetMe();
  const { logout } = useLogout();
  const [moreOpen, setMoreOpen] = useState(false);

  const userRole: UserRole = user?.role || "MEMBER";
  const navKeys = ROLE_NAV_KEYS[userRole] || ROLE_NAV_KEYS.MEMBER;

  const pinnedKeys = navKeys.slice(0, BOTTOM_NAV_VISIBLE);
  const overflowKeys = navKeys.slice(BOTTOM_NAV_VISIBLE);
  const hasMore = overflowKeys.length > 0;

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const overflowIsActive = overflowKeys.some((key) => {
    const item = NAV_TRANSLATIONS[key];
    return item ? isActive(item.href) : false;
  });

  return (
    <>
      {/* Fixed Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch bg-[#003824] border-t border-emerald-900/60 safe-area-pb">
        {pinnedKeys.map((key) => {
          const item = NAV_TRANSLATIONS[key];
          if (!item) return null;

          const labelText = item.label[lang] || item.label.en;
          const active = isActive(item.href);

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold transition-colors relative ${
                active
                  ? "text-amber-300"
                  : "text-emerald-200/60 hover:text-emerald-100"
              }`}
              onClick={() => setMoreOpen(false)}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-amber-400" />
              )}
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="truncate max-w-[60px] text-center leading-none">
                {labelText.split(" ")[0]}
              </span>
            </Link>
          );
        })}

        {hasMore && (
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold transition-colors relative ${
              moreOpen || overflowIsActive
                ? "text-amber-300"
                : "text-emerald-200/60 hover:text-emerald-100"
            }`}
          >
            {(moreOpen || overflowIsActive) && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-amber-400" />
            )}
            <MoreHorizontal className="h-5 w-5 shrink-0" />
            <span>
              {lang === "bn" ? "আরও" : lang === "ar" ? "المزيد" : "More"}
            </span>
          </button>
        )}
      </nav>

      {/* Overflow Bottom Sheet for Mobile */}
      {moreOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
            onClick={() => setMoreOpen(false)}
          />

          <div className="lg:hidden fixed bottom-[3.75rem] left-0 right-0 z-50 bg-[#003824] border border-emerald-900/60 border-b-0 rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-emerald-700/60" />
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-b border-emerald-900/40">
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                {lang === "bn"
                  ? "সকল নেভিগেশন"
                  : lang === "ar"
                  ? "جميع التنقلا"
                  : "All Navigation"}
              </span>
              <button
                onClick={() => setMoreOpen(false)}
                className="rounded-md p-1 text-emerald-300/70 hover:text-white hover:bg-emerald-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[55vh] p-4 [scrollbar-width:thin] [scrollbar-color:#065f46_transparent]">
              <div className="grid grid-cols-2 gap-2">
                {overflowKeys.map((key) => {
                  const item = NAV_TRANSLATIONS[key];
                  if (!item) return null;

                  const labelText = item.label[lang] || item.label.en;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-3 text-xs font-semibold transition-colors ${
                        active
                          ? "bg-[#C78700] text-white shadow-xs"
                          : "bg-emerald-900/40 text-emerald-100/80 hover:bg-emerald-800/60 hover:text-white"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="leading-tight truncate">
                        {labelText}
                      </span>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-emerald-900/40 grid grid-cols-2 gap-2">
                <Link
                  href="/books"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-3 text-xs font-semibold bg-emerald-900/30 text-amber-300 hover:bg-emerald-800/50 transition-colors"
                >
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span>Public Catalog</span>
                </Link>
                <button
                  onClick={() => {
                    setMoreOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-3 text-xs font-semibold bg-red-950/30 text-red-300 hover:bg-red-950/50 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Sidebar;