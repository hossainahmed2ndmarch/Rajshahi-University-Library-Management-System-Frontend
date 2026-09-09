"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { RUForm, RUInput } from "@/components/forms";
import { passwordSchema, PasswordFormValues } from "./profileSchemas";

interface ProfilePasswordSectionProps {
  onPasswordChange: (values: PasswordFormValues) => void;
  isChangingPw: boolean;
}

export function ProfilePasswordSection({
  onPasswordChange,
  isChangingPw,
}: ProfilePasswordSectionProps) {
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5 text-card-foreground">
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C78700] text-white shadow-2xs">
          <Lock className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Change Password</h2>
          <p className="text-xs text-muted-foreground">Use a strong password of 8+ characters.</p>
        </div>
      </div>

      <RUForm<PasswordFormValues>
        schema={passwordSchema}
        defaultValues={{ currentPassword: "", newPassword: "", confirmPassword: "" }}
        onSubmit={onPasswordChange}
      >
        <div className="space-y-4">
          <div className="relative">
            <RUInput
              name="currentPassword"
              label="Current Password"
              type={showCurrentPw ? "text" : "password"}
              placeholder="Enter your current password"
              prependIcon={<Lock className="h-4 w-4" />}
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPw((v) => !v)}
              className="absolute right-3 top-8 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              tabIndex={-1}
              title={showCurrentPw ? "Hide password" : "Show password"}
            >
              {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <RUInput
                name="newPassword"
                label="New Password"
                type={showNewPw ? "text" : "password"}
                placeholder="Minimum 8 characters"
                prependIcon={<Lock className="h-4 w-4" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPw((v) => !v)}
                className="absolute right-3 top-8 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                tabIndex={-1}
                title={showNewPw ? "Hide password" : "Show password"}
              >
                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <RUInput
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              placeholder="Repeat new password"
              prependIcon={<Lock className="h-4 w-4" />}
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isChangingPw}
              className="inline-flex items-center gap-2 rounded-xl bg-[#C78700] hover:bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isChangingPw ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> Update Password
                </>
              )}
            </button>
          </div>
        </div>
      </RUForm>
    </div>
  );
}
