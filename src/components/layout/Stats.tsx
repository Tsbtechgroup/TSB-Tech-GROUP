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

const statConfig = [
  {
    id: "interventions",
    value: "+5000",
    icon: Wrench,
  },
  {
    id: "clients",
    value: "+3500",
    icon: Users,
  },
  {
    id: "domains",
    value: "Multi",
    icon: LayoutGrid,
  },
  {
    id: "support",
    value: "24/7",
    icon: Headphones,
  },
  {
    id: "quality",
    value: "100%",
    icon: ShieldCheck,
  },
] as const;

function Stats() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      statsTranslations,
      locale,
      `stats.${key}`
    );

  return (
    <section
      className="stats-section"
      aria-label={t("ariaLabel")}
    >
      <div className="container stats-grid">
        {statConfig.map(({ id, value, icon: Icon }) => (
          <article className="stat-item" key={id}>
            <div className="stat-icon">
              <Icon size={30} strokeWidth={1.7} />
            </div>

            <div>
              <strong>{value}</strong>
              <span>{t(`labels.${id}`)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}





























export default Stats;
