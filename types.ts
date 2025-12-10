export interface SermonPoint {
  title: string;
  description: string;
  scriptureReference?: string;
}

export interface Sermon {
  id: string;
  title: string;
  theme: string;
  keyVerse: string;
  keyVerseReference: string;
  introduction: string;
  points: SermonPoint[];
  conclusion: string;
  createdAt: number;
}

export interface SuggestedTheme {
  title: string;
  reference: string;
  context: string;
}

export interface SermonFormData {
  topic: string;
  reference?: string;
  audience: 'Geral' | 'Jovens' | 'Liderança' | 'Crianças' | 'Casais' | 'Evangelístico';
  tone: 'Expositivo' | 'Temático' | 'Textual' | 'Devocional';
}

export interface Devotional {
  date: string;
  readingPlan: string; // Ex: Leitura: Salmos 23
  keyVerse: string;
  meditation: string;
  prayer: string;
  actionStep: string; // Um passo prático para o hábito
}

export interface ServiceItem {
  time: string;
  activity: string;
  description: string;
  responsible?: string;
}

export interface ServiceProgram {
  title: string;
  theme: string;
  date: string;
  items: ServiceItem[];
}

export enum AppView {
  HOME = 'HOME',
  IDEAS = 'IDEAS',
  GENERATOR = 'GENERATOR',
  RESULT = 'RESULT',
  HISTORY = 'HISTORY',
  SAVED_DETAIL = 'SAVED_DETAIL',
  TOOLS = 'TOOLS',
  BIBLE = 'BIBLE',
  DICTIONARY = 'DICTIONARY',
  DEVOTIONAL = 'DEVOTIONAL',
  SERVICE_PROGRAM = 'SERVICE_PROGRAM', 
  PAYWALL = 'PAYWALL',
  HELP = 'HELP',
  ADMIN = 'ADMIN' // Nova View de Backend
}

export interface SubscriptionState {
  isPremium: boolean;
  trialEndsAt: number;
  premiumEndsAt: number; // Novo campo para data de fim do premium
  isTrialActive: boolean;
  planName?: string;
}

// --- NOVOS TIPOS PARA O ADMIN ---

export interface AppTheme {
  primaryColor: string; // Hex code
  fontFamily: 'Inter' | 'Merriweather' | 'Roboto' | 'Open Sans';
  fontSizeScale: number; // 1 = 100%, 1.1 = 110%
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  visits: number;
  sermonsGenerated: number;
}

export interface UserFeedback {
  id: string;
  date: number;
  type: 'suggestion' | 'complaint' | 'other';
  message: string;
  contact?: string;
  read: boolean;
}