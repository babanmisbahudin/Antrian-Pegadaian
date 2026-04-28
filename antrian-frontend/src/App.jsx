import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Kasir from "./pages/Kasir";
import Penaksir from "./pages/Penaksir";
import Satpam from "./pages/Satpam";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />

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

        <Route path="*" element={<div className="p-6 text-center">Halaman tidak ditemukan</div>} />
      </Routes>
    </Router>
  );
}
