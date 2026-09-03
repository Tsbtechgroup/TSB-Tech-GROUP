import {
  Car,
  ShieldCheck,
  Sun,
  Zap,
  Globe2,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { projectsPageTranslations } from "../../i18n/locales/projectsPage";

const projectConfig = [
  {
    id: "automobile",
    icon: Car,
    color: "blue",
  },
  {
    id: "security",
    icon: ShieldCheck,
    color: "green",
  },
  {
    id: "solar",
    icon: Sun,
    color: "orange",
  },
  {
    id: "industry",
    icon: Zap,
    color: "yellow",
  },
  {
    id: "digital",
    icon: Globe2,
    color: "cyan",
  },
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
                  "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "18px",
                maxWidth: "1120px",
                margin: "0 auto",
              }}
            >
              {projectConfig.map((project) => {
                const Icon = project.icon;

                const category = t(
                  `items.${project.id}.category`
                );

                const title = t(
                  `items.${project.id}.title`
                );

                const description = t(
                  `items.${project.id}.description`
                );

                return (
                  <article
                    className={`domain-card domain-${project.color}`}
                    key={project.id}
                    style={{
                      minHeight: "230px",
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

                      <span className="domain-category">
                        {category}
                      </span>
                    </div>

                    <h3>{title}</h3>

                    <p>{description}</p>

                    <a href="/#quote">
                      {t("discuss")}
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

export default Projects;
