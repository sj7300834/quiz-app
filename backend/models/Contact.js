const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'], // Better error message
        trim: true, // Remove extra spaces
        minlength: [2, 'Name must be at least 2 characters long'], // Minimum length
        maxlength: [50, 'Name cannot exceed 50 characters'], // Maximum length
    },
    email: {
        type: String,
        required: [true, 'Email is required'], // Better error message
        trim: true, // Remove extra spaces
        lowercase: true, // Convert email to lowercase
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'], // Email validation
    },
    message: {
        type: String,
        required: [true, 'Message is required'], // Better error message
        trim: true, // Remove extra spaces
        minlength: [10, 'Message must be at least 10 characters long'], // Minimum length
        maxlength: [1000, 'Message cannot exceed 1000 characters'], // Maximum length
    },
}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('Contact', contactSchema);