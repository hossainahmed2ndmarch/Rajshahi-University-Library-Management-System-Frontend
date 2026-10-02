"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle,
  FileText,
  HeartHandshake,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { useApplyRudcVolunteer } from "@/hooks/useRudc";
import { useGetMe } from "@/hooks/useAuth";
import { AccommodationType, BloodGroup } from "@/types/rudc";

export default function RudcJoinPage() {
  const router = useRouter();
  const { data: currentUser } = useGetMe();
  const { mutateAsync: applyRudc, isPending } = useApplyRudcVolunteer();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    department: "",
    faculty: "",
    studentOrVoterId: "",
    whatsappNumber: "",
    bloodGroup: "B_POSITIVE" as BloodGroup,
    skills: [] as string[],
    accommodationType: "HALL" as AccommodationType,
    accommodationName: "",
    permanentAddress: "",
    isAffiliatedWithOther: false,
    otherOrgName: "",
    rudcTermsAccepted: false,
  });

  const [customSkillInput, setCustomSkillInput] = useState("");
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Pre-fill existing user info if logged in
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || currentUser.phoneNumber || prev.phone,
        department: currentUser.department || prev.department,
        studentOrVoterId: currentUser.studentOrVoterId || prev.studentOrVoterId,
      }));
    }
  }, [currentUser]);

  const availableSkills = [
    "Dawah & Outreach",
    "Graphics Design",
    "Video Editing",
    "Logistics & Event Setup",
    "Content Writing & Editing",
    "Public Speaking & Host",
    "Food Coordination",
    "Web & Technical Support",
    "Photography",
    "Accounts & Management",
  ];

  const toggleSkill = (skill: string) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(skill);
      if (exists) {
        return { ...prev, skills: prev.skills.filter((s) => s !== skill) };
      } else {
        return { ...prev, skills: [...prev.skills, skill] };
      }
    });
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setCustomSkillInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.rudcTermsAccepted) {
      toast.error("আপনাকে অবশ্যই RUDC-এর ১০টি শর্তাবলী মেনে নেওয়ার সম্মতি দিতে হবে।");
      return;
    }

    if (formData.skills.length === 0) {
      toast.error("অনুগ্রহ করে আপনার অন্তত একটি দক্ষতা (Skill) নির্বাচন করুন।");
      return;
    }

    if (formData.isAffiliatedWithOther && !formData.otherOrgName.trim()) {
      toast.error("যেহেতু আপনি অন্য সংগঠনের সাথে যুক্ত, অনুগ্রহ করে সংগঠনের নাম লিখুন।");
      return;
    }

    try {
      await applyRudc(formData);
      setSubmittedSuccess(true);
    } catch {
      // toast is already fired in hook
    }
  };

  if (submittedSuccess) {
    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
          <CheckCircle className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground">
            আলহামদুলিল্লাহ! আপনার আবেদন সফল হয়েছে
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Rajshahi University Dawah Community (RUDC)-এর ভলান্টিয়ার হিসেবে আপনার আবেদন
            গৃহীত হয়েছে। আমাদের সিলেকশন কমিটি আপনার তথ্য পর্যালোচনা করে সাক্ষাতকার (Interview)-এর
            তারিখ ও সময় ইমেইল এবং হোয়াটসঅ্যাপের মাধ্যমে জানিয়ে দিবে।
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border text-left text-xs space-y-2 text-muted-foreground">
          <p className="font-bold text-foreground">পরবর্তী করণীয়:</p>
          <p>• আপনার ইমেইল ইনবক্স চেক রাখুন।</p>
          <p>• RUDC-এর অফিস: RU Islamic Library, Shop No. 44, Stadium Market, Rajshahi University।</p>
          <p>• নিয়মিত জামাতে সালাত আদায় ও সুন্নাহ অনুসরণে সচেষ্ট থাকুন।</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/rudc"
            className="px-5 py-2.5 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white font-bold text-xs shadow-xs"
          >
            RUDC হোমপেজে যান
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold text-xs shadow-xs"
          >
            RU Islamic Library ভিজিট করুন
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 lg:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-600/30 text-[#004F32] dark:text-emerald-300 text-xs font-bold">
            <UserPlus className="h-3.5 w-3.5 text-[#C78700] dark:text-amber-400" />
            <span>Membership & Volunteer Application Form</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            Rajshahi University Dawah Community
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            The Rajshahi University Dawah Community is a social, non-political, and service-oriented
            campus-based Dawah organization.
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Location: RU Islamic Library, Shop No. 44, Stadium Market, Rajshahi University</span>
          </div>
        </div>

        {/* Application Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-8"
        >
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#004F32] dark:text-emerald-400 border-b border-border/60 pb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>১. ব্যক্তিগত ও অ্যাকাডেমিক তথ্য (Basic & Academic Info)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  পূর্ণ নাম (Full Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abdullah Al Mamun"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  ইমেইল অ্যাড্রেস (Email Address) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Mobile Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  মোবাইল নম্বর (Contact Number) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* WhatsApp Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  হোয়াটসঅ্যাপ মোবাইল নম্বর (WhatsApp No) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  বিভাগ (Department) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science & Engineering"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Faculty */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  অনুষদ (Faculty) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Faculty of Engineering / Science / Arts"
                  value={formData.faculty}
                  onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* NID / Student ID / HSC Reg */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  NID / Student ID / HSC Reg ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2110XXXXXX or NID no."
                  value={formData.studentOrVoterId}
                  onChange={(e) => setFormData({ ...formData, studentOrVoterId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Blood Group */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  রক্তের গ্রুপ (Blood Group) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) =>
                    setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="A_POSITIVE">A+ (Positive)</option>
                  <option value="A_NEGATIVE">A- (Negative)</option>
                  <option value="B_POSITIVE">B+ (Positive)</option>
                  <option value="B_NEGATIVE">B- (Negative)</option>
                  <option value="AB_POSITIVE">AB+ (Positive)</option>
                  <option value="AB_NEGATIVE">AB- (Negative)</option>
                  <option value="O_POSITIVE">O+ (Positive)</option>
                  <option value="O_NEGATIVE">O- (Negative)</option>
                </select>
              </div>

              {/* Password (if registering new account) */}
              {!currentUser && (
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground">
                    অ্যাকাউন্ট পাসওয়ার্ড (Account Password - min 6 characters){" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 pl-9"
                    />
                    <Lock className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    আপনার এই ইমেইল ও পাসওয়ার্ড দিয়ে আপনি RUIL ও RUDC উভয় ড্যাশবোর্ডে লগইন করতে পারবেন।
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Accommodation & Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#004F32] dark:text-emerald-400 border-b border-border/60 pb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>২. আবাসন ও ঠিকানার বিবরণ (Accommodation & Residence)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Accommodation Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  আবাসন টাইপ (হল/মেস/বাসা) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.accommodationType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accommodationType: e.target.value as AccommodationType,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="HALL">হল (Hall)</option>
                  <option value="MESS">মেস (Mess)</option>
                  <option value="HOME">বাসা (Home / Family)</option>
                </select>
              </div>

              {/* Accommodation Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  হল / মেস / বাসার নাম ও রুম নং <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shaheed Ziaur Rahman Hall, Room 304"
                  value={formData.accommodationName}
                  onChange={(e) =>
                    setFormData({ ...formData, accommodationName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Permanent Address */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">
                  স্থায়ী ঠিকানা (Permanent Address) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="গ্রাম/রোড, ডাকঘর, উপজেলা, জেলা"
                  value={formData.permanentAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, permanentAddress: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Skills & Organization Affiliation */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#004F32] dark:text-emerald-400 border-b border-border/60 pb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>৩. দক্ষতা ও সাংগঠনিক তথ্য (Skills & Affiliation)</span>
            </h3>

            {/* Skills selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>
                  আপনার দক্ষতা ও আগ্রহের ক্ষেত্রসমূহ (Skills) <span className="text-rose-500">*</span>
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {formData.skills.length} টি নির্বাচিত
                </span>
              </label>

              <div className="flex flex-wrap gap-2 pt-1">
                {availableSkills.map((skill) => {
                  const isSelected = formData.skills.includes(skill);
                  return (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-[#004F32] text-white shadow-xs"
                          : "bg-muted hover:bg-muted/80 text-foreground border border-border/70"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {skill}
                    </button>
                  );
                })}
              </div>

              {/* Custom skill add */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="অন্য কোনো দক্ষতা যোগ করুন..."
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={handleAddCustomSkill}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold border border-border"
                >
                  যোগ করুন
                </button>
              </div>
            </div>

            {/* Organization Affiliation */}
            <div className="space-y-3 pt-3">
              <label className="text-xs font-semibold text-foreground block">
                অন্য কোন সংগঠনের সাথে যুক্ত আছেন কিনা? <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                  <input
                    type="radio"
                    name="affiliated"
                    checked={formData.isAffiliatedWithOther === false}
                    onChange={() =>
                      setFormData({ ...formData, isAffiliatedWithOther: false, otherOrgName: "" })
                    }
                    className="accent-emerald-600 h-4 w-4"
                  />
                  <span>না (No)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                  <input
                    type="radio"
                    name="affiliated"
                    checked={formData.isAffiliatedWithOther === true}
                    onChange={() => setFormData({ ...formData, isAffiliatedWithOther: true })}
                    className="accent-emerald-600 h-4 w-4"
                  />
                  <span>হ্যাঁ (Yes)</span>
                </label>
              </div>

              {formData.isAffiliatedWithOther && (
                <div className="space-y-1.5 pt-1 animate-in fade-in-50">
                  <label className="text-xs font-semibold text-foreground">
                    সংগঠনের নাম (Organization Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required={formData.isAffiliatedWithOther}
                    placeholder="যুক্ত থাকা সংগঠনের নাম লিখুন..."
                    value={formData.otherOrgName}
                    onChange={(e) => setFormData({ ...formData, otherOrgName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Terms and Conditions Acceptance */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-[#004F32] dark:text-emerald-400 border-b border-border/60 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span>৪. সদস্যপদের ১০টি শর্তাবলী মেনে চলার অঙ্গীকার</span>
              </span>
              <Link
                href="/rudc/terms"
                target="_blank"
                className="text-xs text-[#C78700] hover:underline font-semibold"
              >
                বিস্তারিত শর্তাবলী দেখুন ↗
              </Link>
            </h3>

            <div className="rounded-2xl border border-emerald-600/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-2 text-xs text-foreground/90 max-h-48 overflow-y-auto leading-relaxed">
              <p>১. মসজিদে জামাতে ৫ ওয়াক্ত সালাত আদায় ও রমযানের সিয়াম পালন।</p>
              <p>২. সুন্নাহসম্মত দাড়ি ও শালীন পোশাক পরিধান (টাখনুর উপরে প্যান্ট/পায়জামা)।</p>
              <p>৩. কোনো রাজনৈতিক দল বা গোপন সংগঠনের সাথে সম্পৃক্ত না থাকা।</p>
              <p>৪. হারাম সম্পর্ক, গান-বাজনা ও কবিরা গুনাহ থেকে দূরে থাকা।</p>
              <p>৫. অনুমোদন ব্যতীত কোনো মিছিল বা সমাবেশে অংশগ্রহণ বা বক্তব্য না দেওয়া।</p>
              <p>৬. সোশ্যাল মিডিয়ায় মার্জিত ও শালীন ভাষা রক্ষা করা।</p>
              <p>৭. কোনো ইসলামিক দল বা আলেমের প্রতি বিদ্বেষমূলক মন্তব্য না করা।</p>
              <p>৮. অর্পিত সাংগঠনিক দায়িত্ব নিষ্ঠার সাথে পালন করা।</p>
              <p>৯. আহলুস সুন্নাহ ওয়াল জামায়াতের সকল মাযহাব ও মানহাজের প্রতি সহনশীল থাকা।</p>
              <p>১০. জাহেলী উৎসব ও দ্বীন বিকৃতকারী কাজ থেকে দূরে থাকা।</p>
              <p className="font-semibold text-emerald-800 dark:text-emerald-300 pt-1">
                • মাসিক ৫০/- টাকা ইয়ানত (চাঁদা) পরিশোধ করা ও নির্ধারিত তত্ত্বাবধায়কের অধীনে কাজ করা।
              </p>
            </div>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 cursor-pointer text-xs">
              <input
                type="checkbox"
                required
                checked={formData.rudcTermsAccepted}
                onChange={(e) =>
                  setFormData({ ...formData, rudcTermsAccepted: e.target.checked })
                }
                className="accent-emerald-600 h-4 w-4 mt-0.5"
              />
              <span className="font-medium text-foreground leading-relaxed">
                আমি Rajshahi University Dawah Community (RUDC)-এর উল্লিখিত সকল শর্তাবলী পড়েছি, বুঝেছি
                এবং আল্লাহর সন্তুষ্টির উদ্দেশ্যে এই শর্তসমূহ আন্তরিকভাবে পালন করতে অঙ্গীকার করছি।{" "}
                <span className="text-rose-500 font-bold">*</span>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#004F32] to-[#016842] hover:from-[#003e27] hover:to-[#004F32] text-sm font-bold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>আবেদন প্রক্রিয়াধীন...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 text-amber-300" />
                  <span>ভলান্টিয়ার হিসেবে আবেদন জমা দিন</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
