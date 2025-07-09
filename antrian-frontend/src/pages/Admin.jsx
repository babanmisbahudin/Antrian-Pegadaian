import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Admin() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    nik: "", nama: "", password: "", role: "kasir", cabang: "", outlet: ""
  });
  const [logAktivitas, setLogAktivitas] = useState([]);
  const [lastKasir, setLastKasir] = useState(0);
  const [lastPenaksir, setLastPenaksir] = useState(0);
  const [hargaEmas, setHargaEmas] = useState([]);
  const [videoList, setVideoList] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get("/users");
        setUsers(userRes.data);

        const queueRes = await api.get("/queue");
        setLastKasir(queueRes.data.lastKasir);
        setLastPenaksir(queueRes.data.lastPenaksir);

        const videoRes = await api.get("/video");
        setVideoList(videoRes.data);

        const hargaRes = await api.get("/harga-emas");
        setHargaEmas(hargaRes.data);
      } catch (err) {
        console.error("Gagal ambil data:", err);
        alert("Gagal mengambil data dari server.");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ nik: "", nama: "", password: "", role: "kasir", cabang: "", outlet: "" });
    setEditingIndex(null);
  };

  const handleAddOrUpdateUser = async (e) => {
    e.preventDefault();
    const { nik, nama, password, role, cabang, outlet } = form;

    if (!nik || !nama || (!password && editingIndex === null) || !cabang || !outlet) {
      return alert("Lengkapi semua data!");
    }

    try {
      if (editingIndex !== null) {
        const userId = users[editingIndex]._id;
        const res = await api.put(`/users/${userId}`, { nik, nama, role, cabang, outlet });
        const updated = [...users];
        updated[editingIndex] = res.data;
        setUsers(updated);
        alert("User berhasil diperbarui");
      } else {
        const res = await api.post("/users/register", { nik, nama, password, role, cabang, outlet });
        setUsers([...users, res.data]);
        alert("User berhasil ditambahkan");
      }
      resetForm();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Terjadi kesalahan";
      alert(msg);
    }
  };

  const handleEditUser = (index) => {
    const user = users[index];
    setForm({
      nik: user.nik,
      nama: user.nama,
      role: user.role,
      cabang: user.cabang || "",
      outlet: user.outlet || "",
      password: ""
    });
    setEditingIndex(index);
    setShowModal(true);
  };

  const handleDeleteUser = async (index) => {
    if (!confirm("Hapus user ini?")) return;
    const userId = users[index]._id;
    try {
      await api.delete(`/users/${userId}`);
      const updated = [...users];
      updated.splice(index, 1);
      setUsers(updated);
      alert("User berhasil dihapus");
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus user");
    }
  };

  const fetchStatistik = async () => {
    try {
      const res = await api.get("/antrian/statistik");
      setLastKasir(res.data.lastKasir || 0);
      setLastPenaksir(res.data.lastPenaksir || 0);
    } catch (err) {
      console.error("Gagal ambil statistik:", err);
    }
  };

  const fetchLogAktivitas = async () => {
    try {
      const res = await api.get("/log");
      setLogAktivitas(res.data);
    } catch (err) {
      console.error("Gagal ambil log aktivitas:", err);
    }
  };

  const resetAntrian = async () => {
    const konfirmasi = confirm("Yakin ingin reset seluruh nomor antrian?");
    if (!konfirmasi) return;

    try {
      await api.post("/antrian/reset");
      alert("Nomor antrian berhasil direset.");
      fetchStatistik();
      fetchLogAktivitas();
    } catch (err) {
      console.error("Gagal reset antrian:", err);
      alert("Gagal reset antrian.");
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await api.get("/video");
      setVideoList(res.data);
    } catch (err) {
      console.error("Gagal ambil video:", err);
    }
  };

  const handleDeleteVideo = async (id) => {
    try {
      await api.delete(`/video/${id}`);
      setVideoList((prev) => prev.filter((v) => v._id !== id));
    } catch (err) {
      console.error("Gagal hapus video:", err);
    }
  };

  const handleUpload = async () => {
  if (!selectedVideo) return;
  const formData = new FormData();
  formData.append("video", selectedVideo);

  try {
    await api.post("/video/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setSelectedVideo(null);
    fetchVideos(); // Refresh list
  } catch (err) {
    console.error("Gagal upload video:", err);
  }
  };

  const handleHargaChange = (index, field, value) => {
  const updated = [...hargaEmas];
  updated[index] = { ...updated[index], [field]: value };
  setHargaEmas(updated);
  };

  const handleAddHarga = () => {
  // Tambahkan baris kosong ke state saja, tanpa kirim ke backend
  setHargaEmas([...hargaEmas, { berat: "", beli: 0, buyback: 0 }]);
  };

  const handleUpdateHarga = async (index) => {
  const item = hargaEmas[index];
  try {
    const res = await api.put(`/harga-emas/${item._id}`, item);
    const updated = [...hargaEmas];
    updated[index] = res.data;
    setHargaEmas(updated);
    alert("Data berhasil disimpan");
  } catch (err) {
    console.error("Gagal update harga emas:", err);
    alert("Gagal update data");
  }
  };

  const handleSaveHarga = async (index) => {
  const item = hargaEmas[index];

  if (!item.berat || isNaN(item.beli) || isNaN(item.buyback)) {
    return alert("Lengkapi semua kolom dengan benar!");
  }

  try {
    let res;

    if (item._id) {
      res = await api.put(`/harga-emas/${item._id}`, item);
    } else {
      res = await api.post("/harga-emas", item);
    }

    const updated = [...hargaEmas];
    updated[index] = res.data; // GANTI DENGAN HASIL YANG MENGANDUNG _id
    setHargaEmas(updated);

    alert("Harga emas berhasil disimpan.");
  } catch (err) {
    console.error(err);
    alert("Gagal simpan harga emas.");
  }
  };

  const handleDeleteHarga = async (index) => {
  const item = hargaEmas[index];

  // Jika belum tersimpan di database (belum punya _id), cukup hapus dari state
  if (!item._id) {
    const updated = [...hargaEmas];
    updated.splice(index, 1);
    setHargaEmas(updated);
    return;
  }

  // Jika sudah punya _id, hapus dari database
  if (!confirm("Yakin ingin hapus data ini?")) return;

  try {
    await api.delete(`/harga-emas/${item._id}`);
    const updated = [...hargaEmas];
    updated.splice(index, 1);
    setHargaEmas(updated);
    alert("Data berhasil dihapus");
  } catch (err) {
    console.error("Gagal hapus data harga emas:", err);
    alert("Gagal hapus data harga emas");
  }
  };

  const formatRupiah = (angka) => {
  const numberString = angka.toString().replace(/[^,\d]/g, "");
  const split = numberString.split(",");
  let sisa = split[0].length % 3;
  let rupiah = split[0].substr(0, sisa);
  const ribuan = split[0].substr(sisa).match(/\d{3}/g);

  if (ribuan) {
    rupiah += (sisa ? "." : "") + ribuan.join(".");
  }

  return "Rp " + rupiah + (split[1] ? "," + split[1] : "");
  };

  const parseRupiah = (str) => {
  return Number(str.replace(/[^0-9]/g, ""));
};

  const userProfile = users.find(u => u.role === "admin") || {
    nik: "EPS45359", nama: "Admin Utama", role: "admin", cabang: "Majalengka", outlet: "Pusat"
  };

  return (
  <div className="min-h-screen bg-gray-50 p-4 text-sm">
    {/* ==== HEADER ==== */}
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-xl font-bold text-green-700">Dashboard Admin</h1>
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="bg-green-600 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-green-700"
        >
          ☰
        </button>
        {showDropdown && (
          <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md z-50 w-48">
            <button
              onClick={() => {
                setShowDropdown(false);
                setShowProfileModal(true);
              }}
              className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
            >
              ✏️ Edit Profil
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("isLoggedIn");
                navigate("/login");
              }}
              className="block px-4 py-2 hover:bg-gray-100 w-full text-left text-red-600"
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </div>

    {/* ==== MODAL PROFIL ==== */}
    {showProfileModal && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
          <h2 className="text-lg font-bold mb-4">Edit Profil Admin</h2>
          <form className="flex flex-col gap-2">
            {["nik", "nama", "role", "cabang", "outlet"].map((field) => (
              <input
                key={field}
                value={userProfile[field]}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />
            ))}
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="text-gray-600 hover:underline"
              >
                Tutup
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* ==== TABEL USER ==== */}
    <div className="bg-white p-4 rounded-lg shadow mb-8">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold">Kelola User</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          Tambah User
        </button>
      </div>
      <table className="w-full border text-center">
        <thead className="bg-green-100">
          <tr>
            <th>NIK</th>
            <th>Nama</th>
            <th>Role</th>
            <th>Cabang</th>
            <th>Outlet</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => (
            <tr key={i} className="border">
              <td>{user.nik}</td>
              <td>{user.nama}</td>
              <td>{user.role}</td>
              <td>{user.cabang}</td>
              <td>{user.outlet}</td>
              <td>
                <button
                  onClick={() => handleEditUser(i)}
                  className="text-blue-600 mr-2 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteUser(i)}
                  className="text-red-600 hover:underline"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* ==== MODAL USER ==== */}
    {showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-xl p-4 w-full max-w-sm shadow-lg">
          <h3 className="text-lg font-semibold mb-2">
            {editingIndex !== null ? "Edit User" : "Tambah User"}
          </h3>
          <form onSubmit={handleAddOrUpdateUser} className="flex flex-col gap-2">
            <input name="nama" value={form.nama} onChange={handleChange} placeholder="Nama" className="border p-2 rounded" />
            <input name="nik" value={form.nik} onChange={handleChange} placeholder="NIK" className="border p-2 rounded" />
            <input name="cabang" value={form.cabang} onChange={handleChange} placeholder="Cabang" className="border p-2 rounded" />
            <input name="outlet" value={form.outlet} onChange={handleChange} placeholder="Outlet" className="border p-2 rounded" />
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" className="border p-2 rounded" />
            <select name="role" value={form.role} onChange={handleChange} className="border p-2 rounded">
              <option value="kasir">Kasir</option>
              <option value="penaksir">Penaksir</option>
              <option value="satpam">Satpam</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex justify-between mt-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded">Simpan</button>
              <button type="button" onClick={() => { resetForm(); setShowModal(false); }} className="text-gray-500 hover:underline">Batal</button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* ==== STATISTIK & LOG ==== */}
    <div className="bg-white rounded-xl shadow p-6 mb-8">
      <h2 className="text-lg font-semibold text-blue-700 mb-4">📊 Statistik & Log Aktivitas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border p-4 rounded-lg bg-blue-50">
          <p>Total Nomor Terakhir Kasir:</p>
          <p className="text-2xl font-bold text-blue-600">{lastKasir}</p>
        </div>
        <div className="border p-4 rounded-lg bg-blue-50">
          <p>Total Nomor Terakhir Penaksir:</p>
          <p className="text-2xl font-bold text-blue-600">{lastPenaksir}</p>
        </div>
      </div>
      <p className="mt-4">
        Total antrian terpakai: <strong>{lastKasir + lastPenaksir}</strong>
      </p>
      <button onClick={resetAntrian} className="mt-3 bg-blue-600 text-white px-4 py-2 rounded">
        Reset Sekarang
      </button>

      <div className="mt-6">
        <h3 className="text-md font-semibold text-gray-700 mb-2">📁 Log Aktivitas Pemanggilan</h3>
        {logAktivitas.length > 0 ? (
          <table className="w-full border text-xs text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Waktu</th>
                <th className="p-2">User</th>
                <th className="p-2">Nomor</th>
                <th className="p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {logAktivitas.map((log, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{new Date(log.waktu).toLocaleString()}</td>
                  <td className="p-2">{log.user}</td>
                  <td className="p-2">{log.nomor}</td>
                  <td className="p-2">{log.aksi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500">Belum ada aktivitas tercatat.</p>
        )}
      </div>
    </div>

    {/* ==== VIDEO PROMOSI ==== */}
    <div className="bg-white p-4 rounded-xl shadow-xl mb-8">
      <h2 className="text-lg font-bold text-gray-800 mb-4">📺 Daftar Video Promosi</h2>
      {videoList.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {videoList.map((video) => (
            <div key={video._id} className="bg-black rounded-xl overflow-hidden shadow relative">
              <video
                src={`http://localhost:5000/uploads/video/${video.filename}`}
                className="w-full h-40 object-cover"
                muted
              />
              <button
                onClick={() => handleDeleteVideo(video._id)}
                className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Belum ada video yang diupload.</p>
      )}
      <div className="mt-4 flex items-center gap-2">
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setSelectedVideo(e.target.files[0])}
          className="text-sm"
        />
        <button
          onClick={handleUpload}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Upload
        </button>
      </div>
    </div>

    {/* ==== HARGA EMAS ==== */}
    <div className="bg-white p-4 rounded-lg shadow mb-8">
      <h2 className="font-semibold mb-2">Harga Emas</h2>
      <table className="w-full border text-center text-sm mb-2">
        <thead className="bg-yellow-100">
          <tr>
            <th>Berat</th>
            <th>Harga Beli</th>
            <th>Buyback</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {hargaEmas.map((item, i) => (
            <tr key={i}>
              <td>
                <input
                  type="text"
                  value={item.berat}
                  onChange={(e) => handleHargaChange(i, "berat", e.target.value)}
                  className="w-full p-1 border rounded"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={formatRupiah(item.beli)}
                  onChange={(e) => handleHargaChange(i, "beli", parseRupiah(e.target.value))}
                  className="w-full p-1 border rounded"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={formatRupiah(item.buyback)}
                  onChange={(e) => handleHargaChange(i, "buyback", parseRupiah(e.target.value))}
                  className="w-full p-1 border rounded"
                />
              </td>
              <td>
                <button onClick={() => handleSaveHarga(i)} className="text-black text-sm px-2 py-1 rounded hover:bg-yellow-100 mr-2">
                  💾 Simpan
                </button>
                <button onClick={() => handleDeleteHarga(i)} className="text-black text-sm px-2 py-1 rounded hover:bg-yellow-100">
                  🗑️ Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={handleAddHarga}
        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
      >
        Tambah Baris
      </button>
    </div>
  </div>
);}
