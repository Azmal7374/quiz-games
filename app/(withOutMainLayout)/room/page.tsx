/* eslint-disable prettier/prettier */
/* eslint-disable unused-imports/no-unused-imports */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable padding-line-between-statements */
/* eslint-disable react/jsx-sort-props */
/* eslint-disable import/order */
/* eslint-disable prettier/prettier */
"use client";
import React, { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@heroui/button";
import { QRCodeCanvas } from "qrcode.react";
import io from "socket.io-client";
import Chat from "@/components/Room/Chat";
import Loading from "@/components/share/Loading/Loading";
import { toast } from "sonner";
import { FaDownload } from "react-icons/fa";

const socket = io("https://trivia-web-server-production.up.railway.app/");

const RoomPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>("");
  const roomId = searchParams.get("roomId");
  const [room, setRoom] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [qrCodeURL, setQRCodeURL] = useState("");
  const [quizEnded, setQuizEnded] = useState<boolean>(false);
  const [lockedInAnswer, setLockedInAnswer] = useState<boolean>(false);
  const [usersAnswers, setUsersAnswers] = useState<any[]>([]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [answerSelected, setAnswerSelected] = useState<boolean>(false);

  useEffect(() => {
    if (roomId && username) {
      socket.emit("joinRoom", { roomCode: roomId, userName: username });
    }
  }, [roomId, username]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const user= urlParams.get("username");
      setUsername(user);
    }
  }, []);



  useEffect(() => {
    if (roomId) {
      axios
        .get(
          `https://trivia-web-server-production.up.railway.app/api/room/${roomId}`
        )
        .then((response) => {
          setRoom(response.data);
          setLoading(false);
          setTimeLeft(response.data.timer || 0);
        })
        .catch(() => {
          setError("Failed to load room data.");
          router.push("/"); // Navigate to the homepage
          setLoading(false);
        });
    }
  }, [roomId]);

  useEffect(() => {
    if (quizStarted && room?.questions) {
      setTimeLeft(
        room.timer || room.questions[currentQuestionIndex]?.timeLimit
      );
      startTimer(room.timer || room.questions[currentQuestionIndex]?.timeLimit);
    }
  }, [quizStarted, room, currentQuestionIndex]);

  useEffect(() => {
    if (timeLeft === 0 && quizStarted && !quizEnded) {
      handleNextQuestion();
    }
  }, [timeLeft]);

  useEffect(() => {
    socket.on("startQuiz", () => {
      setQuizStarted(true);
      setQuizEnded(false);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setCorrectAnswersCount(0);
      setAnswerSelected(false);

      startTimer(room?.timer || room?.questions[0]?.timeLimit);
    });

    return () => {
      socket.off("startQuiz");
    };
  }, [room]);

  useEffect(() => {
    socket.on("updateUserAnswers", (updatedUsersAnswers) => {
      setUsersAnswers(updatedUsersAnswers);
    });

    return () => {
      socket.off("updateUserAnswers");
    };
  }, []);

  const startTimer = (time: number) => {
    if (intervalId) clearInterval(intervalId);
    setTimeLeft(time);
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setIntervalId(id);
  };

  const handleStartQuiz = () => {
    if (!quizStarted && roomId) {
      socket.emit("startQuiz", { roomId });
    }
  };

  const handleAnswerQuestion = (answer: string) => {
    const correctAnswer = room?.questions[currentQuestionIndex]?.correctAnswer;
    const isCorrect = answer === correctAnswer;

    setUserAnswers((prev) => [
      ...prev,
      { questionIndex: currentQuestionIndex, answer, correct: isCorrect },
    ]);

    const updatedCorrectAnswersCount = isCorrect
      ? correctAnswersCount + 1
      : correctAnswersCount;

    setCorrectAnswersCount(updatedCorrectAnswersCount);
    setAnswerSelected(true);

    socket.emit("submitAnswer", {
      roomId,
      username,
      correctAnswersCount: updatedCorrectAnswersCount,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < room?.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswerSelected(false);
      startTimer(room?.questions[currentQuestionIndex + 1]?.timeLimit);
    } else {
      socket.emit("endQuiz", roomId);
      setQuizEnded(true);
    }
  };

  const handleResetQuiz = () => {
    setQuizStarted(false);
    setQuizEnded(false);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setCorrectAnswersCount(0);
    setAnswerSelected(false);
    setLockedInAnswer(false);
    setTimeLeft(room?.timer || 0);
    if (intervalId) clearInterval(intervalId);

    socket.emit("resetQuiz", { roomId });

    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setAnswerSelected(false);
    setLockedInAnswer(false);

    const initialTime =
      room?.timer || room?.questions[currentQuestionIndex]?.timeLimit;
    setTimeLeft(initialTime);

    startTimer(initialTime);
  };

  useEffect(() => {
    socket.on("updateUserAnswers", (updatedUsersAnswers) => {
      setUsersAnswers(updatedUsersAnswers);
    });

    return () => {
      socket.off("updateUserAnswers");
    };
  }, []);

  // Generate the QR code data URL for download
  const handleDownload = () => {
    const canvas = document.getElementById(
      "qrcode-canvas"
    ) as HTMLCanvasElement | null; // Type assertion for HTMLCanvasElement

    if (canvas) {
      // Ensure the canvas exists
      const url = canvas.toDataURL("image/png"); 
      setQRCodeURL(url);

      // Trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `room-${roomId}-qr.png`;
      link.click();
    } else {
      toast.error("QR code canvas not found", {
        duration: 5000,
        icon: "⚠️",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-start gap-6 flex-wrap mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">
            Quiz Room: {roomId}
          </h1>
          <h2 className="text-xl font-semibold text-gray-600">
            Welcome, {username || "Player"}!
          </h2>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center">
            {/* Render the QR Code */}
            <QRCodeCanvas
              id="qrcode-canvas"
              value={`https://brain-bitz-quiz-game.vercel.app/room?roomId=${roomId}`}
              size={120}
            />

            <button onClick={handleDownload} className="mt-2  py-2 rounded ">
              <FaDownload />
            </button>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Current Users:
          </h3>
          <ul className="list-disc ml-6 space-y-1">
            {room?.users.map((user: any, index: number) => (
              <li key={index} className="text-sm text-gray-700">
                {user.username}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="w-full bg-white rounded-lg p-6 border-2 h-[450px] md:h-[420px]">
        {!quizStarted && (
          <Button
            onClick={handleStartQuiz}
            className="w-40 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
          >
            Start Quiz
          </Button>
        )}
        {quizStarted &&
          !quizEnded &&
          room?.questions &&
          room.questions.length > 0 && (
            <div className="">
              <p className="mt-2 text-center text-lg font-medium">
                Time Left: {timeLeft} s
              </p>
              <h3 className="text-lg font-semibold mt-4">
                Question {currentQuestionIndex + 1}:{" "}
                {room.questions[currentQuestionIndex]?.question}
              </h3>
              <div className="mt-4 grid gap-4 ">
                {room.questions[currentQuestionIndex]?.options.map(
                  (option: string, index: number) => (
                    <Button
                      key={index}
                      className="w-full py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200"
                      onClick={() => handleAnswerQuestion(option)}
                    >
                      {option}
                    </Button>
                  )
                )}
              </div>
              <div className="mt-4 text-center">
                <Button
                  onClick={() => handleNextQuestion()}
                  disabled={!answerSelected} // Disable "Lock In" until an answer is selected
                  className={`w-40 py-2 ${
                    answerSelected
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gray-400 cursor-not-allowed"
                  } text-white rounded-lg transition duration-300`}
                >
                  Lock In
                </Button>
              </div>
            </div>
          )}

        {quizEnded && (
          <div>
            <h3 className="text-2xl text-center font-bold text-green-600">
              Quiz Ended!
            </h3>
            <h4 className="text-lg font-semibold">Real-Time Scores:</h4>

            {room?.users.map((user: any, index: number) => (
              <li key={index} className="text-sm text-gray-700">
                {user.username}: {correctAnswersCount} correct answers
              </li>
            ))}

            <Button
              onClick={handleResetQuiz}
              className="w-40 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
            >
              Reset Room
            </Button>
          </div>
        )}
      </div>

      <div className="py-10">
        <Chat userName={username || ""} roomId={roomId as string} />
      </div>
    </div>
  );
};

export default RoomPage;
