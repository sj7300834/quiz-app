import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const API_URL = process.env.REACT_APP_API_URL;

export default function Navbar({
  isAuthenticated,
  setIsAuthenticated,
  user,
  setUser,
  showAuthForm,
  setShowAuthForm,
}) {
  const navigate = useNavigate();

  const [isLoginForm, setIsLoginForm] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  /* =========================
     FETCH USER PROFILE
  ========================== */
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

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
      } catch {
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    fetchProfile();
  }, [setIsAuthenticated, setUser]);

  /* =========================
     LOGIN / SIGNUP
  ========================== */
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint = isLoginForm ? "login" : "signup";
      const body = isLoginForm
        ? { email, password }
        : { username, email, password };

      const res = await fetch(`${API_URL}/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (isLoginForm) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        setPopupMessage("Login Successful!");
        setShowAuthForm(false);
        navigate("/");
      } else {
        setPopupMessage("Signup successful! Please login.");
        setIsLoginForm(true);
      }

      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  /* =========================
     JSX
  ========================== */
  return (
    <>
      <nav className={`navbar ${showNavbar ? "visible" : "hidden"}`}>
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <h1>Quiz App</h1>
          </Link>

          {isAuthenticated && user ? (
            <div
              ref={dropdownRef}
              className="profile"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="profile-default">
                {user.username[0].toUpperCase()}
              </div>
              {showDropdown && (
                <div className="dropdown">
                  <p>{user.username}</p>
                  <p>{user.email}</p>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      setUser(null);
                      setIsAuthenticated(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setShowAuthForm(true)}>
              {isLoginForm ? "Signup" : "Login"}
            </button>
          )}
        </div>
      </nav>

      {showAuthForm && (
        <form className="auth-form" onSubmit={handleFormSubmit}>
          {!isLoginForm && (
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
          <input
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
        </form>
      )}

      {showPopup && <div className="popup">{popupMessage}</div>}
    </>
  );
}
