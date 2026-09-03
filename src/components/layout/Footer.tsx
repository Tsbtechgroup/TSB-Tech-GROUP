import BrandLogo from "../common/BrandLogo";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { footerTranslations } from "../../i18n/locales/footer";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
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

            <span
              aria-label="LinkedIn"
              title="LinkedIn"
              style={{
                ...socialIconBaseStyle,
                background: "#0A66C2",
                color: "#ffffff",
                boxShadow:
                  "0 8px 20px rgba(10,102,194,0.28)",
              }}
            >
              <FaLinkedinIn />
            </span>

            <span
              aria-label="YouTube"
              title="YouTube"
              style={{
                ...socialIconBaseStyle,
                background: "#FF0000",
                color: "#ffffff",
                boxShadow:
                  "0 8px 20px rgba(255,0,0,0.26)",
              }}
            >
              <FaYoutube />
            </span>

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
          <h3>{t("quickLinks")}</h3>

          <a href="/#top">{t("home")}</a>
          <a href="/about">{t("about")}</a>
          <a href="/services">{t("services")}</a>
          <a href="/projects">{t("projects")}</a>
          <a href="/news">{t("news")}</a>
          <a href="/partners">{t("partners")}</a>
        </div>

        <div className="tsb-footer-column">
          <h3>{t("platform")}</h3>

          <a href="/academy">
            {t("academy")}
          </a>

          <a href="/store">
            {t("store")}
          </a>

          <a href="/support">
            {t("support")}
          </a>

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
              transition:
                "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform =
                "translateY(-2px)";
              event.currentTarget.style.boxShadow =
                "0 14px 34px rgba(14,165,233,0.28), inset 0 1px 0 rgba(255,255,255,0.10)";
              event.currentTarget.style.borderColor =
                "rgba(125, 211, 252, 0.9)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform =
                "translateY(0)";
              event.currentTarget.style.boxShadow =
                "0 10px 28px rgba(14,165,233,0.18), inset 0 1px 0 rgba(255,255,255,0.08)";
              event.currentTarget.style.borderColor =
                "rgba(56, 189, 248, 0.55)";
            }}
          >
            <FaUserAlt aria-hidden="true" />
            <span>{t("clientArea")}</span>
            <span aria-hidden="true">→</span>
          </a>

        </div>

        <div className="tsb-footer-column">
          <h3>{t("contactUs")}</h3>

          <span>{t("location")}</span>

          <a href="mailto:contact@tsbtechgroup.com">
            contact@tsbtechgroup.com
          </a>

          <a href="tel:+32466327536">
            +32 466 32 75 36
          </a>

          <span>{t("hours")}</span>

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

        <div className="tsb-footer-payment-list">
          <span>Visa</span>
          <span>Mastercard</span>
          <span>PayPal</span>
          <span>Bancontact</span>
          <span>Wave</span>
          <span>Orange Money</span>
          <span className="tsb-wallet">
            Wallet TSB
          </span>
        </div>
      </div>

      <div className="tsb-footer-bottom">
        <span>{t("copyright")}</span>

        <a
          href="/privacy"
          style={{
            color: "#38bdf8",
            fontWeight: 700,
            textDecoration: "none",
            transition:
              "transform 180ms ease, filter 180ms ease",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.transform =
              "translateY(-3px)";
            event.currentTarget.style.filter =
              "brightness(1.25)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.transform =
              "translateY(0)";
            event.currentTarget.style.filter =
              "brightness(1)";
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
            transition:
              "transform 180ms ease, filter 180ms ease",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.transform =
              "translateY(-3px)";
            event.currentTarget.style.filter =
              "brightness(1.25)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.transform =
              "translateY(0)";
            event.currentTarget.style.filter =
              "brightness(1)";
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
            transition:
              "transform 180ms ease, filter 180ms ease",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.transform =
              "translateY(-3px)";
            event.currentTarget.style.filter =
              "brightness(1.25)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.transform =
              "translateY(0)";
            event.currentTarget.style.filter =
              "brightness(1)";
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
            transition:
              "transform 180ms ease, filter 180ms ease",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.transform =
              "translateY(-3px)";
            event.currentTarget.style.filter =
              "brightness(1.25)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.transform =
              "translateY(0)";
            event.currentTarget.style.filter =
              "brightness(1)";
          }}
        >
          {t("terms")}
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
            color: "#fb7185",
            font: "inherit",
            fontWeight: 700,
            cursor: "pointer",
            transition:
              "transform 180ms ease, filter 180ms ease",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.transform =
              "translateY(-3px)";
            event.currentTarget.style.filter =
              "brightness(1.25)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.transform =
              "translateY(0)";
            event.currentTarget.style.filter =
              "brightness(1)";
          }}
        >
          {t("manageCookies")}
        </button>

        <span
          style={{
            color: "#94a3b8",
            transition:
              "transform 180ms ease, color 180ms ease",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.transform =
              "translateY(-3px)";
            event.currentTarget.style.color =
              "#e2e8f0";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.transform =
              "translateY(0)";
            event.currentTarget.style.color =
              "#94a3b8";
          }}
        >
          {t("digitalPlatform")}
        </span>
      </div>
    </footer>
  );
}























































































export default Footer;
