import React, { useState, useEffect } from "react";
import { fetchQuestions, addQuestion, deleteQuestion } from "../services/questionService";

const AdminDashboard = () => {
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        quizType: "",
    });

    // Fetch questions on component mount
    useEffect(() => {
        const loadQuestions = async () => {
            try {
                const data = await fetchQuestions();
                setQuestions(data);
            } catch (error) {
                console.error("Error loading questions:", error);
                alert("Failed to load questions. Please try again later.");
            }
        };
        loadQuestions();
    }, []);

    // Add a new question
    const handleAddQuestion = async () => {
        try {
            // Validate input fields
            if (
                !newQuestion.question ||
                newQuestion.options.some((option) => option.trim() === "") ||
                !newQuestion.correctAnswer ||
                !newQuestion.quizType
            ) {
                alert("Please fill all fields before adding a question.");
                return;
            }

            const addedQuestion = await addQuestion(newQuestion);
            setQuestions([...questions, addedQuestion]);
            setNewQuestion({
                question: "",
                options: ["", "", "", ""],
                correctAnswer: "",
                quizType: "",
            });
            alert("Question added successfully!");
        } catch (error) {
            console.error("Error adding question:", error);
            alert("Failed to add question. Please try again.");
        }
    };

    // Delete a question
    const handleDeleteQuestion = async (id) => {
        try {
            await deleteQuestion(id);
            setQuestions(questions.filter((q) => q._id !== id));
            alert("Question deleted successfully!");
        } catch (error) {
            console.error("Error deleting question:", error);
            alert("Failed to delete question. Please try again.");
        }
    };

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <div className="add-question-form">
                <h2>Add New Question</h2>
                <input
                    type="text"
                    placeholder="Question"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                />
                {newQuestion.options.map((option, index) => (
                    <input
                        key={index}
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                            const updatedOptions = [...newQuestion.options];
                            updatedOptions[index] = e.target.value;
                            setNewQuestion({ ...newQuestion, options: updatedOptions });
                        }}
                    />
                ))}
                <input
                    type="text"
                    placeholder="Correct Answer"
                    value={newQuestion.correctAnswer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                />
                <select
                    value={newQuestion.quizType}
                    onChange={(e) => setNewQuestion({ ...newQuestion, quizType: e.target.value })}
                >
                    <option value="">Select Quiz Type</option>
                    <option value="english">English</option>
                    <option value="gk">General Knowledge</option>
                    <option value="reasoning">Reasoning</option>
                    <option value="math">Math</option>
                    <option value="computer">Computer</option>
                </select>
                <button onClick={handleAddQuestion}>Add Question</button>
            </div>
            <div className="questions-list">
                <h2>Questions List</h2>
                {questions.length === 0 ? (
                    <p>No questions available.</p>
                ) : (
                    questions.map((question) => (
                        <div key={question._id} className="question-item">
                            <p>{question.question}</p>
                            <button onClick={() => handleDeleteQuestion(question._id)}>Delete</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;