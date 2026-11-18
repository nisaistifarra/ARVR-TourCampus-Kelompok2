# AR Tur Kelas dan Laboratorium (Indoor)

Aplikasi web Augmented Reality (AR) untuk tur di dalam gedung. Penanda gambar ditempel di beberapa titik (pintu lab, papan, ruang dosen). Saat penanda dipindai lewat kamera HP, aplikasi memunculkan objek 3D beranimasi dan panel informasi tentang tempat tersebut. Progres kunjungan disimpan dan ditampilkan, misalnya "2 dari 5 titik dikunjungi".

**Status:** v0.5 (prototipe untuk UTS). Target akhir: v1.0 (UAS).

## Demo

- Aplikasi (HTTPS / GitHub Pages): <isi tautan GitHub Pages>
- Kode QR: <isi gambar/tautan kode QR>
- Video demo (1–2 menit): <isi tautan video>

## Fitur

### Fitur wajib

- Image tracking dengan MindAR, minimal 3 titik (POI) pada v0.5 dan ditargetkan 5 titik pada UAS.
- Data titik disimpan di `pois.json`.
- Setiap titik punya objek 3D (GLB), animasi, dan panel informasi.
- Progres kunjungan tersimpan di `localStorage` dan ditampilkan (contoh: "2 dari 5 titik dikunjungi").

### Fitur pilihan

- Petunjuk menuju titik berikutnya.
- Ucapan selamat setelah semua titik selesai dikunjungi.

*Sesuaikan tanda centang dengan kondisi proyek kalian.*

## Teknologi

- MindAR (image tracking)
- Model 3D format GLB
- Data JSON (`pois.json`)
- `localStorage` untuk menyimpan progres
- GitHub Pages untuk hosting HTTPS (kamera di HP wajib HTTPS)

## Cara Menjalankan

### Cara cepat (disarankan)

1. Buka tautan aplikasi di HP: <tautan GitHub Pages>
2. Izinkan akses kamera saat diminta.
3. Arahkan kamera ke penanda gambar yang sudah dicetak dan ditempel di lokasi.
4. Objek 3D dan panel informasi akan muncul. Titik tersebut otomatis tercatat sebagai "dikunjungi".

### Menjalankan secara lokal

1. Clone repository:

```bash
git clone <url-repository>
cd <nama-folder>
```

2. Jalankan server lokal, misalnya:

```bash
npx serve .
```

atau

```bash
python -m http.server 8000
```

3. Akses kamera dari HP membutuhkan HTTPS. Untuk uji lokal, gunakan tunneling (misalnya ngrok) atau langsung uji lewat GitHub Pages.

## Struktur Proyek

```text
.
├── index.html              # halaman utama aplikasi AR
├── pois.json               # data titik (POI)
├── assets/
│   ├── models/              # objek 3D (.glb)
│   └── markers/             # gambar penanda + file .mind
├── js/                      # logika aplikasi (tracking, UI, data, progres)
├── css/                     # gaya tampilan
└── docs/
    ├── device-matrix.md     # hasil uji di berbagai perangkat
    └── asset-license.md    # tabel lisensi aset
```

*Sesuaikan dengan struktur folder yang sebenarnya.*

## Skema Data (`pois.json`)

Contoh format satu titik:

```json
{
  "pois": [
    {
      "id": "lab-komputer",
      "nama": "Laboratorium Komputer",
      "targetIndex": 0,
      "model": "assets/models/lab.glb",
      "animasi": "idle",
      "info": {
        "judul": "Laboratorium Komputer",
        "deskripsi": "Deskripsi singkat tentang tempat ini."
      },
      "urutan": 1
    }
  ]
}
```

### Validasi yang dilakukan saat data dimuat:

- Setiap titik wajib punya `id`, `nama`, `targetIndex`, `model`, dan `info`.
- `id` dan `targetIndex` tidak boleh ganda.
- Jika data tidak valid, aplikasi menampilkan pesan galat yang jelas dan tidak crash.

## Daftar Titik (POI)

| No | Titik | Lokasi penanda | Objek 3D |
|---|---|---|---|
| 1 | <nama titik> | Pintu lab | <nama objek> |
| 2 | <nama titik> | Papan | <nama objek> |
| 3 | <nama titik> | Ruang dosen | <nama objek> |

## Pengujian

Pengujian dilakukan dengan mencetak penanda dan mencobanya langsung di lokasi nyata. Hasil lengkap per perangkat ada di `docs/device-matrix.md` (minimal 2 perangkat, mencakup Android dan iPhone, atau alasan jika tidak ada iPhone).

## Batasan yang Diketahui

- **Pencahayaan ruangan:** cahaya yang terlalu redup atau tidak merata menurunkan stabilitas tracking.
- **Penanda mengkilap:** penanda yang dicetak pada kertas glossy memantulkan cahaya dan membuat tracking gagal atau bergetar. Gunakan kertas doff/matte.
- **Penanda yang mirip:** gambar penanda antar titik harus cukup berbeda agar tidak tertukar.
- **Progres per perangkat:** progres disimpan di `localStorage`, jadi hanya berlaku di browser dan perangkat yang sama, dan hilang jika data browser dihapus.
- **Butuh internet dan HTTPS:** aplikasi diakses lewat GitHub Pages dan membutuhkan izin kamera.
- <tambahkan batasan lain yang kalian temukan>

## Lisensi Aset

Daftar lengkap (nama aset, sumber, lisensi, atribusi) ada di `docs/asset-license.md`.

## Tim

| Nama | Peran | GitHub |
|---|---|---|
| <nama> | Tracking dan Integrasi | <username> |
| <nama> | Interaksi dan UI/UX | <username> |
| <nama> | Data dan Persistence | <username> |
| <nama> | QA dan Dokumentasi | <username> |

**Mata kuliah:** <nama mata kuliah>

**Kelompok:** <nomor/nama kelompok>