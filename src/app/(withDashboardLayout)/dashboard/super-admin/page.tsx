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
  ShieldAlert,
  MessageSquare,
  Trash2,
  Lock,
} from "lucide-react";
import { useGetMe } from "@/hooks/useAuth";
import { useGetBooks } from "@/hooks/useBooks";
import { useGetUsers } from "@/hooks/useUsers";
import { useGetAllBorrows, useGetMyBorrows } from "@/hooks/useBorrows";
import { useGetAllPurchases, useGetMyPurchases } from "@/hooks/usePurchases";
import { useGetDonations } from "@/hooks/useDonations";
import { useActiveShift, useGetAllShiftLogs } from "@/hooks/useShifts";
import { useGetAllReviews } from "@/hooks/useReviews";
import { StartShiftModal } from "@/components/shifter/StartShiftModal";
import { ScheduleShiftModal } from "@/components/shifter/ScheduleShiftModal";
import { EndShiftModal } from "@/components/shifter/EndShiftModal";
import { LeaderboardsSection } from "@/components/dashboard/analytics/LeaderboardsSection";
import { StatisticalDiagramsSection } from "@/components/dashboard/analytics/StatisticalDiagramsSection";

export default function SuperAdminDashboardPage() {
  const { data: user } = useGetMe();
  const { data: booksData } = useGetBooks({ limit: 1000 });
  const { data: users = [] } = useGetUsers();
  const { data: allBorrows = [] } = useGetAllBorrows();
  const { data: allPurchases = [] } = useGetAllPurchases();
  const { data: allDonations = [] } = useGetDonations();
  const { data: activeShift } = useActiveShift();
  const { data: shiftLogs = [] } = useGetAllShiftLogs();
  const { data: allReviewsData } = useGetAllReviews();

  // Personal records of current super admin
  const { data: myBorrows = [] } = useGetMyBorrows();
  const { data: myPurchases = [] } = useGetMyPurchases();

  const [startShiftModalOpen, setStartShiftModalOpen] = useState(false);
  const [scheduleShiftModalOpen, setScheduleShiftModalOpen] = useState(false);
  const [endShiftModalOpen, setEndShiftModalOpen] = useState(false);

  // Parse Books
  const books = useMemo(() => {
    if (!booksData) return [];
    if (Array.isArray(booksData)) return booksData;
    return (booksData as any).data || [];
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

  const myActiveBorrows = myBorrows.filter((b) => b.status === "APPROVED");
  const myTotalSpent = myPurchases.reduce((acc: number, p: any) => acc + (p.totalAmount || p.unitPrice || 0), 0);

  // Whole Library Global Calculations
  const totalBooksCount = books.length;
  const totalBorrowStock = books.reduce((acc: number, b: any) => acc + (b.borrowStock ?? 0), 0);
  const totalSellStock = books.reduce((acc: number, b: any) => acc + (b.sellStock ?? 0), 0);


  const totalSuperAdmins = users.filter((u) => u.role === "SUPER_ADMIN").length;
  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;
  const totalShifters = users.filter((u) => u.role === "SHIFTER").length;
  const totalMembers = users.filter((u) => u.role === "MEMBER").length;

  const totalBorrowsCount = allBorrows.length;
  const activeBorrowsCount = allBorrows.filter((b) => b.status === "APPROVED").length;
  const overdueBorrowsCount = allBorrows.filter((b) => b.status === "OVERDUE").length;
  const pendingBorrowsCount = allBorrows.filter((b) => b.status === "PENDING").length;

  const totalPurchasesCount = allPurchases.length;
  const totalRevenue = allPurchases.reduce((acc, p) => acc + (p.totalAmount || p.unitPrice || 0), 0);

  const totalDonationsCount = allDonations.length;
  const pendingDonationsCount = allDonations.filter((d) => d.status === "PENDING").length;

  const totalReviewsCount =
    (allReviewsData?.totalBookReviews || 0) + (allReviewsData?.totalServiceReviews || 0);

  const isShiftActive = activeShift && activeShift.status === "ACTIVE";

  return (
    <div className="space-y-8 pb-14 max-w-7xl mx-auto">
      {/* ─── Top Super Admin Banner ─────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#002819] via-[#004F32] to-[#C78700] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-mono font-bold text-amber-300 backdrop-blur-xs border border-amber-300/30">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>RU Islamic Library • Super Admin Executive Master Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Assalamu Alaikum, {user?.name || "System Super Administrator"}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Full unconstrained executive power: Manage and delete books, user/member records with pre-deletion notice dispatches, audit shift logs, review moderation, circulation borrows, and financial purchases.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-amber-200">
              <span className="flex items-center gap-1">
                <ShieldAlert className="h-4 w-4 text-amber-300" /> Role: <strong className="text-white uppercase font-bold tracking-wider">SUPER_ADMIN (FULL POWER)</strong>
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

      {/* ─── SECTION 1: Personal Activity Overview ──────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <span>My Personal Profile &amp; Library Activity</span>
            </h2>
            <p className="text-xs text-muted-foreground">Your own borrowings, book purchases, and submitted donations.</p>
          </div>
          <Link
            href="/dashboard/admin/profile"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <span>Manage Profile</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <span className="text-xs text-muted-foreground">/ {myBorrows.length} total loans</span>
            </div>
            <p className="mt-2 text-[11px] text-primary flex items-center gap-1 font-semibold">
              <span>View my loan records</span>
              <ArrowUpRight className="h-3 w-3" />
            </p>
          </Link>

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

          <Link
            href="/dashboard/admin/my-donations"
            className="group rounded-2xl border border-border bg-card p-5 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">My Donations</span>
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

      {/* ─── SECTION 2: Whole System Global Master KPIs ─────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#004F32]" />
              <span>Universal System Key Metrics</span>
            </h2>
            <p className="text-xs text-muted-foreground">Global inventory, registered users, role breakdown, circulation, revenue, and moderation pipeline.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <Link
            href="/dashboard/admin/books"
            className="rounded-2xl border border-border bg-card p-4 space-y-2 hover:border-primary/40 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Catalog Titles</span>
              <Package className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground">{totalBooksCount}</p>
            <p className="text-[10px] text-muted-foreground font-mono">{totalBorrowStock} borrow copies</p>
          </Link>

          <Link
            href="/dashboard/super-admin/users"
            className="rounded-2xl border border-border bg-card p-4 space-y-2 hover:border-primary/40 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Registered Users</span>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground">{users.length}</p>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{totalMembers} Members • {users.length - totalMembers} Staff</p>
          </Link>

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
            <p className="text-[10px] text-red-600 dark:text-red-400 font-medium">Fine auto-calculation</p>
          </Link>

          <Link
            href="/dashboard/admin/purchases"
            className="rounded-2xl border border-border bg-card p-4 space-y-2 hover:border-primary/40 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Book Sales Rev</span>
              <Receipt className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground">৳{totalRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{totalPurchasesCount} orders</p>
          </Link>

          <Link
            href="/dashboard/admin/reviews"
            className="rounded-2xl border border-border bg-card p-4 space-y-2 hover:border-primary/40 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Community Reviews</span>
              <MessageSquare className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-purple-700 dark:text-purple-400">{totalReviewsCount}</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Moderation active</p>
          </Link>
        </div>
      </div>

      {/* ─── SECTION 3: Visual Analytics Diagrams ─── */}
      <StatisticalDiagramsSection
        books={books}
        borrows={allBorrows}
        purchases={allPurchases}
        donations={allDonations}
        users={users}
        shifts={shiftLogs}
      />

      {/* ─── SECTION 4: Hall of Honor & Leaderboards ────────────── */}
      <LeaderboardsSection
        books={books}
        borrows={allBorrows}
        purchases={allPurchases}
        donations={allDonations}
        users={users}
        shifts={shiftLogs}
      />

      {/* ─── SECTION 5: Super Admin Executive Control Center ──────────────────── */}
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              <span>Super Admin Full Executive Management Hub</span>
            </h3>
            <p className="text-xs text-muted-foreground">Jump directly to any administrative desk with unrestricted creation, update, and deletion powers.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Member & User Directory */}
          <Link
            href="/dashboard/super-admin/users"
            className="group p-4 rounded-2xl border border-border bg-muted/20 hover:bg-muted/50 hover:border-primary/40 transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">User &amp; Member Management</h4>
                  <p className="text-[11px] text-muted-foreground">Assign roles, send notices, delete accounts</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>

          {/* Book Catalog Inventory */}
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
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Book Catalog &amp; Inventory</h4>
                  <p className="text-[11px] text-muted-foreground">Add new books, update shelf cells, delete books</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>

          {/* Circulation & Borrows */}
          <Link
            href="/dashboard/admin/borrows"
            className="group p-4 rounded-2xl border border-border bg-muted/20 hover:bg-muted/50 hover:border-primary/40 transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-700/10 text-[#004F32] dark:text-emerald-400 flex items-center justify-center font-bold">
                  <BookMarked className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Circulation &amp; Borrow Records</h4>
                  <p className="text-[11px] text-muted-foreground">Approve requests, process returns, delete loans</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>

          {/* Purchases & Orders */}
          <Link
            href="/dashboard/super-admin/purchases"
            className="group p-4 rounded-2xl border border-border bg-muted/20 hover:bg-muted/50 hover:border-primary/40 transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Purchases &amp; Order Orders</h4>
                  <p className="text-[11px] text-muted-foreground">Fulfill orders, generate receipts, delete sales</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>

          {/* Donation Approvals */}
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
                  <p className="text-[11px] text-muted-foreground">Approve drop-offs, catalog conversion, delete records</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>

          {/* Shift Logs & Audit */}
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
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Shift Logs &amp; Float Audit</h4>
                  <p className="text-[11px] text-muted-foreground">Audit counter sessions, delete logs</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>

          {/* Reviews Moderation */}
          <Link
            href="/dashboard/admin/reviews"
            className="group p-4 rounded-2xl border border-border bg-muted/20 hover:bg-muted/50 hover:border-primary/40 transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Review Moderation</h4>
                  <p className="text-[11px] text-muted-foreground">Audit community feedback &amp; delete reviews</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>

          {/* POS Counter Desk */}
          <Link
            href="/dashboard/shifter"
            className="group p-4 rounded-2xl border border-border bg-muted/20 hover:bg-muted/50 hover:border-primary/40 transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">POS Counter Desk</h4>
                  <p className="text-[11px] text-muted-foreground">Direct book issues, sales &amp; cash membership desk</p>
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
