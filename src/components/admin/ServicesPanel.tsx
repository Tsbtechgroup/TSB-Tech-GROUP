import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  CalendarDays,
  FileText,
  Link2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Wrench,
  X,
} from "lucide-react";

import { supabase } from "../../services/supabase";
import { getServiceTheme } from "../../utils/serviceTheme";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import {
  adminTranslations,
  type AdminCopyKey,
} from "../../i18n/locales/admin";

type ClientProfile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
};

type QuoteRequest = {
  id: string;
  user_id: string;
  service: string;
  message: string | null;
  status: string;
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

type ServicesPanelProps = {
  profiles: ClientProfile[];
  quotes?: QuoteRequest[];
  onStatusUpdated?: (
    serviceId: string,
    status: string
  ) => void;
};

const SERVICES_PER_PAGE = 8;

const serviceCategories = [
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
  "Autres services",
];

const serviceCategoryLabelKeys: Record<
  string,
  AdminCopyKey
> = {
  "Serrurerie automobile":
    "serviceCategoryAutomotiveLocksmith",
  "Diagnostic automobile":
    "serviceCategoryAutomotiveDiagnostics",
  "Sécurité": "serviceCategorySecurity",
  "Électricité": "serviceCategoryElectricity",
  "Énergie": "serviceCategoryEnergy",
  "Eau & forage": "serviceCategoryWaterDrilling",
  "Automatisation": "serviceCategoryAutomation",
  "Informatique & électronique":
    "serviceCategoryItElectronics",
  "Réseaux & télécommunications":
    "serviceCategoryNetworksTelecom",
  "Site web": "serviceCategoryWebsite",
  "Maintenance technique":
    "serviceCategoryTechnicalMaintenance",
  "Autres services":
    "serviceCategoryOtherServices",
};

function ServicesPanel({
  profiles,
  quotes = [],
  onStatusUpdated,
}: ServicesPanelProps) {
  const { locale, intlLocale } = useLanguage();

  const at = (key: AdminCopyKey) =>
    translate(
      adminTranslations,
      locale,
      `admin.copy.${key}`
    );

  const getServiceDisplayLabel = (
    serviceName: string
  ) => {
    const key =
      serviceCategoryLabelKeys[serviceName];

    return key ? at(key) : serviceName;
  };

  const [
    clientServices,
    setClientServices,
  ] = useState<ClientService[]>([]);

  const [
    selectedQuoteId,
    setSelectedQuoteId,
  ] = useState("");

  const [
    selectedClientId,
    setSelectedClientId,
  ] = useState("");

  const [service, setService] = useState(
    serviceCategories[0]
  );

  const [title, setTitle] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [status, setStatus] = useState(
    "planned"
  );

  const [
    scheduledAt,
    setScheduledAt,
  ] = useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isCreating,
    setIsCreating,
  ] = useState(false);

  const [
    updatingServiceId,
    setUpdatingServiceId,
  ] = useState<string | null>(null);

  const [
    editingServiceId,
    setEditingServiceId,
  ] = useState<string | null>(null);

  const [
    editTitle,
    setEditTitle,
  ] = useState("");

  const [
    editDescription,
    setEditDescription,
  ] = useState("");

  const [
    editStatus,
    setEditStatus,
  ] = useState("planned");

  const [
    editScheduledAt,
    setEditScheduledAt,
  ] = useState("");

  const [
    isSavingEdit,
    setIsSavingEdit,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    serviceSearch,
    setServiceSearch,
  ] = useState("");

  const [
    serviceStatusFilter,
    setServiceStatusFilter,
  ] = useState("all");

  const [
    serviceStatusDrafts,
    setServiceStatusDrafts,
  ] = useState<Record<string, string>>({});

  const [
    serviceViewFilter,
    setServiceViewFilter,
  ] = useState<"all" | "active" | "history">("active");

  const [
    servicePage,
    setServicePage,
  ] = useState(1);

  const [
    showCreateService,
    setShowCreateService,
  ] = useState(false);

  const selectedServiceTheme =
    getServiceTheme(service);

  /*
    ========================================================
    CLIENTS
    ========================================================
  */

  const getClientName = (
    profile: ClientProfile
  ) => {
    const fullName = [
      profile.first_name,
      profile.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (fullName && profile.email) {
      return `${fullName} — ${profile.email}`;
    }

    if (fullName) {
      return fullName;
    }

    if (profile.email) {
      return profile.email;
    }

    return at("clientTsbTitle");
  };

  const profileById = useMemo(() => {
    return new Map(
      profiles.map((profile) => [
        profile.id,
        profile,
      ])
    );
  }, [profiles]);

  /*
    ========================================================
    DEVIS
    ========================================================
  */

  const quoteById = useMemo(() => {
    return new Map(
      quotes.map((quote) => [
        quote.id,
        quote,
      ])
    );
  }, [quotes]);

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat(
      intlLocale,
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(new Date(date));
  };

  const toDateTimeLocalValue = (
    date: string | null
  ) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(parsedDate.getTime())
    ) {
      return "";
    }

    const timezoneOffset =
      parsedDate.getTimezoneOffset() *
      60_000;

    return new Date(
      parsedDate.getTime() -
        timezoneOffset
    )
      .toISOString()
      .slice(0, 16);
  };

  const getQuoteStatusLabel = (
    quoteStatus: string
  ) => {
    switch (quoteStatus) {
      case "received":
        return at("toProcess");

      case "in_progress":
        return at("inProgress_2");

      case "completed":
        return at("completed_4");

      case "cancelled":
        return at("cancelled");

      default:
        return quoteStatus;
    }
  };

  const getQuoteLabel = (
    quote: QuoteRequest
  ) => {
    const profile = profileById.get(
      quote.user_id
    );

    const client = profile
      ? getClientName(profile)
      : at("clientTsbTitle");

    return `${getServiceDisplayLabel(
      quote.service
    )} — ${client} — ${getQuoteStatusLabel(
      quote.status
    )}`;
  };

  const handleQuoteChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const quoteId = event.target.value;

    setSelectedQuoteId(quoteId);
    setErrorMessage("");
    setSuccessMessage("");

    if (!quoteId) {
      return;
    }

    const quote = quoteById.get(quoteId);

    if (!quote) {
      return;
    }

    setSelectedClientId(quote.user_id);

    if (
      serviceCategories.includes(
        quote.service
      )
    ) {
      setService(quote.service);
    } else {
      setService("Autres services");
    }

    setTitle(
      `Intervention — ${quote.service}`
    );

    setDescription(
      quote.message?.trim() || ""
    );

    setStatus("planned");
  };

  /*
    ========================================================
    STATUTS SERVICES
    ========================================================
  */

  const getStatusLabel = (
    serviceStatus: string
  ) => {
    switch (serviceStatus) {
      case "planned":
        return at("toPlan");

      case "scheduled":
        return at("scheduled_2");

      case "in_progress":
        return at("inProgress");

      case "completed":
        return at("completed_3");

      case "cancelled":
        return at("cancelled_3");

      default:
        return serviceStatus;
    }
  };

  const filteredClientServices = useMemo(() => {
    const query = serviceSearch
      .trim()
      .toLowerCase();

    return clientServices.filter(
      (clientService) => {
        const isHistoryStatus =
          clientService.status === "completed" ||
          clientService.status === "cancelled";

        if (
          serviceViewFilter === "active" &&
          isHistoryStatus
        ) {
          return false;
        }

        if (
          serviceViewFilter === "history" &&
          !isHistoryStatus
        ) {
          return false;
        }

        if (
          serviceStatusFilter !== "all" &&
          clientService.status !==
            serviceStatusFilter
        ) {
          return false;
        }

        if (!query) {
          return true;
        }

        const profile = profileById.get(
          clientService.user_id
        );

        const searchable = [
          clientService.service,
          getServiceDisplayLabel(
            clientService.service
          ),
          clientService.title,
          clientService.description ?? "",
          clientService.status,
          getStatusLabel(
            clientService.status
          ),
          profile?.first_name ?? "",
          profile?.last_name ?? "",
          profile?.email ?? "",
          profile?.phone ?? "",
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      }
    );
  }, [
    clientServices,
    profileById,
    serviceSearch,
    serviceStatusFilter,
    serviceViewFilter,
    locale,
  ]);

  const getEffectiveServiceStatus = (
    clientService: ClientService
  ) =>
    serviceStatusDrafts[clientService.id] ?? clientService.status;

  const serviceStatusCounts = {
    all: clientServices.length,
    planned: clientServices.filter(
      (clientService) =>
        getEffectiveServiceStatus(clientService) === "planned"
    ).length,
    scheduled: clientServices.filter(
      (clientService) =>
        getEffectiveServiceStatus(clientService) === "scheduled"
    ).length,
    in_progress: clientServices.filter(
      (clientService) =>
        getEffectiveServiceStatus(clientService) === "in_progress"
    ).length,
    completed: clientServices.filter(
      (clientService) =>
        getEffectiveServiceStatus(clientService) === "completed"
    ).length,
    cancelled: clientServices.filter(
      (clientService) =>
        getEffectiveServiceStatus(clientService) === "cancelled"
    ).length,
  };

  const activeServiceCount =
    serviceStatusCounts.planned +
    serviceStatusCounts.scheduled +
    serviceStatusCounts.in_progress;

  const historyServiceCount =
    serviceStatusCounts.completed +
    serviceStatusCounts.cancelled;

  const servicePageCount = Math.max(
    1,
    Math.ceil(
      filteredClientServices.length /
        SERVICES_PER_PAGE
    )
  );

  const safeServicePage = Math.min(
    servicePage,
    servicePageCount
  );

  const paginatedClientServices =
    filteredClientServices.slice(
      (safeServicePage - 1) *
        SERVICES_PER_PAGE,
      safeServicePage * SERVICES_PER_PAGE
    );

  /*
    ========================================================
    CHARGEMENT SERVICES
    ========================================================
  */

  const loadServices = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const { data, error } =
      await supabase
        .from("client_services")
        .select(
          "id, user_id, quote_request_id, service, title, description, status, scheduled_at, completed_at, created_at, updated_at"
        )
        .order("created_at", {
          ascending: false,
        });

    setIsLoading(false);

    if (error) {
      console.error(
        "Erreur chargement services :",
        error
      );

      setErrorMessage(
        `${at("loadServicesError")} : ${error.message}`
      );

      return;
    }

    setClientServices(data ?? []);
  };

  useEffect(() => {
    void loadServices();
  }, []);

  /*
    ========================================================
    CRÉATION INTERVENTION
    ========================================================
  */

  const handleCreateService = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!selectedClientId) {
      setErrorMessage(
        at("selectClientError")
      );
      return;
    }

    if (!service) {
      setErrorMessage(
        at("selectServiceError")
      );
      return;
    }

    if (!title.trim()) {
      setErrorMessage(
        at("interventionTitleRequiredCreate")
      );
      return;
    }

    setIsCreating(true);

    let scheduledValue:
      | string
      | null = null;

    if (scheduledAt) {
      const parsedDate = new Date(
        scheduledAt
      );

      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        setIsCreating(false);

        setErrorMessage(
          at("scheduledDateInvalid")
        );

        return;
      }

      scheduledValue =
        parsedDate.toISOString();
    }

    const now = new Date().toISOString();

    const { data, error } =
      await supabase
        .from("client_services")
        .insert({
          user_id: selectedClientId,
          quote_request_id:
            selectedQuoteId || null,
          service,
          title: title.trim(),
          description:
            description.trim() || null,
          status,
          scheduled_at: scheduledValue,
          completed_at:
            status === "completed"
              ? now
              : null,
          updated_at: now,
        })
        .select(
          "id, user_id, quote_request_id, service, title, description, status, scheduled_at, completed_at, created_at, updated_at"
        )
        .single();

    setIsCreating(false);

    if (error) {
      console.error(
        "Erreur création service :",
        error
      );

      setErrorMessage(
        `${at("createServiceError")} : ${error.message}`
      );

      return;
    }

    if (data) {
      setClientServices(
        (previous) => [
          data,
          ...previous,
        ]
      );
    }

    const wasLinkedToQuote =
      Boolean(selectedQuoteId);

    setSelectedQuoteId("");
    setSelectedClientId("");
    setService(serviceCategories[0]);
    setTitle("");
    setDescription("");
    setStatus("planned");
    setScheduledAt("");

    setSuccessMessage(
      wasLinkedToQuote
        ? at("serviceLinkedQuoteCreatedSuccess")
        : at("serviceAddedToClientSuccess")
    );

    setShowCreateService(false);
  };

  /*
    ========================================================
    MODIFICATION RAPIDE DU STATUT
    ========================================================
  */

  const handleStatusChange = async (
    clientService: ClientService,
    newStatus: string
  ) => {
    if (
      updatingServiceId ||
      isSavingEdit
    ) {
      return;
    }

    setUpdatingServiceId(
      clientService.id
    );

    setErrorMessage("");
    setSuccessMessage("");

    const now = new Date().toISOString();

    const completedAt =
      newStatus === "completed"
        ? clientService.completed_at ||
          now
        : null;

    const { error } = await supabase
      .from("client_services")
      .update({
        status: newStatus,
        completed_at: completedAt,
        updated_at: now,
      })
      .eq("id", clientService.id);

    setUpdatingServiceId(null);

    if (error) {
      console.error(
        "Erreur statut service :",
        error
      );

      setErrorMessage(
        `${at("updateServiceError")} : ${error.message}`
      );

      return;
    }

    setClientServices((previous) =>
      previous.map((currentService) =>
        currentService.id ===
        clientService.id
          ? {
              ...currentService,
              status: newStatus,
              completed_at:
                completedAt,
              updated_at: now,
            }
          : currentService
      )
    );

    setServiceStatusDrafts((previous) => {
      const next = { ...previous };
      delete next[clientService.id];
      return next;
    });

    onStatusUpdated?.(clientService.id, newStatus);

    setSuccessMessage(
      at("serviceStatusUpdatedSuccess")
    );
  };

  /*
    ========================================================
    ÉDITION COMPLÈTE D'UNE INTERVENTION
    ========================================================
  */

  const startEditingService = (
    clientService: ClientService
  ) => {
    setEditingServiceId(
      clientService.id
    );

    setEditTitle(
      clientService.title
    );

    setEditDescription(
      clientService.description || ""
    );

    setEditStatus(
      clientService.status
    );

    setEditScheduledAt(
      toDateTimeLocalValue(
        clientService.scheduled_at
      )
    );

    setErrorMessage("");
    setSuccessMessage("");
  };

  const cancelEditingService = () => {
    if (isSavingEdit) {
      return;
    }

    setEditingServiceId(null);
    setEditTitle("");
    setEditDescription("");
    setEditStatus("planned");
    setEditScheduledAt("");
    setErrorMessage("");
  };

  const handleSaveServiceEdit = async (
    event: FormEvent<HTMLFormElement>,
    clientService: ClientService
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const cleanTitle = editTitle.trim();

    if (!cleanTitle) {
      setErrorMessage(
        at("interventionTitleRequired")
      );
      return;
    }

    let scheduledValue:
      | string
      | null = null;

    if (editScheduledAt) {
      const parsedDate = new Date(
        editScheduledAt
      );

      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        setErrorMessage(
          at("scheduledDateInvalid")
        );
        return;
      }

      scheduledValue =
        parsedDate.toISOString();
    }

    setIsSavingEdit(true);

    const now = new Date().toISOString();

    const completedAt =
      editStatus === "completed"
        ? clientService.completed_at ||
          now
        : null;

    const cleanDescription =
      editDescription.trim() || null;

    const { error } = await supabase
      .from("client_services")
      .update({
        title: cleanTitle,
        description: cleanDescription,
        status: editStatus,
        scheduled_at: scheduledValue,
        completed_at: completedAt,
        updated_at: now,
      })
      .eq("id", clientService.id);

    setIsSavingEdit(false);

    if (error) {
      console.error(
        "Erreur modification intervention :",
        error
      );

      setErrorMessage(
        `${at("saveInterventionError")} : ${error.message}`
      );

      return;
    }

    setClientServices((previous) =>
      previous.map((currentService) =>
        currentService.id ===
        clientService.id
          ? {
              ...currentService,
              title: cleanTitle,
              description:
                cleanDescription,
              status: editStatus,
              scheduled_at:
                scheduledValue,
              completed_at:
                completedAt,
              updated_at: now,
            }
          : currentService
      )
    );

    setEditingServiceId(null);
    setEditTitle("");
    setEditDescription("");
    setEditStatus("planned");
    setEditScheduledAt("");

    setSuccessMessage(
      at("interventionUpdatedSuccess")
    );
  };

  /*
    ========================================================
    AFFICHAGE
    ========================================================
  */

  return (
    <section
      className="login-card"
      style={{
        marginTop: "22px",
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
          <span className="login-card__eyebrow">{at("interventionsab9923")}</span>
          <h2 style={{ marginBottom: "8px" }}>{at("interventionTracking")}</h2>
          <p className="login-card__intro" style={{ marginBottom: 0 }}>
            {at("servicesPanelIntro")}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "stretch", gap: "10px", flexWrap: "wrap" }}>
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
            <Wrench size={22} style={{ color: "#53a7ff", marginBottom: "4px" }} />
            <strong style={{ display: "block", color: "#ffffff", fontSize: "1.35rem" }}>
              {clientServices.length}
            </strong>
          </div>

          <button
            type="button"
            className="login-create"
            onClick={() => {
              setShowCreateService((current) => !current);
              setErrorMessage("");
            }}
            style={{
              width: "auto",
              padding: "0 18px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Plus size={17} />
            {showCreateService ? at("close") : at("newIntervention")}
          </button>

          <button
            type="button"
            className="login-create"
            onClick={() => void loadServices()}
            disabled={isLoading || isSavingEdit}
            style={{
              width: "auto",
              padding: "0 18px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <RefreshCw size={17} />
            {at("refresh")}
          </button>
        </div>
      </div>

      {errorMessage && (
        <p className="login-form-message">
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p
          style={{
            color: "#4ade80",
            fontSize: "0.85rem",
            lineHeight: 1.6,
          }}
        >
          {successMessage}
        </p>
      )}

      {/* CRÉER SERVICE */}

      {showCreateService && (
      <form
        onSubmit={handleCreateService}
        style={{
          marginTop: "24px",
          padding: "20px",
          border:
            "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px",
          background:
            "rgba(255,255,255,0.025)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            marginBottom: "18px",
          }}
        >
          <Plus
            size={20}
            style={{
              color: "#1688ff",
            }}
          />

          <strong
            style={{
              color: "#ffffff",
            }}
          >
            {at("addIntervention")}
          </strong>
        </div>

        {/* DEVIS LIÉ */}

        {quotes.length > 0 && (
          <div
            style={{
              marginBottom: "18px",
              padding: "16px",
              borderRadius: "12px",
              border:
                `1px solid ${selectedServiceTheme.border}`,
              background:
                selectedServiceTheme.background,
              boxShadow:
                selectedServiceTheme.glow,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <Link2
                size={18}
                style={{
                  color: "#1688ff",
                }}
              />

              <strong
                style={{
                  color: "#ffffff",
                  fontSize: "0.9rem",
                }}
              >
                {at("createFromAQuoteRequest")}
              </strong>
            </div>

            <div className="login-field">
              <label htmlFor="service-quote">
                {at("linkedQuoteRequest")}
              </label>

              <select
                id="service-quote"
                value={selectedQuoteId}
                onChange={handleQuoteChange}
                disabled={isCreating}
                style={{
                  width: "100%",
                  minHeight: "48px",
                  padding: "0 12px",
                  borderRadius: "10px",
                  border:
                    "1px solid rgba(255,255,255,0.12)",
                  background: "#0f1d2e",
                  color: "#ffffff",
                }}
              >
                <option value="">
                  {at("noQuoteManualCreation")}
                </option>

                {quotes.map((quote) => (
                  <option
                    key={quote.id}
                    value={quote.id}
                  >
                    {getQuoteLabel(quote)}
                  </option>
                ))}
              </select>
            </div>

            {selectedQuoteId && (
              <p
                style={{
                  margin: "10px 0 0",
                  color:
                    "rgba(255,255,255,0.55)",
                  fontSize: "0.78rem",
                  lineHeight: 1.5,
                }}
              >
                {at("quotePrefilledInfo")}
              </p>
            )}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
          }}
        >
          <div className="login-field">
            <label htmlFor="service-client">
              {at("client")}
            </label>

            <select
              id="service-client"
              value={selectedClientId}
              onChange={(event) => {
                setSelectedClientId(
                  event.target.value
                );

                if (selectedQuoteId) {
                  const linkedQuote =
                    quoteById.get(
                      selectedQuoteId
                    );

                  if (
                    linkedQuote &&
                    linkedQuote.user_id !==
                      event.target.value
                  ) {
                    setSelectedQuoteId("");
                  }
                }
              }}
              disabled={isCreating}
              style={{
                width: "100%",
                minHeight: "48px",
                padding: "0 12px",
                borderRadius: "10px",
                border:
                  "1px solid rgba(255,255,255,0.12)",
                background: "#0f1d2e",
                color: "#ffffff",
              }}
            >
              <option value="">
                {at("chooseAClient")}
              </option>

              {profiles.map((profile) => (
                <option
                  key={profile.id}
                  value={profile.id}
                >
                  {getClientName(profile)}
                </option>
              ))}
            </select>
          </div>

          <div className="login-field">
            <label htmlFor="service-category">
              {at("service")}
            </label>

            <select
              id="service-category"
              value={service}
              onChange={(event) =>
                setService(
                  event.target.value
                )
              }
              disabled={isCreating}
              style={{
                width: "100%",
                minHeight: "48px",
                padding: "0 12px",
                borderRadius: "10px",
                border:
                  "1px solid rgba(255,255,255,0.12)",
                background: "#0f1d2e",
                color: "#ffffff",
              }}
            >
              {serviceCategories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {getServiceDisplayLabel(
                      category
                    )}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="login-field">
            <label htmlFor="service-title">
              {at("intervention1a3900")}
            </label>

            <input
              id="service-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder={at("exGolf7KeyDuplication")}
              disabled={isCreating}
            />
          </div>

          <div className="login-field">
            <label htmlFor="service-status">
              {at("statusf553af")}
            </label>

            <select
              id="service-status"
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
              disabled={isCreating}
              style={{
                width: "100%",
                minHeight: "48px",
                padding: "0 12px",
                borderRadius: "10px",
                border:
                  "1px solid rgba(255,255,255,0.12)",
                background: "#0f1d2e",
                color: "#ffffff",
              }}
            >
              <option value="planned">
                {at("toPlan")}
              </option>
              <option value="scheduled">
                {at("scheduled_2")}
              </option>
              <option value="in_progress">
                {at("inProgress")}
              </option>
              <option value="completed">
                {at("completed_3")}
              </option>
              <option value="cancelled">
                {at("cancelled_3")}
              </option>
            </select>
          </div>

          <div className="login-field">
            <label htmlFor="service-date">
              {at("scheduledDate")}
            </label>

            <input
              id="service-date"
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) =>
                setScheduledAt(
                  event.target.value
                )
              }
              disabled={isCreating}
            />
          </div>
        </div>

        <div
          className="login-field"
          style={{
            marginTop: "18px",
          }}
        >
          <label htmlFor="service-description">
            {at("description")}
          </label>

          <textarea
            id="service-description"
            rows={5}
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            placeholder={at("informationAboutTheInterventionVehicleEquipmentPlannedW")}
            disabled={isCreating}
            style={{
              width: "100%",
              resize: "vertical",
            }}
          />
        </div>

        <button
          type="submit"
          className="login-create"
          disabled={isCreating}
          style={{
            width: "auto",
            minHeight: "46px",
            marginTop: "18px",
            padding: "0 22px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Plus size={18} />

          {isCreating
            ? at("creating")
            : selectedQuoteId
              ? at("createLinkedIntervention")
              : at("addService")}
        </button>
      </form>
      )}

      {/* LISTE SERVICES */}

      <div
        style={{
          marginTop: "28px",
          paddingTop: "22px",
          borderTop:
            "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span className="login-card__eyebrow">
          {at("interventionsab9923")}
        </span>

        <h3
          style={{
            color: "#ffffff",
            margin: "5px 0 18px",
          }}
        >
          {at("recordedServices")}
        </h3>

        <div
          style={{
            marginBottom: "12px",
            padding: "14px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.025)",
          }}
        >
          <span
            className="login-card__eyebrow"
            style={{ display: "block", marginBottom: "10px" }}
          >
            {at("trackingHistory")}
          </span>

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {[
              ["active", at("activeTracking"), activeServiceCount, "#53a7ff"],
              ["history", at("history"), historyServiceCount, "#4ade80"],
              ["all", at("allServicesView"), clientServices.length, "rgba(255,255,255,0.72)"],
            ].map(([value, label, count, color]) => {
              const active = serviceViewFilter === value;

              return (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => {
                    setServiceViewFilter(
                      value as "all" | "active" | "history"
                    );
                    setServiceStatusFilter("all");
                    setServicePage(1);
                  }}
                  style={{
                    minHeight: "36px",
                    padding: "0 12px",
                    borderRadius: "999px",
                    border: `1px solid ${
                      active
                        ? String(color)
                        : "rgba(255,255,255,0.12)"
                    }`,
                    background: active
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(255,255,255,0.025)",
                    color: active
                      ? String(color)
                      : "rgba(255,255,255,0.66)",
                    fontSize: "0.76rem",
                    fontWeight: 850,
                    cursor: "pointer",
                  }}
                >
                  {String(label)} ({Number(count)})
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(240px, 1.4fr) minmax(180px, 0.6fr)",
            gap: "12px",
            marginBottom: "16px",
            padding: "16px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.025)",
          }}
        >
          <input
            type="search"
            value={serviceSearch}
            onChange={(event) => {
              setServiceSearch(
                event.target.value
              );
              setServicePage(1);
            }}
            placeholder={at("searchClientInterventionService")}
            aria-label={at("searchAnIntervention")}
          />

          <select
            value={serviceStatusFilter}
            onChange={(event) => {
              setServiceStatusFilter(
                event.target.value
              );
              setServicePage(1);
            }}
            style={{
              width: "100%",
              minHeight: "48px",
              padding: "0 12px",
              borderRadius: "10px",
              border:
                "1px solid rgba(255,255,255,0.12)",
              background: "#0f1d2e",
              color: "#ffffff",
            }}
          >
            <option value="all">
              {at("allStatuses")} ({serviceStatusCounts.all})
            </option>
            {serviceViewFilter !== "history" && (
              <>
                <option value="planned">
                  {at("toPlan")} ({serviceStatusCounts.planned})
                </option>
                <option value="scheduled">
                  {at("scheduled_3")} ({serviceStatusCounts.scheduled})
                </option>
                <option value="in_progress">
                  {at("inProgress")} ({serviceStatusCounts.in_progress})
                </option>
              </>
            )}
            {serviceViewFilter !== "active" && (
              <>
                <option value="completed">
                  {at("completedPlural")} ({serviceStatusCounts.completed})
                </option>
                <option value="cancelled">
                  {at("cancelledPlural")} ({serviceStatusCounts.cancelled})
                </option>
              </>
            )}
          </select>
        </div>

        <p
          style={{
            margin: "-4px 0 14px",
            color: "rgba(255,255,255,0.48)",
            fontSize: "0.72rem",
            lineHeight: 1.5,
          }}
        >
          {at("statusChangeHint")}
        </p>

        {!isLoading &&
          clientServices.length > 0 && (
          <p
            style={{
              margin: "0 0 14px",
              color:
                "rgba(255,255,255,0.5)",
              fontSize: "0.78rem",
            }}
          >
            {filteredClientServices.length}{" "}
            {at(
              filteredClientServices.length === 1
                ? "interventionCountSingular"
                : "interventionCountPlural"
            )}
          </p>
        )}

        {isLoading ? (
          <p className="login-card__intro">
            {at("loadingServices")}
          </p>
        ) : clientServices.length === 0 ? (
          <p className="login-card__intro">
            {at("noClientServiceIsCurrentlyRecorded")}
          </p>
        ) : filteredClientServices.length === 0 ? (
          <p className="login-card__intro">
            {at("noInterventionMatchesYourSearchOrFilter")}
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "14px",
            }}
          >
            {paginatedClientServices.map(
              (clientService) => {
                const serviceTheme =
                  getServiceTheme(
                    clientService.service
                  );

                const profile =
                  profileById.get(
                    clientService.user_id
                  );

                const linkedQuote =
                  clientService.quote_request_id
                    ? quoteById.get(
                        clientService.quote_request_id
                      )
                    : null;

                const isEditing =
                  editingServiceId ===
                  clientService.id;

                return (
                  <article
                    key={clientService.id}
                    style={{
                      padding: "20px",
                      border:
                        `1px solid ${serviceTheme.border}`,
                      borderRadius: "14px",
                      background:
                        serviceTheme.background,
                      boxShadow:
                        serviceTheme.glow,
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
                      }}
                    >
                      <div>
                        <span
                          className="login-card__eyebrow"
                          style={{
                            color:
                              serviceTheme.accent,
                          }}
                        >
                          {getServiceDisplayLabel(
                            clientService.service
                          )}
                        </span>

                        <h3
                          style={{
                            color: "#ffffff",
                            margin:
                              "6px 0 8px",
                          }}
                        >
                          {clientService.title}
                        </h3>

                        <p
                          style={{
                            margin: "0 0 6px",
                            color:
                              "rgba(255,255,255,0.65)",
                            fontSize:
                              "0.84rem",
                          }}
                        >
                          {at("clientColon")}{" "}
                          {profile
                            ? getClientName(
                                profile
                              )
                            : clientService.user_id}
                        </p>

                        {clientService.quote_request_id && (
                          <div
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap: "6px",
                              marginTop: "6px",
                              color:
                                serviceTheme.accent,
                              fontSize:
                                "0.76rem",
                            }}
                          >
                            <FileText
                              size={14}
                            />

                            {linkedQuote
                              ? `${at("linkedQuotePrefix")} ${getServiceDisplayLabel(
                                  linkedQuote.service
                                )}`
                              : at("linkedToAQuoteRequest")}
                          </div>
                        )}
                      </div>

                      {!isEditing && (
                        <div
                          style={{
                            display: "flex",
                            alignItems:
                              "center",
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          <select
                            value={
                              serviceStatusDrafts[clientService.id] ??
                              clientService.status
                            }
                            onChange={(event) =>
                              setServiceStatusDrafts((previous) => ({
                                ...previous,
                                [clientService.id]: event.target.value,
                              }))
                            }
                            disabled={
                              updatingServiceId ===
                                clientService.id ||
                              isSavingEdit
                            }
                            style={{
                              minHeight: "40px",
                              padding: "0 12px",
                              borderRadius:
                                "10px",
                              border:
                                serviceStatusDrafts[clientService.id] &&
                                serviceStatusDrafts[clientService.id] !==
                                  clientService.status
                                  ? "1px solid rgba(251,191,36,0.5)"
                                  : "1px solid rgba(255,255,255,0.12)",
                              background:
                                "#0f1d2e",
                              color: "#ffffff",
                            }}
                          >
                            <option value="planned">
                              {at("toPlan")}
                            </option>
                            <option value="scheduled">
                              {at("scheduled_2")}
                            </option>
                            <option value="in_progress">
                              {at("inProgress")}
                            </option>
                            <option value="completed">
                              {at("completed_3")}
                            </option>
                            <option value="cancelled">
                              {at("cancelled_3")}
                            </option>
                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              void handleStatusChange(
                                clientService,
                                serviceStatusDrafts[clientService.id] ??
                                  clientService.status
                              )
                            }
                            disabled={
                              updatingServiceId === clientService.id ||
                              isSavingEdit ||
                              !serviceStatusDrafts[clientService.id] ||
                              serviceStatusDrafts[clientService.id] ===
                                clientService.status
                            }
                            style={{
                              minHeight: "40px",
                              padding: "0 12px",
                              borderRadius: "10px",
                              border: "1px solid rgba(74,222,128,0.34)",
                              background:
                                serviceStatusDrafts[clientService.id] &&
                                serviceStatusDrafts[clientService.id] !==
                                  clientService.status
                                  ? "rgba(34,197,94,0.16)"
                                  : "rgba(255,255,255,0.04)",
                              color:
                                serviceStatusDrafts[clientService.id] &&
                                serviceStatusDrafts[clientService.id] !==
                                  clientService.status
                                  ? "#4ade80"
                                  : "rgba(255,255,255,0.34)",
                              fontWeight: 900,
                            }}
                          >
                            {updatingServiceId === clientService.id
                              ? at("validating")
                              : at("validate")}
                          </button>

                          <button
                            type="button"
                            className="button button--secondary"
                            onClick={() =>
                              startEditingService(
                                clientService
                              )
                            }
                            disabled={
                              isSavingEdit ||
                              updatingServiceId ===
                                clientService.id
                            }
                            style={{
                              minHeight: "40px",
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              gap: "7px",
                              padding:
                                "0 14px",
                            }}
                          >
                            <Pencil size={15} />
                            {at("edit")}
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <form
                        onSubmit={(event) =>
                          void handleSaveServiceEdit(
                            event,
                            clientService
                          )
                        }
                        style={{
                          marginTop: "20px",
                          paddingTop: "18px",
                          borderTop:
                            "1px solid rgba(22,136,255,0.2)",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "16px",
                          }}
                        >
                          <div className="login-field">
                            <label
                              htmlFor={`edit-title-${clientService.id}`}
                            >
                              {at("intervention1a3900")}
                            </label>

                            <input
                              id={`edit-title-${clientService.id}`}
                              type="text"
                              value={editTitle}
                              onChange={(event) =>
                                setEditTitle(
                                  event.target.value
                                )
                              }
                              disabled={
                                isSavingEdit
                              }
                            />
                          </div>

                          <div className="login-field">
                            <label
                              htmlFor={`edit-status-${clientService.id}`}
                            >
                              {at("statusf553af")}
                            </label>

                            <select
                              id={`edit-status-${clientService.id}`}
                              value={editStatus}
                              onChange={(event) =>
                                setEditStatus(
                                  event.target.value
                                )
                              }
                              disabled={
                                isSavingEdit
                              }
                              style={{
                                width: "100%",
                                minHeight: "48px",
                                padding:
                                  "0 12px",
                                borderRadius:
                                  "10px",
                                border:
                                  "1px solid rgba(255,255,255,0.12)",
                                background:
                                  "#0f1d2e",
                                color: "#ffffff",
                              }}
                            >
                              <option value="planned">
                                {at("toPlan")}
                              </option>
                              <option value="scheduled">
                                {at("scheduled_2")}
                              </option>
                              <option value="in_progress">
                                {at("inProgress")}
                              </option>
                              <option value="completed">
                                {at("completed_3")}
                              </option>
                              <option value="cancelled">
                                {at("cancelled_3")}
                              </option>
                            </select>
                          </div>

                          <div className="login-field">
                            <label
                              htmlFor={`edit-date-${clientService.id}`}
                            >
                              {at("scheduledDate")}
                            </label>

                            <input
                              id={`edit-date-${clientService.id}`}
                              type="datetime-local"
                              value={
                                editScheduledAt
                              }
                              onChange={(event) =>
                                setEditScheduledAt(
                                  event.target.value
                                )
                              }
                              disabled={
                                isSavingEdit
                              }
                            />
                          </div>
                        </div>

                        <div
                          className="login-field"
                          style={{
                            marginTop: "16px",
                          }}
                        >
                          <label
                            htmlFor={`edit-description-${clientService.id}`}
                          >
                            {at("description")}
                          </label>

                          <textarea
                            id={`edit-description-${clientService.id}`}
                            rows={5}
                            value={editDescription}
                            onChange={(event) =>
                              setEditDescription(
                                event.target.value
                              )
                            }
                            disabled={
                              isSavingEdit
                            }
                            style={{
                              width: "100%",
                              resize: "vertical",
                            }}
                          />
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                            marginTop: "18px",
                          }}
                        >
                          <button
                            type="submit"
                            className="login-create"
                            disabled={
                              isSavingEdit
                            }
                            style={{
                              width: "auto",
                              minHeight: "44px",
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
                            <Save size={17} />
                            {isSavingEdit
                              ? at("saving")
                              : at("save")}
                          </button>

                          <button
                            type="button"
                            className="button button--secondary"
                            onClick={
                              cancelEditingService
                            }
                            disabled={
                              isSavingEdit
                            }
                            style={{
                              minHeight: "44px",
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
                            <X size={17} />
                            {at("cancel")}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        {clientService.description && (
                          <p
                            style={{
                              color:
                                "rgba(255,255,255,0.7)",
                              lineHeight: 1.6,
                              whiteSpace:
                                "pre-wrap",
                              margin: "16px 0",
                            }}
                          >
                            {
                              clientService.description
                            }
                          </p>
                        )}

                        <div
                          style={{
                            display: "flex",
                            gap: "16px",
                            flexWrap: "wrap",
                            color:
                              "rgba(255,255,255,0.4)",
                            fontSize:
                              "0.76rem",
                            marginTop: "14px",
                          }}
                        >
                          <span
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap: "6px",
                            }}
                          >
                            <Wrench size={14} />
                            {getStatusLabel(
                              clientService.status
                            )}
                          </span>

                          {clientService.scheduled_at && (
                            <span
                              style={{
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                gap: "6px",
                              }}
                            >
                              <CalendarDays
                                size={14}
                              />
                              {at("scheduledOn")}{" "}
                              {formatDate(
                                clientService.scheduled_at
                              )}
                            </span>
                          )}

                          {clientService.completed_at && (
                            <span
                              style={{
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                gap: "6px",
                                color:
                                  "#4ade80",
                              }}
                            >
                              <CalendarDays
                                size={14}
                              />
                              {at("completedOn")}{" "}
                              {formatDate(
                                clientService.completed_at
                              )}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </article>
                );
              }
            )}
          </div>
        )}

        {!isLoading &&
          filteredClientServices.length >
            SERVICES_PER_PAGE && (
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "16px",
            }}
          >
            <button
              type="button"
              className="login-create"
              disabled={safeServicePage <= 1}
              onClick={() =>
                setServicePage((page) =>
                  Math.max(1, page - 1)
                )
              }
              style={{
                width: "auto",
                padding: "0 16px",
              }}
            >
              {at("previous")}
            </button>

            <span
              style={{
                color:
                  "rgba(255,255,255,0.62)",
                fontSize: "0.8rem",
              }}
            >
              {at("pageWord")} {safeServicePage} / {
                servicePageCount
              }
            </span>

            <button
              type="button"
              className="login-create"
              disabled={
                safeServicePage >=
                servicePageCount
              }
              onClick={() =>
                setServicePage((page) =>
                  Math.min(
                    servicePageCount,
                    page + 1
                  )
                )
              }
              style={{
                width: "auto",
                padding: "0 16px",
              }}
            >
              {at("next")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default ServicesPanel;
