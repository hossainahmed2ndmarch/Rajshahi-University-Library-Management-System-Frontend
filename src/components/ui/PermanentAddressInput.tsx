"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MapPin, Search, ChevronDown, Plus } from "lucide-react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

export interface AddressData {
  division: string;
  district: string;
  upazila: string;
  union: string;
  village: string;
}

export interface PermanentAddressInputProps {
  value: string; // JSON string or plain text
  onChange: (value: string) => void;
  villageOptions?: string[];
  disabled?: boolean;
}

// Bangladesh Divisions & Districts map
const BD_DIVISIONS_DATA: Record<string, string[]> = {
  Rajshahi: [
    "Rajshahi",
    "Chapainawabganj",
    "Natore",
    "Naogaon",
    "Pabna",
    "Sirajganj",
    "Bogura",
    "Joypurhat",
  ],
  Dhaka: [
    "Dhaka",
    "Gazipur",
    "Narayanganj",
    "Tangail",
    "Faridpur",
    "Manikganj",
    "Munshiganj",
    "Narsingdi",
    "Kishoreganj",
    "Gopalganj",
    "Madaripur",
    "Rajbari",
    "Shariatpur",
  ],
  Chattogram: [
    "Chattogram",
    "Cox's Bazar",
    "Cumilla",
    "Feni",
    "Brahmanbaria",
    "Noakhali",
    "Chandpur",
    "Lakshmipur",
    "Khagrachhari",
    "Rangamati",
    "Bandarban",
  ],
  Khulna: [
    "Khulna",
    "Jashore",
    "Satkhira",
    "Bagerhat",
    "Jhenaidah",
    "Kushtia",
    "Magura",
    "Meherpur",
    "Narail",
    "Chuadanga",
  ],
  Barishal: [
    "Barishal",
    "Patuakhali",
    "Bhola",
    "Pirojpur",
    "Barguna",
    "Jhalokati",
  ],
  Sylhet: [
    "Sylhet",
    "Moulvibazar",
    "Habiganj",
    "Sunamganj",
  ],
  Rangpur: [
    "Rangpur",
    "Dinajpur",
    "Gaibandha",
    "Kurigram",
    "Lalmonirhat",
    "Nilphamari",
    "Panchagarh",
    "Thakurgaon",
  ],
  Mymensingh: [
    "Mymensingh",
    "Jamalpur",
    "Netrokona",
    "Sherpur",
  ],
};

export function parsePermanentAddress(raw: string | null | undefined): AddressData {
  if (!raw || !raw.trim()) {
    return { division: "", district: "", upazila: "", union: "", village: "" };
  }
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      return {
        division: parsed.division || "",
        district: parsed.district || "",
        upazila: parsed.upazila || "",
        union: parsed.union || "",
        village: parsed.village || "",
      };
    }
  } catch {
    // If plain string, fallback to village or general address
    return {
      division: "",
      district: "",
      upazila: "",
      union: "",
      village: raw.trim(),
    };
  }
  return { division: "", district: "", upazila: "", union: "", village: "" };
}

export function formatAddressDisplay(raw: string | null | undefined): string {
  if (!raw) return "—";
  const data = parsePermanentAddress(raw);
  const parts = [
    data.village && `Village/Area: ${data.village}`,
    data.union && `Union/Ward: ${data.union}`,
    data.upazila && `Upazila: ${data.upazila}`,
    data.district && `District: ${data.district}`,
    data.division && `Division: ${data.division}`,
  ].filter(Boolean);

  if (parts.length > 0) return parts.join(", ");
  return raw;
}

export function PermanentAddressInput({
  value,
  onChange,
  villageOptions = [],
  disabled = false,
}: PermanentAddressInputProps) {
  const address = useMemo(() => parsePermanentAddress(value), [value]);

  const [division, setDivision] = useState(address.division);
  const [district, setDistrict] = useState(address.district);
  const [upazila, setUpazila] = useState(address.upazila);
  const [union, setUnion] = useState(address.union);
  const [village, setVillage] = useState(address.village);

  // Sync internal state when external value changes
  useEffect(() => {
    const next = parsePermanentAddress(value);
    setDivision(next.division);
    setDistrict(next.district);
    setUpazila(next.upazila);
    setUnion(next.union);
    setVillage(next.village);
  }, [value]);

  const updateField = (field: keyof AddressData, val: string) => {
    let nextDiv = division;
    let nextDist = district;
    let nextUpz = upazila;
    let nextUni = union;
    let nextVil = village;

    if (field === "division") {
      nextDiv = val;
      // If district doesn't belong to new division, clear it
      if (val && BD_DIVISIONS_DATA[val] && !BD_DIVISIONS_DATA[val].includes(district)) {
        nextDist = "";
      }
      setDivision(nextDiv);
      setDistrict(nextDist);
    } else if (field === "district") {
      nextDist = val;
      setDistrict(nextDist);
    } else if (field === "upazila") {
      nextUpz = val;
      setUpazila(nextUpz);
    } else if (field === "union") {
      nextUni = val;
      setUnion(nextUni);
    } else if (field === "village") {
      nextVil = val;
      setVillage(nextVil);
    }

    const payload: AddressData = {
      division: nextDiv,
      district: nextDist,
      upazila: nextUpz,
      union: nextUni,
      village: nextVil,
    };
    onChange(JSON.stringify(payload));
  };

  const availableDistricts = useMemo(() => {
    if (division && BD_DIVISIONS_DATA[division]) {
      return BD_DIVISIONS_DATA[division];
    }
    // All districts combined if no division selected
    return Object.values(BD_DIVISIONS_DATA).flat().sort((a, b) => a.localeCompare(b));
  }, [division]);

  return (
    <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-3.5 text-xs">
      <div className="flex items-center gap-1.5 font-bold text-foreground text-xs">
        <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Permanent Address (বিভাগ, জেলা, উপজেলা, ইউনিয়ন, গ্রাম)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Division */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-muted-foreground">
            Division (বিভাগ)
          </label>
          <select
            value={division}
            onChange={(e) => updateField("division", e.target.value)}
            disabled={disabled}
            className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="">Select Division</option>
            {Object.keys(BD_DIVISIONS_DATA).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* District (Zilla) */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-muted-foreground">
            District / Zilla (জেলা)
          </label>
          <select
            value={district}
            onChange={(e) => updateField("district", e.target.value)}
            disabled={disabled}
            className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="">Select District</option>
            {availableDistricts.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
        </div>

        {/* Upazila / Thana */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-muted-foreground">
            Upazila / Thana (উপজেলা/থানা)
          </label>
          <input
            type="text"
            value={upazila}
            onChange={(e) => updateField("upazila", e.target.value)}
            placeholder="e.g. Boalia, Motihar, Paba"
            disabled={disabled}
            className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Union / Ward */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-muted-foreground">
            Union / Ward (ইউনিয়ন/ওয়ার্ড)
          </label>
          <input
            type="text"
            value={union}
            onChange={(e) => updateField("union", e.target.value)}
            placeholder="e.g. Ward No. 24, Union 3"
            disabled={disabled}
            className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Village / Area (Search pre-existing or write new) */}
      <div className="space-y-1 pt-1">
        <label className="text-[11px] font-semibold text-muted-foreground">
          Village / Area / Para (গ্রাম / এলাকা / পাড়া) — Search pre-existing or write new
        </label>
        <SearchableSelect
          value={village}
          onChange={(val) => updateField("village", val)}
          options={villageOptions}
          placeholder="Select pre-existing village or enter new name..."
          disabled={disabled}
        />
      </div>
    </div>
  );
}
