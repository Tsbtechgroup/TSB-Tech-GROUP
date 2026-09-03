import {
  Car,
  ScanLine,
  ShieldCheck,
  Zap,
  Sun,
  Laptop,
  Cpu,
  Network,
  Wrench,
  GraduationCap,
  ShoppingBag,
  Building2,
  Lightbulb,
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

function ServicesGrid() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      servicesGridTranslations,
      locale,
      `servicesGrid.${key}`
    );

  return (
    <section className="section section--domains">
      <div className="container">
        <div className="section-heading">
          <span className="section__eyebrow">
            {t("eyebrow")}
          </span>

          <h2>
            {t("title1")} <span>{t("title2")}</span>
          </h2>

          <p>{t("intro")}</p>
        </div>

        <div className="domains-grid">
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
                  scrollMarginTop: "110px",
                }}
              >
                <div className="domain-card__top">
                  <div className="domain-icon">
                    <Icon size={25} strokeWidth={1.8} />
                  </div>

                  <span className="domain-category">
                    {category}
                  </span>
                </div>

                <h3>{title}</h3>

                <p>{description}</p>

                <a
                  href={
                    service.id === "store"
                      ? "/store"
                      : service.id === "academy"
                        ? "/academy"
                        : service.id === "business"
                          ? "/business"
                          : service.id === "innovation"
                            ? "/innovation"
                            : `/services#${service.id}`
                  }
                >
                  {t("learnMore")}
                  <span aria-hidden="true">→</span>
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
