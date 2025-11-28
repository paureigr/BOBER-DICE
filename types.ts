export type GameState = 'IDLE' | 'ROLLING' | 'WIN' | 'LOSE' | 'CRITICAL_WIN' | 'CRITICAL_LOSE' | 'TIE';

export interface DiceValue {
  d1: number;
  d2: number;
}

export interface SoundEffect {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}