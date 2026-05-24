# 🏦 Sistem Antrian Digital — Pegadaian Cabang Majalengka

Aplikasi manajemen antrian digital berbasis web yang dirancang untuk **Pegadaian Cabang Majalengka**. Sistem ini menggantikan antrian manual dengan alur digital yang efisien: dari pencetakan nomor antrian oleh petugas, tampilan layar TV dengan pengumuman suara otomatis, hingga pemanggilan oleh kasir dan penaksir.

---

## 📸 Tampilan Aplikasi

| Halaman | Deskripsi |
|--------|-----------|
| **Home (TV Display)** | Layar utama yang menampilkan nomor antrian aktif, harga emas, dan video promosi. Dilengkapi pengumuman suara otomatis (Text-to-Speech). |
| **Satpam** | Petugas cetak tiket antrian untuk nasabah. Mendukung printer termal Bluetooth (BLE). |
| **Kasir** | Kasir memanggil nomor antrian berikutnya. Layar TV di lobi otomatis mengumumkan. |
| **Penaksir** | Penaksir memanggil nomor antrian berikutnya, alur sama dengan Kasir. |
| **Admin** | Manajemen pengguna, upload video promosi, update harga emas, dan log aktivitas. |
| **Login** | Autentikasi berbasis NIK dan password dengan JWT. |

---

## ✨ Fitur Utama

- 🔢 **Nomor Antrian Otomatis** — Generate nomor berurut per hari, reset otomatis tengah malam
- 📺 **Display TV Real-time** — Polling setiap 3 detik, tampil nomor yang sedang dipanggil
- 🔊 **Text-to-Speech Bahasa Indonesia** — Pengumuman suara otomatis saat nomor dipanggil
- 🖨️ **Cetak Tiket Bluetooth** — Integrasi printer termal BLE (MPT-II Mini) tanpa kabel
- 🔄 **Ulangi Panggilan** — Kasir bisa ulangi panggilan, suara di layar TV ikut berbunyi ulang
- 💰 **Harga Emas Live** — Admin update harga, tampil di layar TV secara real-time
- 🎬 **Video Promosi** — Upload dan putar video promosi di layar TV secara bergilir
- 🔐 **Multi-role Auth** — JWT authentication dengan role: Admin, Satpam, Kasir, Penaksir
- 🐳 **Docker Support** — Siap deploy dengan Docker Compose

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38BDF8?logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4?logo=axios&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-8-880000)
![JWT](https://img.shields.io/badge/JWT-Auth-FB015B?logo=jsonwebtokens&logoColor=white)
![Multer](https://img.shields.io/badge/Multer-Upload-FF6B6B)

### Infrastructure
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-Reverse_Proxy-009639?logo=nginx&logoColor=white)

---

## 🗂️ Struktur Proyek

```
antrian-web/
├── antrian-backend/          # REST API (Node.js + Express)
│   ├── config/               # Koneksi database
│   ├── controllers/          # Logic bisnis
│   ├── middleware/           # Auth middleware (JWT)
│   ├── models/               # Schema MongoDB
│   ├── routes/               # Definisi endpoint API
│   ├── uploads/              # File video yang diupload
│   ├── .env.example          # Template environment variable
│   └── server.js             # Entry point
│
├── antrian-frontend/         # SPA (React + Vite)
│   ├── public/               # Asset statis (logo, sound)
│   └── src/
│       ├── api/              # Axios instance & konfigurasi
│       ├── components/       # Komponen reusable
│       └── pages/            # Halaman utama
│           ├── Home.jsx      # Display TV (publik)
│           ├── Login.jsx     # Halaman login
│           ├── Satpam.jsx    # Cetak tiket
│           ├── Kasir.jsx     # Panggil antrian kasir
│           ├── Penaksir.jsx  # Panggil antrian penaksir
│           ├── Admin.jsx     # Panel admin
│           └── HargaEmas.jsx # Manajemen harga emas
│
├── docker-compose.yml        # Setup lengkap (DB + Backend + Frontend)
└── README.md
```

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js ≥ 18
- MongoDB (lokal atau Atlas)
- Docker & Docker Compose *(opsional)*

---

### 1. Clone Repository

```bash
git clone https://github.com/babanmisbahudin/antrian-web.git
cd antrian-web
```

---

### 2. Jalankan dengan Docker (Rekomendasi)

```bash
# Buat file .env di root
cp antrian-backend/.env.example antrian-backend/.env
# Edit .env sesuai kebutuhan

docker-compose up -d
```

Akses:
- Frontend: `http://localhost`
- Backend API: `http://localhost:5000/api`

---

### 3. Jalankan Manual (Development)

**Backend:**
```bash
cd antrian-backend
cp .env.example .env
# Edit .env — isi MONGO_URI dan JWT_SECRET

npm install
npm start
```

**Frontend:**
```bash
cd antrian-frontend
cp .env.example .env
# Isi VITE_API_URL=http://localhost:5000/api

npm install
npm run dev
```

---

### 4. Seed Admin Pertama

```bash
cd antrian-backend
node seedAdmin.js
```

Login default:
- NIK: `admin`
- Password: sesuai isi di `seedAdmin.js`

---

## 📡 API Endpoints

### Autentikasi
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/users/login` | Login dan dapatkan JWT token |

### Antrian (Satpam)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/antrian/:role/status` | Status antrian (jumlah menunggu) |
| `POST` | `/api/antrian/:role/next` | Buat nomor antrian baru |
| `DELETE` | `/api/antrian/:role/reset` | Reset antrian role tertentu |

### Queue (Kasir / Penaksir)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/queue/terakhir` | Nomor terakhir yang dipanggil |
| `GET` | `/api/queue/waiting/:role` | Daftar antrian menunggu |
| `POST` | `/api/queue/call` | Panggil antrian berikutnya |
| `POST` | `/api/queue/recall` | Ulangi panggilan (trigger suara) |
| `POST` | `/api/queue/reset` | Reset semua antrian |

### Konten (Admin)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET/POST/DELETE` | `/api/video` | Manajemen video promosi |
| `GET/POST/PUT/DELETE` | `/api/harga-emas` | Manajemen harga emas |
| `GET/POST/PUT/DELETE` | `/api/users` | Manajemen pengguna |

---

## 🔐 Role & Akses

| Role | Akses |
|------|-------|
| `admin` | Semua halaman + manajemen user/konten |
| `satpam` | Cetak tiket antrian |
| `kasir` | Memanggil antrian kasir |
| `penaksir` | Memanggil antrian penaksir |
| *(publik)* | Halaman Home (display TV) tanpa login |

---

## 🔊 Cara Kerja Pengumuman Suara

```
Kasir klik "Panggil Berikutnya"
         ↓
POST /api/queue/call (ubah status antrian → "called")
         ↓
Home polling /api/queue/terakhir setiap 3 detik
         ↓
Nomor berubah → SpeechSynthesis (TTS Bahasa Indonesia)
         ↓
"Perhatian, nomor antrian Ka 0 0 1, silakan menuju loket 2"
```

Untuk **Ulangi Panggilan**: backend update field `recalledAt`, Home mendeteksi perubahan dan mengulang pengumuman.

---

## 🖨️ Printer Bluetooth

Sistem mendukung printer termal BLE menggunakan **Web Bluetooth API** (Chrome/Edge). Format output menggunakan ESC/POS command.

Printer yang kompatibel:
- MPT-II Mini
- Printer termal BLE lainnya (kompatibel ESC/POS)

---

## 📄 Lisensi

MIT License — bebas digunakan dan dimodifikasi.

---

## 👤 Developer

**Baban Misbahudin**
- GitHub: [@babanmisbahudin](https://github.com/babanmisbahudin)
- Email: babanmisbahudin200@gmail.com
