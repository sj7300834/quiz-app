import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ isAuthenticated, setIsAuthenticated, user, setUser, showAuthForm, setShowAuthForm }) {
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

  // Refs for dropdown and mobile menu
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Fetch user profile if authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await fetch("http://localhost:5000/api/auth/profile", {
            method: "GET", // Added method explicitly
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json", // Added Content-Type
            },
            credentials: "include", // Added for CORS with credentials
          });
          const data = await response.json();
          if (response.ok) {
            setUser(data); // Update user state
            setIsAuthenticated(true); // Set authenticated to true
          } else {
            console.error("Error fetching profile:", data.message);
            localStorage.removeItem("token");
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    fetchUserProfile();
  }, [setIsAuthenticated, setUser]);

  // Handle navbar visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Handle click outside dropdown and mobile menu
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/");
  };

  // Handle form submission (login/signup)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate fields
    if (isLoginForm) {
      if (!email || !password) {
        setError("Email and password are required.");
        setTimeout(() => setError(""), 2000);
        return;
      }
    } else {
      if (!username || !email || !password) {
        setError("All fields are required.");
        setTimeout(() => setError(""), 2000);
        return;
      }

      if (username.length < 3) {
        setError("Username must be at least 3 characters long.");
        setTimeout(() => setError(""), 2000);
        return;
      }
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      setTimeout(() => setError(""), 2000);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setTimeout(() => setError(""), 2000);
      return;
    }

    try {
      const endpoint = isLoginForm ? "login" : "signup";
      const body = isLoginForm ? { email, password } : { username, email, password };

      const response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        credentials: "include", // Added for CORS with credentials
      });

      const data = await response.json();

      if (response.ok) {
        if (isLoginForm) {
          // Login successful
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          setIsAuthenticated(true);
          setUser(data.user);
          setPopupMessage("Login Successful!");
          setShowPopup(true);
          setShowAuthForm(false);

          setTimeout(() => {
            setShowPopup(false);
            navigate("/"); // Redirect to home page after login
            window.location.reload(); // Reload to fetch user profile
          }, 2000);
        } else {
          // Signup successful
          setPopupMessage("Signup Successful! Please login to continue.");
          setShowPopup(true);
          setShowAuthForm(false);

          setTimeout(() => {
            setShowPopup(false);
            setIsLoginForm(true);
            setShowAuthForm(true);
          }, 2000);
        }
      } else {
        setError(data.message || "Invalid email or password");
        setTimeout(() => setError(""), 2000);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong. Please try again.");
      setTimeout(() => setError(""), 2000);
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div>
      <nav className={`navbar ${showNavbar ? "visible" : "hidden"}`}>
        <div className="navbar-container">
          <div className="navbar-left">
            <Link className="navbar-brand" to="/">
              <h1>Quiz App</h1>
            </Link>
            <div className={`nav-links ${isMobileMenuOpen ? "open" : ""}`} ref={mobileMenuRef}>
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
            </div>
          </div>
          <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
            ☰
          </div>
          {isAuthenticated && user ? (
            <div className="profile" ref={dropdownRef} onClick={() => setShowDropdown(!showDropdown)}>
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="profile-pic"
                />
              ) : (
                <div className="profile-default">{user.username[0].toUpperCase()}</div>
              )}
              <span className="username-display">{user.username}</span>
              {showDropdown && (
                <div className="dropdown">
                  <p>{user.username}</p>
                  <p>{user.email}</p>
                  <Link to="/profile" onClick={() => setShowDropdown(false)}>Profile</Link>
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

      {showAuthForm && (
        <div className="auth-form-overlay" onClick={() => setShowAuthForm(false)}></div>
      )}

      <div className={`auth-form ${showAuthForm ? "open" : ""}`}>
        <form onSubmit={handleFormSubmit} className="drawer-form">
          <h2>{isLoginForm ? "Login" : "Signup"}</h2>
          {!isLoginForm && (
            <div className="form-group">
              <label>Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="form-button">
            {isLoginForm ? "Login" : "Signup"}
          </button>
          <p className="auth-switch-text">
            {isLoginForm
              ? "Don't have an account? "
              : "Already have an account? "}
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