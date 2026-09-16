"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  Shield,
  Banknote,
  Phone,
  Mail,
  UserCheck,
  XCircle,
  AlertCircle,
  UserPlus,
  Lock,
  Edit2,
  Check,
  ShieldCheck,
  Ban,
  Trash2,
} from "lucide-react";
import {
  useGetUsers,
  useApproveCashPayment,
  useApproveMembership,
  useUpdateUserRole,
} from "@/hooks/useUsers";
import { IUser, UserRole, UserStatus } from "@/types/auth";
import { format } from "date-fns";
import Image from "next/image";
import { TablePagination } from "@/components/ui/TablePagination";

import { AddMemberModal } from "@/components/dashboard/members/AddMemberModal";
import { EditMemberModal } from "@/components/dashboard/EditMemberModal";
import { SendNoticeModal } from "@/components/dashboard/SendNoticeModal";
import { DeleteMemberModal } from "@/components/dashboard/DeleteMemberModal";

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<
  UserStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  ACTIVE: {
    label: "Active",
    className: "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  PENDING_PAYMENT: {
    label: "Pending Payment",
    className: "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300",
    icon: <Clock className="h-3 w-3" />,
  },
  PENDING_APPROVAL: {
    label: "Pending Approval",
    className: "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300",
    icon: <AlertCircle className="h-3 w-3" />,
  },
  INACTIVE: {
    label: "Inactive",
    className: "bg-muted text-muted-foreground",
    icon: <XCircle className="h-3 w-3" />,
  },
  BLOCKED: {
    label: "Blocked",
    className: "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300",
    icon: <Shield className="h-3 w-3" />,
  },
};

// ─── Filter type ───────────────────────────────────────────────────────────────

type StatusFilter =
  | "ALL"
  | "ACTIVE"
  | "PENDING_APPROVAL"
  | "PENDING_PAYMENT"
  | "EXPIRED"
  | "BLOCKED"
  | "INACTIVE";

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminMembersPage() {
  const { data: users = [], isLoading } = useGetUsers();
  const { mutate: approveCash, isPending: isApprovingCash } = useApproveCashPayment();
  const { mutate: approveMembership, isPending: isApprovingMembership } =
    useApproveMembership();
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateUserRole();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [noticeUser, setNoticeUser] = useState<IUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<IUser | null>(null);

  const handleSearchChange = (term: string) => {
    setSearch(term);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const now = new Date();

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const isUserExpired = (u: IUser) =>
    !!u.membershipExpiresAt && new Date(u.membershipExpiresAt) < now;

  const getEffectiveStatus = (u: IUser): UserStatus => {
    if (u.status === "BLOCKED") return "BLOCKED";
    if (isUserExpired(u)) return "INACTIVE";
    return u.status ?? "PENDING_APPROVAL";
  };

  const handleRoleChange = (userId: string | number, newRole: UserRole) =>
    updateRole({ userId, role: newRole });

  // ── Filtering ────────────────────────────────────────────────────────────────

  const filtered: IUser[] = users.filter((u) => {
    const term = search.toLowerCase();
    const nameMatch = (u.name ?? "").toLowerCase().includes(term);
    const emailMatch = (u.email ?? "").toLowerCase().includes(term);
    const idMatch = (u.studentOrVoterId ?? "").toLowerCase().includes(term);
    const phoneMatch = (u.phone ?? u.phoneNumber ?? "").toLowerCase().includes(term);

    let statusMatch = true;
    if (statusFilter === "EXPIRED") {
      statusMatch = isUserExpired(u) && u.status !== "BLOCKED";
    } else if (statusFilter === "INACTIVE") {
      statusMatch = getEffectiveStatus(u) === "INACTIVE";
    } else if (statusFilter !== "ALL") {
      statusMatch = u.status === statusFilter;
    }

    return (nameMatch || emailMatch || idMatch || phoneMatch) && statusMatch;
  });

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // ── Stats ────────────────────────────────────────────────────────────────────

  const totalMembers = users.filter((u) => u.role === "MEMBER").length;
  const activeMembers = users.filter((u) => getEffectiveStatus(u) === "ACTIVE").length;
  const pendingPayment = users.filter((u) => u.status === "PENDING_PAYMENT").length;
  const pendingApproval = users.filter((u) => u.status === "PENDING_APPROVAL").length;
  const expiredMembers = users.filter((u) => isUserExpired(u) && u.status !== "BLOCKED").length;
  const blockedMembers = users.filter((u) => u.status === "BLOCKED").length;

  // ── Action handlers ───────────────────────────────────────────────────────────

  const handleApproveCash = (user: IUser) => {
    setProcessingId(String(user.id));
    approveCash({ userId: user.id }, { onSettled: () => setProcessingId(null) });
  };

  const handleApproveMembership = (user: IUser) => {
    setProcessingId(String(user.id));
    approveMembership(user.id, { onSettled: () => setProcessingId(null) });
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-10">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-[#004F32]" />
            Member Directory &amp; Role Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Full admin control to view registered members, assign roles, edit member
            details, and manage validity.
          </p>
        </div>
        <button
          onClick={() => setAddMemberOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
        >
          <UserPlus className="h-4 w-4 text-amber-300" />
          <span>Add Member / Offline Member</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {[
          {
            label: "Total Members",
            value: totalMembers,
            icon: <Users className="h-4 w-4" />,
            color: "text-[#004F32] dark:text-emerald-400",
            bg: "bg-[#004F32]/10",
          },
          {
            label: "Active Members",
            value: activeMembers,
            icon: <CheckCircle2 className="h-4 w-4" />,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Pending Approval",
            value: pendingApproval,
            icon: <AlertCircle className="h-4 w-4" />,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            label: "Pending Payment",
            value: pendingPayment,
            icon: <Banknote className="h-4 w-4" />,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            label: "Expired Validity",
            value: expiredMembers,
            icon: <Clock className="h-4 w-4" />,
            color: "text-rose-600 dark:text-rose-400",
            bg: "bg-rose-500/10",
          },
          {
            label: "Blocked",
            value: blockedMembers,
            icon: <Ban className="h-4 w-4" />,
            color: "text-red-700 dark:text-red-400",
            bg: "bg-red-500/10",
          },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4 space-y-1.5">
            <div className={`h-8 w-8 rounded-xl ${bg} flex items-center justify-center ${color}`}>
              {icon}
            </div>
            <p className={`text-xl font-extrabold ${color}`}>{value}</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending Approval Banner */}
      {pendingApproval > 0 && (
        <div className="rounded-2xl border border-blue-300/40 bg-blue-500/10 p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-blue-900 dark:text-blue-200">
                {pendingApproval} Membership{" "}
                {pendingApproval === 1 ? "Request" : "Requests"} Awaiting Desk Approval
              </p>
              <p className="text-blue-800 dark:text-blue-300 mt-0.5">
                Review verified applicants who paid in cash at the counter desk to activate
                their accounts.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter("PENDING_APPROVAL")}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold cursor-pointer"
          >
            Review Requests
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name, email, phone, or student ID…"
            className="w-full rounded-xl border border-input bg-card pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { val: "ALL", label: "All" },
              { val: "ACTIVE", label: "Active" },
              { val: "PENDING_APPROVAL", label: "Pending Approval" },
              { val: "PENDING_PAYMENT", label: "Pending Payment" },
              { val: "INACTIVE", label: "Inactive" },
              { val: "EXPIRED", label: "Expired" },
              { val: "BLOCKED", label: "Blocked" },
            ] as const
          ).map(({ val, label }) => (
            <button
              key={val}
              onClick={() => handleStatusFilterChange(val)}
              className={`rounded-lg px-3 py-2 text-[11px] font-bold transition-colors cursor-pointer ${
                statusFilter === val
                  ? "bg-[#004F32] text-white"
                  : "border border-input bg-card text-muted-foreground hover:bg-accent"
              }`}
            >
              {label}
              {val === "PENDING_APPROVAL" && pendingApproval > 0 && (
                <span className="ml-1.5 rounded-full bg-blue-500 text-white px-1.5 py-0.5 text-[9px] font-bold">
                  {pendingApproval}
                </span>
              )}
              {val === "PENDING_PAYMENT" && pendingPayment > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-500 text-white px-1.5 py-0.5 text-[9px] font-bold">
                  {pendingPayment}
                </span>
              )}
              {val === "EXPIRED" && expiredMembers > 0 && (
                <span className="ml-1.5 rounded-full bg-rose-500 text-white px-1.5 py-0.5 text-[9px] font-bold">
                  {expiredMembers}
                </span>
              )}
              {val === "BLOCKED" && blockedMembers > 0 && (
                <span className="ml-1.5 rounded-full bg-red-600 text-white px-1.5 py-0.5 text-[9px] font-bold">
                  {blockedMembers}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            Loading member directory…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs space-y-2">
            <Users className="h-8 w-8 mx-auto text-muted" />
            <p>No members match the search or filter criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Member &amp; ID</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Contact</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Role</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Membership Validity</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedUsers.map((u) => {
                    const effectiveStatus = getEffectiveStatus(u);
                    const statusCfg = STATUS_MAP[effectiveStatus];
                    const isPendingCash =
                      u.status === "PENDING_PAYMENT" && u.paymentMethod === "CASH";
                    const isPendingApproval = u.status === "PENDING_APPROVAL";
                    const isProcessing =
                      (isApprovingCash || isApprovingMembership) &&
                      processingId === String(u.id);
                    const expired = isUserExpired(u);

                    return (
                      <tr key={String(u.id)} className="hover:bg-muted/30 transition-colors">

                        {/* Member info */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            {u.avatarUrl ? (
                              <Image
                                src={u.avatarUrl}
                                alt={u.name || "User avatar"}
                                width={32}
                                height={32}
                                className="h-8 w-8 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#004F32] to-emerald-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                {u.name ? u.name[0].toUpperCase() : "U"}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-foreground">{u.name}</p>
                              <p className="text-[11px] text-muted-foreground font-mono">
                                {u.studentOrVoterId ?? "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5">
                            <p className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" /> {u.email}
                            </p>
                            {(u.phone ?? u.phoneNumber) && (
                              <p className="flex items-center gap-1 text-muted-foreground">
                                <Phone className="h-3 w-3" /> {u.phone ?? u.phoneNumber}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3.5">
                          {u.role === "SUPER_ADMIN" ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 dark:bg-purple-950 px-2 py-1 text-[11px] font-bold text-purple-800 dark:text-purple-300 border border-purple-300/40">
                                <Shield className="h-3 w-3 text-purple-600" />
                                SUPER_ADMIN
                              </span>
                              <p className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                <Lock className="h-2.5 w-2.5 text-muted-foreground" /> Protected
                              </p>
                            </div>
                          ) : (
                            <select
                              value={u.role}
                              onChange={(e) =>
                                handleRoleChange(u.id, e.target.value as UserRole)
                              }
                              disabled={isUpdatingRole}
                              className="rounded-lg border border-input bg-card px-2.5 py-1 text-xs font-bold text-foreground shadow-2xs focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                            >
                              <option value="ADMIN">ADMIN</option>
                              <option value="SHIFTER">SHIFTER</option>
                              <option value="MEMBER">MEMBER</option>
                            </select>
                          )}
                        </td>

                        {/* Membership Validity */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-1">
                            {u.membershipExpiresAt ? (
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1 font-mono text-[11px]">
                                  {expired ? (
                                    <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                                      <Clock className="h-3 w-3" />
                                      Expired {format(new Date(u.membershipExpiresAt), "dd MMM yyyy")}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Valid to {format(new Date(u.membershipExpiresAt), "dd MMM yyyy")}
                                    </span>
                                  )}
                                </div>
                                {u.membershipStartedAt && (
                                  <p className="text-[10px] text-muted-foreground font-mono">
                                    From {format(new Date(u.membershipStartedAt), "dd MMM yyyy")}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground italic">
                                Not set
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusCfg.className}`}
                          >
                            {statusCfg.icon} {statusCfg.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPendingApproval ? (
                              <button
                                onClick={() => handleApproveMembership(u)}
                                disabled={isProcessing}
                                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs transition-all disabled:opacity-60 cursor-pointer"
                              >
                                <UserCheck className="h-3 w-3" />
                                <span>{isProcessing ? "Approving…" : "Approve"}</span>
                              </button>
                            ) : isPendingCash ? (
                              <button
                                onClick={() => handleApproveCash(u)}
                                disabled={isProcessing}
                                className="inline-flex items-center gap-1 rounded-lg bg-[#C78700] hover:bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs transition-all disabled:opacity-60 cursor-pointer"
                              >
                                <Banknote className="h-3 w-3" />
                                <span>{isProcessing ? "Approving…" : "Cash"}</span>
                              </button>
                            ) : null}

                            <button
                              onClick={() => setEditingUser(u)}
                              title="Edit Member Details"
                              className="inline-flex items-center gap-1 p-1.5 rounded-lg border border-input bg-card hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              <span className="hidden xl:inline text-[11px]">Edit</span>
                            </button>

                            <button
                              onClick={() => setNoticeUser(u)}
                              title="Send Warning / Expiry Notice to Member"
                              className="inline-flex items-center gap-1 p-1.5 rounded-lg border border-input bg-card hover:bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              <span className="hidden xl:inline text-[11px]">Notice</span>
                            </button>

                            {u.role !== "SUPER_ADMIN" && (
                              <button
                                onClick={() => setDeletingUser(u)}
                                title="Delete Member"
                                className="p-1.5 rounded-lg border border-input bg-card hover:bg-red-500/10 text-destructive transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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
            <TablePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={filtered.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </div>

      {/* Permission Info Panel */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-foreground font-bold text-xs">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Admin Access &amp; Role Provisioning Rules</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/5 p-3 space-y-1">
            <p className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              Edit Member Details
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Admins and Super Admins can edit all member details including name, email,
              Student/Voter ID, department, session, and membership dates.
            </p>
          </div>
          <div className="rounded-xl border border-blue-300/40 bg-blue-500/5 p-3 space-y-1">
            <p className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-blue-600" />
              Status Management
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Active/Inactive status is auto-managed by membership expiry dates. Admins can
              manually set status to <strong>BLOCKED</strong> to restrict access.
            </p>
          </div>
          <div className="rounded-xl border border-amber-300/40 bg-amber-500/5 p-3 space-y-1">
            <p className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <Banknote className="h-3.5 w-3.5 text-amber-600" />
              Membership Pricing
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              3 months = ৳100 · 6 months = ৳200 · 12 months = ৳400. Status auto-becomes
              Inactive when membership expires.
            </p>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <AddMemberModal isOpen={addMemberOpen} onClose={() => setAddMemberOpen(false)} />

      <EditMemberModal
        user={editingUser}
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
      />

      <SendNoticeModal
        user={noticeUser}
        isOpen={Boolean(noticeUser)}
        onClose={() => setNoticeUser(null)}
      />

      <DeleteMemberModal
        user={deletingUser}
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        onSendNoticeFirst={(u) => setNoticeUser(u)}
      />
    </div>
  );
}