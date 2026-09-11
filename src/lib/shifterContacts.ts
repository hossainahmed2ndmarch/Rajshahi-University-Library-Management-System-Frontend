/**
 * Static social contact configuration for library shifters.
 *
 * Since the database does not have social contact fields, these are kept here
 * as a config file rather than hardcoded in components. Update this file when
 * contacts change — no DB migration or API call needed.
 *
 * Data extracted from the official library duty schedule image (shifting.jpeg).
 *
 * Slot definitions (Islamic prayer-based timings):
 *   আসর – মাগরিব  = Asr to Maghrib  ≈ 3:30 PM – 6:15 PM
 *   মাগরিব – এশা   = Maghrib to Isha ≈ 6:15 PM – 8:30 PM
 */

export type ShiftSlot = "asr_maghrib" | "maghrib_isha";

export interface ShifterContact {
  name: string;
  phone: string;
  /** WhatsApp link — same as phone for BD numbers */
  whatsapp: string;
  /** Facebook profile URL — static, update manually */
  facebook?: string;
}

export interface DaySchedule {
  day: string;         // Bengali day name
  dayEn: string;       // English day name (for today detection)
  asr_maghrib: ShifterContact[];
  maghrib_isha: ShifterContact[];
}

/** Maps JS getDay() (0=Sun … 6=Sat) to schedule index */
export const JS_DAY_TO_SCHEDULE_INDEX: Record<number, number> = {
  6: 0, // Saturday  → শনিবার
  0: 1, // Sunday    → রবিবার
  1: 2, // Monday    → সোমবার
  2: 3, // Tuesday   → মঙ্গলবার
  3: 4, // Wednesday → বুধবার
  4: 5, // Thursday  → বৃহস্পতিবার
  5: 6, // Friday    → শুক্রবার
};

const wa = (phone: string) =>
  `https://wa.me/88${phone.replace(/-/g, "")}`;

export const SHIFT_SCHEDULE: DaySchedule[] = [
  {
    day: "শনিবার",
    dayEn: "Saturday",
    asr_maghrib: [
      { name: "মর্তুজা", phone: "01615102656", whatsapp: wa("01615102656") },
    ],
    maghrib_isha: [
      { name: "মাহবুব", phone: "01917014024", whatsapp: wa("01917014024") },
    ],
  },
  {
    day: "রবিবার",
    dayEn: "Sunday",
    asr_maghrib: [
      { name: "ফয়সাল", phone: "01613737701", whatsapp: wa("01613737701") },
    ],
    maghrib_isha: [
      { name: "শাহিদ", phone: "01751064773", whatsapp: wa("01751064773") },
    ],
  },
  {
    day: "সোমবার",
    dayEn: "Monday",
    asr_maghrib: [
      { name: "খাইরুল", phone: "01880493524", whatsapp: wa("01880493524") },
    ],
    maghrib_isha: [
      { name: "মুরসালিন", phone: "01522127356", whatsapp: wa("01522127356") },
      { name: "আরাফাত", phone: "01408960118", whatsapp: wa("01408960118") },
    ],
  },
  {
    day: "মঙ্গলবার",
    dayEn: "Tuesday",
    asr_maghrib: [
      { name: "মাহবুবুর", phone: "01331570989", whatsapp: wa("01331570989") },
    ],
    maghrib_isha: [
      { name: "ইউসুফ", phone: "01522117133", whatsapp: wa("01522117133") },
      { name: "Kaif", phone: "01310133193", whatsapp: wa("01310133193") },
    ],
  },
  {
    day: "বুধবার",
    dayEn: "Wednesday",
    asr_maghrib: [
      { name: "তাহসিন", phone: "01320745471", whatsapp: wa("01320745471") },
    ],
    maghrib_isha: [
      { name: "মুশফিক", phone: "01937939325", whatsapp: wa("01937939325") },
    ],
  },
  {
    day: "বৃহস্পতিবার",
    dayEn: "Thursday",
    asr_maghrib: [
      { name: "তুষার", phone: "01304896953", whatsapp: wa("01304896953") },
    ],
    maghrib_isha: [
      { name: "আজিজুল", phone: "01580575649", whatsapp: wa("01580575649") },
    ],
  },
  {
    day: "শুক্রবার",
    dayEn: "Friday",
    asr_maghrib: [
      { name: "হাফিজুর", phone: "01614599243", whatsapp: wa("01614599243") },
    ],
    maghrib_isha: [
      { name: "মিশু", phone: "01791850118", whatsapp: wa("01791850118") },
      { name: "আবির", phone: "01933270248", whatsapp: wa("01933270248") },
    ],
  },
];

/** Library general contact info */
export const LIBRARY_CONTACT = {
  phone: "01615102656",
  whatsapp: wa("01615102656"),
  facebook: "https://www.facebook.com/ruislamiclibrary",
  location: "২য় তলা, কেন্দ্রীয় গ্রন্থাগার ভবন, রাজশাহী বিশ্ববিদ্যালয়",
  locationEn: "2nd Floor, Central Library Bhaban, Rajshahi University",
  email: "ruislamiclibrary@gmail.com",
};
