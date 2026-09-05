import { useMemo, useState } from "react";
import {
  Images,
  PlayCircle,
} from "lucide-react";
import {
  getProjectMedia,
  projectDomains,
  projectMedia,
  type ProjectDomain,
} from "../../config/projectsMedia";
import { useLanguage } from "../../context/LanguageContext";

type ProjectsMediaGalleryProps = {
  getDomainLabel: (domain: ProjectDomain) => string;
};

const galleryLabels: Record<
  string,
  { all: string; empty: string; photo: string; video: string }
> = {
  fr: {
    all: "Toutes",
    empty: "Les photos et vidéos de nos réalisations seront bientôt disponibles.",
    photo: "Photo",
    video: "Vidéo",
  },
  nl: { all: "Alle", empty: "Foto's en video's van onze realisaties zijn binnenkort beschikbaar.", photo: "Foto", video: "Video" },
  en: { all: "All", empty: "Photos and videos of our projects will be available soon.", photo: "Photo", video: "Video" },
  de: { all: "Alle", empty: "Fotos und Videos unserer Projekte sind bald verfügbar.", photo: "Foto", video: "Video" },
  es: { all: "Todas", empty: "Las fotos y vídeos de nuestros proyectos estarán disponibles pronto.", photo: "Foto", video: "Vídeo" },
  it: { all: "Tutti", empty: "Foto e video dei nostri progetti saranno presto disponibili.", photo: "Foto", video: "Video" },
  pt: { all: "Todas", empty: "Fotos e vídeos dos nossos projetos estarão disponíveis em breve.", photo: "Foto", video: "Vídeo" },
  ar: { all: "الكل", empty: "ستتوفر صور وفيديوهات مشاريعنا قريبًا.", photo: "صورة", video: "فيديو" },
  tr: { all: "Tümü", empty: "Projelerimizin fotoğraf ve videoları yakında yayınlanacaktır.", photo: "Fotoğraf", video: "Video" },
  zh: { all: "全部", empty: "我们的项目照片和视频即将上线。", photo: "照片", video: "视频" },
};

function ProjectsMediaGallery({
  getDomainLabel,
}: ProjectsMediaGalleryProps) {
  const { locale } = useLanguage();
  const labels = galleryLabels[locale] ?? galleryLabels.fr;
  const [selectedDomain, setSelectedDomain] = useState<
    ProjectDomain | "all"
  >("all");

  const visibleMedia = useMemo(
    () =>
      selectedDomain === "all"
        ? projectMedia
        : getProjectMedia(selectedDomain),
    [selectedDomain]
  );

  return (
    <div style={{ maxWidth: "1160px", margin: "0 auto 30px" }}>
      <div
        role="group"
        aria-label="Filtres des réalisations"
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "24px",
        }}
      >
        <button
          type="button"
          className={`button ${selectedDomain === "all" ? "button--primary" : "button--secondary"}`}
          onClick={() => setSelectedDomain("all")}
        >
          {labels.all}
        </button>

        {projectDomains.map((domain) => (
          <button
            type="button"
            className={`button ${selectedDomain === domain ? "button--primary" : "button--secondary"}`}
            key={domain}
            onClick={() => setSelectedDomain(domain)}
          >
            {getDomainLabel(domain)}
          </button>
        ))}
      </div>

      {visibleMedia.length === 0 ? (
        <div
          className="domain-card domain-cyan"
          style={{
            minHeight: "180px",
            display: "grid",
            placeItems: "center",
            padding: "28px",
            textAlign: "center",
          }}
        >
          <div>
            <Images size={32} strokeWidth={1.7} />
            <p style={{ margin: "12px 0 0" }}>{labels.empty}</p>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "18px",
          }}
        >
          {visibleMedia.map((media) => (
            <article
              className="domain-card domain-cyan"
              key={media.id}
              style={{ padding: "10px", overflow: "hidden" }}
            >
              {media.type === "image" ? (
                <img
                  src={media.src}
                  alt={media.title}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: "100%",
                    aspectRatio: "16 / 10",
                    display: "block",
                    objectFit: "cover",
                    borderRadius: "14px",
                  }}
                />
              ) : (
                <video
                  src={media.src}
                  controls
                  preload="metadata"
                  playsInline
                  aria-label={media.title}
                  style={{
                    width: "100%",
                    aspectRatio: "16 / 10",
                    display: "block",
                    objectFit: "cover",
                    borderRadius: "14px",
                    background: "#020617",
                  }}
                />
              )}

              <div style={{ padding: "14px 10px 8px" }}>
                <span className="domain-category">
                  {media.type === "video" ? (
                    <PlayCircle size={14} aria-hidden="true" />
                  ) : null}
                  {media.type === "video" ? labels.video : labels.photo}
                  {" · "}
                  {getDomainLabel(media.domain)}
                </span>
                <h3 style={{ marginTop: "9px" }}>{media.title}</h3>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectsMediaGallery;
