const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const User = require("../models/User");
const { authMiddleware } = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", async (req, res) => {
    try {
        const questions = await Question.find();
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: "Failed to load questions" });
    }
});

router.get("/:quizType", async (req, res) => {
    const { quizType } = req.params;
    try {
        const questions = await Question.find({ quizType });
        if (questions.length === 0) {
            return res.status(404).json({ message: `No questions available for ${quizType} quiz` });
        }
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: "Failed to load questions" });
    }
});

router.post("/save-result", async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("username");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const resultData = {
            ...req.body,
            userName: user.username,
        };
        res.status(200).json({ message: "Quiz result saved", result: resultData });
    } catch (error) {
        console.error("Error saving quiz result:", error);
        res.status(500).json({ message: "Failed to save quiz result" });
    }
});

module.exports = router;