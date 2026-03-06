import { useEffect, useMemo, useRef, useState } from 'react';
import {
  initialGeneralFaqs,
  initialProjects,
  initialServiceDetails,
  initialServiceFaqs,
  initialSiteData
} from './data';
import type {
  DetailItem,
  FaqItem,
  NavItem,
  PageMeta,
  PageMetaEntry,
  ProjectItem,
  ServiceDetail,
  ServiceFaqGroup,
  ServiceSummary,
  SiteConfig,
  SiteData
} from './types';

const sectionClasses = 'rounded-xl bg-white/80 backdrop-blur border border-sand-200 p-6 shadow-soft';

type TabId = 'services' | 'projects' | 'faqs' | 'site';

type RawValue = {
  __raw: string;
};

const raw = (code: string): RawValue => ({ __raw: code });

const isRaw = (value: unknown): value is RawValue =>
  typeof value === 'object' && value !== null && '__raw' in value;

const escapeString = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');

const formatKey = (key: string) => (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : `'${escapeString(key)}'`);

const toTs = (value: unknown, indent = 0): string => {
  if (isRaw(value)) {
    return value.__raw;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value
      .map((item) => `${'  '.repeat(indent + 1)}${toTs(item, indent + 1)}`)
      .join(',\n');
    return `[\n${items}\n${'  '.repeat(indent)}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    const content = entries
      .map(([key, val]) => `${'  '.repeat(indent + 1)}${formatKey(key)}: ${toTs(val, indent + 1)}`)
      .join(',\n');
    return `{\n${content}\n${'  '.repeat(indent)}}`;
  }

  if (typeof value === 'string') return `'${escapeString(value)}'`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value === null) return 'null';
  return 'undefined';
};

const buildServicesTs = (serviceDetails: ServiceDetail[]) => {
  return [
    "import { ServiceDetail } from '@/types/content';",
    '',
    `export const serviceDetails: ServiceDetail[] = ${toTs(serviceDetails)};`,
    ''
  ].join('\n');
};

const buildProjectsTs = (projects: ProjectItem[]) => {
  return [
    "import { ProjectItem } from '@/types/content';",
    '',
    `export const projects: ProjectItem[] = ${toTs(projects)};`,
    ''
  ].join('\n');
};

const buildFaqsTs = (generalFaqs: FaqItem[], serviceFaqs: ServiceFaqGroup[]) => {
  const serviceFaqsRecord = serviceFaqs.reduce<Record<string, FaqItem[]>>((acc, group) => {
    acc[group.key] = group.items;
    return acc;
  }, {});

  return [
    "import { FaqItem } from '@/types/content';",
    '',
    `export const generalFaqs: FaqItem[] = ${toTs(generalFaqs)};`,
    '',
    `export const serviceFaqs: Record<string, FaqItem[]> = ${toTs(serviceFaqsRecord)};`,
    ''
  ].join('\n');
};

const buildSiteTs = (siteData: SiteData) => {
  const pageMetaRecord = siteData.pageMeta.reduce<Record<string, PageMeta>>((acc, entry) => {
    const { robots, ...rest } = entry.value;
    acc[entry.key] = robots ? { ...rest, robots } : rest;
    return acc;
  }, {});

  const siteConfigOutput: SiteConfig & { nav: RawValue; services: RawValue } = {
    ...siteData.siteConfig,
    nav: raw('navItems'),
    services: raw('services')
  };

  return [
    "import type { NavItem, PageMeta, Service, SiteConfig } from '@/types/config';",
    "import type { ZoneConfig } from '@/types/content';",
    '',
    `export const navItems: NavItem[] = ${toTs(siteData.navItems)};`,
    '',
    `export const services: Service[] = ${toTs(siteData.services)};`,
    '',
    `export const zoneConfig: ZoneConfig = ${toTs(siteData.zoneConfig)};`,
    '',
    `export const siteConfig: SiteConfig = ${toTs(siteConfigOutput)};`,
    '',
    `export const pageMeta: Record<string, PageMeta> = ${toTs(pageMetaRecord)};`,
    ''
  ].join('\n');
};

const clampIndex = (index: number, length: number) => {
  if (length <= 0) return 0;
  return Math.min(Math.max(index, 0), length - 1);
};

const areStringArraysEqual = (first: string[], second: string[]) => {
  if (first.length !== second.length) return false;
  return first.every((value, index) => value === second[index]);
};

const syncSiteWithServices = (prev: SiteData, serviceDetails: ServiceDetail[]): SiteData => {
  const summaryById = new Map(prev.services.map((service) => [service.id, service]));

  const nextServices = serviceDetails.map((detail, index) => {
    const fallback = prev.services[index];
    const existing = summaryById.get(detail.id) ?? fallback;
    return {
      id: detail.id,
      name: detail.name,
      path: detail.path,
      summary: existing?.summary ?? detail.summary,
      keywords: existing?.keywords ?? []
    };
  });

  const servicePaths = new Set([
    ...serviceDetails.map((detail) => detail.path),
    ...prev.services.map((service) => service.path)
  ]);
  const nonServiceNav = prev.navItems.filter((item) => !servicePaths.has(item.path));
  const serviceNavItems = serviceDetails.map((detail) => ({ label: detail.name, path: detail.path }));
  const homeIndex = nonServiceNav.findIndex((item) => item.path === '/');
  const insertAt = homeIndex === -1 ? 0 : homeIndex + 1;
  const nextNavItems = [
    ...nonServiceNav.slice(0, insertAt),
    ...serviceNavItems,
    ...nonServiceNav.slice(insertAt)
  ];

  return {
    ...prev,
    services: nextServices,
    navItems: nextNavItems
  };
};

const syncFaqsWithServices = (prev: ServiceFaqGroup[], serviceDetails: ServiceDetail[]) => {
  const byKey = new Map(prev.map((group) => [group.key, group]));

  return serviceDetails.map((detail, index) => {
    const existing = byKey.get(detail.id);
    if (existing) return existing;
    const fallback = prev[index];
    if (fallback) return { ...fallback, key: detail.id };
    return { key: detail.id, items: [] };
  });
};

const createEmptyDetailService = (index: number): ServiceDetail => ({
  id: `nouveau-service-${index}`,
  name: 'Nouveau service',
  path: `/nouveau-service-${index}`,
  summary: '',
  heroIntro: '',
  highlights: [],
  prestations: [],
  cases: [],
  engagements: [],
  steps: [],
  faqIds: []
});

const createEmptyProject = (index: number): ProjectItem => ({
  id: `nouveau-projet-${index}`,
  title: 'Nouveau projet',
  area: '',
  service: '',
  badge: '',
  description: ''
});

const createEmptyFaqItem = (index: number): FaqItem => ({
  id: `nouvelle-faq-${index}`,
  question: '',
  answer: ''
});

const createEmptyPageMeta = (index: number): PageMetaEntry => ({
  key: `page-${index}`,
  value: {
    title: '',
    description: '',
    path: ''
  }
});

const createEmptyNavItem = (index: number): NavItem => ({
  label: `Lien ${index}`,
  path: '/nouveau-lien'
});

type FaqGroupSelection = { type: 'general' } | { type: 'service'; key: string };

type OutputConfig = {
  title: string;
  content: string;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('services');

  const [serviceDetails, setServiceDetails] = useState<ServiceDetail[]>(initialServiceDetails);
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [generalFaqs, setGeneralFaqs] = useState<FaqItem[]>(initialGeneralFaqs);
  const [serviceFaqs, setServiceFaqs] = useState<ServiceFaqGroup[]>(initialServiceFaqs);
  const [siteData, setSiteData] = useState<SiteData>(initialSiteData);

  const [selectedDetailIndex, setSelectedDetailIndex] = useState(0);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const [selectedFaqGroup, setSelectedFaqGroup] = useState<FaqGroupSelection>({ type: 'general' });
  const [selectedSiteServiceIndex, setSelectedSiteServiceIndex] = useState(0);
  const [selectedPageMetaIndex, setSelectedPageMetaIndex] = useState(0);
  const [copiedTab, setCopiedTab] = useState<TabId | null>(null);

  const previousServiceDetails = useRef<ServiceDetail[]>(serviceDetails);

  useEffect(() => {
    setSiteData((prev) => syncSiteWithServices(prev, serviceDetails));
    setServiceFaqs((prev) => {
      const next = syncFaqsWithServices(prev, serviceDetails);
      const isSame = next.length === prev.length && next.every((group, index) => group === prev[index]);
      return isSame ? prev : next;
    });
    setSelectedDetailIndex((prev) => clampIndex(prev, serviceDetails.length));
    setSelectedSiteServiceIndex((prev) => clampIndex(prev, serviceDetails.length));
    setSelectedFaqGroup((prev) => {
      if (prev.type === 'general') return prev;
      const exists = serviceDetails.some((detail) => detail.id === prev.key);
      if (exists) return prev;
      const fallback = serviceDetails[selectedDetailIndex];
      if (fallback) return { type: 'service', key: fallback.id };
      return { type: 'general' };
    });
  }, [serviceDetails, selectedDetailIndex]);

  useEffect(() => {
    const prev = previousServiceDetails.current;
    if (prev === serviceDetails) return;

    const nameMap = new Map<string, string>();
    serviceDetails.forEach((detail) => {
      const previous = prev.find((item) => item.id === detail.id);
      if (previous && previous.name !== detail.name) {
        nameMap.set(previous.name, detail.name);
      }
    });

    if (nameMap.size > 0) {
      setProjects((prevProjects) =>
        prevProjects.map((project) => {
          const nextName = nameMap.get(project.service);
          return nextName ? { ...project, service: nextName } : project;
        })
      );
    }

    previousServiceDetails.current = serviceDetails;
  }, [serviceDetails]);

  useEffect(() => {
    setServiceDetails((prev) => {
      let changed = false;
      const next = prev.map((detail) => {
        const group = serviceFaqs.find((entry) => entry.key === detail.id);
        if (!group) return detail;
        const nextIds = group.items.map((item) => item.id);
        if (areStringArraysEqual(nextIds, detail.faqIds)) return detail;
        changed = true;
        return { ...detail, faqIds: nextIds };
      });
      return changed ? next : prev;
    });
  }, [serviceFaqs]);

  const servicesOutput = useMemo(() => buildServicesTs(serviceDetails), [serviceDetails]);
  const projectsOutput = useMemo(() => buildProjectsTs(projects), [projects]);
  const faqsOutput = useMemo(() => buildFaqsTs(generalFaqs, serviceFaqs), [generalFaqs, serviceFaqs]);
  const siteOutput = useMemo(() => buildSiteTs(siteData), [siteData]);

  const outputConfig: Record<TabId, OutputConfig> = {
    services: { title: 'services.ts', content: servicesOutput },
    projects: { title: 'projects.ts', content: projectsOutput },
    faqs: { title: 'faqs.ts', content: faqsOutput },
    site: { title: 'site.ts', content: siteOutput }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(outputConfig[activeTab].content);
    setCopiedTab(activeTab);
    window.setTimeout(() => setCopiedTab(null), 2000);
  };

  const selectedServiceDetail = serviceDetails[selectedDetailIndex] ?? serviceDetails[0];
  const selectedProject = projects[selectedProjectIndex] ?? projects[0];
  const selectedSiteService = siteData.services[selectedSiteServiceIndex] ?? siteData.services[0];
  const selectedPageMeta = siteData.pageMeta[selectedPageMetaIndex] ?? siteData.pageMeta[0];

  const updateServiceDetail = (patch: Partial<ServiceDetail>) => {
    setServiceDetails((prev) =>
      prev.map((service, index) => (index === selectedDetailIndex ? { ...service, ...patch } : service))
    );
  };

  const updateServiceDetailList = (
    field: keyof ServiceDetail,
    index: number,
    key: keyof DetailItem,
    value: string
  ) => {
    const list = [...(selectedServiceDetail[field] as DetailItem[])];
    list[index] = { ...list[index], [key]: value };
    updateServiceDetail({ [field]: list } as Partial<ServiceDetail>);
  };

  const updateServiceDetailStringList = (field: keyof ServiceDetail, index: number, value: string) => {
    const list = [...(selectedServiceDetail[field] as string[])];
    list[index] = value;
    updateServiceDetail({ [field]: list } as Partial<ServiceDetail>);
  };

  const addServiceDetailStringItem = (field: keyof ServiceDetail) => {
    const list = [...(selectedServiceDetail[field] as string[]), ''];
    updateServiceDetail({ [field]: list } as Partial<ServiceDetail>);
  };

  const removeServiceDetailStringItem = (field: keyof ServiceDetail, index: number) => {
    const list = (selectedServiceDetail[field] as string[]).filter((_, idx) => idx !== index);
    updateServiceDetail({ [field]: list } as Partial<ServiceDetail>);
  };

  const addServiceDetailItem = (field: keyof ServiceDetail) => {
    const list = [...(selectedServiceDetail[field] as DetailItem[]), { title: '', description: '' }];
    updateServiceDetail({ [field]: list } as Partial<ServiceDetail>);
  };

  const removeServiceDetailItem = (field: keyof ServiceDetail, index: number) => {
    const list = (selectedServiceDetail[field] as DetailItem[]).filter((_, idx) => idx !== index);
    updateServiceDetail({ [field]: list } as Partial<ServiceDetail>);
  };

  const addServiceDetail = () => {
    setServiceDetails((prev) => {
      const next = [...prev, createEmptyDetailService(prev.length + 1)];
      setSelectedDetailIndex(next.length - 1);
      return next;
    });
  };

  const removeServiceDetail = (index: number) => {
    if (serviceDetails.length === 1) return;
    setServiceDetails((prev) => prev.filter((_, idx) => idx !== index));
    setSelectedDetailIndex((prevIndex) => {
      if (prevIndex === index) return Math.max(0, index - 1);
      return prevIndex > index ? prevIndex - 1 : prevIndex;
    });
  };

  const updateProject = (patch: Partial<ProjectItem>) => {
    setProjects((prev) =>
      prev.map((project, index) => (index === selectedProjectIndex ? { ...project, ...patch } : project))
    );
  };

  const addProject = () => {
    setProjects((prev) => {
      const next = [...prev, createEmptyProject(prev.length + 1)];
      setSelectedProjectIndex(next.length - 1);
      return next;
    });
  };

  const removeProject = (index: number) => {
    if (projects.length === 1) return;
    setProjects((prev) => prev.filter((_, idx) => idx !== index));
    setSelectedProjectIndex((prevIndex) => {
      if (prevIndex === index) return Math.max(0, index - 1);
      return prevIndex > index ? prevIndex - 1 : prevIndex;
    });
  };

  const addFaqItem = (group: FaqGroupSelection) => {
    if (group.type === 'general') {
      setGeneralFaqs((prev) => [...prev, createEmptyFaqItem(prev.length + 1)]);
      return;
    }
    setServiceFaqs((prev) =>
      prev.map((entry) =>
        entry.key === group.key
          ? { ...entry, items: [...entry.items, createEmptyFaqItem(entry.items.length + 1)] }
          : entry
      )
    );
  };

  const updateFaqItem = (
    group: FaqGroupSelection,
    index: number,
    key: keyof FaqItem,
    value: string
  ) => {
    if (group.type === 'general') {
      setGeneralFaqs((prev) => prev.map((item, idx) => (idx === index ? { ...item, [key]: value } : item)));
      return;
    }
    setServiceFaqs((prev) =>
      prev.map((entry) =>
        entry.key === group.key
          ? {
              ...entry,
              items: entry.items.map((item, idx) => (idx === index ? { ...item, [key]: value } : item))
            }
          : entry
      )
    );
  };

  const removeFaqItem = (group: FaqGroupSelection, index: number) => {
    if (group.type === 'general') {
      setGeneralFaqs((prev) => prev.filter((_, idx) => idx !== index));
      return;
    }
    setServiceFaqs((prev) =>
      prev.map((entry) =>
        entry.key === group.key ? { ...entry, items: entry.items.filter((_, idx) => idx !== index) } : entry
      )
    );
  };

  const updateSiteNavItem = (index: number, patch: Partial<NavItem>) => {
    const currentItem = siteData.navItems[index];
    const serviceIndex = serviceDetails.findIndex((detail) => detail.path === currentItem?.path);

    if (serviceIndex !== -1) {
      const detailPatch: Partial<ServiceDetail> = {};
      if (patch.label !== undefined) detailPatch.name = patch.label;
      if (patch.path !== undefined) detailPatch.path = patch.path;
      setSiteData((prev) => {
        const navItems = prev.navItems.map((item, idx) => (idx === index ? { ...item, ...patch } : item));
        return { ...prev, navItems };
      });
      if (Object.keys(detailPatch).length > 0) {
        setServiceDetails((prev) =>
          prev.map((detail, idx) => (idx === serviceIndex ? { ...detail, ...detailPatch } : detail))
        );
      }
      return;
    }

    setSiteData((prev) => {
      const navItems = prev.navItems.map((item, idx) => (idx === index ? { ...item, ...patch } : item));
      return { ...prev, navItems };
    });
  };

  const isLinkedNavItem = (item: NavItem) => serviceDetails.some((detail) => detail.path === item.path);

  const addSiteNavItem = () => {
    setSiteData((prev) => ({
      ...prev,
      navItems: [...prev.navItems, createEmptyNavItem(prev.navItems.length + 1)]
    }));
  };

  const removeSiteNavItem = (index: number) => {
    const currentItem = siteData.navItems[index];
    const isLinked = serviceDetails.some((detail) => detail.path === currentItem?.path);
    if (isLinked) return;
    setSiteData((prev) => ({
      ...prev,
      navItems: prev.navItems.filter((_, idx) => idx !== index)
    }));
  };

  const updateSiteService = (patch: Partial<ServiceSummary>) => {
    const { id, name, path, summary, keywords } = patch;
    if (id !== undefined || name !== undefined || path !== undefined || summary !== undefined || keywords !== undefined) {
      setSiteData((prev) => {
        const services = prev.services.map((service, idx) =>
          idx === selectedSiteServiceIndex
            ? {
                ...service,
                ...(id !== undefined ? { id } : {}),
                ...(name !== undefined ? { name } : {}),
                ...(path !== undefined ? { path } : {}),
                ...(summary !== undefined ? { summary } : {}),
                ...(keywords !== undefined ? { keywords } : {})
              }
            : service
        );
        return { ...prev, services };
      });
    }

    if (id !== undefined || name !== undefined || path !== undefined) {
      setServiceDetails((prev) =>
        prev.map((detail, idx) =>
          idx === selectedSiteServiceIndex
            ? {
                ...detail,
                ...(id !== undefined ? { id } : {}),
                ...(name !== undefined ? { name } : {}),
                ...(path !== undefined ? { path } : {})
              }
            : detail
        )
      );
    }
  };

  const updateSiteServiceKeywords = (index: number, value: string) => {
    const keywords = [...selectedSiteService.keywords];
    keywords[index] = value;
    updateSiteService({ keywords });
  };

  const addSiteServiceKeyword = () => {
    const keywords = [...selectedSiteService.keywords, ''];
    updateSiteService({ keywords });
  };

  const removeSiteServiceKeyword = (index: number) => {
    const keywords = selectedSiteService.keywords.filter((_, idx) => idx !== index);
    updateSiteService({ keywords });
  };

  const addSiteService = () => {
    setServiceDetails((prev) => {
      const next = [...prev, createEmptyDetailService(prev.length + 1)];
      setSelectedDetailIndex(next.length - 1);
      setSelectedSiteServiceIndex(next.length - 1);
      return next;
    });
  };

  const removeSiteService = (index: number) => {
    removeServiceDetail(index);
  };

  const updateSiteZone = (patch: Partial<SiteData['zoneConfig']>) => {
    setSiteData((prev) => ({
      ...prev,
      zoneConfig: { ...prev.zoneConfig, ...patch }
    }));
  };

  const updateSiteZoneCenter = (key: 'lat' | 'lng', value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    setSiteData((prev) => ({
      ...prev,
      zoneConfig: {
        ...prev.zoneConfig,
        center: { ...prev.zoneConfig.center, [key]: parsed }
      }
    }));
  };

  const updateSiteZoneRadius = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    updateSiteZone({ radiusKm: parsed });
  };

  const updateSiteCommune = (index: number, value: string) => {
    setSiteData((prev) => {
      const communes = [...prev.zoneConfig.communes];
      communes[index] = value;
      return { ...prev, zoneConfig: { ...prev.zoneConfig, communes } };
    });
  };

  const addSiteCommune = () => {
    setSiteData((prev) => ({
      ...prev,
      zoneConfig: { ...prev.zoneConfig, communes: [...prev.zoneConfig.communes, ''] }
    }));
  };

  const removeSiteCommune = (index: number) => {
    setSiteData((prev) => ({
      ...prev,
      zoneConfig: { ...prev.zoneConfig, communes: prev.zoneConfig.communes.filter((_, idx) => idx !== index) }
    }));
  };

  const updateSiteConfig = (patch: Partial<SiteConfig>) => {
    setSiteData((prev) => ({
      ...prev,
      siteConfig: { ...prev.siteConfig, ...patch }
    }));
  };

  const updateSiteLegal = (patch: Partial<SiteConfig['legal']>) => {
    setSiteData((prev) => ({
      ...prev,
      siteConfig: {
        ...prev.siteConfig,
        legal: { ...prev.siteConfig.legal, ...patch }
      }
    }));
  };

  const updateSiteSeo = (patch: Partial<SiteConfig['defaultSeo']>) => {
    setSiteData((prev) => ({
      ...prev,
      siteConfig: {
        ...prev.siteConfig,
        defaultSeo: { ...prev.siteConfig.defaultSeo, ...patch }
      }
    }));
  };

  const updatePageMetaEntry = (patch: Partial<PageMetaEntry>) => {
    setSiteData((prev) => {
      const pageMeta = prev.pageMeta.map((entry, idx) =>
        idx === selectedPageMetaIndex ? { ...entry, ...patch } : entry
      );
      return { ...prev, pageMeta };
    });
  };

  const updatePageMetaValue = (patch: Partial<PageMeta>) => {
    setSiteData((prev) => {
      const pageMeta = prev.pageMeta.map((entry, idx) =>
        idx === selectedPageMetaIndex ? { ...entry, value: { ...entry.value, ...patch } } : entry
      );
      return { ...prev, pageMeta };
    });
  };

  const addPageMetaEntry = () => {
    setSiteData((prev) => {
      const pageMeta = [...prev.pageMeta, createEmptyPageMeta(prev.pageMeta.length + 1)];
      setSelectedPageMetaIndex(pageMeta.length - 1);
      return { ...prev, pageMeta };
    });
  };

  const removePageMetaEntry = (index: number) => {
    if (siteData.pageMeta.length === 1) return;
    setSiteData((prev) => ({
      ...prev,
      pageMeta: prev.pageMeta.filter((_, idx) => idx !== index)
    }));
    setSelectedPageMetaIndex((prevIndex) => {
      if (prevIndex === index) return Math.max(0, index - 1);
      return prevIndex > index ? prevIndex - 1 : prevIndex;
    });
  };

  const faqGroups = [
    { label: 'Général', selection: { type: 'general' as const } },
    ...serviceDetails.map((detail) => ({
      label: detail.name || detail.id,
      selection: { type: 'service' as const, key: detail.id }
    }))
  ];

  const selectedFaqItems =
    selectedFaqGroup.type === 'general'
      ? generalFaqs
      : serviceFaqs.find((group) => group.key === selectedFaqGroup.key)?.items ?? [];

  return (
    <div className="min-h-screen bg-sand-50 text-ink-900 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-teal-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-[-10%] h-80 w-80 rounded-full bg-clay-500/15 blur-3xl" />

      <header className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-6">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-teal-600 font-semibold">NeoChaleur Studio</p>
          <h1 className="text-4xl md:text-5xl font-display font-semibold leading-tight">
            Éditeur de contenus, exports TS prêts à l’emploi
          </h1>
          <p className="max-w-2xl text-lg text-ink-700">
            Modifiez vos contenus (services, projets, FAQ, configuration du site) via une interface claire, puis
            copiez directement les fichiers TypeScript dans votre projet.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {([
            { id: 'services', label: 'Services détaillés' },
            { id: 'projects', label: 'Projects' },
            { id: 'faqs', label: 'FAQs' },
            { id: 'site', label: 'Site' }
          ] as { id: TabId; label: string }[]).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'border-teal-600 bg-teal-600 text-white'
                  : 'border-sand-200 text-ink-700 hover:border-teal-600 hover:text-teal-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pb-16 grid lg:grid-cols-[1.5fr_1fr] gap-8">
        <section className="space-y-6 animate-floatIn">
          {activeTab === 'services' && (
            <>
              <div className={sectionClasses}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-ink-700">Services</p>
                    <h2 className="text-2xl font-display font-semibold">Fiches détaillées</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-ink-700">{serviceDetails.length} fiches</p>
                    <button
                      type="button"
                      onClick={addServiceDetail}
                      className="rounded-full border border-teal-600 px-4 py-1.5 text-xs font-semibold text-teal-600 hover:bg-teal-600 hover:text-white transition"
                    >
                      + Ajouter
                    </button>
                  </div>
                </div>
                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  {serviceDetails.map((service, index) => (
                    <button
                      type="button"
                      key={`${service.id}-${index}`}
                      onClick={() => setSelectedDetailIndex(index)}
                      className={`text-left rounded-xl border px-4 py-3 transition shadow-inset ${
                        index === selectedDetailIndex
                          ? 'border-teal-500 bg-teal-500/10'
                          : 'border-sand-200 hover:border-teal-500/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink-900">{service.name || 'Service sans nom'}</p>
                          <p className="text-xs text-ink-700">{service.path || '/...'}</p>
                        </div>
                        {serviceDetails.length > 1 && (
                          <span
                            onClick={(event) => {
                              event.stopPropagation();
                              removeServiceDetail(index);
                            }}
                            className="text-xs text-clay-600 hover:text-clay-500"
                          >
                            Supprimer
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-ink-700 line-clamp-2">
                        {service.summary || 'Résumé à compléter.'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className={sectionClasses}>
                <h3 className="text-xl font-display font-semibold">Informations principales</h3>
                <div className="mt-4 grid gap-4">
                  <Field
                    label="Identifiant"
                    value={selectedServiceDetail.id}
                    onChange={(value) => updateServiceDetail({ id: value })}
                  />
                  <Field
                    label="Nom"
                    value={selectedServiceDetail.name}
                    onChange={(value) => updateServiceDetail({ name: value })}
                  />
                  <Field
                    label="Chemin"
                    value={selectedServiceDetail.path}
                    onChange={(value) => updateServiceDetail({ path: value })}
                  />
                  <TextArea
                    label="Résumé"
                    value={selectedServiceDetail.summary}
                    onChange={(value) => updateServiceDetail({ summary: value })}
                  />
                  <TextArea
                    label="Intro hero"
                    value={selectedServiceDetail.heroIntro}
                    onChange={(value) => updateServiceDetail({ heroIntro: value })}
                  />
                </div>
              </div>

              <div className={sectionClasses}>
                <ListHeader title="Highlights" actionLabel="Ajouter" onAction={() => addServiceDetailStringItem('highlights')} />
                <div className="mt-4 space-y-3">
                  {selectedServiceDetail.highlights.length === 0 ? (
                    <EmptyState label="Aucun highlight pour le moment." />
                  ) : (
                    selectedServiceDetail.highlights.map((item, index) => (
                      <EditableRow
                        key={`highlight-${index}`}
                        value={item}
                        placeholder="Ajoutez un point fort"
                        onChange={(value) => updateServiceDetailStringList('highlights', index, value)}
                        onRemove={() => removeServiceDetailStringItem('highlights', index)}
                      />
                    ))
                  )}
                </div>
              </div>

              <DetailSection
                title="Prestations"
                items={selectedServiceDetail.prestations}
                onAdd={() => addServiceDetailItem('prestations')}
                onChange={(index, key, value) => updateServiceDetailList('prestations', index, key, value)}
                onRemove={(index) => removeServiceDetailItem('prestations', index)}
              />

              <DetailSection
                title="Cas clients"
                items={selectedServiceDetail.cases}
                onAdd={() => addServiceDetailItem('cases')}
                onChange={(index, key, value) => updateServiceDetailList('cases', index, key, value)}
                onRemove={(index) => removeServiceDetailItem('cases', index)}
              />

              <DetailSection
                title="Engagements"
                items={selectedServiceDetail.engagements}
                onAdd={() => addServiceDetailItem('engagements')}
                onChange={(index, key, value) => updateServiceDetailList('engagements', index, key, value)}
                onRemove={(index) => removeServiceDetailItem('engagements', index)}
              />

              <DetailSection
                title="Étapes"
                items={selectedServiceDetail.steps}
                onAdd={() => addServiceDetailItem('steps')}
                onChange={(index, key, value) => updateServiceDetailList('steps', index, key, value)}
                onRemove={(index) => removeServiceDetailItem('steps', index)}
              />

              <div className={sectionClasses}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-display font-semibold">FAQ IDs</h3>
                  <span className="text-xs uppercase tracking-[0.25em] text-ink-600">
                    Synchronisé avec les FAQs
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {selectedServiceDetail.faqIds.length === 0 ? (
                    <EmptyState label="Aucun identifiant pour le moment." />
                  ) : (
                    selectedServiceDetail.faqIds.map((item, index) => (
                      <ReadOnlyRow key={`faq-${index}`} value={item} />
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'projects' && (
            <>
              <div className={sectionClasses}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-ink-700">Projects</p>
                    <h2 className="text-2xl font-display font-semibold">Réalisations</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-ink-700">{projects.length} projets</p>
                    <button
                      type="button"
                      onClick={addProject}
                      className="rounded-full border border-teal-600 px-4 py-1.5 text-xs font-semibold text-teal-600 hover:bg-teal-600 hover:text-white transition"
                    >
                      + Ajouter
                    </button>
                  </div>
                </div>
                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  {projects.map((project, index) => (
                    <button
                      key={`${project.id}-${index}`}
                      type="button"
                      onClick={() => setSelectedProjectIndex(index)}
                      className={`text-left rounded-xl border px-4 py-3 transition shadow-inset ${
                        index === selectedProjectIndex
                          ? 'border-teal-500 bg-teal-500/10'
                          : 'border-sand-200 hover:border-teal-500/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink-900">{project.title || 'Projet sans titre'}</p>
                          <p className="text-xs text-ink-700">{project.area || 'Zone à préciser'}</p>
                        </div>
                        {projects.length > 1 && (
                          <span
                            onClick={(event) => {
                              event.stopPropagation();
                              removeProject(index);
                            }}
                            className="text-xs text-clay-600 hover:text-clay-500"
                          >
                            Supprimer
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-ink-700 line-clamp-2">
                        {project.description || 'Description à compléter.'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className={sectionClasses}>
                <h3 className="text-xl font-display font-semibold">Détails du projet</h3>
                <div className="mt-4 grid gap-4">
                  <Field label="Identifiant" value={selectedProject.id} onChange={(value) => updateProject({ id: value })} />
                  <Field label="Titre" value={selectedProject.title} onChange={(value) => updateProject({ title: value })} />
                  <Field label="Zone" value={selectedProject.area} onChange={(value) => updateProject({ area: value })} />
                  <Field label="Service" value={selectedProject.service} onChange={(value) => updateProject({ service: value })} />
                  <Field label="Badge" value={selectedProject.badge} onChange={(value) => updateProject({ badge: value })} />
                  <TextArea
                    label="Description"
                    value={selectedProject.description}
                    onChange={(value) => updateProject({ description: value })}
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'faqs' && (
            <>
              <div className={sectionClasses}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-ink-700">FAQs</p>
                    <h2 className="text-2xl font-display font-semibold">Groupes de questions</h2>
                  </div>
                  <p className="text-sm text-ink-700">Les groupes suivent la liste des services.</p>
                </div>
                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  {faqGroups.map((group) => {
                    const isActive =
                      group.selection.type === 'general'
                        ? selectedFaqGroup.type === 'general'
                        : selectedFaqGroup.type === 'service' && selectedFaqGroup.key === group.selection.key;

                    return (
                      <button
                        key={group.label}
                        type="button"
                        onClick={() => setSelectedFaqGroup(group.selection)}
                        className={`text-left rounded-xl border px-4 py-3 transition shadow-inset ${
                          isActive ? 'border-teal-500 bg-teal-500/10' : 'border-sand-200 hover:border-teal-500/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-ink-900">{group.label}</p>
                            <p className="text-xs text-ink-700">
                              {group.selection.type === 'general' ? 'Questions générales' : 'FAQ service'}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={sectionClasses}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-display font-semibold">
                    {selectedFaqGroup.type === 'general'
                      ? 'FAQ générales'
                      : `FAQ service: ${selectedFaqGroup.key}`}
                  </h3>
                  <button
                    type="button"
                    onClick={() => addFaqItem(selectedFaqGroup)}
                    className="rounded-full border border-ink-700 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-ink-700 hover:bg-ink-900 hover:text-white transition"
                  >
                    Ajouter
                  </button>
                </div>
                <div className="mt-4 space-y-4">
                  {selectedFaqItems.length === 0 ? (
                    <EmptyState label="Aucune FAQ dans ce groupe." />
                  ) : (
                    selectedFaqItems.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="rounded-xl border border-sand-200 bg-white/70 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs uppercase tracking-[0.25em] text-ink-700">FAQ {index + 1}</p>
                          <button
                            type="button"
                            onClick={() => removeFaqItem(selectedFaqGroup, index)}
                            className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-600 hover:text-clay-500"
                          >
                            Retirer
                          </button>
                        </div>
                        <div className="mt-3 grid gap-3">
                          <Field
                            label="Identifiant"
                            value={item.id}
                            onChange={(value) => updateFaqItem(selectedFaqGroup, index, 'id', value)}
                          />
                          <TextArea
                            label="Question"
                            value={item.question}
                            onChange={(value) => updateFaqItem(selectedFaqGroup, index, 'question', value)}
                          />
                          <TextArea
                            label="Réponse"
                            value={item.answer}
                            onChange={(value) => updateFaqItem(selectedFaqGroup, index, 'answer', value)}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'site' && (
            <>
              <div className={sectionClasses}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-ink-700">Navigation</p>
                    <h2 className="text-2xl font-display font-semibold">Menu principal</h2>
                  </div>
                  <button
                    type="button"
                    onClick={addSiteNavItem}
                    className="rounded-full border border-teal-600 px-4 py-1.5 text-xs font-semibold text-teal-600 hover:bg-teal-600 hover:text-white transition"
                  >
                    + Ajouter un lien
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {siteData.navItems.length === 0 ? (
                    <EmptyState label="Aucun lien pour le moment." />
                  ) : (
                    siteData.navItems.map((item, index) => (
                      <TwoFieldRow
                        key={`${item.label}-${index}`}
                        firstLabel="Label"
                        firstValue={item.label}
                        firstPlaceholder="Accueil"
                        onFirstChange={(value) => updateSiteNavItem(index, { label: value })}
                        secondLabel="Path"
                        secondValue={item.path}
                        secondPlaceholder="/"
                        onSecondChange={(value) => updateSiteNavItem(index, { path: value })}
                        onRemove={isLinkedNavItem(item) ? undefined : () => removeSiteNavItem(index)}
                      />
                    ))
                  )}
                </div>
              </div>

              <div className={sectionClasses}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-ink-700">Services</p>
                    <h2 className="text-2xl font-display font-semibold">Résumé des services</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-ink-700">{siteData.services.length} services</p>
                    <button
                      type="button"
                      onClick={addSiteService}
                      className="rounded-full border border-teal-600 px-4 py-1.5 text-xs font-semibold text-teal-600 hover:bg-teal-600 hover:text-white transition"
                    >
                      + Ajouter
                    </button>
                  </div>
                </div>
                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  {siteData.services.map((service, index) => (
                    <button
                      type="button"
                      key={`${service.id}-${index}`}
                      onClick={() => setSelectedSiteServiceIndex(index)}
                      className={`text-left rounded-xl border px-4 py-3 transition shadow-inset ${
                        index === selectedSiteServiceIndex
                          ? 'border-teal-500 bg-teal-500/10'
                          : 'border-sand-200 hover:border-teal-500/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink-900">{service.name || 'Service sans nom'}</p>
                          <p className="text-xs text-ink-700">{service.path || '/...'}</p>
                        </div>
                        {siteData.services.length > 1 && (
                          <span
                            onClick={(event) => {
                              event.stopPropagation();
                              removeSiteService(index);
                            }}
                            className="text-xs text-clay-600 hover:text-clay-500"
                          >
                            Supprimer
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-ink-700 line-clamp-2">
                        {service.summary || 'Résumé à compléter.'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className={sectionClasses}>
                <h3 className="text-xl font-display font-semibold">Service sélectionné</h3>
                <div className="mt-4 grid gap-4">
                  <Field
                    label="Identifiant"
                    value={selectedSiteService.id}
                    onChange={(value) => updateSiteService({ id: value })}
                  />
                  <Field
                    label="Nom"
                    value={selectedSiteService.name}
                    onChange={(value) => updateSiteService({ name: value })}
                  />
                  <Field
                    label="Chemin"
                    value={selectedSiteService.path}
                    onChange={(value) => updateSiteService({ path: value })}
                  />
                  <TextArea
                    label="Résumé"
                    value={selectedSiteService.summary}
                    onChange={(value) => updateSiteService({ summary: value })}
                  />
                  <div>
                    <ListHeader title="Mots-clés" actionLabel="Ajouter" onAction={addSiteServiceKeyword} />
                    <div className="mt-3 space-y-3">
                      {selectedSiteService.keywords.length === 0 ? (
                        <EmptyState label="Aucun mot-clé." />
                      ) : (
                        selectedSiteService.keywords.map((keyword, index) => (
                          <EditableRow
                            key={`keyword-${index}`}
                            value={keyword}
                            placeholder="ex: chaudière"
                            onChange={(value) => updateSiteServiceKeywords(index, value)}
                            onRemove={() => removeSiteServiceKeyword(index)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={sectionClasses}>
                <h3 className="text-xl font-display font-semibold">Zone d’intervention</h3>
                <div className="mt-4 grid gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="grid gap-2 text-sm font-medium text-ink-700">
                      Latitude
                      <input
                        type="number"
                        step="0.000001"
                        className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-base text-ink-900 shadow-inset focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={siteData.zoneConfig.center.lat}
                        onChange={(event) => updateSiteZoneCenter('lat', event.target.value)}
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-ink-700">
                      Longitude
                      <input
                        type="number"
                        step="0.000001"
                        className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-base text-ink-900 shadow-inset focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={siteData.zoneConfig.center.lng}
                        onChange={(event) => updateSiteZoneCenter('lng', event.target.value)}
                      />
                    </label>
                  </div>
                  <label className="grid gap-2 text-sm font-medium text-ink-700">
                    Rayon (km)
                    <input
                      type="number"
                      step="1"
                      className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-base text-ink-900 shadow-inset focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={siteData.zoneConfig.radiusKm}
                      onChange={(event) => updateSiteZoneRadius(event.target.value)}
                    />
                  </label>
                  <div>
                    <ListHeader title="Communes" actionLabel="Ajouter" onAction={addSiteCommune} />
                    <div className="mt-3 space-y-3">
                      {siteData.zoneConfig.communes.length === 0 ? (
                        <EmptyState label="Aucune commune." />
                      ) : (
                        siteData.zoneConfig.communes.map((commune, index) => (
                          <EditableRow
                            key={`commune-${index}`}
                            value={commune}
                            placeholder="Nom de commune"
                            onChange={(value) => updateSiteCommune(index, value)}
                            onRemove={() => removeSiteCommune(index)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={sectionClasses}>
                <h3 className="text-xl font-display font-semibold">Configuration du site</h3>
                <div className="mt-4 grid gap-4">
                  <Field
                    label="URL du site"
                    value={siteData.siteConfig.siteUrl}
                    onChange={(value) => updateSiteConfig({ siteUrl: value })}
                  />
                  <label className="flex items-center justify-between gap-3 rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-ink-700 shadow-inset">
                    Trailing slash
                    <input
                      type="checkbox"
                      checked={siteData.siteConfig.trailingSlash}
                      onChange={(event) => updateSiteConfig({ trailingSlash: event.target.checked })}
                      className="h-5 w-5"
                    />
                  </label>
                  <Field
                    label="Nom de l’entreprise"
                    value={siteData.siteConfig.companyName}
                    onChange={(value) => updateSiteConfig({ companyName: value })}
                  />
                  <Field
                    label="Baseline"
                    value={siteData.siteConfig.baseline}
                    onChange={(value) => updateSiteConfig({ baseline: value })}
                  />
                  <Field
                    label="Téléphone"
                    value={siteData.siteConfig.phone}
                    onChange={(value) => updateSiteConfig({ phone: value })}
                  />
                  <Field
                    label="Email"
                    value={siteData.siteConfig.email}
                    onChange={(value) => updateSiteConfig({ email: value })}
                  />
                  <Field
                    label="Adresse"
                    value={siteData.siteConfig.address}
                    onChange={(value) => updateSiteConfig({ address: value })}
                  />
                  <Field
                    label="Zone"
                    value={siteData.siteConfig.zone}
                    onChange={(value) => updateSiteConfig({ zone: value })}
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field
                      label="Mentions légales"
                      value={siteData.siteConfig.legal.mentionsPath}
                      onChange={(value) => updateSiteLegal({ mentionsPath: value })}
                    />
                    <Field
                      label="Confidentialité"
                      value={siteData.siteConfig.legal.privacyPath}
                      onChange={(value) => updateSiteLegal({ privacyPath: value })}
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-display font-semibold">SEO par défaut</h4>
                    <div className="mt-3 grid gap-3">
                      <Field
                        label="Titre"
                        value={siteData.siteConfig.defaultSeo.title}
                        onChange={(value) => updateSiteSeo({ title: value })}
                      />
                      <TextArea
                        label="Description"
                        value={siteData.siteConfig.defaultSeo.description}
                        onChange={(value) => updateSiteSeo({ description: value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={sectionClasses}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-ink-700">Pages</p>
                    <h2 className="text-2xl font-display font-semibold">Page meta</h2>
                  </div>
                  <button
                    type="button"
                    onClick={addPageMetaEntry}
                    className="rounded-full border border-teal-600 px-4 py-1.5 text-xs font-semibold text-teal-600 hover:bg-teal-600 hover:text-white transition"
                  >
                    + Ajouter une page
                  </button>
                </div>
                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  {siteData.pageMeta.map((entry, index) => (
                    <button
                      type="button"
                      key={`${entry.key}-${index}`}
                      onClick={() => setSelectedPageMetaIndex(index)}
                      className={`text-left rounded-xl border px-4 py-3 transition shadow-inset ${
                        index === selectedPageMetaIndex
                          ? 'border-teal-500 bg-teal-500/10'
                          : 'border-sand-200 hover:border-teal-500/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink-900">{entry.key || 'Page sans clé'}</p>
                          <p className="text-xs text-ink-700">{entry.value.path || '/...'}</p>
                        </div>
                        {siteData.pageMeta.length > 1 && (
                          <span
                            onClick={(event) => {
                              event.stopPropagation();
                              removePageMetaEntry(index);
                            }}
                            className="text-xs text-clay-600 hover:text-clay-500"
                          >
                            Supprimer
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-ink-700 line-clamp-2">
                        {entry.value.description || 'Description à compléter.'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className={sectionClasses}>
                <h3 className="text-xl font-display font-semibold">Page sélectionnée</h3>
                <div className="mt-4 grid gap-4">
                  <Field
                    label="Clé"
                    value={selectedPageMeta.key}
                    onChange={(value) => updatePageMetaEntry({ key: value })}
                  />
                  <Field
                    label="Titre"
                    value={selectedPageMeta.value.title}
                    onChange={(value) => updatePageMetaValue({ title: value })}
                  />
                  <TextArea
                    label="Description"
                    value={selectedPageMeta.value.description}
                    onChange={(value) => updatePageMetaValue({ description: value })}
                  />
                  <Field
                    label="Path"
                    value={selectedPageMeta.value.path}
                    onChange={(value) => updatePageMetaValue({ path: value })}
                  />
                  <Field
                    label="Robots (optionnel)"
                    value={selectedPageMeta.value.robots ?? ''}
                    onChange={(value) => updatePageMetaValue({ robots: value || undefined })}
                  />
                </div>
              </div>
            </>
          )}
        </section>

        <aside className="space-y-6 animate-floatIn">
          <div className={sectionClasses}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-ink-700">Export</p>
                <h2 className="text-2xl font-display font-semibold">{outputConfig[activeTab].title}</h2>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500 transition"
              >
                {copiedTab === activeTab ? 'Copié' : 'Copier'}
              </button>
            </div>
            <p className="mt-3 text-sm text-ink-700">
              Le fichier TypeScript est mis à jour en temps réel. Collez-le directement dans votre repo.
            </p>
            <textarea
              className="mt-4 h-[520px] w-full rounded-xl border border-sand-200 bg-sand-50/80 p-4 font-mono text-xs text-ink-800 shadow-inset focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={outputConfig[activeTab].content}
              readOnly
            />
          </div>
          <div className={sectionClasses}>
            <h3 className="text-lg font-display font-semibold">Conseils rapides</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-700">
              <li>Gardez des identifiants uniques pour éviter les collisions.</li>
              <li>Supprimez les entrées vides avant de copier le fichier.</li>
              <li>Vérifiez les chemins et les clés de page avant publication.</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const Field = ({ label, value, onChange, placeholder }: FieldProps) => (
  <label className="grid gap-2 text-sm font-medium text-ink-700">
    {label}
    <input
      className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-base text-ink-900 shadow-inset focus:outline-none focus:ring-2 focus:ring-teal-500"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  </label>
);

const TextArea = ({ label, value, onChange }: FieldProps) => (
  <label className="grid gap-2 text-sm font-medium text-ink-700">
    {label}
    <textarea
      className="min-h-[110px] rounded-xl border border-sand-200 bg-white px-4 py-3 text-base text-ink-900 shadow-inset focus:outline-none focus:ring-2 focus:ring-teal-500"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  </label>
);

type ListHeaderProps = {
  title: string;
  actionLabel: string;
  onAction: () => void;
};

const ListHeader = ({ title, actionLabel, onAction }: ListHeaderProps) => (
  <div className="flex items-center justify-between gap-3">
    <h3 className="text-xl font-display font-semibold">{title}</h3>
    <button
      type="button"
      onClick={onAction}
      className="rounded-full border border-ink-700 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-ink-700 hover:bg-ink-900 hover:text-white transition"
    >
      {actionLabel}
    </button>
  </div>
);

type EditableRowProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onRemove: () => void;
};

const EditableRow = ({ value, placeholder, onChange, onRemove }: EditableRowProps) => (
  <div className="flex flex-wrap items-center gap-3">
    <input
      className="flex-1 rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm text-ink-900 shadow-inset focus:outline-none focus:ring-2 focus:ring-teal-500"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
    <button
      type="button"
      onClick={onRemove}
      className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-600 hover:text-clay-500"
    >
      Retirer
    </button>
  </div>
);

type ReadOnlyRowProps = {
  value: string;
};

const ReadOnlyRow = ({ value }: ReadOnlyRowProps) => (
  <div className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm text-ink-900 shadow-inset">
    {value || '—'}
  </div>
);

type TwoFieldRowProps = {
  firstLabel: string;
  firstValue: string;
  firstPlaceholder?: string;
  onFirstChange: (value: string) => void;
  secondLabel: string;
  secondValue: string;
  secondPlaceholder?: string;
  onSecondChange: (value: string) => void;
  onRemove?: () => void;
};

const TwoFieldRow = ({
  firstLabel,
  firstValue,
  firstPlaceholder,
  onFirstChange,
  secondLabel,
  secondValue,
  secondPlaceholder,
  onSecondChange,
  onRemove
}: TwoFieldRowProps) => (
  <div
    className={`grid gap-3 rounded-xl border border-sand-200 bg-white/70 p-4 sm:items-end ${
      onRemove ? 'sm:grid-cols-[1fr_1fr_auto]' : 'sm:grid-cols-2'
    }`}
  >
    <label className="grid gap-2 text-sm font-medium text-ink-700">
      {firstLabel}
      <input
        className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm text-ink-900 shadow-inset focus:outline-none focus:ring-2 focus:ring-teal-500"
        value={firstValue}
        placeholder={firstPlaceholder}
        onChange={(event) => onFirstChange(event.target.value)}
      />
    </label>
    <label className="grid gap-2 text-sm font-medium text-ink-700">
      {secondLabel}
      <input
        className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm text-ink-900 shadow-inset focus:outline-none focus:ring-2 focus:ring-teal-500"
        value={secondValue}
        placeholder={secondPlaceholder}
        onChange={(event) => onSecondChange(event.target.value)}
      />
    </label>
    {onRemove && (
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full border border-clay-600 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-clay-600 hover:bg-clay-600 hover:text-white transition"
      >
        Retirer
      </button>
    )}
  </div>
);

type DetailSectionProps = {
  title: string;
  items: DetailItem[];
  onAdd: () => void;
  onChange: (index: number, key: keyof DetailItem, value: string) => void;
  onRemove: (index: number) => void;
};

const DetailSection = ({ title, items, onAdd, onChange, onRemove }: DetailSectionProps) => (
  <div className={sectionClasses}>
    <ListHeader title={title} actionLabel="Ajouter" onAction={onAdd} />
    <div className="mt-4 space-y-4">
      {items.length === 0 ? (
        <EmptyState label="Aucun élément pour le moment." />
      ) : (
        items.map((item, index) => (
          <div key={`${title}-${index}`} className="rounded-xl border border-sand-200 bg-white/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.25em] text-ink-700">Élément {index + 1}</p>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-600 hover:text-clay-500"
              >
                Retirer
              </button>
            </div>
            <div className="mt-3 grid gap-3">
              <input
                className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm text-ink-900 shadow-inset focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={item.title}
                placeholder="Titre"
                onChange={(event) => onChange(index, 'title', event.target.value)}
              />
              <textarea
                className="min-h-[90px] rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm text-ink-900 shadow-inset focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={item.description}
                placeholder="Description"
                onChange={(event) => onChange(index, 'description', event.target.value)}
              />
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

type EmptyStateProps = {
  label: string;
};

const EmptyState = ({ label }: EmptyStateProps) => (
  <div className="rounded-xl border border-dashed border-sand-200 bg-white/40 px-4 py-6 text-sm text-ink-700">
    {label}
  </div>
);
