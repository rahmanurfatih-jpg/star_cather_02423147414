# Star Catcher

Game web HTML5 Canvas sederhana untuk praktik publikasi ke **itch.io** dan **GitHub Pages**.

## Cara Bermain
- Tangkap **bintang** untuk menambah skor (+10).
- Hindari **meteor**. Setiap tabrakan mengurangi 1 nyawa.
- Waktu 60 detik dan 3 nyawa. Game berakhir saat waktu atau nyawa habis.
- Tekan **Main Lagi** untuk mengulang (skor, waktu, dan nyawa direset).

## Kontrol
| Perangkat | Kontrol |
|-----------|---------|
| Keyboard  | Panah kiri/kanan atau tombol A / D |
| HP/Tablet | Tombol ◀ ▶ di layar, atau geser jari pada area game |

> Jika keyboard tidak merespons, klik area game terlebih dahulu agar mendapat fokus.

## Struktur Berkas
```
index.html      Halaman utama game
style.css       Tampilan halaman dan kontrol
game.js         Aturan permainan, skor, gerakan, dan timer
assets/star.svg Gambar bintang (path relatif)
README.md       Dokumentasi ini
```

## Menjalankan Secara Lokal
1. Buka folder di VS Code, jalankan `index.html` dengan **Live Server**, atau
2. Jalankan `python -m http.server 8000` lalu buka http://localhost:8000
3. Uji kontrol, skor, timer, dan mulai ulang. Buka F12 untuk memeriksa Console dan Network.

## Publikasi
### itch.io
1. Buat proyek baru, pada *Kind of project* pilih **HTML**.
2. Unggah `Star_Catcher_Siap_Upload.zip` (`index.html` berada di akar ZIP).
3. Aktifkan **This file will be played in the browser**, atur ukuran tampilan (mis. 480 x 760).
4. Simpan sebagai draft, uji pratinjau, lalu ubah menjadi **Public**.

### GitHub Pages
1. Buat repository Public (mis. `star-catcher-nim`) dan unggah **isi folder** (bukan ZIP).
2. Settings > Pages > Source: **Deploy from a branch** > branch `main`, folder `/(root)`.
3. Buka `https://<username>.github.io/<nama-repo>/`.

## Catatan Modifikasi (isi oleh mahasiswa)
- Nama / NIM: ...
- Perubahan 1: ... (contoh: mengganti judul atau `GAME_TITLE` di `game.js`)
- Perubahan 2: ... (contoh: mengubah `GAME_TIME` atau `START_LIVES`)

## Tautan
- Tautan itch.io: ...
- Repository GitHub: ...
- Tautan game (GitHub Pages): ...

## Kredit
Kode dan aset gambar dibuat untuk keperluan pembelajaran. Cantumkan sumber lain bila ada.
