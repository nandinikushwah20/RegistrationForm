import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [editUserId, setEditUserId] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    mobile: "",
    profilePhoto: null,
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: token },
      });
      setUsers(res.data);
    } catch (error) {
      alert(error?.response?.data?.message || "Unable to fetch users");
      navigate("/login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logout");
    navigate("/login");
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: token },
      });
      alert("User deleted");
      fetchUsers();
    } catch (error) {
      alert(error?.response?.data?.message || "Delete failed");
    }
  };

  const handleEditClick = (user) => {
    setEditUserId(user._id);
    setEditForm({
      name: user.name || "",
      mobile: user.mobile || "",
      profilePhoto: null,
    });
  };

  const handleChange = (e) => {
    if (e.target.name === "profilePhoto") {
      setEditForm({ ...editForm, profilePhoto: e.target.files[0] });
    } else {
      setEditForm({ ...editForm, [e.target.name]: e.target.value });
    }
  };

  const handleUpdate = async (id) => {
    const mobileRegex = /^[0-9]{10}$/;
    if (editForm.mobile && !mobileRegex.test(editForm.mobile)) {
      alert("Invalid Mobile Number (must be 10 digits)");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("mobile", editForm.mobile);

      if (editForm.profilePhoto) {
        formData.append("profilePhoto", editForm.profilePhoto);
      }

      await axios.put(`http://localhost:5000/api/admin/users/${id}`, formData, {
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("User updated");
      setEditUserId(null);
      fetchUsers();
    } catch (error) {
      alert(error?.response?.data?.message || "Update failed");
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      {/*Users Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {users.map((u) => (
          <div
            key={u._id}
            style={{
              border: "2px solid #cfe9ff",
              padding: "15px",
              borderRadius: "14px",
              backgroundColor: "#fff0f6",
              boxShadow: "0px 5px 12px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <img
              src={u.profilePhoto ? `http://localhost:5000${u.profilePhoto}` : ""}
              alt="Profile"
              width="70"
              height="70"
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                backgroundColor: "#cfe9ff",
                display: "block",
                margin: "0 auto",
              }}
            />

            <div style={{ marginTop: "10px" }}>
              {editUserId === u._id ? (
                <>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleChange}
                    placeholder="Name"
                    style={{
                      padding: "8px",
                      width: "90%",
                      borderRadius: "8px",
                      border: "1px solid #9ad6ff",
                      marginBottom: "10px",
                    }}
                  />

                  <input
                    type="text"
                    name="mobile"
                    value={editForm.mobile}
                    onChange={handleChange}
                    placeholder="Mobile (10 digits)"
                    maxLength="10"
                    style={{
                      padding: "8px",
                      width: "90%",
                      borderRadius: "8px",
                      border: "1px solid #9ad6ff",
                      marginBottom: "10px",
                    }}
                  />

                  <input
                    type="file"
                    name="profilePhoto"
                    onChange={handleChange}
                    style={{ marginBottom: "10px" }}
                  />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "15px",
                    }}
                  >
                    <button
                      onClick={() => handleUpdate(u._id)}
                      style={{
                        padding: "8px 14px",
                        backgroundColor: "green",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Save
                    </button>

                    <button
                      onClick={() => setEditUserId(null)}
                      style={{
                        padding: "8px 14px",
                        backgroundColor: "gray",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ margin: "10px 0" }}>
                    <b>Name:</b> {u.name}
                  </p>
                  <p style={{ margin: "10px 0" }}>
                    <b>Email:</b> {u.email}
                  </p>
                  <p style={{ margin: "10px 0" }}>
                    <b>Mobile:</b> {u.mobile || "Not Provided"}
                  </p>
                  <p style={{ margin: "10px 0" }}>
                    <b>Role:</b> {u.role}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "15px",
                    }}
                  >
                    <button
                      onClick={() => handleEditClick(u)}
                      style={{
                        padding: "8px 14px",
                        backgroundColor: "#7cc7ff",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteUser(u._id)}
                      style={{
                        padding: "8px 14px",
                        backgroundColor: "crimson",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/*Logout button */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "30px",
        }}
      >
        <button
          onClick={handleLogout}
          style={{
            width: "300px",
            padding: "12px 18px",
            border: "none",
            borderRadius: "10px",
            background: "#ff86c4",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
