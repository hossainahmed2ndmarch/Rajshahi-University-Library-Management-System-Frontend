"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import {
  HeartHandshake,
  MapPin,
  Clock,
  Phone,
  Mail,
  Send,
  Star,
  Quote,
  CheckCircle2,
  ShieldCheck,
  Building,
  GraduationCap,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

import "swiper/css";
import "swiper/css/pagination";

export function DonationAndCommunitySection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const testimonials = [
    {
      name: "Dr. A. K. M. Shamsuddin",
      role: "Professor of Islamic Studies, RU",
      comment:
        "The digital catalog system has transformed our departmental research workflow. Accessing verified Tafsir manuscripts and Hadith commentaries has never been this seamless.",
      rating: 5,
    },
    {
      name: "Tahmidur Rahman",
      role: "Masters Research Scholar, Faculty of Law",
      comment:
        "Borrowing classical Fiqh treatises through my student card and picking them up directly at Shahid Ziaur Rahman Hall station saves me hours every week.",
      rating: 5,
    },
    {
      name: "Fatima Tuz Zahra",
      role: "Undergraduate Student, Arabic Department",
      comment:
        "The express checkout is incredibly convenient for buying authentic study texts at reasonable prices. The book condition and authenticity are always top tier.",
      rating: 5,
    },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please provide a valid email address.");
      return;
    }
    setSubscribed(true);
    toast.success("Subscribed to RU Library research alerts & newsletter!");
    setEmail("");
  };

  return (
    <div className="space-y-16 py-8">
      {/* 1. DONATION BANNER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#004F32] via-[#003824] to-[#040D09] p-8 sm:p-12 text-white border border-emerald-800/60 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#C78700]/20 px-3.5 py-1 text-xs font-bold text-amber-300 border border-[#C78700]/30">
              <HeartHandshake className="h-3.5 w-3.5" />
              <span>Sadaqah Jariyah Programme</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Donate Books & Build Eternal Knowledge for Future Scholars
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-light">
              Your donated Islamic books, academic manuscripts, and textbooks will be verified, cataloged, and made accessible to thousands of Rajshahi University students.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 rounded-xl bg-[#C78700] hover:bg-amber-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:gap-3"
              >
                <span>Submit Book Donation</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-3.5 text-xs sm:text-sm font-semibold text-white transition-colors"
              >
                <span>How Donation Works</span>
              </Link>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 top-0 hidden lg:flex items-center justify-center p-12 opacity-15 pointer-events-none">
            <HeartHandshake className="h-64 w-64 text-amber-400" />
          </div>
        </div>
      </section>

      {/* 2. MEMBER TESTIMONIALS (SWIPER CAROUSEL) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Community Voice</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-1">
            What RU Faculty & Students Say
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real feedback from our academic community and Islamic scholars.
          </p>
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          slidesPerView={1}
          spaceBetween={24}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          breakpoints={{
            768: { slidesPerView: 2, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
          className="w-full pb-10"
        >
          {testimonials.map((t, idx) => (
            <SwiperSlide key={idx}>
              <div className="h-full bg-card rounded-3xl border border-border p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-primary/30 mb-2" />
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic">
                    "{t.comment}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-foreground">{t.name}</h4>
                    <p className="text-[11px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* 3. INTERACTIVE CAMPUS MAP & VISITING HOURS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-3xl border border-border p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Info Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
                  <Building className="h-4 w-4" />
                  <span>Physical Stacks & Counter</span>
                </div>
                <h3 className="text-2xl font-black text-foreground">
                  Visit RU Islamic Central Library
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Located in the heart of Rajshahi University main campus, accessible for all enrolled students, teachers, and registered researchers.
                </p>
              </div>

              {/* Status & Hours */}
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                  <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-foreground">Circulation Counter Hours</p>
                    <p className="text-muted-foreground mt-0.5">Saturday – Wednesday: 8:30 AM – 5:00 PM</p>
                    <p className="text-muted-foreground">Thursday: 8:30 AM – 1:00 PM (Friday Closed)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-foreground">Physical Location</p>
                    <p className="text-muted-foreground mt-0.5">
                      2nd Floor, Central Library Bhaban, Rajshahi University Campus, Rajshahi-6205
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Active Shifter on Duty</p>
                    <p className="text-[11px] mt-0.5">Counter 3 is operational for instant pickups & check-in.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Map Mockup */}
            <div className="lg:col-span-7 h-80 sm:h-96 rounded-2xl overflow-hidden border border-border relative bg-muted flex items-center justify-center">
              <iframe
                title="Rajshahi University Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3634.364716499313!2d88.62589577535503!3d24.36868847824982!2m3!1f0!2f0!3f0!3m2!1i1024!2f768!4f13.1!3m3!1m2!1s0x39fbefd0728c3ccf%3A0x6b16e45de9b37a50!2sCentral%20Library%2C%20University%20of%20Rajshahi!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. SERVICES GRID & NEWSLETTER OPT-IN */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-2xl border border-border p-6 space-y-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h3 className="font-bold text-base text-foreground">Academic Research Support</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Assisting graduate theses, Arabic manuscript decoding, and bibliography references with expert library consultation.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 space-y-3">
            <ShieldCheck className="h-8 w-8 text-[#C78700]" />
            <h3 className="font-bold text-base text-foreground">Authentic Editorial Curation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every volume on our shelves is verified for authentic chain of transmission, scholarly commentary, and high quality bindings.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 space-y-3">
            <HeartHandshake className="h-8 w-8 text-emerald-600" />
            <h3 className="font-bold text-base text-foreground">Inter-Hall Book Circulation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Request books online and have them delivered to your residential hall counter with automated SMS alerts.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DonationAndCommunitySection;
