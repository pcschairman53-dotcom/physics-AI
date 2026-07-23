export type ActivityIcon = 'award' | 'activity' | 'zap' | 'brain';

export interface Activity {
  id: string;
  text: string;
  textBn: string;
  timestamp: number;
  icon: ActivityIcon;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  quizzesCompleted: number;
  simsExplored: number;
  lastVisitDate: string | null;
  activities: Activity[];
}

const STORAGE_KEY = 'pcs-physics-progress';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function defaultActivities(): Activity[] {
  const now = Date.now();
  return [
    {
      id: 'seed-1',
      text: 'Completed Kinematics Quiz with 100% score',
      textBn: 'Kinematics Quiz 100% স্কোরে সম্পন্ন',
      timestamp: now - 2 * 60 * 60 * 1000,
      icon: 'award',
    },
    {
      id: 'seed-2',
      text: 'Explored Simple Harmonic Pendulum Simulation',
      textBn: 'Simple Harmonic Pendulum Simulation explore করেছেন',
      timestamp: now - 24 * 60 * 60 * 1000,
      icon: 'activity',
    },
    {
      id: 'seed-3',
      text: 'Solved Gravitational Attraction using Formula Solver',
      textBn: 'Formula Solver দিয়ে Gravitational Attraction solve করেছেন',
      timestamp: now - 2 * 24 * 60 * 60 * 1000,
      icon: 'zap',
    },
  ];
}

const DEFAULT_STATS: UserStats = {
  xp: 1250,
  level: 2,
  streak: 5,
  quizzesCompleted: 4,
  simsExplored: 3,
  lastVisitDate: null,
  activities: defaultActivities(),
};

function updateStreak(stats: UserStats): UserStats {
  const today = todayStr();
  if (!stats.lastVisitDate) {
    return { ...stats, lastVisitDate: today, streak: Math.max(1, stats.streak) };
  }
  if (stats.lastVisitDate === today) return stats;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (stats.lastVisitDate === yesterdayStr) {
    return { ...stats, lastVisitDate: today, streak: stats.streak + 1 };
  }

  return { ...stats, lastVisitDate: today, streak: 1 };
}

export function loadUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return updateStreak({ ...DEFAULT_STATS, lastVisitDate: todayStr() });
    return updateStreak(JSON.parse(raw) as UserStats);
  } catch {
    return updateStreak({ ...DEFAULT_STATS, lastVisitDate: todayStr() });
  }
}

export function saveUserStats(stats: UserStats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function calcLevel(xp: number) {
  return Math.floor(xp / 1000) + 1;
}

export function addActivity(
  stats: UserStats,
  activity: Omit<Activity, 'id'>
): UserStats {
  const entry: Activity = {
    ...activity,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };
  return {
    ...stats,
    activities: [entry, ...stats.activities].slice(0, 10),
  };
}

export function formatRelativeTime(timestamp: number, lang: 'en' | 'bn'): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return lang === 'bn' ? 'এইমাত্র' : 'Just now';
  if (mins < 60) return lang === 'bn' ? `${mins} মিনিট আগে` : `${mins} min ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return lang === 'bn' ? `${hours} ঘণ্টা আগে` : `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return lang === 'bn' ? `${days} দিন আগে` : `${days}d ago`;
}
