const Question = require('../models/Question');

const fetchQuestions = async (req, res) => {
    try {
        const { quizType } = req.query;
        let questions;
        if (quizType) {
            questions = await Question.find({ quizType });
        } else {
            questions = await Question.find();
        }
        if (!questions || questions.length === 0) {
            return res.status(404).json({ message: "No questions found" });
        }
        res.status(200).json(questions);
    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({ message: "Failed to fetch questions" });
    }
};

const saveQuizResult = async (req, res) => {
    try {
        const { userName, quizType, score, totalQuestions, correctAnswers, wrongAnswers, timeTaken } = req.body;
        if (!userName || !quizType || !score || !totalQuestions || !correctAnswers || !wrongAnswers || !timeTaken) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const percentageScore = ((score / totalQuestions) * 100).toFixed(2);
        const result = {
            userName,
            quizType,
            score,
            totalQuestions,
            correctAnswers,
            wrongAnswers,
            timeTaken,
            percentageScore,
        };
        res.status(200).json({ message: "Quiz result saved successfully", result });
    } catch (error) {
        console.error("Error saving quiz result:", error);
        res.status(500).json({ message: "Failed to save quiz result" });
    }
};

module.exports = {
    fetchQuestions,
    saveQuizResult,
};