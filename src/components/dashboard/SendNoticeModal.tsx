"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  X,
  Mail,
  AlertTriangle,
  Clock,
  User,
  Sparkles,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { IUser } from "@/types/auth";
import { useSendNoticeToUser } from "@/hooks/useUsers";

interface SendNoticeModalProps {
  user: IUser | null;
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
  defaultMessage?: string;
}

export function SendNoticeModal({
  user,
  isOpen,
  onClose,
  defaultSubject,
  defaultMessage,
}: SendNoticeModalProps) {
  const { mutate: sendNotice, isPending } = useSendNoticeToUser();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("expiry");

  useEffect(() => {
    if (user) {
      const name = user.name || "Member";
      const expiry = user.membershipExpiresAt
        ? new Date(user.membershipExpiresAt).toLocaleDateString("en-BD", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "N/A";

      if (defaultSubject || defaultMessage) {
        setSubject(defaultSubject || `[Notice] Membership Status Alert for ${name}`);
        setMessage(defaultMessage || "");
      } else {
        setSubject(`[Notice] Library Membership Expiry Warning - RU Islamic Library`);
        setMessage(
          `Dear ${name},\n\nWe noticed that your membership with Rajshahi University Islamic Library expired on ${expiry}.\n\nTo continue enjoying full library privileges (borrowing scholarly collections and reserving study slots), please log in to the library portal and renew your membership or visit the library counter desk.\n\nFailure to renew within 7 days may result in account dormancy.\n\nWarm regards,\nRajshahi University Islamic Library Administration`
        );
      }
    }
  }, [user, defaultSubject, defaultMessage]);

  if (!isOpen || !user) return null;

  const handleApplyTemplate = (type: "expiry" | "inactive" | "final_warning") => {
    setSelectedTemplate(type);
    const name = user.name || "Member";
    const expiry = user.membershipExpiresAt
      ? new Date(user.membershipExpiresAt).toLocaleDateString("en-BD", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

    if (type === "expiry") {
      setSubject(`[Notice] Library Membership Expiry Warning - RU Islamic Library`);
      setMessage(
        `Dear ${name},\n\nWe noticed that your membership with Rajshahi University Islamic Library expired on ${expiry}.\n\nTo continue enjoying full library privileges (borrowing scholarly collections and reserving study slots), please log in to the library portal and renew your membership or visit the library counter desk.\n\nFailure to renew within 7 days may result in account dormancy.\n\nWarm regards,\nRajshahi University Islamic Library Administration`
      );
    } else if (type === "inactive") {
      setSubject(`[Notice] Account Inactivity Warning - RU Islamic Library`);
      setMessage(
        `Dear ${name},\n\nYour library portal account (${user.email}) has been inactive for an extended period. Please log in and verify your details to keep your account active.\n\nIf you no longer require library access, please let us know, or your record will be archived.\n\nWarm regards,\nRajshahi University Islamic Library Administration`
      );
    } else if (type === "final_warning") {
      setSubject(`[Urgent] Final Notice Before Account Removal - RU Islamic Library`);
      setMessage(
        `Dear ${name},\n\nThis is your FINAL NOTICE regarding your expired/dormant membership at Rajshahi University Islamic Library.\n\nYour membership expired on ${expiry}, and no renewal activity has been recorded. If you do not renew your membership or contact library administration within 3 days, your member profile will be permanently deleted from our active directory.\n\nWarm regards,\nRajshahi University Islamic Library Administration`
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendNotice(
      {
        userId: user.id,
        subject: subject.trim() || undefined,
        message: message.trim(),
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in-50">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-card-foreground">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#004F32] text-white shrink-0">
            <Mail className="h-6 w-6 text-amber-300" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-foreground">Send Official Member Notice</h3>
            <p className="text-xs text-muted-foreground">
              Notify {user.name} ({user.email}) regarding expiration, inactivity, or audit status.
            </p>
          </div>
        </div>

        {/* Quick Template Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Quick Notice Templates:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleApplyTemplate("expiry")}
              className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                selectedTemplate === "expiry"
                  ? "bg-[#004F32]/10 border-[#004F32] text-[#004F32] dark:text-emerald-300"
                  : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Clock className="h-3.5 w-3.5 mx-auto mb-1 text-amber-500" />
              <span>Expiry Notice</span>
            </button>
            <button
              type="button"
              onClick={() => handleApplyTemplate("inactive")}
              className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                selectedTemplate === "inactive"
                  ? "bg-[#004F32]/10 border-[#004F32] text-[#004F32] dark:text-emerald-300"
                  : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <User className="h-3.5 w-3.5 mx-auto mb-1 text-blue-500" />
              <span>Inactivity Notice</span>
            </button>
            <button
              type="button"
              onClick={() => handleApplyTemplate("final_warning")}
              className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                selectedTemplate === "final_warning"
                  ? "bg-red-500/10 border-red-500 text-red-700 dark:text-red-300"
                  : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5 mx-auto mb-1 text-red-500" />
              <span>Final Warning</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Email Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Notice Message Content</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={7}
              required
              className="w-full rounded-xl border border-input bg-background p-3 text-xs leading-relaxed focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 p-3 text-[11px] text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              This notice will be recorded in the system audit logs and dispatched to{" "}
              <strong>{user.email}</strong>.
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-input bg-background hover:bg-accent text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !message.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5 text-amber-300" />
              <span>{isPending ? "Sending Notice..." : "Dispatch Notice Alert"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SendNoticeModal;
