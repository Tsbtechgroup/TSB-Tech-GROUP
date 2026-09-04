import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  BriefcaseBusiness,
  Building2,
  Car,
  ClipboardCheck,
  Cpu,
  Droplets,
  Globe2,
  GraduationCap,
  Handshake,
  Landmark,
  Network,
  Radio,
  Rocket,
  ShieldCheck,
  Send,
  ShoppingBag,
  Store,
  Users,
  Wrench,
  Zap,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { businessTranslations } from "../../i18n/locales/business";
import { businessFormTranslations } from "../../i18n/locales/businessForm";
import { supabase } from "../../services/supabase";

const solutions = [
  { id: "audit", icon: ClipboardCheck, color: "blue" },
  { id: "security", icon: ShieldCheck, color: "green" },
  { id: "network", icon: Network, color: "cyan" },
  { id: "automation", icon: Cpu, color: "purple" },
  { id: "maintenance", icon: Wrench, color: "orange" },
] as const;

const investItems = [
  { id: "investment", icon: BriefcaseBusiness, color: "blue" },
  { id: "strategic", icon: Handshake, color: "green" },
  { id: "jointVenture", icon: Users, color: "cyan" },
  { id: "distribution", icon: Store, color: "purple" },
  { id: "institutions", icon: Landmark, color: "orange" },
  { id: "international", icon: Globe2, color: "blue" },
] as const;

const opportunities = [
  { id: "automotive", icon: Car },
  { id: "energy", icon: Zap },
  { id: "water", icon: Droplets },
  { id: "security", icon: ShieldCheck },
  { id: "automation", icon: Cpu },
  { id: "networks", icon: Radio },
  { id: "digital", icon: Network },
  { id: "academy", icon: GraduationCap },
  { id: "store", icon: ShoppingBag },
  { id: "projects", icon: Rocket },
] as const;

const processItems = ["discover", "review", "exchange", "proposal", "collaboration"] as const;

const inquiryTypes = [
  "solutions",
  "investment",
  "strategic",
  "joint_venture",
  "distribution",
  "institutions",
  "international",
  "other",
] as const;

type InquiryType = (typeof inquiryTypes)[number];

type BusinessInquiryForm = {
  inquiryType: InquiryType;
  name: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  message: string;
};

const initialBusinessInquiry: BusinessInquiryForm = {
  inquiryType: "investment",
  name: "",
  email: "",
  phone: "",
  company: "",
  country: "",
  message: "",
};

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

const TURNSTILE_SITE_KEY =
  import.meta.env
    .VITE_TURNSTILE_SITE_KEY as
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
  (
    window as Window & {
      turnstile?: TurnstileApi;
    }
  ).turnstile;

function Business() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      businessTranslations,
      locale,
      `business.${key}`
    );

  const bf = (key: string) =>
    translate(
      businessFormTranslations,
      locale,
      `businessForm.${key}`
    );

  const [businessForm, setBusinessForm] =
    useState<BusinessInquiryForm>(
      initialBusinessInquiry
    );

  const [sending, setSending] =
    useState(false);

  const [formStatus, setFormStatus] =
    useState<
      | "idle"
      | "success"
      | "error"
      | "rate"
      | "security"
    >("idle");

  const [turnstileToken, setTurnstileToken] =
    useState("");

  const turnstileContainerRef =
    useRef<HTMLDivElement | null>(null);

  const turnstileWidgetIdRef =
    useRef<string | null>(null);

  useEffect(() => {
    setTurnstileToken("");

    if (!TURNSTILE_SITE_KEY) {
      console.error(
        "VITE_TURNSTILE_SITE_KEY manquante."
      );

      return;
    }

    let cancelled = false;

    const renderTurnstile = () => {
      const turnstile = getTurnstileApi();

      if (
        cancelled ||
        !turnstileContainerRef.current ||
        !turnstile ||
        turnstileWidgetIdRef.current
      ) {
        return;
      }

      turnstileWidgetIdRef.current =
        turnstile.render(
          turnstileContainerRef.current,
          {
            sitekey: TURNSTILE_SITE_KEY,
            theme: "dark",
            language: locale,
            callback: (token) => {
              setTurnstileToken(token);
            },
            "expired-callback": () => {
              setTurnstileToken("");
            },
            "error-callback": () => {
              setTurnstileToken("");
            },
          }
        );
    };

    let script =
      document.querySelector<HTMLScriptElement>(
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

    if (getTurnstileApi()) {
      renderTurnstile();
    } else {
      script.addEventListener(
        "load",
        renderTurnstile
      );
    }

    return () => {
      cancelled = true;

      script?.removeEventListener(
        "load",
        renderTurnstile
      );

      const turnstile = getTurnstileApi();

      if (
        turnstileWidgetIdRef.current &&
        turnstile
      ) {
        try {
          turnstile.remove(
            turnstileWidgetIdRef.current
          );
        } catch (error) {
          console.warn(
            "Nettoyage Turnstile Business :",
            error
          );
        }
      }

      turnstileWidgetIdRef.current = null;
    };
  }, [locale]);

  const resetTurnstile = () => {
    setTurnstileToken("");

    const turnstile = getTurnstileApi();

    if (
      turnstileWidgetIdRef.current &&
      turnstile
    ) {
      try {
        turnstile.reset(
          turnstileWidgetIdRef.current
        );
      } catch (error) {
        console.warn(
          "Réinitialisation Turnstile Business :",
          error
        );
      }
    }
  };

  const updateBusinessForm = (
    key: keyof BusinessInquiryForm,
    value: string
  ) => {
    setBusinessForm((current) => ({
      ...current,
      [key]: value,
    }));

    if (formStatus !== "idle") {
      setFormStatus("idle");
    }
  };

  const submitBusinessInquiry = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (sending) {
      return;
    }

    if (
      !TURNSTILE_SITE_KEY ||
      !turnstileToken
    ) {
      setFormStatus("security");
      return;
    }

    setSending(true);
    setFormStatus("idle");

    const { data, error } =
      await supabase.functions.invoke(
        "submit-business-inquiry",
        {
          body: {
            inquiry_type:
              businessForm.inquiryType,
            name:
              businessForm.name.trim(),
            email:
              businessForm.email.trim(),
            phone:
              businessForm.phone.trim(),
            company:
              businessForm.company.trim() ||
              null,
            country:
              businessForm.country.trim() ||
              null,
            message:
              businessForm.message.trim(),
            preferred_language: locale,
            turnstileToken,
          },
        }
      );

    setSending(false);

    let errorCode =
      typeof data?.code === "string"
        ? data.code
        : "";

    if (
      !errorCode &&
      error &&
      typeof error === "object" &&
      "context" in error
    ) {
      const context = (
        error as {
          context?: Response;
        }
      ).context;

      if (context) {
        try {
          const payload =
            (await context
              .clone()
              .json()) as {
              code?: unknown;
            };

          if (
            typeof payload.code ===
            "string"
          ) {
            errorCode = payload.code;
          }
        } catch {
          // Le statut générique sera utilisé.
        }
      }
    }

    if (error || data?.ok !== true) {
      resetTurnstile();

      if (errorCode === "rate_limited") {
        setFormStatus("rate");
      } else if (
        [
          "security_required",
          "security_failed",
          "security_unavailable",
          "antibot_config",
        ].includes(errorCode)
      ) {
        setFormStatus("security");
      } else {
        setFormStatus("error");
      }

      return;
    }

    resetTurnstile();
    setFormStatus("success");
    setBusinessForm(
      initialBusinessInquiry
    );
  };

  return (
    <div>
      <Navbar />
      <main>
        <section id="business-top" className="section section--about">
          <div className="container">
            <div className="section-heading" style={{ textAlign: "center", maxWidth: "940px", margin: "0 auto" }}>
              <span className="section__eyebrow">{t("eyebrow")}</span>
              <h1>{t("title1")} <span>{t("title2")}</span></h1>
              <p style={{ maxWidth: "790px", marginLeft: "auto", marginRight: "auto" }}>{t("intro")}</p>
              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "12px", marginTop: "24px" }}>
                <a href="/#top" className="button button--secondary">← {t("backHome")}</a>
                <a href="#solutions" className="button button--secondary">{t("solutionsButton")}</a>
                <a href="#invest" className="button button--primary">{t("investButton")} <ArrowRight size={17} aria-hidden="true" /></a>
              </div>
            </div>
          </div>
        </section>

        <section
          id="solutions"
          className="section section--domains"
          style={{ paddingBottom: "48px" }}
        >
          <div className="container">
            <div className="section-heading" style={{ textAlign: "center", maxWidth: "820px", margin: "0 auto 30px" }}>
              <span className="section__eyebrow">{t("solutionsEyebrow")}</span>
              <h2>{t("solutionsTitle")}</h2>
              <p>{t("solutionsIntro")}</p>
            </div>
            <div className="domains-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px", maxWidth: "1120px", margin: "0 auto" }}>
              {solutions.map((solution) => {
                const Icon = solution.icon;
                return (
                  <article key={solution.id} className={`domain-card domain-${solution.color}`} style={{ minHeight: "210px", padding: "20px" }}>
                    <div className="domain-card__top"><div className="domain-icon"><Icon size={23} strokeWidth={1.8} /></div></div>
                    <h3>{t(`items.${solution.id}.title`)}</h3>
                    <p>{t(`items.${solution.id}.description`)}</p>
                  </article>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "28px" }}>
              <a href="/#quote" className="button button--primary">{t("quote")}</a>
            </div>
          </div>
        </section>

        <section
          id="invest"
          className="section"
          style={{ paddingTop: "48px" }}
        >
          <div className="container">
            <div className="section-heading" style={{ textAlign: "center", maxWidth: "860px", margin: "0 auto 30px" }}>
              <span className="section__eyebrow">{t("investEyebrow")}</span>
              <h2>{t("investTitle1")} <span>{t("investTitle2")}</span></h2>
              <p>{t("investIntro")}</p>
            </div>
            <div className="domains-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", maxWidth: "1120px", margin: "0 auto" }}>
              {investItems.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.id} className={`domain-card domain-${item.color}`} style={{ minHeight: "230px", padding: "22px" }}>
                    <div className="domain-card__top"><div className="domain-icon"><Icon size={24} strokeWidth={1.8} /></div></div>
                    <h3>{t(`investItems.${item.id}.title`)}</h3>
                    <p>{t(`investItems.${item.id}.description`)}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="opportunities" className="section section--domains">
          <div className="container">
            <div className="section-heading" style={{ textAlign: "center", maxWidth: "820px", margin: "0 auto 30px" }}>
              <span className="section__eyebrow">{t("opportunitiesEyebrow")}</span>
              <h2>{t("opportunitiesTitle")}</h2>
              <p>{t("opportunitiesIntro")}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", maxWidth: "1120px", margin: "0 auto" }}>
              {opportunities.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.id} className="domain-card domain-blue" style={{ minHeight: "145px", padding: "18px" }}>
                    <div className="domain-card__top"><div className="domain-icon"><Icon size={21} strokeWidth={1.8} /></div></div>
                    <h3 style={{ marginBottom: 0 }}>{t(`opportunities.${item.id}`)}</h3>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="international" className="section">
          <div className="container">
            <div style={{ maxWidth: "980px", margin: "0 auto", padding: "32px", borderRadius: "22px", border: "1px solid rgba(59,130,246,0.28)", background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(14,165,233,0.05))", textAlign: "center" }}>
              <div style={{ width: "58px", height: "58px", margin: "0 auto 16px", display: "grid", placeItems: "center", borderRadius: "17px", background: "rgba(59,130,246,0.14)", border: "1px solid rgba(96,165,250,0.30)" }}>
                <Globe2 size={27} strokeWidth={1.8} />
              </div>
              <span className="section__eyebrow">{t("internationalEyebrow")}</span>
              <h2>{t("internationalTitle")}</h2>
              <p style={{ maxWidth: "760px", margin: "12px auto 0" }}>{t("internationalText")}</p>
              <p style={{ marginTop: "20px", fontWeight: 700, letterSpacing: "0.02em" }}>{t("reach")}</p>
            </div>
          </div>
        </section>

        <section className="section section--domains">
          <div className="container">
            <div className="section-heading" style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 30px" }}>
              <span className="section__eyebrow">{t("processEyebrow")}</span>
              <h2>{t("processTitle")}</h2>
              <p>{t("processIntro")}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "14px", maxWidth: "1120px", margin: "0 auto" }}>
              {processItems.map((step, index) => (
                <article key={step} className="domain-card domain-cyan" style={{ minHeight: "165px", padding: "20px" }}>
                  <div style={{ fontSize: "0.82rem", opacity: 0.72, marginBottom: "12px" }}>{String(index + 1).padStart(2, "0")}</div>
                  <h3>{t(`processItems.${step}.title`)}</h3>
                  <p>{t(`processItems.${step}.description`)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div style={{ maxWidth: "940px", margin: "0 auto", padding: "32px", borderRadius: "22px", border: "1px solid rgba(59,130,246,0.25)", background: "linear-gradient(135deg, rgba(59,130,246,0.10), rgba(14,165,233,0.06))", textAlign: "center" }}>
              <div style={{ width: "58px", height: "58px", margin: "0 auto 16px", display: "grid", placeItems: "center", borderRadius: "17px", background: "rgba(59,130,246,0.14)", border: "1px solid rgba(96,165,250,0.30)" }}>
                <Building2 size={27} strokeWidth={1.8} />
              </div>
              <span className="section__eyebrow">{t("ctaEyebrow")}</span>
              <h2>{t("ctaTitle")}</h2>
              <p style={{ maxWidth: "720px", margin: "12px auto 0" }}>{t("ctaText")}</p>
              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "12px", marginTop: "24px" }}>
                <a href="/#quote" className="button button--secondary">{t("ctaQuote")}</a>
                <a href="#business-form" className="button button--primary">{t("ctaProject")} <ArrowRight size={17} aria-hidden="true" /></a>
              </div>
            </div>
          </div>
        </section>

        <section
          id="business-form"
          className="section section--domains"
        >
          <div className="container">
            <div
              style={{
                maxWidth: "980px",
                margin: "0 auto",
                padding: "30px",
                borderRadius: "22px",
                border:
                  "1px solid rgba(56,189,248,0.26)",
                background:
                  "linear-gradient(135deg, rgba(2,6,23,0.90), rgba(14,165,233,0.07))",
                boxShadow:
                  "0 24px 70px rgba(2,6,23,0.28)",
              }}
            >
              <div
                className="section-heading"
                style={{
                  textAlign: "center",
                  maxWidth: "760px",
                  margin: "0 auto 26px",
                }}
              >
                <span className="section__eyebrow">
                  {bf("eyebrow")}
                </span>

                <h2>
                  {bf("title1")}{" "}
                  <span>{bf("title2")}</span>
                </h2>

                <p>{bf("intro")}</p>
              </div>

              <form
                onSubmit={
                  submitBusinessInquiry
                }
                style={{
                  display: "grid",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(230px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <label style={labelStyle}>
                    {bf("typeLabel")}
                    <select
                      value={
                        businessForm.inquiryType
                      }
                      onChange={(event) =>
                        updateBusinessForm(
                          "inquiryType",
                          event.target.value
                        )
                      }
                      style={fieldStyle}
                    >
                      {inquiryTypes.map(
                        (type) => (
                          <option
                            key={type}
                            value={type}
                          >
                            {bf(
                              `types.${type}`
                            )}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label style={labelStyle}>
                    {bf("companyLabel")}
                    <input
                      type="text"
                      value={
                        businessForm.company
                      }
                      onChange={(event) =>
                        updateBusinessForm(
                          "company",
                          event.target.value
                        )
                      }
                      placeholder={bf(
                        "companyPlaceholder"
                      )}
                      maxLength={160}
                      style={fieldStyle}
                    />
                  </label>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(230px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <label style={labelStyle}>
                    {bf("nameLabel")}
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={120}
                      value={
                        businessForm.name
                      }
                      onChange={(event) =>
                        updateBusinessForm(
                          "name",
                          event.target.value
                        )
                      }
                      placeholder={bf(
                        "namePlaceholder"
                      )}
                      autoComplete="name"
                      style={fieldStyle}
                    />
                  </label>

                  <label style={labelStyle}>
                    {bf("emailLabel")}
                    <input
                      type="email"
                      required
                      maxLength={254}
                      value={
                        businessForm.email
                      }
                      onChange={(event) =>
                        updateBusinessForm(
                          "email",
                          event.target.value
                        )
                      }
                      placeholder={bf(
                        "emailPlaceholder"
                      )}
                      autoComplete="email"
                      style={fieldStyle}
                    />
                  </label>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(230px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <label style={labelStyle}>
                    {bf("phoneLabel")}
                    <input
                      type="tel"
                      required
                      minLength={4}
                      maxLength={40}
                      value={
                        businessForm.phone
                      }
                      onChange={(event) =>
                        updateBusinessForm(
                          "phone",
                          event.target.value
                        )
                      }
                      placeholder={bf(
                        "phonePlaceholder"
                      )}
                      autoComplete="tel"
                      style={fieldStyle}
                    />
                  </label>

                  <label style={labelStyle}>
                    {bf("countryLabel")}
                    <input
                      type="text"
                      maxLength={120}
                      value={
                        businessForm.country
                      }
                      onChange={(event) =>
                        updateBusinessForm(
                          "country",
                          event.target.value
                        )
                      }
                      placeholder={bf(
                        "countryPlaceholder"
                      )}
                      autoComplete="country-name"
                      style={fieldStyle}
                    />
                  </label>
                </div>

                <label style={labelStyle}>
                  {bf("messageLabel")}
                  <textarea
                    required
                    minLength={10}
                    maxLength={4000}
                    value={
                      businessForm.message
                    }
                    onChange={(event) =>
                      updateBusinessForm(
                        "message",
                        event.target.value
                      )
                    }
                    placeholder={bf(
                      "messagePlaceholder"
                    )}
                    style={{
                      ...fieldStyle,
                      minHeight: "150px",
                      resize: "vertical",
                    }}
                  />
                </label>

                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                    justifyItems: "center",
                    padding: "16px",
                    borderRadius: "14px",
                    border:
                      "1px solid rgba(56,189,248,0.22)",
                    background:
                      "rgba(14,165,233,0.055)",
                    textAlign: "center",
                  }}
                >
                  <strong
                    style={{
                      color: "#ffffff",
                      fontSize: "0.9rem",
                    }}
                  >
                    {bf("securityTitle")}
                  </strong>

                  <p
                    style={{
                      margin: 0,
                      color:
                        "rgba(255,255,255,0.62)",
                      fontSize: "0.82rem",
                      lineHeight: 1.55,
                    }}
                  >
                    {bf("securityText")}
                  </p>

                  {!TURNSTILE_SITE_KEY ? (
                    <p
                      role="alert"
                      style={{
                        margin: 0,
                        color: "#fca5a5",
                        fontSize: "0.82rem",
                      }}
                    >
                      {bf("antibotMissing")}
                    </p>
                  ) : (
                    <div
                      ref={turnstileContainerRef}
                    />
                  )}
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: "0.82rem",
                    color:
                      "rgba(255,255,255,0.58)",
                  }}
                >
                  {bf("privacyNote")}
                </p>

                {formStatus ===
                  "success" && (
                  <div
                    role="status"
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                      padding: "14px 16px",
                      borderRadius: "14px",
                      border:
                        "1px solid rgba(74,222,128,0.28)",
                      background:
                        "rgba(74,222,128,0.08)",
                      color: "#bbf7d0",
                    }}
                  >
                    <CheckCircle2
                      size={20}
                      aria-hidden="true"
                    />
                    <span>
                      {bf("success")}
                    </span>
                  </div>
                )}

                {formStatus === "rate" && (
                  <div
                    role="alert"
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                      padding: "14px 16px",
                      borderRadius: "14px",
                      border:
                        "1px solid rgba(251,191,36,0.28)",
                      background:
                        "rgba(251,191,36,0.08)",
                      color: "#fde68a",
                    }}
                  >
                    <AlertCircle
                      size={20}
                      aria-hidden="true"
                    />
                    <span>
                      {bf("rateLimited")}
                    </span>
                  </div>
                )}

                {formStatus ===
                  "security" && (
                  <div
                    role="alert"
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                      padding: "14px 16px",
                      borderRadius: "14px",
                      border:
                        "1px solid rgba(56,189,248,0.28)",
                      background:
                        "rgba(56,189,248,0.08)",
                      color: "#bae6fd",
                    }}
                  >
                    <AlertCircle
                      size={20}
                      aria-hidden="true"
                    />
                    <span>
                      {bf("securityError")}
                    </span>
                  </div>
                )}

                {formStatus ===
                  "error" && (
                  <div
                    role="alert"
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                      padding: "14px 16px",
                      borderRadius: "14px",
                      border:
                        "1px solid rgba(248,113,113,0.28)",
                      background:
                        "rgba(248,113,113,0.08)",
                      color: "#fecaca",
                    }}
                  >
                    <AlertCircle
                      size={20}
                      aria-hidden="true"
                    />
                    <span>
                      {bf("error")}
                    </span>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "4px",
                  }}
                >
                  <button
                    type="submit"
                    disabled={
                      sending ||
                      !TURNSTILE_SITE_KEY ||
                      !turnstileToken
                    }
                    className="button button--primary"
                    style={{
                      minWidth: "220px",
                      opacity:
                        sending ||
                        !TURNSTILE_SITE_KEY ||
                        !turnstileToken
                          ? 0.68
                          : 1,
                    }}
                  >
                    <Send
                      size={17}
                      aria-hidden="true"
                    />
                    {sending
                      ? bf("sending")
                      : bf("submit")}
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

export default Business;
