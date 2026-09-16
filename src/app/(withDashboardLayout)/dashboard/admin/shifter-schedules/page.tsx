"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Sun,
  MoonStar,
  User,
  Search,
  MessageCircle,
  Phone,
} from "lucide-react";
import {
  useWeeklyRoster,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
} from "@/hooks/useShifts";
import { useGetUsers } from "@/hooks/useUsers";
import { IShifterSchedule, ICreateSchedulePayload } from "@/types/shift";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const DAYS_CONFIG = [
  { dayOfWeek: 6, dayName: "শনিবার", dayEn: "Saturday" },
  { dayOfWeek: 0, dayName: "রবিবার", dayEn: "Sunday" },
  { dayOfWeek: 1, dayName: "সোমবার", dayEn: "Monday" },
  { dayOfWeek: 2, dayName: "মঙ্গলবার", dayEn: "Tuesday" },
  { dayOfWeek: 3, dayName: "বুধবার", dayEn: "Wednesday" },
  { dayOfWeek: 4, dayName: "বৃহস্পতিবার", dayEn: "Thursday" },
  { dayOfWeek: 5, dayName: "শুক্রবার", dayEn: "Friday" },
];

const PRESET_SLOTS = [
  {
    slot: "fajr_morning",
    slotName: "ফজর – সকাল (Fajr)",
    startTime: "05:00",
    endTime: "07:00",
    icon: Sun,
  },
  {
    slot: "dhuhr_afternoon",
    slotName: "যোহর – দুপুর (Dhuhr)",
    startTime: "12:45",
    endTime: "15:30",
    icon: Sun,
  },
  {
    slot: "asr_maghrib",
    slotName: "আসর – মাগরিব (Asr)",
    startTime: "15:30",
    endTime: "18:15",
    icon: Sun,
  },
  {
    slot: "maghrib_isha",
    slotName: "মাগরিব – এশা (Maghrib)",
    startTime: "18:15",
    endTime: "20:15",
    icon: MoonStar,
  },
  {
    slot: "isha_night",
    slotName: "এশা – রাত (Isha)",
    startTime: "20:15",
    endTime: "22:00",
    icon: MoonStar,
  },
  {
    slot: "custom",
    slotName: "কাস্টম সময় (Custom)",
    startTime: "16:00",
    endTime: "19:00",
    icon: Clock,
  },
];

export default function AdminShifterSchedulesPage() {
  const { data: schedules = [], isLoading } = useWeeklyRoster();
  const { data: users = [] } = useGetUsers();

  const { mutate: createSchedule, isPending: isCreating } = useCreateSchedule();
  const { mutate: updateSchedule, isPending: isUpdating } = useUpdateSchedule();
  const { mutate: deleteSchedule, isPending: isDeleting } = useDeleteSchedule();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>("ALL");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<IShifterSchedule | null>(null);

  // Form states
  const [selectedShifterId, setSelectedShifterId] = useState<string>("");
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(6);
  const [selectedSlot, setSelectedSlot] = useState<string>("asr_maghrib");
  const [slotName, setSlotName] = useState<string>("আসর – মাগরিব");
  const [startTime, setStartTime] = useState<string>("15:30");
  const [endTime, setEndTime] = useState<string>("18:15");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>("");

  // Filter users to only shifters and admins
  const eligibleShifters = useMemo(() => {
    return users.filter(
      (u) =>
        u.role === "SHIFTER" ||
        u.role === "ADMIN" ||
        u.role === "SUPER_ADMIN"
    );
  }, [users]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingSchedule(null);
    setSelectedShifterId(eligibleShifters[0]?.id ? String(eligibleShifters[0].id) : "");
    setSelectedDayOfWeek(6);
    setSelectedSlot("asr_maghrib");
    setSlotName("আসর – মাগরিব");
    setStartTime("15:30");
    setEndTime("18:15");
    setIsActive(true);
    setNotes("");
    setModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (schedule: IShifterSchedule) => {
    setEditingSchedule(schedule);
    setSelectedShifterId(String(schedule.shifterId));
    setSelectedDayOfWeek(schedule.dayOfWeek);
    setSelectedSlot(schedule.slot);
    setSlotName(schedule.slotName);
    setStartTime(schedule.startTime);
    setEndTime(schedule.endTime);
    setIsActive(schedule.isActive);
    setNotes(schedule.notes || "");
    setModalOpen(true);
  };

  const handleSlotPresetChange = (presetSlot: string) => {
    setSelectedSlot(presetSlot);
    const preset = PRESET_SLOTS.find((p) => p.slot === presetSlot);
    if (preset) {
      setSlotName(preset.slotName);
      setStartTime(preset.startTime);
      setEndTime(preset.endTime);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dayConfig = DAYS_CONFIG.find((d) => d.dayOfWeek === Number(selectedDayOfWeek));
    if (!dayConfig || !selectedShifterId) return;

    const payload: ICreateSchedulePayload = {
      shifterId: Number(selectedShifterId),
      dayOfWeek: Number(selectedDayOfWeek),
      dayName: dayConfig.dayName,
      dayEn: dayConfig.dayEn,
      slot: selectedSlot,
      slotName,
      startTime,
      endTime,
      isActive,
      notes: notes || undefined,
    };

    if (editingSchedule) {
      updateSchedule(
        { id: editingSchedule.id, payload },
        { onSuccess: () => setModalOpen(false) }
      );
    } else {
      createSchedule(payload, { onSuccess: () => setModalOpen(false) });
    }
  };

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchesDay =
        selectedDayFilter === "ALL" || String(s.dayOfWeek) === selectedDayFilter;
      const matchesSearch =
        !searchTerm ||
        s.shifter?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.slotName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.dayName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDay && matchesSearch;
    });
  }, [schedules, selectedDayFilter, searchTerm]);

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>ডিউটি রোস্টার ম্যানেজমেন্ট</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            শিফটার সময়সূচি ও নামাজ ভিত্তিক স্লট
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            প্রতিদিনের নামাজের সময় ভিত্তিক শিফট শুরুর ও সমাপ্তির সময় নির্ধারণ করুন।
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-[#004F32] hover:bg-[#003824] text-white font-bold h-10 px-4 shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5" /> নতুন শিডিউল যোগ করুন
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-3.5 rounded-2xl">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="শিফটার বা স্লট খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setSelectedDayFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              selectedDayFilter === "ALL"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            সকল দিন
          </button>
          {DAYS_CONFIG.map((d) => (
            <button
              key={d.dayOfWeek}
              onClick={() => setSelectedDayFilter(String(d.dayOfWeek))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                selectedDayFilter === String(d.dayOfWeek)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {d.dayName}
            </button>
          ))}
        </div>
      </div>

      {/* Schedules Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground font-bold uppercase tracking-wider text-[11px] border-b border-border">
              <tr>
                <th className="px-5 py-3.5">দিন (Day)</th>
                <th className="px-5 py-3.5">শিফটার (Shifter)</th>
                <th className="px-5 py-3.5">নামাজ স্লট (Prayer Slot)</th>
                <th className="px-5 py-3.5">সময় (Timing)</th>
                <th className="px-5 py-3.5">স্ট্যাটাস</th>
                <th className="px-5 py-3.5 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                    সময়সূচি লোড হচ্ছে...
                  </td>
                </tr>
              ) : filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                    কোনো নির্ধারিত শিডিউল পাওয়া যায়নি। &ldquo;নতুন শিডিউল যোগ করুন&rdquo; এ ক্লিক করুন।
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4 font-bold text-foreground">
                      <span className="inline-flex px-2.5 py-1 rounded-md bg-primary/10 text-primary font-black text-xs">
                        {schedule.dayName}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {schedule.shifter?.name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">
                            {schedule.shifter?.name || "Unknown Shifter"}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {schedule.shifter?.phone || schedule.shifter?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold">
                        <Clock className="h-3 w-3" />
                        {schedule.slotName}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-foreground">
                      {schedule.startTime} – {schedule.endTime}
                    </td>
                    <td className="px-5 py-4">
                      {schedule.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> সক্রিয়
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground font-bold">
                          <XCircle className="h-3.5 w-3.5" /> নিষ্ক্রিয়
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {schedule.shifter?.phone && (
                          <a
                            href={`https://wa.me/88${schedule.shifter.phone.replace(/-/g, "")}?text=${encodeURIComponent(
                              `আসসালামু আলাইকুম ${schedule.shifter?.name || "ভাই"}, RU Islamic Library তে আপনার নির্ধারিত কাউন্টার ডিউটি শিডিউল:\n📅 বার: ${schedule.dayName} (${schedule.dayEn})\n⏰ স্লট: ${schedule.slotName} (${schedule.startTime} - ${schedule.endTime})\n\nঅনুগ্রহ করে সময়মতো উপস্থিত থাকবেন। জাযাকাল্লাহু খাইরান।`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="শিফটারকে হোয়াটসঅ্যাপে শিফট রিমাইন্ডার পাঠান"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenEdit(schedule)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="সম্পাদনা করুন"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`আপনি কি "${schedule.dayName}" এর এই শিডিউলটি মুছতে চান?`)) {
                              deleteSchedule(schedule.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="মুছে ফেলুন"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md rounded-2xl border-border bg-card p-6 shadow-xl">
          <DialogHeader className="space-y-1 pb-2 border-b border-border/60">
            <DialogTitle className="text-xl font-black text-foreground">
              {editingSchedule ? "শিডিউল সম্পাদনা করুন" : "নতুন শিডিউল নির্ধারণ"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              শিফটার, বার এবং নামাজের সময় অনুযায়ী শুরুর ও শেষ সময় নির্ধারণ করুন।
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Shifter select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                শিফটার নির্বাচন করুন *
              </Label>
              <select
                value={selectedShifterId}
                onChange={(e) => setSelectedShifterId(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground"
                required
              >
                <option value="">-- শিফটার নির্বাচন করুন --</option>
                {eligibleShifters.map((u) => (
                  <option key={u.id} value={String(u.id)}>
                    {u.name} ({u.phoneNumber || u.email}) — {u.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Day of Week */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">দিন (Day) *</Label>
              <select
                value={selectedDayOfWeek}
                onChange={(e) => setSelectedDayOfWeek(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground"
                required
              >
                {DAYS_CONFIG.map((d) => (
                  <option key={d.dayOfWeek} value={d.dayOfWeek}>
                    {d.dayName} ({d.dayEn})
                  </option>
                ))}
              </select>
            </div>

            {/* Preset Slot (Prayer Times Based) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                নামাজ ভিত্তিক স্লট প্রিসেট
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_SLOTS.map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedSlot === p.slot;
                  return (
                    <button
                      type="button"
                      key={p.slot}
                      onClick={() => handleSlotPresetChange(p.slot)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "bg-primary/10 border-primary text-primary font-bold shadow-2xs"
                          : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/60"
                      }`}
                    >
                      <Icon className="h-4 w-4 mb-1" />
                      <span className="text-[11px] leading-tight">{p.slotName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slot Name Display */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                স্লটের নাম (Display Name) *
              </Label>
              <Input
                value={slotName}
                onChange={(e) => setSlotName(e.target.value)}
                placeholder="যেমন: আসর – মাগরিব"
                className="text-xs"
                required
              />
            </div>

            {/* Timing (Start Time & End Time) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">
                  শুরুর সময় (HH:MM) *
                </Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="text-xs font-mono"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">
                  শেষের সময় (HH:MM) *
                </Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="text-xs font-mono"
                  required
                />
              </div>
            </div>

            {/* Active checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isActiveSchedule"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <Label htmlFor="isActiveSchedule" className="text-xs font-bold cursor-pointer">
                এই শিডিউলটি সক্রিয় রাখুন (Active)
              </Label>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => setModalOpen(false)}
              >
                বাতিল (Cancel)
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#004F32] hover:bg-[#003824] text-white font-bold text-xs"
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating
                  ? "সংরক্ষণ হচ্ছে..."
                  : editingSchedule
                  ? "আপডেট করুন"
                  : "সংরক্ষণ করুন"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
