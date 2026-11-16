// src/common.js - fungsi bantu bersama (status dan pemeriksaan kamera)
const LOAD_TIMEOUT_MS = 60000; // batas waktu memuat (ms)

// Menampilkan status di elemen #status. state: idle | searching | found | error
export function setStatus(text, state) {
    const el = document.getElementById('status');
    el.textContent = text;
    el.dataset.state = state;
}

// Memeriksa syarat dasar kamera. Mengembalikan null jika OK, atau pesan masalah.
export function checkCameraSupport() {
    if (!window.isSecureContext) {
        return 'Halaman bukan secure context. Buka lewat HTTPS (mis. GitHub Pages) '
            + 'atau http://localhost di laptop.';
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return 'Browser ini tidak menyediakan akses kamera (getUserMedia).';
    }
    return null;
}

function showStartError(message) {
    const el = document.getElementById('start-error');
    el.textContent = message;
    el.hidden = !message;
}

// Menghubungkan tombol "Mulai" dengan fungsi start(). Kamera hanya diminta setelah tombol ditekan.
export function setupStartButton(startFn) {
    const btn = document.getElementById('startBtn');
    const consent = document.getElementById('consent');

    btn.addEventListener('click', async () => {
        showStartError('');

        const problem = checkCameraSupport();
        if (problem) {
            setStatus('Error: ' + problem, 'error');
            showStartError(problem);
            return;
        }

        btn.disabled = true;
        consent.hidden = true;
        setStatus('Memuat... izinkan kamera jika diminta', 'idle');

        let timer;
        try {
            // MindAR tidak selalu menolak (reject) saat unduhan model/target gagal; beri batas waktu.
            const timeout = new Promise((_, rej) => {
                timer = setTimeout(() => rej(new Error('timeout')), LOAD_TIMEOUT_MS);
            });
            await Promise.race([startFn(), timeout]);
        } catch (err) {
            console.error('Gagal memulai:', err);
            const msg = 'Gagal/terlalu lama memuat. Periksa izin kamera, internet, HTTPS, dan Console.';
            consent.hidden = false;
            showStartError(msg);
            setStatus('Error: ' + msg, 'error');
        } finally {
            clearTimeout(timer);
            btn.disabled = false;
        }
    });
}