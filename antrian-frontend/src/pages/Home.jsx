import { useEffect, useState } from "react";
import api from "../api/api";

export default function Home() {
  const [kasir, setKasir] = useState("-");
  const [penaksir, setPenaksir] = useState("-");
  const [hargaEmas, setHargaEmas] = useState([]);
  const [videoList, setVideoList] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

 useEffect(() => {
  // Ambil antrian dari localStorage tiap 2 detik
  const intervalAntrian = setInterval(() => {
    setKasir(localStorage.getItem("lastKasir") || "-");
    setPenaksir(localStorage.getItem("lastPenaksir") || "-");
  }, 2000);

  // Fetch harga emas
  const fetchHargaEmas = async () => {
    try {
      const res = await api.get("/harga-emas");
      setHargaEmas(res.data);
    } catch (err) {
      console.error("Gagal ambil harga emas:", err);
    }
  };

  const fetchVideos = async () => {
  try {
    const res = await api.get("/video");
    console.log("✅ Data video diterima:", res.data);
    setVideoList(res.data);
  } catch (err) {
    console.error("❌ Gagal ambil video:", err);
  }
};


  fetchHargaEmas();
  fetchVideos();

  const refreshHargaInterval = setInterval(fetchHargaEmas, 60000); // setiap 1 menit
  const refreshVideoInterval = setInterval(fetchVideos, 60000);   // setiap 1 menit

  return () => {
    clearInterval(intervalAntrian);
    clearInterval(refreshHargaInterval);
    clearInterval(refreshVideoInterval);
  };
  }, []); // ✅ hanya dijalankan sekali saat mount


  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-3 bg-white shadow border-b border-gray-200">
        <h1 className="text-xl font-bold text-green-800">Pegadaian Cabang Majalengka</h1>
        <span className="text-sm font-medium text-gray-700">
          DI Buat @himisbah
        </span>
      </div>

      {/* ANTRIAN & VIDEO */}
      <div className="flex flex-col lg:flex-row gap-4 p-6">
        {/* Pemanggilan Antrian */}
        <div className="w-full lg:w-1/2 bg-white rounded-2xl p-6 shadow-lg flex flex-col gap-6 justify-center">
          <div className="bg-green-100 p-4 rounded-xl text-center">
            <p className="text-sm text-green-700 mb-1">Sedang diproses di Loket 1 (Penaksir)</p>
            <p className="text-6xl font-extrabold text-green-900">{penaksir}</p>
          </div>

          <div className="bg-green-200 p-4 rounded-xl text-center">
            <p className="text-sm text-green-800 mb-1">Sedang diproses di Loket 2/3 (Kasir)</p>
            <p className="text-6xl font-extrabold text-green-900">{kasir}</p>
          </div>
        </div>

        {/* Video Promosi */}
        <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden shadow-xl bg-black h-[300px]">
          {videoList.length > 0 ? (
            <iframe
              className="w-full h-full"
              src={`${videoList[currentVideoIndex]?.url}?autoplay=1&loop=1&playlist=${videoList[currentVideoIndex]?.url.split("/embed/")[1]}`}
              title="Video Promosi"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="text-white text-center p-4">Belum ada video promosi</div>
          )}
        </div>
      </div>

      {/* HARGA EMAS */}
      <div className="bg-white rounded-2xl mx-6 mb-6 p-6 shadow-xl">
        <h2 className="text-xl font-bold text-yellow-700 mb-4 text-center">
          💰 Harga Emas Galeri 24
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse text-sm">
            <thead>
              <tr className="bg-yellow-100 text-yellow-800">
                <th className="border px-4 py-2">Berat</th>
                <th className="border px-4 py-2">Harga Beli</th>
                <th className="border px-4 py-2">Buyback</th>
              </tr>
            </thead>
            <tbody>
              {hargaEmas.map((item, idx) => (
                <tr key={idx} className="text-center text-gray-800">
                  <td className="border px-4 py-2">{item.berat}</td>
                  <td className="border px-4 py-2">
                    Rp {item.beli.toLocaleString()}
                  </td>
                  <td className="border px-4 py-2">
                    Rp {item.buyback.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 text-right mt-2 italic">
          *Harga dapat berubah sewaktu-waktu
        </p>
      </div>
    </div>
  );
}
