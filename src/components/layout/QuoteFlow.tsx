import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  Bot,
  BriefcaseBusiness,
  Car,
  CircuitBoard,
  Droplets,
  Globe2,
  KeyRound,
  Laptop,
  Network,
  ShieldCheck,
  ShoppingBag,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { quoteFlowTranslations } from "../../i18n/locales/quoteFlow";
import { supabase } from "../../services/supabase";
import {
  getServiceDomain,
  getServiceTheme,
} from "../../utils/serviceTheme";

const services = [
  "Serrurerie automobile",
  "Diagnostic automobile",
  "Sécurité",
  "Électricité",
  "Énergie",
  "Eau & forage",
  "Automatisation",
  "Informatique & électronique",
  "Réseaux & télécommunications",
  "Site web",
  "Maintenance technique",
  "TSB Store",
  "Autres services",
];

const serviceIcons: Record<
  string,
  LucideIcon
> = {
  "Serrurerie automobile": KeyRound,
  "Diagnostic automobile": Car,
  Sécurité: ShieldCheck,
  Électricité: Zap,
  Énergie: CircuitBoard,
  "Eau & forage": Droplets,
  Automatisation: Bot,
  "Informatique & électronique": Laptop,
  "Réseaux & télécommunications": Network,
  "Site web": Globe2,
  "Maintenance technique": Wrench,
  "TSB Store": ShoppingBag,
  "Autres services": BriefcaseBusiness,
};

type QuoteFormData = {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
};

type PendingQuote = QuoteFormData & {
  service: string;
};

type StoreProductRequest = {
  slug: string;
  sku?: string | null;
  name_fr: string;
  name_nl?: string | null;
  name_en?: string | null;
  source?: string;
};

type StoreCartRequestItem = {
  slug: string;
  name_fr: string;
  name_nl?: string | null;
  name_en?: string | null;
  sku?: string | null;
  price?: number | null;
  currency?: string;
  image_url?: string | null;
  quantity: number;
};

type StoreCartRequest = {
  source?: string;
  created_at?: string;
  items: StoreCartRequestItem[];
};

const EMPTY_FORM: QuoteFormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  message: "",
};

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
      callback: (
        token: string
      ) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    }
  ) => string;

  reset: (
    widgetId?: string
  ) => void;

  remove: (
    widgetId: string
  ) => void;
};

const getTurnstileApi = () =>
  (
    window as Window & {
      turnstile?: TurnstileApi;
    }
  ).turnstile;

const normalizeLanguageTag = (
  value?: string | null
) => {
  const rawValue = (
    value ?? ""
  )
    .trim()
    .replace(/_/g, "-");

  if (!rawValue) {
    return "fr";
  }

  try {
    const [canonicalLocale] =
      Intl.getCanonicalLocales(
        rawValue
      );

    if (canonicalLocale) {
      return canonicalLocale;
    }
  } catch {
    // Valeur non BCP-47 : on tente la langue principale.
  }

  const primaryLanguage =
    rawValue
      .split("-")[0]
      ?.toLowerCase();

  if (
    primaryLanguage &&
    /^[a-z]{2,3}$/.test(
      primaryLanguage
    )
  ) {
    return primaryLanguage;
  }

  return "fr";
};

const serviceTranslationKeys: Record<
  string,
  string
> = {
  "Serrurerie automobile":
    "automotiveLocksmith",
  "Diagnostic automobile":
    "automotiveDiagnostics",
  Sécurité: "security",
  Électricité: "electricity",
  Énergie: "energy",
  "Eau & forage": "waterDrilling",
  Automatisation: "automation",
  "Informatique & électronique":
    "itElectronics",
  "Réseaux & télécommunications":
    "networksTelecom",
  "Site web": "website",
  "Maintenance technique":
    "maintenance",
  "TSB Store": "store",
  "Autres services": "other",
};

function QuoteFlow() {
  const {
    locale: siteLocale,
    intlLocale,
  } = useLanguage();

  /*
    La langue de la demande suit toujours
    la langue actuellement sélectionnée sur le site.
    Le profil client ne doit pas écraser ce choix.
  */
  const preferredLanguage =
    normalizeLanguageTag(
      siteLocale
    );

  const q = (
    key: string,
    params?: Record<
      string,
      string | number
    >
  ) =>
    translate(
      quoteFlowTranslations,
      siteLocale,
      `quoteFlow.${key}`,
      params
    );

  const getServiceLabel = (
    service: string
  ) => {
    const translationKey =
      serviceTranslationKeys[
        service
      ];

    return translationKey
      ? q(
          `serviceLabels.${translationKey}`
        )
      : service;
  };


  /*
    Les produits Store ne disposent actuellement que de
    name_fr / name_nl / name_en en base.
    Pour les autres locales internationales, on utilise
    l'anglais puis le français en secours, sans modifier
    les données produit ni le workflow Store.
  */
  const getLocalizedStoreProductName = (
    product: {
      name_fr: string;
      name_nl?: string | null;
      name_en?: string | null;
    }
  ) => {
    const normalizedLocale =
      normalizeLanguageTag(
        siteLocale
      )
        .split("-")[0]
        .toLowerCase();

    const localizedNames: Record<
      string,
      string | null | undefined
    > = {
      fr: product.name_fr,
      nl: product.name_nl,
      en: product.name_en,
    };

    return (
      localizedNames[
        normalizedLocale
      ]?.trim() ||
      product.name_en?.trim() ||
      product.name_fr.trim()
    );
  };

  const localizedSteps = [
    q("steps.service"),
    q("steps.information"),
    q("steps.request"),
    q("steps.send"),
  ].map(
    (title, index) => ({
      number: String(
        index + 1
      ),
      title,
    })
  );

  const [
    currentStep,
    setCurrentStep,
  ] = useState(1);

  const [
    selectedService,
    setSelectedService,
  ] = useState("");

  const [
    formData,
    setFormData,
  ] = useState<QuoteFormData>(
    EMPTY_FORM
  );

  const [
    isSending,
    setIsSending,
  ] = useState(false);

  const [
    authChecked,
    setAuthChecked,
  ] = useState(false);

  const [
    isGuest,
    setIsGuest,
  ] = useState(false);

  const [
    turnstileToken,
    setTurnstileToken,
  ] = useState("");

  const turnstileContainerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const turnstileWidgetIdRef =
    useRef<string | null>(
      null
    );

  /*
    ========================================================
    SESSION : CLIENT CONNECTÉ OU VISITEUR
    ========================================================
  */

  useEffect(() => {
    let active = true;

    const checkSession =
      async () => {
        const {
          data: {
            session,
          },
          error,
        } =
          await supabase.auth.getSession();

        if (!active) {
          return;
        }

        if (error) {
          console.error(
            "Erreur lecture session devis :",
            error
          );
        }

        setIsGuest(
          !session?.user
        );

        setAuthChecked(
          true
        );
      };

    void checkSession();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session
        ) => {
          if (!active) {
            return;
          }

          setIsGuest(
            !session?.user
          );

          setAuthChecked(
            true
          );
        }
      );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
    ========================================================
    PRÉREMPLISSAGE : CLIENT DÉJÀ CONNECTÉ
    ========================================================
    Si une session client existe, on récupère uniquement
    ses coordonnées connues. Les valeurs déjà saisies ou
    restaurées d'un devis en attente restent prioritaires.
  */
  useEffect(() => {
    if (
      !authChecked ||
      isGuest
    ) {
      return;
    }

    let active = true;

    const loadConnectedClient =
      async () => {
        const {
          data: {
            session,
          },
          error: sessionError,
        } =
          await supabase.auth.getSession();

        if (
          !active ||
          sessionError ||
          !session?.user
        ) {
          if (sessionError) {
            console.error(
              "Erreur lecture client connecté :",
              sessionError
            );
          }

          return;
        }

        const user =
          session.user;

        const {
          data: profile,
          error: profileError,
        } =
          await supabase
            .from("profiles")
            .select(
              "email, first_name, last_name, phone, company"
            )
            .eq(
              "id",
              user.id
            )
            .maybeSingle();

        if (!active) {
          return;
        }

        if (profileError) {
          console.error(
            "Erreur chargement profil devis :",
            profileError
          );
        }

        const metadata =
          user.user_metadata ?? {};

        const firstName =
          (
            profile?.first_name ??
            metadata.first_name ??
            ""
          )
            .toString()
            .trim();

        const lastName =
          (
            profile?.last_name ??
            metadata.last_name ??
            ""
          )
            .toString()
            .trim();

        const fullName =
          [firstName, lastName]
            .filter(Boolean)
            .join(" ")
            .trim();

        const email =
          (
            profile?.email ??
            user.email ??
            metadata.email ??
            ""
          )
            .toString()
            .trim();

        const phone =
          (
            profile?.phone ??
            metadata.phone ??
            ""
          )
            .toString()
            .trim();

        const company =
          (
            profile?.company ??
            metadata.company ??
            ""
          )
            .toString()
            .trim();

        /*
          Ne jamais écraser ce que le client a déjà saisi.
          On complète seulement les champs encore vides.
        */
        setFormData(
          (previous) => ({
            ...previous,

            name:
              previous.name.trim()
                ? previous.name
                : fullName,

            email:
              previous.email.trim()
                ? previous.email
                : email,

            phone:
              previous.phone.trim()
                ? previous.phone
                : phone,

            company:
              previous.company.trim()
                ? previous.company
                : company,
          })
        );

      };

    void loadConnectedClient();

    return () => {
      active = false;
    };
  }, [
    authChecked,
    isGuest,
  ]);

  /*
    ========================================================
    TURNSTILE POUR LES DEVIS VISITEURS
    ========================================================
  */

  useEffect(() => {
    if (
      currentStep !== 4 ||
      !authChecked ||
      !isGuest
    ) {
      return;
    }

    setTurnstileToken("");

    if (!TURNSTILE_SITE_KEY) {
      console.error(
        "VITE_TURNSTILE_SITE_KEY manquante."
      );

      return;
    }

    let cancelled = false;

    const renderTurnstile =
      () => {
        const turnstile =
          getTurnstileApi();

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
              sitekey:
                TURNSTILE_SITE_KEY,

              theme:
                "dark",

              language:
                preferredLanguage,

              callback: (
                token
              ) => {
                setTurnstileToken(
                  token
                );
              },

              "expired-callback":
                () => {
                  setTurnstileToken(
                    ""
                  );
                },

              "error-callback":
                () => {
                  setTurnstileToken(
                    ""
                  );
                },
            }
          );
      };

    let script =
      document.querySelector<HTMLScriptElement>(
        'script[data-tsb-turnstile="true"]'
      );

    if (!script) {
      script =
        document.createElement(
          "script"
        );

      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

      script.async = true;
      script.defer = true;

      script.dataset.tsbTurnstile =
        "true";

      document.head.appendChild(
        script
      );
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

      const turnstile =
        getTurnstileApi();

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
            "Nettoyage Turnstile :",
            error
          );
        }
      }

      turnstileWidgetIdRef.current =
        null;
    };
  }, [
    currentStep,
    authChecked,
    isGuest,
    preferredLanguage,
  ]);

  const resetTurnstile =
    () => {
      setTurnstileToken("");

      const turnstile =
        getTurnstileApi();

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
            "Réinitialisation Turnstile :",
            error
          );
        }
      }
    };

  /*
    ========================================================
    RÉCUPÉRATION D'UNE DEMANDE EN ATTENTE
    ========================================================
  */

  useEffect(() => {
    const storedQuote =
      sessionStorage.getItem(
        "tsb_pending_quote"
      );

    if (!storedQuote) {
      return;
    }

    try {
      const parsedQuote =
        JSON.parse(
          storedQuote
        ) as Partial<PendingQuote>;

      const hasValidService =
        typeof parsedQuote.service ===
          "string" &&
        services.includes(
          parsedQuote.service
        );

      const hasValidName =
        typeof parsedQuote.name ===
          "string" &&
        parsedQuote.name.trim()
          .length > 0;

      const hasValidEmail =
        typeof parsedQuote.email ===
          "string" &&
        parsedQuote.email.trim()
          .length > 0;

      const hasValidPhone =
        typeof parsedQuote.phone ===
          "string" &&
        parsedQuote.phone.trim()
          .length > 0;

      const hasValidMessage =
        typeof parsedQuote.message ===
          "string" &&
        parsedQuote.message.trim()
          .length > 0;

      if (
        !hasValidService ||
        !hasValidName ||
        !hasValidEmail ||
        !hasValidPhone ||
        !hasValidMessage
      ) {
        sessionStorage.removeItem(
          "tsb_pending_quote"
        );

        return;
      }

      setSelectedService(
        parsedQuote.service as string
      );

      setFormData({
        name:
          parsedQuote.name as string,

        email:
          parsedQuote.email as string,

        phone:
          parsedQuote.phone as string,

        company:
          typeof parsedQuote.company ===
          "string"
            ? parsedQuote.company
            : "",

        message:
          parsedQuote.message as string,
      });

      /*
        L'utilisateur avait déjà rempli
        toute sa demande avant connexion.
        On le ramène directement au résumé.
      */
      setCurrentStep(4);
    } catch (error) {
      console.error(
        "Erreur récupération demande en attente :",
        error
      );

      sessionStorage.removeItem(
        "tsb_pending_quote"
      );
    }
  }, []);

  /*
    ========================================================
    PANIER TSB STORE
    ========================================================
    Le mini-panier transmet les produits sélectionnés ici.
    On transforme le panier en une demande TSB Store lisible
    pour le client et pour l'administration, tout en gardant
    le workflow Devis & Demandes existant.
  */
  useEffect(() => {
    const pendingQuote =
      sessionStorage.getItem(
        "tsb_pending_quote"
      );

    if (pendingQuote) {
      return;
    }

    const storedCart =
      sessionStorage.getItem(
        "tsb_store_cart_request"
      );

    if (!storedCart) {
      return;
    }

    try {
      const cartRequest =
        JSON.parse(
          storedCart
        ) as Partial<StoreCartRequest>;

      const rawItems =
        Array.isArray(
          cartRequest.items
        )
          ? cartRequest.items
          : [];

      const items =
        rawItems.filter(
          (
            item
          ): item is StoreCartRequestItem =>
            Boolean(
              item &&
                typeof item.slug ===
                  "string" &&
                item.slug.trim() &&
                typeof item.name_fr ===
                  "string" &&
                item.name_fr.trim() &&
                Number.isFinite(
                  Number(
                    item.quantity
                  )
                ) &&
                Number(
                  item.quantity
                ) > 0
            )
        );

      if (items.length === 0) {
        sessionStorage.removeItem(
          "tsb_store_cart_request"
        );
        return;
      }

      const formatMoney = (
        value: number,
        currency: string
      ) => {
        try {
          return new Intl.NumberFormat(
            intlLocale,
            {
              style: "currency",
              currency,
              minimumFractionDigits:
                2,
              maximumFractionDigits:
                2,
            }
          ).format(value);
        } catch {
          return `${value.toFixed(
            2
          )} ${currency}`;
        }
      };

      const totalsByCurrency =
        new Map<string, number>();

      let onRequestQuantity = 0;

      const itemLines =
        items.flatMap(
          (item, index) => {
            const quantity =
              Math.max(
                1,
                Math.floor(
                  Number(
                    item.quantity
                  )
                )
              );

            const productName =
              getLocalizedStoreProductName(
                item
              );

            const reference =
              typeof item.sku ===
                "string" &&
              item.sku.trim()
                ? item.sku.trim()
                : "";

            const currency =
              typeof item.currency ===
                "string" &&
              item.currency.trim()
                ? item.currency.trim()
                : "EUR";

            const hasKnownPrice =
              typeof item.price ===
                "number" &&
              Number.isFinite(
                item.price
              );

            if (hasKnownPrice) {
              totalsByCurrency.set(
                currency,
                (
                  totalsByCurrency.get(
                    currency
                  ) ?? 0
                ) +
                  item.price! *
                    quantity
              );
            } else {
              onRequestQuantity +=
                quantity;
            }

            const unitPriceLine =
              hasKnownPrice
                ? q(
                    "store.unitPriceLine",
                    {
                      price: formatMoney(
                        item.price!,
                        currency
                      ),
                    }
                  )
                : q(
                    "store.priceOnRequestLine"
                  );

            const subtotalLine =
              hasKnownPrice
                ? q(
                    "store.subtotalLine",
                    {
                      price: formatMoney(
                        item.price! *
                          quantity,
                        currency
                      ),
                    }
                  )
                : "";

            return [
              `${index + 1}. ${productName}`,
              q(
                "store.quantityLine",
                {
                  quantity,
                }
              ),
              ...(reference
                ? [
                    q(
                      "store.referenceLine",
                      {
                        reference,
                      }
                    ),
                  ]
                : []),
              unitPriceLine,
              ...(subtotalLine
                ? [subtotalLine]
                : []),
            ];
          }
        );

      const totalLines =
        Array.from(
          totalsByCurrency.entries()
        ).map(
          ([currency, total]) =>
            q(
              "store.knownTotalLine",
              {
                price: formatMoney(
                  total,
                  currency
                ),
              }
            )
        );

      const onRequestLine =
        onRequestQuantity > 0
          ? q(
              "store.itemsOnRequestLine",
              {
                quantity:
                  onRequestQuantity,
              }
            )
          : "";

      const message = [
        q("store.cartTitle"),
        "",
        q("store.products"),
        ...itemLines,
        "",
        ...totalLines,
        ...(onRequestLine
          ? [onRequestLine]
          : []),
        "",
        q("store.cartClosing"),
      ].join("\n");

      setSelectedService(
        "TSB Store"
      );

      setFormData(
        (previous) => ({
          ...previous,
          message,
        })
      );

      setCurrentStep(2);
    } catch (error) {
      console.error(
        "Erreur récupération panier TSB Store :",
        error
      );

      sessionStorage.removeItem(
        "tsb_store_cart_request"
      );
    }
  }, [preferredLanguage, intlLocale]);

  /*
    ========================================================
    PRODUIT TSB STORE
    ========================================================
    Si le client vient du Store, on prépare automatiquement
    une demande TSB Store et on l'amène directement à l'étape
    de ses coordonnées. Une vraie demande en attente garde
    toujours la priorité.
  */
  useEffect(() => {
    const pendingQuote =
      sessionStorage.getItem(
        "tsb_pending_quote"
      );

    if (pendingQuote) {
      return;
    }

    const cartRequest =
      sessionStorage.getItem(
        "tsb_store_cart_request"
      );

    if (cartRequest) {
      return;
    }

    const storedProduct =
      sessionStorage.getItem(
        "tsb_store_product_request"
      );

    if (!storedProduct) {
      return;
    }

    try {
      const product =
        JSON.parse(
          storedProduct
        ) as Partial<StoreProductRequest>;

      if (
        typeof product.slug !==
          "string" ||
        !product.slug.trim() ||
        typeof product.name_fr !==
          "string" ||
        !product.name_fr.trim()
      ) {
        sessionStorage.removeItem(
          "tsb_store_product_request"
        );
        return;
      }

      const productName =
        getLocalizedStoreProductName(
          product as StoreProductRequest
        );

      const reference =
        typeof product.sku ===
          "string" &&
        product.sku.trim()
          ? product.sku.trim()
          : "";

      const message = [
        q("store.productRequestTitle"),
        q(
          "store.productLine",
          {
            product: productName,
          }
        ),
        ...(reference
          ? [
              q(
                "store.referenceLine",
                {
                  reference,
                }
              ).trimStart(),
            ]
          : []),
        "",
        q("store.productClosing"),
      ].join("\n");

      setSelectedService(
        "TSB Store"
      );

      setFormData(
        (previous) => ({
          ...previous,
          message,
        })
      );

      /*
        Le produit et le message sont déjà connus.
        On commence par demander les coordonnées du client.
      */
      setCurrentStep(2);
    } catch (error) {
      console.error(
        "Erreur récupération produit TSB Store :",
        error
      );

      sessionStorage.removeItem(
        "tsb_store_product_request"
      );
    }
  }, [preferredLanguage]);

  /*
    ========================================================
    FORMULAIRE
    ========================================================
  */

  const scrollToQuoteZone = () => {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    window.requestAnimationFrame(
      () => {
        window.requestAnimationFrame(
          () => {
            const quoteSection =
              document.getElementById(
                "quote"
              );

            if (!quoteSection) {
              return;
            }

            quoteSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });

            if (
              window.location.hash !==
              "#quote"
            ) {
              window.history.replaceState(
                null,
                "",
                `${window.location.pathname}${window.location.search}#quote`
              );
            }
          }
        );
      }
    );
  };

  const handleServiceSelect = (
    service: string
  ) => {
    setSelectedService(service);
    setCurrentStep(2);
    scrollToQuoteZone();
  };

  const handleChange = (
    event: ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
    >
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  const handleInformationSubmit = (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim()
    ) {
      return;
    }

    setCurrentStep(3);
  };

  const handleRequestSubmit = (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (
      !selectedService ||
      !formData.message.trim()
    ) {
      return;
    }

    setCurrentStep(4);
  };

  /*
    ========================================================
    ENVOI DE LA DEMANDE
    ========================================================
  */

  const clearStoreCartAfterSuccess =
    () => {
      const cartRequest =
        sessionStorage.getItem(
          "tsb_store_cart_request"
        );

      if (!cartRequest) {
        return;
      }

      sessionStorage.removeItem(
        "tsb_store_cart_request"
      );

      try {
        localStorage.removeItem(
          "tsb_store_cart"
        );

        window.dispatchEvent(
          new CustomEvent(
            "tsb-store-cart-updated"
          )
        );
      } catch (error) {
        console.warn(
          "Nettoyage panier TSB Store :",
          error
        );
      }
    };

  const handleSend = async () => {
    if (isSending) {
      return;
    }

    setIsSending(true);

    const {
      data: {
        session,
      },
      error: sessionError,
    } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error(
        "Erreur vérification session devis :",
        sessionError
      );

      setIsSending(false);

      alert(
        q("sessionCheckError")
      );

      return;
    }

    const user =
      session?.user ?? null;

    /*
      VISITEUR NON CONNECTÉ
      ------------------------------------------------------
      Le devis est envoyé par l'Edge Function sécurisée.
      Turnstile est vérifié côté serveur.
    */

    if (!user) {
      if (!TURNSTILE_SITE_KEY) {
        setIsSending(false);

        alert(
          q("antibotConfigError")
        );

        return;
      }

      if (!turnstileToken) {
        setIsSending(false);

        alert(
          q("securityRequired")
        );

        return;
      }

      const {
        data,
        error,
      } =
        await supabase.functions.invoke(
          "submit-guest-quote",
          {
            body: {
              service:
                selectedService,

              name:
                formData.name.trim(),

              email:
                formData.email.trim(),

              phone:
                formData.phone.trim(),

              company:
                formData.company.trim(),

              message:
                formData.message.trim(),

              preferred_language:
                preferredLanguage,

              turnstileToken,
            },
          }
        );

      setIsSending(false);

      if (
        error ||
        !data?.ok
      ) {
        console.error(
          "Erreur devis visiteur :",
          error ?? data
        );

        resetTurnstile();

        alert(
          data?.error ||
            error?.message ||
            q("sendError")
        );

        return;
      }

      sessionStorage.removeItem(
        "tsb_pending_quote"
      );

      clearStoreCartAfterSuccess();

      alert(
        q("guestSuccess")
      );

      restartQuote();

      return;
    }

    /*
      CLIENT CONNECTÉ
      ------------------------------------------------------
      Enregistrement normal lié à son compte.
    */

    const {
      error,
    } = await supabase
      .from("quote_requests")
      .insert({
        user_id:
          user.id,

        service:
          selectedService,

        name:
          formData.name.trim(),

        email:
          formData.email.trim(),

        phone:
          formData.phone.trim(),

        company:
          formData.company.trim() ||
          null,

        message:
          formData.message.trim(),

        preferred_language:
          preferredLanguage,

        status:
          "received",
      });

    setIsSending(false);

    if (error) {
      console.error(
        "Erreur demande devis :",
        error
      );

      alert(
        q(
          "saveError",
          {
            message:
              error.message,
          }
        )
      );

      return;
    }

    sessionStorage.removeItem(
      "tsb_pending_quote"
    );

    clearStoreCartAfterSuccess();

    alert(
      q("clientSuccess")
    );

    restartQuote();
  };

  /*
    ========================================================
    RECOMMENCER
    ========================================================
  */

  const restartQuote = () => {
    sessionStorage.removeItem(
      "tsb_pending_quote"
    );

    sessionStorage.removeItem(
      "tsb_store_product_request"
    );

    sessionStorage.removeItem(
      "tsb_store_cart_request"
    );

    resetTurnstile();

    setCurrentStep(1);
    setSelectedService("");

    setFormData({
      ...EMPTY_FORM,
    });
  };

  /*
    ========================================================
    AFFICHAGE
    ========================================================
  */

  return (
    <section
      className="section section--dark"
      id="quote"
    >
      <div className="container">
        <div className="section__heading">
          <span className="section__eyebrow">
            {q("eyebrow")}
          </span>

          <h2>
            {q("titleBefore")}{" "}
            <span>
              {q("titleAccent")}
            </span>
          </h2>

          <p>
            {q("intro")}
          </p>
        </div>

        {/* ÉTAPES */}

        <div className="quote-steps">
          {localizedSteps.map(
            (step) => (
              <div
                className={`quote-step ${
                  currentStep ===
                  Number(
                    step.number
                  )
                    ? "quote-step--active"
                    : ""
                }`}
                key={
                  step.number
                }
              >
                <strong>
                  {step.number}
                </strong>

                <span>
                  {step.title}
                </span>
              </div>
            )
          )}
        </div>

        {/* ÉTAPE 1 */}

        {currentStep === 1 && (
          <div
            style={{
              maxWidth: "980px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color:
                    "rgba(255,255,255,0.66)",
                  fontSize: "0.86rem",
                  lineHeight: 1.5,
                }}
              >
                {q("chooseService")}
              </p>
            </div>

            <div
              className="quote-services"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "13px",
                maxWidth: "1020px",
                margin: "0 auto",
              }}
            >
              {services.map(
                (service) => {
                  const theme =
                    getServiceTheme(
                      service
                    );

                  const domain =
                    getServiceDomain(
                      service
                    );

                  const Icon =
                    serviceIcons[
                      service
                    ] ?? Wrench;

                  const isActive =
                    selectedService ===
                    service;

                  return (
                    <button
                      className="quote-service"
                      type="button"
                      key={service}
                      onClick={() =>
                        handleServiceSelect(
                          service
                        )
                      }
                      style={{
                        minHeight:
                          "112px",
                        padding:
                          "15px 16px",
                        display: "flex",
                        alignItems:
                          "center",
                        gap: "12px",
                        textAlign:
                          "left",
                        borderRadius:
                          "15px",
                        border:
                          isActive
                            ? `1px solid ${theme.borderStrong}`
                            : `1px solid ${theme.border}`,
                        background:
                          isActive
                            ? `linear-gradient(135deg, ${theme.backgroundStrong}, rgba(255,255,255,0.06))`
                            : `linear-gradient(135deg, ${theme.backgroundStrong}, rgba(255,255,255,0.025))`,
                        boxShadow:
                          isActive
                            ? `inset 0 3px 0 ${theme.accentStrong}, 0 0 0 1px ${theme.borderStrong}, ${theme.glow}`
                            : `inset 0 3px 0 ${theme.accent}, ${theme.glow}`,
                        color:
                          "#ffffff",
                        cursor:
                          "pointer",
                        transition:
                          "transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease, background 160ms ease",
                      }}
                    >
                      <span
                        className="quote-service__icon"
                        style={{
                          width: "50px",
                          height: "50px",
                          flex:
                            "0 0 50px",
                          display:
                            "grid",
                          placeItems:
                            "center",
                          borderRadius:
                            "14px",
                          border:
                            `1px solid ${theme.borderStrong}`,
                          background:
                            theme.badgeBackground,
                          color:
                            theme.accentStrong,
                          boxShadow:
                            `0 0 0 1px ${theme.border}`,
                        }}
                      >
                        <Icon
                          size={23}
                          strokeWidth={2}
                        />
                      </span>

                      <span
                        style={{
                          minWidth: 0,
                          display:
                            "flex",
                          flexDirection:
                            "column",
                          gap: "4px",
                        }}
                      >
                        <span
                          style={{
                            color:
                              theme.accentStrong,
                            fontSize:
                              "0.62rem",
                            fontWeight:
                              900,
                            letterSpacing:
                              "0.08em",
                            textTransform:
                              "uppercase",
                          }}
                        >
                          {
                            q(
                              `domainLabels.${domain.key}`
                            )
                          }
                        </span>

                        <span
                          style={{
                            color:
                              "#ffffff",
                            fontSize:
                              "0.86rem",
                            fontWeight:
                              850,
                            lineHeight:
                              1.25,
                          }}
                        >
                          {getServiceLabel(service)}
                        </span>
                      </span>

                      <span
                        aria-hidden="true"
                        style={{
                          marginLeft: "auto",
                          color:
                            theme.accentStrong,
                          fontSize: "1rem",
                          fontWeight: 900,
                          opacity: 0.72,
                        }}
                      >
                        ›
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* ÉTAPE 2 */}

        {currentStep === 2 && (
          <form
            className="quote-form"
            onSubmit={
              handleInformationSubmit
            }
          >
            <div className="quote-form__grid">
              <label>
                {q("name")} *

                <input
                  type="text"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </label>

              <label>
                {q("email")} *

                <input
                  type="email"
                  name="email"
                  value={
                    formData.email
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </label>

              <label>
                {q("phone")} *

                <input
                  type="tel"
                  name="phone"
                  value={
                    formData.phone
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </label>

              <label>
                {q("company")}

                <input
                  type="text"
                  name="company"
                  value={
                    formData.company
                  }
                  onChange={
                    handleChange
                  }
                />
              </label>
            </div>

            <div className="quote-action">
              <button
                type="button"
                className="button button--secondary"
                onClick={() =>
                  setCurrentStep(
                    1
                  )
                }
              >
                ← {q("back")}
              </button>

              <button
                type="submit"
                className="button button--primary"
              >
                {q("continue")} →
              </button>
            </div>
          </form>
        )}

        {/* ÉTAPE 3 */}

        {currentStep === 3 && (
          <form
            className="quote-form"
            onSubmit={
              handleRequestSubmit
            }
          >
            <div className="quote-selected-service">
              <span>
                {q("selectedService")}
              </span>

              <select
                value={
                  selectedService
                }
                onChange={(
                  event
                ) =>
                  setSelectedService(
                    event.target
                      .value
                  )
                }
                aria-label={q("changeService")}
                style={{
                  minWidth:
                    "260px",

                  maxWidth:
                    "100%",

                  padding:
                    "10px 38px 10px 14px",

                  borderRadius:
                    "10px",

                  border:
                    "1px solid rgba(255,255,255,0.15)",

                  background:
                    "#0f1d2e",

                  color:
                    "#ffffff",

                  fontWeight:
                    700,

                  cursor:
                    "pointer",
                }}
              >
                {services.map(
                  (service) => (
                    <option
                      key={
                        service
                      }
                      value={
                        service
                      }
                    >
                      {
                        getServiceLabel(
                          service
                        )
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <label className="quote-form__message">
              {q("describeNeed")} *

              <textarea
                name="message"
                rows={6}
                value={
                  formData.message
                }
                onChange={
                  handleChange
                }
                placeholder={q("messagePlaceholder")}
                required
              />
            </label>

            <div className="quote-action">
              <button
                type="button"
                className="button button--secondary"
                onClick={() =>
                  setCurrentStep(
                    2
                  )
                }
              >
                ← {q("back")}
              </button>

              <button
                type="submit"
                className="button button--primary"
              >
                {q("viewSummary")} →
              </button>
            </div>
          </form>
        )}

        {/* ÉTAPE 4 */}

        {currentStep === 4 && (
          <div className="quote-summary">
            <div className="quote-summary__content">
              <span className="section__eyebrow">
                {q("summary")}
              </span>

              <h3>
                {q("ready")}
              </h3>

              <p>
                <strong>
                  {q("service")} :
                </strong>{" "}
                {getServiceLabel(
                  selectedService
                )}
              </p>

              <p>
                <strong>
                  {q("name")} :
                </strong>{" "}
                {formData.name}
              </p>

              <p>
                <strong>
                  {q("email")} :
                </strong>{" "}
                {formData.email}
              </p>

              <p>
                <strong>
                  {q("phone")} :
                </strong>{" "}
                {formData.phone}
              </p>

              {formData.company && (
                <p>
                  <strong>
                    {q("company")} :
                  </strong>{" "}
                  {
                    formData.company
                  }
                </p>
              )}

              <p>
                <strong>
                  {q("request")} :
                </strong>{" "}
                {formData.message}
              </p>
              <p>
                <strong>
                  {q("language")} :
                </strong>{" "}
                {preferredLanguage}
              </p>

            </div>

            {!authChecked && (
              <div
                style={{
                  marginTop:
                    "18px",
                  padding:
                    "14px",
                  borderRadius:
                    "12px",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  background:
                    "rgba(255,255,255,0.03)",
                  color:
                    "rgba(255,255,255,0.65)",
                }}
              >
                {q("checkingSession")}
              </div>
            )}

            {authChecked &&
              isGuest && (
              <div
                style={{
                  marginTop:
                    "18px",
                  padding:
                    "16px",
                  borderRadius:
                    "12px",
                  border:
                    "1px solid rgba(22,136,255,0.22)",
                  background:
                    "rgba(22,136,255,0.055)",
                }}
              >
                <strong
                  style={{
                    display:
                      "block",
                    color:
                      "#ffffff",
                    marginBottom:
                      "6px",
                  }}
                >
                  {q("guestTitle")}
                </strong>

                <p
                  style={{
                    margin:
                      "0 0 12px",
                    color:
                      "rgba(255,255,255,0.62)",
                    lineHeight:
                      1.55,
                  }}
                >
                  {q("guestText")}
                </p>

                {!TURNSTILE_SITE_KEY ? (
                  <p
                    style={{
                      margin:
                        0,
                      color:
                        "#fca5a5",
                    }}
                  >
                    {q("antibotMissing")}
                  </p>
                ) : (
                  <div
                    ref={
                      turnstileContainerRef
                    }
                  />
                )}
              </div>
            )}

            <div className="quote-action">
              <button
                type="button"
                className="button button--secondary"
                onClick={() =>
                  setCurrentStep(
                    3
                  )
                }
                disabled={
                  isSending
                }
              >
                ← {q("edit")}
              </button>

              <button
                type="button"
                className="button button--primary"
                onClick={
                  handleSend
                }
                disabled={
                  isSending ||
                  !authChecked ||
                  (isGuest &&
                    (!TURNSTILE_SITE_KEY ||
                      !turnstileToken))
                }
              >
                {isSending
                  ? q("saving")
                  : q("send")}
              </button>
            </div>

            <button
              type="button"
              className="text-link"
              onClick={
                restartQuote
              }
              disabled={
                isSending
              }
            >
              {q("restart")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}





















































































































































































































export default QuoteFlow;
