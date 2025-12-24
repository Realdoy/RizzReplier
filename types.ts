export enum Speaker {
  ME = 'me',
  THEM = 'them',
}

export interface ChatTurn {
  id: string;
  speaker: Speaker;
  text: string;
}

export interface NormalizedChat {
  turns: ChatTurn[];
}

export enum Tone {
  PLAYFUL = 'Playful',
  CHARMING = 'Charming',
  DIRECT = 'Direct',
  FUNNY = 'Funny',
  LOWKEY = 'Low-key',
  RESPECTFUL = 'Respectful',
}

export enum Length {
  SHORT = 'Short',
  MEDIUM = 'Medium',
  LONG = 'Long',
}

export enum Intent {
  KEEP_GOING = 'Keep conversation going',
  ASK_QUESTION = 'Ask a question',
  PROPOSE_PLAN = 'Propose a plan',
  COMPLIMENT = 'Compliment',
  RECOVER = 'Recover from awkwardness',
  CLOSE_POLITELY = 'Close politely',
}

export interface GenerationSettings {
  tone: Tone;
  length: Length;
  boldness: number; // 0 to 1
  intent: Intent;
  includeEmoji: boolean;
  language: string;
  spicyMode: boolean;
}

export interface Suggestion {
  label: string;
  text: string;
}

export interface AvoidItem {
  text: string;
  reason: string;
}

export interface GenerationResult {
  mode: 'normal' | 'closure';
  detected_language: string;
  safety_flags: string[];
  suggestions: Suggestion[];
  avoid?: AvoidItem[];
}

export interface Session {
  id: string;
  createdAt: number;
  imageUrl?: string;
  extractedChat: NormalizedChat;
  settings: GenerationSettings;
  result?: GenerationResult;
}

export interface Thread {
  id: string;
  contactName: string; // e.g., "Jeremy"
  updatedAt: number;
  extractedChat: NormalizedChat;
  settings: GenerationSettings;
  previewText?: string;
}