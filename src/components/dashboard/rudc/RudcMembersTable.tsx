"use client";

import React, { useState } from "react";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  Filter,
  Layers,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
  Phone,
  MapPin,
  Sparkles,
  Banknote,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useRudcMembers,
  useSendInterviewEmail,
  useUpdateRudcMember,
  useCreatePreExistedRudcMember,
  useRudcTeams,
} from "@/hooks/useRudc";
import { useGetUserOptions, useConvertMembership } from "@/hooks/useUsers";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { PermanentAddressInput } from "@/components/ui/PermanentAddressInput";
import { CreatableTagSelect } from "@/components/ui/CreatableTagSelect";
import {
  IRudcMember,
  RudcApplicationStatus,
  RudcMemberType,
  BloodGroup,
  AccommodationType,
} from "@/types/rudc";

export function RudcMembersTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  // Modals state
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [preExistedModalOpen, setPreExistedModalOpen] = useState(false);
  const [viewMember, setViewMember] = useState<IRudcMember | null>(null);
  const [promoteMember, setPromoteMember] = useState<IRudcMember | null>(null);

  // RUIL Conversion Modal state
  const [ruilConversionModalOpen, setRuilConversionModalOpen] = useState(false);
  const [conversionTargetUsers, setConversionTargetUsers] = useState<{ id: number; name: string }[]>([]);
  const [confirmPayment, setConfirmPayment] = useState(true);
  const [paymentMonths, setPaymentMonths] = useState(12);
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  // Queries & Mutations
  const { data: membersRes, isLoading, refetch } = useRudcMembers({
    searchTerm: searchTerm || undefined,
    rudcStatus: statusFilter !== "ALL" ? statusFilter : undefined,
    rudcMemberType: typeFilter !== "ALL" ? typeFilter : undefined,
  });

  const { data: userOptions } = useGetUserOptions();
  const { mutateAsync: convertMembership, isPending: isConvertingMembership } = useConvertMembership();
  const { data: teams = [] } = useRudcTeams();
  const { mutateAsync: sendInterviewEmail, isPending: isSendingEmail } = useSendInterviewEmail();
  const { mutateAsync: updateMember, isPending: isUpdatingMember } = useUpdateRudcMember();
  const { mutateAsync: createPreExisted, isPending: isCreatingPreExisted } =
    useCreatePreExistedRudcMember();

  const members: IRudcMember[] = membersRes?.data || [];

  // Interview email form state
  const [interviewForm, setInterviewForm] = useState({
    interviewDate: "",
    interviewTime: "10:30 AM",
    venueOrLink: "RU Islamic Library, Shop No. 44, Stadium Market, Rajshahi University",
    instructions: "Please bring your student ID and be on time.",
    subject: "Interview Invitation - Rajshahi University Dawah Community (RUDC)",
  });

  // Promote / Edit status state
  const [promoteForm, setPromoteForm] = useState({
    rudcMemberType: "MEMBER" as RudcMemberType,
    rudcStatus: "APPROVED" as RudcApplicationStatus,
    supervisorId: "" as string,
  });

  // Pre-existed member state
  const [preExistedForm, setPreExistedForm] = useState({
    name: "",
    email: "",
    phone: "",
    studentOrVoterId: "",
    department: "",
    faculty: "",
    whatsappNumber: "",
    bloodGroup: "B_POSITIVE" as BloodGroup,
    skills: [] as string[],
    accommodationType: "HALL" as AccommodationType,
    accommodationName: "",
    permanentAddress: "",
    isAffiliatedWithOther: false,
    otherOrgName: "",
    rudcMemberType: "MEMBER" as RudcMemberType,
    rudcStatus: "APPROVED" as RudcApplicationStatus,
    supervisorId: "",
    teamIds: [] as number[],
  });

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedUserIds.length === members.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(members.map((m) => m.id));
    }
  };

  const toggleSelectUser = (id: number) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((uid) => uid !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleSendInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one applicant!");
      return;
    }
    if (!interviewForm.interviewDate) {
      toast.error("Please select an interview date!");
      return;
    }

    try {
      await sendInterviewEmail({
        userIds: selectedUserIds,
        ...interviewForm,
      });
      setInterviewModalOpen(false);
      setSelectedUserIds([]);
    } catch {
      // toast shown in hook
    }
  };

  const openRuilConversionModal = (targets: { id: number; name: string }[]) => {
    setConversionTargetUsers(targets);
    setConfirmPayment(true);
    setPaymentMonths(12);
    setPaymentMethod("CASH");
    setRuilConversionModalOpen(true);
  };

  const handleConvertToRuil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (conversionTargetUsers.length === 0) return;

    try {
      await convertMembership({
        userIds: conversionTargetUsers.map((u) => u.id),
        targetRoleOrOrg: "MAKE_RUIL_MEMBER",
        confirmPayment,
        months: Number(paymentMonths),
        paymentMethod: paymentMethod as any,
      });
      setRuilConversionModalOpen(false);
      setConversionTargetUsers([]);
      setSelectedUserIds([]);
      refetch();
    } catch {
      // toast shown in hook
    }
  };

  const handleSavePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteMember) return;

    try {
      await updateMember({
        id: promoteMember.id,
        data: {
          rudcMemberType: promoteForm.rudcMemberType,
          rudcStatus: promoteForm.rudcStatus,
          supervisorId: promoteForm.supervisorId ? Number(promoteForm.supervisorId) : null,
        },
      });
      setPromoteMember(null);
    } catch {
      // toast in hook
    }
  };

  const handleCreatePreExisted = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPreExisted({
        ...preExistedForm,
        supervisorId: preExistedForm.supervisorId ? Number(preExistedForm.supervisorId) : null,
      });
      setPreExistedModalOpen(false);
      setPreExistedForm({
        name: "",
        email: "",
        phone: "",
        studentOrVoterId: "",
        department: "",
        faculty: "",
        whatsappNumber: "",
        bloodGroup: "B_POSITIVE",
        skills: [],
        accommodationType: "HALL",
        accommodationName: "",
        permanentAddress: "",
        isAffiliatedWithOther: false,
        otherOrgName: "",
        rudcMemberType: "MEMBER",
        rudcStatus: "APPROVED",
        supervisorId: "",
        teamIds: [],
      });
    } catch {
      // toast in hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            RUDC Members & Volunteers
          </h2>
          <p className="text-xs text-muted-foreground">
            Review volunteer applications, interview calls, supervisor allocations, and promotions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Make RUIL Member bulk button */}
          {selectedUserIds.length > 0 && (
            <button
              onClick={() => {
                const targets = members
                  .filter((m) => selectedUserIds.includes(m.id))
                  .map((m) => ({ id: m.id, name: m.name }));
                openRuilConversionModal(targets);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Banknote className="h-4 w-4" />
              <span>Make RUIL Member ({selectedUserIds.length})</span>
            </button>
          )}

          {/* Send interview call button */}
          <button
            onClick={() => {
              if (selectedUserIds.length === 0) {
                toast.error("Please select at least one volunteer to send interview call.");
                return;
              }
              setInterviewModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Mail className="h-4 w-4" />
            <span>Interview Call ({selectedUserIds.length})</span>
          </button>

          {/* Add pre-existed member button */}
          <button
            onClick={() => setPreExistedModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Member (Manual)</span>
          </button>
        </div>
      </div>

      {/* Modern Tab & Pill Filters */}
      <div className="space-y-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-muted-foreground mr-1 uppercase tracking-wider">Status:</span>
          {[
            { id: "ALL", label: "All Applicants" },
            { id: "PENDING_REVIEW", label: "Pending Review" },
            { id: "INTERVIEW_CALLED", label: "Interview Called" },
            { id: "INTERVIEW_COMPLETED", label: "Interview Completed" },
            { id: "APPROVED", label: "Approved" },
            { id: "REJECTED", label: "Rejected" },
          ].map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                  active
                    ? "bg-[#004F32] text-white shadow-xs"
                    : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Member Type Pills & Search Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-muted-foreground mr-1 uppercase tracking-wider">Role:</span>
            {[
              { id: "ALL", label: "All Roles" },
              { id: "MEMBER", label: "Permanent Member" },
              { id: "VOLUNTEER", label: "Volunteer" },
              { id: "EXECUTIVE_COMMITTEE", label: "EC" },
              { id: "SHURA_MEMBER", label: "Shura" },
              { id: "ALUMNI", label: "Alumni" },
            ].map((tab) => {
              const active = typeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTypeFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                    active
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative sm:w-72 shrink-0">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, phone, dept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={members.length > 0 && selectedUserIds.length === members.length}
                    onChange={toggleSelectAll}
                    className="accent-emerald-600 h-3.5 w-3.5 rounded"
                  />
                </th>
                <th className="p-3">Volunteer / Member</th>
                <th className="p-3">Department & ID</th>
                <th className="p-3">Contact & Blood</th>
                <th className="p-3">Role / Status</th>
                <th className="p-3">Supervisor</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Loading RUDC members...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No RUDC members found matching criteria.
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const isSelected = selectedUserIds.includes(member.id);
                  return (
                    <tr
                      key={member.id}
                      className={`hover:bg-muted/40 transition-colors ${
                        isSelected ? "bg-emerald-50/40 dark:bg-emerald-950/20" : ""
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectUser(member.id)}
                          className="accent-emerald-600 h-3.5 w-3.5 rounded"
                        />
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-xs font-bold text-[#004F32] dark:text-emerald-400 shrink-0">
                            {member.avatarUrl ? (
                              <img
                                src={member.avatarUrl}
                                alt={member.name}
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              member.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-foreground leading-tight">{member.name}</p>
                            <p className="text-[11px] text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <p className="font-semibold text-foreground">
                          {member.department || "N/A"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          ID: {member.studentOrVoterId}
                        </p>
                      </td>

                      <td className="p-3">
                        <p className="font-semibold text-foreground">{member.phone}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span>WA: {member.whatsappNumber || "N/A"}</span>
                          {member.bloodGroup && (
                            <span className="font-bold text-rose-600">
                              ({member.bloodGroup.replace("_POSITIVE", "+").replace("_NEGATIVE", "-")})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 space-y-1">
                        <div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              member.rudcMemberType === "SHURA_MEMBER"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                                : member.rudcMemberType === "EXECUTIVE_COMMITTEE"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                : member.rudcMemberType === "MEMBER"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {member.rudcMemberType || "VOLUNTEER"}
                          </span>
                        </div>
                        <div>
                          <span
                            className={`inline-block text-[10px] font-semibold ${
                              member.rudcStatus === "APPROVED"
                                ? "text-emerald-600"
                                : member.rudcStatus === "INTERVIEW_CALLED"
                                ? "text-amber-600"
                                : member.rudcStatus === "REJECTED"
                                ? "text-rose-600"
                                : "text-muted-foreground"
                            }`}
                          >
                            {member.rudcStatus?.replace("_", " ") || "PENDING"}
                          </span>
                        </div>
                      </td>

                      <td className="p-3">
                        {member.supervisor ? (
                          <div>
                            <p className="font-semibold text-foreground">{member.supervisor.name}</p>
                            <p className="text-[11px] text-muted-foreground">{member.supervisor.phone}</p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">None</span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewMember(member)}
                            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
                            title="View Full Application Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setPromoteMember(member);
                              setPromoteForm({
                                rudcMemberType: member.rudcMemberType || "MEMBER",
                                rudcStatus: member.rudcStatus || "APPROVED",
                                supervisorId: member.supervisorId ? String(member.supervisorId) : "",
                              });
                            }}
                            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-[#004F32] dark:text-emerald-400"
                            title="Promote or Change Role"
                          >
                            <Shield className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openRuilConversionModal([{ id: member.id, name: member.name }])}
                            className="p-1.5 rounded-lg border border-border bg-card hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            title="Make RUIL Member (Verify / Grant Library Membership)"
                          >
                            <Banknote className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal 1: Send Interview Email ────────────────────────── */}
      {interviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-foreground">
                  Send Interview Call ({selectedUserIds.length} Applicants)
                </h3>
              </div>
              <button
                onClick={() => setInterviewModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSendInterview} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Interview Date *</label>
                  <input
                    type="date"
                    required
                    value={interviewForm.interviewDate}
                    onChange={(e) =>
                      setInterviewForm({ ...interviewForm, interviewDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Interview Time</label>
                  <input
                    type="text"
                    value={interviewForm.interviewTime}
                    onChange={(e) =>
                      setInterviewForm({ ...interviewForm, interviewTime: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Venue or Meeting Link *</label>
                <input
                  type="text"
                  required
                  value={interviewForm.venueOrLink}
                  onChange={(e) =>
                    setInterviewForm({ ...interviewForm, venueOrLink: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Instructions</label>
                <textarea
                  rows={2}
                  value={interviewForm.instructions}
                  onChange={(e) =>
                    setInterviewForm({ ...interviewForm, instructions: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setInterviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-card text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSendingEmail ? "Sending..." : "Send Invitation"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal 2: View Application Details ────────────────────── */}
      {viewMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#004F32] dark:text-emerald-400" />
                <h3 className="text-base font-bold text-foreground">
                  Applicant Details: {viewMember.name}
                </h3>
              </div>
              <button
                onClick={() => setViewMember(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/40">
                <div>
                  <span className="text-muted-foreground block">Email</span>
                  <span className="font-semibold text-foreground">{viewMember.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Mobile / WhatsApp</span>
                  <span className="font-semibold text-foreground">
                    {viewMember.phone} / {viewMember.whatsappNumber || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Department & Faculty</span>
                  <span className="font-semibold text-foreground">
                    {viewMember.department || "N/A"} ({viewMember.faculty || "N/A"})
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Student / Voter ID</span>
                  <span className="font-semibold text-foreground">
                    {viewMember.studentOrVoterId}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Blood Group</span>
                  <span className="font-bold text-rose-600">
                    {viewMember.bloodGroup?.replace("_POSITIVE", "+").replace("_NEGATIVE", "-") || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Accommodation</span>
                  <span className="font-semibold text-foreground">
                    {viewMember.accommodationType} - {viewMember.accommodationName || "N/A"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block font-semibold mb-1">
                  Permanent Address
                </span>
                <p className="p-3 rounded-xl bg-muted/30 border border-border/60 text-foreground">
                  {viewMember.permanentAddress || "Not specified"}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground block font-semibold mb-1">
                  Skills & Expertise
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {viewMember.skills?.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-[#004F32] dark:text-emerald-300 font-medium"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block font-semibold mb-1">
                  Other Organization Affiliation
                </span>
                <p className="text-foreground">
                  {viewMember.isAffiliatedWithOther
                    ? `Yes, affiliated with: ${viewMember.otherOrgName}`
                    : "No other political or external affiliations"}
                </p>
              </div>

              {viewMember.interviewDate && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-1">
                  <p className="font-bold">Interview Scheduled:</p>
                  <p>Date: {new Date(viewMember.interviewDate).toLocaleDateString()}</p>
                  {viewMember.interviewNotes && <p>Notes: {viewMember.interviewNotes}</p>}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <button
                onClick={() => setViewMember(null)}
                className="px-4 py-2 rounded-xl bg-muted text-foreground text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal 3: Promote / Change Role & Supervisor ───────────── */}
      {promoteMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#004F32] dark:text-emerald-400" />
                <h3 className="text-base font-bold text-foreground">
                  Promote / Role: {promoteMember.name}
                </h3>
              </div>
              <button
                onClick={() => setPromoteMember(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSavePromote} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Member Type (Role)</label>
                <select
                  value={promoteForm.rudcMemberType}
                  onChange={(e) =>
                    setPromoteForm({
                      ...promoteForm,
                      rudcMemberType: e.target.value as RudcMemberType,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                >
                  <option value="VOLUNTEER">VOLUNTEER (Initial)</option>
                  <option value="MEMBER">MEMBER (Permanent after supervision)</option>
                  <option value="EXECUTIVE_COMMITTEE">EXECUTIVE_COMMITTEE</option>
                  <option value="SHURA_MEMBER">SHURA_MEMBER</option>
                  <option value="ALUMNI">ALUMNI</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Application Status</label>
                <select
                  value={promoteForm.rudcStatus}
                  onChange={(e) =>
                    setPromoteForm({
                      ...promoteForm,
                      rudcStatus: e.target.value as RudcApplicationStatus,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                >
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="INTERVIEW_CALLED">Interview Called</option>
                  <option value="INTERVIEW_COMPLETED">Interview Completed</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Assign Supervisor</label>
                <select
                  value={promoteForm.supervisorId}
                  onChange={(e) =>
                    setPromoteForm({ ...promoteForm, supervisorId: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                >
                  <option value="">No Supervisor (Unassigned)</option>
                  {members
                    .filter((m) => m.id !== promoteMember.id)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.rudcMemberType})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setPromoteMember(null)}
                  className="px-4 py-2 rounded-xl border border-border bg-card text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingMember}
                  className="px-5 py-2 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white font-bold disabled:opacity-50"
                >
                  {isUpdatingMember ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal 4: Add Pre-existed RUDC Member with All Recruitment Fields ─── */}
      {preExistedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[#004F32] dark:text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Add Pre-existed RUDC Member (Manual Entry)
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    সদস্য রিক্রুটমেন্ট ফর্মের সকল ফিল্ডসহ পূর্ববর্তী বা নতুন মেম্বারের তথ্য সংরক্ষণ করুন
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreExistedModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePreExisted} className="space-y-4 text-xs">
              {/* 1. Basic Identity */}
              <div className="space-y-2 border-b border-border/60 pb-3">
                <h4 className="text-[11px] font-black uppercase text-[#004F32] dark:text-emerald-400 tracking-wider">
                  ১. প্রাথমিক পরিচয় (Basic Identity)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={preExistedForm.name}
                      onChange={(e) => setPreExistedForm({ ...preExistedForm, name: e.target.value })}
                      placeholder="মেম্বারের পূর্ণ নাম"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={preExistedForm.email}
                      onChange={(e) => setPreExistedForm({ ...preExistedForm, email: e.target.value })}
                      placeholder="example@mail.com"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={preExistedForm.phone}
                      onChange={(e) => setPreExistedForm({ ...preExistedForm, phone: e.target.value })}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">WhatsApp Number</label>
                    <input
                      type="tel"
                      value={preExistedForm.whatsappNumber}
                      onChange={(e) =>
                        setPreExistedForm({ ...preExistedForm, whatsappNumber: e.target.value })
                      }
                      placeholder="01XXXXXXXXX"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Student ID / NID / Voter ID *</label>
                    <input
                      type="text"
                      required
                      value={preExistedForm.studentOrVoterId}
                      onChange={(e) =>
                        setPreExistedForm({ ...preExistedForm, studentOrVoterId: e.target.value })
                      }
                      placeholder="রোল বা জাতীয় পরিচয়পত্র নং"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Blood Group</label>
                    <select
                      value={preExistedForm.bloodGroup}
                      onChange={(e) =>
                        setPreExistedForm({
                          ...preExistedForm,
                          bloodGroup: e.target.value as BloodGroup,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                    >
                      <option value="A_POSITIVE">A+ (A Positive)</option>
                      <option value="A_NEGATIVE">A- (A Negative)</option>
                      <option value="B_POSITIVE">B+ (B Positive)</option>
                      <option value="B_NEGATIVE">B- (B Negative)</option>
                      <option value="AB_POSITIVE">AB+ (AB Positive)</option>
                      <option value="AB_NEGATIVE">AB- (AB Negative)</option>
                      <option value="O_POSITIVE">O+ (O Positive)</option>
                      <option value="O_NEGATIVE">O- (O Negative)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Academic & Residential Info */}
              <div className="space-y-3 border-b border-border/60 pb-3">
                <h4 className="text-[11px] font-black uppercase text-[#004F32] dark:text-emerald-400 tracking-wider">
                  ২. অ্যাকাডেমিক ও আবাসন তথ্য (Academic & Residence)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Department</label>
                    <SearchableSelect
                      options={userOptions?.departments || []}
                      value={preExistedForm.department}
                      onChange={(val) => setPreExistedForm({ ...preExistedForm, department: val })}
                      placeholder="Select or enter department"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Faculty</label>
                    <SearchableSelect
                      options={userOptions?.faculties || []}
                      value={preExistedForm.faculty}
                      onChange={(val) => setPreExistedForm({ ...preExistedForm, faculty: val })}
                      placeholder="Select or enter faculty"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Accommodation Type</label>
                    <select
                      value={preExistedForm.accommodationType}
                      onChange={(e) =>
                        setPreExistedForm({
                          ...preExistedForm,
                          accommodationType: e.target.value as AccommodationType,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                    >
                      <option value="HALL">Residential Hall</option>
                      <option value="MESS">Campus Mess / Hostel</option>
                      <option value="HOME">Permanent / Family Residence</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Hall / Mess / Residence Name</label>
                    <SearchableSelect
                      options={userOptions?.accommodationNames || []}
                      value={preExistedForm.accommodationName}
                      onChange={(val) => setPreExistedForm({ ...preExistedForm, accommodationName: val })}
                      placeholder="Select or enter hall / mess name"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-foreground">Permanent Address (JSON Structure)</label>
                    <PermanentAddressInput
                      value={preExistedForm.permanentAddress}
                      onChange={(val) => setPreExistedForm({ ...preExistedForm, permanentAddress: val })}
                      villageOptions={userOptions?.villages || []}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Skills */}
              <div className="space-y-2 border-b border-border/60 pb-3">
                <h4 className="text-[11px] font-black uppercase text-[#004F32] dark:text-emerald-400 tracking-wider">
                  ৩. মেম্বারের দক্ষতা ও স্কিল (Skills & Expertise)
                </h4>
                <CreatableTagSelect
                  values={preExistedForm.skills}
                  onChange={(tags) => setPreExistedForm({ ...preExistedForm, skills: tags })}
                  options={userOptions?.skills || []}
                  placeholder="Select pre-existing skill or type custom skill and press Enter..."
                />
              </div>

              {/* 4. Membership, Supervisor & Teams */}
              <div className="space-y-2 border-b border-border/60 pb-3">
                <h4 className="text-[11px] font-black uppercase text-[#004F32] dark:text-emerald-400 tracking-wider">
                  ৪. মেম্বারশিপ ও দায়িত্ব বণ্টন (Role, Supervisor & Teams)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Member Role</label>
                    <select
                      value={preExistedForm.rudcMemberType}
                      onChange={(e) =>
                        setPreExistedForm({
                          ...preExistedForm,
                          rudcMemberType: e.target.value as RudcMemberType,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                    >
                      <option value="MEMBER">Permanent Member</option>
                      <option value="EXECUTIVE_COMMITTEE">Executive Committee</option>
                      <option value="SHURA_MEMBER">Shura Member</option>
                      <option value="VOLUNTEER">Volunteer</option>
                      <option value="ALUMNI">Alumni</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Application Status</label>
                    <select
                      value={preExistedForm.rudcStatus}
                      onChange={(e) =>
                        setPreExistedForm({
                          ...preExistedForm,
                          rudcStatus: e.target.value as RudcApplicationStatus,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                    >
                      <option value="APPROVED">Approved</option>
                      <option value="PENDING_REVIEW">Pending Review</option>
                      <option value="INTERVIEW_CALLED">Interview Called</option>
                      <option value="INTERVIEW_COMPLETED">Interview Completed</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Assign Supervisor</label>
                    <select
                      value={preExistedForm.supervisorId}
                      onChange={(e) =>
                        setPreExistedForm({ ...preExistedForm, supervisorId: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                    >
                      <option value="">No Supervisor (Unassigned)</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.rudcMemberType})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Affiliated with other org */}
                <div className="pt-2 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={preExistedForm.isAffiliatedWithOther}
                      onChange={(e) =>
                        setPreExistedForm({
                          ...preExistedForm,
                          isAffiliatedWithOther: e.target.checked,
                          otherOrgName: e.target.checked ? preExistedForm.otherOrgName : "",
                        })
                      }
                      className="accent-emerald-600 rounded-md h-3.5 w-3.5"
                    />
                    <span className="text-foreground font-semibold">
                      অন্য কোনো ছাত্র সংগঠন বা দলের সাথে সক্রিয় সংশ্লিষ্টতা রয়েছে?
                    </span>
                  </label>

                  {preExistedForm.isAffiliatedWithOther && (
                    <div className="space-y-1 pl-5">
                      <label className="font-semibold text-foreground">সংগঠনের নাম</label>
                      <input
                        type="text"
                        value={preExistedForm.otherOrgName}
                        onChange={(e) =>
                          setPreExistedForm({ ...preExistedForm, otherOrgName: e.target.value })
                        }
                        placeholder="সংগঠন বা দলের নাম উল্লেখ করুন"
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Working Teams */}
              <div className="space-y-2">
                <label className="font-semibold text-foreground">Assign to Working Teams</label>
                <div className="grid grid-cols-2 gap-2">
                  {teams.map((tm) => {
                    const isChecked = preExistedForm.teamIds.includes(tm.id);
                    return (
                      <label
                        key={tm.id}
                        className="flex items-center gap-2 p-2 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPreExistedForm({
                                ...preExistedForm,
                                teamIds: [...preExistedForm.teamIds, tm.id],
                              });
                            } else {
                              setPreExistedForm({
                                ...preExistedForm,
                                teamIds: preExistedForm.teamIds.filter((tid) => tid !== tm.id),
                              });
                            }
                          }}
                          className="accent-emerald-600 h-3.5 w-3.5"
                        />
                        <span className="truncate">{tm.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setPreExistedModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-card text-foreground font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingPreExisted}
                  className="px-5 py-2 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white font-bold disabled:opacity-50 transition-colors shadow-xs"
                >
                  {isCreatingPreExisted ? "Adding..." : "Add Member Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ─── Modal 4: Convert to RUIL Member (With Payment Check) ─── */}
      {ruilConversionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-foreground">
                  Convert to RUIL Member (গ্রন্থাগার সদস্যপদ প্রদান)
                </h3>
              </div>
              <button
                onClick={() => setRuilConversionModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConvertToRuil} className="space-y-4 text-xs">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 space-y-1.5">
                <p className="font-bold text-emerald-900 dark:text-emerald-300">
                  Target Member(s) ({conversionTargetUsers.length}):
                </p>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {conversionTargetUsers.map((u) => (
                    <div key={u.id} className="flex items-center gap-1.5 text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="font-medium text-foreground">{u.name}</span>
                      <span className="text-[10px] text-muted-foreground">(ID #{u.id})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Verification / Confirmation */}
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={confirmPayment}
                    onChange={(e) => setConfirmPayment(e.target.checked)}
                    className="accent-emerald-600 h-4 w-4 rounded cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-foreground">
                      Confirm RUIL Library Membership Payment
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Check this if membership fee is verified or collected offline/cash.
                    </p>
                  </div>
                </label>

                {confirmPayment && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60">
                    <div className="space-y-1">
                      <label className="font-semibold text-foreground">Duration & Fee</label>
                      <select
                        value={paymentMonths}
                        onChange={(e) => setPaymentMonths(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold"
                      >
                        <option value={3}>3 Months (৳100)</option>
                        <option value={6}>6 Months (৳200)</option>
                        <option value={12}>12 Months (৳400 - 1 Year)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-foreground">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold"
                      >
                        <option value="CASH">Cash Offline</option>
                        <option value="BKASH">bKash</option>
                        <option value="NAGAD">Nagad</option>
                        <option value="ROCKET">Rocket</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setRuilConversionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-card text-foreground font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConvertingMembership}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                >
                  {isConvertingMembership ? "Granting Membership..." : "Grant RUIL Membership"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
