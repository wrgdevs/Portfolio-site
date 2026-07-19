import { playSfx } from "./audio.js?v=20260719e";
import { escapeHtml, normalizeAssetUrl, versionedAsset } from "./core.js?v=20260719e";

let images = [];
let activeIndex = 0;
let direction = 1;
let lastActiveElement = null;
let projectTitle = "";

function getProjectImages(projectItem) {
    const detailImages = Array.from(
        projectItem.querySelectorAll(".project-images-grid img, .project-inspection-thumbnail img"),
    );
    const mainImage = projectItem.querySelector(":scope > img");
    const imageElements = detailImages.length ? detailImages : mainImage ? [mainImage] : [];

    return imageElements
        .map((image) => ({
            src: versionedAsset(image.getAttribute("src") || image.dataset.src),
            alt: image.getAttribute("alt") || projectItem.querySelector("h2")?.textContent || "Project screenshot",
        }))
        .filter((image) => image.src);
}

function ensureImageCarousel() {
    let modal = document.getElementById("image-carousel-modal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "image-carousel-modal";
    modal.className = "image-carousel-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("aria-labelledby", "image-carousel-title");
    modal.innerHTML = `
        <div class="image-carousel-card">
            <div class="image-carousel-header">
                <p class="image-carousel-title" id="image-carousel-title"></p>
                <p class="image-carousel-counter"></p>
                <button class="image-carousel-close" type="button" aria-label="Close image carousel">x</button>
            </div>
            <div class="image-carousel-frame">
                <button class="image-carousel-nav image-carousel-prev" type="button" aria-label="Previous image">&lt;</button>
                <img class="image-carousel-image" src="" width="960" height="540" alt="Project screenshot preview" draggable="false">
                <button class="image-carousel-nav image-carousel-next" type="button" aria-label="Next image">&gt;</button>
            </div>
            <div class="image-carousel-thumbnails" aria-label="Image thumbnails"></div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector(".image-carousel-close").addEventListener("click", closeImageCarousel);
    modal.querySelector(".image-carousel-prev").addEventListener("click", () => moveImageCarousel(-1));
    modal.querySelector(".image-carousel-next").addEventListener("click", () => moveImageCarousel(1));
    modal.querySelector(".image-carousel-thumbnails").addEventListener("click", (event) => {
        const thumbnail = event.target.closest("button");
        if (!thumbnail) return;

        const nextIndex = Number(thumbnail.dataset.index);
        if (Number.isNaN(nextIndex) || nextIndex === activeIndex) return;

        playSfx("carousel");
        direction = nextIndex > activeIndex ? 1 : -1;
        activeIndex = nextIndex;
        renderImageCarousel();
    });
    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeImageCarousel();
    });

    let touchStartX = 0;
    let touchStartY = 0;
    modal.addEventListener(
        "touchstart",
        (event) => {
            touchStartX = event.changedTouches[0].screenX;
            touchStartY = event.changedTouches[0].screenY;
        },
        { passive: true },
    );
    modal.addEventListener(
        "touchend",
        (event) => {
            const touchEndX = event.changedTouches[0].screenX;
            const touchEndY = event.changedTouches[0].screenY;
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            if (Math.abs(diffX) > 50 && Math.abs(diffY) < 60) {
                moveImageCarousel(diffX > 0 ? -1 : 1);
            }
        },
        { passive: true },
    );

    return modal;
}

function renderImageCarousel() {
    const modal = ensureImageCarousel();
    const image = modal.querySelector(".image-carousel-image");
    const title = modal.querySelector(".image-carousel-title");
    const counter = modal.querySelector(".image-carousel-counter");
    const thumbnailTrack = modal.querySelector(".image-carousel-thumbnails");
    const navigationButtons = modal.querySelectorAll(".image-carousel-nav");
    const currentImage = images[activeIndex];
    const hasMultipleImages = images.length > 1;

    image.classList.remove("slide-next", "slide-prev");
    void image.offsetWidth;
    image.classList.add(direction >= 0 ? "slide-next" : "slide-prev");
    image.src = currentImage.src;
    image.alt = currentImage.alt;
    title.textContent = projectTitle;
    counter.textContent = `${activeIndex + 1} / ${images.length}`;
    navigationButtons.forEach((button) => {
        button.hidden = !hasMultipleImages;
    });
    thumbnailTrack.hidden = !hasMultipleImages;
    thumbnailTrack.innerHTML = images
        .map(
            (imageItem, index) => `
            <button class="image-carousel-thumbnail${index === activeIndex ? " active" : ""}" type="button" data-index="${index}" aria-label="Show image ${index + 1}" aria-pressed="${index === activeIndex}">
                <img src="${escapeHtml(imageItem.src)}" width="160" height="90" alt="">
            </button>
        `,
        )
        .join("");
    thumbnailTrack.querySelector(".active")?.scrollIntoView({ block: "nearest", inline: "center" });
}

export function hydrateProjectImages(projectItem) {
    projectItem
        .querySelectorAll(".project-images-grid img[data-src], .project-inspection-gallery img[data-src]")
        .forEach((image) => {
            image.src = versionedAsset(image.dataset.src);
            delete image.dataset.src;
        });
}

export function openImageCarousel(projectItem, clickedSrc) {
    images = getProjectImages(projectItem);
    if (!images.length) return;

    playSfx("open");
    lastActiveElement = document.activeElement;
    projectTitle = projectItem.dataset.projectTitle || projectItem.querySelector("h2")?.textContent || "";
    const normalizedClickedSrc = normalizeAssetUrl(clickedSrc);
    activeIndex = Math.max(
        0,
        images.findIndex((image) => normalizeAssetUrl(image.src) === normalizedClickedSrc),
    );
    direction = 1;

    const modal = ensureImageCarousel();
    document.body.classList.add("carousel-open");
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    renderImageCarousel();
    modal.querySelector(".image-carousel-close")?.focus();
}

export function moveImageCarousel(step) {
    if (!images.length) return;

    playSfx("carousel");
    direction = step;
    activeIndex = (activeIndex + step + images.length) % images.length;
    renderImageCarousel();
}

export function closeImageCarousel() {
    const modal = document.getElementById("image-carousel-modal");
    if (!modal) return;

    playSfx("close");
    document.body.classList.remove("carousel-open");
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    lastActiveElement?.focus();
    lastActiveElement = null;
}
