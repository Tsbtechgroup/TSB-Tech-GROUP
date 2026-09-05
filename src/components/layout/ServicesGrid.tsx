import {
  Building2,
  Car,
  Cpu,
  GraduationCap,
  Laptop,
  Lightbulb,
  Network,
  ScanLine,
  ShieldCheck,
  ShoppingBag,
  Sun,
  Wrench,
  Zap,
} from "lucide-react";

import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { servicesGridTranslations } from "../../i18n/locales/servicesGrid";

const serviceConfig = [
  { id: "automobile", icon: Car, color: "blue" },
  { id: "diagnostic", icon: ScanLine, color: "cyan" },
  { id: "securite", icon: ShieldCheck, color: "green" },
  { id: "electricite", icon: Zap, color: "yellow" },
  { id: "energie", icon: Sun, color: "orange" },
  { id: "informatique", icon: Laptop, color: "cyan" },
  { id: "automatisation", icon: Cpu, color: "purple" },
  { id: "reseaux", icon: Network, color: "blue" },
  { id: "maintenance", icon: Wrench, color: "orange" },
  { id: "academy", icon: GraduationCap, color: "purple" },
  { id: "store", icon: ShoppingBag, color: "green" },
  { id: "business", icon: Building2, color: "blue" },
  { id: "innovation", icon: Lightbulb, color: "cyan" },
] as const;

const getServiceHref = (serviceId: string) => {
  if (serviceId === "store") {
    return "/store";
  }

  if (serviceId === "academy") {
    return "/academy";
  }

  if (serviceId === "business") {
    return "/business";
  }

  if (serviceId === "innovation") {
    return "/innovation";
  }

  return `/services#${serviceId}`;
};

function ServicesGrid() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      servicesGridTranslations,
      locale,
      `servicesGrid.${key}`
    );

  return (
    <section
      className="section section--domains"
      style={{
        paddingTop: "68px",
        paddingBottom: "68px",
      }}
    >
      <div className="container">
        <div
          className="section-heading"
          style={{
            maxWidth: "820px",
            margin: "0 auto 30px",
            textAlign: "center",
          }}
        >
          <span className="section__eyebrow">
            {t("eyebrow")}
          </span>

          <h2>
            {t("title1")}{" "}
            <span>{t("title2")}</span>
          </h2>

          <p
            style={{
              maxWidth: "720px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {t("intro")}
          </p>
        </div>

        <div
          className="domains-grid"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(235px, 1fr))",
            alignItems: "stretch",
            gap: "15px",
            maxWidth: "1180px",
            margin: "0 auto",
          }}
        >
          {serviceConfig.map((service) => {
            const Icon = service.icon;

            const title = t(
              `services.${service.id}.title`
            );

            const description = t(
              `services.${service.id}.description`
            );

            const category = t(
              `services.${service.id}.category`
            );

            return (
              <article
                id={service.id}
                className={`domain-card domain-${service.color}`}
                key={service.id}
                style={{
                  minHeight: "230px",
                  height: "100%",
                  padding: "19px",
                  display: "flex",
                  flexDirection: "column",
                  scrollMarginTop: "110px",
                }}
              >
                <div
                  className="domain-card__top"
                  style={{ marginBottom: "14px" }}
                >
                  <div
                    className="domain-icon"
                    aria-hidden="true"
                  >
                    <Icon
                      size={23}
                      strokeWidth={1.8}
                    />
                  </div>

                  <span className="domain-category">
                    {category}
                  </span>
                </div>

                <h3
                  style={{
                    margin: "0 0 9px",
                    lineHeight: 1.3,
                  }}
                >
                  {title}
                </h3>

                <p
                  style={{
                    margin: 0,
                    lineHeight: 1.58,
                  }}
                >
                  {description}
                </p>

                <a
                  href={getServiceHref(service.id)}
                  style={{
                    marginTop: "auto",
                    paddingTop: "16px",
                  }}
                >
                  {t("learnMore")}
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ServicesGrid;
