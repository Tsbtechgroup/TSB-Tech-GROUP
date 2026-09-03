import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 450);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="Retour en haut"
      title="Retour en haut"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }
      style={{
        position: "fixed",
        right: "22px",
        bottom: "22px",
        zIndex: 9999,
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        border:
          "1px solid rgba(56,189,248,0.55)",
        background:
          "linear-gradient(135deg, #0f1d2e, #123d66)",
        color: "#ffffff",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        boxShadow:
          "0 12px 30px rgba(0,0,0,0.35), 0 0 22px rgba(56,189,248,0.18)",
      }}
    >
      <ArrowUp size={22} strokeWidth={2.2} />
    </button>
  );
}

export default ScrollToTop;
