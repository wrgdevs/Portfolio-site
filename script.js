import { EXPERIENCE, HEADER_SUBTITLE, HEADER_TITLE, PROJECTS, SECTION_KEYS } from "./portfolio-data.js?v=20260920a";
import {
    closeImageCarousel,
    hydrateProjectImages,
    moveImageCarousel,
    openImageCarousel,
} from "./js/carousel.js?v=20260920a";
import { FINE_POINTER_QUERY, handleModalTab, versionAssetImages } from "./js/core.js?v=20260920a";
import { renderSection } from "./js/sections.js?v=20260920a";

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

function alignPortfolioTarget(target, { behavior, block, offset }) {
    if (block === "start" && offset > 0) {
        const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset);
        window.scrollTo({ top, behavior });
        return;
    }

    target.scrollIntoView({ behavior, block });
}

function scrollToPortfolioTarget(target, { block = "start", forceAuto = false, offset = 0 } = {}) {
    if (!target) return;
    requestAnimationFrame(() => {
        const distance = Math.abs(target.getBoundingClientRect().top - offset);
        const shouldJump = forceAuto || reduceMotion.matches || distance > window.innerHeight * 3;
        if (!shouldJump) {
            alignPortfolioTarget(target, { behavior: "smooth", block, offset });
            return;
        }

        const root = document.documentElement;
        const previousScrollBehavior = root.style.scrollBehavior;
        root.style.scrollBehavior = "auto";
        const alignTarget = () => alignPortfolioTarget(target, { behavior: "auto", block, offset });
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

function jumpToSection(sectionId, { historyMode = "push", forceAuto = false } = {}) {
    if (!SECTION_ORDER.includes(sectionId)) return;
    markZoneVisited(sectionId);
    const section = ensureSectionLoaded(sectionId);
    if (sectionId === "projects") closeAllProjectDetails();
    setActiveSection(sectionId);
    playMapTravel(sectionId);
    writePortfolioHash("section", sectionId, historyMode);
    scrollToPortfolioSection(section, forceAuto);
}

// ====================== CREATE SECTIONS ======================

function createSection(sectionId) {
    const section = document.createElement("section");
    section.id = sectionId;
    section.className = "content-section section-boot";
    section.innerHTML = renderSection(sectionId);
    versionAssetImages(section);
    insertSectionInOrder(section);
    observeVisualSurface(section);
    observeRevealElements(section);
    if (sectionId === "experience") initExperienceTimeline(section);
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

function getProjectScrollOffset() {
    const header = document.querySelector(".site-header");
    const filterBar = document.querySelector(".project-filter-bar");
    const headerHeight = header?.getBoundingClientRect().height || 0;
    if (!filterBar || getComputedStyle(filterBar).position !== "sticky") return headerHeight + 16;

    const stickyTop = Number.parseFloat(getComputedStyle(filterBar).top) || headerHeight;
    return Math.max(headerHeight, stickyTop + filterBar.getBoundingClientRect().height) + 16;
}

function alignExpandedProject(projectItem, forceAuto = false) {
    const align = (jump) =>
        scrollToPortfolioTarget(projectItem, {
            block: "start",
            forceAuto: jump,
            offset: getProjectScrollOffset(),
        });

    align(forceAuto);
    if (reduceMotion.matches) return;
    setTimeout(() => {
        if (isProjectExpanded(projectItem)) align(true);
    }, 320);
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
                    alignExpandedProject(projectItem);
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

function jumpToExperience(experienceId, { historyMode = "push", forceAuto = false } = {}) {
    if (!EXPERIENCE.some((item) => item.id === experienceId)) return;
    const section = ensureSectionLoaded("experience");
    const card = section?.querySelector(`[data-experience-id="${experienceId}"]`);
    if (!card) return;

    markZoneVisited("experience");
    setActiveSection("experience");
    writePortfolioHash("experience", experienceId, historyMode);
    highlightLinkedDestination(card);
    scrollToPortfolioTarget(card, { block: "center", forceAuto });
}

function jumpToProject(projectId, { historyMode = "push", forceAuto = false } = {}) {
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
    writePortfolioHash("project", projectId, historyMode);
    highlightLinkedDestination(projectItem);
    alignExpandedProject(projectItem, forceAuto);
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
        jumpToSection(route.sectionId, { historyMode: "none", forceAuto });
    } else if (route.type === "experience") {
        jumpToExperience(route.id, { historyMode: "none", forceAuto });
    } else if (route.type === "project") {
        jumpToProject(route.id, { historyMode: "none", forceAuto });
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

function setProjectInspectionImage(projectItem, nextIndex) {
    const gallery = projectItem?.querySelector(".project-inspection-gallery");
    const stage = gallery?.querySelector(".project-inspection-stage");
    const stageImage = stage?.querySelector("img");
    const thumbnails = Array.from(gallery?.querySelectorAll(".project-inspection-thumbnail") || []);
    const thumbnail = thumbnails[nextIndex];
    const thumbnailImage = thumbnail?.querySelector("img");
    if (!gallery || !stage || !stageImage || !thumbnail || !thumbnailImage) return false;

    const currentIndex = Number(gallery.dataset.activeIndex || 0);
    if (currentIndex !== nextIndex) {
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
const visitedSections = new Set();
const filterTransitions = new WeakMap();
const deepLinkHighlightTimers = new WeakMap();

let revealObserver;
let typewriterTimers = [];
let currentFilterCount = PROJECTS.length;
let mapPointerFrame = 0;
let latestMapPointerEvent = null;
let progressFrame = 0;
let projectCountFrame = 0;
let projectSearchFrame = 0;
let mapRect = null;
let mapRectDirty = true;
let currentProjectQuery = "";
let activeSectionId = "about";
let radarObserver = null;
let visualSurfaceObserver = null;
let timelineObserver = null;
let experienceTimeline = null;
let experienceProgressRail = null;
let experienceCards = [];
let cachedTimelineCards = [];
let cachedTimelineTrackLength = 0;
let timelineNearViewport = false;
let mapTravelTimer = 0;
let currentCategoryFilter = "all";

if (circle) {
    circle.style.strokeDasharray = PROGRESS_CIRCUMFERENCE;
    circle.style.strokeDashoffset = PROGRESS_CIRCUMFERENCE;
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
        const isActive = button.dataset.section === sectionId;
        button.classList.toggle("active", isActive);
        if (isActive) {
            button.setAttribute("aria-current", "page");
        } else {
            button.removeAttribute("aria-current");
        }
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
                    if (!entry.isIntersecting && entry.target === mapElement) resetMapPointerMotion();
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

function renderMapPointerMotion() {
    mapPointerFrame = 0;
    const event = latestMapPointerEvent;
    latestMapPointerEvent = null;
    if (!event || document.hidden || reduceMotion.matches || !FINE_POINTER_QUERY.matches || !mapElement) return;

    if (mapRectDirty || !mapRect) {
        mapRect = mapElement.getBoundingClientRect();
        mapRectDirty = false;
    }
    if (mapRect.bottom <= 0 || mapRect.top >= window.innerHeight) return;

    const localX = Math.max(0, Math.min(mapRect.width, event.clientX - mapRect.left));
    const localY = Math.max(0, Math.min(mapRect.height, event.clientY - mapRect.top));
    const x = Math.max(-1, Math.min(1, (localX / Math.max(1, mapRect.width) - 0.5) * 2));
    const y = Math.max(-1, Math.min(1, (localY / Math.max(1, mapRect.height) - 0.5) * 2));
    const style = mapElement.style;
    style.setProperty("--pointer-local-x", `${localX.toFixed(1)}px`);
    style.setProperty("--pointer-local-y", `${localY.toFixed(1)}px`);
    style.setProperty("--surface-depth-x", `${(x * 2.8).toFixed(2)}px`);
    style.setProperty("--surface-depth-y", `${(y * 2.1).toFixed(2)}px`);
    style.setProperty("--surface-grid-x", `${(-x * 1.0).toFixed(2)}px`);
    style.setProperty("--surface-grid-y", `${(-y * 0.8).toFixed(2)}px`);
    style.setProperty("--surface-near-x", `${(x * 2.8).toFixed(2)}px`);
    style.setProperty("--surface-near-y", `${(y * 2.1).toFixed(2)}px`);
    mapElement.classList.add("is-pointer-zone");
}

function scheduleMapPointerMotion(event) {
    if (document.hidden || reduceMotion.matches || !FINE_POINTER_QUERY.matches || !mapElement) return;
    latestMapPointerEvent = { clientX: event.clientX, clientY: event.clientY };
    if (!mapPointerFrame) mapPointerFrame = requestAnimationFrame(renderMapPointerMotion);
}

function resetMapPointerMotion() {
    if (mapPointerFrame) cancelAnimationFrame(mapPointerFrame);
    mapPointerFrame = 0;
    latestMapPointerEvent = null;
    mapElement?.classList.remove("is-pointer-zone");
    [
        "--pointer-local-x",
        "--pointer-local-y",
        "--surface-depth-x",
        "--surface-depth-y",
        "--surface-grid-x",
        "--surface-grid-y",
        "--surface-near-x",
        "--surface-near-y",
    ].forEach((property) => mapElement?.style.removeProperty(property));
}

function handlePointerPreferenceChange() {
    resetMapPointerMotion();
}

function updateProgress() {
    if (!circle) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    circle.style.strokeDashoffset = PROGRESS_CIRCUMFERENCE * (1 - scrollPercent);
}

function updateTimelineGeometry() {
    if (!experienceTimeline) return;
    cachedTimelineTrackLength = Math.max(0, experienceTimeline.offsetHeight - 36);
    cachedTimelineCards = experienceCards.map((card) => ({
        card,
        offsetTop: card.offsetTop,
        anchorOffset: Math.min(card.offsetHeight * 0.32, 150),
        node: card.querySelector(".experience-node"),
    }));
}

function setExperienceTimelineBoundaryState(isPast) {
    if (!experienceTimeline || !experienceProgressRail) return;
    const trackLength = cachedTimelineTrackLength || Math.max(0, experienceTimeline.offsetHeight - 36);
    const viewportState = isPast ? "past" : "ahead";
    if (experienceTimeline.dataset.viewportState === viewportState) return;

    experienceTimeline.dataset.viewportState = viewportState;
    experienceProgressRail.style.height = isPast ? `${trackLength}px` : "0px";
    experienceCards.forEach((card) => {
        card.classList.toggle("is-passed", isPast);
        card.classList.remove("is-current");
        card.querySelector(".experience-node")?.removeAttribute("aria-current");
    });
}

function initExperienceTimeline(root = document) {
    experienceTimeline = root.querySelector(".experience-timeline");
    experienceProgressRail = experienceTimeline?.querySelector(".experience-timeline-progress") || null;
    experienceCards = experienceTimeline ? Array.from(experienceTimeline.querySelectorAll(".experience-card")) : [];
    timelineObserver?.disconnect();

    if (!experienceTimeline || !experienceProgressRail) return;
    updateTimelineGeometry();

    if (!("IntersectionObserver" in window)) {
        timelineNearViewport = true;
        updateTimelineProgress();
        return;
    }

    timelineObserver = new IntersectionObserver(
        ([entry]) => {
            timelineNearViewport = entry.isIntersecting;
            if (timelineNearViewport) {
                handleViewportChange();
            } else {
                setExperienceTimelineBoundaryState(entry.boundingClientRect.bottom <= 0);
            }
        },
        { rootMargin: "240px 0px", threshold: 0 },
    );
    timelineObserver.observe(experienceTimeline);
}

function updateTimelineProgress() {
    if (!timelineNearViewport || !experienceTimeline || !experienceProgressRail) return;
    if (!cachedTimelineCards.length) updateTimelineGeometry();

    const rect = experienceTimeline.getBoundingClientRect();
    const trackLength = cachedTimelineTrackLength || Math.max(0, rect.height - 36);
    const viewportAnchor = window.innerHeight * 0.58;
    const progress = Math.max(
        0,
        Math.min(1, (viewportAnchor - rect.top) / Math.max(1, rect.height - window.innerHeight * 0.18)),
    );

    let currentCard = null;
    let currentDistance = Infinity;

    const passedStates = new Array(cachedTimelineCards.length);
    for (let i = 0; i < cachedTimelineCards.length; i++) {
        const item = cachedTimelineCards[i];
        const cardTop = rect.top + item.offsetTop;
        passedStates[i] = cardTop <= viewportAnchor;
        const cardAnchor = cardTop + item.anchorOffset;
        const distance = Math.abs(cardAnchor - viewportAnchor);
        if (distance < currentDistance) {
            currentDistance = distance;
            currentCard = item.card;
        }
    }

    if (experienceTimeline.dataset.viewportState !== "active") {
        experienceTimeline.dataset.viewportState = "active";
    }
    experienceProgressRail.style.height = `${trackLength * progress}px`;

    for (let i = 0; i < cachedTimelineCards.length; i++) {
        const item = cachedTimelineCards[i];
        item.card.classList.toggle("is-passed", passedStates[i]);
        const isCurrent = item.card === currentCard;
        item.card.classList.toggle("is-current", isCurrent);
        if (isCurrent) {
            item.node?.setAttribute("aria-current", "step");
        } else {
            item.node?.removeAttribute("aria-current");
        }
    }
}

function handleViewportChange() {
    mapRectDirty = true;
    if (progressFrame || document.hidden) return;

    progressFrame = requestAnimationFrame(() => {
        progressFrame = 0;
        updateProgress();
        updateTimelineProgress();
    });
}

function handleResize() {
    mapRectDirty = true;
    updateTimelineGeometry();
    handleViewportChange();
}

function handleVisibilityChange() {
    const isPaused = document.hidden;
    document.body.classList.toggle("effects-paused", isPaused);

    if (isPaused) {
        resetMapPointerMotion();
        if (progressFrame) cancelAnimationFrame(progressFrame);
        progressFrame = 0;
    } else {
        mapRectDirty = true;
        updateProgress();
        updateTimelineProgress();
    }
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
            typeText(subheaderEl, HEADER_SUBTITLE, 24, () => subheaderEl?.classList.remove("typing"));
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
    return true;
}

// ====================== GITHUB MODAL ======================

function openGithubModal() {
    const modal = document.getElementById("github-modal");
    if (!modal) return;
    lastActiveElement = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    const closeBtn = modal.querySelector(".github-modal-close");
    closeBtn?.focus();
}

function closeGithubModal() {
    const modal = document.getElementById("github-modal");
    if (!modal) return;
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
        return;
    }

    const projectSummary = target.closest(".project-summary");
    const clickedToggle = target.closest(".project-summary-toggle");
    const clickedSummaryContent = projectSummary && !target.closest("a, button");
    if (projectSummary && (clickedToggle || clickedSummaryContent)) {
        const projectItem = projectSummary.closest(".project-item");
        toggleProjectDetails(projectItem.dataset.projectId);
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
document.addEventListener("visibilitychange", handleVisibilityChange);
reduceMotion.addEventListener("change", handlePointerPreferenceChange);
FINE_POINTER_QUERY.addEventListener("change", handlePointerPreferenceChange);
mapElement?.addEventListener("pointermove", scheduleMapPointerMotion, { passive: true });
mapElement?.addEventListener("pointerleave", resetMapPointerMotion, { passive: true });
window.addEventListener("scroll", handleViewportChange, { passive: true });
window.addEventListener("resize", handleResize, { passive: true });
window.addEventListener("blur", resetMapPointerMotion);
window.addEventListener("popstate", handleHistoryNavigation);
window.addEventListener("hashchange", handleHistoryNavigation);
