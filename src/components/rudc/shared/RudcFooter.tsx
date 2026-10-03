import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Heart, Mail, MapPin, Phone, ShieldCheck, Users } from "lucide-react";
import rudcLogo from "@/assets/logo/rudc_logo.jpg";

export function RudcFooter() {
  return (
    <footer className="border-t border-border/80 bg-slate-900 text-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: About RUDC */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white p-0.5 shadow-sm">
                <Image
                  src={rudcLogo}
                  alt="RUDC Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-base font-black text-white leading-tight">
                  Rajshahi University Dawah Community
                </h3>
                <p className="text-[11px] text-amber-400 font-semibold">
                  Ahlus Sunnah wal Jama&apos;ah Manhaj
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              The Rajshahi University Dawah Community (RUDC) is a social, non-political, and
              service-oriented campus-based Dawah organization operating at the University of Rajshahi.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700 transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                <span>Visit RU Islamic Library</span>
              </Link>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/rudc" className="hover:text-emerald-400 transition-colors">
                  Home (RUDC)
                </Link>
              </li>
              <li>
                <Link href="/rudc/activities" className="hover:text-emerald-400 transition-colors">
                  Dawah Activities
                </Link>
              </li>
              <li>
                <Link href="/rudc/events" className="hover:text-emerald-400 transition-colors">
                  Upcoming Events & Halqah
                </Link>
              </li>
              <li>
                <Link href="/rudc/publications" className="hover:text-emerald-400 transition-colors">
                  Articles & Publications
                </Link>
              </li>
              <li>
                <Link href="/rudc/terms" className="hover:text-emerald-400 transition-colors">
                  Terms & Membership Conditions
                </Link>
              </li>
              <li>
                <Link href="/rudc/join" className="hover:text-emerald-400 transition-colors text-amber-300 font-bold">
                  Apply as Volunteer →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Principles & Structure */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
              Community Structure
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>Volunteers (Initial Orientation)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>Permanent Members (Supervised)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>Specialized Teams (Food, Media, Logistics)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>Executive Committee & Shura</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>Alumni Network</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Location & Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
              Headquarters
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  RU Islamic Library, Shop No. 44, Stadium Market, Rajshahi University, Rajshahi-6205.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
                <a href="mailto:rudc.rajshahi@gmail.com" className="hover:text-emerald-400">
                  rudc.rajshahi@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>+880 1700-000000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Rajshahi University Dawah Community. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/rudc/terms" className="hover:text-slate-200">
              Terms & Conditions
            </Link>
            <span>•</span>
            <Link href="/" className="hover:text-slate-200 text-emerald-400">
              RU Islamic Library
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
