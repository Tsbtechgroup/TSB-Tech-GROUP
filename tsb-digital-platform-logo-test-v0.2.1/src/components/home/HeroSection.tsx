import Image from "next/image";
import { ArrowRight, Building2, Cpu, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";

export default function HeroSection() {
  return (
    <section id="top" className="hero">
      <div className="hero-glow hero-glow-one" />
      <div className="hero-glow hero-glow-two" />

      <div className="container hero-grid">
        <div className="hero-copy">
          <Image
            src="/tsb-logo-hero.jpg"
            alt="TSB Tech Group"
            width={370}
            height={138}
            priority
            className="official-hero-logo"
          />

          <span className="eyebrow">
            <Sparkles size={16} />
            Solutions technologiques et professionnelles
          </span>

          <h1>Une seule vision, des solutions illimitées.</h1>

          <p className="hero-text">
            TSB Tech Group réunit technologie, énergie, sécurité, automobile,
            agriculture, formation et services professionnels au sein d’un
            même écosystème mondial.
          </p>

          <div className="hero-actions">
            <Button href="#divisions" size="large">
              Découvrir nos solutions <ArrowRight size={18} />
            </Button>

            <Button href="#devis" variant="secondary" size="large">
              Demander un devis
            </Button>
          </div>

          <div className="trust-row" aria-label="Engagements">
            <span><ShieldCheck size={17} /> Sécurité</span>
            <span><Sparkles size={17} /> Qualité</span>
            <span><Cpu size={17} /> Innovation</span>
            <span><Building2 size={17} /> Accompagnement</span>
          </div>
        </div>

        <div className="hero-panel" aria-label="Écosystème TSB">
          <div className="panel-top">
            <span>TSB Digital Platform</span>
            <span className="status"><i /> Architecture modulaire</span>
          </div>

          <div className="ecosystem-orbit">
            <div className="orbit-core">
              <LockKeyhole size={30} />
              <strong>TSB Core</strong>
              <small>Identité · Sécurité · Données</small>
            </div>
            <div className="orbit-item orbit-a">Store</div>
            <div className="orbit-item orbit-b">Academy</div>
            <div className="orbit-item orbit-c">Services</div>
            <div className="orbit-item orbit-d">AI</div>
          </div>
        </div>
      </div>
    </section>
  );
}
