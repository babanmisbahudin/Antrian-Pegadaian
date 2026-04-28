import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Kasir() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(null);
  const [loket, setLoket] = useState("-");
  const [waiting, setWaiting] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user || user.role?.toLowerCase() !== "kasir") {
      alert("Silakan login sebagai kasir terlebih dahulu.");
      navigate("/login");
      return;
    }
    setLoket(user.loket || "2");
  }, [navigate]);

  const fetchWaiting = useCallback(async () => {
    try {
      const res = await api.get("/queue/waiting/kasir");
      setWaiting(res.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchWaiting();
    const id = setInterval(fetchWaiting, 5000);
    return () => clearInterval(id);
  }, [fetchWaiting]);

  const handleNext = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.post("/queue/call", { role: "kasir", loket });
      setCurrent(res.data.data);
      await fetchWaiting();
    } catch (err) {
      const msg = err?.response?.data?.message || "Coba lagi.";
      alert("Gagal memanggil: " + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRepeat = () => {
    if (!current) return alert("Belum ada nomor yang dipanggil.");
    alert(`Nomor ${current.nomor} — lihat pengumuman di layar TV.`);
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col lg:flex-row gap-4 p-6">
      {/* Panel kiri: kontrol */}
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full lg:w-1/2 border border-green-300">
        <div className="flex flex-col items-center mb-4">
          <img src="/images/logo.png" alt="Pegadaian" className="h-12 object-contain mb-1" />
          <h1 className="text-xl font-bold text-green-700">Kasir — Loket {loket}</h1>
        </div>

        <div className="bg-green-100 border border-green-300 rounded-xl py-6 px-4 mb-5 text-center shadow-inner">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-widest">Sedang Dilayani</p>
          <p className="text-6xl font-bold text-green-800 tracking-widest">
            {current ? current.nomor : "—"}
          </p>
          {current && (
            <p className="text-sm text-green-700 mt-2">Loket {current.loket}</p>
          )}
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <button
            onClick={handleNext}
            disabled={loading || waiting.length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-lg shadow-md transition"
          >
            {loading
              ? "Memproses..."
              : waiting.length === 0
              ? "Antrian Kosong"
              : current
              ? "Panggil Berikutnya"
              : "Mulai Panggil"}
          </button>

          <button
            onClick={handleRepeat}
            disabled={!current}
            className="bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 font-semibold py-2 rounded-xl text-sm shadow-inner"
          >
            Ulangi Panggilan
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center">
          {waiting.length} antrian menunggu
        </p>
      </div>

      {/* Panel kanan: daftar antrian menunggu */}
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full lg:w-1/2 border border-gray-200">
        <h2 className="text-lg font-bold text-gray-700 mb-3">
          Daftar Antrian Menunggu
        </h2>
        {waiting.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-4xl mb-2">📋</p>
            <p>Belum ada antrian</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {waiting.map((item, idx) => (
              <div
                key={item._id}
                className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
                  idx === 0
                    ? "bg-green-50 border-green-300 font-semibold"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <span className="text-lg font-mono">{item.nomor}</span>
                {idx === 0 && (
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                    Berikutnya
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
