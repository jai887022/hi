import React, { useState } from 'react';
import { KanbanTask } from '../types';
import { Plus, Trash2, Calendar, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KanbanBoardProps {
  tasks: KanbanTask[];
  onTasksChange: (tasks: KanbanTask[]) => void;
}

export function KanbanBoard({ tasks, onTasksChange }: KanbanBoardProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isAdding, setIsAdding] = useState(false);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: KanbanTask = {
      id: crypto.randomUUID(),
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      status: 'todo',
      priority: newTaskPriority,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    };

    onTasksChange([newTask, ...tasks]);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPriority('medium');
    setIsAdding(false);
  };

  const updateTaskStatus = (id: string, newStatus: 'todo' | 'in_progress' | 'completed') => {
    const updated = tasks.map(t => (t.id === id ? { ...t, status: newStatus } : t));
    onTasksChange(updated);
  };

  const removeTask = (id: string) => {
    onTasksChange(tasks.filter(t => t.id !== id));
  };

  const columns: { id: 'todo' | 'in_progress' | 'completed'; label: string; bg: string; text: string; icon: any }[] = [
    { id: 'todo', label: 'To Do', bg: 'bg-[#fafafa] border border-slate-100', text: 'text-slate-800', icon: Clock },
    { id: 'in_progress', label: 'In Progress', bg: 'bg-[#fbfbfd] border border-slate-100', text: 'text-[#2563eb]', icon: ArrowRight },
    { id: 'completed', label: 'Completed', bg: 'bg-[#f4fbf7] border border-emerald-50/50', text: 'text-emerald-700', icon: CheckCircle },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-100 shadow-xs p-6" id="kanban-container">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 font-sans tracking-tight">Kanban Task Board</h2>
          <p className="text-xs text-slate-500 mt-0.5">Organize goals and drag state flows</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-slate-50 rounded-lg hover:bg-slate-800 text-xs font-semibold tracking-wide transition-all duration-200"
          id="btn-toggle-add-task"
        >
          <Plus size={14} />
          {isAdding ? 'Cancel' : 'Add Task'}
        </button>
      </div>

      {/* Add Task Expandable Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={addTask}
            className="bg-[#fafafa] border border-slate-100 rounded-xl p-4 mb-5 overflow-hidden flex flex-col gap-3"
            id="add-task-form"
          >
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Title</label>
              <input
                type="text"
                placeholder="What needs to be accomplished?"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2563eb] text-slate-800 transition-all font-sans"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Description (Optional)</label>
              <textarea
                placeholder="Provide task specifics..."
                value={newTaskDesc}
                onChange={e => setNewTaskDesc(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2563eb] text-slate-800 transition-all resize-none font-sans"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Priority:</span>
                <div className="flex bg-slate-100 rounded-md p-0.5">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTaskPriority(p)}
                      className={`px-3 py-1 rounded-sm text-xs font-medium capitalize transition-all ${
                        newTaskPriority === p
                          ? 'bg-white text-slate-900 shadow-xs font-semibold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#2563eb] hover:bg-blue-600 text-white rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer"
                id="btn-add-submit"
              >
                Create Task
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Grid columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-y-auto">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          const ColIcon = col.icon;
          return (
            <div key={col.id} className={`flex flex-col rounded-xl p-4 ${col.bg}`}>
              <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-200 mb-4 ml-1">
                <div className="flex items-center gap-2">
                  <ColIcon size={14} className={col.text} />
                  <span className="text-xs font-bold text-slate-950 uppercase tracking-wider">{col.label}</span>
                </div>
                <span className="text-xs px-2 py-0.5 bg-slate-200/50 text-slate-600 font-mono font-semibold rounded-full">
                  {colTasks.length}
                </span>
              </div>

              <div className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-[150px]">
                <AnimatePresence initial={false}>
                  {colTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-200 rounded-xl h-full min-h-[120px] text-slate-400">
                      <p className="text-[11px] font-medium font-sans">Column is empty</p>
                    </div>
                  ) : (
                    colTasks.map(task => {
                      const priorityColor =
                        task.priority === 'high'
                          ? 'bg-rose-50 text-rose-600 border border-rose-100 font-semibold'
                          : task.priority === 'medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100 font-semibold'
                          : 'bg-slate-50 text-slate-600 border border-slate-100 font-semibold';

                      return (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="bg-white border border-slate-100 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col gap-2 relative group"
                        >
                          <div className="flex justify-between items-start gap-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-sm capitalize tracking-wide ${priorityColor}`}>
                              {task.priority}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => removeTask(task.id)}
                                className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors"
                                title="Delete task"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-slate-900 leading-snug">{task.title}</h4>
                            {task.description && (
                              <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed whitespace-pre-line font-sans">
                                {task.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-1">
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono font-medium">
                              <Calendar size={11} />
                              {task.createdAt}
                            </span>

                            {/* Cycle Controls */}
                            <div className="flex gap-1.5">
                              {col.id !== 'todo' && (
                                <button
                                  onClick={() =>
                                    updateTaskStatus(task.id, col.id === 'completed' ? 'in_progress' : 'todo')
                                  }
                                  className="text-[10px] px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded transition-colors font-medium border border-slate-100"
                                >
                                  ← Back
                                </button>
                              )}
                              {col.id !== 'completed' && (
                                <button
                                  onClick={() =>
                                    updateTaskStatus(task.id, col.id === 'todo' ? 'in_progress' : 'completed')
                                  }
                                  className="text-[10px] px-2 py-1 bg-[#2563eb]/5 hover:bg-[#2563eb]/10 text-[#2563eb] rounded transition-colors font-semibold"
                                >
                                  Move →
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
