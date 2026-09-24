"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Layers,
  Sparkles,
  Calendar,
  Loader2,
  Building2,
} from "lucide-react";
import { ActivityService } from "@/services/event.service";
import { IActivity, ActivityStatus, Organization } from "@/types/event";
import { ActivityFormModal } from "./ActivityFormModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface ActivitiesManagementTableProps {
  roleTitle?: string;
  roleBadge?: string;
  allowDelete?: boolean;
}

export function ActivitiesManagementTable({
  roleTitle = "Activities & Programs Management",
  roleBadge = "ADMIN DESK",
  allowDelete = false,
}: ActivitiesManagementTableProps) {
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search (Tabs based instead of Select)
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [orgFilter, setOrgFilter] = useState<string>("ALL");

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const res = await ActivityService.getAllActivities({ limit: 100 });
      setActivities(res.data);
    } catch {
      toast.error("কার্যক্রম লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleDelete = async (activity: IActivity) => {
    if (!allowDelete) {
      toast.error("শুধুমাত্র Super Admin কার্যক্রম ডিলিট করতে পারবেন");
      return;
    }

    if (!confirm(`আপনি কি নিশ্চিত যে "${activity.title}" কার্যক্রমটি মুছে ফেলতে চান?`)) {
      return;
    }

    try {
      setDeletingId(activity.id);
      await ActivityService.deleteActivity(activity.id);
      toast.success("কার্যক্রম সফলভাবে মুছে ফেলা হয়েছে");
      fetchActivities();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "কার্যক্রম মুছতে ব্যর্থ হয়েছে");
    } finally {
      setDeletingId(null);
    }
  };

  // Counts for tabs
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: activities.length,
      ONGOING: 0,
      UPCOMING: 0,
      PAUSED: 0,
      COMPLETED: 0,
    };
    activities.forEach((a) => {
      if (counts[a.status] !== undefined) counts[a.status]++;
    });
    return counts;
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchSearch =
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (act.category && act.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        act.org.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === "ALL" || act.status === statusFilter;
      const matchOrg = orgFilter === "ALL" || act.org === orgFilter;
      return matchSearch && matchStatus && matchOrg;
    });
  }, [activities, searchQuery, statusFilter, orgFilter]);

  const getStatusBadge = (status: ActivityStatus) => {
    switch (status) {
      case "ONGOING":
        return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30";
      case "UPCOMING":
        return "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30";
      case "COMPLETED":
        return "bg-gray-500/15 text-gray-800 dark:text-gray-300 border-gray-500/30";
      default:
        return "bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30";
    }
  };

  const statusTabs = [
    { key: "ALL", label: "সকল কার্যক্রম", count: statusCounts.ALL },
    { key: "ONGOING", label: "Ongoing", count: statusCounts.ONGOING },
    { key: "UPCOMING", label: "Upcoming", count: statusCounts.UPCOMING },
    { key: "COMPLETED", label: "Completed", count: statusCounts.COMPLETED },
    { key: "PAUSED", label: "Paused", count: statusCounts.PAUSED },
  ];

  const orgTabs = [
    { key: "ALL", label: "All Orgs" },
    { key: "RUIL", label: "RUIL" },
    { key: "RUDC", label: "RUDC" },
    { key: "BOTH", label: "BOTH" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#003824] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-700/50 text-emerald-200 text-[11px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>{roleBadge}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">{roleTitle}</h1>
          <p className="text-xs sm:text-sm text-emerald-100/80">
            লাইব্রেরি কার্যক্রম, পাঠক ফোরাম ও দাওয়াহ সার্কেলসমূহ পরিচালনা করুন।
            {!allowDelete && " (মুছে ফেলার অনুমতি শুধুমাত্র Super Admin এর রয়েছে)"}
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedActivity(null);
            setIsFormModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-[#C78700] hover:bg-amber-600 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>নতুন কার্যক্রম যুক্ত করুন</span>
        </button>
      </div>

      {/* Modern Filter & Search Bar with Segmented Tabs */}
      <div className="bg-card border border-border rounded-3xl p-4 sm:p-5 space-y-4 shadow-xs">
        {/* Search input and Organization Pills */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="কার্যক্রম খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
          </div>

          {/* Org Filter Chips */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Building2 className="h-4 w-4 text-muted-foreground mr-1 shrink-0" />
            {orgTabs.map((tab) => {
              const isActive = orgFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setOrgFilter(tab.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 border",
                    isActive
                      ? "bg-[#003824] text-white border-[#003824] shadow-xs"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/80"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Tabs (Replacing old select) */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-border/60 pt-3">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 border",
                  isActive
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground border-border/70"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-md text-[10px] font-mono",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-muted/70 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
              <tr>
                <th className="px-5 py-3.5">কার্যক্রমের শিরোনাম</th>
                <th className="px-4 py-3.5">সংগঠন</th>
                <th className="px-4 py-3.5">ক্যাটাগরি</th>
                <th className="px-4 py-3.5">স্ট্যাটাস</th>
                <th className="px-4 py-3.5">সংযুক্ত ইভেন্ট</th>
                <th className="px-5 py-3.5 text-right">পদক্ষেপ (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>কার্যক্রম লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    <Layers className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
                    <span>কোনো কার্যক্রম পাওয়া যায়নি</span>
                  </td>
                </tr>
              ) : (
                filteredActivities.map((activity) => (
                  <tr
                    key={activity.id}
                    className="hover:bg-muted/40 transition-colors group"
                  >
                    <td className="px-5 py-4 font-semibold">
                      <div className="space-y-0.5">
                        <p className="font-bold text-foreground text-xs sm:text-sm">
                          {activity.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {activity.description || "কোনো বিবরণ প্রদান করা হয়নি"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground">
                        {activity.org}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-muted-foreground text-xs">
                        {activity.category || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                          getStatusBadge(activity.status)
                        )}
                      >
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="font-semibold text-foreground">
                          {activity._count?.events || 0}
                        </span>
                        <span className="text-[11px]">টি ইভেন্ট</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedActivity(activity);
                            setIsFormModalOpen(true);
                          }}
                          className="p-1.5 rounded-xl border border-border bg-background hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 transition-colors cursor-pointer"
                          title="সম্পাদনা করুন"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        {allowDelete && (
                          <button
                            type="button"
                            disabled={deletingId === activity.id}
                            onClick={() => handleDelete(activity)}
                            className="p-1.5 rounded-xl border border-border bg-background hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                            title="মুছে ফেলুন (Super Admin Only)"
                          >
                            {deletingId === activity.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <ActivityFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        activity={selectedActivity}
        onSuccess={fetchActivities}
      />
    </div>
  );
}
