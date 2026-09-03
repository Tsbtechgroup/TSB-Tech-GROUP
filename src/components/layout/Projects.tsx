import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import { projectsTranslations } from "../../i18n/locales/projects";

const projectConfig = [
  {
    id: "automobile",
  },
  {
    id: "security",
  },
  {
    id: "solar",
  },
  {
    id: "industry",
  },
  {
    id: "digital",
  },
] as const;

function Projects() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    translate(
      projectsTranslations,
      locale,
      `projects.${key}`
    );

  return (
    <section id="projects" className="projects-section">
      <div className="container">
        <div className="projects-heading">
          <span className="section__eyebrow">
            {t("eyebrow")}
          </span>

          <h2>
            {t("title1")} <span>{t("title2")}</span>
          </h2>

          <p>{t("intro")}</p>
        </div>

        <div className="projects-grid">
          {projectConfig.map((project) => {
            const title = t(
              `items.${project.id}.title`
            );

            const subtitle = t(
              `items.${project.id}.subtitle`
            );

            const category = t(
              `items.${project.id}.category`
            );

            return (
              <article
                className="project-card"
                key={project.id}
              >
                <div className="project-card__visual">
                  <span>{category}</span>
                </div>

                <div className="project-card__content">
                  <h3>{title}</h3>
                  <p>{subtitle}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="projects-actions">
          <a
            href="#contact"
            className="button button--secondary"
          >
            {t("viewAll")}
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}













































































































export default Projects;
