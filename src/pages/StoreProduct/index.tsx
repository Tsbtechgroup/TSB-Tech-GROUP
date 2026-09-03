import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Box,
  CheckCircle2,
  Clock3,
  Heart,
  Package,
  ShieldCheck,
  ShoppingBag,
  Tag,
  XCircle,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import ScrollToTop from "../../components/common/ScrollToTop";
import StoreMiniCart, {
  addStoreCartItem,
} from "../../components/StoreMiniCart";
import Footer from "../../components/layout/Footer";
import Navbar from "../../components/layout/Navbar";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { storeProductTranslations } from "../../i18n/locales/storeProduct";
import { supabase } from "../../services/supabase";

type StoreCategory =
  | "automobile"
  | "security"
  | "energy"
  | "electronics"
  | "other";

type StoreAvailability =
  | "in_stock"
  | "on_request"
  | "out_of_stock"
  | "coming_soon";

type StoreProductData = {
  id: string;
  slug: string;
  category: StoreCategory;
  name_fr: string;
  name_nl: string | null;
  name_en: string | null;
  description_fr: string | null;
  description_nl: string | null;
  description_en: string | null;
  sku: string | null;
  price: number | null;
  currency: string;
  availability: StoreAvailability;
  stock_quantity: number | null;
  image_url: string | null;
  is_featured: boolean;
};



function formatPrice(
  value: number,
  currency: string,
  intlLocale: string
) {
  try {
    return new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function getLocalizedProductName(
  product: StoreProductData,
  locale: string
) {
  if (locale === "fr") {
    return product.name_fr ||
      product.name_en ||
      product.name_nl ||
      "";
  }

  if (locale === "nl") {
    return product.name_nl ||
      product.name_en ||
      product.name_fr ||
      "";
  }

  if (locale === "en") {
    return product.name_en ||
      product.name_fr ||
      product.name_nl ||
      "";
  }

  return product.name_en ||
    product.name_fr ||
    product.name_nl ||
    "";
}

function getLocalizedProductDescription(
  product: StoreProductData,
  locale: string
) {
  if (locale === "fr") {
    return product.description_fr ||
      product.description_en ||
      product.description_nl ||
      "";
  }

  if (locale === "nl") {
    return product.description_nl ||
      product.description_en ||
      product.description_fr ||
      "";
  }

  if (locale === "en") {
    return product.description_en ||
      product.description_fr ||
      product.description_nl ||
      "";
  }

  return product.description_en ||
    product.description_fr ||
    product.description_nl ||
    "";
}

function getAvailabilityIcon(
  availability: StoreAvailability
) {
  if (availability === "in_stock") {
    return CheckCircle2;
  }

  if (availability === "out_of_stock") {
    return XCircle;
  }

  if (availability === "coming_soon") {
    return Clock3;
  }

  return Package;
}

const STORE_FAVORITES_KEY =
  "tsb_store_favorites";

function readStoreFavorites(): string[] {
  try {
    const raw = window.localStorage.getItem(
      STORE_FAVORITES_KEY
    );

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed.filter(
          (value): value is string =>
            typeof value === "string"
        )
      : [];
  } catch {
    return [];
  }
}

function writeStoreFavorites(
  favorites: string[]
) {
  try {
    window.localStorage.setItem(
      STORE_FAVORITES_KEY,
      JSON.stringify(favorites)
    );
  } catch {
    // La fiche produit reste utilisable sans stockage local.
  }
}

function StoreProduct() {
  const {
    language,
    locale,
    intlLocale,
  } = useLanguage();

  const tr = (key: string) =>
    translate(
      storeProductTranslations,
      locale,
      `storeProduct.${key}`
    );

  const t = {
    eyebrow: tr("eyebrow"),
    back: tr("back"),
    loading: tr("loading"),
    notFoundTitle: tr("notFoundTitle"),
    notFoundText: tr("notFoundText"),
    backStore: tr("backStore"),
    reference: tr("reference"),
    referenceShort: tr("referenceShort"),
    availability: tr("availability"),
    stock: tr("stock"),
    stockUnit: tr("stockUnit"),
    noStockTracking: tr("noStockTracking"),
    price: tr("price"),
    priceOnRequest: tr("priceOnRequest"),
    request: tr("request"),
    addToCart: tr("addToCart"),
    unavailableCart: tr("unavailableCart"),
    favoriteAdd: tr("favoriteAdd"),
    favoriteRemove: tr("favoriteRemove"),
    requestHint: tr("requestHint"),
    trustTitle: tr("trustTitle"),
    trustReference: tr("trustReference"),
    trustAvailability: tr("trustAvailability"),
    trustSupport: tr("trustSupport"),
    relatedEyebrow: tr("relatedEyebrow"),
    relatedTitle: tr("relatedTitle"),
    relatedIntro: tr("relatedIntro"),
    relatedView: tr("relatedView"),
    featured: tr("featured"),
    category: tr("category"),
    categoryLabels: {
      automobile: tr("categoryLabels.automobile"),
      security: tr("categoryLabels.security"),
      energy: tr("categoryLabels.energy"),
      electronics: tr("categoryLabels.electronics"),
      other: tr("categoryLabels.other"),
    },
    availabilityLabels: {
      in_stock: tr("availabilityLabels.in_stock"),
      on_request: tr("availabilityLabels.on_request"),
      out_of_stock: tr("availabilityLabels.out_of_stock"),
      coming_soon: tr("availabilityLabels.coming_soon"),
    },
  };

  const [product, setProduct] =
    useState<StoreProductData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState(false);

  const [favoriteSlugs, setFavoriteSlugs] =
    useState<string[]>([]);

  const [
    relatedProducts,
    setRelatedProducts,
  ] = useState<StoreProductData[]>([]);

  useEffect(() => {
    const syncFavorites = () => {
      setFavoriteSlugs(
        readStoreFavorites()
      );
    };

    syncFavorites();

    window.addEventListener(
      "storage",
      syncFavorites
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncFavorites
      );
    };
  }, []);

  const toggleFavorite = (
    favoriteSlug: string
  ) => {
    setFavoriteSlugs((previous) => {
      const next = previous.includes(
        favoriteSlug
      )
        ? previous.filter(
            (currentSlug) =>
              currentSlug !== favoriteSlug
          )
        : [...previous, favoriteSlug];

      writeStoreFavorites(next);
      return next;
    });
  };

  const slug = useMemo(() => {
    const prefix = "/store/product/";

    const pathname =
      window.location.pathname.replace(/\/+$/, "");

    if (!pathname.startsWith(prefix)) {
      return "";
    }

    try {
      return decodeURIComponent(
        pathname.slice(prefix.length)
      );
    } catch {
      return pathname.slice(prefix.length);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadProduct = async () => {
      if (!slug) {
        setLoadError(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(false);

      const { data, error } =
        await supabase
          .from("store_products")
          .select(
            "id, slug, category, name_fr, name_nl, name_en, description_fr, description_nl, description_en, sku, price, currency, availability, stock_quantity, image_url, is_featured"
          )
          .eq("slug", slug)
          .eq("is_published", true)
          .maybeSingle();

      if (!mounted) {
        return;
      }

      if (error || !data) {
        if (error) {
          console.error(
            "Erreur chargement fiche produit :",
            error
          );
        }

        setProduct(null);
        setLoadError(true);
        setLoading(false);
        return;
      }

      setProduct(
        data as StoreProductData
      );

      setLoading(false);
    };

    void loadProduct();

    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    let mounted = true;

    const loadRelatedProducts = async () => {
      if (!product) {
        setRelatedProducts([]);
        return;
      }

      const { data, error } =
        await supabase
          .from("store_products")
          .select(
            "id, slug, category, name_fr, name_nl, name_en, description_fr, description_nl, description_en, sku, price, currency, availability, stock_quantity, image_url, is_featured"
          )
          .eq("is_published", true)
          .eq("category", product.category)
          .neq("id", product.id)
          .order("is_featured", {
            ascending: false,
          })
          .order("sort_order", {
            ascending: true,
          })
          .limit(4);

      if (!mounted) {
        return;
      }

      if (error) {
        console.error(
          "Erreur chargement produits similaires :",
          error
        );
        setRelatedProducts([]);
        return;
      }

      setRelatedProducts(
        (data ?? []) as StoreProductData[]
      );
    };

    void loadRelatedProducts();

    return () => {
      mounted = false;
    };
  }, [product]);

  useEffect(() => {
    if (!product) {
      return;
    }

    const name =
      getLocalizedProductName(
        product,
        locale
      );

    document.title =
      `${name} | TSB Store`;
  }, [locale, product]);

  const productName = product
    ? getLocalizedProductName(
        product,
        locale
      )
    : "";

  const productDescription = product
    ? getLocalizedProductDescription(
        product,
        locale
      )
    : "";

  const AvailabilityIcon =
    product
      ? getAvailabilityIcon(
          product.availability
        )
      : Package;

  const requestHref = product
    ? `/contact?product=${encodeURIComponent(
        product.slug
      )}&ref=${encodeURIComponent(
        product.sku ?? ""
      )}`
    : "/contact";

  return (
    <>
      <Navbar />

      <main>
        <section
          className="section"
          style={{
            paddingTop: "34px",
            paddingBottom: "48px",
          }}
        >
          <div className="container">
            <a
              href="/store#catalogue"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                marginBottom: "18px",
                color: "#7dd3fc",
                textDecoration: "none",
                fontSize: "0.84rem",
                fontWeight: 800,
              }}
            >
              <ArrowLeft size={16} />
              {t.back}
            </a>

            {loading ? (
              <div
                className="domain-card domain-blue"
                style={{
                  padding: "46px 20px",
                  textAlign: "center",
                }}
              >
                <Package
                  size={34}
                  style={{
                    opacity: 0.45,
                    marginBottom: "10px",
                  }}
                />

                <p style={{ margin: 0 }}>
                  {t.loading}
                </p>
              </div>
            ) : loadError || !product ? (
              <div
                className="domain-card domain-blue"
                style={{
                  padding: "46px 20px",
                  textAlign: "center",
                }}
              >
                <Package
                  size={38}
                  style={{
                    opacity: 0.4,
                    marginBottom: "12px",
                  }}
                />

                <span className="section__eyebrow">
                  {t.eyebrow}
                </span>

                <h1
                  style={{
                    margin: "8px 0 8px",
                    fontSize:
                      "clamp(1.7rem, 4vw, 2.5rem)",
                  }}
                >
                  {t.notFoundTitle}
                </h1>

                <p
                  style={{
                    maxWidth: "620px",
                    margin: "0 auto 18px",
                  }}
                >
                  {t.notFoundText}
                </p>

                <a
                  href="/store#catalogue"
                  className="button button--primary"
                >
                  {t.backStore}
                </a>
              </div>
            ) : (
              <article
                className="domain-card domain-cyan"
                style={{
                  maxWidth: "1080px",
                  margin: "0 auto",
                  padding: 0,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(300px, 1fr))",
                    alignItems: "stretch",
                  }}
                >
                  {/* VISUEL PRODUIT */}
                  <div
                    style={{
                      minHeight: "310px",
                      maxHeight: "410px",
                      display: "grid",
                      placeItems: "center",
                      overflow: "hidden",
                      background:
                        "linear-gradient(135deg, rgba(56,189,248,0.08), rgba(255,255,255,0.02))",
                      borderRight:
                        "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={productName}
                        style={{
                          width: "100%",
                          height: "100%",
                          maxHeight: "410px",
                          objectFit: "contain",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "30px",
                          opacity: 0.52,
                        }}
                      >
                        <Package
                          size={58}
                          strokeWidth={1.35}
                        />
                        <div
                          style={{
                            marginTop: "10px",
                            fontSize: "0.76rem",
                            fontWeight: 800,
                            letterSpacing: "0.12em",
                          }}
                        >
                          TSB STORE
                        </div>
                      </div>
                    )}
                  </div>

                  {/* INFORMATIONS PRODUIT */}
                  <div
                    style={{
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        className="section__eyebrow"
                        style={{ margin: 0 }}
                      >
                        {
                          t.categoryLabels[
                            product.category
                          ]
                        }
                      </span>

                      {product.is_featured && (
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "999px",
                            border:
                              "1px solid rgba(250,204,21,0.20)",
                            background:
                              "rgba(250,204,21,0.07)",
                            fontSize: "0.68rem",
                            fontWeight: 800,
                          }}
                        >
                          ★ {t.featured}
                        </span>
                      )}
                    </div>

                    <h1
                      style={{
                        margin: "10px 0 7px",
                        fontSize:
                          "clamp(1.55rem, 3.2vw, 2.25rem)",
                        lineHeight: 1.08,
                      }}
                    >
                      {productName}
                    </h1>

                    {productDescription && (
                      <p
                        style={{
                          margin: "0 0 16px",
                          maxWidth: "620px",
                          fontSize: "0.9rem",
                          lineHeight: 1.6,
                          opacity: 0.78,
                        }}
                      >
                        {productDescription}
                      </p>
                    )}

                    {/* PRIX + ACTION */}
                    <div
                      style={{
                        marginTop: "2px",
                        padding: "16px",
                        borderRadius: "15px",
                        border:
                          "1px solid rgba(56,189,248,0.16)",
                        background:
                          "linear-gradient(135deg, rgba(22,136,255,0.09), rgba(0,212,255,0.04))",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent:
                            "space-between",
                          gap: "14px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "0.66rem",
                              opacity: 0.55,
                              fontWeight: 850,
                              textTransform:
                                "uppercase",
                              letterSpacing:
                                "0.08em",
                            }}
                          >
                            {t.price}
                          </div>

                          <strong
                            style={{
                              display: "block",
                              marginTop: "3px",
                              color:
                                product.price ===
                                null
                                  ? "#7dd3fc"
                                  : "#ffffff",
                              fontSize:
                                "clamp(1.45rem, 3vw, 1.95rem)",
                              lineHeight: 1.1,
                            }}
                          >
                            {product.price === null
                              ? t.priceOnRequest
                              : formatPrice(
                                  Number(
                                    product.price
                                  ),
                                  product.currency,
                                  intlLocale
                                )}
                          </strong>
                        </div>

                        <span
                          style={{
                            padding: "6px 10px",
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            gap: "6px",
                            borderRadius:
                              "999px",
                            border:
                              product.availability ===
                              "in_stock"
                                ? "1px solid rgba(34,197,94,0.28)"
                                : "1px solid rgba(56,189,248,0.22)",
                            background:
                              product.availability ===
                              "in_stock"
                                ? "rgba(34,197,94,0.09)"
                                : "rgba(56,189,248,0.07)",
                            color:
                              product.availability ===
                              "in_stock"
                                ? "#86efac"
                                : "#7dd3fc",
                            fontSize:
                              "0.72rem",
                            fontWeight:
                              850,
                          }}
                        >
                          <AvailabilityIcon
                            size={14}
                          />
                          {
                            t.availabilityLabels[
                              product.availability
                            ]
                          }
                        </span>
                      </div>

                      <a
                        href={requestHref}
                        className="button button--primary"
                        style={{
                          width: "100%",
                          minHeight: "46px",
                          marginTop: "14px",
                          padding: "0 18px",
                          justifyContent:
                            "center",
                          gap: "8px",
                          fontWeight: 850,
                        }}
                      >
                        <ShoppingBag size={17} />
                        {t.request}
                        <ArrowRight size={16} />
                      </a>

                      <button
                        type="button"
                        disabled={
                          product.availability ===
                            "out_of_stock" ||
                          product.availability ===
                            "coming_soon"
                        }
                        onClick={() =>
                          addStoreCartItem(
                            {
                              slug:
                                product.slug,
                              name_fr:
                                product.name_fr,
                              name_nl:
                                product.name_nl,
                              name_en:
                                product.name_en,
                              sku:
                                product.sku,
                              price:
                                product.price ===
                                null
                                  ? null
                                  : Number(
                                      product.price
                                    ),
                              currency:
                                product.currency,
                              image_url:
                                product.image_url,
                            }
                          )
                        }
                        className="button button--primary"
                        style={{
                          width: "100%",
                          minHeight: "43px",
                          marginTop: "8px",
                          padding:
                            "0 16px",
                          justifyContent:
                            "center",
                          gap: "8px",
                          opacity:
                            product.availability ===
                              "out_of_stock" ||
                            product.availability ===
                              "coming_soon"
                              ? 0.46
                              : 1,
                          cursor:
                            product.availability ===
                              "out_of_stock" ||
                            product.availability ===
                              "coming_soon"
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        <ShoppingBag
                          size={16}
                        />
                        {product.availability ===
                          "out_of_stock" ||
                        product.availability ===
                          "coming_soon"
                          ? t.unavailableCart
                          : t.addToCart}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          toggleFavorite(
                            product.slug
                          )
                        }
                        aria-pressed={
                          favoriteSlugs.includes(
                            product.slug
                          )
                        }
                        className="button button--secondary"
                        style={{
                          width: "100%",
                          minHeight: "40px",
                          marginTop: "8px",
                          padding:
                            "0 16px",
                          justifyContent:
                            "center",
                          gap: "8px",
                          borderColor:
                            favoriteSlugs.includes(
                              product.slug
                            )
                              ? "rgba(248,113,113,0.34)"
                              : undefined,
                          color:
                            favoriteSlugs.includes(
                              product.slug
                            )
                              ? "#fca5a5"
                              : undefined,
                        }}
                      >
                        <Heart
                          size={16}
                          fill={
                            favoriteSlugs.includes(
                              product.slug
                            )
                              ? "currentColor"
                              : "none"
                          }
                        />
                        {favoriteSlugs.includes(
                          product.slug
                        )
                          ? t.favoriteRemove
                          : t.favoriteAdd}
                      </button>

                      <p
                        style={{
                          margin:
                            "9px 0 0",
                          color:
                            "rgba(255,255,255,0.52)",
                          fontSize:
                            "0.7rem",
                          lineHeight: 1.45,
                          textAlign:
                            "center",
                        }}
                      >
                        {t.requestHint}
                      </p>
                    </div>

                    {/* INFORMATIONS ESSENTIELLES */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(3, minmax(0, 1fr))",
                        gap: "8px",
                        marginTop: "14px",
                      }}
                    >
                      <div
                        style={{
                          minWidth: 0,
                          padding: "10px",
                          borderRadius: "11px",
                          background:
                            "rgba(255,255,255,0.03)",
                          border:
                            "1px solid rgba(255,255,255,0.065)",
                        }}
                      >
                        <Tag
                          size={15}
                          style={{
                            color: "#7dd3fc",
                            marginBottom: "5px",
                          }}
                        />
                        <div
                          style={{
                            fontSize: "0.64rem",
                            opacity: 0.5,
                            fontWeight: 800,
                            textTransform:
                              "uppercase",
                          }}
                        >
                          {t.reference}
                        </div>
                        <strong
                          style={{
                            display: "block",
                            marginTop: "2px",
                            fontSize: "0.8rem",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {product.sku || "—"}
                        </strong>
                      </div>

                      <div
                        style={{
                          minWidth: 0,
                          padding: "10px",
                          borderRadius: "11px",
                          background:
                            "rgba(255,255,255,0.03)",
                          border:
                            "1px solid rgba(255,255,255,0.065)",
                        }}
                      >
                        <AvailabilityIcon
                          size={15}
                          style={{
                            color:
                              product.availability ===
                              "in_stock"
                                ? "#86efac"
                                : "#7dd3fc",
                            marginBottom: "5px",
                          }}
                        />
                        <div
                          style={{
                            fontSize: "0.64rem",
                            opacity: 0.5,
                            fontWeight: 800,
                            textTransform:
                              "uppercase",
                          }}
                        >
                          {t.availability}
                        </div>
                        <strong
                          style={{
                            display: "block",
                            marginTop: "2px",
                            fontSize: "0.8rem",
                          }}
                        >
                          {
                            t.availabilityLabels[
                              product.availability
                            ]
                          }
                        </strong>
                      </div>

                      <div
                        style={{
                          minWidth: 0,
                          padding: "10px",
                          borderRadius: "11px",
                          background:
                            "rgba(255,255,255,0.03)",
                          border:
                            "1px solid rgba(255,255,255,0.065)",
                        }}
                      >
                        <Box
                          size={15}
                          style={{
                            color: "#7dd3fc",
                            marginBottom: "5px",
                          }}
                        />
                        <div
                          style={{
                            fontSize: "0.64rem",
                            opacity: 0.5,
                            fontWeight: 800,
                            textTransform:
                              "uppercase",
                          }}
                        >
                          {t.stock}
                        </div>
                        <strong
                          style={{
                            display: "block",
                            marginTop: "2px",
                            fontSize: "0.8rem",
                          }}
                        >
                          {product.stock_quantity ===
                          null
                            ? t.noStockTracking
                            : `${product.stock_quantity} ${t.stockUnit}`}
                        </strong>
                      </div>
                    </div>

                    {/* CONFIANCE TSB */}
                    <div
                      style={{
                        marginTop: "14px",
                        paddingTop: "14px",
                        borderTop:
                          "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                          marginBottom: "9px",
                          color: "#7dd3fc",
                          fontSize: "0.66rem",
                          fontWeight: 900,
                          letterSpacing:
                            "0.08em",
                        }}
                      >
                        <ShieldCheck
                          size={15}
                        />
                        {t.trustTitle}
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(3, minmax(0, 1fr))",
                          gap: "8px",
                        }}
                      >
                        {[
                          {
                            icon:
                              BadgeCheck,
                            label:
                              t.trustReference,
                          },
                          {
                            icon:
                              CheckCircle2,
                            label:
                              t.trustAvailability,
                          },
                          {
                            icon:
                              ShieldCheck,
                            label:
                              t.trustSupport,
                          },
                        ].map(
                          (trustItem) => {
                            const TrustIcon =
                              trustItem.icon;

                            return (
                              <div
                                key={
                                  trustItem.label
                                }
                                style={{
                                  minWidth:
                                    0,
                                  minHeight:
                                    "58px",
                                  padding:
                                    "9px",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  gap:
                                    "8px",
                                  borderRadius:
                                    "11px",
                                  border:
                                    "1px solid rgba(255,255,255,0.06)",
                                  background:
                                    "rgba(255,255,255,0.025)",
                                }}
                              >
                                <TrustIcon
                                  size={
                                    16
                                  }
                                  style={{
                                    flexShrink:
                                      0,
                                    color:
                                      "#38bdf8",
                                  }}
                                />

                                <span
                                  style={{
                                    fontSize:
                                      "0.69rem",
                                    lineHeight:
                                      1.3,
                                    color:
                                      "rgba(255,255,255,0.72)",
                                    fontWeight:
                                      750,
                                  }}
                                >
                                  {
                                    trustItem.label
                                  }
                                </span>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {!loading &&
              !loadError &&
              product &&
              relatedProducts.length > 0 && (
                <section
                  aria-labelledby="related-products-title"
                  style={{
                    maxWidth: "1080px",
                    margin: "28px auto 0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent:
                        "space-between",
                      gap: "14px",
                      flexWrap: "wrap",
                      marginBottom: "14px",
                    }}
                  >
                    <div>
                      <span className="section__eyebrow">
                        {t.relatedEyebrow}
                      </span>

                      <h2
                        id="related-products-title"
                        style={{
                          margin: "7px 0 5px",
                          fontSize:
                            "clamp(1.3rem, 3vw, 1.8rem)",
                        }}
                      >
                        {t.relatedTitle}
                      </h2>

                      <p
                        style={{
                          margin: 0,
                          maxWidth: "650px",
                          color:
                            "rgba(255,255,255,0.62)",
                          fontSize: "0.82rem",
                          lineHeight: 1.55,
                        }}
                      >
                        {t.relatedIntro}
                      </p>
                    </div>

                    <a
                      href="/store#catalogue"
                      style={{
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        gap: "6px",
                        color:
                          "#7dd3fc",
                        textDecoration:
                          "none",
                        fontSize:
                          "0.76rem",
                        fontWeight: 850,
                      }}
                    >
                      {t.backStore}
                      <ArrowRight size={14} />
                    </a>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(210px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    {relatedProducts.map(
                      (relatedProduct) => {
                        const relatedName =
                          getLocalizedProductName(
                            relatedProduct,
                            locale
                          );

                        return (
                          <article
                            key={
                              relatedProduct.id
                            }
                            className="domain-card domain-blue"
                            style={{
                              position:
                                "relative",
                              padding: 0,
                              overflow:
                                "hidden",
                              display:
                                "flex",
                              flexDirection:
                                "column",
                              minHeight:
                                "255px",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                toggleFavorite(
                                  relatedProduct.slug
                                )
                              }
                              aria-label={
                                favoriteSlugs.includes(
                                  relatedProduct.slug
                                )
                                  ? t.favoriteRemove
                                  : t.favoriteAdd
                              }
                              title={
                                favoriteSlugs.includes(
                                  relatedProduct.slug
                                )
                                  ? t.favoriteRemove
                                  : t.favoriteAdd
                              }
                              style={{
                                position:
                                  "absolute",
                                top: "9px",
                                right: "9px",
                                zIndex: 3,
                                width: "32px",
                                height:
                                  "32px",
                                display:
                                  "inline-grid",
                                placeItems:
                                  "center",
                                borderRadius:
                                  "999px",
                                border:
                                  favoriteSlugs.includes(
                                    relatedProduct.slug
                                  )
                                    ? "1px solid rgba(248,113,113,0.46)"
                                    : "1px solid rgba(255,255,255,0.15)",
                                background:
                                  favoriteSlugs.includes(
                                    relatedProduct.slug
                                  )
                                    ? "rgba(127,29,29,0.78)"
                                    : "rgba(7,18,31,0.78)",
                                color:
                                  favoriteSlugs.includes(
                                    relatedProduct.slug
                                  )
                                    ? "#fca5a5"
                                    : "#ffffff",
                                cursor:
                                  "pointer",
                                backdropFilter:
                                  "blur(8px)",
                              }}
                            >
                              <Heart
                                size={16}
                                fill={
                                  favoriteSlugs.includes(
                                    relatedProduct.slug
                                  )
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>

                            <a
                              href={`/store/product/${encodeURIComponent(
                                relatedProduct.slug
                              )}`}
                              aria-label={
                                relatedName
                              }
                              style={{
                                height:
                                  "132px",
                                display:
                                  "grid",
                                placeItems:
                                  "center",
                                overflow:
                                  "hidden",
                                background:
                                  "linear-gradient(135deg, rgba(56,189,248,0.07), rgba(255,255,255,0.02))",
                                borderBottom:
                                  "1px solid rgba(255,255,255,0.07)",
                                textDecoration:
                                  "none",
                                color:
                                  "inherit",
                              }}
                            >
                              {relatedProduct.image_url ? (
                                <img
                                  src={
                                    relatedProduct.image_url
                                  }
                                  alt={
                                    relatedName
                                  }
                                  loading="lazy"
                                  style={{
                                    width:
                                      "100%",
                                    height:
                                      "100%",
                                    objectFit:
                                      "cover",
                                    display:
                                      "block",
                                  }}
                                />
                              ) : (
                                <Package
                                  size={38}
                                  strokeWidth={
                                    1.4
                                  }
                                  style={{
                                    opacity:
                                      0.45,
                                  }}
                                />
                              )}
                            </a>

                            <div
                              style={{
                                padding:
                                  "12px",
                                display:
                                  "flex",
                                flexDirection:
                                  "column",
                                flex: 1,
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "space-between",
                                  gap: "7px",
                                  flexWrap:
                                    "wrap",
                                  marginBottom:
                                    "7px",
                                }}
                              >
                                <span
                                  style={{
                                    padding:
                                      "4px 7px",
                                    borderRadius:
                                      "999px",
                                    border:
                                      relatedProduct.availability ===
                                      "in_stock"
                                        ? "1px solid rgba(34,197,94,0.24)"
                                        : "1px solid rgba(56,189,248,0.18)",
                                    background:
                                      relatedProduct.availability ===
                                      "in_stock"
                                        ? "rgba(34,197,94,0.08)"
                                        : "rgba(56,189,248,0.06)",
                                    color:
                                      relatedProduct.availability ===
                                      "in_stock"
                                        ? "#86efac"
                                        : "#7dd3fc",
                                    fontSize:
                                      "0.65rem",
                                    fontWeight:
                                      850,
                                  }}
                                >
                                  {
                                    t.availabilityLabels[
                                      relatedProduct
                                        .availability
                                    ]
                                  }
                                </span>

                                {relatedProduct.is_featured && (
                                  <span
                                    style={{
                                      fontSize:
                                        "0.65rem",
                                      color:
                                        "#7dd3fc",
                                      fontWeight:
                                        850,
                                    }}
                                  >
                                    ★{" "}
                                    {
                                      t.featured
                                    }
                                  </span>
                                )}
                              </div>

                              <h3
                                style={{
                                  margin: 0,
                                  fontSize:
                                    "0.9rem",
                                  lineHeight:
                                    1.3,
                                }}
                              >
                                {
                                  relatedName
                                }
                              </h3>

                              {relatedProduct.sku && (
                                <div
                                  style={{
                                    marginTop:
                                      "5px",
                                    color:
                                      "rgba(255,255,255,0.46)",
                                    fontSize:
                                      "0.66rem",
                                  }}
                                >
                                  {t.referenceShort}{" "}
                                  {
                                    relatedProduct.sku
                                  }
                                </div>
                              )}

                              <div
                                style={{
                                  marginTop:
                                    "auto",
                                  paddingTop:
                                    "11px",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "space-between",
                                  gap: "8px",
                                  flexWrap:
                                    "wrap",
                                }}
                              >
                                <strong
                                  style={{
                                    fontSize:
                                      "0.88rem",
                                  }}
                                >
                                  {relatedProduct.price ===
                                  null
                                    ? t.priceOnRequest
                                    : formatPrice(
                                        Number(
                                          relatedProduct.price
                                        ),
                                        relatedProduct.currency,
                                        intlLocale
                                      )}
                                </strong>

                                <div
                                  style={{
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    gap: "6px",
                                    flexWrap:
                                      "wrap",
                                  }}
                                >
                                  <a
                                    href={`/store/product/${encodeURIComponent(
                                      relatedProduct.slug
                                    )}`}
                                    className="button button--secondary"
                                    style={{
                                      minHeight:
                                        "32px",
                                      padding:
                                        "0 8px",
                                      fontSize:
                                        "0.66rem",
                                    }}
                                  >
                                    {
                                      t.relatedView
                                    }
                                  </a>

                                  <button
                                    type="button"
                                    disabled={
                                      relatedProduct.availability ===
                                        "out_of_stock" ||
                                      relatedProduct.availability ===
                                        "coming_soon"
                                    }
                                    onClick={() =>
                                      addStoreCartItem(
                                        {
                                          slug:
                                            relatedProduct.slug,
                                          name_fr:
                                            relatedProduct.name_fr,
                                          name_nl:
                                            relatedProduct.name_nl,
                                          name_en:
                                            relatedProduct.name_en,
                                          sku:
                                            relatedProduct.sku,
                                          price:
                                            relatedProduct.price ===
                                            null
                                              ? null
                                              : Number(
                                                  relatedProduct.price
                                                ),
                                          currency:
                                            relatedProduct.currency,
                                          image_url:
                                            relatedProduct.image_url,
                                        }
                                      )
                                    }
                                    className="button button--primary"
                                    style={{
                                      minHeight:
                                        "32px",
                                      padding:
                                        "0 8px",
                                      fontSize:
                                        "0.66rem",
                                      opacity:
                                        relatedProduct.availability ===
                                          "out_of_stock" ||
                                        relatedProduct.availability ===
                                          "coming_soon"
                                          ? 0.46
                                          : 1,
                                      cursor:
                                        relatedProduct.availability ===
                                          "out_of_stock" ||
                                        relatedProduct.availability ===
                                          "coming_soon"
                                          ? "not-allowed"
                                          : "pointer",
                                    }}
                                  >
                                    <ShoppingBag
                                      size={
                                        12
                                      }
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </article>
                        );
                      }
                    )}
                  </div>
                </section>
              )}
          </div>
        </section>
      </main>

      <Footer />
      <StoreMiniCart language={language} />
      <ScrollToTop />
    </>
  );
}

export default StoreProduct;
