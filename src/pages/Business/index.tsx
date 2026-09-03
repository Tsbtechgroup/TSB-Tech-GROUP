import {
  Building2,
  ClipboardCheck,
  Cpu,
  Network,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { businessTranslations } from "../../i18n/locales/business";

const solutions = [
  { id: "audit", icon: ClipboardCheck, color: "blue" },
  { id: "security", icon: ShieldCheck, color: "green" },
  { id: "network", icon: Network, color: "cyan" },
  { id: "automation", icon: Cpu, color: "purple" },
  { id: "maintenance", icon: Wrench, color: "orange" },
] as const;



function Business() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      businessTranslations,
      locale,
      `business.${key}`
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
                maxWidth: "780px",
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
                  "repeat(auto-fit, minmax(230px, 1fr))",
                gap: "16px",
                maxWidth: "1120px",
                margin: "0 auto",
              }}
            >
              {solutions.map((solution) => {
                const Icon = solution.icon;
                const title = t(
                  `items.${solution.id}.title`
                );

                const description = t(
                  `items.${solution.id}.description`
                );

                return (
                  <article
                    key={solution.id}
                    className={`domain-card domain-${solution.color}`}
                    style={{
                      minHeight: "210px",
                      padding: "20px",
                    }}
                  >
                    <div className="domain-card__top">
                      <div className="domain-icon">
                        <Icon size={23} strokeWidth={1.8} />
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
                border: "1px solid rgba(59,130,246,0.25)",
                background:
                  "linear-gradient(135deg, rgba(59,130,246,0.10), rgba(14,165,233,0.06))",
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
                  background: "rgba(59,130,246,0.14)",
                  border: "1px solid rgba(96,165,250,0.30)",
                }}
              >
                <Building2 size={26} strokeWidth={1.8} />
              </div>

              <h2>{t("contactTitle")}</h2>

              <p
                style={{
                  maxWidth: "700px",
                  margin: "12px auto 0",
                }}
              >
                {t("contactText")}
              </p>

              <a
                href="/#contact"
                className="button button--primary"
                style={{ marginTop: "22px" }}
              >
                {t("contact")}
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
























































































































export default Business;
