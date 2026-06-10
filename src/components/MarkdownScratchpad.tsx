import React, { useState } from 'react';
import { NotepadEntry } from '../types';
import { Plus, Edit3, Trash2, Eye, FileText, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MarkdownScratchpadProps {
  notes: NotepadEntry[];
  onNotesChange: (notes: NotepadEntry[]) => void;
}

export function MarkdownScratchpad({ notes, onNotesChange }: MarkdownScratchpadProps) {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id || null);
  const [isEditing, setIsEditing] = useState(true); // Toggle Edit vs Preview Mode for active note
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('Brainstorm');

  const activeNote = notes.find(n => n.id === activeNoteId);

  const addNewNote = () => {
    const id = crypto.randomUUID();
    const entry: NotepadEntry = {
      id,
      title: newNoteTitle.trim() || 'Untitled Session Notes',
      category: newNoteCategory,
      content: `# Untitled Session Notes\n\nUse Markdown to capture thoughts here.\n\n### Today's Topics:\n- ` + "Drafting layout plans\n- Refining workspace integrations\n\n**Tip**: Write with **bolding**, *italics*, or \`inline code\` blocks to see rich rendering directly in preview.",
      updatedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    onNotesChange([entry, ...notes]);
    setActiveNoteId(id);
    setIsEditing(true);
    setNewNoteTitle('');
  };

  const updateActiveNoteContent = (newContent: string) => {
    if (!activeNoteId) return;
    const updated = notes.map(n => {
      if (n.id === activeNoteId) {
        return {
          ...n,
          content: newContent,
          updatedAt: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
      }
      return n;
    });
    onNotesChange(updated);
  };

  const updateActiveNoteTitle = (newTitle: string) => {
    if (!activeNoteId) return;
    const updated = notes.map(n => {
      if (n.id === activeNoteId) {
        return { ...n, title: newTitle };
      }
      return n;
    });
    onNotesChange(updated);
  };

  const updateActiveNoteCategory = (newCat: string) => {
    if (!activeNoteId) return;
    const updated = notes.map(n => {
      if (n.id === activeNoteId) {
        return { ...n, category: newCat };
      }
      return n;
    });
    onNotesChange(updated);
  };

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = notes.filter(n => n.id !== id);
    onNotesChange(filtered);
    if (activeNoteId === id) {
      setActiveNoteId(filtered[0]?.id || null);
    }
  };

  // Custom Markdown parsing render script
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
          return <code key={i} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-xs text-rose-600 font-semibold">{part.slice(1, -1)}</code>;
        }
        return part;
      });
    };

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-bold text-slate-900 mt-4 mb-2 tracking-tight">{parseBoldItalicAndCode(line.slice(4))}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-base font-bold text-slate-900 mt-5 mb-2 tracking-tight">{parseBoldItalicAndCode(line.slice(3))}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="text-xl font-bold text-slate-950 mt-6 mb-3 tracking-tight border-b border-slate-100 pb-1.5">{parseBoldItalicAndCode(line.slice(2))}</h2>;
      }

      // Check lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const itemBody = line.slice(2);
        if (itemBody.startsWith('[ ] ')) {
          return (
            <div key={idx} className="flex items-center gap-2.5 text-sm text-slate-700 my-1 ml-4 py-0.5">
              <span className="w-4 h-4 rounded border border-slate-300 bg-slate-50 flex-shrink-0" />
              <span>{parseBoldItalicAndCode(itemBody.slice(4))}</span>
            </div>
          );
        }
        if (itemBody.startsWith('[x] ') || itemBody.startsWith('[X] ')) {
          return (
            <div key={idx} className="flex items-center gap-2.5 text-sm text-slate-400 line-through my-1 ml-4 py-0.5">
              <span className="w-4 h-4 rounded border border-slate-300 bg-slate-200 flex items-center justify-center text-[10px] text-slate-700 flex-shrink-0 font-bold">✓</span>
              <span>{parseBoldItalicAndCode(itemBody.slice(4))}</span>
            </div>
          );
        }
        return (
          <div key={idx} className="flex gap-2 text-sm text-slate-700 ml-4 my-1">
            <span className="text-[#2563eb] select-none">•</span>
            <span>{parseBoldItalicAndCode(itemBody)}</span>
          </div>
        );
      }

      let testList = line.match(/^(\d+)\.\s(.*)/);
      if (testList) {
        return (
          <div key={idx} className="flex gap-2 text-sm text-slate-700 ml-4 my-1">
            <span className="text-slate-400 font-mono font-semibold select-none">{testList[1]}.</span>
            <span>{parseBoldItalicAndCode(testList[2])}</span>
          </div>
        );
      }

      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      return <p key={idx} className="text-sm text-slate-600 leading-relaxed my-1">{parseBoldItalicAndCode(line)}</p>;
    });
  };

  const categories = ['Brainstorm', 'Project Status', 'Daily Journal', 'Meeting Keynotes', 'Personal'];

  return (
    <div className="flex flex-col lg:flex-row h-full bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden" id="scratchpad-container">
      {/* Sidebar List panel */}
      <div className="w-full lg:w-72 border-r border-slate-100 flex flex-col bg-[#fafafa]">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Workspace Notes</h3>
          <div className="flex flex-col gap-2">
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="New note topic..."
                value={newNoteTitle}
                onChange={e => setNewNoteTitle(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2563eb] text-slate-800 transition-all font-sans"
              />
              <button
                onClick={addNewNote}
                className="p-2 bg-slate-900 text-slate-50 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Create note"
              >
                <Plus size={14} />
              </button>
            </div>
            
            <select
              value={newNoteCategory}
              onChange={e => setNewNoteCategory(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px] text-slate-500 font-medium focus:outline-none focus:border-slate-300 cursor-pointer"
            >
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes index */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5 min-h-[160px] max-h-[300px] lg:max-h-none">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 h-full">
              <FileText size={28} className="text-slate-300 stroke-[1.5] mb-2" />
              <p className="text-xs font-medium font-sans">No notebook logs</p>
            </div>
          ) : (
            notes.map(note => {
              const active = note.id === activeNoteId;
              return (
                <div
                  key={note.id}
                  onClick={() => {
                    setActiveNoteId(note.id);
                    setIsEditing(false); // Default to preview mode for fast reading
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all border flex flex-col gap-1 pr-8 relative group ${
                    active
                      ? 'bg-white border-[#2563eb]/20 shadow-xs'
                      : 'bg-transparent border-transparent hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                    <span className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase font-sans">
                      {note.category}
                    </span>
                  </div>
                  <h4 className={`text-xs font-semibold font-sans truncate ${active ? 'text-[#2563eb]' : 'text-slate-800'}`}>
                    {note.title}
                  </h4>
                  <span className="text-[9px] text-slate-400 font-mono font-medium mt-1">{note.updatedAt}</span>

                  {/* quick delete icon overlay */}
                  <button
                    onClick={(e) => deleteNote(note.id, e)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-rose-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Entry"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Editor / Preview Content space */}
      <div className="flex-1 flex flex-col min-h-[350px]">
        {activeNote ? (
          <div className="flex-1 flex flex-col">
            {/* Action Bar */}
            <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={e => updateActiveNoteTitle(e.target.value)}
                  className="text-base font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-[#2563eb] focus:outline-none transition-all pb-0.5 max-w-sm font-sans"
                />
                
                <select
                  value={activeNote.category}
                  onChange={e => updateActiveNoteCategory(e.target.value)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold tracking-wide text-[10px] capitalize rounded-sm border-0 focus:outline-none cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode Toggle Edit vs Preview */}
              <div className="flex bg-slate-100 rounded-lg p-0.5">
                <button
                  onClick={() => setIsEditing(true)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-all ${
                    isEditing
                      ? 'bg-white text-slate-900 shadow-3xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Markdown Editor"
                >
                  <Edit3 size={12} />
                  Edit
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-all ${
                    !isEditing
                      ? 'bg-white text-slate-900 shadow-3xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="View formatted markdown preview"
                >
                  <Eye size={12} />
                  Preview
                </button>
              </div>
            </div>

            {/* Content box */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col"
                  >
                    <textarea
                      value={activeNote.content}
                      onChange={e => updateActiveNoteContent(e.target.value)}
                      className="w-full flex-1 bg-transparent resize-none focus:outline-none text-slate-800 text-sm leading-relaxed font-mono font-normal min-h-[250px]"
                      placeholder="Input beautiful markdown logs here..."
                    />
                    <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <span>Syntax: # Header | - Bullet | **Bold** | `Code`</span>
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <Check size={11} /> Saved (Local Storage)
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="prose max-w-none text-slate-700"
                  >
                    {activeNote.content.trim() ? (
                      parseMarkdownCustom(activeNote.content)
                    ) : (
                      <em className="text-slate-400 text-xs font-sans">No notes content matching yet...</em>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 bg-[#fafafa]">
            <p className="text-sm font-sans">Select or create a note entry to begin capture</p>
          </div>
        )}
      </div>
    </div>
  );
}
