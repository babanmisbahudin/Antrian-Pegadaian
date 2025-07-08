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
    nik: "", nama: "", password: "", role: "kasir", loket: "", cabang: "", outlet: ""
  });
  const [lastKasir, setLastKasir] = useState(0);
  const [lastPenaksir, setLastPenaksir] = useState(0);
  const [videoList, setVideoList] = useState([]);
  const [newVideo, setNewVideo] = useState("");
  const [hargaEmas, setHargaEmas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get("/users");
        setUsers(userRes.data);

        const queueRes = await api.get("/queue");
        setLastKasir(queueRes.data.lastKasir);
        setLastPenaksir(queueRes.data.lastPenaksir);

        const videoRes = await api.get("/videos");
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
    setForm({ nik: "", nama: "", password: "", role: "kasir", loket: "", cabang: "", outlet: "" });
    setEditingIndex(null);
  };

  const handleAddOrUpdateUser = async (e) => {
    e.preventDefault();
    const { nik, nama, password, role, loket, cabang, outlet } = form;

    if (!nik || !nama || (!password && editingIndex === null) || !cabang || !outlet) {
      return alert("Lengkapi semua data!");
    }

    if (role !== "satpam" && !loket.trim()) return alert("Masukkan nomor loket!");

    try {
      if (editingIndex !== null) {
        const userId = users[editingIndex]._id;
        const res = await api.put(`/users/${userId}`, { nik, nama, role, loket, cabang, outlet });
        const updated = [...users];
        updated[editingIndex] = res.data;
        setUsers(updated);
        alert("User berhasil diperbarui");
      } else {
        const res = await api.post("/users/register", { nik, nama, password, role, loket, cabang, outlet });
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
      loket: user.loket || "",
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

  const resetAntrian = async () => {
    if (!confirm("Reset semua nomor antrian?")) return;
    try {
      const res = await api.post("/queue/reset");
      setLastKasir(res.data.queue.lastKasir);
      setLastPenaksir(res.data.queue.lastPenaksir);
      alert("Nomor antrian berhasil direset.");
    } catch (err) {
      console.error(err);
      alert("Gagal reset antrian");
    }
  };

  const handleAddVideo = async () => {
    if (!newVideo.trim()) return alert("Masukkan link YouTube!");
    let embedUrl = "";
    if (newVideo.includes("embed")) {
      embedUrl = newVideo;
    } else if (newVideo.includes("watch?v=")) {
      embedUrl = newVideo.replace("watch?v=", "embed/");
    } else if (newVideo.includes("youtu.be/")) {
      const id = newVideo.split("youtu.be/")[1];
      embedUrl = `https://www.youtube.com/embed/${id}`;
    } else {
      return alert("Link YouTube tidak valid!");
    }

    try {
      const res = await api.post("/videos", { url: embedUrl });
      setVideoList([...videoList, res.data]);
      setNewVideo("");
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan video");
    }
  };

  const handleDeleteVideo = async (index) => {
    if (!confirm("Hapus video ini?")) return;
    const id = videoList[index]._id;
    try {
      await api.delete(`/videos/${id}`);
      const updated = [...videoList];
      updated.splice(index, 1);
      setVideoList(updated);
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus video");
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
    // Cek apakah ini data baru atau update
    if (item._id) {
      const res = await api.put(`/harga-emas/${item._id}`, item);
      const updated = [...hargaEmas];
      updated[index] = res.data;
      setHargaEmas(updated);
    } else {
      const res = await api.post("/harga-emas", item);
      const updated = [...hargaEmas];
      updated[index] = res.data;
      setHargaEmas(updated);
    }
    alert("Harga emas berhasil disimpan.");
  } catch (err) {
    console.error(err);
    alert("Gagal simpan harga emas.");
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
    nik: "EPS45359", nama: "Admin Utama", role: "admin", cabang: "Majalengka", outlet: "Pusat", loket: "0"
  };

  return (
  <div className="min-h-screen bg-gray-50 p-4 text-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-green-700">Dashboard Admin</h1>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-green-600 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-green-700"
          >☰</button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md z-50 w-48">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  setShowProfileModal(true);
                }}
                className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
              >✏️ Edit Profil</button>
              <button
                onClick={() => {
                  localStorage.removeItem("isLoggedIn");
                  navigate("/login");
                }}
                className="block px-4 py-2 hover:bg-gray-100 w-full text-left text-red-600"
              >🚪 Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit Profil */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
            <h2 className="text-lg font-bold mb-4">Edit Profil Admin</h2>
            <form className="flex flex-col gap-2">
              <input value={userProfile.nik} readOnly className="border p-2 rounded bg-gray-100" />
              <input value={userProfile.nama} readOnly className="border p-2 rounded bg-gray-100" />
              <input value={userProfile.role} readOnly className="border p-2 rounded bg-gray-100" />
              <input value={userProfile.cabang} readOnly className="border p-2 rounded bg-gray-100" />
              <input value={userProfile.outlet} readOnly className="border p-2 rounded bg-gray-100" />
              <input value={userProfile.loket} readOnly className="border p-2 rounded bg-gray-100" />
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="text-gray-600 hover:underline"
                >Tutup</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* TABEL USER */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">Kelola User</h2>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-green-600 text-white px-3 py-1 rounded">Tambah User</button>
        </div>
        <table className="w-full border text-center">
          <thead className="bg-green-100">
            <tr><th>NIK</th><th>Nama</th><th>Role</th><th>Loket</th><th>Cabang</th><th>Outlet</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr key={i} className="border">
                <td>{user.nik}</td>
                <td>{user.nama}</td>
                <td>{user.role}</td>
                <td>{user.role === "satpam" ? "-" : user.loket}</td>
                <td>{user.cabang}</td>
                <td>{user.outlet}</td>
                <td>
                  <button onClick={() => handleEditUser(i)} className="text-blue-600 mr-2 hover:underline">Edit</button>
                  <button onClick={() => handleDeleteUser(i)} className="text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL TAMBAH/EDIT USER */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl p-4 w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-semibold mb-2">{editingIndex !== null ? "Edit User" : "Tambah User"}</h3>
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
              {form.role !== "satpam" && (
                <input name="loket" value={form.loket} onChange={handleChange} placeholder="Loket" className="border p-2 rounded" />
              )}
              <div className="flex justify-between mt-2">
                <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded">Simpan</button>
                <button type="button" onClick={() => { resetForm(); setShowModal(false); }} className="text-gray-500 hover:underline">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET ANTRIAN */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-red-700 mb-4">🔁 Reset Nomor Antrian</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="border p-4 rounded-lg bg-red-50">
            <p>Nomor Terakhir Kasir:</p>
            <p className="text-2xl font-bold text-red-600">{lastKasir}</p>
          </div>
          <div className="border p-4 rounded-lg bg-red-50">
            <p>Nomor Terakhir Penaksir:</p>
            <p className="text-2xl font-bold text-red-600">{lastPenaksir}</p>
          </div>
        </div>
        <p>Total antrian terpakai: <strong>{lastKasir + lastPenaksir}</strong></p>
        <button onClick={resetAntrian} className="mt-3 bg-red-600 text-white px-4 py-2 rounded">Reset Sekarang</button>
      </div>

      {/* VIDEO PROMOSI */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="font-semibold mb-2">Daftar Video Promosi</h2>
        <div className="flex gap-2 mb-4">
          <input type="text" value={newVideo} onChange={(e) => setNewVideo(e.target.value)} className="border p-2 rounded w-full" placeholder="Link YouTube (otomatis diubah ke embed)" />
          <button onClick={handleAddVideo} className="bg-blue-600 text-white px-3 py-1 rounded">Tambah</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {videoList.map((url, i) => (
            <div key={i} className="border rounded overflow-hidden shadow">
              <iframe src={url.url} title={`video-${i}`} className="w-full aspect-video" allowFullScreen />
              <button onClick={() => handleDeleteVideo(i)} className="w-full text-sm text-red-600 py-1 hover:underline">Hapus</button>
            </div>
          ))}
        </div>
      </div>

      {/* HARGA EMAS */}
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
              <button
                onClick={() => handleSaveHarga(i)}
                className="bg-green-600 text-white text-sm px-2 py-1 rounded hover:bg-green-700"
              >
                💾 Simpan
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
