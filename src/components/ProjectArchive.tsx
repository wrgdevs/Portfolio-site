import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check, Code2, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type ProjectLink = {
  url?: string;
  label?: string;
};

export type Project = {
  id: string;
  title: string;
  summary: string;
  categories: string[];
  image: string;
  imageAlt: string;
  languages: string[];
  techStack: string[];
  features: string[];
  github?: ProjectLink;
  images: string[];
};

type Filter = {
  id: string;
  label: string;
};

type Props = {
  projects: Project[];
  filters: Filter[];
  base?: string;
};

const toAsset = (path: string, base = "/") => {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}${path.replace(/^\/+/, "")}`;
};

export default function ProjectArchive({ projects, filters, base = "/" }: Props) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Project | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const reduceMotion = useReducedMotion();

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesFilter = activeFilter === "all" || project.categories.includes(activeFilter);
      const searchText = [
        project.title,
        project.summary,
        ...project.languages,
        ...project.techStack
      ].join(" ").toLowerCase();
      return matchesFilter && (!normalizedQuery || searchText.includes(normalizedQuery));
    });
  }, [activeFilter, projects, query]);

  useEffect(() => {
    if (!selected || !dialogRef.current) return;
    setSelectedImage(0);
    if (!dialogRef.current.open) dialogRef.current.showModal();
  }, [selected]);

  const closeDialog = () => {
    dialogRef.current?.close();
    setSelected(null);
  };

  return (
    <div className="project-archive">
      <div className="project-controls" aria-label="Project filters and search">
        <div className="project-filter-list" role="group" aria-label="Filter projects by category">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={activeFilter === filter.id ? "project-filter is-active" : "project-filter"}
              aria-pressed={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <label className="project-search">
          <Search aria-hidden="true" size={17} />
          <span className="sr-only">Search projects</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by project or technology"
          />
        </label>
      </div>

      <div className="project-results-meta" aria-live="polite">
        <span>{String(filteredProjects.length).padStart(2, "0")} projects</span>
        <span aria-hidden="true">/</span>
        <span>{activeFilter === "all" ? "Complete archive" : filters.find((item) => item.id === activeFilter)?.label}</span>
      </div>

      <motion.div className="project-grid" layout>
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredProjects.map((project, index) => (
            <motion.article
              className="project-card"
              key={project.id}
              layout
              initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: reduceMotion ? 0.01 : 0.24, delay: Math.min(index * 0.018, 0.12) }}
            >
              <button
                type="button"
                className="project-card-open"
                onClick={() => setSelected(project)}
                aria-label={`View details for ${project.title}`}
              >
                <span className="project-card-media">
                  <img
                    src={toAsset(project.image, base)}
                    alt={project.imageAlt}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="project-card-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span className="project-card-view">Explore <ArrowUpRight size={15} aria-hidden="true" /></span>
                </span>

                <span className="project-card-body">
                  <span className="project-card-languages">{project.languages.join(" / ")}</span>
                  <span className="project-card-title">{project.title}</span>
                  <span className="project-card-summary">{project.summary}</span>
                  <span className="project-card-tech" aria-label="Primary technologies">
                    {project.techStack.slice(0, 4).map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))}
                  </span>
                </span>
              </button>

              <div className="project-card-footer">
                <span>{project.images.length} image{project.images.length === 1 ? "" : "s"}</span>
                {project.github?.url ? (
                  <a href={project.github.url} target="_blank" rel="noreferrer" aria-label={`${project.title} on GitHub`}>
                    <Code2 size={15} aria-hidden="true" /> Repository
                  </a>
                ) : (
                  <span className="project-repo-soon">Repository soon</span>
                )}
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredProjects.length === 0 && (
        <div className="project-empty">
          <p>No projects match that search yet.</p>
          <button type="button" onClick={() => { setQuery(""); setActiveFilter("all"); }}>Clear filters</button>
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="project-dialog"
        aria-labelledby={selected ? `project-dialog-${selected.id}` : undefined}
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
      >
        {selected && (
          <div className="project-dialog-panel">
            <button type="button" className="project-dialog-close" onClick={closeDialog} aria-label="Close project details">
              <X aria-hidden="true" size={20} />
            </button>

            <div className="project-dialog-copy">
              <p className="eyebrow">{selected.languages.join(" / ")}</p>
              <h2 id={`project-dialog-${selected.id}`}>{selected.title}</h2>
              <p className="project-dialog-summary">{selected.summary}</p>

              <div className="project-dialog-actions">
                {selected.github?.url ? (
                  <a className="button button-primary" href={selected.github.url} target="_blank" rel="noreferrer">
                    <Code2 size={17} aria-hidden="true" /> View repository
                  </a>
                ) : (
                  <span className="button button-muted">Repository coming soon</span>
                )}
              </div>
            </div>

            <div className="project-dialog-gallery">
              <div className="project-dialog-main-image">
                <img
                  src={toAsset(selected.images[selectedImage] || selected.image, base)}
                  alt={selectedImage === 0 ? selected.imageAlt : `${selected.title} screenshot ${selectedImage + 1}`}
                />
              </div>
              {selected.images.length > 1 && (
                <div className="project-dialog-thumbnails" aria-label="Project screenshots">
                  {selected.images.map((image, index) => (
                    <button
                      type="button"
                      key={image}
                      className={selectedImage === index ? "is-active" : ""}
                      aria-label={`Show screenshot ${index + 1} of ${selected.images.length}`}
                      aria-pressed={selectedImage === index}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img src={toAsset(image, base)} alt="" loading="lazy" decoding="async" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="project-dialog-details">
              <section>
                <p className="detail-label">What it does</p>
                <ul className="feature-list">
                  {selected.features.map((feature) => (
                    <li key={feature}><Check aria-hidden="true" size={16} /> <span>{feature}</span></li>
                  ))}
                </ul>
              </section>

              <aside>
                <p className="detail-label">Built with</p>
                <div className="technology-cloud">
                  {selected.techStack.map((technology) => <span key={technology}>{technology}</span>)}
                </div>
              </aside>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
