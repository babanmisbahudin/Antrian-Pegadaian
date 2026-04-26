import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Penaksir() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(null);
  const [loket, setLoket] = useState("1");
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const didInit = useRef(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user || user.role?.toLowerCase() !== "penaksir") {
      alert("Silakan login sebagai penaksir terlebih dahulu.");
      navigate("/login");
      return;
    }
    setLoket(user.loket || "1");
  }, []);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    };
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }, []);

  const speak = (text, callback) => {
    const utter = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.lang === "id-ID") || voices[0];
    if (voice) utter.voice = voice;
    if (callback) utter.onend = callback;
    window.speechSynthesis.speak(utter);
  };

  const callNumber = (nomor) => {
    speak("Perhatian. Akan dipanggil.", () => {
      speak(`Nomor antrian ${nomor.replace(/(\w)(\d+)/, "$1 $2")}, silakan ke loket ${loket}`);
    });
  };

  const handleNext = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.post("/queue/call", { role: "penaksir", loket });
      const data = res.data.data;
      setCurrent(data);
      callNumber(data.nomor);
    } catch (err) {
      alert("Gagal memanggil antrian: " + (err?.response?.data?.message || "Coba lagi."));
    } finally {
      setLoading(false);
    }
  };

  const handleRepeat = () => {
    if (!current) {
      alert("Belum ada nomor yang dipanggil.");
      return;
    }
    callNumber(current.nomor);
  };

  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-green-300">
        <h1 className="text-3xl font-bold text-green-700 text-center mb-6">
          🧾 Penaksir - Loket {loket}
        </h1>

        <div className="bg-green-200 border border-green-400 rounded-xl py-6 px-4 mb-6 text-center shadow-inner">
          <p className="text-sm text-gray-600 mb-1 uppercase">Sedang Dilayani</p>
          <p className="text-6xl font-bold text-green-800 tracking-widest">
            {current ? current.nomor : "-"}
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={handleNext}
            disabled={loading}
            className={`${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            } text-white font-bold py-3 rounded-xl text-lg shadow-md transition`}
          >
            {loading ? "Memproses..." : current ? "➕ Panggil Antrian Berikutnya" : "▶️ Mulai Antrian"}
          </button>

          <button
            onClick={handleRepeat}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-xl text-sm shadow-inner"
          >
            🔁 Ulangi Panggilan
          </button>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-4 shadow-inner text-center">
          <p className="text-sm font-semibold text-gray-600">
            Tekan tombol untuk memanggil nomor antrian berikutnya
          </p>
        </div>
      </div>
    </div>
  );
}
