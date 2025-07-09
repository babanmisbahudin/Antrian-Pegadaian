import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();
  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!nik || !password) {
      alert("NIK dan password wajib diisi!");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/users/login", { nik, password });

      const user = res.data;

      // Simpan ke localStorage atau state management sesuai kebutuhan
      localStorage.setItem("isLoggedIn", true);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userNama", user.nama);

      // Redirect sesuai role
      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "kasir":
          navigate("/kasir");
          break;
        case "penaksir":
          navigate("/penaksir");
          break;
        case "satpam":
          navigate("/satpam");
          break;
        default:
          alert("Role tidak dikenali");
          break;
      }
    } catch (err) {
      console.error("Login error:", err);
      alert(err?.response?.data?.message || "Gagal login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-green-700 mb-4">Login</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="NIK"
            value={nik}
            onChange={(e) => setNik(e.target.value)}
            className="border border-gray-300 rounded p-2"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded p-2 w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-lg text-gray-600"
            >
              {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
