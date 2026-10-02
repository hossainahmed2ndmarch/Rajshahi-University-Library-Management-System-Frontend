"use client";

import React, { useState } from "react";
import {
  Layers,
  Plus,
  Trash2,
  Users,
  X,
  UserPlus,
  Shield,
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

export function RudcTeamsTable() {
  const { data: teams = [], isLoading } = useRudcTeams();
  const { mutateAsync: createTeam, isPending: isCreating } = useCreateRudcTeam();
  const { mutateAsync: deleteTeam } = useDeleteRudcTeam();
  const { mutateAsync: assignMembers, isPending: isAssigning } = useAssignTeamMembers();
  const { mutateAsync: removeMember } = useRemoveTeamMember();

  const { data: allMembersRes } = useRudcMembers({ limit: 1000 });
  const allMembers = allMembersRes?.data || [];

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", description: "" });

  const [assignModalTeam, setAssignModalTeam] = useState<IRudcTeam | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [assignRole, setAssignRole] = useState("MEMBER");

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
    } catch {
      // toast in hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            RUDC Specialized Working Teams
          </h2>
          <p className="text-xs text-muted-foreground">
            Organize volunteers and members into skill-based functional teams (Food, Graphics, Media, Logistics).
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

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="col-span-3 text-center p-8 text-xs text-muted-foreground">
            Loading teams...
          </p>
        ) : teams.length === 0 ? (
          <div className="col-span-3 rounded-2xl border border-dashed border-border p-12 text-center text-xs text-muted-foreground">
            No teams created yet. Click &quot;Create New Team&quot; to add one (e.g. Food Team, Graphics Team).
          </div>
        ) : (
          teams.map((team) => (
            <div
              key={team.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4"
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
                    className="p-1 text-muted-foreground hover:text-rose-600 rounded-lg"
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
                    }}
                    className="text-[#004F32] dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                  >
                    <UserPlus className="h-3 w-3" />
                    <span>Assign</span>
                  </button>
                </div>

                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                  {team.members?.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-1.5 rounded-lg bg-muted/40 text-[11px]"
                    >
                      <div className="truncate flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">{m.user.name}</span>
                        {m.role === "LEADER" && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 font-bold text-[9px]">
                            LEADER
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeMember({ teamId: team.id, userId: m.userId })}
                        className="text-muted-foreground hover:text-rose-600 p-0.5"
                        title="Remove member"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
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
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Create New RUDC Team</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
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
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Description</label>
                <textarea
                  rows={3}
                  placeholder="Responsibilities and tasks of this team..."
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-card text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white font-bold disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Assign Members */}
      {assignModalTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                Assign Members to {assignModalTeam.name}
              </h3>
              <button
                onClick={() => setAssignModalTeam(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAssignMembers} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Member Role in Team</label>
                <select
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                >
                  <option value="MEMBER">Team Member</option>
                  <option value="LEADER">Team Leader</option>
                  <option value="CO_LEADER">Co-Leader</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Select Volunteers / Members ({selectedUserIds.length} selected)
                </label>
                <div className="max-h-60 overflow-y-auto space-y-1.5 border border-border rounded-xl p-2 bg-background">
                  {allMembers.map((m) => {
                    const isChecked = selectedUserIds.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                          isChecked ? "bg-emerald-50 dark:bg-emerald-950/40" : "hover:bg-muted/40"
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
                                setSelectedUserIds(selectedUserIds.filter((id) => id !== m.id));
                              }
                            }}
                            className="accent-emerald-600 h-3.5 w-3.5"
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
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setAssignModalTeam(null)}
                  className="px-4 py-2 rounded-xl border border-border bg-card text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-5 py-2 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white font-bold disabled:opacity-50"
                >
                  {isAssigning ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
