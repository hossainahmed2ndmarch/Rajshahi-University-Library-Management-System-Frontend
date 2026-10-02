"use client";

import React, { useState } from "react";
import {
  User,
  Phone,
  Building2,
  Calendar,
  GraduationCap,
  Image as ImageIcon,
  Edit3,
  Save,
  Loader2,
  Heart,
  Home,
  MapPin,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { IUser } from "@/types/auth";
import { ProfileFormValues } from "./profileSchemas";
import { InfoRow } from "./InfoRow";
import { useGetUserOptions } from "@/hooks/useUsers";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { PermanentAddressInput, formatAddressDisplay } from "@/components/ui/PermanentAddressInput";
import { CreatableTagSelect } from "@/components/ui/CreatableTagSelect";

interface ProfilePersonalInfoSectionProps {
  user: IUser | null | undefined;
  onSaveProfile: (values: ProfileFormValues) => void;
  isUpdatingProfile: boolean;
}

const BLOOD_GROUPS = [
  { value: "A_POSITIVE", label: "A+ (A Positive)" },
  { value: "A_NEGATIVE", label: "A- (A Negative)" },
  { value: "B_POSITIVE", label: "B+ (B Positive)" },
  { value: "B_NEGATIVE", label: "B- (B Negative)" },
  { value: "AB_POSITIVE", label: "AB+ (AB Positive)" },
  { value: "AB_NEGATIVE", label: "AB- (AB Negative)" },
  { value: "O_POSITIVE", label: "O+ (O Positive)" },
  { value: "O_NEGATIVE", label: "O- (O Negative)" },
];

const ACCOMMODATION_TYPES = [
  { value: "HALL", label: "University Residential Hall" },
  { value: "MESS", label: "Student Mess / Shared Flat" },
  { value: "HOME", label: "Permanent Home / Family Residence" },
];

export function ProfilePersonalInfoSection({
  user,
  onSaveProfile,
  isUpdatingProfile,
}: ProfilePersonalInfoSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { data: userOptions } = useGetUserOptions();

  // Local state for all fields
  const [name, setName] = useState(user?.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [phone, setPhone] = useState((user?.phone ?? user?.phoneNumber) ?? "");
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber ?? "");
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup ?? "");
  const [department, setDepartment] = useState(user?.department ?? "");
  const [faculty, setFaculty] = useState(user?.faculty ?? "");
  const [session, setSession] = useState(user?.session ?? "");
  const [institution, setInstitution] = useState(user?.institution ?? "");
  const [accommodationType, setAccommodationType] = useState(user?.accommodationType ?? "HALL");
  const [accommodationName, setAccommodationName] = useState(user?.accommodationName ?? "");
  const [permanentAddress, setPermanentAddress] = useState(user?.permanentAddress ?? "");
  const [skills, setSkills] = useState<string[]>(Array.isArray(user?.skills) ? user.skills : []);

  const handleStartEdit = () => {
    setName(user?.name ?? "");
    setAvatarUrl(user?.avatarUrl ?? "");
    setPhone((user?.phone ?? user?.phoneNumber) ?? "");
    setWhatsappNumber(user?.whatsappNumber ?? "");
    setBloodGroup(user?.bloodGroup ?? "");
    setDepartment(user?.department ?? "");
    setFaculty(user?.faculty ?? "");
    setSession(user?.session ?? "");
    setInstitution(user?.institution ?? "");
    setAccommodationType(user?.accommodationType ?? "HALL");
    setAccommodationName(user?.accommodationName ?? "");
    setPermanentAddress(user?.permanentAddress ?? "");
    setSkills(Array.isArray(user?.skills) ? user.skills : []);
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name,
      avatarUrl,
      phone,
      whatsappNumber,
      bloodGroup: bloodGroup || undefined,
      department,
      faculty,
      session,
      institution,
      accommodationType: accommodationType || undefined,
      accommodationName,
      permanentAddress,
      skills,
    });
    setIsEditing(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5 text-card-foreground">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#004F32] text-white shadow-2xs">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Personal Information &amp; Background</h2>
            <p className="text-xs text-muted-foreground">
              Update personal information, academic affiliations, contact details, residence, and skills.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => (isEditing ? setIsEditing(false) : handleStartEdit())}
          className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background hover:bg-accent px-3 py-1.5 text-xs font-semibold text-foreground transition-colors cursor-pointer"
        >
          <Edit3 className="h-3.5 w-3.5 text-primary" />
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mohammad Abdullah"
                  required
                  className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Mobile Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+8801XXXXXXXXX"
                  required
                  className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp & Blood Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">WhatsApp Number</label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+8801XXXXXXXXX (WhatsApp)"
                  className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Blood Group</label>
              <div className="relative">
                <Heart className="absolute left-3 top-2.5 h-4 w-4 text-rose-500" />
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg.value} value={bg.value}>
                      {bg.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Department & Faculty (Searchable + Creatable) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Department</label>
              <SearchableSelect
                value={department}
                onChange={setDepartment}
                options={userOptions?.departments ?? []}
                placeholder="Select or enter Department..."
                icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Faculty</label>
              <SearchableSelect
                value={faculty}
                onChange={setFaculty}
                options={userOptions?.faculties ?? []}
                placeholder="Select or enter Faculty..."
                icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
              />
            </div>
          </div>

          {/* Academic Session & Institution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Academic Session</label>
              <SearchableSelect
                value={session}
                onChange={setSession}
                options={userOptions?.sessions ?? []}
                placeholder="Select or enter Session (e.g. 2023-2024)..."
                icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Institution / University</label>
              <SearchableSelect
                value={institution}
                onChange={setInstitution}
                options={userOptions?.institutions ?? ["University of Rajshahi"]}
                placeholder="Select or enter Institution..."
                icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
              />
            </div>
          </div>

          {/* Accommodation Type & Hall / Mess / Residence Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Accommodation Type</label>
              <div className="relative">
                <Home className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <select
                  value={accommodationType}
                  onChange={(e) => setAccommodationType(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  {ACCOMMODATION_TYPES.map((acc) => (
                    <option key={acc.value} value={acc.value}>
                      {acc.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Hall / Mess / Residence Name
              </label>
              <SearchableSelect
                value={accommodationName}
                onChange={setAccommodationName}
                options={userOptions?.accommodationNames ?? []}
                placeholder="Select or enter Hall, Mess or Residence name..."
                icon={<Home className="h-4 w-4 text-muted-foreground" />}
              />
            </div>
          </div>

          {/* Permanent Address (JSON Structured selection) */}
          <div className="space-y-1">
            <PermanentAddressInput
              value={permanentAddress}
              onChange={setPermanentAddress}
              villageOptions={userOptions?.villages ?? []}
            />
          </div>

          {/* Skills & Expertise (Creatable Tag selection) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>দক্ষতা ও অভিজ্ঞতা (Skills &amp; Expertise)</span>
            </label>
            <CreatableTagSelect
              values={skills}
              onChange={setSkills}
              options={userOptions?.skills ?? []}
              placeholder="Type new skill and press Enter, or choose from suggestions..."
            />
          </div>

          {/* Avatar URL */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Profile Image / Avatar URL</label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://... cloud or image URL"
                className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 gap-2 border-t border-border">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-input bg-background hover:bg-accent text-foreground cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="inline-flex items-center gap-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 px-5 py-2 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 text-amber-300" /> Save Profile Changes
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          <InfoRow
            icon={<User className="h-3.5 w-3.5 text-primary" />}
            label="Full Name"
            value={user?.name ?? "—"}
          />
          <InfoRow
            icon={<Phone className="h-3.5 w-3.5 text-primary" />}
            label="Mobile Phone"
            value={user?.phone ?? user?.phoneNumber ?? "—"}
          />
          <InfoRow
            icon={<MessageCircle className="h-3.5 w-3.5 text-emerald-600" />}
            label="WhatsApp Number"
            value={user?.whatsappNumber ?? "—"}
          />
          <InfoRow
            icon={<Heart className="h-3.5 w-3.5 text-rose-500" />}
            label="Blood Group"
            value={
              BLOOD_GROUPS.find((b) => b.value === user?.bloodGroup)?.label ||
              user?.bloodGroup ||
              "—"
            }
          />
          <InfoRow
            icon={<GraduationCap className="h-3.5 w-3.5 text-primary" />}
            label="Department"
            value={user?.department ?? "—"}
          />
          <InfoRow
            icon={<Building2 className="h-3.5 w-3.5 text-primary" />}
            label="Faculty"
            value={user?.faculty ?? "—"}
          />
          <InfoRow
            icon={<Calendar className="h-3.5 w-3.5 text-primary" />}
            label="Academic Session"
            value={user?.session ?? "—"}
          />
          <InfoRow
            icon={<Building2 className="h-3.5 w-3.5 text-primary" />}
            label="Institution"
            value={user?.institution ?? "—"}
          />
          <InfoRow
            icon={<Home className="h-3.5 w-3.5 text-primary" />}
            label="Accommodation"
            value={
              user?.accommodationName
                ? `${user.accommodationName} (${user.accommodationType || "Residence"})`
                : user?.accommodationType || "—"
            }
          />
          <InfoRow
            icon={<MapPin className="h-3.5 w-3.5 text-primary" />}
            label="Permanent Address"
            value={formatAddressDisplay(user?.permanentAddress)}
          />

          <div className="sm:col-span-2 space-y-1.5 pt-2 border-t border-border/60">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>দক্ষতা ও অভিজ্ঞতা (Skills &amp; Expertise)</span>
            </p>
            {Array.isArray(user?.skills) && user.skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {user.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium border border-emerald-300/40"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No skills listed yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
