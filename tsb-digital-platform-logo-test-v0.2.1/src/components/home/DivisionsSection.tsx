import { ArrowRight, Car, Cpu, Droplets, GraduationCap, Leaf, ShieldCheck, ShoppingBag, SunMedium, Wrench } from "lucide-react";

const divisions = [
  { title: "Automobile", description: "Serrurerie automobile, diagnostic et solutions techniques.", icon: Car },
  { title: "Sécurité", description: "Vidéosurveillance, contrôle d'accès et sécurité incendie.", icon: ShieldCheck },
  { title: "Électricité", description: "Solutions domestiques, tertiaires et industrielles.", icon: Wrench },
  { title: "Énergie", description: "Photovoltaïque, stockage, secours et gestion intelligente.", icon: SunMedium },
  { title: "Technologies", description: "Informatique, réseaux, télécommunications et développement.", icon: Cpu },
  { title: "Eau & Hydraulique", description: "Forage, pompage, stockage, traitement et supervision.", icon: Droplets },
  { title: "Agriculture", description: "Agriculture, élevage et Smart Farming.", icon: Leaf },
  { title: "TSB Academy", description: "Formation, certification et développement des compétences.", icon: GraduationCap },
  { title: "TSB Store", description: "Produits, équipements et solutions professionnelles.", icon: ShoppingBag },
];

export default function DivisionsSection() {
  return <section id="divisions" className="section section-light"><div className="container">
    <div className="section-heading"><span className="eyebrow dark">Nos domaines d’expertise</span><h2>Des solutions connectées pour chaque projet</h2><p>Une organisation multidisciplinaire qui associe expertise métier, technologie et accompagnement.</p></div>
    <div className="cards-grid">{divisions.map(({title,description,icon:Icon}) => <article className="division-card" key={title}><div className="icon-box"><Icon size={23}/></div><h3>{title}</h3><p>{description}</p><a href="#">Découvrir <ArrowRight size={16}/></a></article>)}</div>
  </div></section>;
}
