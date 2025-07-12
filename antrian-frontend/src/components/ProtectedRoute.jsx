import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles, children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role.toLowerCase())) {
    return <div className="p-4 text-center text-red-500">🚫 Akses ditolak. Anda tidak memiliki izin.</div>;
  }

  return children;
}
