export interface ProductSpecification {
  title: string;
  content: string;
}

export interface Product {
  id: bigint;
  slug: string;
  name: string;
  nameEn?: string | null;
  categoryId: bigint;
  image: string;
  images?: string[] | null;
  featured?: boolean | null;
  registrationNumber?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  specifications: any; // Prisma returns JsonValue, frontend expects array
  specificationsEn?: any; // English override; falls back to `specifications` when empty
}

export interface Category {
  id: bigint;
  name: string;
  nameEn?: string | null;
  slug: string;
}

export interface Article {
  id: bigint;
  slug: string;
  title: string;
  titleEn?: string | null;
  category: string;
  animalTag?: string | null;
  publishDate: string;
  thumbnail: string;
  excerpt: string;
  excerptEn?: string | null;
  content: string;
  contentEn?: string | null;
  featured?: boolean | null;
  isDraft?: boolean | null;
}

export type ArticleSummary = Omit<Article, 'content' | 'contentEn'>;
export type ProductSummary = Omit<Product, 'description' | 'descriptionEn'>;

export interface Job {
  id: bigint;
  slug: string;
  title: string;
  titleEn?: string | null;
  location: string;
  locationEn?: string | null;
  date: string;
  description: string;
  descriptionEn?: string | null;
  status?: string | null;
}

export type JobSummary = Omit<Job, 'description'>;

export interface Banner {
  id: bigint;
  image: string;
  title: string;
  titleEn?: string | null;
  link: string;
  status: boolean;
  order: number;
}

export interface NavMenu {
  id: bigint;
  name: string;
  nameEn?: string | null;
  link: string;
  parent: bigint | null;
  position: string;
  order: number;
  status: boolean;
  hasMega?: boolean | null;
  isButton?: boolean | null;
}

export interface AboutPageContent {
  gioiThieu?: {
    title?: string;
    paragraph1?: string;
    paragraph2?: string;
    stat1Number?: string;
    stat1Label?: string;
    stat2Number?: string;
    stat2Label?: string;
  };
  lichSu?: {
    title?: string;
    intro?: string;
    timeline?: { year: string; text: string }[];
  };
  tamNhin?: {
    visionTitle?: string;
    visionText?: string;
    missionTitle?: string;
    missionText?: string;
    quoteText?: string;
    quoteAuthor?: string;
    quoteRole?: string;
  };
  coSo?: {
    title?: string;
    intro?: string;
    cardTitle?: string;
    cardText?: string;
    stats?: { number: string; label: string }[];
  };
  coCau?: {
    title?: string;
    intro?: string;
    roles?: string[];
    quoteText?: string;
  };
  thanhTuu?: {
    heading?: string;
    title?: string;
    images?: ({ url: string; title?: string; subtitle?: string } | string)[];
  };
}

export interface Setting {
  hotline1?: string | null;
  hotline2?: string | null;
  email?: string | null;
  address?: string | null;
  intro_slogan?: string | null;
  social?: any;
  /** Vietnamese (canonical) About page content. */
  aboutPage?: AboutPageContent;
  /** English About page content (edited independently in the admin). */
  aboutPageEn?: AboutPageContent;
}

export interface AnimalTag {
  id: bigint;
  name: string;
  nameEn?: string | null;
  slug: string;
  icon: string;
  description: string;
  descriptionEn?: string | null;
}
