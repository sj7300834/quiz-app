import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { GoogleLogin } from "@react-oauth/google";

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

  useEffect(() => {
    console.log("===== ENV DEBUG =====");
    console.log("API URL:", process.env.REACT_APP_API_URL);
    console.log("GOOGLE CLIENT ID:", process.env.REACT_APP_GOOGLE_CLIENT_ID);
  }, []);

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

  // OTP States
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [otp, setOtp] = useState("");

  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  /* ================= FETCH PROFILE ================= */
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
      } catch {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    fetchUserProfile();
  }, [API_URL, setIsAuthenticated, setUser]);

  /* ================= NAVBAR SCROLL ================= */
  useEffect(() => {
    const handleScroll = () => {
      setShowNavbar(window.scrollY <= lastScrollY);
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  /* ================= OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/");
  };

  /* ================= SIGNUP / LOGIN ================= */
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

      if (!response.ok) return setError(data.message || "Something went wrong");

      // LOGIN SUCCESS
      if (isLoginForm) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setIsAuthenticated(true);
        setUser(data.user);
        setPopupMessage("Login Successful!");
        setShowAuthForm(false);
        setTimeout(() => navigate("/"), 1200);
      }
      // SIGNUP → OTP FLOW
      else {
        setPopupMessage("OTP sent to your email!");
        setShowOTPForm(true);
        setShowAuthForm(false);
      }

      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 1500);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;

      const response = await fetch(`${API_URL}/api/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) return setError("Google login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setIsAuthenticated(true);
      setUser(data.user);

      setPopupMessage("Google Login Successful!");
      setShowPopup(true);
      setShowAuthForm(false);
      setTimeout(() => navigate("/"), 1200);
    } catch {
      setError("Google login failed");
    }
  };

  /* ================= OTP VERIFY ================= */
  const handleVerifyOTP = async () => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.trim() }),
      });

      const data = await response.json();

      if (!response.ok) return setError(data.msg || "Invalid OTP");

      setPopupMessage("Email verified! Now login.");
      setShowOTPForm(false);
      setIsLoginForm(true);
      setShowAuthForm(true);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 1500);
    } catch {
      setError("OTP verification failed");
    }
  };

  /* ================= JSX ================= */
  return (
    <div>
      {/* NAVBAR */}
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

          <div
            className="mobile-menu-icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            ☰
          </div>

          {/* PROFILE */}
          {isAuthenticated && user ? (
            <div
              className="profile"
              ref={dropdownRef}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {user.profilePicture || user.picture ? (
                <img
                  src={user.profilePicture || user.picture}
                  alt="Profile"
                  className="profile-pic"
                />
              ) : (
                <div className="profile-default">
                  {(user.username || user.name || "U")[0].toUpperCase()}
                </div>
              )}
              <span className="username-display">
                {user.username || user.name}
              </span>

              {showDropdown && (
                <div className="dropdown">
                  <p>{user.username || user.name}</p>
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

      {/* AUTH OVERLAY */}
      {showAuthForm && (
        <div
          className="auth-form-overlay"
          onClick={() => setShowAuthForm(false)}
        />
      )}

      {/* LOGIN / SIGNUP FORM */}
      <div className={`auth-form ${showAuthForm ? "open" : ""}`}>
        <form onSubmit={handleFormSubmit} className="drawer-form">
          <h2>{isLoginForm ? "Login" : "Signup"}</h2>

          {!isLoginForm && (
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="form-button">
            {isLoginForm ? "Login" : "Signup"}
          </button>

          <div style={{ marginTop: "15px", textAlign: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError("Google Login Failed")}
            />
          </div>

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

      {/* OTP FORM */}
      {showOTPForm && (
        <>
          <div className="auth-form-overlay" />
          {/* prevent accidental close */}
          <div className="auth-form open">
            <form className="drawer-form">
              <h2>Verify OTP</h2>
              <input
                value={otp}
                maxLength={6}
                inputMode="numeric"
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit OTP"
              />
              {error && <p className="error-message">{error}</p>}
              <button
                type="button"
                className="form-button"
                onClick={handleVerifyOTP}
              >
                Verify OTP
              </button>
            </form>
          </div>
        </>
      )}

      {/* POPUP */}
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