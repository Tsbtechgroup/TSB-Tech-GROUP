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
import {
  getPublicStats,
  type PublicStats,
} from "../../services/api";

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
        try {
          const nextStats =
            await getPublicStats();

          if (mounted) {
            setStats(nextStats);
          }
        } catch (error) {
          console.error(
            "Erreur chargement statistiques publiques :",
            error
          );
        }
      };

    void loadPublicStats();

    const intervalId =
      window.setInterval(
        () => {
          void loadPublicStats();
        },
        300_000
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
