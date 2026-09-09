"use client";

import React from "react";
import {
  Search,
  Grid,
  BookCheck,
  Recycle,
  Archive,
  GraduationCap,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";

export function ServicesGrid() {
  const services = [
    {
      title: "Digital Catalog Search",
      description: "Real-time search across 12,500+ Islamic titles by Tafsir, Hadith, Fiqh, author, or ISBN.",
      icon: Search,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60",
    },
    {
      title: "Physical Cell Retrieval",
      description: "Precise shelf cell mapping (e.g. Shelf C-2) for fast physical navigation inside the stacks.",
      icon: Grid,
      color: "text-[#C78700] bg-amber-100/80 dark:bg-amber-950/60",
    },
    {
      title: "Counter Book Issue",
      description: "Instant circulation checkouts and dorm room delivery for enrolled Rajshahi University scholars.",
      icon: BookCheck,
      color: "text-blue-600 dark:text-blue-400 bg-blue-100/80 dark:bg-blue-950/60",
    },
    {
      title: "Donation Recycling & Indexing",
      description: "Sadaqah Jariyah processing: sorting, repairing, and cataloging community-donated volumes.",
      icon: Recycle,
      color: "text-rose-600 dark:text-rose-400 bg-rose-100/80 dark:bg-rose-950/60",
    },
    {
      title: "Research Archives & Treatises",
      description: "Preserved Arabic manuscripts, classical Bengali translations, and rare Islamic journals.",
      icon: Archive,
      color: "text-purple-600 dark:text-purple-400 bg-purple-100/80 dark:bg-purple-950/60",
    },
    {
      title: "Academic Consultation Desk",
      description: "Guidance for undergraduate term papers, masters theses, and citation referencing.",
      icon: GraduationCap,
      color: "text-teal-600 dark:text-teal-400 bg-teal-100/80 dark:bg-teal-950/60",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Core Capabilities</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-1">
          Comprehensive Library Services
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          End-to-end institutional services supporting education, preservation, and circulation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, idx) => (
          <div
            key={idx}
            className="bg-card rounded-3xl border border-border p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
          >
            <div>
              <div className={`h-12 w-12 rounded-2xl ${service.color} flex items-center justify-center mb-4`}>
                <service.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-foreground mb-2">{service.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ServicesGrid;
