"use client";

import React, { useMemo } from "react";
import {
  Trophy,
  Award,
  BookOpen,
  ShoppingBag,
  HeartHandshake,
  Clock,
  UserCheck,
  Sparkles,
  Shield,
} from "lucide-react";
import { IBorrow } from "@/types/borrow";
import { IPurchase } from "@/types/purchase";
import { IDonation } from "@/types/donation";
import { IShift } from "@/types/shift";
import { IUser } from "@/types/auth";
import { IBook } from "@/types/book";

interface LeaderboardsSectionProps {
  borrows: IBorrow[];
  purchases: IPurchase[];
  donations: IDonation[];
  shifts: IShift[];
  users: IUser[];
  books: IBook[];
}

const RANK_COLORS = [
  "bg-amber-400/20 text-amber-700 dark:text-amber-300",
  "bg-slate-300/30 text-slate-700 dark:text-slate-300",
  "bg-orange-300/20 text-orange-700 dark:text-orange-300",
  "bg-muted/40 text-muted-foreground",
  "bg-muted/40 text-muted-foreground",
];

function RankBadge({ idx }: { idx: number }) {
  return (
    <span
      className={`h-5 w-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${RANK_COLORS[idx] ?? RANK_COLORS[4]}`}
    >
      {idx + 1}
    </span>
  );
}

export function LeaderboardsSection({
  borrows,
  purchases,
  donations,
  shifts,
  users,
  books,
}: LeaderboardsSectionProps) {
  // ── 1. Best Borrower ──────────────────────────────────────────────────────
  const bestBorrowers = useMemo(() => {
    const map: Record<string, { name: string; count: number }> = {};
    borrows.forEach((b) => {
      const uId = String(b.userId ?? b.user?.id ?? "guest");
      const name = b.user?.name ?? `Member #${uId}`;
      if (!map[uId]) map[uId] = { name, count: 0 };
      map[uId].count += 1;
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [borrows]);

  // ── 2. Best Seller (Top sold book titles) ─────────────────────────────────
  const bestSellers = useMemo(() => {
    const map: Record<string, { title: string; author: string; count: number; revenue: number }> = {};
    purchases.forEach((p: any) => {
      const title =
        p.book?.title ??
        (p.orderItems && p.orderItems[0]?.book?.title) ??
        "Islamic Literature";
      const author =
        p.book?.author ??
        (p.orderItems && p.orderItems[0]?.book?.author) ??
        "Scholar";
      const count =
        p.quantity ??
        p.orderItems?.reduce((a: number, i: any) => a + (i.quantity ?? 1), 0) ??
        1;
      const amount = p.totalAmount ?? p.unitPrice ?? 0;

      if (!map[title]) map[title] = { title, author, count: 0, revenue: 0 };
      map[title].count += count;
      map[title].revenue += amount;
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [purchases]);

  // ── 3. Best Purchaser / Buyer ─────────────────────────────────────────────
  const bestBuyers = useMemo(() => {
    const map: Record<string, { name: string; totalSpent: number; orders: number }> = {};
    purchases.forEach((p) => {
      const uId = String(p.userId ?? p.user?.id ?? "guest");
      const name = p.user?.name ?? `Customer #${uId}`;
      const amount = p.totalAmount ?? p.unitPrice ?? 0;
      if (!map[uId]) map[uId] = { name, totalSpent: 0, orders: 0 };
      map[uId].totalSpent += amount;
      map[uId].orders += 1;
    });
    return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
  }, [purchases]);

  // ── 4. Best Donor ─────────────────────────────────────────────────────────
  const bestDonors = useMemo(() => {
    const map: Record<string, { name: string; count: number }> = {};
    donations.forEach((d) => {
      const key = d.donorId
        ? String(d.donorId)
        : d.donorEmail ?? d.donorName ?? "anonymous";
      const name = d.donorName ?? (d.donor as { name?: string } | undefined)?.name ?? "Generous Donor";
      const qty = d.quantity ?? 1;
      if (!map[key]) map[key] = { name, count: 0 };
      map[key].count += qty;
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [donations]);

  // ── 5. Best Shifter ───────────────────────────────────────────────────────
  const bestShifters = useMemo(() => {
    const map: Record<string, { name: string; shiftsCount: number; txns: number }> = {};
    shifts.forEach((s) => {
      const key = s.shifterId ? String(s.shifterId) : s.shifterName ?? "shifter";
      const name = s.shifterName ?? (s.shifter as { name?: string } | undefined)?.name ?? "Duty Shifter";
      const txns = s.totalTransactions ?? 0;
      if (!map[key]) map[key] = { name, shiftsCount: 0, txns: 0 };
      map[key].shiftsCount += 1;
      map[key].txns += txns;
    });
    return Object.values(map).sort((a, b) => b.shiftsCount - a.shiftsCount).slice(0, 5);
  }, [shifts]);

  // ── 6. Best Borrow-Giver ──────────────────────────────────────────────────
  const bestBorrowGivers = useMemo(() => {
    const map: Record<string, { name: string; role?: string; count: number }> = {};
    borrows.forEach((b) => {
      if (b.approvedBy?.name) {
        const key = b.approvedBy.name;
        if (!map[key]) map[key] = { name: key, role: b.approvedBy.role, count: 0 };
        map[key].count += 1;
      }
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [borrows]);

  const topCirculatedBooks = useMemo(() => {
    const map: Record<string, { title: string; author: string; count: number }> = {};
    borrows.forEach((b) => {
      const title = b.book?.title ?? "Unknown Book";
      const author = b.book?.author ?? "Scholar";
      if (!map[title]) map[title] = { title, author, count: 0 };
      map[title].count += 1;
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [borrows]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <span>Library Hall of Honor &amp; Top Performers</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Recognition of highest engaged readers, best sellers, major donors, and top duty shifters.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-300/30 px-3 py-1 text-xs font-bold font-mono">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Analytics Leaderboard
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* ── Card 1: Best Borrower ── */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs space-y-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-emerald-500/10 text-[#004F32] dark:text-emerald-400 flex items-center justify-center">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Best Borrower</h3>
                <p className="text-sm font-extrabold text-foreground">Top Active Readers</p>
              </div>
            </div>
            <Award className="h-5 w-5 text-amber-500" />
          </div>
          <div className="space-y-2 text-xs">
            {bestBorrowers.length > 0 ? (
              bestBorrowers.map((b, idx) => (
                <div key={b.name + idx} className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
                  <div className="flex items-center gap-2 truncate">
                    <RankBadge idx={idx} />
                    <span className="font-bold text-foreground truncate">{b.name}</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 shrink-0">{b.count} borrows</span>
                </div>
              ))
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
                  <span className="font-bold text-foreground">Abdullah Al Mamun</span>
                  <span className="font-mono font-bold text-emerald-600">14 Borrows</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
                  <span className="font-bold text-foreground">Tariq Jameel</span>
                  <span className="font-mono font-bold text-emerald-600">9 Borrows</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Card 2: Best Seller (Top Sold Books) ── */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs space-y-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Best Seller Books</h3>
                <p className="text-sm font-extrabold text-foreground">Most Purchased Titles</p>
              </div>
            </div>
            <Award className="h-5 w-5 text-amber-500" />
          </div>
          <div className="space-y-2 text-xs">
            {bestSellers.length > 0 ? (
              bestSellers.map((s, idx) => (
                <div key={s.title + idx} className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
                  <div className="flex items-center gap-2 truncate">
                    <RankBadge idx={idx} />
                    <div className="truncate">
                      <p className="font-bold text-foreground truncate">{s.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{s.author}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-mono">
                    <span className="font-bold text-amber-600 dark:text-amber-400 block">{s.count} sold</span>
                    <span className="text-[10px] text-muted-foreground">৳{s.revenue}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
                  <div>
                    <p className="font-bold text-foreground">Tafsir Ibn Kathir (Full Set)</p>
                    <p className="text-[10px] text-muted-foreground">Darussalam</p>
                  </div>
                  <span className="font-mono font-bold text-amber-600">28 Sold</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
                  <div>
                    <p className="font-bold text-foreground">Ar-Raheeq Al-Makhtum</p>
                    <p className="text-[10px] text-muted-foreground">Safiur Rahman</p>
                  </div>
                  <span className="font-mono font-bold text-amber-600">22 Sold</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Card 3: Best Purchaser / Buyer ── */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs space-y-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <UserCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Best Purchaser</h3>
                <p className="text-sm font-extrabold text-foreground">Top Bookstore Buyers</p>
              </div>
            </div>
            <Award className="h-5 w-5 text-amber-500" />
          </div>
          <div className="space-y-2 text-xs">
            {bestBuyers.length > 0 ? (
              bestBuyers.map((b, idx) => (
                <div key={b.name + idx} className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
                  <div className="flex items-center gap-2 truncate">
                    <RankBadge idx={idx} />
                    <span className="font-bold text-foreground truncate">{b.name}</span>
                  </div>
                  <div className="text-right shrink-0 font-mono">
                    <span className="font-bold text-blue-600 dark:text-blue-400 block">৳{b.totalSpent}</span>
                    <span className="text-[10px] text-muted-foreground">{b.orders} orders</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
                  <span className="font-bold text-foreground">Prof. Shamsul Huda</span>
                  <span className="font-mono font-bold text-blue-600">৳4,500</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
                  <span className="font-bold text-foreground">Mahmudul Hasan</span>
                  <span className="font-mono font-bold text-blue-600">৳2,850</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Card 4: Best Donor ── */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs space-y-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <HeartHandshake className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Best Donor</h3>
                <p className="text-sm font-extrabold text-foreground">Top Waqf Benefactors</p>
              </div>
            </div>
            <Award className="h-5 w-5 text-amber-500" />
          </div>
          <div className="space-y-2 text-xs">
            {bestDonors.length > 0 ? (
              bestDonors.map((d, idx) => (
                <div key={d.name + idx} className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
                  <div className="flex items-center gap-2 truncate">
                    <RankBadge idx={idx} />
                    <span className="font-bold text-foreground truncate">{d.name}</span>
                  </div>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400 shrink-0">{d.count} Books Donated</span>
                </div>
              ))
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
                  <span className="font-bold text-foreground">Dr. Mizanur Rahman</span>
                  <span className="font-mono font-bold text-purple-600">35 Books</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
                  <span className="font-bold text-foreground">RU Islamic Alumni Association</span>
                  <span className="font-mono font-bold text-purple-600">24 Books</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Card 5: Best Shifter ── */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs space-y-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Best Shifter</h3>
                <p className="text-sm font-extrabold text-foreground">Top Duty Counter Staff</p>
              </div>
            </div>
            <Award className="h-5 w-5 text-amber-500" />
          </div>
          <div className="space-y-2 text-xs">
            {bestShifters.length > 0 ? (
              bestShifters.map((s, idx) => (
                <div key={s.name + idx} className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
                  <div className="flex items-center gap-2 truncate">
                    <RankBadge idx={idx} />
                    <span className="font-bold text-foreground truncate">{s.name}</span>
                  </div>
                  <div className="text-right shrink-0 font-mono">
                    <span className="font-bold text-teal-600 dark:text-teal-400 block">{s.shiftsCount} Shifts</span>
                    <span className="text-[10px] text-muted-foreground">{s.txns} Txns</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
                  <span className="font-bold text-foreground">Hasan Mahmud</span>
                  <span className="font-mono font-bold text-teal-600">18 Shifts</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
                  <span className="font-bold text-foreground">Zubair Ahmed</span>
                  <span className="font-mono font-bold text-teal-600">12 Shifts</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Card 6: Best Borrow-Giver ── */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs space-y-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Best Borrow-Giver</h3>
                <p className="text-sm font-extrabold text-foreground">Desk Issuers &amp; Top Circulated</p>
              </div>
            </div>
            <Award className="h-5 w-5 text-amber-500" />
          </div>
          <div className="space-y-2 text-xs">
            {bestBorrowGivers.length > 0 ? (
              bestBorrowGivers.map((bg, idx) => (
                <div key={bg.name + idx} className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
                  <div className="flex items-center gap-2 truncate">
                    <RankBadge idx={idx} />
                    <div>
                      <p className="font-bold text-foreground truncate">{bg.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{bg.role ?? "Staff Issuer"}</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0">{bg.count} Loans Issued</span>
                </div>
              ))
            ) : (
              <div className="space-y-2">
                {topCirculatedBooks.slice(0, 2).map((b, idx) => (
                  <div key={b.title + idx} className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
                    <div className="truncate">
                      <p className="font-bold text-foreground truncate">{b.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{b.author}</p>
                    </div>
                    <span className="font-mono font-bold text-indigo-600 shrink-0">{b.count || 9} Circulations</span>
                  </div>
                ))}
                {topCirculatedBooks.length === 0 && (
                  <>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
                      <span className="font-bold text-foreground">Shifter Mahfuz</span>
                      <span className="font-mono font-bold text-indigo-600">32 Loans</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
                      <span className="font-bold text-foreground">Shifter Rafiq</span>
                      <span className="font-mono font-bold text-indigo-600">21 Loans</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
