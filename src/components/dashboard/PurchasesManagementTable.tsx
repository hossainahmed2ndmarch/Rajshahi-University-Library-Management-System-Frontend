"use client";

import React, { useState, useMemo, useCallback } from "react";
import { RefreshCw, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import {
  useGetAllPurchases,
  useUpdatePurchaseStatus,
  useDeletePurchase,
} from "@/hooks/usePurchases";
import { IPurchase, OrderStatus } from "@/types/purchase";
import {
  PurchasesHeaderBanner,
  PurchasesMetricsCards,
  PurchasesMetricsData,
  PurchasesFiltersBar,
  PurchasesTableBody,
  PurchaseStatusModal,
  PurchaseReceiptModal,
  PurchaseDeleteConfirmModal,
} from "./purchases";
import { TablePagination } from "@/components/ui/TablePagination";

export interface PurchasesManagementTableProps {
  roleTitle?: string;
  roleBadge?: string;
  allowDelete?: boolean;
}

export function PurchasesManagementTable({
  roleTitle = "All Purchases & Book Order Management",
  roleBadge = "ADMIN CONTROL",
  allowDelete = false,
}: PurchasesManagementTableProps) {
  // ── Search & Filter State ─────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [buyerTypeFilter, setBuyerTypeFilter] = useState("ALL"); // ALL, MEMBER, GUEST

  // ── Pagination State ──────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleBuyerTypeFilterChange = (val: string) => {
    setBuyerTypeFilter(val);
    setCurrentPage(1);
  };

  // ── Modal State ───────────────────────────────────────────────────────────
  const [editingOrder, setEditingOrder] = useState<IPurchase | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>("PENDING");
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>("PENDING");

  const [receiptOrder, setReceiptOrder] = useState<IPurchase | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<IPurchase | null>(null);

  // ── React Query Hooks ─────────────────────────────────────────────────────
  const { data: purchases = [], isLoading, isRefetching, refetch } = useGetAllPurchases();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdatePurchaseStatus();
  const { mutate: deletePurchase, isPending: isDeleting } = useDeletePurchase();

  // ── Filter Logic ──────────────────────────────────────────────────────────
  const filteredPurchases = useMemo(() => {
    return (purchases || []).filter((p) => {
      const matchesStatus = statusFilter === "ALL" || p.orderStatus === statusFilter;

      const isMember = Boolean(p.userId);
      const matchesBuyerType =
        buyerTypeFilter === "ALL"
          ? true
          : buyerTypeFilter === "MEMBER"
          ? isMember
          : !isMember;

      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (p.transactionId && p.transactionId.toLowerCase().includes(term)) ||
        (p.customerName && p.customerName.toLowerCase().includes(term)) ||
        (p.customerEmail && p.customerEmail.toLowerCase().includes(term)) ||
        (p.customerPhone && p.customerPhone.toLowerCase().includes(term)) ||
        (p.book?.title && p.book.title.toLowerCase().includes(term)) ||
        (p.user?.name && p.user.name.toLowerCase().includes(term));

      return matchesStatus && matchesBuyerType && matchesSearch;
    });
  }, [purchases, statusFilter, buyerTypeFilter, searchTerm]);

  // ── KPI Metrics Calculation ───────────────────────────────────────────────
  const metrics: PurchasesMetricsData = useMemo(() => {
    const list = purchases || [];
    const total = list.length;
    const pending = list.filter(
      (p) => p.orderStatus === "PENDING" || p.orderStatus === "PROCESSING"
    ).length;
    const delivered = list.filter((p) => p.orderStatus === "DELIVERED").length;
    const memberPurchases = list.filter((p) => Boolean(p.userId)).length;
    const guestPurchases = list.filter((p) => !p.userId).length;
    const totalRevenue = list
      .filter((p) => p.orderStatus !== "CANCELLED")
      .reduce((sum, p) => sum + (p.totalAmount || 0), 0);

    return { total, pending, delivered, memberPurchases, guestPurchases, totalRevenue };
  }, [purchases]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Transaction code copied to clipboard!");
  }, []);

  const handleOpenStatusModal = useCallback((order: IPurchase) => {
    setEditingOrder(order);
    setNewOrderStatus(order.orderStatus || "PENDING");
    setNewPaymentStatus(order.paymentStatus || "PENDING");
  }, []);

  const handleConfirmStatusUpdate = useCallback(() => {
    if (!editingOrder) return;

    updateStatus(
      {
        purchaseId: editingOrder.id,
        orderStatus: newOrderStatus,
        paymentStatus: newPaymentStatus,
      },
      {
        onSuccess: () => {
          setEditingOrder(null);
          refetch();
        },
      }
    );
  }, [editingOrder, newOrderStatus, newPaymentStatus, updateStatus, refetch]);

  const handleDeleteConfirm = useCallback(() => {
    if (deletingOrder && allowDelete) {
      deletePurchase(deletingOrder.id, {
        onSuccess: () => {
          setDeletingOrder(null);
          refetch();
        },
      });
    }
  }, [deletingOrder, allowDelete, deletePurchase, refetch]);

  const paginatedPurchases = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPurchases.slice(startIndex, startIndex + pageSize);
  }, [filteredPurchases, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* ── Top Header Banner ── */}
      <PurchasesHeaderBanner
        roleBadge={roleBadge}
        roleTitle={roleTitle}
        isRefetching={isRefetching}
        onRefresh={() => refetch()}
      />

      {/* ── Metric Cards Grid ── */}
      <PurchasesMetricsCards metrics={metrics} />

      {/* ── Purchases Container & Filters ── */}
      <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-4 text-card-foreground">
        <PurchasesFiltersBar
          searchTerm={searchTerm}
          onSearchTermChange={handleSearchChange}
          buyerTypeFilter={buyerTypeFilter}
          onBuyerTypeFilterChange={handleBuyerTypeFilterChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
        />

        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground text-xs space-y-2">
            <RefreshCw className="h-6 w-6 mx-auto animate-spin text-primary" />
            <p>Loading universal purchase records...</p>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-xs space-y-2">
            <ShoppingBag className="h-10 w-10 mx-auto text-muted" />
            <p className="font-semibold text-sm text-foreground">
              {searchTerm || statusFilter !== "ALL" || buyerTypeFilter !== "ALL"
                ? "No purchase records match the selected filters."
                : "No purchase records recorded in the library system yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <PurchasesTableBody
              purchases={paginatedPurchases}
              allowDelete={allowDelete}
              onCopy={handleCopy}
              onOpenStatusModal={handleOpenStatusModal}
              onOpenReceiptModal={(order) => setReceiptOrder(order)}
              onOpenDeleteModal={(order) => setDeletingOrder(order)}
            />
            <TablePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={filteredPurchases.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* ── Modal: Status Update ── */}
      <PurchaseStatusModal
        order={editingOrder}
        newOrderStatus={newOrderStatus}
        newPaymentStatus={newPaymentStatus}
        onOrderStatusChange={setNewOrderStatus}
        onPaymentStatusChange={setNewPaymentStatus}
        onClose={() => setEditingOrder(null)}
        onConfirm={handleConfirmStatusUpdate}
        isUpdating={isUpdating}
      />

      {/* ── Modal: Slip / Receipt ── */}
      <PurchaseReceiptModal
        order={receiptOrder}
        onClose={() => setReceiptOrder(null)}
      />

      {/* ── Modal: Delete Confirmation ── */}
      <PurchaseDeleteConfirmModal
        isOpen={Boolean(deletingOrder) && allowDelete}
        orderCode={deletingOrder?.transactionId || (deletingOrder ? `#${deletingOrder.id}` : undefined)}
        isDeleting={isDeleting}
        onClose={() => setDeletingOrder(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default PurchasesManagementTable;
