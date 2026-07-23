import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FormulaBackground } from './components/FormulaBackground';
import { DashboardOverview } from './components/DashboardOverview';
import { AiAssistant } from './components/AiAssistant';
import { SimLab } from './components/SimLab';
import { FormulaSolver } from './components/FormulaSolver';
import { QuizDashboard } from './components/QuizDashboard';
import { ChapterLearning } from './components/ChapterLearning';
import type { Lang } from './i18n';
import {
  loadUserStats,
  saveUserStats,
  addActivity,
  calcLevel,
  type UserStats,
} from './lib/userProgress';

function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [lang, setLang] = useState<Lang>('bn');
  const [userStats, setUserStats] = useState<UserStats>(() => loadUserStats());

  useEffect(() => {
    saveUserStats(userStats);
  }, [userStats]);

  const awardXp = (xpGain: number, activity: Parameters<typeof addActivity>[1]) => {
    setUserStats((prev) => {
      const nextXp = prev.xp + xpGain;
      const withActivity = addActivity(prev, activity);
      return {
        ...withActivity,
        xp: nextXp,
        level: calcLevel(nextXp),
      };
    });
  };

  const handleSimExplored = (simName?: string) => {
    setUserStats((prev) => {
      const nextSimsCount = prev.simsExplored + 1;
      const xpGain = 25;
      const nextXp = prev.xp + xpGain;
      const withActivity = addActivity(prev, {
        text: simName ? `Explored ${simName}` : 'Explored an interactive simulation',
        textBn: simName ? `${simName} explore করেছেন` : 'Interactive simulation explore করেছেন',
        timestamp: Date.now(),
        icon: 'activity',
      });
      return {
        ...withActivity,
        simsExplored: nextSimsCount,
        xp: nextXp,
        level: calcLevel(nextXp),
      };
    });
  };

  const handleQuizCompleted = (xpEarned: number, quizTitle: string, scorePct: number) => {
    setUserStats((prev) => {
      const nextQuizzesCount = prev.quizzesCompleted + 1;
      const nextXp = prev.xp + xpEarned;
      const withActivity = addActivity(prev, {
        text: `Completed ${quizTitle} with ${scorePct}% score (+${xpEarned} XP)`,
        textBn: `${quizTitle} ${scorePct}% স্কোরে সম্পন্ন (+${xpEarned} XP)`,
        timestamp: Date.now(),
        icon: 'award',
      });
      return {
        ...withActivity,
        quizzesCompleted: nextQuizzesCount,
        xp: nextXp,
        level: calcLevel(nextXp),
      };
    });
  };

  const handleFormulaSolved = (formulaName: string) => {
    awardXp(10, {
      text: `Solved ${formulaName} using Formula Solver`,
      textBn: `Formula Solver দিয়ে ${formulaName} solve করেছেন`,
      timestamp: Date.now(),
      icon: 'zap',
    });
  };

  return (
    <div className="relative min-h-screen min-w-0 text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      <FormulaBackground />

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userStats={userStats}
        lang={lang}
        setLang={setLang}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 relative z-10">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            setActiveTab={setActiveTab}
            userStats={userStats}
            lang={lang}
          />
        )}
        {activeTab === 'assistant' && (
          <AiAssistant onSimExplored={handleSimExplored} />
        )}
        {activeTab === 'simlab' && (
          <SimLab onSimExplored={handleSimExplored} />
        )}
        {activeTab === 'formulas' && (
          <FormulaSolver onFormulaSolved={handleFormulaSolved} />
        )}
        {activeTab === 'quizzes' && (
          <QuizDashboard onQuizCompleted={handleQuizCompleted} />
        )}
        {activeTab === 'chapters' && (
          <ChapterLearning lang={lang} />
        )}
      </main>

      <footer className="w-full py-4 sm:py-6 mt-6 sm:mt-10 lg:mt-12 border-t border-slate-900 bg-slate-950/40 backdrop-blur-md relative z-10">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">PCS PHYSICS AI</span>
            <span className="text-xs text-slate-500 font-mono">| © {new Date().getFullYear()} All Rights Reserved</span>
          </div>
          <div className="flex gap-4 text-xs font-mono text-slate-500">
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">Quantum Mechanics Core v5.0</span>
            <span>•</span>
            <span className="hover:text-purple-400 cursor-pointer transition-colors">
              {lang === 'bn' ? 'Progress auto-save চালু' : 'Progress auto-save active'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
