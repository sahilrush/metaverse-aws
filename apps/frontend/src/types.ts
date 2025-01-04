export interface Player {
  id: string;
  x: number;
  y: number;
  emoji: string;
  username: string;
  inProximity?: boolean;
}

export interface GameState {
  players: Player[];
}

export interface VideoCallProps {
  player: Player;
  token?: string;
}