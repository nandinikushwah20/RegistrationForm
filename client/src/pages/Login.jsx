import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });

    localStorage.setItem("token", res.data.token);

    alert("Login Success");

    //role based redirect
    if (res.data.user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/user");
    }
  } catch (err) {
  console.log("LOGIN ERROR FULL:", err);
  console.log("LOGIN ERROR RESPONSE:", err?.response);

  alert(
    err?.response?.data?.message ||
      err?.message ||
      "Login Failed (Server not responding)"
  );
}
};


return (
  <div className="form-container">
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />

      <button type="submit">Login</button>

      <p>
        New user? <Link to="/">Register</Link>
      </p>
    </form>
  </div>
);

}
