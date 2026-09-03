import { useEffect, useState } from "react";

import {
  Headphones,
  LayoutGrid,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";

import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { statsTranslations } from "../../i18n/locales/stats";
import { supabase } from "../../services/supabase";

type PublicStats = {
  clients: number;
  completed_services: number;
  orders: number;
  quote_requests: number;
  published_products: number;
  launch_at: string | null;
};

type PublicMetricKey =
  | "clients"
  | "completed_services"
  | "orders"
  | "quote_requests"
  | "published_products";

const statConfig: ReadonlyArray<{
  id: PublicMetricKey;
  icon: typeof Users;
}> = [
  {
    id: "clients",
    icon: Users,
  },
  {
    id: "completed_services",
    icon: Wrench,
  },
  {
    id: "orders",
    icon: LayoutGrid,
  },
  {
    id: "quote_requests",
    icon: Headphones,
  },
  {
    id: "published_products",
    icon: ShieldCheck,
  },
];

const normalizeStats = (
  data: unknown
): PublicStats | null => {
  const raw = Array.isArray(data)
    ? data[0]
    : data;

  if (
    !raw ||
    typeof raw !== "object"
  ) {
    return null;
  }

  const row = raw as Record<
    string,
    unknown
  >;

  return {
    clients: Number(
      row.clients ?? 0
    ),
    completed_services: Number(
      row.completed_services ?? 0
    ),
    orders: Number(
      row.orders ?? 0
    ),
    quote_requests: Number(
      row.quote_requests ?? 0
    ),
    published_products: Number(
      row.published_products ?? 0
    ),
    launch_at:
      typeof row.launch_at === "string"
        ? row.launch_at
        : null,
  };
};

function Stats() {
  const { locale } = useLanguage();

  const [stats, setStats] =
    useState<PublicStats | null>(null);

  const t = (key: string) =>
    translate(
      statsTranslations,
      locale,
      `stats.${key}`
    );

  useEffect(() => {
    let mounted = true;

    const loadPublicStats =
      async () => {
        const { data, error } =
          await supabase.rpc(
            "get_public_stats"
          );

        if (error) {
          console.error(
            "Erreur chargement statistiques publiques :",
            error
          );
          return;
        }

        const nextStats =
          normalizeStats(data);

        if (
          mounted &&
          nextStats
        ) {
          setStats(nextStats);
        }
      };

    void loadPublicStats();

    const intervalId =
      window.setInterval(
        () => {
          void loadPublicStats();
        },
        60_000
      );

    const handleFocus = () => {
      void loadPublicStats();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      mounted = false;

      window.clearInterval(
        intervalId
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, []);

  const getValue = (
    id: PublicMetricKey
  ) => {
    if (!stats) {
      return "—";
    }

    return String(stats[id]);
  };

  return (
    <section
      className="stats-section"
      aria-label={t("ariaLabel")}
    >
      <div className="container stats-grid">
        {statConfig.map(
          ({ id, icon: Icon }) => (
            <article
              className="stat-item"
              key={id}
            >
              <div className="stat-icon">
                <Icon
                  size={30}
                  strokeWidth={1.7}
                />
              </div>

              <div>
                <strong>
                  {getValue(id)}
                </strong>

                <span>
                  {t(`labels.${id}`)}
                </span>
              </div>
            </article>
          )
        )}
      </div>
    </section>
  );
}

export default Stats;
