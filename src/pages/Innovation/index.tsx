import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Boxes,
  Cpu,
  FlaskConical,
  Globe2,
  Handshake,
  Lightbulb,
  Network,
  Rocket,
  Search,
  TestTube2,
  UsersRound,
  Wrench,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { innovationTranslations } from "../../i18n/locales/innovation";

const pillars = [
  { id: "ideas", icon: Lightbulb, color: "cyan" },
  { id: "technology", icon: Cpu, color: "purple" },
  { id: "research", icon: FlaskConical, color: "blue" },
  { id: "connected", icon: Network, color: "green" },
  { id: "future", icon: BrainCircuit, color: "orange" },
] as const;

const processSteps = [
  { id: "idea", icon: Lightbulb },
  { id: "study", icon: Search },
  { id: "prototype", icon: Boxes },
  { id: "test", icon: TestTube2 },
  { id: "deployment", icon: Rocket },
] as const;

const collaborationPoints = [
  { id: "expertise", icon: Wrench },
  { id: "partnership", icon: Handshake },
  { id: "scalable", icon: BadgeCheck },
] as const;

function Innovation() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      innovationTranslations,
      locale,
      `innovation.${key}`
    );

  return (
    <div>
      <style>
        {`
          .innovation-hero {
            position: relative;
            overflow: hidden;
          }

          .innovation-hero::before {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            background:
              radial-gradient(circle at 20% 20%, rgba(34, 211, 238, 0.12), transparent 35%),
              radial-gradient(circle at 82% 35%, rgba(139, 92, 246, 0.12), transparent 38%);
          }

          .innovation-hero__content {
            position: relative;
            z-index: 1;
            max-width: 920px;
            margin: 0 auto;
            text-align: center;
          }

          .innovation-actions {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 26px;
          }

          .innovation-pillars {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            max-width: 1180px;
            margin: 0 auto;
          }

          .innovation-pillar {
            min-height: 220px;
            padding: 22px;
          }

          .innovation-process {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 14px;
            max-width: 1180px;
            margin: 34px auto 0;
          }

          .innovation-step {
            position: relative;
            min-height: 170px;
            padding: 22px 18px;
            border: 1px solid rgba(83, 167, 255, 0.18);
            border-radius: 18px;
            background: linear-gradient(145deg, rgba(8, 20, 39, 0.9), rgba(5, 12, 25, 0.74));
          }

          .innovation-step:not(:last-child)::after {
            content: "";
            position: absolute;
            z-index: 2;
            top: 50%;
            right: -15px;
            width: 16px;
            height: 1px;
            background: linear-gradient(90deg, #1387ff, #27d2ff);
          }

          .innovation-step__number {
            position: absolute;
            top: 14px;
            right: 14px;
            color: rgba(147, 197, 253, 0.52);
            font-size: 0.78rem;
            font-weight: 800;
          }

          .innovation-step__icon {
            width: 48px;
            height: 48px;
            display: grid;
            place-items: center;
            margin-bottom: 20px;
            border: 1px solid rgba(103, 232, 249, 0.28);
            border-radius: 14px;
            color: #67e8f9;
            background: rgba(34, 211, 238, 0.09);
          }

          .innovation-step h3 {
            margin: 0;
            font-size: 1rem;
          }

          .innovation-collaboration {
            display: grid;
            grid-template-columns: minmax(0, 1.08fr) minmax(300px, 0.92fr);
            gap: 26px;
            align-items: stretch;
            max-width: 1120px;
            margin: 0 auto;
          }

          .innovation-collaboration__copy,
          .innovation-collaboration__points,
          .innovation-international,
          .innovation-cta {
            padding: clamp(24px, 4vw, 38px);
            border: 1px solid rgba(83, 167, 255, 0.18);
            border-radius: 22px;
            background: linear-gradient(145deg, rgba(8, 20, 39, 0.9), rgba(5, 12, 25, 0.76));
          }

          .innovation-collaboration__copy p,
          .innovation-international p,
          .innovation-cta p {
            margin-top: 14px;
          }

          .innovation-collaboration__points {
            display: grid;
            gap: 12px;
          }

          .innovation-collaboration__point {
            display: flex;
            align-items: center;
            gap: 13px;
            padding: 14px;
            border: 1px solid rgba(103, 232, 249, 0.14);
            border-radius: 14px;
            background: rgba(34, 211, 238, 0.05);
          }

          .innovation-collaboration__point svg {
            flex: 0 0 auto;
            color: #67e8f9;
          }

          .innovation-international {
            max-width: 980px;
            margin: 0 auto;
            text-align: center;
            background:
              radial-gradient(circle at 50% 0%, rgba(34, 211, 238, 0.12), transparent 55%),
              linear-gradient(145deg, rgba(8, 20, 39, 0.92), rgba(5, 12, 25, 0.78));
          }

          .innovation-international__icon,
          .innovation-cta__icon {
            width: 58px;
            height: 58px;
            display: grid;
            place-items: center;
            margin: 0 auto 18px;
            border: 1px solid rgba(103, 232, 249, 0.28);
            border-radius: 17px;
            color: #67e8f9;
            background: rgba(34, 211, 238, 0.09);
          }

          .innovation-cta {
            max-width: 920px;
            margin: 0 auto;
            text-align: center;
            border-color: rgba(34, 211, 238, 0.24);
            background: linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(139, 92, 246, 0.07));
          }

          @media (max-width: 960px) {
            .innovation-process {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .innovation-step:not(:last-child)::after {
              display: none;
            }

            .innovation-collaboration {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 600px) {
            .innovation-process {
              grid-template-columns: 1fr;
            }

            .innovation-actions .button {
              width: 100%;
              justify-content: center;
            }
          }
        `}
      </style>

      <Navbar />

      <main>
        <section id="innovation-top" className="section section--about innovation-hero">
          <div className="container">
            <div className="innovation-hero__content">
              <span className="section__eyebrow">{t("eyebrow")}</span>
              <h1>
                {t("title1")} <span>{t("title2")}</span>
              </h1>
              <p>{t("intro")}</p>

              <div className="innovation-actions">
                <a href="/#top" className="button button--secondary">
                  ← {t("backHome")}
                </a>
                <a href="/contact" className="button button--primary">
                  {t("contact")} <ArrowRight size={17} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="innovation-pillars" className="section section--domains">
          <div className="container">
            <div className="section-heading" style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 32px" }}>
              <h2>{t("sectionTitle")}</h2>
              <p>{t("sectionIntro")}</p>
            </div>

            <div className="innovation-pillars">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;

                return (
                  <article key={pillar.id} className={`domain-card domain-${pillar.color} innovation-pillar`}>
                    <div className="domain-card__top">
                      <div className="domain-icon">
                        <Icon size={23} strokeWidth={1.8} />
                      </div>
                    </div>
                    <h3>{t(`items.${pillar.id}.title`)}</h3>
                    <p>{t(`items.${pillar.id}.description`)}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="innovation-process" className="section">
          <div className="container">
            <div className="section-heading" style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
              <span className="section__eyebrow">{t("processEyebrow")}</span>
              <h2>{t("processTitle")}</h2>
              <p>{t("processIntro")}</p>
            </div>

            <div className="innovation-process">
              {processSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <article key={step.id} className="innovation-step">
                    <span className="innovation-step__number">0{index + 1}</span>
                    <div className="innovation-step__icon">
                      <Icon size={23} strokeWidth={1.8} />
                    </div>
                    <h3>{t(`process.${step.id}`)}</h3>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="innovation-collaboration" className="section section--domains">
          <div className="container">
            <div className="innovation-collaboration">
              <article className="innovation-collaboration__copy">
                <span className="section__eyebrow">{t("collaborationEyebrow")}</span>
                <h2>{t("collaborationTitle")}</h2>
                <p>{t("collaborationText")}</p>
              </article>

              <div className="innovation-collaboration__points">
                {collaborationPoints.map((point) => {
                  const Icon = point.icon;

                  return (
                    <div key={point.id} className="innovation-collaboration__point">
                      <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                      <strong>{t(`collaborationPoints.${point.id}`)}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="innovation-international" className="section">
          <div className="container">
            <article className="innovation-international">
              <div className="innovation-international__icon">
                <Globe2 size={28} strokeWidth={1.8} />
              </div>
              <span className="section__eyebrow">{t("internationalEyebrow")}</span>
              <h2>{t("internationalTitle")}</h2>
              <p>{t("internationalText")}</p>
            </article>
          </div>
        </section>

        <section id="innovation-project" className="section section--domains">
          <div className="container">
            <article className="innovation-cta">
              <div className="innovation-cta__icon">
                <UsersRound size={28} strokeWidth={1.8} />
              </div>
              <h2>{t("projectTitle")}</h2>
              <p>{t("projectText")}</p>
              <a href="/ecosystem-request?type=innovation" className="button button--primary" style={{ marginTop: "22px" }}>
                {t("projectButton")} <ArrowRight size={17} aria-hidden="true" />
              </a>
            </article>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default Innovation;
