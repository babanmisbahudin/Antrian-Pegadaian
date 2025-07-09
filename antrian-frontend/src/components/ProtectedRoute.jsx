import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const role = localStorage.getItem("role");

  if (!isLoggedIn || !allowedRoles.includes(role)) {
    localStorage.clear(); // Auto logout
    return <Navigate to="/login" replace />;
  }

  return children;
}
