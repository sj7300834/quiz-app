const mongoose = require("mongoose");

// Define the schema for a question
const questionSchema = new mongoose.Schema({
    quizType: {
        type: String,
        required: [true, "Quiz type is required"],
        enum: ["english", "gk", "reasoning", "math", "computer"],
        trim: true,
        lowercase: true,
    },
    question: {
        type: String,
        required: [true, "Question is required"],
        trim: true,
        minlength: [10, "Question must be at least 10 characters long"],
        maxlength: [500, "Question cannot exceed 500 characters"],
    },
    options: {
        type: [String],
        required: [true, "Options are required"],
        validate: {
            validator: function (options) {
                return options.length >= 2 && options.length <= 5;
            },
            message: "A question must have between 2 and 5 options.",
        },
    },
    correctAnswer: {
        type: String,
        required: [true, "Correct answer is required"],
        trim: true,
    },
}, {
    timestamps: true,
});

// Indexing for faster queries
questionSchema.index({ quizType: 1 });

// Validate unique options
questionSchema.path("options").validate(function (options) {
    return new Set(options).size === options.length;
}, "Options must be unique");

// Create the model
const Question = mongoose.model("Question", questionSchema);

module.exports = Question;