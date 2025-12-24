import { Thread, NormalizedChat, GenerationSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

const STORAGE_KEY = 'rizz_app_threads';

export const storageService = {
  getThreads: (): Thread[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const threads: Thread[] = JSON.parse(data);
      return threads.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (e) {
      console.error("Failed to load threads", e);
      return [];
    }
  },

  saveThread: (thread: Thread) => {
    try {
      const threads = storageService.getThreads();
      const index = threads.findIndex(t => t.id === thread.id);
      
      // Update preview text from last message
      const lastTurn = thread.extractedChat.turns[thread.extractedChat.turns.length - 1];
      const previewText = lastTurn ? lastTurn.text : "New Conversation";
      const updatedThread = { ...thread, updatedAt: Date.now(), previewText };

      if (index >= 0) {
        threads[index] = updatedThread;
      } else {
        threads.unshift(updatedThread);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
      return updatedThread;
    } catch (e) {
      console.error("Failed to save thread", e);
      throw e;
    }
  },

  deleteThread: (id: string) => {
    try {
      const threads = storageService.getThreads().filter(t => t.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    } catch (e) {
      console.error("Failed to delete thread", e);
    }
  },

  createThread: (contactName: string): Thread => {
    return {
      id: crypto.randomUUID(),
      contactName,
      updatedAt: Date.now(),
      extractedChat: { turns: [] },
      settings: { ...DEFAULT_SETTINGS },
      previewText: 'No messages yet'
    };
  }
};