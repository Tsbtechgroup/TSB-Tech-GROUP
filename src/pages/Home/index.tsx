import { useEffect, useMemo, useState } from "react";

import Sectors from "../../components/layout/Sectors";
import QuoteFlow from "../../components/layout/QuoteFlow";
import Partners from "../../components/layout/Partners";
import Navbar from "../../components/layout/Navbar";
import ServicesGrid from "../../components/layout/ServicesGrid";
import Stats from "../../components/layout/Stats";
import TrustBar from "../../components/layout/TrustBar";
import Footer from "../../components/layout/Footer";
import News from "../../components/layout/News";
import ScrollToTop from "../../components/common/ScrollToTop";

import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { homeTranslations } from "../../i18n/locales/home";

import heroAutomobile from "../../assets/images/hero-services/automobile.png";
import heroSecurity from "../../assets/images/hero-services/security.png";
import heroEnergy from "../../assets/images/hero-services/energy.png";
import heroAutomation from "../../assets/images/hero-services/automation.png";
import heroNetworks from "../../assets/images/hero-services/networks.png";

const HERO_SLIDE_INTERVAL = 6500;

const personalSpaceLabels: Record<string, string> = {
  fr: "Créer mon espace personnel",
  nl: "Mijn persoonlijke ruimte aanmaken",
  en: "Create my personal space",
  de: "Mein persönliches Konto erstellen",
  es: "Crear mi espacio personal",
  it: "Crea il mio spazio personale",
  pt: "Criar o meu espaço pessoal",
  ar: "إنشاء مساحتي الشخصية",
  tr: "Kişisel alanımı oluştur",
  zh: "创建我的个人空间",
};

function Home() {
  const { locale } = useLanguage();
  const [activeSlide, setActiveSlide] = useState(0);

  const t = (key: string) =>
    translate(homeTranslations, locale, `home.${key}`);

  const personalSpaceLabel =
    personalSpaceLabels[locale] ??
    personalSpaceLabels.fr;

  const heroSlides = useMemo(
    () => [
      {
        id: "automobile",
        label: t("technology"),
        className: "hero__slide--automobile",
        image: heroAutomobile,
      },
      {
        id: "security",
        label: t("security"),
        className: "hero__slide--security",
        image: heroSecurity,
      },
      {
        id: "energy",
        label: t("energy"),
        className: "hero__slide--energy",
        image: heroEnergy,
      },
      {
        id: "automation",
        label: t("innovation"),
        className: "hero__slide--automation",
        image: heroAutomation,
      },
      {
        id: "networks",
        label: t("technology"),
        className: "hero__slide--networks",
        image: heroNetworks,
      },
    ],
    [locale]
  );

  useEffect(() => {
    const scrollToCurrentHash = () => {
      const hash = window.location.hash;
      if (!hash) return;

      const elementId = decodeURIComponent(
        hash.replace("#", "")
      );
      const element = document.getElementById(elementId);

      element?.scrollIntoView({
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

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide(
        (current) =>
          (current + 1) % heroSlides.length
      );
    }, HERO_SLIDE_INTERVAL);

    return () => window.clearInterval(intervalId);
  }, [heroSlides.length]);

  const showPreviousSlide = () => {
    setActiveSlide((current) =>
      current === 0
        ? heroSlides.length - 1
        : current - 1
    );
  };

  const showNextSlide = () => {
    setActiveSlide(
      (current) =>
        (current + 1) % heroSlides.length
    );
  };

  return (
    <div>
      <Navbar />

      <main>
        <section
          id="top"
          className="hero hero--dynamic"
        >
          <div
            className="hero__slides"
            aria-hidden="true"
          >
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={[
                  "hero__slide",
                  slide.className,
                  index === activeSlide
                    ? "hero__slide--active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <img
                  src={slide.image}
                  alt=""
                  className="hero__slide-image"
                  loading={
                    index === 0 ? "eager" : "lazy"
                  }
                  decoding="async"
                />
              </div>
            ))}

            <div className="hero__media-overlay" />
          </div>

          <div className="hero__glow hero__glow--left" />
          <div className="hero__glow hero__glow--right" />

          <button
            type="button"
            className="hero__nav hero__nav--prev"
            onClick={showPreviousSlide}
            aria-label="Image précédente"
          >
            &lsaquo;
          </button>

          <button
            type="button"
            className="hero__nav hero__nav--next"
            onClick={showNextSlide}
            aria-label="Image suivante"
          >
            &rsaquo;
          </button>

          <div className="hero__content container">
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
                <span aria-hidden="true">
                  &rarr;
                </span>
              </a>
            </div>

            <p className="hero__location">
              {t("location")}
            </p>

            <div
              className="hero__pagination"
              aria-label={t("sectorsLabel")}
            >
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  className={
                    index === activeSlide
                      ? "hero__dot hero__dot--active"
                      : "hero__dot"
                  }
                  onClick={() =>
                    setActiveSlide(index)
                  }
                  aria-label={`${slide.label} ${index + 1}`}
                  aria-current={
                    index === activeSlide
                      ? "true"
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        </section>

        <TrustBar />

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
        <Partners />
        <News />

        <div
          id="quote"
          style={{ scrollMarginTop: "100px" }}
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
                href="/register"
                className="button button--primary"
              >
                {personalSpaceLabel}
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