import * as THREE from 'three';
import { buildLabRoom } from './models/labroom.js';
import { buildBoard } from './models/board.js';
import { buildGradCap } from './models/gradcap.js';
import { MindARThree } from '../vendor/mindar/mindar-image-three.prod.js';
import { setStatus, setupStartButton } from './common.js';

const TARGET_SRC = './targets/campus-targets.mind';
const POIS_SRC = './data/pois.json';
const STORAGE_KEY = 'ar-campus-tour-visited';
const MIN_POIS = 3;
const MAX_TRACK = 3;
const FILL = 0.7;

const VALID_MODELS = ['monitor', 'papan', 'toga'];
const VALID_ANIMATIONS = ['spin', 'swing', 'pulse'];

const $ = (id) => document.getElementById(id);
const consent = $('consent');

let POIS = [];
const visited = new Set();

let mindar = null;
let arActive = false;
let session = 0;

const view = {
    stage: null,
    active: null,
    pending: null,
    baseDist: 1
};

// ======================================================
// VALIDASI DATA POI
// ======================================================

function isText(value) {
    return typeof value === 'string' && value.trim() !== '';
}

function validatePois(data) {
    const errors = [];

    if (!data || !Array.isArray(data.pois)) {
        return ['pois.json harus memiliki properti pois berupa array.'];
    }

    if (data.pois.length < MIN_POIS) {
        errors.push(`Minimal harus ada ${MIN_POIS} titik POI.`);
    }

    const ids = new Set();
    const targetIndexes = new Set();

    data.pois.forEach((poi, index) => {
        const label = `POI #${index + 1}: `;

        if (!poi || typeof poi !== 'object') {
            errors.push(label + 'data bukan objek.');
            return;
        }

        ['id', 'name', 'location', 'description', 'schedule'].forEach((key) => {
            if (!isText(poi[key])) {
                errors.push(label + `${key} wajib diisi.`);
            }
        });

        if (poi.hint !== undefined && typeof poi.hint !== 'string') {
            errors.push(label + 'hint harus berupa teks.');
        }

        if (isText(poi.id)) {
            if (ids.has(poi.id)) {
                errors.push(label + `ID "${poi.id}" duplikat.`);
            }
            ids.add(poi.id);
        }

        if (!Number.isInteger(poi.targetIndex) || poi.targetIndex < 0) {
            errors.push(label + 'targetIndex harus bilangan bulat >= 0.');
        } else {
            if (targetIndexes.has(poi.targetIndex)) {
                errors.push(label + `targetIndex ${poi.targetIndex} duplikat.`);
            }
            targetIndexes.add(poi.targetIndex);
        }

        if (!VALID_MODELS.includes(poi.model)) {
            errors.push(label + 'model harus salah satu dari: ' + VALID_MODELS.join(', '));
        }

        if (!VALID_ANIMATIONS.includes(poi.animation)) {
            errors.push(label + 'animation harus salah satu dari: ' + VALID_ANIMATIONS.join(', '));
        }
    });

    if (data.pois.length === 3) {
        [0, 1, 2].forEach((index) => {
            if (!targetIndexes.has(index)) {
                errors.push(`Target index ${index} belum terdaftar.`);
            }
        });
    }

    return errors;
}

async function loadPois() {
    const response = await fetch(POIS_SRC, { cache: 'no-cache' });

    if (!response.ok) {
        throw new Error(`Gagal memuat ${POIS_SRC}. HTTP ${response.status}`);
    }

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error('Format pois.json tidak valid.');
    }

    const errors = validatePois(data);

    if (errors.length > 0) {
        throw new Error('Data POI tidak valid: ' + errors.join(' '));
    }

    return data.pois;
}

// ======================================================
// PROGRES KUNJUNGAN
// ======================================================

function loadVisited() {
    try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

        if (!Array.isArray(raw)) return [];

        return raw.filter((id) => POIS.some((poi) => poi.id === id));
    } catch {
        return [];
    }
}

function saveVisited() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...visited]));
    } catch {
        console.warn('Progres tidak dapat disimpan di localStorage.');
    }
}

function renderProgress() {
    const total = POIS.length;
    const count = visited.size;
    const progressText = `${count} dari ${total} titik dikunjungi`;

    $('progress-text').textContent = progressText;
    $('home-progress').textContent = progressText;

    const bar = $('progress-bar');
    bar.max = total;
    bar.value = count;

    const list = $('poi-list');
    list.textContent = '';

    POIS.forEach((poi) => {
        const li = document.createElement('li');
        const done = visited.has(poi.id);

        li.className = done ? 'visited' : '';
        li.textContent = (done ? '✓ ' : '○ ') + poi.name;

        list.appendChild(li);
    });

    const next = POIS.find((poi) => !visited.has(poi.id));

    $('next-hint').textContent = next
        ? 'Berikutnya: ' + next.name + (next.hint ? ' - ' + next.hint : '')
        : 'Semua titik berhasil dikunjungi!';

    $('badge').hidden = count < total;
}

// ======================================================
// UI TAMBAHAN
// ======================================================

let extraUiReady = false;
let nextPanel = null;

function ensureExtraUi() {
    if (extraUiReady) return;
    extraUiReady = true;

    const style = document.createElement('style');

    style.textContent = `
        #finish-btn {
            margin-top: 12px;
            width: 100%;
            padding: 10px 16px;
            border: 0;
            border-radius: 10px;
            background: #2563eb;
            color: #fff;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
        }

        #next-tour-panel {
            position: fixed;
            left: 50%;
            bottom: 24px;
            transform: translateX(-50%);
            width: min(92vw, 420px);
            z-index: 10000;
            background: rgba(15, 23, 42, 0.96);
            color: #f8fafc;
            border-radius: 16px;
            padding: 18px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
            font-family: inherit;
        }

        #next-tour-panel[hidden] {
            display: none;
        }

        #next-tour-panel h3 {
            margin: 0 0 6px;
            font-size: 1.1rem;
        }

        #next-tour-panel p {
            margin: 4px 0;
            font-size: 0.95rem;
            line-height: 1.4;
        }

        #next-tour-panel .ntp-label {
            font-size: 0.75rem;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: #38bdf8;
            margin-bottom: 2px;
        }

        #next-tour-panel button {
            margin-top: 12px;
            width: 100%;
            padding: 10px 16px;
            border: 0;
            border-radius: 10px;
            background: #38bdf8;
            color: #0f172a;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
        }
    `;

    document.head.appendChild(style);

    const finishBtn = document.createElement('button');
    finishBtn.id = 'finish-btn';
    finishBtn.type = 'button';
    finishBtn.textContent = 'Selesai';
    finishBtn.addEventListener('click', finishPoi);

    $('poi-panel').appendChild(finishBtn);

    nextPanel = document.createElement('div');
    nextPanel.id = 'next-tour-panel';
    nextPanel.hidden = true;

    document.body.appendChild(nextPanel);
}

function hideNextPanel() {
    if (nextPanel) {
        nextPanel.hidden = true;
        nextPanel.textContent = '';
    }
}

function addLine(parent, tag, text, className) {
    const el = document.createElement(tag);
    el.textContent = text;

    if (className) el.className = className;

    parent.appendChild(el);
    return el;
}

function showNextPanel(currentPoi) {
    ensureExtraUi();
    nextPanel.textContent = '';

    const startIndex = POIS.findIndex((poi) => poi.id === currentPoi.id);
    let next = null;

    for (let i = 1; i <= POIS.length; i++) {
        const candidate = POIS[(startIndex + i) % POIS.length];

        if (!visited.has(candidate.id)) {
            next = candidate;
            break;
        }
    }

    if (next) {
        addLine(nextPanel, 'div', 'Tur selanjutnya', 'ntp-label');
        addLine(nextPanel, 'h3', next.name);
        addLine(nextPanel, 'p', '📍 ' + next.location);

        if (next.hint) {
            addLine(nextPanel, 'p', '💡 ' + next.hint);
        }

        addLine(
            nextPanel,
            'p',
            'Menuju lokasi tersebut, lalu arahkan kamera ke target AR di sana.'
        );

        const btn = addLine(nextPanel, 'button', 'Lanjut scan');
        btn.type = 'button';

        btn.addEventListener('click', () => {
            hideNextPanel();
            setStatus('Mencari target', 'searching');
        });
    } else {
        addLine(nextPanel, 'div', 'Tur selesai', 'ntp-label');
        addLine(nextPanel, 'h3', '🎉 Semua titik sudah dikunjungi!');
        addLine(nextPanel, 'p', 'Terima kasih sudah mengikuti AR Campus Tour.');

        const btn = addLine(nextPanel, 'button', 'Kembali ke beranda');
        btn.type = 'button';

        btn.addEventListener('click', () => {
            hideNextPanel();
            $('back-btn').click();
        });
    }

    nextPanel.hidden = false;
}

function showPoi(poi) {
    ensureExtraUi();

    $('poi-title').textContent = poi.name;
    $('poi-location').textContent = poi.location;
    $('poi-desc').textContent = poi.description;
    $('poi-schedule').textContent = poi.schedule;

    $('poi-panel').hidden = false;
}

function hidePoi() {
    $('poi-panel').hidden = true;
}

// ======================================================
// MODEL 3D
// ======================================================

const MODEL_BUILDERS = {
    monitor: buildLabRoom,
    papan: buildBoard,
    toga: buildGradCap
};

function createDisplayModel(builder) {
    const model = builder();

    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;

    model.position.sub(center);

    const spinner = new THREE.Group();
    spinner.add(model);

    const pivot = new THREE.Group();
    pivot.add(spinner);
    pivot.scale.setScalar(1 / maxDim);

    return {
        pivot,
        spinner,
        animateModel: model.userData.animate || null
    };
}

// ======================================================
// ANIMASI TANPA PUTARAN
// ======================================================

const ANIMATIONS = {
    spin: (spinner, time) => {
        spinner.position.y = Math.sin(time * 1.2) * 0.025;
    },

    swing: (spinner, time) => {
        spinner.position.x = Math.sin(time * 1.1) * 0.025;
    },

    pulse: (spinner, time) => {
        const scale = 1 + Math.sin(time * 1.5) * 0.025;
        spinner.scale.setScalar(scale);
    }
};

// ======================================================
// MENGUNCI OBJEK DI DEPAN KAMERA
// ======================================================

function lockItem(item) {
    const pos = new THREE.Vector3().setFromMatrixPosition(
        item.anchor.group.matrix
    );

    let dist = pos.length();

    if (!Number.isFinite(dist) || dist <= 0) {
        dist = 1;
    }

    view.baseDist = dist;
    view.stage.position.set(0, 0, -dist);

    if (view.active) {
        view.stage.remove(view.active.pivot);
    }

    item.spinner.position.set(0, 0, 0);
    item.spinner.rotation.set(0, 0, 0);
    item.spinner.scale.setScalar(1);

    view.stage.add(item.pivot);
    view.stage.visible = true;
    view.active = item;

    if (!visited.has(item.poi.id)) {
        visited.add(item.poi.id);
        saveVisited();
        renderProgress();
    }

    hideNextPanel();
    showPoi(item.poi);

    setStatus(item.poi.name + ' berhasil ditampilkan', 'found');
}

// ======================================================
// TOMBOL SELESAI
// ======================================================

function finishPoi() {
    const item = view.active;

    if (!item) return;

    view.stage.remove(item.pivot);
    view.stage.visible = false;

    view.active = null;
    view.pending = null;

    hidePoi();
    showNextPanel(item.poi);

    setStatus('Mencari target', 'searching');
}

// ======================================================
// MENGHENTIKAN AR
// ======================================================

async function stopAR() {
    session++;
    arActive = false;

    document.body.classList.remove('ar-active');

    $('tour-progress').hidden = true;
    $('tour-progress').classList.add('collapsed');
    $('progress-toggle').setAttribute('aria-expanded', 'false');
    $('back-btn').hidden = true;

    hidePoi();
    hideNextPanel();

    view.active = null;
    view.pending = null;
    view.stage = null;

    const currentMindar = mindar;
    mindar = null;

    if (currentMindar) {
        try {
            currentMindar.ui.hideLoading();
        } catch {}

        try {
            currentMindar.ui.hideScanning();
        } catch {}

        try {
            currentMindar.ui.hideCompatibility();
        } catch {}

        try {
            currentMindar.renderer.setAnimationLoop(null);
        } catch {}

        try {
            await currentMindar.stop();
        } catch {}

        try {
            currentMindar.renderer.dispose();
        } catch {}
    }

    document.querySelectorAll('.mindar-ui-overlay').forEach((el) => {
        el.classList.add('hidden');
    });

    setStatus('Belum dimulai', 'idle');
}

// ======================================================
// MEMULAI AR
// ======================================================

async function start() {
    if (!POIS.length) {
        throw new Error('Data POI belum dimuat.');
    }

    if (mindar) {
        await stopAR();
    }

    const mySession = ++session;

    history.pushState({ ar: true }, '');

    arActive = true;
    document.body.classList.add('ar-active');

    consent.hidden = true;
    $('tour-progress').hidden = false;
    $('back-btn').hidden = false;

    ensureExtraUi();
    hideNextPanel();

    try {
        const mindarThree = new MindARThree({
            container: $('container'),
            imageTargetSrc: TARGET_SRC,
            maxTrack: MAX_TRACK
        });

        mindar = mindarThree;

        const { renderer, scene, camera } = mindarThree;

        scene.add(new THREE.HemisphereLight(0xffffff, 0x667788, 1.2));

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(0.5, 1, 1);
        scene.add(directionalLight);

        scene.add(camera);

        const stage = new THREE.Group();
        stage.visible = false;
        camera.add(stage);

        view.stage = stage;
        view.active = null;
        view.pending = null;
        view.baseDist = 1;

        POIS.forEach((poi) => {
            const anchor = mindarThree.addAnchor(poi.targetIndex);
            const display = createDisplayModel(MODEL_BUILDERS[poi.model]);

            const item = {
                poi,
                anchor,
                pivot: display.pivot,
                spinner: display.spinner,
                animate: ANIMATIONS[poi.animation],
                animateModel: display.animateModel
            };

            anchor.onTargetFound = () => {
                if (view.active && view.active.poi.id === poi.id) return;
                view.pending = item;
            };

            anchor.onTargetLost = () => {};
        });

        await mindarThree.start();

        if (mySession !== session) {
            try {
                await mindarThree.stop();
            } catch {}
            return;
        }

        setStatus('Mencari target', 'searching');

        const clock = new THREE.Clock();

        renderer.setAnimationLoop(() => {
            const delta = clock.getDelta();
            const time = clock.elapsedTime;

            if (view.pending) {
                const item = view.pending;
                view.pending = null;
                lockItem(item);
            }

            if (view.active) {
                stage.scale.setScalar(view.baseDist * FILL);

                const item = view.active;

                if (item.animate) {
                    item.animate(item.spinner, time, delta);
                }

                if (item.animateModel) {
                    item.animateModel(time, delta);
                }
            }

            renderer.render(scene, camera);
        });

    } catch (error) {
        console.error('AR error:', error);

        await stopAR();

        if (history.state && history.state.ar) {
            history.back();
        }

        throw error;
    }
}

// ======================================================
// TOMBOL KEMBALI
// ======================================================

$('back-btn').addEventListener('click', () => {
    if (history.state && history.state.ar) {
        history.back();
    } else {
        stopAR();
    }
});

window.addEventListener('popstate', () => {
    if (arActive) {
        stopAR();
    }
});

if (history.state && history.state.ar) {
    history.replaceState(null, '');
}

// ======================================================
// INTERAKSI UI
// ======================================================

$('openConsent').addEventListener('click', () => {
    consent.hidden = false;
});

$('closeConsent').addEventListener('click', () => {
    consent.hidden = true;
});

consent.addEventListener('click', (event) => {
    if (event.target === consent) {
        consent.hidden = true;
    }
});

$('progress-toggle').addEventListener('click', () => {
    const box = $('tour-progress');
    const collapsed = box.classList.toggle('collapsed');

    $('progress-toggle').setAttribute('aria-expanded', String(!collapsed));
});

$('reset-btn').addEventListener('click', () => {
    if (!confirm('Yakin ingin menghapus semua progres kunjungan?')) return;

    visited.clear();
    saveVisited();
    renderProgress();
});

// ======================================================
// INISIALISASI
// ======================================================

async function init() {
    try {
        POIS = await loadPois();

        loadVisited().forEach((id) => visited.add(id));
        renderProgress();

        setupStartButton(start);

        setStatus('Belum dimulai', 'idle');
    } catch (error) {
        console.error(error);

        setStatus('Gagal memuat data POI', 'error');

        const errorEl = $('start-error');

        if (errorEl) {
            errorEl.textContent = error.message;
        }
    }
}

init();