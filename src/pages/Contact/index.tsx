import {
  Globe2,
  Mail,
  MessageCircle,
  Package,
  Phone,
  Send,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { contactTranslations } from "../../i18n/locales/contact";
import { supabase } from "../../services/supabase";

const PHONE_NUMBER = "+32466327536";
const PHONE_DISPLAY = "+32 466 32 75 36";

const WHATSAPP_DISPLAY = "+32 493 96 45 87";
const WHATSAPP_NUMBER = "32493964587";

const EMAIL = "contact@tsbtechgroup.com";

type StoreProduct = {
  slug: string;
  sku: string | null;
  name_fr: string;
  name_nl: string | null;
  name_en: string | null;
};



const cardStyle = {
  minHeight: "265px",
  padding: "24px",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  textAlign: "center" as const,
};

const actionButtonStyle = {
  marginTop: "auto",
  minHeight: "48px",
  padding: "0 18px",
  borderRadius: "12px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  width: "100%",
  boxSizing: "border-box" as const,
  textDecoration: "none",
  textAlign: "center" as const,
  fontWeight: 800,
  letterSpacing: "0.01em",
  cursor: "pointer",
  font: "inherit",
  transition:
    "transform 160ms ease, border-color 160ms ease, background 160ms ease",
};

function Contact() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      contactTranslations,
      locale,
      `contact.${key}`
    );

  const [selectedProduct, setSelectedProduct] =
    useState<StoreProduct | null>(null);

  const [productLoading, setProductLoading] =
    useState(false);

  const productSlug = useMemo(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    return params.get("product")?.trim() ?? "";
  }, []);

  useEffect(() => {
    if (!productSlug) {
      setSelectedProduct(null);
      return;
    }

    let mounted = true;

    const loadProduct = async () => {
      setProductLoading(true);

      const { data, error } = await supabase
        .from("store_products")
        .select(
          "slug, sku, name_fr, name_nl, name_en"
        )
        .eq("slug", productSlug)
        .eq("is_published", true)
        .maybeSingle();

      if (!mounted) {
        return;
      }

      if (error) {
        console.error(
          "Erreur chargement produit Contact :",
          error
        );
        setSelectedProduct(null);
      } else {
        setSelectedProduct(
          (data ?? null) as StoreProduct | null
        );
      }

      setProductLoading(false);
    };

    void loadProduct();

    return () => {
      mounted = false;
    };
  }, [productSlug]);

  useEffect(() => {
    if (!productSlug || !selectedProduct) {
      return;
    }

    const scrollToProductRequest = () => {
      document
        .getElementById("product-request")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    };

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(
        scrollToProductRequest
      );
    });
  }, [productSlug, selectedProduct]);

  const productName = selectedProduct
    ? locale === "fr"
      ? selectedProduct.name_fr
      : locale === "nl"
        ? selectedProduct.name_nl ||
          selectedProduct.name_en ||
          selectedProduct.name_fr
        : selectedProduct.name_en ||
          selectedProduct.name_fr
    : "";

  const productReference =
    selectedProduct?.sku ?? "";

  const productSummary = selectedProduct
    ? `${productName}${
        productReference
          ? ` — ${t("productReference")}: ${productReference}`
          : ""
      }`
    : "";

  const whatsappText = selectedProduct
    ? `${t("whatsappBody")}\n\n${productSummary}`
    : t("genericWhatsapp");

  const whatsappUrl =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      whatsappText
    )}`;

  const emailSubject = selectedProduct
    ? `${t("emailSubject")} — ${productName}`
    : "TSB Tech Group";

  const emailBody = selectedProduct
    ? `${t("emailBody")}\n\n${productSummary}\n\n`
    : "";

  const emailUrl =
    `mailto:${EMAIL}?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;

  const handleQuoteClick = () => {
    if (selectedProduct) {
      sessionStorage.setItem(
        "tsb_store_product_request",
        JSON.stringify({
          slug: selectedProduct.slug,
          sku: selectedProduct.sku,
          name_fr: selectedProduct.name_fr,
          name_nl: selectedProduct.name_nl,
          name_en: selectedProduct.name_en,
          source: "tsb_store",
        })
      );
    }

    window.location.href = "/#quote";
  };

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
                  maxWidth: "760px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  textAlign: "center",
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
                  ← {t("backHome")}
                </a>

                <button
                  type="button"
                  onClick={handleQuoteClick}
                  className="button button--primary"
                >
                  {t("quote")}
                </button>
              </div>
            </div>
          </div>
        </section>

        {(productSlug ||
          selectedProduct ||
          productLoading) && (
          <section
            id="product-request"
            className="section"
            style={{
              paddingTop: "8px",
              paddingBottom: "26px",
              scrollMarginTop: "18px",
            }}
          >
            <div className="container">
              <article
                className="domain-card domain-cyan"
                style={{
                  maxWidth: "900px",
                  margin: "0 auto",
                  padding: "18px 20px",
                }}
              >
                {productLoading ? (
                  <div
                    style={{
                      textAlign: "center",
                      opacity: 0.66,
                    }}
                  >
                    {t("productLoading")}
                  </div>
                ) : selectedProduct ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                      gap: "18px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        flex: "1 1 480px",
                        minWidth: 0,
                      }}
                    >
                      <div
                        className="domain-icon"
                        style={{
                          flex: "0 0 auto",
                          margin: 0,
                        }}
                      >
                        <Package
                          size={22}
                          strokeWidth={1.8}
                        />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <span className="section__eyebrow">
                          {t("productEyebrow")}
                        </span>

                        <h2
                          style={{
                            margin: "5px 0 3px",
                            fontSize:
                              "clamp(1rem, 2vw, 1.3rem)",
                          }}
                        >
                          {t("productTitle")}:{" "}
                          <span>{productName}</span>
                        </h2>

                        {productReference && (
                          <div
                            style={{
                              fontSize: "0.78rem",
                              opacity: 0.66,
                              fontWeight: 750,
                            }}
                          >
                            {t("productReference")}:{" "}
                            {productReference}
                          </div>
                        )}

                        <p
                          style={{
                            margin: "6px 0 0",
                            fontSize: "0.82rem",
                            lineHeight: 1.45,
                          }}
                        >
                          {t("productText")}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleQuoteClick}
                      className="button button--primary"
                      style={{
                        flex: "0 0 auto",
                      }}
                    >
                      <Send size={16} />
                      {t("productQuote")}
                    </button>
                  </div>
                ) : null}
              </article>
            </div>
          </section>
        )}

        <section className="section section--domains">
          <div className="container">
            <div
              className="section-heading"
              style={{
                textAlign: "center",
                maxWidth: "760px",
                margin: "0 auto 30px",
              }}
            >
              <h2>{t("methodsTitle")}</h2>
              <p style={{ textAlign: "center" }}>
                {t("methodsIntro")}
              </p>
            </div>

            <div
              className="domains-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "18px",
                maxWidth: "1120px",
                margin: "0 auto",
              }}
            >
              <article
                className="domain-card domain-blue"
                style={cardStyle}
              >
                <div
                  className="domain-icon"
                  style={{ marginBottom: "14px" }}
                >
                  <Phone
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <span className="domain-category">
                  {t("phoneTitle")}
                </span>

                <h3
                  style={{
                    width: "100%",
                    textAlign: "center",
                    marginTop: "10px",
                  }}
                >
                  {PHONE_DISPLAY}
                </h3>

                <p
                  style={{
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  {t("phoneText")}
                </p>

                <a
                  href={`tel:${PHONE_NUMBER}`}
                  style={{
                    ...actionButtonStyle,
                    color: "#e0f2fe",
                    background:
                      "rgba(14,165,233,0.15)",
                    border:
                      "1px solid rgba(56,189,248,0.38)",
                  }}
                >
                  <Phone size={18} />
                  {t("phoneAction")}
                </a>
              </article>

              <article
                className="domain-card domain-green"
                style={cardStyle}
              >
                <div
                  className="domain-icon"
                  style={{ marginBottom: "14px" }}
                >
                  <MessageCircle
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <span className="domain-category">
                  {t("whatsappTitle")}
                </span>

                <h3
                  style={{
                    width: "100%",
                    textAlign: "center",
                    marginTop: "10px",
                  }}
                >
                  {WHATSAPP_DISPLAY}
                </h3>

                <p
                  style={{
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  {t("whatsappText")}
                </p>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    ...actionButtonStyle,
                    color: "#dcfce7",
                    background:
                      "rgba(34,197,94,0.14)",
                    border:
                      "1px solid rgba(74,222,128,0.36)",
                  }}
                >
                  <MessageCircle size={18} />
                  {t("whatsappAction")}
                </a>
              </article>

              <article
                className="domain-card domain-cyan"
                style={cardStyle}
              >
                <div
                  className="domain-icon"
                  style={{ marginBottom: "14px" }}
                >
                  <Mail
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <span className="domain-category">
                  {t("emailTitle")}
                </span>

                <a
                  href={emailUrl}
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    marginTop: "10px",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    textDecoration: "none",
                    color: "inherit",
                    fontWeight: 800,
                    fontSize:
                      "clamp(0.78rem, 1.6vw, 1rem)",
                    lineHeight: 1.35,
                    boxSizing: "border-box",
                  }}
                  aria-label={EMAIL}
                  title={EMAIL}
                >
                  <span>contact@</span>
                  <span>tsbtechgroup.com</span>
                </a>

                <p
                  style={{
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  {t("emailText")}
                </p>

                <a
                  href={emailUrl}
                  style={{
                    ...actionButtonStyle,
                    color: "#cffafe",
                    background:
                      "rgba(6,182,212,0.14)",
                    border:
                      "1px solid rgba(34,211,238,0.36)",
                  }}
                >
                  <Mail size={18} />
                  {t("emailAction")}
                </a>
              </article>

              <article
                className="domain-card domain-purple"
                style={cardStyle}
              >
                <div
                  className="domain-icon"
                  style={{ marginBottom: "14px" }}
                >
                  <Globe2
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <span className="domain-category">
                  {t("areaTitle")}
                </span>

                <h3
                  style={{
                    width: "100%",
                    textAlign: "center",
                    marginTop: "10px",
                  }}
                >
                  {t("areaValue")}
                </h3>

                <p
                  style={{
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  {t("areaText")}
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
                border:
                  "1px solid rgba(56,189,248,0.24)",
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
                  background:
                    "rgba(14,165,233,0.12)",
                  border:
                    "1px solid rgba(125,211,252,0.28)",
                }}
              >
                <Send
                  size={25}
                  strokeWidth={1.8}
                />
              </div>

              <h2>{t("ctaTitle")}</h2>

              <p
                style={{
                  maxWidth: "700px",
                  margin: "12px auto 0",
                  textAlign: "center",
                }}
              >
                {t("ctaText")}
              </p>

              <button
                type="button"
                onClick={handleQuoteClick}
                className="button button--primary"
                style={{ marginTop: "22px" }}
              >
                {selectedProduct
                  ? t("productQuote")
                  : t("ctaButton")}
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default Contact;
