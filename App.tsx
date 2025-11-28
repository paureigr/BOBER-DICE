import React, { useState, useEffect, useCallback } from 'react';
import { Dice } from './components/Dice';
import { ComicSound } from './components/ComicSound';
import { GameState, DiceValue, SoundEffect } from './types';

// Utility for random numbers
const rollDie = () => Math.floor(Math.random() * 6) + 1;

interface HistoryItem {
  id: number;
  result: GameState;
  change: number;
}

export default function App() {
  // State
  const [logs, setLogs] = useState(100);
  const [bet, setBet] = useState(10);
  const [playerDice, setPlayerDice] = useState<DiceValue>({ d1: 1, d2: 1 });
  const [boberDice, setBoberDice] = useState<DiceValue>({ d1: 1, d2: 1 });
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [sounds, setSounds] = useState<SoundEffect[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [streak, setStreak] = useState(0);
  const [showRules, setShowRules] = useState(false);
  
  // Sounds counter for IDs
  const [soundCounter, setSoundCounter] = useState(0);

  const addSound = (text: string, color: string = '#FFF') => {
    const newSound: SoundEffect = {
      id: soundCounter,
      text,
      x: 50,
      y: 50,
      color
    };
    setSounds(prev => [...prev, newSound]);
    setSoundCounter(prev => prev + 1);
  };

  const removeSound = useCallback((id: number) => {
    setSounds(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleRoll = () => {
    if (gameState === 'ROLLING') return;
    
    // Validation
    if (bet > logs) {
      addSound("TOO POOR!", "#ef4444");
      return;
    }
    if (bet <= 0) {
      addSound("BET SOMETHING!", "#ef4444");
      return;
    }

    if (logs <= 0) {
      addSound("GAME OVER!", "#ef4444");
      setTimeout(() => {
        setLogs(100);
        setBet(10);
        setHistory([]);
        setStreak(0);
        addSound("REFILLED!", "#22c55e");
      }, 1500);
      return;
    }

    setGameState('ROLLING');
    
    // Animation phases
    let rolls = 0;
    const maxRolls = 12;
    const interval = setInterval(() => {
      setPlayerDice({ d1: rollDie(), d2: rollDie() });
      setBoberDice({ d1: rollDie(), d2: rollDie() });
      rolls++;
      
      if (rolls >= maxRolls) {
        clearInterval(interval);
        finalizeRoll();
      }
    }, 80);
  };

  const finalizeRoll = () => {
    const p1 = rollDie();
    const p2 = rollDie();
    const b1 = rollDie();
    const b2 = rollDie();

    setPlayerDice({ d1: p1, d2: p2 });
    setBoberDice({ d1: b1, d2: b2 });

    const pSum = p1 + p2;
    const bSum = b1 + b2;

    let newState: GameState = 'TIE';
    let profit = 0;

    // Game Logic
    if (p1 === 1 && p2 === 1) {
      // SNAKE EYES - Critical Loss
      newState = 'CRITICAL_LOSE';
      profit = -logs; // Lose everything
      setLogs(0);
      setStreak(0);
      addSound("BOBER BITE!", "#ef4444");
    } else if (p1 === 6 && p2 === 6) {
      // BOXCARS - Critical Win
      newState = 'CRITICAL_WIN';
      profit = bet * 5;
      setLogs(prev => prev + profit);
      setStreak(s => s + 1);
      addSound("MEGA BOBER!", "#eab308");
    } else if (pSum > bSum) {
      // Win
      newState = 'WIN';
      profit = bet;
      setLogs(prev => prev + profit);
      setStreak(s => s + 1);
      addSound("NICE BEAVER!", "#22c55e");
    } else if (pSum < bSum) {
      // Lose
      newState = 'LOSE';
      profit = -bet;
      setLogs(prev => prev - bet);
      setStreak(0);
      addSound("O KURWA...", "#ef4444");
    } else {
      // Tie
      newState = 'TIE';
      profit = 0;
      addSound("JAKIE BYDLE!", "#3b82f6");
    }

    setGameState(newState);
    setHistory(prev => [{ id: Date.now(), result: newState, change: profit }, ...prev].slice(0, 10));
  };

  const setBetSafe = (val: number) => {
    if (gameState === 'ROLLING') return;
    const safeBet = Math.max(1, Math.min(Math.floor(val), logs));
    setBet(safeBet);
  };

  // UI Helpers
  const getMascotExpression = () => {
    switch(gameState) {
      case 'ROLLING': return '🫨'; 
      case 'WIN': return '🤑'; 
      case 'CRITICAL_WIN': return '🚀'; 
      case 'LOSE': return '😭'; 
      case 'CRITICAL_LOSE': return '💀'; 
      case 'TIE': return '😐'; 
      default: return '🦫'; 
    }
  };

  const getBorderColor = () => {
    switch(gameState) {
      case 'CRITICAL_LOSE': return 'border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)]';
      case 'CRITICAL_WIN': return 'border-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.5)]';
      case 'WIN': return 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]';
      case 'LOSE': return 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]';
      default: return 'border-stone-700/50 shadow-2xl';
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-4 px-4 overflow-hidden relative font-sans text-stone-200 selection:bg-green-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-green-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-stone-800/20 rounded-full blur-[120px]" />
      </div>

      {/* Comic Sounds Overlay */}
      {sounds.map(s => (
        <ComicSound key={s.id} effect={s} onComplete={removeSound} />
      ))}

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 pop-in">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowRules(false)}
              className="absolute top-4 right-4 text-stone-500 hover:text-white"
            >
              ✕
            </button>
            <h2 className="font-comic text-3xl text-green-500 mb-4 tracking-wide">HOW TO PLAY</h2>
            <ul className="space-y-3 text-sm text-stone-300">
              <li className="flex gap-3">
                <span className="text-xl">🎲</span>
                <span>Roll 2 dice against the Bober. Higher sum wins 2x bet.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-xl text-yellow-500">🔥</span>
                <span><strong className="text-white">Double 6s (Boxcars):</strong> Instant 5x Jackpot!</span>
              </li>
              <li className="flex gap-3">
                <span className="text-xl text-red-500">💀</span>
                <span><strong className="text-white">Double 1s (Snake Eyes):</strong> The Bober bites! You lose ALL logs.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-xl">🤝</span>
                <span>Ties return your money.</span>
              </li>
            </ul>
            <button 
              onClick={() => setShowRules(false)}
              className="w-full mt-6 py-3 bg-stone-800 hover:bg-stone-700 rounded-lg font-bold transition-colors"
            >
              GOT IT, KURWA!
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="w-full max-w-lg flex justify-between items-center mb-6 z-20">
        <div className="flex items-center gap-3">
            <img 
              src="https://i.ibb.co/vCBSdYxZ/LOGO-01-2.png" 
              alt="Logo" 
              className="h-12 w-12 rounded-xl shadow-lg border border-white/10"
            />
            <div className="leading-tight">
              <h1 className="font-comic text-xl text-white tracking-wide">LUCKY BOBER</h1>
              <span className="text-[10px] text-stone-500 bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">BETA v1.0</span>
            </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowRules(true)}
                className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center hover:bg-stone-700 transition-colors"
                title="Rules"
            >
                ?
            </button>
            <div className="glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-mono text-stone-300 border-stone-700/50">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                <span className="hidden sm:inline">0xB0...BER</span>
                <span className="sm:hidden">0xB0..</span>
            </div>
        </div>
      </div>

      {/* Game Card */}
      <div className={`w-full max-w-lg glass-panel rounded-3xl p-1 relative z-10 border-2 transition-all duration-300 ${getBorderColor()}`}>
        <div className="bg-stone-950/40 rounded-[20px] p-5 sm:p-6 overflow-hidden relative">

          {/* History Ribbon */}
          <div className="flex justify-center mb-6">
            <div className="flex gap-1.5 p-1.5 bg-black/40 rounded-full border border-white/5 backdrop-blur-md">
              {history.length === 0 && <span className="text-[10px] text-stone-600 px-2">ROLL TO START</span>}
              {history.map((h) => {
                 let color = 'bg-stone-700';
                 if (h.result.includes('WIN')) color = h.result === 'CRITICAL_WIN' ? 'bg-yellow-400' : 'bg-green-500';
                 if (h.result.includes('LOSE')) color = h.result === 'CRITICAL_LOSE' ? 'bg-purple-600' : 'bg-red-500';
                 if (h.result === 'TIE') color = 'bg-blue-400';
                 return <div key={h.id} className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${color} shadow-lg pop-in`} />
              })}
            </div>
          </div>

          {/* Balance Section */}
          <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-1">
                 <span className="text-[10px] font-bold tracking-widest text-stone-500 uppercase">Current Balance</span>
                 {streak > 1 && (
                     <span className="text-[10px] font-bold bg-orange-500/20 text-orange-400 px-1.5 rounded border border-orange-500/30 animate-pulse">
                         🔥 {streak} Streak
                     </span>
                 )}
              </div>
              <div className="text-5xl font-mono font-bold tracking-tighter text-white drop-shadow-xl">
                  {logs.toLocaleString()} <span className="text-green-500 text-3xl">$BOBER</span>
              </div>
          </div>

          {/* Dice Arena */}
          <div className="flex items-center justify-between gap-2 mb-8 relative">
             {/* Player Side */}
             <div className="flex-1 flex flex-col items-center gap-3">
                <div className="flex gap-2 relative">
                   <Dice value={playerDice.d1} isRolling={gameState === 'ROLLING'} color="white" />
                   <Dice value={playerDice.d2} isRolling={gameState === 'ROLLING'} color="white" />
                   {/* Winner Indicator */}
                   {(gameState === 'WIN' || gameState === 'CRITICAL_WIN') && (
                       <div className="absolute -top-3 -right-3 text-2xl pop-in">✨</div>
                   )}
                </div>
                <div className="px-3 py-1 rounded-full bg-stone-800/50 border border-stone-700/50">
                    <span className="text-[10px] font-bold text-stone-400 tracking-widest">YOU</span>
                </div>
             </div>

             {/* VS Badge */}
             <div className="flex flex-col items-center justify-center z-10 shrink-0">
                <div className="text-4xl sm:text-5xl drop-shadow-2xl transition-transform hover:scale-110 cursor-default">
                    {getMascotExpression()}
                </div>
             </div>

             {/* Bober Side */}
             <div className="flex-1 flex flex-col items-center gap-3">
                <div className="flex gap-2 relative">
                   <Dice value={boberDice.d1} isRolling={gameState === 'ROLLING'} color="red" />
                   <Dice value={boberDice.d2} isRolling={gameState === 'ROLLING'} color="red" />
                   {/* Winner Indicator */}
                   {(gameState === 'LOSE' || gameState === 'CRITICAL_LOSE') && (
                       <div className="absolute -top-3 -left-3 text-2xl pop-in">😈</div>
                   )}
                </div>
                 <div className="px-3 py-1 rounded-full bg-red-900/20 border border-red-900/30">
                    <span className="text-[10px] font-bold text-red-400 tracking-widest">BOBER</span>
                </div>
             </div>
          </div>

          {/* Controls Container */}
          <div className="bg-stone-900/60 rounded-xl p-4 border border-stone-800">
              {/* Input Area */}
              <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex-1 relative">
                      <label className="text-[10px] uppercase font-bold text-stone-500 absolute -top-2 left-2 bg-[#121212] px-1">
                          Wager
                      </label>
                      <input 
                          type="number" 
                          min="1"
                          max={logs}
                          value={bet}
                          onChange={(e) => setBetSafe(Number(e.target.value))}
                          disabled={gameState === 'ROLLING'}
                          className="w-full bg-black/50 border border-stone-700 rounded-lg py-3 pl-4 pr-16 text-2xl font-mono text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <span className="text-xs font-bold text-stone-600">$BOBER</span>
                      </div>
                  </div>
                  <div className="text-right">
                      <div className="text-[10px] text-stone-500 uppercase font-bold mb-1">Potential Win</div>
                      <div className="text-green-400 font-mono text-lg font-bold leading-none">
                          +{(bet).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-yellow-500/80 leading-tight">
                          Boxcars: +{(bet*5).toLocaleString()}
                      </div>
                  </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                  {[
                    { label: 'MIN', action: () => setBetSafe(1) },
                    { label: '½', action: () => setBetSafe(Math.floor(bet / 2)) },
                    { label: '2x', action: () => setBetSafe(bet * 2) },
                    { label: '5x', action: () => setBetSafe(bet * 5) },
                    { label: 'MAX', action: () => setBetSafe(logs) },
                  ].map((btn) => (
                      <button 
                        key={btn.label}
                        onClick={btn.action} 
                        disabled={gameState === 'ROLLING'} 
                        className="bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-400 hover:text-white text-xs font-bold py-2.5 rounded-lg border border-stone-700 transition-colors"
                      >
                          {btn.label}
                      </button>
                  ))}
              </div>
          </div>

        </div>
      </div>
        
      {/* Primary Action Button - Outside the glass card for emphasis */}
      <button
          onClick={handleRoll}
          disabled={gameState === 'ROLLING'}
          className={`
            w-full max-w-lg mt-6 py-5 rounded-2xl font-comic text-3xl uppercase tracking-widest shadow-2xl relative overflow-hidden group
            transform transition-all active:scale-[0.98]
            ${gameState === 'ROLLING' 
              ? 'bg-stone-800 text-stone-600 border border-stone-700 cursor-not-allowed' 
              : 'bg-gradient-to-b from-green-500 to-green-700 text-white shadow-green-900/40 hover:brightness-110 hover:-translate-y-1'
            }
          `}
      >
          {gameState !== 'ROLLING' && (
             <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          )}
          <span className="relative drop-shadow-md">
              {gameState === 'ROLLING' ? 'ROLLING...' : 'ROLL DICE'}
          </span>
      </button>

      {/* Footer */}
      <div className="mt-8 flex gap-6 opacity-40 hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2">
              <span className="text-xl grayscale">🔒</span>
              <div className="flex flex-col">
                  <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Secured By</span>
                  <span className="text-[10px] text-stone-300 font-mono">Blockchain</span>
              </div>
          </div>
          <div className="w-px h-8 bg-stone-700" />
           <div className="flex items-center gap-2">
              <span className="text-xl grayscale">🎲</span>
              <div className="flex flex-col">
                  <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Provably</span>
                  <span className="text-[10px] text-stone-300 font-mono">Fair</span>
              </div>
          </div>
      </div>

    </div>
  );
}