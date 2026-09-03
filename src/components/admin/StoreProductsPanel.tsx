import {
  Building2,
  CalendarDays,
  FileDown,
  ReceiptText,
  ImagePlus,
  Mail,
  Package,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  ChangeEvent,
  FormEvent,
} from "react";

import { useLanguage } from "../../context/LanguageContext";
import {
  getLocaleConfig,
  isSupportedLocale,
  translate,
  type LocaleCode,
} from "../../i18n";
import {
  adminTranslations,
  resolveAdminCopyKey,
  type AdminCopyKey,
} from "../../i18n/locales/admin";
import notoNaskhArabicPdfFontUrl from "../../assets/fonts/NotoNaskhArabic-Regular.ttf?url";
import { supabase } from "../../services/supabase";


let notoNaskhArabicPdfFontPromise:
  | Promise<string>
  | null = null;

const loadNotoNaskhArabicPdfFont =
  async () => {
    if (
      !notoNaskhArabicPdfFontPromise
    ) {
      notoNaskhArabicPdfFontPromise =
        fetch(
          notoNaskhArabicPdfFontUrl
        ).then(async (response) => {
          if (!response.ok) {
            throw new Error(
              `Impossible de charger la police PDF arabe (${response.status}).`
            );
          }

          const bytes =
            new Uint8Array(
              await response.arrayBuffer()
            );

          let binary = "";
          const chunkSize = 0x8000;

          for (
            let offset = 0;
            offset < bytes.length;
            offset += chunkSize
          ) {
            binary +=
              String.fromCharCode(
                ...bytes.subarray(
                  offset,
                  Math.min(
                    offset +
                      chunkSize,
                    bytes.length
                  )
                )
              );
          }

          return binary;
        });
    }

    return notoNaskhArabicPdfFontPromise;
  };

const registerArabicPdfFont =
  async (doc: jsPDF) => {
    const binary =
      await loadNotoNaskhArabicPdfFont();

    const fontFileName =
      "NotoNaskhArabic-Regular.ttf";
    const fontFamily =
      "NotoNaskhArabic";

    doc.addFileToVFS(
      fontFileName,
      binary
    );
    doc.addFont(
      fontFileName,
      fontFamily,
      "normal"
    );
    doc.addFont(
      fontFileName,
      fontFamily,
      "bold"
    );

    return fontFamily;
  };

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

type StoreProduct = {
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
  image_path: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type StoreOrder = {
  id: string;
  order_number: string;
  request_id: string | null;
  user_id: string | null;
  product_id: string | null;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_price: number | null;
  currency: string;
  discount_amount: number;
  fees_amount: number;
  total_amount: number | null;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  company: string | null;
  notes: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
};

type StoreOrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_price: number | null;
  currency: string;
  line_total: number | null;
  sort_order: number;
};

type ParsedStoreRequestItem = {
  product: StoreProduct | null;
  productName: string;
  reference: string;
  quantity: number;
};

type StoreOrderItemEdit = {
  quantity: string;
  unit_price: string;
};

type StoreInvoiceItem = {
  id: string;
  invoice_id: string;
  product_id: string | null;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  currency: string;
  subtotal_amount: number;
  sort_order: number;
};

type StoreInvoice = {
  id: string;
  invoice_number: string;
  order_id: string;
  user_id: string | null;
  order_number: string;
  product_id: string | null;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  subtotal_amount: number;
  discount_amount: number;
  fees_amount: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  company: string | null;
  preferred_language: string;
  status: "draft" | "issued" | "cancelled";
  payment_status:
    | "unpaid"
    | "partially_paid"
    | "paid"
    | "refunded";
  issue_date: string | null;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type OrderEditForm = {
  quantity: string;
  unit_price: string;
  currency: string;
  discount_amount: string;
  fees_amount: string;
  notes: string;
};

type StoreRequest = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  message: string;
  status: string;
  admin_reply: string | null;
  preferred_language: string;
  created_at: string;
};

type ProductForm = {
  category: StoreCategory;
  name_fr: string;
  name_nl: string;
  name_en: string;
  description_fr: string;
  description_nl: string;
  description_en: string;
  sku: string;
  slug: string;
  price: string;
  currency: string;
  availability: StoreAvailability;
  stock_quantity: string;
  is_published: boolean;
  is_featured: boolean;
  sort_order: string;
};

const categoryOptions: Array<{
  value: StoreCategory;
  label: string;
}> = [
  {
    value: "automobile",
    label: "Automobile",
  },
  {
    value: "security",
    label: "Sécurité",
  },
  {
    value: "energy",
    label: "Énergie & électricité",
  },
  {
    value: "electronics",
    label: "Informatique & électronique",
  },
  {
    value: "other",
    label: "Autres & divers",
  },
];

const availabilityOptions: Array<{
  value: StoreAvailability;
  label: string;
}> = [
  {
    value: "in_stock",
    label: "En stock",
  },
  {
    value: "on_request",
    label: "Sur demande",
  },
  {
    value: "out_of_stock",
    label: "Rupture de stock",
  },
  {
    value: "coming_soon",
    label: "Bientôt disponible",
  },
];

const CURRENCY_OPTIONS = [
  "EUR",
  "USD",
  "GBP",
  "CHF",
  "CAD",
  "AUD",
  "CNY",
  "JPY",
  "AED",
  "MAD",
  "XOF",
  "XAF",
  "GNF",
] as const;

const ADMIN_PRODUCTS_PER_PAGE = 8;

const emptyForm: ProductForm = {
  category: "automobile",
  name_fr: "",
  name_nl: "",
  name_en: "",
  description_fr: "",
  description_nl: "",
  description_en: "",
  sku: "",
  slug: "",
  price: "",
  currency: "EUR",
  availability: "on_request",
  stock_quantity: "",
  is_published: false,
  is_featured: false,
  sort_order: "0",
};

function makeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}



function StoreProductsPanel() {
  const { locale, intlLocale } =
    useLanguage();

  const translateAdminCopyForLocale = (
    targetLocale: LocaleCode,
    key: AdminCopyKey
  ) =>
    translate(
      adminTranslations,
      targetLocale,
      `admin.copy.${key}`
    );

  const at = (key: AdminCopyKey) =>
    translateAdminCopyForLocale(locale, key);

  const formatAdminCopyForLocale = (
    targetLocale: LocaleCode,
    key: AdminCopyKey,
    values: Record<string, string | number>
  ) => {
    let result =
      translateAdminCopyForLocale(
        targetLocale,
        key
      );

    Object.entries(values).forEach(
      ([name, value]) => {
        result = result
          .split(`{${name}}`)
          .join(String(value));
      }
    );

    return result;
  };

  const formatAdminCopy = (
    key: AdminCopyKey,
    values: Record<string, string | number>
  ) =>
    formatAdminCopyForLocale(
      locale,
      key,
      values
    );

  /*
    Legacy FR/NL/EN bridge kept intentionally for this large Store
    component. Every static phrase is resolved through admin.ts so
    DE/ES/IT/PT/AR/TR/ZH use the same centralized resources.
  */
  const trForLocale = (
    targetLocale: LocaleCode,
    fr: string,
    nl: string,
    en: string
  ) => {
    const directKey =
      resolveAdminCopyKey(fr) ??
      resolveAdminCopyKey(nl) ??
      resolveAdminCopyKey(en);

    if (directKey) {
      return translateAdminCopyForLocale(
        targetLocale,
        directKey
      );
    }

    let match =
      fr.match(/^Facture (.+) émise\.$/);
    if (match) {
      return formatAdminCopyForLocale(
        targetLocale,
        "storeInvoiceIssuedNumber",
        { invoiceNumber: match[1] }
      );
    }

    match =
      fr.match(/^TVA mise à jour à (.+) %\.$/);
    if (match) {
      return formatAdminCopyForLocale(
        targetLocale,
        "storeVatUpdatedRate",
        { rate: match[1] }
      );
    }

    match =
      fr.match(/^Une facture existe déjà : (.+)\.$/);
    if (match) {
      return formatAdminCopyForLocale(
        targetLocale,
        "storeInvoiceAlreadyExistsNumber",
        { invoiceNumber: match[1] }
      );
    }

    match =
      fr.match(/^Brouillon de facture créé : (.+)\.$/);
    if (match) {
      return formatAdminCopyForLocale(
        targetLocale,
        "storeInvoiceDraftCreatedNumber",
        { invoiceNumber: match[1] }
      );
    }

    match =
      fr.match(/^Impossible de créer la commande : (.+)$/);
    if (match) {
      return formatAdminCopyForLocale(
        targetLocale,
        "storeUnableCreateOrderDetail",
        { detail: match[1] }
      );
    }

    match =
      fr.match(/^La commande n’a pas pu être finalisée : (.+)$/);
    if (match) {
      return formatAdminCopyForLocale(
        targetLocale,
        "storeOrderCouldNotCompleteDetail",
        { detail: match[1] }
      );
    }

    match =
      fr.match(/^Commande (.+) créée avec (\d+) produits\.$/);
    if (match) {
      return formatAdminCopyForLocale(
        targetLocale,
        "storeOrderCreatedWithProducts",
        {
          orderNumber: match[1],
          count: match[2],
        }
      );
    }

    match =
      fr.match(/^Commande (.+) créée avec succès\.$/);
    if (match) {
      return formatAdminCopyForLocale(
        targetLocale,
        "storeOrderCreatedSuccessfully",
        { orderNumber: match[1] }
      );
    }

    match =
      fr.match(/^Erreur pendant la création de la commande : (.+)$/);
    if (match) {
      return formatAdminCopyForLocale(
        targetLocale,
        "storeErrorCreatingOrderDetail",
        { detail: match[1] }
      );
    }

    match =
      fr.match(/^La quantité de « (.+) » doit être un entier supérieur à 0\.$/);
    if (match) {
      return formatAdminCopyForLocale(
        targetLocale,
        "storeProductQuantityInvalidDetail",
        { productName: match[1] }
      );
    }

    match =
      fr.match(/^Ajoutez un prix unitaire valide pour « (.+) »\.$/);
    if (match) {
      return formatAdminCopyForLocale(
        targetLocale,
        "storeProductUnitPriceInvalidDetail",
        { productName: match[1] }
      );
    }

    match =
      fr.match(/^Impossible d’enregistrer les modifications : (.+)$/);
    if (match) {
      return formatAdminCopyForLocale(
        targetLocale,
        "storeUnableSaveChangesDetail",
        { detail: match[1] }
      );
    }

    match =
      fr.match(/^Traduction automatique indisponible : (.+)$/);
    if (match) {
      return formatAdminCopyForLocale(
        targetLocale,
        "storeAutomaticTranslationUnavailableDetail",
        { detail: match[1] }
      );
    }

    match =
      fr.match(/^(\d+) produits dans cette commande$/);
    if (match) {
      return formatAdminCopyForLocale(
        targetLocale,
        "storeProductsInOrderCount",
        { count: match[1] }
      );
    }

    return targetLocale === "fr"
      ? fr
      : targetLocale === "nl"
        ? nl
        : en;
  };

  const tr = (
    fr: string,
    nl: string,
    en: string
  ) => trForLocale(locale, fr, nl, en);

  const getCategoryLabelForLanguage = (
    category: StoreCategory
  ) => {
    switch (category) {
      case "automobile":
        return tr(
          "Automobile",
          "Automobiel",
          "Automotive"
        );
      case "security":
        return tr(
          "Sécurité",
          "Beveiliging",
          "Security"
        );
      case "energy":
        return tr(
          "Énergie & électricité",
          "Energie & elektriciteit",
          "Energy & electricity"
        );
      case "electronics":
        return tr(
          "Informatique & électronique",
          "IT & elektronica",
          "IT & electronics"
        );
      default:
        return tr(
          "Autres & divers",
          "Andere & diverse",
          "Other & miscellaneous"
        );
    }
  };

  const getLocalizedProductName = (
    product: StoreProduct
  ) => {
    if (locale === "fr") {
      return product.name_fr;
    }

    if (locale === "nl") {
      return (
        product.name_nl?.trim() ||
        product.name_en?.trim() ||
        product.name_fr
      );
    }

    return (
      product.name_en?.trim() ||
      product.name_fr
    );
  };

  const getLocalizedStoredOrderProductName = (
    storedName: string,
    productId: string | null,
    sku: string | null
  ) => {
    const rawProductName =
      storedName?.trim() ?? "";

    const storeBundleMatch =
      rawProductName.match(
        /^TSB\s+Store\s*[-–—·]\s*(\d+)(?:\s+.*)?$/iu
      );

    if (storeBundleMatch) {
      return `TSB Store · ${formatAdminCopy(
        "storeBundleProductCount",
        {
          count: Number.parseInt(
            storeBundleMatch[1],
            10
          ),
        }
      )}`;
    }

    const product =
      products.find(
        (item) =>
          (productId &&
            item.id === productId) ||
          (sku &&
            item.sku?.trim()
              .toLocaleLowerCase() ===
              sku
                .trim()
                .toLocaleLowerCase())
      );

    return product
      ? getLocalizedProductName(product)
      : storedName;
  };

  const getAvailabilityLabelForLanguage = (
    availability: StoreAvailability
  ) => {
    switch (availability) {
      case "in_stock":
        return tr(
          "En stock",
          "Op voorraad",
          "In stock"
        );
      case "out_of_stock":
        return tr(
          "Rupture de stock",
          "Niet op voorraad",
          "Out of stock"
        );
      case "coming_soon":
        return tr(
          "Bientôt disponible",
          "Binnenkort beschikbaar",
          "Coming soon"
        );
      default:
        return tr(
          "Sur demande",
          "Op aanvraag",
          "On request"
        );
    }
  };

  const [products, setProducts] =
    useState<StoreProduct[]>([]);

  const [storeRequests, setStoreRequests] =
    useState<StoreRequest[]>([]);

  const [storeOrders, setStoreOrders] =
    useState<StoreOrder[]>([]);

  const [
    storeInvoices,
    setStoreInvoices,
  ] = useState<StoreInvoice[]>([]);

  const [
    storeInvoiceItems,
    setStoreInvoiceItems,
  ] = useState<StoreInvoiceItem[]>([]);

  const [storeOrderItems, setStoreOrderItems] =
    useState<StoreOrderItem[]>([]);

  const [
    orderItemEditForms,
    setOrderItemEditForms,
  ] = useState<Record<string, StoreOrderItemEdit>>({});

  const [
    invoiceCreatingOrderId,
    setInvoiceCreatingOrderId,
  ] = useState<string | null>(null);

  const [
    invoiceMessage,
    setInvoiceMessage,
  ] = useState("");

  const [
    invoiceVatUpdatingId,
    setInvoiceVatUpdatingId,
  ] = useState<string | null>(null);

  const [
    invoiceUpdatingId,
    setInvoiceUpdatingId,
  ] = useState<string | null>(null);

  const [
    ordersLoading,
    setOrdersLoading,
  ] = useState(false);

  const [
    orderUpdatingId,
    setOrderUpdatingId,
  ] = useState<string | null>(null);

  const [
    orderCreatingRequestId,
    setOrderCreatingRequestId,
  ] = useState<string | null>(null);

  const [
    orderMessage,
    setOrderMessage,
  ] = useState("");

  const [
    editingOrderId,
    setEditingOrderId,
  ] = useState<string | null>(null);

  const [
    orderSavingId,
    setOrderSavingId,
  ] = useState<string | null>(null);

  const [
    orderEditForm,
    setOrderEditForm,
  ] = useState<OrderEditForm>({
    quantity: "1",
    unit_price: "",
    currency: "EUR",
    discount_amount: "0",
    fees_amount: "0",
    notes: "",
  });

  const [
    activeStoreView,
    setActiveStoreView,
  ] = useState<
    "catalogue" | "requests" | "orders"
  >("catalogue");

  const [
    requestsLoading,
    setRequestsLoading,
  ] = useState(false);

  const [
    requestUpdatingId,
    setRequestUpdatingId,
  ] = useState<string | null>(null);

  const [
    requestMessage,
    setRequestMessage,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState<"all" | StoreCategory>(
    "all"
  );

  const [productPage, setProductPage] =
    useState(1);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<ProductForm>(emptyForm);

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const normalizeStoreText = (
    value: string
  ) =>
    value
      .trim()
      .toLocaleLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(/\s+/g, " ");

  const getRequestStatusLabel = (
    status: string
  ) => {
    switch (status) {
      case "in_progress":
        return tr(
          "En cours",
          "In behandeling",
          "In progress"
        );
      case "completed":
        return tr(
          "Terminée",
          "Afgerond",
          "Completed"
        );
      case "cancelled":
        return tr(
          "Annulée",
          "Geannuleerd",
          "Cancelled"
        );
      default:
        return tr(
          "Reçue",
          "Ontvangen",
          "Received"
        );
    }
  };

  const formatRequestDate = (
    value: string
  ) => {
    return new Intl.DateTimeFormat(
      intlLocale,
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(new Date(value));
  };

  const getStoreRequestProduct = (
    request: StoreRequest
  ) => {
    const referenceMatch =
      request.message.match(
        /^(?:Référence|Reference|Referentie|Referenz|Referencia|Riferimento|Referência|المرجع|Referans|参考)\s*[:：]\s*(.+)$/im
      );

    const productMatch =
      request.message.match(
        /^(?:Produit|Product|Produkt|Producto|Prodotto|Produto|المنتج|Ürün|产品)\s*[:：]\s*(.+)$/im
      );

    const reference =
      referenceMatch?.[1]?.trim() ??
      "";

    const storedName =
      productMatch?.[1]?.trim() ??
      "";

    const normalizedStoredName =
      normalizeStoreText(
        storedName
      );

    const product =
      products.find((item) => {
        if (
          reference &&
          item.sku?.trim()
        ) {
          return (
            item.sku
              .trim()
              .toLocaleLowerCase() ===
            reference.toLocaleLowerCase()
          );
        }

        if (!normalizedStoredName) {
          return false;
        }

        return [
          item.name_fr,
          item.name_nl,
          item.name_en,
        ]
          .filter(
            (
              value
            ): value is string =>
              Boolean(value?.trim())
          )
          .some(
            (value) =>
              normalizeStoreText(
                value
              ) ===
              normalizedStoredName
          );
      });

    return {
      productName: product
        ? getLocalizedProductName(
            product
          )
        : storedName ||
          tr(
            "Produit TSB Store",
            "TSB Store-product",
            "TSB Store product"
          ),
      reference:
        product?.sku?.trim() ||
        reference,
    };
  };

  const getStoreRequestItems = (
    request: StoreRequest
  ): ParsedStoreRequestItem[] => {
    const lines = request.message
      .split(/\r?\n/)
      .map((line) => line.trim());

    const starts = lines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => /^\d+\.\s+/.test(line));

    if (starts.length === 0) {
      const legacy = getStoreRequestProduct(request);
      const normalizedLegacyName =
        normalizeStoreText(legacy.productName);
      const product =
        products.find((item) => {
          if (legacy.reference && item.sku?.trim()) {
            return (
              item.sku.trim().toLocaleLowerCase() ===
              legacy.reference.toLocaleLowerCase()
            );
          }

          return [item.name_fr, item.name_nl, item.name_en]
            .filter(
              (value): value is string =>
                Boolean(value?.trim())
            )
            .some(
              (value) =>
                normalizeStoreText(value) ===
                normalizedLegacyName
            );
        }) ?? null;

      return [{
        product,
        productName: legacy.productName,
        reference: legacy.reference,
        quantity: 1,
      }];
    }

    return starts.map(({ line, index }, itemIndex) => {
      const nextStart =
        starts[itemIndex + 1]?.index ?? lines.length;
      const block = lines.slice(index, nextStart);
      const productName = line
        .replace(/^\d+\.\s+/, "")
        .trim();
      const quantityLine = block.find((value) =>
        /^(?:Quantité|Aantal|Quantity|Menge|Cantidad|Quantità|Quantidade|الكمية|Miktar|数量)\s*[:：]/i.test(value)
      );
      const referenceLine = block.find((value) =>
        /^(?:Référence|Referentie|Reference|Referenz|Referencia|Riferimento|Referência|المرجع|Referans|参考)\s*[:：]/i.test(value)
      );
      const quantity = Math.max(
        1,
        Number.parseInt(
          quantityLine?.match(/:\s*(\d+)/)?.[1] ?? "1",
          10
        ) || 1
      );
      const reference =
        referenceLine
          ?.replace(
            /^(?:Référence|Referentie|Reference|Referenz|Referencia|Riferimento|Referência|المرجع|Referans|参考)\s*[:：]\s*/i,
            ""
          )
          .trim() ?? "";
      const normalizedName = normalizeStoreText(productName);
      const product =
        products.find((item) => {
          if (reference && item.sku?.trim()) {
            return (
              item.sku.trim().toLocaleLowerCase() ===
              reference.toLocaleLowerCase()
            );
          }

          return [item.name_fr, item.name_nl, item.name_en]
            .filter(
              (value): value is string =>
                Boolean(value?.trim())
            )
            .some(
              (value) =>
                normalizeStoreText(value) === normalizedName
            );
        }) ?? null;

      return {
        product,
        productName: product
          ? getLocalizedProductName(product)
          : productName,
        reference: product?.sku?.trim() || reference,
        quantity,
      };
    });
  };

  const loadStoreRequests =
    async () => {
      setRequestsLoading(true);
      setRequestMessage("");

      const { data, error } =
        await supabase
          .from("quote_requests")
          .select(
            "id, user_id, name, email, phone, company, message, status, admin_reply, preferred_language, created_at"
          )
          .eq(
            "service",
            "TSB Store"
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

      if (error) {
        console.error(
          "Erreur chargement demandes Store :",
          error
        );

        setStoreRequests([]);
        setRequestMessage(
          tr(
            "Impossible de charger les demandes Store.",
            "De Store-aanvragen konden niet worden geladen.",
            "Unable to load Store requests."
          )
        );
        setRequestsLoading(false);
        return;
      }

      setStoreRequests(
        (data ?? []) as StoreRequest[]
      );
      setRequestsLoading(false);
    };

  const updateStoreRequestStatus =
    async (
      requestId: string,
      nextStatus: string
    ) => {
      if (requestUpdatingId) {
        return;
      }

      setRequestUpdatingId(
        requestId
      );
      setRequestMessage("");

      const { error } =
        await supabase
          .from("quote_requests")
          .update({
            status: nextStatus,
          })
          .eq("id", requestId);

      setRequestUpdatingId(null);

      if (error) {
        console.error(
          "Erreur statut demande Store :",
          error
        );

        setRequestMessage(
          tr(
            "Impossible de modifier le statut de la demande.",
            "De status van de aanvraag kon niet worden gewijzigd.",
            "Unable to update the request status."
          )
        );
        return;
      }

      setStoreRequests(
        (previous) =>
          previous.map(
            (request) =>
              request.id ===
              requestId
                ? {
                    ...request,
                    status:
                      nextStatus,
                  }
                : request
          )
      );

      setRequestMessage(
        tr(
          "Statut de la demande mis à jour.",
          "Status van de aanvraag bijgewerkt.",
          "Request status updated."
        )
      );
    };

  const getOrderStatusLabel = (
    status: string
  ) => {
    switch (status) {
      case "confirmed":
        return tr(
          "Confirmée",
          "Bevestigd",
          "Confirmed"
        );
      case "processing":
        return tr(
          "En préparation",
          "In verwerking",
          "Processing"
        );
      case "ready":
        return tr(
          "Prête",
          "Klaar",
          "Ready"
        );
      case "completed":
        return tr(
          "Terminée",
          "Afgerond",
          "Completed"
        );
      case "cancelled":
        return tr(
          "Annulée",
          "Geannuleerd",
          "Cancelled"
        );
      default:
        return tr(
          "Brouillon",
          "Concept",
          "Draft"
        );
    }
  };

  const loadStoreInvoices =
    async () => {
      const [
        invoicesResult,
        itemsResult,
      ] = await Promise.all([
        supabase
          .from("store_invoices")
          .select(
            "id, invoice_number, order_id, user_id, order_number, product_id, product_name, sku, quantity, unit_price, subtotal_amount, discount_amount, fees_amount, tax_rate, tax_amount, total_amount, currency, customer_name, customer_email, customer_phone, company, preferred_language, status, payment_status, issue_date, due_date, notes, created_at, updated_at"
          )
          .order("created_at", {
            ascending: false,
          }),
        supabase
          .from("store_invoice_items")
          .select(
            "id, invoice_id, product_id, product_name, sku, quantity, unit_price, currency, subtotal_amount, sort_order"
          )
          .order("sort_order", {
            ascending: true,
          }),
      ]);

      if (invoicesResult.error) {
        console.error(
          "Erreur chargement factures Store :",
          invoicesResult.error
        );
        return;
      }

      if (itemsResult.error) {
        console.error(
          "Erreur chargement lignes factures Store :",
          itemsResult.error
        );
        setStoreInvoiceItems([]);
      } else {
        setStoreInvoiceItems(
          (itemsResult.data ??
            []) as StoreInvoiceItem[]
        );
      }

      setStoreInvoices(
        (invoicesResult.data ??
          []) as StoreInvoice[]
      );
    };


  const getInvoiceStatusLabel = (
    invoice: StoreInvoice
  ) => {
    switch (invoice.status) {
      case "issued":
        return tr(
          "Émise",
          "Uitgegeven",
          "Issued"
        );
      case "cancelled":
        return tr(
          "Annulée",
          "Geannuleerd",
          "Cancelled"
        );
      default:
        return tr(
          "Brouillon",
          "Concept",
          "Draft"
        );
    }
  };

  const getInvoicePaymentStatusLabel = (
    status: StoreInvoice["payment_status"]
  ) => {
    switch (status) {
      case "partially_paid":
        return tr(
          "Partiellement payé",
          "Gedeeltelijk betaald",
          "Partially paid"
        );
      case "paid":
        return tr(
          "Payé",
          "Betaald",
          "Paid"
        );
      case "refunded":
        return tr(
          "Remboursé",
          "Terugbetaald",
          "Refunded"
        );
      default:
        return tr(
          "Non payé",
          "Onbetaald",
          "Unpaid"
        );
    }
  };

  const getLocalDateInputValue = (
    value: Date
  ) => {
    const year =
      value.getFullYear();
    const month = String(
      value.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      value.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getInvoiceDueDateFromDays =
    (days: number) => {
      const dueDate =
        new Date();

      dueDate.setDate(
        dueDate.getDate() +
          days
      );

      return getLocalDateInputValue(
        dueDate
      );
    };

  const getDefaultInvoiceDueDate =
    () =>
      getInvoiceDueDateFromDays(
        30
      );

  const updateInvoiceDueDate =
    async (
      invoice: StoreInvoice,
      dueDate: string
    ) => {
      if (
        invoice.status !== "draft" ||
        invoiceUpdatingId
      ) {
        return;
      }

      setInvoiceUpdatingId(
        invoice.id
      );
      setInvoiceMessage("");

      const { data, error } =
        await supabase
          .from("store_invoices")
          .update({
            due_date:
              dueDate || null,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", invoice.id)
          .select(
            "id, invoice_number, order_id, user_id, order_number, product_id, product_name, sku, quantity, unit_price, subtotal_amount, discount_amount, fees_amount, tax_rate, tax_amount, total_amount, currency, customer_name, customer_email, customer_phone, company, preferred_language, status, payment_status, issue_date, due_date, notes, created_at, updated_at"
          )
          .single();

      setInvoiceUpdatingId(
        null
      );

      if (error) {
        console.error(
          "Erreur échéance facture :",
          error
        );

        setInvoiceMessage(
          tr(
            "Impossible de modifier la date d’échéance.",
            "De vervaldatum kon niet worden gewijzigd.",
            "Unable to update the due date."
          )
        );
        return;
      }

      const updatedInvoice =
        data as StoreInvoice;

      setStoreInvoices(
        (previous) =>
          previous.map(
            (current) =>
              current.id ===
              updatedInvoice.id
                ? updatedInvoice
                : current
          )
      );

      setInvoiceMessage(
        tr(
          "Date d’échéance enregistrée.",
          "Vervaldatum opgeslagen.",
          "Due date saved."
        )
      );
    };

  const issueStoreInvoice =
    async (
      invoice: StoreInvoice
    ) => {
      if (
        invoice.status !== "draft" ||
        invoiceUpdatingId
      ) {
        return;
      }

      const issueDate =
        getLocalDateInputValue(
          new Date()
        );

      const dueDate =
        invoice.due_date ||
        getDefaultInvoiceDueDate();

      setInvoiceUpdatingId(
        invoice.id
      );
      setInvoiceMessage("");

      const { data, error } =
        await supabase
          .from("store_invoices")
          .update({
            status: "issued",
            issue_date:
              issueDate,
            due_date:
              dueDate,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", invoice.id)
          .select(
            "id, invoice_number, order_id, user_id, order_number, product_id, product_name, sku, quantity, unit_price, subtotal_amount, discount_amount, fees_amount, tax_rate, tax_amount, total_amount, currency, customer_name, customer_email, customer_phone, company, preferred_language, status, payment_status, issue_date, due_date, notes, created_at, updated_at"
          )
          .single();

      setInvoiceUpdatingId(
        null
      );

      if (error) {
        console.error(
          "Erreur émission facture :",
          error
        );

        setInvoiceMessage(
          tr(
            "Impossible d’émettre la facture.",
            "De factuur kon niet worden uitgegeven.",
            "Unable to issue the invoice."
          )
        );
        return;
      }

      const updatedInvoice =
        data as StoreInvoice;

      setStoreInvoices(
        (previous) =>
          previous.map(
            (current) =>
              current.id ===
              updatedInvoice.id
                ? updatedInvoice
                : current
          )
      );

      setInvoiceMessage(
        tr(
          `Facture ${updatedInvoice.invoice_number} émise.`,
          `Factuur ${updatedInvoice.invoice_number} uitgegeven.`,
          `Invoice ${updatedInvoice.invoice_number} issued.`
        )
      );
    };

  const updateInvoicePaymentStatus =
    async (
      invoice: StoreInvoice,
      nextStatus: StoreInvoice["payment_status"]
    ) => {
      if (
        invoice.status !== "issued" ||
        invoiceUpdatingId
      ) {
        return;
      }

      setInvoiceUpdatingId(
        invoice.id
      );
      setInvoiceMessage("");

      const { data, error } =
        await supabase
          .from("store_invoices")
          .update({
            payment_status:
              nextStatus,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", invoice.id)
          .select(
            "id, invoice_number, order_id, user_id, order_number, product_id, product_name, sku, quantity, unit_price, subtotal_amount, discount_amount, fees_amount, tax_rate, tax_amount, total_amount, currency, customer_name, customer_email, customer_phone, company, preferred_language, status, payment_status, issue_date, due_date, notes, created_at, updated_at"
          )
          .single();

      setInvoiceUpdatingId(
        null
      );

      if (error) {
        console.error(
          "Erreur statut paiement facture :",
          error
        );

        setInvoiceMessage(
          tr(
            "Impossible de modifier le statut du paiement.",
            "De betalingsstatus kon niet worden gewijzigd.",
            "Unable to update the payment status."
          )
        );
        return;
      }

      const updatedInvoice =
        data as StoreInvoice;

      setStoreInvoices(
        (previous) =>
          previous.map(
            (current) =>
              current.id ===
              updatedInvoice.id
                ? updatedInvoice
                : current
          )
      );

      setInvoiceMessage(
        tr(
          "Statut du paiement mis à jour.",
          "Betalingsstatus bijgewerkt.",
          "Payment status updated."
        )
      );
    };

  const updateInvoiceVatRate =
    async (
      invoice: StoreInvoice,
      nextRate: number
    ) => {
      if (
        invoice.status !== "draft" ||
        invoiceVatUpdatingId
      ) {
        return;
      }

      const taxableBase =
        Math.max(
          invoice.subtotal_amount -
            invoice.discount_amount +
            invoice.fees_amount,
          0
        );

      const taxAmount =
        Number(
          (
            taxableBase *
            (nextRate / 100)
          ).toFixed(2)
        );

      const totalAmount =
        Number(
          (
            taxableBase +
            taxAmount
          ).toFixed(2)
        );

      setInvoiceVatUpdatingId(
        invoice.id
      );
      setInvoiceMessage("");

      const { data, error } =
        await supabase
          .from("store_invoices")
          .update({
            tax_rate:
              nextRate,
            tax_amount:
              taxAmount,
            total_amount:
              totalAmount,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            invoice.id
          )
          .select(
            "id, invoice_number, order_id, user_id, order_number, product_id, product_name, sku, quantity, unit_price, subtotal_amount, discount_amount, fees_amount, tax_rate, tax_amount, total_amount, currency, customer_name, customer_email, customer_phone, company, preferred_language, status, payment_status, issue_date, due_date, notes, created_at, updated_at"
          )
          .single();

      setInvoiceVatUpdatingId(
        null
      );

      if (error) {
        console.error(
          "Erreur mise à jour TVA facture :",
          error
        );

        setInvoiceMessage(
          tr(
            "Impossible de modifier la TVA.",
            "De btw kon niet worden gewijzigd.",
            "Unable to update VAT."
          )
        );
        return;
      }

      const updatedInvoice =
        data as StoreInvoice;

      setStoreInvoices(
        (previous) =>
          previous.map(
            (current) =>
              current.id ===
              updatedInvoice.id
                ? updatedInvoice
                : current
          )
      );

      setInvoiceMessage(
        tr(
          `TVA mise à jour à ${nextRate} %.`,
          `Btw bijgewerkt naar ${nextRate} %.`,
          `VAT updated to ${nextRate}%.`
        )
      );
    };

  const createInvoiceFromOrder =
    async (order: StoreOrder) => {
      if (invoiceCreatingOrderId) {
        return;
      }

      const orderItems =
        storeOrderItems
          .filter(
            (item) =>
              item.order_id === order.id
          )
          .sort(
            (a, b) =>
              a.sort_order -
              b.sort_order
          );

      const invoiceSourceItems =
        orderItems.length > 0
          ? orderItems
          : [
              {
                id: `legacy-${order.id}`,
                order_id: order.id,
                product_id:
                  order.product_id,
                product_name:
                  order.product_name,
                sku: order.sku,
                quantity:
                  order.quantity,
                unit_price:
                  order.unit_price,
                currency:
                  order.currency,
                line_total:
                  order.unit_price ==
                  null
                    ? null
                    : order.unit_price *
                      order.quantity,
                sort_order: 0,
              } as StoreOrderItem,
            ];

      const missingPrice =
        invoiceSourceItems.some(
          (item) =>
            item.unit_price == null
        );

      if (missingPrice) {
        setInvoiceMessage(
          tr(
            invoiceSourceItems.length > 1
              ? "Ajoutez d’abord le prix de chaque produit avant de créer la facture."
              : "Ajoutez d’abord un prix à la commande.",
            invoiceSourceItems.length > 1
              ? "Voeg eerst de prijs van elk product toe voordat u de factuur aanmaakt."
              : "Voeg eerst een prijs toe aan de bestelling.",
            invoiceSourceItems.length > 1
              ? "Add a price for each product before creating the invoice."
              : "Add a price to the order first."
          )
        );
        return;
      }

      const existingInvoice =
        storeInvoices.find(
          (invoice) =>
            invoice.order_id ===
            order.id
        );

      if (existingInvoice) {
        setInvoiceMessage(
          tr(
            `Une facture existe déjà : ${existingInvoice.invoice_number}.`,
            `Er bestaat al een factuur: ${existingInvoice.invoice_number}.`,
            `An invoice already exists: ${existingInvoice.invoice_number}.`
          )
        );
        return;
      }

      const subtotal =
        invoiceSourceItems.reduce(
          (total, item) =>
            total +
            (item.unit_price ?? 0) *
              item.quantity,
          0
        );

      const taxRate = 0;
      const taxAmount = 0;
      const total =
        Math.max(
          subtotal -
            (order.discount_amount ??
              0) +
            (order.fees_amount ?? 0) +
            taxAmount,
          0
        );

      const firstItem =
        invoiceSourceItems[0];

      setInvoiceCreatingOrderId(
        order.id
      );
      setInvoiceMessage("");

      try {
        const { data, error } =
          await supabase
            .from("store_invoices")
            .insert({
              order_id: order.id,
              user_id: order.user_id,
              order_number:
                order.order_number,
              product_id:
                invoiceSourceItems.length ===
                1
                  ? firstItem
                      .product_id
                  : null,
              product_name:
                invoiceSourceItems.length >
                1
                  ? `TSB Store · ${invoiceSourceItems.length} produits`
                  : firstItem
                      .product_name,
              sku:
                invoiceSourceItems.length ===
                1
                  ? firstItem.sku
                  : null,
              quantity:
                invoiceSourceItems.length ===
                1
                  ? firstItem.quantity
                  : 1,
              unit_price:
                invoiceSourceItems.length ===
                1
                  ? firstItem.unit_price
                  : subtotal,
              subtotal_amount:
                subtotal,
              discount_amount:
                order.discount_amount ??
                0,
              fees_amount:
                order.fees_amount ??
                0,
              tax_rate: taxRate,
              tax_amount:
                taxAmount,
              total_amount: total,
              currency:
                order.currency,
              customer_name:
                order.customer_name,
              customer_email:
                order.customer_email,
              customer_phone:
                order.customer_phone,
              company:
                order.company,
              preferred_language:
                locale,
              status: "draft",
              payment_status:
                "unpaid",
              due_date:
                getDefaultInvoiceDueDate(),
              notes:
                order.notes,
            })
            .select(
              "id, invoice_number, order_id, user_id, order_number, product_id, product_name, sku, quantity, unit_price, subtotal_amount, discount_amount, fees_amount, tax_rate, tax_amount, total_amount, currency, customer_name, customer_email, customer_phone, company, preferred_language, status, payment_status, issue_date, due_date, notes, created_at, updated_at"
            )
            .single();

        if (error) {
          console.error(
            "Erreur création facture :",
            error
          );

          setInvoiceMessage(
            error.code === "23505"
              ? tr(
                  "Une facture existe déjà pour cette commande.",
                  "Er bestaat al een factuur voor deze bestelling.",
                  "An invoice already exists for this order."
                )
              : tr(
                  "Impossible de créer la facture.",
                  "De factuur kon niet worden aangemaakt.",
                  "Unable to create the invoice."
                )
          );
          return;
        }

        const invoice =
          data as StoreInvoice;

        const invoiceRows =
          invoiceSourceItems.map(
            (item, index) => ({
              invoice_id:
                invoice.id,
              product_id:
                item.product_id,
              product_name:
                item.product_name,
              sku: item.sku,
              quantity:
                item.quantity,
              unit_price:
                item.unit_price as number,
              currency:
                order.currency,
              sort_order: index,
            })
          );

        const {
          data: createdItems,
          error: itemsError,
        } = await supabase
          .from("store_invoice_items")
          .insert(invoiceRows)
          .select(
            "id, invoice_id, product_id, product_name, sku, quantity, unit_price, currency, subtotal_amount, sort_order"
          );

        if (itemsError) {
          console.error(
            "Erreur lignes facture Store :",
            itemsError
          );

          await supabase
            .from("store_invoices")
            .delete()
            .eq("id", invoice.id);

          setInvoiceMessage(
            tr(
              "La facture n’a pas pu être finalisée avec ses produits.",
              "De factuur kon niet met de producten worden voltooid.",
              "The invoice could not be completed with its products."
            )
          );
          return;
        }

        setStoreInvoices(
          (previous) => [
            invoice,
            ...previous,
          ]
        );

        setStoreInvoiceItems(
          (previous) => [
            ...((createdItems ??
              []) as StoreInvoiceItem[]),
            ...previous,
          ]
        );

        setInvoiceMessage(
          tr(
            `Brouillon de facture créé : ${invoice.invoice_number}.`,
            `Factuurconcept aangemaakt: ${invoice.invoice_number}.`,
            `Invoice draft created: ${invoice.invoice_number}.`
          )
        );
      } finally {
        setInvoiceCreatingOrderId(
          null
        );
      }
    };


  const downloadStoreInvoicePdf = async (
    invoice: StoreInvoice
  ) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;

    const invoiceLanguage: LocaleCode =
      locale;

    const isArabicPdf =
      invoiceLanguage === "ar";

    const arabicPdfFontFamily =
      isArabicPdf
        ? await registerArabicPdfFont(
            doc
          )
        : "helvetica";

    const arabicPdfPattern =
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/u;

    const containsArabicPdfText = (
      value: unknown
    ) =>
      isArabicPdf &&
      arabicPdfPattern.test(
        Array.isArray(value)
          ? value.join(" ")
          : String(value ?? "")
      );

    const pdfText = (
      value: string | string[],
      x: number,
      y: number,
      options?: any
    ) => {
      const currentStyle =
        doc.getFont().fontStyle ||
        "normal";

      if (Array.isArray(value)) {
        const lineHeight =
          (doc.getFontSize() *
            doc.getLineHeightFactor()) /
          doc.internal.scaleFactor;

        value.forEach(
          (line, index) =>
            pdfText(
              line,
              x,
              y + index * lineHeight,
              options
            )
        );

        return doc;
      }

      const rawText =
        String(value ?? "");

      const hasArabic =
        containsArabicPdfText(rawText);

      const hasLatinLetters =
        /[A-Za-z]/.test(rawText);

      if (
        hasArabic &&
        hasLatinLetters
      ) {
        const runs =
          rawText.match(
            /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+|[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/gu
          ) ?? [rawText];

        const widths = runs.map(
          (run) => {
            const isArabicRun =
              containsArabicPdfText(
                run
              );

            doc.setR2L(
              isArabicRun
            );
            doc.setFont(
              isArabicRun
                ? arabicPdfFontFamily
                : "helvetica",
              currentStyle
            );

            return doc.getTextWidth(
              run
            );
          }
        );

        const totalWidth =
          widths.reduce(
            (sum, width) =>
              sum + width,
            0
          );

        const align =
          options?.align ?? "left";

        let cursor =
          align === "right"
            ? x
            : align === "center"
              ? x + totalWidth / 2
              : x;

        if (
          align === "right" ||
          align === "center"
        ) {
          runs.forEach(
            (run, index) => {
              const isArabicRun =
                containsArabicPdfText(
                  run
                );
              const width =
                widths[index];

              doc.setR2L(
                isArabicRun
              );
              doc.setFont(
                isArabicRun
                  ? arabicPdfFontFamily
                  : "helvetica",
                currentStyle
              );

              if (isArabicRun) {
                doc.text(
                  run,
                  cursor,
                  y,
                  {
                    ...options,
                    align: "right",
                  }
                );
              } else {
                doc.text(
                  run,
                  cursor - width,
                  y,
                  {
                    ...options,
                    align: "left",
                  }
                );
              }

              cursor -= width;
            }
          );
        } else {
          runs.forEach(
            (run, index) => {
              const isArabicRun =
                containsArabicPdfText(
                  run
                );
              const width =
                widths[index];

              doc.setR2L(
                isArabicRun
              );
              doc.setFont(
                isArabicRun
                  ? arabicPdfFontFamily
                  : "helvetica",
                currentStyle
              );

              if (isArabicRun) {
                doc.text(
                  run,
                  cursor + width,
                  y,
                  {
                    ...options,
                    align: "right",
                  }
                );
              } else {
                doc.text(
                  run,
                  cursor,
                  y,
                  {
                    ...options,
                    align: "left",
                  }
                );
              }

              cursor += width;
            }
          );
        }

        doc.setR2L(false);
        doc.setFont(
          "helvetica",
          currentStyle
        );

        return doc;
      }

      doc.setR2L(hasArabic);
      doc.setFont(
        hasArabic
          ? arabicPdfFontFamily
          : "helvetica",
        currentStyle
      );

      doc.text(
        rawText,
        x,
        y,
        options
      );

      doc.setR2L(false);

      return doc;
    };

    const splitPdfTextToSize = (
      value: string,
      width: number
    ) => {
      const currentStyle =
        doc.getFont().fontStyle ||
        "normal";
      const hasArabic =
        containsArabicPdfText(
          value
        );

      doc.setR2L(hasArabic);
      doc.setFont(
        hasArabic
          ? arabicPdfFontFamily
          : "helvetica",
        currentStyle
      );

      const lines =
        doc.splitTextToSize(
          value,
          width
        );

      doc.setR2L(false);

      return lines;
    };

    const applyPdfTableCellLanguage = (
      data: any
    ) => {
      const cellText =
        Array.isArray(
          data.cell.text
        )
          ? data.cell.text.join(
              " "
            )
          : String(
              data.cell.text ??
                data.cell.raw ??
                ""
            );

      const hasArabic =
        containsArabicPdfText(
          cellText
        );

      data.cell.styles.font =
        hasArabic
          ? arabicPdfFontFamily
          : "helvetica";

      if (
        hasArabic &&
        data.cell.styles.halign !==
          "center"
      ) {
        data.cell.styles.halign =
          "right";
      }
    };

    doc.setR2L(false);

    const it = (
      fr: string,
      nl: string,
      en: string
    ) =>
      trForLocale(
        invoiceLanguage,
        fr,
        nl,
        en
      );

    const invoiceIntlLocale =
      getLocaleConfig(
        invoiceLanguage
      ).intlLocale;

    const money = (
      amount: number,
      currency = invoice.currency
    ) =>
      new Intl.NumberFormat(invoiceIntlLocale, {
        style: "currency",
        currency,
      }).format(amount);

    const formatPdfDate = (
      value: string | null
    ) => {
      if (!value) {
        return "-";
      }

      const date =
        value.includes("T")
          ? new Date(value)
          : new Date(
              `${value}T12:00:00`
            );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "-";
      }

      const day = String(
        date.getDate()
      ).padStart(2, "0");

      const month = String(
        date.getMonth() + 1
      ).padStart(2, "0");

      const year = String(
        date.getFullYear()
      );

      return `${day}/${month}/${year}`;
    };

    const invoiceDate = (
      value: string | null
    ) =>
      formatPdfDate(value);

    const createdDate =
      formatPdfDate(
        invoice.created_at
      );

    const documentDate = invoice.issue_date
      ? invoiceDate(invoice.issue_date)
      : createdDate;

    const invoiceStatusText =
      invoice.status === "issued"
        ? it("Émise", "Uitgegeven", "Issued")
        : invoice.status === "cancelled"
          ? it("Annulée", "Geannuleerd", "Cancelled")
          : it("Brouillon", "Concept", "Draft");

    const paymentStatusText =
      invoice.payment_status === "paid"
        ? it("Payé", "Betaald", "Paid")
        : invoice.payment_status === "partially_paid"
          ? it(
              "Partiellement payé",
              "Gedeeltelijk betaald",
              "Partially paid"
            )
          : invoice.payment_status === "refunded"
            ? it("Remboursé", "Terugbetaald", "Refunded")
            : it("Non payé", "Onbetaald", "Unpaid");

    const paymentColor: [number, number, number] =
      invoice.payment_status === "paid"
        ? [22, 163, 74]
        : invoice.payment_status === "partially_paid"
          ? [245, 158, 11]
          : invoice.payment_status === "refunded"
            ? [37, 99, 235]
            : [220, 38, 38];

    const invoiceItems = storeInvoiceItems
      .filter((item) => item.invoice_id === invoice.id)
      .sort((a, b) => a.sort_order - b.sort_order);

    const relatedOrderItems = storeOrderItems
      .filter((item) => item.order_id === invoice.order_id)
      .sort((a, b) => a.sort_order - b.sort_order);

    const rows =
      invoiceItems.length > 0
        ? invoiceItems.map((item) => [
            getLocalizedStoredOrderProductName(
              item.product_name,
              item.product_id,
              item.sku
            ),
            item.sku ?? "-",
            String(item.quantity),
            money(item.unit_price, item.currency || invoice.currency),
            money(
              item.subtotal_amount,
              item.currency || invoice.currency
            ),
          ])
        : relatedOrderItems.length > 0
          ? relatedOrderItems.map((item) => [
              getLocalizedStoredOrderProductName(
                item.product_name,
                item.product_id,
                item.sku
              ),
              item.sku ?? "-",
              String(item.quantity),
              money(
                item.unit_price ?? 0,
                item.currency || invoice.currency
              ),
              money(
                (item.unit_price ?? 0) * item.quantity,
                item.currency || invoice.currency
              ),
            ])
          : [
              [
                getLocalizedStoredOrderProductName(
                  invoice.product_name,
                  invoice.product_id,
                  invoice.sku
                ),
                invoice.sku ?? "-",
                String(invoice.quantity),
                money(invoice.unit_price),
                money(invoice.subtotal_amount),
              ],
            ];

    // ==================================================
    // HEADER VALIDÉ — TSB TECH GROUP
    // ==================================================
    doc.setFillColor(13, 17, 23);
    doc.rect(0, 0, pageWidth, 39, "F");
    doc.setFillColor(0, 112, 255);
    doc.rect(0, 38.2, pageWidth, 0.8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);

    const logoX = margin;
    const logoY = 12.5;

    doc.setTextColor(235, 235, 235);
    pdfText("T", logoX, logoY);
    const tW = doc.getTextWidth("T");

    doc.setTextColor(0, 112, 255);
    pdfText("S", logoX + tW, logoY);
    const sW = doc.getTextWidth("S");

    doc.setTextColor(235, 235, 235);
    pdfText("B", logoX + tW + sW, logoY);
    const bW = doc.getTextWidth("B");

    doc.setFontSize(12.8);
    const techX = logoX + tW + sW + bW + 4;
    doc.setTextColor(0, 112, 255);
    pdfText("TECH", techX, logoY);
    const techW = doc.getTextWidth("TECH");

    doc.setTextColor(235, 235, 235);
    pdfText("GROUP", techX + techW + 2.3, logoY);

    doc.setFontSize(8.6);
    doc.setTextColor(255, 255, 255);
    pdfText("UNE SEULE VISION,", margin, 21.5);
    const mottoW = doc.getTextWidth("UNE SEULE VISION,");
    doc.setTextColor(0, 212, 255);
    pdfText(
      " DES SOLUTIONS ILLIMITEES.",
      margin + mottoW,
      21.5
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(210, 215, 222);
    pdfText(
      "tsbtechgroup.com  |  contact@tsbtechgroup.com",
      margin,
      28.8
    );
    pdfText(
      "GSM +32466327536  |  WhatsApp +32493964587",
      margin,
      33.7
    );

    const boxW = 58;
    const boxX = pageWidth - margin - boxW;
    doc.setDrawColor(0, 112, 255);
    doc.setLineWidth(0.45);
    doc.roundedRect(boxX, 5.5, boxW, 27, 2.5, 2.5, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 112, 255);
    pdfText(
      it("FACTURE", "FACTUUR", "INVOICE"),
      boxX + boxW - 4,
      12,
      { align: "right" }
    );
    doc.setFontSize(9);
    pdfText(
      invoice.invoice_number,
      boxX + boxW - 4,
      18.2,
      { align: "right" }
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(225, 225, 225);
    pdfText(
      `${it("Commande", "Bestelling", "Order")}: ${invoice.order_number}`,
      boxX + boxW - 4,
      23.5,
      { align: "right" }
    );
    pdfText(
      `${it("Date", "Datum", "Date")}: ${documentDate}`,
      boxX + boxW - 4,
      28.3,
      { align: "right" }
    );

    // ==================================================
    // CLIENT / INFORMATIONS FACTURE
    // ==================================================
    const infoY = 47;
    const gap = 7;
    const colW = (pageWidth - margin * 2 - gap) / 2;
    const rightX = margin + colW + gap;

    doc.setFillColor(249, 250, 252);
    doc.setDrawColor(218, 224, 232);
    doc.roundedRect(margin, infoY, colW, 40, 2, 2, "FD");
    doc.roundedRect(rightX, infoY, colW, 40, 2, 2, "FD");

    doc.setFillColor(0, 112, 255);

    if (isArabicPdf) {
      doc.rect(
        margin + colW - 1.8,
        infoY,
        1.8,
        40,
        "F"
      );
      doc.rect(
        rightX + colW - 1.8,
        infoY,
        1.8,
        40,
        "F"
      );
    } else {
      doc.rect(
        margin,
        infoY,
        1.8,
        40,
        "F"
      );
      doc.rect(
        rightX,
        infoY,
        1.8,
        40,
        "F"
      );
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.8);
    doc.setTextColor(0, 75, 180);
    pdfText(
      it("CLIENT", "KLANT", "CUSTOMER"),
      isArabicPdf
        ? margin + colW - 6
        : margin + 6,
      infoY + 7,
      isArabicPdf
        ? { align: "right" }
        : undefined
    );
    pdfText(
      it(
        "INFORMATIONS FACTURE",
        "FACTUURGEGEVENS",
        "INVOICE DETAILS"
      ),
      isArabicPdf
        ? rightX + colW - 6
        : rightX + 6,
      infoY + 7,
      isArabicPdf
        ? { align: "right" }
        : undefined
    );

    const clientLines = [
      invoice.customer_name,
      invoice.company ?? "",
      invoice.customer_email,
      invoice.customer_phone ?? "",
    ].filter(Boolean);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.6);
    doc.setTextColor(35, 40, 48);
    clientLines.forEach((line, index) => {
      const wrapped =
        splitPdfTextToSize(
          line,
          colW - 12
        );

      const lineIsArabic =
        containsArabicPdfText(
          line
        );

      pdfText(
        wrapped,
        lineIsArabic
          ? margin + colW - 6
          : margin + 6,
        infoY +
          14 +
          index * 5.3,
        lineIsArabic
          ? { align: "right" }
          : undefined
      );
    });

    const detailLines = [
      `${it("N° facture", "Factuurnr.", "Invoice no.")}: ${invoice.invoice_number}`,
      `${it("Statut", "Status", "Status")}: ${invoiceStatusText}`,
      `${it("Émission", "Uitgiftedatum", "Issue date")}: ${invoiceDate(invoice.issue_date)}`,
      `${it("Échéance", "Vervaldatum", "Due date")}: ${invoiceDate(invoice.due_date)}`,
      `${it("Devise", "Valuta", "Currency")}: ${invoice.currency}`,
    ];

    detailLines.forEach((line, index) =>
      pdfText(
        line,
        isArabicPdf
          ? rightX + colW - 6
          : rightX + 6,
        infoY +
          13 +
          index * 4.5,
        isArabicPdf
          ? { align: "right" }
          : undefined
      )
    );

    doc.setFillColor(
      paymentColor[0],
      paymentColor[1],
      paymentColor[2]
    );
    doc.roundedRect(
      rightX + 6,
      infoY + 31,
      47,
      6,
      2,
      2,
      "F"
    );
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    pdfText(
      paymentStatusText.toUpperCase(),
      rightX + 29.5,
      infoY + 35.1,
      { align: "center" }
    );

    // ==================================================
    // TABLEAU — peut continuer sur plusieurs pages
    // ==================================================
    const pdfTableHead =
      isArabicPdf
        ? [
            [
              it("Sous-total", "Subtotaal", "Subtotal"),
              it("Prix unitaire", "Eenheidsprijs", "Unit price"),
              it("Qté", "Aantal", "Qty"),
              it("Référence", "Referentie", "Reference"),
              it("Produit", "Product", "Product"),
            ],
          ]
        : [
            [
              it("Produit", "Product", "Product"),
              it("Référence", "Referentie", "Reference"),
              it("Qté", "Aantal", "Qty"),
              it("Prix unitaire", "Eenheidsprijs", "Unit price"),
              it("Sous-total", "Subtotaal", "Subtotal"),
            ],
          ];

    const pdfTableRows =
      isArabicPdf
        ? rows.map(
            (row) => [
              row[4],
              row[3],
              row[2],
              row[1],
              row[0],
            ]
          )
        : rows;

    autoTable(doc, {
      startY: 94,
      theme: "grid",
      margin: {
        left: margin,
        right: margin,
        top: 14,
        bottom: 16,
      },
      head: pdfTableHead,
      body: pdfTableRows,
      styles: {
        font: "helvetica",
      },
      didParseCell: applyPdfTableCellLanguage,
      willDrawCell: (data: any) => {
        const cellText =
          Array.isArray(
            data.cell.text
          )
            ? data.cell.text.join(
                " "
              )
            : String(
                data.cell.text ??
                  data.cell.raw ??
                  ""
              );

        doc.setR2L(
          containsArabicPdfText(
            cellText
          )
        );
      },
      didDrawCell: () => {
        doc.setR2L(false);
      },
      headStyles: {
        fillColor: [13, 17, 23],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7.6,
        cellPadding: 3,
      },
      bodyStyles: {
        textColor: [30, 36, 45],
        fontSize: 7.5,
        cellPadding: 3.5,
        lineColor: [218, 224, 232],
      },
      alternateRowStyles: {
        fillColor: [249, 250, 252],
      },
      columnStyles: isArabicPdf
        ? {
            0: {
              cellWidth: 36,
              halign: "right",
            },
            1: {
              cellWidth: 36,
              halign: "right",
            },
            2: {
              cellWidth: 14,
              halign: "center",
            },
            3: {
              cellWidth: 31,
              halign: "center",
            },
            4: {
              cellWidth: 68,
              halign: "right",
            },
          }
        : {
            0: { cellWidth: 68 },
            1: { cellWidth: 31 },
            2: {
              cellWidth: 14,
              halign: "center",
            },
            3: {
              cellWidth: 36,
              halign: "right",
            },
            4: {
              cellWidth: 36,
              halign: "right",
            },
          },
      showHead: "everyPage",
    });

    const tableDoc = doc as jsPDF & {
      lastAutoTable?: { finalY: number };
    };

    let y = (tableDoc.lastAutoTable?.finalY ?? 120) + 8;

    // Si beaucoup de produits, on réserve une nouvelle page
    // pour le récapitulatif final afin de garder la facture propre.
    const summaryRequiredHeight = 105;
    if (y + summaryRequiredHeight > pageHeight - 10) {
      doc.addPage();
      y = 18;
    }

    // ==================================================
    // INFORMATIONS + TOTAUX
    // ==================================================
    const totalW = 77;
    const totalX = pageWidth - margin - totalW;
    const infoW = pageWidth - margin * 2 - totalW - 7;

    doc.setFillColor(249, 250, 252);
    doc.setDrawColor(218, 224, 232);
    doc.roundedRect(
      margin,
      y,
      infoW,
      40,
      2,
      2,
      "FD"
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.3);
    doc.setTextColor(0, 75, 180);
    pdfText(
      it(
        "INFORMATIONS SUPPLÉMENTAIRES",
        "AANVULLENDE INFORMATIE",
        "ADDITIONAL INFORMATION"
      ),
      margin + 5,
      y + 7
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.1);
    doc.setTextColor(50, 58, 68);

    const note =
      invoice.notes?.trim() ||
      it(
        "Merci pour votre confiance. Pour toute question concernant cette facture, contactez TSB Tech Group.",
        "Bedankt voor uw vertrouwen. Neem voor vragen over deze factuur contact op met TSB Tech Group.",
        "Thank you for your trust. For any question about this invoice, contact TSB Tech Group."
      );

    pdfText(
      splitPdfTextToSize(note, infoW - 10),
      margin + 5,
      y + 14
    );

    autoTable(doc, {
      startY: y,
      margin: {
        left: totalX,
        right: margin,
      },
      tableWidth: totalW,
      theme: "plain",
      body: [
        [
          it("Sous-total", "Subtotaal", "Subtotal"),
          money(invoice.subtotal_amount),
        ],
        [
          it("Remise", "Korting", "Discount"),
          `- ${money(invoice.discount_amount)}`,
        ],
        [
          it("Frais", "Kosten", "Fees"),
          money(invoice.fees_amount),
        ],
        [
          `${it("TVA", "BTW", "VAT")} ${invoice.tax_rate}%`,
          money(invoice.tax_amount),
        ],
      ],
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2,
        textColor: [35, 40, 48],
      },
      columnStyles: {
        0: { cellWidth: 41 },
        1: {
          cellWidth: 36,
          halign: "right",
          fontStyle: "bold",
        },
      },
      didParseCell: applyPdfTableCellLanguage,
      willDrawCell: (data: any) => {
        const cellText =
          Array.isArray(
            data.cell.text
          )
            ? data.cell.text.join(
                " "
              )
            : String(
                data.cell.text ??
                  data.cell.raw ??
                  ""
              );

        doc.setR2L(
          containsArabicPdfText(
            cellText
          )
        );
      },
      didDrawCell: () => {
        doc.setR2L(false);
      },
    });

    const totalsDoc = doc as jsPDF & {
      lastAutoTable?: { finalY: number };
    };

    const totalY =
      (totalsDoc.lastAutoTable?.finalY ?? y + 26) + 1;

    doc.setDrawColor(0, 112, 255);
    doc.setLineWidth(0.55);
    doc.line(totalX, totalY, pageWidth - margin, totalY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(0, 75, 180);
    pdfText(
      it("TOTAL À PAYER", "TOTAAL TE BETALEN", "TOTAL DUE"),
      totalX,
      totalY + 8
    );
    doc.setFontSize(11);
    pdfText(
      money(invoice.total_amount),
      pageWidth - margin,
      totalY + 8,
      { align: "right" }
    );

    y = Math.max(y + 45, totalY + 14);

    // ==================================================
    // STATUT PAIEMENT
    // ==================================================
    doc.setFillColor(250, 251, 253);
    doc.setDrawColor(218, 224, 232);
    doc.roundedRect(
      margin,
      y,
      pageWidth - margin * 2,
      13,
      2,
      2,
      "FD"
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(25, 30, 38);
    pdfText(
      it(
        "STATUT DU PAIEMENT",
        "BETALINGSSTATUS",
        "PAYMENT STATUS"
      ),
      margin + 5,
      y + 8
    );

    const statusLabels = [
      {
        key: "unpaid",
        label: it("Non payé", "Onbetaald", "Unpaid"),
      },
      {
        key: "partially_paid",
        label: it(
          "Partiellement payé",
          "Gedeeltelijk betaald",
          "Partially paid"
        ),
      },
      {
        key: "paid",
        label: it("Payé", "Betaald", "Paid"),
      },
      {
        key: "refunded",
        label: it("Remboursé", "Terugbetaald", "Refunded"),
      },
    ];

    const sx = 67;
    const sg = 2;
    const sw = (pageWidth - margin - sx - 3 - sg * 3) / 4;

    statusLabels.forEach((item, index) => {
      const x = sx + index * (sw + sg);
      const active = invoice.payment_status === item.key;

      if (active) {
        doc.setFillColor(
          paymentColor[0],
          paymentColor[1],
          paymentColor[2]
        );
        doc.setDrawColor(
          paymentColor[0],
          paymentColor[1],
          paymentColor[2]
        );
      } else {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(205, 214, 225);
      }

      doc.roundedRect(x, y + 3, sw, 7, 1.7, 1.7, "FD");
      doc.setFont(
        "helvetica",
        active ? "bold" : "normal"
      );
      doc.setFontSize(6.2);
      doc.setTextColor(
        active ? 255 : 75,
        active ? 255 : 85,
        active ? 255 : 100
      );
      pdfText(
        item.label,
        x + sw / 2,
        y + 7.5,
        { align: "center" }
      );
    });

    y += 19;

    // ==================================================
    // COORDONNÉES CONFIRMÉES UNIQUEMENT
    // ==================================================
    if (y + 38 > pageHeight - 12) {
      doc.addPage();
      y = 18;
    }

    doc.setDrawColor(0, 112, 255);
    doc.setLineWidth(0.35);
    doc.roundedRect(
      margin,
      y,
      pageWidth - margin * 2,
      31,
      2.2,
      2.2,
      "S"
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 75, 180);
    pdfText(
      "TSB TECH GROUP",
      pageWidth / 2,
      y + 7,
      { align: "center" }
    );

    const contactCols = [
      ["SITE", "tsbtechgroup.com"],
      ["EMAIL", "contact@tsbtechgroup.com"],
      ["GSM", "+32466327536"],
      ["WHATSAPP", "+32493964587"],
      ["TIKTOK", "www.tiktok.com/@ib50293"],
    ];

    const contactW =
      (pageWidth - margin * 2 - 8) / contactCols.length;

    contactCols.forEach((item, index) => {
      const x =
        margin + 4 + contactW * index + contactW / 2;

      if (index > 0) {
        doc.setDrawColor(210, 218, 228);
        doc.line(
          margin + 4 + contactW * index,
          y + 11,
          margin + 4 + contactW * index,
          y + 26
        );
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.3);
      doc.setTextColor(0, 75, 180);
      pdfText(item[0], x, y + 15, {
        align: "center",
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.8);
      doc.setTextColor(35, 40, 48);

      const wrapped = splitPdfTextToSize(
        item[1],
        contactW - 3
      );

      pdfText(wrapped, x, y + 21, {
        align: "center",
      });
    });

    // ==================================================
    // FOOTER SIMPLE
    // ==================================================
    const footerY = y + 36;
    doc.setFillColor(0, 75, 180);
    doc.rect(
      0,
      footerY,
      pageWidth,
      12,
      "F"
    );
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.6);
    doc.setTextColor(255, 255, 255);
    pdfText(
      "UNE SEULE VISION, DES SOLUTIONS ILLIMITEES.",
      pageWidth / 2,
      footerY + 7.5,
      { align: "center" }
    );

    doc.save(`${invoice.invoice_number}.pdf`);
  };


  const loadStoreOrders =
    async () => {
      setOrdersLoading(true);
      setOrderMessage("");

      const [ordersResult, itemsResult] = await Promise.all([
        supabase
          .from("store_orders")
          .select(
            "id, order_number, request_id, user_id, product_id, product_name, sku, quantity, unit_price, currency, discount_amount, fees_amount, total_amount, status, customer_name, customer_email, customer_phone, company, notes, preferred_language, created_at, updated_at"
          )
          .order("created_at", { ascending: false }),
        supabase
          .from("store_order_items")
          .select(
            "id, order_id, product_id, product_name, sku, quantity, unit_price, currency, line_total, sort_order"
          )
          .order("sort_order", { ascending: true }),
      ]);

      if (ordersResult.error) {
        console.error(
          "Erreur chargement commandes Store :",
          ordersResult.error
        );
        setStoreOrders([]);
        setStoreOrderItems([]);
        setOrderMessage(
          tr(
            "Impossible de charger les commandes.",
            "De bestellingen konden niet worden geladen.",
            "Unable to load orders."
          )
        );
        setOrdersLoading(false);
        return;
      }

      if (itemsResult.error) {
        console.error(
          "Erreur chargement lignes commandes Store :",
          itemsResult.error
        );
        setStoreOrderItems([]);
      } else {
        setStoreOrderItems(
          (itemsResult.data ?? []) as StoreOrderItem[]
        );
      }

      setStoreOrders(
        (ordersResult.data ?? []) as StoreOrder[]
      );
      setOrdersLoading(false);
    };

  const createOrderFromRequest =
    async (request: StoreRequest) => {
      if (orderCreatingRequestId) {
        return;
      }

      setOrderCreatingRequestId(request.id);
      setOrderMessage("");
      setRequestMessage("");

      try {
        const requestItems =
          getStoreRequestItems(request);

        if (requestItems.length === 0) {
          const message = tr(
            "Aucun produit exploitable dans cette demande.",
            "Geen bruikbaar product gevonden in deze aanvraag.",
            "No usable product was found in this request."
          );
          setOrderMessage(message);
          setRequestMessage(message);
          return;
        }

        const firstItem = requestItems[0];
        const currencies = Array.from(
          new Set(
            requestItems.map(
              (item) =>
                item.product?.currency ??
                "EUR"
            )
          )
        );

        const orderCurrency =
          currencies.length === 1
            ? currencies[0]
            : "EUR";

        const allPricesKnown =
          currencies.length === 1 &&
          requestItems.every(
            (item) =>
              item.product?.price != null
          );

        const basketSubtotal =
          allPricesKnown
            ? requestItems.reduce(
                (total, item) =>
                  total +
                  (item.product?.price ??
                    0) *
                    item.quantity,
                0
              )
            : null;

        const legacyProductName =
          requestItems.length > 1
            ? `TSB Store · ${requestItems.length} produits`
            : firstItem.productName;

        const {
          data,
          error,
        } = await supabase
          .from("store_orders")
          .insert({
            request_id: request.id,
            user_id: request.user_id,
            product_id:
              requestItems.length === 1
                ? firstItem.product?.id ??
                  null
                : null,
            product_name:
              legacyProductName,
            sku:
              requestItems.length === 1
                ? firstItem.reference ||
                  null
                : null,
            quantity: 1,
            unit_price:
              basketSubtotal,
            currency:
              orderCurrency,
            status: "draft",
            customer_name:
              request.name,
            customer_email:
              request.email,
            customer_phone:
              request.phone || null,
            company:
              request.company,
            preferred_language:
              isSupportedLocale(
                request.preferred_language
              )
                ? request.preferred_language
                : "fr",
          })
          .select(
            "id, order_number, request_id, user_id, product_id, product_name, sku, quantity, unit_price, currency, discount_amount, fees_amount, total_amount, status, customer_name, customer_email, customer_phone, company, notes, preferred_language, created_at, updated_at"
          )
          .single();

        if (error) {
          console.error(
            "Erreur création commande Store :",
            error
          );

          const message =
            error.code === "23505"
              ? tr(
                  "Une commande existe déjà pour cette demande.",
                  "Er bestaat al een bestelling voor deze aanvraag.",
                  "An order already exists for this request."
                )
              : tr(
                  `Impossible de créer la commande : ${error.message}`,
                  `De bestelling kon niet worden aangemaakt: ${error.message}`,
                  `Unable to create the order: ${error.message}`
                );

          setOrderMessage(message);
          setRequestMessage(message);
          return;
        }

        const order =
          data as StoreOrder;

        const rows =
          requestItems.map(
            (item, index) => ({
              order_id: order.id,
              product_id:
                item.product?.id ??
                null,
              product_name:
                item.productName,
              sku:
                item.reference ||
                null,
              quantity:
                item.quantity,
              unit_price:
                item.product?.price ??
                null,
              currency:
                item.product
                  ?.currency ??
                orderCurrency,
              sort_order:
                index,
            })
          );

        const {
          data: createdItems,
          error: itemsError,
        } = await supabase
          .from(
            "store_order_items"
          )
          .insert(rows)
          .select(
            "id, order_id, product_id, product_name, sku, quantity, unit_price, currency, line_total, sort_order"
          );

        if (itemsError) {
          console.error(
            "Erreur lignes commande Store :",
            itemsError
          );

          const {
            error: rollbackError,
          } = await supabase
            .from("store_orders")
            .delete()
            .eq("id", order.id);

          if (rollbackError) {
            console.error(
              "Erreur annulation commande incomplète :",
              rollbackError
            );
          }

          const message = tr(
            `La commande n’a pas pu être finalisée : ${itemsError.message}`,
            `De bestelling kon niet worden voltooid: ${itemsError.message}`,
            `The order could not be completed: ${itemsError.message}`
          );

          setOrderMessage(message);
          setRequestMessage(message);
          return;
        }

        setStoreOrders(
          (previous) => [
            order,
            ...previous,
          ]
        );

        setStoreOrderItems(
          (previous) => [
            ...((createdItems ??
              []) as StoreOrderItem[]),
            ...previous,
          ]
        );

        const successMessage =
          tr(
            requestItems.length > 1
              ? `Commande ${order.order_number} créée avec ${requestItems.length} produits.`
              : `Commande ${order.order_number} créée avec succès.`,
            requestItems.length > 1
              ? `Bestelling ${order.order_number} aangemaakt met ${requestItems.length} producten.`
              : `Bestelling ${order.order_number} succesvol aangemaakt.`,
            requestItems.length > 1
              ? `Order ${order.order_number} created with ${requestItems.length} products.`
              : `Order ${order.order_number} created successfully.`
          );

        setOrderMessage(
          successMessage
        );
        setRequestMessage(
          successMessage
        );

        await loadStoreOrders();
        setActiveStoreView(
          "orders"
        );
      } catch (caughtError) {
        console.error(
          "Erreur inattendue création commande Store :",
          caughtError
        );

        const detail =
          caughtError instanceof Error
            ? caughtError.message
            : String(
                caughtError
              );

        const message = tr(
          `Erreur pendant la création de la commande : ${detail}`,
          `Fout tijdens het aanmaken van de bestelling: ${detail}`,
          `Error while creating the order: ${detail}`
        );

        setOrderMessage(message);
        setRequestMessage(message);
      } finally {
        setOrderCreatingRequestId(
          null
        );
      }
    };

  const updateStoreOrderStatus =
    async (
      orderId: string,
      nextStatus: string
    ) => {
      if (orderUpdatingId) {
        return;
      }

      const currentOrder =
        storeOrders.find(
          (order) =>
            order.id === orderId
        );

      if (
        nextStatus === "confirmed" &&
        currentOrder?.unit_price == null
      ) {
        setOrderMessage(
          tr(
            "Ajoutez d’abord un prix à la commande avant de la valider.",
            "Voeg eerst een prijs toe voordat u de bestelling bevestigt.",
            "Add a price to the order before confirming it."
          )
        );

        if (currentOrder) {
          startEditingOrder(
            currentOrder
          );
        }

        return;
      }

      setOrderUpdatingId(
        orderId
      );
      setOrderMessage("");

      const { error } =
        await supabase
          .from("store_orders")
          .update({
            status:
              nextStatus,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", orderId);

      setOrderUpdatingId(null);

      if (error) {
        console.error(
          "Erreur mise à jour commande :",
          error
        );

        setOrderMessage(
          tr(
            "Impossible de modifier la commande.",
            "De bestelling kon niet worden bijgewerkt.",
            "Unable to update the order."
          )
        );
        return;
      }

      setStoreOrders(
        (previous) =>
          previous.map(
            (order) =>
              order.id === orderId
                ? {
                    ...order,
                    status:
                      nextStatus,
                  }
                : order
          )
      );

      setOrderMessage(
        tr(
          "Commande mise à jour.",
          "Bestelling bijgewerkt.",
          "Order updated."
        )
      );
    };

  const formatOrderCurrency = (
    amount: number | null,
    currency: string
  ) => {
    if (amount == null) {
      return tr(
        "Sur demande",
        "Op aanvraag",
        "On request"
      );
    }

    return new Intl.NumberFormat(
      intlLocale,
      {
        style: "currency",
        currency,
      }
    ).format(amount);
  };

  const parseOrderNumber = (
    value: string
  ) => {
    const normalized = value
      .trim()
      .replace(",", ".");

    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized);

    return Number.isFinite(parsed)
      ? parsed
      : Number.NaN;
  };

  const startEditingOrder = (
    order: StoreOrder
  ) => {
    setEditingOrderId(order.id);
    setOrderMessage("");

    const itemForms: Record<
      string,
      StoreOrderItemEdit
    > = {};

    storeOrderItems
      .filter(
        (item) =>
          item.order_id === order.id
      )
      .forEach((item) => {
        itemForms[item.id] = {
          quantity: String(item.quantity),
          unit_price:
            item.unit_price == null
              ? ""
              : String(item.unit_price),
        };
      });

    setOrderItemEditForms(
      itemForms
    );

    setOrderEditForm({
      quantity: String(order.quantity),
      unit_price:
        order.unit_price == null
          ? ""
          : String(order.unit_price),
      currency: order.currency,
      discount_amount: String(
        order.discount_amount ?? 0
      ),
      fees_amount: String(
        order.fees_amount ?? 0
      ),
      notes: order.notes ?? "",
    });
  };

  const cancelEditingOrder = () => {
    setEditingOrderId(null);
    setOrderSavingId(null);
    setOrderMessage("");
    setOrderItemEditForms({});
  };

  const getOrderEditPreviewTotal = (
    order: StoreOrder
  ) => {
    const orderItems =
      storeOrderItems.filter(
        (item) =>
          item.order_id === order.id
      );

    const discount =
      parseOrderNumber(
        orderEditForm.discount_amount
      ) ?? 0;

    const fees =
      parseOrderNumber(
        orderEditForm.fees_amount
      ) ?? 0;

    if (
      !Number.isFinite(discount) ||
      !Number.isFinite(fees)
    ) {
      return null;
    }

    if (orderItems.length > 1) {
      let subtotal = 0;

      for (const item of orderItems) {
        const edit =
          orderItemEditForms[item.id];

        const quantity = Number(
          edit?.quantity ??
            item.quantity
        );
        const unitPrice =
          parseOrderNumber(
            edit?.unit_price ??
              (item.unit_price == null
                ? ""
                : String(
                    item.unit_price
                  ))
          );

        if (
          !Number.isInteger(quantity) ||
          quantity <= 0 ||
          unitPrice == null ||
          !Number.isFinite(
            unitPrice
          ) ||
          unitPrice < 0
        ) {
          return null;
        }

        subtotal +=
          quantity * unitPrice;
      }

      return Math.max(
        subtotal -
          discount +
          fees,
        0
      );
    }

    const quantity = Number(
      orderEditForm.quantity
    );

    const unitPrice =
      parseOrderNumber(
        orderEditForm.unit_price
      );

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      unitPrice == null ||
      !Number.isFinite(unitPrice)
    ) {
      return null;
    }

    return Math.max(
      unitPrice * quantity -
        discount +
        fees,
      0
    );
  };


  const saveOrderEdits = async (
    orderId: string
  ) => {
    if (orderSavingId) {
      return;
    }

    const currentOrder =
      storeOrders.find(
        (order) =>
          order.id === orderId
      );

    if (!currentOrder) {
      return;
    }

    const currentItems =
      storeOrderItems
        .filter(
          (item) =>
            item.order_id ===
            orderId
        )
        .sort(
          (a, b) =>
            a.sort_order -
            b.sort_order
        );

    const isMultiItem =
      currentItems.length > 1;

    const discount =
      parseOrderNumber(
        orderEditForm.discount_amount
      ) ?? 0;

    const fees =
      parseOrderNumber(
        orderEditForm.fees_amount
      ) ?? 0;

    if (
      !Number.isFinite(discount) ||
      discount < 0
    ) {
      setOrderMessage(
        tr(
          "La remise est invalide.",
          "De korting is ongeldig.",
          "The discount is invalid."
        )
      );
      return;
    }

    if (
      !Number.isFinite(fees) ||
      fees < 0
    ) {
      setOrderMessage(
        tr(
          "Les frais sont invalides.",
          "De kosten zijn ongeldig.",
          "The fees are invalid."
        )
      );
      return;
    }

    let quantity = Number(
      orderEditForm.quantity
    );
    let unitPrice =
      parseOrderNumber(
        orderEditForm.unit_price
      );

    const itemUpdates: Array<{
      id: string;
      quantity: number;
      unit_price: number;
    }> = [];

    if (isMultiItem) {
      let subtotal = 0;

      for (const item of currentItems) {
        const edit =
          orderItemEditForms[item.id];

        const itemQuantity =
          Number(
            edit?.quantity ??
              item.quantity
          );

        const itemUnitPrice =
          parseOrderNumber(
            edit?.unit_price ??
              (item.unit_price == null
                ? ""
                : String(
                    item.unit_price
                  ))
          );

        if (
          !Number.isInteger(
            itemQuantity
          ) ||
          itemQuantity <= 0
        ) {
          setOrderMessage(
            tr(
              `La quantité de « ${item.product_name} » doit être un entier supérieur à 0.`,
              `De hoeveelheid van '${item.product_name}' moet een geheel getal groter dan 0 zijn.`,
              `The quantity for "${item.product_name}" must be a whole number greater than 0.`
            )
          );
          return;
        }

        if (
          itemUnitPrice == null ||
          !Number.isFinite(
            itemUnitPrice
          ) ||
          itemUnitPrice < 0
        ) {
          setOrderMessage(
            tr(
              `Ajoutez un prix unitaire valide pour « ${item.product_name} ».`,
              `Voeg een geldige eenheidsprijs toe voor '${item.product_name}'.`,
              `Add a valid unit price for "${item.product_name}".`
            )
          );
          return;
        }

        itemUpdates.push({
          id: item.id,
          quantity:
            itemQuantity,
          unit_price:
            itemUnitPrice,
        });

        subtotal +=
          itemQuantity *
          itemUnitPrice;
      }

      quantity = 1;
      unitPrice = subtotal;
    } else {
      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        setOrderMessage(
          tr(
            "La quantité doit être un nombre entier supérieur à 0.",
            "De hoeveelheid moet een geheel getal groter dan 0 zijn.",
            "Quantity must be a whole number greater than 0."
          )
        );
        return;
      }

      if (
        unitPrice != null &&
        (!Number.isFinite(
          unitPrice
        ) ||
          unitPrice < 0)
      ) {
        setOrderMessage(
          tr(
            "Le prix unitaire est invalide.",
            "De eenheidsprijs is ongeldig.",
            "The unit price is invalid."
          )
        );
        return;
      }
    }

    setOrderSavingId(orderId);
    setOrderMessage("");

    try {
      if (isMultiItem) {
        for (const itemUpdate of itemUpdates) {
          const {
            error: itemError,
          } = await supabase
            .from(
              "store_order_items"
            )
            .update({
              quantity:
                itemUpdate.quantity,
              unit_price:
                itemUpdate.unit_price,
              currency:
                orderEditForm.currency,
              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              itemUpdate.id
            );

          if (itemError) {
            throw itemError;
          }
        }
      }

      const { data, error } =
        await supabase
          .from("store_orders")
          .update({
            quantity,
            unit_price: unitPrice,
            currency:
              orderEditForm.currency,
            discount_amount:
              discount,
            fees_amount: fees,
            notes:
              orderEditForm.notes.trim() ||
              null,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", orderId)
          .select(
            "id, order_number, request_id, user_id, product_id, product_name, sku, quantity, unit_price, currency, discount_amount, fees_amount, total_amount, status, customer_name, customer_email, customer_phone, company, notes, preferred_language, created_at, updated_at"
          )
          .single();

      if (error) {
        throw error;
      }

      setStoreOrders(
        (previous) =>
          previous.map(
            (order) =>
              order.id === orderId
                ? (data as StoreOrder)
                : order
          )
      );

      if (isMultiItem) {
        await loadStoreOrders();
      }

      setEditingOrderId(null);
      setOrderItemEditForms({});

      setOrderMessage(
        tr(
          isMultiItem
            ? "Prix des produits et commande enregistrés."
            : "Commande enregistrée.",
          isMultiItem
            ? "Productprijzen en bestelling opgeslagen."
            : "Bestelling opgeslagen.",
          isMultiItem
            ? "Product prices and order saved."
            : "Order saved."
        )
      );
    } catch (caughtError) {
      console.error(
        "Erreur modification commande Store :",
        caughtError
      );

      const detail =
        caughtError instanceof Error
          ? caughtError.message
          : "";

      setOrderMessage(
        tr(
          detail
            ? `Impossible d’enregistrer les modifications : ${detail}`
            : "Impossible d’enregistrer les modifications de la commande.",
          detail
            ? `De wijzigingen konden niet worden opgeslagen: ${detail}`
            : "De wijzigingen aan de bestelling konden niet worden opgeslagen.",
          detail
            ? `Unable to save the changes: ${detail}`
            : "Unable to save the order changes."
        )
      );
    } finally {
      setOrderSavingId(null);
    }
  };


  const validateStoreOrder =
    async (order: StoreOrder) => {
      const orderItems =
        storeOrderItems.filter(
          (item) =>
            item.order_id ===
            order.id
        );

      const missingItemPrice =
        orderItems.length > 1 &&
        orderItems.some(
          (item) =>
            item.unit_price == null
        );

      if (
        order.unit_price == null ||
        missingItemPrice
      ) {
        setOrderMessage(
          tr(
            orderItems.length > 1
              ? "Ajoutez d’abord le prix de chaque produit avant de valider la commande."
              : "Ajoutez d’abord un prix à la commande avant de la valider.",
            orderItems.length > 1
              ? "Voeg eerst de prijs van elk product toe voordat u de bestelling bevestigt."
              : "Voeg eerst een prijs toe voordat u de bestelling bevestigt.",
            orderItems.length > 1
              ? "Add a price for each product before confirming the order."
              : "Add a price to the order before confirming it."
          )
        );

        startEditingOrder(order);
        return;
      }

      await updateStoreOrderStatus(
        order.id,
        "confirmed"
      );
    };

  const getOrderDocumentLanguage = (
    order: StoreOrder
  ): LocaleCode => {
    const value =
      order.preferred_language
        ?.trim()
        .toLowerCase();

    return isSupportedLocale(value)
      ? value
      : "fr";
  };

  const orderDocumentText = (
    order: StoreOrder,
    fr: string,
    nl: string,
    en: string
  ) => {
    const documentLanguage =
      getOrderDocumentLanguage(
        order
      );

    return trForLocale(
      documentLanguage,
      fr,
      nl,
      en
    );
  };

  const getOrderProductNameForDocument =
    (order: StoreOrder) => {
      const product =
        products.find(
          (item) =>
            (order.product_id &&
              item.id ===
                order.product_id) ||
            (order.sku &&
              item.sku
                ?.trim()
                .toLocaleLowerCase() ===
                order.sku
                  .trim()
                  .toLocaleLowerCase())
        );

      if (!product) {
        return order.product_name;
      }

      const documentLanguage =
        getOrderDocumentLanguage(
          order
        );

      if (documentLanguage === "fr") {
        return product.name_fr;
      }

      if (documentLanguage === "nl") {
        return (
          product.name_nl?.trim() ||
          product.name_en?.trim() ||
          product.name_fr
        );
      }

      return (
        product.name_en?.trim() ||
        product.name_fr
      );
    };

  const formatOrderDocumentMoney = (
    order: StoreOrder,
    amount: number | null
  ) => {
    if (amount == null) {
      return orderDocumentText(
        order,
        "Sur demande",
        "Op aanvraag",
        "On request"
      );
    }

    const documentLanguage =
      getOrderDocumentLanguage(
        order
      );

    return new Intl.NumberFormat(
      getLocaleConfig(
        documentLanguage
      ).intlLocale,
      {
        style: "currency",
        currency:
          order.currency,
      }
    ).format(amount);
  };

  const formatOrderDocumentDate = (
    order: StoreOrder,
    value: string
  ) => {
    const documentLanguage =
      getOrderDocumentLanguage(
        order
      );

    return new Intl.DateTimeFormat(
      getLocaleConfig(
        documentLanguage
      ).intlLocale,
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    ).format(new Date(value));
  };

  const getOrderDocumentStatusLabel =
    (order: StoreOrder) => {
      switch (order.status) {
        case "confirmed":
          return orderDocumentText(
            order,
            "Confirmée",
            "Bevestigd",
            "Confirmed"
          );

        case "processing":
          return orderDocumentText(
            order,
            "En préparation",
            "In verwerking",
            "Processing"
          );

        case "ready":
          return orderDocumentText(
            order,
            "Prête",
            "Klaar",
            "Ready"
          );

        case "completed":
          return orderDocumentText(
            order,
            "Terminée",
            "Afgerond",
            "Completed"
          );

        case "cancelled":
          return orderDocumentText(
            order,
            "Annulée",
            "Geannuleerd",
            "Cancelled"
          );

        default:
          return orderDocumentText(
            order,
            "Brouillon",
            "Concept",
            "Draft"
          );
      }
    };

  const downloadStoreOrderPdf = (
    order: StoreOrder
  ) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const margin = 16;

    const productName =
      getOrderProductNameForDocument(
        order
      );

    const orderItems =
      storeOrderItems
        .filter(
          (item) =>
            item.order_id ===
            order.id
        )
        .sort(
          (a, b) =>
            a.sort_order -
            b.sort_order
        );

    const orderPdfRows =
      orderItems.length > 0
        ? orderItems.map(
            (item) => [
              item.product_name,
              item.sku ?? "-",
              String(item.quantity),
              formatOrderDocumentMoney(
                order,
                item.unit_price
              ),
              formatOrderDocumentMoney(
                order,
                item.line_total
              ),
            ]
          )
        : [
            [
              productName,
              order.sku ?? "-",
              String(
                order.quantity
              ),
              formatOrderDocumentMoney(
                order,
                order.unit_price
              ),
              formatOrderDocumentMoney(
                order,
                order.unit_price == null
                  ? null
                  : order.unit_price *
                    order.quantity
              ),
            ],
          ];

    const subtotal =
      orderItems.length > 0
        ? orderItems.reduce(
            (total, item) =>
              item.line_total == null
                ? total
                : total +
                  item.line_total,
            0
          )
        : order.unit_price == null
          ? null
          : order.unit_price *
            order.quantity;

    const title =
      orderDocumentText(
        order,
        "BON DE COMMANDE",
        "BESTELBON",
        "ORDER DOCUMENT"
      );

    const customerTitle =
      orderDocumentText(
        order,
        "CLIENT",
        "KLANT",
        "CUSTOMER"
      );

    const orderInfoTitle =
      orderDocumentText(
        order,
        "INFORMATIONS COMMANDE",
        "BESTELINFORMATIE",
        "ORDER INFORMATION"
      );

    // Palette officielle TSB Tech Group :
    // #0D1117, #121820, #0070FF, #00D4FF, #C0C0C0, #FFFFFF
    doc.setFillColor(
      13,
      17,
      23
    );
    doc.rect(
      0,
      0,
      pageWidth,
      42,
      "F"
    );

    // Ligne d'accent cyan officielle
    doc.setFillColor(
      0,
      212,
      255
    );
    doc.rect(
      0,
      41.2,
      pageWidth,
      0.8,
      "F"
    );

    // En-tête premium TSB Tech Group
    // Logo texte sur une ligne : T argent, S bleu, B argent, TECH bleu, GROUP argent
    doc.setFont(
      "helvetica",
      "bold"
    );
    doc.setFontSize(20);

    const logoX = margin;
    const logoY = 14.5;

    doc.setTextColor(
      230,
      230,
      230
    );
    doc.text(
      "T",
      logoX,
      logoY
    );

    const tWidth =
      doc.getTextWidth("T");

    doc.setTextColor(
      0,
      112,
      255
    );
    doc.text(
      "S",
      logoX + tWidth,
      logoY
    );

    const sWidth =
      doc.getTextWidth("S");

    doc.setTextColor(
      230,
      230,
      230
    );
    doc.text(
      "B",
      logoX +
        tWidth +
        sWidth,
      logoY
    );

    const bWidth =
      doc.getTextWidth("B");

    const logoGap = 4;

    doc.setFontSize(13);

    const techX =
      logoX +
      tWidth +
      sWidth +
      bWidth +
      logoGap;

    doc.setTextColor(
      0,
      112,
      255
    );
    doc.text(
      "TECH",
      techX,
      logoY
    );

    const techWidth =
      doc.getTextWidth(
        "TECH"
      );

    doc.setTextColor(
      230,
      230,
      230
    );
    doc.text(
      "GROUP",
      techX +
        techWidth +
        2.4,
      logoY
    );

    // Devise TSB plus visible et plus premium
    doc.setFont(
      "helvetica",
      "bold"
    );
    doc.setFontSize(9.6);
    doc.setTextColor(
      255,
      255,
      255
    );
    doc.text(
      "UNE SEULE VISION,",
      margin,
      23
    );

    const mottoFirstWidth =
      doc.getTextWidth(
        "UNE SEULE VISION,"
      );

    doc.setTextColor(
      0,
      212,
      255
    );
    doc.text(
      " DES SOLUTIONS ILLIMITEES.",
      margin +
        mottoFirstWidth,
      23
    );

    // Coordonnées, volontairement plus discrètes
    doc.setFont(
      "helvetica",
      "normal"
    );
    doc.setFontSize(7.8);
    doc.setTextColor(
      192,
      192,
      192
    );
    doc.text(
      "tsbtechgroup.com  |  contact@tsbtechgroup.com",
      margin,
      31
    );

    // Bloc commande premium à droite
    const orderBoxWidth = 58;
    const orderBoxHeight = 28;
    const orderBoxX =
      pageWidth -
      margin -
      orderBoxWidth;
    const orderBoxY = 7;

    doc.setDrawColor(
      0,
      112,
      255
    );
    doc.setLineWidth(0.35);
    doc.roundedRect(
      orderBoxX,
      orderBoxY,
      orderBoxWidth,
      orderBoxHeight,
      2.5,
      2.5,
      "S"
    );

    doc.setFont(
      "helvetica",
      "bold"
    );
    doc.setFontSize(11.5);
    doc.setTextColor(
      255,
      255,
      255
    );
    doc.text(
      title,
      orderBoxX +
        orderBoxWidth -
        4,
      14,
      {
        align: "right",
      }
    );

    doc.setFontSize(9.5);
    doc.setTextColor(
      0,
      112,
      255
    );
    doc.text(
      order.order_number,
      orderBoxX +
        orderBoxWidth -
        4,
      22,
      {
        align: "right",
      }
    );

    doc.setFont(
      "helvetica",
      "normal"
    );
    doc.setFontSize(7.8);
    doc.setTextColor(
      192,
      192,
      192
    );
    doc.text(
      `${orderDocumentText(
        order,
        "Statut",
        "Status",
        "Status"
      )}: ${getOrderDocumentStatusLabel(
        order
      )}`,
      orderBoxX +
        orderBoxWidth -
        4,
      29,
      {
        align: "right",
      }
    );

    // Filet cyan de signature visuelle TSB
    doc.setFillColor(
      0,
      212,
      255
    );
    doc.rect(
      0,
      41.2,
      pageWidth,
      0.8,
      "F"
    );

    doc.setTextColor(
      25,
      35,
      50
    );

    let y = 54;

    doc.setFont(
      "helvetica",
      "bold"
    );
    doc.setFontSize(10);
    doc.setTextColor(
      13,
      17,
      23
    );
    doc.text(
      customerTitle,
      margin,
      y
    );

    doc.setTextColor(
      0,
      112,
      255
    );
    doc.text(
      orderInfoTitle,
      112,
      y
    );

    doc.setTextColor(
      25,
      35,
      50
    );

    y += 7;

    doc.setFont(
      "helvetica",
      "normal"
    );
    doc.setFontSize(9);

    const customerLines = [
      order.customer_name,
      order.company ?? "",
      order.customer_email,
      order.customer_phone ??
        "",
    ].filter(Boolean);

    customerLines.forEach(
      (line, index) => {
        doc.text(
          line,
          margin,
          y + index * 5
        );
      }
    );

    const orderInfoLines = [
      `${orderDocumentText(
        order,
        "Numero",
        "Nummer",
        "Number"
      )}: ${order.order_number}`,
      `${orderDocumentText(
        order,
        "Date",
        "Datum",
        "Date"
      )}: ${formatOrderDocumentDate(
        order,
        order.created_at
      )}`,
      `${orderDocumentText(
        order,
        "Devise",
        "Valuta",
        "Currency"
      )}: ${order.currency}`,
      `${orderDocumentText(
        order,
        "Statut",
        "Status",
        "Status"
      )}: ${getOrderDocumentStatusLabel(
        order
      )}`,
    ];

    orderInfoLines.forEach(
      (line, index) => {
        doc.text(
          line,
          112,
          y + index * 5
        );
      }
    );

    const tableStartY =
      y +
      Math.max(
        customerLines.length,
        orderInfoLines.length
      ) *
        5 +
      10;

    autoTable(doc, {
      startY: tableStartY,
      theme: "grid",
      margin: {
        left: margin,
        right: margin,
      },
      head: [
        [
          orderDocumentText(
            order,
            "Produit",
            "Product",
            "Product"
          ),
          orderDocumentText(
            order,
            "Reference",
            "Referentie",
            "Reference"
          ),
          orderDocumentText(
            order,
            "Qte",
            "Aantal",
            "Qty"
          ),
          orderDocumentText(
            order,
            "Prix unitaire",
            "Eenheidsprijs",
            "Unit price"
          ),
          orderDocumentText(
            order,
            "Sous-total",
            "Subtotaal",
            "Subtotal"
          ),
        ],
      ],
      body: orderPdfRows,
      headStyles: {
        fillColor: [
          18,
          24,
          32,
        ],
        textColor: [
          255,
          255,
          255,
        ],
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: {
        textColor: [
          32,
          41,
          55,
        ],
        fontSize: 8.5,
        cellPadding: 3,
      },
      styles: {
        lineColor: [
          220,
          226,
          234,
        ],
        lineWidth: 0.2,
      },
    });

    const tableDoc =
      doc as jsPDF & {
        lastAutoTable?: {
          finalY: number;
        };
      };

    const totalsStartY =
      (tableDoc.lastAutoTable
        ?.finalY ??
        tableStartY + 25) +
      10;

    const totalsLabelWidth = 38;
    const totalsValueWidth = 36;
    const totalsTableWidth =
      totalsLabelWidth +
      totalsValueWidth;

    const totalsLeft =
      pageWidth -
      margin -
      totalsTableWidth;

    const subtotalLabel =
      orderDocumentText(
        order,
        "Sous-total",
        "Subtotaal",
        "Subtotal"
      );

    const discountLabel =
      orderDocumentText(
        order,
        "Remise",
        "Korting",
        "Discount"
      );

    const feesLabel =
      orderDocumentText(
        order,
        "Frais",
        "Kosten",
        "Fees"
      );

    const totalLabel =
      orderDocumentText(
        order,
        "TOTAL",
        "TOTAAL",
        "TOTAL"
      );

    autoTable(doc, {
      startY: totalsStartY,
      margin: {
        left: totalsLeft,
        right: margin,
      },
      tableWidth:
        totalsTableWidth,
      theme: "plain",
      body: [
        [
          subtotalLabel,
          formatOrderDocumentMoney(
            order,
            subtotal
          ),
        ],
        [
          discountLabel,
          `- ${formatOrderDocumentMoney(
            order,
            order.discount_amount ??
              0
          )}`,
        ],
        [
          feesLabel,
          formatOrderDocumentMoney(
            order,
            order.fees_amount ??
              0
          ),
        ],
        [
          totalLabel,
          formatOrderDocumentMoney(
            order,
            order.total_amount
          ),
        ],
      ],
      columnStyles: {
        0: {
          cellWidth:
            totalsLabelWidth,
          halign: "left",
        },
        1: {
          cellWidth:
            totalsValueWidth,
          halign: "right",
        },
      },
      styles: {
        fontSize: 9,
        cellPadding: {
          top: 1.7,
          right: 0,
          bottom: 1.7,
          left: 0,
        },
        textColor: [
          32,
          41,
          55,
        ],
        overflow: "linebreak",
      },
      didParseCell: (data) => {
        if (data.row.index === 3) {
          data.cell.styles.fontStyle =
            "bold";
          data.cell.styles.fontSize =
            10;
          data.cell.styles.textColor =
            [15, 29, 46];
          data.cell.styles.cellPadding =
            {
              top: 2.4,
              right: 0,
              bottom: 2,
              left: 0,
            };
        }
      },
      didDrawCell: (data) => {
        if (
          data.row.index === 3 &&
          data.column.index === 0
        ) {
          const rowY =
            data.cell.y;

          doc.setDrawColor(
            0,
            112,
            255
          );
          doc.setLineWidth(
            0.45
          );
          doc.line(
            totalsLeft,
            rowY,
            pageWidth -
              margin,
            rowY
          );
        }
      },
    });

    const totalsDoc =
      doc as jsPDF & {
        lastAutoTable?: {
          finalY: number;
        };
      };

    let totalsY =
      (totalsDoc.lastAutoTable
        ?.finalY ??
        totalsStartY + 28);

    if (order.notes?.trim()) {
      totalsY += 6;

      doc.setFont(
        "helvetica",
        "bold"
      );
      doc.setFontSize(9);
      doc.text(
        orderDocumentText(
          order,
          "NOTE TSB",
          "TSB-NOTITIE",
          "TSB NOTE"
        ),
        margin,
        totalsY
      );

      totalsY += 5;

      doc.setFont(
        "helvetica",
        "normal"
      );
      doc.setFontSize(8.5);

      const noteLines =
        doc.splitTextToSize(
          order.notes.trim(),
          pageWidth -
            margin * 2
        );

      doc.text(
        noteLines,
        margin,
        totalsY
      );

      totalsY +=
        noteLines.length * 4;
    }

    const footerY =
      doc.internal.pageSize.getHeight() -
      15;

    doc.setDrawColor(
      220,
      226,
      234
    );
    doc.line(
      margin,
      footerY - 6,
      pageWidth - margin,
      footerY - 6
    );

    doc.setFont(
      "helvetica",
      "normal"
    );
    doc.setFontSize(7.5);
    doc.setTextColor(
      100,
      110,
      125
    );

    doc.text(
      orderDocumentText(
        order,
        "Document genere par TSB Tech Group - Ce document n'est pas une facture.",
        "Document gegenereerd door TSB Tech Group - Dit document is geen factuur.",
        "Document generated by TSB Tech Group - This document is not an invoice."
      ),
      margin,
      footerY
    );

    doc.text(
      "tsbtechgroup.com",
      pageWidth - margin,
      footerY,
      {
        align: "right",
      }
    );

    doc.save(
      `${order.order_number}.pdf`
    );
  };

  const loadProducts = async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } =
      await supabase
        .from("store_products")
        .select(
          "id, slug, category, name_fr, name_nl, name_en, description_fr, description_nl, description_en, sku, price, currency, availability, stock_quantity, image_url, image_path, is_published, is_featured, sort_order, created_at, updated_at"
        )
        .order("sort_order", {
          ascending: true,
        })
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "Erreur chargement TSB Store :",
        error
      );

      setErrorMessage(
        formatAdminCopy(
          "storeUnableLoadProductsDetail",
          { detail: error.message }
        )
      );
      setProducts([]);
      setLoading(false);
      return;
    }

    setProducts(
      (data ?? []) as StoreProduct[]
    );
    setLoading(false);
  };

  useEffect(() => {
    void loadProducts();
    void loadStoreRequests();
    void loadStoreOrders();
    void loadStoreInvoices();
  }, []);

  useEffect(() => {
    setProductPage(1);
  }, [searchQuery, categoryFilter]);

  const filteredProducts =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      return products.filter(
        (product) => {
          if (
            categoryFilter !== "all" &&
            product.category !==
              categoryFilter
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          const haystack = [
            product.name_fr,
            product.name_nl ?? "",
            product.name_en ?? "",
            product.sku ?? "",
            product.slug,
            getCategoryLabelForLanguage(
              product.category
            ),
          ]
            .join(" ")
            .toLowerCase();

          return haystack.includes(query);
        }
      );
    }, [
      products,
      searchQuery,
      categoryFilter,
      locale,
    ]);

  const totalProductPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length /
        ADMIN_PRODUCTS_PER_PAGE
    )
  );

  const safeProductPage = Math.min(
    productPage,
    totalProductPages
  );

  const paginatedProducts =
    filteredProducts.slice(
      (safeProductPage - 1) *
        ADMIN_PRODUCTS_PER_PAGE,
      safeProductPage *
        ADMIN_PRODUCTS_PER_PAGE
    );

  const pendingStoreRequestCount =
    storeRequests.filter(
      (request) =>
        request.status ===
          "received" ||
        request.status ===
          "in_progress"
    ).length;

  const publishedCount =
    products.filter(
      (product) =>
        product.is_published
    ).length;

  const featuredCount =
    products.filter(
      (product) =>
        product.is_featured
    ).length;

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    setErrorMessage("");
    setSuccessMessage("");
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setShowForm(true);
  };

  const openEditForm = (
    product: StoreProduct
  ) => {
    setErrorMessage("");
    setSuccessMessage("");
    setEditingId(product.id);
    setImageFile(null);

    setForm({
      category: product.category,
      name_fr: product.name_fr,
      name_nl:
        product.name_nl ?? "",
      name_en:
        product.name_en ?? "",
      description_fr:
        product.description_fr ?? "",
      description_nl:
        product.description_nl ?? "",
      description_en:
        product.description_en ?? "",
      sku: product.sku ?? "",
      slug: product.slug,
      price:
        product.price === null
          ? ""
          : String(product.price),
      currency:
        product.currency || "EUR",
      availability:
        product.availability,
      stock_quantity:
        product.stock_quantity === null
          ? ""
          : String(
              product.stock_quantity
            ),
      is_published:
        product.is_published,
      is_featured:
        product.is_featured,
      sort_order: String(
        product.sort_order ?? 0
      ),
    });

    setShowForm(true);

    window.setTimeout(() => {
      document
        .getElementById(
          "admin-store-form"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 80);
  };

  const handleNameFrChange = (
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      name_fr: value,
      slug:
        editingId ||
        previous.slug.trim()
          ? previous.slug
          : makeSlug(value),
    }));
  };

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0] ??
      null;

    if (!file) {
      setImageFile(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(file.type)
    ) {
      setErrorMessage(
        tr(
          "La photo doit être au format JPG, PNG ou WEBP.",
          "De foto moet JPG, PNG of WEBP zijn.",
          "The photo must be JPG, PNG or WEBP."
        )
      );
      event.target.value = "";
      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setErrorMessage(
        tr(
          "La photo dépasse la limite de 5 Mo.",
          "De foto overschrijdt de limiet van 5 MB.",
          "The photo exceeds the 5 MB limit."
        )
      );
      event.target.value = "";
      return;
    }

    setErrorMessage("");
    setImageFile(file);
  };

  const uploadProductImage =
    async () => {
      if (!imageFile) {
        return null;
      }

      const extension =
        imageFile.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";

      const safeBaseName =
        makeSlug(
          imageFile.name.replace(
            /\.[^/.]+$/,
            ""
          )
        ) || "produit";

      const path =
        `${Date.now()}-${safeBaseName}.${extension}`;

      const { error } =
        await supabase.storage
          .from("store-products")
          .upload(
            path,
            imageFile,
            {
              contentType:
                imageFile.type,
              upsert: false,
            }
          );

      if (error) {
        throw error;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("store-products")
        .getPublicUrl(path);

      return {
        path,
        url: publicUrlData.publicUrl,
      };
    };

  const translateProductContent =
    async (
      nameFr: string,
      descriptionFr: string
    ) => {
      const { data, error } =
        await supabase.functions.invoke(
          "translate-store-product",
          {
            body: {
              name_fr: nameFr,
              description_fr:
                descriptionFr || null,
            },
          }
        );

      if (error) {
        throw new Error(
          tr(
            `Traduction automatique indisponible : ${error.message}`,
            `Automatische vertaling niet beschikbaar: ${error.message}`,
            `Automatic translation unavailable: ${error.message}`
          )
        );
      }

      if (
        !data?.name_nl ||
        !data?.name_en
      ) {
        throw new Error(
          tr(
            "La traduction automatique n’a pas retourné toutes les langues.",
            "De automatische vertaling heeft niet alle talen teruggegeven.",
            "Automatic translation did not return all languages."
          )
        );
      }

      return {
        name_nl:
          String(data.name_nl),
        name_en:
          String(data.name_en),
        description_nl:
          data.description_nl
            ? String(
                data.description_nl
              )
            : null,
        description_en:
          data.description_en
            ? String(
                data.description_en
              )
            : null,
      };
    };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const cleanName =
      form.name_fr.trim();

    const cleanSlug =
      makeSlug(
        form.slug.trim() ||
          cleanName
      );

    if (!cleanName) {
      setErrorMessage(
        tr(
          "Indiquez le nom du produit.",
          "Vul de productnaam in.",
          "Enter the product name."
        )
      );
      return;
    }

    if (!cleanSlug) {
      setErrorMessage(
        tr(
          "Le slug du produit n’est pas valide.",
          "De productslug is ongeldig.",
          "The product slug is invalid."
        )
      );
      return;
    }

    const parsedPrice =
      form.price.trim() === ""
        ? null
        : Number(form.price);

    if (
      parsedPrice !== null &&
      (
        !Number.isFinite(
          parsedPrice
        ) ||
        parsedPrice < 0
      )
    ) {
      setErrorMessage(
        tr(
          "Le prix indiqué n’est pas valide.",
          "De opgegeven prijs is ongeldig.",
          "The entered price is invalid."
        )
      );
      return;
    }

    const parsedStock =
      form.stock_quantity.trim() === ""
        ? null
        : Number(
            form.stock_quantity
          );

    if (
      parsedStock !== null &&
      (
        !Number.isInteger(
          parsedStock
        ) ||
        parsedStock < 0
      )
    ) {
      setErrorMessage(
        tr(
          "Le stock doit être un nombre entier positif.",
          "De voorraad moet een positief geheel getal zijn.",
          "Stock must be a positive whole number."
        )
      );
      return;
    }

    const parsedSortOrder =
      Number(
        form.sort_order || "0"
      );

    if (
      !Number.isInteger(
        parsedSortOrder
      )
    ) {
      setErrorMessage(
        tr(
          "L’ordre d’affichage doit être un nombre entier.",
          "De weergavevolgorde moet een geheel getal zijn.",
          "Display order must be a whole number."
        )
      );
      return;
    }

    setSaving(true);

    const currentProduct =
      editingId
        ? products.find(
            (product) =>
              product.id === editingId
          ) ?? null
        : null;

    let uploadedImage:
      | {
          path: string;
          url: string;
        }
      | null = null;

    try {
      uploadedImage =
        await uploadProductImage();

      const translations =
        await translateProductContent(
          cleanName,
          form.description_fr.trim()
        );

      const payload = {
        category: form.category,
        name_fr: cleanName,
        name_nl:
          translations.name_nl,
        name_en:
          translations.name_en,
        description_fr:
          form.description_fr.trim() ||
          null,
        description_nl:
          translations.description_nl,
        description_en:
          translations.description_en,
        sku:
          form.sku.trim() ||
          null,
        slug: cleanSlug,
        price: parsedPrice,
        currency:
          form.currency
            .trim()
            .toUpperCase() ||
          "EUR",
        availability:
          form.availability,
        stock_quantity:
          parsedStock,
        image_url:
          uploadedImage?.url ??
          currentProduct?.image_url ??
          null,
        image_path:
          uploadedImage?.path ??
          currentProduct?.image_path ??
          null,
        is_published:
          form.is_published,
        is_featured:
          form.is_featured,
        sort_order:
          parsedSortOrder,
        updated_at:
          new Date().toISOString(),
      };

      if (editingId) {
        const {
          data,
          error,
        } = await supabase
          .from("store_products")
          .update(payload)
          .eq("id", editingId)
          .select(
            "id, slug, category, name_fr, name_nl, name_en, description_fr, description_nl, description_en, sku, price, currency, availability, stock_quantity, image_url, image_path, is_published, is_featured, sort_order, created_at, updated_at"
          )
          .single();

        if (error) {
          throw error;
        }

        if (
          uploadedImage &&
          currentProduct?.image_path &&
          currentProduct.image_path !==
            uploadedImage.path
        ) {
          await supabase.storage
            .from("store-products")
            .remove([
              currentProduct.image_path,
            ]);
        }

        setProducts(
          (previous) =>
            previous.map(
              (product) =>
                product.id === editingId
                  ? (data as StoreProduct)
                  : product
            )
        );

        setSuccessMessage(
          at("storeProductUpdated")
        );
      } else {
        const {
          data,
          error,
        } = await supabase
          .from("store_products")
          .insert(payload)
          .select(
            "id, slug, category, name_fr, name_nl, name_en, description_fr, description_nl, description_en, sku, price, currency, availability, stock_quantity, image_url, image_path, is_published, is_featured, sort_order, created_at, updated_at"
          )
          .single();

        if (error) {
          throw error;
        }

        setProducts(
          (previous) => [
            data as StoreProduct,
            ...previous,
          ]
        );

        setSuccessMessage(
          at("storeProductAdded")
        );
      }

      setEditingId(null);
      setForm(emptyForm);
      setImageFile(null);
      setShowForm(false);
    } catch (error) {
      console.error(
        "Erreur produit TSB Store :",
        error
      );

      if (uploadedImage) {
        await supabase.storage
          .from("store-products")
          .remove([
            uploadedImage.path,
          ]);
      }

      const message =
        error instanceof Error
          ? error.message
          : at("storeUnknownError");

      setErrorMessage(
        message.includes(
          "duplicate key"
        )
          ? at("storeDuplicateSkuSlug")
          : formatAdminCopy(
              "storeUnableSaveProductDetail",
              { detail: message }
            )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    product: StoreProduct
  ) => {
    if (deletingId) {
      return;
    }

    const confirmed =
      window.confirm(
        formatAdminCopy(
          "storeDeleteProductConfirm",
          {
            productName:
              getLocalizedProductName(
                product
              ),
          }
        )
      );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setDeletingId(product.id);

    const { error } =
      await supabase
        .from("store_products")
        .delete()
        .eq("id", product.id);

    if (error) {
      console.error(
        "Erreur suppression produit :",
        error
      );

      setErrorMessage(
        formatAdminCopy(
          "storeUnableDeleteProductDetail",
          { detail: error.message }
        )
      );
      setDeletingId(null);
      return;
    }

    if (product.image_path) {
      const {
        error: storageError,
      } = await supabase.storage
        .from("store-products")
        .remove([
          product.image_path,
        ]);

      if (storageError) {
        console.error(
          "Erreur nettoyage image produit :",
          storageError
        );
      }
    }

    setProducts(
      (previous) =>
        previous.filter(
          (currentProduct) =>
            currentProduct.id !==
            product.id
        )
    );

    if (
      editingId === product.id
    ) {
      resetForm();
    }

    setDeletingId(null);
    setSuccessMessage(
      at("storeProductDeleted")
    );
  };

  const inputStyle = {
    width: "100%",
    minHeight: "46px",
    borderRadius: "12px",
    border:
      "1px solid rgba(255,255,255,0.1)",
    background:
      "rgba(255,255,255,0.045)",
    color: "#ffffff",
    padding: "0 13px",
    outline: "none",
    font: "inherit",
  } as const;

  const textareaStyle = {
    ...inputStyle,
    minHeight: "104px",
    padding: "12px 13px",
    resize:
      "vertical" as const,
  };

  const labelStyle = {
    display: "grid",
    gap: "7px",
    color:
      "rgba(255,255,255,0.78)",
    fontSize: "0.84rem",
    fontWeight: 700,
  } as const;

  return (
    <section
      id="admin-store"
      className="login-card"
      data-tsb-store-language={locale}
      style={{
        marginTop: "22px",
        scrollMarginTop: "30px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <span className="section__eyebrow">
            TSB STORE
          </span>

          <h2
            style={{
              margin:
                "8px 0 6px",
            }}
          >
            {activeStoreView ===
            "catalogue"
              ? tr(
                  "Gestion des produits",
                  "Productbeheer",
                  "Product management"
                )
              : activeStoreView ===
                  "requests"
                ? tr(
                    "Demandes Store",
                    "Store-aanvragen",
                    "Store requests"
                  )
                : tr(
                    "Commandes Store",
                    "Store-bestellingen",
                    "Store orders"
                  )}
          </h2>

          <p
            style={{
              margin: 0,
              maxWidth: "720px",
              color:
                "rgba(255,255,255,0.64)",
            }}
          >
            {activeStoreView ===
            "catalogue"
              ? tr(
                  "Gérez le catalogue, les prix, le stock, les photos et la publication des produits.",
                  "Beheer de catalogus, prijzen, voorraad, foto’s en productpublicatie.",
                  "Manage the catalogue, prices, stock, photos and product publishing."
                )
              : activeStoreView ===
                  "requests"
                ? tr(
                    "Suivez les demandes de produits envoyées par les clients et mettez leur statut à jour.",
                    "Volg productaanvragen van klanten en werk hun status bij.",
                    "Track product requests sent by clients and update their status."
                  )
                : tr(
                    "Suivez les commandes créées depuis les demandes clients.",
                    "Volg bestellingen die vanuit klantaanvragen zijn aangemaakt.",
                    "Track orders created from client requests."
                  )}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className="button button--secondary"
            onClick={() => {
              void loadProducts();
              void loadStoreRequests();
              void loadStoreOrders();
              void loadStoreInvoices();
            }}
            disabled={
              loading ||
              requestsLoading
            }
          >
            <RefreshCw
              size={16}
            />
            {tr("Actualiser", "Vernieuwen", "Refresh")}
          </button>

          {activeStoreView ===
            "catalogue" && (
            <button
              type="button"
              className="button button--primary"
              onClick={openCreateForm}
            >
              <Plus size={17} />
              {tr(
                "Ajouter un produit",
                "Product toevoegen",
                "Add product"
              )}
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
          marginTop: "20px",
          paddingBottom: "14px",
          borderBottom:
            "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <button
          type="button"
          onClick={() =>
            setActiveStoreView(
              "catalogue"
            )
          }
          style={{
            minHeight: "38px",
            padding: "0 14px",
            borderRadius: "10px",
            border:
              activeStoreView ===
              "catalogue"
                ? "1px solid rgba(56,189,248,0.48)"
                : "1px solid rgba(255,255,255,0.1)",
            background:
              activeStoreView ===
              "catalogue"
                ? "rgba(56,189,248,0.12)"
                : "rgba(255,255,255,0.035)",
            color:
              activeStoreView ===
              "catalogue"
                ? "#7dd3fc"
                : "rgba(255,255,255,0.7)",
            cursor: "pointer",
            fontWeight: 850,
          }}
        >
          <Package
            size={15}
            style={{
              marginRight: "7px",
              verticalAlign:
                "middle",
            }}
          />
          {tr(
            "Catalogue",
            "Catalogus",
            "Catalogue"
          )}
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveStoreView(
              "requests"
            )
          }
          style={{
            minHeight: "38px",
            padding: "0 14px",
            borderRadius: "10px",
            border:
              activeStoreView ===
              "requests"
                ? "1px solid rgba(56,189,248,0.48)"
                : "1px solid rgba(255,255,255,0.1)",
            background:
              activeStoreView ===
              "requests"
                ? "rgba(56,189,248,0.12)"
                : "rgba(255,255,255,0.035)",
            color:
              activeStoreView ===
              "requests"
                ? "#7dd3fc"
                : "rgba(255,255,255,0.7)",
            cursor: "pointer",
            fontWeight: 850,
          }}
        >
          {tr(
            "Demandes",
            "Aanvragen",
            "Requests"
          )}
          <span
            style={{
              marginLeft: "8px",
              minWidth: "22px",
              height: "22px",
              padding: "0 6px",
              display:
                "inline-grid",
              placeItems: "center",
              borderRadius:
                "999px",
              background:
                pendingStoreRequestCount >
                0
                  ? "rgba(248,113,113,0.16)"
                  : "rgba(255,255,255,0.08)",
              color:
                pendingStoreRequestCount >
                0
                  ? "#fca5a5"
                  : "rgba(255,255,255,0.65)",
              fontSize: "0.7rem",
            }}
          >
            {pendingStoreRequestCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveStoreView(
              "orders"
            )
          }
          style={{
            minHeight: "38px",
            padding: "0 14px",
            borderRadius: "10px",
            border:
              activeStoreView ===
              "orders"
                ? "1px solid rgba(56,189,248,0.48)"
                : "1px solid rgba(255,255,255,0.1)",
            background:
              activeStoreView ===
              "orders"
                ? "rgba(56,189,248,0.12)"
                : "rgba(255,255,255,0.035)",
            color:
              activeStoreView ===
              "orders"
                ? "#7dd3fc"
                : "rgba(255,255,255,0.7)",
            cursor: "pointer",
            fontWeight: 850,
          }}
        >
          {tr(
            "Commandes",
            "Bestellingen",
            "Orders"
          )}
          <span
            style={{
              marginLeft: "8px",
              minWidth: "22px",
              height: "22px",
              padding: "0 6px",
              display:
                "inline-grid",
              placeItems: "center",
              borderRadius:
                "999px",
              background:
                "rgba(255,255,255,0.08)",
              color:
                "rgba(255,255,255,0.7)",
              fontSize: "0.7rem",
            }}
          >
            {storeOrders.length}
          </span>
        </button>
      </div>

      <div
        style={{
          display:
            activeStoreView ===
            "catalogue"
              ? "block"
              : "none",
        }}
      >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "12px",
          marginTop: "20px",
        }}
      >
        {[
          {
            label: tr("Produits", "Producten", "Products"),
            value: products.length,
          },
          {
            label: tr("Publiés", "Gepubliceerd", "Published"),
            value:
              publishedCount,
          },
          {
            label: tr("Mis en avant", "Uitgelicht", "Featured"),
            value:
              featuredCount,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: "14px 16px",
              borderRadius: "14px",
              border:
                "1px solid rgba(255,255,255,0.08)",
              background:
                "rgba(255,255,255,0.035)",
            }}
          >
            <div
              style={{
                color:
                  "rgba(255,255,255,0.52)",
                fontSize: "0.75rem",
                fontWeight: 800,
                letterSpacing:
                  "0.08em",
                textTransform:
                  "uppercase",
              }}
            >
              {stat.label}
            </div>

            <strong
              style={{
                display: "block",
                marginTop: "5px",
                fontSize: "1.45rem",
                color: "#ffffff",
              }}
            >
              {stat.value}
            </strong>
          </div>
        ))}
      </div>

      {errorMessage && (
        <p
          className="login-form-message"
          style={{
            marginTop: "16px",
          }}
        >
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p
          style={{
            marginTop: "16px",
            color: "#86efac",
            fontWeight: 700,
          }}
        >
          {successMessage}
        </p>
      )}

      {showForm && (
        <form
          id="admin-store-form"
          onSubmit={handleSubmit}
          style={{
            marginTop: "22px",
            padding: "18px",
            borderRadius: "16px",
            border:
              "1px solid rgba(56,189,248,0.22)",
            background:
              "rgba(56,189,248,0.04)",
            scrollMarginTop: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div>
              <span className="section__eyebrow">
                {editingId
                  ? tr(
                      "MODIFICATION",
                      "WIJZIGING",
                      "EDIT"
                    )
                  : tr(
                      "NOUVEAU PRODUIT",
                      "NIEUW PRODUCT",
                      "NEW PRODUCT"
                    )}
              </span>

              <h3
                style={{
                  margin:
                    "6px 0 0",
                }}
              >
                {editingId
                  ? tr(
                      "Modifier le produit",
                      "Product wijzigen",
                      "Edit product"
                    )
                  : tr(
                      "Ajouter au catalogue",
                      "Aan catalogus toevoegen",
                      "Add to catalogue"
                    )}
              </h3>
            </div>

            <button
              type="button"
              onClick={resetForm}
              aria-label={tr("Fermer le formulaire", "Formulier sluiten", "Close form")}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                border:
                  "1px solid rgba(255,255,255,0.08)",
                background:
                  "rgba(255,255,255,0.04)",
                color: "#ffffff",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div
            style={{
              marginBottom: "14px",
              padding: "10px 12px",
              borderRadius: "12px",
              border:
                "1px solid rgba(56,189,248,0.18)",
              background:
                "rgba(56,189,248,0.05)",
              color:
                "rgba(255,255,255,0.72)",
              fontSize: "0.82rem",
            }}
          >
            <strong style={{ color: "#7dd3fc" }}>
              {tr(
                "Langue source : Français",
                "Brontaal: Frans",
                "Source language: French"
              )}
            </strong>
            {" — "}
            {tr(
              "Saisissez le produit une seule fois. À l’enregistrement, TSB génère automatiquement les versions néerlandaise et anglaise.",
              "Voer het product één keer in. Bij het opslaan genereert TSB automatisch de Nederlandse en Engelse versies.",
              "Enter the product once. When saving, TSB automatically generates the Dutch and English versions."
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            <label
              style={labelStyle}
            >
              {tr("Domaine *", "Domein *", "Category *")}
              <select
                value={
                  form.category
                }
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      category:
                        event.target
                          .value as StoreCategory,
                    })
                  )
                }
                style={inputStyle}
              >
                {categoryOptions.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                      style={{
                        color:
                          "#07111f",
                      }}
                    >
                      {getCategoryLabelForLanguage(option.value)}
                    </option>
                  )
                )}
              </select>
            </label>

            <label
              style={labelStyle}
            >
              {tr("Nom du produit (FR) *", "Productnaam (FR) *", "Product name (FR) *")}
              <input
                type="text"
                value={
                  form.name_fr
                }
                onChange={(event) =>
                  handleNameFrChange(
                    event.target.value
                  )
                }
                style={inputStyle}
                placeholder={tr("Ex. Télécommande universelle", "Bijv. universele afstandsbediening", "Ex. Universal remote")}
              />
            </label>

            <label
              style={labelStyle}
            >
              {tr("Référence / SKU", "Referentie / SKU", "Reference / SKU")}
              <input
                type="text"
                value={form.sku}
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      sku:
                        event.target
                          .value,
                    })
                  )
                }
                style={inputStyle}
                placeholder="Ex. TSB-AUTO-001"
              />
            </label>

            <label
              style={labelStyle}
            >
              {at("storeSlugRequired")}
              <input
                type="text"
                value={form.slug}
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      slug:
                        makeSlug(
                          event.target
                            .value
                        ),
                    })
                  )
                }
                style={inputStyle}
                placeholder="telecommande-universelle"
              />
            </label>

            <label
              style={labelStyle}
            >
              {tr("Prix", "Prijs", "Price")}
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      price:
                        event.target
                          .value,
                    })
                  )
                }
                style={inputStyle}
                placeholder="0.00"
              />
            </label>

            <label
              style={labelStyle}
            >
              {tr("Devise", "Valuta", "Currency")}
              <select
                value={form.currency}
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      currency:
                        event.target.value,
                    })
                  )
                }
                style={inputStyle}
              >
                {CURRENCY_OPTIONS.map(
                  (currency) => (
                    <option
                      key={currency}
                      value={currency}
                      style={{
                        color: "#07111f",
                      }}
                    >
                      {currency}
                    </option>
                  )
                )}
              </select>
            </label>

            <label
              style={labelStyle}
            >
              {tr("Disponibilité", "Beschikbaarheid", "Availability")}
              <select
                value={
                  form.availability
                }
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      availability:
                        event.target
                          .value as StoreAvailability,
                    })
                  )
                }
                style={inputStyle}
              >
                {availabilityOptions.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                      style={{
                        color:
                          "#07111f",
                      }}
                    >
                      {getAvailabilityLabelForLanguage(option.value)}
                    </option>
                  )
                )}
              </select>
            </label>

            <label
              style={labelStyle}
            >
              {tr("Quantité en stock", "Voorraadaantal", "Stock quantity")}
              <input
                type="number"
                min="0"
                step="1"
                value={
                  form.stock_quantity
                }
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      stock_quantity:
                        event.target
                          .value,
                    })
                  )
                }
                style={inputStyle}
                placeholder={tr("Laisser vide si non géré", "Leeg laten indien niet beheerd", "Leave empty if not managed")}
              />
            </label>

            <label
              style={labelStyle}
            >
              {tr("Ordre d’affichage", "Weergavevolgorde", "Display order")}
              <input
                type="number"
                step="1"
                value={
                  form.sort_order
                }
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      sort_order:
                        event.target
                          .value,
                    })
                  )
                }
                style={inputStyle}
              />
            </label>

            <label
              style={labelStyle}
            >
              {at("storeProductPhoto")}
              <span
                style={{
                  minHeight: "46px",
                  borderRadius: "12px",
                  border:
                    "1px dashed rgba(56,189,248,0.32)",
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "9px",
                  padding:
                    "10px 13px",
                  cursor: "pointer",
                  background:
                    "rgba(56,189,248,0.035)",
                }}
              >
                <ImagePlus
                  size={17}
                />
                <span>
                  {imageFile
                    ? imageFile.name
                    : "JPG, PNG ou WEBP — 5 Mo max"}
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleImageChange
                  }
                  style={{
                    display:
                      "none",
                  }}
                />
              </span>
            </label>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1fr)",
              gap: "14px",
              marginTop: "14px",
            }}
          >
            <label
              style={labelStyle}
            >
              {at("storeDescriptionFr")}
              <textarea
                value={
                  form.description_fr
                }
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      description_fr:
                        event.target
                          .value,
                    })
                  )
                }
                style={
                  textareaStyle
                }
              />
            </label>
          </div>

          <div
            style={{
              display: "flex",
              gap: "18px",
              flexWrap: "wrap",
              marginTop: "16px",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color:
                  "rgba(255,255,255,0.82)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={
                  form.is_published
                }
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      is_published:
                        event.target
                          .checked,
                    })
                  )
                }
              />
              {tr(
                "Publier dans TSB Store",
                "Publiceren in TSB Store",
                "Publish in TSB Store"
              )}
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color:
                  "rgba(255,255,255,0.82)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={
                  form.is_featured
                }
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      is_featured:
                        event.target
                          .checked,
                    })
                  )
                }
              />
              {tr(
                "Mettre en avant",
                "Uitlichten",
                "Feature product"
              )}
            </label>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent:
                "flex-end",
              gap: "10px",
              flexWrap: "wrap",
              marginTop: "18px",
            }}
          >
            <button
              type="button"
              className="button button--secondary"
              onClick={resetForm}
              disabled={saving}
            >
              {tr(
                "Annuler",
                "Annuleren",
                "Cancel"
              )}
            </button>

            <button
              type="submit"
              className="button button--primary"
              disabled={saving}
            >
              {saving
                ? tr(
                    "Enregistrement...",
                    "Opslaan...",
                    "Saving..."
                  )
                : editingId
                  ? tr(
                      "Enregistrer les modifications",
                      "Wijzigingen opslaan",
                      "Save changes"
                    )
                  : tr(
                      "Ajouter le produit",
                      "Product toevoegen",
                      "Add product"
                    )}
            </button>
          </div>
        </form>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1fr) minmax(180px, 260px)",
          gap: "12px",
          marginTop: "22px",
        }}
      >
        <div
          style={{
            position: "relative",
          }}
        >
          <Search
            size={17}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform:
                "translateY(-50%)",
              opacity: 0.52,
            }}
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value
              )
            }
            placeholder={tr("Rechercher par nom, SKU ou slug...", "Zoeken op naam, SKU of slug...", "Search by name, SKU or slug...")}
            style={{
              ...inputStyle,
              paddingLeft: "42px",
            }}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(event) =>
            setCategoryFilter(
              event.target
                .value as
                | "all"
                | StoreCategory
            )
          }
          style={inputStyle}
        >
          <option
            value="all"
            style={{
              color: "#07111f",
            }}
          >
            {tr(
              "Tous les domaines",
              "Alle domeinen",
              "All categories"
            )}
          </option>

          {categoryOptions.map(
            (option) => (
              <option
                key={option.value}
                value={option.value}
                style={{
                  color:
                    "#07111f",
                }}
              >
                {getCategoryLabelForLanguage(option.value)}
              </option>
            )
          )}
        </select>
      </div>

      <div
        style={{
          marginTop: "18px",
        }}
      >
        {loading ? (
          <div
            style={{
              padding: "28px",
              textAlign: "center",
              color:
                "rgba(255,255,255,0.62)",
            }}
          >
            {tr(
              "Chargement du catalogue...",
              "Catalogus laden...",
              "Loading catalogue..."
            )}
          </div>
        ) : filteredProducts.length ===
          0 ? (
          <div
            style={{
              padding: "34px 20px",
              textAlign: "center",
              borderRadius: "16px",
              border:
                "1px dashed rgba(255,255,255,0.1)",
              color:
                "rgba(255,255,255,0.6)",
            }}
          >
            <Package
              size={30}
              style={{
                marginBottom: "9px",
              }}
            />

            <div>
              {tr(
                "Aucun produit trouvé.",
                "Geen product gevonden.",
                "No product found."
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            {paginatedProducts.map(
              (product) => (
                <article
                  key={product.id}
                  style={{
                    overflow:
                      "hidden",
                    borderRadius:
                      "16px",
                    border:
                      "1px solid rgba(255,255,255,0.08)",
                    background:
                      "rgba(255,255,255,0.035)",
                  }}
                >
                  <div
                    style={{
                      height: "92px",
                      background:
                        "linear-gradient(135deg, rgba(56,189,248,0.08), rgba(255,255,255,0.025))",
                      display: "grid",
                      placeItems:
                        "center",
                      overflow:
                        "hidden",
                    }}
                  >
                    {product.image_url ? (
                      <img
                        src={
                          product.image_url
                        }
                        alt={
                          product.name_fr
                        }
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
                        size={38}
                        style={{
                          opacity:
                            0.35,
                        }}
                      />
                    )}
                  </div>

                  <div
                    style={{
                      padding:
                        "12px",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display:
                              "flex",
                            gap: "6px",
                            flexWrap:
                              "wrap",
                            marginBottom:
                              "7px",
                          }}
                        >
                          <span className="section__eyebrow">
                            {getCategoryLabelForLanguage(
                              product.category
                            )}
                          </span>

                          {product.is_featured && (
                            <span
                              title={tr(
                                "Produit mis en avant",
                                "Uitgelicht product",
                                "Featured product"
                              )}
                              style={{
                                color:
                                  "#facc15",
                              }}
                            >
                              <Star
                                size={
                                  15
                                }
                                fill="currentColor"
                              />
                            </span>
                          )}
                        </div>

                        <h3
                          style={{
                            margin: 0,
                            fontSize:
                              "1rem",
                          }}
                        >
                          {
                            getLocalizedProductName(
                              product
                            )
                          }
                        </h3>
                      </div>

                      <span
                        style={{
                          flex:
                            "0 0 auto",
                          padding:
                            "5px 8px",
                          borderRadius:
                            "999px",
                          fontSize:
                            "0.7rem",
                          fontWeight:
                            800,
                          background:
                            product.is_published
                              ? "rgba(34,197,94,0.12)"
                              : "rgba(148,163,184,0.12)",
                          color:
                            product.is_published
                              ? "#86efac"
                              : "rgba(255,255,255,0.58)",
                        }}
                      >
                        {product.is_published
                          ? tr("PUBLIÉ", "GEPUBLICEERD", "PUBLISHED")
                          : tr("BROUILLON", "CONCEPT", "DRAFT")}
                      </span>
                    </div>

                    <div
                      style={{
                        display:
                          "grid",
                        gap: "5px",
                        marginTop:
                          "12px",
                        fontSize:
                          "0.82rem",
                        color:
                          "rgba(255,255,255,0.62)",
                      }}
                    >
                      <span>
                        {at("storeSkuLabel")}{" "}
                        {product.sku ||
                          "—"}
                      </span>

                      <span>
                        {tr("Prix", "Prijs", "Price")} :{" "}
                        {product.price ===
                        null
                          ? tr(
                              "Sur demande",
                              "Op aanvraag",
                              "On request"
                            )
                          : `${Number(
                              product.price
                            ).toFixed(
                              2
                            )} ${product.currency}`}
                      </span>

                      <span>
                        {tr("Disponibilité", "Beschikbaarheid", "Availability")} :{" "}
                        {getAvailabilityLabelForLanguage(
                          product.availability
                        )}
                      </span>

                      <span>
                        {tr("Stock", "Voorraad", "Stock")} :{" "}
                        {product.stock_quantity ===
                        null
                          ? tr(
                              "Non géré",
                              "Niet beheerd",
                              "Not managed"
                            )
                          : product.stock_quantity}
                      </span>
                    </div>

                    <div
                      style={{
                        display:
                          "flex",
                        gap: "8px",
                        marginTop:
                          "14px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          openEditForm(
                            product
                          )
                        }
                        style={{
                          flex: 1,
                          minHeight:
                            "38px",
                          borderRadius:
                            "10px",
                          border:
                            "1px solid rgba(56,189,248,0.2)",
                          background:
                            "rgba(56,189,248,0.08)",
                          color:
                            "#7dd3fc",
                          display:
                            "inline-flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          gap: "7px",
                          cursor:
                            "pointer",
                          fontWeight:
                            750,
                        }}
                      >
                        <Pencil
                          size={15}
                        />
                        {tr(
                          "Modifier",
                          "Bewerken",
                          "Edit"
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void handleDelete(
                            product
                          )
                        }
                        disabled={
                          deletingId ===
                          product.id
                        }
                        aria-label={`${tr(
                          "Supprimer",
                          "Verwijderen",
                          "Delete"
                        )} ${getLocalizedProductName(
                          product
                        )}`}
                        style={{
                          width: "42px",
                          minHeight:
                            "38px",
                          borderRadius:
                            "10px",
                          border:
                            "1px solid rgba(248,113,113,0.22)",
                          background:
                            "rgba(248,113,113,0.07)",
                          color:
                            "#fca5a5",
                          display:
                            "grid",
                          placeItems:
                            "center",
                          cursor:
                            deletingId ===
                            product.id
                              ? "wait"
                              : "pointer",
                        }}
                      >
                        <Trash2
                          size={16}
                        />
                      </button>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        )}

        {filteredProducts.length > 0 &&
          totalProductPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                marginTop: "16px",
              }}
            >
              <button
                type="button"
                className="button button--secondary"
                onClick={() =>
                  setProductPage((page) =>
                    Math.max(1, page - 1)
                  )
                }
                disabled={safeProductPage <= 1}
                style={{
                  minHeight: "34px",
                  padding: "0 12px",
                  opacity:
                    safeProductPage <= 1
                      ? 0.45
                      : 1,
                }}
              >
                {tr(
                  "← Précédent",
                  "← Vorige",
                  "← Previous"
                )}
              </button>

              <span
                style={{
                  fontSize: "0.8rem",
                  color:
                    "rgba(255,255,255,0.62)",
                }}
              >
                {tr(
                  "Page",
                  "Pagina",
                  "Page"
                )}{" "}
                {safeProductPage} /{" "}
                {totalProductPages}
              </span>

              <button
                type="button"
                className="button button--secondary"
                onClick={() =>
                  setProductPage((page) =>
                    Math.min(
                      totalProductPages,
                      page + 1
                    )
                  )
                }
                disabled={
                  safeProductPage >=
                  totalProductPages
                }
                style={{
                  minHeight: "34px",
                  padding: "0 12px",
                  opacity:
                    safeProductPage >=
                    totalProductPages
                      ? 0.45
                      : 1,
                }}
              >
                {tr(
                  "Suivant →",
                  "Volgende →",
                  "Next →"
                )}
              </button>
            </div>
          )}
      </div>
      </div>

      {activeStoreView ===
        "requests" && (
        <div
          style={{
            marginTop: "18px",
          }}
        >
          {requestMessage && (
            <p
              style={{
                margin: "0 0 14px",
                padding: "10px 12px",
                borderRadius: "12px",
                border:
                  "1px solid rgba(255,255,255,0.08)",
                background:
                  "rgba(255,255,255,0.04)",
                color:
                  requestMessage.includes(
                    "Impossible"
                  ) ||
                  requestMessage.includes(
                    "Erreur"
                  ) ||
                  requestMessage.includes(
                    "kon niet"
                  ) ||
                  requestMessage.includes(
                    "Fout"
                  ) ||
                  requestMessage.includes(
                    "Unable"
                  ) ||
                  requestMessage.includes(
                    "Error"
                  )
                    ? "#fca5a5"
                    : "#86efac",
                fontWeight: 700,
              }}
            >
              {requestMessage}
            </p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            {[
              {
                label: tr(
                  "Total",
                  "Totaal",
                  "Total"
                ),
                value:
                  storeRequests.length,
              },
              {
                label: tr(
                  "À traiter",
                  "Te behandelen",
                  "To process"
                ),
                value:
                  pendingStoreRequestCount,
              },
              {
                label: tr(
                  "Terminées",
                  "Afgerond",
                  "Completed"
                ),
                value:
                  storeRequests.filter(
                    (request) =>
                      request.status ===
                      "completed"
                  ).length,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  padding:
                    "14px 16px",
                  borderRadius:
                    "14px",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  background:
                    "rgba(255,255,255,0.035)",
                }}
              >
                <div
                  style={{
                    color:
                      "rgba(255,255,255,0.52)",
                    fontSize:
                      "0.75rem",
                    fontWeight: 800,
                    letterSpacing:
                      "0.08em",
                    textTransform:
                      "uppercase",
                  }}
                >
                  {stat.label}
                </div>

                <strong
                  style={{
                    display: "block",
                    marginTop: "5px",
                    fontSize:
                      "1.45rem",
                    color: "#ffffff",
                  }}
                >
                  {stat.value}
                </strong>
              </div>
            ))}
          </div>

          {requestMessage && (
            <p
              style={{
                margin:
                  "0 0 14px",
                color:
                  requestMessage.includes(
                    "Impossible"
                  ) ||
                  requestMessage.includes(
                    "kon niet"
                  ) ||
                  requestMessage.includes(
                    "Unable"
                  )
                    ? "#fca5a5"
                    : "#86efac",
                fontWeight: 700,
              }}
            >
              {requestMessage}
            </p>
          )}

          {requestsLoading ? (
            <div
              style={{
                padding: "30px 0",
                textAlign:
                  "center",
                color:
                  "rgba(255,255,255,0.55)",
              }}
            >
              {tr(
                "Chargement des demandes...",
                "Aanvragen laden...",
                "Loading requests..."
              )}
            </div>
          ) : storeRequests.length ===
            0 ? (
            <div
              style={{
                padding: "34px 0",
                textAlign:
                  "center",
                color:
                  "rgba(255,255,255,0.5)",
              }}
            >
              {tr(
                "Aucune demande TSB Store pour le moment.",
                "Nog geen TSB Store-aanvragen.",
                "No TSB Store requests yet."
              )}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {storeRequests.map(
                (request) => {
                  const {
                    productName,
                    reference,
                  } =
                    getStoreRequestProduct(
                      request
                    );

                  return (
                    <article
                      key={
                        request.id
                      }
                      style={{
                        padding:
                          "16px",
                        borderRadius:
                          "14px",
                        border:
                          "1px solid rgba(56,189,248,0.16)",
                        background:
                          "rgba(255,255,255,0.028)",
                        boxShadow:
                          "inset 3px 0 0 rgba(56,189,248,0.7)",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "flex-start",
                          gap: "14px",
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <div
                          style={{
                            minWidth: 0,
                          }}
                        >
                          <span
                            className="section__eyebrow"
                            style={{
                              display:
                                "block",
                              marginBottom:
                                "5px",
                            }}
                          >
                            {tr(
                              "DEMANDE PRODUIT",
                              "PRODUCTAANVRAAG",
                              "PRODUCT REQUEST"
                            )}
                          </span>

                          <h3
                            style={{
                              margin:
                                "0 0 5px",
                              color:
                                "#ffffff",
                            }}
                          >
                            {
                              productName
                            }
                          </h3>

                          {reference && (
                            <div
                              style={{
                                color:
                                  "rgba(255,255,255,0.48)",
                                fontSize:
                                  "0.75rem",
                              }}
                            >
                              {tr(
                                "Référence",
                                "Referentie",
                                "Reference"
                              )}
                              :{" "}
                              {
                                reference
                              }
                            </div>
                          )}
                        </div>

                        <select
                          value={
                            request.status
                          }
                          disabled={
                            requestUpdatingId ===
                            request.id
                          }
                          onChange={(
                            event
                          ) =>
                            void updateStoreRequestStatus(
                              request.id,
                              event
                                .target
                                .value
                            )
                          }
                          style={{
                            minHeight:
                              "38px",
                            padding:
                              "0 10px",
                            borderRadius:
                              "9px",
                            border:
                              "1px solid rgba(255,255,255,0.12)",
                            background:
                              "#0f1d2e",
                            color:
                              "#ffffff",
                          }}
                        >
                          <option value="received">
                            {tr(
                              "Reçue",
                              "Ontvangen",
                              "Received"
                            )}
                          </option>
                          <option value="in_progress">
                            {tr(
                              "En cours",
                              "In behandeling",
                              "In progress"
                            )}
                          </option>
                          <option value="completed">
                            {tr(
                              "Terminée",
                              "Afgerond",
                              "Completed"
                            )}
                          </option>
                          <option value="cancelled">
                            {tr(
                              "Annulée",
                              "Geannuleerd",
                              "Cancelled"
                            )}
                          </option>
                        </select>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(190px, 1fr))",
                          gap: "10px",
                          marginTop:
                            "14px",
                          paddingTop:
                            "13px",
                          borderTop:
                            "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <div>
                          <strong
                            style={{
                              display:
                                "block",
                              color:
                                "#ffffff",
                              fontSize:
                                "0.84rem",
                            }}
                          >
                            {
                              request.name
                            }
                          </strong>

                          <span
                            style={{
                              color:
                                "rgba(255,255,255,0.5)",
                              fontSize:
                                "0.74rem",
                            }}
                          >
                            {getRequestStatusLabel(
                              request.status
                            )}
                          </span>
                        </div>

                        <div
                          style={{
                            display:
                              "grid",
                            gap: "5px",
                            color:
                              "rgba(255,255,255,0.62)",
                            fontSize:
                              "0.76rem",
                          }}
                        >
                          <span>
                            <Mail
                              size={13}
                              style={{
                                marginRight:
                                  "6px",
                                verticalAlign:
                                  "middle",
                              }}
                            />
                            {
                              request.email
                            }
                          </span>

                          <span>
                            <Phone
                              size={13}
                              style={{
                                marginRight:
                                  "6px",
                                verticalAlign:
                                  "middle",
                              }}
                            />
                            {
                              request.phone
                            }
                          </span>
                        </div>

                        <div
                          style={{
                            display:
                              "grid",
                            gap: "5px",
                            color:
                              "rgba(255,255,255,0.55)",
                            fontSize:
                              "0.76rem",
                          }}
                        >
                          {request.company && (
                            <span>
                              <Building2
                                size={13}
                                style={{
                                  marginRight:
                                    "6px",
                                  verticalAlign:
                                    "middle",
                                }}
                              />
                              {
                                request.company
                              }
                            </span>
                          )}

                          <span>
                            <CalendarDays
                              size={13}
                              style={{
                                marginRight:
                                  "6px",
                                verticalAlign:
                                  "middle",
                              }}
                            />
                            {formatRequestDate(
                              request.created_at
                            )}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "flex-end",
                          marginTop: "14px",
                          paddingTop: "12px",
                          borderTop:
                            "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <button
                          type="button"
                          className="button button--primary"
                          disabled={
                            orderCreatingRequestId ===
                              request.id ||
                            storeOrders.some(
                              (order) =>
                                order.request_id ===
                                request.id
                            )
                          }
                          onClick={() =>
                            void createOrderFromRequest(
                              request
                            )
                          }
                          style={{
                            minHeight: "38px",
                            padding:
                              "0 13px",
                          }}
                        >
                          {storeOrders.some(
                            (order) =>
                              order.request_id ===
                              request.id
                          )
                            ? tr(
                                "Commande créée",
                                "Bestelling aangemaakt",
                                "Order created"
                              )
                            : orderCreatingRequestId ===
                                request.id
                              ? tr(
                                  "Création...",
                                  "Aanmaken...",
                                  "Creating..."
                                )
                              : tr(
                                  "Créer une commande",
                                  "Bestelling aanmaken",
                                  "Create order"
                                )}
                        </button>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </div>
      )}

      {activeStoreView ===
        "orders" && (
        <div
          style={{
            marginTop: "18px",
          }}
        >
          {invoiceMessage && (
            <p
              style={{
                margin:
                  "0 0 14px",
                color:
                  invoiceMessage.includes(
                    "Impossible"
                  ) ||
                  invoiceMessage.includes(
                    "kon niet"
                  ) ||
                  invoiceMessage.includes(
                    "Unable"
                  )
                    ? "#fca5a5"
                    : "#86efac",
                fontWeight: 700,
              }}
            >
              {invoiceMessage}
            </p>
          )}

          {orderMessage && (
            <p
              style={{
                margin:
                  "0 0 14px",
                color:
                  orderMessage.includes(
                    "Impossible"
                  ) ||
                  orderMessage.includes(
                    "kon niet"
                  ) ||
                  orderMessage.includes(
                    "Unable"
                  )
                    ? "#fca5a5"
                    : "#86efac",
                fontWeight: 700,
              }}
            >
              {orderMessage}
            </p>
          )}

          {ordersLoading ? (
            <div
              style={{
                padding: "30px 0",
                textAlign:
                  "center",
                color:
                  "rgba(255,255,255,0.55)",
              }}
            >
              {tr(
                "Chargement des commandes...",
                "Bestellingen laden...",
                "Loading orders..."
              )}
            </div>
          ) : storeOrders.length ===
            0 ? (
            <div
              style={{
                padding: "34px 0",
                textAlign:
                  "center",
                color:
                  "rgba(255,255,255,0.5)",
              }}
            >
              {tr(
                "Aucune commande pour le moment.",
                "Nog geen bestellingen.",
                "No orders yet."
              )}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {storeOrders.map(
                (order) => {
                  const isEditing =
                    editingOrderId ===
                    order.id;

                  const previewTotal =
                    isEditing
                      ? getOrderEditPreviewTotal(
                          order
                        )
                      : null;

                  const orderItems =
                    storeOrderItems
                      .filter(
                        (item) =>
                          item.order_id === order.id
                      )
                      .sort(
                        (a, b) =>
                          a.sort_order - b.sort_order
                      );

                  const isMultiItemOrder =
                    orderItems.length > 1;

                  return (
                    <article
                      key={order.id}
                      style={{
                        padding: "16px",
                        borderRadius:
                          "14px",
                        border:
                          isEditing
                            ? "1px solid rgba(56,189,248,0.42)"
                            : "1px solid rgba(56,189,248,0.16)",
                        background:
                          isEditing
                            ? "rgba(56,189,248,0.055)"
                            : "rgba(255,255,255,0.028)",
                        boxShadow:
                          "inset 3px 0 0 rgba(56,189,248,0.7)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          gap: "14px",
                          flexWrap:
                            "wrap",
                          alignItems:
                            "flex-start",
                        }}
                      >
                        <div>
                          <span
                            className="section__eyebrow"
                            style={{
                              display:
                                "block",
                              marginBottom:
                                "5px",
                            }}
                          >
                            {
                              order.order_number
                            }
                          </span>

                          <h3
                            style={{
                              margin:
                                "0 0 5px",
                              color:
                                "#ffffff",
                            }}
                          >
                            {getLocalizedStoredOrderProductName(
                              order.product_name,
                              order.product_id,
                              order.sku
                            )}
                          </h3>

                          {order.sku && (
                            <div
                              style={{
                                color:
                                  "rgba(255,255,255,0.48)",
                                fontSize:
                                  "0.75rem",
                              }}
                            >
                              {tr(
                                "Référence",
                                "Referentie",
                                "Reference"
                              )}
                              : {order.sku}
                            </div>
                          )}
                        </div>

                        <select
                          value={
                            order.status
                          }
                          disabled={
                            orderUpdatingId ===
                              order.id ||
                            isEditing
                          }
                          onChange={(
                            event
                          ) =>
                            void updateStoreOrderStatus(
                              order.id,
                              event.target
                                .value
                            )
                          }
                          style={{
                            minHeight:
                              "38px",
                            padding:
                              "0 10px",
                            borderRadius:
                              "9px",
                            border:
                              "1px solid rgba(255,255,255,0.12)",
                            background:
                              "#0f1d2e",
                            color:
                              "#ffffff",
                          }}
                        >
                          <option value="draft">
                            {tr(
                              "Brouillon",
                              "Concept",
                              "Draft"
                            )}
                          </option>
                          <option value="confirmed">
                            {tr(
                              "Confirmée",
                              "Bevestigd",
                              "Confirmed"
                            )}
                          </option>
                          <option value="processing">
                            {tr(
                              "En préparation",
                              "In verwerking",
                              "Processing"
                            )}
                          </option>
                          <option value="ready">
                            {tr(
                              "Prête",
                              "Klaar",
                              "Ready"
                            )}
                          </option>
                          <option value="completed">
                            {tr(
                              "Terminée",
                              "Afgerond",
                              "Completed"
                            )}
                          </option>
                          <option value="cancelled">
                            {tr(
                              "Annulée",
                              "Geannuleerd",
                              "Cancelled"
                            )}
                          </option>
                        </select>
                      </div>

                      {isMultiItemOrder && (
                        <div
                          style={{
                            display: "grid",
                            gap: "8px",
                            marginTop: "14px",
                            padding: "12px",
                            borderRadius: "12px",
                            border:
                              "1px solid rgba(56,189,248,0.14)",
                            background: "rgba(7,16,28,0.55)",
                          }}
                        >
                          <strong
                            style={{
                              color: "#7dd3fc",
                              fontSize: "0.8rem",
                            }}
                          >
                            {tr(
                              `${orderItems.length} produits dans cette commande`,
                              `${orderItems.length} producten in deze bestelling`,
                              `${orderItems.length} products in this order`
                            )}
                          </strong>

                          {orderItems.map((item, index) => (
                            <div
                              key={item.id}
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "minmax(0, 1fr) auto",
                                gap: "10px",
                                alignItems: "center",
                                paddingTop: index === 0 ? 0 : "8px",
                                borderTop:
                                  index === 0
                                    ? "none"
                                    : "1px solid rgba(255,255,255,0.06)",
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    color: "#ffffff",
                                    fontWeight: 800,
                                    fontSize: "0.82rem",
                                  }}
                                >
                                  {index + 1}.{" "}
                                  {getLocalizedStoredOrderProductName(
                                    item.product_name,
                                    item.product_id,
                                    item.sku
                                  )}
                                </div>
                                <div
                                  style={{
                                    color: "rgba(255,255,255,0.48)",
                                    fontSize: "0.72rem",
                                    marginTop: "2px",
                                  }}
                                >
                                  {item.sku
                                    ? `${tr("Réf.", "Ref.", "Ref.")} ${item.sku} · `
                                    : ""}
                                  {tr("Qté", "Aantal", "Qty")}: {item.quantity}
                                </div>
                              </div>

                              {isEditing ? (
                                <div
                                  style={{
                                    display:
                                      "grid",
                                    gridTemplateColumns:
                                      "76px 116px",
                                    gap: "8px",
                                    alignItems:
                                      "end",
                                  }}
                                >
                                  <label
                                    style={{
                                      display:
                                        "grid",
                                      gap: "4px",
                                    }}
                                  >
                                    <span
                                      style={{
                                        color:
                                          "rgba(255,255,255,0.5)",
                                        fontSize:
                                          "0.65rem",
                                        fontWeight:
                                          800,
                                      }}
                                    >
                                      {tr(
                                        "Qté",
                                        "Aantal",
                                        "Qty"
                                      )}
                                    </span>
                                    <input
                                      type="number"
                                      min="1"
                                      step="1"
                                      value={
                                        orderItemEditForms[
                                          item.id
                                        ]
                                          ?.quantity ??
                                        String(
                                          item.quantity
                                        )
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        setOrderItemEditForms(
                                          (
                                            previous
                                          ) => ({
                                            ...previous,
                                            [item.id]:
                                              {
                                                quantity:
                                                  event
                                                    .target
                                                    .value,
                                                unit_price:
                                                  previous[
                                                    item
                                                      .id
                                                  ]
                                                    ?.unit_price ??
                                                  (item.unit_price ==
                                                  null
                                                    ? ""
                                                    : String(
                                                        item.unit_price
                                                      )),
                                              },
                                          })
                                        )
                                      }
                                      style={{
                                        width:
                                          "100%",
                                        minHeight:
                                          "36px",
                                        borderRadius:
                                          "8px",
                                        border:
                                          "1px solid rgba(255,255,255,0.12)",
                                        background:
                                          "rgba(0,0,0,0.2)",
                                        color:
                                          "#ffffff",
                                        padding:
                                          "0 8px",
                                      }}
                                    />
                                  </label>

                                  <label
                                    style={{
                                      display:
                                        "grid",
                                      gap: "4px",
                                    }}
                                  >
                                    <span
                                      style={{
                                        color:
                                          "rgba(255,255,255,0.5)",
                                        fontSize:
                                          "0.65rem",
                                        fontWeight:
                                          800,
                                      }}
                                    >
                                      {tr(
                                        "Prix unitaire",
                                        "Eenheidsprijs",
                                        "Unit price"
                                      )}
                                    </span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={
                                        orderItemEditForms[
                                          item.id
                                        ]
                                          ?.unit_price ??
                                        (item.unit_price ==
                                        null
                                          ? ""
                                          : String(
                                              item.unit_price
                                            ))
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        setOrderItemEditForms(
                                          (
                                            previous
                                          ) => ({
                                            ...previous,
                                            [item.id]:
                                              {
                                                quantity:
                                                  previous[
                                                    item
                                                      .id
                                                  ]
                                                    ?.quantity ??
                                                  String(
                                                    item.quantity
                                                  ),
                                                unit_price:
                                                  event
                                                    .target
                                                    .value,
                                              },
                                          })
                                        )
                                      }
                                      placeholder="0.00"
                                      style={{
                                        width:
                                          "100%",
                                        minHeight:
                                          "36px",
                                        borderRadius:
                                          "8px",
                                        border:
                                          "1px solid rgba(56,189,248,0.3)",
                                        background:
                                          "rgba(0,0,0,0.2)",
                                        color:
                                          "#ffffff",
                                        padding:
                                          "0 8px",
                                      }}
                                    />
                                  </label>
                                </div>
                              ) : (
                                <div
                                  style={{
                                    color:
                                      "#ffffff",
                                    fontWeight:
                                      800,
                                    fontSize:
                                      "0.78rem",
                                    textAlign:
                                      "right",
                                  }}
                                >
                                  {formatOrderCurrency(
                                    item.line_total,
                                    item.currency
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(180px, 1fr))",
                          gap: "10px",
                          marginTop:
                            "14px",
                          paddingTop:
                            "13px",
                          borderTop:
                            "1px solid rgba(255,255,255,0.07)",
                          color:
                            "rgba(255,255,255,0.62)",
                          fontSize:
                            "0.78rem",
                        }}
                      >
                        <div>
                          <strong
                            style={{
                              display:
                                "block",
                              color:
                                "#ffffff",
                              marginBottom:
                                "4px",
                            }}
                          >
                            {
                              order.customer_name
                            }
                          </strong>
                          {
                            order.customer_email
                          }
                          {order.company && (
                            <>
                              <br />
                              {
                                order.company
                              }
                            </>
                          )}
                        </div>

                        <div>
                          {isMultiItemOrder ? (
                            <>
                              {tr(
                                "Produits",
                                "Producten",
                                "Products"
                              )}
                              :{" "}
                              {
                                orderItems.length
                              }
                              <br />
                              {tr(
                                "Sous-total produits",
                                "Subtotaal producten",
                                "Products subtotal"
                              )}
                              :{" "}
                              {formatOrderCurrency(
                                order.unit_price,
                                order.currency
                              )}
                            </>
                          ) : (
                            <>
                              {tr(
                                "Quantité",
                                "Aantal",
                                "Quantity"
                              )}
                              :{" "}
                              {
                                order.quantity
                              }
                              <br />
                              {tr(
                                "Prix unitaire",
                                "Eenheidsprijs",
                                "Unit price"
                              )}
                              :{" "}
                              {formatOrderCurrency(
                                order.unit_price,
                                order.currency
                              )}
                            </>
                          )}
                        </div>

                        <div>
                          {tr(
                            "Remise",
                            "Korting",
                            "Discount"
                          )}
                          :{" "}
                          {formatOrderCurrency(
                            order.discount_amount,
                            order.currency
                          )}
                          <br />
                          {tr(
                            "Frais",
                            "Kosten",
                            "Fees"
                          )}
                          :{" "}
                          {formatOrderCurrency(
                            order.fees_amount,
                            order.currency
                          )}
                        </div>

                        <div>
                          <strong
                            style={{
                              display:
                                "block",
                              color:
                                "#7dd3fc",
                              marginBottom:
                                "4px",
                            }}
                          >
                            {tr(
                              "TOTAL",
                              "TOTAAL",
                              "TOTAL"
                            )}
                          </strong>
                          <span
                            style={{
                              color:
                                "#ffffff",
                              fontWeight:
                                900,
                              fontSize:
                                "1rem",
                            }}
                          >
                            {formatOrderCurrency(
                              order.total_amount,
                              order.currency
                            )}
                          </span>
                        </div>

                        <div>
                          {getOrderStatusLabel(
                            order.status
                          )}
                          <br />
                          {formatRequestDate(
                            order.created_at
                          )}
                        </div>
                      </div>

                      {order.notes && !isEditing && (
                        <div
                          style={{
                            marginTop:
                              "12px",
                            padding:
                              "11px 12px",
                            borderRadius:
                              "10px",
                            background:
                              "rgba(255,255,255,0.035)",
                            color:
                              "rgba(255,255,255,0.64)",
                            fontSize:
                              "0.8rem",
                            lineHeight:
                              1.55,
                          }}
                        >
                          <strong
                            style={{
                              color:
                                "rgba(255,255,255,0.85)",
                            }}
                          >
                            {tr(
                              "Notes",
                              "Notities",
                              "Notes"
                            )}
                            :
                          </strong>{" "}
                          {order.notes}
                        </div>
                      )}

                      {isEditing && (
                        <div
                          style={{
                            marginTop:
                              "15px",
                            paddingTop:
                              "15px",
                            borderTop:
                              "1px solid rgba(56,189,248,0.18)",
                          }}
                        >
                          {isMultiItemOrder && (
                            <div
                              style={{
                                marginBottom:
                                  "12px",
                                padding:
                                  "10px 12px",
                                borderRadius:
                                  "10px",
                                border:
                                  "1px solid rgba(56,189,248,0.18)",
                                background:
                                  "rgba(56,189,248,0.06)",
                                color:
                                  "rgba(255,255,255,0.72)",
                                fontSize:
                                  "0.76rem",
                                lineHeight:
                                  1.5,
                              }}
                            >
                              {tr(
                                "Renseignez la quantité et le prix unitaire de chaque produit ci-dessus. La remise et les frais s’appliquent ensuite au total de la commande.",
                                "Vul hierboven de hoeveelheid en eenheidsprijs van elk product in. Korting en kosten worden daarna op het totaal van de bestelling toegepast.",
                                "Enter the quantity and unit price for each product above. Discount and fees are then applied to the order total."
                              )}
                            </div>
                          )}

                          <div
                            style={{
                              display:
                                "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(155px, 1fr))",
                              gap:
                                "12px",
                            }}
                          >
                            {!isMultiItemOrder && (
                              <>

                            <label
                              style={{
                                display:
                                  "grid",
                                gap: "6px",
                              }}
                            >
                              <span
                                style={{
                                  color:
                                    "rgba(255,255,255,0.62)",
                                  fontSize:
                                    "0.76rem",
                                  fontWeight:
                                    800,
                                }}
                              >
                                {tr(
                                  "Quantité",
                                  "Aantal",
                                  "Quantity"
                                )}
                              </span>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={
                                  orderEditForm.quantity
                                }
                                onChange={(
                                  event
                                ) =>
                                  setOrderEditForm(
                                    (
                                      previous
                                    ) => ({
                                      ...previous,
                                      quantity:
                                        event
                                          .target
                                          .value,
                                    })
                                  )
                                }
                                style={{
                                  minHeight:
                                    "40px",
                                  borderRadius:
                                    "9px",
                                  border:
                                    "1px solid rgba(255,255,255,0.12)",
                                  background:
                                    "rgba(0,0,0,0.16)",
                                  color:
                                    "#ffffff",
                                  padding:
                                    "0 10px",
                                }}
                              />
                            </label>

                            <label
                              style={{
                                display:
                                  "grid",
                                gap: "6px",
                              }}
                            >
                              <span
                                style={{
                                  color:
                                    "rgba(255,255,255,0.62)",
                                  fontSize:
                                    "0.76rem",
                                  fontWeight:
                                    800,
                                }}
                              >
                                {tr(
                                  "Prix unitaire",
                                  "Eenheidsprijs",
                                  "Unit price"
                                )}
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  orderEditForm.unit_price
                                }
                                onChange={(
                                  event
                                ) =>
                                  setOrderEditForm(
                                    (
                                      previous
                                    ) => ({
                                      ...previous,
                                      unit_price:
                                        event
                                          .target
                                          .value,
                                    })
                                  )
                                }
                                placeholder="0.00"
                                style={{
                                  minHeight:
                                    "40px",
                                  borderRadius:
                                    "9px",
                                  border:
                                    "1px solid rgba(255,255,255,0.12)",
                                  background:
                                    "rgba(0,0,0,0.16)",
                                  color:
                                    "#ffffff",
                                  padding:
                                    "0 10px",
                                }}
                              />
                            </label>

                              </>
                            )}

                            <label
                              style={{
                                display:
                                  "grid",
                                gap: "6px",
                              }}
                            >
                              <span
                                style={{
                                  color:
                                    "rgba(255,255,255,0.62)",
                                  fontSize:
                                    "0.76rem",
                                  fontWeight:
                                    800,
                                }}
                              >
                                {tr(
                                  "Devise",
                                  "Valuta",
                                  "Currency"
                                )}
                              </span>
                              <select
                                value={
                                  orderEditForm.currency
                                }
                                onChange={(
                                  event
                                ) =>
                                  setOrderEditForm(
                                    (
                                      previous
                                    ) => ({
                                      ...previous,
                                      currency:
                                        event
                                          .target
                                          .value,
                                    })
                                  )
                                }
                                style={{
                                  minHeight:
                                    "40px",
                                  borderRadius:
                                    "9px",
                                  border:
                                    "1px solid rgba(255,255,255,0.12)",
                                  background:
                                    "#0f1d2e",
                                  color:
                                    "#ffffff",
                                  padding:
                                    "0 10px",
                                }}
                              >
                                {CURRENCY_OPTIONS.map(
                                  (
                                    currency
                                  ) => (
                                    <option
                                      key={
                                        currency
                                      }
                                      value={
                                        currency
                                      }
                                    >
                                      {
                                        currency
                                      }
                                    </option>
                                  )
                                )}
                              </select>
                            </label>

                            <label
                              style={{
                                display:
                                  "grid",
                                gap: "6px",
                              }}
                            >
                              <span
                                style={{
                                  color:
                                    "rgba(255,255,255,0.62)",
                                  fontSize:
                                    "0.76rem",
                                  fontWeight:
                                    800,
                                }}
                              >
                                {tr(
                                  "Remise",
                                  "Korting",
                                  "Discount"
                                )}
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  orderEditForm.discount_amount
                                }
                                onChange={(
                                  event
                                ) =>
                                  setOrderEditForm(
                                    (
                                      previous
                                    ) => ({
                                      ...previous,
                                      discount_amount:
                                        event
                                          .target
                                          .value,
                                    })
                                  )
                                }
                                style={{
                                  minHeight:
                                    "40px",
                                  borderRadius:
                                    "9px",
                                  border:
                                    "1px solid rgba(255,255,255,0.12)",
                                  background:
                                    "rgba(0,0,0,0.16)",
                                  color:
                                    "#ffffff",
                                  padding:
                                    "0 10px",
                                }}
                              />
                            </label>

                            <label
                              style={{
                                display:
                                  "grid",
                                gap: "6px",
                              }}
                            >
                              <span
                                style={{
                                  color:
                                    "rgba(255,255,255,0.62)",
                                  fontSize:
                                    "0.76rem",
                                  fontWeight:
                                    800,
                                }}
                              >
                                {tr(
                                  "Frais",
                                  "Kosten",
                                  "Fees"
                                )}
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  orderEditForm.fees_amount
                                }
                                onChange={(
                                  event
                                ) =>
                                  setOrderEditForm(
                                    (
                                      previous
                                    ) => ({
                                      ...previous,
                                      fees_amount:
                                        event
                                          .target
                                          .value,
                                    })
                                  )
                                }
                                style={{
                                  minHeight:
                                    "40px",
                                  borderRadius:
                                    "9px",
                                  border:
                                    "1px solid rgba(255,255,255,0.12)",
                                  background:
                                    "rgba(0,0,0,0.16)",
                                  color:
                                    "#ffffff",
                                  padding:
                                    "0 10px",
                                }}
                              />
                            </label>

                            <div
                              style={{
                                display:
                                  "grid",
                                alignContent:
                                  "end",
                                gap: "6px",
                              }}
                            >
                              <span
                                style={{
                                  color:
                                    "rgba(255,255,255,0.62)",
                                  fontSize:
                                    "0.76rem",
                                  fontWeight:
                                    800,
                                }}
                              >
                                {tr(
                                  "Total calculé",
                                  "Berekend totaal",
                                  "Calculated total"
                                )}
                              </span>
                              <div
                                style={{
                                  minHeight:
                                    "40px",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  padding:
                                    "0 10px",
                                  borderRadius:
                                    "9px",
                                  border:
                                    "1px solid rgba(56,189,248,0.22)",
                                  background:
                                    "rgba(56,189,248,0.07)",
                                  color:
                                    "#7dd3fc",
                                  fontWeight:
                                    900,
                                }}
                              >
                                {formatOrderCurrency(
                                  previewTotal,
                                  orderEditForm.currency
                                )}
                              </div>
                            </div>
                          </div>

                          <label
                            style={{
                              display:
                                "grid",
                              gap: "6px",
                              marginTop:
                                "12px",
                            }}
                          >
                            <span
                              style={{
                                color:
                                  "rgba(255,255,255,0.62)",
                                fontSize:
                                  "0.76rem",
                                fontWeight:
                                  800,
                              }}
                            >
                              {tr(
                                "Notes internes / client",
                                "Interne / klantnotities",
                                "Internal / client notes"
                              )}
                            </span>
                            <textarea
                              rows={3}
                              value={
                                orderEditForm.notes
                              }
                              onChange={(
                                event
                              ) =>
                                setOrderEditForm(
                                  (
                                    previous
                                  ) => ({
                                    ...previous,
                                    notes:
                                      event
                                        .target
                                        .value,
                                  })
                                )
                              }
                              placeholder={tr(
                                "Ex. délai, conditions, informations complémentaires...",
                                "Bijv. termijn, voorwaarden, aanvullende informatie...",
                                "E.g. lead time, conditions, additional information..."
                              )}
                              style={{
                                width:
                                  "100%",
                                resize:
                                  "vertical",
                                borderRadius:
                                  "9px",
                                border:
                                  "1px solid rgba(255,255,255,0.12)",
                                background:
                                  "rgba(0,0,0,0.16)",
                                color:
                                  "#ffffff",
                                padding:
                                  "10px",
                                font:
                                  "inherit",
                              }}
                            />
                          </label>

                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "flex-end",
                              gap: "8px",
                              flexWrap:
                                "wrap",
                              marginTop:
                                "12px",
                            }}
                          >
                            <button
                              type="button"
                              className="button"
                              onClick={
                                cancelEditingOrder
                              }
                              disabled={
                                orderSavingId ===
                                order.id
                              }
                            >
                              {tr(
                                "Annuler",
                                "Annuleren",
                                "Cancel"
                              )}
                            </button>

                            <button
                              type="button"
                              className="button button--primary"
                              onClick={() =>
                                void saveOrderEdits(
                                  order.id
                                )
                              }
                              disabled={
                                orderSavingId ===
                                order.id
                              }
                            >
                              {orderSavingId ===
                              order.id
                                ? tr(
                                    "Enregistrement...",
                                    "Opslaan...",
                                    "Saving..."
                                  )
                                : tr(
                                    "Enregistrer",
                                    "Opslaan",
                                    "Save"
                                  )}
                            </button>
                          </div>
                        </div>
                      )}

                      {!isEditing && (
                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "flex-end",
                            gap: "8px",
                            flexWrap:
                              "wrap",
                            marginTop:
                              "14px",
                            paddingTop:
                              "12px",
                            borderTop:
                              "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <button
                            type="button"
                            className="button"
                            onClick={() =>
                              downloadStoreOrderPdf(
                                order
                              )
                            }
                          >
                            <FileDown
                              size={15}
                            />
                            {tr(
                              "Télécharger PDF",
                              "PDF downloaden",
                              "Download PDF"
                            )}
                          </button>
                          {(() => {
                            const invoice =
                              storeInvoices.find(
                                (
                                  currentInvoice
                                ) =>
                                  currentInvoice.order_id ===
                                  order.id
                              );

                            if (invoice) {
                              const invoiceIsDraft =
                                invoice.status ===
                                "draft";

                              return (
                                <>
                                  <span
                                    style={{
                                      minHeight:
                                        "38px",
                                      padding:
                                        "0 10px",
                                      display:
                                        "inline-flex",
                                      alignItems:
                                        "center",
                                      borderRadius:
                                        "9px",
                                      border:
                                        invoiceIsDraft
                                          ? "1px solid rgba(250,204,21,0.18)"
                                          : "1px solid rgba(56,189,248,0.18)",
                                      background:
                                        invoiceIsDraft
                                          ? "rgba(250,204,21,0.06)"
                                          : "rgba(56,189,248,0.06)",
                                      color:
                                        invoiceIsDraft
                                          ? "#fde68a"
                                          : "#7dd3fc",
                                      fontSize:
                                        "0.76rem",
                                      fontWeight:
                                        850,
                                    }}
                                  >
                                    {
                                      invoice.invoice_number
                                    }
                                    {" · "}
                                    {getInvoiceStatusLabel(
                                      invoice
                                    )}
                                  </span>

                                  <label
                                    style={{
                                      display:
                                        "inline-flex",
                                      alignItems:
                                        "center",
                                      gap: "7px",
                                      minHeight:
                                        "38px",
                                      padding:
                                        "0 10px",
                                      borderRadius:
                                        "9px",
                                      border:
                                        "1px solid rgba(255,255,255,0.1)",
                                      background:
                                        "rgba(255,255,255,0.035)",
                                      color:
                                        "rgba(255,255,255,0.72)",
                                      fontSize:
                                        "0.78rem",
                                      fontWeight:
                                        800,
                                    }}
                                  >
                                    {tr(
                                      "TVA",
                                      "BTW",
                                      "VAT"
                                    )}
                                    <select
                                      value={String(
                                        invoice.tax_rate
                                      )}
                                      disabled={
                                        !invoiceIsDraft ||
                                        invoiceVatUpdatingId ===
                                          invoice.id
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        void updateInvoiceVatRate(
                                          invoice,
                                          Number(
                                            event
                                              .target
                                              .value
                                          )
                                        )
                                      }
                                      style={{
                                        minHeight:
                                          "30px",
                                        borderRadius:
                                          "7px",
                                        border:
                                          "1px solid rgba(255,255,255,0.12)",
                                        background:
                                          "#0f1d2e",
                                        color:
                                          "#ffffff",
                                        padding:
                                          "0 8px",
                                      }}
                                    >
                                      <option value="0">
                                        0 %
                                      </option>
                                      <option value="6">
                                        6 %
                                      </option>
                                      <option value="12">
                                        12 %
                                      </option>
                                      <option value="21">
                                        21 %
                                      </option>
                                    </select>
                                  </label>

                                  {invoiceIsDraft ? (
                                    <>
                                      <div
                                        style={{
                                          display:
                                            "inline-flex",
                                          alignItems:
                                            "center",
                                          gap: "6px",
                                          flexWrap:
                                            "wrap",
                                          minHeight:
                                            "38px",
                                          padding:
                                            "6px 8px",
                                          borderRadius:
                                            "9px",
                                          border:
                                            "1px solid rgba(255,255,255,0.1)",
                                          background:
                                            "rgba(255,255,255,0.035)",
                                        }}
                                      >
                                        <span
                                          style={{
                                            color:
                                              "rgba(255,255,255,0.72)",
                                            fontSize:
                                              "0.78rem",
                                            fontWeight:
                                              850,
                                            marginRight:
                                              "2px",
                                          }}
                                        >
                                          {tr(
                                            "Échéance",
                                            "Vervaldatum",
                                            "Due"
                                          )}
                                        </span>

                                        {[7, 15, 30, 45, 60].map(
                                          (
                                            days
                                          ) => {
                                            const presetDate =
                                              getInvoiceDueDateFromDays(
                                                days
                                              );

                                            const isSelected =
                                              invoice.due_date ===
                                              presetDate;

                                            return (
                                              <button
                                                key={
                                                  days
                                                }
                                                type="button"
                                                disabled={
                                                  invoiceUpdatingId ===
                                                  invoice.id
                                                }
                                                onClick={() =>
                                                  void updateInvoiceDueDate(
                                                    invoice,
                                                    presetDate
                                                  )
                                                }
                                                style={{
                                                  minHeight:
                                                    "30px",
                                                  padding:
                                                    "0 9px",
                                                  borderRadius:
                                                    "7px",
                                                  border:
                                                    isSelected
                                                      ? "1px solid rgba(56,189,248,0.55)"
                                                      : "1px solid rgba(255,255,255,0.1)",
                                                  background:
                                                    isSelected
                                                      ? "rgba(56,189,248,0.14)"
                                                      : "rgba(255,255,255,0.03)",
                                                  color:
                                                    isSelected
                                                      ? "#7dd3fc"
                                                      : "rgba(255,255,255,0.72)",
                                                  fontSize:
                                                    "0.74rem",
                                                  fontWeight:
                                                    850,
                                                  cursor:
                                                    invoiceUpdatingId ===
                                                    invoice.id
                                                      ? "not-allowed"
                                                      : "pointer",
                                                }}
                                              >
                                                +
                                                {
                                                  days
                                                }{" "}
                                                {tr(
                                                  "j",
                                                  "d",
                                                  "d"
                                                )}
                                              </button>
                                            );
                                          }
                                        )}

                                        <label
                                          style={{
                                            display:
                                              "inline-flex",
                                            alignItems:
                                              "center",
                                            gap: "6px",
                                            minHeight:
                                              "30px",
                                            padding:
                                              "0 7px",
                                            borderRadius:
                                              "7px",
                                            border:
                                              "1px solid rgba(255,255,255,0.1)",
                                            background:
                                              "rgba(0,0,0,0.12)",
                                          }}
                                        >
                                          <span
                                            style={{
                                              color:
                                                "rgba(255,255,255,0.55)",
                                              fontSize:
                                                "0.7rem",
                                              fontWeight:
                                                800,
                                              whiteSpace:
                                                "nowrap",
                                            }}
                                          >
                                            {tr(
                                              "Date personnalisée",
                                              "Aangepaste datum",
                                              "Custom date"
                                            )}
                                          </span>

                                          <input
                                            type="date"
                                            value={
                                              invoice.due_date ??
                                              ""
                                            }
                                            disabled={
                                              invoiceUpdatingId ===
                                              invoice.id
                                            }
                                            onChange={(
                                              event
                                            ) =>
                                              void updateInvoiceDueDate(
                                                invoice,
                                                event
                                                  .target
                                                  .value
                                              )
                                            }
                                            style={{
                                              minHeight:
                                                "28px",
                                              border:
                                                "none",
                                              outline:
                                                "none",
                                              background:
                                                "transparent",
                                              color:
                                                "#ffffff",
                                              padding:
                                                "0 2px",
                                              font:
                                                "inherit",
                                            }}
                                          />
                                        </label>
                                      </div>

                                      <button
                                        type="button"
                                        className="button button--primary"
                                        disabled={
                                          invoiceUpdatingId ===
                                          invoice.id
                                        }
                                        onClick={() =>
                                          void issueStoreInvoice(
                                            invoice
                                          )
                                        }
                                      >
                                        <ReceiptText
                                          size={15}
                                        />
                                        {invoiceUpdatingId ===
                                        invoice.id
                                          ? tr(
                                              "Émission...",
                                              "Uitgeven...",
                                              "Issuing..."
                                            )
                                          : tr(
                                              "Émettre facture",
                                              "Factuur uitgeven",
                                              "Issue invoice"
                                            )}
                                      </button>
                                    </>
                                  ) : (
                                    <label
                                      style={{
                                        display:
                                          "inline-flex",
                                        alignItems:
                                          "center",
                                        gap: "7px",
                                        minHeight:
                                          "38px",
                                        padding:
                                          "0 10px",
                                        borderRadius:
                                          "9px",
                                        border:
                                          "1px solid rgba(255,255,255,0.1)",
                                        background:
                                          "rgba(255,255,255,0.035)",
                                        color:
                                          "rgba(255,255,255,0.72)",
                                        fontSize:
                                          "0.78rem",
                                        fontWeight:
                                          800,
                                      }}
                                    >
                                      {tr(
                                        "Paiement",
                                        "Betaling",
                                        "Payment"
                                      )}
                                      <select
                                        value={
                                          invoice.payment_status
                                        }
                                        disabled={
                                          invoiceUpdatingId ===
                                          invoice.id ||
                                          invoice.status !==
                                            "issued"
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          void updateInvoicePaymentStatus(
                                            invoice,
                                            event
                                              .target
                                              .value as StoreInvoice["payment_status"]
                                          )
                                        }
                                        style={{
                                          minHeight:
                                            "30px",
                                          borderRadius:
                                            "7px",
                                          border:
                                            "1px solid rgba(255,255,255,0.12)",
                                          background:
                                            "#0f1d2e",
                                          color:
                                            "#ffffff",
                                          padding:
                                            "0 8px",
                                        }}
                                      >
                                        <option value="unpaid">
                                          {tr(
                                            "Non payé",
                                            "Onbetaald",
                                            "Unpaid"
                                          )}
                                        </option>
                                        <option value="partially_paid">
                                          {tr(
                                            "Partiellement payé",
                                            "Gedeeltelijk betaald",
                                            "Partially paid"
                                          )}
                                        </option>
                                        <option value="paid">
                                          {tr(
                                            "Payé",
                                            "Betaald",
                                            "Paid"
                                          )}
                                        </option>
                                        <option value="refunded">
                                          {tr(
                                            "Remboursé",
                                            "Terugbetaald",
                                            "Refunded"
                                          )}
                                        </option>
                                      </select>
                                    </label>
                                  )}

                                  <button
                                    type="button"
                                    className="button"
                                    onClick={() =>
                                      downloadStoreInvoicePdf(
                                        invoice
                                      )
                                    }
                                  >
                                    <ReceiptText
                                      size={15}
                                    />
                                    {tr(
                                      "PDF facture",
                                      "Factuur PDF",
                                      "Invoice PDF"
                                    )}
                                  </button>

                                  {!invoiceIsDraft && (
                                    <span
                                      style={{
                                        minHeight:
                                          "38px",
                                        padding:
                                          "0 10px",
                                        display:
                                          "inline-flex",
                                        alignItems:
                                          "center",
                                        borderRadius:
                                          "9px",
                                        border:
                                          "1px solid rgba(255,255,255,0.08)",
                                        background:
                                          "rgba(255,255,255,0.025)",
                                        color:
                                          "rgba(255,255,255,0.62)",
                                        fontSize:
                                          "0.75rem",
                                        fontWeight:
                                          750,
                                      }}
                                    >
                                      {getInvoicePaymentStatusLabel(
                                        invoice.payment_status
                                      )}
                                      {invoice.due_date
                                        ? ` · ${tr(
                                            "Échéance",
                                            "Vervaldatum",
                                            "Due"
                                          )}: ${invoice.due_date}`
                                        : ""}
                                    </span>
                                  )}
                                </>
                              );
                            }

                            return (
                              <button
                                type="button"
                                className="button"
                                disabled={
                                  invoiceCreatingOrderId ===
                                  order.id
                                }
                                onClick={() =>
                                  void createInvoiceFromOrder(
                                    order
                                  )
                                }
                              >
                                <ReceiptText
                                  size={15}
                                />
                                {invoiceCreatingOrderId ===
                                order.id
                                  ? tr(
                                      "Création facture...",
                                      "Factuur aanmaken...",
                                      "Creating invoice..."
                                    )
                                  : tr(
                                      "Créer facture",
                                      "Factuur maken",
                                      "Create invoice"
                                    )}
                              </button>
                            );
                          })()}

                          <button
                            type="button"
                            className="button"
                            onClick={() =>
                              startEditingOrder(
                                order
                              )
                            }
                          >
                            <Pencil
                              size={15}
                            />
                            {tr(
                              "Modifier",
                              "Bewerken",
                              "Edit"
                            )}
                          </button>

                          {order.status ===
                            "draft" && (
                            <button
                              type="button"
                              className="button button--primary"
                              onClick={() =>
                                void validateStoreOrder(
                                  order
                                )
                              }
                              disabled={
                                orderUpdatingId ===
                                order.id
                              }
                            >
                              {tr(
                                "Valider la commande",
                                "Bestelling bevestigen",
                                "Confirm order"
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </article>
                  );
                }
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default StoreProductsPanel;
