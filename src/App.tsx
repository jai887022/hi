import { useState, useEffect } from 'react';
import { KanbanTask, NotepadEntry, ChatMessage } from './types';
import { KanbanBoard } from './components/KanbanBoard';
import { MarkdownScratchpad } from './components/MarkdownScratchpad';
import { PomodoroTimer } from './components/PomodoroTimer';
import { AuraChat } from './components/AuraChat';
import {
  LayoutGrid,
  CheckSquare,
  FileText,
  Timer,
  Sparkles,
  Activity,
  Sunrise,
  Sunset,
  Sun,
  Moon,
  Zap,
  Edit2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Default initial baseline data to enrich first load
const defaultTasks: KanbanTask[] = [
  {
    id: 't-1',
    title: 'Setup production full-stack server integration',
    description: 'Ensure Express is proxying Gemini calls safely and API routes take first priority.',
    status: 'completed',
    priority: 'high',
    createdAt: 'Jun 10',
  },
  {
    id: 't-2',
    title: 'Design bento-grid landing workspace dashboard',
    description: 'Create high-contrast layout grids, typography configurations, and beautiful micro-animations.',
    status: 'in_progress',
    priority: 'medium',
    createdAt: 'Jun 10',
  },
  {
    id: 't-3',
    title: 'Leverage Aura AI for drafting workspace strategies',
    description: 'Query Gemini assistant to structure project milestones and export lists directly to Scratchpad.',
    status: 'todo',
    priority: 'low',
    createdAt: 'Jun 10',
  },
];

const defaultNotes: NotepadEntry[] = [
  {
    id: 'n-1',
    title: 'Aura Launch & Directives',
    category: 'Project Status',
    content: `# Aura launch & directives\n\nWelcome to your **Aura Personal Workspace**! This is your ultimate hub for flow state productivity. Keep it clean and distraction-free.\n\n### Core Workspace Capabilities:\n- **Interactive Kanban Board**: Create task nodes and transition statuses.\n- **Markdown Notepad**: Live split preview with dynamic inline styling.\n- **Focus Clock Timer**: Visual circular progress bar supporting standard Pomodoro intervals.\n- **AI Companion Mind Assist**: Ask questions, build outlines, and stay inspired!`,
    updatedAt: 'Jun 10, 05:47 AM',
  },
];

const defaultChat: ChatMessage[] = [
  {
    id: 'c-1',
    role: 'model',
    text: "Greetings. I am **Aura**, your encouraging personal productivity companion. I am linked server-side to help compile lists, draft documentation, or motivate deep focus sessions. How may I assist your workspace flow today?",
    timestamp: '05:47 AM',
  },
];

export default function App() {
  const [tasks, setTasks] = useState<KanbanTask[]>(() => {
    const local = localStorage.getItem('aura_tasks');
    return local ? JSON.parse(local) : defaultTasks;
  });

  const [notes, setNotes] = useState<NotepadEntry[]>(() => {
    const local = localStorage.getItem('aura_notes');
    return local ? JSON.parse(local) : defaultNotes;
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const local = localStorage.getItem('aura_chat');
    return local ? JSON.parse(local) : defaultChat;
  });

  const [activeTab, setActiveTab] = useState<'grid' | 'tasks' | 'notes' | 'clock' | 'chat'>('grid');
  const [userName, setUserName] = useState(() => localStorage.getItem('aura_user_name') || 'Productive Thinker');
  const [isEditingName, setIsEditingName] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Save states to local storage
  useEffect(() => {
    localStorage.setItem('aura_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('aura_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('aura_chat', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem('aura_user_name', userName);
  }, [userName]);

  // Keep Clock Tick
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Personalized time-of-day greeting
  const getGreeting = () => {
    const hours = currentTime.getHours();
    if (hours < 12) return { text: 'Good Morning', icon: Sunrise, color: 'text-amber-500' };
    if (hours < 18) return { text: 'Good Afternoon', icon: Sun, color: 'text-amber-500' };
    const nightIcon = hours < 22 ? Sunset : Moon;
    const nightColor = hours < 22 ? 'text-rose-500' : 'text-sky-400';
    return { text: 'Good Evening', icon: nightIcon, color: nightColor };
  };

  const greeting = getGreeting();
  const completedTaskCount = tasks.filter(t => t.status === 'completed').length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedTaskCount / tasks.length) * 100) : 0;

  const navigateToTab = (tab: 'grid' | 'tasks' | 'notes' | 'clock' | 'chat') => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="app-root-shell">
      {/* Top visual accent rule */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-rose-500 to-emerald-500 w-full" />

      {/* Main Container */}
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 flex-1 flex flex-col gap-6">
        {/* Header Block */}
        <header className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-3xs ${greeting.color}`}>
              <greeting.icon size={24} className="stroke-[1.8]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aura Workspace</span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              </div>
              <div className="flex items-center gap-2.5 mt-0.5">
                <h1 className="text-xl font-bold text-slate-950 tracking-tight flex items-center gap-2">
                  {greeting.text},
                  {isEditingName ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={userName}
                        onChange={e => setUserName(e.target.value)}
                        className="bg-slate-100 border-b-2 border-blue-500 text-slate-950 px-2 py-0.5 text-lg font-bold rounded-lg focus:outline-none max-w-[180px]"
                        autoFocus
                      />
                      <button
                        onClick={() => setIsEditingName(false)}
                        className="p-1 hover:bg-slate-100 rounded text-emerald-600 transition-colors"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 group">
                      <span>{userName}</span>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="p-1 text-slate-400 hover:text-[#2563eb] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Edit name"
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  )}
                </h1>
              </div>
            </div>
          </div>

          {/* Productivity metrics strip */}
          <div className="flex items-center flex-wrap gap-4 sm:gap-6 md:self-center bg-[#fafafa] border border-slate-100 p-4 rounded-xl">
            {/* Clock ticker */}
            <div className="flex flex-col pr-4 sm:pr-6 border-r border-slate-200">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-0.5">System Clock</span>
              <span className="text-sm font-semibold font-mono text-slate-800 tracking-tight mt-0.5">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            {/* Task completion rate percentage indicator bar */}
            <div className="flex flex-col min-w-[120px]">
              <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-slate-400">
                <span>Task Completed</span>
                <span className="font-mono text-slate-700">{progressPercentage}%</span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="h-1.5 bg-slate-250 flex-grow rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                  {completedTaskCount}/{tasks.length}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Navigation Tabs Row */}
        <nav className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-100 shadow-3xs self-start" id="app-nav-row">
          <button
            onClick={() => navigateToTab('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'grid'
                ? 'bg-slate-900 text-slate-50 shadow-xs'
                : 'text-slate-500 hover:text-slate-950Hover hover:bg-slate-50'
            }`}
          >
            <LayoutGrid size={13} />
            Unified Grid
          </button>
          
          <button
            onClick={() => navigateToTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-slate-900 text-slate-50 shadow-xs'
                : 'text-slate-500 hover:text-slate-950Hover hover:bg-slate-50'
            }`}
          >
            <CheckSquare size={13} />
            Task Board
          </button>

          <button
            onClick={() => navigateToTab('notes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-slate-900 text-slate-50 shadow-xs'
                : 'text-slate-500 hover:text-slate-950Hover hover:bg-slate-50'
            }`}
          >
            <FileText size={13} />
            Scratchpad Notes
          </button>

          <button
            onClick={() => navigateToTab('clock')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'clock'
                ? 'bg-slate-900 text-slate-50 shadow-xs'
                : 'text-slate-500 hover:text-slate-950Hover hover:bg-slate-50'
            }`}
          >
            <Timer size={13} />
            Focus Clock
          </button>

          <button
            onClick={() => navigateToTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-slate-900 text-slate-50 shadow-xs'
                : 'text-slate-500 hover:text-slate-950Hover hover:bg-slate-50'
            }`}
          >
            <Sparkles size={13} />
            AI Mind Assist
          </button>
        </nav>

        {/* Dynamic Display workspace views */}
        <main className="flex-grow flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === 'grid' && (
              <motion.div
                key="grid-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.18 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch"
                id="view-grid-shell"
              >
                {/* Left hand modules: tasks & notes in columns */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <div className="h-[450px]">
                    <KanbanBoard tasks={tasks} onTasksChange={setTasks} />
                  </div>
                  <div className="h-[430px]">
                    <MarkdownScratchpad notes={notes} onNotesChange={setNotes} />
                  </div>
                </div>

                {/* Right hand side elements: chat & clock */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="h-[360px]">
                    <PomodoroTimer
                      onSessionComplete={(mode) => {
                        const alertText =
                          mode === 'work'
                            ? "Splendid focus session finished! Prepare for short break."
                            : "Rest period elapsed. Return to focus workflow.";
                        
                        // Push an inline chat helper notice automatically so Aura assists them dynamically
                        const helperMsg: ChatMessage = {
                          id: crypto.randomUUID(),
                          role: 'model',
                          text: `***[System Event] Timer complete:*** *${alertText}*`,
                          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        };
                        setChatHistory(prev => [...prev, helperMsg]);
                      }}
                    />
                  </div>
                  <div className="h-[520px]">
                    <AuraChat
                      chatHistory={chatHistory}
                      onAddMessage={(msg) => setChatHistory(prev => [...prev, msg])}
                      onClearHistory={() => setChatHistory(defaultChat)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'tasks' && (
              <motion.div
                key="tasks-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.18 }}
                className="h-[750px] flex flex-col"
                id="view-tasks-shell"
              >
                <KanbanBoard tasks={tasks} onTasksChange={setTasks} />
              </motion.div>
            )}

            {activeTab === 'notes' && (
              <motion.div
                key="notes-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.18 }}
                className="h-[750px] flex flex-col"
                id="view-notes-shell"
              >
                <MarkdownScratchpad notes={notes} onNotesChange={setNotes} />
              </motion.div>
            )}

            {activeTab === 'clock' && (
              <motion.div
                key="clock-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.18 }}
                className="max-w-md mx-auto w-full h-[450px]"
                id="view-clock-shell"
              >
                <PomodoroTimer />
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div
                key="chat-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.18 }}
                className="h-[650px] flex flex-col"
                id="view-chat-shell"
              >
                <AuraChat
                  chatHistory={chatHistory}
                  onAddMessage={(msg) => setChatHistory(prev => [...prev, msg])}
                  onClearHistory={() => setChatHistory(defaultChat)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <footer className="py-5 border-t border-slate-100 bg-white text-center text-[10px] text-slate-400 font-sans tracking-wide">
        <span>Aura Personal Dashboard System | Directives logged server-side and persistent.</span>
      </footer>
    </div>
  );
}
