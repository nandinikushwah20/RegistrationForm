import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    mobile: "",
    profilePhoto: null,
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: token },
      });
      setUser(res.data);

      setEditForm({
        name: res.data.name || "",
        mobile: res.data.mobile || "",
        profilePhoto: null,
      });
    } catch (err) {
      alert(err?.response?.data?.message || "Login required");
      navigate("/login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logout");
    navigate("/login");
  };

  const handleChange = (e) => {
    if (e.target.name === "profilePhoto") {
      setEditForm({ ...editForm, profilePhoto: e.target.files[0] });
    } else {
      setEditForm({ ...editForm, [e.target.name]: e.target.value });
    }
  };

  const handleUpdate = async () => {
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

      const res = await axios.put("http://localhost:5000/api/auth/me", formData, {
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data",
        },
      });

      alert(res.data.message);
      setUser(res.data.user);
      setIsEdit(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Update failed");
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  if (!user) return <h3>Loading...</h3>;

  return (
    <div
      style={{
        marginTop: "80%",
        minHeight: "100vh",
        padding: "20px",
        textAlign: "center",
        background: "linear-gradient(135deg, #ffd6e8, #d6f0ff)",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ color: "#ff5ca8" }}>User Dashboard</h2>

      <div style={{ marginBottom: "15px" }}>
        <img
          src={
            user.profilePhoto
              ? `http://localhost:5000${user.profilePhoto}`
              : "https://via.placeholder.com/120"
          }
          alt="Profile"
          width="120"
          height="120"
          style={{ borderRadius: "50%", objectFit: "cover" }}
        />
      </div>

      {!isEdit ? (
        <>
          <p style={{ margin: "10px 0" }}><b>Name:</b> {user.name}</p>
          <p style={{ margin: "10px 0" }}><b>Email:</b> {user.email}</p>
          <p style={{ margin: "10px 0" }}><b>Mobile:</b> {user.mobile || "Not Provided"}</p>
          {/* <p style={{ margin: "10px 0" }}><b>Role:</b> {user.role}</p> */}

          <button onClick={() => setIsEdit(true)} style={{ marginTop: "10px" }}>
            Edit Profile
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            name="name"
            value={editForm.name}
            onChange={handleChange}
            placeholder="Name"
          />
          <br />

          <input
            type="text"
            name="mobile"
            value={editForm.mobile}
            onChange={handleChange}
            placeholder="Mobile (10 digits)"
            maxLength="10"
          />
          <br />

          <input type="file" name="profilePhoto" onChange={handleChange} />
          <br />

          <div style={{ marginTop: "12px" }}>
            <button onClick={handleUpdate} style={{ marginRight: "10px" }}>
              Save
            </button>

            <button onClick={() => setIsEdit(false)}>Cancel</button>
          </div>
        </>
      )}

      <button onClick={handleLogout} style={{ marginBottom: "12px" }}>
        Logout
      </button>

    </div>
  );
}
