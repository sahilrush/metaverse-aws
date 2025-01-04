import { useEffect, useRef, useState } from 'react';
//can add movement speed
const TILE_SIZE = 50;
const PROXIMITY_THRESHOLD = 100;

interface User {
  x: number;
  y: number;
  userId: string;
  emoji?: string;
  inProximity?: boolean;
}

const Arena = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState(new Map<string, User>());
  const [params, setParams] = useState({ token: '', spaceId: '' });
  const [videoEnabled, setVideoEnabled] = useState(false);

  // Initialize WebSocket connection and handle URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token') || '';
    const spaceId = urlParams.get('spaceId') || '';
    setParams({ token, spaceId });

    wsRef.current = new WebSocket('ws://localhost:3001');
    
    wsRef.current.onopen = () => {
      wsRef.current?.send(JSON.stringify({
        type: 'join',
        payload: { spaceId, token }
      }));
    };

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };

    return () => {
      wsRef.current?.close();
    };
  }, []);

  const handleWebSocketMessage = (message: any) =>{
    switch (message.type) {
      case 'space-joined':
        const newUser = {
          x: message.payload.spawn.x,
          y: message.payload.spawn.y,
          userId: message.payload.userId,
          emoji: '❤️'
        };
        setCurrentUser(newUser);
        
        const userMap = new Map();
        message.payload.users.forEach((user: User) => {
          userMap.set(user.userId, { ...user, emoji: '💔' });
        });
        setUsers(userMap);
        break;

      case 'user-joined':
        setUsers(prev => {
          const newUsers = new Map(prev);
          newUsers.set(message.payload.userId, {
            x: message.payload.x,
            y: message.payload.y,
            userId: message.payload.userId,
            emoji: '💔'
          });
          return newUsers;
        });
        break;

      case 'movement':
        setUsers(prev => {
          const newUsers = new Map(prev);
          const user = newUsers.get(message.payload.userId);
          if (user) {
            newUsers.set(message.payload.userId, {
              ...user,
              x: message.payload.x,
              y: message.payload.y
            });
          }
          return newUsers;
        });
        break;

      case 'movement-rejected':
        setCurrentUser(prev => prev ? {
          ...prev,
          x: message.payload.x,
          y: message.payload.y
        } : null);
        break;

      case 'user-left':
        setUsers(prev => {
          const newUsers = new Map(prev);
          newUsers.delete(message.payload.userId);
          return newUsers;
        });
        break;
    }
  };

  // Check proximity to other users
  useEffect(() => {
    if (!currentUser) return;

    const nearbyUsers = Array.from(users.values()).filter(user => {
      const distance = Math.sqrt(
        Math.pow((user.x - currentUser.x) * TILE_SIZE, 2) + 
        Math.pow((user.y - currentUser.y) * TILE_SIZE, 2)
      );
      return distance < PROXIMITY_THRESHOLD;
    });

    const shouldEnableVideo = nearbyUsers.length > 0;
    setVideoEnabled(shouldEnableVideo);
  }, [currentUser?.x, currentUser?.y, users]);

  const handleMove = (newX: number, newY: number) => {
    if (!currentUser || !wsRef.current) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'move',
      payload: {
        x: newX,
        y: newY,
        userId: currentUser.userId
      }
    }));
  };

  const drawOfficeBackground = (ctx: CanvasRenderingContext2D) => {
    const canvas = ctx.canvas;
    
    // Floor pattern
    ctx.fillStyle = '#f0e6d2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid lines
    ctx.strokeStyle = '#e6dcc6';
    for (let i = 0; i < canvas.width; i += TILE_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += TILE_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Meeting area
    ctx.fillStyle = '#d4c5a9';
    ctx.fillRect(canvas.width * 0.7, canvas.height * 0.2, 300, 200);
    
    // Table
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(canvas.width * 0.75, canvas.height * 0.25, 100, 50);
    
    // Chairs
    ctx.fillStyle = '#6b563f';
    const chairPositions = [
      [canvas.width * 0.73, canvas.height * 0.23],
      [canvas.width * 0.83, canvas.height * 0.23],
      [canvas.width * 0.73, canvas.height * 0.33],
      [canvas.width * 0.83, canvas.height * 0.33]
    ];
    chairPositions.forEach(([x, y]) => {
      ctx.fillRect(x, y, 20, 20);
    });

    // Workstations
    const workstationY = canvas.height * 0.5;
    for (let i = 0; i < 3; i++) {
      const x = canvas.width * 0.1 + (i * 150);
      ctx.fillStyle = '#c4b598';
      ctx.fillRect(x, workstationY, 120, 60);
      
      ctx.fillStyle = '#8b7355';
      ctx.fillRect(x + 10, workstationY + 10, 40, 30);
      
      ctx.fillStyle = '#6b563f';
      ctx.fillRect(x + 60, workstationY + 20, 20, 20);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawOfficeBackground(ctx);

    // Draw current user
    if (currentUser) {
      ctx.beginPath();
      ctx.fillStyle = '#FF6B6B';
      ctx.arc(currentUser.x * TILE_SIZE, currentUser.y * TILE_SIZE, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(currentUser.emoji || '🧑‍💼', currentUser.x * TILE_SIZE, currentUser.y * TILE_SIZE - 30);
      ctx.font = '14px Arial';
      ctx.fillText('You', currentUser.x * TILE_SIZE, currentUser.y * TILE_SIZE + 30);
    }

    // Draw other users
    users.forEach(user => {
      ctx.beginPath();
      ctx.fillStyle = '#4ECDC4';
      ctx.arc(user.x * TILE_SIZE, user.y * TILE_SIZE, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(user.emoji || '👥', user.x * TILE_SIZE, user.y * TILE_SIZE - 30);
      ctx.font = '14px Arial';
      ctx.fillText(`User ${user.userId}`, user.x * TILE_SIZE, user.y * TILE_SIZE + 30);
    });
  }, [currentUser, users]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!currentUser) return;

    const { x, y } = currentUser;
    switch (e.key) {
      case 'ArrowUp':
        handleMove(x, Math.max(0, y - 1));
        break;
      case 'ArrowDown':
        handleMove(x, Math.min(39, y + 1));
        break;
      case 'ArrowLeft':
        handleMove(Math.max(0, x - 1), y);
        break;
      case 'ArrowRight':
        handleMove(Math.min(39, x + 1), y);
        break;
    }
  };

  return (
    <div className="p-4" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Virtual Meeting Arena</h1>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${videoEnabled ? 'bg-green-400' : 'bg-yellow-400'}`} />
          <span className="text-sm text-gray-600">
            {videoEnabled ? 'Proximity chat available' : 'Move closer to others to chat'}
          </span>
        </div>
      </div>
      
      <div className="mb-4 flex space-x-4 text-sm text-gray-600">
        <p>Token: {params.token}</p>
        <p>Space ID: {params.spaceId}</p>
        <p>Connected Users: {users.size + (currentUser ? 1 : 0)}</p>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={2000}
          height={1000}
          className="bg-white"
        />
      </div>

      <div className="mt-4 flex justify-between items-center">
        <p className="text-sm text-gray-500">Use arrow keys to move your avatar</p>
        {videoEnabled && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
            Video chat enabled - You're near other users!
          </div>
        )}
      </div>
    </div>
  );
};

export default Arena;