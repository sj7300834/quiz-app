import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({
  isAuthenticated,
  setIsAuthenticated,
  user,
  setUser,
  showAuthForm,
  setShowAuthForm,
}) {
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL;

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
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Unauthorized");

        const data = await response.json();
        setUser(data);
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    fetchUserProfile();
  }, [API_URL, setIsAuthenticated, setUser]);

  /* =========================
     NAVBAR SCROLL
  ========================== */
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowNavbar(currentScrollY <= lastScrollY);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  /* =========================
     OUTSIDE CLICK
  ========================== */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =========================
     LOGOUT
  ========================== */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/");
  };

  /* =========================
     LOGIN / SIGNUP SUBMIT
  ========================== */
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint = isLoginForm ? "login" : "signup";

      const body = isLoginForm
        ? { email, password }
        : { username, email, password };

      const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      if (isLoginForm) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setIsAuthenticated(true);
        setUser(data.user);
        setPopupMessage("Login Successful!");
        setShowAuthForm(false);

        setTimeout(() => {
          setShowPopup(false);
          navigate("/");
        }, 1500);
      } else {
        setPopupMessage("Signup successful! Please login.");
        setShowAuthForm(false);
        setTimeout(() => {
          setShowPopup(false);
          setIsLoginForm(true);
          setShowAuthForm(true);
        }, 1500);
      }

      setShowPopup(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  /* =========================
     JSX
  ========================== */
  return (
    <div>
      <nav className={`navbar ${showNavbar ? "visible" : "hidden"}`}>
        <div className="navbar-container">
          <div className="navbar-left">
            <Link className="navbar-brand" to="/">
              <h1>Quiz App</h1>
            </Link>

            <div
              className={`nav-links ${isMobileMenuOpen ? "open" : ""}`}
              ref={mobileMenuRef}
            >
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>

          <div className="mobile-menu-icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            ☰
          </div>

          {isAuthenticated && user ? (
            <div className="profile" ref={dropdownRef} onClick={() => setShowDropdown(!showDropdown)}>
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="profile-pic" />
              ) : (
                <div className="profile-default">
                  {user.username[0].toUpperCase()}
                </div>
              )}
              <span className="username-display">{user.username}</span>

              {showDropdown && (
                <div className="dropdown">
                  <p>{user.username}</p>
                  <p>{user.email}</p>
                  <Link to="/profile">Profile</Link>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <button
                className="login-button"
                onClick={() => {
                  setIsLoginForm(!isLoginForm);
                  setShowAuthForm(true);
                }}
              >
                {isLoginForm ? "Signup" : "Login"}
              </button>
            </div>
          )}
        </div>
      </nav>

      {showAuthForm && <div className="auth-form-overlay" onClick={() => setShowAuthForm(false)} />}

      <div className={`auth-form ${showAuthForm ? "open" : ""}`}>
        <form onSubmit={handleFormSubmit} className="drawer-form">
          <h2>{isLoginForm ? "Login" : "Signup"}</h2>

          {!isLoginForm && (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="form-button">
            {isLoginForm ? "Login" : "Signup"}
          </button>

          <p className="auth-switch-text">
            {isLoginForm ? "Don't have an account? " : "Already have an account? "}
            <span
              className="auth-switch-link"
              onClick={() => setIsLoginForm(!isLoginForm)}
            >
              {isLoginForm ? "Signup" : "Login"}
            </span>
          </p>
        </form>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <p>{popupMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}