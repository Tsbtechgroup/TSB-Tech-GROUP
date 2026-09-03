import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import type { User } from "@supabase/supabase-js";

import {
  ArrowUp,
  Bell,
  CalendarDays,
  Check,
  CheckCheck,
  FileText,
  FolderOpen,
  Headphones,
  LayoutDashboard,
  LogOut,
  Pencil,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  Send,
  Users,
  X,
} from "lucide-react";

import BrandLogo from "../../components/common/BrandLogo";
import { useLanguage } from "../../context/LanguageContext";
import {
  translate,
  type LocaleCode,
} from "../../i18n";
import {
  adminTranslations,
  resolveAdminCopyKey,
} from "../../i18n/locales/admin";
import ClientsPanel from "../../components/admin/ClientsPanel";
import AdminNavigation from "../../components/admin/AdminNavigation";
import type { AdminSection } from "../../components/admin/AdminNavigation";
import ServicesPanel from "../../components/admin/ServicesPanel";
import StoreProductsPanel from "../../components/admin/StoreProductsPanel";
import { supabase } from "../../services/supabase";
import "../../styles/portal-responsive.css";
import {
  getServiceDomain,
  getServiceTheme,
  TSB_DOMAINS,
} from "../../utils/serviceTheme";

type QuoteRequest = {
  id: string;
  user_id: string | null;
  service: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  message: string;
  status: string;
  admin_reply: string | null;
  replied_at: string | null;
  reply_email_status:
    | "not_sent"
    | "pending"
    | "sent"
    | "failed";
  reply_email_sent_at: string | null;
  created_at: string;
};

type SupportTicket = {
  id: string;
  user_id: string;
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

type ClientDocument = {
  id: string;
  user_id: string;
  client_service_id: string | null;
  title: string;
  document_type: string;
  file_path: string;
  created_at: string;
};

type ClientService = {
  id: string;
  user_id: string;
  service: string;
  title: string;
  status: string;
  scheduled_at: string | null;
  created_at: string;
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

type Profile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  company: string | null;
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

type StoreProductTranslation = {
  sku: string | null;
  name_fr: string;
  name_nl: string | null;
  name_en: string | null;
};

const DOCUMENT_CATEGORIES = [
  { value: "all", label: "Tous" },
  { value: "quote", label: "Devis" },
  { value: "invoice", label: "Factures" },
  {
    value: "intervention",
    label: "Interventions & rapports",
  },
  { value: "diagnostic", label: "Diagnostics" },
  {
    value: "administrative",
    label: "Administratif",
  },
  { value: "other", label: "Autres" },
] as const;

const DOCUMENTS_PER_PAGE = 12;
const APPOINTMENTS_PER_PAGE = 8;
const QUOTES_PER_PAGE = 8;
const SUPPORT_PER_PAGE = 8;
const NOTIFICATIONS_PER_PAGE = 8;

function Admin() {
  const {
    locale,
    setLocale,
    availableLocales,
    intlLocale,
  } = useLanguage();

  const at = (
    key: string,
    params?: Record<string, string | number>
  ) =>
    translate(
      adminTranslations,
      locale,
      `admin.copy.${key}`,
      params
    );

  const tr = (
    fr: string,
    nl: string,
    en: string
  ) => {
    const translationKey =
      resolveAdminCopyKey(fr) ??
      resolveAdminCopyKey(nl) ??
      resolveAdminCopyKey(en);

    if (translationKey) {
      return at(translationKey);
    }

    if (locale === "fr") {
      return fr;
    }

    if (locale === "nl") {
      return nl;
    }

    return en;
  };

  const [activeSection, setActiveSection] =
    useState<AdminSection>("dashboard");
  const [user, setUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const root = document.querySelector<HTMLElement>(
      "[data-tsb-admin-dynamic-language='true']"
    );

    if (!root) {
      return;
    }

    const translateValue = (
      input: string
    ) => {
      const leading =
        input.match(/^\s*/)?.[0] ?? "";
      const trailing =
        input.match(/\s*$/)?.[0] ?? "";

      const normalized = input
        .replace(/\s+/g, " ")
        .trim();

      if (!normalized) {
        return input;
      }

      const exactKey =
        resolveAdminCopyKey(normalized);

      if (exactKey) {
        return `${leading}${at(exactKey)}${trailing}`;
      }

      const pageMatch =
        normalized.match(
          /^(?:Page|Pagina|Seite|Página|صفحة|Sayfa|页)\s+(\d+)\s*\/\s*(\d+)(?:\s*[·•]\s*(\d+)\s+(.+))?$/i
        );

      if (pageMatch) {
        const [, page, total, count, rawUnit] =
          pageMatch;

        if (!count || !rawUnit) {
          return `${leading}${at("pageWord")} ${page} / ${total}${trailing}`;
        }

        const normalizedUnit =
          rawUnit.toLocaleLowerCase();

        const unitKey =
          /ticket|تذكرة|bilet|工单/i.test(rawUnit)
            ? "ticketsUnit"
            : /rendez|afspraak|appointment|termin|cita|appuntament|compromisso|موعد|randevu|预约/i.test(
                normalizedUnit
              )
              ? "appointmentsUnit"
              : /notification|melding|benachrichtigung|notificación|notifica|notificação|إشعار|bildirim|通知/i.test(
                  normalizedUnit
                )
                ? "notificationsUnit"
                : null;

        return `${leading}${at("pageWord")} ${page} / ${total} • ${count} ${
          unitKey ? at(unitKey) : rawUnit
        }${trailing}`;
      }

      const resultCount =
        normalized.match(
          /^(\d+)\s+(?:résultat\(s\)|resultaat\/resultaten|result\(s\)|Ergebnis\(se\)|resultado\(s\)|risultato\/i|نتيجة\/نتائج|sonuç|结果)$/i
        );

      if (resultCount) {
        return `${leading}${resultCount[1]} ${at("resultsUnit")}${trailing}`;
      }

      return input;
    };

    const translateElement = (
      element: Element
    ) => {
      const walker =
        document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT
        );

      const textNodes: Text[] = [];
      let node =
        walker.nextNode();

      while (node) {
        textNodes.push(
          node as Text
        );
        node =
          walker.nextNode();
      }

      textNodes.forEach(
        (textNode) => {
          const current =
            textNode.nodeValue ?? "";
          const translated =
            translateValue(current);

          if (
            translated !== current
          ) {
            textNode.nodeValue =
              translated;
          }
        }
      );

      const translatableElements = [
        ...(element.matches(
          "[placeholder], [title], [aria-label]"
        )
          ? [element as HTMLElement]
          : []),
        ...Array.from(
          element.querySelectorAll<HTMLElement>(
            "[placeholder], [title], [aria-label]"
          )
        ),
      ];

      translatableElements.forEach(
        (item) => {
          [
            "placeholder",
            "title",
            "aria-label",
          ].forEach(
            (attribute) => {
              const current =
                item.getAttribute(
                  attribute
                );

              if (!current) {
                return;
              }

              const translated =
                translateValue(
                  current
                );

              if (
                translated !== current
              ) {
                item.setAttribute(
                  attribute,
                  translated
                );
              }
            }
          );
        }
      );
    };

    translateElement(root);

    const observer =
      new MutationObserver(
        (mutations) => {
          mutations.forEach(
            (mutation) => {
              if (
                mutation.type ===
                  "characterData" &&
                mutation.target
                  .parentElement
              ) {
                translateElement(
                  mutation.target
                    .parentElement
                );
              }

              mutation.addedNodes.forEach(
                (addedNode) => {
                  if (
                    addedNode instanceof
                    Element
                  ) {
                    translateElement(
                      addedNode
                    );
                  } else if (
                    addedNode.nodeType ===
                      Node.TEXT_NODE &&
                    addedNode.parentElement
                  ) {
                    translateElement(
                      addedNode.parentElement
                    );
                  }
                }
              );
            }
          );
        }
      );

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [locale, isLoading]);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [quotes, setQuotes] = useState<
    QuoteRequest[]
  >([]);

  const [tickets, setTickets] = useState<
    SupportTicket[]
  >([]);

  const [documents, setDocuments] = useState<
    ClientDocument[]
  >([]);

  const [clientServices, setClientServices] = useState<
    ClientService[]
  >([]);

  const [appointments, setAppointments] = useState<
    ClientAppointment[]
  >([]);

  const [appointmentClientId, setAppointmentClientId] =
    useState("");

  const [appointmentServiceId, setAppointmentServiceId] =
    useState("");

  const [appointmentTitle, setAppointmentTitle] =
    useState("");

  const [appointmentDescription, setAppointmentDescription] =
    useState("");

  const [appointmentScheduledAt, setAppointmentScheduledAt] =
    useState("");

  const [appointmentStatus, setAppointmentStatus] =
    useState("scheduled");

  const [appointmentLocation, setAppointmentLocation] =
    useState("");

  const [appointmentSending, setAppointmentSending] =
    useState(false);

  const [editingAppointmentId, setEditingAppointmentId] =
    useState<string | null>(null);

  const [appointmentUpdatingId, setAppointmentUpdatingId] =
    useState<string | null>(null);

  const [appointmentDeletingId, setAppointmentDeletingId] =
    useState<string | null>(null);

  const [appointmentSuccess, setAppointmentSuccess] =
    useState("");

  const [
    appointmentResponseFilter,
    setAppointmentResponseFilter,
  ] = useState<
    | "all"
    | "pending"
    | "accepted"
    | "declined"
    | "reschedule_requested"
  >("all");

  const [appointmentPage, setAppointmentPage] =
    useState(1);

  const [showAppointmentForm, setShowAppointmentForm] =
    useState(false);

  const [
    appointmentLifecycleFilter,
    setAppointmentLifecycleFilter,
  ] = useState<
    | "all"
    | "upcoming"
    | "completed"
    | "cancelled"
  >("all");

  const [
    appointmentStatusDrafts,
    setAppointmentStatusDrafts,
  ] = useState<Record<string, string>>({});

  const [profiles, setProfiles] = useState<
    Profile[]
  >([]);

  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [
    notificationsLoading,
    setNotificationsLoading,
  ] = useState(true);

  const [
    notificationUpdatingId,
    setNotificationUpdatingId,
  ] = useState<string | null>(null);

  const [
    markingAllNotifications,
    setMarkingAllNotifications,
  ] = useState(false);

  const [
    notificationSearchQuery,
    setNotificationSearchQuery,
  ] = useState("");

  const [
    notificationTypeFilter,
    setNotificationTypeFilter,
  ] = useState("all");

  const [
    notificationPage,
    setNotificationPage,
  ] = useState(1);

  const [
    liveNotification,
    setLiveNotification,
  ] = useState<Notification | null>(
    null
  );

  const [errorMessage, setErrorMessage] =
    useState("");

  const [selectedClientId, setSelectedClientId] =
    useState("");

  const [
    selectedClientServiceId,
    setSelectedClientServiceId,
  ] = useState("");

  const [documentTitle, setDocumentTitle] =
    useState("");

  const [documentType, setDocumentType] =
    useState("quote");

  const [documentFile, setDocumentFile] =
    useState<File | null>(null);

  const [documentSending, setDocumentSending] =
    useState(false);

  const [documentSuccess, setDocumentSuccess] =
    useState("");

  const [showDocumentUpload, setShowDocumentUpload] =
    useState(false);

  const [
    documentCategoryFilter,
    setDocumentCategoryFilter,
  ] = useState("all");

  const [
    documentSearchQuery,
    setDocumentSearchQuery,
  ] = useState("");

  const [
    documentPage,
    setDocumentPage,
  ] = useState(1);

  const [
    documentLifecycleFilter,
    setDocumentLifecycleFilter,
  ] = useState<
    "all" | "active" | "archived" | "unlinked"
  >("all");

  const [
    activeQuoteDomainKey,
    setActiveQuoteDomainKey,
  ] = useState<string | null>(
    null
  );

  const [
    quoteStatusFilter,
    setQuoteStatusFilter,
  ] = useState<
    | "all"
    | "received"
    | "in_progress"
    | "completed"
    | "cancelled"
  >("all");

  const [
    quoteSearchQuery,
    setQuoteSearchQuery,
  ] = useState("");

  const [
    quotePage,
    setQuotePage,
  ] = useState(1);

  const [
    selectedQuoteId,
    setSelectedQuoteId,
  ] = useState<string | null>(null);

  const [
    quoteStatusDrafts,
    setQuoteStatusDrafts,
  ] = useState<Record<string, string>>({});

  const [
    quoteStatusUpdatingId,
    setQuoteStatusUpdatingId,
  ] = useState<string | null>(null);

  const [
    supportStatusFilter,
    setSupportStatusFilter,
  ] = useState<
    | "all"
    | "open"
    | "in_progress"
    | "resolved"
    | "closed"
  >("all");

  const [
    supportSearchQuery,
    setSupportSearchQuery,
  ] = useState("");

  const [
    supportPage,
    setSupportPage,
  ] = useState(1);

  const [
    supportExpandedTicketId,
    setSupportExpandedTicketId,
  ] = useState<string | null>(null);

  const [
    activeDocumentDomainKey,
    setActiveDocumentDomainKey,
  ] = useState<string | null>(
    null
  );

  const [
    activeAdminFolderKey,
    setActiveAdminFolderKey,
  ] = useState<string | null>(
    null
  );

  const [
    editingDocumentId,
    setEditingDocumentId,
  ] = useState<string | null>(null);

  const [
    editDocumentTitle,
    setEditDocumentTitle,
  ] = useState("");

  const [
    editDocumentType,
    setEditDocumentType,
  ] = useState("quote");

  const [
    editDocumentServiceId,
    setEditDocumentServiceId,
  ] = useState("");

  const [
    documentUpdatingId,
    setDocumentUpdatingId,
  ] = useState<string | null>(null);

  const [
    documentDeletingId,
    setDocumentDeletingId,
  ] = useState<string | null>(null);

  const [replyDrafts, setReplyDrafts] = useState<
    Record<string, string>
  >({});

  const [replySendingId, setReplySendingId] =
    useState<string | null>(null);

  const [replySuccess, setReplySuccess] =
    useState("");

  const [
    guestQuoteReplyDrafts,
    setGuestQuoteReplyDrafts,
  ] = useState<
    Record<string, string>
  >({});

  const [
    guestQuoteReplySavingId,
    setGuestQuoteReplySavingId,
  ] = useState<string | null>(
    null
  );

  const [
    guestQuoteReplySuccess,
    setGuestQuoteReplySuccess,
  ] = useState("");

  const [
    supportMessages,
    setSupportMessages,
  ] = useState<SupportMessage[]>([]);

  const [
    storeProductTranslations,
    setStoreProductTranslations,
  ] = useState<StoreProductTranslation[]>([]);

  const loadAdminData = async () => {
    const [
      quotesResult,
      ticketsResult,
      documentsResult,
      servicesResult,
      appointmentsResult,
      profilesResult,
      notificationsResult,
      supportMessagesResult,
      storeProductsResult,
    ] = await Promise.all([
      supabase
        .from("quote_requests")
        .select(
          "id, user_id, service, name, email, phone, company, message, status, admin_reply, replied_at, reply_email_status, reply_email_sent_at, created_at"
        )
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("support_tickets")
        .select(
          "id, user_id, service, subject, message, status, admin_reply, replied_at, created_at"
        )
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("client_documents")
        .select(
          "id, user_id, client_service_id, title, document_type, file_path, created_at"
        )
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("client_services")
        .select(
          "id, user_id, service, title, status, scheduled_at, created_at"
        )
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("client_appointments")
        .select(
          "id, user_id, client_service_id, title, description, scheduled_at, status, location, client_response, client_response_message, client_responded_at, created_at, updated_at"
        )
        .order("scheduled_at", {
          ascending: true,
        }),

      supabase
        .from("profiles")
        .select(
          "id, email, first_name, last_name, phone, company"
        )
        .order("first_name", {
          ascending: true,
        }),

      supabase
        .from("notifications")
        .select(
          "id, type, title, message, entity_type, entity_id, is_read, read_at, created_at"
        )
        .eq("is_read", false)
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
          "sku, name_fr, name_nl, name_en"
        )
        .eq(
          "is_published",
          true
        ),
    ]);

    if (quotesResult.error) {
      console.error(
        "Erreur chargement devis :",
        quotesResult.error
      );

      setErrorMessage(
        "Impossible de charger certaines données administrateur."
      );
    } else {
      setQuotes(quotesResult.data ?? []);
    }

    if (ticketsResult.error) {
      console.error(
        "Erreur chargement support :",
        ticketsResult.error
      );

      setErrorMessage(
        "Impossible de charger certaines données administrateur."
      );
    } else {
      setTickets(ticketsResult.data ?? []);
    }

    if (documentsResult.error) {
      console.error(
        "Erreur chargement documents :",
        documentsResult.error
      );

      setErrorMessage(
        "Impossible de charger certaines données administrateur."
      );
    } else {
      setDocuments(
        documentsResult.data ?? []
      );
    }

    if (servicesResult.error) {
      console.error(
        "Erreur chargement interventions :",
        servicesResult.error
      );

      setErrorMessage(
        "Impossible de charger certaines données administrateur."
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

      setErrorMessage(
        "Impossible de charger certains rendez-vous."
      );
    } else {
      setAppointments(
        (appointmentsResult.data ?? []) as ClientAppointment[]
      );
    }

    if (profilesResult.error) {
      console.error(
        "Erreur chargement clients :",
        profilesResult.error
      );

      setErrorMessage(
        "Impossible de charger la liste des clients."
      );
    } else {
      setProfiles(
        profilesResult.data ?? []
      );
    }

    if (notificationsResult.error) {
      console.error(
        "Erreur chargement notifications admin :",
        notificationsResult.error
      );

      setErrorMessage(
        "Impossible de charger certaines notifications administrateur."
      );
    } else {
      setNotifications(
        notificationsResult.data ?? []
      );
    }

    if (
      supportMessagesResult.error
    ) {
      console.error(
        "Erreur chargement conversations support :",
        supportMessagesResult.error
      );

      setErrorMessage(
        "Impossible de charger certaines conversations support."
      );
    } else {
      setSupportMessages(
        (supportMessagesResult.data ??
          []) as SupportMessage[]
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

    setNotificationsLoading(false);
  };

  useEffect(() => {
    const initializeAdmin = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.href = "/login";
        return;
      }

      const {
        data: roleData,
        error: roleError,
      } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (
        roleError ||
        !roleData ||
        roleData.role !== "admin"
      ) {
        window.location.href = "/client";
        return;
      }

      setUser(user);

      await loadAdminData();

      setIsLoading(false);
    };

    initializeAdmin();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const notificationsChannel =
      supabase
        .channel(
          `admin-notifications-${user.id}`
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
        )
        .subscribe(
          (status) => {
            if (
              status ===
              "CHANNEL_ERROR"
            ) {
              console.error(
                "Erreur Realtime notifications administrateur."
              );

              setErrorMessage(
                "Le temps réel des notifications administrateur est momentanément indisponible. Vous pouvez toujours actualiser la page."
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
    if (!user) {
      return;
    }

    const supportMessagesChannel =
      supabase
        .channel(
          `admin-support-messages-${user.id}`
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

  const handleRefresh = async () => {
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    setErrorMessage("");
    setReplySuccess("");
    setGuestQuoteReplySuccess("");

    await loadAdminData();

    setIsRefreshing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();

    window.location.href = "/login";
  };

  const updateQuoteStatus = async (
    id: string,
    status: string
  ) => {
    if (quoteStatusUpdatingId) {
      return;
    }

    const currentQuote = quotes.find(
      (quote) => quote.id === id
    );

    if (!currentQuote) {
      return;
    }

    if (currentQuote.status === status) {
      setQuoteStatusDrafts((previous) => {
        const next = { ...previous };
        delete next[id];
        return next;
      });
      return;
    }

    setErrorMessage("");
    setQuoteStatusUpdatingId(id);

    const { error } = await supabase
      .from("quote_requests")
      .update({ status })
      .eq("id", id);

    setQuoteStatusUpdatingId(null);

    if (error) {
      console.error(
        "Erreur modification devis :",
        error
      );
      setErrorMessage(
        "Impossible de modifier le statut de la demande."
      );
      return;
    }

    setQuotes((previous) =>
      previous.map((quote) =>
        quote.id === id
          ? { ...quote, status }
          : quote
      )
    );

    setQuoteStatusDrafts((previous) => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
  };

  const saveGuestQuoteReply =
    async (
      quote: QuoteRequest
    ) => {
      if (
        quote.user_id ||
        guestQuoteReplySavingId
      ) {
        return;
      }

      const draft =
        (
          guestQuoteReplyDrafts[
            quote.id
          ] ??
          quote.admin_reply ??
          ""
        ).trim();

      if (!draft) {
        setErrorMessage(
          "Écris une réponse avant de l’enregistrer."
        );

        return;
      }

      setErrorMessage("");
      setGuestQuoteReplySuccess("");
      setGuestQuoteReplySavingId(
        quote.id
      );

      const repliedAt =
        new Date().toISOString();

      const {
        data,
        error,
      } = await supabase
        .from(
          "quote_requests"
        )
        .update({
          admin_reply:
            draft,
          replied_at:
            repliedAt,
          reply_email_status:
            "not_sent",
          reply_email_sent_at:
            null,
        })
        .eq(
          "id",
          quote.id
        )
        .is(
          "user_id",
          null
        )
        .select(
          "id, user_id, service, name, email, phone, company, message, status, admin_reply, replied_at, reply_email_status, reply_email_sent_at, created_at"
        )
        .single();

      setGuestQuoteReplySavingId(
        null
      );

      if (error) {
        console.error(
          "Erreur réponse devis visiteur :",
          error
        );

        setErrorMessage(
          at("unableSaveGuestReplyDetail", {
          detail: error.message,
        })
        );

        return;
      }

      setQuotes(
        (previous) =>
          previous.map(
            (
              currentQuote
            ) =>
              currentQuote.id ===
              data.id
                ? data
                : currentQuote
          )
      );

      setGuestQuoteReplyDrafts(
        (previous) => ({
          ...previous,
          [quote.id]:
            data.admin_reply ??
            "",
        })
      );

      setGuestQuoteReplySuccess(
        at("guestReplySavedForName", {
          name: quote.name,
        })
      );
    };

  const updateTicketStatus = async (
    id: string,
    status: string
  ) => {
    setErrorMessage("");

    const { error } = await supabase
      .from("support_tickets")
      .update({
        status,
      })
      .eq("id", id);

    if (error) {
      console.error(
        "Erreur modification ticket :",
        error
      );

      setErrorMessage(
        "Impossible de modifier le statut du ticket."
      );

      return;
    }

    setTickets((previous) =>
      previous.map((ticket) =>
        ticket.id === id
          ? {
              ...ticket,
              status,
            }
          : ticket
      )
    );
  };

  const handleTicketReply = async (
    ticket: SupportTicket
  ) => {
    const reply = (
      replyDrafts[ticket.id] ??
      ""
    ).trim();

    setErrorMessage("");
    setReplySuccess("");

    if (!reply) {
      setErrorMessage(
        "Écrivez un message avant de l’envoyer."
      );

      return;
    }

    if (!user) {
      setErrorMessage(
        "La session administrateur n’est plus disponible."
      );

      return;
    }

    setReplySendingId(ticket.id);

    const {
      data: insertedMessage,
      error,
    } = await supabase
      .from("support_messages")
      .insert({
        ticket_id:
          ticket.id,
        sender_user_id:
          user.id,
        sender_type:
          "admin",
        message:
          reply,
      })
      .select(
        "id, ticket_id, sender_user_id, sender_type, message, created_at"
      )
      .single();

    setReplySendingId(null);

    if (error) {
      console.error(
        "Erreur message support Admin :",
        error
      );

      setErrorMessage(
        at("unableSendSupportMessageDetail", {
          detail: error.message,
        })
      );

      return;
    }

    if (insertedMessage) {
      const message =
        insertedMessage as SupportMessage;

      setSupportMessages(
        (previous) => {
          const alreadyExists =
            previous.some(
              (supportMessage) =>
                supportMessage.id ===
                message.id
            );

          if (alreadyExists) {
            return previous;
          }

          return [
            ...previous,
            message,
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

    setReplyDrafts((previous) => ({
      ...previous,
      [ticket.id]: "",
    }));

    setReplySuccess(
      "Le message TSB a bien été ajouté à la conversation."
    );
  };

  const getSupportSenderLabel = (
    senderType: SupportMessage["sender_type"]
  ) => {
    switch (senderType) {
      case "client":
        return tr("CLIENT", "KLANT", "CLIENT");

      case "admin":
        return tr("TSB TECH GROUP", "TSB TECH GROUP", "TSB TECH GROUP");

      case "ai":
        return tr("ASSISTANT IA TSB", "TSB AI-ASSISTENT", "TSB AI ASSISTANT");

      case "system":
        return tr("SYSTÈME", "SYSTEEM", "SYSTEM");

      default:
        return tr("MESSAGE", "BERICHT", "MESSAGE");
    }
  };

  const handleDocumentUpload = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setDocumentSuccess("");

    if (!selectedClientId) {
      setErrorMessage(
        "Sélectionnez d’abord un client."
      );

      return;
    }

    if (!documentTitle.trim()) {
      setErrorMessage(
        "Indiquez le titre du document."
      );

      return;
    }

    if (!documentFile) {
      setErrorMessage(
        "Sélectionnez un fichier PDF."
      );

      return;
    }

    if (
      documentFile.type !==
        "application/pdf" &&
      !documentFile.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      setErrorMessage(
        "Seuls les fichiers PDF sont acceptés."
      );

      return;
    }

    const maxSize =
      10 * 1024 * 1024;

    if (documentFile.size > maxSize) {
      setErrorMessage(
        "Le fichier dépasse la limite de 10 Mo."
      );

      return;
    }

    setDocumentSending(true);

    const safeName = documentFile.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(
        /[^a-zA-Z0-9._-]/g,
        "-"
      )
      .toLowerCase();

    const uniqueFileName =
      `${Date.now()}-${safeName}`;

    const uploadYear =
      new Date().getFullYear();

    const filePath =
      `${selectedClientId}/${documentType}/${uploadYear}/${uniqueFileName}`;

    const { error: uploadError } =
      await supabase.storage
        .from("client-documents")
        .upload(
          filePath,
          documentFile,
          {
            contentType:
              documentFile.type ||
              "application/pdf",
            upsert: false,
          }
        );

    if (uploadError) {
      console.error(
        "Erreur upload fichier :",
        uploadError
      );

      setDocumentSending(false);

      setErrorMessage(
        at("unableUploadDocumentDetail", {
          detail: uploadError.message,
        })
      );

      return;
    }

    const {
      data: insertedDocument,
      error: databaseError,
    } = await supabase
      .from("client_documents")
      .insert({
        user_id: selectedClientId,
        client_service_id:
          selectedClientServiceId ||
          null,
        title:
          documentTitle.trim(),
        document_type:
          documentType,
        file_path: filePath,
      })
      .select(
        "id, user_id, client_service_id, title, document_type, file_path, created_at"
      )
      .single();

    if (databaseError) {
      console.error(
        "Erreur création document :",
        databaseError
      );

      await supabase.storage
        .from("client-documents")
        .remove([filePath]);

      setDocumentSending(false);

      setErrorMessage(
        at("unableSaveDocumentDetail", {
          detail: databaseError.message,
        })
      );

      return;
    }

    if (insertedDocument) {
      setDocuments((previous) => [
        insertedDocument,
        ...previous,
      ]);
    }

    setSelectedClientId("");
    setSelectedClientServiceId("");
    setDocumentTitle("");
    setDocumentType("quote");
    setDocumentFile(null);

    const fileInput =
      document.getElementById(
        "admin-document-file"
      ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = "";
    }

    setDocumentSending(false);

    setDocumentSuccess(
      selectedClientServiceId
        ? "Le document a été ajouté au client et lié à l’intervention."
        : "Le document a été ajouté à l’espace du client."
    );

    setShowDocumentUpload(false);
  };

  const startDocumentEdit = (
    clientDocument: ClientDocument
  ) => {
    setEditingDocumentId(
      clientDocument.id
    );

    setEditDocumentTitle(
      clientDocument.title
    );

    setEditDocumentType(
      clientDocument.document_type
    );

    setEditDocumentServiceId(
      clientDocument.client_service_id ||
        ""
    );

    setErrorMessage("");
    setDocumentSuccess("");
  };

  const cancelDocumentEdit = () => {
    setEditingDocumentId(null);
    setEditDocumentTitle("");
    setEditDocumentType("quote");
    setEditDocumentServiceId("");
  };

  const handleDocumentUpdate = async (
    clientDocument: ClientDocument
  ) => {
    const cleanTitle =
      editDocumentTitle.trim();

    setErrorMessage("");
    setDocumentSuccess("");

    if (!cleanTitle) {
      setErrorMessage(
        "Indiquez le titre du document."
      );

      return;
    }

    if (editDocumentServiceId) {
      const linkedService =
        clientServices.find(
          (clientService) =>
            clientService.id ===
            editDocumentServiceId
        );

      if (
        !linkedService ||
        linkedService.user_id !==
          clientDocument.user_id
      ) {
        setErrorMessage(
          "L’intervention sélectionnée n’appartient pas à ce client."
        );

        return;
      }
    }

    setDocumentUpdatingId(
      clientDocument.id
    );

    const {
      data: updatedDocument,
      error,
    } = await supabase
      .from("client_documents")
      .update({
        title: cleanTitle,
        document_type:
          editDocumentType,
        client_service_id:
          editDocumentServiceId ||
          null,
      })
      .eq(
        "id",
        clientDocument.id
      )
      .select(
        "id, user_id, client_service_id, title, document_type, file_path, created_at"
      )
      .single();

    setDocumentUpdatingId(null);

    if (error) {
      console.error(
        "Erreur modification document :",
        error
      );

      setErrorMessage(
        at("unableUpdateDocumentDetail", {
          detail: error.message,
        })
      );

      return;
    }

    if (updatedDocument) {
      setDocuments(
        (previous) =>
          previous.map(
            (currentDocument) =>
              currentDocument.id ===
              clientDocument.id
                ? updatedDocument
                : currentDocument
          )
      );
    }

    cancelDocumentEdit();

    setDocumentSuccess(
      "Le document a été modifié."
    );
  };

  const handleDocumentDelete = async (
    clientDocument: ClientDocument
  ) => {
    const confirmed =
      window.confirm(
        at("deleteDocumentConfirm", {
          title: clientDocument.title,
        })
      );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setDocumentSuccess("");

    setDocumentDeletingId(
      clientDocument.id
    );

    /*
      On supprime d'abord l'entrée en base.
      Ainsi, si la suppression DB est refusée,
      le fichier Storage reste intact.
    */
    const { error: databaseError } =
      await supabase
        .from("client_documents")
        .delete()
        .eq(
          "id",
          clientDocument.id
        );

    if (databaseError) {
      setDocumentDeletingId(null);

      console.error(
        "Erreur suppression document :",
        databaseError
      );

      setErrorMessage(
        at("unableDeleteDocumentDetail", {
          detail: databaseError.message,
        })
      );

      return;
    }

    const { error: storageError } =
      await supabase.storage
        .from("client-documents")
        .remove([
          clientDocument.file_path,
        ]);

    setDocumentDeletingId(null);

    setDocuments(
      (previous) =>
        previous.filter(
          (currentDocument) =>
            currentDocument.id !==
            clientDocument.id
        )
    );

    if (
      editingDocumentId ===
      clientDocument.id
    ) {
      cancelDocumentEdit();
    }

    if (storageError) {
      console.error(
        "Erreur nettoyage Storage :",
        storageError
      );

      setErrorMessage(
        "Le document a été retiré de la plateforme, mais le fichier n’a pas pu être nettoyé dans le Storage."
      );

      return;
    }

    setDocumentSuccess(
      "Le document et son fichier PDF ont été supprimés."
    );
  };

  const getNotificationTypeLabel = (
    notificationType: string
  ) => {
    switch (notificationType) {
      case "quote":
        return tr("DEVIS", "OFFERTE", "QUOTE");

      case "support":
        return "SUPPORT";

      case "service":
        return tr("INTERVENTION", "INTERVENTIE", "INTERVENTION");

      case "document":
        return tr("DOCUMENT", "DOCUMENT", "DOCUMENT");

      case "appointment":
        return tr("RENDEZ-VOUS", "AFSPRAAK", "APPOINTMENT");

      case "system":
        return "TSB";

      default:
        return tr("NOTIFICATION", "MELDING", "NOTIFICATION");
    }
  };

  const markNotificationRead = async (
    notification: Notification
  ) => {
    if (
      notification.is_read ||
      notificationUpdatingId
    ) {
      return true;
    }

    if (!user) {
      setErrorMessage(
        "La session administrateur n’est plus disponible."
      );

      return false;
    }

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
        "Erreur lecture notification admin :",
        error
      );

      setErrorMessage(
        at("unableMarkNotificationReadDetail", {
          detail: error.message,
        })
      );

      return false;
    }

    setNotifications(
      (previous) =>
        previous.filter(
          (currentNotification) =>
            currentNotification.id !==
            notification.id
        )
    );

    return true;
  };

  const handleOpenNotification = async (
    notification: Notification
  ) => {
    setErrorMessage("");

    const readSucceeded =
      await markNotificationRead(
        notification
      );

    if (!readSucceeded) {
      return;
    }

    if (
      notification.entity_type ===
        "quote_request" &&
      notification.entity_id
    ) {
      const {
        data: refreshedQuote,
        error: refreshedQuoteError,
      } = await supabase
        .from("quote_requests")
        .select(
          "id, user_id, service, name, email, phone, company, message, status, admin_reply, replied_at, reply_email_status, reply_email_sent_at, created_at"
        )
        .eq(
          "id",
          notification.entity_id
        )
        .maybeSingle();

      if (
        refreshedQuoteError
      ) {
        console.error(
          "Erreur actualisation devis Admin :",
          refreshedQuoteError
        );

        setErrorMessage(
          "Le devis a été reçu, mais son affichage n’a pas pu être actualisé."
        );
      }

      if (refreshedQuote) {
        setQuotes(
          (previous) => {
            const exists =
              previous.some(
                (quote) =>
                  quote.id ===
                  refreshedQuote.id
              );

            if (!exists) {
              return [
                refreshedQuote,
                ...previous,
              ];
            }

            return previous.map(
              (quote) =>
                quote.id ===
                refreshedQuote.id
                  ? refreshedQuote
                  : quote
            );
          }
        );
      }
    }

    if (
      notification.entity_type ===
        "support_ticket" &&
      notification.entity_id
    ) {
      const {
        data: refreshedTicket,
        error: refreshedTicketError,
      } = await supabase
        .from("support_tickets")
        .select(
          "id, user_id, service, subject, message, status, admin_reply, replied_at, created_at"
        )
        .eq(
          "id",
          notification.entity_id
        )
        .maybeSingle();

      if (
        refreshedTicketError
      ) {
        console.error(
          "Erreur actualisation ticket support Admin :",
          refreshedTicketError
        );
      }

      if (refreshedTicket) {
        setTickets(
          (previous) => {
            const exists =
              previous.some(
                (ticket) =>
                  ticket.id ===
                  refreshedTicket.id
              );

            if (!exists) {
              return [
                refreshedTicket,
                ...previous,
              ];
            }

            return previous.map(
              (ticket) =>
                ticket.id ===
                refreshedTicket.id
                  ? refreshedTicket
                  : ticket
            );
          }
        );
      }
    }

    if (
      notification.type === "store"
    ) {
      setActiveSection("store");
    } else if (
      notification.type === "client" ||
      notification.entity_type ===
        "profile"
    ) {
      setActiveSection("clients");
    } else if (
      notification.entity_type ===
      "quote_request"
    ) {
      setActiveSection("quotes");
    } else if (
      notification.entity_type ===
      "support_ticket"
    ) {
      setActiveSection("support");
    } else if (
      notification.entity_type ===
      "client_appointment"
    ) {
      setActiveSection("appointments");
    } else if (
      notification.entity_type ===
        "client_service" ||
      notification.type === "service"
    ) {
      setActiveSection("services");
    } else if (
      notification.entity_type ===
        "client_document" ||
      notification.type === "document"
    ) {
      setActiveSection("documents");
    } else {
      setActiveSection("notifications");
    }

    let targetId =
      notification.type === "store"
        ? "admin-store"
        : notification.type === "client" ||
            notification.entity_type ===
              "profile"
          ? "admin-clients"
          : "admin-notifications";

    if (
      notification.entity_type ===
        "quote_request" &&
      notification.entity_id
    ) {
      targetId =
        `admin-quote-${notification.entity_id}`;
    }

    if (
      notification.entity_type ===
        "support_ticket" &&
      notification.entity_id
    ) {
      targetId =
        `admin-ticket-${notification.entity_id}`;
    }

    if (
      notification.entity_type ===
        "client_appointment" &&
      notification.entity_id
    ) {
      targetId =
        `admin-appointment-${notification.entity_id}`;
    }

    if (
      notification.entity_type ===
        "client_document" &&
      notification.entity_id
    ) {
      targetId =
        `admin-document-${notification.entity_id}`;
    }

    if (
      notification.entity_type ===
        "client_service" ||
      notification.type === "service"
    ) {
      targetId =
        "admin-interventions";
    }

    const fallbackId =
      notification.type === "store"
        ? "admin-store"
        : notification.type === "client" ||
            notification.entity_type ===
              "profile"
          ? "admin-clients"
      : notification.entity_type ===
      "support_ticket"
        ? "admin-support"
        : notification.entity_type ===
          "quote_request"
          ? "admin-devis"
          : notification.entity_type ===
            "client_appointment"
            ? "admin-appointments"
            : notification.entity_type ===
                "client_service" ||
              notification.type === "service"
              ? "admin-interventions"
              : notification.entity_type ===
                    "client_document" ||
                  notification.type === "document"
                ? "admin-documents"
                : "admin-notifications";

    const scrollToExactTarget = (
      attempt = 0
    ) => {
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

      if (attempt < 8) {
        window.setTimeout(
          () =>
            scrollToExactTarget(
              attempt + 1
            ),
          100
        );

        return;
      }

      document
        .getElementById(
          fallbackId
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    };

    window.setTimeout(
      () =>
        scrollToExactTarget(),
      180
    );
  };

  const handleMarkAllNotificationsRead =
    async () => {
      if (
        markingAllNotifications ||
        !user
      ) {
        return;
      }

      const unread =
        notifications.filter(
          (notification) =>
            !notification.is_read
        );

      if (unread.length === 0) {
        return;
      }

      setErrorMessage("");
      setMarkingAllNotifications(
        true
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
            "user_id",
            user.id
          )
          .eq(
            "is_read",
            false
          );

      setMarkingAllNotifications(
        false
      );

      if (error) {
        console.error(
          "Erreur lecture notifications admin :",
          error
        );

        setErrorMessage(
          at("unableMarkAllNotificationsReadDetail", {
          detail: error.message,
        })
        );

        return;
      }

      setNotifications([]);
    };

  const handleAppointmentCreate = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (appointmentSending) {
      return;
    }

    setErrorMessage("");
    setAppointmentSuccess("");

    if (!appointmentClientId) {
      setErrorMessage(
        "Sélectionnez le client du rendez-vous."
      );
      return;
    }

    if (!appointmentTitle.trim()) {
      setErrorMessage(
        "Indiquez le titre du rendez-vous."
      );
      return;
    }

    if (!appointmentScheduledAt) {
      setErrorMessage(
        "Indiquez la date et l’heure du rendez-vous."
      );
      return;
    }

    const scheduledDate = new Date(
      appointmentScheduledAt
    );

    if (
      Number.isNaN(
        scheduledDate.getTime()
      )
    ) {
      setErrorMessage(
        "La date du rendez-vous n’est pas valide."
      );
      return;
    }

    if (appointmentServiceId) {
      const linkedService =
        clientServices.find(
          (clientService) =>
            clientService.id ===
            appointmentServiceId
        );

      if (
        !linkedService ||
        linkedService.user_id !==
          appointmentClientId
      ) {
        setErrorMessage(
          "L’intervention sélectionnée n’appartient pas à ce client."
        );
        return;
      }
    }

    setAppointmentSending(true);

    const appointmentPayload = {
      client_service_id:
        appointmentServiceId || null,
      title: appointmentTitle.trim(),
      description:
        appointmentDescription.trim() || null,
      scheduled_at:
        scheduledDate.toISOString(),
      status: appointmentStatus,
      location:
        appointmentLocation.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (editingAppointmentId) {
      const {
        data: updatedAppointment,
        error,
      } = await supabase
        .from("client_appointments")
        .update(appointmentPayload)
        .eq("id", editingAppointmentId)
        .eq("user_id", appointmentClientId)
        .select(
          "id, user_id, client_service_id, title, description, scheduled_at, status, location, client_response, client_response_message, client_responded_at, created_at, updated_at"
        )
        .single();

      setAppointmentSending(false);

      if (error) {
        console.error(
          "Erreur modification rendez-vous :",
          error
        );

        setErrorMessage(
          at("unableUpdateAppointmentDetail", {
          detail: error.message,
        })
        );
        return;
      }

      if (updatedAppointment) {
        setAppointments((previous) =>
          previous
            .map((currentAppointment) =>
              currentAppointment.id === editingAppointmentId
                ? (updatedAppointment as ClientAppointment)
                : currentAppointment
            )
            .sort(
              (a, b) =>
                new Date(a.scheduled_at).getTime() -
                new Date(b.scheduled_at).getTime()
            )
        );
      }

      setEditingAppointmentId(null);
      setAppointmentClientId("");
      setAppointmentServiceId("");
      setAppointmentTitle("");
      setAppointmentDescription("");
      setAppointmentScheduledAt("");
      setAppointmentStatus("scheduled");
      setAppointmentLocation("");

      setAppointmentSuccess(
        "Le rendez-vous existant a été mis à jour. Aucun nouveau rendez-vous n’a été créé."
      );
      setShowAppointmentForm(false);
      return;
    }

    const {
      data: insertedAppointment,
      error,
    } = await supabase
      .from("client_appointments")
      .insert({
        user_id: appointmentClientId,
        ...appointmentPayload,
      })
      .select(
        "id, user_id, client_service_id, title, description, scheduled_at, status, location, client_response, client_response_message, client_responded_at, created_at, updated_at"
      )
      .single();

    setAppointmentSending(false);

    if (error) {
      console.error(
        "Erreur création rendez-vous :",
        error
      );

      setErrorMessage(
        at("unableCreateAppointmentDetail", {
          detail: error.message,
        })
      );
      return;
    }

    if (insertedAppointment) {
      setAppointments(
        (previous) =>
          [
            insertedAppointment as ClientAppointment,
            ...previous,
          ].sort(
            (a, b) =>
              new Date(
                a.scheduled_at
              ).getTime() -
              new Date(
                b.scheduled_at
              ).getTime()
          )
      );
    }

    setAppointmentClientId("");
    setAppointmentServiceId("");
    setAppointmentTitle("");
    setAppointmentDescription("");
    setAppointmentScheduledAt("");
    setAppointmentStatus("scheduled");
    setAppointmentLocation("");

    setAppointmentSuccess(
      "Le rendez-vous a été ajouté."
    );

    setShowAppointmentForm(false);
  };

  const updateAppointmentStatus = async (
    appointment: ClientAppointment,
    status: string
  ) => {
    if (appointmentUpdatingId) {
      return;
    }

    setErrorMessage("");
    setAppointmentSuccess("");
    setAppointmentUpdatingId(
      appointment.id
    );

    const updatedAt =
      new Date().toISOString();

    const {
      data: updatedAppointment,
      error,
    } = await supabase
      .from("client_appointments")
      .update({
        status,
        updated_at: updatedAt,
      })
      .eq(
        "id",
        appointment.id
      )
      .select(
        "id, user_id, client_service_id, title, description, scheduled_at, status, location, client_response, client_response_message, client_responded_at, created_at, updated_at"
      )
      .single();

    setAppointmentUpdatingId(
      null
    );

    if (error) {
      console.error(
        "Erreur statut rendez-vous :",
        error
      );

      setErrorMessage(
        at("unableUpdateAppointmentDetail", {
          detail: error.message,
        })
      );
      return;
    }

    if (updatedAppointment) {
      setAppointments(
        (previous) =>
          previous.map(
            (currentAppointment) =>
              currentAppointment.id ===
              appointment.id
                ? (updatedAppointment as ClientAppointment)
                : currentAppointment
          )
      );
    }

    setAppointmentStatusDrafts((previous) => {
      const next = { ...previous };
      delete next[appointment.id];
      return next;
    });

    setAppointmentSuccess(
      "Le statut du rendez-vous a été mis à jour."
    );
  };

  const proposeAnotherAppointmentDate = (
    appointment: ClientAppointment
  ) => {
    const currentDate = new Date(appointment.scheduled_at);
    const localDate = new Date(
      currentDate.getTime() -
        currentDate.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);

    setShowAppointmentForm(true);
    setEditingAppointmentId(appointment.id);
    setAppointmentClientId(appointment.user_id);
    setAppointmentServiceId(appointment.client_service_id ?? "");
    setAppointmentTitle(appointment.title);
    setAppointmentDescription(appointment.description ?? "");
    setAppointmentScheduledAt(localDate);
    setAppointmentStatus("scheduled");
    setAppointmentLocation(appointment.location ?? "");
    setAppointmentSuccess(
      "Mode autre date : modifiez la date et l’heure puis enregistrez. Le rendez-vous existant sera remplacé, pas dupliqué."
    );

    window.setTimeout(() => {
      document
        .getElementById("admin-appointment-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const deleteAppointment = async (
    appointment: ClientAppointment
  ) => {
    const confirmed =
      window.confirm(
        at("deleteAppointmentConfirm", {
          title: appointment.title,
        })
      );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setAppointmentSuccess("");
    setAppointmentDeletingId(
      appointment.id
    );

    const { error } =
      await supabase
        .from(
          "client_appointments"
        )
        .delete()
        .eq(
          "id",
          appointment.id
        );

    setAppointmentDeletingId(
      null
    );

    if (error) {
      console.error(
        "Erreur suppression rendez-vous :",
        error
      );

      setErrorMessage(
        at("unableDeleteAppointmentDetail", {
          detail: error.message,
        })
      );
      return;
    }

    setAppointments(
      (previous) =>
        previous.filter(
          (currentAppointment) =>
            currentAppointment.id !==
            appointment.id
        )
    );

    setAppointmentSuccess(
      "Le rendez-vous a été supprimé."
    );
  };

  const getAppointmentResponseDisplay = (
    response: string | null
  ) => {
    switch (response) {
      case "accepted":
        return {
          label: "ACCEPTÉ PAR LE CLIENT",
          color: "#4ade80",
          border: "rgba(74,222,128,0.34)",
          background: "rgba(74,222,128,0.10)",
        };
      case "declined":
        return {
          label: "REFUSÉ PAR LE CLIENT",
          color: "#f87171",
          border: "rgba(248,113,113,0.34)",
          background: "rgba(248,113,113,0.10)",
        };
      case "reschedule_requested":
        return {
          label: "NOUVELLE DATE DEMANDÉE",
          color: "#fbbf24",
          border: "rgba(251,191,36,0.34)",
          background: "rgba(251,191,36,0.10)",
        };
      default:
        return {
          label: "EN ATTENTE DE RÉPONSE CLIENT",
          color: "rgba(255,255,255,0.62)",
          border: "rgba(255,255,255,0.14)",
          background: "rgba(255,255,255,0.05)",
        };
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat(
      intlLocale,
      {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(new Date(date));
  };

  const getQuoteStatusLabel = (
    status: string
  ) => {
    switch (status) {
      case "received":
        return tr("À traiter", "Te behandelen", "To process");

      case "in_progress":
        return tr("En traitement", "In behandeling", "In progress");

      case "completed":
        return tr("Finalisé", "Afgerond", "Completed");

      case "cancelled":
        return tr("Annulé", "Geannuleerd", "Cancelled");

      default:
        return status;
    }
  };

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
    quote: QuoteRequest
  ) => {
    if (
      quote.service
        .trim()
        .toLocaleLowerCase() !==
      "tsb store"
    ) {
      return quote.message;
    }

    const referenceMatch =
      quote.message.match(
        /^(?:Référence|Reference|Referentie)\s*:\s*(.+)$/im
      );

    const productMatch =
      quote.message.match(
        /^(?:Produit|Product)\s*:\s*(.+)$/im
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
      return quote.message;
    }

    return [
      at("storeProductRequestTitle"),
      `${at("productLabel")} ${productName}`,
      ...(reference
        ? [
            `${at("referenceLabel")} ${reference}`,
          ]
        : []),
      "",
      at("storeProductRequestClosing"),
    ].join("\n");
  };

  const getSupportStatusLabel = (
    status: string
  ) => {
    switch (status) {
      case "open":
        return tr("Ouvert", "Open", "Open");

      case "in_progress":
        return tr("En cours", "Bezig", "In progress");

      case "resolved":
        return tr("Résolu", "Opgelost", "Resolved");

      case "closed":
        return tr("Fermé", "Gesloten", "Closed");

      default:
        return status;
    }
  };

  const getDocumentTypeLabel = (
    documentType: string
  ) => {
    switch (documentType) {
      case "quote":
        return tr(
          "Devis",
          "Offerte",
          "Quote"
        );

      case "invoice":
        return tr("Facture", "Factuur", "Invoice");

      case "intervention":
        return tr("Intervention & rapport", "Interventie & rapport", "Intervention & report");

      case "diagnostic":
        return tr("Diagnostic", "Diagnose", "Diagnostic");

      case "administrative":
        return tr("Administratif", "Administratief", "Administrative");

      case "other":
        return tr("Autre document", "Ander document", "Other document");

      default:
        return documentType;
    }
  };

  const getClientLabel = (
    profile: Profile
  ) => {
    const fullName = [
      profile.first_name,
      profile.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    if (
      fullName &&
      profile.email
    ) {
      return `${fullName} — ${profile.email}`;
    }

    if (fullName) {
      return fullName;
    }

    if (profile.email) {
      return profile.email;
    }

    return profile.id;
  };

  const getServiceStatusLabel = (
    status: string
  ) => {
    switch (status) {
      case "planned":
        return tr("À planifier", "Te plannen", "To schedule");

      case "scheduled":
        return tr("Planifiée", "Gepland", "Scheduled");

      case "in_progress":
        return tr("En cours", "Bezig", "In progress");

      case "completed":
        return tr("Terminée", "Voltooid", "Completed");

      case "cancelled":
        return tr("Annulée", "Geannuleerd", "Cancelled");

      default:
        return status;
    }
  };

  const getAppointmentStatusLabel = (
    status: string
  ) => {
    switch (status) {
      case "requested":
        return tr("À confirmer", "Te bevestigen", "To confirm");

      case "scheduled":
        return tr("Planifié", "Gepland", "Scheduled");

      case "confirmed":
        return tr("Confirmé", "Bevestigd", "Confirmed");

      case "completed":
        return tr("Terminé", "Voltooid", "Completed");

      case "cancelled":
        return tr("Annulé", "Geannuleerd", "Cancelled");

      default:
        return status;
    }
  };

  const getAppointmentStatusStyle = (
    status: string
  ) => {
    if (status === "completed" || status === "confirmed") {
      return {
        background: "rgba(74,222,128,0.12)",
        border: "1px solid rgba(74,222,128,0.30)",
        color: "#4ade80",
      } as const;
    }

    if (status === "cancelled") {
      return {
        background: "rgba(248,113,113,0.12)",
        border: "1px solid rgba(248,113,113,0.30)",
        color: "#f87171",
      } as const;
    }

    return {
      background: "rgba(22,136,255,0.12)",
      border: "1px solid rgba(22,136,255,0.25)",
      color: "#53a7ff",
    } as const;
  };

  const getClientServiceLabel = (
    clientService: ClientService
  ) => {
    return `${clientService.title} — ${clientService.service} — ${getServiceStatusLabel(
      clientService.status
    )}`;
  };

  const selectedClientServices =
    selectedClientId
      ? clientServices.filter(
          (clientService) =>
            clientService.user_id ===
            selectedClientId
        )
      : [];

  const appointmentClientServices =
    appointmentClientId
      ? clientServices.filter(
          (clientService) =>
            clientService.user_id ===
            appointmentClientId
        )
      : [];

  const clientServiceById = new Map(
    clientServices.map(
      (clientService) => [
        clientService.id,
        clientService,
      ]
    )
  );

  const profileById = new Map(
    profiles.map(
      (profile) => [
        profile.id,
        profile,
      ]
    )
  );

  const getEffectiveAppointmentStatus = (
    appointment: ClientAppointment
  ) =>
    appointmentStatusDrafts[appointment.id] ??
    appointment.status;

  const appointmentLifecycleCounts = {
    all: appointments.length,
    upcoming: appointments.filter((appointment) => {
      const status = getEffectiveAppointmentStatus(appointment);
      return status !== "completed" && status !== "cancelled";
    }).length,
    completed: appointments.filter(
      (appointment) =>
        getEffectiveAppointmentStatus(appointment) === "completed"
    ).length,
    cancelled: appointments.filter(
      (appointment) =>
        getEffectiveAppointmentStatus(appointment) === "cancelled"
    ).length,
  };

  const appointmentResponseCounts = {
    all: appointments.length,
    pending: appointments.filter(
      (appointment) =>
        !appointment.client_response
    ).length,
    accepted: appointments.filter(
      (appointment) =>
        appointment.client_response ===
        "accepted"
    ).length,
    declined: appointments.filter(
      (appointment) =>
        appointment.client_response ===
        "declined"
    ).length,
    reschedule_requested:
      appointments.filter(
        (appointment) =>
          appointment.client_response ===
          "reschedule_requested"
      ).length,
  };

  const filteredAppointments =
    appointments.filter((appointment) => {
      const matchesLifecycle =
        appointmentLifecycleFilter === "all" ||
        (appointmentLifecycleFilter === "upcoming" &&
          appointment.status !== "completed" &&
          appointment.status !== "cancelled") ||
        appointment.status === appointmentLifecycleFilter;

      if (!matchesLifecycle) {
        return false;
      }

      if (
        appointmentResponseFilter ===
        "all"
      ) {
        return true;
      }

      if (
        appointmentResponseFilter ===
        "pending"
      ) {
        return !appointment.client_response;
      }

      return (
        appointment.client_response ===
        appointmentResponseFilter
      );
    });

  const totalAppointmentPages = Math.max(
    1,
    Math.ceil(
      filteredAppointments.length /
        APPOINTMENTS_PER_PAGE
    )
  );

  const safeAppointmentPage = Math.min(
    appointmentPage,
    totalAppointmentPages
  );

  const paginatedAppointments =
    filteredAppointments.slice(
      (safeAppointmentPage - 1) *
        APPOINTMENTS_PER_PAGE,
      safeAppointmentPage *
        APPOINTMENTS_PER_PAGE
    );

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
          service
      ) ??
      getServiceDomain(
        service
      )
    );
  };

  const normalizedSupportSearch =
    supportSearchQuery
      .trim()
      .toLowerCase();

  const supportStatusCounts = {
    all: tickets.length,
    open: tickets.filter(
      (ticket) => ticket.status === "open"
    ).length,
    in_progress: tickets.filter(
      (ticket) => ticket.status === "in_progress"
    ).length,
    resolved: tickets.filter(
      (ticket) => ticket.status === "resolved"
    ).length,
    closed: tickets.filter(
      (ticket) => ticket.status === "closed"
    ).length,
  };

  const filteredSupportTickets = tickets
    .filter((ticket) => {
      const matchesStatus =
        supportStatusFilter === "all" ||
        ticket.status === supportStatusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSupportSearch) {
        return true;
      }

      const profile = profileById.get(ticket.user_id);
      const searchableText = [
        ticket.subject,
        ticket.service ?? "",
        ticket.message,
        getSupportStatusLabel(ticket.status),
        profile?.first_name ?? "",
        profile?.last_name ?? "",
        profile?.email ?? "",
        profile?.phone ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSupportSearch);
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    );

  const supportTotalPages = Math.max(
    1,
    Math.ceil(
      filteredSupportTickets.length / SUPPORT_PER_PAGE
    )
  );

  const safeSupportPage = Math.min(
    supportPage,
    supportTotalPages
  );

  const paginatedSupportTickets =
    filteredSupportTickets.slice(
      (safeSupportPage - 1) * SUPPORT_PER_PAGE,
      safeSupportPage * SUPPORT_PER_PAGE
    );

  const organizedSupportClients =
    Array.from(
      new Set(
        paginatedSupportTickets.map(
          (ticket) =>
            ticket.user_id
        )
      )
    )
      .map(
        (clientId) => {
          const profile =
            profileById.get(
              clientId
            );

          const clientTickets =
            paginatedSupportTickets.filter(
              (ticket) =>
                ticket.user_id ===
                clientId
            );

          const domains =
            TSB_DOMAINS.map(
              (domain) => ({
                domain,
                tickets:
                  clientTickets.filter(
                    (ticket) =>
                      getSupportTicketDomain(
                        ticket.service
                      ).key ===
                      domain.key
                  ),
              })
            ).filter(
              ({
                tickets:
                  domainTickets,
              }) =>
                domainTickets.length >
                0
            );

          return {
            clientId,
            clientLabel:
              profile
                ? getClientLabel(
                    profile
                  )
                : clientId,
            ticketCount:
              clientTickets.length,
            domains,
          };
        }
      )
      .sort(
        (a, b) =>
          a.clientLabel.localeCompare(
            b.clientLabel,
            "fr"
          )
      );

  const documentCategoryCounts =
    DOCUMENT_CATEGORIES.reduce<
      Record<string, number>
    >(
      (counts, category) => {
        counts[category.value] =
          category.value === "all"
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

  const getDocumentLifecycle = (
    clientDocument: ClientDocument
  ): "active" | "archived" | "unlinked" => {
    if (!clientDocument.client_service_id) {
      return "unlinked";
    }

    const linkedService = clientServiceById.get(
      clientDocument.client_service_id
    );

    if (!linkedService) {
      return "unlinked";
    }

    if (
      linkedService.status === "completed" ||
      linkedService.status === "cancelled"
    ) {
      return "archived";
    }

    return "active";
  };

  const documentLifecycleCounts = {
    all: documents.length,
    active: documents.filter(
      (clientDocument) =>
        getDocumentLifecycle(clientDocument) === "active"
    ).length,
    archived: documents.filter(
      (clientDocument) =>
        getDocumentLifecycle(clientDocument) === "archived"
    ).length,
    unlinked: documents.filter(
      (clientDocument) =>
        getDocumentLifecycle(clientDocument) === "unlinked"
    ).length,
  };

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

        const documentLifecycle =
          getDocumentLifecycle(clientDocument);

        const matchesLifecycle =
          documentLifecycleFilter === "all" ||
          documentLifecycle === documentLifecycleFilter;

        if (
          !matchesCategory ||
          !matchesDomain ||
          !matchesLifecycle
        ) {
          return false;
        }

        if (
          !normalizedDocumentSearch
        ) {
          return true;
        }

        const profile =
          profileById.get(
            clientDocument.user_id
          );

        const searchableText = [
          clientDocument.title,
          getDocumentTypeLabel(
            clientDocument.document_type
          ),
          profile
            ? getClientLabel(
                profile
              )
            : "",
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

  if (isLoading) {
    return (
      <main
      className="login-page tsb-portal-responsive tsb-admin-portal"
      data-tsb-admin-dynamic-language="true"
    >
        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
          }}
        >
          Vérification de l’accès
          administrateur...
        </div>
      </main>
    );
  }

  const scrollToAdminSection = (
    sectionId: string
  ) => {
    document
      .getElementById(
        sectionId
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const openAdminSection = (
    section: AdminSection,
    sectionId?: string
  ) => {
    setActiveSection(section);

    const defaultSectionTargets: Record<
      AdminSection,
      string | null
    > = {
      dashboard: null,
      clients: "admin-clients",
      quotes: "admin-devis",
      services: "admin-interventions",
      appointments: "admin-appointments",
      documents: "admin-documents",
      support: "admin-support",
      store: "admin-store",
      notifications: "admin-notifications",
    };

    const targetId =
      sectionId ??
      defaultSectionTargets[section];

    window.requestAnimationFrame(
      () => {
        window.requestAnimationFrame(
          () => {
            if (targetId) {
              scrollToAdminSection(
                targetId
              );
              return;
            }

            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }
        );
      }
    );
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openAdminDomainFolder = (
    domainKey: string,
    folderKey: string
  ) => {
    setActiveAdminFolderKey(
      folderKey
    );

    if (
      folderKey ===
      "requests"
    ) {
      setActiveQuoteDomainKey(
        domainKey
      );
      setActiveSection("quotes");

      window.requestAnimationFrame(
        () =>
          scrollToAdminSection(
            "admin-devis"
          )
      );

      return;
    }

    if (
      folderKey ===
      "interventions"
    ) {
      setActiveSection("services");

      window.requestAnimationFrame(
        () =>
          scrollToAdminSection(
            "admin-interventions"
          )
      );

      return;
    }

    setActiveSection("documents");

    setActiveDocumentDomainKey(
      domainKey
    );

    setDocumentSearchQuery("");
    setDocumentPage(1);

    if (
      folderKey ===
      "reports"
    ) {
      setDocumentCategoryFilter(
        "intervention"
      );
    } else if (
      folderKey ===
      "invoices"
    ) {
      setDocumentCategoryFilter(
        "invoice"
      );
    } else {
      setDocumentCategoryFilter(
        "all"
      );
    }

    window.requestAnimationFrame(
      () =>
        scrollToAdminSection(
          "admin-documents"
        )
    );
  };

  const domainFilteredQuotes =
    activeQuoteDomainKey
      ? quotes.filter(
          (quote) =>
            getServiceDomain(
              quote.service
            ).key ===
            activeQuoteDomainKey
        )
      : quotes;

  const normalizedQuoteSearch =
    quoteSearchQuery.trim().toLowerCase();

  const visibleQuotes = domainFilteredQuotes
    .filter((quote) =>
      quoteStatusFilter === "all"
        ? true
        : quote.status === quoteStatusFilter
    )
    .filter((quote) => {
      if (!normalizedQuoteSearch) {
        return true;
      }

      return [
        quote.name,
        quote.email,
        quote.phone,
        quote.company ?? "",
        quote.service,
        quote.message,
      ].some((value) =>
        value.toLowerCase().includes(normalizedQuoteSearch)
      );
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    );

  const getEffectiveQuoteStatus = (quote: QuoteRequest) =>
    quoteStatusDrafts[quote.id] ?? quote.status;

  const quoteStatusCounts = {
    all: domainFilteredQuotes.length,
    received: domainFilteredQuotes.filter(
      (quote) => getEffectiveQuoteStatus(quote) === "received"
    ).length,
    in_progress: domainFilteredQuotes.filter(
      (quote) => getEffectiveQuoteStatus(quote) === "in_progress"
    ).length,
    completed: domainFilteredQuotes.filter(
      (quote) => getEffectiveQuoteStatus(quote) === "completed"
    ).length,
    cancelled: domainFilteredQuotes.filter(
      (quote) => getEffectiveQuoteStatus(quote) === "cancelled"
    ).length,
  };

  const quoteTotalPages = Math.max(
    1,
    Math.ceil(visibleQuotes.length / QUOTES_PER_PAGE)
  );

  const safeQuotePage = Math.min(
    quotePage,
    quoteTotalPages
  );

  const paginatedQuotes = visibleQuotes.slice(
    (safeQuotePage - 1) * QUOTES_PER_PAGE,
    safeQuotePage * QUOTES_PER_PAGE
  );

  const selectedQuote =
    selectedQuoteId
      ? quotes.find((quote) => quote.id === selectedQuoteId) ?? null
      : null;

  const accountLinkedQuotes =
    quotes.filter(
      (
        quote
      ): quote is QuoteRequest & {
        user_id: string;
      } =>
        Boolean(
          quote.user_id
        )
    );

  const activeQuoteDomain =
    activeQuoteDomainKey
      ? TSB_DOMAINS.find(
          (domain) =>
            domain.key ===
            activeQuoteDomainKey
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

  const adminName =
    user?.user_metadata?.first_name ||
    "Administrateur";

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        !notification.is_read
    );

  const unreadNotificationsCount =
    unreadNotifications.length;

  const adminNavigationUnreadCounts: Partial<
    Record<AdminSection, number>
  > = {
    clients: unreadNotifications.filter(
      (notification) =>
        notification.type === "client" ||
        notification.entity_type ===
          "profile"
    ).length,

    quotes: unreadNotifications.filter(
      (notification) =>
        notification.type === "quote" ||
        (notification.entity_type ===
          "quote_request" &&
          notification.type !== "store")
    ).length,

    services: unreadNotifications.filter(
      (notification) =>
        notification.type === "service" ||
        notification.entity_type ===
          "client_service"
    ).length,

    appointments:
      unreadNotifications.filter(
        (notification) =>
          notification.type ===
            "appointment" ||
          notification.entity_type ===
            "client_appointment"
      ).length,

    documents: unreadNotifications.filter(
      (notification) =>
        notification.type === "document" ||
        notification.entity_type ===
          "client_document"
    ).length,

    support: unreadNotifications.filter(
      (notification) =>
        notification.type === "support" ||
        notification.entity_type ===
          "support_ticket"
    ).length,

    store: unreadNotifications.filter(
      (notification) =>
        notification.type === "store"
    ).length,

    notifications:
      unreadNotificationsCount,
  };

  const normalizedNotificationSearch =
    notificationSearchQuery
      .trim()
      .toLowerCase();

  const filteredNotifications =
    [...notifications]
      .filter((notification) => {
        if (
          notificationTypeFilter !== "all" &&
          notification.type !==
            notificationTypeFilter
        ) {
          return false;
        }

        if (!normalizedNotificationSearch) {
          return true;
        }

        const searchableText = [
          notification.title,
          notification.message,
          notification.type,
          notification.entity_type ?? "",
          getNotificationTypeLabel(
            notification.type
          ),
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          normalizedNotificationSearch
        );
      })
      .sort(
        (a, b) =>
          new Date(
            b.created_at
          ).getTime() -
          new Date(
            a.created_at
          ).getTime()
      );

  const notificationTypeCounts = {
    all: notifications.length,
    quote: notifications.filter(
      (notification) =>
        notification.type === "quote"
    ).length,
    service: notifications.filter(
      (notification) =>
        notification.type === "service"
    ).length,
    appointment: notifications.filter(
      (notification) =>
        notification.type === "appointment"
    ).length,
    document: notifications.filter(
      (notification) =>
        notification.type === "document"
    ).length,
    support: notifications.filter(
      (notification) =>
        notification.type === "support"
    ).length,
    system: notifications.filter(
      (notification) =>
        notification.type === "system"
    ).length,
  };

  const notificationTotalPages =
    Math.max(
      1,
      Math.ceil(
        filteredNotifications.length /
          NOTIFICATIONS_PER_PAGE
      )
    );

  const safeNotificationPage =
    Math.min(
      notificationPage,
      notificationTotalPages
    );

  const paginatedNotifications =
    filteredNotifications.slice(
      (safeNotificationPage - 1) *
        NOTIFICATIONS_PER_PAGE,
      safeNotificationPage *
        NOTIFICATIONS_PER_PAGE
    );

  const stats = [
    {
      label: tr("Clients", "Klanten", "Clients"),
      eyebrow: "CLIENTS",
      value: profiles.length,
      icon: Users,
      section: "clients" as AdminSection,
      targetId: "admin-clients",
    },
    {
      label: tr(
        "Devis & Demandes",
        "Offertes & Aanvragen",
        "Quotes & Requests"
      ),
      eyebrow: tr(
        "DEVIS & DEMANDES",
        "OFFERTES & AANVRAGEN",
        "QUOTES & REQUESTS"
      ),
      value: quotes.length,
      icon: FileText,
      section: "quotes" as AdminSection,
      targetId: "admin-devis",
    },
    {
      label: tr("Interventions", "Interventies", "Interventions"),
      eyebrow: tr(
        "INTERVENTIONS",
        "INTERVENTIES",
        "INTERVENTIONS"
      ),
      value: clientServices.length,
      icon: ShieldCheck,
      section: "services" as AdminSection,
      targetId: "admin-interventions",
    },
    {
      label: tr("Rendez-vous", "Afspraken", "Appointments"),
      eyebrow: tr(
        "RENDEZ-VOUS",
        "AFSPRAKEN",
        "APPOINTMENTS"
      ),
      value: appointments.length,
      icon: CalendarDays,
      section: "appointments" as AdminSection,
      targetId: "admin-appointments",
    },
    {
      label: tr("Documents clients", "Klantdocumenten", "Client documents"),
      eyebrow: tr(
        "DOCUMENTS",
        "DOCUMENTEN",
        "DOCUMENTS"
      ),
      value: documents.length,
      icon: FolderOpen,
      section: "documents" as AdminSection,
      targetId: "admin-documents",
    },
    {
      label: tr("Tickets support", "Supporttickets", "Support tickets"),
      eyebrow: tr(
        "SUPPORT",
        "SUPPORT",
        "SUPPORT"
      ),
      value: tickets.length,
      icon: Headphones,
      section: "support" as AdminSection,
      targetId: "admin-support",
    },
  ];

  const activeDomainFolders =
    TSB_DOMAINS.map(
      (domain) => {
        const quoteCount =
          quotes.filter(
            (quote) =>
              getServiceDomain(
                quote.service
              ).key ===
              domain.key
          ).length;

        const serviceCount =
          clientServices.filter(
            (clientService) =>
              getServiceDomain(
                clientService.service
              ).key ===
              domain.key
          ).length;

        const domainDocuments =
          documents.filter(
            (clientDocument) => {
              const linkedService =
                clientDocument.client_service_id
                  ? clientServiceById.get(
                      clientDocument.client_service_id
                    )
                  : null;

              return (
                linkedService
                  ? getServiceDomain(
                      linkedService.service
                    ).key ===
                    domain.key
                  : domain.key ===
                    "other"
              );
            }
          );

        const documentCount =
          domainDocuments.length;

        const reportCount =
          domainDocuments.filter(
            (clientDocument) =>
              clientDocument.document_type ===
              "intervention"
          ).length;

        const invoiceCount =
          domainDocuments.filter(
            (clientDocument) =>
              clientDocument.document_type ===
              "invoice"
          ).length;

        const total =
          quoteCount +
          serviceCount +
          documentCount;

        const targetId =
          quoteCount > 0
            ? "admin-devis"
            : serviceCount > 0
              ? "admin-interventions"
              : "admin-documents";

        return {
          domain,
          quoteCount,
          serviceCount,
          documentCount,
          reportCount,
          invoiceCount,
          total,
          targetId,
        };
      }
    ).filter(
      (item) =>
        item.total > 0
    );

  return (
    <main
      className="login-page tsb-portal-responsive tsb-admin-portal"
      data-tsb-admin-dynamic-language="true"
    >
      <div
        className="tsb-portal-shell"
        style={{
          width:
            "min(1280px, 100%)",
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
            alignItems: "center",
            gap: "24px",
            flexWrap: "wrap",
            marginBottom: "38px",
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
              aria-label={tr(
                "Changer la langue",
                "Taal wijzigen",
                "Change language"
              )}
              style={{
                display: "inline-flex",
                alignItems: "center",
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
                        setLocale(
                          item.code as LocaleCode
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
                }
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                openAdminSection(
                  "notifications",
                  "admin-notifications"
                )
              }
              aria-label={tr("Voir les notifications administrateur", "Administratiemeldingen bekijken", "View administrator notifications")}
              title={tr("Notifications", "Meldingen", "Notifications")}
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
              <Bell size={21} />

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
                TSB DIGITAL PLATFORM
              </span>

              <h1
                style={{
                  margin: "5px 0",
                  fontSize:
                    "clamp(1.8rem, 4vw, 2.7rem)",
                }}
              >
                {tr(
                  "Administration",
                  "Administratie",
                  "Administration"
                )}
              </h1>

              <p
                style={{
                  margin: 0,
                  color:
                    "rgba(255,255,255,0.65)",
                }}
              >
                {tr("Bonjour", "Hallo", "Hello")}{" "}
                {adminName}
              </p>
            </div>
          </div>
        </header>

        {/* INTRO */}

        <section
          className="login-card"
          style={{
            marginBottom: "22px",
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
                ADMIN-001
              </span>

              <h2>
                {tr(
                  "Centre de contrôle TSB",
                  "TSB-controlecentrum",
                  "TSB Control Center"
                )}
              </h2>

              <p className="login-card__intro">
                {tr(
                  "Gérez les demandes clients, l’assistance et les documents depuis un espace centralisé.",
                  "Beheer klantaanvragen, ondersteuning en documenten vanuit één centrale omgeving.",
                  "Manage client requests, support and documents from one central space."
                )}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "8px",
                  color: "#4ade80",
                  fontSize:
                    "0.85rem",
                  fontWeight: 700,
                }}
              >
                <ShieldCheck
                  size={18}
                />
                {tr(
                  "Accès administrateur vérifié",
                  "Beheerders­toegang geverifieerd",
                  "Administrator access verified"
                )}
              </div>
            </div>

            <button
              type="button"
              className="login-create"
              onClick={
                handleRefresh
              }
              disabled={
                isRefreshing
              }
              style={{
                width: "auto",
                padding: "0 18px",
                display:
                  "inline-flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                gap: "8px",
              }}
            >
              <RefreshCw
                size={17}
              />

              {isRefreshing
                ? tr(
                    "Actualisation...",
                    "Vernieuwen...",
                    "Refreshing..."
                  )
                : tr(
                    "Actualiser",
                    "Vernieuwen",
                    "Refresh"
                  )}
            </button>
          </div>
        </section>
        <div className="tsb-portal-nav-wrap">
          <AdminNavigation
            activeSection={activeSection}
            unreadCounts={
              adminNavigationUnreadCounts
            }
            onChange={(section) =>
              openAdminSection(section)
            }
          />
        </div>

        {/* ERREUR */}

        {errorMessage && (
          <section
            className="login-card"
            style={{
              marginBottom:
                "22px",
            }}
          >
            <p
              className="login-form-message"
              style={{
                margin: 0,
              }}
            >
              {errorMessage}
            </p>
          </section>
        )}

        {activeSection === "dashboard" && (
          <>
        {/* STATISTIQUES */}

        <section
          className="tsb-admin-stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(6, minmax(0, 1fr))",
            gap: "10px",
            overflowX: "auto",
          }}
        >
          {stats.map((stat) => {
            const Icon =
              stat.icon;

            return (
              <article
                className="login-card"
                key={stat.label}
                role="button"
                tabIndex={0}
                onClick={() =>
                  openAdminSection(
                    stat.section,
                    stat.targetId
                  )
                }
                onKeyDown={(
                  event
                ) => {
                  if (
                    event.key ===
                      "Enter" ||
                    event.key ===
                      " "
                  ) {
                    event.preventDefault();

                    openAdminSection(
                      stat.section,
                      stat.targetId
                    );
                  }
                }}
                title={`${at("open")} ${stat.label}`}
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
                    color:
                      "#1688ff",
                    marginBottom:
                      "9px",
                  }}
                />

                <span className="login-card__eyebrow">
                  {stat.eyebrow}
                </span>

                <h2
                  style={{
                    fontSize:
                      "1.55rem",
                    marginBottom:
                      "3px",
                  }}
                >
                  {stat.value}
                </h2>

                <p
                  className="login-card__intro"
                  style={{
                    marginBottom:
                      "6px",
                    fontSize: "0.72rem",
                  }}
                >
                  {stat.label}
                </p>

                <span
                  style={{
                    color:
                      "#53a7ff",
                    fontSize:
                      "0.76rem",
                    fontWeight:
                      800,
                  }}
                >
                  {tr(
                    "Cliquer pour ouvrir ↓",
                    "Klik om te openen ↓",
                    "Click to open ↓"
                  )}
                </span>
              </article>
            );
          })}
        </section>

        {/* DOSSIERS ACTIFS — COMPACT */}

        {activeDomainFolders.length >
          0 && (
          <section
            id="admin-domaines"
            style={{
              marginTop:
                "14px",
              padding:
                "10px 12px",
              border:
                "1px solid rgba(255,255,255,0.07)",
              borderRadius:
                "12px",
              background:
                "rgba(255,255,255,0.025)",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap: "8px",
                flexWrap:
                  "wrap",
              }}
            >
              <span
                style={{
                  marginRight:
                    "2px",
                  color:
                    "rgba(255,255,255,0.46)",
                  fontSize:
                    "0.67rem",
                  fontWeight:
                    900,
                  letterSpacing:
                    "0.08em",
                  whiteSpace:
                    "nowrap",
                }}
              >
                {tr(
                  "DOSSIERS ACTIFS",
                  "ACTIEVE DOSSIERS",
                  "ACTIVE FILES"
                )}
              </span>

              {activeDomainFolders.map(
                ({
                  domain,
                  quoteCount,
                  serviceCount,
                  documentCount,
                  reportCount,
                  invoiceCount,
                }) => (
                  <div
                    key={
                      domain.key
                    }
                    style={{
                      minHeight:
                        "32px",
                      padding:
                        "4px 6px",
                      display:
                        "inline-flex",
                      alignItems:
                        "center",
                      gap:
                        "5px",
                      borderRadius:
                        "9px",
                      border:
                        `1px solid ${domain.theme.border}`,
                      background:
                        "rgba(255,255,255,0.025)",
                      boxShadow:
                        `inset 3px 0 0 ${domain.theme.accent}`,
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    <FolderOpen
                      size={
                        14
                      }
                      strokeWidth={
                        1.8
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
                          "0.7rem",
                        fontWeight:
                          900,
                        marginRight:
                          "2px",
                      }}
                    >
                      {
                        domain.label
                      }
                    </strong>

                    {quoteCount >
                      0 && (
                      <button
                        type="button"
                        onClick={() =>
                          openAdminDomainFolder(
                            domain.key,
                            "requests"
                          )
                        }
                        title={`${domain.label} — ${tr("Devis & demandes", "Offertes & aanvragen", "Quotes & requests")}`}
                        style={{
                          minHeight:
                            "25px",
                          padding:
                            "0 7px",
                          borderRadius:
                            "7px",
                          border:
                            `1px solid ${domain.theme.border}`,
                          background:
                            domain.theme.background,
                          color:
                            "#ffffff",
                          cursor:
                            "pointer",
                          fontSize:
                            "0.63rem",
                          fontWeight:
                            850,
                        }}
                      >
                        {tr(
                          "Devis & demandes",
                          "Offertes & aanvragen",
                          "Quotes & requests"
                        )}{" "}
                        {
                          quoteCount
                        }
                      </button>
                    )}

                    {serviceCount >
                      0 && (
                      <button
                        type="button"
                        onClick={() =>
                          openAdminDomainFolder(
                            domain.key,
                            "interventions"
                          )
                        }
                        title={`${domain.label} — ${at("interventions")}`}
                        style={{
                          minHeight:
                            "25px",
                          padding:
                            "0 7px",
                          borderRadius:
                            "7px",
                          border:
                            `1px solid ${domain.theme.border}`,
                          background:
                            domain.theme.background,
                          color:
                            "#ffffff",
                          cursor:
                            "pointer",
                          fontSize:
                            "0.63rem",
                          fontWeight:
                            850,
                        }}
                      >
                        Interv.{" "}
                        {
                          serviceCount
                        }
                      </button>
                    )}

                    {documentCount >
                      0 && (
                      <button
                        type="button"
                        onClick={() =>
                          openAdminDomainFolder(
                            domain.key,
                            "documents"
                          )
                        }
                        title={`${domain.label} — ${at("documents")}`}
                        style={{
                          minHeight:
                            "25px",
                          padding:
                            "0 7px",
                          borderRadius:
                            "7px",
                          border:
                            `1px solid ${domain.theme.border}`,
                          background:
                            domain.theme.background,
                          color:
                            "#ffffff",
                          cursor:
                            "pointer",
                          fontSize:
                            "0.63rem",
                          fontWeight:
                            850,
                        }}
                      >
                        Doc{" "}
                        {
                          documentCount
                        }
                      </button>
                    )}

                    {reportCount >
                      0 && (
                      <button
                        type="button"
                        onClick={() =>
                          openAdminDomainFolder(
                            domain.key,
                            "reports"
                          )
                        }
                        title={`${domain.label} — ${at("reports")}`}
                        style={{
                          minHeight:
                            "25px",
                          padding:
                            "0 7px",
                          borderRadius:
                            "7px",
                          border:
                            `1px solid ${domain.theme.border}`,
                          background:
                            domain.theme.background,
                          color:
                            "#ffffff",
                          cursor:
                            "pointer",
                          fontSize:
                            "0.63rem",
                          fontWeight:
                            850,
                        }}
                      >
                        Rap.{" "}
                        {
                          reportCount
                        }
                      </button>
                    )}

                    {invoiceCount >
                      0 && (
                      <button
                        type="button"
                        onClick={() =>
                          openAdminDomainFolder(
                            domain.key,
                            "invoices"
                          )
                        }
                        title={`${domain.label} — ${at("invoices")}`}
                        style={{
                          minHeight:
                            "25px",
                          padding:
                            "0 7px",
                          borderRadius:
                            "7px",
                          border:
                            `1px solid ${domain.theme.border}`,
                          background:
                            domain.theme.background,
                          color:
                            "#ffffff",
                          cursor:
                            "pointer",
                          fontSize:
                            "0.63rem",
                          fontWeight:
                            850,
                        }}
                      >
                        Fact.{" "}
                        {
                          invoiceCount
                        }
                      </button>
                    )}
                  </div>
                )
              )}
            </div>
          </section>
        )}

          </>
        )}

        {activeSection === "notifications" && (
          <>
        {/* NOTIFICATIONS ADMIN */}

        <section
          id="admin-notifications"
          className="login-card"
          style={{
            marginTop: "22px",
            scrollMarginTop: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "18px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <span className="login-card__eyebrow">
                NOTIFICATIONS
              </span>

              <h2>
                Centre de notifications
              </h2>

              <p className="login-card__intro">
                Retrouvez les devis, interventions, rendez-vous, documents et tickets support au même endroit.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "999px",
                  border: "1px solid rgba(83,167,255,0.24)",
                  background: "rgba(22,136,255,0.08)",
                  color: "#8fc4ff",
                  fontSize: "0.74rem",
                  fontWeight: 850,
                }}
              >
                {filteredNotifications.length} {at("resultsUnit")}
              </span>

              {unreadNotificationsCount > 0 && (
                <button
                  type="button"
                  className="login-create"
                  onClick={() =>
                    void handleMarkAllNotificationsRead()
                  }
                  disabled={markingAllNotifications}
                  style={{
                    width: "auto",
                    minHeight: "42px",
                    padding: "0 16px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <CheckCheck size={17} />

                  {markingAllNotifications
                    ? "Mise à jour..."
                    : "Tout marquer comme lu"}
                </button>
              )}
            </div>
          </div>

          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.075)",
              background: "rgba(255,255,255,0.025)",
              display: "grid",
              gap: "14px",
            }}
          >
            <input
              type="search"
              value={notificationSearchQuery}
              onChange={(event) => {
                setNotificationSearchQuery(
                  event.target.value
                );
                setNotificationPage(1);
              }}
              placeholder={tr("Rechercher dans les notifications...", "Zoeken in meldingen...", "Search notifications...")}
              style={{
                width: "100%",
                minHeight: "44px",
                padding: "0 14px",
                borderRadius: "11px",
                border: "1px solid rgba(255,255,255,0.11)",
                background: "rgba(4,12,26,0.82)",
                color: "#ffffff",
                outline: "none",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {[
                ["all", "Tous", notificationTypeCounts.all],
                ["quote", "Devis", notificationTypeCounts.quote],
                ["service", "Interventions", notificationTypeCounts.service],
                ["appointment", "Rendez-vous", notificationTypeCounts.appointment],
                ["document", "Documents", notificationTypeCounts.document],
                ["support", "Support", notificationTypeCounts.support],
                ["system", "Système", notificationTypeCounts.system],
              ].map(([value, label, count]) => {
                const active =
                  notificationTypeFilter === value;

                return (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => {
                      setNotificationTypeFilter(
                        String(value)
                      );
                      setNotificationPage(1);
                    }}
                    style={{
                      minHeight: "36px",
                      padding: "0 11px",
                      borderRadius: "999px",
                      border: active
                        ? "1px solid rgba(83,167,255,0.42)"
                        : "1px solid rgba(255,255,255,0.09)",
                      background: active
                        ? "rgba(22,136,255,0.13)"
                        : "rgba(255,255,255,0.025)",
                      color: active
                        ? "#8fc4ff"
                        : "rgba(255,255,255,0.66)",
                      cursor: "pointer",
                      fontSize: "0.72rem",
                      fontWeight: 850,
                    }}
                  >
                    {String(label)} {Number(count)}
                  </button>
                );
              })}
            </div>

          </div>

          {notificationsLoading ? (
            <p className="login-card__intro">
              {tr("Chargement des notifications...", "Meldingen laden...", "Loading notifications...")}
            </p>
          ) : paginatedNotifications.length === 0 ? (
            <div
              style={{
                padding: "28px 0 10px",
                textAlign: "center",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <Bell
                size={34}
                strokeWidth={1.5}
                style={{ marginBottom: "10px" }}
              />

              <p style={{ margin: 0 }}>
                {tr("Aucune notification ne correspond aux filtres.", "Geen melding komt overeen met de filters.", "No notification matches the filters.")}
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                  marginTop: "22px",
                }}
              >
                {paginatedNotifications.map(
                  (notification) => (
                    <article
                      key={notification.id}
                      style={{
                        padding: "18px",
                        borderRadius: "14px",
                        border: notification.is_read
                          ? "1px solid rgba(255,255,255,0.08)"
                          : "1px solid rgba(22,136,255,0.35)",
                        background: notification.is_read
                          ? "rgba(255,255,255,0.03)"
                          : "rgba(22,136,255,0.075)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "14px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "12px",
                            flex: "1 1 320px",
                          }}
                        >
                          <div
                            style={{
                              width: "38px",
                              height: "38px",
                              flexShrink: 0,
                              borderRadius: "11px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "rgba(22,136,255,0.12)",
                              color: "#53a7ff",
                            }}
                          >
                            <Bell size={18} />
                          </div>

                          <div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                flexWrap: "wrap",
                              }}
                            >
                              <span className="login-card__eyebrow">
                                {getNotificationTypeLabel(
                                  notification.type
                                )}
                              </span>

                              {!notification.is_read && (
                                <span
                                  style={{
                                    padding: "4px 8px",
                                    borderRadius: "999px",
                                    background: "rgba(22,136,255,0.15)",
                                    color: "#53a7ff",
                                    fontSize: "0.66rem",
                                    fontWeight: 900,
                                  }}
                                >
                                  NOUVEAU
                                </span>
                              )}
                            </div>

                            <h3
                              style={{
                                margin: "7px 0 8px",
                                color: "#ffffff",
                              }}
                            >
                              {notification.title}
                            </h3>

                            <p
                              style={{
                                margin: "0 0 9px",
                                color: "rgba(255,255,255,0.68)",
                                lineHeight: 1.6,
                              }}
                            >
                              {notification.message}
                            </p>

                            <span
                              style={{
                                color: "rgba(255,255,255,0.4)",
                                fontSize: "0.74rem",
                              }}
                            >
                              {formatDate(
                                notification.created_at
                              )}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          {!notification.is_read && (
                            <button
                              type="button"
                              onClick={() =>
                                void markNotificationRead(
                                  notification
                                )
                              }
                              disabled={
                                notificationUpdatingId ===
                                notification.id
                              }
                              style={{
                                minHeight: "38px",
                                padding: "0 12px",
                                borderRadius: "9px",
                                border: "1px solid rgba(255,255,255,0.12)",
                                background: "rgba(255,255,255,0.04)",
                                color: "#ffffff",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "7px",
                                cursor: "pointer",
                              }}
                            >
                              <Check size={15} />
                              Lu
                            </button>
                          )}

                          {notification.entity_id &&
                            (
                              notification.entity_type === "quote_request" ||
                              notification.entity_type === "support_ticket" ||
                              notification.entity_type === "client_appointment" ||
                              notification.entity_type === "client_service" ||
                              notification.entity_type === "client_document" ||
                              notification.type === "service" ||
                              notification.type === "document"
                            ) && (
                            <button
                              type="button"
                              className="login-create"
                              onClick={() =>
                                void handleOpenNotification(
                                  notification
                                )
                              }
                              disabled={
                                notificationUpdatingId ===
                                notification.id
                              }
                              style={{
                                width: "auto",
                                minHeight: "38px",
                                padding: "0 13px",
                              }}
                            >
                              Ouvrir
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>

              {filteredNotifications.length >
                NOTIFICATIONS_PER_PAGE && (
                <div
                  style={{
                    marginTop: "18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    disabled={safeNotificationPage <= 1}
                    onClick={() =>
                      setNotificationPage((page) =>
                        Math.max(1, page - 1)
                      )
                    }
                    style={{
                      minHeight: "38px",
                      padding: "0 13px",
                      borderRadius: "9px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.035)",
                      color: "#ffffff",
                      cursor:
                        safeNotificationPage <= 1
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        safeNotificationPage <= 1
                          ? 0.45
                          : 1,
                    }}
                  >
                    {tr("← Précédent", "← Vorige", "← Previous")}
                  </button>

                  <span
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: "0.74rem",
                      fontWeight: 800,
                    }}
                  >
                    {at("pageWord")} {safeNotificationPage}/{notificationTotalPages}
                    {" • "}
                    {filteredNotifications.length} {at("notificationsUnit")}
                  </span>

                  <button
                    type="button"
                    disabled={
                      safeNotificationPage >=
                      notificationTotalPages
                    }
                    onClick={() =>
                      setNotificationPage((page) =>
                        Math.min(
                          notificationTotalPages,
                          page + 1
                        )
                      )
                    }
                    style={{
                      minHeight: "38px",
                      padding: "0 13px",
                      borderRadius: "9px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.035)",
                      color: "#ffffff",
                      cursor:
                        safeNotificationPage >=
                        notificationTotalPages
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        safeNotificationPage >=
                        notificationTotalPages
                          ? 0.45
                          : 1,
                    }}
                  >
                    {tr("Suivant →", "Volgende →", "Next →")}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

          </>
        )}

        {activeSection === "documents" && showDocumentUpload && (
          <>
        {/* AJOUTER DOCUMENT */}

        <section
          id="admin-ajouter-document"
          className="login-card"
          style={{
            marginTop: "22px",
            scrollMarginTop: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: "12px",
              marginBottom:
                "22px",
            }}
          >
            <Upload
              size={28}
              style={{
                color:
                  "#1688ff",
              }}
            />

            <div>
              <span className="login-card__eyebrow">
                DOCUMENT CLIENT
              </span>

              <h2
                style={{
                  margin: 0,
                }}
              >
                Ajouter un document
              </h2>
            </div>
          </div>

          <p className="login-card__intro">
            Sélectionnez le client, choisissez
            éventuellement l’intervention liée,
            puis ajoutez un devis, une facture,
            un rapport, un certificat ou un
            autre document PDF.
          </p>

          <form
            onSubmit={
              handleDocumentUpload
            }
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "18px",
              }}
            >
              <div className="login-field">
                <label htmlFor="admin-client">
                  Client *
                </label>

                <select
                  id="admin-client"
                  value={
                    selectedClientId
                  }
                  onChange={(
                    event
                  ) => {
                    setSelectedClientId(
                      event.target
                        .value
                    );

                    setSelectedClientServiceId(
                      ""
                    );

                    setErrorMessage(
                      ""
                    );

                    setDocumentSuccess(
                      ""
                    );
                  }}
                  disabled={
                    documentSending
                  }
                  style={{
                    width: "100%",
                    minHeight:
                      "48px",
                    padding:
                      "0 12px",
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
                  <option value="">
                    Choisir un client
                  </option>

                  {profiles.map(
                    (profile) => (
                      <option
                        key={
                          profile.id
                        }
                        value={
                          profile.id
                        }
                      >
                        {getClientLabel(
                          profile
                        )}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="login-field">
                <label htmlFor="admin-client-service">
                  Intervention liée
                </label>

                <select
                  id="admin-client-service"
                  value={
                    selectedClientServiceId
                  }
                  onChange={(
                    event
                  ) => {
                    setSelectedClientServiceId(
                      event.target.value
                    );

                    setErrorMessage(
                      ""
                    );

                    setDocumentSuccess(
                      ""
                    );
                  }}
                  disabled={
                    documentSending ||
                    !selectedClientId
                  }
                  style={{
                    width: "100%",
                    minHeight:
                      "48px",
                    padding:
                      "0 12px",
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
                  <option value="">
                    {selectedClientId
                      ? "Aucune intervention liée"
                      : "Choisissez d’abord un client"}
                  </option>

                  {selectedClientServices.map(
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
                        {getClientServiceLabel(
                          clientService
                        )}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="login-field">
                <label htmlFor="admin-document-type">
                  {tr(
                    "Type *",
                    "Type *",
                    "Type *"
                  )}
                </label>

                <select
                  id="admin-document-type"
                  value={
                    documentType
                  }
                  onChange={(
                    event
                  ) =>
                    setDocumentType(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    documentSending
                  }
                  style={{
                    width: "100%",
                    minHeight:
                      "48px",
                    padding:
                      "0 12px",
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
                  <option value="quote">
                    {tr(
                      "Devis & Demandes",
                      "Offertes & Aanvragen",
                      "Quotes & Requests"
                    )}
                  </option>

                  <option value="invoice">
                    {tr(
                      "Facture",
                      "Factuur",
                      "Invoice"
                    )}
                  </option>

                  <option value="intervention">
                    {tr(
                      "Intervention & rapport",
                      "Interventie & rapport",
                      "Intervention & report"
                    )}
                  </option>

                  <option value="diagnostic">
                    {tr(
                      "Diagnostic",
                      "Diagnose",
                      "Diagnostic"
                    )}
                  </option>

                  <option value="administrative">
                    {tr(
                      "Administratif",
                      "Administratief",
                      "Administrative"
                    )}
                  </option>

                  <option value="other">
                    {tr(
                      "Autre document",
                      "Ander document",
                      "Other document"
                    )}
                  </option>
                </select>
              </div>

              <div className="login-field">
                <label htmlFor="admin-document-title">
                  {tr(
                    "Titre *",
                    "Titel *",
                    "Title *"
                  )}
                </label>

                <input
                  id="admin-document-title"
                  type="text"
                  value={
                    documentTitle
                  }
                  onChange={(
                    event
                  ) => {
                    setDocumentTitle(
                      event.target
                        .value
                    );

                    setErrorMessage(
                      ""
                    );

                    setDocumentSuccess(
                      ""
                    );
                  }}
                  placeholder="Ex. Devis serrurerie automobile"
                  disabled={
                    documentSending
                  }
                />
              </div>

              <div className="login-field">
                <label htmlFor="admin-document-file">
                  Fichier PDF *
                </label>

                <input
                  id="admin-document-file"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(
                    event
                  ) => {
                    setDocumentFile(
                      event.target
                        .files?.[0] ??
                        null
                    );

                    setErrorMessage(
                      ""
                    );

                    setDocumentSuccess(
                      ""
                    );
                  }}
                  disabled={
                    documentSending
                  }
                />
              </div>
            </div>

            {documentSuccess && (
              <p
                style={{
                  color:
                    "#4ade80",
                  marginTop:
                    "16px",
                }}
              >
                {documentSuccess}
              </p>
            )}

            <button
              type="submit"
              className="login-create"
              disabled={
                documentSending
              }
              style={{
                width: "auto",
                minHeight:
                  "46px",
                marginTop:
                  "18px",
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
              <Upload size={18} />

              {documentSending
                ? "Envoi du document..."
                : "Ajouter au client"}
            </button>
          </form>
        </section>

          </>
        )}

        {activeSection === "quotes" && (
          <>
        {/* DEVIS */}

        <section
          id="admin-devis"
          className="login-card"
          style={{
            marginTop: "22px",
            scrollMarginTop: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "18px",
              flexWrap: "wrap",
              marginBottom: "22px",
            }}
          >
            <div>
              <span className="login-card__eyebrow">DEVIS</span>
              <h2 style={{ marginBottom: "8px" }}>
                {tr("Demandes clients", "Klantaanvragen", "Client requests")}
              </h2>
              <p className="login-card__intro" style={{ marginBottom: 0 }}>
                Recherchez, filtrez et traitez les demandes de devis dans un espace unique.
              </p>
            </div>

            <div
              style={{
                minWidth: "86px",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(22,136,255,0.28)",
                background: "rgba(22,136,255,0.08)",
                textAlign: "center",
              }}
            >
              <FileText size={22} style={{ color: "#53a7ff", marginBottom: "4px" }} />
              <strong style={{ display: "block", color: "#ffffff", fontSize: "1.35rem" }}>
                {domainFilteredQuotes.length}
              </strong>
            </div>
          </div>

          {guestQuoteReplySuccess && (
            <p
              style={{
                marginBottom:
                  "16px",
                padding:
                  "10px 12px",
                borderRadius:
                  "10px",
                border:
                  "1px solid rgba(34,197,94,0.24)",
                background:
                  "rgba(34,197,94,0.06)",
                color:
                  "#4ade80",
                fontSize:
                  "0.78rem",
                lineHeight:
                  1.5,
              }}
            >
              {
                guestQuoteReplySuccess
              }
            </p>
          )}

          {activeQuoteDomain && (
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "9px",
                flexWrap:
                  "wrap",
                marginBottom:
                  "16px",
              }}
            >
              <span
                style={{
                  padding:
                    "7px 10px",
                  borderRadius:
                    "999px",
                  border:
                    `1px solid ${activeQuoteDomain.theme.borderStrong}`,
                  background:
                    activeQuoteDomain.theme.badgeBackground,
                  color:
                    activeQuoteDomain.theme.accentStrong,
                  fontSize:
                    "0.7rem",
                  fontWeight:
                    900,
                }}
              >
                Dossier ouvert :{" "}
                {
                  activeQuoteDomain.label
                }{" "}
                / Demandes & devis
              </span>

              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setActiveQuoteDomainKey(
                    null
                  );
                  setActiveAdminFolderKey(
                    null
                  );
                }}
              >
                Voir tous les devis
              </button>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gap: "12px",
              marginBottom: "18px",
              padding: "16px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.025)",
            }}
          >
            <input
              type="search"
              value={quoteSearchQuery}
              onChange={(event) => {
                setQuoteSearchQuery(event.target.value);
                setQuotePage(1);
              }}
              placeholder={tr("Rechercher par client, email, téléphone ou service...", "Zoeken op klant, e-mail, telefoon of dienst...", "Search by client, email, phone or service...")}
              style={{
                width: "100%",
                minHeight: "42px",
                padding: "0 13px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.045)",
                color: "#ffffff",
                outline: "none",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {[
                ["all", "Tous", quoteStatusCounts.all],
                ["received", "À traiter", quoteStatusCounts.received],
                ["in_progress", "En traitement", quoteStatusCounts.in_progress],
                ["completed", "Finalisés", quoteStatusCounts.completed],
                ["cancelled", "Annulés", quoteStatusCounts.cancelled],
              ].map(([value, label, count]) => {
                const isActive = quoteStatusFilter === value;

                return (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => {
                      setQuoteStatusFilter(
                        value as
                          | "all"
                          | "received"
                          | "in_progress"
                          | "completed"
                          | "cancelled"
                      );
                      setQuotePage(1);
                    }}
                    style={{
                      minHeight: "34px",
                      padding: "0 11px",
                      borderRadius: "999px",
                      border: isActive
                        ? "1px solid rgba(22,136,255,0.5)"
                        : "1px solid rgba(255,255,255,0.1)",
                      background: isActive
                        ? "rgba(22,136,255,0.13)"
                        : "rgba(255,255,255,0.035)",
                      color: isActive
                        ? "#53a7ff"
                        : "rgba(255,255,255,0.68)",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {String(label)} ({Number(count)})
                  </button>
                );
              })}
            </div>
          </div>

          {visibleQuotes.length === 0 ? (
            <p className="login-card__intro">
              {tr("Aucun devis ou demande ne correspond à cette recherche.", "Geen offerte of aanvraag komt overeen met deze zoekopdracht.", "No quote or request matches this search.")}
            </p>
          ) : (
            <>
            <div
              style={{
                display: "grid",
                gap: "16px",
              }}
            >
              {paginatedQuotes.map((quote) => {
                const quoteTheme = getServiceTheme(quote.service);
                const matchingProfile =
                  profiles.find(
                    (profile) =>
                      Boolean(profile.email) &&
                      profile.email?.trim().toLowerCase() ===
                        quote.email.trim().toLowerCase()
                  ) ?? null;

                const accountState = quote.user_id
                  ? "linked"
                  : matchingProfile
                    ? "detected"
                    : "guest";

                return (
                  <article
                    id={`admin-quote-${quote.id}`}
                    key={quote.id}
                    style={{
                      scrollMarginTop: "30px",
                      padding: "14px 16px",
                      border: `1px solid ${quoteTheme.border}`,
                      borderRadius: "12px",
                      background: quoteTheme.background,
                      boxShadow: quoteTheme.glow,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "minmax(180px, 1.2fr) minmax(180px, 1.2fr) auto auto",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <span
                          className="login-card__eyebrow"
                          style={{ color: quoteTheme.accent }}
                        >
                          {quote.service}
                        </span>
                        <strong
                          style={{
                            display: "block",
                            marginTop: "5px",
                            color: "#ffffff",
                            fontSize: "0.9rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {quote.name}
                        </strong>
                      </div>

                      <div
                        style={{
                          minWidth: 0,
                          color: "rgba(255,255,255,0.58)",
                          fontSize: "0.72rem",
                          lineHeight: 1.45,
                        }}
                      >
                        <div
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {quote.email}
                        </div>
                        <div>{quote.phone}</div>
                      </div>

                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          minHeight: "26px",
                          padding: "0 8px",
                          borderRadius: "999px",
                          border:
                            accountState === "linked"
                              ? "1px solid rgba(34,197,94,0.36)"
                              : accountState === "detected"
                                ? "1px solid rgba(0,212,255,0.36)"
                                : "1px solid rgba(255,215,0,0.34)",
                          background:
                            accountState === "linked"
                              ? "rgba(34,197,94,0.09)"
                              : accountState === "detected"
                                ? "rgba(0,212,255,0.09)"
                                : "rgba(255,215,0,0.09)",
                          color:
                            accountState === "linked"
                              ? "#4ade80"
                              : accountState === "detected"
                                ? "#00D4FF"
                                : "#FFD700",
                          fontSize: "0.58rem",
                          fontWeight: 900,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {accountState === "linked"
                          ? "CLIENT TSB"
                          : accountState === "detected"
                            ? "COMPTE DÉTECTÉ"
                            : "VISITEUR"}
                      </span>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <select
                          value={quoteStatusDrafts[quote.id] ?? quote.status}
                          onChange={(event) =>
                            setQuoteStatusDrafts((previous) => ({
                              ...previous,
                              [quote.id]: event.target.value,
                            }))
                          }
                          disabled={quoteStatusUpdatingId === quote.id}
                          style={{
                            minHeight: "34px",
                            padding: "0 9px",
                            borderRadius: "9px",
                            border:
                              quoteStatusDrafts[quote.id] &&
                              quoteStatusDrafts[quote.id] !== quote.status
                                ? "1px solid rgba(251,191,36,0.5)"
                                : "1px solid rgba(255,255,255,0.12)",
                            background: "#0f1d2e",
                            color: "#ffffff",
                            fontSize: "0.7rem",
                          }}
                        >
                          <option value="received">{tr("À traiter", "Te behandelen", "To process")}</option>
                          <option value="in_progress">{tr("En traitement", "In behandeling", "In progress")}</option>
                          <option value="completed">{tr("Finalisé", "Afgerond", "Completed")}</option>
                          <option value="cancelled">{tr("Annulé", "Geannuleerd", "Cancelled")}</option>
                        </select>

                        <button
                          type="button"
                          onClick={() =>
                            void updateQuoteStatus(
                              quote.id,
                              quoteStatusDrafts[quote.id] ?? quote.status
                            )
                          }
                          disabled={
                            quoteStatusUpdatingId === quote.id ||
                            !quoteStatusDrafts[quote.id] ||
                            quoteStatusDrafts[quote.id] === quote.status
                          }
                          style={{
                            minHeight: "34px",
                            padding: "0 10px",
                            borderRadius: "9px",
                            border: "1px solid rgba(74,222,128,0.34)",
                            background:
                              quoteStatusDrafts[quote.id] &&
                              quoteStatusDrafts[quote.id] !== quote.status
                                ? "rgba(34,197,94,0.16)"
                                : "rgba(255,255,255,0.04)",
                            color:
                              quoteStatusDrafts[quote.id] &&
                              quoteStatusDrafts[quote.id] !== quote.status
                                ? "#4ade80"
                                : "rgba(255,255,255,0.34)",
                            fontSize: "0.68rem",
                            fontWeight: 900,
                          }}
                        >
                          {quoteStatusUpdatingId === quote.id
                            ? tr("Validation...", "Bevestigen...", "Validating...")
                            : tr("Valider", "Bevestigen", "Validate")}
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedQuoteId(quote.id)}
                          className="login-create"
                          style={{
                            width: "auto",
                            minHeight: "34px",
                            padding: "0 11px",
                            fontSize: "0.7rem",
                          }}
                        >
                          {tr(
                            "Ouvrir",
                            "Openen",
                            "Open"
                          )}
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "10px",
                        marginTop: "9px",
                        color: "rgba(255,255,255,0.38)",
                        fontSize: "0.66rem",
                      }}
                    >
                      <span>{formatDate(quote.created_at)}</span>
                      <span>{tr("Statut", "Status", "Status")} : {getQuoteStatusLabel(quote.status)}</span>
                    </div>
                  </article>
                );
              })}
            </div>

            {quoteTotalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginTop: "16px",
                }}
              >
                <span
                  style={{
                    color: "rgba(255,255,255,0.48)",
                    fontSize: "0.72rem",
                  }}
                >
                  {tr("Page", "Pagina", "Page")} {safeQuotePage} / {quoteTotalPages} · {visibleQuotes.length} {tr("devis & demandes", "offertes & aanvragen", "quotes & requests")}
                </span>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    disabled={safeQuotePage <= 1}
                    onClick={() =>
                      setQuotePage((page) => Math.max(1, page - 1))
                    }
                    className="text-link"
                    style={{
                      opacity: safeQuotePage <= 1 ? 0.4 : 1,
                    }}
                  >
                    {tr("← Précédent", "← Vorige", "← Previous")}
                  </button>

                  <button
                    type="button"
                    disabled={safeQuotePage >= quoteTotalPages}
                    onClick={() =>
                      setQuotePage((page) =>
                        Math.min(quoteTotalPages, page + 1)
                      )
                    }
                    className="text-link"
                    style={{
                      opacity:
                        safeQuotePage >= quoteTotalPages ? 0.4 : 1,
                    }}
                  >
                    {tr("Suivant →", "Volgende →", "Next →")}
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </section>

          </>
        )}

        {activeSection === "support" && (
          <>
        {/* SUPPORT */}

        <section
          id="admin-support"
          className="login-card"
          style={{
            marginTop: "22px",
            scrollMarginTop: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "18px",
              flexWrap: "wrap",
              marginBottom: "22px",
            }}
          >
            <div>
              <span className="login-card__eyebrow">SUPPORT</span>
              <h2 style={{ marginBottom: "8px" }}>
                {tr("Tickets assistance", "Supporttickets", "Support tickets")}
              </h2>
              <p className="login-card__intro" style={{ marginBottom: 0 }}>
                Recherchez, filtrez et suivez les demandes d’assistance dans un espace unique.
              </p>
            </div>

            <div
              style={{
                minWidth: "86px",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(22,136,255,0.28)",
                background: "rgba(22,136,255,0.08)",
                textAlign: "center",
              }}
            >
              <Headphones
                size={22}
                style={{ color: "#53a7ff", marginBottom: "4px" }}
              />
              <strong
                style={{
                  display: "block",
                  color: "#ffffff",
                  fontSize: "1.35rem",
                }}
              >
                {tickets.length}
              </strong>
            </div>
          </div>

          <div
            style={{
              padding: "16px",
              marginBottom: "18px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.025)",
            }}
          >
            <input
              type="search"
              value={supportSearchQuery}
              onChange={(event) => {
                setSupportSearchQuery(event.target.value);
                setSupportPage(1);
              }}
              placeholder={tr("Rechercher client, sujet, service, message...", "Zoeken op klant, onderwerp, dienst, bericht...", "Search client, subject, service, message...")}
              style={{
                width: "100%",
                minHeight: "44px",
                padding: "0 14px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "#0f1d2e",
                color: "#ffffff",
                outline: "none",
                marginBottom: "12px",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {([
                ["all", "Tous"],
                ["open", "Ouverts"],
                ["in_progress", "En cours"],
                ["resolved", "Résolus"],
                ["closed", "Fermés"],
              ] as const).map(([value, label]) => {
                const isActive = supportStatusFilter === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setSupportStatusFilter(value);
                      setSupportPage(1);
                    }}
                    style={{
                      minHeight: "34px",
                      padding: "0 12px",
                      borderRadius: "999px",
                      border: isActive
                        ? "1px solid rgba(83,167,255,0.55)"
                        : "1px solid rgba(255,255,255,0.10)",
                      background: isActive
                        ? "rgba(22,136,255,0.15)"
                        : "rgba(255,255,255,0.035)",
                      color: isActive
                        ? "#53a7ff"
                        : "rgba(255,255,255,0.66)",
                      cursor: "pointer",
                      fontWeight: 800,
                    }}
                  >
                    {label} ({supportStatusCounts[value]})
                  </button>
                );
              })}
            </div>

            <div
              style={{
                marginTop: "12px",
                color: "rgba(255,255,255,0.45)",
                fontSize: "0.76rem",
                fontWeight: 700,
              }}
            >
              {filteredSupportTickets.length} {at("resultsUnit")}
            </div>
          </div>

          {replySuccess && (
            <p
              style={{
                color: "#4ade80",
                marginBottom:
                  "18px",
              }}
            >
              {replySuccess}
            </p>
          )}

          {filteredSupportTickets.length === 0 ? (
            <p className="login-card__intro">
              Aucun ticket d’assistance
              pour le moment.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "16px",
              }}
            >
              {organizedSupportClients.map(
                (
                  clientGroup
                ) => (
                  <div
                    key={
                      clientGroup.clientId
                    }
                    style={{
                      display:
                        "grid",
                      gap: "10px",
                      padding:
                        "12px",
                      border:
                        "1px solid rgba(22,136,255,0.18)",
                      borderRadius:
                        "14px",
                      background:
                        "rgba(255,255,255,0.018)",
                      boxShadow:
                        "inset 3px 0 0 #1688ff",
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
                        gap: "10px",
                        flexWrap:
                          "wrap",
                        padding:
                          "7px 9px",
                        borderRadius:
                          "9px",
                        border:
                          "1px solid rgba(22,136,255,0.18)",
                        background:
                          "rgba(22,136,255,0.055)",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "8px",
                          minWidth:
                            0,
                        }}
                      >
                        <span
                          style={{
                            color:
                              "#53a7ff",
                            fontSize:
                              "0.62rem",
                            fontWeight:
                              900,
                            letterSpacing:
                              "0.08em",
                            flexShrink:
                              0,
                          }}
                        >
                          CLIENT
                        </span>

                        <strong
                          style={{
                            color:
                              "#ffffff",
                            fontSize:
                              "0.78rem",
                            fontWeight:
                              900,
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                          }}
                        >
                          {
                            clientGroup.clientLabel
                          }
                        </strong>
                      </div>

                      <span
                        style={{
                          color:
                            "rgba(255,255,255,0.45)",
                          fontSize:
                            "0.68rem",
                          fontWeight:
                            800,
                        }}
                      >
                        {
                          clientGroup.ticketCount
                        }{" "}
                        ticket(s)
                      </span>
                    </div>

                    {clientGroup.domains.map(
                      (
                        {
                          domain,
                          tickets:
                            domainTickets,
                        }
                      ) => (
                        <div
                          key={
                            `${clientGroup.clientId}-${domain.key}`
                          }
                          style={{
                            display:
                              "grid",
                            gap:
                              "8px",
                            marginLeft:
                              "10px",
                            paddingLeft:
                              "10px",
                            borderLeft:
                              `2px solid ${domain.theme.accent}`,
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap:
                                "8px",
                              padding:
                                "6px 8px",
                              borderRadius:
                                "8px",
                              border:
                                `1px solid ${domain.theme.border}`,
                              background:
                                "rgba(255,255,255,0.025)",
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
                                  "0.7rem",
                                fontWeight:
                                  900,
                              }}
                            >
                              {
                                domain.label
                              }
                            </strong>

                            <span
                              style={{
                                marginLeft:
                                  "auto",
                                color:
                                  "rgba(255,255,255,0.42)",
                                fontSize:
                                  "0.66rem",
                                fontWeight:
                                  800,
                              }}
                            >
                              {
                                domainTickets.length
                              }
                            </span>
                          </div>

                          {domainTickets.map(
                            (
                              ticket
                            ) => (
                  <article
                    id={`admin-ticket-${ticket.id}`}
                    key={
                      ticket.id
                    }
                    style={{
                      scrollMarginTop:
                        "30px",
                      padding:
                        "17px",
                      border:
                        "1px solid rgba(255,255,255,0.075)",
                      borderRadius:
                        "12px",
                      background:
                        "rgba(255,255,255,0.028)",
                      boxShadow:
                        `inset 2px 0 0 ${domain.theme.accent}`,
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
                        gap: "18px",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <div>
                        <span className="login-card__eyebrow">
                          TICKET
                        </span>

                        <h3
                          style={{
                            color:
                              "#fff",
                            margin:
                              "6px 0 10px",
                          }}
                        >
                          {
                            ticket.subject
                          }
                        </h3>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <select
                          value={
                            ticket.status
                          }
                          onChange={(
                            event
                          ) =>
                            updateTicketStatus(
                              ticket.id,
                              event.target
                                .value
                            )
                          }
                          style={{
                            minHeight:
                              "38px",
                            padding:
                              "0 11px",
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
                          <option value="open">
                            Ouvert
                          </option>

                          <option value="in_progress">
                            En cours
                          </option>

                          <option value="resolved">
                            Résolu
                          </option>

                          <option value="closed">
                            Fermé
                          </option>
                        </select>

                        <button
                          type="button"
                          onClick={() =>
                            setSupportExpandedTicketId(
                              (current) =>
                                current === ticket.id
                                  ? null
                                  : ticket.id
                            )
                          }
                          style={{
                            minHeight:
                              "38px",
                            padding:
                              "0 12px",
                            borderRadius:
                              "9px",
                            border:
                              "1px solid rgba(83,167,255,0.38)",
                            background:
                              supportExpandedTicketId ===
                              ticket.id
                                ? "rgba(83,167,255,0.14)"
                                : "rgba(22,136,255,0.08)",
                            color:
                              "#7fc0ff",
                            cursor:
                              "pointer",
                            fontWeight:
                              850,
                          }}
                        >
                          {supportExpandedTicketId ===
                          ticket.id
                            ? "Fermer"
                            : "Ouvrir"}
                        </button>
                      </div>
                    </div>

                    {supportExpandedTicketId ===
                      ticket.id && (
                      <div
                        style={{
                          marginTop:
                            "12px",
                          maxHeight:
                            "62vh",
                          overflowY:
                            "auto",
                          padding:
                            "2px 6px 4px 0",
                          scrollbarGutter:
                            "stable",
                        }}
                      >
                    <p
                      style={{
                        color:
                          "rgba(255,255,255,0.75)",
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

                    {ticket.admin_reply && (
                      <div
                        style={{
                          marginTop:
                            "14px",
                          padding:
                            "12px 13px",
                          borderRadius:
                            "11px",
                          border:
                            "1px solid rgba(22,136,255,0.22)",
                          background:
                            "rgba(22,136,255,0.06)",
                        }}
                      >
                        <span
                          style={{
                            color:
                              "#53a7ff",
                            fontSize:
                              "0.66rem",
                            fontWeight:
                              900,
                            letterSpacing:
                              "0.07em",
                          }}
                        >
                          RÉPONSE TSB PRÉCÉDENTE
                        </span>

                        <p
                          style={{
                            margin:
                              "7px 0 0",
                            color:
                              "rgba(255,255,255,0.82)",
                            lineHeight:
                              1.55,
                            whiteSpace:
                              "pre-wrap",
                          }}
                        >
                          {
                            ticket.admin_reply
                          }
                        </p>
                      </div>
                    )}

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
                                        ? 0
                                        : "28px",
                                    marginRight:
                                      isClient
                                        ? "28px"
                                        : 0,
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

                    <div
                      style={{
                        marginTop:
                          "18px",
                        paddingTop:
                          "18px",
                        borderTop:
                          "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <span className="login-card__eyebrow">
                        CONTINUER LA CONVERSATION
                      </span>

                      <textarea
                        rows={5}
                        value={
                          replyDrafts[
                            ticket.id
                          ] ??
                          ""
                        }
                        onChange={(
                          event
                        ) => {
                          setReplyDrafts(
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

                          setErrorMessage(
                            ""
                          );

                          setReplySuccess(
                            ""
                          );
                        }}
                        placeholder="Répondre dans cette conversation..."
                        disabled={
                          replySendingId ===
                          ticket.id
                        }
                        style={{
                          width: "100%",
                          minHeight:
                            "120px",
                          marginTop:
                            "10px",
                          padding:
                            "13px",
                          borderRadius:
                            "10px",
                          border:
                            "1px solid rgba(255,255,255,0.12)",
                          background:
                            "#0f1d2e",
                          color:
                            "#ffffff",
                          resize:
                            "vertical",
                          font:
                            "inherit",
                        }}
                      />

                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "center",
                          gap: "12px",
                          flexWrap:
                            "wrap",
                          marginTop:
                            "12px",
                        }}
                      >
                        <div
                          style={{
                            color:
                              "rgba(255,255,255,0.4)",
                            fontSize:
                              "0.76rem",
                          }}
                        >
                          {supportMessages.filter(
                            (
                              supportMessage
                            ) =>
                              supportMessage.ticket_id ===
                              ticket.id
                          ).length} {at("conversationMessageCount")}
                        </div>

                        <button
                          type="button"
                          className="login-create"
                          onClick={() =>
                            handleTicketReply(
                              ticket
                            )
                          }
                          disabled={
                            replySendingId ===
                            ticket.id
                          }
                          style={{
                            width:
                              "auto",
                            minHeight:
                              "42px",
                            padding:
                              "0 18px",
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            gap: "8px",
                          }}
                        >
                          <Send
                            size={16}
                          />

                          {replySendingId ===
                          ticket.id
                            ? "Envoi..."
                            : "Envoyer"}
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        gap: "12px",
                        flexWrap:
                          "wrap",
                        color:
                          "rgba(255,255,255,0.4)",
                        fontSize:
                          "0.78rem",
                        marginTop:
                          "18px",
                      }}
                    >
                      <span>
                        {formatDate(
                          ticket.created_at
                        )}
                      </span>

                      <span>
                        Statut :{" "}
                        {getSupportStatusLabel(
                          ticket.status
                        )}
                      </span>
                    </div>
                      </div>
                    )}
                  </article>
                            )
                          )}
                        </div>
                      )
                    )}
                  </div>
                )
              )}
            </div>
          )}


          {filteredSupportTickets.length > SUPPORT_PER_PAGE && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginTop: "18px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: "0.76rem",
                  fontWeight: 700,
                }}
              >
                {at("pageWord")} {safeSupportPage} / {supportTotalPages} • {filteredSupportTickets.length} {at("ticketsUnit")}
              </span>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  disabled={safeSupportPage <= 1}
                  onClick={() =>
                    setSupportPage((page) => Math.max(1, page - 1))
                  }
                  className="text-link"
                  style={{ opacity: safeSupportPage <= 1 ? 0.4 : 1 }}
                >
                  {tr("← Précédent", "← Vorige", "← Previous")}
                </button>

                <button
                  type="button"
                  disabled={safeSupportPage >= supportTotalPages}
                  onClick={() =>
                    setSupportPage((page) =>
                      Math.min(supportTotalPages, page + 1)
                    )
                  }
                  className="text-link"
                  style={{
                    opacity:
                      safeSupportPage >= supportTotalPages ? 0.4 : 1,
                  }}
                >
                  {tr("Suivant →", "Volgende →", "Next →")}
                </button>
              </div>
            </div>
          )}
        </section>

          </>
        )}

        {activeSection === "documents" && (
          <>
        {/* DOCUMENTS */}

        <section
          id="admin-documents"
          className="login-card"
          style={{
            marginTop: "22px",
            scrollMarginTop: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "18px",
              flexWrap: "wrap",
              marginBottom: "22px",
            }}
          >
            <div>
              <span className="login-card__eyebrow">DOCUMENTS</span>
              <h2 style={{ marginBottom: "8px" }}>
                {tr("Documents clients", "Klantdocumenten", "Client documents")}
              </h2>
              <p className="login-card__intro" style={{ marginBottom: 0 }}>
                Suivez les documents actifs et les archives clients dans un espace unique.
              </p>
            </div>

            <button
              type="button"
              className="login-create"
              onClick={() => {
                setShowDocumentUpload(true);
                window.setTimeout(() => {
                  document
                    .getElementById("admin-ajouter-document")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 50);
              }}
              style={{
                width: "auto",
                minHeight: "44px",
                padding: "0 16px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Upload size={17} />
              Ajouter un document
            </button>

            <div
              style={{
                minWidth: "86px",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(22,136,255,0.28)",
                background: "rgba(22,136,255,0.08)",
                textAlign: "center",
              }}
            >
              <FolderOpen size={22} style={{ color: "#53a7ff", marginBottom: "4px" }} />
              <strong style={{ display: "block", color: "#ffffff", fontSize: "1.35rem" }}>
                {documents.length}
              </strong>
            </div>
          </div>

          {activeDocumentDomain && (
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "9px",
                flexWrap:
                  "wrap",
                marginBottom:
                  "16px",
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
                    "0.7rem",
                  fontWeight:
                    900,
                }}
              >
                Dossier ouvert :{" "}
                {
                  activeDocumentDomain.label
                }{" "}
                /{" "}
                {activeAdminFolderKey ===
                "reports"
                  ? "Rapports"
                  : activeAdminFolderKey ===
                    "invoices"
                    ? "Factures"
                    : "Documents"}
              </span>

              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setActiveDocumentDomainKey(
                    null
                  );
                  setActiveAdminFolderKey(
                    null
                  );
                  setDocumentCategoryFilter(
                    "all"
                  );
                  setDocumentLifecycleFilter(
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
                Voir tous les documents
              </button>
            </div>
          )}

          {documents.length ===
          0 ? (
            <p className="login-card__intro">
              Aucun document client
              enregistré pour le moment.
            </p>
          ) : (
            <>
              <div
                style={{
                  marginBottom: "16px",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.025)",
                }}
              >
                <span
                  className="login-card__eyebrow"
                  style={{ display: "block", marginBottom: "10px" }}
                >
                  {tr(
                    "DOCUMENTS / ARCHIVES",
                    "DOCUMENTEN / ARCHIEVEN",
                    "DOCUMENTS / ARCHIVES"
                  )}
                </span>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    ["active", "Documents actifs", documentLifecycleCounts.active, "#53a7ff"],
                    ["archived", "Archives", documentLifecycleCounts.archived, "#4ade80"],
                    ["unlinked", "Sans intervention liée", documentLifecycleCounts.unlinked, "#fbbf24"],
                    ["all", "Tous", documentLifecycleCounts.all, "rgba(255,255,255,0.68)"],
                  ].map(([value, label, count, color]) => {
                    const isActive =
                      documentLifecycleFilter === value;

                    return (
                      <button
                        key={String(value)}
                        type="button"
                        onClick={() => {
                          setDocumentLifecycleFilter(
                            value as
                              | "all"
                              | "active"
                              | "archived"
                              | "unlinked"
                          );
                          setDocumentPage(1);
                        }}
                        style={{
                          minHeight: "36px",
                          padding: "0 11px",
                          borderRadius: "999px",
                          border: `1px solid ${
                            isActive
                              ? String(color)
                              : "rgba(255,255,255,0.12)"
                          }`,
                          background: isActive
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(255,255,255,0.025)",
                          color: isActive
                            ? String(color)
                            : "rgba(255,255,255,0.66)",
                          fontSize: "0.74rem",
                          fontWeight: 850,
                          cursor: "pointer",
                        }}
                      >
                        {String(label)} ({Number(count)})
                      </button>
                    );
                  })}
                </div>

                <p
                  style={{
                    margin: "10px 0 0",
                    color: "rgba(255,255,255,0.48)",
                    fontSize: "0.72rem",
                    lineHeight: 1.45,
                  }}
                >
                  {tr(
                    "« Archives » regroupe les documents rattachés à une intervention terminée ou annulée. Les documents sans intervention restent dans leur catégorie dédiée.",
                    "‘Archieven’ groepeert documenten die gekoppeld zijn aan een voltooide of geannuleerde interventie. Documenten zonder interventie blijven in hun eigen categorie.",
                    "“Archives” groups documents linked to a completed or cancelled intervention. Documents without an intervention remain in their dedicated category."
                  )}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginBottom: "16px",
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
                          setActiveDocumentDomainKey(
                            null
                          );
                          setActiveAdminFolderKey(
                            null
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
                        {
                          category.label
                        }{" "}
                        <span
                          style={{
                            opacity:
                              0.72,
                          }}
                        >
                          {
                            documentCategoryCounts[
                              category
                                .value
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "18px",
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
                  placeholder={tr("Rechercher par titre, client, catégorie ou intervention...", "Zoeken op titel, klant, categorie of interventie...", "Search by title, client, category or intervention...")}
                  aria-label="Rechercher dans les documents clients"
                  style={{
                    flex:
                      "1 1 320px",
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

                <span
                  style={{
                    color:
                      "rgba(255,255,255,0.5)",
                    fontSize:
                      "0.8rem",
                  }}
                >
                  {filteredDocuments.length} {at("documentsUnit")}
                </span>
              </div>

              {filteredDocuments.length ===
              0 ? (
                <div
                  style={{
                    padding:
                      "28px 18px",
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
                  Aucun document ne
                  correspond à cette
                  catégorie ou à cette
                  recherche.
                </div>
              ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(230px, 1fr))",
                  gap: "14px",
                }}
              >
              {visibleDocuments.map(
                (
                  clientDocument
                ) => {
                  const isEditing =
                    editingDocumentId ===
                    clientDocument.id;

                  const documentClientServices =
                    clientServices.filter(
                      (
                        clientService
                      ) =>
                        clientService.user_id ===
                        clientDocument.user_id
                    );

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
                      id={`admin-document-${clientDocument.id}`}
                      key={
                        clientDocument.id
                      }
                      style={{
                        scrollMarginTop:
                          "30px",
                        padding:
                          "20px",
                        border:
                          documentTheme
                            ? `1px solid ${documentTheme.border}`
                            : "1px solid rgba(255,255,255,0.08)",
                        borderRadius:
                          "14px",
                        background:
                          documentTheme
                            ? documentTheme.background
                            : "rgba(255,255,255,0.035)",
                        boxShadow:
                          documentTheme
                            ? documentTheme.glow
                            : "none",
                      }}
                    >
                      {isEditing ? (
                        <>
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
                                "18px",
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap:
                                  "8px",
                              }}
                            >
                              <Pencil
                                size={
                                  18
                                }
                                style={{
                                  color:
                                    "#1688ff",
                                }}
                              />

                              <strong
                                style={{
                                  color:
                                    "#ffffff",
                                }}
                              >
                                Modifier le
                                document
                              </strong>
                            </div>

                            <button
                              type="button"
                              onClick={
                                cancelDocumentEdit
                              }
                              disabled={
                                documentUpdatingId ===
                                  clientDocument.id ||
                                documentDeletingId ===
                                  clientDocument.id
                              }
                              style={{
                                border:
                                  "none",
                                background:
                                  "transparent",
                                color:
                                  "rgba(255,255,255,0.65)",
                                cursor:
                                  "pointer",
                                padding:
                                  "5px",
                              }}
                              aria-label="Annuler la modification"
                            >
                              <X
                                size={
                                  19
                                }
                              />
                            </button>
                          </div>

                          <div
                            style={{
                              display:
                                "grid",
                              gap:
                                "14px",
                            }}
                          >
                            <div className="login-field">
                              <label
                                htmlFor={`document-title-${clientDocument.id}`}
                              >
                                Titre *
                              </label>

                              <input
                                id={`document-title-${clientDocument.id}`}
                                type="text"
                                value={
                                  editDocumentTitle
                                }
                                onChange={(
                                  event
                                ) =>
                                  setEditDocumentTitle(
                                    event.target.value
                                  )
                                }
                                disabled={
                                  documentUpdatingId ===
                                  clientDocument.id
                                }
                              />
                            </div>

                            <div className="login-field">
                              <label
                                htmlFor={`document-type-${clientDocument.id}`}
                              >
                                Type *
                              </label>

                              <select
                                id={`document-type-${clientDocument.id}`}
                                value={
                                  editDocumentType
                                }
                                onChange={(
                                  event
                                ) =>
                                  setEditDocumentType(
                                    event.target.value
                                  )
                                }
                                disabled={
                                  documentUpdatingId ===
                                  clientDocument.id
                                }
                                style={{
                                  width:
                                    "100%",
                                  minHeight:
                                    "48px",
                                  padding:
                                    "0 12px",
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
                                <option value="quote">
                                  Devis
                                </option>

                                <option value="invoice">
                                  Facture
                                </option>

                                <option value="intervention">
                                  Intervention & rapport
                                </option>

                                <option value="diagnostic">
                                  Diagnostic
                                </option>

                                <option value="administrative">
                                  Administratif
                                </option>

                                <option value="other">
                                  Autre document
                                </option>
                              </select>
                            </div>

                            <div className="login-field">
                              <label
                                htmlFor={`document-service-${clientDocument.id}`}
                              >
                                Intervention liée
                              </label>

                              <select
                                id={`document-service-${clientDocument.id}`}
                                value={
                                  editDocumentServiceId
                                }
                                onChange={(
                                  event
                                ) =>
                                  setEditDocumentServiceId(
                                    event.target.value
                                  )
                                }
                                disabled={
                                  documentUpdatingId ===
                                  clientDocument.id
                                }
                                style={{
                                  width:
                                    "100%",
                                  minHeight:
                                    "48px",
                                  padding:
                                    "0 12px",
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
                                <option value="">
                                  Aucune intervention liée
                                </option>

                                {documentClientServices.map(
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
                                      {getClientServiceLabel(
                                        clientService
                                      )}
                                    </option>
                                  )
                                )}
                              </select>
                            </div>
                          </div>

                          <div
                            style={{
                              display:
                                "flex",
                              gap:
                                "10px",
                              flexWrap:
                                "wrap",
                              marginTop:
                                "18px",
                            }}
                          >
                            <button
                              type="button"
                              className="login-create"
                              onClick={() =>
                                void handleDocumentUpdate(
                                  clientDocument
                                )
                              }
                              disabled={
                                documentUpdatingId ===
                                clientDocument.id
                              }
                              style={{
                                width:
                                  "auto",
                                minHeight:
                                  "42px",
                                padding:
                                  "0 16px",
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                gap:
                                  "8px",
                              }}
                            >
                              <Save
                                size={
                                  16
                                }
                              />

                              {documentUpdatingId ===
                              clientDocument.id
                                ? "Enregistrement..."
                                : "Enregistrer"}
                            </button>

                            <button
                              type="button"
                              onClick={
                                cancelDocumentEdit
                              }
                              disabled={
                                documentUpdatingId ===
                                clientDocument.id
                              }
                              style={{
                                minHeight:
                                  "42px",
                                padding:
                                  "0 16px",
                                borderRadius:
                                  "10px",
                                border:
                                  "1px solid rgba(255,255,255,0.12)",
                                background:
                                  "transparent",
                                color:
                                  "#ffffff",
                                cursor:
                                  "pointer",
                              }}
                            >
                              Annuler
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "flex-start",
                              justifyContent:
                                "space-between",
                              gap:
                                "12px",
                            }}
                          >
                            <FolderOpen
                              size={
                                24
                              }
                              style={{
                                color:
                                  "#1688ff",
                                marginBottom:
                                  "12px",
                              }}
                            />

                            <div
                              style={{
                                display:
                                  "flex",
                                gap:
                                  "7px",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  startDocumentEdit(
                                    clientDocument
                                  )
                                }
                                disabled={
                                  documentDeletingId ===
                                  clientDocument.id
                                }
                                style={{
                                  width:
                                    "36px",
                                  height:
                                    "36px",
                                  display:
                                    "inline-flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  borderRadius:
                                    "9px",
                                  border:
                                    "1px solid rgba(255,255,255,0.12)",
                                  background:
                                    "rgba(255,255,255,0.04)",
                                  color:
                                    "#ffffff",
                                  cursor:
                                    "pointer",
                                }}
                                aria-label="Modifier le document"
                                title="Modifier"
                              >
                                <Pencil
                                  size={
                                    16
                                  }
                                />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void handleDocumentDelete(
                                    clientDocument
                                  )
                                }
                                disabled={
                                  documentDeletingId ===
                                  clientDocument.id
                                }
                                style={{
                                  width:
                                    "36px",
                                  height:
                                    "36px",
                                  display:
                                    "inline-flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  borderRadius:
                                    "9px",
                                  border:
                                    "1px solid rgba(248,113,113,0.28)",
                                  background:
                                    "rgba(248,113,113,0.06)",
                                  color:
                                    "#f87171",
                                  cursor:
                                    "pointer",
                                }}
                                aria-label="Supprimer le document"
                                title="Supprimer"
                              >
                                <Trash2
                                  size={
                                    16
                                  }
                                />
                              </button>
                            </div>
                          </div>

                          <span className="login-card__eyebrow">
                            {getDocumentTypeLabel(
                              clientDocument.document_type
                            )}
                          </span>

                          <h3
                            style={{
                              color:
                                "#ffffff",
                              margin:
                                "7px 0 10px",
                            }}
                          >
                            {
                              clientDocument.title
                            }
                          </h3>

                          <p
                            style={{
                              margin:
                                "0 0 10px",
                              color:
                                "rgba(255,255,255,0.62)",
                              fontSize:
                                "0.79rem",
                              lineHeight:
                                1.45,
                            }}
                          >
                            Client :{" "}
                            {profileById.has(
                              clientDocument.user_id
                            )
                              ? getClientLabel(
                                  profileById.get(
                                    clientDocument.user_id
                                  ) as Profile
                                )
                              : "Client TSB"}
                          </p>

                          {clientDocument.client_service_id && (
                            <div
                              style={{
                                marginBottom:
                                  "10px",
                                padding:
                                  "10px 12px",
                                borderRadius:
                                  "10px",
                                border:
                                  documentTheme
                                    ? `1px solid ${documentTheme.border}`
                                    : "1px solid rgba(22,136,255,0.22)",
                                background:
                                  documentTheme
                                    ? documentTheme.background
                                    : "rgba(22,136,255,0.07)",
                                color:
                                  documentTheme
                                    ? documentTheme.accent
                                    : "#53a7ff",
                                fontSize:
                                  "0.78rem",
                                lineHeight:
                                  1.5,
                              }}
                            >
                              Intervention :{" "}
                              {linkedService
                                ? getClientServiceLabel(
                                    linkedService
                                  )
                                : "Intervention liée"}
                            </div>
                          )}

                          <p
                            style={{
                              color:
                                "rgba(255,255,255,0.45)",
                              fontSize:
                                "0.78rem",
                              margin:
                                "0 0 14px",
                            }}
                          >
                            {formatDate(
                              clientDocument.created_at
                            )}
                          </p>

                          {documentDeletingId ===
                            clientDocument.id && (
                            <p
                              style={{
                                margin:
                                  "8px 0 0",
                                color:
                                  "#fca5a5",
                                fontSize:
                                  "0.78rem",
                              }}
                            >
                              Suppression...
                            </p>
                          )}
                        </>
                      )}
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
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    gap: "12px",
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
                    {tr("← Précédent", "← Vorige", "← Previous")}
                  </button>

                  <span
                    style={{
                      color:
                        "rgba(255,255,255,0.62)",
                      fontSize:
                        "0.82rem",
                    }}
                  >
                    {at("pageWord")} {safeDocumentPage} / {totalDocumentPages}
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
                    {tr("Suivant →", "Volgende →", "Next →")}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

          </>
        )}

        {/* RENDEZ-VOUS */}

        {activeSection === "appointments" && (
          <section
            id="admin-appointments"
            className="login-card"
            style={{
              marginTop: "22px",
              scrollMarginTop: "30px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "18px",
                flexWrap: "wrap",
                marginBottom: "22px",
              }}
            >
              <div>
                <span className="login-card__eyebrow">
                  {tr(
                    "RENDEZ-VOUS",
                    "AFSPRAKEN",
                    "APPOINTMENTS"
                  )}
                </span>

                <h2
                  style={{
                    marginBottom: "8px",
                  }}
                >
                  {tr(
                    "Planning clients",
                    "Klantenplanning",
                    "Client schedule"
                  )}
                </h2>

                <p
                  className="login-card__intro"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  {tr(
                    "Planifiez et suivez les rendez-vous clients dans un espace unique.",
                    "Plan en volg klantafspraken vanuit één centrale omgeving.",
                    "Schedule and track client appointments in one place."
                  )}
                </p>
              </div>

              {!editingAppointmentId && (
                <button
                  type="button"
                  className="login-create"
                  onClick={() => {
                    setShowAppointmentForm((current) => !current);
                    setAppointmentSuccess("");
                    setErrorMessage("");
                  }}
                  style={{
                    width: "auto",
                    minHeight: "44px",
                    padding: "0 16px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <CalendarDays size={17} />
                  {showAppointmentForm
                    ? tr("Fermer", "Sluiten", "Close")
                    : tr(
                        "Nouveau rendez-vous",
                        "Nieuwe afspraak",
                        "New appointment"
                      )}
                </button>
              )}

              <div
                style={{
                  minWidth: "86px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(22,136,255,0.28)",
                  background: "rgba(22,136,255,0.08)",
                  textAlign: "center",
                }}
              >
                <CalendarDays
                  size={22}
                  style={{
                    color: "#53a7ff",
                    marginBottom: "4px",
                  }}
                />

                <strong
                  style={{
                    display: "block",
                    color: "#ffffff",
                    fontSize: "1.35rem",
                  }}
                >
                  {appointments.length}
                </strong>
              </div>
            </div>

            {appointmentSuccess && (
              <p
                style={{
                  margin: "0 0 18px",
                  color: "#4ade80",
                  fontWeight: 700,
                }}
              >
                {appointmentSuccess}
              </p>
            )}

            {(showAppointmentForm || Boolean(editingAppointmentId)) && (
            <form id="admin-appointment-form"
              onSubmit={
                handleAppointmentCreate
              }
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
                padding: "18px",
                marginBottom: "22px",
                borderRadius: "14px",
                border:
                  "1px solid rgba(255,255,255,0.08)",
                background:
                  "rgba(255,255,255,0.025)",
              }}
            >
              <label
                style={{
                  display: "grid",
                  gap: "7px",
                }}
              >
                <span
                  style={{
                    color:
                      "rgba(255,255,255,0.7)",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                  }}
                >
                  Client
                </span>

                <select
                  value={
                    appointmentClientId
                  }
                  onChange={(event) => {
                    setAppointmentClientId(
                      event.target.value
                    );
                    setAppointmentServiceId(
                      ""
                    );
                  }}
                  required
                  disabled={Boolean(editingAppointmentId)}
                  style={{
                    minHeight: "44px",
                    padding: "0 12px",
                    borderRadius: "10px",
                    border:
                      "1px solid rgba(255,255,255,0.12)",
                    background: "#0f1d2e",
                    color: "#ffffff",
                  }}
                >
                  <option value="">
                    Sélectionner un client
                  </option>

                  {profiles.map(
                    (profile) => (
                      <option
                        key={
                          profile.id
                        }
                        value={
                          profile.id
                        }
                      >
                        {getClientLabel(
                          profile
                        )}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label
                style={{
                  display: "grid",
                  gap: "7px",
                }}
              >
                <span
                  style={{
                    color:
                      "rgba(255,255,255,0.7)",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                  }}
                >
                  Intervention liée
                </span>

                <select
                  value={
                    appointmentServiceId
                  }
                  onChange={(event) =>
                    setAppointmentServiceId(
                      event.target.value
                    )
                  }
                  disabled={
                    !appointmentClientId
                  }
                  style={{
                    minHeight: "44px",
                    padding: "0 12px",
                    borderRadius: "10px",
                    border:
                      "1px solid rgba(255,255,255,0.12)",
                    background: "#0f1d2e",
                    color: "#ffffff",
                  }}
                >
                  <option value="">
                    Aucune
                  </option>

                  {appointmentClientServices.map(
                    (clientService) => (
                      <option
                        key={
                          clientService.id
                        }
                        value={
                          clientService.id
                        }
                      >
                        {getClientServiceLabel(
                          clientService
                        )}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label
                style={{
                  display: "grid",
                  gap: "7px",
                }}
              >
                <span
                  style={{
                    color:
                      "rgba(255,255,255,0.7)",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                  }}
                >
                  Titre
                </span>

                <input
                  value={
                    appointmentTitle
                  }
                  onChange={(event) =>
                    setAppointmentTitle(
                      event.target.value
                    )
                  }
                  placeholder="Ex. Diagnostic véhicule"
                  required
                  style={{
                    minHeight: "44px",
                    padding: "0 12px",
                    borderRadius: "10px",
                    border:
                      "1px solid rgba(255,255,255,0.12)",
                    background: "#0f1d2e",
                    color: "#ffffff",
                  }}
                />
              </label>

              <label
                style={{
                  display: "grid",
                  gap: "7px",
                }}
              >
                <span
                  style={{
                    color:
                      "rgba(255,255,255,0.7)",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                  }}
                >
                  Date et heure
                </span>

                <input
                  type="datetime-local"
                  value={
                    appointmentScheduledAt
                  }
                  onChange={(event) =>
                    setAppointmentScheduledAt(
                      event.target.value
                    )
                  }
                  required
                  style={{
                    minHeight: "44px",
                    padding: "0 12px",
                    borderRadius: "10px",
                    border:
                      "1px solid rgba(255,255,255,0.12)",
                    background: "#0f1d2e",
                    color: "#ffffff",
                    colorScheme: "dark",
                  }}
                />
              </label>

              <label
                style={{
                  display: "grid",
                  gap: "7px",
                }}
              >
                <span
                  style={{
                    color:
                      "rgba(255,255,255,0.7)",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                  }}
                >
                  Lieu
                </span>

                <input
                  value={
                    appointmentLocation
                  }
                  onChange={(event) =>
                    setAppointmentLocation(
                      event.target.value
                    )
                  }
                  placeholder="Atelier, adresse client..."
                  style={{
                    minHeight: "44px",
                    padding: "0 12px",
                    borderRadius: "10px",
                    border:
                      "1px solid rgba(255,255,255,0.12)",
                    background: "#0f1d2e",
                    color: "#ffffff",
                  }}
                />
              </label>

              <label
                style={{
                  display: "grid",
                  gap: "7px",
                }}
              >
                <span
                  style={{
                    color:
                      "rgba(255,255,255,0.7)",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                  }}
                >
                  Statut
                </span>

                <select
                  value={
                    appointmentStatus
                  }
                  onChange={(event) =>
                    setAppointmentStatus(
                      event.target.value
                    )
                  }
                  style={{
                    minHeight: "44px",
                    padding: "0 12px",
                    borderRadius: "10px",
                    border:
                      "1px solid rgba(255,255,255,0.12)",
                    background: "#0f1d2e",
                    color: "#ffffff",
                  }}
                >
                  <option value="requested">
                    À confirmer
                  </option>
                  <option value="scheduled">
                    Planifié
                  </option>
                  <option value="confirmed">
                    Confirmé
                  </option>
                  <option value="completed">
                    Terminé
                  </option>
                  <option value="cancelled">
                    Annulé
                  </option>
                </select>
              </label>

              <label
                style={{
                  display: "grid",
                  gap: "7px",
                  gridColumn: "1 / -1",
                }}
              >
                <span
                  style={{
                    color:
                      "rgba(255,255,255,0.7)",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                  }}
                >
                  Description
                </span>

                <textarea
                  value={
                    appointmentDescription
                  }
                  onChange={(event) =>
                    setAppointmentDescription(
                      event.target.value
                    )
                  }
                  placeholder="Informations utiles pour le rendez-vous..."
                  rows={4}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border:
                      "1px solid rgba(255,255,255,0.12)",
                    background: "#0f1d2e",
                    color: "#ffffff",
                    resize: "vertical",
                  }}
                />
              </label>

              <div
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="submit"
                  className="login-create"
                  disabled={appointmentSending}
                  style={{
                    width: "auto",
                    minHeight: "44px",
                    padding: "0 18px",
                    justifySelf: "start",
                  }}
                >
                  {appointmentSending
                    ? editingAppointmentId
                      ? "Modification..."
                      : "Ajout..."
                    : editingAppointmentId
                      ? "Enregistrer la nouvelle date"
                      : "Ajouter le rendez-vous"}
                </button>

                {editingAppointmentId && (
                  <button
                    type="button"
                    className="button button--secondary"
                    onClick={() => {
                      setEditingAppointmentId(null);
                      setShowAppointmentForm(false);
                      setAppointmentClientId("");
                      setAppointmentServiceId("");
                      setAppointmentTitle("");
                      setAppointmentDescription("");
                      setAppointmentScheduledAt("");
                      setAppointmentStatus("scheduled");
                      setAppointmentLocation("");
                      setAppointmentSuccess("");
                    }}
                    disabled={appointmentSending}
                    style={{
                      width: "auto",
                      minHeight: "44px",
                      padding: "0 18px",
                    }}
                  >
                    Annuler la modification
                  </button>
                )}
              </div>
            </form>
            )}

            {appointments.length > 0 && (
              <div
                style={{
                  marginBottom: "18px",
                  padding: "14px",
                  borderRadius: "12px",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  background:
                    "rgba(255,255,255,0.025)",
                }}
              >
                <div
                  style={{
                    marginBottom: "10px",
                    color:
                      "rgba(255,255,255,0.62)",
                    fontSize: "0.76rem",
                    fontWeight: 850,
                  }}
                >
                  FILTRER LES RÉPONSES CLIENTS
                </div>

                <div
                  style={{
                    marginBottom: "13px",
                  }}
                >
                  <span
                    className="login-card__eyebrow"
                    style={{ display: "block", marginBottom: "9px" }}
                  >
                    SUIVI DU RENDEZ-VOUS
                  </span>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    {[
                      {
                        key: "all" as const,
                        label: "Tous",
                        count: appointmentLifecycleCounts.all,
                        color: "#53a7ff",
                      },
                      {
                        key: "upcoming" as const,
                        label: "À venir",
                        count: appointmentLifecycleCounts.upcoming,
                        color: "#fbbf24",
                      },
                      {
                        key: "completed" as const,
                        label: "Terminés",
                        count: appointmentLifecycleCounts.completed,
                        color: "#4ade80",
                      },
                      {
                        key: "cancelled" as const,
                        label: "Annulés",
                        count: appointmentLifecycleCounts.cancelled,
                        color: "#f87171",
                      },
                    ].map((filter) => {
                      const isActive =
                        appointmentLifecycleFilter === filter.key;

                      return (
                        <button
                          key={filter.key}
                          type="button"
                          onClick={() => {
                            setAppointmentLifecycleFilter(filter.key);
                            setAppointmentPage(1);
                          }}
                          style={{
                            minHeight: "38px",
                            padding: "0 12px",
                            borderRadius: "999px",
                            border: `1px solid ${
                              isActive
                                ? filter.color
                                : "rgba(255,255,255,0.12)"
                            }`,
                            background: isActive
                              ? "rgba(255,255,255,0.08)"
                              : "rgba(255,255,255,0.025)",
                            color: isActive
                              ? filter.color
                              : "rgba(255,255,255,0.66)",
                            fontSize: "0.76rem",
                            fontWeight: 850,
                            cursor: "pointer",
                          }}
                        >
                          {filter.label} ({filter.count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                <span
                  className="login-card__eyebrow"
                  style={{ display: "block", marginBottom: "9px" }}
                >
                  RÉPONSE CLIENT
                </span>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    {
                      key: "all" as const,
                      label: "Toutes",
                      count:
                        appointmentResponseCounts.all,
                      color: "#53a7ff",
                    },
                    {
                      key: "pending" as const,
                      label: "En attente",
                      count:
                        appointmentResponseCounts.pending,
                      color:
                        "rgba(255,255,255,0.72)",
                    },
                    {
                      key: "accepted" as const,
                      label: "Acceptés",
                      count:
                        appointmentResponseCounts.accepted,
                      color: "#4ade80",
                    },
                    {
                      key: "declined" as const,
                      label: "Refusés",
                      count:
                        appointmentResponseCounts.declined,
                      color: "#f87171",
                    },
                    {
                      key: "reschedule_requested" as const,
                      label: "Modification demandée",
                      count:
                        appointmentResponseCounts.reschedule_requested,
                      color: "#fbbf24",
                    },
                  ].map((filter) => {
                    const isActive =
                      appointmentResponseFilter ===
                      filter.key;

                    return (
                      <button
                        key={filter.key}
                        type="button"
                        onClick={() => {
                          setAppointmentResponseFilter(
                            filter.key
                          );
                          setAppointmentPage(1);
                        }}
                        style={{
                          minHeight: "38px",
                          padding: "0 12px",
                          borderRadius: "999px",
                          border: `1px solid ${
                            isActive
                              ? filter.color
                              : "rgba(255,255,255,0.12)"
                          }`,
                          background: isActive
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(255,255,255,0.025)",
                          color: isActive
                            ? filter.color
                            : "rgba(255,255,255,0.66)",
                          fontSize: "0.76rem",
                          fontWeight: 850,
                          cursor: "pointer",
                        }}
                      >
                        {filter.label} ({filter.count})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {appointments.length ===
            0 ? (
              <p
                className="login-card__intro"
                style={{
                  marginBottom: 0,
                }}
              >
                {tr("Aucun rendez-vous enregistré.", "Geen afspraken geregistreerd.", "No appointments recorded.")}
              </p>
            ) : filteredAppointments.length ===
              0 ? (
              <p
                className="login-card__intro"
                style={{
                  marginBottom: 0,
                }}
              >
                {tr("Aucun rendez-vous dans cette catégorie.", "Geen afspraken in deze categorie.", "No appointments in this category.")}
              </p>
            ) : (
              <>
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                {paginatedAppointments.map(
                  (appointment) => {
                    const profile =
                      profileById.get(
                        appointment.user_id
                      );

                    const linkedService =
                      appointment.client_service_id
                        ? clientServiceById.get(
                            appointment.client_service_id
                          )
                        : null;

                    return (
                      <article
                        key={
                          appointment.id
                        }
                        id={`admin-appointment-${appointment.id}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "minmax(0, 1fr) auto",
                          gap: "16px",
                          alignItems: "center",
                          padding: "16px",
                          borderRadius: "13px",
                          border:
                            "1px solid rgba(255,255,255,0.08)",
                          background:
                            "rgba(255,255,255,0.025)",
                        }}
                      >
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
                              marginBottom: "7px",
                            }}
                          >
                            <CalendarDays
                              size={17}
                              style={{
                                color: "#53a7ff",
                              }}
                            />

                            <strong
                              style={{
                                color: "#ffffff",
                              }}
                            >
                              {appointment.title}
                            </strong>

                            <span
                              style={{
                                padding: "4px 8px",
                                borderRadius: "999px",
                                ...getAppointmentStatusStyle(
                                  appointment.status
                                ),
                                fontSize: "0.7rem",
                                fontWeight: 850,
                              }}
                            >
                              {getAppointmentStatusLabel(
                                appointment.status
                              )}
                            </span>
                          </div>

                          <p
                            style={{
                              margin: "0 0 5px",
                              color:
                                "rgba(255,255,255,0.72)",
                              fontSize: "0.85rem",
                            }}
                          >
                            {profile
                              ? getClientLabel(
                                  profile
                                )
                              : appointment.user_id}
                          </p>

                          <p
                            style={{
                              margin: 0,
                              color:
                                "rgba(255,255,255,0.56)",
                              fontSize: "0.78rem",
                              lineHeight: 1.55,
                            }}
                          >
                            {formatDate(
                              appointment.scheduled_at
                            )}
                            {appointment.location
                              ? ` · ${appointment.location}`
                              : ""}
                            {linkedService
                              ? ` · ${linkedService.title}`
                              : ""}
                          </p>

                          {appointment.description && (
                            <p
                              style={{
                                margin: "8px 0 0",
                                color:
                                  "rgba(255,255,255,0.7)",
                                fontSize: "0.8rem",
                                lineHeight: 1.5,
                              }}
                            >
                              {appointment.description}
                            </p>
                          )}

                          {(() => {
                            const responseDisplay =
                              getAppointmentResponseDisplay(
                                appointment.client_response
                              );

                            return (
                              <div
                                style={{
                                  marginTop: "12px",
                                  padding: "11px 12px",
                                  borderRadius: "10px",
                                  border: `1px solid ${responseDisplay.border}`,
                                  background: responseDisplay.background,
                                }}
                              >
                                <strong
                                  style={{
                                    display: "block",
                                    color: responseDisplay.color,
                                    fontSize: "0.76rem",
                                    fontWeight: 900,
                                  }}
                                >
                                  Réponse client : {responseDisplay.label}
                                </strong>

                                {appointment.client_response_message && (
                                  <p
                                    style={{
                                      margin: "7px 0 0",
                                      color: "rgba(255,255,255,0.78)",
                                      fontSize: "0.8rem",
                                      lineHeight: 1.5,
                                    }}
                                  >
                                    {appointment.client_response ===
                                    "reschedule_requested"
                                      ? `${at("proposedDatePrefix")} `
                                      : `${at("clientMessagePrefix")} `}
                                    {appointment.client_response_message}
                                  </p>
                                )}

                                {appointment.client_responded_at && (
                                  <p
                                    style={{
                                      margin: "5px 0 0",
                                      color: "rgba(255,255,255,0.48)",
                                      fontSize: "0.72rem",
                                    }}
                                  >
                                    {at("responseReceivedOn")} {formatDate(
                                      appointment.client_responded_at
                                    )}
                                  </p>
                                )}

                                {appointment.client_response === "accepted" &&
                                  appointment.status !== "confirmed" &&
                                  appointment.status !== "completed" && (
                                    <p
                                      style={{
                                        margin: "7px 0 0",
                                        color: "#4ade80",
                                        fontSize: "0.76rem",
                                        fontWeight: 800,
                                      }}
                                    >
                                      Client d’accord — vous pouvez passer le statut à Confirmé.
                                    </p>
                                  )}
                              </div>
                            );
                          })()}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                            flexWrap: "wrap",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              void updateAppointmentStatus(
                                appointment,
                                "confirmed"
                              )
                            }
                            disabled={appointmentUpdatingId === appointment.id}
                            title="Accepter et confirmer le rendez-vous"
                            style={{
                              minHeight: "38px",
                              padding: "0 12px",
                              borderRadius: "9px",
                              border: "1px solid rgba(74,222,128,0.34)",
                              background: "rgba(34,197,94,0.16)",
                              color: "#4ade80",
                              fontWeight: 850,
                              cursor: "pointer",
                            }}
                          >
                            ✓ Accepter
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void updateAppointmentStatus(
                                appointment,
                                "cancelled"
                              )
                            }
                            disabled={appointmentUpdatingId === appointment.id}
                            title="Refuser / annuler le rendez-vous"
                            style={{
                              minHeight: "38px",
                              padding: "0 12px",
                              borderRadius: "9px",
                              border: "1px solid rgba(248,113,113,0.34)",
                              background: "rgba(248,113,113,0.12)",
                              color: "#f87171",
                              fontWeight: 850,
                              cursor: "pointer",
                            }}
                          >
                            ✕ Annuler
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              proposeAnotherAppointmentDate(appointment)
                            }
                            title="Proposer une autre date"
                            style={{
                              minHeight: "38px",
                              padding: "0 12px",
                              borderRadius: "9px",
                              border: "1px solid rgba(192,132,252,0.34)",
                              background: "rgba(168,85,247,0.13)",
                              color: "#c084fc",
                              fontWeight: 850,
                              cursor: "pointer",
                            }}
                          >
                            📅 Modifier
                          </button>

                          <select
                            value={
                              appointmentStatusDrafts[appointment.id] ??
                              appointment.status
                            }
                            onChange={(event) =>
                              setAppointmentStatusDrafts((previous) => ({
                                ...previous,
                                [appointment.id]: event.target.value,
                              }))
                            }
                            disabled={
                              appointmentUpdatingId === appointment.id
                            }
                            style={{
                              minHeight: "38px",
                              padding: "0 10px",
                              borderRadius: "9px",
                              border:
                                appointmentStatusDrafts[appointment.id] &&
                                appointmentStatusDrafts[appointment.id] !==
                                  appointment.status
                                  ? "1px solid rgba(251,191,36,0.5)"
                                  : "1px solid rgba(255,255,255,0.12)",
                              background: "#0f1d2e",
                              color: "#ffffff",
                            }}
                          >
                            <option value="requested">
                              À confirmer
                            </option>
                            <option value="scheduled">
                              Planifié
                            </option>
                            <option value="confirmed">
                              Confirmé
                            </option>
                            <option value="completed">
                              Terminé
                            </option>
                            <option value="cancelled">
                              Annulé
                            </option>
                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              void updateAppointmentStatus(
                                appointment,
                                appointmentStatusDrafts[appointment.id] ??
                                  appointment.status
                              )
                            }
                            disabled={
                              appointmentUpdatingId === appointment.id ||
                              !appointmentStatusDrafts[appointment.id] ||
                              appointmentStatusDrafts[appointment.id] ===
                                appointment.status
                            }
                            style={{
                              minHeight: "38px",
                              padding: "0 12px",
                              borderRadius: "9px",
                              border: "1px solid rgba(74,222,128,0.34)",
                              background:
                                appointmentStatusDrafts[appointment.id] &&
                                appointmentStatusDrafts[appointment.id] !==
                                  appointment.status
                                  ? "rgba(34,197,94,0.16)"
                                  : "rgba(255,255,255,0.04)",
                              color:
                                appointmentStatusDrafts[appointment.id] &&
                                appointmentStatusDrafts[appointment.id] !==
                                  appointment.status
                                  ? "#4ade80"
                                  : "rgba(255,255,255,0.34)",
                              fontWeight: 900,
                            }}
                          >
                            {appointmentUpdatingId === appointment.id
                              ? "Validation..."
                              : "Valider"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void deleteAppointment(
                                appointment
                              )
                            }
                            disabled={
                              appointmentDeletingId ===
                              appointment.id
                            }
                            aria-label="Supprimer le rendez-vous"
                            title="Supprimer"
                            style={{
                              width: "38px",
                              height: "38px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "9px",
                              border:
                                "1px solid rgba(248,113,113,0.28)",
                              background:
                                "rgba(248,113,113,0.08)",
                              color: "#f87171",
                              cursor:
                                appointmentDeletingId ===
                                appointment.id
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>

              {totalAppointmentPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginTop: "16px",
                    paddingTop: "14px",
                    borderTop:
                      "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setAppointmentPage(
                        Math.max(
                          1,
                          safeAppointmentPage - 1
                        )
                      )
                    }
                    disabled={
                      safeAppointmentPage <= 1
                    }
                    style={{
                      minHeight: "38px",
                      padding: "0 12px",
                      borderRadius: "9px",
                      border:
                        "1px solid rgba(255,255,255,0.12)",
                      background:
                        "rgba(255,255,255,0.04)",
                      color:
                        safeAppointmentPage <= 1
                          ? "rgba(255,255,255,0.28)"
                          : "#ffffff",
                      cursor:
                        safeAppointmentPage <= 1
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {tr("← Précédent", "← Vorige", "← Previous")}
                  </button>

                  <span
                    style={{
                      color:
                        "rgba(255,255,255,0.62)",
                      fontSize: "0.78rem",
                      fontWeight: 800,
                    }}
                  >
                    {at("pageWord")} {safeAppointmentPage} / {totalAppointmentPages} · {filteredAppointments.length} {at("appointmentsUnit")}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setAppointmentPage(
                        Math.min(
                          totalAppointmentPages,
                          safeAppointmentPage + 1
                        )
                      )
                    }
                    disabled={
                      safeAppointmentPage >=
                      totalAppointmentPages
                    }
                    style={{
                      minHeight: "38px",
                      padding: "0 12px",
                      borderRadius: "9px",
                      border:
                        "1px solid rgba(255,255,255,0.12)",
                      background:
                        "rgba(255,255,255,0.04)",
                      color:
                        safeAppointmentPage >=
                        totalAppointmentPages
                          ? "rgba(255,255,255,0.28)"
                          : "#ffffff",
                      cursor:
                        safeAppointmentPage >=
                        totalAppointmentPages
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {tr("Suivant →", "Volgende →", "Next →")}
                  </button>
                </div>
              )}
              </>
            )}
          </section>
        )}

        {/* GESTION CLIENTS */}

        {activeSection === "services" && (
          <div
            id="admin-interventions"
            style={{
              scrollMarginTop: "30px",
            }}
          >
            <ServicesPanel
              profiles={profiles}
              quotes={
                accountLinkedQuotes
              }
              onStatusUpdated={(serviceId, status) =>
                setClientServices((previous) =>
                  previous.map((clientService) =>
                    clientService.id === serviceId
                      ? { ...clientService, status }
                      : clientService
                  )
                )
              }
            />
          </div>
        )}

        {activeSection === "store" && (
          <StoreProductsPanel />
        )}

        {activeSection === "clients" && (
          <div
            id="admin-clients"
            style={{
              scrollMarginTop: "30px",
            }}
          >
            <ClientsPanel
              profiles={profiles}
              quotes={
                accountLinkedQuotes
              }
              services={clientServices}
              documents={documents}
              tickets={tickets}
            />
          </div>
        )}

        {/* FOOTER */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginTop: "26px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: "8px",
              color:
                "rgba(255,255,255,0.45)",
              fontSize:
                "0.8rem",
            }}
          >
            <LayoutDashboard
              size={17}
            />
            TSB Administration
          </div>

          <button
            type="button"
            onClick={
              handleLogout
            }
            className="login-create"
            style={{
              width: "auto",
              padding: "0 22px",
              display:
                "inline-flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              gap: "9px",
            }}
          >
            <LogOut size={18} />
            {tr(
              "Se déconnecter",
              "Afmelden",
              "Sign out"
            )}
          </button>
        </div>
      </div>

      {selectedQuote &&
        typeof document !== "undefined" &&
        createPortal(
          (() => {
            const quote = selectedQuote;
            const quoteTheme = getServiceTheme(quote.service);
            const matchingProfile =
              profiles.find(
                (profile) =>
                  Boolean(profile.email) &&
                  profile.email?.trim().toLowerCase() ===
                    quote.email.trim().toLowerCase()
              ) ?? null;
            const accountState = quote.user_id
              ? "linked"
              : matchingProfile
                ? "detected"
                : "guest";

            return (
              <div
                className="tsb-portal-dialog-backdrop"
                role="dialog"
                aria-modal="true"
                aria-label={`${tr("Devis ou demande de", "Offerte of aanvraag van", "Quote or request from")} ${quote.name}`}
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) {
                    setSelectedQuoteId(null);
                  }
                }}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 100000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "20px",
                  background: "rgba(2,8,18,0.78)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div
                  style={{
                    width: "min(820px, 96vw)",
                    maxHeight: "88vh",
                    overflowY: "auto",
                    padding: "18px",
                    borderRadius: "16px",
                    border: `1px solid ${quoteTheme.border}`,
                    background: "#091523",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.58)",
                    color: "#ffffff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                      marginBottom: "14px",
                    }}
                  >
                    <div>
                      <span
                        className="login-card__eyebrow"
                        style={{ color: quoteTheme.accent }}
                      >
                        {quote.service}
                      </span>
                      <h2 style={{ margin: "6px 0 0" }}>{quote.name}</h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedQuoteId(null)}
                      aria-label={tr(
                        "Fermer le devis ou la demande",
                        "Offerte of aanvraag sluiten",
                        "Close quote or request"
                      )}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.05)",
                        color: "#ffffff",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <X size={17} />
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: "10px",
                      padding: "12px",
                      borderRadius: "11px",
                      background: "rgba(255,255,255,0.035)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      fontSize: "0.76rem",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    <div><strong>Email :</strong> {quote.email}</div>
                    <div><strong>Téléphone :</strong> {quote.phone}</div>
                    {quote.company && (
                      <div><strong>Société :</strong> {quote.company}</div>
                    )}
                    <div><strong>Date :</strong> {formatDate(quote.created_at)}</div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                      marginTop: "12px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        minHeight: "28px",
                        padding: "0 9px",
                        borderRadius: "999px",
                        border:
                          accountState === "linked"
                            ? "1px solid rgba(34,197,94,0.36)"
                            : accountState === "detected"
                              ? "1px solid rgba(0,212,255,0.36)"
                              : "1px solid rgba(255,215,0,0.34)",
                        background:
                          accountState === "linked"
                            ? "rgba(34,197,94,0.09)"
                            : accountState === "detected"
                              ? "rgba(0,212,255,0.09)"
                              : "rgba(255,215,0,0.09)",
                        color:
                          accountState === "linked"
                            ? "#4ade80"
                            : accountState === "detected"
                              ? "#00D4FF"
                              : "#FFD700",
                        fontSize: "0.62rem",
                        fontWeight: 900,
                      }}
                    >
                      {accountState === "linked"
                        ? "CLIENT TSB LIÉ"
                        : accountState === "detected"
                          ? "COMPTE DÉTECTÉ · LIAISON EN ATTENTE"
                          : "VISITEUR SANS COMPTE"}
                    </span>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <select
                        value={quoteStatusDrafts[quote.id] ?? quote.status}
                        onChange={(event) =>
                          setQuoteStatusDrafts((previous) => ({
                            ...previous,
                            [quote.id]: event.target.value,
                          }))
                        }
                        disabled={quoteStatusUpdatingId === quote.id}
                        style={{
                          minHeight: "36px",
                          padding: "0 10px",
                          borderRadius: "9px",
                          border:
                            quoteStatusDrafts[quote.id] &&
                            quoteStatusDrafts[quote.id] !== quote.status
                              ? "1px solid rgba(251,191,36,0.5)"
                              : "1px solid rgba(255,255,255,0.12)",
                          background: "#0f1d2e",
                          color: "#ffffff",
                        }}
                      >
                        <option value="received">{tr("À traiter", "Te behandelen", "To process")}</option>
                        <option value="in_progress">{tr("En traitement", "In behandeling", "In progress")}</option>
                        <option value="completed">{tr("Finalisé", "Afgerond", "Completed")}</option>
                        <option value="cancelled">{tr("Annulé", "Geannuleerd", "Cancelled")}</option>
                      </select>

                      <button
                        type="button"
                        className="login-create"
                        onClick={() =>
                          void updateQuoteStatus(
                            quote.id,
                            quoteStatusDrafts[quote.id] ?? quote.status
                          )
                        }
                        disabled={
                          quoteStatusUpdatingId === quote.id ||
                          !quoteStatusDrafts[quote.id] ||
                          quoteStatusDrafts[quote.id] === quote.status
                        }
                        style={{
                          width: "auto",
                          minHeight: "36px",
                          padding: "0 12px",
                        }}
                      >
                        {quoteStatusUpdatingId === quote.id
                          ? tr(
                              "Validation...",
                              "Bevestigen...",
                              "Validating..."
                            )
                          : tr(
                              "Valider",
                              "Bevestigen",
                              "Validate"
                            )}
                      </button>
                    </div>
                  </div>

                  {!quote.user_id && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "11px 12px",
                        borderRadius: "10px",
                        border: matchingProfile
                          ? "1px solid rgba(0,212,255,0.22)"
                          : "1px solid rgba(255,215,0,0.22)",
                        background: matchingProfile
                          ? "rgba(0,212,255,0.055)"
                          : "rgba(255,215,0,0.055)",
                        color: "rgba(255,255,255,0.68)",
                        fontSize: "0.72rem",
                        lineHeight: 1.5,
                      }}
                    >
                      <strong
                        style={{ color: matchingProfile ? "#00D4FF" : "#FFD700" }}
                      >
                        {matchingProfile
                          ? tr("Compte TSB détecté avec le même email", "TSB-account gedetecteerd met hetzelfde e-mailadres", "TSB account detected with the same email")
                          : tr("Aucun compte TSB détecté pour cet email", "Geen TSB-account gevonden voor dit e-mailadres", "No TSB account detected for this email")}
                      </strong>
                      <div style={{ marginTop: "5px" }}>
                        {matchingProfile
                          ? tr("Le devis ou la demande sera lié automatiquement après vérification du compte.", "De offerte of aanvraag wordt automatisch gekoppeld na accountverificatie.", "The quote or request will be linked automatically after account verification.")
                          : tr("Le devis ou la demande reste visiteur jusqu’à la création et la vérification d’un compte avec cette adresse e-mail.", "De offerte of aanvraag blijft een bezoekersaanvraag totdat een account met dit e-mailadres is aangemaakt en geverifieerd.", "The quote or request remains a guest request until an account with this email address is created and verified.")}
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: "14px",
                      padding: "13px",
                      borderRadius: "11px",
                      border: "1px solid rgba(255,255,255,0.09)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <div
                      style={{
                        color: "rgba(255,255,255,0.45)",
                        fontSize: "0.66rem",
                        fontWeight: 900,
                        marginBottom: "7px",
                      }}
                    >
                      {tr("DEMANDE DU CLIENT", "AANVRAAG VAN DE KLANT", "CLIENT REQUEST")}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        color: "rgba(255,255,255,0.82)",
                        lineHeight: 1.58,
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {getLocalizedQuoteMessage(
                        quote
                      )}
                    </p>
                  </div>

                  {!quote.user_id && (
                    <div
                      style={{
                        marginTop: "14px",
                        padding: "13px",
                        borderRadius: "11px",
                        border: "1px solid rgba(0,102,255,0.24)",
                        background: "rgba(0,102,255,0.055)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "10px",
                          flexWrap: "wrap",
                          marginBottom: "9px",
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: "0.8rem" }}>
                            {tr("Répondre au visiteur", "Beantwoord de bezoeker", "Reply to visitor")}
                          </strong>
                          <div
                            style={{
                              marginTop: "3px",
                              color: "rgba(255,255,255,0.48)",
                              fontSize: "0.67rem",
                            }}
                          >
                            {tr(
                              "Destinataire",
                              "Ontvanger",
                              "Recipient"
                            )} : {quote.email}
                          </div>
                        </div>
                        <span
                          style={{
                            color:
                              quote.reply_email_status === "sent"
                                ? "#4ade80"
                                : quote.reply_email_status === "failed"
                                  ? "#f87171"
                                  : "#FFD700",
                            fontSize: "0.6rem",
                            fontWeight: 900,
                          }}
                        >
                          {quote.reply_email_status === "sent"
                            ? "EMAIL ENVOYÉ"
                            : quote.reply_email_status === "pending"
                              ? "EMAIL EN ATTENTE"
                              : quote.reply_email_status === "failed"
                                ? "ÉCHEC EMAIL"
                                : "EMAIL NON ENVOYÉ"}
                        </span>
                      </div>

                      <textarea
                        value={
                          guestQuoteReplyDrafts[quote.id] ??
                          quote.admin_reply ??
                          ""
                        }
                        onChange={(event) =>
                          setGuestQuoteReplyDrafts((previous) => ({
                            ...previous,
                            [quote.id]: event.target.value,
                          }))
                        }
                        disabled={guestQuoteReplySavingId === quote.id}
                        placeholder={tr("Écris ici la réponse de TSB Tech Group au visiteur...", "Schrijf hier het antwoord van TSB Tech Group aan de bezoeker...", "Write TSB Tech Group’s reply to the visitor here...")}
                        rows={4}
                        style={{
                          width: "100%",
                          resize: "vertical",
                          padding: "10px 11px",
                          borderRadius: "9px",
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "#0b1624",
                          color: "#ffffff",
                          lineHeight: 1.5,
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />

                      <div
                        style={{
                          marginTop: "9px",
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => saveGuestQuoteReply(quote)}
                          disabled={guestQuoteReplySavingId === quote.id}
                          className="login-create"
                          style={{
                            width: "auto",
                            minHeight: "38px",
                            padding: "0 12px",
                          }}
                        >
                          <Save size={15} />
                          {guestQuoteReplySavingId === quote.id
                            ? "Enregistrement..."
                            : "Enregistrer la réponse"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })(),
          document.body
        )}

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
                Fermer
              </button>

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
                }}
              >
                Ouvrir
              </button>
            </div>
          </div>,
          document.body
        )}

      <button
        type="button"
        onClick={
          scrollToTop
        }
        aria-label="Retour en haut"
        title="Retour en haut"
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

export default Admin;