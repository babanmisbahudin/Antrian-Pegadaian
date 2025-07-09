import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Kasir from "./pages/Kasir";
import Penaksir from "./pages/Penaksir";
import Satpam from "./pages/Satpam";

export default function App() {
  return (
    <Router>
      <Routes>
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
      </Routes>
    </Router>
  );
}
