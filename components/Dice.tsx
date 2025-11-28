import React from 'react';

interface DiceProps {
  value: number;
  isRolling: boolean;
  color?: 'white' | 'red';
}

export const Dice: React.FC<DiceProps> = ({ value, isRolling, color = 'white' }) => {
  const isRed = color === 'red';
  
  // Visual Styles
  const baseClass = `
    w-16 h-16 sm:w-20 sm:h-20 rounded-2xl 
    border-2
    shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.5),inset_0px_-4px_4px_rgba(0,0,0,0.2)]
    grid grid-cols-3 grid-rows-3 p-2.5 gap-1 place-items-center
    transition-transform duration-100 relative overflow-hidden
  `;
  
  const themeClass = isRed 
    ? 'bg-red-600 border-red-400 text-white shadow-red-900/20' 
    : 'bg-stone-100 border-white text-black shadow-stone-900/20';

  const dotClass = `w-3 h-3 rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)] ${isRed ? 'bg-white' : 'bg-stone-900'}`;

  // Helper to render dots
  const Dot = ({ pos }: { pos: string }) => <div className={`${dotClass} ${pos}`} />;

  const renderDots = () => {
    switch (value) {
      case 1:
        return <Dot pos="col-start-2 row-start-2 w-4 h-4" />;
      case 2:
        return (
          <>
            <Dot pos="col-start-1 row-start-1" />
            <Dot pos="col-start-3 row-start-3" />
          </>
        );
      case 3:
        return (
          <>
            <Dot pos="col-start-1 row-start-1" />
            <Dot pos="col-start-2 row-start-2" />
            <Dot pos="col-start-3 row-start-3" />
          </>
        );
      case 4:
        return (
          <>
            <Dot pos="col-start-1 row-start-1" />
            <Dot pos="col-start-3 row-start-1" />
            <Dot pos="col-start-1 row-start-3" />
            <Dot pos="col-start-3 row-start-3" />
          </>
        );
      case 5:
        return (
          <>
            <Dot pos="col-start-1 row-start-1" />
            <Dot pos="col-start-3 row-start-1" />
            <Dot pos="col-start-2 row-start-2" />
            <Dot pos="col-start-1 row-start-3" />
            <Dot pos="col-start-3 row-start-3" />
          </>
        );
      case 6:
        return (
          <>
            <Dot pos="col-start-1 row-start-1" />
            <Dot pos="col-start-3 row-start-1" />
            <Dot pos="col-start-1 row-start-2" />
            <Dot pos="col-start-3 row-start-2" />
            <Dot pos="col-start-1 row-start-3" />
            <Dot pos="col-start-3 row-start-3" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${baseClass} ${themeClass} ${isRolling ? 'shake-hard' : ''}`}>
      {/* Subtle glare effect */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/20 to-transparent pointer-events-none" />
      {renderDots()}
    </div>
  );
};