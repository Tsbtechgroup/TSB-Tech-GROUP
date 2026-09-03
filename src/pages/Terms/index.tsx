import {
  AlertTriangle,
  FileCheck2,
  Scale,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { termsTranslations } from "../../i18n/locales/terms";

const sections = [
  { id: "access", icon: UserRoundCheck, color: "blue" },
  { id: "services", icon: FileCheck2, color: "cyan" },
  { id: "responsibility", icon: ShieldCheck, color: "green" },
  { id: "limits", icon: AlertTriangle, color: "orange" },
] as const;



function Terms() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      termsTranslations,
      locale,
      `terms.${key}`
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
              <span className="section__eyebrow">{t("eyebrow")}</span>

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

              <p
                style={{
                  marginTop: "14px",
                  fontSize: "0.9rem",
                  opacity: 0.75,
                }}
              >
                {t("updated")}
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

                <a href="/contact" className="button button--primary">
                  {t("contact")}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <article
              className="domain-card domain-blue"
              style={{
                maxWidth: "980px",
                margin: "0 auto 34px",
                padding: "26px",
              }}
            >
              <div className="domain-card__top">
                <div className="domain-icon">
                  <Scale size={24} strokeWidth={1.8} />
                </div>
              </div>

              <h2>{t("introTitle")}</h2>
              <p style={{ marginTop: "12px" }}>
                {t("introText")}
              </p>
            </article>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "18px",
                maxWidth: "1120px",
                margin: "0 auto",
              }}
            >
              {sections.map((section) => {
                const Icon = section.icon;

                const title = t(
                  `sections.${section.id}.title`
                );

                const paragraphs = [1, 2, 3].map(
                  (index) =>
                    t(
                      `sections.${section.id}.paragraph${index}`
                    )
                );

                return (
                  <article
                    key={section.id}
                    className={`domain-card domain-${section.color}`}
                    style={{
                      minHeight: "320px",
                      padding: "22px",
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

                    {paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        style={{ marginTop: "12px" }}
                      >
                        {paragraph}
                      </p>
                    ))}
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
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "18px",
                maxWidth: "1050px",
                margin: "0 auto",
              }}
            >
              <article
                className="domain-card domain-cyan"
                style={{ padding: "24px" }}
              >
                <h3>{t("ipTitle")}</h3>
                <p style={{ marginTop: "12px" }}>
                  {t("ipText")}
                </p>
              </article>

              <article
                className="domain-card domain-purple"
                style={{ padding: "24px" }}
              >
                <h3>{t("lawTitle")}</h3>
                <p style={{ marginTop: "12px" }}>
                  {t("lawText")}
                </p>
              </article>

              <article
                className="domain-card domain-orange"
                style={{ padding: "24px" }}
              >
                <h3>{t("changesTitle")}</h3>
                <p style={{ marginTop: "12px" }}>
                  {t("changesText")}
                </p>
              </article>
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
              <h2>{t("privacyTitle")}</h2>

              <p
                style={{
                  maxWidth: "700px",
                  margin: "12px auto 0",
                }}
              >
                {t("privacyText")}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginTop: "22px",
                }}
              >
                <a
                  href="/privacy"
                  className="button button--secondary"
                >
                  {t("privacyButton")}
                </a>

                <a
                  href="/cookies"
                  className="button button--secondary"
                >
                  {t("cookiesButton")}
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
                margin: "0 auto",
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
                href="/contact"
                className="button button--primary"
                style={{ marginTop: "22px" }}
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




















































































































































































































export default Terms;
