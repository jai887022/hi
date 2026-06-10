import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CupSoda, BrainCircuit, Waves } from 'lucide-react';
import { motion } from 'motion/react';

interface PomodoroTimerProps {
  onSessionComplete?: (mode: 'work' | 'short_break' | 'long_break') => void;
}

export function PomodoroTimer({ onSessionComplete }: PomodoroTimerProps) {
  const [mode, setMode] = useState<'work' | 'short_break' | 'long_break'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getPresetDuration = (m: 'work' | 'short_break' | 'long_break') => {
    switch (m) {
      case 'work': return 25 * 60;
      case 'short_break': return 5 * 60;
      case 'long_break': return 15 * 60;
    }
  };

  useEffect(() => {
    setTimeLeft(getPresetDuration(mode));
    setIsRunning(false);
  }, [mode]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            // Alert completed
            onSessionComplete?.(mode);
            // Switch mode preset automatically or stay
            const nextMode = mode === 'work' ? 'short_break' : 'work';
            setMode(nextMode);
            return getPresetDuration(nextMode);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, onSessionComplete]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getPresetDuration(mode));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // SVG Progress calculation
  const total = getPresetDuration(mode);
  const fraction = timeLeft / total;
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  // Offset calculated dynamically
  const strokeDashoffset = circumference * (1 - fraction);

  const presets = [
    { id: 'work', label: 'Work Focus', icon: BrainCircuit, color: 'text-rose-500 bg-rose-50 border-rose-100' },
    { id: 'short_break', label: 'Short Break', icon: CupSoda, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { id: 'long_break', label: 'Long Break', icon: Waves, color: 'text-sky-600 bg-sky-50 border-sky-100' },
  ] as const;

  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-xs p-6 h-full text-center" id="pomodoro-container">
      <div>
        <h2 className="text-lg font-semibold text-slate-950 font-sans tracking-tight">Focus Clock</h2>
        <p className="text-xs text-slate-500 mt-0.5">Control work cycles and wellness intervals</p>
      </div>

      {/* Preset Pickers */}
      <div className="flex justify-center gap-1.5 mt-5 mb-6 bg-slate-100 p-1 rounded-xl">
        {presets.map(p => {
          const active = mode === p.id;
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => setMode(p.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                active
                  ? 'bg-white text-slate-950 shadow-3xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon size={12} className={active ? 'stroke-[2.5]' : 'stroke-[1.5]'} />
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Circle Graphic Clock */}
      <div className="relative flex items-center justify-center my-2">
        <svg className="w-40 h-40 transform -rotate-90">
          {/* Outer Ring boundary background */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-slate-100 fill-transparent"
            strokeWidth="6"
          />
          {/* Dynamic dynamic foreground percentage ring */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className={`transition-all duration-300 fill-transparent ${
              mode === 'work' ? 'stroke-rose-500' : mode === 'short_break' ? 'stroke-emerald-500' : 'stroke-sky-500'
            }`}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Floating precise numerals */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            key={timeLeft}
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            className="text-3xl font-black font-mono tracking-tight text-slate-900"
          >
            {formatTime(timeLeft)}
          </motion.div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">
            {mode === 'work' ? 'Focusing' : 'Resting'}
          </span>
        </div>
      </div>

      {/* Timing functional controls */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={resetTimer}
          className="p-2.5 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl transition-all cursor-pointer"
          title="Reset timer"
        >
          <RotateCcw size={16} />
        </button>

        <button
          onClick={toggleTimer}
          className={`p-4 text-white rounded-2xl shadow-md transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer ${
            isRunning
              ? 'bg-slate-900 shadow-slate-900/10'
              : mode === 'work'
              ? 'bg-rose-500 shadow-rose-500/10'
              : mode === 'short_break'
              ? 'bg-emerald-500 shadow-emerald-500/10'
              : 'bg-sky-500 shadow-sky-500/10'
          }`}
          title={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? <Pause size={20} className="fill-white" /> : <Play size={20} className="fill-white translate-x-0.5" />}
        </button>
      </div>

      {/* Little micro tip banner */}
      <p className="text-[10px] text-slate-400 mt-5 font-sans font-medium">
        {mode === 'work'
          ? "Keep distraction blocked | Time will tick passively in background."
          : "Grab a replenishment glass and rest your eyes."}
      </p>
    </div>
  );
}
