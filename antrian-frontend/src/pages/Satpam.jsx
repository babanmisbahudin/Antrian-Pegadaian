import { useState } from "react";
import api from "../api/api";

export default function Satpam() {
  const [antrianCetak, setAntrianCetak] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAmbilAntrian = async (tujuan) => {
    const role = tujuan === "Kasir" ? "kasir" : "penaksir";
    const loket = tujuan === "Kasir" ? "2" : "1";
    setLoading(true);
    try {
      const res = await api.post("/antrian/" + role + "/next", { loket });
      const nomor = res.data.nomor.toString().padStart(4, "0");
      const formatted = tujuan === "Kasir" ? `K-${nomor}` : `P-${nomor}`;
      setAntrianCetak({ nomor: formatted, tujuan });
      setTimeout(() => window.print(), 300);
    } catch (err) {
      alert(
        "Gagal ambil antrian: " +
          (err?.response?.data?.message || "Terjadi kesalahan.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6 flex flex-col items-center justify-center">
      <div className="bg-white shadow-xl rounded-lg w-full max-w-md p-8 print:hidden">
        <h1 className="text-2xl font-bold text-blue-700 text-center mb-4">Dashboard Satpam</h1>

        <p className="text-center text-gray-600 mb-3">Ambil nomor antrian untuk layanan:</p>
        <div className="space-y-3">
          <button
            onClick={() => handleAmbilAntrian("Kasir")}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 w-full rounded-lg transition"
          >
            {loading ? "Memproses..." : "Ambil Antrian ke Kasir"}
          </button>
          <button
            onClick={() => handleAmbilAntrian("Penaksir")}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2 w-full rounded-lg transition"
          >
            {loading ? "Memproses..." : "Ambil Antrian ke Penaksir"}
          </button>
        </div>
      </div>

      {antrianCetak && (
        <div className="hidden print:block text-center p-12">
          <h2 className="text-3xl font-bold mb-2">Nomor Antrian</h2>
          <div className="text-7xl font-extrabold mb-2">{antrianCetak.nomor}</div>
          <p className="text-lg">Tujuan: {antrianCetak.tujuan}</p>
          <p className="text-sm text-gray-600 mt-4">Silakan tunggu panggilan Anda</p>
        </div>
      )}
    </div>
  );
}
