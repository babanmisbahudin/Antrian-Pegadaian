import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Kasir() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loket, setLoket] = useState("-");
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const didFetch = useRef(false);

  // ⛔ Cek login dan role
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user || user.role?.toLowerCase() !== "kasir") {
      alert("Silakan login sebagai kasir terlebih dahulu.");
      navigate("/login");
    } else {
      localStorage.setItem("loketKasir", user.loket || "2");
      setLoket(user.loket || "2");
    }
  }, []);

  // 🔊 Load suara & antrian awal
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    };
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();

    const savedLoket = localStorage.getItem("loketKasir") || "2";
    fetchQueue(savedLoket);
  }, []);

  // 🚀 Ambil data antrian dari backend
  const fetchQueue = async (loketNum) => {
    try {
      setLoading(true);
      const res = await api.get(`/antrian/kasir?loket=${loketNum}`);
      setQueue(res.data || []);
    } catch (err) {
      console.error("Gagal ambil antrian:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔈 Fungsi untuk bicara
  const speak = (text, callback) => {
    const utter = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.lang === "id-ID") || voices[0];
    if (voice) utter.voice = voice;
    if (callback) utter.onend = callback;
    window.speechSynthesis.speak(utter);
  };

  // 🔊 Fungsi panggil suara antrian
  const callNumber = (nomor) => {
    speak("Perhatian. Akan dipanggil.", () => {
      speak(`Nomor antrian ${nomor.replace("-", " ")}, silakan ke loket ${loket}`);
    });
  };

  // ▶️ Panggil nomor antrian berikutnya
  const handleNext = async () => {
    if (loading) {
      alert("Sedang memuat antrian. Harap tunggu.");
      return;
    }

    if (queue.length === 0) {
      await fetchQueue(loket);
      if (queue.length === 0) {
        alert("Antrian masih kosong. Silakan coba lagi nanti.");
        return;
      }
    }

    const next = queue[0];
    try {
      await api.post("/antrian/panggil", { id: next.id, loket });
      setCurrent(next);
      setQueue((prev) => prev.slice(1));
      callNumber(next.nomor);
    } catch (err) {
      console.error("Gagal memanggil antrian:", err);
      alert("Gagal memanggil antrian. Coba lagi.");
    }
  };

  // 🔁 Ulangi panggilan terakhir
  const handleRepeat = () => {
    if (!current) {
      alert("Belum ada nomor yang dipanggil.");
      return;
    }
    callNumber(current.nomor);
  };

  // 🔄 Reset nomor aktif
  const handleReset = () => {
    if (!current) {
      alert("Belum ada nomor yang dipanggil.");
      return;
    }
    const konfirmasi = confirm(`Reset nomor ${current.nomor}?`);
    if (!konfirmasi) return;
    setCurrent(null);
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-green-300">
        <h1 className="text-3xl font-bold text-green-700 text-center mb-6">
          💼 Kasir - Loket {loket}
        </h1>

        <div className="bg-green-100 border border-green-300 rounded-xl py-6 px-4 mb-6 text-center shadow-inner">
          <p className="text-sm text-gray-600 mb-1 uppercase">Sedang Dilayani</p>
          <p className="text-6xl font-bold text-green-800 tracking-widest">
            {current ? current.nomor : "-"}
          </p>
        </div>

        {loading && (
          <p className="text-center text-sm text-gray-500 italic mb-2">
            Memuat antrian...
          </p>
        )}

        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={handleNext}
            className={`${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white font-bold py-3 rounded-xl text-lg shadow-md transition`}
            disabled={loading}
          >
            {current ? "➕ Panggil Antrian Berikutnya" : "▶️ Mulai Antrian"}
          </button>

          <button
            onClick={handleRepeat}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-xl text-sm shadow-inner"
          >
            🔁 Ulangi Panggilan
          </button>

          <button
            onClick={handleReset}
            className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 rounded-xl text-sm shadow-inner"
          >
            🔄 Reset Nomor Aktif
          </button>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-4 shadow-inner">
          <p className="text-sm font-semibold text-gray-600 mb-2">Antrian Selanjutnya:</p>
          {queue.length > 0 ? (
            <ul className="space-y-1">
              {queue.map((item, i) => (
                <li
                  key={i}
                  className="text-gray-800 font-mono text-sm bg-white px-3 py-1 rounded-md shadow-sm border border-gray-100"
                >
                  {item.nomor}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm italic">Tidak ada antrian lagi.</p>
          )}
        </div>
      </div>
    </div>
  );
}
