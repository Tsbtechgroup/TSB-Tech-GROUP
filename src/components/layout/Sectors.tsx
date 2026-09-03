import {
  Building2,
  CarFront,
  Factory,
  GraduationCap,
  HeartPulse,
  Hotel,
  Landmark,
  ShoppingBag,
  Sprout,
  UserRound,
} from "lucide-react";

import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { sectorsTranslations } from "../../i18n/locales/sectors";

const sectorConfig = [
  { id: "individuals", icon: UserRound },
  { id: "businesses", icon: Building2 },
  { id: "industries", icon: Factory },
  { id: "shops", icon: ShoppingBag },
  { id: "hotels", icon: Hotel },
  { id: "schools", icon: GraduationCap },
  { id: "hospitals", icon: HeartPulse },
  { id: "agriculture", icon: Sprout },
  { id: "administrations", icon: Landmark },
  { id: "automotive", icon: CarFront },
] as const;

function Sectors() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      sectorsTranslations,
      locale,
      `sectors.${key}`
    );

  return (
    <section id="sectors" className="sectors-section">
      <div className="container">
        <div className="sectors-heading">
          <span className="section__eyebrow">
            {t("eyebrow")}
          </span>

          <h2>
            {t("title1")} <span>{t("title2")}</span>
          </h2>

          <p>{t("description")}</p>
        </div>

        <div className="sectors-grid">
          {sectorConfig.map(({ id, icon: Icon }) => (
            <article
              className="sector-card"
              key={id}
            >
              <div className="sector-card__icon">
                <Icon size={27} strokeWidth={1.7} />
              </div>

              <span>{t(`items.${id}`)}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}



























































export default Sectors;
