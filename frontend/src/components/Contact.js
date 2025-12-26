import React, { useState } from "react";
import axios from "axios";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/contact`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      alert(response.data.message || "Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error(
        "Error submitting contact form:",
        error.response?.data || error.message
      );
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="contact-container">
      <h2>Contact Us</h2>
      <p className="contact-description">
        Have questions or feedback? Feel free to reach out to us! We'll get back to
        you as soon as possible.
      </p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label>Message:</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Enter your message"
            required
          />
        </div>

        <button type="submit" className="submit-button">
          Send
        </button>
      </form>

      <div className="contact-info">
        <h3>Our Office</h3>
        <p>123 Quiz Street, Knowledge City</p>
        <p>Email: support@quizapp.com</p>
        <p>Phone: +123 456 7890</p>
      </div>
    </div>
  );
};

export default Contact;
