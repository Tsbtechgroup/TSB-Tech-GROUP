export type ServiceTheme = {
  accent: string;
  accentStrong: string;
  text: string;
  border: string;
  borderStrong: string;
  background: string;
  backgroundStrong: string;
  glow: string;
  glowStrong: string;
  badgeBackground: string;
};

export type TsbDomainKey =
  | "automobile"
  | "security"
  | "electricity"
  | "energy"
  | "water"
  | "automation"
  | "it"
  | "networks"
  | "web"
  | "maintenance"
  | "academy"
  | "store"
  | "business"
  | "innovation"
  | "other";

export type TsbFolderKey =
  | "requests"
  | "interventions"
  | "documents"
  | "reports"
  | "invoices";

export type TsbFolderDefinition = {
  key: TsbFolderKey;
  label: string;
};

export type TsbDomainDefinition = {
  key: TsbDomainKey;
  label: string;
  shortLabel: string;
  theme: ServiceTheme;
  services: readonly string[];
  folders: readonly TsbFolderDefinition[];
};

const makeTheme = (
  accent: string,
  accentStrong: string,
  rgb: string
): ServiceTheme => ({
  accent,
  accentStrong,
  text: accentStrong,
  border: `rgba(${rgb},0.48)`,
  borderStrong: `rgba(${rgb},0.82)`,
  background: `rgba(${rgb},0.12)`,
  backgroundStrong: `rgba(${rgb},0.20)`,
  glow: `0 0 26px rgba(${rgb},0.16)`,
  glowStrong: `0 0 34px rgba(${rgb},0.30)`,
  badgeBackground: `rgba(${rgb},0.18)`,
});

const automobileTheme = makeTheme("#1688ff", "#53a7ff", "22,136,255");
const securityTheme = makeTheme("#22c55e", "#4ade80", "34,197,94");
const electricityTheme = makeTheme("#f97316", "#fb923c", "249,115,22");
const energyTheme = makeTheme("#eab308", "#facc15", "234,179,8");
const waterTheme = makeTheme("#06b6d4", "#22d3ee", "6,182,212");
const automationTheme = makeTheme("#a855f7", "#c084fc", "168,85,247");
const itTheme = makeTheme("#3b82f6", "#60a5fa", "59,130,246");
const networksTheme = makeTheme("#00b8d9", "#22d3ee", "0,184,217");
const webTheme = makeTheme("#8b5cf6", "#a78bfa", "139,92,246");
const maintenanceTheme = makeTheme("#0ea5e9", "#38bdf8", "14,165,233");
const academyTheme = makeTheme("#d4a017", "#f4c430", "212,160,23");
const storeTheme = makeTheme("#1688ff", "#38bdf8", "22,136,255");
const businessTheme = makeTheme("#f59e0b", "#fbbf24", "245,158,11");
const innovationTheme = makeTheme("#00d4ff", "#67e8f9", "0,212,255");
const otherTheme = makeTheme("#ec4899", "#f472b6", "236,72,153");

export const TSB_STANDARD_FOLDERS: readonly TsbFolderDefinition[] = [
  { key: "requests", label: "Demandes & devis" },
  { key: "interventions", label: "Interventions" },
  { key: "documents", label: "Documents" },
  { key: "reports", label: "Rapports" },
  { key: "invoices", label: "Factures" },
];

export const TSB_DOMAINS: readonly TsbDomainDefinition[] = [
  {
    key: "automobile",
    label: "Automobile",
    shortLabel: "AUTO",
    theme: automobileTheme,
    services: [
      "Serrurerie automobile",
      "Diagnostic automobile",
      "Clés automobiles",
      "Programmation de clés",
      "Diagnostic électronique automobile",
      "Électricité automobile",
      "Bornes de recharge véhicules électriques",
    ],
    folders: TSB_STANDARD_FOLDERS,
  },
  {
    key: "security",
    label: "Sécurité",
    shortLabel: "SÉCURITÉ",
    theme: securityTheme,
    services: [
      "Sécurité",
      "Systèmes de sécurité",
      "Caméras de surveillance",
      "Contrôle d’accès",
      "Sécurité, caméras & contrôle d’accès",
    ],
    folders: TSB_STANDARD_FOLDERS,
  },
  {
    key: "electricity",
    label: "Électricité",
    shortLabel: "ÉLECTRICITÉ",
    theme: electricityTheme,
    services: [
      "Électricité",
      "Électricité industrielle",
      "Câblage électrique",
      "Installation électrique",
    ],
    folders: TSB_STANDARD_FOLDERS,
  },
  {
    key: "energy",
    label: "Énergie",
    shortLabel: "ÉNERGIE",
    theme: energyTheme,
    services: [
      "Énergie",
      "Panneaux photovoltaïques",
      "Panneaux solaires",
      "Installation photovoltaïque",
      "Solutions énergétiques",
    ],
    folders: TSB_STANDARD_FOLDERS,
  },
  {
    key: "water",
    label: "Eau & forage",
    shortLabel: "EAU",
    theme: waterTheme,
    services: [
      "Eau & forage",
      "Forage d’eau",
      "Forage d’eau & pompage",
      "Pompage",
    ],
    folders: TSB_STANDARD_FOLDERS,
  },
  {
    key: "automation",
    label: "Automatisation",
    shortLabel: "AUTOMATION",
    theme: automationTheme,
    services: [
      "Automatisation",
      "Automatisme industriel",
      "Automatisation industrielle",
    ],
    folders: TSB_STANDARD_FOLDERS,
  },
  {
    key: "it",
    label: "Informatique & électronique",
    shortLabel: "INFORMATIQUE",
    theme: itTheme,
    services: [
      "Informatique & électronique",
      "Informatique",
      "Électronique",
      "Réparation PC & smartphones",
      "Réparation PC",
      "Réparation smartphones",
    ],
    folders: TSB_STANDARD_FOLDERS,
  },
  {
    key: "networks",
    label: "Réseaux & télécommunications",
    shortLabel: "RÉSEAUX",
    theme: networksTheme,
    services: [
      "Réseaux & télécommunications",
      "Informatique & réseaux",
      "Réseaux",
      "Télécommunications",
    ],
    folders: TSB_STANDARD_FOLDERS,
  },
  {
    key: "web",
    label: "Web & digital",
    shortLabel: "DIGITAL",
    theme: webTheme,
    services: [
      "Site web",
      "Création de sites web",
      "Web",
      "Digital",
      "Applications web",
      "E-commerce",
    ],
    folders: TSB_STANDARD_FOLDERS,
  },
  {
    key: "maintenance",
    label: "Maintenance technique",
    shortLabel: "MAINTENANCE",
    theme: maintenanceTheme,
    services: [
      "Maintenance technique",
      "Maintenance",
      "Dépannage technique",
    ],
    folders: TSB_STANDARD_FOLDERS,
  },
  {
    key: "academy",
    label: "TSB Academy",
    shortLabel: "ACADEMY",
    theme: academyTheme,
    services: ["Academy", "TSB Academy", "Formation", "Formations"],
    folders: TSB_STANDARD_FOLDERS,
  },
  {
    key: "store",
    label: "TSB Store",
    shortLabel: "STORE",
    theme: storeTheme,
    services: ["Store", "TSB Store", "Boutique", "Boutique en ligne"],
    folders: TSB_STANDARD_FOLDERS,
  },
  {
    key: "business",
    label: "TSB Business",
    shortLabel: "BUSINESS",
    theme: businessTheme,
    services: [
      "Business",
      "TSB Business",
      "Solutions entreprises",
      "Services aux entreprises",
    ],
    folders: TSB_STANDARD_FOLDERS,
  },
  {
    key: "innovation",
    label: "Innovation",
    shortLabel: "INNOVATION",
    theme: innovationTheme,
    services: [
      "Innovation",
      "TSB Innovation",
      "Recherche & développement",
      "R&D",
    ],
    folders: TSB_STANDARD_FOLDERS,
  },
  {
    key: "other",
    label: "Autres services",
    shortLabel: "AUTRES",
    theme: otherTheme,
    services: ["Autres services", "Autre service", "Autres"],
    folders: TSB_STANDARD_FOLDERS,
  },
];

const normalizeServiceName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const includesAny = (
  value: string,
  needles: readonly string[]
) =>
  needles.some((needle) =>
    value.includes(normalizeServiceName(needle))
  );

export const getServiceDomain = (
  service: string
): TsbDomainDefinition => {
  const normalized = normalizeServiceName(service);

  const exactMatch = TSB_DOMAINS.find((domain) =>
    domain.services.some(
      (candidate) =>
        normalizeServiceName(candidate) === normalized
    )
  );

  if (exactMatch) return exactMatch;

  if (
    includesAny(normalized, [
      "serrurerie",
      "diagnostic automobile",
      "cle automobile",
      "cles automobiles",
      "programmation de cles",
      "electricite automobile",
      "borne de recharge",
      "bornes de recharge",
    ])
  ) {
    return TSB_DOMAINS[0];
  }

  if (
    includesAny(normalized, [
      "securite",
      "camera",
      "controle d'acces",
      "controle acces",
      "surveillance",
    ])
  ) {
    return TSB_DOMAINS[1];
  }

  if (
    includesAny(normalized, [
      "electricite",
      "cablage",
      "installation electrique",
    ])
  ) {
    return TSB_DOMAINS[2];
  }

  if (
    includesAny(normalized, [
      "energie",
      "photovolta",
      "panneau solaire",
      "panneaux solaires",
    ])
  ) {
    return TSB_DOMAINS[3];
  }

  if (includesAny(normalized, ["eau", "forage", "pompage"])) {
    return TSB_DOMAINS[4];
  }

  if (includesAny(normalized, ["automatisation", "automatisme"])) {
    return TSB_DOMAINS[5];
  }

  if (
    includesAny(normalized, [
      "informatique",
      "electronique",
      "pc",
      "smartphone",
    ])
  ) {
    return TSB_DOMAINS[6];
  }

  if (includesAny(normalized, ["reseau", "telecommunication"])) {
    return TSB_DOMAINS[7];
  }

  if (
    includesAny(normalized, [
      "site web",
      "web",
      "digital",
      "e-commerce",
      "ecommerce",
    ])
  ) {
    return TSB_DOMAINS[8];
  }

  if (
    includesAny(normalized, [
      "maintenance",
      "depannage technique",
    ])
  ) {
    return TSB_DOMAINS[9];
  }

  if (includesAny(normalized, ["academy", "formation"])) {
    return TSB_DOMAINS[10];
  }

  if (includesAny(normalized, ["store", "boutique"])) {
    return TSB_DOMAINS[11];
  }

  if (includesAny(normalized, ["business", "entreprise"])) {
    return TSB_DOMAINS[12];
  }

  if (
    includesAny(normalized, [
      "innovation",
      "recherche",
      "developpement",
      "r&d",
    ])
  ) {
    return TSB_DOMAINS[13];
  }

  return TSB_DOMAINS[14];
};

export const getServiceTheme = (
  service: string
): ServiceTheme => getServiceDomain(service).theme;

export const getServiceDomainLabel = (
  service: string
) => getServiceDomain(service).label;

export const getServiceFolders = (
  service: string
) => getServiceDomain(service).folders;

export const getServiceFolderPath = (
  service: string,
  folder: TsbFolderKey
) => {
  const domain = getServiceDomain(service);

  const folderDefinition = domain.folders.find(
    (item) => item.key === folder
  );

  return [
    domain.label,
    service,
    folderDefinition?.label ?? "Documents",
  ];
};
