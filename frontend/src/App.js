import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import About from "./components/About";
import Contact from "./components/Contact";
import Home from "./components/Home";
import Quiz from "./components/quiz";
import ContactList from "./components/ContactList";
import Result from "./components/Result";
import AdminDashboard from "./components/adminDashbord";
import Profile from "./components/Profile";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setUser(data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleQuizFinish = (score) => {
    console.log("Quiz finished with score:", score);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navbar
          key={isAuthenticated ? "authenticated" : "not-authenticated"}
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
          user={user}
          setUser={setUser}
          showAuthForm={showAuthForm}
          setShowAuthForm={setShowAuthForm}
        />

        <Routes>
          <Route
            path="/"
            element={
              <Home
                isAuthenticated={isAuthenticated}
                setShowAuthForm={setShowAuthForm}
              />
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/contact-list" element={<ContactList />} />

          <Route
            path="/quiz/:quizType"
            element={
              isAuthenticated ? (
                <Quiz onQuizFinish={handleQuizFinish} />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route path="/result" element={<Result user={user} />} />

          <Route
            path="/admin"
            element={
              isAuthenticated && user?.role === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/profile"
            element={
              isAuthenticated ? (
                <Profile user={user} setUser={setUser} />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
