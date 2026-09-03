import {
  Building2,
  Cpu,
  Globe2,
  Handshake,
  Network,
  PackageCheck,
  Rocket,
  ShieldCheck,
  Store,
  Wrench,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";

import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { partnersTranslations } from "../../i18n/locales/partners";

const partnerTypes = [
  {
    id: "suppliers",
    icon: Wrench,
    color: "blue",
  },
  {
    id: "technology",
    icon: Network,
    color: "cyan",
  },
  {
    id: "business",
    icon: Building2,
    color: "purple",
  },
  {
    id: "institutions",
    icon: ShieldCheck,
    color: "green",
  },
  {
    id: "distribution",
    icon: Store,
    color: "orange",
  },
  {
    id: "international",
    icon: Globe2,
    color: "blue",
  },
] as const;

const whyItems = [
  {
    id: "ecosystem",
    icon: PackageCheck,
    color: "blue",
  },
  {
    id: "expertise",
    icon: Cpu,
    color: "cyan",
  },
  {
    id: "international",
    icon: Globe2,
    color: "green",
  },
  {
    id: "projects",
    icon: Rocket,
    color: "purple",
  },
] as const;

function Partners() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      partnersTranslations,
      locale,
      `partners.${key}`
    );

  return (
    <div>
      <Navbar />

      <main>
        {/* HERO */}
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

              <h1>
                {t("title1")}{" "}
                <span>{t("title2")}</span>
              </h1>

              <p
                style={{
                  maxWidth: "780px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {t("intro")}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
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
                  href="/contact"
                  className="button button--primary"
                >
                  {t("contact")}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* PARTENAIRES OFFICIELS */}
        <section className="section">
          <div className="container">
            <div
              style={{
                maxWidth: "920px",
                margin: "0 auto",
                padding: "30px",
                borderRadius: "22px",
                border:
                  "1px solid rgba(56,189,248,0.24)",
                background:
                  "linear-gradient(135deg, rgba(14,165,233,0.10), rgba(59,130,246,0.06))",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  margin: "0 auto 18px",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "17px",
                  background:
                    "rgba(14,165,233,0.12)",
                  border:
                    "1px solid rgba(125,211,252,0.28)",
                }}
              >
                <Handshake
                  size={29}
                  strokeWidth={1.8}
                />
              </div>

              <h2>{t("networkTitle")}</h2>

              <p
                style={{
                  maxWidth: "760px",
                  margin: "12px auto 0",
                }}
              >
                {t("networkIntro")}
              </p>

              <div
                style={{
                  marginTop: "24px",
                  padding: "18px 20px",
                  borderRadius: "15px",
                  border:
                    "1px dashed rgba(148,163,184,0.30)",
                  background:
                    "rgba(15,23,42,0.24)",
                }}
              >
                <strong>
                  {t("comingSoon")}
                </strong>

                <p
                  style={{
                    marginTop: "8px",
                    marginBottom: 0,
                  }}
                >
                  {t("comingSoonText")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TYPES DE PARTENARIATS */}
        <section className="section section--domains">
          <div className="container">
            <div
              className="section-heading"
              style={{
                textAlign: "center",
                maxWidth: "800px",
                margin: "0 auto 34px",
              }}
            >
              <h2>{t("typesTitle")}</h2>

              <p>{t("typesIntro")}</p>
            </div>

            <div
              className="domains-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "18px",
                maxWidth: "1180px",
                margin: "0 auto",
              }}
            >
              {partnerTypes.map((partner) => {
                const Icon = partner.icon;

                return (
                  <article
                    key={partner.id}
                    className={`domain-card domain-${partner.color}`}
                    style={{
                      minHeight: "225px",
                      padding: "22px",
                    }}
                  >
                    <div className="domain-card__top">
                      <div className="domain-icon">
                        <Icon
                          size={24}
                          strokeWidth={1.8}
                        />
                      </div>
                    </div>

                    <h3>
                      {t(
                        `items.${partner.id}.title`
                      )}
                    </h3>

                    <p>
                      {t(
                        `items.${partner.id}.description`
                      )}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* POURQUOI COLLABORER */}
        <section className="section">
          <div className="container">
            <div
              className="section-heading"
              style={{
                textAlign: "center",
                maxWidth: "820px",
                margin: "0 auto 34px",
              }}
            >
              <span className="section__eyebrow">
                TSB TECH GROUP
              </span>

              <h2>{t("whyTitle")}</h2>

              <p>{t("whyIntro")}</p>
            </div>

            <div
              className="domains-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "18px",
                maxWidth: "1120px",
                margin: "0 auto",
              }}
            >
              {whyItems.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.id}
                    className={`domain-card domain-${item.color}`}
                    style={{
                      minHeight: "210px",
                      padding: "22px",
                    }}
                  >
                    <div className="domain-card__top">
                      <div className="domain-icon">
                        <Icon
                          size={24}
                          strokeWidth={1.8}
                        />
                      </div>
                    </div>

                    <h3>
                      {t(
                        `whyItems.${item.id}.title`
                      )}
                    </h3>

                    <p>
                      {t(
                        `whyItems.${item.id}.description`
                      )}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA PARTENAIRE */}
        <section className="section">
          <div className="container">
            <div
              style={{
                maxWidth: "920px",
                margin: "0 auto",
                padding: "32px",
                borderRadius: "22px",
                border:
                  "1px solid rgba(34,197,94,0.22)",
                background:
                  "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(14,165,233,0.06))",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  margin: "0 auto 18px",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "17px",
                  background:
                    "rgba(34,197,94,0.10)",
                  border:
                    "1px solid rgba(74,222,128,0.25)",
                }}
              >
                <Globe2
                  size={28}
                  strokeWidth={1.8}
                />
              </div>

              <h2>{t("ctaTitle")}</h2>

              <p
                style={{
                  maxWidth: "720px",
                  margin: "12px auto 0",
                }}
              >
                {t("ctaText")}
              </p>

              <p
                style={{
                  marginTop: "18px",
                  fontWeight: 700,
                  lineHeight: 1.8,
                }}
              >
                {t("reach")}
              </p>

              <a
                href="/contact"
                className="button button--primary"
                style={{
                  marginTop: "22px",
                }}
              >
                {t("ctaButton")}
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <ScrollToTop />
    </div>
  );
}

export default Partners;