/* =========================================================
   TSB ASSISTANT SMART KNOWLEDGE — SAFE V2
   Moteur local sans OpenAI et sans API externe
   ========================================================= */

export type AssistantIntentId =
  | "quote"
  | "contact"
  | "projects"
  | "store"
  | "academy"
  | "business"
  | "automotiveLocksmith"
  | "automotiveDiagnostic"
  | "security"
  | "electricity"
  | "energy"
  | "water"
  | "automation"
  | "itElectronics"
  | "networks"
  | "website"
  | "maintenance"
  | "services"
  | "greeting"
  | "thanks"
  | "fallback";

export type AssistantActionId =
  | "services"
  | "quote"
  | "contact"
  | "projects"
  | "store"
  | "academy"
  | "business";

export type AssistantKnowledgeItem = {
  id: Exclude<AssistantIntentId, "fallback">;
  answerKey: string;
  actionId?: AssistantActionId;
  href?: string;
  keywords: readonly string[];
  priority: number;
};

export type AssistantIntentResult = {
  id: AssistantIntentId;
  answerKey: string;
  actionId?: AssistantActionId;
  href?: string;
  confidence: number;
  matchedKeywords: string[];
  alternatives: AssistantIntentId[];
};

export const normalizeAssistantText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const containsKeyword = (message: string, keyword: string): boolean => {
  const normalizedKeyword = normalizeAssistantText(keyword);

  if (!normalizedKeyword) {
    return false;
  }

  return ` ${message} `.includes(` ${normalizedKeyword} `) ||
    message.includes(normalizedKeyword);
};

export const assistantKnowledge: readonly AssistantKnowledgeItem[] = [
  {
    id: "quote",
    answerKey: "replyQuote",
    actionId: "quote",
    href: "/#quote",
    priority: 100,
    keywords: [
      "devis", "demander un devis", "prix", "tarif", "combien coute",
      "estimation", "offre de prix", "quote", "request a quote", "price",
      "cost", "estimate", "offerte", "prijs", "angebot", "kosten",
      "presupuesto", "precio", "preventivo", "prezzo", "orcamento",
      "orçamento", "preço", "عرض سعر", "السعر", "teklif", "fiyat",
      "报价", "价格",
    ],
  },
  {
    id: "contact",
    answerKey: "replyContact",
    actionId: "contact",
    href: "/contact",
    priority: 95,
    keywords: [
      "contact", "contacter", "nous joindre", "appeler", "numero de telephone",
      "numéro de téléphone", "adresse email", "whatsapp", "parler a un conseiller",
      "parler à un conseiller", "parler a un humain", "phone number", "call you",
      "advisor", "contact opnemen", "kontakt", "contatto", "contacto",
      "اتصال", "هاتف", "iletişim", "telefon", "联系", "电话",
    ],
  },
  {
    id: "projects",
    answerKey: "replyProjects",
    actionId: "projects",
    href: "/projects",
    priority: 90,
    keywords: [
      "realisation", "realisations", "réalisation", "réalisations",
      "voir vos réalisations", "projet", "projets", "travaux realises",
      "travaux réalisés", "exemple de travaux", "portfolio", "projects",
      "achievements", "realisaties", "projecten", "referenzen", "projekte",
      "proyectos", "progetti", "projetos", "مشاريع", "اعمال", "projeler",
      "项目", "案例",
    ],
  },
  {
    id: "store",
    answerKey: "replyStore",
    actionId: "store",
    href: "/store",
    priority: 90,
    keywords: [
      "tsb store", "store", "boutique", "magasin", "acheter", "achat",
      "produit", "catalogue", "commande", "shop", "buy", "product", "order",
      "winkel", "kopen", "produkt", "tienda", "comprar", "negozio",
      "acquistare", "loja", "متجر", "شراء", "mağaza", "satın almak",
      "商店", "购买",
    ],
  },
  {
    id: "academy",
    answerKey: "replyAcademy",
    actionId: "academy",
    href: "/academy",
    priority: 90,
    keywords: [
      "tsb academy", "academy", "academie", "académie", "formation", "cours",
      "apprendre", "certification", "training", "course", "learn", "opleiding",
      "cursus", "ausbildung", "schulung", "formacion", "formación", "corso",
      "formazione", "formacao", "formação", "تدريب", "دورة", "egitim",
      "eğitim", "kurs", "培训", "课程",
    ],
  },
  {
    id: "business",
    answerKey: "replyBusiness",
    actionId: "business",
    href: "/business",
    priority: 90,
    keywords: [
      "tsb business", "business", "investir", "investissement", "investisseur",
      "partenariat", "partenaire", "collaboration", "entreprise", "investment",
      "investor", "partnership", "partner", "investering", "unternehmen",
      "inversion", "inversión", "investimento", "استثمار", "شراكة", "yatirim",
      "yatırım", "ortaklık", "投资", "合作",
    ],
  },
  {
    id: "automotiveLocksmith",
    answerKey: "replyAutomotiveLocksmith",
    actionId: "services",
    href: "/services",
    priority: 85,
    keywords: [
      "serrurerie automobile", "cle voiture", "clé voiture", "cle perdue",
      "clé perdue", "toutes les cles perdues", "toutes les clés perdues",
      "double de cle", "double de clé", "programmation cle", "programmation clé",
      "telecommande voiture", "télécommande voiture", "antidemarrage",
      "antidémarrage", "immobilizer", "car key", "lost car key", "autosleutel",
      "autoschlüssel", "llave de coche", "chiave auto", "chave do carro",
      "مفتاح سيارة", "araba anahtari", "araba anahtarı", "汽车钥匙",
    ],
  },
  {
    id: "automotiveDiagnostic",
    answerKey: "replyAutomotiveDiagnostic",
    actionId: "services",
    href: "/services",
    priority: 85,
    keywords: [
      "diagnostic automobile", "diagnostic voiture", "voyant moteur",
      "effacer defaut", "effacer défaut", "code defaut", "code défaut",
      "panne voiture", "probleme moteur", "problème moteur", "boite de vitesse",
      "boîte de vitesse", "systeme hybride", "système hybride", "car diagnostic",
      "engine light", "fault code", "autodiagnose", "fahrzeugdiagnose",
      "diagnostico coche", "diagnóstico coche", "diagnosi auto",
      "diagnóstico automóvel", "تشخيص السيارة", "araç arıza tespiti", "汽车诊断",
    ],
  },
  {
    id: "security",
    answerKey: "replySecurity",
    actionId: "services",
    href: "/services",
    priority: 80,
    keywords: [
      "securite", "sécurité", "camera de surveillance", "caméra de surveillance",
      "videosurveillance", "vidéosurveillance", "alarme", "controle acces",
      "contrôle accès", "interphone", "cctv", "security camera", "surveillance",
      "beveiliging", "überwachung", "seguridad", "sicurezza", "segurança",
      "كاميرات مراقبة", "güvenlik", "监控",
    ],
  },
  {
    id: "electricity",
    answerKey: "replyElectricity",
    actionId: "services",
    href: "/services",
    priority: 80,
    keywords: [
      "electricite", "électricité", "installation electrique", "installation électrique",
      "tableau electrique", "tableau électrique", "cablage", "câblage",
      "court circuit", "electrician", "electrical", "elektriciteit", "elektrik",
      "electricidad", "elettricità", "eletricidade", "كهرباء", "电气",
    ],
  },
  {
    id: "energy",
    answerKey: "replyEnergy",
    actionId: "services",
    href: "/services",
    priority: 80,
    keywords: [
      "energie", "énergie", "solaire", "panneau solaire", "batterie", "onduleur",
      "autonomie energetique", "autonomie énergétique", "energy", "solar", "inverter",
      "zonnepanelen", "energieversorgung", "energia solar", "energia", "طاقة",
      "طاقة شمسية", "güneş enerjisi", "能源", "太阳能",
    ],
  },
  {
    id: "water",
    answerKey: "replyWater",
    actionId: "services",
    href: "/services",
    priority: 80,
    keywords: [
      "eau", "forage", "pompe", "pompage", "puits", "traitement eau", "water",
      "drilling", "well", "boorgat", "wasser", "agua", "pozzo", "água",
      "مياه", "بئر", "su", "sondaj", "水", "钻井",
    ],
  },
  {
    id: "automation",
    answerKey: "replyAutomation",
    actionId: "services",
    href: "/services",
    priority: 80,
    keywords: [
      "automatisation", "automatique", "automate", "automate programmable",
      "industrie", "industriel", "domotique", "smart home", "automation", "plc",
      "automatisering", "automatisierung", "automatización", "automazione",
      "automação", "أتمتة", "otomasyon", "自动化",
    ],
  },
  {
    id: "itElectronics",
    answerKey: "replyItElectronics",
    actionId: "services",
    href: "/services",
    priority: 80,
    keywords: [
      "informatique", "ordinateur", "pc", "telephone en panne", "téléphone en panne",
      "electronique", "électronique", "reparation telephone", "réparation téléphone",
      "reparation ordinateur", "réparation ordinateur", "software", "computer",
      "electronics", "it support", "informatica", "elektronik", "informática",
      "إلكترونيات", "حاسوب", "bilişim", "电子", "电脑",
    ],
  },
  {
    id: "networks",
    answerKey: "replyNetworks",
    actionId: "services",
    href: "/services",
    priority: 80,
    keywords: [
      "reseau", "réseau", "wifi", "internet", "telecommunication",
      "télécommunication", "telecom", "télécom", "fibre", "antenne", "network",
      "telecommunications", "netwerk", "netzwerk", "redes", "rete",
      "redes informáticas", "شبكات", "اتصالات", "ağ", "网络", "通信",
    ],
  },
  {
    id: "website",
    answerKey: "replyWebsite",
    actionId: "services",
    href: "/services",
    priority: 80,
    keywords: [
      "site web", "creation site", "création site", "application web",
      "application mobile", "boutique en ligne", "digital", "website",
      "web development", "mobile app", "website maken", "webseite", "sitio web",
      "sito web", "criação de site", "موقع إلكتروني", "web sitesi", "网站",
    ],
  },
  {
    id: "maintenance",
    answerKey: "replyMaintenance",
    actionId: "services",
    href: "/services",
    priority: 80,
    keywords: [
      "maintenance", "entretien", "depannage", "dépannage", "reparation",
      "réparation", "intervention", "technicien", "repair", "technical maintenance",
      "onderhoud", "wartung", "mantenimiento", "manutenzione", "manutenção",
      "صيانة", "bakım", "维修", "维护",
    ],
  },
  {
    id: "services",
    answerKey: "replyServices",
    actionId: "services",
    href: "/services",
    priority: 30,
    keywords: [
      "service", "services", "que faites vous", "que proposez vous", "besoin aide",
      "besoin d aide", "help", "what do you do", "diensten", "leistungen",
      "servicios", "servizi", "serviços", "خدمات", "hizmetler", "服务",
    ],
  },
  {
    id: "greeting",
    answerKey: "replyGreeting",
    priority: 20,
    keywords: [
      "bonjour", "bonsoir", "salut", "hello", "hi", "hey", "hallo",
      "goedendag", "guten tag", "hola", "buongiorno", "ola", "olá",
      "مرحبا", "السلام عليكم", "merhaba", "你好",
    ],
  },
  {
    id: "thanks",
    answerKey: "replyThanks",
    priority: 20,
    keywords: [
      "merci", "merci beaucoup", "thanks", "thank you", "bedankt", "danke",
      "gracias", "grazie", "obrigado", "obrigada", "شكرا", "teşekkür", "谢谢",
    ],
  },
];

type ScoredIntent = {
  item: AssistantKnowledgeItem;
  score: number;
  matches: string[];
};

const scoreIntent = (
  message: string,
  item: AssistantKnowledgeItem
): ScoredIntent | null => {
  const matches = item.keywords.filter((keyword) =>
    containsKeyword(message, keyword)
  );

  if (matches.length === 0) {
    return null;
  }

  const keywordScore = matches.reduce((total, keyword) => {
    const normalizedKeyword = normalizeAssistantText(keyword);
    const wordCount = normalizedKeyword.split(" ").filter(Boolean).length;
    return total + normalizedKeyword.length * 4 + wordCount * 25;
  }, 0);

  return {
    item,
    score: keywordScore + matches.length * 20 + item.priority,
    matches,
  };
};

export const detectAssistantIntent = (
  rawMessage: string
): AssistantIntentResult => {
  const message = normalizeAssistantText(rawMessage);

  if (!message) {
    return {
      id: "fallback",
      answerKey: "replyFallback",
      confidence: 0,
      matchedKeywords: [],
      alternatives: [],
    };
  }

  const ranked = assistantKnowledge
    .map((item) => scoreIntent(message, item))
    .filter((result): result is ScoredIntent => result !== null)
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];

  if (!best) {
    return {
      id: "fallback",
      answerKey: "replyFallback",
      confidence: 0,
      matchedKeywords: [],
      alternatives: [],
    };
  }

  const secondScore = ranked[1]?.score ?? 0;
  const confidence = Math.min(
    100,
    Math.max(35, Math.round((best.score / (best.score + secondScore + 1)) * 100))
  );

  return {
    id: best.item.id,
    answerKey: best.item.answerKey,
    actionId: best.item.actionId,
    href: best.item.href,
    confidence,
    matchedKeywords: best.matches,
    alternatives: ranked
      .slice(1, 3)
      .map((result) => result.item.id),
  };
};