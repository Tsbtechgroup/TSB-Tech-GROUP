import Image from "next/image";
import Button from "@/components/ui/Button";

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="official-logo-link" href="#top" aria-label="TSB Tech Group">
          <Image
            src="/tsb-logo-header.jpg"
            alt="Logo officiel TSB Tech Group"
            width={182}
            height={63}
            priority
            className="official-header-logo"
          />
        </a>

        <nav className="desktop-nav" aria-label="Navigation principale">
          <a href="#divisions">Divisions</a>
          <a href="#methode">Méthode</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="header-actions">
          <a className="text-link" href="/login">
            Connexion
          </a>
          <Button href="#devis" size="small">
            Demander un devis
          </Button>
        </div>
      </div>
    </header>
  );
}
