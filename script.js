import { EXPERIENCE, HEADER_SUBTITLE, HEADER_TITLE, PROJECTS, SECTION_KEYS } from "./portfolio-data.js?v=20260719e";
import { playSfx, syncAudioVisibility, toggleAudio } from "./js/audio.js?v=20260719e";
import {
    closeImageCarousel,
    hydrateProjectImages,
    moveImageCarousel,
    openImageCarousel,
} from "./js/carousel.js?v=20260719e";
import { FINE_POINTER_QUERY, handleModalTab, versionAssetImages, versionedAsset } from "./js/core.js?v=20260719e";
import { renderSection } from "./js/sections.js?v=20260719e";

const PARTICLE_COLORS = Object.freeze(["var(--green)", "var(--cyan)", "var(--pink)", "var(--gold)"]);
const POINTER_DEPTH_EASE = 0.23;
const POINTER_LOCAL_EASE = 0.28;
const POINTER_SETTLE_THRESHOLD = 0.003;

let lastActiveElement = null;

// ====================== JUMP TO SECTION ======================

const loadedSections = new Set();
const SECTION_ORDER = Object.freeze(["about", "current", "experience", "projects", "contact"]);
let hashNavigationFrame = 0;
let hashNavigationForceAuto = false;

function ensureSectionLoaded(sectionId) {
    if (!SECTION_ORDER.includes(sectionId)) return null;
    if (!loadedSections.has(sectionId)) {
        createSection(sectionId);
        loadedSections.add(sectionId);
    }
    return document.getElementById(sectionId);
}

function buildPortfolioHash(type, id = "") {
    if (type === "home") return "";
    if (type === "section" && SECTION_ORDER.includes(id)) return `#${id}`;
    if (type === "experience") return `#experience/${encodeURIComponent(id)}`;
    if (type === "project") return `#project/${encodeURIComponent(id)}`;
    return "";
}

function writePortfolioHash(type, id, historyMode = "push") {
    if (historyMode === "none") return;
    const nextHash = buildPortfolioHash(type, id);
    if (window.location.hash === nextHash) return;
    const method = historyMode === "replace" ? "replaceState" : "pushState";
    window.history[method](null, "", nextHash || `${window.location.pathname}${window.location.search}`);
}

function parsePortfolioHash(hash = window.location.hash) {
    const rawHash = hash.replace(/^#/, "");
    if (!rawHash) return { type: "home" };

    let parts;
    try {
        parts = rawHash.split("/").map((part) => decodeURIComponent(part));
    } catch {
        return null;
    }

    if (parts.length === 1 && SECTION_ORDER.includes(parts[0])) {
        return { type: "section", sectionId: parts[0] };
    }
    if (parts.length === 2 && parts[0] === "experience" && EXPERIENCE.some((item) => item.id === parts[1])) {
        return { type: "experience", id: parts[1] };
    }
    if (parts.length === 2 && parts[0] === "project" && PROJECTS.some((item) => item.id === parts[1])) {
        return { type: "project", id: parts[1] };
    }
    return null;
}

function insertSectionInOrder(section) {
    const sectionIndex = SECTION_ORDER.indexOf(section.id);
    const nextSection = SECTION_ORDER.slice(sectionIndex + 1)
        .map((id) => document.getElementById(id))
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

function scrollToPortfolioTarget(target, { block = "start", forceAuto = false } = {}) {
    if (!target) return;
    requestAnimationFrame(() => {
        const distance = Math.abs(target.getBoundingClientRect().top);
        const shouldJump = forceAuto || reduceMotion.matches || distance > window.innerHeight * 3;
        if (!shouldJump) {
            target.scrollIntoView({ behavior: "smooth", block });
            return;
        }

        const root = document.documentElement;
        const previousScrollBehavior = root.style.scrollBehavior;
        root.style.scrollBehavior = "auto";
        const alignTarget = () => target.scrollIntoView({ behavior: "auto", block });
        alignTarget();
        requestAnimationFrame(alignTarget);
        setTimeout(() => {
            alignTarget();
            if (previousScrollBehavior) {
                root.style.scrollBehavior = previousScrollBehavior;
            } else {
                root.style.removeProperty("scroll-behavior");
            }
        }, 100);
    });
}

function scrollToPortfolioSection(section, forceAuto = false) {
    scrollToPortfolioTarget(section, { block: "start", forceAuto });
}

function jumpToSection(sectionId, { historyMode = "push", playSound = true, forceAuto = false } = {}) {
    if (!SECTION_ORDER.includes(sectionId)) return;
    markZoneVisited(sectionId);
    if (playSound) playSfx("nav");
    const section = ensureSectionLoaded(sectionId);
    if (sectionId === "projects") closeAllProjectDetails();
    setActiveSection(sectionId);
    if (playSound) playMapTravel(sectionId);
    writePortfolioHash("section", sectionId, historyMode);
    scrollToPortfolioSection(section, forceAuto);
}

// ====================== CREATE SECTIONS ======================

function createSection(sectionId) {
    const section = document.createElement("section");
    section.id = sectionId;
    section.className = "content-section section-boot";
    section.innerHTML = renderSection(sectionId);
    const depthField = document.createElement("div");
    depthField.className = "section-depth-field";
    depthField.setAttribute("aria-hidden", "true");
    section.prepend(depthField);
    versionAssetImages(section);
    insertSectionInOrder(section);
    observeVisualSurface(section);
    observeRevealElements(section);
    setupProjectInteractions(section);
    setupArtworkInteractions(section);
    if (radarObserver) {
        radarObserver.observe(section);
    }
    requestAnimationFrame(() => {
        section.classList.add("is-booted");
        updateTimelineProgress();
    });
}

// ====================== PROJECT TOGGLE ======================

function isProjectExpanded(projectItem) {
    return projectItem?.querySelector(".project-summary-toggle")?.getAttribute("aria-expanded") === "true";
}

function updateProjectFocusState() {
    const grid = document.querySelector(".projects-grid");
    if (!grid) return;
    const expandedProject = grid.querySelector(".project-item.is-expanded");
    grid.classList.toggle("has-expanded-project", Boolean(expandedProject));
    grid.querySelectorAll(".project-item").forEach((projectItem) => {
        projectItem.classList.toggle("is-project-muted", Boolean(expandedProject) && projectItem !== expandedProject);
    });
}

function toggleProjectDetails(
    id,
    forceOpen = null,
    { updateHistory = true, historyMode = "push", scrollIntoView = true } = {},
) {
    const details = document.getElementById(id);
    const projectItem = details?.closest(".project-item");
    const summaryToggle = projectItem?.querySelector(".project-summary-toggle");
    if (!details || !projectItem || !summaryToggle) return false;

    const currentlyOpen = isProjectExpanded(projectItem);
    const isOpen = typeof forceOpen === "boolean" ? forceOpen : !currentlyOpen;
    stopProjectPreview(projectItem);
    if (isOpen && updateHistory) closeAllProjectDetails(id);
    projectItem.classList.toggle("is-expanded", isOpen);
    summaryToggle.setAttribute("aria-expanded", String(isOpen));
    updateProjectFocusState();

    if (isOpen) {
        hydrateProjectImages(projectItem);
        details.hidden = false;
        details.classList.remove("is-closing");
        requestAnimationFrame(() => {
            if (!isProjectExpanded(projectItem)) return;
            details.classList.add("is-open");
            if (scrollIntoView)
                requestAnimationFrame(() => {
                    projectItem.scrollIntoView({
                        behavior: reduceMotion.matches ? "auto" : "smooth",
                        block: "start",
                    });
                });
        });
    } else {
        details.classList.add("is-closing");
        details.classList.remove("is-open");
        setTimeout(
            () => {
                if (!details.classList.contains("is-open")) {
                    details.hidden = true;
                    details.classList.remove("is-closing");
                }
            },
            reduceMotion.matches ? 1 : 260,
        );
    }

    if (updateHistory) {
        writePortfolioHash(isOpen ? "project" : "section", isOpen ? id : "projects", historyMode);
    }
    return isOpen;
}

function closeAllProjectDetails(exceptId = "") {
    document.querySelectorAll(".project-item.is-expanded").forEach((projectItem) => {
        if (projectItem.dataset.projectId === exceptId) return;
        toggleProjectDetails(projectItem.dataset.projectId, false, {
            updateHistory: false,
            scrollIntoView: false,
        });
    });
}

function resetProjectDiscoveryForDeepLink() {
    currentCategoryFilter = "all";
    currentProjectQuery = "";
    if (projectSearchFrame) cancelAnimationFrame(projectSearchFrame);
    projectSearchFrame = 0;

    const searchInput = document.querySelector(".project-name-search");
    if (searchInput) searchInput.value = "";
    document.querySelectorAll(".project-filter").forEach((button) => {
        const isActive = button.dataset.filter === "all";
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
    applyProjectFilters();
}

function highlightLinkedDestination(element) {
    if (!element) return;
    const previousTimer = deepLinkHighlightTimers.get(element);
    if (previousTimer) clearTimeout(previousTimer);
    element.classList.remove("is-linked-destination");
    requestAnimationFrame(() => {
        element.classList.add("is-linked-destination");
        deepLinkHighlightTimers.set(
            element,
            setTimeout(() => {
                element.classList.remove("is-linked-destination");
                deepLinkHighlightTimers.delete(element);
            }, 900),
        );
    });
}

function jumpToExperience(experienceId, { historyMode = "push", playSound = true, forceAuto = false } = {}) {
    if (!EXPERIENCE.some((item) => item.id === experienceId)) return;
    const section = ensureSectionLoaded("experience");
    const card = section?.querySelector(`[data-experience-id="${experienceId}"]`);
    if (!card) return;

    markZoneVisited("experience");
    setActiveSection("experience");
    if (playSound) playSfx("nav");
    writePortfolioHash("experience", experienceId, historyMode);
    highlightLinkedDestination(card);
    scrollToPortfolioTarget(card, { block: "center", forceAuto });
}

function jumpToProject(projectId, { historyMode = "push", playSound = true, forceAuto = false } = {}) {
    if (!PROJECTS.some((item) => item.id === projectId)) return;
    const section = ensureSectionLoaded("projects");
    const projectItem = Array.from(section?.querySelectorAll(".project-item") || []).find(
        (item) => item.dataset.projectId === projectId,
    );
    if (!projectItem) return;

    markZoneVisited("projects");
    setActiveSection("projects");
    resetProjectDiscoveryForDeepLink();
    closeAllProjectDetails(projectId);
    toggleProjectDetails(projectId, true, {
        updateHistory: false,
        scrollIntoView: false,
    });
    if (playSound) playSfx("open");
    writePortfolioHash("project", projectId, historyMode);
    highlightLinkedDestination(projectItem);
    scrollToPortfolioTarget(projectItem, { block: "start", forceAuto });
}

function jumpToHome({ forceAuto = false } = {}) {
    closeAllProjectDetails();
    setActiveSection("about");
    scrollToPortfolioTarget(mapElement, { block: "start", forceAuto });
}

function applyPortfolioHash({ forceAuto = false } = {}) {
    const route = parsePortfolioHash();
    if (!route) return;
    if (route.type === "home") {
        jumpToHome({ forceAuto });
    } else if (route.type === "section") {
        jumpToSection(route.sectionId, { historyMode: "none", playSound: false, forceAuto });
    } else if (route.type === "experience") {
        jumpToExperience(route.id, { historyMode: "none", playSound: false, forceAuto });
    } else if (route.type === "project") {
        jumpToProject(route.id, { historyMode: "none", playSound: false, forceAuto });
    }
}

function schedulePortfolioHashNavigation(forceAuto = false) {
    hashNavigationForceAuto ||= forceAuto;
    if (hashNavigationFrame) return;
    hashNavigationFrame = requestAnimationFrame(() => {
        hashNavigationFrame = 0;
        const shouldForceAuto = hashNavigationForceAuto;
        hashNavigationForceAuto = false;
        applyPortfolioHash({ forceAuto: shouldForceAuto });
    });
}

// ====================== PROJECT IMAGE SELECTION ======================

function setProjectInspectionImage(projectItem, nextIndex, { playSound = true } = {}) {
    const gallery = projectItem?.querySelector(".project-inspection-gallery");
    const stage = gallery?.querySelector(".project-inspection-stage");
    const stageImage = stage?.querySelector("img");
    const thumbnails = Array.from(gallery?.querySelectorAll(".project-inspection-thumbnail") || []);
    const thumbnail = thumbnails[nextIndex];
    const thumbnailImage = thumbnail?.querySelector("img");
    if (!gallery || !stage || !stageImage || !thumbnail || !thumbnailImage) return false;

    const currentIndex = Number(gallery.dataset.activeIndex || 0);
    if (currentIndex !== nextIndex) {
        if (playSound) playSfx("carousel");
        gallery.dataset.activeIndex = String(nextIndex);
        stageImage.src = thumbnailImage.currentSrc || thumbnailImage.src;
        stageImage.alt = thumbnail.dataset.imageAlt || projectItem.dataset.projectTitle || "Project screenshot";
        stage.setAttribute("aria-label", `Open ${projectItem.dataset.projectTitle} screenshot ${nextIndex + 1}`);
        stage.classList.remove("is-switching");
        void stage.offsetWidth;
        stage.classList.add("is-switching");
    }

    thumbnails.forEach((button, index) => {
        const isActive = index === nextIndex;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
    return true;
}

// ====================== VISUAL EFFECTS + PROGRESS + INIT ======================

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const circle = document.querySelector(".progress-ring__circle");
const mapElement = document.querySelector(".map");
const PROGRESS_CIRCUMFERENCE = 175;
const VISITED_STORAGE_KEY = "portfolioVisitedSections";
const PARTICLE_POOL_SIZE = 8;
const visitedSections = new Set();
const particlePool = [];
const tiltFrames = new WeakMap();
const filterTransitions = new WeakMap();
const artworkFrames = new WeakMap();
const deepLinkHighlightTimers = new WeakMap();
const pointerDepth = {
    active: false,
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    currentLocalX: 0,
    currentLocalY: 0,
    targetLocalX: 0,
    targetLocalY: 0,
    lastClientX: null,
    lastClientY: null,
    surface: null,
    surfaceRect: null,
    surfaceRectDirty: true,
};

let lastParticleTime = 0;
let revealObserver;
let typewriterTimers = [];
let currentFilterCount = PROJECTS.length;
let pointerEffectsFrame = 0;
let progressFrame = 0;
let projectCountFrame = 0;
let projectSearchFrame = 0;
let mapRect = null;
let mapRectDirty = true;
let particleCursor = 0;
let currentProjectQuery = "";
let activeSectionId = "about";
let activeProjectPreview = null;
let projectPreviewFrame = 0;
let latestProjectPreviewEvent = null;
let projectPreviewObserver = null;
let radarObserver = null;
let visualSurfaceObserver = null;
let mapTravelTimer = 0;
let currentCategoryFilter = "all";

if (circle) {
    circle.style.strokeDasharray = PROGRESS_CIRCUMFERENCE;
    circle.style.strokeDashoffset = PROGRESS_CIRCUMFERENCE;
}

function createMouseParticle(event, velocityX, velocityY, minimumInterval = 120) {
    if (reduceMotion.matches || !FINE_POINTER_QUERY.matches || Math.hypot(velocityX, velocityY) < 1.25) return;

    const now = performance.now();
    if (now - lastParticleTime < minimumInterval) return;
    lastParticleTime = now;

    let p;
    if (particlePool.length < PARTICLE_POOL_SIZE) {
        p = document.createElement("div");
        p.className = "particle";
        p.hidden = true;
        particlePool.push(p);
        document.body.appendChild(p);
    } else {
        p = particlePool[particleCursor % PARTICLE_POOL_SIZE];
    }
    particleCursor += 1;

    const size = Math.floor(Math.random() * 4 + 3);
    p.getAnimations().forEach((animation) => animation.cancel());
    p.hidden = false;
    p.style.left = `${event.clientX}px`;
    p.style.top = `${event.clientY}px`;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
    const sideDrift = (particleCursor % 2 === 0 ? -1 : 1) * (4 + Math.random() * 6);
    const driftX = Math.max(-28, Math.min(28, velocityX * 1.45 + sideDrift));
    const driftY = Math.max(-18, Math.min(18, velocityY * 1.1)) - 25 - Math.random() * 7;
    p.style.color = color;
    p.style.background = color;

    const animation = p.animate(
        [
            { opacity: 1, transform: "translate3d(-50%, -50%, 0) scale(1)" },
            {
                opacity: 0,
                transform: `translate3d(calc(-50% + ${driftX.toFixed(2)}px), calc(-50% + ${driftY.toFixed(2)}px), 0) scale(0.3) rotate(${sideDrift > 0 ? 18 : -18}deg)`,
            },
        ],
        {
            duration: 620,
            easing: "steps(6, end)",
            fill: "forwards",
        },
    );
    animation.onfinish = () => {
        p.hidden = true;
    };
}

function stopProjectPreview(projectItem = activeProjectPreview) {
    if (!activeProjectPreview || (projectItem && projectItem !== activeProjectPreview)) return;

    if (projectPreviewFrame) cancelAnimationFrame(projectPreviewFrame);
    projectPreviewFrame = 0;
    latestProjectPreviewEvent = null;

    const card = activeProjectPreview;
    const image = card.querySelector(":scope > img");
    if (image?.dataset.previewOriginalSrc) {
        image.src = image.dataset.previewOriginalSrc;
        image.alt = image.dataset.previewOriginalAlt || card.dataset.projectTitle || "Project screenshot";
        delete image.dataset.previewOriginalSrc;
        delete image.dataset.previewOriginalAlt;
    }
    image?.classList.remove("is-preview-switching");
    card.classList.remove("is-previewing");
    delete card.dataset.previewIndex;
    activeProjectPreview = null;
}

function handleProjectPreviewPointerMove(event) {
    if (!activeProjectPreview) return;

    const coverImage = activeProjectPreview.querySelector(":scope > img");
    if (event.target !== coverImage) {
        stopProjectPreview(activeProjectPreview);
    }
}

function beginProjectPreview(projectItem) {
    if (
        reduceMotion.matches ||
        !projectItem.classList.contains("project-inspection-item") ||
        isProjectExpanded(projectItem)
    )
        return false;

    const image = projectItem.querySelector(":scope > img");
    const images = (projectItem.dataset.previewImages || "").split("|").filter(Boolean);
    if (!image || images.length < 2) return false;

    if (activeProjectPreview !== projectItem) {
        stopProjectPreview();
        activeProjectPreview = projectItem;
        image.dataset.previewOriginalSrc = image.src;
        image.dataset.previewOriginalAlt = image.alt;
        projectItem.dataset.previewIndex = "0";
        projectItem.classList.add("is-previewing");
    }
    return true;
}

function scrubProjectPreview(projectItem, event) {
    if (!beginProjectPreview(projectItem)) return;
    latestProjectPreviewEvent = { projectItem, clientX: event.clientX };
    if (projectPreviewFrame) return;

    projectPreviewFrame = requestAnimationFrame(() => {
        projectPreviewFrame = 0;
        const preview = latestProjectPreviewEvent;
        latestProjectPreviewEvent = null;
        if (!preview || activeProjectPreview !== preview.projectItem) return;

        const image = preview.projectItem.querySelector(":scope > img");
        const images = (preview.projectItem.dataset.previewImages || "").split("|").filter(Boolean);
        if (!image || images.length < 2) return;

        const rect = image.getBoundingClientRect();
        const position = Math.max(0, Math.min(0.999, (preview.clientX - rect.left) / Math.max(1, rect.width)));
        const nextIndex = Math.floor(position * images.length);
        if (nextIndex === Number(preview.projectItem.dataset.previewIndex || 0)) return;

        image.classList.add("is-preview-switching");
        image.src = versionedAsset(images[nextIndex]);
        image.alt = `${preview.projectItem.dataset.projectTitle} screenshot ${nextIndex + 1}`;
        preview.projectItem.dataset.previewIndex = String(nextIndex);
        requestAnimationFrame(() => image.classList.remove("is-preview-switching"));
    });
}

function setupProjectInteractions(root = document) {
    if (!FINE_POINTER_QUERY.matches) return;

    if (!projectPreviewObserver && "IntersectionObserver" in window) {
        projectPreviewObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting && entry.target === activeProjectPreview) {
                        stopProjectPreview(entry.target);
                    }
                });
            },
            { rootMargin: "120px 0px", threshold: 0.01 },
        );
    }

    root.querySelectorAll(".project-item").forEach((projectItem) => {
        projectItem.addEventListener("mousemove", handleProjectTilt);
        projectItem.addEventListener("mouseleave", resetProjectTilt);
        projectItem.addEventListener("mouseleave", () => stopProjectPreview(projectItem));
        const coverImage = projectItem.querySelector(":scope > img");
        if (projectItem.classList.contains("project-inspection-item") && coverImage) {
            coverImage.addEventListener("pointerenter", () => beginProjectPreview(projectItem));
            coverImage.addEventListener("pointermove", (event) => scrubProjectPreview(projectItem, event), {
                passive: true,
            });
            coverImage.addEventListener("pointerleave", () => stopProjectPreview(projectItem));
        }
        projectItem.addEventListener("mouseenter", () => playSfx("hover"));
        projectPreviewObserver?.observe(projectItem);
    });
}

function setupArtworkInteractions(root = document) {
    if (!FINE_POINTER_QUERY.matches) return;

    root.querySelectorAll(".section-artwork").forEach((image) => {
        if (image.dataset.artworkReady === "true") return;
        image.dataset.artworkReady = "true";
        const panel = image.parentElement;
        if (!panel) return;

        panel.addEventListener(
            "pointermove",
            (event) => {
                if (reduceMotion.matches || artworkFrames.has(panel)) return;
                artworkFrames.set(
                    panel,
                    requestAnimationFrame(() => {
                        artworkFrames.delete(panel);
                        const rect = image.getBoundingClientRect();
                        const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
                        const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
                        image.style.setProperty("--art-x", `${(x - 0.5) * 10}px`);
                        image.style.setProperty("--art-y", `${(y - 0.5) * 8}px`);
                        image.style.setProperty("--art-tilt-x", `${(0.5 - y) * 1.8}deg`);
                        image.style.setProperty("--art-tilt-y", `${(x - 0.5) * 2.4}deg`);
                        panel.style.setProperty("--art-light-x", `${x * 100}%`);
                        panel.style.setProperty("--art-light-y", `${y * 100}%`);
                    }),
                );
            },
            { passive: true },
        );

        panel.addEventListener(
            "pointerleave",
            () => {
                const frame = artworkFrames.get(panel);
                if (frame) cancelAnimationFrame(frame);
                artworkFrames.delete(panel);
                image.style.setProperty("--art-x", "0px");
                image.style.setProperty("--art-y", "0px");
                image.style.setProperty("--art-tilt-x", "0deg");
                image.style.setProperty("--art-tilt-y", "0deg");
                panel.style.setProperty("--art-light-x", "50%");
                panel.style.setProperty("--art-light-y", "50%");
            },
            { passive: true },
        );
    });
}

function handleProjectTilt(event) {
    if (reduceMotion.matches) return;
    const card = event.currentTarget;
    if (tiltFrames.has(card)) return;

    tiltFrames.set(
        card,
        requestAnimationFrame(() => {
            tiltFrames.delete(card);
            const rect = card.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;
            card.style.setProperty("--tilt-x", `${(0.5 - y) * 4}deg`);
            card.style.setProperty("--tilt-y", `${(x - 0.5) * 5}deg`);
            card.style.setProperty("--glow-x", `${x * 100}%`);
            card.style.setProperty("--glow-y", `${y * 100}%`);
        }),
    );
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

function updateVisitedZoneMarkers() {
    document.querySelectorAll(".map .level").forEach((level) => {
        level.classList.toggle("is-visited", visitedSections.has(level.dataset.section));
    });

    const radar = document.querySelector(".section-radar");
    const unlockedSections = SECTION_ORDER.filter((sectionId) => visitedSections.has(sectionId));
    radar?.toggleAttribute("hidden", unlockedSections.length < 2);
    radar?.querySelectorAll("button").forEach((button) => {
        const isUnlocked = visitedSections.has(button.dataset.section);
        button.toggleAttribute("hidden", !isUnlocked);
        button.disabled = !isUnlocked;
        button.classList.toggle("is-unlocked", isUnlocked);
    });
}

function restoreVisitedZones() {
    try {
        const savedSections = JSON.parse(sessionStorage.getItem(VISITED_STORAGE_KEY) || "[]");
        if (Array.isArray(savedSections)) {
            savedSections
                .filter((sectionId) => SECTION_ORDER.includes(sectionId))
                .forEach((sectionId) => visitedSections.add(sectionId));
        }
    } catch {
        visitedSections.clear();
    }
    updateVisitedZoneMarkers();
}

function markZoneVisited(sectionId) {
    if (!SECTION_ORDER.includes(sectionId)) return;
    const isNewVisit = !visitedSections.has(sectionId);
    visitedSections.add(sectionId);
    updateVisitedZoneMarkers();
    if (!isNewVisit) return;
    try {
        sessionStorage.setItem(VISITED_STORAGE_KEY, JSON.stringify([...visitedSections]));
    } catch {
        // Session storage is an enhancement; map state still works for this page view.
    }
}

function setMapDestination(sectionId) {
    if (mapElement && SECTION_ORDER.includes(sectionId)) {
        mapElement.dataset.destination = sectionId;
    }
}

function playMapTravel(sectionId) {
    if (!mapElement || reduceMotion.matches) return;
    setMapDestination(sectionId);
    clearTimeout(mapTravelTimer);
    mapElement.classList.remove("is-travelling");
    requestAnimationFrame(() => {
        mapElement.classList.add("is-travelling");
        mapTravelTimer = setTimeout(() => {
            mapElement.classList.remove("is-travelling");
            mapTravelTimer = 0;
        }, 520);
    });
}

function setActiveSection(sectionId) {
    if (!SECTION_ORDER.includes(sectionId)) return;
    activeSectionId = sectionId;
    document.body.dataset.activeSection = sectionId;
    if (document.getElementById(sectionId)) markZoneVisited(sectionId);

    document.querySelectorAll(".content-section").forEach((section) => {
        section.classList.toggle("is-active-zone", section.id === sectionId);
    });
    document.querySelectorAll(".section-radar button").forEach((button) => {
        button.classList.toggle("active", button.dataset.section === sectionId);
    });
    document.querySelectorAll(".map .level").forEach((level) => {
        if (level.dataset.section === sectionId) {
            level.setAttribute("aria-current", "true");
        } else {
            level.removeAttribute("aria-current");
        }
    });

    const unlockedSections = SECTION_ORDER.filter((id) => visitedSections.has(id));
    const radarIndex = unlockedSections.indexOf(sectionId);
    const radar = document.querySelector(".section-radar");
    radar?.classList.toggle("has-active-node", radarIndex >= 0);
    radar?.style.setProperty("--radar-offset", `${Math.max(0, radarIndex) * 22}px`);
    setMapDestination(sectionId);
}

function setupMapInteractions() {
    setMapDestination(activeSectionId);
    document.querySelectorAll(".map .level").forEach((level) => {
        const previewDestination = () => setMapDestination(level.dataset.section);
        const restoreDestination = () => setMapDestination(activeSectionId);
        level.addEventListener("mouseenter", previewDestination);
        level.addEventListener("focus", previewDestination);
        level.addEventListener("mouseleave", () => {
            if (!level.matches(":focus")) restoreDestination();
        });
        level.addEventListener("blur", restoreDestination);
    });
}

function initRadarObserver() {
    if (!("IntersectionObserver" in window)) return;

    const observerOptions = {
        root: null,
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0,
    };

    radarObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const sectionId = entry.target.id;
            if (entry.isIntersecting) {
                setActiveSection(sectionId);
            }
        });
    }, observerOptions);
}

function observeVisualSurface(surface) {
    if (!surface) return;

    if (!("IntersectionObserver" in window)) {
        surface.classList.add("is-visual-active");
        return;
    }

    if (!visualSurfaceObserver) {
        visualSurfaceObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    entry.target.classList.toggle("is-visual-active", entry.isIntersecting);
                    if (!entry.isIntersecting && entry.target === pointerDepth.surface) {
                        resetPointerDepth(true);
                    }
                });
            },
            { rootMargin: "160px 0px", threshold: 0.01 },
        );
    }

    visualSurfaceObserver.observe(surface);
}

function focusProject(direction) {
    const projectToggles = Array.from(
        document.querySelectorAll(".project-item:not(.is-hidden) .project-summary-toggle"),
    );
    if (!projectToggles.length) return;
    const activeProject = document.activeElement?.closest(".project-item");
    const currentIndex = projectToggles.findIndex((toggle) => toggle.closest(".project-item") === activeProject);
    const nextIndex =
        currentIndex === -1 ? 0 : (currentIndex + direction + projectToggles.length) % projectToggles.length;
    projectToggles[nextIndex].focus();
}

function setPointerSurface(surface) {
    if (surface === pointerDepth.surface) return false;
    pointerDepth.surface?.classList.remove("is-pointer-zone");
    pointerDepth.surface = surface;
    pointerDepth.surfaceRect = null;
    pointerDepth.surfaceRectDirty = true;
    surface?.classList.add("is-pointer-zone");
    return true;
}

function setDepthVariables(x, y) {
    document.body.style.setProperty("--ambient-depth-x", `${(x * 2.5).toFixed(3)}px`);
    document.body.style.setProperty("--ambient-depth-y", `${(y * 2).toFixed(3)}px`);

    const surface = pointerDepth.surface;
    if (!surface) return;

    const surfaceStyle = surface.style;
    if (surface === mapElement) {
        surfaceStyle.setProperty("--surface-depth-x", `${(x * 7).toFixed(3)}px`);
        surfaceStyle.setProperty("--surface-depth-y", `${(y * 6).toFixed(3)}px`);
        surfaceStyle.setProperty("--surface-grid-x", `${(-x * 2.5).toFixed(3)}px`);
        surfaceStyle.setProperty("--surface-grid-y", `${(-y * 2).toFixed(3)}px`);
        surfaceStyle.setProperty("--surface-near-x", `${(x * 9).toFixed(3)}px`);
        surfaceStyle.setProperty("--surface-near-y", `${(y * 7).toFixed(3)}px`);
        return;
    }

    let directionX = 1;
    let directionY = 1;
    if (surface.id === "current") directionX = -1;
    if (surface.id === "experience") {
        directionX = 0.55;
        directionY = 1.2;
    }
    if (surface.id === "projects") {
        directionX = 1.15;
        directionY = 0.55;
    }
    if (surface.id === "contact") {
        directionX = -0.75;
        directionY = -0.85;
    }

    surfaceStyle.setProperty("--surface-near-x", `${(x * 5 * directionX).toFixed(3)}px`);
    surfaceStyle.setProperty("--surface-near-y", `${(y * 4 * directionY).toFixed(3)}px`);
    surfaceStyle.setProperty("--surface-angle", `${(x * 1.6).toFixed(3)}deg`);
}

function updatePointerDepth() {
    pointerEffectsFrame = 0;
    if (document.hidden || reduceMotion.matches || !FINE_POINTER_QUERY.matches) return;

    const deltaX = pointerDepth.targetX - pointerDepth.currentX;
    const deltaY = pointerDepth.targetY - pointerDepth.currentY;
    pointerDepth.currentX += deltaX * POINTER_DEPTH_EASE;
    pointerDepth.currentY += deltaY * POINTER_DEPTH_EASE;

    let localDeltaX = 0;
    let localDeltaY = 0;
    if (pointerDepth.surface) {
        localDeltaX = pointerDepth.targetLocalX - pointerDepth.currentLocalX;
        localDeltaY = pointerDepth.targetLocalY - pointerDepth.currentLocalY;
        pointerDepth.currentLocalX += localDeltaX * POINTER_LOCAL_EASE;
        pointerDepth.currentLocalY += localDeltaY * POINTER_LOCAL_EASE;

        pointerDepth.surface.style.setProperty("--pointer-local-x", `${pointerDepth.currentLocalX.toFixed(2)}px`);
        pointerDepth.surface.style.setProperty("--pointer-local-y", `${pointerDepth.currentLocalY.toFixed(2)}px`);
    }

    setDepthVariables(pointerDepth.currentX, pointerDepth.currentY);

    const depthSettled = Math.abs(deltaX) < POINTER_SETTLE_THRESHOLD && Math.abs(deltaY) < POINTER_SETTLE_THRESHOLD;
    const localSettled =
        !pointerDepth.surface || (Math.abs(localDeltaX) < 0.2 && Math.abs(localDeltaY) < 0.2) || !pointerDepth.active;

    if (!depthSettled || !localSettled) {
        pointerEffectsFrame = requestAnimationFrame(updatePointerDepth);
    } else if (!pointerDepth.active) {
        setPointerSurface(null);
        setDepthVariables(0, 0);
    }
}

function requestPointerDepthFrame() {
    if (!pointerEffectsFrame) pointerEffectsFrame = requestAnimationFrame(updatePointerDepth);
}

function updatePointerDepthTarget(event) {
    if (reduceMotion.matches || !FINE_POINTER_QUERY.matches) return;

    const surface = event.target instanceof Element ? event.target.closest(".map, .content-section") : null;
    const surfaceChanged = setPointerSurface(surface);
    pointerDepth.active = true;
    pointerDepth.targetX = Math.max(-1, Math.min(1, (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 2));
    pointerDepth.targetY = Math.max(-1, Math.min(1, (event.clientY / Math.max(1, window.innerHeight) - 0.5) * 2));
    document.body.classList.add("has-pointer-depth");

    if (surface) {
        if (surface === mapElement) {
            if (mapRectDirty || !mapRect) {
                mapRect = mapElement.getBoundingClientRect();
                mapRectDirty = false;
            }
            pointerDepth.surfaceRect = mapRect;
        } else if (pointerDepth.surfaceRectDirty || !pointerDepth.surfaceRect) {
            pointerDepth.surfaceRect = surface.getBoundingClientRect();
        }
        pointerDepth.surfaceRectDirty = false;

        pointerDepth.targetLocalX = Math.max(
            0,
            Math.min(pointerDepth.surfaceRect.width, event.clientX - pointerDepth.surfaceRect.left),
        );
        pointerDepth.targetLocalY = Math.max(
            0,
            Math.min(pointerDepth.surfaceRect.height, event.clientY - pointerDepth.surfaceRect.top),
        );
        if (surfaceChanged) {
            pointerDepth.currentLocalX = pointerDepth.targetLocalX;
            pointerDepth.currentLocalY = pointerDepth.targetLocalY;
        }
    }

    requestPointerDepthFrame();
}

function resetPointerDepth(immediate = false) {
    pointerDepth.active = false;
    pointerDepth.targetX = 0;
    pointerDepth.targetY = 0;
    pointerDepth.lastClientX = null;
    pointerDepth.lastClientY = null;
    document.body.classList.remove("has-pointer-depth");

    if (immediate || reduceMotion.matches || !FINE_POINTER_QUERY.matches) {
        if (pointerEffectsFrame) cancelAnimationFrame(pointerEffectsFrame);
        pointerEffectsFrame = 0;
        pointerDepth.currentX = 0;
        pointerDepth.currentY = 0;
        setPointerSurface(null);
        setDepthVariables(0, 0);
        return;
    }
    requestPointerDepthFrame();
}

function handlePointerPreferenceChange() {
    resetPointerDepth(true);
}

function updateProgress() {
    if (!circle) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    circle.style.strokeDashoffset = PROGRESS_CIRCUMFERENCE * (1 - scrollPercent);
}

function updateTimelineProgress() {
    const timeline = document.querySelector(".experience-timeline");
    const progressRail = timeline?.querySelector(".experience-timeline-progress");
    if (!timeline || !progressRail) return;

    const rect = timeline.getBoundingClientRect();
    const trackLength = Math.max(0, timeline.offsetHeight - 36);
    const timelineInView = rect.bottom > 0 && rect.top < window.innerHeight;
    const cards = Array.from(timeline.querySelectorAll(".experience-card"));

    if (!timelineInView) {
        const viewportState = rect.bottom <= 0 ? "past" : "ahead";
        if (timeline.dataset.viewportState !== viewportState) {
            timeline.dataset.viewportState = viewportState;
            const isPast = viewportState === "past";
            progressRail.style.height = isPast ? `${trackLength}px` : "0px";
            cards.forEach((card) => {
                card.classList.toggle("is-passed", isPast);
                card.classList.remove("is-current");
                card.querySelector(".experience-node")?.removeAttribute("aria-current");
            });
        }
        return;
    }

    timeline.dataset.viewportState = "active";
    const viewportAnchor = window.innerHeight * 0.58;
    const progress = Math.max(
        0,
        Math.min(1, (viewportAnchor - rect.top) / Math.max(1, rect.height - window.innerHeight * 0.18)),
    );
    progressRail.style.height = `${trackLength * progress}px`;

    let currentCard = null;
    let currentDistance = Infinity;

    cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        card.classList.toggle("is-passed", cardRect.top <= viewportAnchor);
        const cardAnchor = cardRect.top + Math.min(cardRect.height * 0.32, 150);
        const distance = Math.abs(cardAnchor - viewportAnchor);
        if (distance < currentDistance) {
            currentDistance = distance;
            currentCard = card;
        }
    });

    cards.forEach((card) => {
        const isCurrent = card === currentCard;
        card.classList.toggle("is-current", isCurrent);
        const node = card.querySelector(".experience-node");
        if (isCurrent) {
            node?.setAttribute("aria-current", "step");
        } else {
            node?.removeAttribute("aria-current");
        }
    });
}

function schedulePointerEffects(event) {
    if (document.hidden || reduceMotion.matches || !FINE_POINTER_QUERY.matches) return;
    const velocityX = pointerDepth.lastClientX === null ? 0 : event.clientX - pointerDepth.lastClientX;
    const velocityY = pointerDepth.lastClientY === null ? 0 : event.clientY - pointerDepth.lastClientY;
    pointerDepth.lastClientX = event.clientX;
    pointerDepth.lastClientY = event.clientY;
    const surface = event.target instanceof Element ? event.target.closest(".map, .content-section") : null;
    if (surface) {
        createMouseParticle(event, velocityX, velocityY, surface === mapElement ? 105 : 220);
    }
    updatePointerDepthTarget(event);
}

function handleViewportChange() {
    mapRectDirty = true;
    pointerDepth.surfaceRectDirty = true;
    if (progressFrame || document.hidden) return;

    progressFrame = requestAnimationFrame(() => {
        progressFrame = 0;
        updateProgress();
        updateTimelineProgress();
    });
}

function handleVisibilityChange() {
    const isPaused = document.hidden;
    document.body.classList.toggle("effects-paused", isPaused);

    if (isPaused) {
        stopProjectPreview();
        resetPointerDepth(true);
        if (progressFrame) cancelAnimationFrame(progressFrame);
        progressFrame = 0;
    } else {
        mapRectDirty = true;
        updateProgress();
        updateTimelineProgress();
    }

    syncAudioVisibility(isPaused);
}

function observeRevealElements(root = document) {
    const elements = root.querySelectorAll(".reveal-on-scroll");

    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
        elements.forEach((element) => element.classList.add("is-visible"));
        return;
    }

    if (!revealObserver) {
        revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                });
            },
            { threshold: 0.16 },
        );
    }

    elements.forEach((element) => revealObserver.observe(element));
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

function isExpectedServiceWorkerNetworkFailure(error) {
    return error instanceof TypeError && /fetch|network|offline/i.test(error.message);
}

function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || !/^https?:$/.test(window.location.protocol)) return;

    window.addEventListener(
        "load",
        () => {
            navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" }).catch((error) => {
                if (!isExpectedServiceWorkerNetworkFailure(error)) {
                    console.error("Service worker registration failed:", error);
                }
            });
        },
        { once: true },
    );
}

function initPortfolio() {
    restoreVisitedZones();
    setActiveSection("about");
    setupMapInteractions();
    updateProgress();
    initRadarObserver();
    observeVisualSurface(mapElement);
    startHeaderTypewriter();
    observeRevealElements();
    setupProjectInteractions();
    schedulePortfolioHashNavigation(true);
    registerServiceWorker();
}

function applyProjectFilters() {
    const projectItems = Array.from(document.querySelectorAll(".project-item"));
    const itemStates = projectItems.map((item) => {
        const categoryMatches =
            currentCategoryFilter === "all" || item.dataset.category.split(" ").includes(currentCategoryFilter);
        const nameMatches = (item.dataset.projectName || "").includes(currentProjectQuery);
        return { item, show: categoryMatches && nameMatches };
    });
    updateProjectCount(itemStates.filter((state) => state.show).length);

    itemStates.forEach(({ item, show }, index) => {
        if (!show && isProjectExpanded(item)) {
            toggleProjectDetails(item.dataset.projectId, false, {
                updateHistory: false,
                scrollIntoView: false,
            });
            const route = parsePortfolioHash();
            if (route?.type === "project" && route.id === item.dataset.projectId) {
                writePortfolioHash("section", "projects", "replace");
            }
        }
        if (!show && item === activeProjectPreview) stopProjectPreview(item);
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

        transition.cleanupTimer = setTimeout(
            () => {
                item.classList.remove("is-filtering");
                filterTransitions.delete(item);
            },
            reduceMotion.matches ? 1 : 300,
        );
        filterTransitions.set(item, transition);
    });
}

function filterProjects(filter) {
    currentCategoryFilter = filter;
    playSfx("filter");

    document.querySelectorAll(".project-filter").forEach((button) => {
        const isActive = button.dataset.filter === filter;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });

    applyProjectFilters();
}

function handleDocumentInput(event) {
    if (!(event.target instanceof HTMLInputElement) || !event.target.classList.contains("project-name-search")) return;
    currentProjectQuery = event.target.value.trim().toLocaleLowerCase();
    if (projectSearchFrame) cancelAnimationFrame(projectSearchFrame);
    projectSearchFrame = requestAnimationFrame(() => {
        projectSearchFrame = 0;
        applyProjectFilters();
    });
}

function clearProjectNameSearch() {
    const searchInput = document.querySelector(".project-name-search");
    if (!searchInput || (!searchInput.value && !currentProjectQuery)) return false;
    searchInput.value = "";
    currentProjectQuery = "";
    if (projectSearchFrame) cancelAnimationFrame(projectSearchFrame);
    projectSearchFrame = 0;
    applyProjectFilters();
    playSfx("close");
    return true;
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

function handleDocumentClick(event) {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const inspectionStage = target.closest(".project-inspection-stage");
    const clickedImage =
        inspectionStage?.querySelector("img") || target.closest(".project-item > img, .project-images-grid img");
    if (clickedImage) {
        const projectItem = clickedImage.closest(".project-item");
        if (!projectItem) return;
        event.preventDefault();
        stopProjectPreview(projectItem);
        openImageCarousel(projectItem, clickedImage.getAttribute("src"));
        return;
    }

    if (target.id === "github-modal" || target.closest(".github-modal-close")) {
        closeGithubModal();
        return;
    }

    if (target.closest(".header-github-button, .profile-github-link")) {
        openGithubModal();
        return;
    }

    if (target.closest("#sound-toggle")) {
        toggleAudio();
        return;
    }

    const sectionButton = target.closest(".map .level, .section-radar button");
    if (sectionButton) {
        jumpToSection(sectionButton.dataset.section);
        return;
    }

    const experienceNode = target.closest(".experience-node");
    if (experienceNode) {
        const experienceCard = experienceNode.closest(".experience-card");
        if (experienceCard) {
            jumpToExperience(experienceCard.dataset.experienceId);
        }
        return;
    }

    const projectFilter = target.closest(".project-filter");
    if (projectFilter) {
        filterProjects(projectFilter.dataset.filter);
        return;
    }

    const inspectionThumbnail = target.closest(".project-inspection-thumbnail");
    if (inspectionThumbnail) {
        const projectItem = inspectionThumbnail.closest(".project-item");
        setProjectInspectionImage(projectItem, Number(inspectionThumbnail.dataset.index));
        return;
    }

    const collapsible = target.closest(".collapsible");
    if (collapsible) {
        const isOpen = collapsible.classList.toggle("active");
        const content = collapsible.nextElementSibling;
        collapsible.setAttribute("aria-expanded", String(isOpen));
        if (content) content.hidden = !isOpen;
        playSfx(isOpen ? "open" : "close");
        return;
    }

    const projectSummary = target.closest(".project-summary");
    const clickedToggle = target.closest(".project-summary-toggle");
    const clickedSummaryContent = projectSummary && !target.closest("a, button");
    if (projectSummary && (clickedToggle || clickedSummaryContent)) {
        const projectItem = projectSummary.closest(".project-item");
        playSfx(isProjectExpanded(projectItem) ? "close" : "open");
        toggleProjectDetails(projectItem.dataset.projectId);
    }
}

function handleDocumentMouseOver(event) {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const featureTarget = target.closest(
        ".project-features li, .tech-chip, .image-carousel-thumbnail, .project-inspection-thumbnail",
    );
    const movedWithinFeature = event.relatedTarget instanceof Node && featureTarget?.contains(event.relatedTarget);
    if (featureTarget && !movedWithinFeature) {
        playSfx("feature");
        return;
    }

    const interactiveTarget = target.closest(
        ".level, .experience-node, .project-filter, .github-link, .header-github-button, .github-modal-link",
    );
    const movedWithinInteractive =
        event.relatedTarget instanceof Node && interactiveTarget?.contains(event.relatedTarget);
    if (interactiveTarget && !movedWithinInteractive) {
        playSfx("hover");
    }
}

function handleDocumentKeydown(event) {
    const githubModal = document.getElementById("github-modal");
    const carouselModal = document.getElementById("image-carousel-modal");
    const modalWasOpen = Boolean(
        githubModal?.classList.contains("is-open") || carouselModal?.classList.contains("is-open"),
    );

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
        if (githubModal?.classList.contains("is-open")) closeGithubModal();
        if (carouselModal?.classList.contains("is-open")) closeImageCarousel();
        if (modalWasOpen) {
            event.preventDefault();
            return;
        }
        if (clearProjectNameSearch()) event.preventDefault();
    }

    if (document.getElementById("image-carousel-modal")?.classList.contains("is-open")) {
        if (event.key === "ArrowLeft") moveImageCarousel(-1);
        if (event.key === "ArrowRight") moveImageCarousel(1);
        return;
    }

    const inspectionThumbnail = event.target.closest?.(".project-inspection-thumbnail");
    if (inspectionThumbnail && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const projectItem = inspectionThumbnail.closest(".project-item");
        const thumbnails = Array.from(projectItem.querySelectorAll(".project-inspection-thumbnail"));
        const currentIndex = thumbnails.indexOf(inspectionThumbnail);
        const nextIndex =
            event.key === "Home"
                ? 0
                : event.key === "End"
                  ? thumbnails.length - 1
                  : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + thumbnails.length) % thumbnails.length;
        setProjectInspectionImage(projectItem, nextIndex);
        thumbnails[nextIndex]?.focus();
        return;
    }

    if (event.target.matches?.("input, textarea, select, [contenteditable='true']")) return;

    if (SECTION_KEYS[event.key] && !event.altKey && !event.ctrlKey && !event.metaKey) {
        jumpToSection(SECTION_KEYS[event.key]);
        return;
    }

    const activeEl = document.activeElement;
    const insideProject =
        activeEl && (activeEl.classList.contains("project-item") || activeEl.closest(".project-item"));

    if (insideProject && event.key === "ArrowDown") {
        event.preventDefault();
        focusProject(1);
        return;
    }

    if (insideProject && event.key === "ArrowUp") {
        event.preventDefault();
        focusProject(-1);
    }
}

function handleHistoryNavigation() {
    schedulePortfolioHashNavigation();
}

document.addEventListener("DOMContentLoaded", initPortfolio, { once: true });
document.addEventListener("click", handleDocumentClick);
document.addEventListener("input", handleDocumentInput);
document.addEventListener("keydown", handleDocumentKeydown);
document.addEventListener("mousemove", schedulePointerEffects, { passive: true });
document.documentElement.addEventListener("mouseleave", () => resetPointerDepth());
document.addEventListener("mouseover", handleDocumentMouseOver, { passive: true });
document.addEventListener("pointermove", handleProjectPreviewPointerMove, { passive: true });
document.addEventListener("visibilitychange", handleVisibilityChange);
reduceMotion.addEventListener("change", handlePointerPreferenceChange);
FINE_POINTER_QUERY.addEventListener("change", handlePointerPreferenceChange);
window.addEventListener("scroll", handleViewportChange, { passive: true });
window.addEventListener("resize", handleViewportChange, { passive: true });
window.addEventListener("blur", () => resetPointerDepth(true));
window.addEventListener("popstate", handleHistoryNavigation);
window.addEventListener("hashchange", handleHistoryNavigation);
