import {
  BarChart3,
  Cookie,
  Settings2,
  ShieldCheck,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { cookiesTranslations } from "../../i18n/locales/cookies";

const cookieTypes = [
  { id: "necessary", icon: ShieldCheck, color: "green" },
  { id: "preferences", icon: Settings2, color: "blue" },
  { id: "analytics", icon: BarChart3, color: "cyan" },
] as const;



function Cookies() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      cookiesTranslations,
      locale,
      `cookies.${key}`
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
                  maxWidth: "780px",
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

                <a href="/privacy" className="button button--primary">
                  {t("privacy")}
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
                  <Cookie size={25} strokeWidth={1.8} />
                </div>
              </div>

              <h2>{t("whyTitle")}</h2>
              <p style={{ marginTop: "12px" }}>{t("whyText")}</p>
            </article>

            <div
              className="section-heading"
              style={{
                textAlign: "center",
                maxWidth: "760px",
                margin: "0 auto 28px",
              }}
            >
              <h2>{t("typesTitle")}</h2>
              <p>{t("typesIntro")}</p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "18px",
                maxWidth: "1050px",
                margin: "0 auto",
              }}
            >
              {cookieTypes.map((item) => {
                const Icon = item.icon;

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
                      minHeight: "230px",
                      padding: "22px",
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
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "18px",
                maxWidth: "1050px",
                margin: "0 auto",
              }}
            >
              <article
                className="domain-card domain-green"
                style={{ padding: "24px" }}
              >
                <h3>{t("consentTitle")}</h3>
                <p style={{ marginTop: "12px" }}>{t("consentText")}</p>
              </article>

              <article
                className="domain-card domain-blue"
                style={{ padding: "24px" }}
              >
                <h3>{t("browserTitle")}</h3>
                <p style={{ marginTop: "12px" }}>{t("browserText")}</p>
              </article>

              <article
                className="domain-card domain-cyan"
                style={{ padding: "24px" }}
              >
                <h3>{t("thirdPartyTitle")}</h3>
                <p style={{ marginTop: "12px" }}>{t("thirdPartyText")}</p>
              </article>

              <article
                className="domain-card domain-purple"
                style={{ padding: "24px" }}
              >
                <h3>{t("changesTitle")}</h3>
                <p style={{ marginTop: "12px" }}>{t("changesText")}</p>
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
              <h2>{t("contactTitle")}</h2>

              <p
                style={{
                  maxWidth: "700px",
                  margin: "12px auto 0",
                }}
              >
                {t("contactText")}
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
                  href="/contact"
                  className="button button--primary"
                >
                  {t("contactButton")}
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




































































































































































export default Cookies;
