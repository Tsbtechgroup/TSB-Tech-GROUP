import { useEffect } from "react";

import Sectors from "../../components/layout/Sectors";
import QuoteFlow from "../../components/layout/QuoteFlow";
import Partners from "../../components/layout/Partners";
import Projects from "../../components/layout/Projects";
import Navbar from "../../components/layout/Navbar";
import ServicesGrid from "../../components/layout/ServicesGrid";
import Stats from "../../components/layout/Stats";
import Footer from "../../components/layout/Footer";
import News from "../../components/layout/News";
import ScrollToTop from "../../components/common/ScrollToTop";

import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { homeTranslations } from "../../i18n/locales/home";

import heroLogo from "../../assets/logos/tsb-logo-hero.jpg";

function Home() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      homeTranslations,
      locale,
      `home.${key}`
    );

  useEffect(() => {
    const scrollToCurrentHash = () => {
      const hash = window.location.hash;

      if (!hash) {
        return;
      }

      const elementId = decodeURIComponent(
        hash.replace("#", "")
      );

      const element = document.getElementById(elementId);

      if (!element) {
        return;
      }

      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    const timeoutId = window.setTimeout(
      scrollToCurrentHash,
      100
    );

    window.addEventListener(
      "hashchange",
      scrollToCurrentHash
    );

    return () => {
      window.clearTimeout(timeoutId);

      window.removeEventListener(
        "hashchange",
        scrollToCurrentHash
      );
    };
  }, []);

  return (
    <div>
      <Navbar />

      <main>
        <section id="top" className="hero">
          <div className="hero__glow hero__glow--left" />
          <div className="hero__glow hero__glow--right" />

          <div className="hero__content container">
            <img
              src={heroLogo}
              alt="TSB Tech Group"
              className="hero__logo"
            />

            <h1 className="hero__title">
              {t("heroTitle1")}
              <br />
              {t("heroTitle2")}
            </h1>

            <div
              className="hero__expertise"
              aria-label={t("sectorsLabel")}
            >
              <span>{t("technology")}</span>
              <i />
              <span>{t("security")}</span>
              <i />
              <span>{t("energy")}</span>
              <i />
              <span>{t("innovation")}</span>
            </div>

            <div className="hero__actions">
              <a
                href="#quote"
                className="button button--primary"
              >
                {t("quote")}
              </a>

              <a
                href="#expertise"
                className="button button--secondary"
              >
                {t("discoverServices")}
                <span aria-hidden="true">→</span>
              </a>
            </div>

            <p className="hero__location">
              {t("location")}
            </p>
          </div>
        </section>

        <section
          id="about"
          className="section section--about"
        >
          <div className="container about">
            <div className="about__heading">
              <span className="section__eyebrow">
                TSB TECH GROUP
              </span>

              <h2>
                {t("aboutTitle1")}
                <br />
                {t("aboutTitle2")}{" "}
                <span>
                  {t("aboutTitleHighlight")}
                </span>
              </h2>
            </div>

            <div className="about__content">
              <p>{t("aboutText1")}</p>
              <p>{t("aboutText2")}</p>

              <a
                href="#expertise"
                className="text-link"
              >
                {t("discoverExpertise")}
                <span>→</span>
              </a>
            </div>
          </div>
        </section>

        <div id="expertise">
          <ServicesGrid />
        </div>

        <Stats />

        <Projects />

        <Partners />

        <News />

        <div
          id="quote"
          style={{
            scrollMarginTop: "100px",
          }}
        >
          <QuoteFlow />
        </div>

        <Sectors />

        <section
          id="contact"
          className="section section--contact"
        >
          <div className="container contact-card">
            <div className="contact-card__content">
              <span className="section__eyebrow">
                {t("projectEyebrow")}
              </span>

              <h2>{t("projectTitle")}</h2>

              <p>{t("projectText")}</p>
            </div>

            <div className="contact-card__actions">
              <a
                href="mailto:contact@tsbtechgroup.com"
                className="button button--primary"
              >
                {t("contact")}
              </a>

              <a
                href="#expertise"
                className="button button--secondary"
              >
                {t("expertise")}
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















































































export default Home;
