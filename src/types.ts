export type DetailItem = {
  title: string;
  description: string;
};

export type ServiceDetail = {
  id: string;
  name: string;
  path: string;
  summary: string;
  heroIntro: string;
  highlights: string[];
  prestations: DetailItem[];
  cases: DetailItem[];
  engagements: DetailItem[];
  steps: DetailItem[];
  faqIds: string[];
};

export type ProjectItem = {
  id: string;
  title: string;
  area: string;
  service: string;
  badge: string;
  description: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type ServiceFaqGroup = {
  key: string;
  items: FaqItem[];
};

export type NavItem = {
  label: string;
  path: string;
};

export type ServiceSummary = {
  id: string;
  name: string;
  path: string;
  summary: string;
  keywords: string[];
};

export type ZoneConfig = {
  center: {
    lat: number;
    lng: number;
  };
  radiusKm: number;
  communes: string[];
};

export type SiteConfig = {
  siteUrl: string;
  trailingSlash: boolean;
  companyName: string;
  baseline: string;
  phone: string;
  email: string;
  address: string;
  zone: string;
  legal: {
    mentionsPath: string;
    privacyPath: string;
  };
  defaultSeo: {
    title: string;
    description: string;
  };
};

export type PageMeta = {
  title: string;
  description: string;
  path: string;
  robots?: string;
};

export type PageMetaEntry = {
  key: string;
  value: PageMeta;
};

export type SiteData = {
  navItems: NavItem[];
  services: ServiceSummary[];
  zoneConfig: ZoneConfig;
  siteConfig: SiteConfig;
  pageMeta: PageMetaEntry[];
};
