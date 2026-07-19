const SFX_PROFILES = Object.freeze({
    hover: [260, 0.035, 0.045],
    open: [620, 0.06, 0.11],
    close: [360, 0.05, 0.08],
    filter: [460, 0.052, 0.09],
    nav: [720, 0.045, 0.08],
    feature: [840, 0.035, 0.055],
    carousel: [560, 0.045, 0.08],
});
const DEFAULT_SFX_PROFILE = Object.freeze([520, 0.045, 0.07]);

let audioContext;
let audioEnabled = false;
let ambientNodes;
let lastSfxTime = 0;

function ensureAudioContext() {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") audioContext.resume();
    return audioContext;
}

export function playSfx(type) {
    if (!audioEnabled) return;

    const nowMs = performance.now();
    if (nowMs - lastSfxTime < 42) return;
    lastSfxTime = nowMs;

    const context = ensureAudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const [frequency, volume, duration] = SFX_PROFILES[type] || DEFAULT_SFX_PROFILE;

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency * 1.35), now + duration * 0.55);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
}

function startAmbientAudio() {
    if (ambientNodes) return;

    const context = ensureAudioContext();
    const master = context.createGain();
    const low = context.createOscillator();
    const shimmer = context.createOscillator();
    const lfo = context.createOscillator();
    const lfoGain = context.createGain();

    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.018, context.currentTime + 0.45);
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
    master.connect(context.destination);
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

    window.setTimeout(() => {
        nodes.low.stop();
        nodes.shimmer.stop();
        nodes.lfo.stop();
    }, 280);
}

export function toggleAudio() {
    const button = document.getElementById("sound-toggle");
    if (!button) return;

    audioEnabled = !audioEnabled;
    button.textContent = audioEnabled ? "AUDIO ON" : "AUDIO OFF";
    button.setAttribute("aria-pressed", String(audioEnabled));

    if (audioEnabled) {
        startAmbientAudio();
        playSfx("open");
    } else {
        stopAmbientAudio();
    }
}

export function syncAudioVisibility(isPageHidden) {
    if (!audioEnabled || !audioContext) return;
    if (isPageHidden && audioContext.state === "running") audioContext.suspend();
    if (!isPageHidden && audioContext.state === "suspended") audioContext.resume();
}
