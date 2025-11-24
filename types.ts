export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isAi?: boolean;
}

export interface ChatSession {
  id: string;
  name: string;
  avatar: string;
  messages: Message[];
  lastMessage: string;
  timestamp: number;
  isOnline: boolean;
  type: 'direct' | 'group' | 'ai';
}

export interface CallLog {
  id: string;
  name: string;
  type: 'audio' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  duration: string; // e.g., "5m 23s"
  timestamp: number;
}

export enum AppView {
  CHATS = 'CHATS',
  CALLS = 'CALLS',
  LIVE_AI = 'LIVE_AI',
  DASHBOARD = 'DASHBOARD',
  SETTINGS = 'SETTINGS',
  KEYPAD = 'KEYPAD'
}