import { ArrowRight } from "lucide-react";

import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { brandsTranslations } from "../../i18n/locales/brands";

const technologies = [
  "XHORSE",
  "AUTEL",
  "CGDI",
  "OBDSTAR",
  "LAUNCH",
  "HIKVISION",
  "DAHUA",
  "DJI",
];

function Partners() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      brandsTranslations,
      locale,
      `brands.${key}`
    );

  return (
    <section
      id="partners"
      className="partners-section"
    >
      <div className="container">
        <div className="partners-heading">
          <span className="section__eyebrow">
            {t("eyebrow")}
          </span>

          <h2>
            {t("title1")}{" "}
            <span>{t("title2")}</span>
          </h2>

          <p>{t("description")}</p>
        </div>

        <div className="partners-grid">
          {technologies.map((technology) => (
            <article
              className="partner-card"
              key={technology}
            >
              <span>{technology}</span>
            </article>
          ))}

          <article className="partner-card">
            <span>{t("others")}</span>
          </article>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "28px",
          }}
        >
          <a
            href="/partners"
            className="button button--primary"
          >
            {t("discover")}

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

export default Partners;