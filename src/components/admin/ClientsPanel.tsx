import { useMemo, useState } from "react";

import {
  ArrowLeft,
  ExternalLink,
  FileText,
  FolderOpen,
  Headphones,
  Mail,
  Building2,
  Phone,
  Search,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import { supabase } from "../../services/supabase";
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
  company: string | null;
};

type QuoteRequest = {
  id: string;
  user_id: string;
  service: string;
  message: string;
  status: string;
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

type ClientDocument = {
  id: string;
  user_id: string;
  title: string;
  document_type: string;
  file_path: string;
  created_at: string;
};

type SupportTicket = {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

const CLIENTS_PER_PAGE = 8;

type ClientsPanelProps = {
  profiles: ClientProfile[];
  quotes?: QuoteRequest[];
  services?: ClientService[];
  documents?: ClientDocument[];
  tickets?: SupportTicket[];
};

type ClientActivityFilter =
  | "all"
  | "quotes"
  | "services"
  | "documents"
  | "support";

function ClientsPanel({
  profiles,
  quotes = [],
  services = [],
  documents = [],
  tickets = [],
}: ClientsPanelProps) {
  const { locale, intlLocale } = useLanguage();

  const at = (key: AdminCopyKey) =>
    translate(
      adminTranslations,
      locale,
      `admin.copy.${key}`
    );

  const [search, setSearch] = useState("");
  const [clientActivityFilter, setClientActivityFilter] =
    useState<ClientActivityFilter>("all");
  const [clientPage, setClientPage] = useState(1);
  const [selectedClientId, setSelectedClientId] =
    useState<string | null>(null);
  const [openingDocumentId, setOpeningDocumentId] =
    useState<string | null>(null);

  const [documentError, setDocumentError] =
    useState("");

  const clientActivityCounts = useMemo(() => {
    const quoteUsers = new Set(
      quotes.map((quote) => quote.user_id)
    );
    const serviceUsers = new Set(
      services.map((service) => service.user_id)
    );
    const documentUsers = new Set(
      documents.map((document) => document.user_id)
    );
    const supportUsers = new Set(
      tickets.map((ticket) => ticket.user_id)
    );

    return {
      all: profiles.length,
      quotes: profiles.filter((profile) =>
        quoteUsers.has(profile.id)
      ).length,
      services: profiles.filter((profile) =>
        serviceUsers.has(profile.id)
      ).length,
      documents: profiles.filter((profile) =>
        documentUsers.has(profile.id)
      ).length,
      support: profiles.filter((profile) =>
        supportUsers.has(profile.id)
      ).length,
    };
  }, [profiles, quotes, services, documents, tickets]);

  const filteredProfiles = useMemo(() => {
    const value = search.trim().toLowerCase();

    return profiles.filter((profile) => {
      const fullName = [
        profile.first_name,
        profile.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const email =
        profile.email?.toLowerCase() ?? "";

      const phone =
        profile.phone?.toLowerCase() ?? "";

      const company =
        profile.company?.toLowerCase() ?? "";

      const matchesSearch =
        !value ||
        fullName.includes(value) ||
        email.includes(value) ||
        phone.includes(value) ||
        company.includes(value);

      if (!matchesSearch) {
        return false;
      }

      switch (clientActivityFilter) {
        case "quotes":
          return quotes.some(
            (quote) => quote.user_id === profile.id
          );

        case "services":
          return services.some(
            (service) => service.user_id === profile.id
          );

        case "documents":
          return documents.some(
            (document) => document.user_id === profile.id
          );

        case "support":
          return tickets.some(
            (ticket) => ticket.user_id === profile.id
          );

        default:
          return true;
      }
    });
  }, [
    profiles,
    search,
    clientActivityFilter,
    quotes,
    services,
    documents,
    tickets,
  ]);

  const organizedProfiles = useMemo(() => {
    return [...filteredProfiles].sort((a, b) => {
      const nameA = [a.first_name, a.last_name]
        .filter(Boolean)
        .join(" ").trim() || a.email || at("clientTsbTitle");
      const nameB = [b.first_name, b.last_name]
        .filter(Boolean)
        .join(" ").trim() || b.email || at("clientTsbTitle");

      return nameA.localeCompare(nameB, intlLocale, {
        sensitivity: "base",
      });
    });
  }, [filteredProfiles, intlLocale, locale]);

  const totalClientPages = Math.max(
    1,
    Math.ceil(organizedProfiles.length / CLIENTS_PER_PAGE)
  );

  const safeClientPage = Math.min(
    clientPage,
    totalClientPages
  );

  const paginatedProfiles = useMemo(() => {
    const start =
      (safeClientPage - 1) * CLIENTS_PER_PAGE;

    return organizedProfiles.slice(
      start,
      start + CLIENTS_PER_PAGE
    );
  }, [organizedProfiles, safeClientPage]);

  const selectedClient = useMemo(
    () =>
      profiles.find(
        (profile) =>
          profile.id === selectedClientId
      ) ?? null,
    [profiles, selectedClientId]
  );

  const selectedQuotes = useMemo(
    () =>
      quotes.filter(
        (quote) =>
          quote.user_id === selectedClientId
      ),
    [quotes, selectedClientId]
  );

  const selectedDocuments = useMemo(
    () =>
      documents.filter(
        (document) =>
          document.user_id === selectedClientId
      ),
    [documents, selectedClientId]
  );

  const selectedTickets = useMemo(
    () =>
      tickets.filter(
        (ticket) =>
          ticket.user_id === selectedClientId
      ),
    [tickets, selectedClientId]
  );

  const selectedServices = useMemo(() => {
    return Array.from(
      new Set(
        services
          .filter(
            (service) =>
              service.user_id === selectedClientId
          )
          .map((service) => service.service)
      )
    );
  }, [services, selectedClientId]);

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

    return fullName || at("clientTsbTitle");
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat(intlLocale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getQuoteStatusLabel = (
    status: string
  ) => {
    switch (status) {
      case "received":
        return at("receivedFeminine");

      case "in_progress":
        return at("inProgress");

      case "completed":
        return at("completed_3");

      case "cancelled":
        return at("cancelled_3");

      default:
        return status;
    }
  };

  const getSupportStatusLabel = (
    status: string
  ) => {
    switch (status) {
      case "open":
        return at("open_2");

      case "in_progress":
        return at("inProgress");

      case "resolved":
        return at("resolved");

      case "closed":
        return at("closed");

      default:
        return status;
    }
  };

  const getDocumentTypeLabel = (
    type: string
  ) => {
    switch (type) {
      case "quote":
        return at("quotes");

      case "invoice":
        return at("invoice");

      case "report":
        return at("reportSingular");

      case "certificate":
        return at("certificateSingular");

      case "other":
        return at("documentSingular");

      default:
        return type;
    }
  };

  /*
    ========================================================
    DOSSIER CLIENT
    ========================================================
  */
  const handleOpenDocument = async (
    clientDocument: ClientDocument
  ) => {
    if (openingDocumentId) {
      return;
    }

    setOpeningDocumentId(clientDocument.id);
    setDocumentError("");

    const previewWindow = window.open(
      "about:blank",
      "_blank"
    );

    const { data, error } = await supabase.storage
      .from("client-documents")
      .createSignedUrl(
        clientDocument.file_path,
        60
      );

    setOpeningDocumentId(null);

    if (error || !data?.signedUrl) {
      console.error(
        "Erreur ouverture document admin :",
        error
      );

      if (previewWindow) {
        previewWindow.close();
      }

      setDocumentError(
        at("documentOpenError")
      );

      return;
    }

    if (previewWindow) {
      previewWindow.opener = null;
      previewWindow.location.href =
        data.signedUrl;
    } else {
      window.location.href =
        data.signedUrl;
    }
  };
  if (selectedClient) {
    return (
      <section
        className="login-card"
        style={{
          marginTop: "22px",
        }}
      >
        <button
          type="button"
          onClick={() =>
            setSelectedClientId(null)
          }
          className="login-back"
          style={{
            border: 0,
            background: "transparent",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            marginBottom: "24px",
          }}
        >
          <ArrowLeft size={17} />
          {at("backToClients")}
        </button>

        {/* PROFIL CLIENT */}

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "rgba(22,136,255,0.12)",
                border:
                  "1px solid rgba(22,136,255,0.2)",
              }}
            >
              <UserRound
                size={27}
                style={{
                  color: "#53a7ff",
                }}
              />
            </div>

            <div>
              <span className="login-card__eyebrow">
                {at("clientFile")}
              </span>

              <h2
                style={{
                  margin: "4px 0 0",
                }}
              >
                {getClientName(
                  selectedClient
                )}
              </h2>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: "8px",
              color:
                "rgba(255,255,255,0.65)",
              fontSize: "0.85rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Mail size={16} />

              {selectedClient.email ||
                at("emailNotProvided")}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Phone size={16} />

              {selectedClient.phone ||
                at("phoneNotProvided")}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Building2 size={16} />

              {selectedClient.company ||
                at("companyNotProvided")}
            </div>
          </div>
        </div>

        {/* COMPTEURS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "14px",
            marginBottom: "26px",
          }}
        >
          <div
            style={{
              padding: "18px",
              borderRadius: "14px",
              border:
                "1px solid rgba(255,255,255,0.08)",
              background:
                "rgba(255,255,255,0.035)",
            }}
          >
            <FileText
              size={22}
              style={{
                color: "#1688ff",
              }}
            />

            <h3
              style={{
                margin: "10px 0 3px",
                color: "#fff",
              }}
            >
              {selectedQuotes.length}
            </h3>

            <span
              style={{
                color:
                  "rgba(255,255,255,0.5)",
                fontSize: "0.78rem",
              }}
            >
              {at("requests")}
            </span>
          </div>

          <div
            style={{
              padding: "18px",
              borderRadius: "14px",
              border:
                "1px solid rgba(255,255,255,0.08)",
              background:
                "rgba(255,255,255,0.035)",
            }}
          >
            <Wrench
              size={22}
              style={{
                color: "#1688ff",
              }}
            />

            <h3
              style={{
                margin: "10px 0 3px",
                color: "#fff",
              }}
            >
              {selectedServices.length}
            </h3>

            <span
              style={{
                color:
                  "rgba(255,255,255,0.5)",
                fontSize: "0.78rem",
              }}
            >
              {at("servicesLabel")}
            </span>
          </div>

          <div
            style={{
              padding: "18px",
              borderRadius: "14px",
              border:
                "1px solid rgba(255,255,255,0.08)",
              background:
                "rgba(255,255,255,0.035)",
            }}
          >
            <FolderOpen
              size={22}
              style={{
                color: "#1688ff",
              }}
            />

            <h3
              style={{
                margin: "10px 0 3px",
                color: "#fff",
              }}
            >
              {selectedDocuments.length}
            </h3>

            <span
              style={{
                color:
                  "rgba(255,255,255,0.5)",
                fontSize: "0.78rem",
              }}
            >
              {at("documents")}
            </span>
          </div>

          <div
            style={{
              padding: "18px",
              borderRadius: "14px",
              border:
                "1px solid rgba(255,255,255,0.08)",
              background:
                "rgba(255,255,255,0.035)",
            }}
          >
            <Headphones
              size={22}
              style={{
                color: "#1688ff",
              }}
            />

            <h3
              style={{
                margin: "10px 0 3px",
                color: "#fff",
              }}
            >
              {selectedTickets.length}
            </h3>

            <span
              style={{
                color:
                  "rgba(255,255,255,0.5)",
                fontSize: "0.78rem",
              }}
            >
              {at("ticketsLabel")}
            </span>
          </div>
        </div>

        {/* DEMANDES */}

        <div
          style={{
            paddingTop: "22px",
            borderTop:
              "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span className="login-card__eyebrow">
            {at("requestsUpper")}
          </span>

          <h3
            style={{
              color: "#fff",
              margin: "5px 0 16px",
            }}
          >
            {at("quoteRequests")}
          </h3>

          {selectedQuotes.length === 0 ? (
            <p className="login-card__intro">
              {at("noRequestRecordedForThisClient")}
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {selectedQuotes.map(
                (quote) => (
                  <article
                    key={quote.id}
                    style={{
                      padding: "18px",
                      border:
                        "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "14px",
                      background:
                        "rgba(255,255,255,0.035)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        gap: "14px",
                        flexWrap: "wrap",
                      }}
                    >
                      <strong
                        style={{
                          color: "#fff",
                        }}
                      >
                        {quote.service}
                      </strong>

                      <span
                        style={{
                          color: "#53a7ff",
                          fontSize:
                            "0.75rem",
                          fontWeight: 800,
                        }}
                      >
                        {getQuoteStatusLabel(
                          quote.status
                        )}
                      </span>
                    </div>

                    <p
                      style={{
                        color:
                          "rgba(255,255,255,0.65)",
                        lineHeight: 1.6,
                        whiteSpace:
                          "pre-wrap",
                      }}
                    >
                      {quote.message}
                    </p>

                    <small
                      style={{
                        color:
                          "rgba(255,255,255,0.35)",
                      }}
                    >
                      {formatDate(
                        quote.created_at
                      )}
                    </small>
                  </article>
                )
              )}
            </div>
          )}
        </div>

        {/* SERVICES */}

        <div
          style={{
            marginTop: "28px",
            paddingTop: "22px",
            borderTop:
              "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span className="login-card__eyebrow">
            {at("servicesUpper")}
          </span>

          <h3
            style={{
              color: "#fff",
              margin: "5px 0 16px",
            }}
          >
            {at("clientServices")}
          </h3>

          {selectedServices.length === 0 ? (
            <p className="login-card__intro">
              {at("noAssociatedService")}
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {selectedServices.map(
                (service) => (
                  <span
                    key={service}
                    style={{
                      padding:
                        "9px 13px",
                      borderRadius:
                        "999px",
                      background:
                        "rgba(22,136,255,0.12)",
                      border:
                        "1px solid rgba(22,136,255,0.25)",
                      color:
                        "#53a7ff",
                      fontSize:
                        "0.8rem",
                      fontWeight: 700,
                    }}
                  >
                    {service}
                  </span>
                )
              )}
            </div>
          )}
        </div>

        {/* DOCUMENTS */}

        <div
          style={{
            marginTop: "28px",
            paddingTop: "22px",
            borderTop:
              "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span className="login-card__eyebrow">
            {at("documents50d59b")}
          </span>

          <h3
            style={{
              color: "#fff",
              margin: "5px 0 16px",
            }}
          >
            {at("clientDocuments_2")}
          </h3>
          {documentError && (
  <p className="login-form-message">
    {documentError}
  </p>
)}

          {selectedDocuments.length ===
          0 ? (
            <p className="login-card__intro">
              {at("noDocumentAvailable")}
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "12px",
              }}
            >
              {selectedDocuments.map(
                (clientDocument) => (
                  <article
                    key={
                      clientDocument.id
                    }
                    style={{
                      padding: "18px",
                      border:
                        "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "14px",
                      background:
                        "rgba(255,255,255,0.035)",
                    }}
                  >
                    <FolderOpen
                      size={23}
                      style={{
                        color:
                          "#1688ff",
                      }}
                    />

                    <span
                      className="login-card__eyebrow"
                      style={{
                        display: "block",
                        marginTop: "10px",
                      }}
                    >
                      {getDocumentTypeLabel(
                        clientDocument.document_type
                      )}
                    </span>

                    <strong
                      style={{
                        display: "block",
                        marginTop: "5px",
                        color: "#fff",
                      }}
                    >
                      {
                        clientDocument.title
                      }
                    </strong>

                    <small
                      style={{
                        display: "block",
                        marginTop: "10px",
                        color:
                          "rgba(255,255,255,0.35)",
                      }}
                    >
                      {formatDate(
                        clientDocument.created_at
                      )}
                    </small>
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
    width: "100%",
    marginTop: "16px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  }}
>
  <ExternalLink size={16} />

  {openingDocumentId ===
  clientDocument.id
    ? at("opening")
    : at("openDocument")}
</button>
                  </article>
                )
              )}
            </div>
          )}
        </div>

        {/* SUPPORT */}

        <div
          style={{
            marginTop: "28px",
            paddingTop: "22px",
            borderTop:
              "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span className="login-card__eyebrow">
            {at("support256fc6")}
          </span>

          <h3
            style={{
              color: "#fff",
              margin: "5px 0 16px",
            }}
          >
            {at("supportTickets")}
          </h3>

          {selectedTickets.length === 0 ? (
            <p className="login-card__intro">
              {at("noSupportTicket")}
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {selectedTickets.map(
                (ticket) => (
                  <article
                    key={ticket.id}
                    style={{
                      padding: "18px",
                      border:
                        "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "14px",
                      background:
                        "rgba(255,255,255,0.035)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <strong
                        style={{
                          color: "#fff",
                        }}
                      >
                        {ticket.subject}
                      </strong>

                      <span
                        style={{
                          color: "#53a7ff",
                          fontSize:
                            "0.75rem",
                          fontWeight: 800,
                        }}
                      >
                        {getSupportStatusLabel(
                          ticket.status
                        )}
                      </span>
                    </div>

                    <p
                      style={{
                        color:
                          "rgba(255,255,255,0.65)",
                        lineHeight: 1.6,
                        whiteSpace:
                          "pre-wrap",
                      }}
                    >
                      {ticket.message}
                    </p>

                    <small
                      style={{
                        color:
                          "rgba(255,255,255,0.35)",
                      }}
                    >
                      {formatDate(
                        ticket.created_at
                      )}
                    </small>
                  </article>
                )
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  /*
    ========================================================
    LISTE DES CLIENTS
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
          <span className="login-card__eyebrow">{at("clientsUpper")}</span>
          <h2 style={{ marginBottom: "8px" }}>{at("clientManagement")}</h2>
          <p className="login-card__intro" style={{ marginBottom: 0 }}>
            {at("clientManagementIntroExact")}
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
          <Users size={22} style={{ color: "#53a7ff", marginBottom: "4px" }} />
          <strong style={{ display: "block", color: "#ffffff", fontSize: "1.35rem" }}>
            {profiles.length}
          </strong>
        </div>
      </div>

      <div
        style={{
          padding: "18px",
          marginBottom: "18px",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.025)",
        }}
      >
        <label
          htmlFor="admin-client-search"
          style={{
            display: "block",
            marginBottom: "7px",
            color: "rgba(255,255,255,0.65)",
            fontSize: "0.78rem",
            fontWeight: 700,
          }}
        >
          {at("searchClient")}
        </label>
        <div style={{ position: "relative" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(255,255,255,0.4)",
              pointerEvents: "none",
            }}
          />
          <input
            id="admin-client-search"
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setClientPage(1);
            }}
            placeholder={at("nameCompanyEmailOrPhone")}
            style={{
              width: "100%",
              minHeight: "44px",
              padding: "0 14px 0 44px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "#0f1d2e",
              color: "#ffffff",
              outline: "none",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "18px",
        }}
      >
        {[
          ["all", at("all"), clientActivityCounts.all],
          ["quotes", at("withQuotes"), clientActivityCounts.quotes],
          ["services", at("withInterventions"), clientActivityCounts.services],
          ["documents", at("withDocuments"), clientActivityCounts.documents],
          ["support", at("withSupport"), clientActivityCounts.support],
        ].map(([value, label, count]) => {
          const active =
            clientActivityFilter === value;

          return (
            <button
              key={String(value)}
              type="button"
              onClick={() => {
                setClientActivityFilter(
                  value as ClientActivityFilter
                );
                setClientPage(1);
              }}
              style={{
                minHeight: "38px",
                padding: "0 12px",
                borderRadius: "999px",
                border: active
                  ? "1px solid rgba(83,167,255,0.62)"
                  : "1px solid rgba(255,255,255,0.1)",
                background: active
                  ? "rgba(22,136,255,0.16)"
                  : "rgba(255,255,255,0.035)",
                color: active
                  ? "#7fc0ff"
                  : "rgba(255,255,255,0.72)",
                fontSize: "0.76rem",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {String(label)} ({Number(count)})
            </button>
          );
        })}
      </div>

      <div
        style={{
          marginBottom: "18px",
          color:
            "rgba(255,255,255,0.5)",
          fontSize: "0.8rem",
        }}
      >
        {profiles.length}{" "}
        {profiles.length === 1
          ? at("registeredClientSingular")
          : at("registeredClientsPlural")}
        {(search.trim() ||
          clientActivityFilter !== "all") && (
          <>
            {" • "}
            {organizedProfiles.length}{" "}
            {organizedProfiles.length === 1
              ? at("resultSingular")
              : at("resultsPlural")}
          </>
        )}
      </div>

      {profiles.length === 0 && (
        <div
          style={{
            padding: "38px 0",
            textAlign: "center",
            color:
              "rgba(255,255,255,0.5)",
          }}
        >
          <Users
            size={40}
            strokeWidth={1.4}
            style={{
              marginBottom: "12px",
            }}
          />

          <p style={{ margin: 0 }}>
            {at("noClientIsCurrentlyRegistered")}
          </p>
        </div>
      )}

      {profiles.length > 0 &&
        filteredProfiles.length === 0 && (
          <div
            style={{
              padding: "38px 0",
              textAlign: "center",
              color:
                "rgba(255,255,255,0.5)",
            }}
          >
            <Search
              size={36}
              strokeWidth={1.4}
              style={{
                marginBottom: "12px",
              }}
            />

            <p style={{ margin: 0 }}>
              {at("noClientMatchesThisSearch")}
            </p>
          </div>
        )}

      {filteredProfiles.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "14px",
          }}
        >
          {paginatedProfiles.map(
            (profile) => (
              <button
                type="button"
                key={profile.id}
                onClick={() =>
                  setSelectedClientId(
                    profile.id
                  )
                }
                style={{
                  padding: "20px",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "14px",
                  background:
                    "rgba(255,255,255,0.035)",
                  textAlign: "left",
                  cursor: "pointer",
                  font: "inherit",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "center",
                      background:
                        "rgba(22,136,255,0.12)",
                      border:
                        "1px solid rgba(22,136,255,0.2)",
                    }}
                  >
                    <UserRound
                      size={22}
                      style={{
                        color:
                          "#53a7ff",
                      }}
                    />
                  </div>

                  <div>
                    <span className="login-card__eyebrow">
                      {at("clientef10c6")}
                    </span>

                    <h3
                      style={{
                        margin:
                          "4px 0 0",
                        color: "#ffffff",
                        fontSize: "1rem",
                      }}
                    >
                      {getClientName(
                        profile
                      )}
                    </h3>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: "11px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      color:
                        "rgba(255,255,255,0.65)",
                      fontSize:
                        "0.84rem",
                    }}
                  >
                    <Mail size={16} />

                    <span
                      style={{
                        overflowWrap:
                          "anywhere",
                      }}
                    >
                      {profile.email ||
                        at("emailNotProvided")}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      color:
                        "rgba(255,255,255,0.65)",
                      fontSize:
                        "0.84rem",
                    }}
                  >
                    <Phone size={16} />

                    <span>
                      {profile.phone ||
                        at("phoneNotProvided")}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      color:
                        profile.company
                          ? "rgba(255,255,255,0.72)"
                          : "rgba(255,255,255,0.38)",
                      fontSize:
                        "0.84rem",
                    }}
                  >
                    <Building2 size={16} />

                    <span
                      style={{
                        overflowWrap:
                          "anywhere",
                      }}
                    >
                      {profile.company ||
                        at("companyNotProvided")}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    marginTop: "15px",
                  }}
                >
                  {[
                    [
                      at("quotes"),
                      quotes.filter(
                        (quote) =>
                          quote.user_id === profile.id
                      ).length,
                    ],
                    [
                      at("interventions"),
                      services.filter(
                        (service) =>
                          service.user_id === profile.id
                      ).length,
                    ],
                    [
                      at("documents"),
                      documents.filter(
                        (document) =>
                          document.user_id === profile.id
                      ).length,
                    ],
                    [
                      at("support"),
                      tickets.filter(
                        (ticket) =>
                          ticket.user_id === profile.id
                      ).length,
                    ],
                  ].map(([label, count]) => (
                    <span
                      key={String(label)}
                      style={{
                        padding: "5px 8px",
                        borderRadius: "999px",
                        border:
                          "1px solid rgba(255,255,255,0.08)",
                        background:
                          "rgba(255,255,255,0.035)",
                        color:
                          Number(count) > 0
                            ? "rgba(255,255,255,0.72)"
                            : "rgba(255,255,255,0.34)",
                        fontSize: "0.67rem",
                        fontWeight: 750,
                      }}
                    >
                      {String(label)} {Number(count)}
                    </span>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: "14px",
                    paddingTop: "14px",
                    borderTop:
                      "1px solid rgba(255,255,255,0.06)",
                    color: "#53a7ff",
                    fontSize: "0.76rem",
                    fontWeight: 800,
                  }}
                >
                  {at("openFile5ca14a")}
                </div>
              </button>
            )
          )}
        </div>
      )}

      {organizedProfiles.length > CLIENTS_PER_PAGE && (
        <div
          style={{
            marginTop: "18px",
            paddingTop: "16px",
            borderTop:
              "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.78rem",
            }}
          >
            {at("page")} {safeClientPage} {at("of")} {totalClientPages}
            {" • "}
            {organizedProfiles.length}{" "}
            {organizedProfiles.length === 1
              ? at("clientCountSingular")
              : at("clientCountPlural")}
          </span>

          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <button
              type="button"
              disabled={safeClientPage <= 1}
              onClick={() =>
                setClientPage((page) =>
                  Math.max(1, page - 1)
                )
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
                  safeClientPage <= 1
                    ? "rgba(255,255,255,0.28)"
                    : "#ffffff",
                cursor:
                  safeClientPage <= 1
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              ← {at("previous")}
            </button>

            <button
              type="button"
              disabled={safeClientPage >= totalClientPages}
              onClick={() =>
                setClientPage((page) =>
                  Math.min(totalClientPages, page + 1)
                )
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
                  safeClientPage >= totalClientPages
                    ? "rgba(255,255,255,0.28)"
                    : "#ffffff",
                cursor:
                  safeClientPage >= totalClientPages
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {at("next")} →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default ClientsPanel;