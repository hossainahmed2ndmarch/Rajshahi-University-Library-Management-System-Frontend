export type Organization = 'RUIL' | 'RUDC' | 'BOTH';
export type MediaType = 'IMAGE' | 'VIDEO';

export interface IGalleryItem {
  id: number;
  org: Organization;
  title?: string | null;
  description?: string | null;
  mediaType: MediaType;
  url: string;
  thumbnail?: string | null;
  assetKey?: string | null;
  category?: string | null;
  activityId?: number | null;
  activity?: {
    id: number;
    title: string;
    slug: string;
  } | null;
  isPublished: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateGalleryItemPayload {
  org?: Organization;
  title?: string;
  description?: string;
  mediaType?: MediaType;
  url: string;
  thumbnail?: string | null;
  assetKey?: string | null;
  category?: string | null;
  activityId?: number | null;
  isPublished?: boolean;
  featured?: boolean;
}

export interface IUpdateGalleryItemPayload extends Partial<ICreateGalleryItemPayload> {
  id: number;
}

export interface ISetAssetPayload {
  assetKey: string;
  url: string;
  title?: string;
  description?: string;
  org?: Organization;
  category?: string;
  mediaType?: MediaType;
  thumbnail?: string | null;
  activityId?: number | null;
}

export interface IGalleryQueryParams {
  searchTerm?: string;
  search?: string;
  category?: string;
  org?: string;
  mediaType?: string;
  activityId?: number;
  isPublished?: string | boolean;
  featured?: string | boolean;
  isAsset?: string | boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ISiteAssetConfig {
  key: string;
  label: string;
  section: 'Branding & Identity' | 'Hero & Banners' | 'Featured Sections' | 'Footer & Badges';
  description: string;
  recommendedDimensions: string;
  aspectRatio: string;
  defaultUrl: string;
  org: Organization;
}

export const KNOWN_SITE_ASSETS: ISiteAssetConfig[] = [
  {
    key: 'ruil_logo',
    label: 'Primary Brand Logo (RUIL)',
    section: 'Branding & Identity',
    description: 'Header navbar and main brand mark for Rajshahi University Islamic Library.',
    recommendedDimensions: '512x512 px (PNG or SVG with transparency)',
    aspectRatio: '1:1',
    defaultUrl: '/logo/Version 3- Multi transparent.png',
    org: 'RUIL',
  },
  {
    key: 'ruil_logo_dark',
    label: 'Dark Mode Brand Logo (RUIL)',
    section: 'Branding & Identity',
    description: 'Logo displayed against dark backgrounds and dark-theme navbar.',
    recommendedDimensions: '512x512 px (White/transparent PNG or SVG)',
    aspectRatio: '1:1',
    defaultUrl: '/logo/white-version.png',
    org: 'RUIL',
  },
  {
    key: 'rudc_logo',
    label: 'RUDC Circle Emblem',
    section: 'Branding & Identity',
    description: 'Official crest of Rajshahi University Dawah Circle.',
    recommendedDimensions: '512x512 px (Square vector or transparent PNG)',
    aspectRatio: '1:1',
    defaultUrl: 'https://res.cloudinary.com/ruil/image/upload/v1/ruil-library/assets/rudc_logo.png',
    org: 'RUDC',
  },
  {
    key: 'hero_banner',
    label: 'Homepage Hero Panorama',
    section: 'Hero & Banners',
    description: 'High-impact panoramic backdrop rendered in the main home portal banner.',
    recommendedDimensions: '1920x1080 px or 1600x900 px (Landscape)',
    aspectRatio: '16:9',
    defaultUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1600&auto=format&fit=crop',
    org: 'RUIL',
  },
  {
    key: 'gallery_header_banner',
    label: 'Gallery Header Banner',
    section: 'Hero & Banners',
    description: 'Scenic visual backdrop banner for the public Gallery & Archives showcase.',
    recommendedDimensions: '1920x600 px (Ultra-wide)',
    aspectRatio: '3:1',
    defaultUrl: 'https://images.unsplash.com/photo-1507842229451-7f01be7fe82a?q=80&w=1600&auto=format&fit=crop',
    org: 'RUIL',
  },
  {
    key: 'about_banner',
    label: 'About Us Spotlight Image',
    section: 'Featured Sections',
    description: 'Showcase visual representation of the study hall & library facility on About page.',
    recommendedDimensions: '1200x800 px',
    aspectRatio: '3:2',
    defaultUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1600&auto=format&fit=crop',
    org: 'RUIL',
  },
  {
    key: 'donation_banner',
    label: 'Community Donation Drive Banner',
    section: 'Featured Sections',
    description: 'Call-to-action artwork for the book donation and Waqf campaigns.',
    recommendedDimensions: '1400x600 px',
    aspectRatio: '7:3',
    defaultUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1400&auto=format&fit=crop',
    org: 'RUIL',
  },
  {
    key: 'footer_badge',
    label: 'Footer Accreditation Seal',
    section: 'Footer & Badges',
    description: 'Aesthetic badge or Islamic motif displayed in the footer copyright area.',
    recommendedDimensions: '300x300 px',
    aspectRatio: '1:1',
    defaultUrl: 'https://res.cloudinary.com/ruil/image/upload/v1/ruil-library/assets/seal.png',
    org: 'BOTH',
  },
];
