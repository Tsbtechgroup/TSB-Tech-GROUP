import {
  BriefcaseBusiness,
  Building2,
  Car,
  ClipboardCheck,
  Cpu,
  Droplets,
  Globe2,
  GraduationCap,
  Handshake,
  Landmark,
  Network,
  Radio,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
  Wrench,
  Zap,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";
import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { businessTranslations } from "../../i18n/locales/business";

const solutions = [
  { id: "audit", icon: ClipboardCheck, color: "blue" },
  { id: "security", icon: ShieldCheck, color: "green" },
  { id: "network", icon: Network, color: "cyan" },
  { id: "automation", icon: Cpu, color: "purple" },
  { id: "maintenance", icon: Wrench, color: "orange" },
] as const;

const investItems = [
  { id: "investment", icon: BriefcaseBusiness, color: "blue" },
  { id: "strategic", icon: Handshake, color: "green" },
  { id: "jointVenture", icon: Users, color: "cyan" },
  { id: "distribution", icon: Store, color: "purple" },
  { id: "institutions", icon: Landmark, color: "orange" },
  { id: "international", icon: Globe2, color: "blue" },
] as const;

const opportunities = [
  { id: "automotive", icon: Car },
  { id: "energy", icon: Zap },
  { id: "water", icon: Droplets },
  { id: "security", icon: ShieldCheck },
  { id: "automation", icon: Cpu },
  { id: "networks", icon: Radio },
  { id: "digital", icon: Network },
  { id: "academy", icon: GraduationCap },
  { id: "store", icon: ShoppingBag },
  { id: "projects", icon: Rocket },
] as const;

const processItems = ["discover", "review", "exchange", "proposal", "collaboration"] as const;

const businessCtaCopy: Record<
  string,
  { title: string; text: string; button: string }
> = {
  fr: {
    title: "Vous avez une proposition business ?",
    text: "Présentez votre idée, votre projet ou votre opportunité directement à TSB Tech Group depuis notre formulaire dédié à l’écosystème.",
    button: "Proposer votre business",
  },
  nl: {
    title: "Hebt u een businessvoorstel?",
    text: "Stel uw idee, project of opportuniteit rechtstreeks voor aan TSB Tech Group via ons formulier voor het ecosysteem.",
    button: "Uw business voorstellen",
  },
  en: {
    title: "Do you have a business proposal?",
    text: "Present your idea, project or opportunity directly to TSB Tech Group through our dedicated ecosystem form.",
    button: "Submit your business",
  },
  de: {
    title: "Haben Sie einen Businessvorschlag?",
    text: "Präsentieren Sie Ihre Idee, Ihr Projekt oder Ihre Chance direkt der TSB Tech Group über unser Ökosystem-Formular.",
    button: "Business vorschlagen",
  },
  es: {
    title: "¿Tiene una propuesta de negocio?",
    text: "Presente su idea, proyecto u oportunidad directamente a TSB Tech Group mediante nuestro formulario del ecosistema.",
    button: "Proponer su negocio",
  },
  it: {
    title: "Avete una proposta business?",
    text: "Presentate la vostra idea, progetto o opportunità direttamente a TSB Tech Group tramite il modulo dedicato all’ecosistema.",
    button: "Proponete il vostro business",
  },
  pt: {
    title: "Tem uma proposta de negócio?",
    text: "Apresente a sua ideia, projeto ou oportunidade diretamente à TSB Tech Group através do formulário do ecossistema.",
    button: "Propor o seu negócio",
  },
  ar: {
    title: "هل لديكم مقترح أعمال؟",
    text: "قدّموا فكرتكم أو مشروعكم أو فرصتكم مباشرة إلى TSB Tech Group عبر نموذج المنظومة المخصص.",
    button: "تقديم مشروعكم التجاري",
  },
  tr: {
    title: "Bir iş teklifiniz mi var?",
    text: "Fikrinizi, projenizi veya fırsatınızı ekosistem formumuz üzerinden doğrudan TSB Tech Group’a sunun.",
    button: "İş teklifinizi sunun",
  },
  zh: {
    title: "您有商业提案吗？",
    text: "通过我们的生态系统专用表单，直接向 TSB Tech Group 提交您的想法、项目或机会。",
    button: "提交商业提案",
  },
};

function Business() {
  const { locale } = useLanguage();
  const ctaCopy = businessCtaCopy[locale] ?? businessCtaCopy.fr;

  const t = (key: string) =>
    translate(
      businessTranslations,
      locale,
      `business.${key}`
    );

  return (
    <div>
      <Navbar />
      <main>
        <section id="business-top" className="section section--about">
          <div className="container">
            <div className="section-heading" style={{ textAlign: "center", maxWidth: "940px", margin: "0 auto" }}>
              <span className="section__eyebrow">{t("eyebrow")}</span>
              <h1>{t("title1")} <span>{t("title2")}</span></h1>
              <p style={{ maxWidth: "790px", marginLeft: "auto", marginRight: "auto" }}>{t("intro")}</p>
              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "12px", marginTop: "24px" }}>
                <a href="/#top" className="button button--secondary">← {t("backHome")}</a>
                <a href="/contact" className="button button--primary">{t("contact")}</a>
              </div>
            </div>
          </div>
        </section>

        <section
          id="solutions"
          className="section section--domains"
          style={{ paddingBottom: "48px" }}
        >
          <div className="container">
            <div className="section-heading" style={{ textAlign: "center", maxWidth: "820px", margin: "0 auto 30px" }}>
              <span className="section__eyebrow">{t("solutionsEyebrow")}</span>
              <h2>{t("solutionsTitle")}</h2>
              <p>{t("solutionsIntro")}</p>
            </div>
            <div className="domains-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px", maxWidth: "1120px", margin: "0 auto" }}>
              {solutions.map((solution) => {
                const Icon = solution.icon;
                return (
                  <article key={solution.id} className={`domain-card domain-${solution.color}`} style={{ minHeight: "210px", padding: "20px" }}>
                    <div className="domain-card__top"><div className="domain-icon"><Icon size={23} strokeWidth={1.8} /></div></div>
                    <h3>{t(`items.${solution.id}.title`)}</h3>
                    <p>{t(`items.${solution.id}.description`)}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="invest"
          className="section"
          style={{ paddingTop: "48px" }}
        >
          <div className="container">
            <div className="section-heading" style={{ textAlign: "center", maxWidth: "860px", margin: "0 auto 30px" }}>
              <span className="section__eyebrow">{t("investEyebrow")}</span>
              <h2>{t("investTitle1")} <span>{t("investTitle2")}</span></h2>
              <p>{t("investIntro")}</p>
            </div>
            <div className="domains-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", maxWidth: "1120px", margin: "0 auto" }}>
              {investItems.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.id} className={`domain-card domain-${item.color}`} style={{ minHeight: "230px", padding: "22px" }}>
                    <div className="domain-card__top"><div className="domain-icon"><Icon size={24} strokeWidth={1.8} /></div></div>
                    <h3>{t(`investItems.${item.id}.title`)}</h3>
                    <p>{t(`investItems.${item.id}.description`)}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="opportunities" className="section section--domains">
          <div className="container">
            <div className="section-heading" style={{ textAlign: "center", maxWidth: "820px", margin: "0 auto 30px" }}>
              <span className="section__eyebrow">{t("opportunitiesEyebrow")}</span>
              <h2>{t("opportunitiesTitle")}</h2>
              <p>{t("opportunitiesIntro")}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", maxWidth: "1120px", margin: "0 auto" }}>
              {opportunities.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.id} className="domain-card domain-blue" style={{ minHeight: "145px", padding: "18px" }}>
                    <div className="domain-card__top"><div className="domain-icon"><Icon size={21} strokeWidth={1.8} /></div></div>
                    <h3 style={{ marginBottom: 0 }}>{t(`opportunities.${item.id}`)}</h3>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="international" className="section">
          <div className="container">
            <div style={{ maxWidth: "980px", margin: "0 auto", padding: "32px", borderRadius: "22px", border: "1px solid rgba(59,130,246,0.28)", background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(14,165,233,0.05))", textAlign: "center" }}>
              <div style={{ width: "58px", height: "58px", margin: "0 auto 16px", display: "grid", placeItems: "center", borderRadius: "17px", background: "rgba(59,130,246,0.14)", border: "1px solid rgba(96,165,250,0.30)" }}>
                <Globe2 size={27} strokeWidth={1.8} />
              </div>
              <span className="section__eyebrow">{t("internationalEyebrow")}</span>
              <h2>{t("internationalTitle")}</h2>
              <p style={{ maxWidth: "760px", margin: "12px auto 0" }}>{t("internationalText")}</p>
              <p style={{ marginTop: "20px", fontWeight: 700, letterSpacing: "0.02em" }}>{t("reach")}</p>
            </div>
          </div>
        </section>

        <section className="section section--domains">
          <div className="container">
            <div className="section-heading" style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 30px" }}>
              <span className="section__eyebrow">{t("processEyebrow")}</span>
              <h2>{t("processTitle")}</h2>
              <p>{t("processIntro")}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "14px", maxWidth: "1120px", margin: "0 auto" }}>
              {processItems.map((step, index) => (
                <article key={step} className="domain-card domain-cyan" style={{ minHeight: "165px", padding: "20px" }}>
                  <div style={{ fontSize: "0.82rem", opacity: 0.72, marginBottom: "12px" }}>{String(index + 1).padStart(2, "0")}</div>
                  <h3>{t(`processItems.${step}.title`)}</h3>
                  <p>{t(`processItems.${step}.description`)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div style={{ maxWidth: "940px", margin: "0 auto", padding: "32px", borderRadius: "22px", border: "1px solid rgba(59,130,246,0.25)", background: "linear-gradient(135deg, rgba(59,130,246,0.10), rgba(14,165,233,0.06))", textAlign: "center" }}>
              <div style={{ width: "58px", height: "58px", margin: "0 auto 16px", display: "grid", placeItems: "center", borderRadius: "17px", background: "rgba(59,130,246,0.14)", border: "1px solid rgba(96,165,250,0.30)" }}>
                <Building2 size={27} strokeWidth={1.8} />
              </div>
              <span className="section__eyebrow">{t("ctaEyebrow")}</span>
              <h2>{ctaCopy.title}</h2>
              <p style={{ maxWidth: "720px", margin: "12px auto 0" }}>{ctaCopy.text}</p>
              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "12px", marginTop: "24px" }}>
                <a href="/ecosystem-request" className="button button--primary">{ctaCopy.button}</a>
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

export default Business;
