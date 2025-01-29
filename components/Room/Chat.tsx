/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable padding-line-between-statements */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const clientSocket = io("https://trivia-web-server-production.up.railway.app/"); // Replace with your server URL

interface ChatProps {
  userName: string;
  roomId: string;
}

const Chat: React.FC<ChatProps> = ({ userName, roomId }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { user: string; text: string; time: string }[]
  >([]);
  const [userJoinTime, setUserJoinTime] = useState<string>("");

  useEffect(() => {
    if (!userName || !roomId) return;

    const currentTime = new Date().toLocaleTimeString();
    setUserJoinTime(currentTime);

    // Emit user join event with the username and room code
    clientSocket.emit("joinRoom", { userName, roomCode: roomId });

    let hasUserJoined = false; // Flag to track join message
    let hasUserLeft = false; // Flag to track leave message

    // Listen for user join events
    clientSocket.on("userJoined", ({ userName, action }) => {
      if (!hasUserJoined) {
        const message = `${userName} ${action} the room.`;
        setMessages((prev) => [
          ...prev,
          { user: "System", text: message, time: currentTime },
        ]);
        hasUserJoined = true;
      }
    });

    // Listen for user left events
    clientSocket.on("userLeft", ({ userName, action }) => {
      if (!hasUserLeft) {
        const message = `${userName} ${action} the room.`;
        setMessages((prev) => [
          ...prev,
          { user: "System", text: message, time: currentTime },
        ]);
        hasUserLeft = true;
      }
    });

    // Listen for new messages
    clientSocket.on("newMessage", (msg) => {
      if (msg.user !== userName) {
        setMessages((prev) => [...prev, { ...msg, time: currentTime }]);
      }
    });

    return () => {
      clientSocket.emit("leaveRoom", { roomCode: roomId, userName });
      clientSocket.off("userJoined");
      clientSocket.off("userLeft");
      clientSocket.off("newMessage");
    };
  }, [roomId, userName]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const currentTime = new Date().toLocaleTimeString();
    const newMessage = {
      user: userName,
      text: message,
      roomId,
      time: currentTime,
    };

    clientSocket.emit("chatMessage", newMessage);
    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="w-full bg-white  rounded-lg space-y-4">
      <div className="h-64 overflow-y-auto p-4  rounded-md border border-gray-300 shadow-inner space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.user === userName ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs p-2 rounded-lg ${msg.user === userName ? "bg-green-600 text-white" : "bg-gray-200 text-black"}`}
            >
              <strong>{msg.user}</strong>: {msg.text}
              <span className="block text-xs ">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-4">
        <input
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Type your message..."
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
