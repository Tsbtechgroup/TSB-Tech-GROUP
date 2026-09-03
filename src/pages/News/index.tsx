import {
  ArrowLeft,
  ArrowRight,
  Cpu,
  Layers3,
  Rocket,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { newsPageTranslations } from "../../i18n/locales/newsPage";

const newsConfig = [
  { id: "platform", icon: Rocket, color: "blue" },
  { id: "evolution", icon: Layers3, color: "cyan" },
  { id: "engineering", icon: Cpu, color: "purple" },
] as const;

type NewsId = (typeof newsConfig)[number]["id"];



function News() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      newsPageTranslations,
      locale,
      `newsPage.${key}`
    );

  const articleParam = new URLSearchParams(
    window.location.search
  ).get("article");

  const selectedId = newsConfig.some(
    (item) => item.id === articleParam
  )
    ? (articleParam as NewsId)
    : null;

  if (selectedId) {
    const item = newsConfig.find(
      (entry) => entry.id === selectedId
    )!;
    const Icon = item.icon;

    const category = t(
      `items.${selectedId}.category`
    );

    const title = t(
      `items.${selectedId}.title`
    );

    const description = t(
      `items.${selectedId}.description`
    );

    const details = [1, 2, 3].map((index) =>
      t(`items.${selectedId}.detail${index}`)
    );

    return (
      <div>
        <Navbar />

        <main>
          <section className="section section--about">
            <div className="container">
              <article
                className={`domain-card domain-${item.color}`}
                style={{
                  maxWidth: "900px",
                  margin: "0 auto",
                  padding: "30px",
                }}
              >
                <div className="domain-card__top">
                  <div className="domain-icon">
                    <Icon size={28} strokeWidth={1.8} />
                  </div>

                  <span className="domain-category">
                    {category}
                  </span>
                </div>

                <h1 style={{ marginTop: "18px" }}>
                  {title}
                </h1>

                <p
                  style={{
                    fontSize: "1.08rem",
                    marginTop: "16px",
                  }}
                >
                  {description}
                </p>

                <div
                  style={{
                    display: "grid",
                    gap: "14px",
                    marginTop: "28px",
                  }}
                >
                  {details.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginTop: "30px",
                  }}
                >
                  <a
                    href="/news"
                    className="button button--secondary"
                  >
                    <ArrowLeft size={17} />
                    {t("backNews")}
                  </a>

                  <a
                    href="/#contact"
                    className="button button--primary"
                  >
                    {t("contact")}
                  </a>
                </div>
              </article>
            </div>
          </section>
        </main>

        <Footer />
        <ScrollToTop />
      </div>
    );
  }

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
                  href="/#contact"
                  className="button button--primary"
                >
                  {t("contact")}
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
                maxWidth: "760px",
                margin: "0 auto 30px",
              }}
            >
              <h2>{t("sectionTitle")}</h2>
              <p>{t("sectionIntro")}</p>
            </div>

            <div
              className="domains-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "18px",
                maxWidth: "1120px",
                margin: "0 auto",
              }}
            >
              {newsConfig.map((item) => {
                const Icon = item.icon;

                const category = t(
                  `items.${item.id}.category`
                );

                const title = t(
                  `items.${item.id}.title`
                );

                const description = t(
                  `items.${item.id}.description`
                );

                return (
                  <article
                    key={item.id}
                    className={`domain-card domain-${item.color}`}
                    style={{
                      minHeight: "245px",
                      padding: "20px",
                    }}
                  >
                    <div className="domain-card__top">
                      <div className="domain-icon">
                        <Icon size={24} strokeWidth={1.8} />
                      </div>

                      <span className="domain-category">
                        {category}
                      </span>
                    </div>

                    <h3>{title}</h3>
                    <p>{description}</p>

                    <a href={`/news?article=${item.id}`}>
                      {t("learnMore")}
                      <ArrowRight
                        size={16}
                        aria-hidden="true"
                      />
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






















































































































export default News;
