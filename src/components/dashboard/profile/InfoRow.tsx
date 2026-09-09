"use client";

import React from "react";
import { Lock } from "lucide-react";

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isProtected?: boolean;
}

export function InfoRow({ icon, label, value, isProtected = false }: InfoRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
        <span className="flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        {isProtected && (
          <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 bg-amber-500/10 text-[9px] font-bold text-amber-700 dark:text-amber-400">
            <Lock className="h-2.5 w-2.5" /> Read-Only
          </span>
        )}
      </div>
      <p className="pl-5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
