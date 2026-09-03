import {
  CircleHelp,
  Headphones,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { useState } from "react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { supportTranslations } from "../../i18n/locales/support";

const PHONE_NUMBER = "+32466327536";
const PHONE_DISPLAY = "+32 466 32 75 36";

const WHATSAPP_URL = "https://wa.me/32493964587";
const WHATSAPP_DISPLAY = "+32 493 96 45 87";

const EMAIL = "contact@tsbtechgroup.com";

const supportTypes = [
  { id: "technical", icon: Wrench, color: "blue" },
  { id: "account", icon: ShieldCheck, color: "green" },
  { id: "general", icon: CircleHelp, color: "cyan" },
] as const;



function Support() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      supportTranslations,
      locale,
      `support.${key}`
    );

  const [emailCopied, setEmailCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setEmailCopied(true);
      window.setTimeout(() => setEmailCopied(false), 1800);
    } catch {
      window.prompt(t("copyPrompt"), EMAIL);
    }
  };

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
                  href="/client"
                  className="button button--primary"
                >
                  {t("clientArea")}
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
              <h2>{t("supportTitle")}</h2>
              <p>{t("supportIntro")}</p>
            </div>

            <div
              className="domains-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "18px",
                maxWidth: "1000px",
                margin: "0 auto",
              }}
            >
              {supportTypes.map((support) => {
                const Icon = support.icon;

                const title = t(
                  `items.${support.id}.title`
                );

                const description = t(
                  `items.${support.id}.description`
                );

                return (
                  <article
                    key={support.id}
                    className={`domain-card domain-${support.color}`}
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
              className="section-heading"
              style={{
                textAlign: "center",
                maxWidth: "760px",
                margin: "0 auto 30px",
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
                  background: "rgba(14,165,233,0.12)",
                  border: "1px solid rgba(125,211,252,0.28)",
                }}
              >
                <Headphones size={26} strokeWidth={1.8} />
              </div>

              <h2>{t("contactTitle")}</h2>
              <p>{t("contactIntro")}</p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "18px",
                maxWidth: "1000px",
                margin: "0 auto",
              }}
            >
              <article
                className="domain-card domain-blue"
                style={{ padding: "20px" }}
              >
                <div className="domain-card__top">
                  <div className="domain-icon">
                    <Phone size={23} strokeWidth={1.8} />
                  </div>
                </div>

                <h3>{t("phone")}</h3>
                <p>{PHONE_DISPLAY}</p>
                <p>{t("phoneText")}</p>

                <a href={`tel:${PHONE_NUMBER}`}>
                  {t("call")}
                  <span aria-hidden="true">→</span>
                </a>
              </article>

              <article
                className="domain-card domain-green"
                style={{ padding: "20px" }}
              >
                <div className="domain-card__top">
                  <div className="domain-icon">
                    <MessageCircle size={23} strokeWidth={1.8} />
                  </div>
                </div>

                <h3>{t("whatsapp")}</h3>
                <p>{WHATSAPP_DISPLAY}</p>
                <p>{t("whatsappText")}</p>

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("openWhatsapp")}
                  <span aria-hidden="true">→</span>
                </a>
              </article>

              <article
                className="domain-card domain-cyan"
                style={{ padding: "20px" }}
              >
                <div className="domain-card__top">
                  <div className="domain-icon">
                    <Mail size={23} strokeWidth={1.8} />
                  </div>
                </div>

                <h3>{t("email")}</h3>

                <p>
                  <a
                    href={`mailto:${EMAIL}`}
                    style={{
                      fontWeight: 700,
                      textDecoration: "underline",
                      textUnderlineOffset: "3px",
                    }}
                  >
                    {EMAIL}
                  </a>
                </p>

                <p>{t("emailText")}</p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginTop: "12px",
                  }}
                >
                  <a
                    href={`mailto:${EMAIL}?subject=${encodeURIComponent(
                      t("emailSubject")
                    )}`}
                  >
                    {t("sendEmail")}
                    <span aria-hidden="true">→</span>
                  </a>

                  <button
                    type="button"
                    onClick={copyEmail}
                    style={{
                      border: "1px solid rgba(148,163,184,0.28)",
                      background: "rgba(15,23,42,0.18)",
                      color: "inherit",
                      borderRadius: "10px",
                      padding: "8px 11px",
                      cursor: "pointer",
                      font: "inherit",
                    }}
                  >
                    {emailCopied ? t("emailCopied") : t("copyEmail")}
                  </button>
                </div>
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
                href="/#quote"
                className="button button--primary"
                style={{ marginTop: "22px" }}
              >
                {t("quote")}
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























































































































































export default Support;
