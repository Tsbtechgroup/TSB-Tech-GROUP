import {
  ArrowRight,
  Car,
  Cpu,
  Heart,
  Package,
  PackageSearch,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Wrench,
  Zap,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";
import StoreMiniCart, {
  addStoreCartItem,
} from "../../components/StoreMiniCart";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { storeTranslations } from "../../i18n/locales/store";
import { supabase } from "../../services/supabase";

const categories = [
  { id: "all", icon: ShoppingBag, color: "blue" },
  { id: "automobile", icon: Car, color: "blue" },
  { id: "security", icon: ShieldCheck, color: "green" },
  { id: "energy", icon: Zap, color: "orange" },
  { id: "electronics", icon: Cpu, color: "cyan" },
  { id: "other", icon: Package, color: "purple" },
] as const;

type CategoryId =
  | "all"
  | "automobile"
  | "security"
  | "energy"
  | "electronics"
  | "other";

type Collection = {
  id: string;
  category: Exclude<CategoryId, "all">;
};

type StoreProduct = {
  id: string;
  slug: string;
  category: Exclude<CategoryId, "all">;
  name_fr: string;
  name_nl: string | null;
  name_en: string | null;
  description_fr: string | null;
  description_nl: string | null;
  description_en: string | null;
  sku: string | null;
  price: number | null;
  currency: string;
  availability:
    | "in_stock"
    | "on_request"
    | "out_of_stock"
    | "coming_soon";
  stock_quantity: number | null;
  image_url: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
};

type AvailabilityFilter =
  | "all"
  | StoreProduct["availability"];

type ProductSort =
  | "recommended"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "name";

const PRODUCTS_PER_PAGE = 12;

const collections: Collection[] = [
  { id: "car-keys-remotes", category: "automobile" },
  { id: "diagnostic-tools", category: "automobile" },
  { id: "security-cameras", category: "security" },
  { id: "access-control", category: "security" },
  { id: "electrical-equipment", category: "energy" },
  { id: "energy-solutions", category: "energy" },
  { id: "electronic-components", category: "electronics" },
  { id: "it-tools", category: "electronics" },
  { id: "other-products", category: "other" },
];



function formatProductPrice(
  price: number,
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
    ).format(price);
  } catch {
    return `${price.toFixed(2)} ${currency}`;
  }
}


function getLocalizedProductName(
  product: StoreProduct,
  locale: string
) {
  if (locale === "fr") {
    return (
      product.name_fr ||
      product.name_en ||
      product.name_nl ||
      ""
    );
  }

  if (locale === "nl") {
    return (
      product.name_nl ||
      product.name_en ||
      product.name_fr ||
      ""
    );
  }

  if (locale === "en") {
    return (
      product.name_en ||
      product.name_fr ||
      product.name_nl ||
      ""
    );
  }

  /*
    La base Store ne possède actuellement que
    name_fr / name_nl / name_en.
    Pour DE/ES/IT/PT/AR/TR/ZH : EN -> FR -> NL.
  */
  return (
    product.name_en ||
    product.name_fr ||
    product.name_nl ||
    ""
  );
}

function getLocalizedProductDescription(
  product: StoreProduct,
  locale: string
) {
  if (locale === "fr") {
    return (
      product.description_fr ||
      product.description_en ||
      product.description_nl ||
      ""
    );
  }

  if (locale === "nl") {
    return (
      product.description_nl ||
      product.description_en ||
      product.description_fr ||
      ""
    );
  }

  if (locale === "en") {
    return (
      product.description_en ||
      product.description_fr ||
      product.description_nl ||
      ""
    );
  }

  /*
    La base Store ne possède actuellement que
    description_fr / description_nl / description_en.
    Pour DE/ES/IT/PT/AR/TR/ZH : EN -> FR -> NL.
  */
  return (
    product.description_en ||
    product.description_fr ||
    product.description_nl ||
    ""
  );
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
    // Le Store reste utilisable même si le stockage local est indisponible.
  }
}

function Store() {
  const {
    language,
    locale,
    intlLocale,
  } = useLanguage();

  const t = (key: string) =>
    translate(
      storeTranslations,
      locale,
      `store.${key}`
    );

  useEffect(() => {
    if (window.location.hash !== "#catalogue") {
      return;
    }

    const scrollToCatalogue = () => {
      document
        .getElementById("catalogue")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    };

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(
        scrollToCatalogue
      );
    });
  }, []);

  const [activeCategory, setActiveCategory] =
    useState<CategoryId>("all");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [
    activeAvailability,
    setActiveAvailability,
  ] = useState<AvailabilityFilter>("all");

  const [productSort, setProductSort] =
    useState<ProductSort>("recommended");

  const [favoriteSlugs, setFavoriteSlugs] =
    useState<string[]>([]);

  const [favoritesOnly, setFavoritesOnly] =
    useState(false);

  const [storeProducts, setStoreProducts] =
    useState<StoreProduct[]>([]);

  const [productsLoading, setProductsLoading] =
    useState(true);

  const [productPage, setProductPage] =
    useState(1);

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
    slug: string
  ) => {
    setFavoriteSlugs((previous) => {
      const next = previous.includes(slug)
        ? previous.filter(
            (currentSlug) =>
              currentSlug !== slug
          )
        : [...previous, slug];

      writeStoreFavorites(next);
      return next;
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadPublishedProducts = async () => {
      setProductsLoading(true);

      const { data, error } = await supabase
        .from("store_products")
        .select(
          "id, slug, category, name_fr, name_nl, name_en, description_fr, description_nl, description_en, sku, price, currency, availability, stock_quantity, image_url, is_featured, sort_order, created_at"
        )
        .eq("is_published", true)
        .order("sort_order", {
          ascending: true,
        })
        .order("created_at", {
          ascending: false,
        });

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error(
          "Erreur chargement produits TSB Store :",
          error
        );
        setStoreProducts([]);
        setProductsLoading(false);
        return;
      }

      setStoreProducts(
        (data ?? []) as StoreProduct[]
      );
      setProductsLoading(false);
    };

    void loadPublishedProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setProductPage(1);
  }, [
    activeCategory,
    activeAvailability,
    favoritesOnly,
    favoriteSlugs,
    productSort,
    searchQuery,
  ]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase();

    const getLocalizedName = (
      product: StoreProduct
    ) =>
      getLocalizedProductName(
        product,
        locale
      );

    const filteredProducts =
      storeProducts.filter((product) => {
        const matchesCategory =
          activeCategory === "all" ||
          product.category === activeCategory;

        if (!matchesCategory) {
          return false;
        }

        const matchesAvailability =
          activeAvailability === "all" ||
          product.availability ===
            activeAvailability;

        if (!matchesAvailability) {
          return false;
        }

        if (
          favoritesOnly &&
          !favoriteSlugs.includes(product.slug)
        ) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const name =
          getLocalizedName(product);

        const description =
          getLocalizedProductDescription(
            product,
            locale
          );

        const searchableText = [
          name,
          description,
          product.sku ?? "",
          t(`categoryLabels.${product.category}`),
          t(`availabilityLabels.${product.availability}`),
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          normalizedSearch
        );
      });

    return [...filteredProducts].sort(
      (a, b) => {
        switch (productSort) {
          case "newest":
            return (
              new Date(
                b.created_at
              ).getTime() -
              new Date(
                a.created_at
              ).getTime()
            );

          case "price_asc": {
            const aPrice =
              a.price === null
                ? Number.POSITIVE_INFINITY
                : Number(a.price);

            const bPrice =
              b.price === null
                ? Number.POSITIVE_INFINITY
                : Number(b.price);

            return aPrice - bPrice;
          }

          case "price_desc": {
            const aPrice =
              a.price === null
                ? Number.NEGATIVE_INFINITY
                : Number(a.price);

            const bPrice =
              b.price === null
                ? Number.NEGATIVE_INFINITY
                : Number(b.price);

            return bPrice - aPrice;
          }

          case "name":
            return getLocalizedName(
              a
            ).localeCompare(
              getLocalizedName(b),
              intlLocale,
              {
                sensitivity: "base",
              }
            );

          default:
            if (
              a.sort_order !==
              b.sort_order
            ) {
              return (
                a.sort_order -
                b.sort_order
              );
            }

            return (
              new Date(
                b.created_at
              ).getTime() -
              new Date(
                a.created_at
              ).getTime()
            );
        }
      }
    );
  }, [
    activeAvailability,
    activeCategory,
    favoriteSlugs,
    favoritesOnly,
    intlLocale,
    locale,
    productSort,
    searchQuery,
    storeProducts,
  ]);

  const totalProductPages = Math.max(
    1,
    Math.ceil(
      visibleProducts.length / PRODUCTS_PER_PAGE
    )
  );

  const safeProductPage = Math.min(
    productPage,
    totalProductPages
  );

  const paginatedProducts =
    visibleProducts.slice(
      (safeProductPage - 1) *
        PRODUCTS_PER_PAGE,
      safeProductPage *
        PRODUCTS_PER_PAGE
    );

  const hasActiveFilters =
    activeCategory !== "all" ||
    activeAvailability !== "all" ||
    favoritesOnly ||
    searchQuery.trim().length > 0 ||
    productSort !== "recommended";

  const resetCatalogueFilters = () => {
    setActiveCategory("all");
    setActiveAvailability("all");
    setFavoritesOnly(false);
    setProductSort("recommended");
    setSearchQuery("");
    setProductPage(1);
  };

  const getCategoryProductCount = (
    categoryId: CategoryId
  ) =>
    categoryId === "all"
      ? storeProducts.length
      : storeProducts.filter(
          (product) =>
            product.category ===
            categoryId
        ).length;

  const getAvailabilityBadgeStyle = (
    availability:
      StoreProduct["availability"]
  ) => {
    switch (availability) {
      case "in_stock":
        return {
          background:
            "rgba(34,197,94,0.10)",
          border:
            "1px solid rgba(34,197,94,0.24)",
          color: "#86efac",
        };

      case "out_of_stock":
        return {
          background:
            "rgba(248,113,113,0.10)",
          border:
            "1px solid rgba(248,113,113,0.24)",
          color: "#fca5a5",
        };

      case "coming_soon":
        return {
          background:
            "rgba(250,204,21,0.09)",
          border:
            "1px solid rgba(250,204,21,0.22)",
          color: "#fde68a",
        };

      default:
        return {
          background:
            "rgba(56,189,248,0.09)",
          border:
            "1px solid rgba(56,189,248,0.22)",
          color: "#7dd3fc",
        };
    }
  };

  const visibleCollections = useMemo(() => {
    if (
      activeAvailability !== "all" ||
      favoritesOnly ||
      productSort !== "recommended"
    ) {
      return [];
    }

    const normalizedSearch =
      searchQuery.trim().toLowerCase();

    return collections.filter((collection) => {
      const matchesCategory =
        activeCategory === "all" ||
        collection.category === activeCategory;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        t(`collections.${collection.id}.title`),
        t(`collections.${collection.id}.description`),
        t(`categoryLabels.${collection.category}`),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        normalizedSearch
      );
    });
  }, [
    activeAvailability,
    activeCategory,
    favoritesOnly,
    locale,
    productSort,
    searchQuery,
  ]);

  return (
    <div>
      <Navbar />

      <main className="tsb-store-page">
        <style>{`
          /* TSB Store Premium UI */
          /* Hero premium */
          /* Catalogue professionnel */
          /* Filtres & recherche */
          /* Cartes produits */
          /* Familles de produits */
          /* Responsive desktop / tablette / mobile */

          .tsb-store-page {
            position: relative;
            overflow: hidden;
            background:
              radial-gradient(circle at 82% 8%, rgba(0,112,255,.09), transparent 26%),
              radial-gradient(circle at 12% 46%, rgba(0,212,255,.045), transparent 24%),
              linear-gradient(180deg, rgba(3,9,17,.15), rgba(3,9,17,0));
          }

          .tsb-store-shell {
            max-width: 1240px;
            margin: 0 auto;
          }

          .tsb-store-panel {
            border: 1px solid rgba(148,163,184,.12);
            border-radius: 24px;
            background:
              linear-gradient(180deg, rgba(10,21,36,.94), rgba(6,15,26,.94));
            box-shadow:
              0 22px 60px rgba(0,0,0,.28),
              inset 0 1px 0 rgba(255,255,255,.025);
          }

          .tsb-store-hero {
            position: relative;
            min-height: 390px;
            display: grid;
            grid-template-columns: minmax(0, 1.06fr) minmax(360px, .94fr);
            gap: 34px;
            align-items: center;
            padding: 48px 52px;
            overflow: hidden;
            border: 1px solid rgba(56,189,248,.18);
            border-radius: 26px;
            background:
              radial-gradient(circle at 82% 46%, rgba(0,112,255,.23), transparent 38%),
              linear-gradient(120deg, rgba(6,18,32,.98), rgba(4,13,24,.98));
            box-shadow:
              0 28px 80px rgba(0,0,0,.32),
              inset 0 1px 0 rgba(255,255,255,.035);
          }

          .tsb-store-hero::before {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            background:
              linear-gradient(90deg, rgba(0,112,255,.035) 1px, transparent 1px),
              linear-gradient(rgba(0,112,255,.025) 1px, transparent 1px);
            background-size: 54px 54px;
            mask-image: linear-gradient(to left, rgba(0,0,0,.7), transparent 68%);
          }

          .tsb-store-hero__copy,
          .tsb-store-hero__visual {
            position: relative;
            z-index: 1;
          }

          .tsb-store-hero__eyebrow {
            width: fit-content;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 14px;
            padding: 7px 12px;
            border: 1px solid rgba(56,189,248,.22);
            border-radius: 999px;
            background: rgba(14,165,233,.10);
            color: #38bdf8;
            font-size: .72rem;
            font-weight: 900;
            letter-spacing: .08em;
          }

          .tsb-store-hero h1 {
            max-width: 680px;
            margin: 0;
            font-size: clamp(2.25rem, 4.2vw, 4.65rem);
            line-height: .98;
            letter-spacing: -.055em;
          }

          .tsb-store-hero h1 span {
            display: block;
            margin-top: 7px;
            background: linear-gradient(90deg, #fff 8%, #bfeaff 48%, #38bdf8 100%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }

          .tsb-store-hero__intro {
            max-width: 650px;
            margin: 20px 0 0;
            color: rgba(226,232,240,.78);
            font-size: 1rem;
            line-height: 1.75;
          }

          .tsb-store-hero__actions {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 24px;
          }

          .tsb-store-hero__actions .button {
            min-height: 48px;
            padding: 0 20px;
            border-radius: 13px;
            font-size: .78rem;
            font-weight: 900;
          }

          .tsb-store-hero__visual {
            min-height: 300px;
            display: grid;
            grid-template-columns: 1.16fr .84fr;
            grid-template-rows: 1fr 1fr;
            gap: 12px;
            align-items: stretch;
          }

          .tsb-store-hero-product {
            position: relative;
            min-height: 138px;
            display: grid;
            place-items: center;
            overflow: hidden;
            border: 1px solid rgba(125,211,252,.14);
            border-radius: 19px;
            background:
              radial-gradient(circle at 50% 55%, rgba(22,136,255,.18), transparent 55%),
              rgba(7,18,31,.84);
            box-shadow: 0 18px 34px rgba(0,0,0,.28);
          }

          .tsb-store-hero-product:first-child {
            grid-row: 1 / span 2;
          }

          .tsb-store-hero-product::after {
            content: "";
            position: absolute;
            left: 12%;
            right: 12%;
            bottom: -8px;
            height: 18px;
            border-radius: 50%;
            background: rgba(0,112,255,.36);
            filter: blur(16px);
          }

          .tsb-store-hero-product img {
            width: 86%;
            height: 86%;
            object-fit: contain;
            filter: drop-shadow(0 18px 20px rgba(0,0,0,.55));
          }

          .tsb-store-hero-product__fallback {
            width: 86px;
            height: 86px;
            display: grid;
            place-items: center;
            border-radius: 24px;
            border: 1px solid rgba(56,189,248,.22);
            background: rgba(14,165,233,.10);
            color: #38bdf8;
            box-shadow: 0 0 36px rgba(0,112,255,.18);
          }

          .tsb-store-progress {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            margin-top: 14px;
            padding: 13px 16px;
            border: 1px solid rgba(56,189,248,.10);
            border-radius: 15px;
            background: rgba(8,18,31,.68);
          }

          .tsb-store-progress__main {
            min-width: 0;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .tsb-store-progress__icon {
            width: 36px;
            height: 36px;
            flex: 0 0 auto;
            display: grid;
            place-items: center;
            border-radius: 11px;
            border: 1px solid rgba(56,189,248,.20);
            background: rgba(14,165,233,.09);
            color: #38bdf8;
          }

          .tsb-store-progress strong {
            display: block;
            color: rgba(255,255,255,.9);
            font-size: .78rem;
          }

          .tsb-store-progress p {
            margin: 3px 0 0;
            color: rgba(226,232,240,.55);
            font-size: .72rem;
            line-height: 1.45;
          }

          .tsb-store-catalogue {
            padding: 24px;
          }

          .tsb-store-catalogue__title-row {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 18px;
            margin-bottom: 17px;
          }

          .tsb-store-catalogue__title-wrap {
            min-width: 0;
          }

          .tsb-store-catalogue__eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            color: #38bdf8;
            font-size: .72rem;
            font-weight: 900;
            letter-spacing: .08em;
          }

          .tsb-store-catalogue h2,
          .tsb-store-products-heading h2,
          .tsb-store-family-heading h2 {
            margin: 0;
            color: #fff;
            letter-spacing: -.025em;
          }

          .tsb-store-catalogue__intro {
            margin: 5px 0 0;
            color: rgba(226,232,240,.56);
            font-size: .8rem;
          }

          .tsb-store-search {
            position: relative;
          }

          .tsb-store-search svg {
            position: absolute;
            left: 17px;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(226,232,240,.62);
            pointer-events: none;
          }

          .tsb-store-search input {
            width: 100%;
            height: 50px;
            padding: 0 18px 0 48px;
            border: 1px solid rgba(148,163,184,.14);
            border-radius: 14px;
            outline: none;
            background: rgba(4,12,22,.68);
            color: #fff;
            font: inherit;
            font-size: .82rem;
            transition: border-color .2s ease, box-shadow .2s ease;
          }

          .tsb-store-search input:focus {
            border-color: rgba(56,189,248,.42);
            box-shadow: 0 0 0 4px rgba(14,165,233,.07);
          }

          .tsb-store-filter-row {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .tsb-store-filter-row::-webkit-scrollbar {
            display: none;
          }

          .tsb-store-category-row {
            display: flex;
            align-items: center;
            gap: 9px;
            margin-top: 14px;
            overflow-x: auto;
            padding: 1px 0 3px;
          }

          .tsb-store-category-btn {
            min-height: 42px;
            padding: 0 14px;
            flex: 0 0 auto;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
            border: 1px solid rgba(148,163,184,.11);
            border-radius: 12px;
            background: rgba(8,17,29,.82);
            color: rgba(255,255,255,.82);
            cursor: pointer;
            font: inherit;
            font-size: .72rem;
            font-weight: 800;
            transition: all .2s ease;
          }

          .tsb-store-category-btn:hover {
            transform: translateY(-1px);
            border-color: rgba(56,189,248,.24);
          }

          .tsb-store-category-btn.is-active {
            border-color: rgba(56,189,248,.36);
            background: linear-gradient(135deg, rgba(0,112,255,.18), rgba(0,212,255,.07));
            color: #7dd3fc;
            box-shadow: inset 0 -2px 0 rgba(56,189,248,.75);
          }

          .tsb-store-count {
            min-width: 20px;
            height: 20px;
            padding: 0 6px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            background: rgba(255,255,255,.075);
            color: rgba(255,255,255,.78);
            font-size: .62rem;
            font-weight: 900;
          }

          .tsb-store-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 14px;
            padding-top: 14px;
            border-top: 1px solid rgba(148,163,184,.09);
          }

          .tsb-store-toolbar__group {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }

          .tsb-store-control {
            min-height: 38px;
            padding: 0 34px 0 11px;
            border: 1px solid rgba(148,163,184,.12);
            border-radius: 11px;
            outline: none;
            background: #08111e;
            color: rgba(255,255,255,.84);
            font: inherit;
            font-size: .72rem;
          }

          .tsb-store-control:focus {
            border-color: rgba(56,189,248,.38);
          }

          .tsb-store-mini-action {
            min-height: 38px;
            padding: 0 12px;
            display: inline-flex;
            align-items: center;
            gap: 7px;
            border: 1px solid rgba(148,163,184,.12);
            border-radius: 11px;
            background: rgba(8,17,29,.84);
            color: rgba(255,255,255,.78);
            cursor: pointer;
            font: inherit;
            font-size: .7rem;
            font-weight: 800;
          }

          .tsb-store-mini-action.is-active {
            border-color: rgba(248,113,113,.30);
            color: #fca5a5;
            background: rgba(127,29,29,.12);
          }

          .tsb-store-products-heading,
          .tsb-store-family-heading {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            margin-bottom: 15px;
          }

          .tsb-store-products-heading__left,
          .tsb-store-family-heading__left {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .tsb-store-products-heading__icon,
          .tsb-store-family-heading__icon {
            width: 36px;
            height: 36px;
            display: grid;
            place-items: center;
            border: 1px solid rgba(56,189,248,.16);
            border-radius: 11px;
            background: rgba(14,165,233,.08);
            color: #7dd3fc;
          }

          .tsb-store-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 15px;
          }

          .tsb-store-product-card {
            position: relative;
            min-width: 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid rgba(148,163,184,.12);
            border-radius: 18px;
            background:
              linear-gradient(180deg, rgba(12,25,42,.96), rgba(7,17,29,.96));
            box-shadow: 0 16px 32px rgba(0,0,0,.18);
            transition:
              transform .2s ease,
              border-color .2s ease,
              box-shadow .2s ease;
          }

          .tsb-store-product-card::before {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            height: 2px;
            background: linear-gradient(90deg, #1688ff, #00d4ff);
            opacity: .88;
            z-index: 2;
          }

          .tsb-store-product-card--green::before {
            background: linear-gradient(90deg, #22c55e, #38bdf8);
          }

          .tsb-store-product-card--orange::before {
            background: linear-gradient(90deg, #f59e0b, #fb923c);
          }

          .tsb-store-product-card--cyan::before {
            background: linear-gradient(90deg, #06b6d4, #38bdf8);
          }

          .tsb-store-product-card--purple::before {
            background: linear-gradient(90deg, #8b5cf6, #38bdf8);
          }

          .tsb-store-product-card:hover {
            transform: translateY(-4px);
            border-color: rgba(56,189,248,.26);
            box-shadow: 0 22px 48px rgba(0,0,0,.30);
          }

          .tsb-store-product-media {
            position: relative;
            height: 210px;
            display: grid;
            place-items: center;
            overflow: hidden;
            background:
              radial-gradient(circle at 50% 60%, rgba(0,112,255,.12), transparent 58%),
              linear-gradient(180deg, rgba(8,17,29,.58), rgba(8,17,29,.20));
            border-bottom: 1px solid rgba(148,163,184,.08);
          }

          .tsb-store-product-media img {
            width: 88%;
            height: 88%;
            object-fit: contain;
            transition: transform .25s ease;
            filter: drop-shadow(0 14px 18px rgba(0,0,0,.44));
          }

          .tsb-store-product-card:hover .tsb-store-product-media img {
            transform: scale(1.035);
          }

          .tsb-store-product-placeholder {
            width: 78px;
            height: 78px;
            display: grid;
            place-items: center;
            border: 1px solid rgba(56,189,248,.18);
            border-radius: 22px;
            background: rgba(14,165,233,.07);
            color: rgba(125,211,252,.68);
          }

          .tsb-store-favorite-btn {
            position: absolute;
            top: 12px;
            right: 12px;
            z-index: 3;
            width: 34px;
            height: 34px;
            display: grid;
            place-items: center;
            border: 1px solid rgba(255,255,255,.14);
            border-radius: 999px;
            background: rgba(3,10,18,.72);
            color: #fff;
            cursor: pointer;
            backdrop-filter: blur(9px);
          }

          .tsb-store-favorite-btn.is-active {
            border-color: rgba(248,113,113,.38);
            background: rgba(127,29,29,.64);
            color: #fca5a5;
          }

          .tsb-store-availability {
            position: absolute;
            top: 12px;
            left: 12px;
            z-index: 3;
            padding: 5px 8px;
            border-radius: 7px;
            font-size: .62rem;
            font-weight: 900;
            backdrop-filter: blur(8px);
          }

          .tsb-store-product-body {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 15px;
          }

          .tsb-store-category-label {
            color: #38bdf8;
            font-size: .66rem;
            font-weight: 900;
            letter-spacing: .07em;
            text-transform: uppercase;
          }

          .tsb-store-product-title {
            margin: 7px 0 0;
            color: #fff;
            font-size: 1rem;
            line-height: 1.26;
          }

          .tsb-store-product-description {
            min-height: 42px;
            margin: 7px 0 0;
            color: rgba(226,232,240,.58);
            font-size: .75rem;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .tsb-store-meta {
            display: flex;
            gap: 7px;
            flex-wrap: wrap;
            margin-top: 10px;
          }

          .tsb-store-meta span {
            padding: 4px 7px;
            border: 1px solid rgba(148,163,184,.09);
            border-radius: 7px;
            background: rgba(255,255,255,.025);
            color: rgba(226,232,240,.46);
            font-size: .62rem;
            font-weight: 750;
          }

          .tsb-store-featured {
            width: fit-content;
            margin-top: 9px;
            padding: 4px 7px;
            border: 1px solid rgba(0,212,255,.16);
            border-radius: 7px;
            background: rgba(0,112,255,.07);
            color: #7dd3fc;
            font-size: .62rem;
            font-weight: 850;
          }

          .tsb-store-price {
            margin-top: auto;
            padding-top: 14px;
          }

          .tsb-store-price small {
            display: block;
            margin-bottom: 3px;
            color: rgba(226,232,240,.42);
            font-size: .61rem;
            font-weight: 850;
            letter-spacing: .07em;
            text-transform: uppercase;
          }

          .tsb-store-price strong {
            color: #fff;
            font-size: 1.08rem;
          }

          .tsb-store-price strong.is-request {
            color: #7dd3fc;
            font-size: .92rem;
          }

          .tsb-store-product-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: 12px;
          }

          .tsb-store-product-actions .button {
            min-height: 39px;
            padding: 0 9px;
            justify-content: center;
            border-radius: 10px;
            font-size: .66rem;
            font-weight: 850;
          }

          .tsb-store-pagination {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-top: 18px;
          }

          .tsb-store-family-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 13px;
          }

          .tsb-store-family-card {
            position: relative;
            min-height: 205px;
            display: flex;
            flex-direction: column;
            padding: 18px;
            overflow: hidden;
            border: 1px solid rgba(148,163,184,.11);
            border-radius: 17px;
            background: linear-gradient(180deg, rgba(11,23,39,.9), rgba(7,17,29,.9));
            transition: transform .2s ease, border-color .2s ease;
          }

          .tsb-store-family-card:hover {
            transform: translateY(-3px);
            border-color: rgba(56,189,248,.24);
          }

          .tsb-store-family-card__icon {
            width: 42px;
            height: 42px;
            display: grid;
            place-items: center;
            margin-bottom: 15px;
            border: 1px solid rgba(56,189,248,.18);
            border-radius: 13px;
            background: rgba(14,165,233,.07);
            color: #7dd3fc;
          }

          .tsb-store-family-card h3 {
            margin: 6px 0 0;
            color: #fff;
            font-size: .98rem;
          }

          .tsb-store-family-card p {
            margin: 8px 0 0;
            color: rgba(226,232,240,.53);
            font-size: .73rem;
            line-height: 1.55;
          }

          .tsb-store-family-card a {
            margin-top: auto;
            padding-top: 14px;
            display: inline-flex;
            align-items: center;
            gap: 7px;
            color: #38bdf8;
            text-decoration: none;
            font-size: .7rem;
            font-weight: 850;
          }

          .tsb-store-empty {
            max-width: 720px;
            margin: 0 auto;
            padding: 36px 24px;
            text-align: center;
          }

          .tsb-store-footer-status {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 16px 18px;
          }

          .tsb-store-footer-status__icon {
            width: 42px;
            height: 42px;
            flex: 0 0 auto;
            display: grid;
            place-items: center;
            border: 1px solid rgba(56,189,248,.16);
            border-radius: 13px;
            background: rgba(14,165,233,.07);
            color: #7dd3fc;
          }

          .tsb-store-footer-status__copy {
            flex: 1 1 auto;
            min-width: 0;
          }

          .tsb-store-footer-status h3 {
            margin: 0;
            color: #fff;
            font-size: .9rem;
          }

          .tsb-store-footer-status p {
            margin: 4px 0 0;
            color: rgba(226,232,240,.52);
            font-size: .72rem;
            line-height: 1.5;
          }

          @media (max-width: 1080px) {
            .tsb-store-hero {
              grid-template-columns: 1fr;
              padding: 38px;
            }

            .tsb-store-hero__visual {
              min-height: 250px;
            }

            .tsb-store-grid,
            .tsb-store-family-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 720px) {
            .tsb-store-hero {
              min-height: auto;
              padding: 26px 20px;
              border-radius: 20px;
            }

            .tsb-store-hero h1 {
              font-size: clamp(2rem, 10vw, 3rem);
            }

            .tsb-store-hero__visual {
              min-height: 220px;
              grid-template-columns: 1fr 1fr;
              grid-template-rows: 1fr 1fr;
            }

            .tsb-store-hero-product:first-child {
              grid-row: auto;
              grid-column: 1 / span 2;
            }

            .tsb-store-progress {
              align-items: flex-start;
              flex-direction: column;
            }

            .tsb-store-catalogue {
              padding: 18px;
            }

            .tsb-store-catalogue__title-row,
            .tsb-store-products-heading,
            .tsb-store-family-heading {
              align-items: flex-start;
              flex-direction: column;
            }

            .tsb-store-toolbar {
              align-items: stretch;
            }

            .tsb-store-toolbar__group {
              width: 100%;
            }

            .tsb-store-control,
            .tsb-store-mini-action {
              flex: 1 1 160px;
            }

            .tsb-store-grid,
            .tsb-store-family-grid {
              grid-template-columns: 1fr;
            }

            .tsb-store-product-media {
              height: 240px;
            }

            .tsb-store-footer-status {
              align-items: flex-start;
              flex-wrap: wrap;
            }
          }
        `}</style>

        <section
          className="section"
          style={{
            paddingTop: "34px",
            paddingBottom: "16px",
          }}
        >
          <div className="container">
            <div className="tsb-store-shell">
              <div className="tsb-store-hero">
                <div className="tsb-store-hero__copy">
                  <div className="tsb-store-hero__eyebrow">
                    <ShoppingBag size={15} strokeWidth={1.9} />
                    {t("eyebrow")}
                  </div>

                  <h1>
                    {t("title1")}
                    <span>{t("title2")}</span>
                  </h1>

                  <p className="tsb-store-hero__intro">
                    {t("intro")}
                  </p>

                  <div className="tsb-store-hero__actions">
                    <a
                      href="/#top"
                      className="button button--secondary"
                    >
                      ← {t("backHome")}
                    </a>

                    <a
                      href="/contact"
                      className="button button--primary"
                    >
                      <Package size={16} aria-hidden="true" />
                      {t("contact")}
                    </a>
                  </div>
                </div>

                <div className="tsb-store-hero__visual" aria-hidden="true">
                  {storeProducts.length > 0 ? (
                    storeProducts.slice(0, 3).map((product) => {
                      const heroCategory = categories.find(
                        (item) => item.id === product.category
                      );
                      const HeroProductIcon = heroCategory?.icon ?? Package;

                      return (
                        <div
                          key={`hero-${product.id}`}
                          className="tsb-store-hero-product"
                        >
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt=""
                            />
                          ) : (
                            <div className="tsb-store-hero-product__fallback">
                              <HeroProductIcon
                                size={38}
                                strokeWidth={1.45}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <>
                      <div className="tsb-store-hero-product">
                        <div className="tsb-store-hero-product__fallback">
                          <Car size={38} strokeWidth={1.45} />
                        </div>
                      </div>
                      <div className="tsb-store-hero-product">
                        <div className="tsb-store-hero-product__fallback">
                          <ShieldCheck size={38} strokeWidth={1.45} />
                        </div>
                      </div>
                      <div className="tsb-store-hero-product">
                        <div className="tsb-store-hero-product__fallback">
                          <Zap size={38} strokeWidth={1.45} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="tsb-store-progress">
                <div className="tsb-store-progress__main">
                  <div className="tsb-store-progress__icon">
                    <PackageSearch size={18} strokeWidth={1.8} />
                  </div>
                  <div>
                    <strong>{t("launchBadge")} · {t("launchTitle")}</strong>
                    <p>{t("launchText")}</p>
                  </div>
                </div>

                <a
                  href="/contact"
                  className="button button--secondary"
                  style={{
                    minHeight: "36px",
                    padding: "0 12px",
                    flex: "0 0 auto",
                    fontSize: ".69rem",
                  }}
                >
                  {t("requestProduct")}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section
          id="catalogue"
          className="section"
          style={{
            paddingTop: "18px",
            paddingBottom: "20px",
            scrollMarginTop: "20px",
          }}
        >
          <div className="container">
            <div className="tsb-store-shell tsb-store-panel tsb-store-catalogue">
              <div className="tsb-store-catalogue__title-row">
                <div className="tsb-store-catalogue__title-wrap">
                  <div className="tsb-store-catalogue__eyebrow">
                    <PackageSearch size={15} strokeWidth={1.8} />
                    {t("catalogueEyebrow")}
                  </div>
                  <h2>{t("catalogueTitle")}</h2>
                  <p className="tsb-store-catalogue__intro">
                    {t("catalogueIntro")}
                  </p>
                </div>

                <span
                  className="tsb-store-count"
                  style={{ minHeight: "28px", padding: "0 10px" }}
                >
                  {visibleProducts.length} {t("resultsLabel")}
                </span>
              </div>

              <div className="tsb-store-search">
                <Search size={19} aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder={t("searchPlaceholder")}
                  aria-label={t("searchPlaceholder")}
                />
              </div>

              <div className="tsb-store-category-row tsb-store-filter-row">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeCategory === category.id;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(category.id);
                        setProductPage(1);
                      }}
                      aria-pressed={isActive}
                      className={`tsb-store-category-btn${
                        isActive ? " is-active" : ""
                      }`}
                    >
                      <Icon size={15} strokeWidth={1.9} />
                      {t(`categoryLabels.${category.id}`)}
                      <span className="tsb-store-count">
                        {getCategoryProductCount(category.id)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="tsb-store-toolbar">
                <div className="tsb-store-toolbar__group">
                  <SlidersHorizontal
                    size={16}
                    strokeWidth={1.8}
                    style={{ color: "#38bdf8" }}
                  />

                  <select
                    className="tsb-store-control"
                    value={activeAvailability}
                    onChange={(event) =>
                      setActiveAvailability(
                        event.target.value as AvailabilityFilter
                      )
                    }
                    aria-label={t("availabilityFilter")}
                  >
                    <option value="all">
                      {t("allAvailability")}
                    </option>

                    {(
                      [
                        "in_stock",
                        "on_request",
                        "out_of_stock",
                        "coming_soon",
                      ] as const
                    ).map((availability) => (
                      <option
                        key={availability}
                        value={availability}
                      >
                        {t(`availabilityLabels.${availability}`)}
                      </option>
                    ))}
                  </select>

                  <select
                    className="tsb-store-control"
                    value={productSort}
                    onChange={(event) =>
                      setProductSort(
                        event.target.value as ProductSort
                      )
                    }
                    aria-label={t("sortLabel")}
                  >
                    {(
                      [
                        "recommended",
                        "newest",
                        "price_asc",
                        "price_desc",
                        "name",
                      ] as const
                    ).map((sort) => (
                      <option key={sort} value={sort}>
                        {t(`sortOptions.${sort}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="tsb-store-toolbar__group">
                  <button
                    type="button"
                    onClick={() =>
                      setFavoritesOnly((previous) => !previous)
                    }
                    aria-pressed={favoritesOnly}
                    title={t("favorites")}
                    className={`tsb-store-mini-action${
                      favoritesOnly ? " is-active" : ""
                    }`}
                  >
                    <Heart
                      size={14}
                      fill={favoritesOnly ? "currentColor" : "none"}
                    />
                    {t("favorites")}
                    <span className="tsb-store-count">
                      {favoriteSlugs.length}
                    </span>
                  </button>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetCatalogueFilters}
                      className="tsb-store-mini-action"
                    >
                      <RotateCcw size={14} />
                      {t("resetFilters")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section"
          style={{
            paddingTop: "8px",
            paddingBottom: "26px",
          }}
        >
          <div className="container">
            <div className="tsb-store-shell">
              {productsLoading ? (
                <div
                  className="tsb-store-panel tsb-store-empty"
                  style={{
                    color: "rgba(255,255,255,.64)",
                    fontSize: ".82rem",
                  }}
                >
                  {t("loadingProducts")}
                </div>
              ) : visibleProducts.length > 0 ? (
                <>
                  <div className="tsb-store-products-heading">
                    <div className="tsb-store-products-heading__left">
                      <div className="tsb-store-products-heading__icon">
                        <ShoppingBag size={18} strokeWidth={1.8} />
                      </div>
                      <div>
                        <h2>{t("productsTitle")}</h2>
                      </div>
                      <span className="tsb-store-count">
                        {visibleProducts.length}
                      </span>
                    </div>
                  </div>

                  <div className="tsb-store-grid">
                    {paginatedProducts.map((product) => {
                      const category = categories.find(
                        (item) => item.id === product.category
                      );

                      const ProductIcon = category?.icon ?? Package;

                      const productName =
                        getLocalizedProductName(
                          product,
                          locale
                        );

                      const productDescription =
                        getLocalizedProductDescription(
                          product,
                          locale
                        );

                      const isFavorite = favoriteSlugs.includes(
                        product.slug
                      );

                      const isUnavailable =
                        product.availability === "out_of_stock" ||
                        product.availability === "coming_soon";

                      return (
                        <article
                          key={product.id}
                          className={`tsb-store-product-card tsb-store-product-card--${
                            category?.color ?? "blue"
                          }`}
                        >
                          <div className="tsb-store-product-media">
                            <span
                              className="tsb-store-availability"
                              style={getAvailabilityBadgeStyle(
                                product.availability
                              )}
                            >
                              {t(`availabilityLabels.${product.availability}`)}
                            </span>

                            <button
                              type="button"
                              onClick={() => toggleFavorite(product.slug)}
                              aria-label={
                                isFavorite
                                  ? t("favoriteRemove")
                                  : t("favoriteAdd")
                              }
                              title={
                                isFavorite
                                  ? t("favoriteRemove")
                                  : t("favoriteAdd")
                              }
                              className={`tsb-store-favorite-btn${
                                isFavorite ? " is-active" : ""
                              }`}
                            >
                              <Heart
                                size={16}
                                fill={
                                  isFavorite ? "currentColor" : "none"
                                }
                              />
                            </button>

                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={productName}
                                loading="lazy"
                              />
                            ) : (
                              <div className="tsb-store-product-placeholder">
                                <ProductIcon
                                  size={34}
                                  strokeWidth={1.5}
                                />
                              </div>
                            )}
                          </div>

                          <div className="tsb-store-product-body">
                            <span className="tsb-store-category-label">
                              {t(`categoryLabels.${product.category}`)}
                            </span>

                            <h3 className="tsb-store-product-title">
                              {productName}
                            </h3>

                            {productDescription && (
                              <p className="tsb-store-product-description">
                                {productDescription}
                              </p>
                            )}

                            <div className="tsb-store-meta">
                              {product.sku && (
                                <span>{t("referenceLabel")} {product.sku}</span>
                              )}

                              {product.stock_quantity !== null && (
                                <span>
                                  {t("stockLabel")}: {product.stock_quantity}{" "}
                                  {t("stockUnit")}
                                </span>
                              )}
                            </div>

                            {product.is_featured && (
                              <div className="tsb-store-featured">
                                ★ {t("featured")}
                              </div>
                            )}

                            <div className="tsb-store-price">
                              <small>{t("priceLabel")}</small>
                              <strong
                                className={
                                  product.price === null
                                    ? "is-request"
                                    : undefined
                                }
                              >
                                {product.price === null
                                  ? t("priceOnRequest")
                                  : formatProductPrice(
                                      Number(product.price),
                                      product.currency,
                                      intlLocale
                                    )}
                              </strong>
                            </div>

                            <div className="tsb-store-product-actions">
                              <a
                                href={`/store/product/${encodeURIComponent(
                                  product.slug
                                )}`}
                                className="button button--secondary"
                              >
                                {t("productDetails")}
                                <ArrowRight size={13} />
                              </a>

                              <button
                                type="button"
                                disabled={isUnavailable}
                                onClick={() =>
                                  addStoreCartItem({
                                    slug: product.slug,
                                    name_fr: product.name_fr,
                                    name_nl: product.name_nl,
                                    name_en: product.name_en,
                                    sku: product.sku,
                                    price:
                                      product.price === null
                                        ? null
                                        : Number(product.price),
                                    currency: product.currency,
                                    image_url: product.image_url,
                                  })
                                }
                                className="button button--primary"
                                style={{
                                  opacity: isUnavailable ? 0.46 : 1,
                                  cursor: isUnavailable
                                    ? "not-allowed"
                                    : "pointer",
                                }}
                              >
                                <ShoppingBag size={13} />
                                {isUnavailable
                                  ? t("unavailableCart")
                                  : t("addToCart")}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {totalProductPages > 1 && (
                    <div className="tsb-store-pagination">
                      <button
                        type="button"
                        onClick={() =>
                          setProductPage((page) =>
                            Math.max(1, page - 1)
                          )
                        }
                        disabled={safeProductPage <= 1}
                        className="button button--secondary"
                        style={{
                          minHeight: "36px",
                          padding: "0 13px",
                          opacity: safeProductPage <= 1 ? 0.45 : 1,
                        }}
                      >
                        ←
                      </button>

                      <span
                        style={{
                          color: "rgba(255,255,255,.64)",
                          fontSize: ".75rem",
                        }}
                      >
                        {safeProductPage} / {totalProductPages}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setProductPage((page) =>
                            Math.min(totalProductPages, page + 1)
                          )
                        }
                        disabled={safeProductPage >= totalProductPages}
                        className="button button--secondary"
                        style={{
                          minHeight: "36px",
                          padding: "0 13px",
                          opacity:
                            safeProductPage >= totalProductPages
                              ? 0.45
                              : 1,
                        }}
                      >
                        →
                      </button>
                    </div>
                  )}
                </>
              ) : null}

              {visibleCollections.length > 0 ? (
                <div style={{ marginTop: "34px" }}>
                  <div className="tsb-store-family-heading">
                    <div className="tsb-store-family-heading__left">
                      <div className="tsb-store-family-heading__icon">
                        <PackageSearch size={18} strokeWidth={1.8} />
                      </div>
                      <h2>{t("catalogueTitle")}</h2>
                    </div>
                  </div>

                  <div className="tsb-store-family-grid">
                    {visibleCollections.map((collection) => {
                      const category = categories.find(
                        (item) => item.id === collection.category
                      );

                      const Icon = category?.icon ?? PackageSearch;

                      return (
                        <article
                          key={collection.id}
                          className="tsb-store-family-card"
                        >
                          <div className="tsb-store-family-card__icon">
                            <Icon size={21} strokeWidth={1.8} />
                          </div>

                          <span className="tsb-store-category-label">
                            {t(`categoryLabels.${collection.category}`)}
                          </span>

                          <h3>{t(`collections.${collection.id}.title`)}</h3>

                          <p>{t(`collections.${collection.id}.description`)}</p>

                          <a href="/contact">
                            <Wrench size={15} aria-hidden="true" />
                            {t("learnMore")}
                          </a>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ) : visibleProducts.length === 0 &&
                !productsLoading ? (
                <div className="tsb-store-panel tsb-store-empty">
                  <PackageSearch
                    size={30}
                    strokeWidth={1.7}
                    style={{ color: "#7dd3fc" }}
                  />
                  <h3 style={{ marginTop: "14px" }}>
                    {t("noResultsTitle")}
                  </h3>
                  <p style={{ color: "rgba(255,255,255,.58)" }}>
                    {t("noResultsText")}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section
          className="section"
          style={{
            paddingTop: "0",
            paddingBottom: "36px",
          }}
        >
          <div className="container">
            <div className="tsb-store-shell tsb-store-panel tsb-store-footer-status">
              <div className="tsb-store-footer-status__icon">
                <PackageSearch size={20} strokeWidth={1.8} />
              </div>

              <div className="tsb-store-footer-status__copy">
                <h3>{t("statusLabel")}</h3>
                <p>{t("statusText")}</p>
              </div>

              <a
                href="/contact"
                className="button button--secondary"
                style={{
                  minHeight: "36px",
                  padding: "0 12px",
                  flex: "0 0 auto",
                  fontSize: ".69rem",
                }}
              >
                {t("requestProduct")}
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <StoreMiniCart language={language} />
      <ScrollToTop />
    </div>
  );
}

export default Store;
