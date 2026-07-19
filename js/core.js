import { ASSET_VERSION } from "../portfolio-data.js?v=20260719e";

const FOCUSABLE_SELECTOR = [
    "a[href]",
    "area[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "button:not([disabled])",
    "iframe",
    "object",
    '[tabindex="0"]',
].join(", ");

export const FLAGSHIP_PROJECT_IDS = new Set(["valuation-deal-lab", "credit-decision-lab"]);
export const FINE_POINTER_QUERY = window.matchMedia("(hover: hover) and (pointer: fine)");

export function handleModalTab(event, modal) {
    if (event.key !== "Tab") return;

    const focusableElements = Array.from(modal.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (element) => element.tabIndex >= 0 && element.getBoundingClientRect().width > 0 && !element.disabled,
    );
    if (!focusableElements.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);
    const leavingStart = event.shiftKey && document.activeElement === firstElement;
    const leavingEnd = !event.shiftKey && document.activeElement === lastElement;

    if (leavingStart || leavingEnd) {
        (leavingStart ? lastElement : firstElement).focus();
        event.preventDefault();
    }
}

export function versionedAsset(path) {
    if (!path || !path.startsWith("assets/")) return path;
    return path.includes("?") ? path : `${path}?v=${ASSET_VERSION}`;
}

export function normalizeAssetUrl(path) {
    try {
        const url = new URL(path || "", document.baseURI);
        url.search = "";
        url.hash = "";
        return url.href;
    } catch {
        return (path || "").split("?")[0];
    }
}

export function versionAssetImages(root = document) {
    root.querySelectorAll('img[src^="assets/"]').forEach((image) => {
        image.src = versionedAsset(image.getAttribute("src"));
    });
}

export function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
