import { ICampaignConfig, ICampaignFormField } from "@/types/event";

export interface ICampaignTemplate {
  id: string;
  name: string;
  description: string;
  config: ICampaignConfig;
}

export const PRESET_CAMPAIGN_TEMPLATES: ICampaignTemplate[] = [
  {
    id: "jummah_khutba",
    name: "জুমুআ খুতবা নোট ও শিক্ষণীয় পয়েন্ট",
    description: "মসজিদের নাম, খুতবার বিষয়, প্রধান শিক্ষণীয় পয়েন্ট ও ব্যক্তিগত উপলব্ধি সংগ্রহের ফর্ম",
    config: {
      enabled: true,
      title: "জুমুআ খুতবা নোট ও শিক্ষণীয় পয়েন্ট ক্যাম্পেইন",
      description: "আপনার এলাকার বা ক্যাম্পাসের মসজিদে আজকের জুমুআর খুতবায় যে গুরুত্বপূর্ণ বিষয়গুলো আলোচনা হয়েছে, তা সংক্ষেপে লিখে পাঠান। নির্বাচিত সেরা পয়েন্টগুলো আমাদের ওয়েবসাইটে ও আর্টিকেলে প্রকাশিত হবে।",
      rules: [
        "খুতবার মূল বিষয় ও শিক্ষণীয় ৩টি পয়েন্ট সংক্ষেপে লিখুন।",
        "নিজের কোনো অনুভূতি বা বাস্তব উপলব্ধি থাকলে শেয়ার করতে পারেন।",
        "একজন অংশগ্রহণকারী কেবল একবারই অংশ নিতে পারবেন।",
      ],
      fields: [
        {
          id: "masjidName",
          label: "মসজিদের নাম ও এলাকা",
          type: "text",
          placeholder: "যেমন: রাবি কেন্দ্রীয় জামে মসজিদ / মতিহার",
          required: true,
          helperText: "যে মসজিদে আপনি আজকের জুমুআ আদায় করেছেন",
        },
        {
          id: "khutbaTopic",
          label: "খুতবার মূল বিষয় বা শিরোনাম",
          type: "text",
          placeholder: "যেমন: আত্মশুদ্ধি, তাকওয়া ও যুব সমাজের করণীয়",
          required: true,
        },
        {
          id: "khutbaLesson",
          label: "খুতবার প্রধান শিক্ষণীয় বিষয়সমূহ",
          type: "textarea",
          placeholder: "খতীব সাহেবের আলোচনার মূল ৩টি শিক্ষণীয় দিক বুলেট পয়েন্ট আকারে লিখুন...",
          required: true,
          helperText: "সংক্ষেপে ৩-৪টি লাইনে মূল বার্তা তুলে ধরুন",
        },
        {
          id: "personalReflection",
          label: "ব্যক্তিগত উপলব্ধি বা ভাবনা (ঐচ্ছিক)",
          type: "textarea",
          placeholder: "আলোচনাটি আপনার ব্যক্তিজীবনে কী প্রভাব ফেলেছে...",
          required: false,
        },
        {
          id: "rating",
          label: "খুতবার উপস্থাপনা ও বিষয়ের সার্বিক রেটিং",
          type: "rating",
          required: false,
        },
      ],
    },
  },
  {
    id: "book_review",
    name: "বই পর্যালোচনা ও পাঠ প্রতিক্রিয়া",
    description: "পাঠচক্র বা বইমেলার নির্দিষ্ট বই নিয়ে পাঠকদের অভিমত ও পর্যালোচনা সংগ্রহের ফর্ম",
    config: {
      enabled: true,
      title: "পাঠ প্রতিক্রিয়া ও বই পর্যালোচনা",
      description: "নির্বাচিত বইটি পড়ে আপনার কেমন লেগেছে? বইটির মূল শিক্ষা, প্রিয় উক্তি এবং সামগ্রিক মূল্যায়ন আমাদের জানান।",
      rules: [
        "বইটির ইতিবাচক ও শিক্ষণীয় দিকগুলো সংক্ষেপে তুলে ধরুন।",
        "কপি-পেস্ট এড়িয়ে নিজের ভাষায় মৌলিক অভিমত প্রদান করুন।",
      ],
      fields: [
        {
          id: "bookTitle",
          label: "বইয়ের নাম ও লেখক",
          type: "text",
          placeholder: "যেমন: আবার আসিব ফিরে - আরিফ আজাদ",
          required: true,
        },
        {
          id: "favoriteQuote",
          label: "বইয়ের সবচেয়ে পছন্দের উক্তি বা লাইন",
          type: "textarea",
          placeholder: "বইটির কোনো বিশেষ লাইন বা অনুচ্ছেদ যা আপনাকে নাড়া দিয়েছে...",
          required: false,
        },
        {
          id: "reviewContent",
          label: "বইটির সামগ্রিক পর্যালোচনা ও শিক্ষণীয় বার্তা",
          type: "textarea",
          placeholder: "বইটি পড়ে আপনার উপলব্ধি, বিষয়বস্তুর গভীরতা এবং কেন পড়া উচিত...",
          required: true,
        },
        {
          id: "recommendation",
          label: "অন্যদের বইটি পড়ার জন্য সুপারিশ করবেন কি?",
          type: "radio",
          required: true,
          options: ["অবশ্যই সুপারিশ করব (Must Read)", "পড়া যেতে পারে", "সুপারিশ করব না"],
        },
        {
          id: "rating",
          label: "বইটির সার্বিক রেটিং (১-৫)",
          type: "rating",
          required: true,
        },
      ],
    },
  },
  {
    id: "writing_competition",
    name: "মৌলিক প্রবন্ধ ও গল্প প্রতিযোগিতা",
    description: "বিষয়ভিত্তিক রচনা, সৃজনশীল গল্প বা লেখালেখি প্রতিযোগিতার সাবমিশন ফর্ম",
    config: {
      enabled: true,
      title: "ইসলাম ও সমকালীন সমাজ বিষয়ক লেখালেখি প্রতিযোগিতা",
      description: "আপনার মৌলিক লেখা পাঠিয়ে অংশ নিন আমাদের বিশেষ প্রতিযোগিতায়। সেরা লেখকদের আকর্ষণীয় বই উপহার দেওয়া হবে এবং লেখাগুলো বিশেষ আর্টিকেলে স্থান পাবে।",
      rules: [
        "লেখাটি সম্পূর্ণ স্বরচিত ও অপ্রকাশিত হতে হবে।",
        "শব্দসীমা: ৩০০ থেকে ১০০০ শব্দের মধ্যে।",
      ],
      fields: [
        {
          id: "submissionTitle",
          label: "লেখার পূর্ণাঙ্গ শিরোনাম",
          type: "text",
          placeholder: "যেমন: আধুনিক যুগে সময়ের সদ্ব্যবহার ও আদর্শ যুবসমাজ",
          required: true,
        },
        {
          id: "category",
          label: "লেখার বিভাগ",
          type: "select",
          required: true,
          options: ["ইসলামি প্রবন্ধ ও চিন্তা", "সৃজনশীল ছোটগল্প", "কবিতা / নাশিদ", "আত্মশুদ্ধি ও দ্বীনি পরিবর্তন"],
        },
        {
          id: "articleContent",
          label: "আপনার মূল লেখাটি লিখুন",
          type: "textarea",
          placeholder: "এখানে আপনার লেখাটি সুন্দরভাবে লিখুন বা পেস্ট করুন...",
          required: true,
          helperText: "প্যারাগ্রাফ ভাগ করে স্পষ্ট করে লিখুন",
        },
        {
          id: "writingExperience",
          label: "পূর্বে কোথাও লেখালেখি করেছেন কি? (ঐচ্ছিক)",
          type: "text",
          placeholder: "যেমন: বিভিন্ন পত্রিকা, সোশ্যাল মিডিয়া পেজ বা ব্লগ লিঙ্ক",
          required: false,
        },
      ],
    },
  },
  {
    id: "general_survey",
    name: "সাধারণ মতামত ও পরামর্শ জরিপ",
    description: "ইভেন্ট বা ক্যাম্পেইনের সামগ্রিক অভিজ্ঞতা ও ভবিষ্যৎ পরামর্শ সংগ্রহের উন্মুক্ত ফর্ম",
    config: {
      enabled: true,
      title: "ইভেন্ট মূল্যায়ন ও গঠনমূলক পরামর্শ জরিপ",
      description: "আমাদের আয়োজনকে আরও সুন্দর ও মানসম্মত করতে আপনার খোলামেলা মতামত ও পরামর্শ জানান।",
      fields: [
        {
          id: "bestAspect",
          label: "আজকের আয়োজনে আপনার সবচেয়ে ভালো লেগেছে কী?",
          type: "text",
          placeholder: "যেমন: আলোচকের বাচনভঙ্গি, বই নির্বাচনের চমৎকারিত্ব, সুন্দর ব্যবস্থাপনা...",
          required: true,
        },
        {
          id: "suggestions",
          label: "ভবিষ্যৎ আয়োজনের জন্য আপনার পরামর্শ",
          type: "textarea",
          placeholder: "কী কী পরিবর্তন আনলে আয়োজনটি আরও ফলপ্রসূ হতে পারত...",
          required: true,
        },
        {
          id: "futureTopics",
          label: "পরবর্তী সেশনগুলোতে কোন কোন বিষয়ের আলোচনা চান?",
          type: "checkbox",
          required: false,
          options: ["কুরআন ও তাফসীর অধ্যয়ন", "সীরাতুন্নবী (সা.) ও সাহাবী চরিত্র", "সমকালীন ফিকহি মাসায়েল ও অর্থনীতি", "পারিবারিক জীবন ও সুখী দাম্পত্য", "যুব ক্যারিয়ার ও আত্মউন্নয়ন"],
        },
        {
          id: "rating",
          label: "আয়োজনের সামগ্রিক রেটিং",
          type: "rating",
          required: true,
        },
      ],
    },
  },
];
