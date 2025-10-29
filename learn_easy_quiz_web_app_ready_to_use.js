import React, { useState, useEffect } from "react";
import "./App.css";

export default function LearnEasyQuizApp() {
  const [quizData, setQuizData] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🧩 Load quiz data from quizzes/sample.json
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/quizzes/sample.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Quiz file not found");
        }
        return response.json();
      })
      .then((data) => {
        setQuizData(data);
        setLoading(false);
      })
      .catch(() => {
        setError("⚠️ Quiz file not found. Please check quizzes/sample.json");
        setLoading(false);
      });
  }, []);

  const handleAnswer = (option) => {
    if (option === quizData[index].answer) {
      setScore(score + 1);
    }

    const nextIndex = index + 1;
    if (nextIndex < quizData.length) {
      setIndex(nextIndex);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setIndex(0);
    setScore(0);
    setShowResult(false);
  };

  if (loading) {
    return <div className="quiz-container"><h2>Loading quiz...</h2></div>;
  }

  if (error) {
    return <div className="quiz-container"><h2 style={{ color: "red" }}>{error}</h2></div>;
  }

  return (
    <div className="quiz-container">
      <h1>Learn Easy Quiz</h1>

      {showResult ? (
        <div className="result">
          <h2>Your Score: {score} / {quizData.length}</h2>
          <button onClick={resetQuiz}>Try Again</button>
        </div>
      ) : (
        <div className="question-section">
          <h2>{quizData[index].question}</h2>
          <div className="options">
            {quizData[index].options.map((option, i) => (
              <button key={i} onClick={() => handleAnswer(option)}>
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
