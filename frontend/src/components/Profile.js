import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { uploadProfilePicture } from "../services/questionService";

const Profile = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = React.useRef(null); // Ref for file input

  useEffect(() => {
    if (!user) {
      navigate("/"); // Redirect to home if user is not logged in
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB.");
        return;
      }
      setError("");
      handleUpload(file); // Automatically upload after selecting file
    }
  };

  const handleUpload = async (file) => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      const data = await uploadProfilePicture(formData, token);
      setUser({ ...user, profilePicture: data.user.profilePicture });
      setUploadMessage("Profile picture uploaded successfully!");
      // Refresh the page to ensure navbar updates
      window.location.reload();
    } catch (error) {
      console.error("Error uploading profile picture:", error.message, error);
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click(); // Trigger file input click
  };

  if (loading) {
    return <div className="loading-message">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <h1>Profile</h1>
      <div className="profile-picture-container">
        {user.profilePicture ? (
          <img
            src={user.profilePicture}
            alt="Profile"
            className="profile-pic"
          />
        ) : (
          <div className="profile-default">{user.username[0].toUpperCase()}</div>
        )}
      </div>
      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }} // Hide the default file input
        />
        <button onClick={handleButtonClick} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Profile Picture"}
        </button>
        {error && <p className="error-message">{error}</p>}
        {uploadMessage && <p className="upload-message">{uploadMessage}</p>}
      </div>
      <button className="back-button" onClick={() => navigate("/")}>
        Back to Home
      </button>
    </div>
  );
};

export default Profile;