"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Play,
  Square,
  Clock,
  Search,
  CheckCircle2,
  UserCheck,
  BookOpen,
  ShieldCheck,
  Calendar,
  ShoppingBag,
  BookMarked,
  Printer,
  X,
  Sparkles,
  Phone,
  Mail,
  Receipt,
  User,
  AlertCircle,
  Hash,
  Coins,
  Package,
  HeartHandshake,
  TrendingUp,
  ClipboardList,
} from "lucide-react";
import { useActiveShift, useMySchedule, useGetAllShiftLogs } from "@/hooks/useShifts";
import { useGetBooks } from "@/hooks/useBooks";
import { useGetUsers } from "@/hooks/useUsers";
import { useGetAllBorrows, useIssueBook, useReturnBook } from "@/hooks/useBorrows";
import { useCreatePOSSale, useGetAllPurchases } from "@/hooks/usePurchases";
import { useCreatePOSDonation, useGetDonations } from "@/hooks/useDonations";
import { StartShiftModal } from "@/components/shifter/StartShiftModal";
import { EndShiftModal } from "@/components/shifter/EndShiftModal";
import { ScheduleShiftModal } from "@/components/shifter/ScheduleShiftModal";
import { ShiftTasksTracker } from "@/components/shift/ShiftTasksTracker";
import { IBook } from "@/types/book";
import { IUser } from "@/types/auth";
import { IPurchase } from "@/types/purchase";
import { IDonation } from "@/types/donation";
import { StatisticalDiagramsSection } from "@/components/dashboard/analytics/StatisticalDiagramsSection";
import { LeaderboardsSection } from "@/components/dashboard/analytics/LeaderboardsSection";
import { CompleteOfflineShiftModal } from "@/components/shift/CompleteOfflineShiftModal";
import { IShift, IShifterSchedule } from "@/types/shift";
import { format } from "date-fns";
import { toast } from "sonner";

// ─── POS Printable Receipt Modal ──────────────────────────────────────────────
function POSReceiptModal({
  sale,
  isOpen,
  onClose,
}: {
  sale: IPurchase | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in-50">
      <div className="relative w-full max-w-md rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-2xl space-y-4 my-6 sm:my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer print:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Printable Receipt Card */}
        <div id="pos-receipt-print" className="space-y-4 text-xs font-mono">
          {/* Header */}
          <div className="text-center border-b border-border/80 pb-3 space-y-1">
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-foreground font-sans">
              RU ISLAMIC LIBRARY
            </h2>
            <p className="text-[10px] text-muted-foreground font-sans">
              University of Rajshahi • POS Counter Desk
            </p>
            <p className="text-[10px] text-muted-foreground">
              {format(new Date(sale.createdAt || Date.now()), "dd/MM/yyyy hh:mm a")}
            </p>
            <div className="pt-1">
              <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold">
                TXN: {sale.transactionId || `#${sale.id}`}
              </span>
            </div>
          </div>

          {/* Customer info */}
          <div className="space-y-1 border-b border-border/80 pb-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer Type:</span>
              <span className="font-bold text-foreground">
                {sale.userId ? "Registered Member" : "Guest Customer"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-bold text-foreground truncate max-w-[200px]">
                {sale.customerName || "Walk-in Guest"}
              </span>
            </div>
            {sale.customerPhone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span>{sale.customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Mode:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {sale.paymentMethod || "CASH"} (PAID)
              </span>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2 border-b border-border/80 pb-3">
            <div className="flex justify-between font-bold text-foreground border-b border-border/40 pb-1 text-[11px]">
              <span>Book Description</span>
              <span className="text-right">Amount</span>
            </div>
            <div className="flex justify-between items-start text-foreground gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{sale.book?.title || "Library Book"}</p>
                <p className="text-[10px] text-muted-foreground">
                  Qty: {sale.quantity || 1} × ৳{sale.unitPrice || sale.totalAmount}
                </p>
              </div>
              <span className="font-bold shrink-0">৳{sale.totalAmount}</span>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-1 text-right">
            <div className="flex justify-between font-extrabold text-sm text-foreground pt-1">
              <span>TOTAL COLLECTED:</span>
              <span className="text-emerald-700 dark:text-emerald-400">৳{sale.totalAmount}</span>
            </div>
          </div>

          <div className="text-center pt-3 text-[10px] text-muted-foreground font-sans border-t border-border/60">
            <p>JazakAllah Khair for patronizing Rajshahi University Islamic Library.</p>
            <p className="mt-0.5 font-bold">Knowledge for This World &amp; the Hereafter</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-2 border-t border-border print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4 text-amber-300" />
            <span>Print Counter Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── POS Donation Intake Slip Modal ───────────────────────────────────────────
function POSDonationSlipModal({
  donation,
  isOpen,
  onClose,
}: {
  donation: import("@/types/donation").IDonation | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !donation) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in-50">
      <div className="relative w-full max-w-md rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-2xl space-y-4 my-6 sm:my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer print:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Printable Donation Acknowledgment Slip */}
        <div id="pos-donation-slip-print" className="space-y-4 text-xs font-mono">
          {/* Header */}
          <div className="text-center border-b border-border/80 pb-3 space-y-1">
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-foreground font-sans">
              RU ISLAMIC LIBRARY
            </h2>
            <p className="text-[10px] text-muted-foreground font-sans">
              University of Rajshahi • Book Donation Acknowledgment
            </p>
            <p className="text-[10px] text-muted-foreground">
              {format(new Date(donation.createdAt || Date.now()), "dd/MM/yyyy hh:mm a")}
            </p>
            {donation.id && (
              <div className="pt-1">
                <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold">
                  REF: DON-{String(donation.id).toUpperCase().slice(-8)}
                </span>
              </div>
            )}
          </div>

          {/* Donor Info */}
          <div className="space-y-1 border-b border-border/80 pb-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Donor Type:</span>
              <span className="font-bold text-foreground">
                {donation.donorId ? "Registered Member" : "Walk-in Guest"}
              </span>
            </div>
            {!donation.isAnonymous && donation.donorName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Donor Name:</span>
                <span className="font-bold text-foreground truncate max-w-[200px]">
                  {donation.donorName}
                </span>
              </div>
            )}
            {donation.isAnonymous && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Identity:</span>
                <span className="font-bold text-foreground italic">Anonymous Donor</span>
              </div>
            )}
            {donation.contactPhone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span>{donation.contactPhone}</span>
              </div>
            )}
            {donation.donorEmail && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="truncate max-w-[200px]">{donation.donorEmail}</span>
              </div>
            )}
          </div>

          {/* Book Details */}
          <div className="space-y-2 border-b border-border/80 pb-3">
            <div className="font-bold text-foreground border-b border-border/40 pb-1 text-[11px]">
              Donated Book Details
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-start gap-2">
                <span className="text-muted-foreground shrink-0">Book Title:</span>
                <span className="font-bold text-foreground text-right">{donation.bookTitle || "—"}</span>
              </div>
              {donation.author && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Author:</span>
                  <span>{donation.author}</span>
                </div>
              )}
              {donation.category && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{donation.category}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Qty. Received:</span>
                <span className="font-bold text-foreground">{donation.quantity || 1} copy(ies)</span>
              </div>
              {donation.condition && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condition:</span>
                  <span className="font-bold">{donation.condition}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-bold text-amber-700 dark:text-amber-400">
                  {donation.status || "PENDING"} — Pending Review
                </span>
              </div>
            </div>
          </div>

          {/* Donor note */}
          {donation.donorNote && (
            <div className="border-b border-border/80 pb-3 space-y-1">
              <p className="text-muted-foreground text-[10px]">Donor Note:</p>
              <p className="italic text-foreground">&quot;{donation.donorNote}&quot;</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-3 text-[10px] text-muted-foreground font-sans border-t border-border/60">
            <p>JazakAllah Khair for your generous book donation.</p>
            <p className="mt-0.5">This slip serves as your official intake acknowledgment.</p>
            <p className="mt-0.5 font-bold">Knowledge for This World &amp; the Hereafter</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-2 border-t border-border print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4 text-amber-300" />
            <span>Print Donation Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Shifter Counter Desk Page ───────────────────────────────────────────
export default function ShifterCounterDeskPage() {
  const { data: activeShift, isLoading: isShiftLoading } = useActiveShift();
  const { data: booksData } = useGetBooks({ limit: 1000 });
  const { data: users = [] } = useGetUsers();
  const { data: borrows = [] } = useGetAllBorrows();
  const { data: purchases = [] } = useGetAllPurchases();
  const { data: donations = [] } = useGetDonations();
  const { data: shiftLogs = [] } = useGetAllShiftLogs();

  const { mutate: issueBorrow, isPending: isIssuingBorrow } = useIssueBook();
  const { mutate: createPOSSale, isPending: isProcessingSale } = useCreatePOSSale();
  const { mutate: returnBook, isPending: isReturning } = useReturnBook();
  const { mutate: createPOSDonation, isPending: isProcessingDonation } = useCreatePOSDonation();

  const [startModalOpen, setStartModalOpen] = useState(false);
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [latestSale, setLatestSale] = useState<IPurchase | null>(null);
  const [donationSlipOpen, setDonationSlipOpen] = useState(false);
  const [latestDonation, setLatestDonation] = useState<IDonation | null>(null);

  const { data: mySchedules = [] } = useMySchedule();
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const [offlineShiftId, setOfflineShiftId] = useState<number | string | null>(null);
  const [offlineShifterName, setOfflineShifterName] = useState<string>("");

  const [endShiftPrefill, setEndShiftPrefill] = useState<{
    tasksCompleted: string;
    handoverNotes: string;
  }>({ tasksCompleted: "", handoverNotes: "" });

  const latestCompletedShift = useMemo(() => {
    return shiftLogs.find((s: IShift) => s.status === "COMPLETED") || null;
  }, [shiftLogs]);

  const handleOpenEndShiftWithTasks = (prefill: {
    tasksCompleted: string;
    handoverNotes: string;
  }) => {
    setEndShiftPrefill(prefill);
    setEndModalOpen(true);
  };

  const [elapsedTime, setElapsedTime] = useState("00:00:00");

  // Counter Workspace Mode: "BORROW" | "SELL" | "DONATE"
  const [counterMode, setCounterMode] = useState<"BORROW" | "SELL" | "DONATE">("BORROW");

  // ─── Direct Borrow State (Member without phone / no internet) ───────────────
  const [borrowMemberSearch, setBorrowMemberSearch] = useState("");
  const [selectedBorrowMember, setSelectedBorrowMember] = useState<IUser | null>(null);
  const [borrowBookSearch, setBorrowBookSearch] = useState("");
  const [selectedBorrowBook, setSelectedBorrowBook] = useState<IBook | null>(null);
  const [borrowDueDate, setBorrowDueDate] = useState("");

  // ─── POS Sale State (Member OR Walk-in Guest) ────────────────────────────────
  const [buyerType, setBuyerType] = useState<"MEMBER" | "GUEST">("MEMBER");
  const [saleMemberSearch, setSaleMemberSearch] = useState("");
  const [selectedSaleMember, setSelectedSaleMember] = useState<IUser | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const [saleBookSearch, setSaleBookSearch] = useState("");
  const [selectedSaleBook, setSelectedSaleBook] = useState<IBook | null>(null);
  const [saleQuantity, setSaleQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "ONLINE">("CASH");
  const [cashGiven, setCashGiven] = useState<string>("");

  // ─── POS Donation State ──────────────────────────────────────────────────────
  const [donorType, setDonorType] = useState<"MEMBER" | "GUEST">("GUEST");
  const [donorMemberSearch, setDonorMemberSearch] = useState("");
  const [selectedDonorMember, setSelectedDonorMember] = useState<IUser | null>(null);
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donBookTitle, setDonBookTitle] = useState("");
  const [donAuthor, setDonAuthor] = useState("");
  const [donCategory, setDonCategory] = useState("");
  const [donQuantity, setDonQuantity] = useState(1);
  const [donCondition, setDonCondition] = useState("GOOD");
  const [donNote, setDonNote] = useState("");
  const [donIsAnonymous, setDonIsAnonymous] = useState(false);

  const isShiftActive = activeShift && activeShift.status === "ACTIVE";

  // All catalog books
  const catalogBooks: IBook[] = useMemo(() => {
    if (!booksData) return [];
    if (Array.isArray(booksData)) return booksData;
    return booksData.data || [];
  }, [booksData]);

  // Elapsed Duty Timer
  useEffect(() => {
    if (!activeShift || activeShift.status !== "ACTIVE") {
      setElapsedTime("00:00:00");
      return;
    }

    const interval = setInterval(() => {
      const start = new Date(activeShift.startTime).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (n: number) => n.toString().padStart(2, "0");
      setElapsedTime(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeShift]);

  // Auto-calculate loan due date when book changes
  useEffect(() => {
    if (selectedBorrowBook) {
      const pages = selectedBorrowBook.pages || 0;
      const days = Math.max(1, Math.ceil(pages / 15));
      const due = new Date();
      due.setDate(due.getDate() + days);
      setBorrowDueDate(due.toISOString().split("T")[0]);
    }
  }, [selectedBorrowBook]);

  // Matching member lookups
  const matchingBorrowMembers = useMemo(() => {
    if (!borrowMemberSearch.trim()) return [];
    const term = borrowMemberSearch.toLowerCase();
    return users.filter(
      (u) =>
        (u.name ?? "").toLowerCase().includes(term) ||
        (u.studentOrVoterId ?? "").toLowerCase().includes(term) ||
        (u.phone ?? u.phoneNumber ?? "").toLowerCase().includes(term) ||
        (u.email ?? "").toLowerCase().includes(term)
    );
  }, [borrowMemberSearch, users]);

  const matchingSaleMembers = useMemo(() => {
    if (!saleMemberSearch.trim()) return [];
    const term = saleMemberSearch.toLowerCase();
    return users.filter(
      (u) =>
        (u.name ?? "").toLowerCase().includes(term) ||
        (u.studentOrVoterId ?? "").toLowerCase().includes(term) ||
        (u.phone ?? u.phoneNumber ?? "").toLowerCase().includes(term) ||
        (u.email ?? "").toLowerCase().includes(term)
    );
  }, [saleMemberSearch, users]);

  // Books filtered for borrowing
  const borrowableBooks = useMemo(() => {
    if (!borrowBookSearch.trim()) return [];
    const term = borrowBookSearch.toLowerCase();
    return catalogBooks.filter(
      (b) =>
        b.type !== "SELL_ONLY" &&
        ((b.title ?? "").toLowerCase().includes(term) ||
          (b.isbn ?? "").toLowerCase().includes(term) ||
          (b.author ?? "").toLowerCase().includes(term) ||
          (b.locationCell ?? "").toLowerCase().includes(term))
    );
  }, [borrowBookSearch, catalogBooks]);

  // Books filtered for selling
  const sellableBooks = useMemo(() => {
    if (!saleBookSearch.trim()) return [];
    const term = saleBookSearch.toLowerCase();
    return catalogBooks.filter(
      (b) =>
        b.type !== "BORROW_ONLY" &&
        b.sellPrice != null &&
        b.sellPrice > 0 &&
        ((b.title ?? "").toLowerCase().includes(term) ||
          (b.isbn ?? "").toLowerCase().includes(term) ||
          (b.author ?? "").toLowerCase().includes(term))
    );
  }, [saleBookSearch, catalogBooks]);

  // Member active borrow count check
  const memberActiveBorrowsCount = useMemo(() => {
    if (!selectedBorrowMember) return 0;
    return borrows.filter(
      (b) =>
        String(b.userId) === String(selectedBorrowMember.id) &&
        (b.status === "APPROVED" || b.status === "PENDING" || b.status === "OVERDUE")
    ).length;
  }, [selectedBorrowMember, borrows]);

  const isMemberExpired = useMemo(() => {
    if (!selectedBorrowMember) return false;
    if (!selectedBorrowMember.membershipExpiresAt) return false;
    return new Date(selectedBorrowMember.membershipExpiresAt) < new Date();
  }, [selectedBorrowMember]);

  // Handle Direct Borrow Submission
  const handleExecuteDirectBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isShiftActive) {
      toast.error("Please start your duty shift first before issuing books.");
      return;
    }
    if (!selectedBorrowMember) {
      toast.error("Please search and select a registered library member.");
      return;
    }
    if (!selectedBorrowBook) {
      toast.error("Please search and select a book to borrow.");
      return;
    }
    if ((selectedBorrowBook.borrowStock ?? 0) <= 0) {
      toast.error(`"${selectedBorrowBook.title}" is out of stock for borrowing.`);
      return;
    }
    if (memberActiveBorrowsCount >= 5) {
      toast.error(`Member has reached max 5 active borrows limit.`);
      return;
    }

    issueBorrow(
      {
        bookId: Number(selectedBorrowBook.id),
        memberId: Number(selectedBorrowMember.id),
        dueDate: borrowDueDate ? new Date(borrowDueDate).toISOString() : undefined,
      },
      {
        onSuccess: () => {
          setSelectedBorrowMember(null);
          setSelectedBorrowBook(null);
          setBorrowMemberSearch("");
          setBorrowBookSearch("");
        },
      }
    );
  };

  // Handle POS Sale Submission
  const handleExecutePOSSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isShiftActive) {
      toast.error("Please start your duty shift first before selling books.");
      return;
    }
    if (!selectedSaleBook) {
      toast.error("Please select a book to sell.");
      return;
    }
    if (buyerType === "MEMBER" && !selectedSaleMember) {
      toast.error("Please search and select a registered library member.");
      return;
    }
    if ((selectedSaleBook.sellStock ?? 0) < saleQuantity) {
      toast.error(`Only ${selectedSaleBook.sellStock ?? 0} copies available in sale stock.`);
      return;
    }

    const payload = {
      buyerType,
      memberId: buyerType === "MEMBER" && selectedSaleMember ? Number(selectedSaleMember.id) : undefined,
      customerName:
        buyerType === "MEMBER" && selectedSaleMember
          ? selectedSaleMember.name
          : guestName.trim() || "Walk-in Guest",
      customerPhone:
        buyerType === "MEMBER" && selectedSaleMember
          ? selectedSaleMember.phone || selectedSaleMember.phoneNumber || ""
          : guestPhone.trim(),
      customerEmail:
        buyerType === "MEMBER" && selectedSaleMember
          ? selectedSaleMember.email
          : guestEmail.trim() || undefined,
      bookId: Number(selectedSaleBook.id),
      quantity: saleQuantity,
      paymentMethod,
    };

    createPOSSale(payload, {
      onSuccess: (result) => {
        setLatestSale(result);
        setReceiptModalOpen(true);
        setSelectedSaleBook(null);
        setSelectedSaleMember(null);
        setSaleMemberSearch("");
        setSaleBookSearch("");
        setGuestName("");
        setGuestPhone("");
        setGuestEmail("");
        setSaleQuantity(1);
        setCashGiven("");
      },
    });
  };

  // Calculations for POS Sale
  const totalSaleAmount = (selectedSaleBook?.sellPrice || 0) * saleQuantity;
  const cashNum = parseFloat(cashGiven) || 0;
  const changeToReturn = cashNum >= totalSaleAmount ? cashNum - totalSaleAmount : 0;

  // Recent Desk Borrows
  const recentDeskBorrows = useMemo(() => {
    return borrows.slice(0, 5);
  }, [borrows]);

  // Donor member search
  const matchingDonorMembers = useMemo(() => {
    if (!donorMemberSearch.trim()) return [];
    const term = donorMemberSearch.toLowerCase();
    return users.filter(
      (u) =>
        (u.name ?? "").toLowerCase().includes(term) ||
        (u.studentOrVoterId ?? "").toLowerCase().includes(term) ||
        (u.phone ?? u.phoneNumber ?? "").toLowerCase().includes(term) ||
        (u.email ?? "").toLowerCase().includes(term)
    );
  }, [donorMemberSearch, users]);

  // Recent POS Donations
  const recentDeskDonations = useMemo(() => {
    return (donations || [])
      .filter((d: IDonation) => d.method === "LIBRARY_DROP_OFF")
      .slice(0, 5);
  }, [donations]);

  // Handle POS Donation Submission
  const handleExecutePOSDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isShiftActive) {
      toast.error("Please start your duty shift first before accepting donations.");
      return;
    }
    if (!donBookTitle.trim()) {
      toast.error("Please enter the book title being donated.");
      return;
    }
    if (donorType === "MEMBER" && !selectedDonorMember) {
      toast.error("Please search and select a registered library member.");
      return;
    }

    createPOSDonation(
      {
        donorType,
        memberId: donorType === "MEMBER" && selectedDonorMember ? Number(selectedDonorMember.id) : undefined,
        donorName:
          donorType === "MEMBER" && selectedDonorMember
            ? selectedDonorMember.name
            : donorName.trim() || "Walk-in Donor",
        donorEmail:
          donorType === "MEMBER" && selectedDonorMember
            ? selectedDonorMember.email
            : donorEmail.trim() || undefined,
        contactPhone:
          donorType === "MEMBER" && selectedDonorMember
            ? selectedDonorMember.phone || selectedDonorMember.phoneNumber || ""
            : donorPhone.trim() || undefined,
        isAnonymous: donIsAnonymous,
        donorNote: donNote.trim() || undefined,
        condition: donCondition,
        bookTitle: donBookTitle.trim(),
        author: donAuthor.trim() || undefined,
        category: donCategory.trim() || undefined,
        quantity: donQuantity,
        autoCatalog: true,
      },
      {
        onSuccess: (donation) => {
          setLatestDonation(donation);
          setDonationSlipOpen(true);
          setDonBookTitle("");
          setDonAuthor("");
          setDonCategory("");
          setDonQuantity(1);
          setDonCondition("GOOD");
          setDonNote("");
          setDonIsAnonymous(false);
          setDonorName("");
          setDonorPhone("");
          setDonorEmail("");
          setSelectedDonorMember(null);
          setDonorMemberSearch("");
        },
      }
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 sm:space-y-6 pb-12 px-1 sm:px-0">
      {/* ─── Responsive Active Shift Header Bar ────────────────────────────── */}
      <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-3.5 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Shift status & timer */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div
              className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl font-mono text-white shadow-xs ${
                isShiftActive ? "bg-[#004F32]" : "bg-muted-foreground/30"
              }`}
            >
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-amber-300" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  POS Counter Desk:
                </span>
                {isShiftActive ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Active Shift
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-300/40">
                    Desk Locked / Shift Inactive
                  </span>
                )}
              </div>

              {isShiftActive ? (
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-foreground">
                  <span>
                    Duty Duration: <strong className="text-primary">{elapsedTime}</strong>
                  </span>
                  <span className="text-muted-foreground hidden sm:inline">•</span>
                  <span>
                    Cash Float: <strong className="text-amber-600 dark:text-amber-400">৳{activeShift.openingCash ?? activeShift.startingCash ?? 0}</strong>
                  </span>
                </div>
              ) : (
                <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground line-clamp-1">
                  Start your shift to unlock book issuance &amp; in-person POS sales.
                </p>
              )}
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
            <Link
              href="/dashboard/shifter/books"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-input bg-background hover:bg-accent px-3 py-2 text-xs font-semibold text-foreground transition-colors shadow-2xs"
            >
              <Package className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Books Directory</span>
            </Link>
            <Link
              href="/dashboard/shifter/members"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-input bg-background hover:bg-accent px-3 py-2 text-xs font-semibold text-foreground transition-colors shadow-2xs"
            >
              <UserCheck className="h-3.5 w-3.5 text-[#004F32]" />
              <span>Members</span>
            </Link>
            <Link
              href="/dashboard/shifter/borrows"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-input bg-background hover:bg-accent px-3 py-2 text-xs font-semibold text-foreground transition-colors shadow-2xs"
            >
              <BookMarked className="h-3.5 w-3.5 text-blue-600" />
              <span>Borrow Log</span>
            </Link>
            <Link
              href="/dashboard/shifter/shift-logs"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-input bg-background hover:bg-accent px-3 py-2 text-xs font-semibold text-foreground transition-colors shadow-2xs"
            >
              <ClipboardList className="h-3.5 w-3.5 text-primary" />
              <span>Shift Handover Logs</span>
            </Link>

            {!isShiftActive ? (
              <button
                onClick={() => setStartModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 px-4 py-2 text-xs font-bold text-white shadow-md focus:ring-2 focus:ring-emerald-400 transition-all cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 text-amber-300" />
                <span>Start Duty Shift</span>
              </button>
            ) : (
              <button
                onClick={() => setEndModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#C78700] hover:bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md focus:ring-2 focus:ring-amber-300 transition-all cursor-pointer"
              >
                <Square className="h-3.5 w-3.5" />
                <span>End Shift &amp; Reconcile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Previous Shift Handover & Active Duty Tasks Tracker ───────────── */}
      <ShiftTasksTracker
        activeShift={activeShift || null}
        latestCompletedShift={latestCompletedShift}
        onOpenEndShiftModal={handleOpenEndShiftWithTasks}
      />

      {/* ─── My Recurring Duty Schedule & Offline Action ───────────────────── */}
      {mySchedules.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold text-foreground">
                আমার নির্ধারিত নামাজ ভিত্তিক সময়সূচি (My Fixed Prayer-time Duty Roster)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const targetShift = shiftLogs.find(
                    (s: IShift) => s.status === "ACTIVE" || s.status === "SCHEDULED"
                  );
                  setOfflineShiftId(targetShift?.id || activeShift?.id || 1);
                  setOfflineShifterName(activeShift?.shifterName || "Self");
                  setOfflineModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
              >
                <span>অফলাইন / বিলম্বিত শিফট এন্ট্রি (Complete Offline)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {mySchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-foreground">{schedule.dayName}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">({schedule.dayEn})</span>
                  </div>
                  <p className="text-[11px] text-primary font-bold mt-0.5">
                    {schedule.slotName} · {schedule.startTime} – {schedule.endTime}
                  </p>
                </div>
                {!isShiftActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setStartModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                  >
                    শুরু করুন
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Responsive Mode Tabs (Borrow vs Sell vs Donate) ─────────────────── */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-2xl bg-muted/60 border border-border/80 w-full">
          <button
            type="button"
            onClick={() => setCounterMode("BORROW")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              counterMode === "BORROW"
                ? "bg-[#004F32] text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <BookMarked className="h-4 w-4 text-amber-300 shrink-0" />
            <span className="truncate">1. In-Person Borrow (No Phone / Offline)</span>
          </button>

          <button
            type="button"
            onClick={() => setCounterMode("SELL")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              counterMode === "SELL"
                ? "bg-[#004F32] text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <ShoppingBag className="h-4 w-4 text-amber-300 shrink-0" />
            <span className="truncate">2. POS Book Sale (Member &amp; Guest)</span>
          </button>

          <button
            type="button"
            onClick={() => setCounterMode("DONATE")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              counterMode === "DONATE"
                ? "bg-[#004F32] text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <HeartHandshake className="h-4 w-4 text-amber-300 shrink-0" />
            <span className="truncate">3. POS Donation Intake (Book Drop-Off)</span>
          </button>
        </div>

        <p className="text-[11px] sm:text-xs text-muted-foreground px-1">
          {counterMode === "BORROW"
            ? "Issue books instantly to library members who do not have a phone with them or lack internet connectivity."
            : counterMode === "SELL"
            ? "Sell library inventory with instant cash change calculation or digital payment to members and guest customers."
            : "Record book donations brought in person at the counter desk and print a donor acknowledgment slip."}
        </p>
      </div>

      {/* ─── MODE 1: DIRECT IN-PERSON BORROW ───────────────────────────────── */}
      {counterMode === "BORROW" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Main Borrow Form */}
          <div className="lg:col-span-2 space-y-5 min-w-0">
            <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-5">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#004F32] text-white">
                    <BookMarked className="h-5 w-5 text-amber-300" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-foreground">Direct Desk Borrow Issue</h2>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">
                      Issue physical books on the spot for members without phone/internet.
                    </p>
                  </div>
                </div>
                <span className="self-start sm:self-auto inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  <Sparkles className="h-3 w-3" /> Auto Due Date (15 pgs/day)
                </span>
              </div>

              <form onSubmit={handleExecuteDirectBorrow} className="space-y-4 sm:space-y-5">
                {/* Step 1: Member Lookup */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-[#004F32] dark:text-emerald-400 shrink-0" />
                      <span>Step 1: Member Lookup (ID / Phone / Name)</span>
                    </label>
                    {selectedBorrowMember && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBorrowMember(null);
                          setBorrowMemberSearch("");
                        }}
                        className="text-[11px] text-primary hover:underline font-bold cursor-pointer"
                      >
                        Change Member
                      </button>
                    )}
                  </div>

                  {!selectedBorrowMember ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={borrowMemberSearch}
                          onChange={(e) => setBorrowMemberSearch(e.target.value)}
                          placeholder="Search member by Student Reg #, Mobile Phone, or Name..."
                          disabled={!isShiftActive}
                          className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
                        />
                      </div>

                      {/* Matching Members Autocomplete List */}
                      {matchingBorrowMembers.length > 0 && (
                        <div className="rounded-xl border border-border bg-card shadow-lg max-h-48 overflow-y-auto divide-y divide-border/60">
                          {matchingBorrowMembers.map((m) => (
                            <button
                              key={String(m.id)}
                              type="button"
                              onClick={() => {
                                setSelectedBorrowMember(m);
                                setBorrowMemberSearch("");
                              }}
                              className="w-full text-left p-2.5 sm:p-3 hover:bg-muted/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-xs cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="h-7 w-7 rounded-full bg-[#004F32] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                                  {m.name ? m.name[0].toUpperCase() : "U"}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-foreground truncate">{m.name}</p>
                                  <p className="text-[10px] text-muted-foreground font-mono truncate">
                                    ID: {m.studentOrVoterId || "—"} • Phone: {m.phone || m.phoneNumber || "—"}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-primary self-end sm:self-auto shrink-0">
                                Select Member →
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-emerald-300/40 bg-emerald-500/10 p-3.5 sm:p-4 space-y-2 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-full bg-[#004F32] text-white flex items-center justify-center font-extrabold text-xs shrink-0">
                            {selectedBorrowMember.name[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-foreground text-sm truncate">{selectedBorrowMember.name}</p>
                            <p className="text-[11px] text-muted-foreground font-mono truncate">
                              ID: <strong className="text-foreground">{selectedBorrowMember.studentOrVoterId || "—"}</strong> • {selectedBorrowMember.department || "General"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 font-mono text-[11px]">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isMemberExpired
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            }`}
                          >
                            {isMemberExpired ? "Expired" : "Active Member"}
                          </span>
                          <span className="text-muted-foreground">
                            Borrows: <strong className={memberActiveBorrowsCount >= 5 ? "text-red-600" : "text-foreground"}>{memberActiveBorrowsCount}/5</strong>
                          </span>
                        </div>
                      </div>

                      {isMemberExpired && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold pt-1">
                          ⚠️ This member's membership validity has expired. Member must renew before borrowing books.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Step 2: Book Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-[#004F32] dark:text-emerald-400 shrink-0" />
                      <span>Step 2: Book Selection (Title / ISBN / Rack Cell)</span>
                    </label>
                    {selectedBorrowBook && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBorrowBook(null);
                          setBorrowBookSearch("");
                        }}
                        className="text-[11px] text-primary hover:underline font-bold cursor-pointer"
                      >
                        Change Book
                      </button>
                    )}
                  </div>

                  {!selectedBorrowBook ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={borrowBookSearch}
                          onChange={(e) => setBorrowBookSearch(e.target.value)}
                          placeholder="Search borrowable books by title, author, or rack cell location..."
                          disabled={!isShiftActive}
                          className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
                        />
                      </div>

                      {/* Matching Books List */}
                      {borrowableBooks.length > 0 && (
                        <div className="rounded-xl border border-border bg-card shadow-lg max-h-48 overflow-y-auto divide-y divide-border/60">
                          {borrowableBooks.map((b) => {
                            const outOfStock = (b.borrowStock ?? 0) <= 0;
                            return (
                              <button
                                key={String(b.id)}
                                type="button"
                                disabled={outOfStock}
                                onClick={() => {
                                  setSelectedBorrowBook(b);
                                  setBorrowBookSearch("");
                                }}
                                className="w-full text-left p-2.5 sm:p-3 hover:bg-muted/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <div className="min-w-0 flex-1 space-y-0.5">
                                  <p className="font-bold text-foreground truncate">{b.title}</p>
                                  <p className="text-[10px] text-muted-foreground font-mono truncate">
                                    Author: {b.author} • {b.pages} Pages • Rack: {b.locationCell}
                                  </p>
                                </div>
                                <div className="self-end sm:self-auto shrink-0">
                                  <span className={`text-[10px] font-bold ${outOfStock ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                                    {outOfStock ? "Out of Stock" : `${b.borrowStock ?? 0} in stock`}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-blue-300/40 bg-blue-500/10 p-3.5 sm:p-4 space-y-2 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold text-foreground text-sm truncate">{selectedBorrowBook.title}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            Author: {selectedBorrowBook.author} • Category: {selectedBorrowBook.category}
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                            Rack: <span className="font-bold text-foreground bg-card px-1.5 py-0.5 rounded border border-border">{selectedBorrowBook.locationCell}</span> • {selectedBorrowBook.pages} Pages
                          </p>
                        </div>
                        <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 shrink-0 self-start sm:self-auto">
                          {selectedBorrowBook.borrowStock ?? 0} copies available
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 3: Due Date */}
                {selectedBorrowBook && (
                  <div className="space-y-1 pt-1">
                    <label className="font-semibold text-foreground text-xs">Calculated Return Due Date</label>
                    <input
                      type="date"
                      value={borrowDueDate}
                      onChange={(e) => setBorrowDueDate(e.target.value)}
                      className="w-full sm:max-w-xs rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Calculated for {selectedBorrowBook.pages} pages at 15 pages per day.
                    </p>
                  </div>
                )}

                {/* Issue Button */}
                <button
                  type="submit"
                  disabled={!isShiftActive || isIssuingBorrow || !selectedBorrowMember || !selectedBorrowBook || isMemberExpired}
                  className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 py-3.5 px-4 text-xs font-bold text-white shadow-md focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <BookMarked className="h-4 w-4 text-amber-300" />
                  <span>{isIssuingBorrow ? "Issuing Book & Updating Inventory..." : "Issue Book to Member on Desk"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Sidebar: Circulation Log */}
          <div className="space-y-4 min-w-0">
            <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Desk Circulation Log</span>
                </h3>
                <Link
                  href="/dashboard/shifter/borrows"
                  className="text-[11px] text-primary hover:underline font-bold"
                >
                  View All →
                </Link>
              </div>

              {recentDeskBorrows.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
                  <BookOpen className="h-6 w-6 mx-auto text-muted" />
                  <p>No active borrows logged yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentDeskBorrows.map((b) => (
                    <div
                      key={String(b.id)}
                      className="rounded-xl sm:rounded-2xl border border-border/80 bg-muted/30 p-3 space-y-1.5 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-foreground truncate">{b.book?.title || `Book #${b.bookId}`}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            Borrower: <span className="font-semibold text-foreground">{b.user?.name || `User #${b.userId}`}</span>
                          </p>
                        </div>
                        <span
                          className={`inline-block shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            b.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : b.status === "OVERDUE"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50 font-mono">
                        <span>Due: {b.dueDate ? format(new Date(b.dueDate), "dd MMM") : "—"}</span>
                        {b.status === "APPROVED" && (
                          <button
                            type="button"
                            onClick={() => returnBook({ borrowId: b.id })}
                            disabled={isReturning}
                            className="text-primary hover:underline font-bold cursor-pointer"
                          >
                            Return Book
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODE 2: POS BOOK SALES (MEMBER & GUEST) ────────────────────────── */}
      {counterMode === "SELL" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Main Sale Form */}
          <div className="lg:col-span-2 space-y-5 min-w-0">
            <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#004F32] text-white">
                  <ShoppingBag className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-foreground">POS Counter Book Sale</h2>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Sell books with instant receipts to registered members or walk-in guests.
                  </p>
                </div>
              </div>

              <form onSubmit={handleExecutePOSSale} className="space-y-4 sm:space-y-5">
                {/* Step 1: Customer Type */}
                <div className="space-y-2.5">
                  <label className="font-bold text-xs text-foreground block">
                    Step 1: Select Customer Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setBuyerType("MEMBER")}
                      className={`p-3 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer ${
                        buyerType === "MEMBER"
                          ? "border-[#004F32] bg-[#004F32]/10 ring-2 ring-[#004F32]/40"
                          : "border-border bg-muted/30 hover:bg-muted/60"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                        <UserCheck className="h-4 w-4 text-[#004F32]" />
                        <span>Registered Member</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Links sale to member account &amp; order history.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBuyerType("GUEST")}
                      className={`p-3 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer ${
                        buyerType === "GUEST"
                          ? "border-[#004F32] bg-[#004F32]/10 ring-2 ring-[#004F32]/40"
                          : "border-border bg-muted/30 hover:bg-muted/60"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                        <User className="h-4 w-4 text-blue-600" />
                        <span>Walk-in Guest Customer</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Direct sales for external buyers without registration.
                      </p>
                    </button>
                  </div>

                  {/* Member Search OR Guest Inputs */}
                  {buyerType === "MEMBER" ? (
                    <div className="space-y-2 pt-1">
                      {!selectedSaleMember ? (
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                              type="text"
                              value={saleMemberSearch}
                              onChange={(e) => setSaleMemberSearch(e.target.value)}
                              placeholder="Search member by Student ID, Phone, or Name..."
                              disabled={!isShiftActive}
                              className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                          </div>

                          {matchingSaleMembers.length > 0 && (
                            <div className="rounded-xl border border-border bg-card shadow-lg max-h-40 overflow-y-auto divide-y divide-border/60">
                              {matchingSaleMembers.map((m) => (
                                <button
                                  key={String(m.id)}
                                  type="button"
                                  onClick={() => {
                                    setSelectedSaleMember(m);
                                    setSaleMemberSearch("");
                                  }}
                                  className="w-full text-left p-2.5 hover:bg-muted/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs cursor-pointer"
                                >
                                  <div className="min-w-0">
                                    <p className="font-bold text-foreground truncate">{m.name}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono truncate">
                                      ID: {m.studentOrVoterId || "—"} • Phone: {m.phone || m.phoneNumber || "—"}
                                    </p>
                                  </div>
                                  <span className="text-[10px] font-bold text-primary shrink-0 self-end sm:self-auto">
                                    Select →
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 p-3 flex items-center justify-between gap-2 text-xs">
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate">{selectedSaleMember.name}</p>
                            <p className="text-[11px] text-muted-foreground font-mono truncate">
                              ID: {selectedSaleMember.studentOrVoterId || "—"} • {selectedSaleMember.phone || selectedSaleMember.phoneNumber || "—"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedSaleMember(null)}
                            className="text-primary text-[11px] font-bold hover:underline shrink-0 cursor-pointer"
                          >
                            Change
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                      <div className="space-y-1">
                        <label className="font-semibold text-foreground">Guest Name (Optional)</label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="e.g. Tariq Islam (or Walk-in Guest)"
                          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-foreground">Guest Mobile Phone (Optional)</label>
                        <input
                          type="text"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          placeholder="01XXXXXXXXX (Optional)"
                          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-foreground">Guest Email (Optional)</label>
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="guest@gmail.com (Optional)"
                          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 2: Book Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-[#004F32] dark:text-emerald-400 shrink-0" />
                      <span>Step 2: Select Book to Sell</span>
                    </label>
                    {selectedSaleBook && (
                      <button
                        type="button"
                        onClick={() => setSelectedSaleBook(null)}
                        className="text-[11px] text-primary hover:underline font-bold cursor-pointer"
                      >
                        Change Book
                      </button>
                    )}
                  </div>

                  {!selectedSaleBook ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={saleBookSearch}
                          onChange={(e) => setSaleBookSearch(e.target.value)}
                          placeholder="Search sellable books by title, author, ISBN..."
                          disabled={!isShiftActive}
                          className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>

                      {sellableBooks.length > 0 && (
                        <div className="rounded-xl border border-border bg-card shadow-lg max-h-48 overflow-y-auto divide-y divide-border/60">
                          {sellableBooks.map((b) => {
                            const outOfStock = (b.sellStock ?? 0) <= 0;
                            return (
                              <button
                                key={String(b.id)}
                                type="button"
                                disabled={outOfStock}
                                onClick={() => {
                                  setSelectedSaleBook(b);
                                  setSaleBookSearch("");
                                  setSaleQuantity(1);
                                }}
                                className="w-full text-left p-2.5 sm:p-3 hover:bg-muted/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <div className="min-w-0 flex-1 space-y-0.5">
                                  <p className="font-bold text-foreground truncate">{b.title}</p>
                                  <p className="text-[10px] text-muted-foreground font-mono truncate">
                                    Author: {b.author} • Category: {b.category}
                                  </p>
                                </div>
                                <div className="self-end sm:self-auto shrink-0 flex items-center gap-2">
                                  <span className="font-mono font-extrabold text-foreground">৳{b.sellPrice}</span>
                                  <span className={`text-[10px] ${outOfStock ? "text-red-500 font-bold" : "text-muted-foreground"}`}>
                                    {outOfStock ? "Out of Stock" : `(${b.sellStock ?? 0} in stock)`}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-amber-300/40 bg-amber-500/10 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="font-extrabold text-foreground text-sm truncate">{selectedSaleBook.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          Unit Price: <strong className="text-foreground">৳{selectedSaleBook.sellPrice}</strong> • Available: {selectedSaleBook.sellStock ?? 0}
                        </p>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
                        <span className="text-xs font-semibold text-muted-foreground">Qty:</span>
                        <div className="flex items-center gap-1 bg-card rounded-xl border border-border p-1">
                          <button
                            type="button"
                            onClick={() => setSaleQuantity((q) => Math.max(1, q - 1))}
                            className="h-6 w-6 rounded-lg bg-muted hover:bg-accent flex items-center justify-center font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 font-mono font-bold">{saleQuantity}</span>
                          <button
                            type="button"
                            onClick={() => setSaleQuantity((q) => Math.min(selectedSaleBook.sellStock ?? 1, q + 1))}
                            className="h-6 w-6 rounded-lg bg-muted hover:bg-accent flex items-center justify-center font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 3: Payment & Change Calculator */}
                {selectedSaleBook && (
                  <div className="rounded-2xl border border-border bg-muted/20 p-3.5 sm:p-4 space-y-3 text-xs">
                    <div className="flex justify-between items-center text-sm font-extrabold pb-2 border-b border-border">
                      <span className="text-foreground">Total Sale Amount:</span>
                      <span className="font-mono text-base text-emerald-700 dark:text-emerald-400">
                        ৳{totalSaleAmount}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="font-semibold text-foreground text-[11px]">Payment Mode</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("CASH")}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                              paymentMethod === "CASH"
                                ? "border-[#004F32] bg-[#004F32]/10 text-[#004F32] dark:text-emerald-300"
                                : "border-border bg-card text-muted-foreground"
                            }`}
                          >
                            Cash (Desk)
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("ONLINE")}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                              paymentMethod === "ONLINE"
                                ? "border-[#004F32] bg-[#004F32]/10 text-[#004F32] dark:text-emerald-300"
                                : "border-border bg-card text-muted-foreground"
                            }`}
                          >
                            Digital (Gateway)
                          </button>
                        </div>
                      </div>

                      {paymentMethod === "CASH" && (
                        <div className="space-y-1">
                          <label className="font-semibold text-foreground text-[11px] flex items-center justify-between">
                            <span>Cash Received (৳)</span>
                            {changeToReturn > 0 && (
                              <span className="text-amber-700 dark:text-amber-300 font-bold font-mono">
                                Return Change: ৳{changeToReturn}
                              </span>
                            )}
                          </label>
                          <input
                            type="number"
                            value={cashGiven}
                            onChange={(e) => setCashGiven(e.target.value)}
                            placeholder={`e.g. ৳${totalSaleAmount}`}
                            className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit Sale */}
                <button
                  type="submit"
                  disabled={
                    !isShiftActive ||
                    isProcessingSale ||
                    !selectedSaleBook ||
                    (buyerType === "MEMBER" && !selectedSaleMember)
                  }
                  className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 py-3.5 px-4 text-xs font-bold text-white shadow-md focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Receipt className="h-4 w-4 text-amber-300" />
                  <span>{isProcessingSale ? "Completing Sale & Updating Stock..." : `Complete POS Sale (৳${totalSaleAmount})`}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Sidebar: Recent Sales */}
          <div className="space-y-4 min-w-0">
            <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  <span>Recent Desk Sales</span>
                </h3>
                <Link
                  href="/dashboard/shifter/purchases"
                  className="text-[11px] text-primary hover:underline font-bold"
                >
                  View All →
                </Link>
              </div>

              {purchases.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
                  <ShoppingBag className="h-6 w-6 mx-auto text-muted" />
                  <p>No POS sales logged yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {purchases.slice(0, 5).map((p) => (
                    <div
                      key={String(p.id)}
                      className="rounded-xl sm:rounded-2xl border border-border/80 bg-muted/30 p-3 space-y-1.5 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-foreground truncate">{p.book?.title || "Book Sale"}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            Buyer: <span className="font-semibold text-foreground">{p.customerName || p.user?.name || "Guest"}</span> ({p.userId ? "Member" : "Guest"})
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ৳{p.totalAmount}
                          </p>
                          <span className="text-[9px] font-mono text-muted-foreground">
                            {p.paymentMethod}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50 font-mono">
                        <span className="truncate">TXN: {p.transactionId ? p.transactionId.slice(-8) : `#${p.id}`}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setLatestSale(p);
                            setReceiptModalOpen(true);
                          }}
                          className="text-primary hover:underline font-bold cursor-pointer shrink-0"
                        >
                          Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODE 3: POS DONATION INTAKE ────────────────────────────────────── */}
      {counterMode === "DONATE" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Main Donation Form */}
          <div className="lg:col-span-2 space-y-5 min-w-0">
            <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-5">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#004F32] text-white">
                    <HeartHandshake className="h-5 w-5 text-amber-300" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-foreground">POS Donation Counter Intake</h2>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">
                      Record books donated in-person at the library counter desk and print an acknowledgment slip.
                    </p>
                  </div>
                </div>
                <span className="self-start sm:self-auto inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 border border-purple-500/20">
                  <Coins className="h-3 w-3" /> Waqf / Sadaqah Jariyah
                </span>
              </div>

              <form onSubmit={handleExecutePOSDonation} className="space-y-4 sm:space-y-5">
                {/* Step 1: Donor Type */}
                <div className="space-y-2.5">
                  <label className="font-bold text-xs text-foreground block">
                    Step 1: Select Donor Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDonorType("MEMBER")}
                      className={`p-3 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer ${
                        donorType === "MEMBER"
                          ? "border-[#004F32] bg-[#004F32]/10 ring-2 ring-[#004F32]/40"
                          : "border-border bg-muted/30 hover:bg-muted/60"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                        <UserCheck className="h-4 w-4 text-[#004F32]" />
                        <span>Registered Member</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Links donation to member account & history.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDonorType("GUEST")}
                      className={`p-3 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer ${
                        donorType === "GUEST"
                          ? "border-[#004F32] bg-[#004F32]/10 ring-2 ring-[#004F32]/40"
                          : "border-border bg-muted/30 hover:bg-muted/60"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                        <User className="h-4 w-4 text-purple-600" />
                        <span>Walk-in Guest / Anonymous</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        External donors or those preferring anonymity.
                      </p>
                    </button>
                  </div>

                  {/* Member Search OR Guest Inputs */}
                  {donorType === "MEMBER" ? (
                    <div className="space-y-2 pt-1">
                      {!selectedDonorMember ? (
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                              type="text"
                              value={donorMemberSearch}
                              onChange={(e) => setDonorMemberSearch(e.target.value)}
                              placeholder="Search member by Student ID, Phone, or Name..."
                              disabled={!isShiftActive}
                              className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
                            />
                          </div>
                          {matchingDonorMembers.length > 0 && (
                            <div className="rounded-xl border border-border bg-card shadow-lg max-h-40 overflow-y-auto divide-y divide-border/60">
                              {matchingDonorMembers.map((m) => (
                                <button
                                  key={String(m.id)}
                                  type="button"
                                  onClick={() => {
                                    setSelectedDonorMember(m);
                                    setDonorMemberSearch("");
                                  }}
                                  className="w-full text-left p-2.5 hover:bg-muted/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs cursor-pointer"
                                >
                                  <div className="min-w-0">
                                    <p className="font-bold text-foreground truncate">{m.name}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono truncate">
                                      ID: {m.studentOrVoterId || "—"} • Phone: {m.phone || m.phoneNumber || "—"}
                                    </p>
                                  </div>
                                  <span className="text-[10px] font-bold text-primary shrink-0 self-end sm:self-auto">
                                    Select →
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 p-3 flex items-center justify-between gap-2 text-xs">
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate">{selectedDonorMember.name}</p>
                            <p className="text-[11px] text-muted-foreground font-mono truncate">
                              ID: {selectedDonorMember.studentOrVoterId || "—"} • {selectedDonorMember.phone || selectedDonorMember.phoneNumber || "—"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedDonorMember(null)}
                            className="text-primary text-[11px] font-bold hover:underline shrink-0 cursor-pointer"
                          >
                            Change
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="space-y-1">
                          <label className="font-semibold text-foreground">Donor Name (Optional)</label>
                          <input
                            type="text"
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            disabled={donIsAnonymous}
                            placeholder="e.g. Tariq Islam"
                            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-40"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-foreground">Phone (Optional)</label>
                          <input
                            type="text"
                            value={donorPhone}
                            onChange={(e) => setDonorPhone(e.target.value)}
                            disabled={donIsAnonymous}
                            placeholder="01XXXXXXXXX"
                            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-40"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-foreground">Email (Optional)</label>
                          <input
                            type="email"
                            value={donorEmail}
                            onChange={(e) => setDonorEmail(e.target.value)}
                            disabled={donIsAnonymous}
                            placeholder="donor@gmail.com"
                            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-40"
                          />
                        </div>
                      </div>
                      {/* Anonymous Toggle */}
                      <label className="flex items-center gap-2.5 cursor-pointer group w-fit">
                        <div
                          onClick={() => setDonIsAnonymous((v) => !v)}
                          className={`relative h-5 w-9 rounded-full transition-colors cursor-pointer ${
                            donIsAnonymous ? "bg-[#004F32]" : "bg-muted-foreground/30"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                              donIsAnonymous ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </div>
                        <span className="text-xs font-semibold text-foreground">Donate Anonymously</span>
                        <span className="text-[10px] text-muted-foreground">(hides donor identity in records)</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Step 2: Book Details */}
                <div className="space-y-3">
                  <label className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-[#004F32] dark:text-emerald-400 shrink-0" />
                    <span>Step 2: Donated Book Information</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-semibold text-foreground">
                        Book Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={donBookTitle}
                        onChange={(e) => setDonBookTitle(e.target.value)}
                        required
                        disabled={!isShiftActive}
                        placeholder="e.g. Riyadh us-Saliheen (mandatory)"
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-foreground">Author Name (Optional)</label>
                      <input
                        type="text"
                        value={donAuthor}
                        onChange={(e) => setDonAuthor(e.target.value)}
                        disabled={!isShiftActive}
                        placeholder="e.g. Imam An-Nawawi"
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-foreground">Subject Category (Optional)</label>
                      <input
                        type="text"
                        value={donCategory}
                        onChange={(e) => setDonCategory(e.target.value)}
                        disabled={!isShiftActive}
                        placeholder="e.g. Hadith, Fiqh, Seerah..."
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-foreground">Number of Copies</label>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-card rounded-xl border border-border p-1">
                          <button
                            type="button"
                            onClick={() => setDonQuantity((q) => Math.max(1, q - 1))}
                            className="h-7 w-7 rounded-lg bg-muted hover:bg-accent flex items-center justify-center font-bold cursor-pointer text-sm"
                          >
                            -
                          </button>
                          <span className="px-3 font-mono font-bold text-sm">{donQuantity}</span>
                          <button
                            type="button"
                            onClick={() => setDonQuantity((q) => Math.min(50, q + 1))}
                            className="h-7 w-7 rounded-lg bg-muted hover:bg-accent flex items-center justify-center font-bold cursor-pointer text-sm"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[10px] text-muted-foreground">Max 50 per intake</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-foreground">Physical Condition</label>
                      <select
                        value={donCondition}
                        onChange={(e) => setDonCondition(e.target.value)}
                        disabled={!isShiftActive}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
                      >
                        <option value="NEW">New — Unused / Pristine</option>
                        <option value="LIKE_NEW">Like New — Minimal wear</option>
                        <option value="GOOD">Good — Normal reading wear</option>
                        <option value="FAIR">Fair — Noticeable wear / markings</option>
                        <option value="POOR">Poor — Heavily worn / damaged</option>
                      </select>
                    </div>
                  </div>

                  {/* Donor Note */}
                  <div className="space-y-1 text-xs">
                    <label className="font-semibold text-foreground">Donor Note / Additional Info (Optional)</label>
                    <textarea
                      value={donNote}
                      onChange={(e) => setDonNote(e.target.value)}
                      disabled={!isShiftActive}
                      rows={2}
                      placeholder="e.g. Hardcover Arabic edition. Book has some underlines on pages 10-20..."
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50 resize-none"
                    />
                  </div>
                </div>

                {/* Submit Donation */}
                <button
                  type="submit"
                  disabled={!isShiftActive || isProcessingDonation || !donBookTitle.trim() || (donorType === "MEMBER" && !selectedDonorMember)}
                  className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 py-3.5 px-4 text-xs font-bold text-white shadow-md focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <HeartHandshake className="h-4 w-4 text-amber-300" />
                  <span>{isProcessingDonation ? "Recording Donation & Updating Inventory..." : "Accept Donation & Print Acknowledgment Slip"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Sidebar: Recent Desk Donations */}
          <div className="space-y-4 min-w-0">
            <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-primary" />
                  <span>Recent Desk Donations</span>
                </h3>
                <Link
                  href="/dashboard/shifter/donations"
                  className="text-[11px] text-primary hover:underline font-bold"
                >
                  View All →
                </Link>
              </div>

              {/* Shift-lock warning */}
              {!isShiftActive && (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/40 p-3 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>Start your duty shift to accept in-person book donations at the counter desk.</p>
                </div>
              )}

              {recentDeskDonations.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
                  <HeartHandshake className="h-6 w-6 mx-auto text-muted" />
                  <p>No desk donations logged yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentDeskDonations.map((d: IDonation) => (
                    <div
                      key={String(d.id)}
                      className="rounded-xl sm:rounded-2xl border border-border/80 bg-muted/30 p-3 space-y-1.5 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-foreground truncate">{d.bookTitle || "Book Donation"}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            Donor: <span className="font-semibold text-foreground">
                              {d.isAnonymous ? "Anonymous" : d.donorName || (d.donor?.name ?? "Walk-in")}
                            </span>
                          </p>
                        </div>
                        <div className="text-right shrink-0 space-y-0.5">
                          <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                            d.status === "APPROVED" || d.status === "CATALOGED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : d.status === "REJECTED"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}>
                            {d.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50 font-mono">
                        <span>Qty: {d.quantity || 1}</span>
                        <span className="text-[10px]">{d.condition || "GOOD"}</span>
                        {d.createdAt && (
                          <span>{format(new Date(d.createdAt), "dd MMM")}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick tip */}
              <div className="rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-300/30 p-3 text-[10px] text-purple-700 dark:text-purple-300 space-y-1">
                <p className="font-bold flex items-center gap-1"><Hash className="h-3 w-3" /> Intake Workflow</p>
                <ol className="list-decimal list-inside space-y-0.5 text-[10px]">
                  <li>Accept book physically at counter</li>
                  <li>Fill donor &amp; book details above</li>
                  <li>Submit → Print acknowledgment slip</li>
                  <li>Admin reviews &amp; catalogs to inventory</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Whole Library Statistical Overview ──────────────────────────── */}
      <div className="space-y-4 pt-6 border-t border-border">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#004F32]" />
              <span>Whole Library Statistical Overview</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Visual analytics across borrows, sales, donations, members, and duty shift reconciliation.
            </p>
          </div>
        </div>
        <StatisticalDiagramsSection
          books={catalogBooks}
          borrows={borrows}
          purchases={purchases}
          donations={donations}
          users={users}
          shifts={shiftLogs}
        />
      </div>

      {/* ─── Hall of Honor & Performance Leaderboards ────────────────────── */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span>Library Hall of Honor &amp; Top Performers</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Best borrower, top seller titles, best purchaser, top donor, best shifter, and borrow-giver honors.
            </p>
          </div>
        </div>
        <LeaderboardsSection
          books={catalogBooks}
          borrows={borrows}
          purchases={purchases}
          donations={donations}
          users={users}
          shifts={shiftLogs}
        />
      </div>

      {/* ─── MODALS ───────────────────────────────────────────────────────── */}
      <StartShiftModal isOpen={startModalOpen} onClose={() => setStartModalOpen(false)} />
      <EndShiftModal
        isOpen={endModalOpen}
        onClose={() => setEndModalOpen(false)}
        activeShift={activeShift || null}
        initialTasksCompleted={endShiftPrefill.tasksCompleted}
        initialHandoverNotes={endShiftPrefill.handoverNotes}
      />
      <ScheduleShiftModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
      />
      <POSReceiptModal
        sale={latestSale}
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
      />
      <POSDonationSlipModal
        donation={latestDonation}
        isOpen={donationSlipOpen}
        onClose={() => setDonationSlipOpen(false)}
      />
      {/* Offline / Delayed Shift Completion Modal */}
      {offlineShiftId !== null && (
        <CompleteOfflineShiftModal
          open={offlineModalOpen}
          onOpenChange={setOfflineModalOpen}
          shiftId={offlineShiftId}
          shifterName={offlineShifterName}
        />
      )}
    </div>
  );
}
