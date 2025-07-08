// src/api/api.js
import axios from "axios";

// Ganti BASE_URL jika nanti dipindah ke server hosting
const api = axios.create({
  baseURL: "http://localhost:5000/api", // contoh: http://192.168.1.100:5000/api kalau pakai IP lokal
});

// Interceptor untuk menyisipkan token secara otomatis (kalau pakai auth)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
