import React, { useEffect, useState } from 'react';
import { SoundEffect } from '../types';

interface ComicSoundProps {
  effect: SoundEffect;
  onComplete: (id: number) => void;
}

export const ComicSound: React.FC<ComicSoundProps> = ({ effect, onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete(effect.id);
    }, 1500);
    return () => clearTimeout(timer);
  }, [effect.id, onComplete]);

  if (!visible) return null;

  return (
    <div 
      className="absolute pointer-events-none pop-in font-comic z-50 text-4xl sm:text-6xl uppercase tracking-widest text-center"
      style={{
        left: '50%',
        top: '40%',
        transform: `translate(-50%, -50%) rotate(${Math.random() * 20 - 10}deg)`,
        color: effect.color,
        textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
      }}
    >
      {effect.text}
    </div>
  );
};