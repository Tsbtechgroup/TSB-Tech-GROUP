import {
  Mail,
  ShieldCheck,
  Trash2,
  UserCheck,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { deleteAccountTranslations } from "../../i18n/locales/deleteAccount";

const EMAIL = "contact@tsbtechgroup.com";



function DeleteAccount() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      deleteAccountTranslations,
      locale,
      `deleteAccount.${key}`
    );

  const deletionMailto =
    `mailto:${EMAIL}?subject=${encodeURIComponent(
      t("emailSubject")
    )}`;

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
                  maxWidth: "790px",
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
                  {t("backHome")}
                </a>

                <a
                  href="/privacy"
                  className="button button--primary"
                >
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
                margin: "0 auto 22px",
                padding: "26px",
              }}
            >
              <div className="domain-card__top">
                <div className="domain-icon">
                  <Trash2 size={25} strokeWidth={1.8} />
                </div>
              </div>

              <h2>{t("requestTitle")}</h2>
              <p style={{ marginTop: "12px" }}>
                {t("requestText")}
              </p>

              <p style={{ marginTop: "14px" }}>
                <strong>{t("emailLabel")} :</strong>{" "}
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </p>

              <a
                href={deletionMailto}
                className="button button--primary"
                style={{ marginTop: "22px" }}
              >
                {t("requestButton")}
              </a>
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
              <article
                className="domain-card domain-cyan"
                style={{ padding: "22px" }}
              >
                <div className="domain-card__top">
                  <div className="domain-icon">
                    <UserCheck size={23} strokeWidth={1.8} />
                  </div>
                </div>

                <h3>{t("includeTitle")}</h3>

                <ul style={{ marginTop: "14px", paddingLeft: "20px" }}>
                  {[1, 2, 3].map((index) => {
                    const item = t(
                      `includeItem${index}`
                    );

                    return (
                      <li
                        key={item}
                        style={{ marginTop: "9px" }}
                      >
                        {item}
                      </li>
                    );
                  })}
                </ul>
              </article>

              <article
                className="domain-card domain-green"
                style={{ padding: "22px" }}
              >
                <div className="domain-card__top">
                  <div className="domain-icon">
                    <ShieldCheck size={23} strokeWidth={1.8} />
                  </div>
                </div>

                <h3>{t("deletedTitle")}</h3>
                <p style={{ marginTop: "12px" }}>
                  {t("deletedText")}
                </p>
              </article>
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
                maxWidth: "980px",
                margin: "0 auto",
              }}
            >
              <article
                className="domain-card domain-purple"
                style={{ padding: "24px" }}
              >
                <h3>{t("retainedTitle")}</h3>
                <p style={{ marginTop: "12px" }}>
                  {t("retainedText")}
                </p>
              </article>

              <article
                className="domain-card domain-blue"
                style={{ padding: "24px" }}
              >
                <h3>{t("appTitle")}</h3>
                <p style={{ marginTop: "12px" }}>
                  {t("appText")}
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
                <Mail size={25} strokeWidth={1.8} />
              </div>

              <h2>{t("helpTitle")}</h2>

              <p
                style={{
                  maxWidth: "700px",
                  margin: "12px auto 0",
                }}
              >
                {t("helpText")}
              </p>

              <a
                href={`mailto:${EMAIL}`}
                className="button button--primary"
                style={{ marginTop: "22px" }}
              >
                {t("contactButton")}
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













































































































export default DeleteAccount;
