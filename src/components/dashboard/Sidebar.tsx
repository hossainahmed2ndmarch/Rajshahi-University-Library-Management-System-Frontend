"use client";

import Image from "next/image";
import React from "react";
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
            {/* Light Mode Logo */}
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

      {/* Navigation Items */}
      <div className="flex-1 space-y-1 p-3 overflow-y-auto">
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

export default Sidebar;
