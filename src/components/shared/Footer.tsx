"use client";

import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Heart,
  Mail,
  MapPin,
  Phone,
  Send,
  CheckCircle2,
  BookMarked,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useGetMe } from "@/hooks/useAuth";
import { getDefaultDashboardRoute } from "@/proxy";
import logo from "../../assets/logo/white-version.png";

export function Footer() {
  const { data: user } = useGetMe();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const dashboardRoute = getDefaultDashboardRoute(user?.role);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
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

  return (
    <footer className="mt-auto bg-[#003824] text-white border-t border-emerald-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8">
          {/* Column 1: Library Summary */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center space-x-2.5 shrink-0 group"
            >
              <div className="flex h-11 w-11 items-center justify-center">
                {/* Light Mode Logo */}
                <Image
                  src={logo}
                  alt="RUIL Logo"
                  priority
                  className="h-10 w-10 object-contain"
                />
              </div>

              <div className="hidden sm:block">
                <span className="text-base sm:text-lg font-black tracking-tight text-white dark:text-emerald-400 block leading-tight">
                  রাবি ইসলামিক পাঠাগার
                </span>
                <span className="text-[10px] font-bold text-[#C78700] dark:text-amber-400 tracking-wider uppercase block">
                  Rajshahi University
                </span>
              </div>
            </Link>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Institutional digital repository and lending resource serving
              Rajshahi University students, research scholars, and faculty with
              authentic classic treatises, Tafsir, Hadith compilations, and
              Islamic jurisprudence references.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-emerald-200/80">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium">Stacks Open & Catalog Live</span>
            </div>
          </div>

          {/* Column 2: Services Links */}
          <div>
            <h4 className="font-bold text-[#C78700] text-xs mb-3.5 uppercase tracking-wider">
              Library Services
            </h4>
            <ul className="space-y-2 text-xs text-emerald-100/80">
              <li>
                <Link
                  href="/books?type=BORROW_ONLY"
                  className="hover:text-amber-300 transition-colors"
                >
                  Academic Book Borrowing
                </Link>
              </li>
              <li>
                <Link
                  href="/books?type=SELL_ONLY"
                  className="hover:text-amber-300 transition-colors"
                >
                  Direct Book Purchasing
                </Link>
              </li>
              <li>
                <Link
                  href="/donate"
                  className="hover:text-amber-300 transition-colors"
                >
                  Book Donation Programme
                </Link>
              </li>
              <li>
                {user ? (
                  <Link
                    href={
                      user.role === "MEMBER"
                        ? "/dashboard/member/purchases"
                        : `/dashboard/${user.role.toLowerCase().replace("_", "-")}/purchases`
                    }
                    className="hover:text-amber-300 transition-colors font-medium text-amber-300/90"
                  >
                    My Book Purchases
                  </Link>
                ) : (
                  <Link
                    href="/track-order"
                    className="hover:text-amber-300 transition-colors font-medium text-amber-300/90"
                  >
                    Track Order &amp; Guest Status
                  </Link>
                )}
              </li>
              <li>
                <Link
                  href="/checkout"
                  className="hover:text-amber-300 transition-colors"
                >
                  Express Counter Checkout
                </Link>
              </li>
              <li>
                <Link
                  href={user ? dashboardRoute : "/login"}
                  className="hover:text-amber-300 transition-colors"
                >
                  {user
                    ? "Academic Member Portal"
                    : "Faculty & Student Card Issuance"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h4 className="font-bold text-[#C78700] text-xs mb-3.5 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-emerald-100/80">
              <li>
                {user ? (
                  <Link
                    href={dashboardRoute}
                    className="hover:text-amber-300 transition-colors"
                  >
                    Control Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/guest/dashboard"
                    className="hover:text-amber-300 transition-colors"
                  >
                    Guest Buyer Portal
                  </Link>
                )}
              </li>
              <li>
                <Link
                  href="/books"
                  className="hover:text-amber-300 transition-colors"
                >
                  Complete Catalog
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="hover:text-amber-300 transition-colors"
                >
                  My Shopping Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="hover:text-amber-300 transition-colors"
                >
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-amber-300 transition-colors"
                >
                  About the Library
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-amber-300 transition-colors"
                >
                  Contact & Directions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter Subscription Input */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#C78700] text-xs mb-3.5 uppercase tracking-wider">
              Newsletter Subscription
            </h4>
            <p className="text-xs text-emerald-100/80 leading-snug">
              Subscribe to receive updates on new catalog acquisitions, rare
              manuscript additions, and research notices.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-900/60 border border-emerald-700/50 text-xs text-emerald-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full rounded-xl bg-emerald-950/80 border border-emerald-800 px-3 py-2 text-xs text-white placeholder:text-emerald-300/40 focus:outline-none focus:border-amber-400 transition-colors pr-9"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[#C78700] text-white hover:bg-amber-500 transition-colors"
                    aria-label="Subscribe"
                  >
                    <Send className="h-3 w-3" />
                  </button>
                </div>
                <span className="text-[10px] text-emerald-300/60 block">
                  Strictly library notices. No spam.
                </span>
              </form>
            )}
          </div>
        </div>

        {/* Contact Info Strip */}
        <div className="mt-10 pt-6 border-t border-emerald-900/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-emerald-100/80">
          <div className="flex items-center space-x-2.5">
            <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Rajshahi University Campus, Rajshahi-6205</span>
          </div>
          <div className="flex items-center space-x-2.5 sm:justify-center">
            <Phone className="h-4 w-4 text-amber-400 shrink-0" />
            <span>+880 721-750041 / +880 1712-345678</span>
          </div>
          <div className="flex items-center space-x-2.5 sm:justify-end">
            <Mail className="h-4 w-4 text-amber-400 shrink-0" />
            <span>library@ru.ac.bd</span>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-6 pt-4 border-t border-emerald-900/40 text-center text-xs text-emerald-200/60 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>
            © {new Date().getFullYear()} Rajshahi University Islamic Library
            System. All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-3 w-3 text-red-400 fill-current" />{" "}
            for RU Academic Community
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
