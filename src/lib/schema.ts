/**
 * JSON-LD Schema Helpers for SEO
 * Provides structured data markup for search engines
 */

const BASE_URL = "https://binovet.com.vn";

/**
 * Organization Schema
 */
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": BASE_URL,
  name: "BINOVET",
  alternateName: "binovet",
  description: "Tiên phong sản xuất dược thú y công nghệ USA tại Việt Nam",
  url: BASE_URL,
  logo: `${BASE_URL}/images/logo.png`,
  image: `${BASE_URL}/images/about.svg`,
  sameAs: [
    "https://www.facebook.com/binovet",
    "https://www.youtube.com/binovet",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Support",
    telephone: "+84-xxx-xxx-xxx",
    email: "contact@binovet.com.vn",
  },
  areaServed: "VN",
  knowsAbout: ["Veterinary Medicine", "Animal Husbandry", "Livestock", "Pharmaceutical"],
  founder: {
    "@type": "Organization",
    name: "BINOVET",
  },
};

/**
 * Breadcrumb Schema
 */
export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Article Schema
 */
export function articleSchema(article: {
  title: string;
  description: string;
  content?: string;
  image?: string;
  author?: string;
  publishDate: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${BASE_URL}/bai-viet/${article.slug}`,
    headline: article.title,
    description: article.description,
    image: article.image || `${BASE_URL}/images/default-article.svg`,
    datePublished: article.publishDate,
    dateModified: article.publishDate,
    author: {
      "@type": "Organization",
      name: article.author || "binovet Editorial Team",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "BINOVET",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/bai-viet/${article.slug}`,
    },
  };
}

/**
 * Product Schema
 */
export function productSchema(product: {
  id: string;
  name: string;
  description?: string;
  image?: string;
  price?: number;
  slug: string;
  category?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${BASE_URL}/san-pham/${product.slug}`,
    name: product.name,
    description: product.description || product.name,
    image: product.image || `${BASE_URL}/images/default-product.svg`,
    manufacturer: {
      "@type": "Organization",
      name: "BINOVET",
      url: BASE_URL,
    },
    category: product.category || "Veterinary Medicine",
    url: `${BASE_URL}/san-pham/${product.slug}`,
  };
}

/**
 * FAQ Schema
 */
export function faqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Local Business Schema
 */
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": BASE_URL,
  name: "BINOVET",
  image: `${BASE_URL}/images/logo.png`,
  description: "Nhà máy sản xuất dược thú y đạt chuẩn GMP-WHO",
  url: BASE_URL,
  telephone: "+84-xxx-xxx-xxx",
  address: {
    "@type": "PostalAddress",
    addressCountry: "VN",
    addressRegion: "Vietnam",
  },
  sameAs: [
    "https://www.facebook.com/binovet",
    "https://www.youtube.com/binovet",
  ],
};

/**
 * Schema.org markup component helper
 */
export function getSchemaMarkup(schema: any) {
  return `
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(${JSON.stringify(schema)}),
      }}
    />
  `;
}
