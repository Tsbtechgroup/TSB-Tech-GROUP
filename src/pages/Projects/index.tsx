import {
  ArrowRight,
  Car,
  CheckCircle2,
  ClipboardCheck,
  Globe2,
  Network,
  Search,
  Settings2,
  ShieldCheck,
  Wrench,
  Zap,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { projectsPageTranslations } from "../../i18n/locales/projectsPage";

const domainConfig = [
  { id: "automobile", icon: Car, color: "blue" },
  { id: "security", icon: ShieldCheck, color: "green" },
  { id: "energy", icon: Zap, color: "orange" },
  { id: "industry", icon: Wrench, color: "yellow" },
  { id: "digital", icon: Globe2, color: "cyan" },
  { id: "networks", icon: Network, color: "blue" },
] as const;

const methodConfig = [
  { id: "need", icon: Search },
  { id: "study", icon: ClipboardCheck },
  { id: "solution", icon: Settings2 },
  { id: "execution", icon: Wrench },
  { id: "followup", icon: CheckCircle2 },
] as const;

function Projects() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      projectsPageTranslations,
      locale,
      `projectsPage.${key}`
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
                maxWidth: "960px",
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
                <a href="/#top" className="button button--secondary">
                  ← {t("backHome")}
                </a>

                <a href="/#quote" className="button button--primary">
                  {t("quote")}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section section--domains">
          <div className="container">
            <div
              className="section-heading"
              style={{
                textAlign: "center",
                maxWidth: "820px",
                margin: "0 auto 30px",
              }}
            >
              <span className="section__eyebrow">
                {t("domainsEyebrow")}
              </span>
              <h2>{t("domainsTitle")}</h2>
              <p>{t("domainsIntro")}</p>
            </div>

            <div
              className="domains-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(245px, 1fr))",
                gap: "18px",
                maxWidth: "1160px",
                margin: "0 auto",
              }}
            >
              {domainConfig.map((domain) => {
                const Icon = domain.icon;

                return (
                  <article
                    className={`domain-card domain-${domain.color}`}
                    key={domain.id}
                    style={{
                      minHeight: "240px",
                      padding: "20px",
                    }}
                  >
                    <div className="domain-card__top">
                      <div className="domain-icon">
                        <Icon size={23} strokeWidth={1.8} />
                      </div>

                      <span className="domain-category">
                        {t(`items.${domain.id}.category`)}
                      </span>
                    </div>

                    <h3>{t(`items.${domain.id}.title`)}</h3>
                    <p>{t(`items.${domain.id}.description`)}</p>

                    <a href="/#quote">
                      {t("discuss")}
                      <span aria-hidden="true">
                        <ArrowRight size={15} />
                      </span>
                    </a>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section section--about">
          <div className="container">
            <div
              className="section-heading"
              style={{
                textAlign: "center",
                maxWidth: "860px",
                margin: "0 auto 30px",
              }}
            >
              <span className="section__eyebrow">
                {t("methodEyebrow")}
              </span>
              <h2>{t("methodTitle")}</h2>
              <p>{t("methodIntro")}</p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(190px, 1fr))",
                gap: "16px",
                maxWidth: "1160px",
                margin: "0 auto",
              }}
            >
              {methodConfig.map((step, index) => {
                const Icon = step.icon;

                return (
                  <article
                    key={step.id}
                    className="domain-card domain-blue"
                    style={{
                      minHeight: "220px",
                      padding: "20px",
                    }}
                  >
                    <div className="domain-card__top">
                      <div className="domain-icon">
                        <Icon size={22} strokeWidth={1.8} />
                      </div>

                      <span className="domain-category">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <h3>{t(`steps.${step.id}.title`)}</h3>
                    <p>{t(`steps.${step.id}.description`)}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section section--domains">
          <div className="container">
            <div
              className="section-heading"
              style={{
                textAlign: "center",
                maxWidth: "850px",
                margin: "0 auto 30px",
              }}
            >
              <span className="section__eyebrow">
                {t("showcaseEyebrow")}
              </span>
              <h2>{t("showcaseTitle")}</h2>
              <p>{t("showcaseIntro")}</p>
            </div>

            <article
              className="domain-card domain-cyan"
              style={{
                maxWidth: "900px",
                margin: "0 auto",
                padding: "28px",
              }}
            >
              <div className="domain-card__top">
                <div className="domain-icon">
                  <Globe2 size={24} strokeWidth={1.8} />
                </div>

                <span className="domain-category">
                  {t("showcaseInternalCategory")}
                </span>
              </div>

              <h3>{t("showcaseInternalTitle")}</h3>

              <p
                style={{
                  marginBottom: "10px",
                  fontWeight: 700,
                  color: "rgba(125, 211, 252, 0.92)",
                }}
              >
                {t("showcaseInternalMeta")}
              </p>

              <p>{t("showcaseInternalDescription")}</p>

              <a href="/news">
                {t("showcaseInternalLink")}
                <span aria-hidden="true">
                  <ArrowRight size={15} />
                </span>
              </a>
            </article>

            <p
              style={{
                maxWidth: "820px",
                margin: "22px auto 0",
                textAlign: "center",
                color: "rgba(255,255,255,0.68)",
                fontSize: "0.94rem",
              }}
            >
              {t("referencesNote")}
            </p>
          </div>
        </section>

        <section className="section section--about">
          <div className="container">
            <div
              className="section-heading"
              style={{
                textAlign: "center",
                maxWidth: "820px",
                margin: "0 auto",
              }}
            >
              <span className="section__eyebrow">
                {t("ctaEyebrow")}
              </span>
              <h2>{t("ctaTitle")}</h2>
              <p>{t("ctaText")}</p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                <a href="/#quote" className="button button--primary">
                  {t("ctaQuote")}
                </a>

                <a href="/contact" className="button button--secondary">
                  {t("ctaContact")}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default Projects;
