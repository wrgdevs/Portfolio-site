import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

import { ASSET_VERSION, EXPERIENCE, PROJECTS, SECTION_KEYS } from "../portfolio-data.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");
const moduleFiles = ["script.js", "js/audio.js", "js/carousel.js", "js/core.js", "js/renderers.js", "js/sections.js"];
const stylesheetFiles = ["styles.css", "projects.css", "experience.css", "effects.css"];

function collectIds(items, label) {
    const ids = items.map((item) => item.id);
    assert(ids.every(Boolean), `${label} entries must have an id`);
    assert.equal(new Set(ids).size, ids.length, `${label} ids must be unique`);
    return new Set(ids);
}

function assetPath(asset) {
    return asset.split(/[?#]/, 1)[0].replace(/^\.\//, "");
}

async function assertLocalAssetExists(asset, context) {
    if (!asset || /^(?:data:|https?:)/.test(asset)) return;
    await assert.doesNotReject(
        access(path.join(root, assetPath(asset))),
        `${context} points to a missing asset: ${asset}`,
    );
}

const [html, browserBundle, serviceWorker, moduleSources, stylesheetSources] = await Promise.all([
    read("index.html"),
    read("script.bundle.js"),
    read("sw.js"),
    Promise.all(moduleFiles.map(read)),
    Promise.all(stylesheetFiles.map(read)),
]);

assert.match(html, new RegExp(`<script defer src="script\\.bundle\\.js\\?v=${ASSET_VERSION}"></script>`));
assert.equal((html.match(/<script\b/g) || []).length, 1, "index.html should have one script entry point");
assert.doesNotMatch(html, /type="module"/, "the browser entry point must also work from file://");
assert.doesNotMatch(html, /\sonclick=/i, "inline click handlers are not allowed");
assert.doesNotMatch(html, /javascript:/i, "javascript: URLs are not allowed");
assert.match(html, /class="map-depth-surface"/, "the map image should use a transform-only depth layer");
assert.match(html, /class="map-pointer-field"/, "the map spotlight should use a bounded pointer field");

const bundleBuild = await build({
    absWorkingDir: root,
    entryPoints: ["script.js"],
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "es2022",
    minify: true,
    legalComments: "none",
    outfile: "script.bundle.js",
    write: false,
});
assert.equal(browserBundle, bundleBuild.outputFiles[0].text, "script.bundle.js must match the modular source");

for (const stylesheet of stylesheetFiles) {
    assert.match(html, new RegExp(`${stylesheet.replace(".", "\\.")}\\?v=${ASSET_VERSION}`));
}

for (let index = 0; index < stylesheetFiles.length; index += 1) {
    const sourceFile = stylesheetFiles[index];
    const versionedAssets = [...stylesheetSources[index].matchAll(/assets\/[^)"']+\?v=([^)"']+)/g)];

    for (const match of versionedAssets) {
        assert.equal(match[1], ASSET_VERSION, `${sourceFile} has a stale asset version: ${match[0]}`);
        await assertLocalAssetExists(match[0], sourceFile);
    }
}

assert.match(serviceWorker, new RegExp(`const ASSET_VERSION = "${ASSET_VERSION}"`));
assert.match(serviceWorker, /event\.request\.mode === "navigate" \? networkFirstNavigation/);
assert.match(serviceWorker, /fetch\(request, \{ cache: "no-store" \}\)/);
assert.doesNotMatch(serviceWorker, /if \(request\.mode === "navigate"\)/);
assert.match(serviceWorker, /windowClients\.map\(\(client\) => client\.navigate\(client\.url\)\)/);
assert.match(serviceWorker, /cache\.addAll\(CORE_ASSETS_TO_CACHE\)/);
assert.match(serviceWorker, /Promise\.allSettled\(OPTIONAL_ASSETS_TO_CACHE\.map/);
assert.doesNotMatch(serviceWorker, /cache\.addAll\(ASSETS_TO_CACHE\)/);
assert.match(serviceWorker, /versionedAsset\("\.\/script\.bundle\.js"\)/);
assert.match(moduleSources[0], /register\("\.\/sw\.js", \{ updateViaCache: "none" \}\)/);
assert.match(moduleSources[0], /isExpectedServiceWorkerNetworkFailure/);
assert.match(moduleSources[0], /!\/\^https\?:\$\/\.test\(window\.location\.protocol\)/);
assert.doesNotMatch(moduleSources[0], /registration\.update\(\)/);
assert.doesNotMatch(
    moduleSources[0],
    /document\.documentElement\.style/,
    "pointer depth variables must stay localized",
);
assert.doesNotMatch(stylesheetSources[0], /#projects\.is-pointer-zone::after/, "project terrain must remain static");
assert.doesNotMatch(
    stylesheetSources.join("\n"),
    /\.level:nth-child\(/,
    "map destination styling must ignore decorative sibling layers",
);

for (let index = 0; index < moduleFiles.length; index += 1) {
    const sourceFile = moduleFiles[index];
    const source = moduleSources[index];
    const imports = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1]);

    for (const specifier of imports) {
        if (!specifier.startsWith(".")) continue;
        assert.equal(
            new URL(specifier, `https://example.test/${sourceFile}`).searchParams.get("v"),
            ASSET_VERSION,
            `${sourceFile} has an unversioned or stale import: ${specifier}`,
        );
        const resolved = path.resolve(path.dirname(path.join(root, sourceFile)), assetPath(specifier));
        await assert.doesNotReject(access(resolved), `${sourceFile} imports a missing module: ${specifier}`);
    }
}

const projectIds = collectIds(PROJECTS, "Project");
collectIds(EXPERIENCE, "Experience");
assert(projectIds.has("valuation-deal-lab"), "Valuation Deal Lab must remain in the portfolio");
assert(projectIds.has("credit-decision-lab"), "Credit Decision Lab must remain in the portfolio");

assert.deepEqual(Object.values(SECTION_KEYS), ["about", "current", "experience", "projects", "contact"]);

for (const project of PROJECTS) {
    await assertLocalAssetExists(project.image, project.id);
    for (const image of project.images || []) await assertLocalAssetExists(image, project.id);
}

console.log(`Smoke checks passed for ${PROJECTS.length} projects and ${moduleFiles.length} modules.`);
