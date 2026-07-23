import React from 'react';
import { ArrowRight, Brain, Sparkles, Award, Activity, Zap, ChevronRight } from 'lucide-react';
import { t, getGreeting, type Lang } from '../i18n';
import { formatRelativeTime, type Activity as UserActivity, type UserStats } from '../lib/userProgress';

interface DashboardOverviewProps {
  setActiveTab: (tab: string) => void;
  userStats: UserStats;
  lang: Lang;
}

const activityIcons = {
  award: Award,
  activity: Activity,
  zap: Zap,
  brain: Brain,
};

const activityColors: Record<UserActivity['icon'], string> = {
  award: 'text-emerald-400 bg-emerald-950/40 border-emerald-800',
  activity: 'text-cyan-400 bg-cyan-950/40 border-cyan-800',
  zap: 'text-purple-400 bg-purple-950/40 border-purple-800',
  brain: 'text-blue-400 bg-blue-950/40 border-blue-800',
};

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ setActiveTab, userStats, lang }) => {
  // Topics list with progress
  const topics = [
    { id: 'mech', name: 'Classical Mechanics', progress: 85, color: 'from-cyan-500 to-blue-500', count: '12/15 Completed', level: 'Intermediate' },
    { id: 'em', name: 'Electromagnetism', progress: 60, color: 'from-purple-500 to-pink-500', count: '9/15 Completed', level: 'Intermediate' },
    { id: 'thermo', name: 'Thermodynamics', progress: 40, color: 'from-orange-500 to-amber-500', count: '6/15 Completed', level: 'Beginner' },
    { id: 'quantum', name: 'Quantum Physics', progress: 20, color: 'from-emerald-500 to-teal-500', count: '3/15 Completed', level: 'Advanced' },
  ];

  // Quick simulation triggers
  const featuredSims = [
    {
      title: 'Projectile Trajectory Lab',
      desc: 'Analyze air drag, launch angles, and gravitational effects on 2D projectiles.',
      category: 'Mechanics',
      difficulty: 'Easy',
      xp: '+100 XP',
    },
    {
      title: 'Electrostatic Field Lines',
      desc: 'Plot positive & negative charges to map complex field lines and electric potential vectors.',
      category: 'Electromagnetism',
      difficulty: 'Medium',
      xp: '+150 XP',
    },
    {
      title: 'Double Slit Wave Interference',
      desc: 'Simulate laser diffraction, slit spacing, and interference patterns on physical screens.',
      category: 'Wave Optics',
      difficulty: 'Hard',
      xp: '+200 XP',
    },
  ];

  const recentActivities = userStats.activities;

  // Calculate percentage to next level (1000 XP per level)
  const xpInCurrentLevel = userStats.xp % 1000;
  const xpPercentage = (xpInCurrentLevel / 1000) * 100;
  const xpNeeded = 1000 - xpInCurrentLevel;

  return (
    <div className="space-y-6 pb-8 sm:space-y-8 sm:pb-10 lg:pb-12">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/40 p-5 sm:p-8 lg:p-10 xl:p-12 backdrop-blur-md">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-[100px]"></div>
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-purple-500/10 blur-[100px]"></div>

        <div className="relative z-10 max-w-3xl space-y-4 sm:space-y-6">
          <div className="inline-flex items-center space-x-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1.5 text-xs font-semibold text-cyan-400 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>{t(lang, 'engineActive')}</span>
          </div>

          <p className="text-sm font-medium text-cyan-400/90">{getGreeting(lang)} 👋</p>

          <h1 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            {t(lang, 'heroTitle')} <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              {t(lang, 'heroHighlight')}
            </span>
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base lg:text-lg">
            {t(lang, 'heroDesc')}
          </p>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4">
            <button
              onClick={() => setActiveTab('assistant')}
              className="group flex min-h-12 items-center justify-center space-x-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0 sm:px-6"
            >
              <Brain className="h-4 w-4 text-white" />
              <span>{t(lang, 'launchAi')}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => setActiveTab('simlab')}
              className="flex min-h-12 items-center justify-center space-x-2 rounded-xl border border-slate-700 bg-slate-900/60 px-5 py-3.5 text-sm font-bold text-slate-200 transition-all duration-200 hover:border-slate-600 hover:bg-slate-900 hover:text-white sm:px-6"
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>{t(lang, 'exploreLabs')}</span>
            </button>
          </div>
        </div>

        {/* Floating dashboard elements illustration */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:block w-72 h-72 border border-slate-800/60 bg-slate-950/40 rounded-2xl p-6 backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400">SIMULATION ENGINE</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            {/* mini pendulum mockup */}
            <div className="h-28 border border-slate-800/80 bg-slate-900/50 rounded-xl relative overflow-hidden flex items-center justify-center">
              <div className="absolute top-2 w-16 h-1 bg-slate-700 rounded-full"></div>
              {/* pendulum line and bob */}
              <div className="absolute top-3 w-0.5 h-16 bg-cyan-400 origin-top rotate-[25deg] animate-[swing_3s_ease-in-out_infinite]">
                <div className="absolute bottom-0 -left-1.5 w-3.5 h-3.5 rounded-full bg-purple-500 shadow-md shadow-purple-500/50"></div>
              </div>
              <span className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-500">θ = 25.0°</span>
            </div>
            {/* mini telemetry */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Velocity</span>
                <span className="text-cyan-400">1.42 m/s</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full w-2/3"></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Potential Energy</span>
                <span className="text-purple-400">0.84 J</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-purple-400 rounded-full w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Stats and Progress */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Left Column: Progress & Level */}
        <div className="space-y-6 lg:col-span-2 lg:space-y-8">
          {/* Learning Progress Section */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/20 p-4 backdrop-blur-md sm:p-6">
            <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{t(lang, 'yourProgress')}</h2>
                <p className="text-xs text-slate-400">{t(lang, 'progressDesc')}</p>
              </div>
              <button
                onClick={() => setActiveTab('quizzes')}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors"
              >
                <span>{t(lang, 'takeQuiz')}</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3 hover:border-slate-700 transition-colors duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-200 text-sm">{topic.name}</h3>
                      <span className="text-[10px] text-slate-500 font-mono">{topic.count}</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      topic.level === 'Advanced' 
                        ? 'text-purple-400 bg-purple-950/20 border-purple-800/40' 
                        : topic.level === 'Intermediate'
                        ? 'text-cyan-400 bg-cyan-950/20 border-cyan-800/40'
                        : 'text-amber-400 bg-amber-950/20 border-amber-800/40'
                    }`}>
                      {topic.level}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">{t(lang, 'mastery')}</span>
                      <span className="text-white font-bold">{topic.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${topic.color} rounded-full transition-all duration-500`}
                        style={{ width: `${topic.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Simulations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{t(lang, 'recommendedLabs')}</h2>
                <p className="text-xs text-slate-400">{t(lang, 'labsDesc')}</p>
              </div>
              <button
                onClick={() => setActiveTab('simlab')}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors"
              >
                <span>{t(lang, 'viewAllLabs')}</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {featuredSims.map((sim, index) => (
                <div
                  key={index}
                  onClick={() => setActiveTab('simlab')}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40 p-5 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/30 hover:-translate-y-1"
                >
                  <div className="absolute top-0 right-0 h-16 w-16 bg-cyan-500/5 rounded-bl-full group-hover:bg-cyan-500/10 transition-colors"></div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-2">
                    {sim.category}
                  </span>
                  <h3 className="font-bold text-slate-200 text-sm group-hover:text-white transition-colors">
                    {sim.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                    {sim.desc}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60">
                    <span className="text-[10px] font-mono text-slate-500">Diff: {sim.difficulty}</span>
                    <span className="text-xs font-bold font-mono text-purple-400">{sim.xp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Profile Stats & Recent Activity */}
        <div className="space-y-6 lg:space-y-8">
          {/* Gamified Level & XP Card */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/20 p-4 backdrop-blur-md space-y-5 sm:p-6 sm:space-y-6">
            <h2 className="text-lg font-bold text-white">{t(lang, 'quantumProgress')}</h2>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:space-x-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500 to-cyan-500 p-[1.5px] shadow-lg shadow-purple-500/20">
                <div className="flex h-full w-full flex-col items-center justify-center rounded-[14px] bg-slate-950 font-mono">
                  <span className="text-[10px] text-slate-500 font-bold leading-none">LVL</span>
                  <span className="text-2xl font-black text-white leading-none mt-0.5">{userStats.level}</span>
                </div>
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="font-bold text-slate-200 text-sm">{t(lang, 'quantumPioneer')}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  {userStats.xp} {t(lang, 'totalXp')}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {xpNeeded} {t(lang, 'xpToLevel')} {userStats.level + 1}
                </p>
              </div>
            </div>

            {/* Level progress bar */}
            <div className="space-y-1.5">
              <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden p-[1px] border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${xpPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Detailed Stats Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/40 text-center">
                <span className="text-xs text-slate-500 block">{t(lang, 'quizzesSolved')}</span>
                <span className="text-lg font-bold font-mono text-cyan-400">{userStats.quizzesCompleted}</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/40 text-center">
                <span className="text-xs text-slate-500 block">{t(lang, 'labsExplored')}</span>
                <span className="text-lg font-bold font-mono text-purple-400">{userStats.simsExplored}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/20 p-4 backdrop-blur-md space-y-4 sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-white">{t(lang, 'recentActivity')}</h2>
              <p className="text-xs text-slate-400">{t(lang, 'activityDesc')}</p>
            </div>

            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">{t(lang, 'noActivity')}</p>
              ) : (
                recentActivities.map((act) => {
                  const Icon = activityIcons[act.icon];
                  return (
                    <div
                      key={act.id}
                      className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/20 p-3"
                    >
                      <div className={`p-1.5 rounded-lg border ${activityColors[act.icon]} mt-0.5 shrink-0`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium leading-relaxed text-slate-300">
                          {lang === 'bn' ? act.textBn : act.text}
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          {formatRelativeTime(act.timestamp, lang)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Formula Solver Card */}
          <div
            onClick={() => setActiveTab('formulas')}
            className="group cursor-pointer rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-950 to-slate-900 p-4 transition-all duration-200 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 sm:p-5"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors flex items-center space-x-1.5">
                  <Zap className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>{t(lang, 'instantFormula')}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {t(lang, 'formulaDesc')}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
