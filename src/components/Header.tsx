import React from 'react';
import { Menu, X, Sparkles, Brain, Award, GraduationCap, Calculator, Languages, BookOpen } from 'lucide-react';
import { t, type Lang } from '../i18n';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userStats: {
    xp: number;
    level: number;
    streak: number;
  };
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, userStats, lang, setLang }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: t(lang, 'dashboard'), icon: GraduationCap },
    { id: 'assistant', label: t(lang, 'assistant'), icon: Brain },
    { id: 'simlab', label: t(lang, 'simlab'), icon: Sparkles },
    { id: 'formulas', label: t(lang, 'formulas'), icon: Calculator },
    { id: 'quizzes', label: t(lang, 'quizzes'), icon: Award },
    { id: 'chapters', label: t(lang, 'chapters'), icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-3 sm:flex-nowrap sm:px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex min-w-0 flex-1 items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/20 sm:h-10 sm:w-10">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Ω</span>
            </div>
            {/* Pulsing ring */}
            <span className="absolute -inset-0.5 rounded-xl bg-cyan-500/30 blur opacity-40 animate-pulse"></span>
          </div>
          <div className="min-w-0">
            <span className="block text-base font-black tracking-wider text-white sm:text-lg">PCS PHYSICS <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">AI</span></span>
            <span className="block text-[10px] text-slate-400 tracking-widest font-mono uppercase">{t(lang, 'platform')}</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-900 text-cyan-400 border border-slate-800 shadow-inner shadow-cyan-950/50'
                    : 'text-slate-300 hover:bg-slate-900/50 hover:text-white'
                }`}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping mr-0.5"></span>}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Stats Widget */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="flex items-center space-x-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-cyan-500/40 transition-colors"
            title={lang === 'en' ? 'Switch to Bengali' : 'Switch to English'}
          >
            <Languages className="h-3.5 w-3.5" />
            <span>{lang === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* Streak */}
          <div className="flex items-center space-x-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800 text-sm font-semibold text-orange-400">
            <span>🔥</span>
            <span>{userStats.streak} {t(lang, 'dayStreak')}</span>
          </div>

          {/* Level & XP */}
          <div className="flex items-center space-x-3 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-800">
            <div className="text-xs text-slate-400 font-mono">
              LEVEL <span className="text-purple-400 font-bold">{userStats.level}</span>
            </div>
            <div className="h-4 w-[1px] bg-slate-700"></div>
            <div className="text-xs text-slate-400 font-mono">
              <span className="text-cyan-400 font-bold">{userStats.xp}</span> XP
            </div>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center space-x-2">
          {/* Mobile Stats */}
          <div className="flex items-center space-x-1 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800 text-xs font-mono">
            <span className="text-cyan-400 font-bold">{userStats.xp}</span>
            <span className="text-slate-500">XP</span>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white focus:outline-none"
          >
            {isMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-lg px-3 pb-3 pt-2 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMenuOpen(false);
                }}
                className={`flex w-full items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors sm:text-base ${
                  isActive
                    ? 'bg-slate-900 text-cyan-400 border border-slate-800'
                    : 'text-slate-300 hover:bg-slate-900/50 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 px-2 pt-4 text-sm font-mono text-slate-400">
            <div className="flex items-center space-x-1">
              <span>🔥 Streak:</span>
              <span className="text-orange-400 font-bold">{userStats.streak} days</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>Level:</span>
              <span className="text-purple-400 font-bold">{userStats.level}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
