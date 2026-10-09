# Mutasi Kimia Dyeing (PWA)

## 1. Backend (Apps Script)
1. script.google.com > Project baru > tempel isi `Kode.gs`.
2. Project Settings > Script Properties: `GEMINI_API_KEY` (untuk fitur AI), opsional `APP_TOKEN` (password akses), opsional `GEMINI_MODEL`.
3. Deploy > New deployment > Web app > Execute as **Me**, Who has access **Anyone** > Deploy, izinkan otorisasi.
4. Salin URL `/exec`. Jika URL berbeda dari yang ada di `index.html` (konstanta `DEFAULT_URL`), ganti, atau isi lewat menu Setting di aplikasi.
5. Setiap mengubah Kode.gs: Deploy > Manage deployments > Edit > Version: New version (URL tetap sama).

## 2. GitHub Pages
1. Buat repo baru (public), upload semua isi folder ini (`index.html`, `sw.js`, `manifest.webmanifest`, folder `icons`, dll.).
2. Settings > Pages > Source: Deploy from a branch > `main` / `(root)` > Save.
3. Buka `https://USERNAME.github.io/NAMA-REPO/` (harus HTTPS).

## 3. Install
- Android/Chrome/Edge: Setting > **Install Aplikasi** (atau menu browser > Install app).
- iPhone/iPad (Safari): Bagikan > **Tambah ke Layar Utama**.
- Setelah update file, naikkan `V` di `sw.js` (mis. `mk-v2`) agar cache lama diganti.
