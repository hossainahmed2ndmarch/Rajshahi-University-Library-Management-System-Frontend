export interface IBlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  category: "Monthly Newspaper" | "Scholarly Article" | "Library Notice" | "Manuscript Review";
  content?: string[];
}

export const BLOG_POSTS: IBlogPost[] = [
  {
    id: "ruil-bulletin-august-2026",
    title: "RU Library Monthly Gazette: August 2026 Bulletin",
    excerpt:
      "Highlights of 450 newly indexed Tafsir and Fiqh volumes, student borrowing milestones, and the upcoming Classical Calligraphy seminar.",
    author: "Library Editorial Board",
    authorRole: "Central Circulation Division",
    date: "August 10, 2026",
    readTime: "4 min read",
    category: "Monthly Newspaper",
  },
  {
    id: "preserving-islamic-manuscripts-rajshahi",
    title: "Preserving Bengal's Islamic Manuscript Heritage in Rajshahi",
    excerpt:
      "A deep exploration of our digitization initiative restoring fragile 19th-century Arabic and Persian manuscripts from North Bengal scholars.",
    author: "Dr. Tariqur Rahman",
    authorRole: "Senior Archivist & Researcher",
    date: "August 04, 2026",
    readTime: "7 min read",
    category: "Scholarly Article",
  },
  {
    id: "extended-reading-hall-hours",
    title: "Extended Central Reading Hall Hours for Semester Finals",
    excerpt:
      "RU Islamic Library reading rooms will remain open until 10:00 PM daily starting next week to facilitate students preparing for annual examinations.",
    author: "Circulation Desk",
    authorRole: "Administration",
    date: "July 28, 2026",
    readTime: "2 min read",
    category: "Library Notice",
  },
  {
    id: "review-ihya-ulum-al-din-critical-edition",
    title: "Critical Review: Dar al-Minhaj Edition of Ihya Ulum al-Din",
    excerpt:
      "An analytical review of the latest critical verification of Imam al-Ghazali's magnum opus, now cataloged in our Reference Section.",
    author: "Ustadh Mahmudul Hasan",
    authorRole: "Faculty of Islamic Studies",
    date: "July 19, 2026",
    readTime: "6 min read",
    category: "Manuscript Review",
  },
];
