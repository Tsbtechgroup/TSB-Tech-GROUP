import {
  BookOpen,
  Car,
  Cpu,
  GraduationCap,
  ShieldCheck,
  Zap,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { academyTranslations } from "../../i18n/locales/academy";

const categories = [
  { id: "automobile", icon: Car, color: "blue" },
  { id: "energy", icon: Zap, color: "orange" },
  { id: "security", icon: ShieldCheck, color: "green" },
  { id: "digital", icon: Cpu, color: "cyan" },
] as const;



function Academy() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      academyTranslations,
      locale,
      `academy.${key}`
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

        <section className="section">
          <div className="container">
            <div
              style={{
                maxWidth: "900px",
                margin: "0 auto 42px",
                padding: "28px",
                borderRadius: "20px",
                border: "1px solid rgba(139,92,246,0.25)",
                background:
                  "linear-gradient(135deg, rgba(139,92,246,0.10), rgba(59,130,246,0.06))",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  margin: "0 auto 16px",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "16px",
                  background: "rgba(139,92,246,0.14)",
                  border: "1px solid rgba(167,139,250,0.30)",
                }}
              >
                <GraduationCap
                  size={27}
                  strokeWidth={1.8}
                />
              </div>

              <span className="section__eyebrow">
                {t("comingSoon")}
              </span>

              <h2 style={{ marginTop: "10px" }}>
                {t("comingSoonTitle")}
              </h2>

              <p
                style={{
                  maxWidth: "720px",
                  margin: "12px auto 0",
                }}
              >
                {t("comingSoonText")}
              </p>

              <a
                href="/#contact"
                className="button button--primary"
                style={{ marginTop: "22px" }}
              >
                <BookOpen
                  size={17}
                  aria-hidden="true"
                />
                {t("notify")}
              </a>
            </div>

            <div
              className="section-heading"
              style={{
                textAlign: "center",
                maxWidth: "780px",
                margin: "0 auto 28px",
              }}
            >
              <h2>{t("categoriesTitle")}</h2>
              <p>{t("categoriesIntro")}</p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(230px, 1fr))",
                gap: "16px",
                maxWidth: "1120px",
                margin: "0 auto",
              }}
            >
              {categories.map((category) => {
                const Icon = category.icon;
                const title = t(
                  `items.${category.id}.title`
                );

                const description = t(
                  `items.${category.id}.description`
                );

                return (
                  <article
                    key={category.id}
                    className={`domain-card domain-${category.color}`}
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
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}












































































































export default Academy;
