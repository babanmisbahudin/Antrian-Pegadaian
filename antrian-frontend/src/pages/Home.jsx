import { useEffect, useState, useRef, useCallback } from "react";
import api, { getUploadsUrl } from "../api/api";

function nomorToSpeech(nomor) {
  const digits = ["nol","satu","dua","tiga","empat","lima","enam","tujuh","delapan","sembilan"];
  const parts = nomor.split("-");
  if (parts.length === 2) {
    const prefix = parts[0] === "K" ? "Ka" : "Pe";
    const nums = parts[1].split("").map((d) => digits[parseInt(d)] ?? d).join(" ");
    return `${prefix} ${nums}`;
  }
  return nomor;
}

export default function Home() {
  const [kasirData, setKasirData]           = useState(null);
  const [penaksirData, setPenaksirData]     = useState(null);
  const [kasirWaiting, setKasirWaiting]     = useState(0);
  const [penaksirWaiting, setPenaksirWaiting] = useState(0);
  const [hargaEmas, setHargaEmas]           = useState([]);
  const [videoList, setVideoList]           = useState([]);
  const [videoIndex, setVideoIndex]         = useState(0);
  const [isAnnouncing, setIsAnnouncing]     = useState(false);
  const [audioEnabled, setAudioEnabled]     = useState(false);

  const prevKasir            = useRef(null);
  const prevPenaksir         = useRef(null);
  const prevKasirRecalled    = useRef(null);
  const prevPenaksirRecalled = useRef(null);
  const kasirDataRef         = useRef(null);
  const penaksirDataRef      = useRef(null);
  const videoRef     = useRef(null);
  const announceQ    = useRef([]);
  const announcing   = useRef(false);
  const audioOn      = useRef(false); // mirror audioEnabled tanpa re-render issue

  // ── volume helper ────────────────────────────────────────────────────────────
  const applyVolume = useCallback((announcing_) => {
    if (!videoRef.current || !audioOn.current) return;
    videoRef.current.muted  = false;
    videoRef.current.volume = announcing_ ? 0.05 : 0.15;
  }, []);

  // ── TTS queue ────────────────────────────────────────────────────────────────
  const processQ = useCallback(() => {
    if (announcing.current || announceQ.current.length === 0) return;
    if (!audioOn.current) return; // tunggu sampai audio diaktifkan

    const { nomor, loket } = announceQ.current.shift();
    announcing.current = true;
    setIsAnnouncing(true);
    applyVolume(true);

    window.speechSynthesis.cancel();
    const voices  = window.speechSynthesis.getVoices();
    const idVoice = voices.find((v) => v.lang === "id-ID") || voices[0];
    const spoken  = nomorToSpeech(nomor);

    const u1 = new SpeechSynthesisUtterance("Perhatian,");
    const u2 = new SpeechSynthesisUtterance(`nomor antrian ${spoken},`);
    const u3 = new SpeechSynthesisUtterance(`silakan menuju loket ${loket}`);

    [u1, u2, u3].forEach((u) => {
      u.lang = "id-ID";
      u.rate = 0.9;
      if (idVoice) u.voice = idVoice;
    });

    u3.onend = () => {
      announcing.current = false;
      setIsAnnouncing(false);
      applyVolume(false);
      processQ();
    };

    window.speechSynthesis.speak(u1);
    window.speechSynthesis.speak(u2);
    window.speechSynthesis.speak(u3);
  }, [applyVolume]);

  const enqueue = useCallback((nomor, loket) => {
    announceQ.current.push({ nomor, loket: loket || "1" });
    processQ();
  }, [processQ]);

  // ── polling ──────────────────────────────────────────────────────────────────
  const fetchAntrian = useCallback(async () => {
    try {
      const { data } = await api.get("/queue/terakhir");
      const k = data?.kasir   || null;
      const p = data?.penaksir || null;

      if (k?.nomor) {
        const recalledChanged = k.recalledAt && k.recalledAt !== prevKasirRecalled.current;
        if (k.nomor !== prevKasir.current) {
          if (prevKasir.current !== null) enqueue(k.nomor, k?.loket || "2");
          prevKasir.current = k.nomor;
        } else if (recalledChanged) {
          enqueue(k.nomor, k?.loket || "2");
        }
        if (k.recalledAt) prevKasirRecalled.current = k.recalledAt;
      }
      if (p?.nomor) {
        const recalledChanged = p.recalledAt && p.recalledAt !== prevPenaksirRecalled.current;
        if (p.nomor !== prevPenaksir.current) {
          if (prevPenaksir.current !== null) enqueue(p.nomor, p?.loket || "1");
          prevPenaksir.current = p.nomor;
        } else if (recalledChanged) {
          enqueue(p.nomor, p?.loket || "1");
        }
        if (p.recalledAt) prevPenaksirRecalled.current = p.recalledAt;
      }

      setKasirData(k);
      setPenaksirData(p);
      kasirDataRef.current    = k;
      penaksirDataRef.current = p;
    } catch { /* silent */ }
  }, [enqueue]);

  const fetchAntrianStatus = useCallback(async () => {
    try {
      const [k, p] = await Promise.all([
        api.get("/antrian/kasir/status"),
        api.get("/antrian/penaksir/status"),
      ]);
      setKasirWaiting(k.data.waiting ?? 0);
      setPenaksirWaiting(p.data.waiting ?? 0);
    } catch { /* silent */ }
  }, []);

  const fetchHargaEmas = useCallback(async () => {
    try {
      const r = await api.get("/harga-emas");
      const sorted = [...r.data].sort((a, b) => (parseFloat(a.berat) || 0) - (parseFloat(b.berat) || 0));
      setHargaEmas(sorted);
    } catch { /* silent */ }
  }, []);

  const fetchVideos = useCallback(async () => {
    try { const r = await api.get("/video"); setVideoList(r.data); }
    catch { /* silent */ }
  }, []);

  useEffect(() => {
    const sv = window.speechSynthesis;
    sv.getVoices();
    if (sv.onvoiceschanged !== undefined) sv.onvoiceschanged = () => sv.getVoices();

    fetchAntrian();
    fetchAntrianStatus();
    fetchHargaEmas();
    fetchVideos();

    const t1 = setInterval(fetchAntrian,       3000);
    const t2 = setInterval(fetchAntrianStatus, 5000);
    const t3 = setInterval(fetchHargaEmas,    60000);
    const t4 = setInterval(fetchVideos,       60000);

    return () => {
      clearInterval(t1); clearInterval(t2); clearInterval(t3); clearInterval(t4);
      window.speechSynthesis.cancel();
    };
  }, [fetchAntrian, fetchAntrianStatus, fetchHargaEmas, fetchVideos]);

  // ── aktifkan suara otomatis saat interaksi pertama ──────────────────────────
  const enableAudio = useCallback(() => {
    if (audioOn.current) return;
    audioOn.current = true;
    setAudioEnabled(true);
    if (videoRef.current) {
      videoRef.current.muted  = false;
      videoRef.current.volume = 0.15;
      if (videoRef.current.paused) videoRef.current.play().catch(() => {});
    }
    ["click","touchstart","keydown"].forEach((e) =>
      document.removeEventListener(e, enableAudio)
    );
    // langsung umumkan nomor yang sedang terpanggil saat audio diaktifkan
    const k = kasirDataRef.current;
    const p = penaksirDataRef.current;
    if (k?.nomor) announceQ.current.push({ nomor: k.nomor, loket: k.loket || "2" });
    if (p?.nomor) announceQ.current.push({ nomor: p.nomor, loket: p.loket || "1" });
    setTimeout(processQ, 300);
  }, [processQ]);

  useEffect(() => {
    ["click","touchstart","keydown"].forEach((e) =>
      document.addEventListener(e, enableAudio, { once: true })
    );
    return () => {
      ["click","touchstart","keydown"].forEach((e) =>
        document.removeEventListener(e, enableAudio)
      );
    };
  }, [enableAudio]);

  // ── video ────────────────────────────────────────────────────────────────────
  const currentVideo =
    videoList.length > 0 && videoList[videoIndex]?.filename
      ? videoList[videoIndex]
      : null;

  const handleVideoEnd = () =>
    setVideoIndex((i) => (i + 1) % videoList.length);

  const handleCanPlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted  = !audioOn.current;
    v.volume = audioOn.current ? (isAnnouncing ? 0.05 : 0.15) : 0;
    // Paksa play — kalau autoPlay diblokir browser ini akan memulainya
    v.play().catch(() => {});
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">

      {/* Overlay aktifkan suara */}
      {!audioEnabled && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 cursor-pointer"
          onClick={enableAudio}
        >
          <div className="bg-white rounded-2xl p-10 shadow-2xl text-center max-w-sm">
            <p className="text-5xl mb-4">🔊</p>
            <p className="text-2xl font-bold text-green-700 mb-2">Aktifkan Suara</p>
            <p className="text-gray-500 text-sm">Tap / klik di mana saja untuk mengaktifkan pengumuman suara antrian</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-3 bg-white shadow border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" alt="Pegadaian" className="h-8 object-contain" />
        </div>
        {isAnnouncing && (
          <span className="text-sm font-semibold text-green-700 animate-pulse">
            🔊 Memanggil antrian...
          </span>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 px-6 pt-4 pb-4">

        {/* Panel nomor antrian — tinggi sama dengan video (16:9) */}
        <div className="w-full lg:w-1/2 lg:aspect-video bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">

          {/* Penaksir */}
          <div className="flex-1 bg-green-50 border-b-4 border-green-200 flex flex-col items-center justify-center gap-1 px-4">
            <p className="text-base lg:text-lg text-green-700 font-semibold tracking-wide">
              Loket {penaksirData?.loket || "1"} — Penaksir
            </p>
            {penaksirWaiting === 0 && !penaksirData ? (
              <p className="text-gray-400 font-semibold text-[clamp(1rem,2.5vw,1.5rem)]">
                Belum ada antrian
              </p>
            ) : (
              <p className={`font-extrabold text-green-900 transition-transform duration-300 text-[clamp(2.5rem,5.5vw,6rem)] leading-none ${isAnnouncing ? "scale-110" : "scale-100"}`}>
                {penaksirData ? penaksirData.nomor : "—"}
              </p>
            )}
            <p className="text-xs text-green-600 mt-1">
              {penaksirWaiting > 0
                ? `${penaksirWaiting} antrian menunggu`
                : penaksirData
                ? "Semua sudah dipanggil"
                : "Satpam belum buat tiket"}
            </p>
          </div>

          {/* Kasir */}
          <div className="flex-1 bg-green-100 flex flex-col items-center justify-center gap-1 px-4">
            <p className="text-base lg:text-lg text-green-800 font-semibold tracking-wide">
              Loket {kasirData?.loket || "2"} — Kasir
            </p>
            {kasirWaiting === 0 && !kasirData ? (
              <p className="text-gray-400 font-semibold text-[clamp(1rem,2.5vw,1.5rem)]">
                Belum ada antrian
              </p>
            ) : (
              <p className={`font-extrabold text-green-900 transition-transform duration-300 text-[clamp(2.5rem,5.5vw,6rem)] leading-none ${isAnnouncing ? "scale-110" : "scale-100"}`}>
                {kasirData ? kasirData.nomor : "—"}
              </p>
            )}
            <p className="text-xs text-green-700 mt-1">
              {kasirWaiting > 0
                ? `${kasirWaiting} antrian menunggu`
                : kasirData
                ? "Semua sudah dipanggil"
                : "Satpam belum buat tiket"}
            </p>
          </div>
        </div>

        {/* Panel video — YouTube 16:9 */}
        <div className="relative w-full lg:w-1/2 lg:aspect-video rounded-2xl overflow-hidden shadow-xl bg-black flex items-center justify-center">
          {currentVideo ? (
            <video
              ref={videoRef}
              key={videoIndex}
              src={`${getUploadsUrl()}/uploads/video/${currentVideo.filename}`}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
              onEnded={handleVideoEnd}
              onCanPlay={handleCanPlay}
              style={{ pointerEvents: "none" }}
            />
          ) : (
            <div className="text-white text-center p-4">
              {videoList.length === 0 ? "Belum ada video promosi" : "Memuat video..."}
            </div>
          )}
        </div>
      </div>

      {/* Harga Emas */}
      <div className="bg-white rounded-2xl mx-6 mb-6 p-6 shadow-xl">
        <h2 className="text-3xl font-bold text-yellow-700 mb-4 text-center">
          💰 Harga Emas Galeri 24
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border text-center text-2xl">
            <thead className="bg-yellow-100">
              <tr>
                <th className="border px-6 py-4">Berat</th>
                <th className="border px-6 py-4">Harga Beli</th>
                <th className="border px-6 py-4">Buyback</th>
              </tr>
            </thead>
            <tbody>
              {hargaEmas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="border p-6 text-gray-400 text-lg">
                    Belum ada data harga emas
                  </td>
                </tr>
              ) : (
                hargaEmas.map((item, idx) => (
                  <tr key={idx} className="hover:bg-yellow-50">
                    <td className="border px-6 py-4 font-semibold">{item.berat}</td>
                    <td className="border px-6 py-4">Rp {Number(item.beli).toLocaleString("id-ID")}</td>
                    <td className="border px-6 py-4">Rp {Number(item.buyback).toLocaleString("id-ID")}</td>
                  </tr>
                ))
              )}
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
