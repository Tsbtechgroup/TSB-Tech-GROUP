import {
  BrainCircuit,
  Cpu,
  FlaskConical,
  Lightbulb,
  Network,
  Rocket,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { innovationTranslations } from "../../i18n/locales/innovation";

const pillars = [
  { id: "ideas", icon: Lightbulb, color: "cyan" },
  { id: "technology", icon: Cpu, color: "purple" },
  { id: "research", icon: FlaskConical, color: "blue" },
  { id: "connected", icon: Network, color: "green" },
  { id: "future", icon: BrainCircuit, color: "orange" },
] as const;



function Innovation() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      innovationTranslations,
      locale,
      `innovation.${key}`
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

                <a href="/#contact" className="button button--primary">
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
                      minHeight: "215px",
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
                border: "1px solid rgba(34,211,238,0.24)",
                background:
                  "linear-gradient(135deg, rgba(34,211,238,0.10), rgba(139,92,246,0.07))",
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
                  background: "rgba(34,211,238,0.12)",
                  border: "1px solid rgba(103,232,249,0.28)",
                }}
              >
                <Rocket size={27} strokeWidth={1.8} />
              </div>

              <h2>{t("projectTitle")}</h2>

              <p
                style={{
                  maxWidth: "700px",
                  margin: "12px auto 0",
                }}
              >
                {t("projectText")}
              </p>

              <a
                href="/#contact"
                className="button button--primary"
                style={{ marginTop: "22px" }}
              >
                {t("projectButton")}
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
























































































































export default Innovation;
