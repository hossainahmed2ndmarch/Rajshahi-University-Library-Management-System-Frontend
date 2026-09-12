"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Mail,
  MapPin,
  Phone,
  Send,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useGetMe } from "@/hooks/useAuth";
import { getDefaultDashboardRoute } from "@/proxy";
import { useLanguageStore } from "@/store/useLanguageStore";
import logo from "../../assets/logo/white-version.png";

interface FooterLink {
  label: string;
  href: string;
  highlight?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface ContactDetail {
  icon: LucideIcon;
  text: string;
  href?: string;
}

export function Footer() {
  const { data: user } = useGetMe();
  const { t } = useLanguageStore();

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const dashboardRoute = getDefaultDashboardRoute(user?.role);

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error("Please provide a valid academic or personal email address.");
      return;
    }
    setSubscribed(true);
    toast.success(
      "Subscribed to RU Islamic Library updates & manuscript digests!",
    );
    setNewsletterEmail("");
  };

  const userPurchasesRoute =
    user?.role === "MEMBER"
      ? "/dashboard/member/purchases"
      : `/dashboard/${user?.role?.toLowerCase().replace("_", "-")}/purchases`;

  const footerSections: FooterSection[] = [
    {
      title: t("footer.servicesTitle"),
      links: [
        {
          label: t("footer.academicBorrowing"),
          href: "/books?type=BORROW_ONLY",
        },
        { label: t("footer.directPurchasing"), href: "/books?type=SELL_ONLY" },
        { label: t("footer.donationProgramme"), href: "/donate" },
        {
          label: user ? t("footer.myPurchases") : t("footer.trackOrderGuest"),
          href: user ? userPurchasesRoute : "/track-order",
          highlight: true,
        },
        { label: t("footer.expressCheckout"), href: "/checkout" },
        {
          label: user ? t("footer.memberPortal") : t("footer.cardIssuance"),
          href: user ? dashboardRoute : "/login",
        },
      ],
    },
    {
      title: t("footer.quickLinksTitle"),
      links: [
        {
          label: user ? t("footer.controlDashboard") : t("footer.guestPortal"),
          href: user ? dashboardRoute : "/guest/dashboard",
        },
        { label: t("footer.completeCatalog"), href: "/books" },
        { label: t("footer.myCart"), href: "/cart" },
        { label: t("footer.savedWishlist"), href: "/wishlist" },
        { label: t("footer.aboutLibrary"), href: "/about" },
        { label: t("footer.contactDirections"), href: "/contact" },
      ],
    },
  ];

  const contactDetails: ContactDetail[] = [
    {
      icon: MapPin,
      text: t("footer.address"),
    },
    {
      icon: Phone,
      text: "+8801750422309",
      href: "tel:+8801750422309",
    },
    {
      icon: Mail,
      text: "rudclibrary@gmail.com",
      href: "mailto:rudclibrary@gmail.com",
    },
  ];

  return (
    <footer className="relative mt-auto bg-[#002b1c] text-emerald-50/90 border-t border-emerald-800/40 overflow-hidden">
      {/* Top Gradient Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

      {/* Ambient Radial Background Glows */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-10 h-80 w-80 rounded-full bg-amber-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        {/* Main Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Column 1: Branding & Intro */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-900/60 border border-emerald-700/50 p-2 shadow-inner group-hover:border-amber-400/50 transition-colors duration-300">
                <Image
                  src={logo}
                  alt="RUIL Logo"
                  priority
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <span className="text-lg font-black tracking-tight text-white group-hover:text-amber-300 transition-colors block leading-tight">
                  {t("nav.logoTitle")}
                </span>
                <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase block mt-0.5">
                  {t("nav.logoSubTitle")}
                </span>
              </div>
            </Link>

            <p className="text-xs text-emerald-200/70 leading-relaxed font-normal">
              {t("footer.logoDesc")}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-700/30 text-[11px] text-amber-300/90">
              <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
              <span>Academic Knowledge Hub</span>
            </div>
          </div>

          {/* Columns 2 & 3: Navigation Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {section.title}
              </h4>
              <ul className="space-y-2 text-xs">
                {section.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className={`group inline-flex items-center gap-1.5 transition-all duration-200 ${
                        link.highlight
                          ? "font-semibold text-amber-300 hover:text-amber-200"
                          : "text-emerald-100/75 hover:text-white hover:translate-x-1"
                      }`}
                    >
                      <ChevronRight className="h-3 w-3 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 text-amber-400 transition-all duration-200" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Column 4: Newsletter Box */}
          <div className="space-y-4">
            <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              {t("footer.newsletterTitle")}
            </h4>

            <div className="p-4 rounded-2xl bg-emerald-900/30 border border-emerald-800/50 backdrop-blur-sm space-y-3">
              <p className="text-xs text-emerald-200/70 leading-relaxed">
                {t("footer.newsletterDesc")}
              </p>

              {subscribed ? (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-900/80 border border-emerald-600/50 text-xs text-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{t("footer.subscribedSuccess")}</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="relative">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder={t("footer.emailPlaceholder")}
                      className="w-full rounded-xl bg-emerald-950/90 border border-emerald-700/60 px-3.5 py-2.5 text-xs text-white placeholder:text-emerald-400/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition-all pr-10"
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:brightness-110 active:scale-95 transition-all shadow-md"
                      aria-label="Subscribe"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-[10px] text-emerald-300/50 block pl-1">
                    {t("footer.noSpamNotice")}
                  </span>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="pt-8 border-t border-emerald-800/40 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {contactDetails.map((item, idx) => {
            const Icon = item.icon;
            const content = (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-900/20 border border-emerald-800/30 hover:border-emerald-700/50 hover:bg-emerald-900/40 transition-all group">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-800/40 text-amber-400 group-hover:scale-110 transition-transform">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-emerald-100/80 group-hover:text-white transition-colors truncate">
                  {item.text}
                </span>
              </div>
            );

            return item.href ? (
              <a key={idx} href={item.href}>
                {content}
              </a>
            ) : (
              <div key={idx}>{content}</div>
            );
          })}
        </div>

        {/* Copyright Footer */}
        <div className="mt-8 pt-6 border-t border-emerald-900/60 text-xs text-emerald-300/50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>
            © {new Date().getFullYear()} {t("footer.copyright")}
          </p>
          <p className="flex items-center gap-1.5 text-emerald-200/60">
            <span>{t("footer.builtWith")}</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span>{t("footer.forCommunity")}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
