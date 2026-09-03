import {
  useEffect,
  useState,
} from "react";
import { Cookie } from "lucide-react";

import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { cookieBannerTranslations } from "../../i18n/locales/cookieBanner";

type ConsentChoice = "all" | "necessary";

const STORAGE_KEY = "tsb-cookie-consent";

function CookieBanner() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      cookieBannerTranslations,
      locale,
      `cookieBanner.${key}`
    );

  const [visible, setVisible] =
    useState(false);

  useEffect(() => {
    const savedChoice =
      localStorage.getItem(STORAGE_KEY);

    if (!savedChoice) {
      setVisible(true);
    }

    const openSettings = () => {
      setVisible(true);
    };

    window.addEventListener(
      "tsb-open-cookie-settings",
      openSettings
    );

    return () => {
      window.removeEventListener(
        "tsb-open-cookie-settings",
        openSettings
      );
    };
  }, []);

  const saveChoice = (
    choice: ConsentChoice
  ) => {
    localStorage.setItem(
      STORAGE_KEY,
      choice
    );

    window.dispatchEvent(
      new CustomEvent(
        "tsb-cookie-consent-change",
        {
          detail: {
            choice,
          },
        }
      )
    );

    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t("title")}
      style={{
        position: "fixed",
        left: "18px",
        right: "18px",
        bottom: "18px",
        zIndex: 9999,
        maxWidth: "720px",
        margin: "0 auto",
        padding: "18px",
        borderRadius: "18px",
        border:
          "1px solid rgba(56,189,248,0.28)",
        background:
          "rgba(8,15,30,0.96)",
        backdropFilter: "blur(16px)",
        boxShadow:
          "0 20px 60px rgba(0,0,0,0.38)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "14px",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            flex: "0 0 44px",
            display: "grid",
            placeItems: "center",
            borderRadius: "13px",
            background:
              "rgba(14,165,233,0.13)",
            border:
              "1px solid rgba(56,189,248,0.25)",
          }}
        >
          <Cookie
            size={22}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>

        <div style={{ flex: 1 }}>
          <h3
            style={{
              margin: 0,
              fontSize: "1.03rem",
            }}
          >
            {t("title")}
          </h3>

          <p
            style={{
              margin: "8px 0 0",
              lineHeight: 1.6,
              opacity: 0.84,
              fontSize: "0.94rem",
            }}
          >
            {t("text")}
          </p>

          <a
            href="/cookies"
            style={{
              display: "inline-block",
              marginTop: "9px",
              fontSize: "0.9rem",
              fontWeight: 700,
            }}
          >
            {t("learnMore")} →
          </a>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          flexWrap: "wrap",
          gap: "10px",
          marginTop: "16px",
        }}
      >
        <button
          type="button"
          onClick={() =>
            saveChoice("necessary")
          }
          style={{
            minHeight: "42px",
            padding: "0 15px",
            borderRadius: "11px",
            border:
              "1px solid rgba(148,163,184,0.28)",
            background:
              "rgba(255,255,255,0.04)",
            color: "inherit",
            font: "inherit",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {t("necessaryOnly")}
        </button>

        <button
          type="button"
          onClick={() =>
            saveChoice("all")
          }
          style={{
            minHeight: "42px",
            padding: "0 17px",
            borderRadius: "11px",
            border:
              "1px solid rgba(56,189,248,0.55)",
            background:
              "linear-gradient(135deg, #0ea5e9, #2563eb)",
            color: "#ffffff",
            font: "inherit",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow:
              "0 10px 26px rgba(14,165,233,0.22)",
          }}
        >
          {t("acceptAll")}
        </button>
      </div>
    </div>
  );
}

export default CookieBanner;
