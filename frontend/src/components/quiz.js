import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchQuestions, saveQuizResult } from "../services/questionService";
import "./Quiz.css";

const Quiz = ({ onQuizFinish }) => {
    const { quizType } = useParams();
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [answeredQuestions, setAnsweredQuestions] = useState({});
    const [timer, setTimer] = useState(60);
    const [showRules, setShowRules] = useState(true);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [showTimeExtension, setShowTimeExtension] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userName, setUserName] = useState("Guest");
    const [startTime, setStartTime] = useState(null);
    const [questionTimes, setQuestionTimes] = useState([]); // Array to store time taken for each question
    const [currentQuestionStartTime, setCurrentQuestionStartTime] = useState(null); // Track start time for current question
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.log("No token found");
                    setUserName("Guest");
                    return;
                }

                const response = await fetch("http://localhost:5000/api/auth/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch user data");
                }

                const data = await response.json();
                setUserName(data.username || "Guest");
            } catch (err) {
                console.error("Error fetching user data:", err);
                setUserName("Guest");
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchQuizQuestions = async () => {
            try {
                const data = await fetchQuestions(quizType);
                setQuestions(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching questions:", err);
                setError("Failed to load questions. Please try again later.");
                setLoading(false);
            }
        };
        fetchQuizQuestions();
    }, [quizType]);

    // Start timer only when user is on the current question
    useEffect(() => {
        if (currentQuestionIndex === questionTimes.length && !showRules && !showTimeExtension) {
            setIsTimerRunning(true);
            setCurrentQuestionStartTime(Date.now()); // Record start time for the current question
        } else {
            setIsTimerRunning(false); // Stop timer when reviewing previous questions
        }
    }, [currentQuestionIndex, questionTimes.length, showRules, showTimeExtension]);

    // Timer logic
    useEffect(() => {
        if (currentQuestionIndex < questions.length && !showRules && isTimerRunning) {
            const interval = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer === 0) {
                        setIsTimerRunning(false);
                        setShowTimeExtension(true);
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [currentQuestionIndex, questions, showRules, isTimerRunning]);

    const handleAnswer = (selectedChoice) => {
        const correctAnswer = questions[currentQuestionIndex].answer;
        const isCorrect = selectedChoice === correctAnswer;

        if (isCorrect) {
            setScore(score + 1);
        }

        // Calculate time taken for the current question
        const timeTaken = Math.round((Date.now() - currentQuestionStartTime) / 1000);
        setQuestionTimes([...questionTimes, timeTaken]);

        setAnsweredQuestions({
            ...answeredQuestions,
            [currentQuestionIndex]: { selectedChoice, isCorrect },
        });
        setIsTimerRunning(false);
        setShowTimeExtension(false);
    };

    const handleNextQuestion = useCallback(async () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setTimer(60);
            setShowTimeExtension(false);
        } else {
            const endTime = new Date();
            const timeTaken = Math.round((endTime - startTime) / 1000);
            const resultData = {
                score,
                totalQuestions: questions.length,
                correctAnswers: score,
                wrongAnswers: questions.length - score,
                timeTaken,
                quizType,
                userName,
                questionTimes, // Include time taken for each question
            };

            try {
                const savedResult = await saveQuizResult(resultData);
                navigate("/result", { state: savedResult });
            } catch (err) {
                console.error("Error saving quiz result:", err);
                navigate("/result", { state: resultData }); // Fallback to local resultData
            }
        }
    }, [currentQuestionIndex, questions.length, score, navigate, quizType, userName, startTime, questionTimes]);

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setTimer(60);
            setShowTimeExtension(false);
        }
    };

    const handleStartQuiz = () => {
        setShowRules(false);
        setStartTime(new Date());
    };

    const handleTimeExtension = (extend) => {
        if (extend) {
            setTimer(60);
            setIsTimerRunning(true);
        } else {
            alert("Quiz aborted due to time limit.");
            navigate("/");
        }
        setShowTimeExtension(false);
    };

    if (loading) {
        return <div className="quiz-container">Loading questions...</div>;
    }

    if (error) {
        return (
            <div className="quiz-container">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    if (showRules) {
        return (
            <div className="quiz-container">
                <h1 className="quiz-title">Quiz Rules</h1>
                <div className="rules-box">
                    <p>1. You have 1 minute to answer each question.</p>
                    <p>2. Once you select an answer, the timer will stop.</p>
                    <p>3. You can navigate between questions using the Previous and Next buttons.</p>
                    <p>4. If you don't answer within the time limit, you can request more time.</p>
                </div>
                <div className="confirmation-buttons">
                    <button onClick={handleStartQuiz}>Start Quiz</button>
                    <button onClick={() => navigate("/")}>Cancel</button>
                </div>
            </div>
        );
    }

    if (showTimeExtension) {
        return (
            <div className="quiz-container">
                <h1 className="quiz-title">Time Up! Do you want more time for this question?</h1>
                <div className="confirmation-buttons">
                    <button onClick={() => handleTimeExtension(true)}>Yes</button>
                    <button onClick={() => handleTimeExtension(false)}>No</button>
                </div>
            </div>
        );
    }

    const question = questions[currentQuestionIndex];
    const selectedAnswer = answeredQuestions[currentQuestionIndex]?.selectedChoice;
    const isCorrect = answeredQuestions[currentQuestionIndex]?.isCorrect;

    if (!question || !question.choices || !question.answer) {
        return <div className="quiz-container">Invalid question data.</div>;
    }

    return (
        <div className="quiz-container global-bg">
            <h1 className="quiz-title">Test Your Knowledge</h1>
            <div className="timer-circle">
                <p>{timer}</p>
            </div>
            <div className="question-box">
                <p>{question.question}</p>
            </div>
            <div className="choices-container">
                {question.choices.map((choice, index) => {
                    const isSelected = selectedAnswer === choice;
                    const isActuallyCorrect = choice === question.answer;
                    let buttonClass = "choice-button";
                    if (isSelected) {
                        buttonClass += isCorrect ? " correct" : " wrong";
                    } else if (isActuallyCorrect && selectedAnswer) {
                        buttonClass += " correct";
                    }
                    return (
                        <button
                            key={index}
                            onClick={() => handleAnswer(choice)}
                            className={buttonClass}
                            disabled={!!selectedAnswer}
                        >
                            {choice}
                        </button>
                    );
                })}
            </div>
            <div className="navigation-buttons">
                <button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                    Previous
                </button>
                <button onClick={handleNextQuestion} disabled={!selectedAnswer}>
                    {currentQuestionIndex === questions.length - 1 ? "Finish" : "Next"}
                </button>
            </div>
            <div className="score">
                <p>Score: {score}</p>
            </div>
            {currentQuestionIndex < questionTimes.length && (
                <div className="time-taken">
                    <p>Time Taken for this Question: {questionTimes[currentQuestionIndex]} seconds</p>
                </div>
            )}
        </div>
    );
};

export default Quiz;