import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import type { User } from "@supabase/supabase-js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  ArrowRight,
  ArrowUp,
  Bell,
  CalendarDays,
  Clock3,
  ExternalLink,
  FileDown,
  FileText,
  FolderOpen,
  Headphones,
  LayoutDashboard,
  LogOut,
  Plus,
  ShoppingBag,
  Send,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";

import BrandLogo from "../../components/common/BrandLogo";
import { useLanguage } from "../../context/LanguageContext";
import {
  getLocaleConfig,
  translate,
  type LocaleCode,
} from "../../i18n";
import { clientTranslations } from "../../i18n/locales/client";
import notoNaskhArabicPdfFontUrl from "../../assets/fonts/NotoNaskhArabic-Regular.ttf?url";
import { supabase } from "../../services/supabase";
import "../../styles/portal-responsive.css";
import {
  getServiceDomain,
  getServiceTheme,
  TSB_DOMAINS,
} from "../../utils/serviceTheme";


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

type QuoteRequest = {
  id: string;
  service: string;
  message: string;
  status: string;
  created_at: string;
};

type ClientDocument = {
  id: string;
  client_service_id: string | null;
  title: string;
  document_type: string;
  file_path: string;
  created_at: string;
};

type StoreProductTranslation = {
  id: string;
  sku: string | null;
  name_fr: string;
  name_nl: string | null;
  name_en: string | null;
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
  status: "issued" | "cancelled";
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
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
};

type SupportTicket = {
  id: string;
  service: string | null;
  subject: string;
  message: string;
  status: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
};

type SupportMessage = {
  id: string;
  ticket_id: string;
  sender_user_id: string | null;
  sender_type:
    | "client"
    | "admin"
    | "ai"
    | "system";
  message: string;
  created_at: string;
};

type ClientService = {
  id: string;
  user_id: string;
  quote_request_id: string | null;
  service: string;
  title: string;
  description: string | null;
  status: string;
  scheduled_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type ClientAppointment = {
  id: string;
  user_id: string;
  client_service_id: string | null;
  title: string;
  description: string | null;
  scheduled_at: string;
  status: string;
  location: string | null;
  client_response: string | null;
  client_response_message: string | null;
  client_responded_at: string | null;
  created_at: string;
  updated_at: string;
};

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

const DOCUMENT_CATEGORIES = [
  { value: "all" },
  { value: "quote" },
  { value: "invoice" },
  { value: "intervention" },
  { value: "diagnostic" },
  { value: "administrative" },
  { value: "other" },
] as const;

const DOCUMENTS_PER_PAGE = 12;

function Client() {
  const {
    locale,
    setLocale,
    availableLocales,
    intlLocale,
  } = useLanguage();

  const ct = (key: string) =>
    translate(
      clientTranslations,
      locale,
      `client.${key}`
    );

  const [user, setUser] =
    useState<User | null>(null);

  const [company, setCompany] =
    useState("");

  const [companyDraft, setCompanyDraft] =
    useState("");

  const [companySaving, setCompanySaving] =
    useState(false);

  const [companyMessage, setCompanyMessage] =
    useState("");

  type ClientSection =
    | "dashboard"
    | "quotes"
    | "orders"
    | "invoices"
    | "services"
    | "appointments"
    | "documents"
    | "support"
    | "notifications"
    | "profile";

  const [activeSection, setActiveSection] =
    useState<ClientSection>("dashboard");

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    quoteRequests,
    setQuoteRequests,
  ] = useState<QuoteRequest[]>([]);

  const [
    storeProductTranslations,
    setStoreProductTranslations,
  ] = useState<StoreProductTranslation[]>([]);

  const [
    storeOrders,
    setStoreOrders,
  ] = useState<StoreOrder[]>([]);

  const [
    storeOrderItems,
    setStoreOrderItems,
  ] = useState<StoreOrderItem[]>([]);

  const [
    ordersLoading,
    setOrdersLoading,
  ] = useState(true);

  const [
    ordersError,
    setOrdersError,
  ] = useState("");

  const [
    storeInvoices,
    setStoreInvoices,
  ] = useState<StoreInvoice[]>([]);

  const [
    storeInvoiceItems,
    setStoreInvoiceItems,
  ] = useState<StoreInvoiceItem[]>([]);

  const [
    invoicesLoading,
    setInvoicesLoading,
  ] = useState(true);

  const [
    invoicesError,
    setInvoicesError,
  ] = useState("");

  const [
    quotesLoading,
    setQuotesLoading,
  ] = useState(true);

  const [
    quotesError,
    setQuotesError,
  ] = useState("");

  const [
    claimedGuestQuotesCount,
    setClaimedGuestQuotesCount,
  ] = useState(0);

  const [
    clientServices,
    setClientServices,
  ] = useState<ClientService[]>([]);

  const [
    servicesLoading,
    setServicesLoading,
  ] = useState(true);

  const [
    servicesError,
    setServicesError,
  ] = useState("");

  const [
    appointments,
    setAppointments,
  ] = useState<ClientAppointment[]>([]);

  const [
    appointmentsLoading,
    setAppointmentsLoading,
  ] = useState(true);

  const [
    appointmentsError,
    setAppointmentsError,
  ] = useState("");

  const [
    appointmentResponseLoadingId,
    setAppointmentResponseLoadingId,
  ] = useState<string | null>(null);

  const [
    appointmentResponseMessage,
    setAppointmentResponseMessage,
  ] = useState("");

  const [
    rescheduleAppointmentId,
    setRescheduleAppointmentId,
  ] = useState<string | null>(null);

  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const [appointmentView, setAppointmentView] =
    useState<"upcoming" | "history">("upcoming");
  const [appointmentNow, setAppointmentNow] = useState(() =>
    Date.now()
  );

  const [
    documents,
    setDocuments,
  ] = useState<ClientDocument[]>([]);

  const [
    documentsLoading,
    setDocumentsLoading,
  ] = useState(true);

  const [
    documentsError,
    setDocumentsError,
  ] = useState("");

  const [
    openingDocumentId,
    setOpeningDocumentId,
  ] = useState<string | null>(null);

  const [
    documentCategoryFilter,
    setDocumentCategoryFilter,
  ] = useState("all");

  const [
    documentSearchQuery,
    setDocumentSearchQuery,
  ] = useState("");

  const [
    documentInterventionFilter,
    setDocumentInterventionFilter,
  ] = useState("all");

  const [
    documentPage,
    setDocumentPage,
  ] = useState(1);

  const [
    activeRequestDomainKey,
    setActiveRequestDomainKey,
  ] = useState<string | null>(
    null
  );

  const [
    activeServiceDomainKey,
    setActiveServiceDomainKey,
  ] = useState<string | null>(
    null
  );

  const [
    activeDocumentDomainKey,
    setActiveDocumentDomainKey,
  ] = useState<string | null>(
    null
  );

  const [
    activeDocumentFolderKey,
    setActiveDocumentFolderKey,
  ] = useState<string | null>(
    null
  );

  const [
    notifications,
    setNotifications,
  ] = useState<Notification[]>([]);

  const [
    ,
    setNotificationsLoading,
  ] = useState(true);

  const [
    notificationsError,
    setNotificationsError,
  ] = useState("");

  const [
    notificationUpdatingId,
    setNotificationUpdatingId,
  ] = useState<string | null>(
    null
  );

  const [
    liveNotification,
    setLiveNotification,
  ] = useState<Notification | null>(
    null
  );

  const [
    supportTickets,
    setSupportTickets,
  ] = useState<SupportTicket[]>([]);

  const [
    supportLoading,
    setSupportLoading,
  ] = useState(true);

  const [
    supportError,
    setSupportError,
  ] = useState("");

  const [
    supportSuccess,
    setSupportSuccess,
  ] = useState("");

  const [
    supportDomain,
    setSupportDomain,
  ] = useState("");

  const [
    supportSubject,
    setSupportSubject,
  ] = useState("");

  const [
    supportMessage,
    setSupportMessage,
  ] = useState("");

  const [
    supportSending,
    setSupportSending,
  ] = useState(false);

  const [
    supportMessages,
    setSupportMessages,
  ] = useState<SupportMessage[]>([]);

  const [
    supportReplyDrafts,
    setSupportReplyDrafts,
  ] = useState<Record<string, string>>({});

  const [
    supportReplySendingId,
    setSupportReplySendingId,
  ] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setAppointmentNow(Date.now());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadClient = async () => {
      const {
        data: {
          user: currentUser,
        },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (
  userError ||
  !currentUser
) {
  window.location.href =
    "/login";

  return;
}

const {
  data: adminRole,
  error: roleError,
} = await supabase
  .from("user_roles")
  .select("role")
  .eq("user_id", currentUser.id)
  .eq("role", "admin")
  .maybeSingle();

if (roleError) {
  console.error(
    "Erreur vérification rôle client :",
    roleError
  );
}

if (adminRole?.role === "admin") {
  window.location.href = "/admin";
  return;
}

if (!currentUser.email_confirmed_at) {
  await supabase.auth.signOut();

  window.alert(
    ct("copy.confirmYourEmailAddressBeforeAccessingYourClientArea")
  );

  window.location.href =
    "/login";

  return;
}

setUser(currentUser);

const {
  data: clientProfile,
  error: clientProfileError,
} = await supabase
  .from("profiles")
  .select("company")
  .eq("id", currentUser.id)
  .maybeSingle();

if (clientProfileError) {
  console.error(
    "Erreur chargement entreprise client :",
    clientProfileError
  );
} else {
  const savedCompany =
    clientProfile?.company?.trim() ?? "";

  setCompany(savedCompany);
  setCompanyDraft(savedCompany);
}

const {
  error:
    syncPreferredLanguageError,
} = await supabase.rpc(
  "sync_my_preferred_language"
);

if (
  syncPreferredLanguageError
) {
  console.warn(
    "Langue du profil non synchronisée :",
    syncPreferredLanguageError
  );
}

const {
  data: claimedGuestQuotes,
  error: claimGuestQuotesError,
} = await supabase.rpc(
  "claim_guest_quotes"
);

if (claimGuestQuotesError) {
  console.error(
    "Erreur récupération devis invités :",
    claimGuestQuotesError
  );
} else {
  const claimedCount =
    typeof claimedGuestQuotes ===
    "number"
      ? claimedGuestQuotes
      : Number(
          claimedGuestQuotes ??
            0
        );

  if (
    Number.isFinite(
      claimedCount
    ) &&
    claimedCount > 0
  ) {
    setClaimedGuestQuotesCount(
      claimedCount
    );
  }
}

      const [
        quotesResult,
        servicesResult,
        appointmentsResult,
        documentsResult,
        notificationsResult,
        supportResult,
        supportMessagesResult,
        storeProductsResult,
        storeOrdersResult,
        storeInvoicesResult,
        storeInvoiceItemsResult,
        storeOrderItemsResult,
      ] = await Promise.all([
        supabase
          .from("quote_requests")
          .select(
            "id, service, message, status, created_at"
          )
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("client_services")
          .select(
            "id, user_id, quote_request_id, service, title, description, status, scheduled_at, completed_at, created_at, updated_at"
          )
          .eq(
            "user_id",
            currentUser.id
          )
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("client_appointments")
          .select(
            "id, user_id, client_service_id, title, description, scheduled_at, status, location, client_response, client_response_message, client_responded_at, created_at, updated_at"
          )
          .eq(
            "user_id",
            currentUser.id
          )
          .order("scheduled_at", {
            ascending: true,
          }),

        supabase
          .from("client_documents")
          .select(
            "id, client_service_id, title, document_type, file_path, created_at"
          )
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("notifications")
          .select(
            "id, type, title, message, entity_type, entity_id, is_read, read_at, created_at"
          )
          .eq(
            "user_id",
            currentUser.id
          )
          .eq(
            "is_read",
            false
          )
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("support_tickets")
          .select(
            "id, service, subject, message, status, admin_reply, replied_at, created_at"
          )
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("support_messages")
          .select(
            "id, ticket_id, sender_user_id, sender_type, message, created_at"
          )
          .order("created_at", {
            ascending: true,
          }),

        supabase
          .from("store_products")
          .select(
            "id, sku, name_fr, name_nl, name_en"
          )
          .eq(
            "is_published",
            true
          ),

        supabase
          .from("store_orders")
          .select(
            "id, order_number, request_id, user_id, product_id, product_name, sku, quantity, unit_price, currency, discount_amount, fees_amount, total_amount, status, customer_name, customer_email, customer_phone, company, notes, preferred_language, created_at, updated_at"
          )
          .eq(
            "user_id",
            currentUser.id
          )
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("store_invoices")
          .select(
            "id, invoice_number, order_id, user_id, order_number, product_id, product_name, sku, quantity, unit_price, subtotal_amount, discount_amount, fees_amount, tax_rate, tax_amount, total_amount, currency, customer_name, customer_email, customer_phone, company, preferred_language, status, payment_status, issue_date, due_date, notes, created_at, updated_at"
          )
          .eq(
            "user_id",
            currentUser.id
          )
          .in(
            "status",
            ["issued", "cancelled"]
          )
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("store_invoice_items")
          .select(
            "id, invoice_id, product_id, product_name, sku, quantity, unit_price, currency, subtotal_amount, sort_order, created_at, updated_at"
          )
          .order("sort_order", {
            ascending: true,
          }),

        supabase
          .from("store_order_items")
          .select(
            "id, order_id, product_id, product_name, sku, quantity, unit_price, currency, line_total, sort_order, created_at, updated_at"
          )
          .order("sort_order", {
            ascending: true,
          }),
      ]);

      if (quotesResult.error) {
        console.error(
          "Erreur chargement demandes :",
          quotesResult.error
        );

        setQuotesError(
          ct("copy.yourRequestsCannotBeLoadedAtTheMoment")
        );
      } else {
        setQuoteRequests(
          quotesResult.data ?? []
        );
      }

      if (storeProductsResult.error) {
        console.warn(
          "Traductions TSB Store indisponibles :",
          storeProductsResult.error
        );

        setStoreProductTranslations([]);
      } else {
        setStoreProductTranslations(
          (storeProductsResult.data ??
            []) as StoreProductTranslation[]
        );
      }

      if (storeOrdersResult.error) {
        console.error(
          "Erreur chargement commandes Store :",
          storeOrdersResult.error
        );

        setOrdersError(
          ct("copy.yourOrdersCannotBeLoadedAtTheMoment")
        );
      } else {
        setStoreOrders(
          (storeOrdersResult.data ??
            []) as StoreOrder[]
        );
      }

      if (storeInvoicesResult.error) {
        console.error(
          "Erreur chargement factures Store :",
          storeInvoicesResult.error
        );

        setInvoicesError(
          ct("copy.yourInvoicesCannotBeLoadedAtTheMoment")
        );
      } else {
        setStoreInvoices(
          (storeInvoicesResult.data ??
            []) as StoreInvoice[]
        );
      }

      if (storeInvoiceItemsResult.error) {
        console.error(
          "Erreur chargement lignes factures Store :",
          storeInvoiceItemsResult.error
        );
        setStoreInvoiceItems([]);
      } else {
        setStoreInvoiceItems(
          (storeInvoiceItemsResult.data ?? []) as StoreInvoiceItem[]
        );
      }

      if (storeOrderItemsResult.error) {
        console.error(
          "Erreur chargement lignes commandes Store :",
          storeOrderItemsResult.error
        );
        setStoreOrderItems([]);
      } else {
        setStoreOrderItems(
          (storeOrderItemsResult.data ?? []) as StoreOrderItem[]
        );
      }

      if (servicesResult.error) {
        console.error(
          "Erreur chargement services :",
          servicesResult.error
        );

        setServicesError(
          ct("copy.yourServicesCannotBeLoadedAtTheMoment")
        );
      } else {
        setClientServices(
          servicesResult.data ?? []
        );
      }

      if (appointmentsResult.error) {
        console.error(
          "Erreur chargement rendez-vous :",
          appointmentsResult.error
        );

        setAppointmentsError(
          ct("copy.yourAppointmentsCannotBeLoadedAtTheMoment")
        );
      } else {
        setAppointments(
          (appointmentsResult.data ?? []) as ClientAppointment[]
        );
      }

      if (documentsResult.error) {
        console.error(
          "Erreur chargement documents :",
          documentsResult.error
        );

        setDocumentsError(
          ct("copy.yourDocumentsCannotBeLoadedAtTheMoment")
        );
      } else {
        setDocuments(
          documentsResult.data ?? []
        );
      }

      if (notificationsResult.error) {
        console.error(
          "Erreur chargement notifications :",
          notificationsResult.error
        );

        setNotificationsError(
          ct("copy.yourNotificationsCannotBeLoadedAtTheMoment")
        );
      } else {
        setNotifications(
          notificationsResult.data ?? []
        );
      }

      if (supportResult.error) {
        console.error(
          "Erreur chargement support :",
          supportResult.error
        );

        setSupportError(
          ct("copy.yourSupportRequestsCannotBeLoaded")
        );
      } else {
        setSupportTickets(
          supportResult.data ?? []
        );
      }

      if (
        supportMessagesResult.error
      ) {
        console.error(
          "Erreur chargement conversation support :",
          supportMessagesResult.error
        );

        setSupportError(
          ct("copy.theSupportConversationCouldNotBeFullyLoaded")
        );
      } else {
        setSupportMessages(
          (supportMessagesResult.data ??
            []) as SupportMessage[]
        );
      }

      setQuotesLoading(false);
      setOrdersLoading(false);
      setInvoicesLoading(false);
      setServicesLoading(false);
      setAppointmentsLoading(false);
      setDocumentsLoading(false);
      setNotificationsLoading(false);
      setSupportLoading(false);
      setIsLoading(false);
    };

    void loadClient();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const notificationsChannel =
      supabase
        .channel(
          `client-notifications-${user.id}`
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const incomingNotification =
              payload.new as Notification;

            setLiveNotification(
              incomingNotification
            );

            if (
              !incomingNotification.is_read
            ) {
              setNotifications(
                (previous) => {
                  const alreadyExists =
                    previous.some(
                      (
                        notification
                      ) =>
                        notification.id ===
                        incomingNotification.id
                    );

                  if (alreadyExists) {
                    return previous;
                  }

                  return [
                    incomingNotification,
                    ...previous,
                  ];
                }
              );
            }
          }
        )
        .subscribe(
          (status) => {
            if (
              status ===
              "CHANNEL_ERROR"
            ) {
              console.error(
                "Erreur Realtime notifications client."
              );

              setNotificationsError(
                ct("copy.realTimeNotificationsAreTemporarilyUnavailableYouCanStillRefresh")
              );
            }
          }
        );

    return () => {
      void supabase.removeChannel(
        notificationsChannel
      );
    };
  }, [user]);

  useEffect(() => {
    if (!liveNotification) {
      return;
    }

    const timeoutId =
      window.setTimeout(() => {
        setLiveNotification(
          null
        );
      }, 6000);

    return () => {
      window.clearTimeout(
        timeoutId
      );
    };
  }, [liveNotification]);

  const handleLogout =
    async () => {
      await supabase.auth.signOut();

      window.location.href =
        "/login";
    };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleLocaleChange = async (
    nextLocale: LocaleCode
  ) => {
    setLocale(nextLocale);

    const {
      error: metadataLanguageError,
    } = await supabase.auth.updateUser({
      data: {
        preferred_language:
          nextLocale,
      },
    });

    if (metadataLanguageError) {
      console.warn(
        "Langue utilisateur non synchronisée dans Auth :",
        metadataLanguageError
      );

      return;
    }

    const {
      error: profileLanguageError,
    } = await supabase.rpc(
      "sync_my_preferred_language"
    );

    if (profileLanguageError) {
      console.warn(
        "Langue du profil non synchronisée après changement :",
        profileLanguageError
      );
    }
  };

  const domainTranslationKeys: Record<string, string> = {
    automobile: "domains.automobile",
    security: "domains.security",
    electricity: "domains.electricity",
    energy: "domains.energy",
    water: "domains.water",
    automation: "domains.automation",
    it: "domains.it",
    networks: "domains.networks",
    web: "domains.web",
    maintenance: "domains.maintenance",
    academy: "domains.academy",
    store: "domains.store",
    business: "domains.business",
    innovation: "domains.innovation",
    other: "domains.other",
  };

  const folderTranslationKeys: Record<string, string> = {
    requests: "folders.requests",
    interventions: "folders.interventions",
    documents: "folders.documents",
    reports: "folders.reports",
    invoices: "folders.invoices",
  };

  const documentCategoryTranslationKeys: Record<string, string> = {
    all: "documentCategories.all",
    quote: "documentCategories.quote",
    invoice: "documentCategories.invoice",
    intervention: "documentCategories.intervention",
    diagnostic: "documentCategories.diagnostic",
    administrative: "documentCategories.administrative",
    other: "documentCategories.other",
  };

  const serviceTranslationKeys: Record<string, string> = {
    "Serrurerie automobile": "services.automotiveLocksmithing",
    "Diagnostic automobile": "services.automotiveDiagnostics",
    "Sécurité": "services.security",
    "Électricité": "services.electricity",
    "Énergie": "services.energy",
    "Eau & forage": "services.waterDrilling",
    "Automatisation": "services.automation",
    "Informatique & électronique": "services.itElectronics",
    "Réseaux & télécommunications": "services.networksTelecommunications",
    "Site web": "services.website",
    "Maintenance technique": "services.technicalMaintenance",
    "TSB Store": "services.tsbStore",
    "Autres services": "services.otherServices",
  };

  const getDomainLabel = (
    key: string,
    fallback: string
  ) => {
    const translationKey =
      domainTranslationKeys[key];

    return translationKey
      ? ct(translationKey)
      : fallback;
  };

  const getServiceDomainLabel = (service: string) => {
    const domain = getServiceDomain(service);
    return getDomainLabel(domain.key, domain.label);
  };

  const getFolderLabel = (
    key: string,
    fallback: string
  ) => {
    const translationKey =
      folderTranslationKeys[key];

    return translationKey
      ? ct(translationKey)
      : fallback;
  };

  const getDocumentCategoryLabel = (
    value: string,
    fallback: string
  ) => {
    const translationKey =
      documentCategoryTranslationKeys[value];

    return translationKey
      ? ct(translationKey)
      : fallback;
  };

  const getServiceLabel = (service: string) => {
    const translationKey =
      serviceTranslationKeys[service];

    return translationKey
      ? ct(translationKey)
      : service;
  };

  const getStatusLabel = (
    status: string
  ) => {
    switch (status) {
      case "received":
        return ct("copy.received");

      case "in_progress":
        return ct("copy.inProgress");

      case "completed":
        return ct("copy.completed");

      case "cancelled":
        return ct("copy.cancelled");

      default:
        return status;
    }
  };

  const getOrderStatusLabel = (
    status: string
  ) => {
    switch (status) {
      case "confirmed":
        return ct("copy.confirmed");

      case "processing":
        return ct("copy.processing");

      case "ready":
        return ct("copy.ready");

      case "completed":
        return ct("copy.completed41dcf6");

      case "cancelled":
        return ct("copy.cancelled");

      default:
        return ct("copy.draft");
    }
  };

  const getLocalizedOrderProductName = (
    order: StoreOrder
  ) => {
    const product =
      storeProductTranslations.find(
        (item) =>
          (order.product_id &&
            item.id ===
              order.product_id) ||
          (order.sku &&
            item.sku?.trim()
              .toLocaleLowerCase() ===
              order.sku
                .trim()
                .toLocaleLowerCase())
      );

    if (!product) {
      return order.product_name;
    }

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

  const formatOrderMoney = (
    amount: number | null,
    currency: string
  ) => {
    if (amount == null) {
      return ct("copy.onRequest");
    }

    return new Intl.NumberFormat(
      intlLocale,
      {
        style: "currency",
        currency,
      }
    ).format(amount);
  };

  const getOrderSubtotal = (
    order: StoreOrder
  ) =>
    order.unit_price == null
      ? null
      : order.unit_price *
        order.quantity;

  const getInvoiceStatusLabel = (
    status: StoreInvoice["status"]
  ) =>
    status === "cancelled"
      ? ct("copy.cancelled")
      : ct("copy.issued");

  const getInvoicePaymentStatusLabel = (
    status: StoreInvoice["payment_status"]
  ) => {
    switch (status) {
      case "partially_paid":
        return ct("copy.partiallyPaid");

      case "paid":
        return ct("copy.paid");

      case "refunded":
        return ct("copy.refunded");

      default:
        return ct("copy.unpaid");
    }
  };

  const formatInvoiceDate = (
    value: string | null
  ) => {
    if (!value) {
      return "-";
    }

    return new Intl.DateTimeFormat(
      intlLocale,
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    ).format(
      new Date(
        `${value}T12:00:00`
      )
    );
  };

  const getLocalizedInvoiceProductName = (
    invoice: StoreInvoice
  ) => {
    const rawProductName =
      invoice.product_name?.trim() ?? "";

    const storeBundleMatch =
      rawProductName.match(
        /^TSB\s+Store\s*[-–—·]\s*(\d+)(?:\s+.*)?$/iu
      );

    if (storeBundleMatch) {
      const productCount =
        Number.parseInt(
          storeBundleMatch[1],
          10
        );

      const productUnit =
        productCount === 1
          ? ct("storeRequest.product")
          : ct("storeRequest.products");

      return `TSB Store - ${productCount} ${productUnit}`;
    }

    const product =
      storeProductTranslations.find(
        (item) =>
          (invoice.product_id &&
            item.id ===
              invoice.product_id) ||
          (invoice.sku &&
            item.sku?.trim()
              .toLocaleLowerCase() ===
              invoice.sku
                .trim()
                .toLocaleLowerCase())
      );

    if (!product) {
      return invoice.product_name;
    }

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

  const downloadClientInvoicePdf = async (
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

    const invoiceLocale = locale;

    const isArabicPdf =
      invoiceLocale === "ar";

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

    const invoiceIntlLocale =
      getLocaleConfig(
        invoiceLocale
      ).intlLocale;

    const ipt = (key: string) =>
      translate(
        clientTranslations,
        invoiceLocale,
        `client.invoicePdf.${key}`
      );

    const money = (
      amount: number,
      currency = invoice.currency
    ) =>
      new Intl.NumberFormat(invoiceIntlLocale, {
        style: "currency",
        currency,
      }).format(amount);

    const getLocalizedPdfProductName = (
      value: string,
      productId: string | null,
      sku: string | null
    ) => {
      const rawProductName =
        value?.trim() ?? "";

      const storeBundleMatch =
        rawProductName.match(
          /^TSB\s+Store\s*[-–—·]\s*(\d+)(?:\s+.*)?$/iu
        );

      if (storeBundleMatch) {
        const productCount =
          Number.parseInt(
            storeBundleMatch[1],
            10
          );

        const productUnit =
          translate(
            clientTranslations,
            invoiceLocale,
            `client.storeRequest.${
              productCount === 1
                ? "product"
                : "products"
            }`
          );

        return `TSB Store - ${productCount} ${productUnit}`;
      }

      const product =
        storeProductTranslations.find(
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

      if (!product) {
        return value;
      }

      if (invoiceLocale === "fr") {
        return product.name_fr;
      }

      if (invoiceLocale === "nl") {
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
        ? ipt("issued")
        : invoice.status === "cancelled"
          ? ipt("cancelled")
          : ipt("draft");

    const paymentStatusText =
      invoice.payment_status === "paid"
        ? ipt("paid")
        : invoice.payment_status === "partially_paid"
          ? ipt("partiallyPaid")
          : invoice.payment_status === "refunded"
            ? ipt("refunded")
            : ipt("unpaid");

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
            getLocalizedPdfProductName(
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
              getLocalizedPdfProductName(
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
                getLocalizedPdfProductName(
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
      ipt("invoice"),
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
      `${ipt("order")}: ${invoice.order_number}`,
      boxX + boxW - 4,
      23.5,
      { align: "right" }
    );
    pdfText(
      `${ipt("date")}: ${documentDate}`,
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
      ipt("customer"),
      isArabicPdf
        ? margin + colW - 6
        : margin + 6,
      infoY + 7,
      isArabicPdf
        ? { align: "right" }
        : undefined
    );
    pdfText(
      ipt("invoiceDetails"),
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
      `${ipt("invoiceNo")}: ${invoice.invoice_number}`,
      `${ipt("status")}: ${invoiceStatusText}`,
      `${ipt("issueDate")}: ${invoiceDate(invoice.issue_date)}`,
      `${ipt("dueDate")}: ${invoiceDate(invoice.due_date)}`,
      `${ipt("currency")}: ${invoice.currency}`,
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
              ipt("subtotal"),
              ipt("unitPrice"),
              ipt("qty"),
              ipt("reference"),
              ipt("product"),
            ],
          ]
        : [
            [
              ipt("product"),
              ipt("reference"),
              ipt("qty"),
              ipt("unitPrice"),
              ipt("subtotal"),
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
      ipt("additionalInformation"),
      margin + 5,
      y + 7
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.1);
    doc.setTextColor(50, 58, 68);

    const note =
      invoice.notes?.trim() ||
      ipt("thankYouForYourTrustForAnyQuestionAboutThis");

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
          ipt("subtotal"),
          money(invoice.subtotal_amount),
        ],
        [
          ipt("discount"),
          `- ${money(invoice.discount_amount)}`,
        ],
        [
          ipt("fees"),
          money(invoice.fees_amount),
        ],
        [
          `${ipt("vat")} ${invoice.tax_rate}%`,
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
      ipt("totalDue"),
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
      ipt("paymentStatus"),
      margin + 5,
      y + 8
    );

    const statusLabels = [
      {
        key: "unpaid",
        label: ipt("unpaid"),
      },
      {
        key: "partially_paid",
        label: ipt("partiallyPaid"),
      },
      {
        key: "paid",
        label: ipt("paid"),
      },
      {
        key: "refunded",
        label: ipt("refunded"),
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

  const getClientServiceStatusLabel = (
    status: string
  ) => {
    switch (status) {
      case "planned":
        return ct("copy.planned");

      case "scheduled":
        return ct("copy.scheduled");

      case "in_progress":
        return ct("copy.inProgress");

      case "completed":
        return ct("copy.completed2a176d");

      case "cancelled":
        return ct("copy.cancelledd029a9");

      default:
        return status;
    }
  };

  const getAppointmentResponseLabel = (
    response: string | null
  ) => {
    switch (response) {
      case "accepted":
        return ct("copy.accepted");
      case "declined":
        return ct("copy.declined");
      case "reschedule_requested":
        return ct("copy.newDateRequested");
      default:
        return ct("copy.awaitingYourResponse");
    }
  };

  const handleAppointmentResponse = async (
    appointment: ClientAppointment,
    response:
      | "accepted"
      | "declined"
      | "reschedule_requested",
    explicitResponseMessage = ""
  ) => {
    if (!user) return;

    let responseMessage = explicitResponseMessage;

    if (response === "declined") {
      responseMessage =
        window.prompt(
          ct("copy.whyAreYouDecliningThisAppointmentOptional"),
          appointment.client_response_message ?? ""
        ) ?? "";
    }

    if (response === "reschedule_requested") {
      responseMessage = explicitResponseMessage.trim();

      if (!responseMessage) {
        setAppointmentResponseMessage(
          ct("copy.chooseADateAndTimeToRequestAnotherAppointment")
        );
        return;
      }
    }

    setAppointmentResponseLoadingId(appointment.id);
    setAppointmentResponseMessage("");

    const { data, error } = await supabase
      .from("client_appointments")
      .update({
        client_response: response,
        client_response_message:
          responseMessage.trim() || null,
      })
      .eq("id", appointment.id)
      .eq("user_id", user.id)
      .select(
        "id, user_id, client_service_id, title, description, scheduled_at, status, location, client_response, client_response_message, client_responded_at, created_at, updated_at"
      )
      .single();

    setAppointmentResponseLoadingId(null);

    if (error) {
      console.error(
        "Erreur réponse rendez-vous :",
        error
      );
      setAppointmentResponseMessage(
        ct("copy.yourResponseCannotBeSavedAtTheMoment")
      );
      return;
    }

    setAppointments((currentAppointments) =>
      currentAppointments.map((currentAppointment) =>
        currentAppointment.id === appointment.id
          ? (data as ClientAppointment)
          : currentAppointment
      )
    );

    setAppointmentResponseMessage(
      response === "accepted"
        ? ct("copy.appointmentAcceptedTsbTechGroupHasBeenInformed")
        : response === "declined"
          ? ct("copy.appointmentDeclinedTsbTechGroupHasBeenInformed")
          : ct("copy.yourRequestForANewDateHasBeenSentTo")
    );

    if (response === "reschedule_requested") {
      setRescheduleAppointmentId(null);
      setRescheduleDate("");
      setRescheduleTime("");
    }
  };

  const getAppointmentStatusLabel = (
    status: string
  ) => {
    switch (status) {
      case "requested":
        return ct("copy.requested");
      case "confirmed":
        return ct("copy.confirmed7392f3");
      case "scheduled":
        return ct("copy.scheduled");
      case "completed":
        return ct("copy.completed2a176d");
      case "cancelled":
        return ct("copy.cancelledd029a9");
      default:
        return status;
    }
  };

  const getAppointmentStatusStyle = (
    status: string
  ) => {
    if (status === "confirmed") {
      return {
        ...statusStyle,
        background: "rgba(34,197,94,0.14)",
        border: "1px solid rgba(74,222,128,0.38)",
        color: "#4ade80",
      } as const;
    }

    if (status === "cancelled") {
      return {
        ...statusStyle,
        background: "rgba(248,113,113,0.12)",
        border: "1px solid rgba(248,113,113,0.38)",
        color: "#f87171",
      } as const;
    }

    if (status === "completed") {
      return {
        ...statusStyle,
        background: "rgba(74,222,128,0.09)",
        border: "1px solid rgba(74,222,128,0.24)",
        color: "#86efac",
      } as const;
    }

    if (status === "requested") {
      return {
        ...statusStyle,
        background: "rgba(251,191,36,0.10)",
        border: "1px solid rgba(251,191,36,0.30)",
        color: "#fbbf24",
      } as const;
    }

    return statusStyle;
  };

  const getSupportStatusLabel = (
    status: string
  ) => {
    switch (status) {
      case "open":
        return ct("copy.open");

      case "in_progress":
        return ct("copy.inProgress");

      case "resolved":
        return ct("copy.resolved");

      case "closed":
        return ct("copy.closed");

      default:
        return status;
    }
  };

  const getDynamicSupportStatus = (
    ticket: SupportTicket
  ) => {
    if (
      ticket.status ===
      "resolved"
    ) {
      return {
        label: ct("copy.resolved"),
        color: "#4ade80",
        border:
          "1px solid rgba(74,222,128,0.32)",
        background:
          "rgba(74,222,128,0.10)",
      };
    }

    if (
      ticket.status ===
      "closed"
    ) {
      return {
        label: ct("copy.closed"),
        color:
          "rgba(255,255,255,0.62)",
        border:
          "1px solid rgba(255,255,255,0.12)",
        background:
          "rgba(255,255,255,0.05)",
      };
    }

    if (
      ticket.status ===
      "in_progress"
    ) {
      return {
        label: ct("copy.inProgress"),
        color: "#53a7ff",
        border:
          "1px solid rgba(83,167,255,0.32)",
        background:
          "rgba(22,136,255,0.10)",
      };
    }

    const ticketMessages =
      supportMessages.filter(
        (supportMessage) =>
          supportMessage.ticket_id ===
          ticket.id
      );

    const latestMessage =
      ticketMessages.length > 0
        ? ticketMessages[
            ticketMessages.length -
              1
          ]
        : null;

    if (
      latestMessage?.sender_type ===
      "client"
    ) {
      return {
        label:
          ct("copy.waitingForTsb"),
        color: "#f59e0b",
        border:
          "1px solid rgba(245,158,11,0.34)",
        background:
          "rgba(245,158,11,0.10)",
      };
    }

    if (
      latestMessage?.sender_type ===
      "admin"
    ) {
      return {
        label:
          ct("copy.tsbReply"),
        color: "#4ade80",
        border:
          "1px solid rgba(74,222,128,0.32)",
        background:
          "rgba(74,222,128,0.10)",
      };
    }

    if (
      latestMessage?.sender_type ===
      "ai"
    ) {
      return {
        label:
          ct("copy.aiReply"),
        color: "#00d4ff",
        border:
          "1px solid rgba(0,212,255,0.34)",
        background:
          "rgba(0,212,255,0.10)",
      };
    }

    if (
      ticket.admin_reply
    ) {
      return {
        label:
          ct("copy.tsbReply"),
        color: "#4ade80",
        border:
          "1px solid rgba(74,222,128,0.32)",
        background:
          "rgba(74,222,128,0.10)",
      };
    }

    return {
      label:
        getSupportStatusLabel(
          ticket.status
        ),
      color: "#fbbf24",
      border:
        "1px solid rgba(251,191,36,0.30)",
      background:
        "rgba(251,191,36,0.09)",
    };
  };

  const getDocumentTypeLabel = (
    documentType: string
  ) => {
    switch (
      documentType
    ) {
      case "quote":
        return ct("copy.quote");

      case "invoice":
        return ct("copy.invoice");

      case "intervention":
        return ct("copy.interventionReport");

      case "diagnostic":
        return ct("copy.diagnostic");

      case "administrative":
        return ct("copy.administrative");

      case "other":
        return ct("copy.otherDocument");

      default:
        return documentType;
    }
  };

  const getNotificationTypeLabel = (
    notificationType: string
  ) => {
    switch (notificationType) {
      case "quote":
        return ct("copy.quote9cbce1");

      case "service":
        return ct("copy.intervention");

      case "document":
        return ct("copy.documentsfc04ba");

      case "support":
        return ct("copy.support513f33");

      case "system":
        return "TSB";
      case "appointment":
        return ct("copy.appointment");

      default:
        return ct("copy.notification");
    }
  };

  const handleNotificationRead =
    async (
      notification: Notification
    ) => {
      if (
        notification.is_read ||
        notificationUpdatingId
      ) {
        return;
      }

      if (!user) {
        setNotificationsError(
          ct("copy.yourSessionIsNoLongerAvailablePleaseSignInAgain")
        );

        return;
      }

      setNotificationsError("");

      setNotificationUpdatingId(
        notification.id
      );

      const readAt =
        new Date().toISOString();

      const { error } =
        await supabase
          .from("notifications")
          .update({
            is_read: true,
            read_at: readAt,
          })
          .eq(
            "id",
            notification.id
          )
          .eq(
            "user_id",
            user.id
          );

      setNotificationUpdatingId(
        null
      );

      if (error) {
        console.error(
          "Erreur lecture notification :",
          error
        );

        setNotificationsError(
          ct("errors.notificationRead")
        );

        return;
      }

      setNotifications(
        (previous) =>
          previous.filter(
            (
              currentNotification
            ) =>
              currentNotification.id !==
              notification.id
          )
      );

      setLiveNotification(
        (currentLiveNotification) =>
          currentLiveNotification?.id ===
          notification.id
            ? null
            : currentLiveNotification
      );
    };

  const handleOpenNotification =
    async (
      notification: Notification
    ) => {
      setNotificationsError("");

      if (!notification.is_read) {
        await handleNotificationRead(
          notification
        );
      }

      let targetId = "";

      const targetSection: ClientSection =
        notification.type === "quote"
          ? "quotes"
          : notification.type === "order"
            ? "orders"
          : notification.type === "invoice"
            ? "invoices"
          : notification.type === "service"
            ? "services"
            : notification.type === "document"
              ? "documents"
              : notification.type === "support"
                ? "support"
                : notification.type === "appointment"
                  ? "appointments"
                  : "notifications";

      setActiveSection(targetSection);

      switch (
        notification.entity_type
      ) {
        case "quote_request":
          targetId =
            notification.entity_id
              ? `client-quote-${notification.entity_id}`
              : "mes-demandes";
          break;

        case "store_order":
          targetId =
            notification.entity_id
              ? `client-order-${notification.entity_id}`
              : "mes-commandes";
          break;

        case "store_invoice":
          targetId =
            notification.entity_id
              ? `client-invoice-${notification.entity_id}`
              : "mes-factures";
          break;

        case "client_service":
          targetId =
            notification.entity_id
              ? `client-service-${notification.entity_id}`
              : "mes-services";
          break;

        case "client_document":
          targetId =
            notification.entity_id
              ? `client-document-${notification.entity_id}`
              : "mes-documents";
          break;

        case "support_ticket":
          targetId =
            notification.entity_id
              ? `client-ticket-${notification.entity_id}`
              : "assistance";
          break;

        case "client_appointment":
          targetId =
            notification.entity_id
              ? `client-appointment-${notification.entity_id}`
              : "mes-rendez-vous";
          break;

        default:
          targetId =
            "mes-notifications";
      }

      window.setTimeout(() => {
        const exactTarget =
          document.getElementById(
            targetId
          );

        if (exactTarget) {
          exactTarget.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          return;
        }

        const fallbackId =
          notification.type ===
          "quote"
            ? "mes-demandes"
            : notification.type ===
                "service"
              ? "mes-services"
              : notification.type ===
                  "document"
                ? "mes-documents"
                : notification.type ===
                    "support"
                  ? "assistance"
                  : notification.type ===
                      "appointment"
                    ? "mes-rendez-vous"
                    : "mes-notifications";

        document
          .getElementById(
            fallbackId
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 180);
    };

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const ordersChannel =
      supabase
        .channel(
          `client-store-orders-${user.id}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "store_orders",
            filter:
              `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (
              payload.eventType ===
              "DELETE"
            ) {
              const deletedId =
                (
                  payload.old as {
                    id?: string;
                  }
                ).id;

              if (deletedId) {
                setStoreOrders(
                  (previous) =>
                    previous.filter(
                      (order) =>
                        order.id !==
                        deletedId
                    )
                );
              }

              return;
            }

            const nextOrder =
              payload.new as StoreOrder;

            setStoreOrders(
              (previous) => {
                const exists =
                  previous.some(
                    (order) =>
                      order.id ===
                      nextOrder.id
                  );

                if (exists) {
                  return previous.map(
                    (order) =>
                      order.id ===
                      nextOrder.id
                        ? nextOrder
                        : order
                  );
                }

                return [
                  nextOrder,
                  ...previous,
                ];
              }
            );
          }
        )
        .subscribe();

    return () => {
      void supabase.removeChannel(
        ordersChannel
      );
    };
  }, [user]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const invoicesChannel =
      supabase
        .channel(
          `client-store-invoices-${user.id}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "store_invoices",
            filter:
              `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (
              payload.eventType ===
              "DELETE"
            ) {
              const deletedId =
                (
                  payload.old as {
                    id?: string;
                  }
                ).id;

              if (deletedId) {
                setStoreInvoices(
                  (previous) =>
                    previous.filter(
                      (invoice) =>
                        invoice.id !==
                        deletedId
                    )
                );
              }

              return;
            }

            const nextInvoice =
              payload.new as StoreInvoice;

            if (
              ![
                "issued",
                "cancelled",
              ].includes(
                nextInvoice.status
              )
            ) {
              setStoreInvoices(
                (previous) =>
                  previous.filter(
                    (invoice) =>
                      invoice.id !==
                      nextInvoice.id
                  )
              );
              return;
            }

            setStoreInvoices(
              (previous) => {
                const exists =
                  previous.some(
                    (invoice) =>
                      invoice.id ===
                      nextInvoice.id
                  );

                if (exists) {
                  return previous.map(
                    (invoice) =>
                      invoice.id ===
                      nextInvoice.id
                        ? nextInvoice
                        : invoice
                  );
                }

                return [
                  nextInvoice,
                  ...previous,
                ];
              }
            );
          }
        )
        .subscribe();

    return () => {
      void supabase.removeChannel(
        invoicesChannel
      );
    };
  }, [user]);

  const formatDate = (
    date: string
  ) => {
    return new Intl.DateTimeFormat(
      intlLocale,
      {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(
      new Date(date)
    );
  };

  const handleOpenDocument =
    async (
      clientDocument: ClientDocument
    ) => {
      if (
        openingDocumentId
      ) {
        return;
      }

      setOpeningDocumentId(
        clientDocument.id
      );

      setDocumentsError(
        ""
      );

      const {
        data,
        error,
      } =
        await supabase.storage
          .from(
            "client-documents"
          )
          .createSignedUrl(
            clientDocument.file_path,
            60
          );

      setOpeningDocumentId(
        null
      );

      if (
        error ||
        !data?.signedUrl
      ) {
        console.error(
          "Erreur ouverture document :",
          error
        );

        setDocumentsError(
          ct("copy.thisDocumentCannotBeOpenedAtTheMoment")
        );

        return;
      }

      const newWindow =
        window.open(
          data.signedUrl,
          "_blank"
        );

      if (newWindow) {
        newWindow.opener =
          null;
      } else {
        window.location.href =
          data.signedUrl;
      }
    };

  useEffect(() => {
    if (!user) {
      return;
    }

    const supportTicketsChannel =
      supabase
        .channel(
          `client-support-tickets-${user.id}`
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table:
              "support_tickets",
            filter:
              `user_id=eq.${user.id}`,
          },
          (payload) => {
            const updatedTicket =
              payload.new as SupportTicket;

            setSupportTickets(
              (previous) =>
                previous.map(
                  (ticket) =>
                    ticket.id ===
                    updatedTicket.id
                      ? updatedTicket
                      : ticket
                )
            );
          }
        )
        .subscribe();

    return () => {
      void supabase.removeChannel(
        supportTicketsChannel
      );
    };
  }, [user]);

  useEffect(() => {
    if (
      !user ||
      supportTickets.length === 0
    ) {
      return;
    }

    const ownedTicketIds =
      new Set(
        supportTickets.map(
          (ticket) =>
            ticket.id
        )
      );

    const supportMessagesChannel =
      supabase
        .channel(
          `client-support-messages-${user.id}`
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table:
              "support_messages",
          },
          (payload) => {
            const incomingMessage =
              payload.new as SupportMessage;

            if (
              !ownedTicketIds.has(
                incomingMessage.ticket_id
              )
            ) {
              return;
            }

            setSupportMessages(
              (previous) => {
                const alreadyExists =
                  previous.some(
                    (message) =>
                      message.id ===
                      incomingMessage.id
                  );

                if (
                  alreadyExists
                ) {
                  return previous;
                }

                return [
                  ...previous,
                  incomingMessage,
                ].sort(
                  (a, b) =>
                    new Date(
                      a.created_at
                    ).getTime() -
                    new Date(
                      b.created_at
                    ).getTime()
                );
              }
            );
          }
        )
        .subscribe();

    return () => {
      void supabase.removeChannel(
        supportMessagesChannel
      );
    };
  }, [
    user,
    supportTickets,
  ]);

  const getSupportSenderLabel = (
    senderType: SupportMessage["sender_type"]
  ) => {
    switch (senderType) {
      case "client":
        return ct("copy.you");

      case "admin":
        return "TSB TECH GROUP";

      case "ai":
        return ct("copy.tsbAiAssistant");

      case "system":
        return ct("copy.system");

      default:
        return ct("copy.message");
    }
  };

  const handleSupportReplySubmit =
    async (
      event: FormEvent<HTMLFormElement>,
      ticket: SupportTicket
    ) => {
      event.preventDefault();

      setSupportError("");
      setSupportSuccess("");

      const message =
        (
          supportReplyDrafts[
            ticket.id
          ] ?? ""
        ).trim();

      if (!message) {
        setSupportError(
          ct("copy.writeYourMessageBeforeSendingIt")
        );

        return;
      }

      if (!user) {
        setSupportError(
          ct("copy.yourSessionIsNoLongerAvailablePleaseSignInAgain")
        );

        return;
      }

      setSupportReplySendingId(
        ticket.id
      );

      const {
        data,
        error,
      } = await supabase
        .from(
          "support_messages"
        )
        .insert({
          ticket_id:
            ticket.id,
          sender_user_id:
            user.id,
          sender_type:
            "client",
          message,
        })
        .select(
          "id, ticket_id, sender_user_id, sender_type, message, created_at"
        )
        .single();

      setSupportReplySendingId(
        null
      );

      if (error) {
        console.error(
          "Erreur envoi message support :",
          error
        );

        setSupportError(
          ct("errors.supportMessageSend")
        );

        return;
      }

      if (data) {
        const insertedMessage =
          data as SupportMessage;

        setSupportMessages(
          (previous) => {
            const alreadyExists =
              previous.some(
                (supportMessage) =>
                  supportMessage.id ===
                  insertedMessage.id
              );

            if (
              alreadyExists
            ) {
              return previous;
            }

            return [
              ...previous,
              insertedMessage,
            ].sort(
              (a, b) =>
                new Date(
                  a.created_at
                ).getTime() -
                new Date(
                  b.created_at
                ).getTime()
            );
          }
        );
      }

      setSupportReplyDrafts(
        (previous) => ({
          ...previous,
          [ticket.id]: "",
        })
      );

      setSupportSuccess(
        ct("copy.yourMessageHasBeenAddedToTheConversation")
      );
    };

  const getSupportTicketDomain = (
    service: string | null
  ) => {
    if (!service) {
      return TSB_DOMAINS.find(
        (domain) =>
          domain.key ===
          "other"
      )!;
    }

    return (
      TSB_DOMAINS.find(
        (domain) =>
          domain.label ===
            service ||
          availableLocales.some(
            (item) =>
              translate(
                clientTranslations,
                item.code,
                `client.domains.${domain.key}`
              ) ===
              service
          )
      ) ??
      getServiceDomain(
        service
      )
    );
  };

  const organizedSupportTickets =
    supportTickets
      .map(
        (ticket) => ({
          ticket,
          domain:
            getSupportTicketDomain(
              ticket.service
            ),
        })
      )
      .sort(
        (a, b) => {
          const domainA =
            TSB_DOMAINS.findIndex(
              (domain) =>
                domain.key ===
                a.domain.key
            );

          const domainB =
            TSB_DOMAINS.findIndex(
              (domain) =>
                domain.key ===
                b.domain.key
            );

          if (
            domainA !==
            domainB
          ) {
            return (
              domainA -
              domainB
            );
          }

          return (
            new Date(
              b.ticket.created_at
            ).getTime() -
            new Date(
              a.ticket.created_at
            ).getTime()
          );
        }
      );

  const handleSupportSubmit =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setSupportError("");
      setSupportSuccess("");

      const subject =
        supportSubject.trim();

      const message =
        supportMessage.trim();

      if (
        !supportDomain ||
        !subject ||
        !message
      ) {
        setSupportError(
          ct("copy.domainSubjectAndMessageAreRequired")
        );

        return;
      }

      if (!user) {
        setSupportError(
          ct("copy.yourSessionIsNoLongerAvailablePleaseSignInAgain")
        );

        return;
      }

      setSupportSending(
        true
      );

      const {
        data,
        error,
      } = await supabase
        .from(
          "support_tickets"
        )
        .insert({
          user_id: user.id,
          service:
            supportDomain,
          subject,
          message,
          status: "open",
        })
        .select(
          "id, service, subject, message, status, admin_reply, replied_at, created_at"
        )
        .single();

      setSupportSending(
        false
      );

      if (error) {
        console.error(
          "Erreur création ticket support :",
          error
        );

        setSupportError(
          ct("errors.supportRequestSend")
        );

        return;
      }

      if (data) {
        setSupportTickets(
          (previous) => [
            data,
            ...previous,
          ]
        );
      }

      setSupportDomain("");
      setSupportSubject("");
      setSupportMessage("");

      setSupportSuccess(
        ct("copy.yourSupportRequestHasBeenSentToTsbTechGroup")
      );
    };

  const isAppointmentInHistory = (
    appointment: ClientAppointment
  ) => {
    if (
      appointment.status === "completed" ||
      appointment.status === "cancelled"
    ) {
      return true;
    }

    const scheduledAt = new Date(
      appointment.scheduled_at
    ).getTime();

    return (
      Number.isFinite(scheduledAt) &&
      scheduledAt < appointmentNow
    );
  };

  const upcomingAppointments = appointments.filter(
    (appointment: ClientAppointment) =>
      !isAppointmentInHistory(appointment)
  );

  const appointmentHistory = appointments.filter(
    (appointment: ClientAppointment) =>
      isAppointmentInHistory(appointment)
  );

  const visibleAppointments =
    appointmentView === "upcoming"
      ? upcomingAppointments
      : appointmentHistory;

  const handleCompanySave = async () => {
    if (!user?.id || companySaving) {
      return;
    }

    setCompanySaving(true);
    setCompanyMessage("");

    const cleanCompany =
      companyDraft.trim();

    const { error } = await supabase
      .from("profiles")
      .update({
        company:
          cleanCompany || null,
      })
      .eq("id", user.id);

    setCompanySaving(false);

    if (error) {
      console.error(
        "Erreur mise à jour entreprise :",
        error
      );

      setCompanyMessage(
        ct("copy.unableToSaveTheCompany")
      );
      return;
    }

    setCompany(cleanCompany);
    setCompanyDraft(cleanCompany);

    setCompanyMessage(
      ct("copy.companySaved")
    );
  };

  if (isLoading) {
    return (
      <main className="login-page tsb-portal-responsive tsb-client-portal">
        <div
          style={{
            minHeight:
              "70vh",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            color: "#fff",
          }}
        >
          {ct("copy.loadingYourTsbClientArea")}</div>
      </main>
    );
  }

  const firstName =
    user?.user_metadata
      ?.first_name ||
    ct("misc.client");

  const lastName =
    user?.user_metadata
      ?.last_name ||
    "";

  const phone =
    user?.user_metadata
      ?.phone ||
    ct("copy.notProvided");

  const email =
    user?.email ||
    ct("copy.notProvided");

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        !notification.is_read
    );

  const unreadNotificationsCount =
    unreadNotifications.length;

  const getClientNavigationUnreadCount = (
    section: ClientSection
  ) => {
    if (section === "notifications") {
      return unreadNotificationsCount;
    }

    return unreadNotifications.filter(
      (notification) => {
        switch (section) {
          case "quotes":
            return (
              notification.type === "quote" ||
              (notification.entity_type ===
                "quote_request" &&
                notification.type !== "store")
            );

          case "orders":
            return (
              notification.type === "order" ||
              notification.entity_type ===
                "store_order"
            );

          case "invoices":
            return (
              notification.type === "invoice" ||
              notification.entity_type ===
                "store_invoice"
            );

          case "services":
            return (
              notification.type === "service" ||
              notification.entity_type ===
                "client_service"
            );

          case "appointments":
            return (
              notification.type ===
                "appointment" ||
              notification.entity_type ===
                "client_appointment"
            );

          case "documents":
            return (
              notification.type === "document" ||
              notification.entity_type ===
                "client_document"
            );

          case "support":
            return (
              notification.type === "support" ||
              notification.entity_type ===
                "support_ticket"
            );

          default:
            return false;
        }
      }
    ).length;
  };

  const clientServiceById =
    new Map(
      clientServices.map(
        (clientService) => [
          clientService.id,
          clientService,
        ]
      )
    );

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

  const getLocalizedQuoteMessage = (
    request: QuoteRequest
  ) => {
    const normalizedService =
      request.service
        .trim()
        .toLocaleLowerCase();

    if (
      normalizedService !==
      "tsb store"
    ) {
      return request.message;
    }

    const referenceMatch =
      request.message.match(
        /^(?:Référence|Reference|Referentie|Referenz|Referencia|Riferimento|Referência|المرجع|Referans|参考编号)\s*[:：]\s*(.+)$/im
      );

    const productMatch =
      request.message.match(
        /^(?:Produit|Product|Produkt|Producto|Prodotto|Produto|المنتج|Ürün|产品)\s*[:：]\s*(.+)$/im
      );

    const storedReference =
      referenceMatch?.[1]?.trim() ??
      "";

    const storedProductName =
      productMatch?.[1]?.trim() ??
      "";

    const normalizedStoredName =
      normalizeStoreText(
        storedProductName
      );

    const product =
      storeProductTranslations.find(
        (item) => {
          if (
            storedReference &&
            item.sku?.trim()
          ) {
            return (
              item.sku
                .trim()
                .toLocaleLowerCase() ===
              storedReference.toLocaleLowerCase()
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
                Boolean(
                  value?.trim()
                )
            )
            .some(
              (value) =>
                normalizeStoreText(
                  value
                ) ===
                normalizedStoredName
            );
        }
      );

    const productName =
      locale === "fr"
        ? product?.name_fr?.trim() ||
          storedProductName
        : locale === "nl"
          ? product?.name_nl?.trim() ||
            product?.name_en?.trim() ||
            product?.name_fr?.trim() ||
            storedProductName
          : product?.name_en?.trim() ||
            product?.name_fr?.trim() ||
            storedProductName;

    const reference =
      product?.sku?.trim() ||
      storedReference;

    if (!productName) {
      return request.message;
    }

    return [
      ct("storeRequest.title"),
      `${ct("storeRequest.product")}: ${productName}`,
      ...(reference
        ? [
            `${ct("storeRequest.reference")}: ${reference}`,
          ]
        : []),
      "",
      ct("storeRequest.body"),
    ].join("\n");
  };

  const visibleQuoteRequests =
    activeRequestDomainKey
      ? quoteRequests.filter(
          (request) =>
            getServiceDomain(
              request.service
            ).key ===
            activeRequestDomainKey
        )
      : quoteRequests;

  const visibleClientServices =
    activeServiceDomainKey
      ? clientServices.filter(
          (clientService) =>
            getServiceDomain(
              clientService.service
            ).key ===
            activeServiceDomainKey
        )
      : clientServices;

  const activeRequestDomain =
    activeRequestDomainKey
      ? TSB_DOMAINS.find(
          (domain) =>
            domain.key ===
            activeRequestDomainKey
        ) ?? null
      : null;

  const activeServiceDomain =
    activeServiceDomainKey
      ? TSB_DOMAINS.find(
          (domain) =>
            domain.key ===
            activeServiceDomainKey
        ) ?? null
      : null;

  const activeDocumentDomain =
    activeDocumentDomainKey
      ? TSB_DOMAINS.find(
          (domain) =>
            domain.key ===
            activeDocumentDomainKey
        ) ?? null
      : null;

  const activeDocumentFolder =
    activeDocumentDomain?.folders.find(
      (folder) =>
        folder.key ===
        activeDocumentFolderKey
    ) ?? null;

  const documentCategoryCounts =
    DOCUMENT_CATEGORIES.reduce<
      Record<string, number>
    >(
      (counts, category) => {
        counts[category.value] =
          category.value ===
          "all"
            ? documents.length
            : documents.filter(
                (clientDocument) =>
                  clientDocument.document_type ===
                  category.value
              ).length;

        return counts;
      },
      {}
    );

  const normalizedDocumentSearch =
    documentSearchQuery
      .trim()
      .toLowerCase();

  const filteredDocuments =
    documents.filter(
      (clientDocument) => {
        const matchesCategory =
          documentCategoryFilter ===
            "all" ||
          clientDocument.document_type ===
            documentCategoryFilter;

        const matchesIntervention =
          documentInterventionFilter ===
            "all" ||
          clientDocument.client_service_id ===
            documentInterventionFilter;

        const linkedService =
          clientDocument.client_service_id
            ? clientServiceById.get(
                clientDocument.client_service_id
              )
            : null;

        const documentDomainKey =
          linkedService
            ? getServiceDomain(
                linkedService.service
              ).key
            : "other";

        const matchesDomain =
          !activeDocumentDomainKey ||
          documentDomainKey ===
            activeDocumentDomainKey;

        const matchesFolder =
          activeDocumentFolderKey ===
          "reports"
            ? clientDocument.document_type ===
                "intervention" ||
              clientDocument.document_type ===
                "diagnostic"
            : activeDocumentFolderKey ===
              "invoices"
              ? clientDocument.document_type ===
                "invoice"
              : true;

        if (
          !matchesCategory ||
          !matchesIntervention ||
          !matchesDomain ||
          !matchesFolder
        ) {
          return false;
        }

        if (
          !normalizedDocumentSearch
        ) {
          return true;
        }

        const searchableText = [
          clientDocument.title,
          getDocumentTypeLabel(
            clientDocument.document_type
          ),
          linkedService?.title ||
            "",
          linkedService?.service ||
            "",
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          normalizedDocumentSearch
        );
      }
    );

  const totalDocumentPages =
    Math.max(
      1,
      Math.ceil(
        filteredDocuments.length /
          DOCUMENTS_PER_PAGE
      )
    );

  const safeDocumentPage =
    Math.min(
      documentPage,
      totalDocumentPages
    );

  const visibleDocuments =
    filteredDocuments.slice(
      (safeDocumentPage - 1) *
        DOCUMENTS_PER_PAGE,
      safeDocumentPage *
        DOCUMENTS_PER_PAGE
    );

  const cardGridStyle = {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "20px",
  } as const;

  const itemStyle = {
    padding: "20px",
    border:
      "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    background:
      "rgba(255,255,255,0.035)",
  } as const;

  const statusStyle = {
    padding: "7px 12px",
    borderRadius: "999px",
    background:
      "rgba(22,136,255,0.12)",
    border:
      "1px solid rgba(22,136,255,0.28)",
    color: "#53a7ff",
    fontSize: "0.76rem",
    fontWeight: 800,
  } as const;

  return (
    <main className="login-page tsb-portal-responsive tsb-client-portal">
      <div
        className="tsb-portal-shell"
        style={{
          width:
            "min(1180px, 100%)",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <header
          className="tsb-portal-header"
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap: "24px",
            flexWrap: "wrap",
            marginBottom:
              "38px",
          }}
        >
          <BrandLogo />

          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "flex-end",
              gap: "16px",
              flexWrap:
                "wrap",
            }}
          >
            <div
              aria-label={ct("copy.changeLanguage")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "flex-end",
                flexWrap: "wrap",
                maxWidth: "100%",
                gap: "4px",
                padding: "4px",
                borderRadius: "12px",
                border:
                  "1px solid rgba(255,255,255,0.10)",
                background:
                  "rgba(255,255,255,0.035)",
              }}
            >
              {availableLocales
                .filter((item) => item.enabled)
                .map((item) => {
                  const isActive =
                    locale === item.code;

                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() =>
                        void handleLocaleChange(
                          item.code
                        )
                      }
                      aria-pressed={
                        isActive
                      }
                      dir={item.direction}
                      style={{
                        minWidth: "38px",
                        minHeight: "36px",
                        padding: "0 9px",
                        borderRadius:
                          "9px",
                        border: isActive
                          ? "1px solid rgba(22,136,255,0.55)"
                          : "1px solid transparent",
                        background:
                          isActive
                            ? "rgba(22,136,255,0.16)"
                            : "transparent",
                        color:
                          isActive
                            ? "#53a7ff"
                            : "rgba(255,255,255,0.70)",
                        fontSize:
                          "0.75rem",
                        fontWeight: 900,
                        cursor:
                          "pointer",
                      }}
                    >
                      {item.shortLabel}
                    </button>
                  );
                })}
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveSection(
                  "notifications"
                );

                window.requestAnimationFrame(
                  () =>
                    document
                      .getElementById(
                        "client-content"
                      )
                      ?.scrollIntoView({
                        behavior:
                          "smooth",
                        block: "start",
                      })
                );
              }}
              aria-label={ct("copy.viewMyNotifications")}
              title={ct("copy.notifications")}
              style={{
                position:
                  "relative",
                width: "46px",
                height: "46px",
                display:
                  "inline-flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                borderRadius:
                  "50%",
                border:
                  "1px solid rgba(255,255,255,0.12)",
                background:
                  "rgba(255,255,255,0.045)",
                color:
                  "#ffffff",
                cursor:
                  "pointer",
              }}
            >
              <Bell
                size={21}
              />

              {unreadNotificationsCount >
                0 && (
                <span
                  style={{
                    position:
                      "absolute",
                    top: "-5px",
                    right:
                      "-5px",
                    minWidth:
                      "22px",
                    height:
                      "22px",
                    padding:
                      "0 6px",
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    borderRadius:
                      "999px",
                    background:
                      "#1688ff",
                    color:
                      "#ffffff",
                    fontSize:
                      "0.7rem",
                    fontWeight:
                      900,
                    border:
                      "2px solid #08111d",
                  }}
                >
                  {unreadNotificationsCount >
                  99
                    ? "99+"
                    : unreadNotificationsCount}
                </span>
              )}
            </button>

            <div
              style={{
                textAlign:
                  "right",
              }}
            >
              <span className="login-kicker">
                {ct("copy.tsbDigitalPlatform")}</span>

              <h1
                style={{
                  margin:
                    "5px 0",
                  fontSize:
                    "clamp(1.8rem, 4vw, 2.7rem)",
                }}
              >
                {ct("copy.clientArea")}</h1>

              <p
                style={{
                  margin: 0,
                  color:
                    "rgba(255,255,255,0.65)",
                }}
              >
                {ct("copy.hello")}{" "}
                {firstName}
              </p>
            </div>
          </div>
        </header>

        {/* BIENVENUE */}

        <section
          id="client-dashboard"
          className="login-card"
          style={{
            marginBottom:
              "22px",
            scrollMarginTop:
              "96px",
          }}
        >
          <span className="login-card__eyebrow">
            {ct("copy.clientPortal")}</span>

          <h2>
            {ct("copy.welcome")}{" "}
            {firstName}
            {lastName
              ? ` ${lastName}`
              : ""}
            .
          </h2>

          <p className="login-card__intro">
            {ct("copy.yourTsbAreaCentralizesYourRequestsServicesDocumentsAndExchanges")}</p>

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap:
                "8px",
              color:
                "#4ade80",
              fontSize:
                "0.85rem",
              fontWeight:
                700,
              flexWrap:
                "wrap",
            }}
          >
            <ShieldCheck
              size={18}
            />
            {ct("copy.verifiedAccountSecureSession")}</div>

          <div
            style={{
              marginTop: "16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <a
              href="/store"
              style={{
                minHeight: "40px",
                padding: "0 14px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                borderRadius: "12px",
                border:
                  "1px solid rgba(56,189,248,0.42)",
                background:
                  "linear-gradient(90deg, rgba(22,136,255,0.16), rgba(0,212,255,0.10))",
                color: "#7dd3fc",
                fontSize: "0.78rem",
                fontWeight: 850,
                textDecoration: "none",
                boxShadow:
                  "0 10px 24px rgba(0,0,0,0.14)",
              }}
            >
              <ShoppingBag
                size={17}
                strokeWidth={2}
              />
              {ct("copy.openTsbStore")}
              <ArrowRight size={15} />
            </a>

            <span
              style={{
                color:
                  "rgba(255,255,255,0.55)",
                fontSize: "0.74rem",
                lineHeight: 1.45,
              }}
            >
              {ct("copy.tsbProductsEquipmentAndSolutions")}
            </span>
          </div>

          {claimedGuestQuotesCount >
            0 && (
            <div
              style={{
                marginTop:
                  "16px",
                padding:
                  "12px 14px",
                borderRadius:
                  "11px",
                border:
                  "1px solid rgba(34,197,94,0.28)",
                background:
                  "rgba(34,197,94,0.07)",
                color:
                  "rgba(255,255,255,0.82)",
                lineHeight:
                  1.55,
                fontSize:
                  "0.82rem",
              }}
            >
              <strong
                style={{
                  color:
                    "#4ade80",
                }}
              >
                {
                  claimedGuestQuotesCount
                }{" "}
                {claimedGuestQuotesCount ===
                1
                  ? ct("copy.guestRequestRecovered")
                  : ct("copy.guestRequestsRecovered")}
              </strong>
              {ct("copy.quotesPreviouslySentWithYourVerifiedEmailAddressAreNow")}</div>
          )}
        </section>

        {/* NAVIGATION CLIENT */}

        <nav
          className="tsb-portal-nav"
          aria-label={ct("copy.clientAreaNavigation")}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "5px",
            overflowX: "visible",
            padding: "6px",
            marginBottom: "18px",
            borderRadius: "18px",
            border:
              "1px solid rgba(255,255,255,0.08)",
            background:
              "rgba(255,255,255,0.035)",
            WebkitOverflowScrolling:
              "touch",
            alignItems: "center",
          }}
        >
          {[
            {
              key: "dashboard" as ClientSection,
              label: ct("copy.overview"),
              icon: LayoutDashboard,
            },
            {
              key: "quotes" as ClientSection,
              label: ct("copy.quotesRequests"),
              icon: FileText,
            },
            {
              key: "orders" as ClientSection,
              label: ct("copy.orders"),
              icon: ShoppingBag,
            },
            {
              key: "invoices" as ClientSection,
              label: ct("copy.invoices"),
              icon: FileText,
            },
            {
              key: "services" as ClientSection,
              label: ct("copy.interventions"),
              icon: Wrench,
            },
            {
              key: "appointments" as ClientSection,
              label: ct("copy.appointments"),
              icon: CalendarDays,
            },
            {
              key: "documents" as ClientSection,
              label: ct("copy.documents"),
              icon: FolderOpen,
            },
            {
              key: "support" as ClientSection,
              label: ct("copy.support"),
              icon: Headphones,
            },
            {
              key: "notifications" as ClientSection,
              label: ct("copy.notifications"),
              icon: Bell,
            },
            {
              key: "profile" as ClientSection,
              label: ct("copy.profile"),
              icon: UserRound,
            },
          ].map((item) => {
            const Icon = item.icon;
            const isActive =
              activeSection === item.key;

            const unreadCount =
              getClientNavigationUnreadCount(
                item.key
              );

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setActiveSection(
                    item.key
                  );

                  window.requestAnimationFrame(
                    () => {
                      document
                        .getElementById(
                          "client-content"
                        )
                        ?.scrollIntoView({
                          behavior:
                            "smooth",
                          block: "start",
                        });
                    }
                  );
                }}
                style={{
                  minWidth: 0,
                  whiteSpace: "nowrap",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding:
                    item.key ===
                    "dashboard"
                      ? "8px 8px"
                      : "8px 9px",
                  borderRadius: "12px",
                  border: isActive
                    ? "1px solid rgba(56,189,248,0.55)"
                    : "1px solid transparent",
                  background: isActive
                    ? "rgba(56,189,248,0.12)"
                    : "transparent",
                  color: isActive
                    ? "#38bdf8"
                    : "rgba(255,255,255,0.72)",
                  fontSize:
                    item.key ===
                    "dashboard"
                      ? "0.76rem"
                      : "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition:
                    "background 0.2s ease, color 0.2s ease, border-color 0.2s ease",
                }}
              >
                <Icon
                  size={
                    item.key ===
                    "dashboard"
                      ? 15
                      : 16
                  }
                />
                {item.label}

                {unreadCount > 0 && (
                  <span
                    aria-label={`${unreadCount} ${ct("copy.unreadNotificationS")}`}
                    style={{
                      minWidth: "18px",
                      height: "18px",
                      padding: "0 5px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "999px",
                      background: "#1688ff",
                      color: "#ffffff",
                      fontSize: "0.64rem",
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div
          id="client-content"
          style={{
            scrollMarginTop: "96px",
          }}
        >

        {/* MODULES */}

        {activeSection === "dashboard" && (
          <section
            className="tsb-client-stats-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(8, minmax(0, 1fr))",
              gap: "10px",
              overflowX: "auto",
            }}
          >
            {[
              {
                label: ct("copy.quotesRequestsaa954e"),
                eyebrow: ct("copy.quotesRequests55c1b4"),
                value: quoteRequests.length,
                icon: FileText,
                section: "quotes" as ClientSection,
              },
              {
                label: ct("copy.orders"),
                eyebrow: ct("copy.ordersb6d10a"),
                value: storeOrders.length,
                icon: ShoppingBag,
                section: "orders" as ClientSection,
              },
              {
                label: ct("copy.invoices"),
                eyebrow: ct("copy.invoices5942a3"),
                value: storeInvoices.length,
                icon: FileText,
                section: "invoices" as ClientSection,
              },
              {
                label: ct("copy.interventions"),
                eyebrow: ct("copy.interventionsf2cb6e"),
                value: clientServices.length,
                icon: Wrench,
                section: "services" as ClientSection,
              },
              {
                label: ct("copy.appointments"),
                eyebrow: ct("copy.appointments4e82f0"),
                value: appointments.length,
                icon: CalendarDays,
                section: "appointments" as ClientSection,
              },
              {
                label: ct("copy.documents"),
                eyebrow: ct("copy.documentsfc04ba"),
                value: documents.length,
                icon: FolderOpen,
                section: "documents" as ClientSection,
              },
              {
                label: ct("copy.supportTickets"),
                eyebrow: ct("copy.support513f33"),
                value: supportTickets.length,
                icon: Headphones,
                section: "support" as ClientSection,
              },
              {
                label: ct("copy.notifications"),
                eyebrow: ct("copy.notificationsbded57"),
                value: unreadNotificationsCount,
                icon: Bell,
                section: "notifications" as ClientSection,
              },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  className="login-card"
                  key={stat.eyebrow}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setActiveSection(stat.section)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();
                      setActiveSection(stat.section);
                    }
                  }}
                  title={`${ct("copy.opend37f60")} ${stat.label}`}
                  style={{
                    cursor: "pointer",
                    minWidth: 0,
                    padding: "14px 12px",
                  }}
                >
                  <Icon
                    size={21}
                    strokeWidth={1.7}
                    style={{
                      color: "#1688ff",
                      marginBottom: "9px",
                    }}
                  />

                  <span className="login-card__eyebrow">
                    {stat.eyebrow}
                  </span>

                  <h2
                    style={{
                      fontSize: "1.55rem",
                      marginBottom: "3px",
                    }}
                  >
                    {stat.value}
                  </h2>

                  <p
                    className="login-card__intro"
                    style={{
                      marginBottom: "6px",
                      fontSize: "0.72rem",
                    }}
                  >
                    {stat.label}
                  </p>

                  <span
                    style={{
                      color: "#53a7ff",
                      fontSize: "0.76rem",
                      fontWeight: 800,
                    }}
                  >
                    {ct("copy.clickToOpen")}</span>
                </article>
              );
            })}
          </section>
        )}

        {activeSection === "quotes" && (
          <section
          id="mes-demandes"
          className="login-card"
          style={{
            marginTop:
              "22px",
            scrollMarginTop:
              "96px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "flex-start",
              gap: "18px",
              flexWrap:
                "wrap",
            }}
          >
            <div>
              <span className="login-card__eyebrow">
                {ct("copy.myRequests")}</span>

              <h2>
                {ct("copy.quotesRequests")}</h2>

              <p className="login-card__intro">
                {ct("copy.viewYourRequestsSentToTsbTechGroupAndTheir")}</p>
            </div>

            <a
              href="/#quote"
              className="login-create"
              style={{
                width: "auto",
                minHeight:
                  "44px",
                padding:
                  "0 18px",
                display:
                  "inline-flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                gap: "8px",
                textDecoration:
                  "none",
              }}
            >
              <Plus
                size={18}
              />
              {ct("copy.newRequest")}</a>
          </div>

          {activeRequestDomain && (
            <div
              style={{
                marginTop:
                  "16px",
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "10px",
                flexWrap:
                  "wrap",
              }}
            >
              <span
                style={{
                  padding:
                    "7px 10px",
                  borderRadius:
                    "999px",
                  border:
                    `1px solid ${activeRequestDomain.theme.borderStrong}`,
                  background:
                    activeRequestDomain.theme.badgeBackground,
                  color:
                    activeRequestDomain.theme.accentStrong,
                  fontSize:
                    "0.72rem",
                  fontWeight:
                    900,
                }}
              >
                {ct("copy.openFolder")}{" "}
                {getDomainLabel(activeRequestDomain.key, activeRequestDomain.label)}{" "}
                {ct("copy.requestsQuotes")}</span>

              <button
                type="button"
                className="text-link"
                onClick={() =>
                  setActiveRequestDomainKey(
                    null
                  )
                }
              >
                {ct("copy.viewAllRequests")}</button>
            </div>
          )}

          {quotesLoading && (
            <p
              style={{
                color:
                  "rgba(255,255,255,0.6)",
              }}
            >
              {ct("copy.loadingRequests")}</p>
          )}

          {quotesError && (
            <p className="login-form-message">
              {quotesError}
            </p>
          )}

          {!quotesLoading &&
            !quotesError &&
            quoteRequests.length ===
              0 && (
              <div
                style={{
                  padding:
                    "34px 0",
                  textAlign:
                    "center",
                  color:
                    "rgba(255,255,255,0.55)",
                }}
              >
                <FileText
                  size={38}
                  strokeWidth={
                    1.5
                  }
                  style={{
                    marginBottom:
                      "12px",
                  }}
                />

                <p
                  style={{
                    margin:
                      "0 0 18px",
                  }}
                >
                  {ct("copy.youDoNotHaveAnySavedRequestsYet")}</p>

                <a
                  href="/#quote"
                  className="button button--primary"
                  style={{
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    gap: "8px",
                    textDecoration:
                      "none",
                  }}
                >
                  <Plus
                    size={17}
                  />
                  {ct("copy.makeARequest")}</a>
              </div>
            )}

          {!quotesLoading &&
            !quotesError &&
            visibleQuoteRequests.length >
              0 && (
              <div
                style={{
                  display:
                    "grid",
                  gap: "14px",
                  marginTop:
                    "22px",
                }}
              >
                {visibleQuoteRequests.map(
                  (request) => {
                    const requestTheme =
                      getServiceTheme(
                        request.service
                      );

                    const linkedServices =
                      clientServices.filter(
                        (clientService) =>
                          clientService.quote_request_id ===
                          request.id
                      );

                    return (
                      <article
                        id={`client-quote-${request.id}`}
                        key={request.id}
                        style={{
                          ...itemStyle,
                          border:
                            `1px solid ${requestTheme.borderStrong}`,
                          background:
                            `linear-gradient(135deg, ${requestTheme.backgroundStrong}, rgba(5,12,22,0.92))`,
                          boxShadow:
                            `${requestTheme.glowStrong}, inset 5px 0 0 ${requestTheme.accent}`,
                          scrollMarginTop:
                            "30px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "flex-start",
                            gap: "18px",
                            flexWrap: "wrap",
                            marginBottom:
                              "12px",
                          }}
                        >
                          <div>
                            <span
                              className="login-card__eyebrow"
                              style={{
                                color:
                                  requestTheme.accentStrong,
                              }}
                            >
                              {
                                getServiceDomainLabel(request.service)
                              }
                            </span>

                            <h3
                              style={{
                                margin:
                                  "5px 0 0",
                                color:
                                  requestTheme.accentStrong,
                              }}
                            >
                              {getServiceLabel(request.service)}
                            </h3>
                          </div>

                          <span
                            style={statusStyle}
                          >
                            {getStatusLabel(
                              request.status
                            )}
                          </span>
                        </div>

                        <p
                          style={{
                            color:
                              "rgba(255,255,255,0.7)",
                            lineHeight: 1.6,
                            margin:
                              "0 0 14px",
                            whiteSpace:
                              "pre-wrap",
                          }}
                        >
                          {getLocalizedQuoteMessage(
                            request
                          )}
                        </p>

                        <div
                          style={{
                            display: "flex",
                            alignItems:
                              "center",
                            gap: "7px",
                            color:
                              "rgba(255,255,255,0.4)",
                            fontSize:
                              "0.78rem",
                          }}
                        >
                          <Clock3
                            size={15}
                          />

                          {formatDate(
                            request.created_at
                          )}
                        </div>

                        {/* INTERVENTIONS LIÉES */}

                        {linkedServices.length >
                          0 && (
                          <div
                            style={{
                              marginTop:
                                "18px",
                              paddingTop:
                                "16px",
                              borderTop:
                                `1px solid ${requestTheme.borderStrong}`,
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: "8px",
                                marginBottom:
                                  "12px",
                              }}
                            >
                              <Wrench
                                size={17}
                                style={{
                                  color:
                                    requestTheme.accentStrong,
                                }}
                              />

                              <span className="login-card__eyebrow">
                                {linkedServices.length >
                                1
                                  ? ct("misc.tsbInterventions")
                                  : ct("misc.tsbIntervention")}
                              </span>
                            </div>

                            <div
                              style={{
                                display:
                                  "grid",
                                gap: "10px",
                              }}
                            >
                              {linkedServices.map(
                                (
                                  clientService
                                ) => {
                                  const linkedTheme =
                                    getServiceTheme(
                                      clientService.service
                                    );

                                  return (
                                  <div
                                    key={
                                      clientService.id
                                    }
                                    style={{
                                      padding:
                                        "14px",
                                      borderRadius:
                                        "12px",
                                      border:
                                        `1px solid ${linkedTheme.border}`,
                                      background:
                                        linkedTheme.background,
                                      boxShadow:
                                        linkedTheme.glow,
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
                                        gap:
                                          "12px",
                                        flexWrap:
                                          "wrap",
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
                                              "5px",
                                          }}
                                        >
                                          {
                                            clientService.title
                                          }
                                        </strong>

                                        <span
                                          style={{
                                            color:
                                              linkedTheme.accent,
                                            fontSize:
                                              "0.78rem",
                                            fontWeight:
                                              700,
                                          }}
                                        >
                                          {
                                            getServiceLabel(
                                              clientService.service
                                            )
                                          }
                                        </span>
                                      </div>

                                      <span
                                        style={{
                                          ...statusStyle,
                                          padding:
                                            "6px 10px",
                                          fontSize:
                                            "0.72rem",
                                        }}
                                      >
                                        {getClientServiceStatusLabel(
                                          clientService.status
                                        )}
                                      </span>
                                    </div>

                                    {clientService.description && (
                                      <p
                                        style={{
                                          margin:
                                            "10px 0 0",
                                          color:
                                            "rgba(255,255,255,0.62)",
                                          fontSize:
                                            "0.8rem",
                                          lineHeight:
                                            1.55,
                                          whiteSpace:
                                            "pre-wrap",
                                        }}
                                      >
                                        {
                                          clientService.description
                                        }
                                      </p>
                                    )}

                                    {clientService.scheduled_at && (
                                      <div
                                        style={{
                                          display:
                                            "flex",
                                          alignItems:
                                            "center",
                                          gap:
                                            "7px",
                                          marginTop:
                                            "10px",
                                          color:
                                            "rgba(255,255,255,0.45)",
                                          fontSize:
                                            "0.76rem",
                                        }}
                                      >
                                        <Clock3
                                          size={14}
                                        />

                                        {ct("copy.scheduledFor")}{" "}
                                        {formatDate(
                                          clientService.scheduled_at
                                        )}
                                      </div>
                                    )}

                                    {clientService.completed_at && (
                                      <div
                                        style={{
                                          display:
                                            "flex",
                                          alignItems:
                                            "center",
                                          gap:
                                            "7px",
                                          marginTop:
                                            "10px",
                                          color:
                                            "#4ade80",
                                          fontSize:
                                            "0.76rem",
                                        }}
                                      >
                                        <ShieldCheck
                                          size={14}
                                        />

                                        {ct("copy.completedOn")}{" "}
                                        {formatDate(
                                          clientService.completed_at
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                                }
                              )}
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  }
                )}
              </div>
            )}
        </section>
        )}

        {/* MES SERVICES */}

        {activeSection === "orders" && (
          <section
            id="mes-commandes"
            className="login-card"
            style={{
              marginTop: "22px",
              scrollMarginTop:
                "96px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "flex-start",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom:
                  "20px",
              }}
            >
              <div>
                <span className="login-card__eyebrow">
                  {ct("copy.tsbStore")}
                </span>

                <h2
                  style={{
                    margin:
                      "5px 0 8px",
                  }}
                >
                  {ct("copy.myOrders")}
                </h2>

                <p
                  className="login-card__intro"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  {ct("copy.trackOrdersConfirmedByTsbTechGroupHere")}
                </p>
              </div>

              <div
                style={{
                  minWidth: "82px",
                  padding:
                    "11px 15px",
                  borderRadius:
                    "12px",
                  border:
                    "1px solid rgba(56,189,248,0.22)",
                  background:
                    "rgba(56,189,248,0.07)",
                  textAlign:
                    "center",
                }}
              >
                <ShoppingBag
                  size={20}
                  style={{
                    color:
                      "#38bdf8",
                    marginBottom:
                      "4px",
                  }}
                />
                <strong
                  style={{
                    display:
                      "block",
                    color:
                      "#ffffff",
                    fontSize:
                      "1.25rem",
                  }}
                >
                  {storeOrders.length}
                </strong>
              </div>
            </div>

            {ordersError && (
              <div
                style={{
                  ...itemStyle,
                  marginBottom:
                    "14px",
                  color:
                    "#fca5a5",
                }}
              >
                {ordersError}
              </div>
            )}

            {ordersLoading ? (
              <div style={itemStyle}>
                {ct("copy.loadingYourOrders")}
              </div>
            ) : storeOrders.length ===
              0 ? (
              <div style={itemStyle}>
                {ct("copy.noOrdersYetAnOrderWillAppearHereOnceA")}
              </div>
            ) : (
              <div
                style={{
                  display:
                    "grid",
                  gap: "12px",
                }}
              >
                {storeOrders.map(
                  (order) => (
                    <article
                        id={`client-order-${order.id}`}
                      key={order.id}
                      style={{
                        ...itemStyle,
                        border:
                          order.status ===
                          "completed"
                            ? "1px solid rgba(74,222,128,0.22)"
                            : order.status ===
                                "cancelled"
                              ? "1px solid rgba(248,113,113,0.22)"
                              : "1px solid rgba(56,189,248,0.18)",
                        background:
                          order.status ===
                          "completed"
                            ? "rgba(34,197,94,0.045)"
                            : order.status ===
                                "cancelled"
                              ? "rgba(248,113,113,0.045)"
                              : "rgba(56,189,248,0.035)",
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
                            className="login-card__eyebrow"
                            style={{
                              color:
                                "#38bdf8",
                            }}
                          >
                            {
                              order.order_number
                            }
                          </span>

                          <h3
                            style={{
                              margin:
                                "6px 0 5px",
                              color:
                                "#ffffff",
                              fontSize:
                                "1rem",
                            }}
                          >
                            {getLocalizedOrderProductName(
                              order
                            )}
                          </h3>

                          {order.sku && (
                            <div
                              style={{
                                color:
                                  "rgba(255,255,255,0.48)",
                                fontSize:
                                  "0.76rem",
                              }}
                            >
                              {ct("copy.reference")}
                              :{" "}
                              {order.sku}
                            </div>
                          )}
                        </div>

                        <span
                          style={{
                            minHeight:
                              "30px",
                            padding:
                              "0 10px",
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            borderRadius:
                              "999px",
                            border:
                              order.status ===
                              "completed"
                                ? "1px solid rgba(74,222,128,0.28)"
                                : order.status ===
                                    "cancelled"
                                  ? "1px solid rgba(248,113,113,0.28)"
                                  : "1px solid rgba(56,189,248,0.26)",
                            background:
                              order.status ===
                              "completed"
                                ? "rgba(34,197,94,0.10)"
                                : order.status ===
                                    "cancelled"
                                  ? "rgba(248,113,113,0.09)"
                                  : "rgba(56,189,248,0.09)",
                            color:
                              order.status ===
                              "completed"
                                ? "#86efac"
                                : order.status ===
                                    "cancelled"
                                  ? "#fca5a5"
                                  : "#7dd3fc",
                            fontSize:
                              "0.76rem",
                            fontWeight:
                              850,
                          }}
                        >
                          {getOrderStatusLabel(
                            order.status
                          )}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(160px, 1fr))",
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
                            "0.8rem",
                        }}
                      >
                        <div>
                          <strong
                            style={{
                              display:
                                "block",
                              color:
                                "rgba(255,255,255,0.46)",
                              fontSize:
                                "0.7rem",
                              textTransform:
                                "uppercase",
                              letterSpacing:
                                "0.06em",
                              marginBottom:
                                "4px",
                            }}
                          >
                            {ct("copy.quantity")}
                          </strong>
                          {order.quantity}
                        </div>

                        <div>
                          <strong
                            style={{
                              display:
                                "block",
                              color:
                                "rgba(255,255,255,0.46)",
                              fontSize:
                                "0.7rem",
                              textTransform:
                                "uppercase",
                              letterSpacing:
                                "0.06em",
                              marginBottom:
                                "4px",
                            }}
                          >
                            {ct("copy.unitPrice")}
                          </strong>
                          {formatOrderMoney(
                            order.unit_price,
                            order.currency
                          )}
                        </div>

                        <div>
                          <strong
                            style={{
                              display:
                                "block",
                              color:
                                "rgba(255,255,255,0.46)",
                              fontSize:
                                "0.7rem",
                              textTransform:
                                "uppercase",
                              letterSpacing:
                                "0.06em",
                              marginBottom:
                                "4px",
                            }}
                          >
                            {ct("copy.subtotal")}
                          </strong>
                          {formatOrderMoney(
                            getOrderSubtotal(
                              order
                            ),
                            order.currency
                          )}
                        </div>

                        <div>
                          <strong
                            style={{
                              display:
                                "block",
                              color:
                                "rgba(255,255,255,0.46)",
                              fontSize:
                                "0.7rem",
                              textTransform:
                                "uppercase",
                              letterSpacing:
                                "0.06em",
                              marginBottom:
                                "4px",
                            }}
                          >
                            {ct("copy.discount")}
                          </strong>
                          {formatOrderMoney(
                            order.discount_amount ??
                              0,
                            order.currency
                          )}
                        </div>

                        <div>
                          <strong
                            style={{
                              display:
                                "block",
                              color:
                                "rgba(255,255,255,0.46)",
                              fontSize:
                                "0.7rem",
                              textTransform:
                                "uppercase",
                              letterSpacing:
                                "0.06em",
                              marginBottom:
                                "4px",
                            }}
                          >
                            {ct("copy.fees")}
                          </strong>
                          {formatOrderMoney(
                            order.fees_amount ??
                              0,
                            order.currency
                          )}
                        </div>

                        <div
                          style={{
                            padding:
                              "10px 12px",
                            borderRadius:
                              "10px",
                            border:
                              "1px solid rgba(56,189,248,0.2)",
                            background:
                              "rgba(56,189,248,0.06)",
                          }}
                        >
                          <strong
                            style={{
                              display:
                                "block",
                              color:
                                "#7dd3fc",
                              fontSize:
                                "0.7rem",
                              textTransform:
                                "uppercase",
                              letterSpacing:
                                "0.06em",
                              marginBottom:
                                "4px",
                            }}
                          >
                            {ct("copy.finalTotal")}
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
                            {formatOrderMoney(
                              order.total_amount,
                              order.currency
                            )}
                          </span>
                        </div>

                        <div>
                          <strong
                            style={{
                              display:
                                "block",
                              color:
                                "rgba(255,255,255,0.46)",
                              fontSize:
                                "0.7rem",
                              textTransform:
                                "uppercase",
                              letterSpacing:
                                "0.06em",
                              marginBottom:
                                "4px",
                            }}
                          >
                            {ct("copy.createdOn")}
                          </strong>
                          {formatDate(
                            order.created_at
                          )}
                        </div>
                      </div>

                      {order.notes && (
                        <div
                          style={{
                            margin:
                              "13px 0 0",
                            padding:
                              "11px 12px",
                            borderRadius:
                              "10px",
                            border:
                              "1px solid rgba(255,255,255,0.08)",
                            background:
                              "rgba(255,255,255,0.035)",
                            color:
                              "rgba(255,255,255,0.66)",
                            lineHeight:
                              1.55,
                          }}
                        >
                          <strong
                            style={{
                              display:
                                "block",
                              marginBottom:
                                "4px",
                              color:
                                "rgba(255,255,255,0.88)",
                              fontSize:
                                "0.74rem",
                              textTransform:
                                "uppercase",
                              letterSpacing:
                                "0.05em",
                            }}
                          >
                            {ct("copy.tsbNote")}
                          </strong>
                          {order.notes}
                        </div>
                      )}
                    </article>
                  )
                )}
              </div>
            )}
          </section>
        )}

        {activeSection === "invoices" && (
          <section
            id="mes-factures"
            className="login-card"
            style={{
              marginTop: "22px",
              scrollMarginTop:
                "96px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "flex-start",
                gap: "16px",
                flexWrap:
                  "wrap",
                marginBottom:
                  "20px",
              }}
            >
              <div>
                <span className="login-card__eyebrow">
                  {ct("copy.tsbStore")}
                </span>

                <h2
                  style={{
                    margin:
                      "5px 0 8px",
                  }}
                >
                  {ct("copy.myInvoices")}
                </h2>

                <p
                  className="login-card__intro"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  {ct("copy.findYourInvoicesIssuedByTsbTechGroupTheirDue")}
                </p>
              </div>

              <div
                style={{
                  minWidth:
                    "82px",
                  padding:
                    "11px 15px",
                  borderRadius:
                    "12px",
                  border:
                    "1px solid rgba(56,189,248,0.22)",
                  background:
                    "rgba(56,189,248,0.07)",
                  textAlign:
                    "center",
                }}
              >
                <FileText
                  size={20}
                  style={{
                    color:
                      "#38bdf8",
                    marginBottom:
                      "4px",
                  }}
                />
                <strong
                  style={{
                    display:
                      "block",
                    color:
                      "#ffffff",
                    fontSize:
                      "1.25rem",
                  }}
                >
                  {
                    storeInvoices.length
                  }
                </strong>
              </div>
            </div>

            {invoicesError && (
              <div
                style={{
                  ...itemStyle,
                  marginBottom:
                    "14px",
                  color:
                    "#fca5a5",
                }}
              >
                {invoicesError}
              </div>
            )}

            {invoicesLoading ? (
              <div style={itemStyle}>
                {ct("copy.loadingYourInvoices")}
              </div>
            ) : storeInvoices.length ===
              0 ? (
              <div style={itemStyle}>
                {ct("copy.noIssuedInvoicesYet")}
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                {storeInvoices.map(
                  (invoice) => {
                    const isCancelled =
                      invoice.status ===
                      "cancelled";

                    const isPaid =
                      invoice.payment_status ===
                      "paid";

                    return (
                      <article
                        id={`client-invoice-${invoice.id}`}
                        key={
                          invoice.id
                        }
                        style={{
                          ...itemStyle,
                          border:
                            isCancelled
                              ? "1px solid rgba(248,113,113,0.22)"
                              : isPaid
                                ? "1px solid rgba(74,222,128,0.22)"
                                : "1px solid rgba(56,189,248,0.18)",
                          background:
                            isCancelled
                              ? "rgba(248,113,113,0.045)"
                              : isPaid
                                ? "rgba(34,197,94,0.045)"
                                : "rgba(56,189,248,0.035)",
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
                            gap:
                              "14px",
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
                              className="login-card__eyebrow"
                              style={{
                                color:
                                  "#38bdf8",
                              }}
                            >
                              {
                                invoice.invoice_number
                              }
                            </span>

                            <h3
                              style={{
                                margin:
                                  "6px 0 5px",
                                color:
                                  "#ffffff",
                                fontSize:
                                  "1rem",
                              }}
                            >
                              {getLocalizedInvoiceProductName(
                                invoice
                              )}
                            </h3>

                            <div
                              style={{
                                color:
                                  "rgba(255,255,255,0.48)",
                                fontSize:
                                  "0.76rem",
                              }}
                            >
                              {ct("copy.order")}
                              :{" "}
                              {
                                invoice.order_number
                              }
                              {invoice.sku
                                ? ` · ${ct("copy.ref")} ${invoice.sku}`
                                : ""}
                            </div>
                          </div>

                          <div
                            style={{
                              display:
                                "flex",
                              gap: "7px",
                              flexWrap:
                                "wrap",
                              justifyContent:
                                "flex-end",
                            }}
                          >
                            <span
                              style={{
                                minHeight:
                                  "30px",
                                padding:
                                  "0 10px",
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                borderRadius:
                                  "999px",
                                border:
                                  isCancelled
                                    ? "1px solid rgba(248,113,113,0.28)"
                                    : "1px solid rgba(56,189,248,0.26)",
                                background:
                                  isCancelled
                                    ? "rgba(248,113,113,0.09)"
                                    : "rgba(56,189,248,0.09)",
                                color:
                                  isCancelled
                                    ? "#fca5a5"
                                    : "#7dd3fc",
                                fontSize:
                                  "0.76rem",
                                fontWeight:
                                  850,
                              }}
                            >
                              {getInvoiceStatusLabel(
                                invoice.status
                              )}
                            </span>

                            <span
                              style={{
                                minHeight:
                                  "30px",
                                padding:
                                  "0 10px",
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                borderRadius:
                                  "999px",
                                border:
                                  isPaid
                                    ? "1px solid rgba(74,222,128,0.28)"
                                    : "1px solid rgba(250,204,21,0.25)",
                                background:
                                  isPaid
                                    ? "rgba(34,197,94,0.10)"
                                    : "rgba(250,204,21,0.07)",
                                color:
                                  isPaid
                                    ? "#86efac"
                                    : "#fde68a",
                                fontSize:
                                  "0.76rem",
                                fontWeight:
                                  850,
                              }}
                            >
                              {getInvoicePaymentStatusLabel(
                                invoice.payment_status
                              )}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            display:
                              "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(155px, 1fr))",
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
                              "0.8rem",
                          }}
                        >
                          {[
                            {
                              label: ct("copy.issueDate"),
                              value:
                                formatInvoiceDate(
                                  invoice.issue_date
                                ),
                            },
                            {
                              label: ct("copy.dueDate"),
                              value:
                                formatInvoiceDate(
                                  invoice.due_date
                                ),
                            },
                            {
                              label: ct("copy.quantity"),
                              value:
                                String(
                                  invoice.quantity
                                ),
                            },
                            {
                              label: ct("copy.unitPrice"),
                              value:
                                formatOrderMoney(
                                  invoice.unit_price,
                                  invoice.currency
                                ),
                            },
                            {
                              label: ct("copy.vat"),
                              value:
                                `${invoice.tax_rate}% · ${formatOrderMoney(
                                  invoice.tax_amount,
                                  invoice.currency
                                )}`,
                            },
                          ].map(
                            (
                              item
                            ) => (
                              <div
                                key={
                                  item.label
                                }
                              >
                                <strong
                                  style={{
                                    display:
                                      "block",
                                    color:
                                      "rgba(255,255,255,0.46)",
                                    fontSize:
                                      "0.7rem",
                                    textTransform:
                                      "uppercase",
                                    letterSpacing:
                                      "0.06em",
                                    marginBottom:
                                      "4px",
                                  }}
                                >
                                  {
                                    item.label
                                  }
                                </strong>
                                {
                                  item.value
                                }
                              </div>
                            )
                          )}

                          <div
                            style={{
                              padding:
                                "10px 12px",
                              borderRadius:
                                "10px",
                              border:
                                "1px solid rgba(56,189,248,0.2)",
                              background:
                                "rgba(56,189,248,0.06)",
                            }}
                          >
                            <strong
                              style={{
                                display:
                                  "block",
                                color:
                                  "#7dd3fc",
                                fontSize:
                                  "0.7rem",
                                textTransform:
                                  "uppercase",
                                letterSpacing:
                                  "0.06em",
                                marginBottom:
                                  "4px",
                              }}
                            >
                              {ct("copy.total")}
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
                              {formatOrderMoney(
                                invoice.total_amount,
                                invoice.currency
                              )}
                            </span>
                          </div>
                        </div>

                        {invoice.notes && (
                          <div
                            style={{
                              margin:
                                "13px 0 0",
                              padding:
                                "11px 12px",
                              borderRadius:
                                "10px",
                              border:
                                "1px solid rgba(255,255,255,0.08)",
                              background:
                                "rgba(255,255,255,0.035)",
                              color:
                                "rgba(255,255,255,0.66)",
                              lineHeight:
                                1.55,
                            }}
                          >
                            <strong
                              style={{
                                display:
                                  "block",
                                marginBottom:
                                  "4px",
                                color:
                                  "rgba(255,255,255,0.88)",
                                fontSize:
                                  "0.74rem",
                                textTransform:
                                  "uppercase",
                                letterSpacing:
                                  "0.05em",
                              }}
                            >
                              {ct("copy.tsbNote")}
                            </strong>
                            {
                              invoice.notes
                            }
                          </div>
                        )}

                        <div
                          style={{
                            marginTop:
                              "14px",
                            display:
                              "flex",
                            justifyContent:
                              "flex-end",
                          }}
                        >
                          <button
                            type="button"
                            className="button"
                            onClick={() =>
                              downloadClientInvoicePdf(
                                invoice
                              )
                            }
                          >
                            <FileDown
                              size={16}
                            />
                            {ct("copy.downloadInvoice")}
                          </button>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>
        )}

        {activeSection === "services" && (
          <section
          id="mes-services"
          className="login-card"
          style={{
            marginTop: "22px",
            scrollMarginTop: "96px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "flex-start",
              gap: "18px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <span className="login-card__eyebrow">
                {ct("copy.myServices")}</span>

              <h2>
                {ct("copy.myTsbInterventions")}</h2>

              <p className="login-card__intro">
                {ct("copy.viewTheInterventionsPlannedInProgressOrCompletedForYour")}</p>
            </div>

            <a
              href="/#quote"
              className="login-create"
              style={{
                width: "auto",
                minHeight: "44px",
                padding: "0 18px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent:
                  "center",
                gap: "8px",
                textDecoration: "none",
              }}
            >
              <Plus size={18} />
              {ct("copy.requestAService")}</a>
          </div>

          {activeServiceDomain && (
            <div
              style={{
                marginTop:
                  "16px",
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "10px",
                flexWrap:
                  "wrap",
              }}
            >
              <span
                style={{
                  padding:
                    "7px 10px",
                  borderRadius:
                    "999px",
                  border:
                    `1px solid ${activeServiceDomain.theme.borderStrong}`,
                  background:
                    activeServiceDomain.theme.badgeBackground,
                  color:
                    activeServiceDomain.theme.accentStrong,
                  fontSize:
                    "0.72rem",
                  fontWeight:
                    900,
                }}
              >
                {ct("copy.openFolder")}{" "}
                {getDomainLabel(activeServiceDomain.key, activeServiceDomain.label)}{" "}
                {ct("copy.interventionsd200fb")}</span>

              <button
                type="button"
                className="text-link"
                onClick={() =>
                  setActiveServiceDomainKey(
                    null
                  )
                }
              >
                {ct("copy.viewAllInterventions")}</button>
            </div>
          )}

          {servicesLoading && (
            <p
              style={{
                color:
                  "rgba(255,255,255,0.6)",
                marginTop: "22px",
              }}
            >
              {ct("copy.loadingYourServices")}</p>
          )}

          {servicesError && (
            <p className="login-form-message">
              {servicesError}
            </p>
          )}

          {!servicesLoading &&
            !servicesError &&
            clientServices.length ===
              0 && (
              <div
                style={{
                  padding: "34px 0",
                  textAlign: "center",
                  color:
                    "rgba(255,255,255,0.55)",
                }}
              >
                <Wrench
                  size={38}
                  strokeWidth={1.5}
                  style={{
                    marginBottom:
                      "12px",
                  }}
                />

                <p
                  style={{
                    margin: 0,
                  }}
                >
                  {ct("copy.noInterventionIsLinkedToYourAccountYet")}</p>
              </div>
            )}

          {!servicesLoading &&
            !servicesError &&
            visibleClientServices.length >
              0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "14px",
                  marginTop: "22px",
                }}
              >
                {visibleClientServices.map(
                  (clientService) => {
                    const serviceTheme =
                      getServiceTheme(
                        clientService.service
                      );

                    const linkedDocuments =
                      documents.filter(
                        (
                          clientDocument
                        ) =>
                          clientDocument.client_service_id ===
                          clientService.id
                      );

                    return (
                      <article
                        id={`client-service-${clientService.id}`}
                        key={
                          clientService.id
                        }
                        style={{
                          ...itemStyle,
                          border:
                            `1px solid ${serviceTheme.borderStrong}`,
                          background:
                            `linear-gradient(135deg, ${serviceTheme.backgroundStrong}, rgba(5,12,22,0.92))`,
                          boxShadow:
                            `${serviceTheme.glowStrong}, inset 5px 0 0 ${serviceTheme.accent}`,
                          scrollMarginTop:
                            "30px",
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
                            marginBottom:
                              "14px",
                          }}
                        >
                          <div>
                            <span
                              className="login-card__eyebrow"
                              style={{
                                color:
                                  serviceTheme.accentStrong,
                              }}
                            >
                              {
                                getServiceLabel(
                                  clientService.service
                                )
                              }
                            </span>

                            <h3
                              style={{
                                margin:
                                  "7px 0 0",
                                color:
                                  "#fff",
                              }}
                            >
                              {
                                clientService.title
                              }
                            </h3>
                          </div>

                          <span
                            style={
                              statusStyle
                            }
                          >
                            {getClientServiceStatusLabel(
                              clientService.status
                            )}
                          </span>
                        </div>

                        {clientService.description && (
                          <p
                            style={{
                              margin:
                                "0 0 18px",
                              color:
                                "rgba(255,255,255,0.68)",
                              lineHeight:
                                1.6,
                              whiteSpace:
                                "pre-wrap",
                            }}
                          >
                            {
                              clientService.description
                            }
                          </p>
                        )}

                        <div
                          style={{
                            display:
                              "grid",
                            gap: "9px",
                          }}
                        >
                          {clientService.scheduled_at && (
                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: "7px",
                                color:
                                  "rgba(255,255,255,0.5)",
                                fontSize:
                                  "0.78rem",
                              }}
                            >
                              <Clock3
                                size={15}
                              />

                              {ct("copy.interventionScheduledFor")}{" "}
                              {formatDate(
                                clientService.scheduled_at
                              )}
                            </div>
                          )}

                          {clientService.completed_at && (
                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: "7px",
                                color:
                                  "#4ade80",
                                fontSize:
                                  "0.78rem",
                              }}
                            >
                              <ShieldCheck
                                size={15}
                              />

                              {ct("copy.completedOn")}{" "}
                              {formatDate(
                                clientService.completed_at
                              )}
                            </div>
                          )}

                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: "7px",
                              color:
                                "rgba(255,255,255,0.4)",
                              fontSize:
                                "0.76rem",
                            }}
                          >
                            <Clock3
                              size={14}
                            />

                            {ct("copy.addedOn")}{" "}
                            {formatDate(
                              clientService.created_at
                            )}
                          </div>
                        </div>

                        {!documentsLoading &&
                          linkedDocuments.length >
                            0 && (
                            <div
                              style={{
                                marginTop:
                                  "20px",
                                paddingTop:
                                  "18px",
                                borderTop:
                                  "1px solid rgba(255,255,255,0.08)",
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
                                  gap:
                                    "12px",
                                  flexWrap:
                                    "wrap",
                                  marginBottom:
                                    "12px",
                                }}
                              >
                                <span className="login-card__eyebrow">
                                  {ct("copy.relatedDocuments")}</span>

                                <span
                                  style={{
                                    color:
                                      "#53a7ff",
                                    fontSize:
                                      "0.76rem",
                                    fontWeight:
                                      700,
                                  }}
                                >
                                  {
                                    linkedDocuments.length
                                  }{" "}
                                  {ct(
                                    linkedDocuments.length === 1
                                      ? "misc.documentSingular"
                                      : "misc.documentPlural"
                                  )}
                                </span>
                              </div>

                              <div
                                style={{
                                  display:
                                    "grid",
                                  gap:
                                    "10px",
                                }}
                              >
                                {linkedDocuments.map(
                                  (
                                    clientDocument
                                  ) => (
                                    <div
                                      key={
                                        clientDocument.id
                                      }
                                      style={{
                                        display:
                                          "flex",
                                        alignItems:
                                          "center",
                                        justifyContent:
                                          "space-between",
                                        gap:
                                          "12px",
                                        flexWrap:
                                          "wrap",
                                        padding:
                                          "12px",
                                        borderRadius:
                                          "10px",
                                        border:
                                          "1px solid rgba(22,136,255,0.18)",
                                        background:
                                          "rgba(22,136,255,0.055)",
                                      }}
                                    >
                                      <div
                                        style={{
                                          minWidth:
                                            0,
                                        }}
                                      >
                                        <div
                                          style={{
                                            display:
                                              "flex",
                                            alignItems:
                                              "center",
                                            gap:
                                              "7px",
                                            color:
                                              "#53a7ff",
                                            fontSize:
                                              "0.72rem",
                                            fontWeight:
                                              800,
                                            textTransform:
                                              "uppercase",
                                          }}
                                        >
                                          <FileText
                                            size={
                                              14
                                            }
                                          />

                                          {getDocumentTypeLabel(
                                            clientDocument.document_type
                                          )}
                                        </div>

                                        <div
                                          style={{
                                            marginTop:
                                              "5px",
                                            color:
                                              "#ffffff",
                                            fontSize:
                                              "0.86rem",
                                            fontWeight:
                                              700,
                                            overflowWrap:
                                              "anywhere",
                                          }}
                                        >
                                          {
                                            clientDocument.title
                                          }
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        className="button button--secondary"
                                        onClick={() =>
                                          handleOpenDocument(
                                            clientDocument
                                          )
                                        }
                                        disabled={
                                          openingDocumentId ===
                                          clientDocument.id
                                        }
                                        style={{
                                          width:
                                            "auto",
                                          minHeight:
                                            "38px",
                                          padding:
                                            "0 13px",
                                          display:
                                            "inline-flex",
                                          alignItems:
                                            "center",
                                          justifyContent:
                                            "center",
                                          gap:
                                            "7px",
                                          whiteSpace:
                                            "nowrap",
                                        }}
                                      >
                                        <ExternalLink
                                          size={
                                            15
                                          }
                                        />

                                        {openingDocumentId ===
                                        clientDocument.id
                                          ? ct("copy.opening")
                                          : ct("copy.opend37f60")}
                                      </button>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </article>
                    );
                  }
                )}
              </div>
            )}
        </section>
        )}

        {/* MES DOCUMENTS */}

        {activeSection === "appointments" && (
          <section
            id="mes-rendez-vous"
            className="login-card"
            style={{
              marginBottom: "22px",
              scrollMarginTop: "96px",
            }}
          >
            <span className="login-card__eyebrow">
              {ct("copy.appointments4e82f0")}</span>

            <h2>{ct("copy.myAppointments")}</h2>

            <p className="login-card__intro">
              {ct("copy.viewYourAppointmentsAndScheduledInterventionsWithTsbTechGroup")}</p>

            {appointmentResponseMessage && (
              <div
                style={{
                  ...itemStyle,
                  marginBottom: "16px",
                  color:
                    appointmentResponseMessage ===
                    ct("copy.yourResponseCannotBeSavedAtTheMoment")
                      ? "#fca5a5"
                      : "#4ade80",
                }}
              >
                {appointmentResponseMessage}
              </div>
            )}

            {appointmentsError && (
              <div
                style={{
                  ...itemStyle,
                  marginBottom: "16px",
                  color: "#fca5a5",
                }}
              >
                {appointmentsError}
              </div>
            )}

            {!appointmentsLoading &&
              appointments.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: "9px",
                    flexWrap: "wrap",
                    marginBottom: "16px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setAppointmentView("upcoming")
                    }
                    style={{
                      minHeight: "38px",
                      padding: "0 13px",
                      borderRadius: "10px",
                      border:
                        appointmentView === "upcoming"
                          ? "1px solid rgba(83,167,255,0.55)"
                          : "1px solid rgba(255,255,255,0.12)",
                      background:
                        appointmentView === "upcoming"
                          ? "rgba(83,167,255,0.14)"
                          : "rgba(255,255,255,0.035)",
                      color:
                        appointmentView === "upcoming"
                          ? "#7fc0ff"
                          : "rgba(255,255,255,0.72)",
                      cursor: "pointer",
                      fontWeight: 850,
                    }}
                  >
                    {ct("copy.upcoming")}{upcomingAppointments.length})
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setAppointmentView("history")
                    }
                    style={{
                      minHeight: "38px",
                      padding: "0 13px",
                      borderRadius: "10px",
                      border:
                        appointmentView === "history"
                          ? "1px solid rgba(167,139,250,0.55)"
                          : "1px solid rgba(255,255,255,0.12)",
                      background:
                        appointmentView === "history"
                          ? "rgba(167,139,250,0.13)"
                          : "rgba(255,255,255,0.035)",
                      color:
                        appointmentView === "history"
                          ? "#c4b5fd"
                          : "rgba(255,255,255,0.72)",
                      cursor: "pointer",
                      fontWeight: 850,
                    }}
                  >
                    {ct("copy.history")}{appointmentHistory.length})
                  </button>
                </div>
              )}

            {appointmentsLoading ? (
              <div style={itemStyle}>
                {ct("copy.loadingYourAppointments")}</div>
            ) : appointments.length === 0 ? (
              <div style={itemStyle}>
                {ct("copy.noAppointmentIsCurrentlyScheduled")}</div>
            ) : visibleAppointments.length === 0 ? (
              <div style={itemStyle}>
                {appointmentView === "upcoming"
                  ? ct("copy.noUpcomingAppointments")
                  : ct("copy.noAppointmentsInHistory")}
              </div>
            ) : (
              <div style={cardGridStyle}>
                {visibleAppointments.map(
                  (appointment) => {
                    const scheduledTime = new Date(
                      appointment.scheduled_at
                    ).getTime();
                    const isPastByDate =
                      Number.isFinite(scheduledTime) &&
                      scheduledTime < appointmentNow;
                    const showPastStatus =
                      isPastByDate &&
                      appointment.status !== "completed" &&
                      appointment.status !== "cancelled";

                    const linkedService =
                      appointment.client_service_id
                        ? clientServiceById.get(
                            appointment.client_service_id
                          )
                        : null;

                    return (
                      <article
                        key={appointment.id}
                        id={`client-appointment-${appointment.id}`}
                        style={{
                          ...itemStyle,
                          ...(appointment.status === "confirmed"
                            ? {
                                border:
                                  "1px solid rgba(74,222,128,0.26)",
                                background:
                                  "rgba(34,197,94,0.055)",
                              }
                            : appointment.status === "cancelled"
                              ? {
                                  border:
                                    "1px solid rgba(248,113,113,0.28)",
                                  background:
                                    "rgba(248,113,113,0.05)",
                                }
                              : {}),
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: "14px",
                            flexWrap: "wrap",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "12px",
                              alignItems: "flex-start",
                            }}
                          >
                            <CalendarDays
                              size={22}
                              style={{
                                color: "#53a7ff",
                                flexShrink: 0,
                                marginTop: "2px",
                              }}
                            />

                            <div>
                              <strong
                                style={{
                                  color: "#fff",
                                  fontSize: "1rem",
                                }}
                              >
                                {appointment.title}
                              </strong>

                              <div
                                style={{
                                  marginTop: "7px",
                                  color: "rgba(255,255,255,0.70)",
                                  fontSize: "0.84rem",
                                  lineHeight: 1.55,
                                }}
                              >
                                {formatDate(
                                  appointment.scheduled_at
                                )}
                              </div>
                            </div>
                          </div>

                          <span
                            style={
                              showPastStatus
                                ? {
                                    display: "inline-flex",
                                    alignItems: "center",
                                    minHeight: "30px",
                                    padding: "0 10px",
                                    borderRadius: "999px",
                                    border:
                                      "1px solid rgba(167,139,250,0.28)",
                                    background:
                                      "rgba(167,139,250,0.10)",
                                    color: "#c4b5fd",
                                    fontSize: "0.78rem",
                                    fontWeight: 850,
                                  }
                                : getAppointmentStatusStyle(
                                    appointment.status
                                  )
                            }
                          >
                            {showPastStatus
                              ? ct("copy.past")
                              : getAppointmentStatusLabel(
                                  appointment.status
                                )}
                          </span>
                        </div>

                        {appointment.location && (
                          <p
                            style={{
                              margin: "14px 0 0",
                              color: "rgba(255,255,255,0.72)",
                              lineHeight: 1.55,
                            }}
                          >
                            <strong>{ct("copy.location")}</strong>{" "}
                            {appointment.location}
                          </p>
                        )}

                        {linkedService && (
                          <p
                            style={{
                              margin: "10px 0 0",
                              color: "rgba(255,255,255,0.72)",
                              lineHeight: 1.55,
                            }}
                          >
                            <strong>{ct("copy.intervention79e095")}</strong>{" "}
                            {linkedService.title}
                          </p>
                        )}

                        {appointment.description && (
                          <p
                            style={{
                              margin: "10px 0 0",
                              color: "rgba(255,255,255,0.64)",
                              lineHeight: 1.6,
                            }}
                          >
                            {appointment.description}
                          </p>
                        )}

                        <div
                          style={{
                            marginTop: "16px",
                            paddingTop: "14px",
                            borderTop:
                              "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          <div
                            style={{
                              marginBottom: "11px",
                              color:
                                appointment.client_response ===
                                "accepted"
                                  ? "#4ade80"
                                  : appointment.client_response ===
                                      "declined"
                                    ? "#fca5a5"
                                    : appointment.client_response ===
                                        "reschedule_requested"
                                      ? "#fbbf24"
                                      : "rgba(255,255,255,0.70)",
                              fontSize: "0.82rem",
                              fontWeight: 800,
                            }}
                          >
                            {ct("copy.yourResponse")}{" "}
                            {getAppointmentResponseLabel(
                              appointment.client_response
                            )}
                          </div>

                          {appointment.client_response_message && (
                            <p
                              style={{
                                margin: "0 0 12px",
                                color:
                                  "rgba(255,255,255,0.64)",
                                fontSize: "0.82rem",
                                lineHeight: 1.55,
                              }}
                            >
                              <strong>{ct("copy.yourMessage")}</strong>{" "}
                              {appointment.client_response_message}
                            </p>
                          )}

                          {appointmentView === "upcoming" &&
                            !isPastByDate &&
                            appointment.status !== "completed" &&
                            appointment.status !== "cancelled" && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: "9px",
                                  flexWrap: "wrap",
                                }}
                              >
                                <button
                                  type="button"
                                  className="button button--secondary"
                                  onClick={() =>
                                    handleAppointmentResponse(
                                      appointment,
                                      "accepted"
                                    )
                                  }
                                  disabled={
                                    appointmentResponseLoadingId ===
                                    appointment.id
                                  }
                                  style={{
                                    width: "auto",
                                    minHeight: "38px",
                                    padding: "0 13px",
                                    borderColor:
                                      "rgba(74,222,128,0.34)",
                                  }}
                                >
                                  {ct("copy.accept")}</button>

                                <button
                                  type="button"
                                  className="button button--secondary"
                                  onClick={() =>
                                    handleAppointmentResponse(
                                      appointment,
                                      "declined"
                                    )
                                  }
                                  disabled={
                                    appointmentResponseLoadingId ===
                                    appointment.id
                                  }
                                  style={{
                                    width: "auto",
                                    minHeight: "38px",
                                    padding: "0 13px",
                                    borderColor:
                                      "rgba(248,113,113,0.34)",
                                  }}
                                >
                                  {ct("copy.cancel")}</button>

                                <button
                                  type="button"
                                  className="button button--secondary"
                                  onClick={() => {
                                    if (
                                      rescheduleAppointmentId ===
                                      appointment.id
                                    ) {
                                      setRescheduleAppointmentId(null);
                                      return;
                                    }

                                    const currentDate = new Date(
                                      appointment.scheduled_at
                                    );
                                    const localYear = currentDate.getFullYear();
                                    const localMonth = String(
                                      currentDate.getMonth() + 1
                                    ).padStart(2, "0");
                                    const localDay = String(
                                      currentDate.getDate()
                                    ).padStart(2, "0");
                                    const localHours = String(
                                      currentDate.getHours()
                                    ).padStart(2, "0");
                                    const localMinutes = String(
                                      currentDate.getMinutes()
                                    ).padStart(2, "0");

                                    setRescheduleDate(
                                      `${localYear}-${localMonth}-${localDay}`
                                    );
                                    setRescheduleTime(
                                      `${localHours}:${localMinutes}`
                                    );
                                    setRescheduleAppointmentId(
                                      appointment.id
                                    );
                                    setAppointmentResponseMessage("");
                                  }}
                                  disabled={
                                    appointmentResponseLoadingId ===
                                    appointment.id
                                  }
                                  style={{
                                    width: "auto",
                                    minHeight: "38px",
                                    padding: "0 13px",
                                    borderColor:
                                      "rgba(251,191,36,0.34)",
                                  }}
                                >
                                  {rescheduleAppointmentId ===
                                  appointment.id
                                    ? ct("copy.close")
                                    : ct("copy.edit")}
                                </button>
                              </div>
                            )}

                          {appointmentView === "upcoming" &&
                            !isPastByDate &&
                            rescheduleAppointmentId === appointment.id &&
                            appointment.status !== "completed" &&
                            appointment.status !== "cancelled" && (
                              <div
                                style={{
                                  marginTop: "14px",
                                  padding: "14px",
                                  borderRadius: "12px",
                                  border:
                                    "1px solid rgba(251,191,36,0.24)",
                                  background:
                                    "rgba(251,191,36,0.055)",
                                }}
                              >
                                <div
                                  style={{
                                    marginBottom: "10px",
                                    color: "#fbbf24",
                                    fontSize: "0.82rem",
                                    fontWeight: 800,
                                  }}
                                >
                                  {ct("copy.chooseTheDesiredNewDateAndTime")}</div>

                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                      "repeat(auto-fit, minmax(170px, 1fr))",
                                    gap: "10px",
                                  }}
                                >
                                  <label
                                    style={{
                                      display: "grid",
                                      gap: "6px",
                                      color:
                                        "rgba(255,255,255,0.72)",
                                      fontSize: "0.76rem",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {ct("copy.date")}<input
                                      type="date"
                                      value={rescheduleDate}
                                      onChange={(event) =>
                                        setRescheduleDate(
                                          event.target.value
                                        )
                                      }
                                      style={{
                                        minHeight: "42px",
                                        padding: "0 11px",
                                        borderRadius: "9px",
                                        border:
                                          "1px solid rgba(255,255,255,0.14)",
                                        background: "#0f1d2e",
                                        color: "#ffffff",
                                        colorScheme: "dark",
                                      }}
                                    />
                                  </label>

                                  <label
                                    style={{
                                      display: "grid",
                                      gap: "6px",
                                      color:
                                        "rgba(255,255,255,0.72)",
                                      fontSize: "0.76rem",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {ct("copy.time")}<input
                                      type="time"
                                      value={rescheduleTime}
                                      onChange={(event) =>
                                        setRescheduleTime(
                                          event.target.value
                                        )
                                      }
                                      style={{
                                        minHeight: "42px",
                                        padding: "0 11px",
                                        borderRadius: "9px",
                                        border:
                                          "1px solid rgba(255,255,255,0.14)",
                                        background: "#0f1d2e",
                                        color: "#ffffff",
                                        colorScheme: "dark",
                                      }}
                                    />
                                  </label>
                                </div>

                                <button
                                  type="button"
                                  className="button button--secondary"
                                  onClick={() => {
                                    if (!rescheduleDate || !rescheduleTime) {
                                      setAppointmentResponseMessage(
                                        ct("copy.chooseTheDesiredDateAndTime")
                                      );
                                      return;
                                    }

                                    const formattedDate = new Intl.DateTimeFormat(
                                      intlLocale,
                                      {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                      }
                                    ).format(
                                      new Date(`${rescheduleDate}T12:00:00`)
                                    );

                                    handleAppointmentResponse(
                                      appointment,
                                      "reschedule_requested",
                                      `${ct("appointmentReschedule.requestedPrefix")} ${formattedDate} ${ct("appointmentReschedule.at")} ${rescheduleTime}`
                                    );
                                  }}
                                  disabled={
                                    appointmentResponseLoadingId ===
                                    appointment.id
                                  }
                                  style={{
                                    width: "auto",
                                    minHeight: "40px",
                                    marginTop: "11px",
                                    padding: "0 14px",
                                    borderColor:
                                      "rgba(251,191,36,0.42)",
                                  }}
                                >
                                  {appointmentResponseLoadingId ===
                                  appointment.id
                                    ? ct("copy.sending")
                                    : ct("copy.sendNewDate")}
                                </button>
                              </div>
                            )}
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>
        )}

        {activeSection === "documents" && (
          <section
          id="mes-documents"
          className="login-card"
          style={{
            marginTop:
              "22px",
            scrollMarginTop:
              "96px",
          }}
        >
          <span className="login-card__eyebrow">
            {ct("copy.myDocuments")}</span>

          <h2>
            {ct("copy.tsbDocuments")}</h2>

          <p className="login-card__intro">
            {ct("copy.findYourDocumentsByCategoryUseSearchAndTheIntervention")}</p>

          {activeDocumentDomain &&
            activeDocumentFolder && (
            <div
              style={{
                marginTop:
                  "16px",
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "10px",
                flexWrap:
                  "wrap",
              }}
            >
              <span
                style={{
                  padding:
                    "7px 10px",
                  borderRadius:
                    "999px",
                  border:
                    `1px solid ${activeDocumentDomain.theme.borderStrong}`,
                  background:
                    activeDocumentDomain.theme.badgeBackground,
                  color:
                    activeDocumentDomain.theme.accentStrong,
                  fontSize:
                    "0.72rem",
                  fontWeight:
                    900,
                }}
              >
                {ct("copy.openFolder")}{" "}
                {getDomainLabel(activeDocumentDomain.key, activeDocumentDomain.label)}{" "}
                /{" "}
                {getFolderLabel(activeDocumentFolder.key, activeDocumentFolder.label)}
              </span>

              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setActiveDocumentDomainKey(
                    null
                  );
                  setActiveDocumentFolderKey(
                    null
                  );
                  setDocumentCategoryFilter(
                    "all"
                  );
                  setDocumentInterventionFilter(
                    "all"
                  );
                  setDocumentSearchQuery(
                    ""
                  );
                  setDocumentPage(
                    1
                  );
                }}
              >
                {ct("copy.viewAllDocuments")}</button>
            </div>
          )}

          {documentsLoading && (
            <p
              style={{
                color:
                  "rgba(255,255,255,0.6)",
              }}
            >
              {ct("copy.loadingDocuments")}</p>
          )}

          {documentsError && (
            <p className="login-form-message">
              {documentsError}
            </p>
          )}

          {!documentsLoading &&
            !documentsError &&
            documents.length ===
              0 && (
              <div
                style={{
                  padding:
                    "34px 0",
                  textAlign:
                    "center",
                  color:
                    "rgba(255,255,255,0.55)",
                }}
              >
                <FolderOpen
                  size={38}
                  strokeWidth={
                    1.5
                  }
                  style={{
                    marginBottom:
                      "12px",
                  }}
                />

                <p
                  style={{
                    margin: 0,
                  }}
                >
                  {ct("copy.noDocumentIsAvailableInYourAreaYet")}</p>
              </div>
            )}

          {!documentsLoading &&
            documents.length >
              0 && (
              <>
                <div
                  style={{
                    display:
                      "flex",
                    gap: "8px",
                    flexWrap:
                      "wrap",
                    marginTop:
                      "22px",
                    marginBottom:
                      "16px",
                  }}
                >
                  {DOCUMENT_CATEGORIES.map(
                    (category) => {
                      const isActive =
                        documentCategoryFilter ===
                        category.value;

                      return (
                        <button
                          key={
                            category.value
                          }
                          type="button"
                          onClick={() => {
                            setDocumentCategoryFilter(
                              category.value
                            );
                            setActiveDocumentFolderKey(
                              "documents"
                            );
                            setDocumentPage(
                              1
                            );
                          }}
                          style={{
                            minHeight:
                              "38px",
                            padding:
                              "0 12px",
                            borderRadius:
                              "10px",
                            border:
                              isActive
                                ? "1px solid rgba(22,136,255,0.55)"
                                : "1px solid rgba(255,255,255,0.1)",
                            background:
                              isActive
                                ? "rgba(22,136,255,0.14)"
                                : "rgba(255,255,255,0.035)",
                            color:
                              isActive
                                ? "#53a7ff"
                                : "rgba(255,255,255,0.72)",
                            cursor:
                              "pointer",
                            fontWeight:
                              isActive
                                ? 700
                                : 500,
                          }}
                        >
                          {getDocumentCategoryLabel(category.value, category.value)}{" "}
                          <span
                            style={{
                              opacity:
                                0.72,
                            }}
                          >
                            {
                              documentCategoryCounts[
                                category.value
                              ] || 0
                            }
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "12px",
                    marginBottom:
                      "18px",
                  }}
                >
                  <input
                    type="search"
                    value={
                      documentSearchQuery
                    }
                    onChange={(
                      event
                    ) => {
                      setDocumentSearchQuery(
                        event.target
                          .value
                      );
                      setDocumentPage(
                        1
                      );
                    }}
                    placeholder={ct("copy.searchForADocument")}
                    aria-label={ct("copy.searchMyDocuments")}
                    style={{
                      minHeight:
                        "44px",
                      padding:
                        "0 13px",
                      borderRadius:
                        "10px",
                      border:
                        "1px solid rgba(255,255,255,0.12)",
                      background:
                        "#0f1d2e",
                      color:
                        "#ffffff",
                    }}
                  />

                  <select
                    value={
                      documentInterventionFilter
                    }
                    onChange={(
                      event
                    ) => {
                      setDocumentInterventionFilter(
                        event.target
                          .value
                      );
                      setDocumentPage(
                        1
                      );
                    }}
                    aria-label={ct("copy.filterDocumentsByIntervention")}
                    style={{
                      minHeight:
                        "44px",
                      padding:
                        "0 13px",
                      borderRadius:
                        "10px",
                      border:
                        "1px solid rgba(255,255,255,0.12)",
                      background:
                        "#0f1d2e",
                      color:
                        "#ffffff",
                    }}
                  >
                    <option value="all">
                      {ct("copy.allInterventions")}</option>

                    {clientServices.map(
                      (
                        clientService
                      ) => (
                        <option
                          key={
                            clientService.id
                          }
                          value={
                            clientService.id
                          }
                        >
                          {
                            getServiceLabel(
                              clientService.service
                            )
                          }{" "}
                          —{" "}
                          {
                            clientService.title
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "flex-end",
                    marginBottom:
                      "12px",
                    color:
                      "rgba(255,255,255,0.48)",
                    fontSize:
                      "0.8rem",
                  }}
                >
                  {
                    filteredDocuments.length
                  }{" "}
                  {ct(
                    filteredDocuments.length === 1
                      ? "misc.documentSingular"
                      : "misc.documentPlural"
                  )}
                </div>

                {filteredDocuments.length ===
                0 ? (
                  <div
                    style={{
                      padding:
                        "30px 18px",
                      textAlign:
                        "center",
                      borderRadius:
                        "12px",
                      border:
                        "1px dashed rgba(255,255,255,0.12)",
                      color:
                        "rgba(255,255,255,0.58)",
                    }}
                  >
                    {ct("copy.noDocumentMatchesThisCategoryOrTheseFilters")}</div>
                ) : (
                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(240px, 1fr))",
                      gap:
                        "14px",
                    }}
                  >
                    {visibleDocuments.map(
                      (
                        clientDocument
                      ) => {
                        const linkedService =
                          clientDocument.client_service_id
                            ? clientServiceById.get(
                                clientDocument.client_service_id
                              )
                            : null;

                        const documentTheme =
                          linkedService
                            ? getServiceTheme(
                                linkedService.service
                              )
                            : null;

                        return (
                          <article
                            id={`client-document-${clientDocument.id}`}
                            key={
                              clientDocument.id
                            }
                            style={{
                              ...itemStyle,
                              border:
                                documentTheme
                                  ? `1px solid ${documentTheme.borderStrong}`
                                  : itemStyle.border,
                              background:
                                documentTheme
                                  ? `linear-gradient(135deg, ${documentTheme.backgroundStrong}, rgba(5,12,22,0.92))`
                                  : itemStyle.background,
                              boxShadow:
                                documentTheme
                                  ? `${documentTheme.glowStrong}, inset 5px 0 0 ${documentTheme.accent}`
                                  : "none",
                              scrollMarginTop:
                                "30px",
                            }}
                          >
                            <FolderOpen
                              size={28}
                              strokeWidth={
                                1.6
                              }
                              style={{
                                marginBottom:
                                  "14px",
                                color:
                                  documentTheme
                                    ? documentTheme.accentStrong
                                    : "#1688ff",
                              }}
                            />

                            <span
                              className="login-card__eyebrow"
                              style={{
                                color:
                                  documentTheme
                                    ? documentTheme.accentStrong
                                    : undefined,
                              }}
                            >
                              {linkedService
                                ? `${getServiceDomainLabel(
                                    linkedService.service
                                  )} · `
                                : ""}
                              {getDocumentTypeLabel(
                                clientDocument.document_type
                              )}
                            </span>

                            <h3
                              style={{
                                margin:
                                  "7px 0 10px",
                                color:
                                  "#fff",
                              }}
                            >
                              {
                                clientDocument.title
                              }
                            </h3>

                            {linkedService && (
                              <div
                                style={{
                                  marginBottom:
                                    "12px",
                                  padding:
                                    "9px 10px",
                                  borderRadius:
                                    "9px",
                                  border:
                                    `1px solid ${documentTheme?.borderStrong}`,
                                  background:
                                    documentTheme?.backgroundStrong,
                                  color:
                                    documentTheme?.accentStrong,
                                  fontSize:
                                    "0.76rem",
                                  lineHeight:
                                    1.45,
                                }}
                              >
                                {
                                  linkedService.service
                                }
                                {" — "}
                                {
                                  linkedService.title
                                }
                              </div>
                            )}

                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap:
                                  "7px",
                                color:
                                  "rgba(255,255,255,0.4)",
                                fontSize:
                                  "0.78rem",
                                marginBottom:
                                  "18px",
                              }}
                            >
                              <Clock3
                                size={15}
                              />

                              {formatDate(
                                clientDocument.created_at
                              )}
                            </div>

                            <button
                              type="button"
                              className="button button--secondary"
                              onClick={() =>
                                handleOpenDocument(
                                  clientDocument
                                )
                              }
                              disabled={
                                openingDocumentId ===
                                clientDocument.id
                              }
                              style={{
                                width:
                                  "100%",
                                display:
                                  "inline-flex",
                                justifyContent:
                                  "center",
                                alignItems:
                                  "center",
                                gap:
                                  "8px",
                              }}
                            >
                              <ExternalLink
                                size={17}
                              />

                              {openingDocumentId ===
                              clientDocument.id
                                ? "Ouverture..."
                                : ct("copy.openDocument")}
                            </button>
                          </article>
                        );
                      }
                    )}
                  </div>
                )}

                {filteredDocuments.length >
                  DOCUMENTS_PER_PAGE && (
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      gap:
                        "12px",
                      flexWrap:
                        "wrap",
                      marginTop:
                        "20px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setDocumentPage(
                          Math.max(
                            1,
                            safeDocumentPage -
                              1
                          )
                        )
                      }
                      disabled={
                        safeDocumentPage <=
                        1
                      }
                      style={{
                        minHeight:
                          "38px",
                        padding:
                          "0 13px",
                        borderRadius:
                          "9px",
                        border:
                          "1px solid rgba(255,255,255,0.12)",
                        background:
                          "rgba(255,255,255,0.04)",
                        color:
                          safeDocumentPage <=
                          1
                            ? "rgba(255,255,255,0.28)"
                            : "#ffffff",
                        cursor:
                          safeDocumentPage <=
                          1
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {ct("copy.previous")}</button>

                    <span
                      style={{
                        color:
                          "rgba(255,255,255,0.62)",
                        fontSize:
                          "0.82rem",
                      }}
                    >
                      {ct("copy.page")}{" "}
                      {
                        safeDocumentPage
                      }{" "}
                      /{" "}
                      {
                        totalDocumentPages
                      }
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setDocumentPage(
                          Math.min(
                            totalDocumentPages,
                            safeDocumentPage +
                              1
                          )
                        )
                      }
                      disabled={
                        safeDocumentPage >=
                        totalDocumentPages
                      }
                      style={{
                        minHeight:
                          "38px",
                        padding:
                          "0 13px",
                        borderRadius:
                          "9px",
                        border:
                          "1px solid rgba(255,255,255,0.12)",
                        background:
                          "rgba(255,255,255,0.04)",
                        color:
                          safeDocumentPage >=
                          totalDocumentPages
                            ? "rgba(255,255,255,0.28)"
                            : "#ffffff",
                        cursor:
                          safeDocumentPage >=
                          totalDocumentPages
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {ct("copy.next")}</button>
                  </div>
                )}
              </>
            )}
        </section>
        )}

        {/* ASSISTANCE */}

        {activeSection === "support" && (
          <section
          id="assistance"
          className="login-card"
          style={{
            marginTop:
              "22px",
            scrollMarginTop:
              "96px",
          }}
        >
          <span className="login-card__eyebrow">
            {ct("copy.tsbSupport")}</span>

          <h2>
            {ct("copy.support2c1604")}</h2>

          <p className="login-card__intro">
            {ct("copy.sendARequestToTheTsbTechGroupTeamAnd")}</p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              marginTop:
                "26px",
            }}
          >
            {/* NOUVEAU TICKET */}

            <form
              onSubmit={
                handleSupportSubmit
              }
            >
              <span className="login-card__eyebrow">
                {ct("copy.newRequestd1a7a9")}</span>

              <div
                className="login-field"
                style={{
                  marginTop:
                    "14px",
                }}
              >
                <label htmlFor="support-domain">
                  {ct("copy.relevantDomain")}</label>

                <select
                  id="support-domain"
                  value={
                    supportDomain
                  }
                  onChange={(
                    event
                  ) => {
                    setSupportDomain(
                      event.target
                        .value
                    );

                    setSupportError(
                      ""
                    );

                    setSupportSuccess(
                      ""
                    );
                  }}
                  disabled={
                    supportSending
                  }
                >
                  <option value="">
                    {ct("copy.chooseADomain")}</option>

                  {TSB_DOMAINS.map(
                    (domain) => (
                      <option
                        key={
                          domain.key
                        }
                        value={getDomainLabel(domain.key, domain.label)}
                      >
                        {getDomainLabel(domain.key, domain.label)}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div
                className="login-field"
                style={{
                  marginTop:
                    "14px",
                }}
              >
                <label htmlFor="support-subject">
                  {ct("copy.subject")}</label>

                <input
                  id="support-subject"
                  type="text"
                  value={
                    supportSubject
                  }
                  onChange={(
                    event
                  ) => {
                    setSupportSubject(
                      event.target
                        .value
                    );

                    setSupportError(
                      ""
                    );

                    setSupportSuccess(
                      ""
                    );
                  }}
                  placeholder={ct("copy.eGQuestionAboutMyQuote")}
                  disabled={
                    supportSending
                  }
                />
              </div>

              <div className="login-field">
                <label htmlFor="support-message">
                  {ct("copy.yourMessage0e19b6")}</label>

                <textarea
                  id="support-message"
                  rows={6}
                  value={
                    supportMessage
                  }
                  onChange={(
                    event
                  ) => {
                    setSupportMessage(
                      event.target
                        .value
                    );

                    setSupportError(
                      ""
                    );

                    setSupportSuccess(
                      ""
                    );
                  }}
                  placeholder={ct("copy.describeYourRequest")}
                  disabled={
                    supportSending
                  }
                  style={{
                    width:
                      "100%",
                    resize:
                      "vertical",
                  }}
                />
              </div>

              {supportError && (
                <p className="login-form-message">
                  {
                    supportError
                  }
                </p>
              )}

              {supportSuccess && (
                <p
                  style={{
                    color:
                      "#4ade80",
                    fontSize:
                      "0.85rem",
                    lineHeight:
                      1.6,
                  }}
                >
                  {
                    supportSuccess
                  }
                </p>
              )}

              <button
                type="submit"
                className="login-create"
                disabled={
                  supportSending
                }
                style={{
                  width:
                    "100%",
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  gap: "9px",
                }}
              >
                <Send
                  size={17}
                />

                {supportSending
                  ? "Envoi..."
                  : ct("copy.sendRequest")}
              </button>
            </form>

            {/* HISTORIQUE */}

            <div>
              <span className="login-card__eyebrow">
                {ct("copy.myTickets")}</span>

              {supportLoading && (
                <p
                  style={{
                    color:
                      "rgba(255,255,255,0.6)",
                    marginTop:
                      "16px",
                  }}
                >
                  {ct("copy.loading")}</p>
              )}

              {!supportLoading &&
                supportTickets.length ===
                  0 && (
                  <div
                    style={{
                      padding:
                        "30px 0",
                      color:
                        "rgba(255,255,255,0.55)",
                    }}
                  >
                    <Headphones
                      size={32}
                      strokeWidth={
                        1.5
                      }
                      style={{
                        marginBottom:
                          "10px",
                      }}
                    />

                    <p
                      style={{
                        margin: 0,
                      }}
                    >
                      {ct("copy.noSupportTicketAtTheMoment")}</p>
                  </div>
                )}

              {!supportLoading &&
                supportTickets.length >
                  0 && (
                  <div
                    style={{
                      display:
                        "grid",
                      gap: "12px",
                      marginTop:
                        "16px",
                    }}
                  >
                    {organizedSupportTickets.map(
                      (
                        {
                          ticket,
                          domain,
                        },
                        index
                      ) => {
                        const previousDomainKey =
                          index >
                          0
                            ? organizedSupportTickets[
                                index -
                                  1
                              ].domain
                                .key
                            : null;

                        return (
                          <div
                            key={
                              ticket.id
                            }
                          >
                            {previousDomainKey !==
                              domain.key && (
                              <div
                                style={{
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  gap:
                                    "8px",
                                  margin:
                                    index ===
                                    0
                                      ? "0 0 9px"
                                      : "15px 0 9px",
                                  padding:
                                    "7px 9px",
                                  borderRadius:
                                    "9px",
                                  border:
                                    `1px solid ${domain.theme.border}`,
                                  background:
                                    domain.theme.background,
                                  boxShadow:
                                    `inset 3px 0 0 ${domain.theme.accent}`,
                                }}
                              >
                                <FolderOpen
                                  size={
                                    14
                                  }
                                  style={{
                                    color:
                                      domain.theme.accentStrong,
                                    flexShrink:
                                      0,
                                  }}
                                />

                                <strong
                                  style={{
                                    color:
                                      domain.theme.accentStrong,
                                    fontSize:
                                      "0.72rem",
                                    fontWeight:
                                      900,
                                    letterSpacing:
                                      "0.04em",
                                  }}
                                >
                                  {getDomainLabel(domain.key, domain.label)}
                                </strong>
                              </div>
                            )}

                            <article
                              id={`client-ticket-${ticket.id}`}
                              style={{
                                ...itemStyle,
                                padding:
                                  "18px",
                                scrollMarginTop:
                                  "30px",
                                border:
                                  `1px solid ${domain.theme.border}`,
                                background:
                                  domain.theme.background,
                                boxShadow:
                                  `inset 3px 0 0 ${domain.theme.accent}`,
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
                              gap:
                                "12px",
                              flexWrap:
                                "wrap",
                            }}
                          >
                            <h3
                              style={{
                                margin:
                                  0,
                                color:
                                  "#fff",
                                fontSize:
                                  "1rem",
                              }}
                            >
                              {
                                ticket.subject
                              }
                            </h3>

                            {(() => {
                              const dynamicStatus =
                                getDynamicSupportStatus(
                                  ticket
                                );

                              return (
                                <span
                                  style={{
                                    ...statusStyle,
                                    padding:
                                      "6px 10px",
                                    fontSize:
                                      "0.72rem",
                                    color:
                                      dynamicStatus.color,
                                    border:
                                      dynamicStatus.border,
                                    background:
                                      dynamicStatus.background,
                                  }}
                                >
                                  {
                                    dynamicStatus.label
                                  }
                                </span>
                              );
                            })()}
                          </div>

                          <p
                            style={{
                              color:
                                "rgba(255,255,255,0.65)",
                              lineHeight:
                                1.6,
                              whiteSpace:
                                "pre-wrap",
                            }}
                          >
                            {
                              ticket.message
                            }
                          </p>

                          {/* RÉPONSE ADMIN */}

                          {ticket.admin_reply && (
                            <div
                              style={{
                                marginTop:
                                  "16px",
                                padding:
                                  "16px",
                                borderRadius:
                                  "12px",
                                border:
                                  "1px solid rgba(22,136,255,0.25)",
                                background:
                                  "rgba(22,136,255,0.08)",
                              }}
                            >
                              <span className="login-card__eyebrow">
                                {ct("copy.tsbTechGroupReply")}</span>

                              <p
                                style={{
                                  margin:
                                    "10px 0 0",
                                  color:
                                    "rgba(255,255,255,0.82)",
                                  lineHeight:
                                    1.65,
                                  whiteSpace:
                                    "pre-wrap",
                                }}
                              >
                                {
                                  ticket.admin_reply
                                }
                              </p>

                              {ticket.replied_at && (
                                <div
                                  style={{
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    gap:
                                      "7px",
                                    marginTop:
                                      "12px",
                                    color:
                                      "rgba(255,255,255,0.4)",
                                    fontSize:
                                      "0.76rem",
                                  }}
                                >
                                  <Clock3
                                    size={
                                      14
                                    }
                                  />

                                  {ct("copy.replyFrom")}{" "}
                                  {formatDate(
                                    ticket.replied_at
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* CONVERSATION CONTINUE */}

                          {supportMessages.filter(
                            (
                              supportMessage
                            ) =>
                              supportMessage.ticket_id ===
                              ticket.id
                          ).length >
                            0 && (
                            <div
                              style={{
                                display:
                                  "grid",
                                gap:
                                  "9px",
                                marginTop:
                                  "14px",
                              }}
                            >
                              {supportMessages
                                .filter(
                                  (
                                    supportMessage
                                  ) =>
                                    supportMessage.ticket_id ===
                                    ticket.id
                                )
                                .map(
                                  (
                                    supportMessage
                                  ) => {
                                    const isClient =
                                      supportMessage.sender_type ===
                                      "client";

                                    const isAi =
                                      supportMessage.sender_type ===
                                      "ai";

                                    return (
                                      <div
                                        key={
                                          supportMessage.id
                                        }
                                        style={{
                                          marginLeft:
                                            isClient
                                              ? "28px"
                                              : 0,
                                          marginRight:
                                            isClient
                                              ? 0
                                              : "28px",
                                          padding:
                                            "12px 13px",
                                          borderRadius:
                                            "11px",
                                          border:
                                            isClient
                                              ? "1px solid rgba(255,255,255,0.10)"
                                              : isAi
                                                ? "1px solid rgba(0,212,255,0.26)"
                                                : "1px solid rgba(22,136,255,0.25)",
                                          background:
                                            isClient
                                              ? "rgba(255,255,255,0.045)"
                                              : isAi
                                                ? "rgba(0,212,255,0.07)"
                                                : "rgba(22,136,255,0.07)",
                                        }}
                                      >
                                        <div
                                          style={{
                                            display:
                                              "flex",
                                            justifyContent:
                                              "space-between",
                                            alignItems:
                                              "center",
                                            gap:
                                              "10px",
                                            flexWrap:
                                              "wrap",
                                            marginBottom:
                                              "7px",
                                          }}
                                        >
                                          <span
                                            style={{
                                              color:
                                                isClient
                                                  ? "rgba(255,255,255,0.72)"
                                                  : isAi
                                                    ? "#00d4ff"
                                                    : "#53a7ff",
                                              fontSize:
                                                "0.66rem",
                                              fontWeight:
                                                900,
                                              letterSpacing:
                                                "0.07em",
                                            }}
                                          >
                                            {getSupportSenderLabel(
                                              supportMessage.sender_type
                                            )}
                                          </span>

                                          <span
                                            style={{
                                              color:
                                                "rgba(255,255,255,0.35)",
                                              fontSize:
                                                "0.68rem",
                                            }}
                                          >
                                            {formatDate(
                                              supportMessage.created_at
                                            )}
                                          </span>
                                        </div>

                                        <p
                                          style={{
                                            margin:
                                              0,
                                            color:
                                              "rgba(255,255,255,0.82)",
                                            lineHeight:
                                              1.55,
                                            whiteSpace:
                                              "pre-wrap",
                                          }}
                                        >
                                          {
                                            supportMessage.message
                                          }
                                        </p>
                                      </div>
                                    );
                                  }
                                )}
                            </div>
                          )}

                          <form
                            onSubmit={(
                              event
                            ) =>
                              void handleSupportReplySubmit(
                                event,
                                ticket
                              )
                            }
                            style={{
                              display:
                                "flex",
                              gap: "8px",
                              marginTop:
                                "14px",
                              alignItems:
                                "stretch",
                            }}
                          >
                            <input
                              type="text"
                              value={
                                supportReplyDrafts[
                                  ticket.id
                                ] ?? ""
                              }
                              onChange={(
                                event
                              ) => {
                                setSupportReplyDrafts(
                                  (
                                    previous
                                  ) => ({
                                    ...previous,
                                    [ticket.id]:
                                      event
                                        .target
                                        .value,
                                  })
                                );

                                setSupportError(
                                  ""
                                );

                                setSupportSuccess(
                                  ""
                                );
                              }}
                              placeholder={ct("copy.continueTheConversation")}
                              disabled={
                                supportReplySendingId ===
                                ticket.id
                              }
                              aria-label={`Continuer la conversation : ${ticket.subject}`}
                              style={{
                                flex: 1,
                                minWidth:
                                  0,
                              }}
                            />

                            <button
                              type="submit"
                              className="login-create"
                              disabled={
                                supportReplySendingId ===
                                ticket.id ||
                                !(
                                  supportReplyDrafts[
                                    ticket.id
                                  ] ?? ""
                                ).trim()
                              }
                              style={{
                                width:
                                  "auto",
                                minWidth:
                                  "44px",
                                padding:
                                  "0 12px",
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                              }}
                              title={ct("copy.sendMessage")}
                            >
                              <Send
                                size={
                                  16
                                }
                              />
                            </button>
                          </form>

                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap:
                                "7px",
                              color:
                                "rgba(255,255,255,0.4)",
                              fontSize:
                                "0.76rem",
                              marginTop:
                                "14px",
                            }}
                          >
                            <Clock3
                              size={14}
                            />

                            {formatDate(
                              ticket.created_at
                            )}
                          </div>
                            </article>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
            </div>
          </div>
        </section>
        )}

        {/* PROFIL */}


        {activeSection === "notifications" && (
          <section
            id="mes-notifications"
            style={{
              display: "grid",
              gap: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "14px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <span className="login-kicker">
                  {ct("copy.notificationCenter")}
                </span>

                <h2
                  style={{
                    margin: "6px 0 0",
                    color: "#ffffff",
                    fontSize: "1.35rem",
                  }}
                >
                  {ct("copy.myNotifications")}
                </h2>

                <p
                  style={{
                    margin: "7px 0 0",
                    color: "rgba(255,255,255,0.62)",
                    lineHeight: 1.6,
                  }}
                >
                  {unreadNotificationsCount > 0
                    ? `${unreadNotificationsCount} ${ct(
                        unreadNotificationsCount === 1
                          ? "copy.unreadNotificationSingular"
                          : "copy.unreadNotificationPlural"
                      )}`
                    : ct("copy.allYourNotificationsHaveBeenRead")}
                </p>
              </div>
            </div>

            {notificationsError && (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "14px",
                  border: "1px solid rgba(248,113,113,0.32)",
                  background: "rgba(248,113,113,0.08)",
                  color: "#fecaca",
                }}
              >
                {notificationsError}
              </div>
            )}

            {notifications.length === 0 ? (
              <div
                style={{
                  padding: "28px 20px",
                  borderRadius: "18px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.035)",
                  textAlign: "center",
                  color: "rgba(255,255,255,0.68)",
                }}
              >
                <Bell
                  size={28}
                  style={{
                    marginBottom: "10px",
                    opacity: 0.72,
                  }}
                />

                <div>
                  {ct("copy.noNotificationsAtTheMoment")}
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "10px",
                }}
              >
                {notifications.map((notification) => {
                  const isUpdating =
                    notificationUpdatingId === notification.id;

                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() =>
                        void handleOpenNotification(notification)
                      }
                      disabled={isUpdating}
                      style={{
                        width: "100%",
                        border: notification.is_read
                          ? "1px solid rgba(255,255,255,0.075)"
                          : "1px solid rgba(22,136,255,0.38)",
                        borderRadius: "17px",
                        padding: "14px 15px",
                        display: "grid",
                        gridTemplateColumns: "auto 1fr auto",
                        alignItems: "center",
                        gap: "13px",
                        textAlign: "left",
                        background: notification.is_read
                          ? "rgba(255,255,255,0.025)"
                          : "rgba(22,136,255,0.085)",
                        color: "#ffffff",
                        cursor: isUpdating ? "wait" : "pointer",
                        opacity: isUpdating ? 0.7 : 1,
                      }}
                    >
                      <div
                        style={{
                          width: "39px",
                          height: "39px",
                          borderRadius: "12px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: notification.is_read
                            ? "rgba(255,255,255,0.06)"
                            : "rgba(22,136,255,0.16)",
                          color: notification.is_read
                            ? "rgba(255,255,255,0.66)"
                            : "#38bdf8",
                          flexShrink: 0,
                        }}
                      >
                        <Bell size={18} />
                      </div>

                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap",
                            marginBottom: "5px",
                          }}
                        >
                          <span
                            style={{
                              color: notification.is_read
                                ? "rgba(255,255,255,0.62)"
                                : "#38bdf8",
                              fontSize: "0.72rem",
                              fontWeight: 900,
                              letterSpacing: "0.06em",
                            }}
                          >
                            {getNotificationTypeLabel(
                              notification.type
                            )}
                          </span>

                          {!notification.is_read && (
                            <span
                              style={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "50%",
                                background: "#1688ff",
                                boxShadow:
                                  "0 0 10px rgba(22,136,255,0.8)",
                              }}
                            />
                          )}
                        </div>

                        <div
                          style={{
                            fontWeight: notification.is_read
                              ? 700
                              : 850,
                            color: notification.is_read
                              ? "rgba(255,255,255,0.78)"
                              : "#ffffff",
                            lineHeight: 1.35,
                          }}
                        >
                          {notification.title}
                        </div>

                        <div
                          style={{
                            marginTop: "4px",
                            color: "rgba(255,255,255,0.56)",
                            fontSize: "0.84rem",
                            lineHeight: 1.5,
                          }}
                        >
                          {notification.message}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          justifyItems: "end",
                          gap: "6px",
                          color: "rgba(255,255,255,0.45)",
                          fontSize: "0.74rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span>
                          {new Intl.DateTimeFormat(
                            intlLocale,
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          ).format(new Date(notification.created_at))}
                        </span>

                        <ArrowRight size={16} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeSection === "profile" && (
          <section
          id="client-profile"
          className="login-card"
          style={{
            marginTop:
              "22px",
            scrollMarginTop:
              "96px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: "12px",
              marginBottom:
                "20px",
            }}
          >
            <UserRound
              size={27}
              strokeWidth={1.7}
              style={{
                color:
                  "#1688ff",
              }}
            />

            <div>
              <span className="login-card__eyebrow">
                {ct("copy.myAccount")}</span>

              <h2
                style={{
                  margin: 0,
                }}
              >
                {ct("copy.personalInformation")}</h2>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "18px",
            }}
          >
            <div>
              <small
                style={{
                  color:
                    "rgba(255,255,255,0.45)",
                }}
              >
                {ct("copy.firstName")}</small>

              <p>
                {firstName}
              </p>
            </div>

            <div>
              <small
                style={{
                  color:
                    "rgba(255,255,255,0.45)",
                }}
              >
                {ct("copy.lastName")}</small>

              <p>
                {lastName ||
                  ct("copy.notProvided")}
              </p>
            </div>

            <div>
              <small
                style={{
                  color:
                    "rgba(255,255,255,0.45)",
                }}
              >
                {ct("copy.email")}</small>

              <p>{email}</p>
            </div>

            <div>
              <small
                style={{
                  color:
                    "rgba(255,255,255,0.45)",
                }}
              >
                {ct("copy.phone")}</small>

              <p>{phone}</p>
            </div>

            <div
              style={{
                gridColumn: "1 / -1",
                paddingTop: "6px",
              }}
            >
              <small
                style={{
                  color:
                    "rgba(255,255,255,0.45)",
                }}
              >
                {ct("copy.companyOrganisationOptional")}
              </small>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginTop: "8px",
                }}
              >
                <input
                  type="text"
                  value={companyDraft}
                  onChange={(event) => {
                    setCompanyDraft(
                      event.target.value
                    );
                    setCompanyMessage("");
                  }}
                  placeholder={ct("copy.exTsbTechGroup")}
                  style={{
                    flex: "1 1 280px",
                    minHeight: "44px",
                    padding: "0 13px",
                    borderRadius: "11px",
                    border:
                      "1px solid rgba(255,255,255,0.12)",
                    background:
                      "rgba(255,255,255,0.045)",
                    color: "#ffffff",
                    font: "inherit",
                  }}
                />

                <button
                  type="button"
                  className="login-create"
                  onClick={() =>
                    void handleCompanySave()
                  }
                  disabled={companySaving}
                  style={{
                    width: "auto",
                    minHeight: "44px",
                    padding: "0 18px",
                  }}
                >
                  {companySaving
                    ? ct("copy.saving")
                    : ct("copy.save")}
                </button>
              </div>

              <div
                style={{
                  minHeight: "20px",
                  marginTop: "7px",
                  color:
                    companyMessage ===
                    ct("copy.unableToSaveTheCompany")
                      ? "#fca5a5"
                      : "#4ade80",
                  fontSize: "0.76rem",
                  fontWeight: 700,
                }}
              >
                {companyMessage ||
                  (company
                    ? `${ct("copy.savedCompanyPrefix")} ${company}`
                    : "")}
              </div>
            </div>
          </div>
        </section>
        )}

        {/* BAS DE PAGE */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap: "16px",
            flexWrap: "wrap",
            marginTop:
              "26px",
          }}
        >
          <a
            href="/"
            className="login-back"
          >
            {ct("copy.backToSite")}</a>

          <button
            type="button"
            onClick={
              handleLogout
            }
            className="login-create"
            style={{
              width: "auto",
              padding:
                "0 22px",
              display:
                "inline-flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              gap: "9px",
            }}
          >
            <LogOut
              size={18}
            />

            {ct("copy.signOut")}</button>
        </div>
      </div>

      {liveNotification &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="status"
            aria-live="polite"
            style={{
              position: "fixed",
              top: "22px",
              right: "22px",
              width:
                "min(390px, calc(100vw - 44px))",
              padding: "16px",
              borderRadius:
                "14px",
              border:
                "1px solid rgba(22,136,255,0.45)",
              background:
                "rgba(8,17,29,0.98)",
              color:
                "#ffffff",
              zIndex: 99999,
              boxShadow:
                "0 18px 50px rgba(0,0,0,0.48)",
              backdropFilter:
                "blur(12px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems:
                  "flex-start",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  flexShrink: 0,
                  borderRadius:
                    "11px",
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  background:
                    "rgba(22,136,255,0.16)",
                  color:
                    "#53a7ff",
                }}
              >
                <Bell
                  size={18}
                />
              </div>

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <span className="login-card__eyebrow">
                  {getNotificationTypeLabel(
                    liveNotification.type
                  )}
                </span>

                <strong
                  style={{
                    display: "block",
                    marginTop:
                      "5px",
                    color:
                      "#ffffff",
                    fontSize:
                      "0.92rem",
                  }}
                >
                  {
                    liveNotification.title
                  }
                </strong>

                <p
                  style={{
                    margin:
                      "6px 0 0",
                    color:
                      "rgba(255,255,255,0.72)",
                    fontSize:
                      "0.8rem",
                    lineHeight:
                      1.5,
                  }}
                >
                  {
                    liveNotification.message
                  }
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
                gap: "8px",
                flexWrap:
                  "wrap",
                marginTop:
                  "13px",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setLiveNotification(
                    null
                  )
                }
                style={{
                  minHeight:
                    "36px",
                  padding:
                    "0 11px",
                  borderRadius:
                    "9px",
                  border:
                    "1px solid rgba(255,255,255,0.12)",
                  background:
                    "transparent",
                  color:
                    "rgba(255,255,255,0.78)",
                  cursor:
                    "pointer",
                }}
              >
                {ct("copy.close")}</button>

              <button
                type="button"
                className="login-create"
                onClick={() => {
                  const notification =
                    liveNotification;

                  setLiveNotification(
                    null
                  );

                  void handleOpenNotification(
                    notification
                  );
                }}
                style={{
                  width: "auto",
                  minHeight:
                    "36px",
                  padding:
                    "0 12px",
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  gap: "7px",
                }}
              >
                {ct("copy.opend37f60")}<ArrowRight
                  size={15}
                />
              </button>
            </div>
          </div>,
          document.body
        )}

              </div>

<button
        type="button"
        onClick={
          scrollToTop
        }
        aria-label={ct("copy.backToTop")}
        title={ct("copy.backToTop")}
        style={{
          position: "fixed",
          right: "22px",
          bottom: "22px",
          width: "48px",
          height: "48px",
          borderRadius:
            "50%",
          border:
            "1px solid rgba(255,255,255,0.14)",
          background:
            "rgba(8,17,29,0.9)",
          color:
            "#ffffff",
          display:
            "inline-flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          cursor:
            "pointer",
          zIndex: 50,
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.28)",
          backdropFilter:
            "blur(10px)",
        }}
      >
        <ArrowUp
          size={21}
        />
      </button>
    </main>
  );
}

export default Client;
