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
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    setShowPopup(false);
    setPopupMessage("");

    try {
      // Client-side validation
      if (!isLoginForm) {
        if (!username || username.trim().length < 3) {
          setError("Username must be at least 3 characters");
          setIsLoading(false);
          return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          setError("Username can only contain letters, numbers and underscores");
          setIsLoading(false);
          return;
        }
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email address");
        setIsLoading(false);
        return;
      }

      if (!password || password.length < 6) {
        setError("Password must be at least 6 characters");
        setIsLoading(false);
        return;
      }

      const endpoint = isLoginForm ? "login" : "signup";
      const body = isLoginForm
        ? { email: email.trim(), password: password.trim() }
        : { 
            username: username.trim(), 
            email: email.trim(), 
            password: password.trim() 
          };

      console.log("Sending request to:", `${API_URL}/api/auth/${endpoint}`);
      console.log("Request body:", JSON.stringify(body));

      // Add timeout to request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log("Response status:", response.status);
      
      let data;
      try {
        const responseText = await response.text();
        console.log("Raw response text:", responseText);
        
        if (responseText) {
          data = JSON.parse(responseText);
        } else {
          data = {};
        }
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        setError("Server returned invalid response format");
        setIsLoading(false);
        return;
      }

      console.log("Parsed response data:", data);

      // Handle specific HTTP status codes
      if (response.status === 500) {
        // Internal Server Error
        if (data.message && data.message.includes("email")) {
          setError("Email already exists or is invalid");
        } else if (data.message && data.message.includes("username")) {
          setError("Username already exists");
        } else if (data.message && data.message.includes("password")) {
          setError("Password does not meet requirements");
        } else if (data.message === "Something went wrong") {
          setError("Server error. This might be due to: 1) Email already registered 2) Server issue. Please try again.");
        } else {
          setError("Internal server error. Please try again later.");
        }
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        const errorMsg = data.message || data.msg || data.error || 
                        data.details || `Request failed (Status: ${response.status})`;
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      // LOGIN SUCCESS
      if (isLoginForm) {
        if (!data.token) {
          setError("Login failed: No authentication token received");
          setIsLoading(false);
          return;
        }

        localStorage.setItem("token", data.token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
        }
        setIsAuthenticated(true);
        setPopupMessage("Login Successful! Redirecting...");
        setShowPopup(true);
        setShowAuthForm(false);
        setIsLoading(false);
        setTimeout(() => navigate("/"), 1200);
      }
      // SIGNUP → OTP FLOW
      else {
        // Check various success message formats from server
        const successMessage = data.message || data.msg || "Registration successful";
        
        if (successMessage.toLowerCase().includes("otp") || 
            successMessage.toLowerCase().includes("sent") || 
            successMessage.toLowerCase().includes("verify") ||
            data.requiresVerification === true ||
            data.verified === false) {
          
          setPopupMessage("Registration successful! OTP sent to your email.");
          setShowOTPForm(true);
          setShowAuthForm(false);
        } 
        // If server returns token directly (no OTP required)
        else if (data.token) {
          localStorage.setItem("token", data.token);
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);
          }
          setIsAuthenticated(true);
          setPopupMessage("Registration successful! You are now logged in.");
          setShowAuthForm(false);
          setTimeout(() => navigate("/"), 1200);
        }
        // Default case
        else {
          setPopupMessage("Registration successful! Please check your email for OTP.");
          setShowOTPForm(true);
          setShowAuthForm(false);
        }
        
        setIsLoading(false);
      }

      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
      
      // Clear form fields only on success
      if (!isLoginForm) {
        setUsername("");
      }
      setEmail("");
      setPassword("");
      
    } catch (err) {
      console.error("Error during form submission:", err);
      
      if (err.name === 'AbortError') {
        setError("Request timeout. Please check your internet connection.");
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Network error. Cannot connect to server.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      
      setIsLoading(false);
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

      if (!response.ok) {
        const errorMsg = data.message || data.msg || data.error || "Google login failed";
        setError(errorMsg);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setIsAuthenticated(true);
      setUser(data.user);

      setPopupMessage("Google Login Successful!");
      setShowPopup(true);
      setShowAuthForm(false);
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login failed. Please try again.");
    }
  };

  /* ================= OTP VERIFY ================= */
  const handleVerifyOTP = async () => {
    try {
      setError("");
      setIsLoading(true);

      if (!otp.trim() || otp.length !== 6) {
        setError("Please enter a valid 6-digit OTP");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.trim() }),
      });

      const data = await response.json();
      console.log("OTP Verification Response:", data);

      if (!response.ok) {
        const errorMsg = data.msg || data.message || data.error || "Invalid OTP";
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      setPopupMessage("Email verified successfully! You can now login.");
      setShowOTPForm(false);
      setIsLoginForm(true);
      setShowAuthForm(true);
      setShowPopup(true);
      setOtp("");
      setIsLoading(false);
      
      setTimeout(() => setShowPopup(false), 3000);
    } catch (err) {
      console.error("OTP verification error:", err);
      setError("OTP verification failed. Please try again.");
      setIsLoading(false);
    }
  };

  /* ================= RESEND OTP ================= */
  const handleResendOTP = async () => {
    try {
      setError("");
      
      const response = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.msg || data.message || data.error || "Failed to resend OTP";
        setError(errorMsg);
        return;
      }

      setPopupMessage("New OTP sent to your email!");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("Failed to resend OTP. Please try again.");
    }
  };

  /* ================= TEST SERVER CONNECTION ================= */
  const testServerConnection = async () => {
    console.log("Testing server connection...");
    try {
      // First test basic server connectivity
      const healthResponse = await fetch(`${API_URL}/api/health`, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });
      console.log("Health check response:", healthResponse.status);
      
      // Test signup endpoint
      const testData = {
        username: "testuser_" + Date.now(),
        email: "test_" + Date.now() + "@example.com",
        password: "Test@123456"
      };
      
      console.log("Testing with data:", testData);
      const signupTest = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(testData)
      });
      
      const responseText = await signupTest.text();
      console.log("Signup test - Status:", signupTest.status, "Response:", responseText);
      
    } catch (error) {
      console.error("Server connection test failed:", error);
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
                  {/* Debug button - remove in production */}
                  <button 
                    onClick={testServerConnection}
                    style={{marginTop: '10px', fontSize: '10px', padding: '5px'}}
                  >
                    Test Server
                  </button>
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
                  setError("");
                  setUsername("");
                  setEmail("");
                  setPassword("");
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
          onClick={() => {
            if (!isLoading) {
              setShowAuthForm(false);
              setError("");
              setUsername("");
              setEmail("");
              setPassword("");
            }
          }}
        />
      )}

      {/* LOGIN / SIGNUP FORM */}
      <div className={`auth-form ${showAuthForm ? "open" : ""}`}>
        <form onSubmit={handleFormSubmit} className="drawer-form">
          <h2>{isLoginForm ? "Login" : "Signup"}</h2>

          {!isLoginForm && (
            <div className="form-group">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                disabled={isLoading}
                className="form-input"
              />
              <small className="form-hint">3-20 characters, letters, numbers, underscores only</small>
            </div>
          )}

          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              disabled={isLoading}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              disabled={isLoading}
              minLength="6"
              className="form-input"
            />
            <small className="form-hint">Minimum 6 characters</small>
          </div>

          {error && (
            <div className="error-container">
              <p className="error-message">
                <strong>Error:</strong> {error}
              </p>
              {error.includes("server") || error.includes("timeout") ? (
                <button 
                  type="button"
                  className="retry-button"
                  onClick={testServerConnection}
                  disabled={isLoading}
                >
                  Test Server Connection
                </button>
              ) : null}
            </div>
          )}

          <button 
            type="submit" 
            className={`form-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              isLoginForm ? "Login" : "Signup"
            )}
          </button>

          <div style={{ marginTop: "15px", textAlign: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError("Google Login Failed")}
              theme="filled_blue"
              size="large"
              shape="rectangular"
            />
          </div>

          <p className="auth-switch-text">
            {isLoginForm ? "Don't have an account? " : "Already have an account? "}
            <span
              className="auth-switch-link"
              onClick={() => {
                if (!isLoading) {
                  setIsLoginForm(!isLoginForm);
                  setError("");
                }
              }}
            >
              {isLoginForm ? "Signup" : "Login"}
            </span>
          </p>

          {/* Debug info - remove in production */}
          <div className="debug-info">
            <small>Server: {API_URL}</small>
            <button 
              type="button"
              onClick={testServerConnection}
              className="debug-button"
            >
              Debug Server
            </button>
          </div>
        </form>
      </div>

      {/* OTP FORM */}
      {showOTPForm && (
        <>
          <div className="auth-form-overlay" onClick={() => {
            if (!isLoading) {
              setShowOTPForm(false);
              setShowAuthForm(true);
              setOtp("");
              setError("");
            }
          }} />
          <div className="auth-form open">
            <form className="drawer-form" onSubmit={(e) => e.preventDefault()}>
              <h2>Verify OTP</h2>
              <p className="otp-instruction">
                Enter the 6-digit OTP sent to <strong>{email}</strong>
              </p>
              
              <div className="form-group">
                <input
                  value={otp}
                  maxLength={6}
                  inputMode="numeric"
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit OTP"
                  disabled={isLoading}
                  className="form-input otp-input"
                />
                <small className="form-hint">Check your email spam folder if you don't see the OTP</small>
              </div>
              
              {error && <p className="error-message">{error}</p>}
              
              <div className="otp-buttons">
                <button
                  type="button"
                  className={`form-button primary ${isLoading ? 'loading' : ''}`}
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </button>
                
                <button
                  type="button"
                  className="form-button secondary"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                >
                  Resend OTP
                </button>
              </div>
              
              <p className="auth-switch-text">
                <span
                  className="auth-switch-link"
                  onClick={() => {
                    if (!isLoading) {
                      setShowOTPForm(false);
                      setShowAuthForm(true);
                      setOtp("");
                      setError("");
                    }
                  }}
                >
                  Back to {isLoginForm ? "Login" : "Signup"}
                </span>
              </p>
            </form>
          </div>
        </>
      )}

      {/* POPUP */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <p>{popupMessage}</p>
            <button 
              className="popup-close"
              onClick={() => setShowPopup(false)}
              autoFocus
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}