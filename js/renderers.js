import { PROJECT_FILTERS } from "../portfolio-data.js?v=20260719e";
import { escapeHtml, FLAGSHIP_PROJECT_IDS } from "./core.js?v=20260719e";

function renderList(items) {
    return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderChips(items, limit = items.length) {
    return items
        .slice(0, limit)
        .map((item) => `<span class="tech-chip">${escapeHtml(item)}</span>`)
        .join("");
}

function renderProjectLink(project) {
    if (project.github?.url) {
        return `<a href="${escapeHtml(project.github.url)}" target="_blank" rel="noopener noreferrer" class="github-link">${escapeHtml(project.github.label)}</a>`;
    }

    const label = project.github?.label || "Repository coming soon";
    return `<span class="github-link github-link-disabled" aria-disabled="true">${escapeHtml(label)}</span>`;
}

function getProjectScreenshots(project) {
    return project.images.map((src, index) => ({
        src,
        alt: index === 0 ? project.imageAlt : `${project.title} screenshot ${index + 1}`,
    }));
}

function renderProjectImages(project) {
    return getProjectScreenshots(project)
        .map(
            (image) =>
                `<img loading="lazy" decoding="async" width="960" height="540" data-src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}">`,
        )
        .join("");
}

function renderProjectInspectionGallery(project) {
    const images = getProjectScreenshots(project);
    const firstImage = images[0];
    if (!firstImage) return "";

    return `
        <div class="project-inspection-gallery" data-active-index="0">
            <button class="project-inspection-stage" type="button" aria-label="Open ${escapeHtml(project.title)} screenshot 1">
                <img loading="lazy" decoding="async" width="960" height="540" data-src="${escapeHtml(firstImage.src)}" alt="${escapeHtml(firstImage.alt)}">
            </button>
            <div class="project-inspection-thumbnails" role="group" aria-label="${escapeHtml(project.title)} screenshots">
                ${images
                    .map(
                        (image, index) => `
                    <button class="project-inspection-thumbnail${index === 0 ? " active" : ""}" type="button" data-index="${index}" data-image-alt="${escapeHtml(image.alt)}" aria-pressed="${index === 0 ? "true" : "false"}" aria-label="Show ${escapeHtml(project.title)} screenshot ${index + 1}">
                        <img loading="lazy" decoding="async" width="160" height="90" data-src="${escapeHtml(image.src)}" alt="">
                    </button>
                `,
                    )
                    .join("")}
            </div>
        </div>
    `;
}

export function renderProject(project) {
    const isFlagshipCaseStudy = FLAGSHIP_PROJECT_IDS.has(project.id);
    const projectTypeClass = isFlagshipCaseStudy ? " project-case-study-item" : " project-inspection-item";
    const detailImages = isFlagshipCaseStudy
        ? `<div class="project-images-grid">${renderProjectImages(project)}</div>`
        : renderProjectInspectionGallery(project);

    return `
        <article class="project-item${projectTypeClass} reveal-on-scroll" data-category="${escapeHtml(project.categories.join(" "))}" data-project-id="${escapeHtml(project.id)}" data-project-name="${escapeHtml(project.title.toLocaleLowerCase())}" data-project-title="${escapeHtml(project.title)}" data-preview-images="${escapeHtml(project.images.join("|"))}">
            <img loading="lazy" decoding="async" width="960" height="540" src="${escapeHtml(project.image)}" alt="${escapeHtml(project.imageAlt)}">
            <div class="project-summary">
                <div class="project-category-row">${renderChips(project.languages)}</div>
                <h2><button class="project-summary-toggle" type="button" aria-expanded="false" aria-controls="${escapeHtml(project.id)}">${escapeHtml(project.title)}</button></h2>
                <p>${escapeHtml(project.summary)}</p>
                <div class="project-tech-preview">${renderChips(project.techStack, isFlagshipCaseStudy ? 5 : 3)}</div>
            </div>
            <div class="project-details" id="${escapeHtml(project.id)}" hidden>
                <div class="project-details-content">
                    <p><strong>Languages:</strong> ${escapeHtml(project.languages.join(", "))}</p>
                    <div class="project-features">
                        <h3>Core Features</h3>
                        <ul>${renderList(project.features)}</ul>
                        <h3>Tech Stack</h3>
                        <div class="project-tech-stack">${renderChips(project.techStack)}</div>
                    </div>
                    ${renderProjectLink(project)}
                    ${detailImages}
                </div>
            </div>
        </article>
    `;
}

export function renderProjectFilters() {
    return PROJECT_FILTERS.map(
        (filter) =>
            `<button type="button" class="project-filter${filter.id === "all" ? " active" : ""}" data-filter="${escapeHtml(filter.id)}" aria-pressed="${filter.id === "all" ? "true" : "false"}">${escapeHtml(filter.label)}</button>`,
    ).join("");
}

export function renderExperienceCard(experience, index) {
    const status = experience.status ? `<span class="experience-status">${escapeHtml(experience.status)}</span>` : "";
    const note = experience.note ? `<p class="experience-note">${escapeHtml(experience.note)}</p>` : "";

    return `
        <article class="experience-card${experience.incoming ? " experience-card-incoming" : ""} reveal-on-scroll" data-experience-id="${escapeHtml(experience.id)}">
            <button class="experience-node" type="button" aria-label="Jump to ${escapeHtml(experience.role)} at ${escapeHtml(experience.organization)}"><span>${String(index + 1).padStart(2, "0")}</span></button>
            <div class="experience-card-body">
                <header class="experience-card-header">
                    <div>
                        <p class="experience-period">${escapeHtml(experience.period)}</p>
                        <h2>${escapeHtml(experience.role)}</h2>
                        <p class="experience-organization">${escapeHtml(experience.organization)}</p>
                    </div>
                    ${status}
                </header>
                <p class="experience-summary">${escapeHtml(experience.summary)}</p>
                <ul class="experience-highlights">${renderList(experience.highlights)}</ul>
                ${note}
                <div class="experience-stack">
                    <p>${escapeHtml(experience.technologyLabel)}</p>
                    <div>${renderChips(experience.technologies)}</div>
                </div>
            </div>
        </article>
    `;
}

export { renderList };
