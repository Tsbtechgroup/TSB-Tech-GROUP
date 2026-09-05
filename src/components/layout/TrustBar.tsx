import {
  Building2,
  Globe2,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { useLanguage } from "../../context/LanguageContext";

type TrustBarContent = {
  coverageTitle: string;
  coverageText: string;
  expertiseTitle: string;
  expertiseText: string;
  clientsTitle: string;
  clientsText: string;
  commitmentTitle: string;
  commitmentText: string;
};

const trustBarTranslations: Record<string, TrustBarContent> = {
  fr: {
    coverageTitle: "Présence internationale",
    coverageText: "Belgique • Europe • International",
    expertiseTitle: "Expertise multiservice",
    expertiseText: "Automobile • Énergie • Sécurité • Digital",
    clientsTitle: "Pour tous vos projets",
    clientsText: "Particuliers • Entreprises • Institutions",
    commitmentTitle: "Accompagnement professionnel",
    commitmentText: "Étude • Solution • Réalisation • Suivi",
  },

  nl: {
    coverageTitle: "Internationale aanwezigheid",
    coverageText: "België • Europa • Internationaal",
    expertiseTitle: "Multiservice-expertise",
    expertiseText: "Automobiel • Energie • Beveiliging • Digitaal",
    clientsTitle: "Voor al uw projecten",
    clientsText: "Particulieren • Bedrijven • Instellingen",
    commitmentTitle: "Professionele begeleiding",
    commitmentText: "Analyse • Oplossing • Uitvoering • Opvolging",
  },

  en: {
    coverageTitle: "International presence",
    coverageText: "Belgium • Europe • International",
    expertiseTitle: "Multi-service expertise",
    expertiseText: "Automotive • Energy • Security • Digital",
    clientsTitle: "For every project",
    clientsText: "Individuals • Businesses • Institutions",
    commitmentTitle: "Professional support",
    commitmentText: "Assessment • Solution • Delivery • Follow-up",
  },

  de: {
    coverageTitle: "Internationale Präsenz",
    coverageText: "Belgien • Europa • International",
    expertiseTitle: "Fachübergreifende Kompetenz",
    expertiseText: "Automobil • Energie • Sicherheit • Digital",
    clientsTitle: "Für jedes Projekt",
    clientsText: "Privatkunden • Unternehmen • Institutionen",
    commitmentTitle: "Professionelle Begleitung",
    commitmentText: "Analyse • Lösung • Umsetzung • Betreuung",
  },

  es: {
    coverageTitle: "Presencia internacional",
    coverageText: "Bélgica • Europa • Internacional",
    expertiseTitle: "Experiencia multiservicio",
    expertiseText: "Automóvil • Energía • Seguridad • Digital",
    clientsTitle: "Para todos sus proyectos",
    clientsText: "Particulares • Empresas • Instituciones",
    commitmentTitle: "Acompañamiento profesional",
    commitmentText: "Estudio • Solución • Ejecución • Seguimiento",
  },

  it: {
    coverageTitle: "Presenza internazionale",
    coverageText: "Belgio • Europa • Internazionale",
    expertiseTitle: "Competenza multiservizio",
    expertiseText: "Automotive • Energia • Sicurezza • Digitale",
    clientsTitle: "Per ogni progetto",
    clientsText: "Privati • Aziende • Istituzioni",
    commitmentTitle: "Supporto professionale",
    commitmentText: "Analisi • Soluzione • Realizzazione • Assistenza",
  },

  pt: {
    coverageTitle: "Presença internacional",
    coverageText: "Bélgica • Europa • Internacional",
    expertiseTitle: "Experiência multisserviço",
    expertiseText: "Automóvel • Energia • Segurança • Digital",
    clientsTitle: "Para todos os projetos",
    clientsText: "Particulares • Empresas • Instituições",
    commitmentTitle: "Acompanhamento profissional",
    commitmentText: "Estudo • Solução • Execução • Acompanhamento",
  },

  ar: {
    coverageTitle: "حضور دولي",
    coverageText: "بلجيكا • أوروبا • دولي",
    expertiseTitle: "خبرة متعددة الخدمات",
    expertiseText: "السيارات • الطاقة • الأمن • الحلول الرقمية",
    clientsTitle: "لجميع مشاريعكم",
    clientsText: "الأفراد • الشركات • المؤسسات",
    commitmentTitle: "مرافقة احترافية",
    commitmentText: "دراسة • حل • تنفيذ • متابعة",
  },

  tr: {
    coverageTitle: "Uluslararası hizmet",
    coverageText: "Belçika • Avrupa • Uluslararası",
    expertiseTitle: "Çok alanlı uzmanlık",
    expertiseText: "Otomotiv • Enerji • Güvenlik • Dijital",
    clientsTitle: "Tüm projeleriniz için",
    clientsText: "Bireyler • Şirketler • Kurumlar",
    commitmentTitle: "Profesyonel destek",
    commitmentText: "Analiz • Çözüm • Uygulama • Takip",
  },

  zh: {
    coverageTitle: "国际服务范围",
    coverageText: "比利时 • 欧洲 • 国际",
    expertiseTitle: "多领域专业能力",
    expertiseText: "汽车 • 能源 • 安防 • 数字技术",
    clientsTitle: "服务各类项目",
    clientsText: "个人 • 企业 • 机构",
    commitmentTitle: "专业项目支持",
    commitmentText: "分析 • 方案 • 实施 • 跟进",
  },
};

const trustItems = [
  {
    id: "coverage",
    icon: Globe2,
    titleKey: "coverageTitle",
    textKey: "coverageText",
  },
  {
    id: "expertise",
    icon: Wrench,
    titleKey: "expertiseTitle",
    textKey: "expertiseText",
  },
  {
    id: "clients",
    icon: Building2,
    titleKey: "clientsTitle",
    textKey: "clientsText",
  },
  {
    id: "commitment",
    icon: ShieldCheck,
    titleKey: "commitmentTitle",
    textKey: "commitmentText",
  },
] as const;

function TrustBar() {
  const { locale } = useLanguage();

  const content =
    trustBarTranslations[locale] ??
    trustBarTranslations.fr;

  return (
    <section
      aria-label={content.commitmentTitle}
      style={{
        position: "relative",
        zIndex: 5,
        padding: "0 20px",
        marginTop: "-30px",
        marginBottom: "18px",
      }}
    >
      <div
        className="container"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          maxWidth: "1180px",
          margin: "0 auto",
          overflow: "hidden",
          borderRadius: "22px",
          border: "1px solid rgba(56, 189, 248, 0.2)",
          background:
            "linear-gradient(135deg, rgba(8, 20, 40, 0.97), rgba(5, 13, 28, 0.96))",
          boxShadow:
            "0 24px 70px rgba(0, 0, 0, 0.34)",
          backdropFilter: "blur(18px)",
        }}
      >
        {trustItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <article
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                minHeight: "112px",
                padding: "20px",
                borderLeft:
                  index === 0
                    ? "none"
                    : "1px solid rgba(148, 163, 184, 0.12)",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: "46px",
                  height: "46px",
                  flex: "0 0 46px",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "14px",
                  color: "#7dd3fc",
                  border:
                    "1px solid rgba(56, 189, 248, 0.24)",
                  background:
                    "linear-gradient(135deg, rgba(14, 165, 233, 0.18), rgba(37, 99, 235, 0.1))",
                }}
              >
                <Icon size={22} strokeWidth={1.8} />
              </div>

              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#f8fafc",
                    fontSize: "0.96rem",
                    lineHeight: 1.3,
                  }}
                >
                  {content[item.titleKey]}
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "rgba(226, 232, 240, 0.72)",
                    fontSize: "0.82rem",
                    lineHeight: 1.5,
                  }}
                >
                  {content[item.textKey]}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default TrustBar;