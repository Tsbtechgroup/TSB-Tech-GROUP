import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FileText,
  MessageCircle,
  UserRound,
} from "lucide-react";

import BrandLogo from "../common/BrandLogo";
import { useLanguage } from "../../context/LanguageContext";
import {
  translate,
  type LocaleCode,
} from "../../i18n";
import { navbarTranslations } from "../../i18n/locales/navbar";

const WHATSAPP_URL = "https://wa.me/32493964587";


function Navbar() {
  const [servicesOpen, setServicesOpen] =
    useState(false);
  const [ecosystemOpen, setEcosystemOpen] =
    useState(false);
  const [languageOpen, setLanguageOpen] =
    useState(false);
  const [mobileOpen, setMobileOpen] =
    useState(false);
  const [accountOpen, setAccountOpen] =
    useState(false);

  const {
    locale,
    setLocale,
    availableLocales,
    t: i18nT,
  } = useLanguage();

  const headerRef =
    useRef<HTMLElement | null>(null);

  const navT = (
    key: string
  ) =>
    translate(
      navbarTranslations,
      locale,
      `navbar.${key}`
    );

  const currentLocale =
    availableLocales.find(
      (item) => item.code === locale
    ) ?? availableLocales[0];

  const toggleServices = () => {
    setServicesOpen(
      (previous) => !previous
    );
    setEcosystemOpen(false);
    setLanguageOpen(false);
    setAccountOpen(false);
  };

  const toggleEcosystem = () => {
    setEcosystemOpen(
      (previous) => !previous
    );
    setServicesOpen(false);
    setLanguageOpen(false);
    setAccountOpen(false);
  };

  const toggleLanguage = () => {
    setLanguageOpen(
      (previous) => !previous
    );
    setServicesOpen(false);
    setEcosystemOpen(false);
    setAccountOpen(false);
  };

  const toggleAccount = () => {
    setAccountOpen(
      (previous) => !previous
    );
    setServicesOpen(false);
    setEcosystemOpen(false);
    setLanguageOpen(false);
  };

  const toggleMobile = () => {
    setMobileOpen(
      (previous) => !previous
    );
    setServicesOpen(false);
    setEcosystemOpen(false);
    setLanguageOpen(false);
    setAccountOpen(false);
  };

  const closeDropdowns = () => {
    setServicesOpen(false);
    setEcosystemOpen(false);
    setLanguageOpen(false);
    setAccountOpen(false);
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  const changeLocale = (
    newLocale: LocaleCode
  ) => {
    setLocale(newLocale);
    setLanguageOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      const target =
        event.target as Node;

      if (
        headerRef.current &&
        !headerRef.current.contains(target)
      ) {
        closeDropdowns();
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="tsb-header"
    >
      <style>{`
        .tsb-header {
          overflow: visible !important;
        }

        .tsb-header-inner {
          gap: 12px !important;
          padding-left: 14px !important;
          padding-right: 14px !important;
          overflow: visible !important;
        }

        .tsb-header-brand {
          flex: 0 0 auto;
        }

        .tsb-header-nav {
          flex: 1 1 auto;
          min-width: 0;
          gap: 11px !important;
          justify-content: center;
        }

        .tsb-header-nav > a,
        .tsb-nav-dropdown-button {
          padding-left: 2px !important;
          padding-right: 2px !important;
          font-size: 0.74rem !important;
          white-space: nowrap;
        }

        .tsb-header-actions {
          flex: 0 0 auto;
          gap: 6px !important;
          overflow: visible !important;
        }

        .tsb-language {
          position: relative;
          overflow: visible !important;
        }

        .tsb-header-actions .tsb-language-button {
          min-height: 34px !important;
          padding: 0 8px !important;
          border-radius: 10px !important;
          font-size: 0.72rem !important;
          white-space: nowrap;
        }


        .tsb-language-button--international {
          display: inline-flex !important;
          align-items: center;
          gap: 6px;
        }

        .tsb-language-button--international .tsb-language-globe {
          width: 17px;
          height: 17px;
          display: inline-grid;
          place-items: center;
          border-radius: 50%;
          border: 1px solid rgba(56,189,248,0.30);
          background: rgba(56,189,248,0.08);
          color: #7dd3fc;
          font-size: 0.68rem;
          line-height: 1;
        }

        .tsb-language-menu--international {
          position: absolute;
          top: calc(100% + 9px);
          right: 0;
          z-index: 10060;
          width: 238px;
          max-height: min(430px, 72vh);
          overflow-y: auto;
          overscroll-behavior: contain;
          padding: 8px;
          display: grid;
          gap: 4px;
          border: 1px solid rgba(56, 189, 248, 0.22);
          border-radius: 15px;
          background: rgba(7, 18, 31, 0.99);
          box-shadow:
            0 20px 50px rgba(0,0,0,0.48),
            0 0 28px rgba(56,189,248,0.08);
          backdrop-filter: blur(18px);
        }

        .tsb-language-menu--international::-webkit-scrollbar {
          width: 7px;
        }

        .tsb-language-menu--international::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: rgba(148,163,184,0.28);
        }

        .tsb-language-option {
          width: 100%;
          min-height: 43px;
          padding: 0 10px;
          display: grid;
          grid-template-columns: 38px minmax(0,1fr) 18px;
          align-items: center;
          gap: 8px;
          border: 1px solid transparent;
          border-radius: 11px;
          background: transparent;
          color: rgba(255,255,255,0.84);
          cursor: pointer;
          text-align: left;
          transition:
            background 0.16s ease,
            border-color 0.16s ease,
            color 0.16s ease;
        }

        .tsb-language-option:hover {
          background: rgba(56,189,248,0.08);
          color: #fff;
        }

        .tsb-language-option.is-active {
          border-color: rgba(56,189,248,0.38);
          background: rgba(56,189,248,0.12);
          color: #fff;
        }

        .tsb-language-option__code {
          min-width: 34px;
          min-height: 25px;
          display: inline-grid;
          place-items: center;
          border-radius: 7px;
          background: rgba(255,255,255,0.055);
          color: #7dd3fc;
          font-size: 0.68rem;
          font-weight: 900;
          letter-spacing: 0.04em;
        }

        .tsb-language-option__name {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.77rem;
          font-weight: 800;
        }

        .tsb-language-option__check {
          color: #38bdf8;
          font-size: 0.76rem;
          font-weight: 900;
          text-align: center;
        }

        .tsb-mobile-ecosystem {
          margin: 4px 0 8px;
          padding: 12px;
          border: 1px solid rgba(56,189,248,0.16);
          border-radius: 14px;
          background:
            linear-gradient(135deg, rgba(14,165,233,0.08), rgba(59,130,246,0.04));
        }

        .tsb-mobile-ecosystem__label {
          display: block;
          margin-bottom: 8px;
          color: #7dd3fc;
          font-size: 0.68rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .tsb-mobile-ecosystem__links {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 7px;
        }

        .tsb-mobile-ecosystem__links a {
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          padding: 0 10px;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.88);
          font-size: 0.76rem;
          font-weight: 800;
          text-decoration: none;
        }

        .tsb-mobile-ecosystem__links a:hover {
          border-color: rgba(56,189,248,0.26);
          background: rgba(56,189,248,0.08);
          color: #ffffff;
        }

        .tsb-mobile-language-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          padding: 14px 0 6px;
          border-top: 1px solid rgba(255,255,255,0.12);
        }

        .tsb-mobile-language-option {
          min-height: 44px;
          padding: 0 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.04);
          color: #fff;
          font-weight: 800;
          cursor: pointer;
          text-align: left;
        }

        .tsb-mobile-language-option.is-active {
          border-color: rgba(59,130,246,0.95);
          background: rgba(37,99,235,0.22);
        }

        .tsb-mobile-language-option small {
          color: rgba(255,255,255,0.62);
          font-size: 0.68rem;
          font-weight: 800;
        }

        .tsb-account-menu {
          position: absolute;
          top: calc(100% + 9px);
          right: 0;
          z-index: 10050;
          min-width: 190px;
          padding: 7px;
          border: 1px solid rgba(56, 189, 248, 0.22);
          border-radius: 14px;
          background: rgba(7, 18, 31, 0.985);
          box-shadow:
            0 18px 45px rgba(0, 0, 0, 0.42),
            0 0 24px rgba(56, 189, 248, 0.08);
          backdrop-filter: blur(16px);
        }

        .tsb-account-menu a {
          min-height: 40px;
          padding: 0 11px;
          display: flex;
          align-items: center;
          gap: 9px;
          border-radius: 10px;
          color: rgba(255,255,255,0.88);
          font-size: 0.78rem;
          font-weight: 800;
          text-decoration: none;
          white-space: nowrap;
        }

        .tsb-account-menu a:hover {
          color: #ffffff;
          background: rgba(56,189,248,0.10);
        }

        .tsb-header-quote.tsb-header-quote--compact {
          min-height: 34px !important;
          padding: 0 9px !important;
          gap: 5px !important;
          border-radius: 10px !important;
          font-size: 0.70rem !important;
          white-space: nowrap;
        }

        .tsb-whatsapp-icon-button {
          position: relative;
          width: 36px;
          height: 36px;
          flex: 0 0 36px;
          display: inline-grid;
          place-items: center;
          border: 1px solid rgba(34, 197, 94, 0.48);
          border-radius: 50%;
          background:
            radial-gradient(circle at 35% 30%, rgba(134,239,172,0.22), transparent 42%),
            rgba(22, 101, 52, 0.18);
          color: #86efac;
          text-decoration: none;
          box-shadow:
            0 0 0 0 rgba(34,197,94,0.40),
            0 0 14px rgba(34,197,94,0.28);
          animation: tsbWhatsappPulse 1.75s ease-in-out infinite;
          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            background 0.18s ease;
        }

        .tsb-whatsapp-icon-button:hover {
          transform: translateY(-1px) scale(1.06);
          border-color: rgba(134,239,172,0.82);
          background: rgba(22, 163, 74, 0.24);
        }

        .tsb-whatsapp-icon-button::after {
          content: "";
          position: absolute;
          inset: -4px;
          border: 1px solid rgba(34,197,94,0.24);
          border-radius: 50%;
          animation: tsbWhatsappRing 1.75s ease-out infinite;
          pointer-events: none;
        }

        @keyframes tsbWhatsappPulse {
          0%, 100% {
            box-shadow:
              0 0 0 0 rgba(34,197,94,0.34),
              0 0 12px rgba(34,197,94,0.24);
          }
          50% {
            box-shadow:
              0 0 0 7px rgba(34,197,94,0.06),
              0 0 24px rgba(34,197,94,0.58);
          }
        }

        @keyframes tsbWhatsappRing {
          0% {
            opacity: 0.70;
            transform: scale(0.88);
          }
          70% {
            opacity: 0;
            transform: scale(1.28);
          }
          100% {
            opacity: 0;
            transform: scale(1.28);
          }
        }

        @media (max-width: 1220px) {
          .tsb-header-nav {
            gap: 8px !important;
          }

          .tsb-header-nav > a,
          .tsb-nav-dropdown-button {
            font-size: 0.69rem !important;
          }

          .tsb-header-actions .tsb-language-button {
            padding: 0 6px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tsb-whatsapp-icon-button,
          .tsb-whatsapp-icon-button::after {
            animation: none !important;
          }
        }
      `}</style>
      <div className="tsb-header-inner">
        <a
          href="/#top"
          className="tsb-header-brand"
          aria-label="TSB Tech Group"
          onClick={closeDropdowns}
        >
          <BrandLogo compact />
        </a>

        <nav
          className="tsb-header-nav"
          aria-label={navT("navigation")}
        >
          <a href="/#top" onClick={closeDropdowns}>
            {navT("home")}
          </a>

          <a href="/about" onClick={closeDropdowns}>
            {navT("about")}
          </a>

          <div className="tsb-nav-dropdown">
            <button
              type="button"
              className="tsb-nav-dropdown-button"
              onClick={toggleServices}
              aria-expanded={servicesOpen}
            >
              {navT("services")}
              <span>⌄</span>
            </button>

            {servicesOpen && (
              <div className="tsb-nav-dropdown-menu">
                <a href="/services" onClick={closeDropdowns}>
                  {navT("allServices")}
                </a>

                <a href="/services#automobile" onClick={closeDropdowns}>
                  {navT("automobile")}
                </a>

                <a href="/services#diagnostic" onClick={closeDropdowns}>
                  {navT("diagnostic")}
                </a>

                <a href="/services#securite" onClick={closeDropdowns}>
                  {navT("security")}
                </a>

                <a href="/services#electricite" onClick={closeDropdowns}>
                  {navT("electricity")}
                </a>

                <a href="/services#energie" onClick={closeDropdowns}>
                  {navT("energy")}
                </a>

                <a href="/services#eau" onClick={closeDropdowns}>
                  {navT("water")}
                </a>

                <a href="/services#automatisation" onClick={closeDropdowns}>
                  {navT("automation")}
                </a>

                <a href="/services#informatique" onClick={closeDropdowns}>
                  {navT("digital")}
                </a>

                <a href="/services#reseaux" onClick={closeDropdowns}>
                  {navT("networks")}
                </a>

                <a href="/services#site-web" onClick={closeDropdowns}>
                  {navT("website")}
                </a>

                <a href="/services#maintenance" onClick={closeDropdowns}>
                  {navT("maintenance")}
                </a>

              </div>
            )}
          </div>

          <div className="tsb-nav-dropdown">
            <button
              type="button"
              className="tsb-nav-dropdown-button"
              onClick={toggleEcosystem}
              aria-expanded={ecosystemOpen}
            >
              {navT("ecosystem")}
              <span>⌄</span>
            </button>

            {ecosystemOpen && (
              <div className="tsb-nav-dropdown-menu">
                <a href="/business" onClick={closeDropdowns}>
                  {navT("business")}
                </a>

                <a href="/academy" onClick={closeDropdowns}>
                  {navT("academy")}
                </a>

                <a href="/store" onClick={closeDropdowns}>
                  {navT("store")}
                </a>

                <a href="/innovation" onClick={closeDropdowns}>
                  {navT("innovation")}
                </a>

                <a href="/partners" onClick={closeDropdowns}>
                  {navT("partners")}
                </a>
              </div>
            )}
          </div>

          <a href="/projects" onClick={closeDropdowns}>
            {navT("projects")}
          </a>

          <a href="/news" onClick={closeDropdowns}>
            {navT("news")}
          </a>

          <a href="/contact" onClick={closeDropdowns}>
            {navT("contact")}
          </a>
        </nav>

        <div className="tsb-header-actions">
          <div className="tsb-language">
            <button
              type="button"
              className="tsb-language-button tsb-language-button--international"
              onClick={toggleLanguage}
              aria-expanded={languageOpen}
              aria-haspopup="menu"
              aria-label={i18nT("language.choose")}
              title={currentLocale.nativeLabel}
            >
              <span
                className="tsb-language-globe"
                aria-hidden="true"
              >
                ◉
              </span>
              <span>{currentLocale.shortLabel}</span>
              <span>⌄</span>
            </button>

            {languageOpen && (
              <div
                className="tsb-language-menu--international"
                role="menu"
                aria-label={i18nT("language.choose")}
              >
                {availableLocales
                  .filter((item) => item.enabled)
                  .map((item) => {
                    const isActive =
                      locale === item.code;

                    return (
                      <button
                        key={item.code}
                        type="button"
                        className={`tsb-language-option${
                          isActive
                            ? " is-active"
                            : ""
                        }`}
                        onClick={() =>
                          changeLocale(item.code)
                        }
                        aria-pressed={isActive}
                        role="menuitemradio"
                        dir={item.direction}
                      >
                        <span className="tsb-language-option__code">
                          {item.shortLabel}
                        </span>

                        <span className="tsb-language-option__name">
                          {item.nativeLabel}
                        </span>

                        <span
                          className="tsb-language-option__check"
                          aria-hidden="true"
                        >
                          {isActive ? "✓" : ""}
                        </span>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          <div
            className="tsb-language"
            style={{ position: "relative" }}
          >
            <button
              type="button"
              className="tsb-language-button"
              onClick={toggleAccount}
              aria-expanded={accountOpen}
              aria-label={navT("account")}
              title={navT("account")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <UserRound size={16} strokeWidth={2} />
              <span>{navT("account")}</span>
              <span>⌄</span>
            </button>

            {accountOpen && (
              <div className="tsb-account-menu">
                <a
                  href="/login"
                  onClick={closeDropdowns}
                  style={{
                    display: "block",
                    textDecoration: "none",
                  }}
                >
                  <UserRound size={15} strokeWidth={2} />
                  {navT("login")}
                </a>

                <a
                  href="/register"
                  onClick={closeDropdowns}
                  style={{
                    display: "block",
                    textDecoration: "none",
                  }}
                >
                  <UserRound size={15} strokeWidth={2} />
                  {navT("register")}
                </a>
              </div>
            )}
          </div>

          <a
            href="/#quote"
            className="tsb-header-quote tsb-header-quote--compact"
            onClick={closeDropdowns}
            aria-label={navT("quote")}
            title={navT("quote")}
          >
            <FileText size={14} strokeWidth={2} />
            {navT("quoteShort")}
          </a>

          <a
            href={WHATSAPP_URL}
            className="tsb-whatsapp-icon-button"
            aria-label={navT("whatsapp")}
            title="WhatsApp"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeDropdowns}
          >
            <MessageCircle size={19} strokeWidth={2.2} />
          </a>

          <button
            type="button"
            className="tsb-mobile-toggle"
            onClick={toggleMobile}
            aria-label={navT("menu")}
            aria-expanded={mobileOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="tsb-mobile-menu">
          <a href="/#top" onClick={closeMobile}>
            {navT("home")}
          </a>

          <a href="/about" onClick={closeMobile}>
            {navT("about")}
          </a>

          <a href="/services" onClick={closeMobile}>
            {navT("services")}
          </a>

          <div className="tsb-mobile-ecosystem">
            <span className="tsb-mobile-ecosystem__label">
              {navT("ecosystem")}
            </span>

            <div className="tsb-mobile-ecosystem__links">
              <a href="/business" onClick={closeMobile}>
                {navT("business")}
              </a>

              <a href="/academy" onClick={closeMobile}>
                {navT("academy")}
              </a>

              <a href="/store" onClick={closeMobile}>
                {navT("store")}
              </a>

              <a href="/innovation" onClick={closeMobile}>
                {navT("innovation")}
              </a>

              <a href="/partners" onClick={closeMobile}>
                {navT("partners")}
              </a>
            </div>
          </div>

          <a href="/projects" onClick={closeMobile}>
            {navT("projects")}
          </a>

          <a href="/news" onClick={closeMobile}>
            {navT("news")}
          </a>

          <a href="/contact" onClick={closeMobile}>
            {navT("contact")}
          </a>

          <div
            className="tsb-mobile-language-grid"
            aria-label={i18nT("language.choose")}
          >
            {availableLocales
              .filter((item) => item.enabled)
              .map((item) => {
                const isActive =
                  locale === item.code;

                return (
                  <button
                    key={item.code}
                    type="button"
                    className={`tsb-mobile-language-option${
                      isActive
                        ? " is-active"
                        : ""
                    }`}
                    onClick={() => {
                      changeLocale(item.code);
                      closeMobile();
                    }}
                    aria-pressed={isActive}
                    dir={item.direction}
                  >
                    <span>{item.nativeLabel}</span>
                    <small>
                      {item.shortLabel}
                    </small>
                  </button>
                );
              })}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              paddingTop: "8px",
            }}
          >
            <a
              href="/login"
              onClick={closeMobile}
              style={{
                minHeight: "44px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                borderRadius: "10px",
                border: "1px solid rgba(56,189,248,0.30)",
                background: "rgba(56,189,248,0.08)",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              <UserRound size={16} strokeWidth={2} />
              {navT("login")}
            </a>

            <a
              href="/register"
              onClick={closeMobile}
              style={{
                minHeight: "44px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 800,
                textAlign: "center",
              }}
            >
              {navT("register")}
            </a>
          </div>

          <a
            href="/#quote"
            className="tsb-mobile-quote"
            onClick={closeMobile}
          >
            {navT("mobileQuote")}
          </a>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMobile}
          >
            WhatsApp
          </a>
        </div>
      )}
    </header>
  );
}

export default Navbar;
