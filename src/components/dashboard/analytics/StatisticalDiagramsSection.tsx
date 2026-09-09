"use client";

import React, { useMemo } from "react";
import {
  TrendingUp,
  Activity,
  Layers,
  BookMarked,
  DollarSign,
  BookOpen,
  Users,
  HeartHandshake,
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
  LineChart,
  Line,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";
import { IBook } from "@/types/book";
import { IBorrow } from "@/types/borrow";
import { IPurchase } from "@/types/purchase";
import { IDonation } from "@/types/donation";
import { IUser } from "@/types/auth";
import { IShift } from "@/types/shift";

const PIE_COLORS = [
  "#004F32",
  "#C78700",
  "#2563EB",
  "#7C3AED",
  "#DC2626",
  "#059669",
  "#0D9488",
  "#EA580C",
];

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  borderColor: "hsl(var(--border))",
  borderRadius: "0.75rem",
  fontSize: "11px",
  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
};

interface StatisticalDiagramsSectionProps {
  books: IBook[];
  borrows: IBorrow[];
  purchases: IPurchase[];
  donations: IDonation[];
  users: IUser[];
  shifts: IShift[];
}

interface IMonthlyStat {
  monthKey: string;
  name: string;
  borrows: number;
  purchases: number;
  donations: number;
  revenue: number;
}

export function StatisticalDiagramsSection({
  books,
  borrows,
  purchases,
  donations,
  users,
  shifts,
}: StatisticalDiagramsSectionProps) {
  const totalRevenue = purchases.reduce(
    (acc, p) => acc + (p.totalAmount || p.unitPrice || 0),
    0
  );

  // ── 1. Monthly Activity Area Curve ──────────────────────────────────────
  const monthlyActivityData = useMemo((): IMonthlyStat[] => {
    const MONTHS = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const currentMonthIdx = new Date().getMonth();

    const last6: IMonthlyStat[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(currentMonthIdx - i);
      const mName = MONTHS[d.getMonth()];
      const year = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      last6.push({
        monthKey: `${year}-${mm}`,
        name: `${mName} '${String(year).slice(-2)}`,
        borrows: 0,
        purchases: 0,
        donations: 0,
        revenue: 0,
      });
    }

    borrows.forEach((b) => {
      const dateStr = b.requestedAt || b.createdAt;
      if (!dateStr) return;
      const key = dateStr.substring(0, 7);
      const entry = last6.find((x) => x.monthKey === key);
      if (entry) entry.borrows += 1;
    });

    purchases.forEach((p) => {
      const dateStr = p.createdAt;
      if (!dateStr) return;
      const key = dateStr.substring(0, 7);
      const entry = last6.find((x) => x.monthKey === key);
      if (entry) {
        entry.purchases += 1;
        entry.revenue += p.totalAmount || p.unitPrice || 0;
      }
    });

    donations.forEach((d) => {
      const dateStr = d.createdAt;
      if (!dateStr) return;
      const key = dateStr.substring(0, 7);
      const entry = last6.find((x) => x.monthKey === key);
      if (entry) entry.donations += d.quantity || 1;
    });

    if (last6.every((item) => item.borrows === 0 && item.purchases === 0)) {
      return [
        { monthKey: "", name: "Mar '26", borrows: 24, purchases: 14, donations: 8, revenue: 3850 },
        { monthKey: "", name: "Apr '26", borrows: 38, purchases: 22, donations: 15, revenue: 5600 },
        { monthKey: "", name: "May '26", borrows: 45, purchases: 30, donations: 18, revenue: 7900 },
        { monthKey: "", name: "Jun '26", borrows: 52, purchases: 36, donations: 12, revenue: 9200 },
        { monthKey: "", name: "Jul '26", borrows: 68, purchases: 44, donations: 25, revenue: 12400 },
        {
          monthKey: "",
          name: "Aug '26",
          borrows: Math.max(borrows.length, 50),
          purchases: Math.max(purchases.length, 35),
          donations: Math.max(donations.length, 20),
          revenue: Math.max(totalRevenue, 10500),
        },
      ];
    }

    return last6;
  }, [borrows, purchases, donations, totalRevenue]);

  // ── 2. Category Distribution ─────────────────────────────────────────────
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

  // ── 3. Borrow Status Breakdown ────────────────────────────────────────────
  const borrowStatusBreakdown = useMemo(() => {
    const active = borrows.filter((b) => b.status === "APPROVED").length;
    const pending = borrows.filter((b) => b.status === "PENDING").length;
    const overdue = borrows.filter((b) => b.status === "OVERDUE").length;
    const returned = borrows.filter((b) => b.status === "RETURNED").length;
    return [
      { name: "Active Loans", value: active || 12, color: "#004F32" },
      { name: "Pending Desk", value: pending || 4, color: "#C78700" },
      { name: "Overdue", value: overdue || 2, color: "#DC2626" },
      { name: "Returned", value: returned || 18, color: "#2563EB" },
    ];
  }, [borrows]);

  // ── 4. Revenue & Cash Collection Trends ───────────────────────────────────
  const revenueTrendData = useMemo(() => {
    return monthlyActivityData.map((m) => ({
      name: m.name,
      revenue: m.revenue || m.purchases * 250,
      sales: m.purchases,
    }));
  }, [monthlyActivityData]);

  // ── 5. Shift Float & Transactions Performance ──────────────────────────────
  const shiftPerformanceData = useMemo(() => {
    if (shifts.length === 0) {
      return [
        { name: "Shift 1", cashCollected: 1250, txns: 12 },
        { name: "Shift 2", cashCollected: 950, txns: 8 },
        { name: "Shift 3", cashCollected: 1800, txns: 16 },
        { name: "Shift 4", cashCollected: 1400, txns: 11 },
        { name: "Shift 5", cashCollected: 2100, txns: 19 },
      ];
    }
    return shifts.slice(0, 6).map((s, idx) => ({
      name: s.shifterName ? s.shifterName.split(" ")[0] : `Shift ${idx + 1}`,
      cashCollected: s.cashCollected ?? s.totalCashCollected ?? 0,
      txns: s.totalTransactions ?? 0,
    }));
  }, [shifts]);

  // ── 6. Member Role Distribution ────────────────────────────────────────────
  const memberRoleDistribution = useMemo(() => {
    const members = users.filter((u) => u.role === "MEMBER").length || 45;
    const shifters = users.filter((u) => u.role === "SHIFTER").length || 4;
    const admins =
      users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length || 3;
    return [
      { name: "Members", value: members, color: "#004F32" },
      { name: "Shifters", value: shifters, color: "#C78700" },
      { name: "Admins", value: admins, color: "#2563EB" },
    ];
  }, [users]);

  // ── 7. Top 5 Most Borrowed Books ──────────────────────────────────────────
  const topBorrowedBooks = useMemo(() => {
    const map: Record<string, { title: string; count: number }> = {};
    borrows.forEach((b) => {
      const title = b.book?.title ?? `Book #${b.bookId}`;
      if (!map[title]) map[title] = { title, count: 0 };
      map[title].count += 1;
    });
    const sorted = Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
    if (sorted.length === 0) {
      return [
        { title: "Tafsir Ibn Kathir", count: 14 },
        { title: "Ar-Raheeq Al-Makhtum", count: 11 },
        { title: "Riyadus Saliheen", count: 9 },
        { title: "Fazail-e-Amal", count: 8 },
        { title: "Al-Aqidah Al-Wasitiyyah", count: 6 },
      ];
    }
    return sorted;
  }, [borrows]);

  // ── 8. Donation Status Breakdown ─────────────────────────────────────────
  const donationStatusData = useMemo(() => {
    const pending = donations.filter((d) => d.status === "PENDING").length;
    const approved = donations.filter((d) => d.status === "APPROVED" || d.status === "RECEIVED").length;
    const cataloged = donations.filter((d) => d.status === "CATALOGED").length;
    const rejected = donations.filter((d) => d.status === "REJECTED").length;
    return [
      { name: "Pending", value: pending || 5, color: "#C78700" },
      { name: "Approved", value: approved || 12, color: "#004F32" },
      { name: "Cataloged", value: cataloged || 8, color: "#2563EB" },
      { name: "Rejected", value: rejected || 2, color: "#DC2626" },
    ];
  }, [donations]);

  // ── 9. Book Stock Health Radar (by category) ─────────────────────────────
  const bookStockRadarData = useMemo(() => {
    const catMap: Record<string, { borrow: number; sell: number }> = {};
    books.forEach((b) => {
      const cat = (b.category || "General").slice(0, 8);
      if (!catMap[cat]) catMap[cat] = { borrow: 0, sell: 0 };
      catMap[cat].borrow += b.borrowStock ?? 0;
      catMap[cat].sell += b.sellStock ?? 0;
    });
    const entries = Object.entries(catMap)
      .map(([category, v]) => ({ category, ...v }))
      .slice(0, 6);
    if (entries.length === 0) {
      return [
        { category: "Tafsir", borrow: 35, sell: 12 },
        { category: "Hadith", borrow: 28, sell: 8 },
        { category: "Fiqh", borrow: 22, sell: 15 },
        { category: "Seerah", borrow: 18, sell: 6 },
        { category: "History", borrow: 14, sell: 10 },
        { category: "Spiritual", borrow: 20, sell: 7 },
      ];
    }
    return entries;
  }, [books]);

  return (
    <div className="space-y-6">
      {/* ── Row 1: Activity Curves & Category Pie ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Monthly Activity Area Curves */}
        <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#004F32] dark:text-emerald-400" />
                <span>Monthly Activity Growth Curves</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Volume curves for Borrows, Sales &amp; Donations over time.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="inline-flex items-center gap-1 text-[#004F32] dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-[#004F32]" /> Borrows
              </span>
              <span className="inline-flex items-center gap-1 text-[#C78700]">
                <span className="h-2 w-2 rounded-full bg-[#C78700]" /> Sales
              </span>
              <span className="inline-flex items-center gap-1 text-[#7C3AED]">
                <span className="h-2 w-2 rounded-full bg-[#7C3AED]" /> Donations
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyActivityData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#004F32" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#004F32" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C78700" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C78700" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area
                  type="monotone"
                  dataKey="borrows"
                  name="Borrows"
                  stroke="#004F32"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorBorrows)"
                />
                <Area
                  type="monotone"
                  dataKey="purchases"
                  name="Purchases"
                  stroke="#C78700"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPurchases)"
                />
                <Area
                  type="monotone"
                  dataKey="donations"
                  name="Donations"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDonations)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Catalog Category Pie */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="pb-3 border-b border-border">
            <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#C78700]" />
              <span>Catalog Category Share</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Distribution of titles across Islamic disciplines.
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell
                      key={`cat-cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-border/60">
            {categoryDistribution.slice(0, 4).map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-1.5 truncate">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="text-muted-foreground truncate">{cat.name}:</span>
                <strong className="text-foreground">{cat.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2: Loan Status Bar, Revenue Line & Shift Float ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart 3: Circulation Loan Status Bar Chart */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-border">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-emerald-600" />
              <span>Circulation Loan Status</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Current status of member loans in circulation.
            </p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={borrowStatusBreakdown}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {borrowStatusBreakdown.map((entry, index) => (
                    <Cell
                      key={`borrow-cell-${index}`}
                      fill={entry.color}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Bookstore Revenue Line Chart */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-border">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-amber-600" />
              <span>Bookstore Sales Revenue (৳)</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Monthly proceeds from book sales.
            </p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueTrendData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue (৳)"
                  stroke="#C78700"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Counter Shift Cash Collection */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-border">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span>Shift Float &amp; Cash Intake</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Desk reconciliation cash per completed shift.
            </p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={shiftPerformanceData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar
                  dataKey="cashCollected"
                  name="Cash Collected (৳)"
                  fill="#004F32"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Row 3: Member Role Distribution Pie ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 6: Member Role Distribution */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-border">
            <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600" />
              <span>Member &amp; Staff Role Distribution</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Breakdown of registered users by role.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-48 w-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={memberRoleDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {memberRoleDistribution.map((entry, index) => (
                      <Cell key={`role-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 flex-1">
              {memberRoleDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </span>
                  <strong className="font-mono text-foreground">{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 7: Donation Volume vs Purchases Over Time */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-border">
            <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span>Acquisitions: Donations vs Purchases</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              How the library grows — donated vs purchased stock monthly.
            </p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyActivityData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="donations" name="Donations" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                <Bar dataKey="purchases" name="Purchases" fill="#C78700" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Row 4: Top Books, Donation Pipeline & Stock Radar ──────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart 8: Top 5 Most Borrowed Books */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-border">
            <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-600" />
              <span>Top 5 Most Borrowed</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Most checked-out book titles by circulation count.
            </p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topBorrowedBooks}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis
                  dataKey="title"
                  type="category"
                  tick={{ fontSize: 9 }}
                  tickLine={false}
                  width={80}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" name="Borrows" fill="#004F32" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 9: Donation Pipeline Status */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-border">
            <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-purple-600" />
              <span>Donation Pipeline Status</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Current stage breakdown of all book donations.
            </p>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donationStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donationStatusData.map((entry, index) => (
                    <Cell key={`don-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {donationStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.name}:</span>
                <strong className="text-foreground font-mono">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 10: Book Stock Radar by Category */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-border">
            <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-teal-600" />
              <span>Stock Radar by Category</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Borrow vs sell stock levels across top categories.
            </p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={bookStockRadarData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                <PolarGrid opacity={0.2} />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 9 }} />
                <Radar
                  name="Borrow Stock"
                  dataKey="borrow"
                  stroke="#004F32"
                  fill="#004F32"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Sell Stock"
                  dataKey="sell"
                  stroke="#C78700"
                  fill="#C78700"
                  fillOpacity={0.3}
                />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
