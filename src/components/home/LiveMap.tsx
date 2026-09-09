"use client";

import React from "react";
import {
  Building,
  Clock,
  MapPin,
  ShieldCheck,
  Radio,
  ExternalLink,
} from "lucide-react";
import { useActiveShift } from "@/hooks/useShifts";

export function LiveMap() {
  const { data: activeShift, isLoading } = useActiveShift();

  const isCounterOpen = Boolean(activeShift);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-card rounded-3xl border border-border p-6 sm:p-10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Info Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
                <Building className="h-4 w-4" />
                <span>Physical Stacks & Circulation Counter</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-foreground">
                Visit RU Islamic Central Library
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                Located on the 2nd Floor of the Central Library Bhaban at Rajshahi University main campus.
              </p>
            </div>

            {/* Real-Time Operational Status Badge driven by useShifts() */}
            <div
              className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors ${
                isCounterOpen
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900/80 text-emerald-900 dark:text-emerald-200"
                  : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900/80 text-amber-900 dark:text-amber-200"
              }`}
            >
              <div className="flex h-5 w-5 items-center justify-center shrink-0 mt-0.5">
                <Radio
                  className={`h-4 w-4 animate-pulse ${
                    isCounterOpen ? "text-emerald-600" : "text-amber-600"
                  }`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm">
                    {isCounterOpen ? "OPEN / Shift Active" : "STANDBY / Closed for Break"}
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isCounterOpen
                        ? "bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200"
                        : "bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200"
                    }`}
                  >
                    Live Status
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {isCounterOpen
                    ? `Shifter Desk (${activeShift?.shifterName || "Duty Shifter"}) is active. Instant counter pickups available.`
                    : "Next regular counter shift opens at 8:30 AM. Digital catalog reservation remains 24/7."}
                </p>
              </div>
            </div>

            {/* Operational Schedule & Address */}
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
                  <p className="font-bold text-foreground">Physical Location & Counter</p>
                  <p className="text-muted-foreground mt-0.5">
                    2nd Floor, Counter 3, Central Library Bhaban, Rajshahi University, Rajshahi-6205
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Interactive Campus Map Embed */}
          <div className="lg:col-span-7 h-80 sm:h-96 rounded-2xl overflow-hidden border border-border relative bg-muted flex items-center justify-center shadow-xs">
            <iframe
              title="Rajshahi University Central Library Location Map"
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
  );
}

export default LiveMap;
