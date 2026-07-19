import { EXPERIENCE, INVOLVEMENT, PROJECTS } from "../portfolio-data.js?v=20260719e";
import { escapeHtml } from "./core.js?v=20260719e";
import { renderExperienceCard, renderList, renderProject, renderProjectFilters } from "./renderers.js?v=20260719e";

function renderAboutSection() {
    return `
        <div class="about-section reveal-on-scroll">
            <h1>ABOUT ME</h1>
            <p>Hi, I'm Wei Rong. I'm a Mathematics student who enjoys building software systems that model, visualize, or interact with complex ideas. My projects often sit between technical tools and interactive experiences, whether that means simulating economies and ecosystems, building game engines and editors, or creating finance and data-driven applications.</p>
            <img class="section-artwork" src="assets/images/sky.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Wei Rong Gao">
            <h1>What I Like Building</h1>
            <p>I like projects where the logic underneath matters just as much as what appears on screen. I'm drawn to systems with moving parts: simulations with emergent behavior, tools that turn data into decisions, and interactive applications where design choices affect how users understand the system.</p>
            <button class="collapsible" type="button" aria-expanded="false">Education</button>
            <div class="content" hidden>
                <p><strong>Bachelor of Honours Mathematics, Co-operative Program</strong><br>University of Waterloo</p>
            </div>
            <button class="collapsible" type="button" aria-expanded="false">Hobbies</button>
            <div class="content" hidden>
                <p>Outside of programming, I enjoy reading, gaming, and watching shows. I'm often interested in how worlds, systems, and stories are structured, which also influences the way I think about projects, interfaces, and user experience.</p>
            </div>
        </div>`;
}

function renderCurrentSection() {
    return `
        <div class="current-container reveal-on-scroll">
            <h1>CURRENTLY WORKING ON</h1>
            <p class="current-intro">A small look at the larger projects I am building next.</p>
            <div class="current-grid">
                <article class="current-card current-card-world">
                    <div class="current-card-header">
                        <span class="current-tag">C++ / Simulation / Procedural Generation</span>
                        <h2>Procedural World Generation System</h2>
                        <p>A large-scale simulation project focused on generating living worlds with terrain, settlements, resources, cultures, factions, and long-term world history.</p>
                    </div>
                    <div class="current-feature-grid">
                        <div class="current-feature-group">
                            <h3>World Generation</h3>
                            <ul>
                                <li>Procedural terrain, biomes, rivers, resources, and settlement placement</li>
                                <li>Region-based map systems for inspecting land, borders, and generated history</li>
                            </ul>
                        </div>
                        <div class="current-feature-group">
                            <h3>Simulation Systems</h3>
                            <ul>
                                <li>Population, factions, economy, expansion, and conflict systems</li>
                                <li>Historical events shaped by resources, geography, and faction behavior</li>
                            </ul>
                        </div>
                        <div class="current-feature-group">
                            <h3>Technical Focus</h3>
                            <ul>
                                <li>Data-driven rules for tuning world behavior without rewriting core logic</li>
                                <li>Visualization tools for debugging and understanding generated worlds</li>
                            </ul>
                        </div>
                    </div>
                </article>
                <article class="current-card current-card-stock">
                    <div class="current-card-header">
                        <span class="current-tag">Web App / Finance / Data</span>
                        <h2>Stock Research Platform</h2>
                        <p>A web application for researching companies, organizing investment notes, comparing businesses, and building simple valuation assumptions.</p>
                    </div>
                    <div class="current-feature-grid">
                        <div class="current-feature-group">
                            <h3>Frontend</h3>
                            <ul>
                                <li>Company search, financial statement pages, ratio dashboard, and watchlist</li>
                                <li>Notes system, comparison view, and valuation model page</li>
                            </ul>
                        </div>
                        <div class="current-feature-group">
                            <h3>Backend</h3>
                            <ul>
                                <li>Company database, financial statement storage, and search indexing</li>
                                <li>Notes/watchlist system and scheduled data fetch jobs</li>
                            </ul>
                        </div>
                        <div class="current-feature-group">
                            <h3>Research Features</h3>
                            <ul>
                                <li>Compare companies side-by-side and auto-calculate financial ratios</li>
                                <li>Save thesis notes, build assumptions, and track thesis changes over time</li>
                            </ul>
                        </div>
                    </div>
                </article>
            </div>
        </div>`;
}

function renderExperienceSection() {
    return `
        <div class="experience-container">
            <header class="experience-intro reveal-on-scroll">
                <p class="experience-kicker">CAREER LOG // CO-OP + DEVELOPMENT</p>
                <h1>EXPERIENCE</h1>
                <p>Production programming, cloud and AI project work, and independent software development—with another cloud-focused co-op beginning in Fall 2026.</p>
            </header>
            <div class="experience-timeline">
                <div class="experience-timeline-progress" aria-hidden="true"></div>
                ${EXPERIENCE.map(renderExperienceCard).join("")}
            </div>
            <section class="involvement-panel reveal-on-scroll">
                <div class="involvement-heading">
                    <p>COMMUNITY LOG</p>
                    <h2>Extracurriculars & Involvement</h2>
                </div>
                <div class="involvement-content">
                    <h3>${escapeHtml(INVOLVEMENT.title)}</h3>
                    <p>${escapeHtml(INVOLVEMENT.summary)}</p>
                    <ul>${renderList(INVOLVEMENT.highlights)}</ul>
                </div>
            </section>
        </div>`;
}

function renderProjectsSection() {
    return `
        <div class="projects-container">
            <h1>PROJECTS</h1>
            <p class="projects-intro">Filter the same project set toward graphics, finance, simulation, or systems work.</p>
            <div class="project-filter-bar" aria-label="Project filters">
                <label class="project-search-shell">
                    <span class="sr-only">Search projects by name</span>
                    <input class="project-name-search" type="search" placeholder="PROJECT NAME" aria-label="Search projects by name" autocomplete="off" spellcheck="false">
                </label>
                <div class="filter-buttons-container">${renderProjectFilters()}</div>
            </div>
            <p class="project-count" id="project-count" aria-live="polite">${PROJECTS.length} PROJECTS FOUND</p>
            <div class="projects-grid">${PROJECTS.map(renderProject).join("")}</div>
        </div>`;
}

function renderContactSection() {
    return `
        <div class="contact-section reveal-on-scroll">
            <h1>CONTACT</h1>
            <p>Want to chat or collaborate?</p>
            <img class="section-artwork" src="assets/images/robot.webp" width="1920" height="804" loading="lazy" decoding="async" alt="Robot illustration">
            <a class="contact-email" href="mailto:wrgao@uwaterloo.ca">wrgao@uwaterloo.ca</a>
            <button type="button" class="github-link profile-github-link">View GitHub Profile</button>
        </div>`;
}

const SECTION_RENDERERS = Object.freeze({
    about: renderAboutSection,
    current: renderCurrentSection,
    experience: renderExperienceSection,
    projects: renderProjectsSection,
    contact: renderContactSection,
});

export function renderSection(sectionId) {
    return SECTION_RENDERERS[sectionId]?.() || "";
}
