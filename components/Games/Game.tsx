/* eslint-disable import/order */
/* eslint-disable prettier/prettier */
import { connectSocket, disconnectSocket } from '@/utlis/socket';
import { Button } from '@heroui/button';
import { Card } from '@heroui/card';
import { useEffect, useState } from 'react';

interface GameProps {
  onGameStart: () => void;
  onAnswer: (answer: string) => void;
}

const Game: React.FC<GameProps> = ({ onGameStart, onAnswer }) => {
    const [players, setPlayers] = useState<string[]>([]);
    const [gameStarted, setGameStarted] = useState<boolean>(false);

    useEffect(() => {
        const socket = connectSocket();

        // Listen for player joins and game start
        socket.on('newPlayer', (playerId: string) => {
            setPlayers((prevPlayers) => [...prevPlayers, playerId]);
        });

        socket.on('gameStarted', () => {
            setGameStarted(true);
        });

        return () => {
            disconnectSocket();
        };
    }, []);

    return (
        <div>
            <Card>
                <h2>Multiplayer Trivia Game</h2>
                <h2>Players: {players.join(', ')}</h2>
                {!gameStarted ? (
                    <Button onClick={() => onGameStart()}>Start Game</Button>
                ) : (
                    <Button onClick={() => onAnswer('Example Answer')}>Submit Answer</Button>
                )}
            </Card>
        </div>
    );
};

export default Game;
