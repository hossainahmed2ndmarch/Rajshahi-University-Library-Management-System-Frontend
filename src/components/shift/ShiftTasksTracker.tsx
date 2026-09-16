"use client";

import React, { useState, useEffect } from "react";
import {
  ListChecks,
  CheckCircle2,
  Circle,
  Plus,
  ArrowRightLeft,
  Clock,
  User,
  Sparkles,
  Trash2,
  CheckSquare2,
  Calendar,
  Layers,
  ArrowDownCircle,
  FileText,
} from "lucide-react";
import { IShift } from "@/types/shift";
import { format } from "date-fns";
import { toast } from "sonner";

export interface ITaskItem {
  id: string;
  title: string;
  isCompleted: boolean;
  isResumed?: boolean;
  resumedFrom?: string;
  createdAt: string;
}

const LOCAL_TASKS_KEY = "ruil_active_shift_tasks";

interface ShiftTasksTrackerProps {
  activeShift: IShift | null;
  latestCompletedShift: IShift | null;
  onOpenEndShiftModal: (prefill: {
    tasksCompleted: string;
    handoverNotes: string;
  }) => void;
}

export function ShiftTasksTracker({
  activeShift,
  latestCompletedShift,
  onOpenEndShiftModal,
}: ShiftTasksTrackerProps) {
  const [tasks, setTasks] = useState<ITaskItem[]>([]);
  const [newTaskInput, setNewTaskInput] = useState("");
  const [hasResumedHandover, setHasResumedHandover] = useState(false);

  const isShiftActive = activeShift && activeShift.status === "ACTIVE";

  // Load saved tasks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_TASKS_KEY);
      if (stored) {
        setTasks(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  // Handle adding custom task
  const handleAddTask = (title: string, isResumed = false, fromShifter?: string) => {
    if (!title.trim()) return;
    const newTask: ITaskItem = {
      id: "task_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      title: title.trim(),
      isCompleted: false,
      isResumed,
      resumedFrom: fromShifter,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskInput("");
  };

  // Toggle task completion
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  // Delete task
  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Resume Remaining Tasks from Previous Shift Handover
  const handleResumePreviousTasks = () => {
    if (!latestCompletedShift) return;
    const note =
      latestCompletedShift.handoverNotes || latestCompletedShift.notes;
    if (!note) {
      toast.info("No handover notes or remaining tasks found from previous shift.");
      return;
    }

    // Split note lines or sentences into task items
    const lines = note
      .split(/\r?\n|•|-|\*/)
      .map((l) => l.trim())
      .filter((l) => l.length > 2);

    const shifterName =
      latestCompletedShift.shifter?.name ||
      latestCompletedShift.shifterName ||
      "Previous Shifter";

    if (lines.length === 0) {
      handleAddTask(note, true, shifterName);
    } else {
      lines.forEach((line) => {
        handleAddTask(line, true, shifterName);
      });
    }

    setHasResumedHandover(true);
    toast.success(`Resumed remaining handover tasks from ${shifterName}!`);
  };

  // Prepare strings for check-out pre-fill
  const completedList = tasks.filter((t) => t.isCompleted);
  const pendingList = tasks.filter((t) => !t.isCompleted);

  const completedString = completedList.map((t) => `• ${t.title}`).join("\n");
  const pendingString = pendingList.map((t) => `• ${t.title}`).join("\n");

  const handleEndShiftWithTasks = () => {
    onOpenEndShiftModal({
      tasksCompleted: completedString,
      handoverNotes: pendingString,
    });
  };

  const completedCount = completedList.length;
  const totalCount = tasks.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const quickPresets = [
    "Verify Cash Float & Count Drawer",
    "Inspect & Shelve Returned Books",
    "Process Pending Borrow Requests",
    "Clean & Sanitize Counter Desk",
  ];

  return (
    <div className="space-y-4">
      {/* ─── 1. Previous Shift Handover Note & Remaining Tasks Banner ─── */}
      {latestCompletedShift &&
        (latestCompletedShift.handoverNotes || latestCompletedShift.tasksCompleted) && (
          <div className="rounded-2xl sm:rounded-3xl border border-amber-300/80 dark:border-amber-700/60 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-amber-300/40 dark:border-amber-700/40">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  <ArrowRightLeft className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-foreground flex items-center gap-1.5">
                    <span>Previous Duty Shift Handover &amp; Remaining Tasks</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[10px] font-bold">
                      Latest Completed
                    </span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Handed over by{" "}
                    <strong className="text-foreground">
                      {latestCompletedShift.shifter?.name ||
                        latestCompletedShift.shifterName ||
                        "Previous Shifter"}
                    </strong>{" "}
                    at{" "}
                    {latestCompletedShift.endTime
                      ? format(new Date(latestCompletedShift.endTime), "hh:mm a, dd MMM")
                      : "Shift Closing"}
                  </p>
                </div>
              </div>

              {latestCompletedShift.handoverNotes && (
                <button
                  type="button"
                  onClick={handleResumePreviousTasks}
                  disabled={hasResumedHandover}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C78700] hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <ArrowDownCircle className="h-3.5 w-3.5" />
                  <span>
                    {hasResumedHandover
                      ? "Tasks Resumed ✓"
                      : "Resume Remaining Tasks (কাজে লাগান)"}
                  </span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Previous Completed Tasks */}
              {latestCompletedShift.tasksCompleted && (
                <div className="rounded-xl border border-border/80 bg-background/60 p-3 space-y-1">
                  <span className="font-bold text-foreground flex items-center gap-1 text-[11px]">
                    <ListChecks className="h-3.5 w-3.5 text-emerald-600" />
                    Previous Shifter Completed:
                  </span>
                  <p className="text-muted-foreground whitespace-pre-line text-[11px] leading-relaxed">
                    {latestCompletedShift.tasksCompleted}
                  </p>
                </div>
              )}

              {/* Previous Handover Note */}
              {latestCompletedShift.handoverNotes && (
                <div className="rounded-xl border border-amber-300/60 dark:border-amber-700/60 bg-amber-50/80 dark:bg-amber-950/30 p-3 space-y-1">
                  <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1 text-[11px]">
                    <ArrowRightLeft className="h-3.5 w-3.5 text-amber-600" />
                    Handover Instructions &amp; Pending Tasks:
                  </span>
                  <p className="text-amber-950 dark:text-amber-200 whitespace-pre-line text-[11px] leading-relaxed font-medium">
                    {latestCompletedShift.handoverNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      {/* ─── 2. Active Duty Tasks & Checklist Tracker ─── */}
      <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CheckSquare2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-foreground flex items-center gap-2">
                <span>Duty Tasks &amp; Checklist Tracker (শিফট কাজের তালিকা)</span>
                {totalCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-mono font-bold">
                    {completedCount}/{totalCount} Completed
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Resume handover tasks, check off completed operations, and auto-sync to your end-shift audit report.
              </p>
            </div>
          </div>

          {/* End shift pre-fill shortcut */}
          {isShiftActive && totalCount > 0 && (
            <button
              type="button"
              onClick={handleEndShiftWithTasks}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold transition-colors cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-amber-600" />
              <span>Reconcile Shift with Checklist</span>
            </button>
          )}
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
              <span>Shift Task Completion Progress</span>
              <span className="font-bold text-foreground">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#004F32] to-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Task Input Field */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddTask(newTaskInput);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            placeholder="Add new duty task or operation (e.g. Issue 3 Quran sets, repair shelf D)..."
            className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!newTaskInput.trim()}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-primary hover:bg-emerald-900 disabled:opacity-50 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Task</span>
          </button>
        </form>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] text-muted-foreground font-semibold">
            Quick Add:
          </span>
          {quickPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleAddTask(preset)}
              className="px-2.5 py-1 rounded-lg border border-border/80 bg-muted/40 hover:bg-muted text-[10px] text-foreground font-medium transition-colors cursor-pointer"
            >
              + {preset}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground space-y-1">
            <CheckSquare2 className="h-6 w-6 mx-auto text-muted-foreground/50" />
            <p className="font-semibold text-foreground">No tasks logged for this shift yet.</p>
            <p className="text-[11px]">
              Add checklist items above or click &quot;Resume Remaining Tasks&quot; from the previous shift.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-start justify-between gap-3 p-3 rounded-xl border transition-colors ${
                  task.isCompleted
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/40 text-emerald-950 dark:text-emerald-200"
                    : "bg-muted/30 border-border/80 text-foreground hover:bg-muted/50"
                }`}
              >
                <div
                  className="flex items-start gap-2.5 flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleToggleTask(task.id)}
                >
                  <button
                    type="button"
                    className="mt-0.5 shrink-0 text-primary cursor-pointer"
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-semibold leading-snug ${
                        task.isCompleted
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {task.isResumed && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[9px] font-bold">
                          <ArrowRightLeft className="h-2.5 w-2.5" /> Resumed from{" "}
                          {task.resumedFrom || "Prev. Shifter"}
                        </span>
                      )}
                      {task.isCompleted && (
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-500/10 cursor-pointer transition-colors shrink-0"
                  title="Remove task"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ShiftTasksTracker;
