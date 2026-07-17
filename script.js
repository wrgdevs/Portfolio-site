let lastActiveElement = null;

function handleModalTab(event, modalEl) {
    if (event.key !== "Tab") return;
    
    const focusableSelectors = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, [tabindex="0"]';
    const focusableElements = Array.from(modalEl.querySelectorAll(focusableSelectors)).filter(el => {
        return el.tabIndex >= 0 && el.getBoundingClientRect().width > 0 && !el.disabled;
    });
    if (focusableElements.length === 0) return;
    
    const firstEl = focusableElements[0];
    const lastEl = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey) {
        if (document.activeElement === firstEl) {
            lastEl.focus();
            event.preventDefault();
        }
    } else {
        if (document.activeElement === lastEl) {
            firstEl.focus();
            event.preventDefault();
        }
    }
}

function versionedAsset(path) {
    if (!path || !path.startsWith("assets/")) return path;
    return path.includes("?") ? path : `${path}?v=${ASSET_VERSION}`;
}

function versionProjectImageSrcs(root = document) {
    root.querySelectorAll('img[src^="assets/"]').forEach(img => {
        img.src = versionedAsset(img.getAttribute("src"));
    });
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function renderList(items) {
    return items.map(item => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderChips(items, limit = items.length) {
    return items
        .slice(0, limit)
        .map(item => `<span class="tech-chip">${escapeHtml(item)}</span>`)
        .join("");
}

function renderProjectLink(project) {
    if (project.github?.url) {
        return `<a href="${escapeHtml(project.github.url)}" target="_blank" rel="noopener noreferrer" class="github-link">${escapeHtml(project.github.label)}</a>`;
    }

    return `<span class="github-link github-link-disabled" aria-disabled="true">${escapeHtml(project.github?.label || "Repository coming soon")}</span>`;
}

function renderProjectImages(project) {
    return project.images
        .map((src, index) => {
            const alt = index === 0 ? project.imageAlt : `${project.title} screenshot ${index + 1}`;
            return `<img loading="lazy" decoding="async" data-src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">`;
        })
        .join("");
}

function renderProject(project) {
    return `
        <article class="project-item reveal-on-scroll" data-category="${escapeHtml(project.categories.join(" "))}" data-project-id="${escapeHtml(project.id)}" role="button" tabindex="0" aria-expanded="false" aria-controls="${escapeHtml(project.id)}">
            <div class="project-scan-panel" aria-hidden="true">
                <span>${escapeHtml(project.languages.join(" / "))}</span>
                <span>${escapeHtml(project.images.length)} IMAGES</span>
                <span>${project.github?.url ? "REPO ONLINE" : "REPO SOON"}</span>
            </div>
            <img loading="lazy" decoding="async" src="${escapeHtml(project.image)}" alt="${escapeHtml(project.imageAlt)}">
            <div class="project-summary">
                <div class="project-category-row">${renderChips(project.languages)}</div>
                <h2>${escapeHtml(project.title)}</h2>
                <p>${escapeHtml(project.summary)}</p>
                <div class="project-tech-preview">${renderChips(project.techStack, 5)}</div>
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
                    <div class="project-images-grid">${renderProjectImages(project)}</div>
                </div>
            </div>
        </article>
    `;
}

function renderProjectFilters() {
    return PROJECT_FILTERS
        .map(filter => `<button type="button" class="project-filter${filter.id === "all" ? " active" : ""}" data-filter="${escapeHtml(filter.id)}" aria-pressed="${filter.id === "all" ? "true" : "false"}">${escapeHtml(filter.label)}</button>`)
        .join("");
}

function renderExperienceCard(experience, index) {
    const status = experience.status
        ? `<span class="experience-status">${escapeHtml(experience.status)}</span>`
        : "";
    const note = experience.note
        ? `<p class="experience-note">${escapeHtml(experience.note)}</p>`
        : "";

    return `
        <article class="experience-card${experience.incoming ? " experience-card-incoming" : ""} reveal-on-scroll" data-experience-id="${escapeHtml(experience.id)}">
            <div class="experience-node" aria-hidden="true"><span>${String(index + 1).padStart(2, "0")}</span></div>
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

// ====================== JUMP TO SECTION ======================

const loadedSections = {};
const SECTION_ORDER = ["about", "current", "experience", "projects", "contact"];

function insertSectionInOrder(section) {
    const sectionIndex = SECTION_ORDER.indexOf(section.id);
    const nextSection = SECTION_ORDER
        .slice(sectionIndex + 1)
        .map(id => document.getElementById(id))
        .find(Boolean);
    const fallbackAnchor = document.getElementById("github-modal");

    if (nextSection) {
        document.body.insertBefore(section, nextSection);
    } else if (fallbackAnchor) {
        document.body.insertBefore(section, fallbackAnchor);
    } else {
        document.body.appendChild(section);
    }
}

function jumpToSection(sectionId) {
    if (!loadedSections[sectionId]) {
        playSfx("nav");
        createSection(sectionId);
        loadedSections[sectionId] = true;
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
        return;
    }

    playSfx("nav");
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
}

// ====================== CREATE SECTIONS ======================

function createSection(sectionId) {
    const section = document.createElement("section");
    section.id = sectionId;
    section.className = "content-section section-boot";
    let html = "";

    if (sectionId === "about") {
        html = `
            <div class="about-section reveal-on-scroll">
                <h1>ABOUT ME</h1>
                <p>Hi, I'm Wei Rong. I'm a Mathematics student who enjoys building software systems that model, visualize, or interact with complex ideas. My projects often sit between technical tools and interactive experiences, whether that means simulating economies and ecosystems, building game engines and editors, or creating finance and data-driven applications.</p>
                <img src="assets/images/sky.webp" alt="Wei Rong Gao">
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
    } else if (sectionId === "current") {
        html = `
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
    } else if (sectionId === "experience") {
        html = `
            <div class="experience-container">
                <header class="experience-intro reveal-on-scroll">
                    <p class="experience-kicker">CAREER LOG // CO-OP + DEVELOPMENT</p>
                    <h1>EXPERIENCE</h1>
                    <p>Production programming, cloud and AI project work, and independent software development—with another cloud-focused co-op beginning in Fall 2026.</p>
                </header>
                <div class="experience-timeline">
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
    } else if (sectionId === "projects") {
        html = `
            <div class="projects-container">
                <h1>PROJECTS</h1>
                <p class="projects-intro">Filter the same project set toward graphics, finance, simulation, or systems work.</p>
                <div class="project-filter-bar" aria-label="Project filters">
                    <div class="filter-buttons-container">${renderProjectFilters()}</div>
                </div>
                <p class="project-count" id="project-count" aria-live="polite">${PROJECTS.length} PROJECTS FOUND</p>
                <div class="projects-grid">${PROJECTS.map(renderProject).join("")}</div>
            </div>`;
    } else if (sectionId === "contact") {
        html = `
            <div class="contact-section reveal-on-scroll">
                <h1>CONTACT</h1>
                <p>Want to chat or collaborate?</p>
                <img src="assets/images/robot.webp" alt="Robot illustration">
                <a class="contact-email" href="mailto:wrgao@uwaterloo.ca">wrgao@uwaterloo.ca</a>
                <button type="button" onclick="openGithubModal()" class="github-link profile-github-link">View GitHub Profile</button>
            </div>`;
    }

    section.innerHTML = html;
    versionProjectImageSrcs(section);
    decorateHeadings(section);
    insertSectionInOrder(section);
    observeRevealElements(section);
    setupProjectInteractions(section);
    if (radarObserver) {
        radarObserver.observe(section);
    }
    requestAnimationFrame(() => section.classList.add("is-booted"));
}

function decorateHeadings(root = document) {
    root.querySelectorAll("[data-text]").forEach(heading => heading.removeAttribute("data-text"));
}

// ====================== PROJECT TOGGLE ======================

function toggleProjectDetails(id) {
    const details = document.getElementById(id);
    const projectItem = details?.closest(".project-item");
    if (!details || !projectItem) return;

    const isOpen = !details.classList.contains("is-open");

    if (isOpen) {
        hydrateProjectImages(projectItem);
        details.hidden = false;
        details.classList.remove("is-closing");
        requestAnimationFrame(() => {
            details.classList.add("is-open");
            requestAnimationFrame(() => {
                projectItem.scrollIntoView({
                    behavior: reduceMotion.matches || document.body.classList.contains("low-fx") ? "auto" : "smooth",
                    block: "start"
                });
            });
        });
    } else {
        details.classList.add("is-closing");
        details.classList.remove("is-open");
        setTimeout(() => {
            if (!details.classList.contains("is-open")) {
                details.hidden = true;
                details.classList.remove("is-closing");
            }
        }, reduceMotion.matches ? 1 : 260);
    }

    projectItem.setAttribute("aria-expanded", String(isOpen));
}

function shouldIgnoreProjectToggle(event) {
    return Boolean(event.target.closest("a, button, .project-images-grid img, .project-item > img"));
}

// ====================== PROJECT IMAGE CAROUSEL ======================

let carouselImages = [];
let carouselIndex = 0;
let carouselDirection = 1;

function ensureImageCarousel() {
    let modal = document.getElementById("image-carousel-modal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "image-carousel-modal";
    modal.className = "image-carousel-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
        <div class="image-carousel-card">
            <button class="image-carousel-close" type="button" aria-label="Close image carousel">x</button>
            <button class="image-carousel-nav image-carousel-prev" type="button" aria-label="Previous image">&lt;</button>
            <div class="image-carousel-frame">
                <img class="image-carousel-image" src="" alt="Project screenshot preview">
            </div>
            <button class="image-carousel-nav image-carousel-next" type="button" aria-label="Next image">&gt;</button>
            <p class="image-carousel-counter"></p>
            <div class="image-carousel-thumbnails" aria-label="Image thumbnails"></div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector(".image-carousel-close").addEventListener("click", closeImageCarousel);
    modal.querySelector(".image-carousel-prev").addEventListener("click", () => moveImageCarousel(-1));
    modal.querySelector(".image-carousel-next").addEventListener("click", () => moveImageCarousel(1));
    modal.querySelector(".image-carousel-thumbnails").addEventListener("click", event => {
        const thumbnail = event.target.closest("button");
        if (!thumbnail) return;
        const nextIndex = Number(thumbnail.dataset.index);
        if (Number.isNaN(nextIndex) || nextIndex === carouselIndex) return;
        playSfx("carousel");
        carouselDirection = nextIndex > carouselIndex ? 1 : -1;
        carouselIndex = nextIndex;
        renderImageCarousel();
    });
    modal.addEventListener("click", event => {
        if (event.target === modal) closeImageCarousel();
    });

    let touchStartX = 0;
    let touchStartY = 0;
    modal.addEventListener("touchstart", event => {
        touchStartX = event.changedTouches[0].screenX;
        touchStartY = event.changedTouches[0].screenY;
    }, { passive: true });
    
    modal.addEventListener("touchend", event => {
        const touchEndX = event.changedTouches[0].screenX;
        const touchEndY = event.changedTouches[0].screenY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        
        if (Math.abs(diffX) > 50 && Math.abs(diffY) < 60) {
            moveImageCarousel(diffX > 0 ? -1 : 1);
        }
    }, { passive: true });

    return modal;
}

function getProjectImages(projectItem) {
    const detailImages = Array.from(projectItem.querySelectorAll(".project-images-grid img"));
    const mainImage = projectItem.querySelector(":scope > img");
    const images = detailImages.length ? detailImages : (mainImage ? [mainImage] : []);

    return images.map(img => ({
        src: versionedAsset(img.getAttribute("src") || img.dataset.src),
        alt: img.getAttribute("alt") || projectItem.querySelector("h2")?.textContent || "Project screenshot"
    })).filter(image => image.src);
}

function hydrateProjectImages(projectItem) {
    projectItem.querySelectorAll(".project-images-grid img[data-src]").forEach(img => {
        img.src = versionedAsset(img.dataset.src);
        delete img.dataset.src;
    });
}

function openImageCarousel(projectItem, clickedSrc) {
    carouselImages = getProjectImages(projectItem);
    if (!carouselImages.length) return;
    playSfx("open");
    lastActiveElement = document.activeElement;

    const normalizedClickedSrc = (clickedSrc || "").split("?")[0];
    carouselIndex = Math.max(0, carouselImages.findIndex(image => image.src.split("?")[0] === normalizedClickedSrc));
    carouselDirection = 1;

    const modal = ensureImageCarousel();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    renderImageCarousel();
    
    const closeBtn = modal.querySelector(".image-carousel-close");
    closeBtn?.focus();
}

function renderImageCarousel() {
    const modal = ensureImageCarousel();
    const image = modal.querySelector(".image-carousel-image");
    const counter = modal.querySelector(".image-carousel-counter");
    const thumbnailTrack = modal.querySelector(".image-carousel-thumbnails");
    const current = carouselImages[carouselIndex];

    image.classList.remove("slide-next", "slide-prev");
    void image.offsetWidth;
    image.classList.add(carouselDirection >= 0 ? "slide-next" : "slide-prev");
    image.src = current.src;
    image.alt = current.alt;
    counter.textContent = `${carouselIndex + 1} / ${carouselImages.length}`;
    thumbnailTrack.innerHTML = carouselImages
        .map((item, index) => `
            <button class="image-carousel-thumbnail${index === carouselIndex ? " active" : ""}" type="button" data-index="${index}" aria-label="Show image ${index + 1}">
                <img src="${escapeHtml(item.src)}" alt="">
            </button>
        `)
        .join("");
}

function moveImageCarousel(direction) {
    if (!carouselImages.length) return;
    playSfx("carousel");
    carouselDirection = direction;
    carouselIndex = (carouselIndex + direction + carouselImages.length) % carouselImages.length;
    renderImageCarousel();
}

function closeImageCarousel() {
    const modal = document.getElementById("image-carousel-modal");
    if (!modal) return;
    playSfx("close");
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    
    if (lastActiveElement) {
        lastActiveElement.focus();
        lastActiveElement = null;
    }
}

// ====================== VISUAL EFFECTS + PROGRESS + INIT ======================

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const circle = document.querySelector(".progress-ring__circle");
const mapElement = document.querySelector(".map");
const circumference = 175;
let lastParticleTime = 0;
let revealObserver;
let typewriterTimers = [];
let audioContext;
let audioEnabled = false;
let ambientNodes;
let lastSfxTime = 0;
let currentFilterCount = PROJECTS.length;
let pointerEffectsFrame = 0;
let latestPointerEvent = null;
let progressFrame = 0;
let projectCountFrame = 0;
let mapRect = null;
let mapRectDirty = true;
const tiltFrames = new WeakMap();
const filterTransitions = new WeakMap();

if (circle) {
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference;
}

function createMouseParticle(e) {
    if (reduceMotion.matches || document.body.classList.contains("low-fx")) return;

    const now = performance.now();
    if (now - lastParticleTime < 90) return;
    lastParticleTime = now;

    const p = document.createElement("div");
    const size = Math.floor(Math.random() * 4 + 3);
    const colors = ["var(--green)", "var(--cyan)", "var(--pink)", "var(--gold)"];
    p.className = "particle";
    p.style.left = `${e.pageX}px`;
    p.style.top = `${e.pageY}px`;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
}

function ensureAudioContext() {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") audioContext.resume();
    return audioContext;
}

function playSfx(type = "click") {
    if (!audioEnabled) return;
    const nowMs = performance.now();
    if (nowMs - lastSfxTime < 42) return;
    lastSfxTime = nowMs;

    const ctx = ensureAudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = ctx.currentTime;
    const sfx = {
        hover: [260, 0.035, 0.045],
        click: [520, 0.05, 0.07],
        open: [620, 0.06, 0.11],
        close: [360, 0.05, 0.08],
        filter: [460, 0.052, 0.09],
        nav: [720, 0.045, 0.08],
        feature: [840, 0.035, 0.055],
        carousel: [560, 0.045, 0.08],
        error: [160, 0.06, 0.10]
    }[type] || [520, 0.045, 0.07];
    const [frequency, volume, duration] = sfx;

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency * 1.35), now + duration * 0.55);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
}

function startAmbientAudio() {
    if (ambientNodes) return;
    const ctx = ensureAudioContext();
    const master = ctx.createGain();
    const low = ctx.createOscillator();
    const shimmer = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.018, ctx.currentTime + 0.45);
    low.type = "sine";
    low.frequency.value = 55;
    shimmer.type = "triangle";
    shimmer.frequency.value = 110;
    lfo.type = "sine";
    lfo.frequency.value = 0.12;
    lfoGain.gain.value = 0.006;

    lfo.connect(lfoGain).connect(master.gain);
    low.connect(master);
    shimmer.connect(master);
    master.connect(ctx.destination);
    low.start();
    shimmer.start();
    lfo.start();
    ambientNodes = { master, low, shimmer, lfo };
}

function stopAmbientAudio() {
    if (!ambientNodes || !audioContext) return;
    const now = audioContext.currentTime;
    const nodes = ambientNodes;
    ambientNodes = null;
    nodes.master.gain.cancelScheduledValues(now);
    nodes.master.gain.setValueAtTime(Math.max(nodes.master.gain.value, 0.0001), now);
    nodes.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    setTimeout(() => {
        nodes.low.stop();
        nodes.shimmer.stop();
        nodes.lfo.stop();
    }, 280);
}

function initLowFx() {
    const isLowFx = localStorage.getItem("lowFx") === "true";
    const button = document.getElementById("low-fx-toggle");
    if (isLowFx) {
        document.body.classList.add("low-fx");
        if (button) {
            button.setAttribute("aria-pressed", "true");
            button.textContent = "LOW FX ON";
        }
    } else {
        document.body.classList.remove("low-fx");
        if (button) {
            button.setAttribute("aria-pressed", "false");
            button.textContent = "LOW FX OFF";
        }
    }
}

function toggleLowFx() {
    const isLowFx = !document.body.classList.contains("low-fx");
    localStorage.setItem("lowFx", String(isLowFx));
    initLowFx();
    playSfx("select");
}

function toggleAudio() {
    audioEnabled = !audioEnabled;
    const button = document.getElementById("sound-toggle");
    if (!button) return;
    button.textContent = audioEnabled ? "AUDIO ON" : "AUDIO OFF";
    button.setAttribute("aria-pressed", String(audioEnabled));
    if (audioEnabled) {
        startAmbientAudio();
        playSfx("open");
    } else {
        stopAmbientAudio();
    }
}

function setupProjectInteractions(root = document) {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    root.querySelectorAll(".project-item").forEach(projectItem => {
        projectItem.addEventListener("mousemove", handleProjectTilt);
        projectItem.addEventListener("mouseleave", resetProjectTilt);
        projectItem.addEventListener("mouseenter", () => playSfx("hover"));
    });
}

function handleProjectTilt(event) {
    if (reduceMotion.matches) return;
    const card = event.currentTarget;
    if (tiltFrames.has(card)) return;

    tiltFrames.set(card, requestAnimationFrame(() => {
        tiltFrames.delete(card);
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        card.style.setProperty("--tilt-x", `${(0.5 - y) * 4}deg`);
        card.style.setProperty("--tilt-y", `${(x - 0.5) * 5}deg`);
        card.style.setProperty("--glow-x", `${x * 100}%`);
        card.style.setProperty("--glow-y", `${y * 100}%`);
    }));
}

function resetProjectTilt(event) {
    const card = event.currentTarget;
    const frame = tiltFrames.get(card);
    if (frame) cancelAnimationFrame(frame);
    tiltFrames.delete(card);
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
    card.style.setProperty("--glow-x", "50%");
    card.style.setProperty("--glow-y", "50%");
}

function updateProjectCount(nextCount) {
    const counter = document.getElementById("project-count");
    if (!counter) return;
    const start = currentFilterCount;
    const end = nextCount;
    currentFilterCount = nextCount;
    if (projectCountFrame) cancelAnimationFrame(projectCountFrame);

    if (reduceMotion.matches || start === end) {
        counter.textContent = `${end} PROJECT${end === 1 ? "" : "S"} FOUND`;
        return;
    }

    const duration = 260;
    const startTime = performance.now();
    function tick(now) {
        const progress = Math.min(1, (now - startTime) / duration);
        const value = Math.round(start + (end - start) * progress);
        counter.textContent = `${value} PROJECT${value === 1 ? "" : "S"} FOUND`;
        if (progress < 1) {
            projectCountFrame = requestAnimationFrame(tick);
        } else {
            projectCountFrame = 0;
        }
    }
    projectCountFrame = requestAnimationFrame(tick);
}

let radarObserver = null;
function initRadarObserver() {
    if (!("IntersectionObserver" in window)) return;
    
    const buttons = document.querySelectorAll(".section-radar button");
    const observerOptions = {
        root: null,
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0
    };
    
    radarObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const sectionId = entry.target.id;
            if (entry.isIntersecting) {
                buttons.forEach(button => {
                    button.classList.toggle("active", button.dataset.section === sectionId);
                });
            } else {
                buttons.forEach(button => {
                    if (button.dataset.section === sectionId) {
                        button.classList.remove("active");
                    }
                });
            }
        });
    }, observerOptions);
}

function focusProject(direction) {
    const projects = Array.from(document.querySelectorAll(".project-item:not(.is-hidden)"));
    if (!projects.length) return;
    const currentIndex = projects.indexOf(document.activeElement);
    const nextIndex = currentIndex === -1
        ? 0
        : (currentIndex + direction + projects.length) % projects.length;
    projects[nextIndex].focus();
}

function updateMapParallax(e) {
    if (reduceMotion.matches || document.body.classList.contains("low-fx") || !mapElement) return;

    if (mapRectDirty || !mapRect) {
        mapRect = mapElement.getBoundingClientRect();
        mapRectDirty = false;
    }

    const x = Math.max(0, Math.min(1, (e.clientX - mapRect.left) / mapRect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - mapRect.top) / mapRect.height));

    mapElement.style.setProperty("--spot-x", `${x * 100}%`);
    mapElement.style.setProperty("--spot-y", `${y * 100}%`);
    mapElement.style.setProperty("--map-shift-x", `${(x - 0.5) * 10}px`);
    mapElement.style.setProperty("--map-shift-y", `${(y - 0.5) * 10}px`);
}

function updateProgress() {
    if (!circle) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    circle.style.strokeDashoffset = circumference * (1 - scrollPercent);
}

function schedulePointerEffects(event) {
    latestPointerEvent = event;
    if (pointerEffectsFrame || document.hidden) return;

    pointerEffectsFrame = requestAnimationFrame(() => {
        pointerEffectsFrame = 0;
        if (!latestPointerEvent) return;
        createMouseParticle(latestPointerEvent);
        updateMapParallax(latestPointerEvent);
    });
}

function handleViewportChange() {
    mapRectDirty = true;
    if (progressFrame || document.hidden) return;

    progressFrame = requestAnimationFrame(() => {
        progressFrame = 0;
        updateProgress();
    });
}

function handleVisibilityChange() {
    const isPaused = document.hidden;
    document.body.classList.toggle("effects-paused", isPaused);

    if (isPaused) {
        if (pointerEffectsFrame) cancelAnimationFrame(pointerEffectsFrame);
        if (progressFrame) cancelAnimationFrame(progressFrame);
        pointerEffectsFrame = 0;
        progressFrame = 0;
    } else {
        mapRectDirty = true;
        updateProgress();
    }

    if (!audioEnabled || !audioContext) return;
    if (isPaused && audioContext.state === "running") audioContext.suspend();
    if (!isPaused && audioContext.state === "suspended") audioContext.resume();
}

function observeRevealElements(root = document) {
    const elements = root.querySelectorAll(".reveal-on-scroll");

    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
        elements.forEach(element => element.classList.add("is-visible"));
        return;
    }

    if (!revealObserver) {
        revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.16 });
    }

    elements.forEach(element => revealObserver.observe(element));
}

function typeText(element, text, speed = 32, callback) {
    if (!element) return;
    element.textContent = "";

    if (reduceMotion.matches) {
        element.textContent = text;
        if (callback) callback();
        return;
    }

    [...text].forEach((character, index) => {
        const timer = setTimeout(() => {
            element.textContent += character;
            if (index === text.length - 1 && callback) {
                callback();
            }
        }, index * speed);
        typewriterTimers.push(timer);
    });
}

function startHeaderTypewriter() {
    typewriterTimers.forEach(clearTimeout);
    typewriterTimers = [];
    
    const headerEl = document.getElementById("typed-header");
    const subheaderEl = document.getElementById("typed-subheader");
    
    if (headerEl) headerEl.classList.add("typing");
    if (subheaderEl) subheaderEl.classList.remove("typing");
    
    typeText(headerEl, HEADER_TITLE, 42, () => {
        if (headerEl) headerEl.classList.remove("typing");
        if (subheaderEl) subheaderEl.classList.add("typing");
        
        const subTimer = setTimeout(() => {
            typeText(subheaderEl, HEADER_SUBTITLE, 34);
        }, 200);
        typewriterTimers.push(subTimer);
    });
}

document.addEventListener("mousemove", schedulePointerEffects, { passive: true });
window.addEventListener("scroll", handleViewportChange, { passive: true });
window.addEventListener("resize", handleViewportChange, { passive: true });
document.addEventListener("visibilitychange", handleVisibilityChange);

document.addEventListener("DOMContentLoaded", () => {
    initLowFx();
    updateProgress();
    initRadarObserver();
    decorateHeadings();
    startHeaderTypewriter();
    observeRevealElements();
    setupProjectInteractions();
    document.getElementById("sound-toggle")?.addEventListener("click", toggleAudio);
    document.getElementById("low-fx-toggle")?.addEventListener("click", toggleLowFx);
    document.querySelectorAll(".section-radar button").forEach(button => {
        button.addEventListener("click", () => jumpToSection(button.dataset.section));
    });

    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("./sw.js")
                .then(reg => console.log("SW Registered:", reg.scope))
                .catch(err => console.error("SW Registration failed:", err));
        });
    }
});



let currentCategoryFilter = "all";

function applyProjectFilters() {
    const projectItems = Array.from(document.querySelectorAll(".project-item"));
    const itemStates = projectItems.map(item => ({
        item,
        show: currentCategoryFilter === "all" || item.dataset.category.split(" ").includes(currentCategoryFilter)
    }));
    updateProjectCount(itemStates.filter(state => state.show).length);
    
    itemStates.forEach(({ item, show }, index) => {
        const isCurrentlyHidden = item.classList.contains("is-hidden") || item.classList.contains("is-filtered-out");
        const previousTransition = filterTransitions.get(item);
        if (show === !isCurrentlyHidden && !previousTransition) return;

        if (previousTransition?.frame) cancelAnimationFrame(previousTransition.frame);
        if (previousTransition?.hideTimer) clearTimeout(previousTransition.hideTimer);
        if (previousTransition?.cleanupTimer) clearTimeout(previousTransition.cleanupTimer);

        const transition = {};
        
        item.classList.add("is-filtering");
        item.style.setProperty("--filter-delay", `${Math.min(index, 8) * 28}ms`);
        
        if (show) {
            item.classList.remove("is-hidden");
            transition.frame = requestAnimationFrame(() => item.classList.remove("is-filtered-out"));
        } else {
            item.classList.add("is-filtered-out");
            transition.hideTimer = setTimeout(() => item.classList.add("is-hidden"), reduceMotion.matches ? 1 : 240);
        }
        
        transition.cleanupTimer = setTimeout(() => {
            item.classList.remove("is-filtering");
            filterTransitions.delete(item);
        }, reduceMotion.matches ? 1 : 300);
        filterTransitions.set(item, transition);
    });
}

function filterProjects(filter) {
    currentCategoryFilter = filter;
    playSfx("filter");

    document.querySelectorAll(".project-filter").forEach(button => {
        const isActive = button.dataset.filter === filter;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });

    applyProjectFilters();
}

// ====================== GITHUB MODAL ======================

function openGithubModal() {
    const modal = document.getElementById("github-modal");
    if (!modal) return;
    playSfx("open");
    lastActiveElement = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    const closeBtn = modal.querySelector(".github-modal-close");
    closeBtn?.focus();
}

function closeGithubModal() {
    const modal = document.getElementById("github-modal");
    if (!modal) return;
    playSfx("close");
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    if (lastActiveElement) {
        lastActiveElement.focus();
        lastActiveElement = null;
    }
}

document.addEventListener("click", event => {
    const clickedImage = event.target.closest?.(".project-item > img, .project-images-grid img");
    if (!clickedImage) return;

    const projectItem = clickedImage.closest(".project-item");
    if (!projectItem) return;

    event.preventDefault();
    event.stopPropagation();
    openImageCarousel(projectItem, clickedImage.getAttribute("src"));
}, true);

document.addEventListener("click", event => {
    if (event.target.id === "github-modal") {
        closeGithubModal();
    }

    if (event.target.classList.contains("project-filter")) {
        filterProjects(event.target.dataset.filter);
        return;
    }

    if (event.target.classList.contains("collapsible")) {
        const isOpen = event.target.classList.toggle("active");
        const content = event.target.nextElementSibling;
        event.target.setAttribute("aria-expanded", String(isOpen));
        if (content) content.hidden = !isOpen;
        playSfx(isOpen ? "open" : "close");
        return;
    }

    const projectItem = event.target.closest(".project-item");
    if (projectItem && !shouldIgnoreProjectToggle(event)) {
        playSfx("open");
        toggleProjectDetails(projectItem.dataset.projectId);
    }
});

document.addEventListener("mouseover", event => {
    const featureTarget = event.target.closest(".project-features li, .tech-chip, .image-carousel-thumbnail");
    const movedWithinFeature = event.relatedTarget instanceof Node && featureTarget?.contains(event.relatedTarget);
    if (featureTarget && !movedWithinFeature) {
        playSfx("feature");
        return;
    }

    const interactiveTarget = event.target.closest(".level, .project-filter, .github-link, .header-github-button, .github-modal-link");
    const movedWithinInteractive = event.relatedTarget instanceof Node && interactiveTarget?.contains(event.relatedTarget);
    if (interactiveTarget && !movedWithinInteractive) {
        playSfx("hover");
    }
}, { passive: true });

document.addEventListener("keydown", event => {
    const githubModal = document.getElementById("github-modal");
    const carouselModal = document.getElementById("image-carousel-modal");
    
    if (githubModal && githubModal.classList.contains("is-open")) {
        if (event.key === "Tab") {
            handleModalTab(event, githubModal);
        }
    } else if (carouselModal && carouselModal.classList.contains("is-open")) {
        if (event.key === "Tab") {
            handleModalTab(event, carouselModal);
        }
    }

    if (event.key === "Escape") {
        closeGithubModal();
        closeImageCarousel();
    }

    if (document.getElementById("image-carousel-modal")?.classList.contains("is-open")) {
        if (event.key === "ArrowLeft") moveImageCarousel(-1);
        if (event.key === "ArrowRight") moveImageCarousel(1);
        return;
    }

    if (SECTION_KEYS[event.key] && !event.altKey && !event.ctrlKey && !event.metaKey) {
        jumpToSection(SECTION_KEYS[event.key]);
        return;
    }

    const activeEl = document.activeElement;
    const insideProject = activeEl && (activeEl.classList.contains("project-item") || activeEl.closest(".project-item"));

    if (insideProject && event.key === "ArrowDown") {
        event.preventDefault();
        focusProject(1);
        return;
    }

    if (insideProject && event.key === "ArrowUp") {
        event.preventDefault();
        focusProject(-1);
        return;
    }

    const projectItem = event.target.closest?.(".project-item");
    const targetIsNestedControl = event.target.closest?.("a, button");
    if (projectItem && !targetIsNestedControl && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        toggleProjectDetails(projectItem.dataset.projectId);
    }
});
