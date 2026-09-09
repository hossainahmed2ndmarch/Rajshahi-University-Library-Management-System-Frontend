"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Copy,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building,
  HelpCircle,
  Sparkles,
  Layers,
  Ban,
  FileText,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useGetGuestOrders, useCancelGuestOrder } from "@/hooks/usePurchases";
import { useGetMe } from "@/hooks/useAuth";
import { IPurchase, OrderStatus } from "@/types/purchase";

const ORDER_STEPS = [
  { key: "PENDING", label: "Order Placed", desc: "Logged in library registry" },
  { key: "PROCESSING", label: "Verified & Packed", desc: "Prepared at central desk" },
  { key: "SHIPPED", label: "Out for Delivery", desc: "Dispatched to campus location" },
  { key: "DELIVERED", label: "Handed Over", desc: "Completed & verified" },
];

function getStepIndex(status?: OrderStatus): number {
  switch (status) {
    case "PENDING":
      return 0;
    case "PROCESSING":
      return 1;
    case "SHIPPED":
      return 2;
    case "DELIVERED":
      return 3;
    case "CANCELLED":
      return -1;
    default:
      return 0;
  }
}

function GuestDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: user, isLoading: isAuthLoading } = useGetMe();

  const queryEmail = searchParams.get("email") || "";
  const queryTxn = searchParams.get("txn") || "";

  const [guestEmail, setGuestEmail] = useState<string>("");
  const [inputEmail, setInputEmail] = useState<string>("");
  const [selectedTxn, setSelectedTxn] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Redirection for logged-in users
  useEffect(() => {
    if (!isAuthLoading && user) {
      if (user.role === "MEMBER") {
        toast.info("Logged-in members can access their purchases in their Member Dashboard.");
        router.replace("/dashboard/member/purchases");
      } else if (user.role === "ADMIN") {
        router.replace("/dashboard/admin/purchases");
      } else if (user.role === "SHIFTER") {
        router.replace("/dashboard/shifter/purchases");
      } else if (user.role === "SUPER_ADMIN") {
        router.replace("/dashboard/super-admin/purchases");
      }
    }
  }, [user, isAuthLoading, router]);

  // Cancellation Modal State
  const [cancellingOrder, setCancellingOrder] = useState<IPurchase | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("Changed mind / No longer needed");
  const [cancelNotes, setCancelNotes] = useState<string>("");

  // Invoice / Receipt Modal State
  const [receiptOrder, setReceiptOrder] = useState<IPurchase | null>(null);

  const { mutate: cancelGuestOrder, isPending: isCancelling } = useCancelGuestOrder();

  // Initialize guest email from URL query or localStorage
  useEffect(() => {
    if (queryEmail) {
      setGuestEmail(queryEmail);
      setInputEmail(queryEmail);
      if (typeof window !== "undefined") {
        localStorage.setItem("ruil_guest_email", queryEmail);
      }
    } else if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ruil_guest_email");
      if (stored) {
        setGuestEmail(stored);
        setInputEmail(stored);
      }
    }
  }, [queryEmail]);

  useEffect(() => {
    if (queryTxn) {
      setSelectedTxn(queryTxn);
    }
  }, [queryTxn]);

  // Fetch all orders associated with this guest email
  const {
    data: orders = [],
    isLoading,
    isRefetching,
    refetch,
  } = useGetGuestOrders(guestEmail);

  // Auto-select first order if none selected
  useEffect(() => {
    if (orders.length > 0 && !selectedTxn) {
      setSelectedTxn(orders[0].transactionId || String(orders[0].id));
    }
  }, [orders, selectedTxn]);

  const activeOrder = useMemo(() => {
    if (!orders.length) return null;
    return (
      orders.find(
        (o) => o.transactionId === selectedTxn || String(o.id) === selectedTxn
      ) || orders[0]
    );
  }, [orders, selectedTxn]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus =
        statusFilter === "ALL" ? true : o.orderStatus === statusFilter;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (o.transactionId && o.transactionId.toLowerCase().includes(term)) ||
        (o.book?.title && o.book.title.toLowerCase().includes(term)) ||
        (o.customerName && o.customerName.toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchTerm]);

  // Metric stats
  const metrics = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(
      (o) => o.orderStatus === "PENDING" || o.orderStatus === "PROCESSING"
    ).length;
    const delivered = orders.filter((o) => o.orderStatus === "DELIVERED").length;
    const totalSpent = orders
      .filter((o) => o.orderStatus !== "CANCELLED")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    return { total, pending, delivered, totalSpent };
  }, [orders]);

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail || !inputEmail.includes("@")) {
      toast.error("Please enter a valid guest email address.");
      return;
    }
    setGuestEmail(inputEmail.trim());
    if (typeof window !== "undefined") {
      localStorage.setItem("ruil_guest_email", inputEmail.trim());
    }
    router.replace(`/guest/dashboard?email=${encodeURIComponent(inputEmail.trim())}`);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Order transaction code copied to clipboard!");
  };

  const handleConfirmCancel = () => {
    if (!cancellingOrder || !cancellingOrder.transactionId) return;

    const fullReason = cancelNotes
      ? `${cancelReason} - ${cancelNotes}`
      : cancelReason;

    cancelGuestOrder(
      {
        transactionId: cancellingOrder.transactionId,
        email: guestEmail,
        reason: fullReason,
      },
      {
        onSuccess: () => {
          setCancellingOrder(null);
          refetch();
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Breadcrumb & Guest Portal Badge */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-2">
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/books" className="hover:text-primary transition-colors">
                Catalog
              </Link>
              <span>/</span>
              <span className="text-foreground">Guest Buyer Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#004F32] text-white shadow-md">
                <Package className="h-5 w-5 text-amber-300" />
              </span>
              <span>Guest Order Dashboard & Live Tracker</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Track delivery progress, download counter receipts, and manage your Rajshahi University Islamic Library book purchases.
            </p>
          </div>

          {/* Guest Session Identifier */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-card border border-border px-4 py-2.5 rounded-2xl shadow-2xs">
            <div className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-[#C78700]">
              <User className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Guest Account
              </p>
              <p className="font-semibold text-foreground truncate max-w-[180px]">
                {guestEmail || "No guest session"}
              </p>
            </div>
            {guestEmail && (
              <button
                onClick={() => {
                  setGuestEmail("");
                  setInputEmail("");
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("ruil_guest_email");
                  }
                  router.replace("/guest/dashboard");
                }}
                className="ml-2 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline"
              >
                Switch
              </button>
            )}
          </div>
        </div>

        {/* Email Lookup Input if not logged into guest session */}
        {!guestEmail && (
          <div className="max-w-xl mx-auto bg-card rounded-3xl border border-border p-8 text-center shadow-lg space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#004F32]/10 text-[#004F32] dark:text-emerald-400">
              <Mail className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Look Up Your Guest Purchases</h2>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-md mx-auto">
                Enter the email address you used during checkout to view your order history, live counter collection status, and download verification slips.
              </p>
            </div>

            <form onSubmit={handleLookupSubmit} className="space-y-3 pt-2">
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="e.g. abdullah@example.com"
                  required
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#004F32] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white py-3 px-6 text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Access Guest Dashboard</span>
                <ArrowRight className="h-4 w-4 text-amber-300" />
              </button>
            </form>

            <div className="pt-2 text-[11px] text-muted-foreground border-t border-border/60 flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Verified RU Islamic Library Guest Circulation Engine</span>
            </div>
          </div>
        )}

        {/* Dashboard Main View (when guest email is active) */}
        {guestEmail && (
          <div className="space-y-8">
            {/* Overview Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card rounded-2xl border border-border p-5 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
                  <ShoppingBag className="h-4 w-4 text-[#004F32]" />
                </div>
                <p className="text-2xl font-black text-foreground">{metrics.total}</p>
                <p className="text-[11px] text-muted-foreground">Registered under this email</p>
              </div>

              <div className="bg-card rounded-2xl border border-border p-5 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{metrics.pending}</p>
                <p className="text-[11px] text-muted-foreground">Awaiting counter collection</p>
              </div>

              <div className="bg-card rounded-2xl border border-border p-5 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{metrics.delivered}</p>
                <p className="text-[11px] text-muted-foreground">Verified & handed over</p>
              </div>

              <div className="bg-card rounded-2xl border border-border p-5 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Amount</span>
                  <span className="text-sm font-bold text-[#C78700]">৳</span>
                </div>
                <p className="text-2xl font-black text-foreground">৳{metrics.totalSpent.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground">Direct book purchases</p>
              </div>
            </div>

            {/* Active Live Tracking Hero Card */}
            {activeOrder && (
              <div className="bg-card rounded-3xl border-2 border-[#004F32]/30 shadow-md p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-mono font-bold bg-[#004F32] text-white px-3 py-1 rounded-lg">
                        {activeOrder.transactionId || `#${activeOrder.id}`}
                      </span>
                      <button
                        onClick={() => handleCopy(activeOrder.transactionId || String(activeOrder.id))}
                        title="Copy tracking code"
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          activeOrder.orderStatus === "CANCELLED"
                            ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400"
                            : activeOrder.orderStatus === "DELIVERED"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                            : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                        }`}
                      >
                        {activeOrder.orderStatus}
                      </span>
                    </div>
                    <h2 className="text-xl font-extrabold text-foreground mt-2">
                      Live Delivery Progress Tracker
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Order placed on{" "}
                      {activeOrder.createdAt
                        ? new Date(activeOrder.createdAt).toLocaleDateString("en-BD", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Recent"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => setReceiptOrder(activeOrder)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-background hover:bg-muted px-3.5 py-2 text-xs font-bold text-foreground transition-colors shadow-2xs"
                    >
                      <Printer className="h-3.5 w-3.5 text-primary" />
                      <span>Print Slip</span>
                    </button>

                    {activeOrder.orderStatus === "PENDING" && (
                      <button
                        onClick={() => setCancellingOrder(activeOrder)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 px-3.5 py-2 text-xs font-bold transition-colors shadow-2xs"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        <span>Cancel Order</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Stepper Progress Bar */}
                {activeOrder.orderStatus === "CANCELLED" ? (
                  <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 p-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/80 text-rose-600 dark:text-rose-300">
                      <XCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-rose-900 dark:text-rose-200">
                        This Order Has Been Cancelled
                      </h4>
                      <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
                        Inventory has been restocked to the library catalog. No payment will be collected for this transaction.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                      {ORDER_STEPS.map((step, idx) => {
                        const currentIdx = getStepIndex(activeOrder.orderStatus);
                        const isDone = currentIdx >= idx;
                        const isCurrent = currentIdx === idx;

                        return (
                          <div
                            key={step.key}
                            className={`p-4 rounded-2xl border transition-all ${
                              isCurrent
                                ? "border-[#004F32] bg-[#004F32]/5 ring-2 ring-[#004F32]/20"
                                : isDone
                                ? "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20"
                                : "border-border bg-muted/20 opacity-60"
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                                  isDone
                                    ? "bg-[#004F32] text-white"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {isDone ? <CheckCircle2 className="h-4 w-4 text-amber-300" /> : idx + 1}
                              </div>
                              <div>
                                <p className="font-bold text-xs text-foreground">{step.label}</p>
                                <span className="text-[10px] text-muted-foreground block">{step.desc}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Order Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
                  {/* Book & Item Reference */}
                  <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-primary" /> Book Purchased
                    </span>
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-11 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border shrink-0">
                        {activeOrder.book?.coverImage ? (
                          <img
                            src={activeOrder.book.coverImage}
                            alt={activeOrder.book.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <BookOpen className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground line-clamp-1">
                          {activeOrder.book?.title || "Classic Islamic Treatise"}
                        </p>
                        <p className="text-muted-foreground text-[11px]">
                          By {activeOrder.book?.author || "Islamic Scholar"}
                        </p>
                        <p className="text-[11px] font-semibold text-primary mt-1">
                          Qty: {activeOrder.quantity || 1} • Total: ৳{activeOrder.totalAmount?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery / Handover Destination */}
                  <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> Delivery & Handover Point
                    </span>
                    <p className="font-bold text-foreground">
                      {activeOrder.shippingAddress || "RU Central Library Main Counter"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Recipient: {activeOrder.customerName} ({activeOrder.customerPhone})
                    </p>
                  </div>

                  {/* Payment & Verification */}
                  <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Payment Method & Status
                    </span>
                    <p className="font-bold text-foreground flex items-center gap-1.5">
                      <span>{activeOrder.paymentMethod === "ONLINE" ? "Online Payment (SSLCommerz)" : "Cash on Counter / Delivery"}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Payment Status: <span className="font-semibold text-foreground">{activeOrder.paymentStatus}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* All Guest Orders Table & Filter Controls */}
            <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    <span>All Purchases for {guestEmail}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Select any order row to view detailed status progression and pickup instructions.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search #TXN or book..."
                      className="rounded-xl border border-input bg-background pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none w-44"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>

                  <button
                    onClick={() => refetch()}
                    disabled={isRefetching}
                    title="Refresh orders"
                    className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="py-16 text-center text-muted-foreground text-xs space-y-2">
                  <RefreshCw className="h-6 w-6 mx-auto animate-spin text-primary" />
                  <p>Fetching your orders from database...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs space-y-3">
                  <ShoppingBag className="h-10 w-10 mx-auto text-muted" />
                  <p className="font-semibold text-sm">No orders found matching your criteria</p>
                  <Link
                    href="/books"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    <span>Explore RU Islamic Catalog</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-semibold">
                        <th className="pb-3 pr-4">Order Code</th>
                        <th className="pb-3 pr-4">Book Details</th>
                        <th className="pb-3 pr-4">Date</th>
                        <th className="pb-3 pr-4">Payment</th>
                        <th className="pb-3 pr-4 text-center">Delivery Status</th>
                        <th className="pb-3 pr-4 text-right">Total</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredOrders.map((order) => {
                        const isSelected =
                          selectedTxn === order.transactionId ||
                          selectedTxn === String(order.id);

                        return (
                          <tr
                            key={String(order.id)}
                            onClick={() => setSelectedTxn(order.transactionId || String(order.id))}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-[#004F32]/10 dark:bg-emerald-950/40"
                                : "hover:bg-muted/40"
                            }`}
                          >
                            <td className="py-4 pr-4 font-mono font-bold text-foreground whitespace-nowrap">
                              {order.transactionId || `#${order.id}`}
                            </td>
                            <td className="py-4 pr-4 space-y-0.5 max-w-[220px]">
                              <div className="font-bold text-foreground line-clamp-1">
                                {order.book?.title || "Islamic Book Title"}
                              </div>
                              <div className="text-[11px] text-muted-foreground line-clamp-1">
                                {order.book?.author || "Author"} •{" "}
                                <span className="text-primary">{order.book?.category || "General"}</span>
                              </div>
                            </td>
                            <td className="py-4 pr-4 text-muted-foreground whitespace-nowrap">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString("en-BD", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "—"}
                            </td>
                            <td className="py-4 pr-4 capitalize">
                              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                                {order.paymentMethod?.toLowerCase()}
                              </span>
                            </td>
                            <td className="py-4 pr-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                  order.orderStatus === "CANCELLED"
                                    ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400"
                                    : order.orderStatus === "DELIVERED"
                                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                                    : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                                }`}
                              >
                                {order.orderStatus}
                              </span>
                            </td>
                            <td className="py-4 pr-4 text-right font-mono font-extrabold text-sm text-foreground whitespace-nowrap">
                              ৳{order.totalAmount?.toLocaleString()}
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => setReceiptOrder(order)}
                                  title="View/Print Slip"
                                  className="p-1.5 rounded-lg border border-input bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <FileText className="h-3.5 w-3.5 text-primary" />
                                </button>
                                {order.orderStatus === "PENDING" && (
                                  <button
                                    onClick={() => setCancellingOrder(order)}
                                    title="Cancel Order"
                                    className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 transition-colors"
                                  >
                                    <Ban className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Help & Counter Pickup Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-primary" /> RU Library Counter Handover Desk
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  For counter pickups, simply present your Transaction ID at <strong>RU Central Islamic Library Counter, 2nd Floor (Desk 3)</strong>. The shifter desk will verify your order and hand over your edition.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-primary" /> Need Assistance with your Order?
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Have questions about your delivery or edition condition? Reach out to the library circulation desk at <strong>circulation@library.ru.ac.bd</strong> or call campus ext: <strong>+880 721 711101</strong>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Cancel Guest Order</h3>
                <p className="text-xs font-mono text-muted-foreground">{cancellingOrder.transactionId}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to cancel your order for{" "}
              <strong className="text-foreground">{cancellingOrder.book?.title}</strong>? This action will immediately release the reserved copy back into the library catalog.
            </p>

            <div className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="Changed mind / No longer needed">Changed mind / No longer needed</option>
                  <option value="Ordered wrong edition or volume">Ordered wrong edition or volume</option>
                  <option value="Cannot collect at campus desk on time">Cannot collect at campus desk on time</option>
                  <option value="Duplicate order placed">Duplicate order placed</option>
                  <option value="Other reason">Other reason</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  rows={2}
                  placeholder="Optional details for the circulation desk..."
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                disabled={isCancelling}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isCancelling ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <Ban className="h-3.5 w-3.5" />
                    <span>Confirm Cancellation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Slip / Receipt Modal */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-2xl space-y-6 animate-in zoom-in-95 text-card-foreground">
            {/* Header */}
            <div className="text-center border-b border-border pb-4">
              <div className="inline-flex items-center gap-2 font-black text-lg text-primary mb-1">
                <BookOpen className="h-5 w-5 text-amber-500" />
                <span>Rajshahi University Islamic Library</span>
              </div>
              <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
                Official Circulation Counter Slip
              </p>
            </div>

            {/* Slip Details */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Order Reference:</span>
                <span className="font-mono font-bold text-foreground">{receiptOrder.transactionId || `#${receiptOrder.id}`}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Order Date:</span>
                <span className="font-medium text-foreground">
                  {receiptOrder.createdAt ? new Date(receiptOrder.createdAt).toLocaleDateString("en-BD") : "—"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Buyer Name:</span>
                <span className="font-semibold text-foreground">{receiptOrder.customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Contact Email / Phone:</span>
                <span className="font-medium text-foreground">{receiptOrder.customerEmail} • {receiptOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Book Edition:</span>
                <span className="font-bold text-foreground text-right max-w-[240px]">{receiptOrder.book?.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Handover Location:</span>
                <span className="font-medium text-foreground text-right max-w-[240px]">{receiptOrder.shippingAddress}</span>
              </div>
              <div className="flex justify-between py-1 text-sm font-bold border-b border-border">
                <span>Total Amount:</span>
                <span className="text-primary font-black">৳{receiptOrder.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-muted/40 p-3.5 rounded-xl border border-border text-[11px] text-muted-foreground space-y-1">
              <p className="font-bold text-foreground">Counter Collection Instructions:</p>
              <p>Present this slip or Order ID #{receiptOrder.transactionId} at the central library desk for immediate handover.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReceiptOrder(null)}
                className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold hover:bg-muted"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>Print Counter Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GuestDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#004F32] border-t-transparent" />
        </div>
      }
    >
      <GuestDashboardContent />
    </Suspense>
  );
}
