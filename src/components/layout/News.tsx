import {
  ArrowRight,
  Cpu,
  Layers3,
  Rocket,
} from "lucide-react";

import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { newsTranslations } from "../../i18n/locales/news";

const newsConfig = [
  {
    id: "platform",
    icon: Rocket,
    color: "blue",
  },
  {
    id: "evolution",
    icon: Layers3,
    color: "cyan",
  },
  {
    id: "engineering",
    icon: Cpu,
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
  );
}


































export default News;
