/**
 * Shared types and configurations for Aura Personal Workspace
 */

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface NotepadEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface FocusSession {
  mode: 'work' | 'short_break' | 'long_break';
  durationMinutes: number;
}
