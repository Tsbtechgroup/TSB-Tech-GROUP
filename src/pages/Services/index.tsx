import { useEffect, useState } from "react";

import {
  Building2,
  Car,
  Cpu,
  Droplets,
  Globe2,
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

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";

import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { servicesTranslations } from "../../i18n/locales/services";

const serviceConfig = [
  {
    id: "automobile",
    icon: Car,
    color: "blue",
    accent: "#3b82f6",
  },
  {
    id: "diagnostic",
    icon: ScanLine,
    color: "cyan",
    accent: "#06b6d4",
  },
  {
    id: "securite",
    icon: ShieldCheck,
    color: "green",
    accent: "#22c55e",
  },
  {
    id: "electricite",
    icon: Zap,
    color: "yellow",
    accent: "#eab308",
  },
  {
    id: "energie",
    icon: Sun,
    color: "orange",
    accent: "#f97316",
  },
  {
    id: "eau",
    icon: Droplets,
    color: "cyan",
    accent: "#06b6d4",
  },
  {
    id: "informatique",
    icon: Laptop,
    color: "cyan",
    accent: "#06b6d4",
  },
  {
    id: "automatisation",
    icon: Cpu,
    color: "purple",
    accent: "#a855f7",
  },
  {
    id: "reseaux",
    icon: Network,
    color: "blue",
    accent: "#3b82f6",
  },
  {
    id: "site-web",
    icon: Globe2,
    color: "purple",
    accent: "#a855f7",
  },
  {
    id: "maintenance",
    icon: Wrench,
    color: "orange",
    accent: "#f97316",
  },
  {
    id: "academy",
    icon: GraduationCap,
    color: "purple",
    accent: "#a855f7",
  },
  {
    id: "store",
    icon: ShoppingBag,
    color: "green",
    accent: "#22c55e",
  },
  {
    id: "business",
    icon: Building2,
    color: "blue",
    accent: "#3b82f6",
  },
  {
    id: "innovation",
    icon: Lightbulb,
    color: "cyan",
    accent: "#06b6d4",
  },
] as const;



function Services() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      servicesTranslations,
      locale,
      `services.${key}`
    );

  const [
    activeService,
    setActiveService,
  ] = useState("");

  useEffect(() => {
    const scrollToService = () => {
      const hash = window.location.hash;

      if (!hash) {
        setActiveService("");

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      const elementId = decodeURIComponent(
        hash.replace("#", "")
      );

      const element = document.getElementById(
        elementId
      );

      if (!element) {
        setActiveService("");
        return;
      }

      setActiveService(elementId);

      window.setTimeout(() => {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 80);
    };

    scrollToService();

    window.addEventListener(
      "hashchange",
      scrollToService
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        scrollToService
      );
    };
  }, []);

  return (
    <div>
      <Navbar />

      <main>
        <section className="section section--about">
          <div className="container">
            <div
              className="section-heading"
              style={{
                textAlign: "center",
                maxWidth: "900px",
                margin: "0 auto",
              }}
            >
              <span className="section__eyebrow">
                {t("eyebrow")}
              </span>

              <h1
                style={{
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {t("title1")}{" "}
                <span>{t("title2")}</span>
              </h1>

              <p
                style={{
                  maxWidth: "760px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {t("intro")}
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                <a
                  href="/#top"
                  className="button button--secondary"
                >
                  ← {t("backHome")}
                </a>

                <a
                  href="/#quote"
                  className="button button--primary"
                >
                  {t("quote")}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section section--domains">
          <div className="container">
            <div
              className="domains-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(230px, 1fr))",
                gap: "16px",
                maxWidth: "1120px",
                margin: "0 auto",
              }}
            >
              {serviceConfig.map((service) => {
                const Icon = service.icon;
                const category = t(
                  `items.${service.id}.category`
                );

                const title = t(
                  `items.${service.id}.title`
                );

                const description = t(
                  `items.${service.id}.description`
                );

                return (
                  <article
                    id={service.id}
                    className={`domain-card domain-${service.color}`}
                    key={service.id}
                    style={{
                      scrollMarginTop: "110px",
                      padding: "18px",
                      minHeight: "215px",
                      transition:
                        "transform 320ms ease, box-shadow 320ms ease, border-color 320ms ease, background 320ms ease",
                      transform:
                        activeService === service.id
                          ? "translateY(-3px) scale(1.012)"
                          : "translateY(0) scale(1)",
                      borderColor:
                        activeService === service.id
                          ? service.accent
                          : undefined,
                      boxShadow:
                        activeService === service.id
                          ? `0 12px 30px rgba(0,0,0,0.28), 0 0 0 1px ${service.accent}, 0 0 18px ${service.accent}35`
                          : undefined,
                      background:
                        activeService === service.id
                          ? `linear-gradient(145deg, ${service.accent}18, rgba(11,24,40,0.96))`
                          : undefined,
                    }}
                  >
                    <div className="domain-card__top">
                      <div className="domain-icon">
                        <Icon
                          size={22}
                          strokeWidth={1.8}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexWrap: "wrap",
                          justifyContent: "flex-end",
                        }}
                      >
                        {activeService ===
                          service.id && (
                          <span
                            style={{
                              padding:
                                "4px 9px",
                              borderRadius:
                                "999px",
                              border: `1px solid ${service.accent}`,
                              background: `${service.accent}18`,
                              color:
                                service.accent,
                              fontSize:
                                "0.72rem",
                              fontWeight:
                                800,
                              letterSpacing:
                                "0.04em",
                              textTransform:
                                "uppercase",
                            }}
                          >
                            {t("selected")}
                          </span>
                        )}

                        <span className="domain-category">
                          {category}
                        </span>
                      </div>
                    </div>

                    <h3
                      style={{
                        fontSize: "1.05rem",
                        lineHeight: 1.3,
                        marginTop: "14px",
                        marginBottom: "8px",
                      }}
                    >
                      {title}
                    </h3>

                    <p
                      style={{
                        fontSize: "0.9rem",
                        lineHeight: 1.5,
                        marginBottom: "14px",
                      }}
                    >
                      {description}
                    </p>

                    <a
                      href={`/#quote?service=${encodeURIComponent(
                        service.id
                      )}`}
                    >
                      {t("learnMore")}
                      <span aria-hidden="true">
                        →
                      </span>
                    </a>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}










































































































































































































































































































export default Services;
