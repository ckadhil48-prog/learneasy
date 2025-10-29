import React, { useState } from "react";
import "./App.css";

const quizData = [
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Rome"],
    answer: "Paris",
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Mars", "Venus", "Earth", "Jupiter"],
    answer: "Mars",
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["William Wordsworth", "William Shakespeare", "Charles Dickens", "John Keats"],
    answer: "William Shakespeare",
  },
];

export default function LearnEasyQuizApp() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

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
