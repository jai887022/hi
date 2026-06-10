import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, Sparkles, MessageSquare, ArrowDown, User, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuraChatProps {
  chatHistory: ChatMessage[];
  onAddMessage: (msg: ChatMessage) => void;
  onClearHistory: () => void;
}

export function AuraChat({ chatHistory, onAddMessage, onClearHistory }: AuraChatProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const feedEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setErrorStatus(null);
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    onAddMessage(userMsg);
    setInput('');
    setLoading(true);

    try {
      // Create request payload of history
      const historyPayload = [...chatHistory, userMsg].map(m => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ history: historyPayload }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Server returned an error communicating with Gemini.');
      }

      const data = await res.json();
      
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: data.text,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };

      onAddMessage(assistantMsg);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorStatus(err.message || 'An error occurred. Check your workspace internet connection.');
    } finally {
      setLoading(false);
    }
  };

  // Custom Markdown parsing script for formatted chatbot layouts
  const parseMarkdownCustom = (text: string) => {
    const parseBoldItalicAndCode = (val: string): React.ReactNode => {
      const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
      const parts = val.split(regex);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={i} className="italic text-slate-800">{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[11px] text-rose-600 font-semibold">{part.slice(1, -1)}</code>;
        }
        return part;
      });
    };

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-xs font-bold text-slate-900 mt-2.5 mb-1.5 tracking-tight">{parseBoldItalicAndCode(line.slice(4))}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-xs font-bold text-slate-950 mt-3.5 mb-1.5 tracking-tight">{parseBoldItalicAndCode(line.slice(3))}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="text-sm font-bold text-slate-950 mt-4 [margin-bottom:_0.5rem] tracking-tight border-b border-slate-100 pb-1">{parseBoldItalicAndCode(line.slice(2))}</h2>;
      }

      if (line.startsWith('- ') || line.startsWith('* ')) {
        const itemBody = line.slice(2);
        if (itemBody.startsWith('[ ] ')) {
          return (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 my-0.5 ml-3">
              <span className="w-3.5 h-3.5 rounded border border-slate-300 bg-slate-50 flex-shrink-0" />
              <span>{parseBoldItalicAndCode(itemBody.slice(4))}</span>
            </div>
          );
        }
        if (itemBody.startsWith('[x] ') || itemBody.startsWith('[X] ')) {
          return (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-400 line-through my-0.5 ml-3">
              <span className="w-3.5 h-3.5 rounded border border-slate-300 bg-slate-200 flex items-center justify-center text-[8px] text-slate-700 flex-shrink-0 font-bold">✓</span>
              <span>{parseBoldItalicAndCode(itemBody.slice(4))}</span>
            </div>
          );
        }
        return (
          <div key={idx} className="flex gap-1.5 text-xs text-slate-700 ml-3 my-0.5">
            <span className="text-[#2563eb] select-none">•</span>
            <span>{parseBoldItalicAndCode(itemBody)}</span>
          </div>
        );
      }

      let testList = line.match(/^(\d+)\.\s(.*)/);
      if (testList) {
        return (
          <div key={idx} className="flex gap-1.5 text-xs text-slate-700 ml-3 my-0.5">
            <span className="text-slate-400 font-mono font-medium select-none">{testList[1]}.</span>
            <span>{parseBoldItalicAndCode(testList[2])}</span>
          </div>
        );
      }

      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }

      return <p key={idx} className="text-xs text-slate-600 leading-relaxed my-0.5">{parseBoldItalicAndCode(line)}</p>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden" id="aurachat-container">
      {/* Title banner */}
      <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2563eb]/5 flex items-center justify-center">
            <Sparkles size={16} className="text-[#2563eb]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 font-sans tracking-tight">AI Mind Assist</h3>
            <p className="text-[10px] text-slate-400 font-medium">Aura model: gemini-3.5-flash</p>
          </div>
        </div>
        
        <button
          onClick={onClearHistory}
          disabled={chatHistory.length <= 1}
          className="text-[10px] px-2.1 py-1 rounded bg-slate-100 hover:bg-slate-200/80 text-slate-500 font-medium transition-colors disabled:opacity-40 select-none cursor-pointer"
        >
          Clear Memory
        </button>
      </div>

      {/* Messages listing */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 flex flex-col gap-4">
        {chatHistory.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isUser ? 'bg-slate-800 text-white' : 'bg-blue-50 border border-blue-100 text-[#2563eb]'
                }`}
              >
                {isUser ? <User size={13} /> : <Sparkles size={13} className="animate-pulse" />}
              </div>

              <div className="flex flex-col gap-1">
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-slate-800 text-slate-50 rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-100/70 rounded-tl-none shadow-2xs'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-line font-sans">{msg.text}</p>
                  ) : (
                    <div className="space-y-1.5 prose-sm max-w-none">
                      {parseMarkdownCustom(msg.text)}
                    </div>
                  )}
                </div>
                <span className={`text-[9px] text-slate-400 font-mono ${isUser ? 'text-right mr-1' : 'ml-1'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-2.5 self-start max-w-[85%]">
            <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 text-[#2563eb] flex items-center justify-center flex-shrink-0 animate-spin">
              <Sparkles size={13} />
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl bg-white border border-slate-100 text-xs text-slate-500 rounded-tl-none flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#2563eb] rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-[#2563eb] rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-[#2563eb] rounded-full animate-bounce" />
              <span className="text-[10px] text-slate-400 font-medium ml-1">AI modeling thoughts...</span>
            </div>
          </div>
        )}

        {/* Error placeholder */}
        {errorStatus && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs my-1">
            <AlertCircle size={14} className="stroke-[2.5]" />
            <div className="flex-1">
              <span className="font-semibold block">Incomplete Connection</span>
              <p className="text-[10px] text-rose-600/90 leading-normal mt-0.5">{errorStatus}</p>
            </div>
          </div>
        )}

        <div ref={feedEndRef} />
      </div>

      {/* Input container */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={loading ? "Generating solution..." : "Ask Aura to refine notes, propose schedule, or outline code..."}
          disabled={loading}
          className="flex-grow px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2563eb] focus:bg-white transition-all font-sans"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-3 py-2 bg-[#2563eb] hover:bg-blue-600 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-[#2563eb] cursor-pointer"
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
}
