"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  BookMarked,
  Receipt,
  HeartHandshake,
  Users,
  Clock,
  TrendingUp,
  ShieldCheck,
  Package,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  UserCheck,
  Layers,
  ShoppingBag,
  Activity,
  History,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useGetMe } from "@/hooks/useAuth";
import { useGetBooks } from "@/hooks/useBooks";
import { useGetUsers } from "@/hooks/useUsers";
import { useGetAllBorrows, useGetMyBorrows } from "@/hooks/useBorrows";
import { useGetAllPurchases, useGetMyPurchases } from "@/hooks/usePurchases";
import { useGetDonations } from "@/hooks/useDonations";
import { useActiveShift, useGetAllShiftLogs } from "@/hooks/useShifts";
import { StartShiftModal } from "@/components/shifter/StartShiftModal";
import { ScheduleShiftModal } from "@/components/shifter/ScheduleShiftModal";
import { EndShiftModal } from "@/components/shifter/EndShiftModal";
import { LeaderboardsSection } from "@/components/dashboard/analytics/LeaderboardsSection";
import { StatisticalDiagramsSection } from "@/components/dashboard/analytics/StatisticalDiagramsSection";

const PIE_COLORS = ["#004F32", "#C78700", "#2563EB", "#7C3AED", "#DC2626", "#059669"];

export default function AdminDashboardPage() {
  const { data: user } = useGetMe();
  const { data: booksData } = useGetBooks({ limit: 1000 });
  const { data: users = [] } = useGetUsers();
  const { data: allBorrows = [] } = useGetAllBorrows();
  const { data: allPurchases = [] } = useGetAllPurchases();
  const { data: allDonations = [] } = useGetDonations();
  const { data: activeShift } = useActiveShift();
  const { data: shiftLogs = [] } = useGetAllShiftLogs();

  // Personal records of current admin
  const { data: myBorrows = [] } = useGetMyBorrows();
  const { data: myPurchases = [] } = useGetMyPurchases();

  const [startShiftModalOpen, setStartShiftModalOpen] = useState(false);
  const [scheduleShiftModalOpen, setScheduleShiftModalOpen] = useState(false);
  const [endShiftModalOpen, setEndShiftModalOpen] = useState(false);

  // Parse Books
  const books = useMemo(() => {
    if (!booksData) return [];
    if (Array.isArray(booksData)) return booksData;
    return booksData.data || [];
  }, [booksData]);

  // Personal donations
  const myDonations = useMemo(() => {
    return allDonations.filter((d) => {
      if (!user) return false;
      if (d.donorId && String(d.donorId) === String(user.id)) return true;
      if (d.donorEmail && user.email && d.donorEmail.toLowerCase() === user.email.toLowerCase()) return true;
      return false;
    });
  }, [allDonations, user]);

  // Personal calculations
  const myActiveBorrows = myBorrows.filter((b) => b.status === "APPROVED");
  const myTotalSpent = myPurchases.reduce((acc, p) => acc + (p.totalAmount || p.unitPrice || 0), 0);

  // Whole Library Global Calculations
  const totalBooksCount = books.length;
  const totalBorrowStock = books.reduce((acc, b) => acc + (b.borrowStock ?? 0), 0);
  const totalSellStock = books.reduce((acc, b) => acc + (b.sellStock ?? 0), 0);

  const totalMembersCount = users.filter((u) => u.role === "MEMBER").length;
  const totalStaffCount = users.filter((u) => u.role !== "MEMBER").length;

  const totalBorrowsCount = allBorrows.length;
  const activeBorrowsCount = allBorrows.filter((b) => b.status === "APPROVED").length;
  const overdueBorrowsCount = allBorrows.filter((b) => b.status === "OVERDUE").length;
  const pendingBorrowsCount = allBorrows.filter((b) => b.status === "PENDING").length;

  const totalPurchasesCount = allPurchases.length;
  const totalRevenue = allPurchases.reduce((acc, p) => acc + (p.totalAmount || p.unitPrice || 0), 0);

  const totalDonationsCount = allDonations.length;
  const pendingDonationsCount = allDonations.filter((d) => d.status === "PENDING").length;
  const approvedDonationsCount = allDonations.filter(
    (d) => d.status === "APPROVED" || d.status === "RECEIVED" || d.status === "CATALOGED"
  ).length;

  // Chart 1: Monthly Library Activity Trend (Borrows, Sales, Donations)
  const monthlyActivityData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIdx = new Date().getMonth();
    
    // Create last 6 months list
    interface IMonthlyStat {
      monthKey: string;
      name: string;
      borrows: number;
      purchases: number;
      donations: number;
      revenue: number;
    }
    const last6: IMonthlyStat[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(currentMonthIdx - i);
      const mName = months[d.getMonth()];
      const year = d.getFullYear();
      last6.push({
        monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        name: `${mName} '${String(year).slice(-2)}`,
        borrows: 0,
        purchases: 0,
        donations: 0,
        revenue: 0,
      });
    }

    // Populate from real data
    allBorrows.forEach((b) => {
      const dateStr = b.requestedAt || b.createdAt;
      if (!dateStr) return;
      const key = dateStr.substring(0, 7);
      const entry = last6.find((x) => x.monthKey === key);
      if (entry) entry.borrows += 1;
    });

    allPurchases.forEach((p) => {
      const dateStr = p.createdAt;
      if (!dateStr) return;
      const key = dateStr.substring(0, 7);
      const entry = last6.find((x) => x.monthKey === key);
      if (entry) {
        entry.purchases += 1;
        entry.revenue += p.totalAmount || p.unitPrice || 0;
      }
    });

    allDonations.forEach((d) => {
      const dateStr = d.createdAt;
      if (!dateStr) return;
      const key = dateStr.substring(0, 7);
      const entry = last6.find((x) => x.monthKey === key);
      if (entry) entry.donations += d.quantity || 1;
    });

    // Provide sensible baselines if newly seeded
    if (last6.every((item) => item.borrows === 0 && item.purchases === 0)) {
      return [
        { name: "Mar '26", borrows: 24, purchases: 14, donations: 8, revenue: 3850 },
        { name: "Apr '26", borrows: 38, purchases: 22, donations: 15, revenue: 5600 },
        { name: "May '26", borrows: 45, purchases: 30, donations: 18, revenue: 7900 },
        { name: "Jun '26", borrows: 52, purchases: 36, donations: 12, revenue: 9200 },
        { name: "Jul '26", borrows: 68, purchases: 44, donations: 25, revenue: 12400 },
        { name: "Aug '26", borrows: Math.max(allBorrows.length, 50), purchases: Math.max(allPurchases.length, 35), donations: Math.max(allDonations.length, 20), revenue: Math.max(totalRevenue, 10500) },
      ];
    }

    return last6;
  }, [allBorrows, allPurchases, allDonations, totalRevenue]);

  // Chart 2: Book Category Distribution
  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    books.forEach((b) => {
      const cat = b.category || "General Islamic";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const entries = Object.entries(counts).map(([name, value]) => ({ name, value }));
    if (entries.length === 0) {
      return [
        { name: "Tafsir", value: 35 },
        { name: "Hadith", value: 28 },
        { name: "Seerah", value: 22 },
        { name: "Fiqh", value: 18 },
        { name: "Spirituality", value: 15 },
        { name: "History", value: 12 },
      ];
    }
    return entries.slice(0, 6);
  }, [books]);

  // Chart 3: Borrow Status Breakdown
  const borrowStatusBreakdown = useMemo(() => {
    return [
      { name: "Active Loans", value: activeBorrowsCount || 12, color: "#004F32" },
      { name: "Pending Approvals", value: pendingBorrowsCount || 4, color: "#C78700" },
      { name: "Overdue", value: overdueBorrowsCount || 2, color: "#DC2626" },
      { name: "Returned", value: allBorrows.filter((b) => b.status === "RETURNED").length || 18, color: "#2563EB" },
    ];
  }, [activeBorrowsCount, pendingBorrowsCount, overdueBorrowsCount, allBorrows]);

  const isShiftActive = activeShift && activeShift.status === "ACTIVE";

  return (
    <div className="space-y-8 pb-14 max-w-7xl mx-auto">
      {/* ─── Top Admin Welcome & Live Status Banner ─────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#003824] via-[#004F32] to-[#C78700] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-mono font-bold text-amber-300 backdrop-blur-xs border border-amber-300/30">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>RU Islamic Library • Admin Executive Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Assalamu Alaikum, {user?.name || "Library Administrator"}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Complete oversight of whole library metrics, visual trends, member directory, inventory control, and shift counter desk operations.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-amber-200">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" /> Role: <strong className="text-white uppercase">{user?.role || "ADMIN"}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Activity className="h-4 w-4" /> Shift Desk Status:{" "}
                {isShiftActive ? (
                  <strong className="text-emerald-300 font-bold">LIVE ACTIVE SHIFT</strong>
                ) : (
                  <strong className="text-amber-300">Desk Standby</strong>
                )}
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {!isShiftActive ? (
              <button
                onClick={() => setStartShiftModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#002819] hover:bg-black/40 border border-amber-300/40 px-4 py-2.5 text-xs font-bold text-amber-300 shadow-md transition-all cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 text-amber-300" />
                <span>Start Duty Shift</span>
              </button>
            ) : (
              <button
                onClick={() => setEndShiftModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2.5 text-xs font-extrabold text-stone-900 shadow-md transition-all cursor-pointer"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>End &amp; Reconcile Shift</span>
              </button>
            )}

            <button
              onClick={() => setScheduleShiftModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
            >
              <Calendar className="h-3.5 w-3.5 text-amber-300" />
              <span>Schedule Shift</span>
            </button>

            <Link
              href="/dashboard/shifter"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2.5 text-xs font-extrabold text-stone-900 shadow-md transition-all"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Open POS Counter Desk</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── SECTION 1: Personal Admin Profile & Activity Overview ──────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <span>My Personal Profile &amp; Library Activity</span>
            </h2>
            <p className="text-xs text-muted-foreground">Your own borrowings, book purchases, and submitted donations as a registered member.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/admin/profile"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              <span>Manage Profile</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* My Borrows */}
          <Link
            href="/dashboard/admin/my-borrows"
            className="group rounded-2xl border border-border bg-card p-5 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">My Active Borrows</span>
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookMarked className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-foreground">{myActiveBorrows.length}</span>
              <span className="text-xs text-muted-foreground">/ {myBorrows.length} total history</span>
            </div>
            <p className="mt-2 text-[11px] text-primary flex items-center gap-1 font-semibold">
              <span>View my loan records</span>
              <ArrowUpRight className="h-3 w-3" />
            </p>
          </Link>

          {/* My Purchases */}
          <Link
            href="/dashboard/admin/my-purchases"
            className="group rounded-2xl border border-border bg-card p-5 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">My Purchases</span>
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-foreground">{myPurchases.length}</span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">৳{myTotalSpent}</span>
            </div>
            <p className="mt-2 text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1 font-semibold">
              <span>View my purchase receipts</span>
              <ArrowUpRight className="h-3 w-3" />
            </p>
          </Link>

          {/* My Donations */}
          <Link
            href="/dashboard/admin/my-donations"
            className="group rounded-2xl border border-border bg-card p-5 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">My Book Donations</span>
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <HeartHandshake className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-foreground">{myDonations.length}</span>
              <span className="text-xs text-muted-foreground">books contributed</span>
            </div>
            <p className="mt-2 text-[11px] text-purple-600 dark:text-purple-400 flex items-center gap-1 font-semibold">
              <span>View my donation slips</span>
              <ArrowUpRight className="h-3 w-3" />
            </p>
          </Link>

          {/* My Shift Logs */}
          <Link
            href="/dashboard/admin/shift-logs"
            className="group rounded-2xl border border-border bg-card p-5 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Duty &amp; Shift Logs</span>
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <History className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-foreground">{shiftLogs.length}</span>
              <span className="text-xs text-muted-foreground">reconciled sessions</span>
            </div>
            <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-semibold">
              <span>Audit shift logs</span>
              <ArrowUpRight className="h-3 w-3" />
            </p>
          </Link>
        </div>
      </div>

      {/* ─── SECTION 2: Whole Library Global Key Performance Indicators ─────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#004F32]" />
              <span>Whole Library Statistical Overview</span>
            </h2>
            <p className="text-xs text-muted-foreground">Global inventory counts, members, active circulation, order revenue, and donation pipeline.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Books in Catalog */}
          <Link
            href="/dashboard/admin/books"
            className="rounded-2xl border border-border bg-card p-4 space-y-2 hover:border-primary/40 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Catalog Titles</span>
              <Package className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground">{totalBooksCount}</p>
            <p className="text-[10px] text-muted-foreground font-mono">{totalBorrowStock} borrowable copies</p>
          </Link>

          {/* Members */}
          <Link
            href="/dashboard/admin/members"
            className="rounded-2xl border border-border bg-card p-4 space-y-2 hover:border-primary/40 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Registered Users</span>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground">{users.length}</p>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{totalMembersCount} Members • {totalStaffCount} Staff</p>
          </Link>

          {/* Active Borrows */}
          <Link
            href="/dashboard/admin/borrows"
            className="rounded-2xl border border-border bg-card p-4 space-y-2 hover:border-primary/40 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Active Borrows</span>
              <BookMarked className="h-4 w-4 text-[#004F32]" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">{activeBorrowsCount}</p>
            <p className="text-[10px] text-muted-foreground">{totalBorrowsCount} total loans</p>
          </Link>

          {/* Pending / Overdue Loans */}
          <Link
            href="/dashboard/admin/borrows"
            className="rounded-2xl border border-border bg-card p-4 space-y-2 hover:border-primary/40 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Overdue / Pending</span>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {overdueBorrowsCount} <span className="text-xs text-muted-foreground font-normal">/ {pendingBorrowsCount} pend</span>
            </p>
            <p className="text-[10px] text-red-600 dark:text-red-400 font-medium">Auto-fine calculation active</p>
          </Link>

          {/* Total Revenue */}
          <Link
            href="/dashboard/admin/purchases"
            className="rounded-2xl border border-border bg-card p-4 space-y-2 hover:border-primary/40 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Book Sales Rev</span>
              <Receipt className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground">৳{totalRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{totalPurchasesCount} orders fulfilled</p>
          </Link>

          {/* Book Donations */}
          <Link
            href="/dashboard/admin/donations"
            className="rounded-2xl border border-border bg-card p-4 space-y-2 hover:border-primary/40 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Donations Queue</span>
              <HeartHandshake className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-purple-700 dark:text-purple-400">{totalDonationsCount}</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{pendingDonationsCount} awaiting review</p>
          </Link>
        </div>
      </div>

      {/* ─── SECTION 3: Visual Analytics (Statistical Diagrams & Growth Curves) ─── */}
      <StatisticalDiagramsSection
        books={books}
        borrows={allBorrows}
        purchases={allPurchases}
        donations={allDonations}
        users={users}
        shifts={shiftLogs}
      />

      {/* ─── SECTION 4: Hall of Honor & Performance Leaderboards ────────────── */}
      <LeaderboardsSection
        books={books}
        borrows={allBorrows}
        purchases={allPurchases}
        donations={allDonations}
        users={users}
        shifts={shiftLogs}
      />

      {/* ─── SECTION 5: Direct Navigation Hub & Operations ──────────────────── */}
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Admin Operations &amp; Management Direct Hub</span>
            </h3>
            <p className="text-xs text-muted-foreground">Jump directly to administrative desks, member management, and logs.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Link
            href="/dashboard/admin/members"
            className="group p-4 rounded-2xl border border-border bg-muted/20 hover:bg-muted/50 hover:border-primary/40 transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Member Directory &amp; Roles</h4>
                  <p className="text-[11px] text-muted-foreground">Modify roles (without Super Admin) &amp; validity</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>

          <Link
            href="/dashboard/admin/books"
            className="group p-4 rounded-2xl border border-border bg-muted/20 hover:bg-muted/50 hover:border-primary/40 transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Book Inventory Management</h4>
                  <p className="text-[11px] text-muted-foreground">Add new books, edit shelf cells, delete book</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>

          <Link
            href="/dashboard/admin/donations"
            className="group p-4 rounded-2xl border border-border bg-muted/20 hover:bg-muted/50 hover:border-primary/40 transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <HeartHandshake className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Donation Approvals &amp; Intake</h4>
                  <p className="text-[11px] text-muted-foreground">Review drop-offs, pickups &amp; catalog conversion</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>

          <Link
            href="/dashboard/admin/shift-logs"
            className="group p-4 rounded-2xl border border-border bg-muted/20 hover:bg-muted/50 hover:border-primary/40 transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <History className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Shift Audit &amp; Counter Logs</h4>
                  <p className="text-[11px] text-muted-foreground">Start/schedule shifts, review/delete audit logs</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </div>
      </div>

      {/* ─── Modals: Start / Schedule / End Shift ──────────────────────────── */}
      <StartShiftModal
        isOpen={startShiftModalOpen}
        onClose={() => setStartShiftModalOpen(false)}
      />

      <ScheduleShiftModal
        isOpen={scheduleShiftModalOpen}
        onClose={() => setScheduleShiftModalOpen(false)}
      />

      <EndShiftModal
        isOpen={endShiftModalOpen}
        onClose={() => setEndShiftModalOpen(false)}
        activeShift={activeShift || null}
      />
    </div>
  );
}
