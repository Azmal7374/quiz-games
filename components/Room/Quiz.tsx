/* eslint-disable padding-line-between-statements */
/* eslint-disable prettier/prettier */
"use client"
import React, { useEffect, useState } from "react";
import { motion } from 'framer-motion';
interface QuizProps {
  quizCategory: string[];
}

const mockQuizzes: Record<
  string,
  { question: string; options: string[]; correct: string }[]
> = {
  "general knowledge": [
    {
      question: "What is the capital of France?",
      options: ["Paris", "Rome", "Berlin"],
      correct: "Paris",
    },
    {
      question: 'Who wrote "1984"?',
      options: ["Orwell", "Huxley", "Shakespeare"],
      correct: "Orwell",
    },
  ],
  science: [
    {
      question: "What planet is closest to the sun?",
      options: ["Mars", "Mercury", "Venus"],
      correct: "Mercury",
    },
    {
      question: "What is the chemical symbol for water?",
      options: ["O2", "H2O", "CO2"],
      correct: "H2O",
    },
  ],
  history: [
    {
      question: "Who was the first president of the USA?",
      options: ["Lincoln", "Washington", "Jefferson"],
      correct: "Washington",
    },
    {
      question: "In which year did World War II end?",
      options: ["1945", "1939", "1950"],
      correct: "1945",
    },
  ],
};

const Quiz: React.FC<QuizProps> = ({ quizCategory }) => {
  const [timer, setTimer] = useState(10);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizzes, setQuizzes] = useState<
    { question: string; options: string[]; correct: string }[]
  >([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const storedTimer = localStorage.getItem("roomTimer") || "10";
    const normalizedCategories = Array.isArray(quizCategory)
      ? quizCategory.map((category) => category.trim().toLowerCase())
      : [];

    // Combine questions for all selected categories
    const mergedQuizzes = normalizedCategories.flatMap(
      (category) => mockQuizzes[category] || []
    );
    setQuizzes(mergedQuizzes);
    setTimer(parseInt(storedTimer, 10));
  }, [quizCategory]);
  useEffect(() => {
    if (timer === 0) {
      handleNextQuestion();
    }

    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);

  const handleLockIn = () => {
    if (selectedOption === quizzes[currentQuestion].correct) {
      setScore((prev) => prev + 1);
    }
    handleNextQuestion();
  };

  const handleNextQuestion = () => {
    const storedTimer = localStorage.getItem("roomTimer") || "10";
    if (currentQuestion + 1 < quizzes.length) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedOption("");
      setTimer(parseInt(storedTimer, 10));
    } else {
      setShowResult(true);
      setQuizCompleted(true);
    }
  };

  const handleResetRoom = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption("");
    setTimer(10);
    setQuizCompleted(false);
  };

  if (!quizCategory) {
    return <div>Please select a quiz category to start.</div>;
  }

  if (quizzes.length === 0) {
    return (
      <div>No quizzes available for the selected category: {quizCategory}</div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-gray-100 rounded-md shadow-md space-y-6">
  {/* Timer */}
  {!showResult && (
    <motion.div
      animate={{ opacity: 1 }}
      className="mt-2 text-center text-red-500 text-lg font-semibold"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      Time Left: {timer}s
    </motion.div>
  )}

  {/* Quiz Result or Question */}
  {showResult ? (
    <motion.div
      animate={{ opacity: 1 }}
      className="text-center"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold text-green-600">Quiz Completed!</h2>
      <p className="text-xl mt-2">
        Your Score: <span className="font-semibold">{score}</span> / {quizzes.length}
      </p>
      {quizCompleted && (
        <button
          className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
          onClick={handleResetRoom}
        >
          Reset Room
        </button>
      )}
    </motion.div>
  ) : (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Question */}
      <motion.div
        animate={{ y: 0, opacity: 1 }}
        className="mb-4 text-center"
        initial={{ y: 50, opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-2xl font-semibold">{quizzes[currentQuestion].question}</h2>
      </motion.div>

      {/* Options */}
      <div className="space-y-4">
        {quizzes[currentQuestion].options.map((option) => (
          <motion.label
            key={option}
            animate={{ opacity: 1 }}
            className={`block p-4 border rounded-md cursor-pointer ${
              selectedOption === option
                ? "bg-blue-100 border-blue-400"
                : "hover:bg-gray-100"
            }`}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <input
              checked={selectedOption === option}
              className="mr-4"
              name="quiz-option"
              type="radio"
              value={option}
              onChange={() => setSelectedOption(option)}
            />
            {option}
          </motion.label>
        ))}
      </div>

      {/* Lock In Button */}
      <motion.button
        animate={{ opacity: 1 }}
        className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 disabled:opacity-50"
        disabled={!selectedOption}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleLockIn}
      >
        Lock In
      </motion.button>

      {/* Question Counter */}
      <motion.div
        animate={{ opacity: 1 }}
        className="mt-4 text-center text-gray-600"
        initial={{ opacity: 0 }}
        transition={{ delay: 0.5 }}
      >
        Question {currentQuestion + 1} of {quizzes.length}
      </motion.div>
    </motion.div>
  )}
</div>
  );
};

export default Quiz;
