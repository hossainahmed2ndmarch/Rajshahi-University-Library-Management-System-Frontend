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
  ClipboardList,
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
} from "lucide-react";
import { useGetMe, useLogout } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";
import logo from "../../assets/logo/white-version.png";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const ROLE_NAV_ITEMS: Record<UserRole, NavItem[]> = {
  SUPER_ADMIN: [
    {
      label: "Super Admin Overview",
      href: "/dashboard/super-admin",
      icon: LayoutDashboard,
    },
    { label: "POS Counter Desk", href: "/dashboard/shifter", icon: Barcode },
    {
      label: "Book Catalog Inventory",
      href: "/dashboard/admin/books",
      icon: Package,
    },
    {
      label: "Circulation & Borrows",
      href: "/dashboard/admin/borrows",
      icon: BookMarked,
    },
    {
      label: "Donation Approvals",
      href: "/dashboard/admin/donations",
      icon: HeartHandshake,
    },
    {
      label: "Member Directory & Roles",
      href: "/dashboard/admin/members",
      icon: Users,
    },
    {
      label: "Publications & Articles",
      href: "/dashboard/super-admin/publications",
      icon: Newspaper,
    },
    {
      label: "User Role Provisioning",
      href: "/dashboard/super-admin/users",
      icon: ShieldAlert,
    },
    {
      label: "Purchases & Orders",
      href: "/dashboard/admin/purchases",
      icon: Receipt,
    },
    {
      label: "Shift Logs & Audit System",
      href: "/dashboard/super-admin/shift-logs",
      icon: History,
    },
    {
      label: "Duty Rosters & Schedules",
      href: "/dashboard/super-admin/shifter-schedules",
      icon: Calendar,
    },
    {
      label: "Review Moderation",
      href: "/dashboard/admin/reviews",
      icon: Sparkles,
    },
    { label: "My Profile", href: "/dashboard/admin/profile", icon: User },
    {
      label: "My Borrows",
      href: "/dashboard/admin/my-borrows",
      icon: BookMarked,
    },
    {
      label: "My Purchases",
      href: "/dashboard/admin/my-purchases",
      icon: Receipt,
    },
    {
      label: "My Donations",
      href: "/dashboard/admin/my-donations",
      icon: HeartHandshake,
    },
  ],
  ADMIN: [
    {
      label: "Admin Overview",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    { label: "POS Counter Desk", href: "/dashboard/shifter", icon: Barcode },
    {
      label: "Book Catalog Inventory",
      href: "/dashboard/admin/books",
      icon: Package,
    },
    {
      label: "Circulation & Borrows",
      href: "/dashboard/admin/borrows",
      icon: BookMarked,
    },
    {
      label: "Donation Approvals",
      href: "/dashboard/admin/donations",
      icon: HeartHandshake,
    },
    {
      label: "Member Directory & Roles",
      href: "/dashboard/admin/members",
      icon: Users,
    },
    {
      label: "Publications & Articles",
      href: "/dashboard/admin/publications",
      icon: Newspaper,
    },
    {
      label: "Purchases & Orders",
      href: "/dashboard/admin/purchases",
      icon: Receipt,
    },
    {
      label: "Shift Logs & Audit System",
      href: "/dashboard/admin/shift-logs",
      icon: History,
    },
    {
      label: "Duty Rosters & Schedules",
      href: "/dashboard/admin/shifter-schedules",
      icon: Calendar,
    },
    {
      label: "Review Moderation",
      href: "/dashboard/admin/reviews",
      icon: Sparkles,
    },
    { label: "My Profile", href: "/dashboard/admin/profile", icon: User },
    {
      label: "My Borrows",
      href: "/dashboard/admin/my-borrows",
      icon: BookMarked,
    },
    {
      label: "My Purchases",
      href: "/dashboard/admin/my-purchases",
      icon: Receipt,
    },
    {
      label: "My Donations",
      href: "/dashboard/admin/my-donations",
      icon: HeartHandshake,
    },
  ],

  SHIFTER: [
    { label: "POS Counter Desk", href: "/dashboard/shifter", icon: Barcode },
    {
      label: "Book Catalog Directory",
      href: "/dashboard/shifter/books",
      icon: Package,
    },
    {
      label: "Borrow Approvals & Desk",
      href: "/dashboard/shifter/borrows",
      icon: BookMarked,
    },
    {
      label: "Donations Shelving",
      href: "/dashboard/shifter/donations",
      icon: HeartHandshake,
    },
    {
      label: "Member Directory",
      href: "/dashboard/shifter/members",
      icon: Users,
    },
    {
      label: "All Purchases",
      href: "/dashboard/shifter/purchases",
      icon: Receipt,
    },
    {
      label: "Shift Logs & Handover",
      href: "/dashboard/shifter/shift-logs",
      icon: History,
    },
    {
      label: "Member Overview",
      href: "/dashboard/shifter/overview",
      icon: LayoutDashboard,
    },
    { label: "My Profile", href: "/dashboard/shifter/profile", icon: User },
    {
      label: "My Borrows",
      href: "/dashboard/shifter/my-borrows",
      icon: BookMarked,
    },
    {
      label: "My Purchases",
      href: "/dashboard/shifter/my-purchases",
      icon: Receipt,
    },
    {
      label: "My Donations",
      href: "/dashboard/shifter/my-donations",
      icon: HeartHandshake,
    },
  ],
  MEMBER: [
    {
      label: "Member Overview",
      href: "/dashboard/member",
      icon: LayoutDashboard,
    },
    { label: "My Profile", href: "/dashboard/member/profile", icon: User },
    {
      label: "My Borrow History",
      href: "/dashboard/member/my-borrows",
      icon: BookMarked,
    },
    {
      label: "My Book Purchases",
      href: "/dashboard/member/purchases",
      icon: Receipt,
    },
    {
      label: "My Donations",
      href: "/dashboard/member/donations",
      icon: HeartHandshake,
    },
  ],
};

const BOTTOM_NAV_VISIBLE = 4;

export function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}) {
  const pathname = usePathname();
  const { data: user } = useGetMe();
  const { logout } = useLogout();

  const userRole: UserRole = user?.role || "MEMBER";
  const navItems = ROLE_NAV_ITEMS[userRole] || ROLE_NAV_ITEMS.MEMBER;

  return (
    <aside
      className={`relative z-40 flex flex-col border-r border-border bg-[#003824] text-white transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-emerald-900/60">
        <Link href="/" className="flex items-center space-x-2.5 shrink-0 group">
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

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1.5 text-emerald-200/80 hover:bg-emerald-800 hover:text-white transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Role Badge Container */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-emerald-900/40 bg-emerald-950/40">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs text-emerald-200 font-medium">
              Logged in as:
            </span>
          </div>
          <p className="text-xs font-bold text-amber-300 uppercase tracking-wider mt-0.5 font-mono">
            {userRole}
          </p>
        </div>
      )}

      {/* Navigation Items (Custom Styled Scrollbar Added) */}
      <div
        className="flex-1 space-y-1 p-3 overflow-y-auto 
        [scrollbar-width:thin] [scrollbar-color:#065f46_transparent]
        [&::-webkit-scrollbar]:w-1.5 
        [&::-webkit-scrollbar-track]:bg-transparent 
        [&::-webkit-scrollbar-thumb]:bg-emerald-800/60 
        [&::-webkit-scrollbar-thumb]:rounded-full 
        hover:[&::-webkit-scrollbar-thumb]:bg-emerald-600"
      >
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-[#C78700] text-white shadow-xs"
                  : "text-emerald-100/80 hover:bg-emerald-900/60 hover:text-white"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-emerald-900/60 space-y-1">
        <Link
          href="/books"
          className="flex items-center space-x-3 rounded-lg px-3 py-2 text-xs font-medium text-amber-300 hover:bg-emerald-900/60 transition-colors"
          title={collapsed ? "Public Catalog" : undefined}
        >
          <BookOpen className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Public Catalog</span>}
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 rounded-lg px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-950/40 transition-colors"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: user } = useGetMe();
  const { logout } = useLogout();
  const [moreOpen, setMoreOpen] = useState(false);

  const userRole: UserRole = user?.role || "MEMBER";
  const allItems = ROLE_NAV_ITEMS[userRole] || ROLE_NAV_ITEMS.MEMBER;

  const pinnedItems = allItems.slice(0, BOTTOM_NAV_VISIBLE);
  const overflowItems = allItems.slice(BOTTOM_NAV_VISIBLE);
  const hasMore = overflowItems.length > 0;

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const moreIsActive = overflowItems.some((item) => isActive(item.href));

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch bg-[#003824] border-t border-emerald-900/60 safe-area-pb">
        {pinnedItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold transition-colors relative ${
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
              <span className="truncate max-w-[56px] text-center leading-none">
                {item.label.split(" ")[0]}
              </span>
            </Link>
          );
        })}

        {hasMore && (
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold transition-colors relative ${
              moreOpen || moreIsActive
                ? "text-amber-300"
                : "text-emerald-200/60 hover:text-emerald-100"
            }`}
          >
            {(moreOpen || moreIsActive) && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-amber-400" />
            )}
            <MoreHorizontal className="h-5 w-5 shrink-0" />
            <span>More</span>
          </button>
        )}
      </nav>

      {moreOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />

          <div className="lg:hidden fixed bottom-[3.75rem] left-0 right-0 z-50 bg-[#003824] border border-emerald-900/60 border-b-0 rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-emerald-700/60" />
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-b border-emerald-900/40">
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                All Navigation
              </span>
              <button
                onClick={() => setMoreOpen(false)}
                className="rounded-md p-1 text-emerald-300/70 hover:text-white hover:bg-emerald-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Sheet Scrollbar Customization */}
            <div 
              className="overflow-y-auto max-h-[55vh] p-4 
              [scrollbar-width:thin] [scrollbar-color:#065f46_transparent]
              [&::-webkit-scrollbar]:w-1.5 
              [&::-webkit-scrollbar-track]:bg-transparent 
              [&::-webkit-scrollbar-thumb]:bg-emerald-800/60 
              [&::-webkit-scrollbar-thumb]:rounded-full"
            >
              <div className="grid grid-cols-2 gap-2">
                {overflowItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-3 text-xs font-semibold transition-colors ${
                        active
                          ? "bg-[#C78700] text-white shadow-sm"
                          : "bg-emerald-900/40 text-emerald-100/80 hover:bg-emerald-800/60 hover:text-white"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="leading-tight">{item.label}</span>
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
                  className="flex items-center gap-2.5 rounded-xl px-3 py-3 text-xs font-semibold bg-red-950/30 text-red-300 hover:bg-red-950/50 transition-colors"
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