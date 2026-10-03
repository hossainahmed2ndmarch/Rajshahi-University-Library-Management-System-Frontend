"use client";

import React from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/useLanguageStore";

export type SectionHeaderBadgeVariant =
  | "primary"
  | "gold"
  | "secondary"
  | "emerald"
  | "muted"
  | "rose"
  | "blue";

export type SectionHeaderAlign = "left" | "center" | "right";

export interface SectionHeaderProps {
  /** Optional icon rendered inside the badge */
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  /** Subtitle / Tagline shown inside the uppercase badge */
  subtitle?: React.ReactNode;
  /** Subtitle i18n translation key (e.g. 'home.categorySubtitle') */
  subtitleKey?: string;
  /** Main section heading */
  title?: React.ReactNode;
  /** Main section heading i18n translation key (e.g. 'home.categoryTitle') */
  titleKey?: string;
  /** Explanatory description below the title */
  description?: React.ReactNode;
  /** Description i18n translation key (e.g. 'home.categoryDesc') */
  descriptionKey?: string;
  /** Semantic HTML heading tag (defaults to "h2") */
  headingAs?: "h1" | "h2" | "h3" | "h4";
  /** Visual color theme for the badge/subtitle */
  badgeVariant?: SectionHeaderBadgeVariant;
  /** Alignment of text: "left" | "center" | "right" */
  align?: SectionHeaderAlign;
  /** Actions/buttons/controls placed on the opposite side (e.g. carousel arrows, tabs) */
  action?: React.ReactNode;
  /** Extra content rendered beneath the description (e.g. review ratings, extra tags) */
  children?: React.ReactNode;
  /** Optional container class overrides */
  className?: string;
  /** Optional title class overrides */
  titleClassName?: string;
  /** Optional description class overrides */
  descriptionClassName?: string;
  /** Optional badge class overrides */
  badgeClassName?: string;
}

const BADGE_VARIANTS: Record<SectionHeaderBadgeVariant, string> = {
  primary: "text-primary",
  gold: "text-[#C78700] dark:text-amber-400",
  secondary: "text-secondary",
  emerald: "text-emerald-700 dark:text-emerald-400",
  muted: "text-muted-foreground",
  rose: "text-rose-600 dark:text-rose-400",
  blue: "text-blue-600 dark:text-blue-400",
};

export function SectionHeader({
  icon: Icon,
  subtitle,
  subtitleKey,
  title,
  titleKey,
  description,
  descriptionKey,
  headingAs: Heading = "h2",
  badgeVariant = "primary",
  align = "left",
  action,
  children,
  className,
  titleClassName,
  descriptionClassName,
  badgeClassName,
}: SectionHeaderProps) {
  const { t } = useLanguageStore();

  const finalSubtitle = subtitle ?? (subtitleKey ? t(subtitleKey) : null);
  const finalTitle = title ?? (titleKey ? t(titleKey) : "");
  const finalDescription = description ?? (descriptionKey ? t(descriptionKey) : null);

  const isCentered = align === "center";
  const isRight = align === "right";

  return (
    <div
      className={cn(
        "gap-4",
        isCentered
          ? "text-center max-w-2xl mx-auto flex flex-col items-center mb-8"
          : action
          ? "flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
          : cn("mb-8", isRight ? "text-right" : "text-left"),
        className
      )}
    >
      {/* Text Container */}
      <div
        className={cn(
          "space-y-1.5",
          isCentered && "flex flex-col items-center text-center",
          isRight && "flex flex-col items-end text-right"
        )}
      >
        {/* Subtitle / Category Badge */}
        {finalSubtitle && (
          <div
            className={cn(
              "inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider",
              BADGE_VARIANTS[badgeVariant],
              badgeClassName
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
            <span>{finalSubtitle}</span>
          </div>
        )}

        {/* Main Title */}
        {finalTitle && (
          <Heading
            className={cn(
              "text-2xl sm:text-3xl font-black tracking-tight text-foreground",
              titleClassName
            )}
          >
            {finalTitle}
          </Heading>
        )}

        {/* Description */}
        {finalDescription && (
          <p
            className={cn(
              "text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl",
              descriptionClassName
            )}
          >
            {finalDescription}
          </p>
        )}

        {/* Optional Child Elements (ratings, tags, etc.) */}
        {children}
      </div>

      {/* Action Slot (e.g. Carousel Prev/Next buttons, Tab toggles) */}
      {action && (
        <div
          className={cn(
            "flex items-center gap-2.5 shrink-0",
            isCentered && "justify-center mt-2"
          )}
        >
          {action}
        </div>
      )}
    </div>
  );
}

export default SectionHeader;
