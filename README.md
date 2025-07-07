# 🏦 Antrian Web Pegadaian

Sistem digital antrian layanan berbasis web yang dirancang khusus untuk kebutuhan operasional cabang Pegadaian. Sistem ini mendukung pemanggilan nomor antrian, tampilan display pelanggan, pengelolaan user (Admin, Satpam, Penaksir, dan Kasir), serta integrasi video promosi dan harga emas Galeri24.

## 🚀 Fitur Utama

- ✅ Sistem login multi-role (Admin, Penaksir, Kasir, Satpam)
- 📺 Tampilan display antrian & video promosi (layar TV/lobby)
- 📢 Pemanggilan antrian dengan suara
- 🎥 Daftar dan manajemen video promosi
- 💰 Sinkronisasi harga emas Galeri24 (harga beli & buyback)
- 🔐 Reset dan kontrol nomor antrian
- 👥 Manajemen user lengkap (NIK, cabang, outlet, peran, loket)

---

## 📁 Struktur Folder
antrian-web/
├── antrian-frontend/ # Frontend React
├── antrian-backend/ # Backend Express.js
├── docker-compose.yml # Docker multi-container setup
└── README.md


---

## ⚙️ Teknologi yang Digunakan

- **Frontend:** React.js + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** (opsional jika ingin integrasi ke MongoDB atau lainnya)
- **API Harga Emas:** Galeri24 (scraping/manual input)
- **Docker:** Containerization untuk deployment

---

## 🐳 Menjalankan dengan Docker

### 1. Clone Project
```bash
git clone https://github.com/babanmisbahudin/antrian-web.git
cd antrian-web

Jalankan Docker
docker-compose up --build

Frontend jalan di: http://localhost:3000
Backend jalan di: http://localhost:5000

📌 Catatan Penting
Pastikan file .env (jika ada) berisi konfigurasi yang sesuai.
Role user dikelola di halaman Admin.
Halaman Home menampilkan antrian, video promosi, dan harga emas secara real-time.

✨ Pengembangan Selanjutnya (Roadmap)
🔄 Integrasi database untuk menyimpan data user dan antrian
📲 Responsif untuk tablet/smart display
🗣️ Suara pemanggilan berbasis TTS bahasa Indonesia
📊 Dashboard laporan transaksi dan statistik antrian

🧑‍💻 Kontributor
👋 Dibuat dan dikembangkan oleh:
Baban Misbahudin

MIT License. Silakan gunakan, modifikasi, dan distribusikan dengan menyertakan atribusi.
Kalau kamu ingin README-nya pakai badge GitHub Action, status Docker, atau demo video YouTube,
saya bisa bantu tambahkan. Mau versi Bahasa Indonesia atau versi bilingual juga bisa.
