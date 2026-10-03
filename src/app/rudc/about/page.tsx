"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  CheckCircle2,
  Compass,
  Globe,
  Heart,
  HeartHandshake,
  Layers,
  Shield,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";
import rudcBanner from "@/assets/banner/rudc_banner.webp";
import rudcLogo from "@/assets/logo/rudc_logo.jpg";

export default function RudcAboutPage() {
  const coreValues = [
    {
      icon: Compass,
      title: "Sincere Faith & Taqwa",
      desc: "Building a deep, personal connection with Allah through Salah, Dhikr, and continuous self-purification.",
    },
    {
      icon: Shield,
      title: "Sunnah-Guided Living",
      desc: "Upholding the Prophetic way in manners, dress, speech, and daily life as the highest standard of character.",
    },
    {
      icon: HeartHandshake,
      title: "Brotherhood & Unity",
      desc: "Fostering a genuine bond of brotherhood among Muslim students, grounded in mutual support and Islamic love.",
    },
    {
      icon: Globe,
      title: "Campus Dawah",
      desc: "Spreading the message of Islam through knowledge circles, distribution of Islamic materials, and moral mentorship.",
    },
    {
      icon: Heart,
      title: "Social Welfare",
      desc: "Serving the underprivileged and campus community through humanitarian drives, relief, and practical care.",
    },
    {
      icon: BookOpen,
      title: "Islamic Education",
      desc: "Nurturing the pursuit of authentic Islamic knowledge through structured learning, workshops, and programs.",
    },
  ];

  const milestones = [
    {
      year: "Founded",
      title: "Establishment of RUDC",
      desc: "RUDC was established as the dedicated volunteer wing of the RU Islamic Library, committed to student-led Islamic service.",
    },
    {
      year: "Growth",
      title: "Campus-wide Outreach",
      desc: "Expanded Dawah operations hall-to-hall, distributing books, flyers, and daily du'a cards across all residential halls.",
    },
    {
      year: "Service",
      title: "Humanitarian Drives",
      desc: "Launched seasonal charity programs including winter clothing drives, Ramadan iftar distributions, and community relief.",
    },
    {
      year: "Today",
      title: "Active Brotherhood Network",
      desc: "Now a thriving network of dedicated Muslim volunteers on Rajshahi University campus, serving Deen and community.",
    },
  ];

  const leadershipTeams = [
    {
      role: "Dawah & Outreach",
      desc: "Leads weekly halqahs, campus leafleting, counseling, and Islamic exhibitions.",
      icon: Sparkles,
      tag: "Core",
    },
    {
      role: "Media & Graphics",
      desc: "Produces Islamic reminders, event visuals, social media content and photography.",
      icon: Star,
      tag: "Creative",
    },
    {
      role: "Welfare & Relief",
      desc: "Coordinates charity drives, iftar arrangements, and humanitarian campaigns.",
      icon: Heart,
      tag: "Service",
    },
    {
      role: "Training & Tarbiyah",
      desc: "Oversees small group mentorship, spiritual retreats, and volunteer development.",
      icon: Users,
      tag: "Growth",
    },
    {
      role: "Logistics & Events",
      desc: "Manages event setup, hall booking, inventory, sound, and venue coordination.",
      icon: Layers,
      tag: "Operations",
    },
    {
      role: "Library & Publications",
      desc: "Curates Islamic books, manages the library store, and produces printed materials.",
      icon: BookOpen,
      tag: "Knowledge",
    },
  ];

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">

        {/* ── Hero / Header ── */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-600/30 text-[#004F32] dark:text-emerald-300 text-xs font-bold">
            <Users className="h-3.5 w-3.5 text-[#C78700] dark:text-amber-400" />
            About RUDC
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#004F32] dark:text-emerald-300 tracking-tight">
            Rajshahi University Dawah Club
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            A dedicated brotherhood of Muslim students at Rajshahi University,
            united by sincere faith, Sunnah-guided service, and a shared vision
            of upholding the Deen on campus and beyond.
          </p>
        </div>

        {/* ── Banner Image ── */}
        <div className="relative w-full h-64 sm:h-80 lg:h-96 rounded-3xl overflow-hidden border border-emerald-700/20 shadow-lg">
          <Image
            src={rudcBanner}
            alt="RUDC Banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#004F32]/80 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 flex items-center gap-3">
            <div className="relative h-14 w-14 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-lg bg-white">
              <Image
                src={rudcLogo}
                alt="RUDC Logo"
                fill
                className="object-contain p-1"
              />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">
                Rajshahi University
              </p>
              <p className="text-amber-300 font-extrabold text-base leading-tight">
                Dawah Club
              </p>
            </div>
          </div>
        </div>

        {/* ── Mission & Vision ── */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Mission */}
          <div className="rounded-3xl border border-emerald-700/20 bg-emerald-50/50 dark:bg-emerald-950/30 p-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-600/30 text-[#004F32] dark:text-emerald-300 text-xs font-bold">
              <Target className="h-3.5 w-3.5 text-[#C78700]" />
              Our Mission
            </div>
            <h2 className="text-2xl font-extrabold text-[#004F32] dark:text-emerald-300">
              Calling to Allah with Wisdom
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              RUDC exists to invite the students of Rajshahi University to the
              way of Allah — through authentic Islamic knowledge, sincere
              brotherhood, and service to the campus community. We strive to be
              a living example of the Prophetic character, guiding fellow students
              toward the Sunnah with wisdom, compassion, and patience.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Through Dawah circles, book distributions, counseling, and
              humanitarian programs, we work to make the message of Islam
              accessible, practical, and beautiful for every student on campus.
            </p>
            <div className="pt-2 space-y-2">
              {[
                "Weekly knowledge circles & spiritual halqahs",
                "Campus-wide Islamic book & leaflet distribution",
                "Confidential youth counseling & mentorship",
                "Interfaculty Dawah outreach programs",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-[#004F32] dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vision */}
          <div className="rounded-3xl border border-amber-600/20 bg-amber-50/50 dark:bg-amber-950/20 p-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-600/30 text-amber-700 dark:text-amber-300 text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5 text-[#C78700]" />
              Our Vision
            </div>
            <h2 className="text-2xl font-extrabold text-amber-700 dark:text-amber-300">
              A Sunnah-Centered Campus
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our vision is to see Rajshahi University become a campus where
              Muslim students live, study, and serve according to the Quran and
              Sunnah — where Islamic values are celebrated, brotherhood is real,
              and every student has access to authentic Islamic guidance.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We envision a generation of Muslim graduates who carry their Deen
              with pride into their professions, families, and communities —
              ambassadors of Islam in every field of life.
            </p>
            <div className="pt-2 space-y-2">
              {[
                "Raising a generation of Sunnah-guided Muslim graduates",
                "Establishing sustainable Islamic services on campus",
                "Bridging knowledge, spirituality, and social service",
                "Building lasting networks of righteous brotherhood",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Core Values ── */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-600/30 text-[#004F32] dark:text-emerald-300 text-xs font-bold">
              <Star className="h-3.5 w-3.5 text-[#C78700]" />
              Core Values
            </div>
            <h2 className="text-2xl font-extrabold text-[#004F32] dark:text-emerald-300">
              What We Stand For
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              The principles that guide every action, every program, and every
              interaction within the RUDC brotherhood.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {coreValues.map((val) => (
              <div
                key={val.title}
                className="rounded-2xl border border-emerald-700/15 bg-white dark:bg-card p-5 space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-600/20">
                  <val.icon className="h-5 w-5 text-[#004F32] dark:text-emerald-400" />
                </div>
                <h3 className="font-bold text-sm text-foreground">{val.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Our Journey / Milestones ── */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-600/30 text-[#004F32] dark:text-emerald-300 text-xs font-bold">
              <Layers className="h-3.5 w-3.5 text-[#C78700]" />
              Our Journey
            </div>
            <h2 className="text-2xl font-extrabold text-[#004F32] dark:text-emerald-300">
              Growing in Service
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {milestones.map((m, i) => (
              <div
                key={m.year}
                className="relative rounded-2xl border border-emerald-700/15 bg-white dark:bg-card p-5 space-y-2 hover:shadow-md transition-shadow"
              >
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#004F32] text-white text-[10px] font-bold">
                  {m.year}
                </div>
                <h3 className="font-bold text-sm text-foreground pt-1">{m.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                {i < milestones.length - 1 && (
                  <div className="absolute top-7 -right-3 h-0.5 w-6 bg-emerald-200 dark:bg-emerald-800 hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Leadership Teams ── */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-600/30 text-[#004F32] dark:text-emerald-300 text-xs font-bold">
              <Users className="h-3.5 w-3.5 text-[#C78700]" />
              Volunteer Teams
            </div>
            <h2 className="text-2xl font-extrabold text-[#004F32] dark:text-emerald-300">
              Our Specialized Teams
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              RUDC operates through dedicated specialized teams, each focused on
              a critical area of campus service and Islamic work.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {leadershipTeams.map((team) => (
              <div
                key={team.role}
                className="rounded-2xl border border-emerald-700/15 bg-white dark:bg-card p-5 space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-600/20">
                    <team.icon className="h-4.5 w-4.5 text-[#004F32] dark:text-emerald-400" />
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-emerald-600/20 bg-emerald-50 dark:bg-emerald-950/40 text-[#004F32] dark:text-emerald-300 text-[10px] font-bold">
                    {team.tag}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-foreground">{team.role}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{team.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Relationship with RUIL ── */}
        <div className="rounded-3xl border border-emerald-700/20 bg-gradient-to-br from-emerald-50 to-amber-50/40 dark:from-emerald-950/40 dark:to-amber-950/10 p-8 lg:p-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/70 dark:bg-black/20 border border-emerald-600/30 text-[#004F32] dark:text-emerald-300 text-xs font-bold">
            <HeartHandshake className="h-3.5 w-3.5 text-[#C78700]" />
            Our Home
          </div>
          <h2 className="text-2xl font-extrabold text-[#004F32] dark:text-emerald-300">
            Rooted in the RU Islamic Library
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            RUDC is the active volunteer wing of the{" "}
            <strong className="text-[#004F32] dark:text-emerald-400">
              RU Islamic Library (RUIL)
            </strong>{" "}
            — the central Islamic resource hub of Rajshahi University. While
            RUIL provides the knowledge foundation through its book collection,
            publications, and educational programs, RUDC translates that
            knowledge into action through campus Dawah, social service, and
            brotherhood-building activities.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            Together, RUIL and RUDC form a complete ecosystem of Islamic learning
            and living — from the library shelf to the campus ground, from
            knowledge acquisition to practical service.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white text-xs font-bold transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Visit RUIL
            </Link>
            <Link
              href="/rudc/join"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#004F32]/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-[#004F32] dark:text-emerald-300 text-xs font-bold transition-colors"
            >
              <Users className="h-3.5 w-3.5" />
              Join RUDC
            </Link>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="text-center space-y-4 pb-4">
          <h2 className="text-xl font-extrabold text-[#004F32] dark:text-emerald-300">
            Ready to Serve with Us?
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Join a brotherhood of sincere Muslim students committed to Dawah,
            knowledge, and service. Applications are open for dedicated
            volunteers.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/rudc/join"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#004F32] to-[#016842] hover:from-[#003e27] hover:to-[#004F32] text-white text-sm font-bold shadow-sm transition-all"
            >
              <Users className="h-4 w-4 text-amber-300" />
              Join RUDC as Volunteer
            </Link>
            <Link
              href="/rudc/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#004F32]/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-[#004F32] dark:text-emerald-300 text-sm font-bold transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
