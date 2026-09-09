"use client";

import React from "react";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { ArrowUpRight, BookMarked, BookOpen, Calendar, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { IBorrow } from "@/types/borrow";

interface MemberActiveBorrowsSectionProps {
  borrows: IBorrow[];
  isLoading: boolean;
  borrowsHref: string;
}

export function MemberActiveBorrowsSection({
  borrows,
  isLoading,
  borrowsHref,
}: MemberActiveBorrowsSectionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#004F32] text-white">
            <BookMarked className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">My Borrowed Books</h2>
            <p className="text-xs text-muted-foreground">
              Active checked-out items &amp; status records.
            </p>
          </div>
        </div>
        <Link
          href={borrowsHref}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span>View All ({borrows.length})</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading borrows...
        </div>
      ) : borrows.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground text-xs space-y-2">
          <BookOpen className="h-8 w-8 mx-auto text-muted" />
          <p>You have no borrowed books right now.</p>
          <Link
            href="/books"
            className="inline-block text-primary font-bold hover:underline"
          >
            Browse Catalog to Borrow Books
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {borrows.slice(0, 4).map((borrow) => {
            const daysLeft = borrow.dueDate
              ? differenceInDays(new Date(borrow.dueDate), new Date())
              : null;
            const isUrgent = daysLeft !== null && daysLeft <= 3 && borrow.status === "APPROVED";

            const borrowedDateStr = borrow.approvedAt
              ? format(new Date(borrow.approvedAt), "dd MMM yyyy")
              : borrow.requestedAt
              ? format(new Date(borrow.requestedAt), "dd MMM yyyy")
              : borrow.borrowDate
              ? format(new Date(borrow.borrowDate), "dd MMM yyyy")
              : "Pending";

            return (
              <div
                key={borrow.id}
                className={`group relative overflow-hidden rounded-xl border p-4 transition-all ${
                  isUrgent
                    ? "border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/20"
                    : "border-border bg-muted/20"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="flex h-12 w-10 shrink-0 items-center justify-center rounded-lg bg-[#004F32] text-white font-mono font-bold text-xs shadow-xs">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-sm text-foreground">
                          {borrow.book?.title || `Book #${borrow.bookId}`}
                        </h3>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {borrow.book?.category || "Islamic Literature"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Author: {borrow.book?.author || "Author N/A"}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          Borrowed: {borrowedDateStr}
                        </span>
                        {borrow.dueDate && (
                          <span
                            className={`flex items-center gap-1 font-mono font-bold ${
                              isUrgent
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            <Clock className="h-3 w-3" /> Due:{" "}
                            {format(new Date(borrow.dueDate), "dd MMM yyyy")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/60">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        borrow.status === "APPROVED"
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                          : borrow.status === "PENDING"
                          ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                          : borrow.status === "RETURNED"
                          ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300"
                          : "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300"
                      }`}
                    >
                      {borrow.status === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
                      {borrow.status === "PENDING" && <Clock className="h-3 w-3" />}
                      <span>{borrow.status}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
