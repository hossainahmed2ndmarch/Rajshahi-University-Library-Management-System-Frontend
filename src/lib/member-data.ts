/**
 * Shared reference data for member forms.
 * Single source of truth — import from here in all modals and forms.
 */

export const RU_DEPARTMENTS = [
  "Islamic Studies",
  "Arabic",
  "Philosophy",
  "History",
  "Sociology",
  "Social Work",
  "Economics",
  "Accounting & Information Systems",
  "Management Studies",
  "Marketing",
  "Finance & Banking",
  "Law & Justice",
  "International Relations",
  "Political Science",
  "Public Administration",
  "Psychology",
  "Bangla",
  "English",
  "Statistics",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Botany",
  "Zoology",
  "Pharmacy",
  "Computer Science & Engineering",
  "Information & Communication Engineering",
  "Electrical & Electronic Engineering",
  "Applied Chemistry & Chemical Engineering",
  "Materials Science & Engineering",
  "Geography & Environmental Studies",
  "Geology & Mining",
  "Agricultural Sciences",
  "Fisheries",
  "Education",
  "Physical Education",
  "Fine Arts",
  "Music",
  "Theater",
  "Other",
] as const;

export const ACADEMIC_SESSIONS = [
  "2016-2017",
  "2017-2018",
  "2018-2019",
  "2019-2020",
  "2020-2021",
  "2021-2022",
  "2022-2023",
  "2023-2024",
  "2024-2025",
  "2025-2026",
] as const;

export type RUDepartment = (typeof RU_DEPARTMENTS)[number];
export type AcademicSession = (typeof ACADEMIC_SESSIONS)[number];
