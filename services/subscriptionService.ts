import { SubscriptionState, AppTheme, DailyStats, UserFeedback } from "../types";

const STORAGE_KEY = 'pregador_subscription_v5'; 
const SALES_KEY = 'pregador_admin_sales_v1';
const DEVICE_ID_KEY = 'pregador_device_id';
const THEME_KEY = 'pregador_theme_config';
const STATS_KEY = 'pregador_daily_stats';
const FEEDBACK_KEY = 'pregador_user_feedback';

const TRIAL_DURATION_MS = 20 * 60 * 1000; // Aumentado para 20 Minutos
const ADMIN_SECRET = 'Papelao1988_Admin'; 
const SALT_KEY = 'PREGADOR_2025_SECURE';

const UNIVERSAL_CODES = ['PAPTECH2025', 'PREGADOR-PRO', '924052039'];

export interface SaleRecord {
  id: string;
  phoneNumber: string;
  deviceId?: string; 
  planName: string;
  price: number;
  date: number;
  key: string;
  durationDays?: number; 
}

// --- Device ID ---
export const getDeviceId = (): string => {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2, 8).toUpperCase();
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
};

// --- THEME MANAGEMENT ---
const DEFAULT_THEME: AppTheme = {
    primaryColor: '#1e3a8a', // Default Blue
    fontFamily: 'Inter',
    fontSizeScale: 1
};

export const getAppTheme = (): AppTheme => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_THEME;
};

export const saveAppTheme = (theme: AppTheme) => {
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));
    // Trigger event for immediate update if needed, usually handled by React State
};

// --- ANALYTICS (STATS) ---
export const trackDailyVisit = () => {
    const today = new Date().toISOString().split('T')[0];
    const stats = getDailyStats();
    
    // Check session to avoid counting reload as new visit
    const sessionKey = `visited_${today}`;
    if (!sessionStorage.getItem(sessionKey)) {
        if (!stats[today]) {
            stats[today] = { date: today, visits: 0, sermonsGenerated: 0 };
        }
        stats[today].visits += 1;
        sessionStorage.setItem(sessionKey, 'true');
        saveDailyStats(stats);
    }
};

export const trackSermonGeneration = () => {
    const today = new Date().toISOString().split('T')[0];
    const stats = getDailyStats();
    
    if (!stats[today]) {
        stats[today] = { date: today, visits: 1, sermonsGenerated: 0 };
    }
    stats[today].sermonsGenerated += 1;
    saveDailyStats(stats);
};

export const getAnalyticsData = (): DailyStats[] => {
    const stats = getDailyStats();
    // Convert object to array and sort by date descending
    return Object.values(stats).sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    ) as DailyStats[];
};

const getDailyStats = (): Record<string, DailyStats> => {
    const stored = localStorage.getItem(STATS_KEY);
    return stored ? JSON.parse(stored) : {};
};

const saveDailyStats = (stats: Record<string, DailyStats>) => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

// --- FEEDBACK SYSTEM ---
export const sendFeedback = (feedback: Omit<UserFeedback, 'id' | 'date' | 'read'>) => {
    const messages = getFeedbackMessages();
    const newMessage: UserFeedback = {
        ...feedback,
        id: Date.now().toString(),
        date: Date.now(),
        read: false
    };
    messages.unshift(newMessage);
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(messages));
};

export const getFeedbackMessages = (): UserFeedback[] => {
    const stored = localStorage.getItem(FEEDBACK_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const markFeedbackRead = (id: string) => {
    const messages = getFeedbackMessages();
    const updated = messages.map(m => m.id === id ? { ...m, read: true } : m);
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(updated));
};

export const deleteFeedbackMessage = (id: string) => {
    const messages = getFeedbackMessages();
    const updated = messages.filter(m => m.id !== id);
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(updated));
};

// --- SALES / ADMIN ---

export const recordSale = (phoneNumber: string, deviceId: string, days: number, key: string) => {
  const sales = getSalesHistory();
  
  let price = 0;
  let planName = '';

  if (days === 7) { price = 1500; planName = 'Semanal'; }
  else if (days === 30) { price = 5000; planName = 'Mensal'; }
  else { price = 0; planName = 'Personalizado'; }

  const newSale: SaleRecord = {
    id: Date.now().toString(),
    phoneNumber,
    deviceId,
    planName,
    price,
    date: Date.now(),
    key,
    durationDays: days 
  };

  sales.unshift(newSale); 
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
};

export const getSalesHistory = (): SaleRecord[] => {
  const stored = localStorage.getItem(SALES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getAdminStats = () => {
  const sales = getSalesHistory();
  const totalRevenue = sales.reduce((acc, curr) => acc + curr.price, 0);
  const totalKeys = sales.length;
  
  const byPlan = {
    'Semanal': sales.filter(s => s.planName === 'Semanal').length,
    'Quinzenal': sales.filter(s => s.planName === 'Quinzenal').length,
    'Mensal': sales.filter(s => s.planName === 'Mensal').length,
  };

  return { totalRevenue, totalKeys, byPlan, recentSales: sales.slice(0, 5) };
};

// --- SUBSCRIPTION LOGIC ---

export const getSubscriptionState = (): SubscriptionState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const now = Date.now();
  
  if (stored) {
    const parsed = JSON.parse(stored);
    const isPremiumActive = parsed.isPremium && (parsed.premiumEndsAt === 0 || parsed.premiumEndsAt > now);
    const isTrialActive = !isPremiumActive && (now < parsed.trialEndsAt);

    return {
      isPremium: isPremiumActive,
      trialEndsAt: parsed.trialEndsAt,
      premiumEndsAt: parsed.premiumEndsAt || 0,
      isTrialActive,
      planName: parsed.planName
    };
  }

  const trialEndsAt = now + TRIAL_DURATION_MS;
  const newState = {
    isPremium: false,
    trialEndsAt,
    premiumEndsAt: 0,
    isTrialActive: true
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  return newState;
};

const generateHash = (phoneNumber: string, deviceId: string): string => {
    if (!phoneNumber) return "";
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const cleanDevice = deviceId.trim().toUpperCase();
    const combined = `${cleanPhone}:${cleanDevice}:${SALT_KEY}`;
    return btoa(combined).replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 8);
};

export const generateClientKey = (phoneNumber: string, targetDeviceId: string, days: number): string => {
  const hash = generateHash(phoneNumber, targetDeviceId);
  return `P${days}-${hash}`; 
};

export const activatePremium = (code: string, phoneNumber: string): boolean => {
  const normalizedCode = code.trim().toUpperCase();
  const normalizedPhone = phoneNumber.replace(/\D/g, '');

  if (UNIVERSAL_CODES.includes(normalizedCode)) {
    savePremiumState(0, "Vitalício");
    return true;
  }

  const parts = normalizedCode.split('-');
  if (parts.length === 2 && parts[0].startsWith('P')) {
      const daysString = parts[0].substring(1); 
      const providedHash = parts[1];
      const days = parseInt(daysString);
      
      const myDeviceId = getDeviceId();
      const expectedHash = generateHash(normalizedPhone, myDeviceId);

      if (providedHash === expectedHash && !isNaN(days)) {
          const durationMs = days * 24 * 60 * 60 * 1000;
          const expiryDate = Date.now() + durationMs;
          
          let planName = `${days} Dias`;
          if (days === 30) planName = "Mensal";
          if (days === 7) planName = "Semanal";
          
          savePremiumState(expiryDate, planName);
          return true;
      }
  }
  
  return false;
};

export const revokePremium = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const parsed = stored ? JSON.parse(stored) : {};

  const newState = {
    ...parsed,
    isPremium: false,
    premiumEndsAt: 0,
    isTrialActive: false,
    planName: undefined
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
};

const savePremiumState = (expiryDate: number, planName: string) => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const parsed = stored ? JSON.parse(stored) : {};

  const newState = {
    ...parsed,
    isPremium: true,
    premiumEndsAt: expiryDate, 
    isTrialActive: false,
    planName: planName
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
};

export const getDaysRemaining = (timestamp: number): number => {
  if (timestamp === 0) return 999;
  const now = Date.now();
  const diff = timestamp - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const getMinutesRemaining = (timestamp: number): number => {
    const now = Date.now();
    const diff = timestamp - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60)));
};

export const isAdminCode = (code: string): boolean => {
    return code === ADMIN_SECRET;
}