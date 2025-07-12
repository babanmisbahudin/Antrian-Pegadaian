import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";       // Halaman display publik (antrian, video, harga emas)
import Login from "./pages/Login";     // Halaman login
import Admin from "./pages/Admin";     // Dashboard admin
import Kasir from "./pages/Kasir";     // Halaman kasir
import Penaksir from "./pages/Penaksir"; // Halaman penaksir
import Satpam from "./pages/Satpam";   // Halaman satpam

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kasir"
          element={
            <ProtectedRoute allowedRoles={["kasir", "admin"]}>
              <Kasir />
            </ProtectedRoute>
          }
        />
        <Route
          path="/penaksir"
          element={
            <ProtectedRoute allowedRoles={["penaksir", "admin"]}>
              <Penaksir />
            </ProtectedRoute>
          }
        />
        <Route
          path="/satpam"
          element={
            <ProtectedRoute allowedRoles={["satpam", "admin"]}>
              <Satpam />
            </ProtectedRoute>
          }
        />
        
        {/* Optional: jika route tidak ditemukan */}
        <Route path="*" element={<div className="p-6 text-center">Halaman tidak ditemukan</div>} />
      </Routes>
    </Router>
  );
}
