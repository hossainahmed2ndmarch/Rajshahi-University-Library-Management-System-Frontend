"use client";

import React from "react";
import Link from "next/link";
import {
  Search,
  Compass,
  Truck,
  GraduationCap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { useLanguageStore } from "@/store/useLanguageStore";
import { cn } from "@/lib/utils";
import { IslamicPattern } from "@/components/shared/IslamicPattern";

interface ServiceItem {
  id: string;
  title: {
    bn: string;
    en: string;
    ar: string;
  };
  subtitle: {
    bn: string;
    en: string;
    ar: string;
  };
  description: {
    bn: string;
    en: string;
    ar: string;
  };
  icon: React.ComponentType<{ className?: string }>;
  accentColor: {
    bg: string;
    text: string;
    border: string;
  };
  action: {
    label: {
      bn: string;
      en: string;
      ar: string;
    };
    href: string;
  };
}

const CORE_SERVICES: ServiceItem[] = [
  {
    id: "catalog-search",
    title: {
      bn: "ডিজিটাল ক্যাটালগ ও সার্চ",
      en: "Digital Catalog & Search",
      ar: "الفهرس الرقمي والبحث الذكي",
    },
    subtitle: {
      bn: "১২,৫০০+ প্রামাণ্য কিতাব",
      en: "12,500+ Verified Books",
      ar: "أكثر من 12,500 كتاب موثق",
    },
    description: {
      bn: "বিশুদ্ধ তাফসির, হাদিস ও ফিকহ গ্রন্থ থেকে শিরোনাম, লেখক বা বিষয় দিয়ে তাৎক্ষণিক স্টক চেক ও অনুসন্ধান করুন।",
      en: "Search across 12,500+ authentic Islamic volumes by Tafsir, Hadith, author, or ISBN with live stock status.",
      ar: "ابحث في أكثر من 12,500 مجلد إسلامي موثق حسب التفسير والحديث والمؤلف مع توفر فوري للمخزون.",
    },
    icon: Search,
    accentColor: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-500/20 group-hover:border-emerald-500/60",
    },
    action: {
      label: {
        bn: "ক্যাটালগ ব্রাউজ করুন",
        en: "Browse Catalog",
        ar: "تصفح الفهرس",
      },
      href: "/books",
    },
  },
  {
    id: "stacks-navigation",
    title: {
      bn: "শেলফ ও সেল নেভিগেশন",
      en: "Physical Cell Locator",
      ar: "تحديد موقع الرف والخلية",
    },
    subtitle: {
      bn: "স্ট্যাক্স সেলফ C-2 গাইড",
      en: "Floor 2 Stack Coordinates",
      ar: "إحداثيات المستودع بالطابق الثاني",
    },
    description: {
      bn: "কেন্দ্রীয় গ্রন্থাগারের ২য় তলায় সরাসরি গিয়ে দ্রুত বই খুঁজে পেতে প্রতিটি বইয়ের জন্য সুনির্দিষ্ট শেলফ কোড দেখুন।",
      en: "Locate physical books swiftly inside our Central Library stacks using automated shelf-cell coordinate tags (e.g. Shelf C-2).",
      ar: "حدد مكان الكتاب بدقة وسرعة داخل أرفف المكتبة المركزية عبر رموز الخلايا الآلية (مثل: الرف C-2).",
    },
    icon: Compass,
    accentColor: {
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-500/20 group-hover:border-[#C78700]/60",
    },
    action: {
      label: {
        bn: "শেলফ অবস্থান দেখুন",
        en: "View Shelf Locations",
        ar: "عرض مواقع الأرفف",
      },
      href: "/books",
    },
  },
  {
    id: "hall-circulation",
    title: {
      bn: "হল স্টেশন ডেলিভারি",
      en: "Campus Hall Delivery",
      ar: "الإعارة والتوصيل لقاعات السكن",
    },
    subtitle: {
      bn: "অনলাইন রিজার্ভ ও হ্যান্ডওভার",
      en: "Online Hold & Dorm Dispatch",
      ar: "حجز إلكتروني وتسليم بالسكن",
    },
    description: {
      bn: "অনলাইনে বই রিজার্ভ করুন এবং আপনার আবাসিক হল কাউন্টার বা কেন্দ্রীয় ডেস্ক থেকে স্বাচ্ছন্দ্যে সংগ্রহ করুন।",
      en: "Reserve physical copies online and collect them conveniently from designated residential hall stations or central desk.",
      ar: "احجز الكتب المادية عبر الإنترنت واستلمها بسهولة من نقاط التسليم بقاعات السكن الجامعي أو المكتب المركزي.",
    },
    icon: Truck,
    accentColor: {
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-500/20 group-hover:border-blue-500/60",
    },
    action: {
      label: {
        bn: "সার্কুলেশন ট্র্যাক করুন",
        en: "Track Circulation",
        ar: "تتبع حالة الإعارة",
      },
      href: "/track-order",
    },
  },
  {
    id: "research-archives",
    title: {
      bn: "গবেষণা ও থিসিস ডেস্ক",
      en: "Research & Thesis Archives",
      ar: "أرشيف البحث ودعم الرسائل",
    },
    subtitle: {
      bn: "আরবি রেফারেন্স ও পরামর্শ",
      en: "Scholarly Bibliography Support",
      ar: "تحقيق المخطوطات والتوثيق الأكاديمي",
    },
    description: {
      bn: "স্নাতক ও স্নাতকোত্তর শিক্ষার্থীদের থিসিস, আরবি রেফারেন্স যাচাই ও প্রামাণ্য গ্রন্থ সহায়তায় আমাদের কনসাল্টেশন ডেস্ক।",
      en: "Dedicated guidance for graduate research theses, Arabic manuscript referencing, and authentic scholarly citation.",
      ar: "إرشاد أكاديمي مخصص لرسائل الماجستير وتوثيق المراجع ومقابلة المخطوطات العربية المعتمدة.",
    },
    icon: GraduationCap,
    accentColor: {
      bg: "bg-purple-500/10 dark:bg-purple-500/20",
      text: "text-purple-700 dark:text-purple-400",
      border: "border-purple-500/20 group-hover:border-purple-500/60",
    },
    action: {
      label: {
        bn: "পরামর্শের জন্য যোগাযোগ",
        en: "Consult Desk",
        ar: "تواصل مع قسم البحث",
      },
      href: "/contact",
    },
  },
];

interface ServicesGridProps {
  className?: string;
  showHeader?: boolean;
}

export function ServicesGrid({ className = "", showHeader = true }: ServicesGridProps) {
  const { language } = useLanguageStore();
  const currentLang = (language as "bn" | "en" | "ar") || "bn";

  return (
    <section className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-8", className)}>
      {showHeader && (
        <SectionHeader
          icon={Sparkles}
          badgeVariant="primary"
          subtitleKey="home.servicesSubtitle"
          titleKey="home.servicesTitle"
          descriptionKey="home.servicesDesc"
          align="center"
          className="mb-8 sm:mb-10 max-w-2xl mx-auto"
        />
      )}

      {/* 4-Column Clean Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {CORE_SERVICES.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className={cn(
                "group relative overflow-hidden rounded-3xl bg-card border p-6 flex flex-col justify-between transition-all duration-300",
                "hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-emerald-950/20",
                service.accentColor.border
              )}
            >
              <div className="space-y-3.5">
                {/* Icon */}
                <div
                  className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-2xs",
                    service.accentColor.bg,
                    service.accentColor.text
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h3 className="text-base font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                    {service.title[currentLang]}
                  </h3>
                  <p className="text-[11px] font-semibold text-muted-foreground/80 mt-0.5">
                    {service.subtitle[currentLang]}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {service.description[currentLang]}
                </p>
              </div>

              {/* Action Link */}
              <div className="pt-4 mt-4 border-t border-border/60">
                <Link
                  href={service.action.href}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:text-[#C78700] transition-colors"
                >
                  <span>{service.action.label[currentLang]}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ServicesGrid;

