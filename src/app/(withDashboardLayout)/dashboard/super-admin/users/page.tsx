"use client";

import React, { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Users,
  UserX,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Lock,
  Unlock,
  ShieldAlert,
  Trash2,
  Send,
  Clock,
  Filter,
  Shield,
  Sparkles,
} from "lucide-react";
import { RUTable } from "@/components/ui/RUTable";
import { useGetUsers, useUpdateUserRole, useToggleUserStatus } from "@/hooks/useUsers";
import { IUser, UserRole, UserStatus } from "@/types/auth";
import { SendNoticeModal } from "@/components/dashboard/SendNoticeModal";
import { DeleteMemberModal } from "@/components/dashboard/DeleteMemberModal";

export default function SuperAdminUsersPage() {
  const { data: usersList = [], isLoading } = useGetUsers();
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateUserRole();
  const { mutate: toggleStatus, isPending: isTogglingStatus } = useToggleUserStatus();

  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [noticeUser, setNoticeUser] = useState<IUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<IUser | null>(null);

  const now = new Date();
  const isUserExpired = (u: IUser) => {
    if (!u.membershipExpiresAt) return false;
    return new Date(u.membershipExpiresAt) < now;
  };

  const handleRoleChange = (userId: string | number, newRole: UserRole) => {
    updateRole({ userId, role: newRole });
  };

  const handleToggleStatus = (userId: string | number, currentStatus: boolean) => {
    toggleStatus({ userId, status: currentStatus ? "BLOCKED" : "ACTIVE" });
  };

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      let matchStatus = true;
      if (statusFilter === "EXPIRED") {
        matchStatus = isUserExpired(u);
      } else if (statusFilter === "ACTIVE") {
        matchStatus = Boolean((u.status === "ACTIVE" || u.isActive) && !isUserExpired(u));
      } else if (statusFilter === "BLOCKED") {
        matchStatus = Boolean(u.status === "BLOCKED" || u.isActive === false);
      } else if (statusFilter !== "ALL") {
        matchStatus = u.status === statusFilter;
      }

      return matchRole && matchStatus;
    });
  }, [usersList, roleFilter, statusFilter]);

  // Table Column Definitions
  const columns: ColumnDef<IUser>[] = [
    {
      accessorKey: "name",
      header: "User & Contact Info",
      cell: ({ row }) => {
        const u = row.original;
        const initials = u.name
          ? u.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
          : "U";

        return (
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#004F32] font-bold text-white text-xs shadow-2xs">
              {initials}
            </div>
            <div>
              <div className="font-bold text-foreground text-xs leading-tight">{u.name}</div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span>{u.email}</span>
              </div>
              {u.studentOrVoterId && (
                <div className="text-[10px] text-muted-foreground font-mono">
                  ID: {u.studentOrVoterId}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone Number",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground flex items-center gap-1">
          <Phone className="h-3 w-3 text-muted-foreground" />
          {row.original.phoneNumber || row.original.phone || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role Assignment",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center space-x-2">
            <select
              value={u.role}
              onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
              disabled={isUpdatingRole}
              className="rounded-lg border border-input bg-card px-2.5 py-1 text-xs font-bold text-foreground shadow-2xs focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
            >
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SHIFTER">SHIFTER</option>
              <option value="MEMBER">MEMBER</option>
            </select>
          </div>
        );
      },
    },
    {
      accessorKey: "membershipExpiresAt",
      header: "Membership Validity",
      cell: ({ row }) => {
        const u = row.original;
        const expired = isUserExpired(u);

        if (!u.membershipExpiresAt) {
          return <span className="text-[11px] text-muted-foreground italic">N/A (Staff/Not Set)</span>;
        }

        return (
          <div className="space-y-0.5">
            {expired ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 dark:bg-rose-950 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                <Clock className="h-3 w-3" /> Expired {new Date(u.membershipExpiresAt).toLocaleDateString()}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" /> Valid to {new Date(u.membershipExpiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Account Status",
      cell: ({ row }) => {
        const u = row.original;
        const isActive = u.status === "ACTIVE" || (u.isActive ?? true);
        return isActive ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-950 px-2.5 py-0.5 text-[10px] font-bold text-red-800 dark:text-red-300">
            <UserX className="h-3 w-3" /> Blocked / Pending
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions & Deletion",
      cell: ({ row }) => {
        const u = row.original;
        const isActive = u.status === "ACTIVE" || (u.isActive ?? true);

        return (
          <div className="flex items-center justify-end gap-1.5">
            {/* Status Toggle */}
            <button
              onClick={() => handleToggleStatus(u.id, isActive)}
              disabled={isTogglingStatus}
              title={isActive ? "Block User Account" : "Activate User Account"}
              className={`inline-flex items-center p-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                isActive
                  ? "border border-red-300/40 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/20"
                  : "border border-emerald-300/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
              }`}
            >
              {isActive ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
            </button>

            {/* Send Notice */}
            <button
              onClick={() => setNoticeUser(u)}
              title="Send Official Notice (Inactivity/Expiry Warning)"
              className="inline-flex items-center gap-1 p-1.5 rounded-lg border border-input bg-card hover:bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Mail className="h-3.5 w-3.5" />
              <span className="hidden xl:inline text-[11px]">Notice</span>
            </button>

            {/* Delete Account */}
            <button
              onClick={() => setDeletingUser(u)}
              title="Permanently Delete User (Super Admin Full Power)"
              className="p-1.5 rounded-lg border border-input bg-card hover:bg-red-500/10 text-destructive transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#003824] via-[#004F32] to-[#C78700] p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-0.5 text-xs font-mono font-bold text-amber-300 border border-amber-300/30 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>SUPER ADMIN FULL ACCESS</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-amber-300" />
            <span>User Directory & Role Provisioning</span>
          </h1>
          <p className="mt-1 text-xs text-emerald-100/90 max-w-xl">
            Super admin controls to assign roles (Super Admin, Admin, Shifter, Member), toggle access, send official inactivity/expiry notices, and permanently delete accounts.
          </p>
        </div>

        <div className="inline-flex items-center space-x-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-mono font-bold backdrop-blur-xs border border-white/20">
          <ShieldAlert className="h-4 w-4 text-amber-300" />
          <span>Total Registered: {usersList.length}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <Filter className="h-4 w-4 text-primary" />
          <span>Quick Filters:</span>
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
        >
          <option value="ALL">All Roles ({usersList.length})</option>
          <option value="SUPER_ADMIN">Super Admins</option>
          <option value="ADMIN">Admins</option>
          <option value="SHIFTER">Shifters</option>
          <option value="MEMBER">Members</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRED">Expired Membership</option>
          <option value="BLOCKED">Blocked / Inactive</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="PENDING_PAYMENT">Pending Payment</option>
        </select>

        <div className="ml-auto text-xs text-muted-foreground font-mono">
          Showing <strong className="text-foreground">{filteredUsers.length}</strong> of {usersList.length} users
        </div>
      </div>

      {/* Main Datatable */}
      <RUTable
        columns={columns}
        data={filteredUsers}
        isLoading={isLoading}
        searchPlaceholder="Search users by name, email, phone, or ID..."
      />

      {/* Send Notice Modal */}
      <SendNoticeModal
        user={noticeUser}
        isOpen={Boolean(noticeUser)}
        onClose={() => setNoticeUser(null)}
      />

      {/* Delete Member Modal */}
      <DeleteMemberModal
        user={deletingUser}
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        onSendNoticeFirst={(u) => setNoticeUser(u)}
      />
    </div>
  );
}
