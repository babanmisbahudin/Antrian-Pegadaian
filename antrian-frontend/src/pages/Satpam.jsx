import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

// ─── ESC/POS helper ───────────────────────────────────────────────────────────
const E = {
  INIT:         [0x1B, 0x40],
  CENTER:       [0x1B, 0x61, 0x01],
  LEFT:         [0x1B, 0x61, 0x00],
  BOLD_ON:      [0x1B, 0x45, 0x01],
  BOLD_OFF:     [0x1B, 0x45, 0x00],
  SIZE_2X:      [0x1D, 0x21, 0x11], // double width + height
  SIZE_NORMAL:  [0x1D, 0x21, 0x00],
  LF:           [0x0A],
  FEED:         [0x1B, 0x64, 0x04], // feed 4 lines
  CUT:          [0x1D, 0x56, 0x41, 0x10],
};

function buildEscPos(ticket) {
  const enc = new TextEncoder();
  const SEP = "--------------------------------\n";
  const center = (s, w = 32) => {
    const pad = Math.max(0, Math.floor((w - s.length) / 2));
    return " ".repeat(pad) + s + "\n";
  };

  const parts = [
    E.INIT,
    E.CENTER,
    E.BOLD_ON,
    enc.encode("PEGADAIAN\n"),
    enc.encode("CABANG MAJALENGKA\n"),
    E.BOLD_OFF,
    enc.encode("JL KH Abdul Halim No 266\n"),
    enc.encode("Majalengka\n"),
    E.LF,
    enc.encode(SEP),
    E.LF,
    enc.encode("NOMOR ANTRIAN\n"),
    E.LF,
    E.SIZE_2X,
    E.BOLD_ON,
    enc.encode(ticket.nomor + "\n"),
    E.BOLD_OFF,
    E.SIZE_NORMAL,
    E.LF,
    enc.encode(`Layanan: ${ticket.role === "kasir" ? "Kasir" : "Penaksir"}\n`),
    enc.encode(`Tgl: ${ticket.tgl}\n`),
    E.LF,
    enc.encode(SEP),
    enc.encode("Harap menunggu panggilan\n"),
    E.FEED,
    E.CUT,
  ];

  const total = parts.reduce((n, p) => n + p.length, 0);
  const buf = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    buf.set(p, off);
    off += p.length;
  }
  return buf;
}

// ─── Bluetooth printer service UUIDs (BLE thermal printers) ──────────────────
const BT_SERVICES = [
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2", // common Chinese thermal (MPT-II, etc.)
  "49535343-fe7d-4ae5-8fa9-9fafd205e455", // ISSC transparent
  "6e400001-b5a3-f393-e0a9-e50e24dcca9e", // Nordic UART
  "000018f0-0000-1000-8000-00805f9b34fb", // generic serial
];

async function findWriteChar(server) {
  for (const svc of BT_SERVICES) {
    try {
      const service = await server.getPrimaryService(svc);
      const chars = await service.getCharacteristics();
      const writable = chars.find(
        (c) => c.properties.write || c.properties.writeWithoutResponse
      );
      if (writable) return writable;
    } catch {
      continue;
    }
  }
  return null;
}

async function sendChunked(char, data) {
  const CHUNK = 100;
  for (let i = 0; i < data.length; i += CHUNK) {
    const chunk = data.slice(i, Math.min(i + CHUNK, data.length));
    if (char.properties.writeWithoutResponse) {
      await char.writeValueWithoutResponse(chunk);
    } else {
      await char.writeValue(chunk);
    }
    await new Promise((r) => setTimeout(r, 30));
  }
}

// ─── Print style for window.print() fallback ─────────────────────────────────
const PRINT_STYLE = `
  #ticket-print { display: none; }

  @media print {
    @page { size: 58mm auto; margin: 2mm; }
    body { visibility: hidden; }
    #ticket-print {
      display: block !important;
      visibility: visible;
      position: fixed;
      left: 0;
      top: 0;
      width: 54mm;
    }
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────
export default function Satpam() {
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ kasir: null, penaksir: null });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.role || !["satpam", "admin"].includes(user.role.toLowerCase())) {
      alert("Silakan login sebagai Satpam terlebih dahulu.");
      navigate("/login");
    }
  }, [navigate]);

  // Bluetooth state
  const [btSupported] = useState(() => !!navigator.bluetooth);
  const [btConnected, setBtConnected] = useState(false);
  const [btDeviceName, setBtDeviceName] = useState("");
  const [btConnecting, setBtConnecting] = useState(false);
  const [showPrinterSettings, setShowPrinterSettings] = useState(false);
  const btCharRef = useRef(null);
  const btDeviceRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    try {
      const [k, p] = await Promise.all([
        api.get("/antrian/kasir/status"),
        api.get("/antrian/penaksir/status"),
      ]);
      setStatus({ kasir: k.data, penaksir: p.data });
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 5000);
    return () => clearInterval(id);
  }, [fetchStatus]);

  // ── Bluetooth connect ────────────────────────────────────────────────────────
  const handleBtConnect = async () => {
    if (!btSupported) return;
    setBtConnecting(true);
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: BT_SERVICES,
      });

      const server = await device.gatt.connect();
      const char = await findWriteChar(server);

      if (!char) {
        alert(
          "Printer terhubung tapi layanan cetak tidak ditemukan.\n" +
          "Pastikan printer MPT-II Mini dalam mode BLE."
        );
        await device.gatt.disconnect();
        return;
      }

      btCharRef.current = char;
      btDeviceRef.current = device;
      setBtDeviceName(device.name || "Printer Bluetooth");
      setBtConnected(true);

      device.addEventListener("gattserverdisconnected", () => {
        btCharRef.current = null;
        setBtConnected(false);
        setBtDeviceName("");
      });
    } catch (err) {
      if (err.name !== "NotFoundError") {
        alert("Gagal hubungkan printer: " + err.message);
      }
    } finally {
      setBtConnecting(false);
    }
  };

  const handleBtDisconnect = () => {
    if (btDeviceRef.current?.gatt?.connected) {
      btDeviceRef.current.gatt.disconnect();
    }
    btCharRef.current = null;
    btDeviceRef.current = null;
    setBtConnected(false);
    setBtDeviceName("");
  };

  // ── Print ────────────────────────────────────────────────────────────────────
  const doPrint = useCallback(
    async (t) => {
      if (btConnected && btCharRef.current) {
        try {
          const bytes = buildEscPos(t);
          await sendChunked(btCharRef.current, bytes);
          return;
        } catch (err) {
          console.error("Bluetooth print error:", err);
          alert("Gagal cetak via Bluetooth, menggunakan printer sistem.");
        }
      }
      // fallback ke window.print()
      setTimeout(() => window.print(), 300);
    },
    [btConnected]
  );

  // ── Ambil antrian ────────────────────────────────────────────────────────────
  const handleAmbil = async (role) => {
    setLoading(true);
    try {
      const res = await api.post(`/antrian/${role}/next`);
      const tgl = new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const t = { nomor: res.data.nomor, role, tgl };
      setTicket(t);
      await fetchStatus();
      await doPrint(t);
    } catch (err) {
      alert("Gagal: " + (err?.response?.data?.message || "Terjadi kesalahan."));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (role) => {
    const label = role === "kasir" ? "Kasir" : "Penaksir";
    if (!confirm(`Reset semua antrian ${label} hari ini?`)) return;
    try {
      await api.delete(`/antrian/${role}/reset`);
      setTicket(null);
      await fetchStatus();
      alert(`Antrian ${label} berhasil direset.`);
    } catch (err) {
      alert("Gagal reset: " + (err?.response?.data?.message || "Coba lagi."));
    }
  };

  const roleLabel = { kasir: "Kasir", penaksir: "Penaksir" };

  return (
    <>
      <style>{PRINT_STYLE}</style>

      {/* ===== TAMPILAN LAYAR ===== */}
      <div className="min-h-screen bg-blue-50 p-4 flex flex-col items-center gap-4">

        {/* ── Card Utama ── */}
        <div className="bg-white shadow-xl rounded-xl w-full max-w-lg p-6">
          <div className="flex flex-col items-center mb-4">
            <img src="/images/logo.png" alt="Pegadaian" className="h-14 object-contain mb-2" />
            <h1 className="text-xl font-bold text-green-800">Cabang Majalengka</h1>
            <p className="text-xs text-gray-500">Dashboard Satpam</p>
          </div>

          {/* Status cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {["kasir", "penaksir"].map((role) => {
              const s = status[role];
              return (
                <div
                  key={role}
                  className={`rounded-xl p-4 text-center border-2 ${
                    role === "kasir"
                      ? "border-blue-300 bg-blue-50"
                      : "border-green-300 bg-green-50"
                  }`}
                >
                  <p className="font-semibold text-gray-700 mb-1 capitalize">
                    {roleLabel[role]}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {s ? s.waiting : "—"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">antrian menunggu</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Terakhir:{" "}
                    <span className="font-semibold">{s?.lastNomor || "—"}</span>
                  </p>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {["kasir", "penaksir"].map((role) => (
              <div key={role} className="flex gap-2">
                <button
                  onClick={() => handleAmbil(role)}
                  disabled={loading}
                  className={`flex-1 py-3 rounded-xl font-bold text-white text-sm shadow transition ${
                    role === "kasir"
                      ? "bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      : "bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  }`}
                >
                  {loading ? "Memproses..." : `Cetak Antrian ${roleLabel[role]}`}
                </button>
                <button
                  onClick={() => handleReset(role)}
                  className="px-4 py-3 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-sm shadow transition"
                >
                  Reset
                </button>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center mt-5">
            Antrian otomatis reset setiap hari
          </p>
        </div>

        {/* ── Pengaturan Printer Bluetooth ── */}
        <div className="bg-white shadow-xl rounded-xl w-full max-w-lg overflow-hidden">
          {/* Header toggle */}
          <button
            onClick={() => setShowPrinterSettings((v) => !v)}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🖨️</span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  Pengaturan Printer Bluetooth
                </p>
                <p className="text-xs text-gray-500">
                  {btConnected
                    ? `Terhubung: ${btDeviceName}`
                    : "Belum terhubung"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {btConnected && (
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              )}
              <span className="text-gray-400 text-sm">
                {showPrinterSettings ? "▲" : "▼"}
              </span>
            </div>
          </button>

          {showPrinterSettings && (
            <div className="px-6 pb-6 border-t border-gray-100">
              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 mb-4 text-xs text-blue-800">
                <p className="font-semibold mb-1">MPT-II Mini — Cara pakai:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>Nyalakan printer, aktifkan Bluetooth BLE</li>
                  <li>Klik <strong>Hubungkan Printer</strong> di bawah</li>
                  <li>Pilih <strong>MPT-II</strong> atau nama printer dari daftar</li>
                  <li>Setelah terhubung, tombol Cetak langsung kirim ke printer</li>
                </ol>
                {!btSupported && (
                  <p className="mt-2 text-red-700 font-semibold">
                    ⚠️ Browser ini tidak mendukung Web Bluetooth. Gunakan Chrome/Edge di Android atau desktop.
                  </p>
                )}
              </div>

              {/* Status */}
              <div
                className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg text-sm font-medium ${
                  btConnected
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-gray-50 text-gray-500 border border-gray-200"
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    btConnected ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                {btConnected
                  ? `Terhubung ke "${btDeviceName}"`
                  : "Printer belum terhubung — akan gunakan printer sistem"}
              </div>

              {/* Tombol */}
              <div className="flex gap-3">
                {!btConnected ? (
                  <button
                    onClick={handleBtConnect}
                    disabled={!btSupported || btConnecting}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm transition"
                  >
                    {btConnecting ? "Mencari printer..." : "Hubungkan Printer"}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={async () => {
                        if (!ticket) return alert("Belum ada tiket untuk dicetak ulang.");
                        await doPrint(ticket);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition"
                    >
                      Cetak Ulang Terakhir
                    </button>
                    <button
                      onClick={handleBtDisconnect}
                      className="px-4 py-2.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-sm transition"
                    >
                      Putuskan
                    </button>
                  </>
                )}
              </div>

              <p className="text-xs text-gray-400 text-center mt-3">
                Jika printer tidak muncul, pastikan BLE aktif dan printer dalam jangkauan
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ===== STRUK CETAK — fallback window.print() ===== */}
      <div id="ticket-print">
        {ticket && (
          <div
            style={{
              width: "54mm",
              fontFamily: "monospace",
              fontSize: "10px",
              padding: "2mm",
              textAlign: "center",
            }}
          >
            <div style={{ borderBottom: "1px dashed #000", paddingBottom: "4px", marginBottom: "4px" }}>
              <div style={{ fontSize: "12px", fontWeight: "bold" }}>PEGADAIAN</div>
              <div style={{ fontWeight: "bold" }}>CABANG MAJALENGKA</div>
              <div style={{ fontSize: "9px" }}>JL KH Abdul Halim No 266</div>
              <div style={{ fontSize: "9px" }}>Majalengka</div>
            </div>

            <div style={{ margin: "6px 0" }}>
              <div style={{ fontSize: "9px", marginBottom: "2px" }}>NOMOR ANTRIAN</div>
              <div style={{ fontSize: "38px", fontWeight: "bold", lineHeight: 1.1 }}>
                {ticket.nomor}
              </div>
              <div style={{ fontSize: "10px", marginTop: "4px" }}>
                Layanan:{" "}
                <strong>{ticket.role === "kasir" ? "Kasir" : "Penaksir"}</strong>
              </div>
            </div>

            <div style={{ borderTop: "1px dashed #000", paddingTop: "4px", marginTop: "4px" }}>
              <div style={{ fontSize: "9px" }}>Tgl: {ticket.tgl}</div>
              <div style={{ fontSize: "9px", marginTop: "2px" }}>
                Harap menunggu panggilan
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
