/* eslint-disable prettier/prettier */
/* eslint-disable import/order */
/* eslint-disable no-console */
/* eslint-disable react/self-closing-comp */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable react/jsx-sort-props */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable padding-line-between-statements */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-imports */
/* eslint-disable prettier/prettier */
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@heroui/input";
import { Spacer } from "@heroui/spacer";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { Checkbox, CheckboxGroup } from "@heroui/checkbox";
import { toast } from "sonner";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { useRouter } from "next/navigation";

const Quiz: React.FC = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" && window.location.origin);


  const router = useRouter();
  const [name, setName] = useState<string>(""); 
  const [roomCode, setRoomCode] = useState<string>(""); 
  const [timer, setTimer] = useState<string>(""); 
  const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([]); 
  const [roomLink, setRoomLink] = useState<string>(""); 
  const [qrCode, setQrCode] = useState<string>(""); 
  const [isScannerActive, setIsScannerActive] = useState<boolean>(false); 
  const [scannerError, setScannerError] = useState<string>(""); 
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [scannerStream, setScannerStream] = useState<MediaStream | null>(null); 

  // Handle room creation
  const newRoomCode = Math.random().toString(36).substr(2, 6).toUpperCase();

  
  const handleCreateRoom = async () => {
    if (!name.trim()) {
      toast.error("Error creating room, please try again!Please enter your name before creating a room!", {
        duration: 5000, 
        icon: "⚠️",   
      });
      return;
    }

    const qrCodeData = await QRCode.toDataURL(newRoomCode);

    try {
      const roomData = {
        username: name,
        quizCategories: selectedQuizzes,
        timer: Number(timer) || 10, 
        roomCode: newRoomCode,
        qrCode: qrCodeData,
      };

      const response = await axios.post(
        "https://trivia-web-server-production.up.railway.app/api/room/create",
        roomData
      );

      if (response.status === 201) {
        setRoomLink(`https://brain-bitz-quiz-game.vercel.app/room?roomId=${newRoomCode}&username=${name}`);
        setQrCode(qrCodeData);
      
        // Navigate using Next.js router
        router.push(`/room?roomId=${newRoomCode}&username=${name}`);
      } else {
        toast.error("Error creating room, please try again!", {
          duration: 5000, 
          icon: "⚠️",   
        });
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.", {
        duration: 5000, 
        icon: "⚠️",   
      });
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      toast.error("Please enter a valid room code!", {
        duration: 5000, 
        icon: "⚠️",   
      });
   
      return;
    }

    try {
    
      const response = await axios.post(
        "https://trivia-web-server-production.up.railway.app/api/room/join",
        {
          roomCode,
          username: name,
        }
      );

      if (response.status === 200) {
        router.push(`/room?roomId=${roomCode}&username=${name}`);
      } else {
        toast.error("Room not found, please check the code and try again!", {
          duration: 5000, 
          icon: "⚠️",   
        });
      }
    } catch (error) {
      toast.error("An error occurred while joining the room!", {
        duration: 5000, 
        icon: "⚠️",    
      });
    }
  };

  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setFileUpload(file);
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (ctx) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );
            const decoded = jsQR(imageData.data, canvas.width, canvas.height);
            if (decoded) {
              const url = new URL(decoded.data); 
              const roomId = url.searchParams.get("roomId");
              if (roomId) {
                console.log(roomId); 
                setRoomCode(roomId); e
              }
            } else {
              toast.error("No QR code detected in the image!", {
                duration: 5000, // Display duration (ms)
                icon: "⚠️",    // Add a custom icon
              });
            }
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const startScanner = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        setScannerStream(stream);

        const video = document.getElementById("qr-video") as HTMLVideoElement;
        video.srcObject = stream;
        video.play();

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx && video) {
          const scanQRCode = () => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
              );
              const decoded = jsQR(imageData.data, canvas.width, canvas.height);
              if (decoded) {
                setRoomCode(decoded.data);
              }
            }
            requestAnimationFrame(scanQRCode);
          };
          scanQRCode();
        }
      }
    };

    if (isScannerActive) {
      startScanner();
    } else {
      if (scannerStream) {
        const tracks = scannerStream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    }

    return () => {
      if (scannerStream) {
        const tracks = scannerStream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [isScannerActive, scannerStream]);

  return (
    <div className="flex flex-col items-center p-4 space-y-8">
      <h2 className="text-2xl font-bold text-green-400">Quiz App Home</h2>
      <div className="w-full max-w-md">
        <p className="mb-2">Name:</p>
        <Input
          placeholder="Pick a name!"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
      </div>

      <div className="flex flex-wrap justify-center gap-8 w-full max-w-4xl">
        <Card className="p-4 w-full max-w-sm">
          <h4 className="text-lg font-semibold">Create Room</h4>
          <Spacer y={0.5} />
          <h2>Question Timer (seconds):</h2>

          <Input
            placeholder="Enter timer duration"
            value={timer}
            onChange={(e) => setTimer(e.target.value)}
            fullWidth
          />
          <Spacer y={1} />
          <h2>Select Quizzes:</h2>
          <CheckboxGroup
            value={selectedQuizzes}
            onChange={setSelectedQuizzes}
            className="mt-4"
          >
            <Checkbox value="General Knowledge">General Knowledge</Checkbox>
            <Checkbox value="Science">Science</Checkbox>
            <Checkbox value="History">History</Checkbox>
            <Checkbox value="Geography">Geography</Checkbox>
          </CheckboxGroup>
          <Spacer y={1.5} />
          <Button className="bg-green-400"  onPress={handleCreateRoom}>
            Create a Lobby
          </Button>
        </Card>

        <Card className="p-4 w-full max-w-sm">
          <h4 className="text-lg font-semibold">Join Lobby</h4>
          <Spacer y={0.5} />
          <h2>Room Code:</h2>
          <Input
            placeholder="Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            fullWidth
          />
          <Spacer y={1.5} />
          <Button className="bg-green-400"  onPress={handleJoinRoom}>
            Join a Lobby
          </Button>
          <Spacer y={1.5} />
          <div>
            <h3>Or Scan QR Code:</h3>
            <Button className="bg-green-400"  onPress={() => setIsScannerActive(true)}>
              Scan QR Code
            </Button>
            {isScannerActive && (
              <div>
                <video id="qr-video" className="w-full h-auto"></video>
                {scannerError && <p className="text-red-500">{scannerError}</p>}
              </div>
            )}
          </div>
          <Spacer y={1.5} />
          <div>
            <h3>Or Upload QR Code Image:</h3>
            <input type="file" accept="image/*" onChange={handleFileUpload} />
          </div>
        </Card>

       
      </div>
    </div>
  );
};

export default Quiz;
