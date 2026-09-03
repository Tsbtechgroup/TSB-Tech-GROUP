import {
  ArrowRight,
  Languages,
  ShoppingBag,
  Smartphone,
} from "lucide-react";

import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { newsTranslations } from "../../i18n/locales/news";

const newsConfig = [
  {
    id: "multilingual",
    icon: Languages,
    color: "cyan",
  },
  {
    id: "store",
    icon: ShoppingBag,
    color: "blue",
  },
  {
    id: "android",
    icon: Smartphone,
    color: "purple",
  },
] as const;

function News() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      newsTranslations,
      locale,
      `news.${key}`
    );

  return (
    <section
      id="news"
      className="section section--domains"
    >
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
          {newsConfig.map((item) => {
            const Icon = item.icon;

            const category = t(
              `items.${item.id}.category`
            );

            const date = t(
              `items.${item.id}.date`
            );

            const status = t(
              `items.${item.id}.status`
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
              >
                <div className="domain-card__top">
                  <div className="domain-icon">
                    <Icon
                      size={25}
                      strokeWidth={1.8}
                    />
                  </div>

                  <span className="domain-category">
                    {category}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    margin: "14px 0 10px",
                    fontSize: ".78rem",
                    opacity: 0.82,
                  }}
                >
                  <span>{date}</span>
                  <span aria-hidden="true">•</span>
                  <span>{status}</span>
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

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "26px",
          }}
        >
          <a
            href="/news"
            className="button button--secondary"
          >
            {t("viewAll")}
            <ArrowRight
              size={17}
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </section>
  );
}

export default News;
