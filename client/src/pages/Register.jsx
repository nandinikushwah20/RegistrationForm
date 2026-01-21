import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    profilePhoto: null,
  });

  const handleChange = (e) => {
    if (e.target.name === "profilePhoto") {
      setFormData({ ...formData, profilePhoto: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const data = new FormData();

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      mobile: formData.mobile,
    };

    Object.entries(payload).forEach(([key, value]) => {
      data.append(key, value);
    });

    data.append("profilePhoto", formData.profilePhoto);

    const res = await axios.post("http://localhost:5000/api/auth/register", data);
    alert(res.data.message);
  } catch (err) {
    alert(err?.response?.data?.message || "Register Failed");
  }
};

  return (
  <div className="form-container">
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>

      <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <input type="text" name="mobile" placeholder="Mobile" onChange={handleChange} maxLength="10" pattern="[0-9]{10}" title="Mobile number must be exactly 10 digits" required />

      <input type="file" name="profilePhoto" onChange={handleChange} />

      <button type="submit">Register</button>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </form>
  </div>
);

}
