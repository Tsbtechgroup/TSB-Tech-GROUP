import headerLogo from "../../assets/logos/tsb-logo-header.jpg";

type BrandLogoProps = {
  compact?: boolean;
};

function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <img
      src={headerLogo}
      alt="TSB Tech Group"
      className={compact ? "brand-logo brand-logo--compact" : "brand-logo"}
    />
  );
}

export default BrandLogo;    