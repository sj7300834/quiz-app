import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Result.css";

const Result = ({ user }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [resultData, setResultData] = useState(location.state);

    useEffect(() => {
        if (resultData) {
            console.log("Result Data on Save:", resultData); // Debugging
            sessionStorage.setItem("quizResult", JSON.stringify(resultData));
        }
    }, [resultData]);

    useEffect(() => {
        const savedResult = sessionStorage.getItem("quizResult");
        if (savedResult) {
            const parsedResult = JSON.parse(savedResult);
            console.log("Result Data from Session:", parsedResult); // Debugging
            setResultData(parsedResult);
        }
    }, []);

    if (!resultData) {
        return (
            <div className="result-container">
                <h1>No Result Found</h1>
                <p>Please complete a quiz first to view your results.</p>
                <button onClick={() => navigate("/")}>Go to Home</button>
            </div>
        );
    }

    const { score, totalQuestions, correctAnswers, wrongAnswers, timeTaken, quizType, userName } = resultData;
    const percentageScore = ((score / totalQuestions) * 100).toFixed(2);

    const handleRestartQuiz = () => {
        navigate(`/quiz/${quizType}`);
    };

    const handleExitQuiz = () => {
        navigate("/");
    };

    return (
        <div className="result-container global-bg">
            <h1>
                <div className="logo-container">
                    {/* Conditional rendering: Show profile picture if available, otherwise show username's first letter */}
                    {user && user.profilePicture ? (
                        <img
                            src={user.profilePicture}
                            alt={user.username || "User Profile"}
                            className="user-profile-pic"
                        />
                    ) : (
                        <div className="profile-default">
                            {user?.username?.[0]?.toUpperCase() || "G"} {/* Show first letter of username, or "G" if user is not available */}
                        </div>
                    )}
                </div>
                <div>Quiz Result</div>
            </h1>
            <div className="result-details">
                <p>
                    <strong>Examinee:</strong> <span>{user?.username || userName || "Guest"}</span>
                </p>
                {quizType && (
                    <p>
                        <strong>Quiz Type:</strong> <span>{quizType}</span>
                    </p>
                )}
                <p>Total Questions: <span>{totalQuestions}</span></p>
                <p>Correct Answers: <span>{correctAnswers}</span></p>
                <p>Wrong Answers: <span>{wrongAnswers}</span></p>
                <p>Time Taken: <span>{timeTaken} seconds</span></p>
                <p>Your Score: <span>{score}</span></p>
                <p>Percentage: <span>{percentageScore}%</span></p>
            </div>
            <div className="result-buttons">
                <button onClick={handleRestartQuiz}>Start Again</button>
                <button onClick={handleExitQuiz}>Exit</button>
            </div>
        </div>
    );
};

export default Result;