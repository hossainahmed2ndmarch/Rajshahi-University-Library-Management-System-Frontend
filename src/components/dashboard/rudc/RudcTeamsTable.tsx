"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  Plus,
  Trash2,
  Users,
  X,
  UserPlus,
  Shield,
  Search,
  Crown,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  useRudcTeams,
  useCreateRudcTeam,
  useDeleteRudcTeam,
  useAssignTeamMembers,
  useRemoveTeamMember,
  useRudcMembers,
} from "@/hooks/useRudc";
import { IRudcTeam } from "@/types/rudc";

type TeamTab = "ALL" | "ACTIVE" | "EMPTY";

export function RudcTeamsTable() {
  const { data: teams = [], isLoading } = useRudcTeams();
  const { mutateAsync: createTeam, isPending: isCreating } = useCreateRudcTeam();
  const { mutateAsync: deleteTeam } = useDeleteRudcTeam();
  const { mutateAsync: assignMembers, isPending: isAssigning } = useAssignTeamMembers();
  const { mutateAsync: removeMember } = useRemoveTeamMember();

  const { data: allMembersRes } = useRudcMembers({ limit: 1000 });
  const allMembers = allMembersRes?.data || [];

  const [activeTab, setActiveTab] = useState<TeamTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", description: "" });

  const [assignModalTeam, setAssignModalTeam] = useState<IRudcTeam | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [assignRole, setAssignRole] = useState("MEMBER");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name.trim()) return;

    try {
      await createTeam(newTeam);
      setCreateModalOpen(false);
      setNewTeam({ name: "", description: "" });
    } catch {
      // toast in hook
    }
  };

  const handleAssignMembers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalTeam) return;
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one member to assign.");
      return;
    }

    try {
      await assignMembers({
        teamId: assignModalTeam.id,
        userIds: selectedUserIds,
        role: assignRole,
      });
      setAssignModalTeam(null);
      setSelectedUserIds([]);
      setMemberSearchQuery("");
    } catch {
      // toast in hook
    }
  };

  // Filtered teams
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const matchSearch =
        !searchQuery.trim() ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.members?.some((m) => m.user.name.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (activeTab === "ACTIVE") return (t.members?.length || 0) > 0;
      if (activeTab === "EMPTY") return !t.members || t.members.length === 0;
      return true;
    });
  }, [teams, searchQuery, activeTab]);

  // Filtered members in assign modal
  const filteredMembersToAssign = useMemo(() => {
    if (!memberSearchQuery.trim()) return allMembers;
    const q = memberSearchQuery.toLowerCase();
    return allMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.department && m.department.toLowerCase().includes(q)) ||
        (m.phone && m.phone.includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q))
    );
  }, [allMembers, memberSearchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            RUDC Specialized Working Teams
          </h2>
          <p className="text-xs text-muted-foreground">
            Organize volunteers and members into skill-based functional teams with TL (Team Leader) and TCL (Team Co-Leader).
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Team</span>
        </button>
      </div>

      {/* Modern Filter Pill Bar + Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/80">
          {(
            [
              { key: "ALL", label: "All Teams", count: teams.length },
              {
                key: "ACTIVE",
                label: "With Members",
                count: teams.filter((t) => (t.members?.length || 0) > 0).length,
              },
              {
                key: "EMPTY",
                label: "Empty Teams",
                count: teams.filter((t) => !t.members || t.members.length === 0).length,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted font-mono">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:w-72">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search teams or assigned members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-card text-foreground text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="col-span-3 text-center p-8 text-xs text-muted-foreground">
            Loading teams...
          </p>
        ) : filteredTeams.length === 0 ? (
          <div className="col-span-3 rounded-2xl border border-dashed border-border p-12 text-center text-xs text-muted-foreground">
            No teams match your search or filter.
          </div>
        ) : (
          filteredTeams.map((team) => (
            <div
              key={team.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-[#004F32] dark:text-emerald-400">
                    Team #{team.id}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${team.name}?`)) {
                        deleteTeam(team.id);
                      }
                    }}
                    className="p-1 text-muted-foreground hover:text-rose-600 rounded-lg cursor-pointer"
                    title="Delete Team"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-foreground">{team.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {team.description || "Skill-based activity team"}
                </p>
              </div>

              {/* Members Preview */}
              <div className="space-y-2 border-t border-border/50 pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">
                    Assigned ({team.members?.length || 0})
                  </span>
                  <button
                    onClick={() => {
                      setAssignModalTeam(team);
                      setSelectedUserIds([]);
                      setMemberSearchQuery("");
                      setAssignRole("MEMBER");
                    }}
                    className="text-[#004F32] dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <UserPlus className="h-3 w-3" />
                    <span>Assign (TL / TCL / Member)</span>
                  </button>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {team.members?.map((m) => {
                    const isTL = m.role === "TL" || m.role === "LEADER";
                    const isTCL = m.role === "TCL" || m.role === "CO_LEADER";
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-1.5 rounded-lg bg-muted/40 text-[11px]"
                      >
                        <div className="truncate flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">{m.user.name}</span>
                          {isTL && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 font-extrabold text-[9px] flex items-center gap-0.5">
                              <Crown className="h-2.5 w-2.5" /> TL
                            </span>
                          )}
                          {isTCL && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-700 dark:text-blue-400 font-extrabold text-[9px] flex items-center gap-0.5">
                              <Shield className="h-2.5 w-2.5" /> TCL
                            </span>
                          )}
                          {!isTL && !isTCL && (
                            <span className="px-1.5 py-0.2 rounded bg-muted text-muted-foreground text-[9px]">
                              Member
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeMember({ teamId: team.id, userId: m.userId })}
                          className="text-muted-foreground hover:text-rose-600 p-0.5 cursor-pointer"
                          title="Remove member"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                  {(!team.members || team.members.length === 0) && (
                    <p className="text-[11px] text-muted-foreground italic">No members assigned yet.</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal 1: Create Team */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-card-foreground">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Create New RUDC Team</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Team Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Food Team, Graphics Team, Media Team"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Description</label>
                <textarea
                  rows={3}
                  placeholder="Responsibilities and tasks of this team..."
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-card text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white font-bold disabled:opacity-50 cursor-pointer"
                >
                  {isCreating ? "Creating..." : "Create Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Assign Members with TL & TCL Options */}
      {assignModalTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 text-card-foreground max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Assign to {assignModalTeam.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Assign members or leaders to this functional working team.
                </p>
              </div>
              <button
                onClick={() => setAssignModalTeam(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAssignMembers} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Designated Team Assignment Role *
                </label>
                <select
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="MEMBER">Team Member</option>
                  <option value="TL">Team Leader (TL)</option>
                  <option value="TCL">Team Co-Leader (TCL)</option>
                </select>
                <p className="text-[11px] text-muted-foreground">
                  Choose <strong>TL</strong> for Team Leader or <strong>TCL</strong> for Team Co-Leader.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground">
                    Select Members ({selectedUserIds.length} selected)
                  </label>
                  {selectedUserIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedUserIds([])}
                      className="text-[11px] text-emerald-600 hover:underline cursor-pointer"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                {/* Member Search */}
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by member name, dept, or phone..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1.5 border border-border rounded-xl p-2 bg-background">
                  {filteredMembersToAssign.length === 0 ? (
                    <p className="text-center p-4 text-muted-foreground text-xs">
                      No members found matching &quot;{memberSearchQuery}&quot;.
                    </p>
                  ) : (
                    filteredMembersToAssign.map((m) => {
                      const isChecked = selectedUserIds.includes(m.id);
                      return (
                        <label
                          key={m.id}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            isChecked
                              ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30"
                              : "hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUserIds([...selectedUserIds, m.id]);
                                } else {
                                  setSelectedUserIds(
                                    selectedUserIds.filter((id) => id !== m.id)
                                  );
                                }
                              }}
                              className="accent-emerald-600 h-3.5 w-3.5 rounded cursor-pointer"
                            />
                            <div>
                              <p className="font-semibold text-foreground">{m.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {m.department || "RU"} • {m.rudcMemberType}
                              </p>
                            </div>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setAssignModalTeam(null)}
                  className="px-4 py-2 rounded-xl border border-border bg-card text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-5 py-2 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white font-bold disabled:opacity-50 cursor-pointer"
                >
                  {isAssigning ? "Assigning..." : `Confirm Assignment as ${assignRole}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
