import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ContactList.css'; // Ensure CSS file exists

const ContactList = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/contact'); // Use full URL
        setContacts(response.data);
      } catch (error) {
        console.error('Failed to fetch contacts:', error); // Log the error
      }
    };

    fetchContacts();
  }, []);

  return (
    <div className="contact-list-container">
      <h2>Contact Details</h2>
      <ul>
        {contacts.map((contact) => (
          <li key={contact._id}>
            <strong>Name:</strong> {contact.name}, <strong>Email:</strong> {contact.email}, <strong>Message:</strong> {contact.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContactList;