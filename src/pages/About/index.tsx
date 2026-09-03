import {
  Building2,
  Globe2,
  Lightbulb,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { aboutTranslations } from "../../i18n/locales/about";

const pillars = [
  { id: "vision", icon: Target, color: "blue" },
  { id: "quality", icon: ShieldCheck, color: "green" },
  { id: "innovation", icon: Lightbulb, color: "cyan" },
  { id: "people", icon: Users, color: "purple" },
] as const;



function About() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      aboutTranslations,
      locale,
      `about.${key}`
    );

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

              <h1>
                {t("title1")} <span>{t("title2")}</span>
              </h1>

              <p
                style={{
                  maxWidth: "790px",
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
                  href="/#contact"
                  className="button button--primary"
                >
                  {t("contact")}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "22px",
                maxWidth: "1080px",
                margin: "0 auto",
                alignItems: "stretch",
              }}
            >
              <article
                className="domain-card domain-blue"
                style={{
                  padding: "26px",
                  minHeight: "260px",
                }}
              >
                <div className="domain-card__top">
                  <div className="domain-icon">
                    <Building2
                      size={25}
                      strokeWidth={1.8}
                    />
                  </div>

                  <span className="domain-category">
                    {t("whoEyebrow")}
                  </span>
                </div>

                <h2>{t("whoTitle")}</h2>
                <p>{t("whoText1")}</p>
                <p style={{ marginTop: "12px" }}>
                  {t("whoText2")}
                </p>
              </article>

              <article
                className="domain-card domain-cyan"
                style={{
                  padding: "26px",
                  minHeight: "260px",
                }}
              >
                <div className="domain-card__top">
                  <div className="domain-icon">
                    <Globe2
                      size={25}
                      strokeWidth={1.8}
                    />
                  </div>

                  <span className="domain-category">
                    {t("reachEyebrow")}
                  </span>
                </div>

                <h2>{t("reachTitle")}</h2>
                <p>{t("reachText")}</p>

                <h3 style={{ marginTop: "22px" }}>
                  {t("audienceTitle")}
                </h3>
                <p>{t("audienceText")}</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section section--domains">
          <div className="container">
            <div
              className="section-heading"
              style={{
                textAlign: "center",
                maxWidth: "780px",
                margin: "0 auto 30px",
              }}
            >
              <h2>{t("valuesTitle")}</h2>
              <p>{t("valuesIntro")}</p>
            </div>

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
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                const title = t(
                  `items.${pillar.id}.title`
                );

                const description = t(
                  `items.${pillar.id}.description`
                );

                return (
                  <article
                    key={pillar.id}
                    className={`domain-card domain-${pillar.color}`}
                    style={{
                      minHeight: "205px",
                      padding: "20px",
                    }}
                  >
                    <div className="domain-card__top">
                      <div className="domain-icon">
                        <Icon
                          size={23}
                          strokeWidth={1.8}
                        />
                      </div>
                    </div>

                    <h3>{title}</h3>
                    <p>{description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div
              style={{
                maxWidth: "900px",
                margin: "0 auto",
                padding: "28px",
                borderRadius: "20px",
                border: "1px solid rgba(56,189,248,0.24)",
                background:
                  "linear-gradient(135deg, rgba(14,165,233,0.10), rgba(59,130,246,0.06))",
                textAlign: "center",
              }}
            >
              <h2>{t("ctaTitle")}</h2>

              <p
                style={{
                  maxWidth: "700px",
                  margin: "12px auto 0",
                }}
              >
                {t("ctaText")}
              </p>

              <a
                href="/#quote"
                className="button button--primary"
                style={{ marginTop: "22px" }}
              >
                {t("quote")}
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































































































































































export default About;
