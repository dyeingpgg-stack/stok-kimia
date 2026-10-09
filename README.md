# Mutasi Kimia Dyeing - PWA

## 1. Apps Script (backend)
1. Buka spreadsheet > Ekstensi > Apps Script. Tempel `gas/Code.gs` (hapus kode lama).
2. (Opsional, agar web app juga bisa dibuka langsung) tambah file HTML bernama `Index`, isi dengan `gas/Index.html`.
3. Deploy > New deployment > Web app > Execute as: **Me** > Who has access: **Anyone** > Deploy. Salin URL `/exec`.
4. Setiap mengubah Code.gs: Deploy > Manage deployments > Edit > Version: New version.

## 2. GitHub Pages (PWA)
1. Buat repo baru, upload **isi folder `pwa/`** ke root repo.
2. Settings > Pages > Branch `main` / `(root)` > Save.
3. Buka `https://USERNAME.github.io/NAMA-REPO/`. Jika URL Apps Script berbeda dari bawaan, isi di tab Setting.
4. Android Chrome: menu > Install app. iPhone Safari: Share > Add to Home Screen.
