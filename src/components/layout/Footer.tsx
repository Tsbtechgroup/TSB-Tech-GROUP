import BrandLogo from "../common/BrandLogo";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { footerTranslations } from "../../i18n/locales/footer";

import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
  FaSnapchatGhost,
  FaTelegramPlane,
  FaUserAlt,
} from "react-icons/fa";

const WHATSAPP_URL = "https://wa.me/32493964587";

const socialIconBaseStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
  transition:
    "transform 180ms ease, box-shadow 180ms ease, filter 180ms ease",
} as const;

const paymentBadgeBase = {
  minHeight: "46px",
  minWidth: "92px",
  padding: "8px 12px",
  borderRadius: "12px",
  border: "1px solid rgba(148, 163, 184, 0.20)",
  background: "rgba(255,255,255,0.96)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  overflow: "hidden",
  boxShadow: "0 8px 22px rgba(2, 6, 23, 0.18)",
} as const;

function VisaLogo() {
  return (
    <span
      aria-label="Visa"
      title="Visa"
      style={{
        ...paymentBadgeBase,
        color: "#1434CB",
        fontSize: "24px",
        fontWeight: 950,
        fontStyle: "italic",
        letterSpacing: "-1px",
      }}
    >
      VISA
    </span>
  );
}

function MastercardLogo() {
  return (
    <span
      aria-label="Mastercard"
      title="Mastercard"
      style={{
        ...paymentBadgeBase,
        flexDirection: "column",
        gap: "2px",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "relative",
          width: "42px",
          height: "24px",
          display: "inline-block",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: "2px",
            top: "1px",
            width: "23px",
            height: "23px",
            borderRadius: "50%",
            background: "#EB001B",
          }}
        />
        <span
          style={{
            position: "absolute",
            right: "2px",
            top: "1px",
            width: "23px",
            height: "23px",
            borderRadius: "50%",
            background: "#F79E1B",
            opacity: 0.94,
          }}
        />
      </span>
      <span
        style={{
          color: "#111827",
          fontSize: "10px",
          fontWeight: 800,
          lineHeight: 1,
        }}
      >
        mastercard
      </span>
    </span>
  );
}

function PayPalLogo() {
  return (
    <span
      aria-label="PayPal"
      title="PayPal"
      style={{
        ...paymentBadgeBase,
        color: "#003087",
        fontWeight: 900,
        fontSize: "18px",
        letterSpacing: "-0.4px",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "relative",
          width: "22px",
          height: "27px",
          display: "inline-block",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: "1px",
            top: 0,
            fontSize: "27px",
            fontWeight: 950,
            color: "#003087",
            lineHeight: 1,
          }}
        >
          P
        </span>
        <span
          style={{
            position: "absolute",
            left: "7px",
            top: "4px",
            fontSize: "23px",
            fontWeight: 950,
            color: "#009CDE",
            lineHeight: 1,
            opacity: 0.9,
          }}
        >
          P
        </span>
      </span>
      PayPal
    </span>
  );
}

function BancontactLogo() {
  return (
    <span
      aria-label="Bancontact"
      title="Bancontact"
      style={{
        ...paymentBadgeBase,
        color: "#1A1F71",
        fontWeight: 900,
        fontSize: "13px",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: "31px",
          height: "24px",
          borderRadius: "6px",
          display: "inline-flex",
          overflow: "hidden",
          transform: "skewX(-8deg)",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      >
        <span
          style={{
            width: "50%",
            height: "100%",
            background: "#005498",
          }}
        />
        <span
          style={{
            width: "50%",
            height: "100%",
            background: "#F5A623",
          }}
        />
      </span>
      Bancontact
    </span>
  );
}

function WaveLogo() {
  return (
    <span
      aria-label="Wave"
      title="Wave"
      style={{
        ...paymentBadgeBase,
        color: "#172554",
        fontWeight: 950,
        fontSize: "17px",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: "29px",
          height: "29px",
          borderRadius: "50%",
          background: "#00C2FF",
          color: "#ffffff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        ≋
      </span>
      Wave
    </span>
  );
}

function OrangeMoneyLogo() {
  return (
    <span
      aria-label="Orange Money"
      title="Orange Money"
      style={{
        ...paymentBadgeBase,
        background: "#111111",
        color: "#ffffff",
        justifyContent: "flex-start",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: "27px",
          height: "27px",
          background: "#FF7900",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#111111",
          fontSize: "10px",
          fontWeight: 950,
        }}
      >
        OM
      </span>
      <span
        style={{
          display: "inline-flex",
          flexDirection: "column",
          lineHeight: 1,
          textAlign: "left",
        }}
      >
        <strong style={{ fontSize: "12px" }}>Orange</strong>
        <strong style={{ fontSize: "11px", color: "#FF7900" }}>
          Money
        </strong>
      </span>
    </span>
  );
}

function TsbWalletLogo() {
  return (
    <span
      aria-label="Wallet TSB"
      title="Wallet TSB"
      style={{
        ...paymentBadgeBase,
        background:
          "linear-gradient(135deg, rgba(2,6,23,0.98), rgba(15,23,42,0.98))",
        border: "1px solid rgba(56,189,248,0.42)",
        color: "#ffffff",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: "31px",
          height: "31px",
          borderRadius: "9px",
          border: "1px solid rgba(56,189,248,0.70)",
          background:
            "linear-gradient(135deg, rgba(14,165,233,0.35), rgba(37,99,235,0.18))",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#38BDF8",
          fontWeight: 950,
          fontSize: "11px",
          boxShadow: "0 0 18px rgba(56,189,248,0.18)",
        }}
      >
        TSB
      </span>
      <span
        style={{
          display: "inline-flex",
          flexDirection: "column",
          lineHeight: 1,
          textAlign: "left",
        }}
      >
        <strong style={{ fontSize: "11px", color: "#94A3B8" }}>
          Wallet
        </strong>
        <strong style={{ fontSize: "14px", color: "#38BDF8" }}>
          TSB
        </strong>
      </span>
    </span>
  );
}

function Footer() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      footerTranslations,
      locale,
      `footer.${key}`
    );

  return (
    <footer id="footer" className="tsb-footer">
      <div className="tsb-footer-grid">
        <div className="tsb-footer-brand">
          <BrandLogo compact />

          <p className="tsb-footer-slogan">
            {t("slogan")}
          </p>

          <p className="tsb-footer-description">
            {t("description")}
          </p>

          <div
            className="tsb-footer-socials"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <a
              href="https://www.facebook.com/share/18pVHvJxxQ/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              title="Facebook"
              style={{
                ...socialIconBaseStyle,
                background: "#1877F2",
                color: "#ffffff",
                boxShadow:
                  "0 8px 20px rgba(24,119,242,0.28)",
              }}
            >
              <FaFacebookF />
            </a>

            <a
              href="https://www.instagram.com/tsbtechgroup/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Instagram"
              style={{
                ...socialIconBaseStyle,
                background:
                  "linear-gradient(135deg, #833AB4 0%, #C13584 35%, #E1306C 55%, #FD1D1D 72%, #FCAF45 100%)",
                color: "#ffffff",
                boxShadow:
                  "0 8px 20px rgba(225,48,108,0.30)",
              }}
            >
              <FaInstagram />
            </a>

            <a
              href="https://www.tiktok.com/@ib50293"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              title="TikTok"
              style={{
                ...socialIconBaseStyle,
                background: "#000000",
                color: "#ffffff",
                border:
                  "1px solid rgba(255,255,255,0.12)",
                boxShadow:
                  "-3px 0 0 rgba(37,244,238,0.70), 3px 0 0 rgba(254,44,85,0.70), 0 8px 20px rgba(0,0,0,0.34)",
              }}
            >
              <FaTiktok />
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              title="WhatsApp"
              style={{
                ...socialIconBaseStyle,
                background: "#25D366",
                color: "#ffffff",
                boxShadow:
                  "0 8px 20px rgba(37,211,102,0.28)",
              }}
            >
              <FaWhatsapp />
            </a>

            <a
              href="https://snapchat.com/t/JFbzQw9L"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Snapchat"
              title="Snapchat"
              style={{
                ...socialIconBaseStyle,
                background: "#FFFC00",
                color: "#000000",
                boxShadow:
                  "0 8px 20px rgba(255,252,0,0.22)",
              }}
            >
              <FaSnapchatGhost />
            </a>

            <a
              href="https://t.me/+32493964587"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              title="Telegram"
              style={{
                ...socialIconBaseStyle,
                background: "#229ED9",
                color: "#ffffff",
                boxShadow:
                  "0 8px 20px rgba(34,158,217,0.28)",
              }}
            >
              <FaTelegramPlane />
            </a>
          </div>
        </div>

        <div className="tsb-footer-column">
          <h3>{t("navigation")}</h3>

          <a href="/#top">{t("home")}</a>
          <a href="/about">{t("about")}</a>
          <a href="/services">{t("services")}</a>
          <a href="/projects">{t("projects")}</a>
          <a href="/news">{t("news")}</a>
          <a href="/contact">{t("contact")}</a>
        </div>

        <div className="tsb-footer-column">
          <h3>{t("ecosystem")}</h3>

          <a href="/business">{t("business")}</a>
          <a href="/academy">{t("academy")}</a>
          <a href="/store">{t("store")}</a>
          <a href="/innovation">{t("innovation")}</a>
          <a href="/partners">{t("partners")}</a>
        </div>

        <div className="tsb-footer-column">
          <h3>{t("accessContact")}</h3>

          <a href="/support">{t("support")}</a>

          <a
            href="/client"
            aria-label={t("clientArea")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              width: "fit-content",
              marginTop: "6px",
              marginBottom: "4px",
              padding: "11px 16px",
              borderRadius: "12px",
              border: "1px solid rgba(56, 189, 248, 0.55)",
              background:
                "linear-gradient(135deg, rgba(14,165,233,0.22), rgba(59,130,246,0.30))",
              color: "#ffffff",
              fontWeight: 800,
              textDecoration: "none",
              boxShadow:
                "0 10px 28px rgba(14,165,233,0.18), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <FaUserAlt aria-hidden="true" />
            <span>{t("clientArea")}</span>
            <span aria-hidden="true">→</span>
          </a>

          <a href="mailto:contact@tsbtechgroup.com">
            contact@tsbtechgroup.com
          </a>

          <a href="tel:+32466327536">
            +32 466 32 75 36
          </a>

          <span>{t("location")}</span>

          <span>
            <strong>{t("availabilityLabel")}:</strong>{" "}
            {t("availability")}
          </span>

          <a
            className="tsb-footer-quote"
            href="/#quote"
          >
            {t("requestQuote")}
          </a>
        </div>
      </div>

      <div className="tsb-footer-payments">
        <strong>{t("payments")}</strong>

        <div
          className="tsb-footer-payment-list"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            alignItems: "center",
            marginTop: "12px",
          }}
        >
          <VisaLogo />
          <MastercardLogo />
          <PayPalLogo />
          <BancontactLogo />
          <WaveLogo />
          <OrangeMoneyLogo />
          <TsbWalletLogo />
        </div>

        <span
          style={{
            display: "block",
            marginTop: "10px",
            fontSize: ".82rem",
            opacity: 0.72,
          }}
        >
          {t("paymentsNote")}
        </span>
      </div>

      <div className="tsb-footer-bottom">
        <span>{t("copyright")}</span>

        <a
          href="/privacy"
          style={{
            color: "#38bdf8",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          {t("privacy")}
        </a>

        <a
          href="/cookies"
          style={{
            color: "#f59e0b",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          {t("cookies")}
        </a>

        <a
          href="/legal"
          style={{
            color: "#a78bfa",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          {t("legal")}
        </a>

        <a
          href="/terms"
          style={{
            color: "#4ade80",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          {t("terms")}
        </a>

        <a
          href="/delete-account"
          style={{
            color: "#fb7185",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          {t("deleteAccount")}
        </a>

        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(
              new Event("tsb-open-cookie-settings")
            );
          }}
          style={{
            border: "none",
            padding: 0,
            background: "transparent",
            color: "#f8fafc",
            font: "inherit",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {t("manageCookies")}
        </button>

        <span style={{ color: "#94a3b8" }}>
          {t("digitalPlatform")}
        </span>
      </div>
    </footer>
  );
}

export default Footer;
