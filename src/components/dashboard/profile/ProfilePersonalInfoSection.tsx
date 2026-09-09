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
} from "lucide-react";
import { RUForm, RUInput } from "@/components/forms";
import { IUser } from "@/types/auth";
import { profileSchema, ProfileFormValues } from "./profileSchemas";
import { InfoRow } from "./InfoRow";

interface ProfilePersonalInfoSectionProps {
  user: IUser | null | undefined;
  onSaveProfile: (values: ProfileFormValues) => void;
  isUpdatingProfile: boolean;
}

export function ProfilePersonalInfoSection({
  user,
  onSaveProfile,
  isUpdatingProfile,
}: ProfilePersonalInfoSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleFormSubmit = (values: ProfileFormValues) => {
    onSaveProfile(values);
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
            <h2 className="text-base font-bold text-foreground">Personal Information</h2>
            <p className="text-xs text-muted-foreground">
              Update editable profile fields (Name, Phone, Department, Session, Institution).
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background hover:bg-accent px-3 py-1.5 text-xs font-semibold text-foreground transition-colors cursor-pointer"
        >
          <Edit3 className="h-3.5 w-3.5 text-primary" />
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {isEditing ? (
        <RUForm<ProfileFormValues>
          schema={profileSchema}
          defaultValues={{
            name: user?.name ?? "",
            avatarUrl: user?.avatarUrl ?? "",
            phone: user?.phone ?? user?.phoneNumber ?? "",
            institution: user?.institution ?? "",
            department: user?.department ?? "",
            session: user?.session ?? "",
          }}
          onSubmit={handleFormSubmit}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RUInput
                name="name"
                label="Full Name"
                placeholder="Mohammad Abdullah"
                prependIcon={<User className="h-4 w-4" />}
                required
              />
              <RUInput
                name="phone"
                label="Mobile Phone Number"
                placeholder="+8801XXXXXXXXX"
                prependIcon={<Phone className="h-4 w-4" />}
              />
            </div>

            <RUInput
              name="avatarUrl"
              label="Avatar / Profile Image URL"
              placeholder="https://images.unsplash.com/... or cloud image URL"
              prependIcon={<ImageIcon className="h-4 w-4" />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RUInput
                name="institution"
                label="Institution / University"
                placeholder="University of Rajshahi"
                prependIcon={<Building2 className="h-4 w-4" />}
              />
              <RUInput
                name="department"
                label="Department / Faculty"
                placeholder="Department of Islamic Studies"
                prependIcon={<GraduationCap className="h-4 w-4" />}
              />
            </div>

            <RUInput
              name="session"
              label="Academic Session"
              placeholder="e.g. 2023–2024"
              prependIcon={<Calendar className="h-4 w-4" />}
            />

            <div className="flex justify-end pt-1 gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-input bg-background hover:bg-accent text-foreground cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="inline-flex items-center gap-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
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
          </div>
        </RUForm>
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
            icon={<Building2 className="h-3.5 w-3.5 text-primary" />}
            label="Institution"
            value={user?.institution ?? "—"}
          />
          <InfoRow
            icon={<GraduationCap className="h-3.5 w-3.5 text-primary" />}
            label="Department"
            value={user?.department ?? "—"}
          />
          <InfoRow
            icon={<Calendar className="h-3.5 w-3.5 text-primary" />}
            label="Academic Session"
            value={user?.session ?? "—"}
          />
          <InfoRow
            icon={<ImageIcon className="h-3.5 w-3.5 text-primary" />}
            label="Avatar URL"
            value={user?.avatarUrl ? "Custom Avatar Configured" : "Default Initials"}
          />
        </div>
      )}
    </div>
  );
}
