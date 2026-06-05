/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function Users() {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "manager", // Mapping backend roles
  });

  const fetchUsers = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_FASTAPI || "http://localhost:8090";
      const token = localStorage.getItem("token") || "";
      const response = await fetch(`${apiUrl}/api/users/?page_size=100`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.items || []);
      } else {
        const err = await response.json();
        alert("Gagal memuat data pengguna: " + (err.detail || "Pastikan Anda login sebagai Admin."));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Terjadi kesalahan jaringan saat mengambil data pengguna.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!form.username || !form.password) {
      alert("Silakan isi Username dan Password");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_FASTAPI || "http://localhost:8090";
      const token = localStorage.getItem("token") || "";
      const response = await fetch(`${apiUrl}/api/users/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          role: form.role
        })
      });

      if (response.ok) {
        await fetchUsers();
        setForm({ username: "", email: "", password: "", role: "manager" });
        setShowModal(false);
      } else {
        const err = await response.json();
        alert(err.detail || "Gagal menambahkan user");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!form.username) {
      alert("Username tidak boleh kosong");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_FASTAPI || "http://localhost:8090";
      const token = localStorage.getItem("token") || "";
      const payload = {
        username: form.username,
        email: form.email,
        role: form.role
      };
      if (form.password) {
        payload.password = form.password; // optional on update
      }

      const response = await fetch(`${apiUrl}/api/users/${editingUser.id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchUsers();
        setShowModal(false);
        setEditingUser(null);
        alert("User berhasil diupdate!");
      } else {
        const err = await response.json();
        alert(err.detail || "Gagal mengupdate user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus user ini?")) return;

    try {
      const apiUrl = import.meta.env.VITE_API_FASTAPI || "http://localhost:8090";
      const token = localStorage.getItem("token") || "";
      const response = await fetch(`${apiUrl}/api/users/${id}/`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok || response.status === 204) {
        await fetchUsers();
      } else {
        const err = await response.json();
        alert(err.detail || "Gagal menghapus user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleExport = () => {
    if (!users || users.length === 0) {
      alert("Tidak ada data pengguna untuk diekspor.");
      return;
    }

    const headers = "ID,Username,Email,Role\n";
    const csvRows = users.map(user => {
      return `"${user.id}","${user.username}","${user.email || ""}","${user.role}"`;
    });
    
    const csvString = headers + csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Data_Pengguna_K3.csv");
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="flex-grow-1">
        <Navbar />

        <div className="container-fluid p-3">
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="fw-bold mb-1">👥 User Management</h2>
              <p className="text-muted mb-0">Manage system users and access permissions</p>
            </div>
            <button className="btn btn-primary" onClick={() => {
              setEditingUser(null);
              setForm({ username: "", email: "", password: "", role: "manager" });
              setShowModal(true);
            }}>
              + Add User
            </button>
          </div>

          {/* SUMMARY CARD */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h6>Total Users</h6>
                  <h2 className="fw-bold">{users.length}</h2>
                  <small className="text-muted">Registered accounts</small>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h6>Admins</h6>
                  <h2 className="fw-bold text-success">
                    {users.filter((u) => u.role === "admin").length}
                  </h2>
                  <small className="text-muted">System administrators</small>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h6>Managers</h6>
                  <h2 className="fw-bold text-primary">
                    {users.filter((u) => u.role === "manager").length}
                  </h2>
                  <small className="text-muted">Standard operators</small>
                </div>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold">User List</h5>
                <button className="btn btn-outline-primary btn-sm" onClick={handleExport}>Export</button>
              </div>

              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email || "-"}</td>
                      <td>
                        <span className={`badge ${user.role === "admin" ? "bg-primary" : "bg-secondary"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-warning me-2" onClick={() => {
                          setEditingUser(user);
                          setForm({ username: user.username, email: user.email || "", password: "", role: user.role });
                          setShowModal(true);
                        }}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ width: "450px", background: "#fff", borderRadius: "16px", padding: "24px" }}>
            <h4 className="mb-4">{editingUser ? "Edit User" : "Add User"}</h4>

            <div className="mb-3">
              <label>Username</label>
              <input
                className="form-control"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label>Password {editingUser && <small className="text-muted">(Kosongkan jika tidak ingin diubah)</small>}</label>
              <input
                type="password"
                className="form-control"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label>Role</label>
              <select
                className="form-select"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                disabled={loading}
              >
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => {
                setShowModal(false);
                setEditingUser(null);
              }} disabled={loading}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={editingUser ? handleUpdate : handleAddUser} disabled={loading}>
                {loading ? "Menyimpan..." : (editingUser ? "Update User" : "Save User")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;

