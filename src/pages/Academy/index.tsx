import {
  ArrowRight,
  BookOpen,
  Building2,
  Car,
  Cpu,
  Globe2,
  GraduationCap,
  Handshake,
  KeyRound,
  Landmark,
  MonitorSmartphone,
  Network,
  Settings2,
  ShieldCheck,
  Users,
  Wrench,
  Zap,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { academyTranslations } from "../../i18n/locales/academy";

const domains = [
  { id: "automotive", icon: Car, color: "blue" },
  { id: "autokeys", icon: KeyRound, color: "purple" },
  { id: "energy", icon: Zap, color: "orange" },
  { id: "security", icon: ShieldCheck, color: "green" },
  { id: "electronics", icon: Cpu, color: "cyan" },
  { id: "networks", icon: Network, color: "blue" },
  { id: "automation", icon: Settings2, color: "purple" },
  { id: "digital", icon: MonitorSmartphone, color: "cyan" },
] as const;

const formats = [
  { id: "onsite", icon: GraduationCap },
  { id: "workshop", icon: Wrench },
  { id: "intensive", icon: BookOpen },
  { id: "company", icon: Building2 },
] as const;

const method = [
  "understand",
  "practice",
  "diagnose",
  "deliver",
  "progress",
] as const;

const audiences = [
  { id: "beginners", icon: BookOpen },
  { id: "technicians", icon: Wrench },
  { id: "professionals", icon: Users },
  { id: "companies", icon: Building2 },
  { id: "institutions", icon: Landmark },
] as const;

function Academy() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(academyTranslations, locale, `academy.${key}`);

  const launchMailHref = `mailto:contact@tsbtechgroup.com?subject=${encodeURIComponent(
    t("launchEmailSubject")
  )}`;

  const partnerMailHref = `mailto:contact@tsbtechgroup.com?subject=${encodeURIComponent(
    t("partnerEmailSubject")
  )}`;

  return (
    <div>
      <Navbar />

      <main>
        <section id="academy-top" className="section section--about">
          <div className="container">
            <div
              className="section-heading"
              style={{
                textAlign: "center",
                maxWidth: "940px",
                margin: "0 auto",
              }}
            >
              <span className="section__eyebrow">{t("eyebrow")}</span>

              <h1>
                {t("title1")} <span>{t("title2")}</span>
              </h1>

              <p
                style={{
                  maxWidth: "790px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {t("intro")}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                <a href="/#top" className="button button--secondary">
                  ← {t("backHome")}
                </a>

                <a href="#domains" className="button button--secondary">
                  {t("discoverTraining")}
                </a>

                <a href={launchMailHref} className="button button--primary">
                  {t("notify")}
                  <ArrowRight size={17} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div
              style={{
                maxWidth: "920px",
                margin: "0 auto",
                padding: "30px",
                borderRadius: "22px",
                border: "1px solid rgba(139,92,246,0.28)",
                background:
                  "linear-gradient(135deg, rgba(139,92,246,0.11), rgba(59,130,246,0.06))",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "58px",
                  height: "58px",
                  margin: "0 auto 16px",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "17px",
                  background: "rgba(139,92,246,0.14)",
                  border: "1px solid rgba(167,139,250,0.30)",
                }}
              >
                <GraduationCap size={28} strokeWidth={1.8} />
              </div>

              <span className="section__eyebrow">{t("comingSoon")}</span>

              <h2 style={{ marginTop: "10px" }}>
                {t("comingSoonTitle")}
              </h2>

              <p
                style={{
                  maxWidth: "740px",
                  margin: "12px auto 0",
                }}
              >
                {t("comingSoonText")}
              </p>
            </div>
          </div>
        </section>

        <section id="vision" className="section section--domains">
          <div className="container">
            <div
              className="section-heading"
              style={{
                textAlign: "center",
                maxWidth: "820px",
                margin: "0 auto 30px",
              }}
            >
              <span className="section__eyebrow">{t("visionEyebrow")}</span>
              <h2>{t("visionTitle")}</h2>
              <p>{t("visionIntro")}</p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                gap: "16px",
                maxWidth: "1120px",
                margin: "0 auto",
              }}
            >
              {["practical", "useful", "progressive", "accessible"].map((item) => (
                <article
                  key={item}
                  className="domain-card domain-purple"
                  style={{ minHeight: "190px", padding: "20px" }}
                >
                  <div className="domain-card__top">
                    <div className="domain-icon">
                      <BookOpen size={23} strokeWidth={1.8} />
                    </div>
                  </div>

                  <h3>{t(`visionItems.${item}.title`)}</h3>
                  <p>{t(`visionItems.${item}.description`)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="domains" className="section">
          <div className="container">
            <div
              className="section-heading"
              style={{
                textAlign: "center",
                maxWidth: "840px",
                margin: "0 auto 30px",
              }}
            >
              <span className="section__eyebrow">{t("domainsEyebrow")}</span>
              <h2>{t("domainsTitle")}</h2>
              <p>{t("domainsIntro")}</p>
            </div>

            <div
              className="domains-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px",
                maxWidth: "1120px",
                margin: "0 auto",
              }}
            >
              {domains.map((domain) => {
                const Icon = domain.icon;

                return (
                  <article
                    key={domain.id}
                    className={`domain-card domain-${domain.color}`}
                    style={{ minHeight: "220px", padding: "20px" }}
                  >
                    <div className="domain-card__top">
                      <div className="domain-icon">
                        <Icon size={23} strokeWidth={1.8} />
                      </div>
                    </div>

                    <h3>{t(`domains.${domain.id}.title`)}</h3>
                    <p>{t(`domains.${domain.id}.description`)}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="formats" className="section section--domains">
          <div className="container">
            <div
              className="section-heading"
              style={{
                textAlign: "center",
                maxWidth: "820px",
                margin: "0 auto 30px",
              }}
            >
              <span className="section__eyebrow">{t("formatsEyebrow")}</span>
              <h2>{t("formatsTitle")}</h2>
              <p>{t("formatsIntro")}</p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                gap: "16px",
                maxWidth: "1120px",
                margin: "0 auto",
              }}
            >
              {formats.map((format) => {
                const Icon = format.icon;

                return (
                  <article
                    key={format.id}
                    className="domain-card domain-cyan"
                    style={{ minHeight: "190px", padding: "20px" }}
                  >
                    <div className="domain-card__top">
                      <div className="domain-icon">
                        <Icon size={23} strokeWidth={1.8} />
                      </div>
                    </div>

                    <h3>{t(`formats.${format.id}.title`)}</h3>
                    <p>{t(`formats.${format.id}.description`)}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="method" className="section">
          <div className="container">
            <div
              className="section-heading"
              style={{
                textAlign: "center",
                maxWidth: "820px",
                margin: "0 auto 30px",
              }}
            >
              <span className="section__eyebrow">{t("methodEyebrow")}</span>
              <h2>{t("methodTitle")}</h2>
              <p>{t("methodIntro")}</p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                gap: "14px",
                maxWidth: "1120px",
                margin: "0 auto",
              }}
            >
              {method.map((step, index) => (
                <article
                  key={step}
                  className="domain-card domain-blue"
                  style={{ minHeight: "170px", padding: "20px" }}
                >
                  <div
                    style={{
                      fontSize: "0.82rem",
                      opacity: 0.72,
                      marginBottom: "12px",
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <h3>{t(`methodItems.${step}.title`)}</h3>
                  <p>{t(`methodItems.${step}.description`)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="audiences" className="section section--domains">
          <div className="container">
            <div
              className="section-heading"
              style={{
                textAlign: "center",
                maxWidth: "800px",
                margin: "0 auto 30px",
              }}
            >
              <span className="section__eyebrow">{t("audiencesEyebrow")}</span>
              <h2>{t("audiencesTitle")}</h2>
              <p>{t("audiencesIntro")}</p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "14px",
                maxWidth: "1120px",
                margin: "0 auto",
              }}
            >
              {audiences.map((audience) => {
                const Icon = audience.icon;

                return (
                  <article
                    key={audience.id}
                    className="domain-card domain-green"
                    style={{ minHeight: "155px", padding: "18px" }}
                  >
                    <div className="domain-card__top">
                      <div className="domain-icon">
                        <Icon size={21} strokeWidth={1.8} />
                      </div>
                    </div>

                    <h3 style={{ marginBottom: 0 }}>
                      {t(`audiences.${audience.id}`)}
                    </h3>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="international" className="section">
          <div className="container">
            <div
              style={{
                maxWidth: "980px",
                margin: "0 auto",
                padding: "32px",
                borderRadius: "22px",
                border: "1px solid rgba(59,130,246,0.28)",
                background:
                  "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(14,165,233,0.05))",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "58px",
                  height: "58px",
                  margin: "0 auto 16px",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "17px",
                  background: "rgba(59,130,246,0.14)",
                  border: "1px solid rgba(96,165,250,0.30)",
                }}
              >
                <Globe2 size={27} strokeWidth={1.8} />
              </div>

              <span className="section__eyebrow">
                {t("internationalEyebrow")}
              </span>

              <h2>{t("internationalTitle")}</h2>

              <p
                style={{
                  maxWidth: "760px",
                  margin: "12px auto 0",
                }}
              >
                {t("internationalText")}
              </p>

              <p
                style={{
                  marginTop: "20px",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                }}
              >
                {t("reach")}
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div
              style={{
                maxWidth: "940px",
                margin: "0 auto",
                padding: "32px",
                borderRadius: "22px",
                border: "1px solid rgba(139,92,246,0.28)",
                background:
                  "linear-gradient(135deg, rgba(139,92,246,0.10), rgba(59,130,246,0.06))",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "58px",
                  height: "58px",
                  margin: "0 auto 16px",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "17px",
                  background: "rgba(139,92,246,0.14)",
                  border: "1px solid rgba(167,139,250,0.30)",
                }}
              >
                <Handshake size={27} strokeWidth={1.8} />
              </div>

              <span className="section__eyebrow">{t("ctaEyebrow")}</span>
              <h2>{t("ctaTitle")}</h2>

              <p
                style={{
                  maxWidth: "720px",
                  margin: "12px auto 0",
                }}
              >
                {t("ctaText")}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                <a href={launchMailHref} className="button button--primary">
                  {t("notify")}
                  <ArrowRight size={17} aria-hidden="true" />
                </a>

                <a href={partnerMailHref} className="button button--secondary">
                  {t("partnerCta")}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default Academy;
