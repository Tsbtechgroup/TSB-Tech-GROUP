import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Send } from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { businessFormTranslations } from "../../i18n/locales/businessForm";
import { supabase } from "../../services/supabase";

const inquiryTypes = [
  "solutions",
  "investment",
  "strategic",
  "joint_venture",
  "distribution",
  "institutions",
  "innovation",
  "international",
  "other",
] as const;

const backLabels: Record<string, string> = {
  fr: "Retour à la page précédente",
  nl: "Terug naar de vorige pagina",
  en: "Back to the previous page",
  de: "Zurück zur vorherigen Seite",
  es: "Volver a la página anterior",
  it: "Torna alla pagina precedente",
  pt: "Voltar à página anterior",
  ar: "العودة إلى الصفحة السابقة",
  tr: "Önceki sayfaya dön",
  zh: "返回上一页",
};

type InquiryType = "" | (typeof inquiryTypes)[number];

type EcosystemForm = {
  inquiryType: InquiryType;
  name: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  message: string;
};

const getInitialType = (): InquiryType => {
  const requestedType = new URLSearchParams(window.location.search).get("type");
  return inquiryTypes.includes(requestedType as (typeof inquiryTypes)[number])
    ? (requestedType as InquiryType)
    : "";
};

const createInitialForm = (): EcosystemForm => ({
  inquiryType: getInitialType(),
  name: "",
  email: "",
  phone: "",
  company: "",
  country: "",
  message: "",
});

const fieldStyle = {
  width: "100%",
  minHeight: "48px",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(148,163,184,0.25)",
  background: "rgba(2,6,23,0.62)",
  color: "#ffffff",
  outline: "none",
  font: "inherit",
} as const;

const labelStyle = {
  display: "grid",
  gap: "8px",
  color: "rgba(255,255,255,0.82)",
  fontSize: "0.86rem",
  fontWeight: 700,
} as const;

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as
  | string
  | undefined;

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: "auto" | "light" | "dark";
      language?: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    }
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
};

const getTurnstileApi = () =>
  (window as Window & { turnstile?: TurnstileApi }).turnstile;

function EcosystemRequest() {
  const { locale } = useLanguage();
  const backLabel = backLabels[locale] ?? backLabels.fr;
  const t = (key: string) =>
    translate(businessFormTranslations, locale, `businessForm.${key}`);

  const [form, setForm] = useState<EcosystemForm>(createInitialForm);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "success" | "error" | "rate" | "security"
  >("idle");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    setTurnstileToken("");
    if (!TURNSTILE_SITE_KEY) return;

    let cancelled = false;
    const renderTurnstile = () => {
      const turnstile = getTurnstileApi();
      if (
        cancelled ||
        !turnstile ||
        !turnstileContainerRef.current ||
        turnstileWidgetIdRef.current
      ) {
        return;
      }

      turnstileWidgetIdRef.current = turnstile.render(
        turnstileContainerRef.current,
        {
          sitekey: TURNSTILE_SITE_KEY,
          theme: "dark",
          language: locale,
          callback: setTurnstileToken,
          "expired-callback": () => setTurnstileToken(""),
          "error-callback": () => setTurnstileToken(""),
        }
      );
    };

    let script = document.querySelector<HTMLScriptElement>(
      'script[data-tsb-turnstile="true"]'
    );

    if (!script) {
      script = document.createElement("script");
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.tsbTurnstile = "true";
      document.head.appendChild(script);
    }

    if (getTurnstileApi()) renderTurnstile();
    else script.addEventListener("load", renderTurnstile);

    return () => {
      cancelled = true;
      script?.removeEventListener("load", renderTurnstile);
      const turnstile = getTurnstileApi();
      if (turnstile && turnstileWidgetIdRef.current) {
        try {
          turnstile.remove(turnstileWidgetIdRef.current);
        } catch {
          // Le widget est peut-être déjà supprimé.
        }
      }
      turnstileWidgetIdRef.current = null;
    };
  }, [locale]);

  const resetTurnstile = () => {
    setTurnstileToken("");
    const turnstile = getTurnstileApi();
    if (turnstile && turnstileWidgetIdRef.current) {
      try {
        turnstile.reset(turnstileWidgetIdRef.current);
      } catch {
        // Le prochain chargement recréera le widget.
      }
    }
  };

  const updateForm = (key: keyof EcosystemForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (status !== "idle") setStatus("idle");
  };

  const submitRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    if (!TURNSTILE_SITE_KEY || !turnstileToken) {
      setStatus("security");
      return;
    }

    setSending(true);
    setStatus("idle");

    const { data, error } = await supabase.functions.invoke(
      "submit-business-inquiry",
      {
        body: {
          inquiry_type: form.inquiryType,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          company: form.company.trim() || null,
          country: form.country.trim() || null,
          message: form.message.trim(),
          preferred_language: locale,
          turnstileToken,
        },
      }
    );

    setSending(false);
    let errorCode = typeof data?.code === "string" ? data.code : "";

    if (!errorCode && error && typeof error === "object" && "context" in error) {
      const context = (error as { context?: Response }).context;
      if (context) {
        try {
          const payload = (await context.clone().json()) as { code?: unknown };
          if (typeof payload.code === "string") errorCode = payload.code;
        } catch {
          // Le statut générique sera utilisé.
        }
      }
    }

    if (error || data?.ok !== true) {
      resetTurnstile();
      if (errorCode === "rate_limited") setStatus("rate");
      else if (
        [
          "security_required",
          "security_failed",
          "security_unavailable",
          "antibot_config",
        ].includes(errorCode)
      ) {
        setStatus("security");
      } else setStatus("error");
      return;
    }

    resetTurnstile();
    setStatus("success");
    setForm(createInitialForm());
  };

  const notice =
    status === "success"
      ? { text: t("success"), color: "#bbf7d0", border: "rgba(74,222,128,0.28)", Icon: CheckCircle2 }
      : status === "rate"
        ? { text: t("rateLimited"), color: "#fde68a", border: "rgba(251,191,36,0.28)", Icon: AlertCircle }
        : status === "security"
          ? { text: t("securityError"), color: "#bae6fd", border: "rgba(56,189,248,0.28)", Icon: AlertCircle }
          : status === "error"
            ? { text: t("error"), color: "#fecaca", border: "rgba(248,113,113,0.28)", Icon: AlertCircle }
            : null;
  const NoticeIcon = notice?.Icon;

  return (
    <div>
      <Navbar />
      <main>
        <section id="ecosystem-request" className="section section--domains">
          <div className="container">
            <div
              style={{
                maxWidth: "980px",
                margin: "0 auto",
                padding: "30px",
                borderRadius: "22px",
                border: "1px solid rgba(56,189,248,0.26)",
                background:
                  "linear-gradient(135deg, rgba(2,6,23,0.90), rgba(14,165,233,0.07))",
                boxShadow: "0 24px 70px rgba(2,6,23,0.28)",
              }}
            >
              <div className="section-heading" style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 26px" }}>
                <span className="section__eyebrow">{t("eyebrow")}</span>
                <h1>{t("title1")} <span>{t("title2")}</span></h1>
                <p>{t("intro")}</p>
                <button type="button" onClick={() => window.history.go(-1)} className="button button--secondary" style={{ marginTop: "18px" }}>
                  <ArrowLeft size={17} aria-hidden="true" /> {backLabel}
                </button>
              </div>

              <form onSubmit={submitRequest} style={{ display: "grid", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px" }}>
                  <label style={labelStyle}>
                    {t("typeLabel")}
                    <select required value={form.inquiryType} onChange={(event) => updateForm("inquiryType", event.target.value)} style={fieldStyle}>
                      <option value="" disabled>{t("typePlaceholder")}</option>
                      {inquiryTypes.map((type) => <option key={type} value={type}>{t(`types.${type}`)}</option>)}
                    </select>
                  </label>
                  <label style={labelStyle}>
                    {t("companyLabel")}
                    <input type="text" maxLength={160} value={form.company} onChange={(event) => updateForm("company", event.target.value)} placeholder={t("companyPlaceholder")} style={fieldStyle} />
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px" }}>
                  <label style={labelStyle}>
                    {t("nameLabel")}
                    <input type="text" required minLength={2} maxLength={120} autoComplete="name" value={form.name} onChange={(event) => updateForm("name", event.target.value)} placeholder={t("namePlaceholder")} style={fieldStyle} />
                  </label>
                  <label style={labelStyle}>
                    {t("emailLabel")}
                    <input type="email" required maxLength={254} autoComplete="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} placeholder={t("emailPlaceholder")} style={fieldStyle} />
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px" }}>
                  <label style={labelStyle}>
                    {t("phoneLabel")}
                    <input type="tel" required minLength={4} maxLength={40} autoComplete="tel" value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} placeholder={t("phonePlaceholder")} style={fieldStyle} />
                  </label>
                  <label style={labelStyle}>
                    {t("countryLabel")}
                    <input type="text" maxLength={120} autoComplete="country-name" value={form.country} onChange={(event) => updateForm("country", event.target.value)} placeholder={t("countryPlaceholder")} style={fieldStyle} />
                  </label>
                </div>

                <label style={labelStyle}>
                  {t("messageLabel")}
                  <textarea required minLength={10} maxLength={4000} value={form.message} onChange={(event) => updateForm("message", event.target.value)} placeholder={t("messagePlaceholder")} style={{ ...fieldStyle, minHeight: "150px", resize: "vertical" }} />
                </label>

                <div style={{ display: "grid", gap: "10px", justifyItems: "center", padding: "16px", borderRadius: "14px", border: "1px solid rgba(56,189,248,0.22)", background: "rgba(14,165,233,0.055)", textAlign: "center" }}>
                  <strong style={{ color: "#fff", fontSize: "0.9rem" }}>{t("securityTitle")}</strong>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.62)", fontSize: "0.82rem" }}>{t("securityText")}</p>
                  {!TURNSTILE_SITE_KEY ? <p role="alert" style={{ margin: 0, color: "#fca5a5" }}>{t("antibotMissing")}</p> : <div ref={turnstileContainerRef} />}
                </div>

                <p style={{ margin: 0, fontSize: "0.82rem", color: "rgba(255,255,255,0.58)" }}>{t("privacyNote")}</p>

                {notice && NoticeIcon && (
                  <div role={status === "success" ? "status" : "alert"} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "14px 16px", borderRadius: "14px", border: `1px solid ${notice.border}`, background: "rgba(15,23,42,0.62)", color: notice.color }}>
                    <NoticeIcon size={20} aria-hidden="true" />
                    <span>{notice.text}</span>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "center", marginTop: "4px" }}>
                  <button type="submit" disabled={sending || !TURNSTILE_SITE_KEY || !turnstileToken} className="button button--primary" style={{ minWidth: "220px", opacity: sending || !TURNSTILE_SITE_KEY || !turnstileToken ? 0.68 : 1 }}>
                    <Send size={17} aria-hidden="true" />
                    {sending ? t("sending") : t("submit")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default EcosystemRequest;
