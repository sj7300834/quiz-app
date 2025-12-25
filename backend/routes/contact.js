const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// POST route to handle contact form submission
router.post('/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validate input
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Validate email format
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Please enter a valid email address.' });
        }

        // Create a new contact document
        const newContact = new Contact({
            name,
            email,
            message,
        });

        // Save the document to the database
        await newContact.save();

        res.status(201).json({ message: 'Contact details saved successfully!', contact: newContact });
    } catch (error) {
        console.error('Error saving contact details:', error); // Log the error
        res.status(500).json({ error: 'An error occurred while saving contact details.' });
    }
});

// GET route to fetch all contact details
router.get('/contact', async (req, res) => {
    try {
        const contacts = await Contact.find(); // Fetch all contacts from the database
        if (contacts.length === 0) {
            return res.status(404).json({ message: 'No contact details found.' });
        }
        res.status(200).json(contacts);
    } catch (error) {
        console.error('Error fetching contact details:', error); // Log the error
        res.status(500).json({ error: 'An error occurred while fetching contact details.' });
    }
});

// DELETE route to delete a contact by ID
router.delete('/contact/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            return res.status(400).json({ error: 'Contact ID is required.' });
        }

        const deletedContact = await Contact.findByIdAndDelete(id);
        if (!deletedContact) {
            return res.status(404).json({ error: 'Contact not found.' });
        }

        res.status(200).json({ message: 'Contact deleted successfully!', contact: deletedContact });
    } catch (error) {
        console.error('Error deleting contact:', error); // Log the error
        res.status(500).json({ error: 'An error occurred while deleting contact.' });
    }
});

module.exports = router;