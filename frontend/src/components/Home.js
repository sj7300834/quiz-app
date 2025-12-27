import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = ({ isAuthenticated, setShowAuthForm }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // setPassword is now used
  const [username, setUsername] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const quizzes = ["Reasoning", "Math", "Computer", "English", "GK"];
  const [showLoginMessage, setShowLoginMessage] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");

    const url = isSignup
      ? "http://localhost:5000/api/auth/signup"
      : "http://localhost:5000/api/auth/login";
    const body = isSignup
      ? { username, email, password }
      : { email, password };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      localStorage.setItem("token", data.token);
      setShowAuthForm(false);
      navigate("/"); // Redirect to home after login/signup
      window.location.reload(); // Reload to fetch user profile
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle quiz selection
  const handleQuizSelect = (quizType) => {
    if (isAuthenticated) {
      navigate(`/quiz/${quizType.toLowerCase()}`);
    } else {
      setShowLoginMessage(true); // Show login message

      // Hide the message after 3 seconds
      setTimeout(() => {
        setShowLoginMessage(false);
      }, 3000);
    }
  };

  return (
    <div className="home-container">
      <h1>Welcome to the Quiz App!</h1>
      <div className="circle-container">
        <img src="/images/Quizlogo.jpg" alt="Quiz Logo" className="quiz-logo" />
      </div>
      <p className="instruction-text"></p>

      {/* Show login message if user is not authenticated and tries to access quiz */}
      {showLoginMessage && (
        <div className="login-message">
          Please login to access the quiz.
        </div>
      )}

      {/* Login/Signup Form if not authenticated */}
      {!isAuthenticated && (
        <div className="auth-form">
          <h2>{isSignup ? "Signup" : "Login"}</h2>
          <form onSubmit={handleAuth}>
            {isSignup && (
              <div>
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Fixed: Changed setEmail to setPassword
                required
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit">{isSignup ? "Signup" : "Login"}</button>
          </form>
          <p>
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <button onClick={() => setIsSignup(!isSignup)}>
              {isSignup ? "Login" : "Signup"}
            </button>
          </p>
        </div>
      )}

      {/* Quiz Cards */}
      <div className="features">
        {quizzes.map((quiz, index) => (
          <div
            key={index}
            className="feature-card"
            onClick={() => handleQuizSelect(quiz)}
          >
            <h3 className="quiz-title">{quiz} Quiz</h3>
            <p>
              {quiz === "Reasoning" && "Test your logical reasoning skills."}
              {quiz === "Math" && "Challenge your mathematical abilities."}
              {quiz === "Computer" && "Explore the world of computers."}
              {quiz === "English" && "Improve your English language skills."}
              {quiz === "GK" && "Test your general knowledge."}
            </p>
          </div>
        ))}
      </div>

      {/* Additional Features Section */}
      <div className="additional-features">
        <h2>Why Choose Us?</h2>
        <div className="feature-list">
          <div className="feature-item">
            <h3>Interactive Quizzes</h3>
            <p>Engage with fun and interactive quizzes designed to test your knowledge.</p>
          </div>
          <div className="feature-item">
            <h3>Multiple Categories</h3>
            <p>Choose from a variety of quiz categories to suit your interests.</p>
          </div>
          <div className="feature-item">
            <h3>Track Your Progress</h3>
            <p>Monitor your performance and improve your skills over time.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footerContainer">
          <p className="copyright">© Developed by teams of Hiray collage in MU</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;