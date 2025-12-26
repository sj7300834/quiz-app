import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const API_URL = process.env.REACT_APP_API_URL;

const Navbar = ({
  isAuthenticated,
  setIsAuthenticated,
  user,
  setUser,
  showAuthForm,
  setShowAuthForm,
}) => {
  const navigate = useNavigate();

  const [isLoginForm, setIsLoginForm] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  /* =========================
     FETCH USER PROFILE
  ========================== */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        setUser(data);
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    fetchProfile();
  }, [setIsAuthenticated, setUser]);

  /* =========================
     LOGIN / SIGNUP SUBMIT
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint = isLoginForm ? "login" : "signup";

      const body = isLoginForm
        ? { email, password }
        : { username, email, password };

      const res = await fetch(`${API_URL}/api/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (isLoginForm) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        setShowAuthForm(false);
        navigate("/");
      } else {
        setIsLoginForm(true);
        alert("Signup successful! Please login.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  /* =========================
     LOGOUT
  ========================== */
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="logo">
          Quiz App
        </Link>

        {isAuthenticated && user ? (
          <div
            className="profile"
            ref={dropdownRef}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>

            {showDropdown && (
              <div className="dropdown">
                <p>{user.username}</p>
                <p>{user.email}</p>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => setShowAuthForm(true)}>
            {isLoginForm ? "Login" : "Signup"}
          </button>
        )}
      </nav>

      {showAuthForm && (
        <div className="auth-modal">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>{isLoginForm ? "Login" : "Signup"}</h2>

            {!isLoginForm && (
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="error">{error}</p>}

            <button type="submit">
              {isLoginForm ? "Login" : "Signup"}
            </button>

            <p
              className="switch"
              onClick={() => setIsLoginForm(!isLoginForm)}
            >
              {isLoginForm
                ? "Don't have an account? Signup"
                : "Already have an account? Login"}
            </p>
          </form>
        </div>
      )}
    </>
  );
};

export default Navbar;
