import React from 'react';
import { Player as PlayerType } from '../types';

interface PlayerProps {
  player: PlayerType;
  isCurrentPlayer?: boolean;
}

export function Player({ player, isCurrentPlayer }: PlayerProps) {
  return (
    <div
      className={`absolute transition-transform ${
        isCurrentPlayer ? 'scale-110 drop-shadow-lg' : 'scale-100'
      }`}
      style={{
        left: `${player.x}px`,
        top: `${player.y}px`,
        transform: `translate(-50%, -50%) ${isCurrentPlayer ? 'scale(1.1)' : 'scale(1)'}`,
      }}
    >
      <div className="relative flex flex-col items-center">
        <div className="text-3xl filter drop-shadow-md">{player.emoji}</div>
        <div className="absolute -bottom-5 whitespace-nowrap">
          <span className="px-2 py-0.5 text-xs font-medium bg-black/50 text-white rounded-full">
            {player.username}
          </span>
        </div>
      </div>
    </div>
  );
}