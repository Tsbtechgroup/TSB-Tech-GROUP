import {
  ArrowLeft,
  Home,
  SearchX,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";

import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { notFoundTranslations } from "../../i18n/locales/notFound";

function NotFound() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      notFoundTranslations,
      locale,
      `notFound.${key}`
    );

  return (
    <div>
      <Navbar />

      <main>
        <section
          className="section section--about"
          style={{
            minHeight: "72vh",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div className="container">
            <div
              style={{
                maxWidth: "820px",
                margin: "0 auto",
                padding: "36px 28px",
                borderRadius: "24px",
                border:
                  "1px solid rgba(56,189,248,0.24)",
                background:
                  "linear-gradient(135deg, rgba(14,165,233,0.09), rgba(59,130,246,0.05))",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  margin: "0 auto 18px",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "18px",
                  background:
                    "rgba(14,165,233,0.12)",
                  border:
                    "1px solid rgba(125,211,252,0.28)",
                }}
              >
                <SearchX
                  size={30}
                  strokeWidth={1.8}
                />
              </div>

              <span className="section__eyebrow">
                {t("eyebrow")}
              </span>

              <h1 style={{ marginTop: "10px" }}>
                {t("title1")}{" "}
                <span>{t("title2")}</span>
              </h1>

              <p
                style={{
                  maxWidth: "650px",
                  margin: "16px auto 0",
                }}
              >
                {t("text")}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginTop: "26px",
                }}
              >
                <a
                  href="/"
                  className="button button--primary"
                >
                  <Home
                    size={17}
                    aria-hidden="true"
                  />
                  {t("home")}
                </a>

                <a
                  href="/contact"
                  className="button button--secondary"
                >
                  <ArrowLeft
                    size={17}
                    aria-hidden="true"
                  />
                  {t("contact")}
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

export default NotFound;
