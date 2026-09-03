import {
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useLanguage } from "../context/LanguageContext";
import { translate } from "../i18n";
import { storeMiniCartTranslations } from "../i18n/locales/storeMiniCart";

export type StoreCartItem = {
  slug: string;
  name_fr: string;
  name_nl: string | null;
  name_en: string | null;
  sku: string | null;
  price: number | null;
  currency: string;
  image_url: string | null;
  quantity: number;
};

type StoreLanguage = "FR" | "NL" | "EN";

const STORE_CART_KEY = "tsb_store_cart";
const STORE_CART_EVENT =
  "tsb-store-cart-updated";



export function readStoreCart(): StoreCartItem[] {
  try {
    const raw =
      window.localStorage.getItem(
        STORE_CART_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.slug === "string"
      )
      .map((item) => ({
        slug: item.slug,
        name_fr:
          typeof item.name_fr === "string"
            ? item.name_fr
            : "",
        name_nl:
          typeof item.name_nl === "string"
            ? item.name_nl
            : null,
        name_en:
          typeof item.name_en === "string"
            ? item.name_en
            : null,
        sku:
          typeof item.sku === "string"
            ? item.sku
            : null,
        price:
          typeof item.price === "number"
            ? item.price
            : item.price === null
              ? null
              : Number.isFinite(
                    Number(item.price)
                  )
                ? Number(item.price)
                : null,
        currency:
          typeof item.currency === "string"
            ? item.currency
            : "EUR",
        image_url:
          typeof item.image_url === "string"
            ? item.image_url
            : null,
        quantity:
          Number.isFinite(
            Number(item.quantity)
          )
            ? Math.max(
                1,
                Math.floor(
                  Number(item.quantity)
                )
              )
            : 1,
      }));
  } catch {
    return [];
  }
}

export function writeStoreCart(
  cart: StoreCartItem[],
  open = false
) {
  try {
    window.localStorage.setItem(
      STORE_CART_KEY,
      JSON.stringify(cart)
    );
  } catch {
    // Le Store reste utilisable si le stockage local est indisponible.
  }

  window.dispatchEvent(
    new CustomEvent(STORE_CART_EVENT, {
      detail: { open },
    })
  );
}

export function addStoreCartItem(
  item: Omit<StoreCartItem, "quantity">
) {
  const current = readStoreCart();
  const existing = current.find(
    (cartItem) =>
      cartItem.slug === item.slug
  );

  const next = existing
    ? current.map((cartItem) =>
        cartItem.slug === item.slug
          ? {
              ...cartItem,
              ...item,
              quantity:
                cartItem.quantity + 1,
            }
          : cartItem
      )
    : [
        ...current,
        {
          ...item,
          quantity: 1,
        },
      ];

  writeStoreCart(next, true);
}

function formatMoney(
  value: number,
  currency: string,
  intlLocale: string
) {
  try {
    return new Intl.NumberFormat(
      intlLocale,
      {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function StoreMiniCart({
  language: legacyLanguage,
}: {
  language: StoreLanguage;
}) {
  /*
    Prop conservée pour compatibilité avec les pages Store existantes.
    L'affichage moderne suit désormais la locale centrale du site.
  */
  void legacyLanguage;

  const {
    locale,
    intlLocale,
  } = useLanguage();

  const t = (key: string) =>
    translate(
      storeMiniCartTranslations,
      locale,
      `storeMiniCart.${key}`
    );

  const [cart, setCart] =
    useState<StoreCartItem[]>([]);

  const [open, setOpen] =
    useState(false);

  const syncCart = () => {
    setCart(readStoreCart());
  };

  useEffect(() => {
    syncCart();

    const handleStorage = () => {
      syncCart();
    };

    const handleCartEvent = (
      event: Event
    ) => {
      syncCart();

      const customEvent =
        event as CustomEvent<{
          open?: boolean;
        }>;

      if (customEvent.detail?.open) {
        setOpen(true);
      }
    };

    window.addEventListener(
      "storage",
      handleStorage
    );
    window.addEventListener(
      STORE_CART_EVENT,
      handleCartEvent
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
      window.removeEventListener(
        STORE_CART_EVENT,
        handleCartEvent
      );
    };
  }, []);

  const itemCount = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + item.quantity,
        0
      ),
    [cart]
  );

  const onRequestCount = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          item.price === null
            ? sum + item.quantity
            : sum,
        0
      ),
    [cart]
  );

  const totals = useMemo(() => {
    const grouped = new Map<
      string,
      number
    >();

    cart.forEach((item) => {
      if (item.price === null) {
        return;
      }

      const currency =
        item.currency || "EUR";

      grouped.set(
        currency,
        (grouped.get(currency) ?? 0) +
          item.price * item.quantity
      );
    });

    return Array.from(grouped.entries());
  }, [cart]);

  const updateQuantity = (
    slug: string,
    quantity: number
  ) => {
    const next = cart
      .map((item) =>
        item.slug === slug
          ? {
              ...item,
              quantity: Math.max(
                0,
                quantity
              ),
            }
          : item
      )
      .filter(
        (item) =>
          item.quantity > 0
      );

    setCart(next);
    writeStoreCart(next);
  };

  const removeItem = (
    slug: string
  ) => {
    const next = cart.filter(
      (item) =>
        item.slug !== slug
    );

    setCart(next);
    writeStoreCart(next);
  };

  const clearCart = () => {
    setCart([]);
    writeStoreCart([]);
  };

  const getName = (
    item: StoreCartItem
  ) => {
    if (locale === "fr") {
      return (
        item.name_fr ||
        item.name_en ||
        item.name_nl ||
        ""
      );
    }

    if (locale === "nl") {
      return (
        item.name_nl ||
        item.name_en ||
        item.name_fr ||
        ""
      );
    }

    if (locale === "en") {
      return (
        item.name_en ||
        item.name_fr ||
        item.name_nl ||
        ""
      );
    }

    /*
      La base produit ne possède actuellement que
      name_fr / name_nl / name_en.
      Pour DE/ES/IT/PT/AR/TR/ZH : EN -> FR -> NL.
    */
    return (
      item.name_en ||
      item.name_fr ||
      item.name_nl ||
      ""
    );
  };

  const requestCart = () => {
    if (cart.length === 0) {
      return;
    }

    try {
      window.sessionStorage.setItem(
        "tsb_store_cart_request",
        JSON.stringify({
          source: "tsb_store_cart",
          created_at:
            new Date().toISOString(),
          items: cart,
        })
      );

      /*
        Le clic sur "Demander ces produits" exprime
        clairement le souhait de démarrer cette nouvelle
        demande. On évite donc qu'un ancien brouillon ou
        une ancienne demande produit prenne la priorité.
      */
      window.sessionStorage.removeItem(
        "tsb_pending_quote"
      );
      window.sessionStorage.removeItem(
        "tsb_store_product_request"
      );
    } catch (error) {
      console.error(
        "Erreur préparation demande panier TSB Store :",
        error
      );
      return;
    }

    setOpen(false);
    window.location.href = "/#quote";
  };

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setOpen((previous) => !previous)
        }
        aria-expanded={open}
        aria-label={t("cart")}
        style={{
          position: "fixed",
          right: "18px",
          bottom: "78px",
          zIndex: 1200,
          minHeight: "46px",
          padding: "0 14px",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          borderRadius: "999px",
          border:
            "1px solid rgba(56,189,248,0.38)",
          background:
            "linear-gradient(135deg, rgba(13,17,23,0.96), rgba(18,24,32,0.96))",
          color: "#ffffff",
          font: "inherit",
          fontSize: "0.76rem",
          fontWeight: 900,
          cursor: "pointer",
          boxShadow:
            "0 16px 38px rgba(0,0,0,0.34)",
          backdropFilter: "blur(14px)",
        }}
      >
        <ShoppingCart
          size={18}
          style={{
            color: "#38bdf8",
          }}
        />
        {t("cart")}

        <span
          style={{
            minWidth: "22px",
            height: "22px",
            padding: "0 6px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "999px",
            background: "#1688ff",
            color: "#ffffff",
            fontSize: "0.66rem",
            fontWeight: 900,
          }}
        >
          {itemCount > 99
            ? "99+"
            : itemCount}
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            onClick={() =>
              setOpen(false)
            }
            aria-label={t("close")}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1198,
              border: 0,
              background:
                "rgba(0,0,0,0.50)",
              cursor: "default",
            }}
          />

          <aside
            aria-label={t("title")}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              zIndex: 1199,
              width:
                "min(420px, 94vw)",
              display: "flex",
              flexDirection: "column",
              background: "#0D1117",
              borderLeft:
                "1px solid rgba(56,189,248,0.18)",
              boxShadow:
                "-24px 0 60px rgba(0,0,0,0.38)",
              color: "#ffffff",
            }}
          >
            <div
              style={{
                padding: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                gap: "12px",
                borderBottom:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#38bdf8",
                    fontSize: "0.65rem",
                    fontWeight: 900,
                    letterSpacing:
                      "0.12em",
                  }}
                >
                  TSB STORE
                </div>

                <h2
                  style={{
                    margin: "5px 0 0",
                    fontSize: "1.15rem",
                  }}
                >
                  {t("title")}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                aria-label={t("close")}
                style={{
                  width: "36px",
                  height: "36px",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "999px",
                  border:
                    "1px solid rgba(255,255,255,0.11)",
                  background:
                    "rgba(255,255,255,0.04)",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "14px 18px",
              }}
            >
              {cart.length === 0 ? (
                <div
                  style={{
                    minHeight: "280px",
                    display: "grid",
                    placeItems: "center",
                    textAlign: "center",
                  }}
                >
                  <div>
                    <Package
                      size={44}
                      strokeWidth={1.35}
                      style={{
                        color: "#38bdf8",
                        opacity: 0.7,
                      }}
                    />

                    <h3
                      style={{
                        margin:
                          "12px 0 6px",
                      }}
                    >
                      {t("empty")}
                    </h3>

                    <p
                      style={{
                        margin:
                          "0 auto 16px",
                        maxWidth:
                          "300px",
                        color:
                          "rgba(255,255,255,0.58)",
                        fontSize:
                          "0.78rem",
                        lineHeight:
                          1.5,
                      }}
                    >
                      {t("emptyHint")}
                    </p>

                    <a
                      href="/store#catalogue"
                      className="button button--secondary"
                      onClick={() =>
                        setOpen(false)
                      }
                    >
                      {t("continue")}
                    </a>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  {cart.map((item) => {
                    const name =
                      getName(item);

                    return (
                      <article
                        key={item.slug}
                        style={{
                          padding:
                            "10px",
                          display:
                            "grid",
                          gridTemplateColumns:
                            "62px minmax(0, 1fr)",
                          gap: "10px",
                          borderRadius:
                            "13px",
                          border:
                            "1px solid rgba(255,255,255,0.075)",
                          background:
                            "rgba(255,255,255,0.025)",
                        }}
                      >
                        <a
                          href={`/store/product/${encodeURIComponent(
                            item.slug
                          )}`}
                          onClick={() =>
                            setOpen(false)
                          }
                          style={{
                            height:
                              "62px",
                            display:
                              "grid",
                            placeItems:
                              "center",
                            overflow:
                              "hidden",
                            borderRadius:
                              "10px",
                            background:
                              "rgba(56,189,248,0.05)",
                            textDecoration:
                              "none",
                            color:
                              "inherit",
                          }}
                        >
                          {item.image_url ? (
                            <img
                              src={
                                item.image_url
                              }
                              alt={name}
                              style={{
                                width:
                                  "100%",
                                height:
                                  "100%",
                                objectFit:
                                  "cover",
                              }}
                            />
                          ) : (
                            <Package
                              size={25}
                              style={{
                                opacity:
                                  0.45,
                              }}
                            />
                          )}
                        </a>

                        <div
                          style={{
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "flex-start",
                              justifyContent:
                                "space-between",
                              gap: "8px",
                            }}
                          >
                            <div
                              style={{
                                minWidth:
                                  0,
                              }}
                            >
                              <a
                                href={`/store/product/${encodeURIComponent(
                                  item.slug
                                )}`}
                                onClick={() =>
                                  setOpen(
                                    false
                                  )
                                }
                                style={{
                                  color:
                                    "#ffffff",
                                  textDecoration:
                                    "none",
                                  fontSize:
                                    "0.78rem",
                                  lineHeight:
                                    1.3,
                                  fontWeight:
                                    850,
                                }}
                              >
                                {name}
                              </a>

                              {item.sku && (
                                <div
                                  style={{
                                    marginTop:
                                      "3px",
                                    color:
                                      "rgba(255,255,255,0.42)",
                                    fontSize:
                                      "0.63rem",
                                  }}
                                >
                                  {t("referenceShort")}{" "}
                                  {
                                    item.sku
                                  }
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeItem(
                                  item.slug
                                )
                              }
                              aria-label={
                                t("remove")
                              }
                              title={
                                t("remove")
                              }
                              style={{
                                flexShrink:
                                  0,
                                width:
                                  "30px",
                                height:
                                  "30px",
                                display:
                                  "grid",
                                placeItems:
                                  "center",
                                borderRadius:
                                  "9px",
                                border:
                                  "1px solid rgba(248,113,113,0.18)",
                                background:
                                  "rgba(248,113,113,0.06)",
                                color:
                                  "#fca5a5",
                                cursor:
                                  "pointer",
                              }}
                            >
                              <Trash2
                                size={14}
                              />
                            </button>
                          </div>

                          <div
                            style={{
                              marginTop:
                                "9px",
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
                            <div
                              aria-label={
                                t("quantity")
                              }
                              style={{
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                borderRadius:
                                  "9px",
                                border:
                                  "1px solid rgba(255,255,255,0.09)",
                                overflow:
                                  "hidden",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.slug,
                                    item.quantity -
                                      1
                                  )
                                }
                                style={{
                                  width:
                                    "30px",
                                  height:
                                    "30px",
                                  display:
                                    "grid",
                                  placeItems:
                                    "center",
                                  border:
                                    0,
                                  background:
                                    "rgba(255,255,255,0.035)",
                                  color:
                                    "#ffffff",
                                  cursor:
                                    "pointer",
                                }}
                              >
                                <Minus
                                  size={
                                    13
                                  }
                                />
                              </button>

                              <span
                                style={{
                                  minWidth:
                                    "34px",
                                  textAlign:
                                    "center",
                                  fontSize:
                                    "0.72rem",
                                  fontWeight:
                                    850,
                                }}
                              >
                                {
                                  item.quantity
                                }
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.slug,
                                    item.quantity +
                                      1
                                  )
                                }
                                style={{
                                  width:
                                    "30px",
                                  height:
                                    "30px",
                                  display:
                                    "grid",
                                  placeItems:
                                    "center",
                                  border:
                                    0,
                                  background:
                                    "rgba(255,255,255,0.035)",
                                  color:
                                    "#ffffff",
                                  cursor:
                                    "pointer",
                                }}
                              >
                                <Plus
                                  size={
                                    13
                                  }
                                />
                              </button>
                            </div>

                            <strong
                              style={{
                                color:
                                  item.price ===
                                  null
                                    ? "#7dd3fc"
                                    : "#ffffff",
                                fontSize:
                                  "0.76rem",
                              }}
                            >
                              {item.price ===
                              null
                                ? t("onRequest")
                                : formatMoney(
                                    item.price *
                                      item.quantity,
                                    item.currency,
                                    intlLocale
                                  )}
                            </strong>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div
                style={{
                  padding: "14px 18px 18px",
                  borderTop:
                    "1px solid rgba(255,255,255,0.08)",
                  background:
                    "rgba(255,255,255,0.018)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    gap: "10px",
                    marginBottom:
                      "10px",
                    color:
                      "rgba(255,255,255,0.62)",
                    fontSize:
                      "0.72rem",
                  }}
                >
                  <span>
                    {itemCount}{" "}
                    {itemCount === 1
                      ? t("item")
                      : t("items")}
                  </span>

                  <button
                    type="button"
                    onClick={clearCart}
                    style={{
                      border: 0,
                      background:
                        "transparent",
                      color:
                        "#fca5a5",
                      font: "inherit",
                      fontSize:
                        "0.68rem",
                      fontWeight:
                        800,
                      cursor:
                        "pointer",
                    }}
                  >
                    {t("clear")}
                  </button>
                </div>

                {totals.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gap: "5px",
                    }}
                  >
                    {totals.map(
                      ([
                        currency,
                        total,
                      ]) => (
                        <div
                          key={
                            currency
                          }
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "space-between",
                            gap: "10px",
                          }}
                        >
                          <span
                            style={{
                              color:
                                "rgba(255,255,255,0.58)",
                              fontSize:
                                "0.72rem",
                              fontWeight:
                                750,
                            }}
                          >
                            {
                              t("knownTotal")
                            }
                          </span>

                          <strong
                            style={{
                              fontSize:
                                "1rem",
                            }}
                          >
                            {formatMoney(
                              total,
                              currency,
                              intlLocale
                            )}
                          </strong>
                        </div>
                      )
                    )}
                  </div>
                )}

                {onRequestCount > 0 && (
                  <div
                    style={{
                      marginTop: "7px",
                      color: "#7dd3fc",
                      fontSize:
                        "0.7rem",
                      fontWeight: 800,
                    }}
                  >
                    {onRequestCount}{" "}
                    {t("onRequest")}
                  </div>
                )}

                <button
                  type="button"
                  onClick={requestCart}
                  className="button button--primary"
                  style={{
                    width: "100%",
                    minHeight: "44px",
                    marginTop: "14px",
                    padding: "0 16px",
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    gap: "8px",
                    fontWeight: 900,
                  }}
                >
                  <ShoppingCart
                    size={16}
                  />
                  {t("requestCart")}
                </button>

                <p
                  style={{
                    margin:
                      "9px 0 0",
                    color:
                      "rgba(255,255,255,0.43)",
                    fontSize:
                      "0.65rem",
                    lineHeight: 1.45,
                    textAlign: "center",
                  }}
                >
                  {t("nextStep")}
                </p>
              </div>
            )}
          </aside>
        </>
      )}
    </>
  );
}

export default StoreMiniCart;
