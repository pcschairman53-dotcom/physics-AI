import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  MessageSquareText,
  NotebookPen,
  PenTool,
  Sparkles,
  Stars,
  Target,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { t, type Lang } from '../i18n';
import { chapterLibrary, type ChapterDiagram, type Grade } from './chapterData';
import { generateQuestions, type GeneratedQuestionSet, type GeminiQuestionRequest } from '../lib/GeminiService';

interface ChapterLearningProps {
  lang: Lang;
  onChapterSelected?: (grade: Grade, title: string) => void;
}

interface SectionCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

const sectionTitles = {
  en: {
    intro: 'Chapter Introduction',
    definition: 'Definition',
    explanation: 'Detailed Explanation',
    objectives: 'Learning Objectives',
    theory: 'Theory Notes',
    concepts: 'Important Concepts',
    diagram: 'Visual Diagram',
    formulas: 'Important Formula Table',
    formulaExplanation: 'Formula Explanation',
    examples: 'Real Life Examples',
    solved: 'Solved Examples',
    shortQuestions: 'Short Questions with Answers',
    mcqs: 'MCQs with Correct Answers',
    numericals: 'Numerical Problems',
    practice: 'Practice Questions',
    previousYear: 'Previous Year Questions',
    notes: 'Important Notes',
    mistakes: 'Common Mistakes',
    revision: 'Quick Revision Notes',
    progress: 'Progress & XP',
    activity: 'Activity History',
    summary: 'Chapter Summary',
    ai: 'AI Doubt Solver',
  },
  bn: {
    intro: 'অধ্যায়ের পরিচিতি',
    definition: 'সংজ্ঞা',
    explanation: 'বিস্তারিত ব্যাখ্যা',
    objectives: 'শিখার লক্ষ্য',
    theory: 'থিওরি নোট',
    concepts: 'গুরুত্বপূর্ণ ধারণা',
    diagram: 'ভিজ্যুয়াল ডায়াগ্রাম',
    formulas: 'গুরুত্বপূর্ণ সূত্রের তালিকা',
    formulaExplanation: 'সূত্রের ব্যাখ্যা',
    examples: 'বাস্তব জীবনের উদাহরণ',
    solved: 'সমাধানযুক্ত উদাহরণ',
    shortQuestions: 'সংক্ষিপ্ত প্রশ্ন ও উত্তর',
    mcqs: 'MCQ ও সঠিক উত্তর',
    numericals: 'সংখ্যাগত সমস্যা',
    practice: 'অনুশীলনী প্রশ্ন',
    previousYear: 'পূর্ববর্তী বছরের প্রশ্ন',
    notes: 'গুরুত্বপূর্ণ নোট',
    mistakes: 'সাধারণ ভুল',
    revision: 'দ্রুত রিভিশন নোট',
    progress: 'অগ্রগতি ও XP',
    activity: 'অ্যাক্টিভিটি হিস্ট্রি',
    summary: 'অধ্যায়ের সারাংশ',
    ai: 'AI doubt solver',
  },
} as const;

const SectionCard: React.FC<SectionCardProps> = ({ title, icon: Icon, children }) => (
  <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-5 shadow-lg shadow-slate-950/20">
    <div className="mb-4 flex items-center gap-2">
      <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-2 text-cyan-300">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    {children}
  </div>
);

const DiagramPreview: React.FC<{ diagram?: ChapterDiagram }> = ({ diagram }) => {
  if (!diagram) return null;

  const svgContent = (() => {
    switch (diagram.kind) {
      case 'field':
        return (
          <svg viewBox="0 0 240 140" className="h-36 w-full rounded-2xl bg-slate-900/70 p-3">
            <circle cx="70" cy="70" r="28" fill="rgba(34,211,238,0.2)" stroke="rgba(34,211,238,0.8)" strokeWidth="2" />
            <circle cx="170" cy="70" r="28" fill="rgba(244,114,182,0.16)" stroke="rgba(244,114,182,0.8)" strokeWidth="2" />
            <path d="M20 70 H50 M190 70 H220" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
            <path d="M70 40 L95 70 L70 100" stroke="rgba(34,211,238,0.8)" strokeWidth="2" />
            <path d="M170 40 L145 70 L170 100" stroke="rgba(244,114,182,0.8)" strokeWidth="2" />
          </svg>
        );
      case 'circuit':
        return (
          <svg viewBox="0 0 240 140" className="h-36 w-full rounded-2xl bg-slate-900/70 p-3">
            <rect x="40" y="56" width="40" height="28" rx="4" fill="rgba(34,211,238,0.18)" stroke="rgba(34,211,238,0.8)" strokeWidth="2" />
            <rect x="140" y="56" width="54" height="28" rx="4" fill="rgba(125,211,252,0.16)" stroke="rgba(125,211,252,0.8)" strokeWidth="2" />
            <path d="M80 70 H140 M194 70 H220" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
            <path d="M115 40 L115 100" stroke="rgba(34,211,238,0.8)" strokeWidth="2" />
          </svg>
        );
      case 'magnet':
        return (
          <svg viewBox="0 0 240 140" className="h-36 w-full rounded-2xl bg-slate-900/70 p-3">
            <rect x="48" y="36" width="144" height="68" rx="16" fill="rgba(99,102,241,0.12)" stroke="rgba(129,140,248,0.8)" strokeWidth="2" />
            <path d="M72 44 L72 96 M96 44 L96 96 M120 44 L120 96 M144 44 L144 96" stroke="rgba(129,140,248,0.8)" strokeWidth="4" />
            <path d="M78 28 C110 18 132 18 164 28" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
          </svg>
        );
      case 'optics':
        return (
          <svg viewBox="0 0 240 140" className="h-36 w-full rounded-2xl bg-slate-900/70 p-3">
            <rect x="40" y="46" width="150" height="48" rx="24" fill="rgba(34,211,238,0.1)" stroke="rgba(34,211,238,0.8)" strokeWidth="2" />
            <path d="M70 70 L138 70" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
            <path d="M118 42 L146 70 L118 98" stroke="rgba(34,211,238,0.8)" strokeWidth="2" />
            <path d="M92 38 L60 70 L92 102" stroke="rgba(244,114,182,0.8)" strokeWidth="2" />
          </svg>
        );
      case 'wave':
        return (
          <svg viewBox="0 0 240 140" className="h-36 w-full rounded-2xl bg-slate-900/70 p-3">
            <path d="M20 70 C48 24 72 24 100 70 S152 116 180 70 S212 24 220 70" stroke="rgba(34,211,238,0.8)" strokeWidth="3" fill="none" />
            <path d="M20 96 C48 50 72 50 100 96 S152 142 180 96 S212 50 220 96" stroke="rgba(125,211,252,0.5)" strokeWidth="2" fill="none" />
          </svg>
        );
      case 'atom':
        return (
          <svg viewBox="0 0 240 140" className="h-36 w-full rounded-2xl bg-slate-900/70 p-3">
            <circle cx="120" cy="70" r="36" fill="rgba(34,211,238,0.12)" stroke="rgba(34,211,238,0.8)" strokeWidth="2" />
            <circle cx="120" cy="70" r="10" fill="rgba(255,255,255,0.95)" />
            <circle cx="76" cy="50" r="6" fill="rgba(125,211,252,0.8)" />
            <circle cx="164" cy="50" r="6" fill="rgba(125,211,252,0.8)" />
            <circle cx="92" cy="102" r="6" fill="rgba(125,211,252,0.8)" />
            <circle cx="148" cy="102" r="6" fill="rgba(125,211,252,0.8)" />
          </svg>
        );
      case 'nucleus':
        return (
          <svg viewBox="0 0 240 140" className="h-36 w-full rounded-2xl bg-slate-900/70 p-3">
            <circle cx="120" cy="70" r="38" fill="rgba(244,114,182,0.16)" stroke="rgba(244,114,182,0.8)" strokeWidth="2" />
            <circle cx="120" cy="70" r="16" fill="rgba(255,255,255,0.95)" />
            <circle cx="92" cy="58" r="8" fill="rgba(34,211,238,0.8)" />
            <circle cx="148" cy="58" r="8" fill="rgba(34,211,238,0.8)" />
            <circle cx="120" cy="98" r="8" fill="rgba(34,211,238,0.8)" />
          </svg>
        );
      case 'semiconductor':
        return (
          <svg viewBox="0 0 240 140" className="h-36 w-full rounded-2xl bg-slate-900/70 p-3">
            <rect x="48" y="44" width="56" height="52" rx="8" fill="rgba(34,211,238,0.12)" stroke="rgba(34,211,238,0.8)" strokeWidth="2" />
            <rect x="136" y="44" width="56" height="52" rx="8" fill="rgba(244,114,182,0.12)" stroke="rgba(244,114,182,0.8)" strokeWidth="2" />
            <path d="M104 70 H136" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
            <circle cx="76" cy="70" r="8" fill="rgba(34,211,238,0.8)" />
            <circle cx="164" cy="70" r="8" fill="rgba(244,114,182,0.8)" />
          </svg>
        );
      case 'induction':
      default:
        return (
          <svg viewBox="0 0 240 140" className="h-36 w-full rounded-2xl bg-slate-900/70 p-3">
            <rect x="56" y="48" width="128" height="44" rx="22" fill="rgba(34,211,238,0.12)" stroke="rgba(34,211,238,0.8)" strokeWidth="2" />
            <path d="M78 70 H162" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
            <path d="M96 48 C108 24 132 24 144 48" stroke="rgba(125,211,252,0.8)" strokeWidth="2" />
            <path d="M96 92 C108 116 132 116 144 92" stroke="rgba(244,114,182,0.8)" strokeWidth="2" />
          </svg>
        );
    }
  })();

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-cyan-300">{diagram.title}</div>
          <p className="text-sm text-slate-400">{diagram.description}</p>
        </div>
        <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[11px] uppercase tracking-[0.24em] text-cyan-200">
          {diagram.kind}
        </div>
      </div>
      {svgContent}
    </div>
  );
};

export const ChapterLearning: React.FC<ChapterLearningProps> = ({ lang, onChapterSelected }) => {
  const [selectedGrade, setSelectedGrade] = useState<Grade>('11');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('physical-world');
  const [aiQuestions, setAiQuestions] = useState<GeneratedQuestionSet | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStatus, setAiStatus] = useState<string>('');

  const grades: Array<{ value: Grade; label: string }> = [
    { value: '11', label: t(lang, 'class11Tag') },
    { value: '12', label: t(lang, 'class12Tag') },
  ];

  const chapters = chapterLibrary[selectedGrade];
  const activeChapter = chapters.find((chapter) => chapter.id === selectedChapterId) ?? chapters[0];
  const labels = sectionTitles[lang];

  useEffect(() => {
    if (!activeChapter) return;
    onChapterSelected?.(selectedGrade, activeChapter.title);
  }, [activeChapter?.title, onChapterSelected, selectedGrade]);

  const aiRequest = useMemo<GeminiQuestionRequest>(() => ({
    className: selectedGrade,
    chapter: activeChapter?.title ?? 'Physics',
    difficulty: 'Intermediate',
    numberOfQuestions: 5,
  }), [activeChapter?.title, selectedGrade]);

  const handleGenerateQuestions = async () => {
    if (!activeChapter) return;
    setIsGenerating(true);
    setAiStatus('');

    try {
      const result = await generateQuestions(aiRequest);
      setAiQuestions(result);
      setAiStatus('AI questions generated');
    } catch {
      setAiQuestions(null);
      setAiStatus('Using Offline Questions');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[28px] border border-cyan-500/20 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-cyan-950/60 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2 text-cyan-300">
              <BookOpen className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-[0.24em]">{t(lang, 'chapterModule')}</span>
            </div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">{t(lang, 'chapterHeroTitle')}</h2>
            <p className="text-sm leading-7 text-slate-300 sm:text-base">{t(lang, 'chapterHeroDesc')}</p>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
            <div className="font-semibold">{t(lang, 'activeChapter')}: {activeChapter?.title}</div>
            <div className="mt-1 text-cyan-200/80">{activeChapter?.subtitle}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="rounded-[24px] border border-slate-800/80 bg-slate-950/55 p-4 shadow-xl shadow-slate-950/30 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{t(lang, 'chapterNavigator')}</h3>
            <div className="flex gap-2">
              {grades.map((grade) => (
                <button
                  key={grade.value}
                  onClick={() => {
                    setSelectedGrade(grade.value);
                    setSelectedChapterId(chapterLibrary[grade.value][0]?.id ?? 'physical-world');
                  }}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition ${selectedGrade === grade.value ? 'bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-400/40' : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/80'}`}
                >
                  {grade.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => setSelectedChapterId(chapter.id)}
                className={`flex w-full items-start justify-between rounded-2xl border px-3 py-3 text-left transition ${selectedChapterId === chapter.id ? 'border-cyan-500/40 bg-cyan-500/10 text-white' : 'border-slate-800/80 bg-slate-900/70 text-slate-300 hover:border-cyan-500/20 hover:bg-slate-800/80'}`}
              >
                <div>
                  <div className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">{t(lang, 'class')} {selectedGrade}</div>
                  <div className="mt-1 text-sm font-semibold">{chapter.title}</div>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-5">
          <div className="rounded-[24px] border border-slate-800/80 bg-slate-950/55 p-6 shadow-xl shadow-slate-950/30 backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">{t(lang, 'activeChapter')}</div>
                <h3 className="mt-2 text-2xl font-bold text-white">{activeChapter.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{activeChapter.subtitle}</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">
                <Sparkles className="h-4 w-4" />
                {selectedGrade === '11' ? t(lang, 'class11Tag') : t(lang, 'class12Tag')}
              </div>
            </div>
          </div>

          <SectionCard title={labels.intro} icon={BookOpen}>
            <p className="leading-7 text-slate-300">{activeChapter.introduction}</p>
          </SectionCard>

          <SectionCard title={labels.definition} icon={Target}>
            <p className="leading-7 text-slate-300">{activeChapter.definition}</p>
          </SectionCard>

          <SectionCard title={labels.explanation} icon={BrainCircuit}>
            <p className="leading-7 text-slate-300">{activeChapter.explanation}</p>
          </SectionCard>

          <SectionCard title={labels.objectives} icon={Target}>
            <ul className="space-y-2">
              {activeChapter.objectives.map((objective) => (
                <li key={objective} className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title={labels.theory} icon={BookOpen}>
            <ul className="space-y-2">
              {activeChapter.theoryNotes?.map((note) => (
                <li key={note} className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title={labels.concepts} icon={BrainCircuit}>
            <ul className="space-y-2">
              {activeChapter.importantConcepts?.map((concept) => (
                <li key={concept} className="flex items-start gap-2 text-slate-300">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                  <span>{concept}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          {activeChapter.diagram ? (
            <SectionCard title={labels.diagram} icon={Stars}>
              <DiagramPreview diagram={activeChapter.diagram} />
            </SectionCard>
          ) : null}

          <SectionCard title={labels.formulas} icon={Sparkles}>
            <div className="space-y-3">
              {activeChapter.formulaTable.map((row) => (
                <div key={row.name} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-white">{row.name}</span>
                    <code className="rounded bg-slate-800 px-2 py-1 text-sm text-cyan-200">{row.expression}</code>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{row.meaning}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={labels.formulaExplanation} icon={Lightbulb}>
            <p className="leading-7 text-slate-300">{activeChapter.formulaExplanation}</p>
          </SectionCard>

          <SectionCard title={labels.examples} icon={Stars}>
            <ul className="space-y-2">
              {activeChapter.realLifeExamples.map((example) => (
                <li key={example} className="flex items-start gap-2 text-slate-300">
                  <Stars className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                  <span>{example}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title={labels.solved} icon={PenTool}>
            <div className="space-y-4">
              {activeChapter.solvedExamples.map((example, index) => (
                <div key={`${example.question}-${index}`} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                  <div className="text-sm font-semibold text-cyan-300">Solved Example {index + 1}</div>
                  <p className="mt-2 font-medium text-white">{example.question}</p>
                  <p className="mt-2 leading-7 text-slate-300">{example.solution}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={labels.shortQuestions} icon={MessageSquareText}>
            <div className="space-y-4">
              {activeChapter.shortQuestions.map((item, index) => (
                <div key={`${item.question}-${index}`} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                  <p className="font-semibold text-white">{item.question}</p>
                  <p className="mt-2 leading-7 text-slate-300">{item.answer}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="AI Generated Questions" icon={Sparkles}>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-slate-400">Generate dynamic practice questions for this chapter using Gemini.</p>
                <button
                  onClick={handleGenerateQuestions}
                  disabled={isGenerating}
                  className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isGenerating ? 'Generating…' : 'Generate New Questions'}
                </button>
              </div>
              {aiStatus ? <div className="text-sm text-amber-300">{aiStatus}</div> : null}
              {!aiQuestions ? (
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 text-sm text-slate-400">
                  Use the button to create fresh MCQs, short, long, numerical, and viva questions. If the API is unavailable, the existing chapter questions remain available.
                </div>
              ) : (
                <div className="space-y-3">
                  {aiQuestions.mcqs.slice(0, 3).map((item, index) => (
                    <div key={`mcq-${index}`} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                      <p className="font-semibold text-white">{item.question}</p>
                      <ul className="mt-2 space-y-2">
                        {item.options.map((option) => (
                          <li key={option} className="rounded-lg border border-slate-800/80 bg-slate-950/60 px-3 py-2 text-sm text-slate-300">
                            {option}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-sm font-medium text-cyan-300">Answer: {item.answer}</p>
                    </div>
                  ))}
                  {aiQuestions.shortQuestions.slice(0, 2).map((item, index) => (
                    <div key={`short-${index}`} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                      <p className="font-semibold text-white">{item.question}</p>
                      <p className="mt-2 text-sm text-cyan-300">{item.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title={labels.mcqs} icon={NotebookPen}>
            <div className="space-y-4">
              {activeChapter.mcqs.map((item, index) => (
                <div key={`${item.question}-${index}`} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                  <p className="font-semibold text-white">{index + 1}. {item.question}</p>
                  <ul className="mt-3 space-y-2">
                    {item.options.map((option) => (
                      <li key={option} className="rounded-lg border border-slate-800/80 bg-slate-950/60 px-3 py-2 text-sm text-slate-300">
                        {option}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm font-medium text-cyan-300">Correct Answer: {item.answer}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={labels.numericals} icon={PenTool}>
            <div className="space-y-4">
              {activeChapter.numericalProblems.map((item, index) => (
                <div key={`${item.question}-${index}`} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                  <p className="font-semibold text-white">{index + 1}. {item.question}</p>
                  <ul className="mt-2 space-y-2">
                    {item.steps.map((step) => (
                      <li key={step} className="text-sm leading-6 text-slate-300">• {step}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm font-medium text-cyan-300">Answer: {item.answer}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={labels.practice} icon={NotebookPen}>
            <ul className="space-y-2">
              {activeChapter.practiceQuestions.map((question) => (
                <li key={question} className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title={labels.previousYear} icon={BookOpen}>
            <ul className="space-y-2">
              {activeChapter.previousYearQuestions.map((question) => (
                <li key={question} className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title={labels.notes} icon={Lightbulb}>
            <ul className="space-y-2">
              {activeChapter.importantNotes.map((note) => (
                <li key={note} className="flex items-start gap-2 text-slate-300">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title={labels.mistakes} icon={MessageSquareText}>
            <ul className="space-y-2">
              {activeChapter.commonMistakes.map((mistake) => (
                <li key={mistake} className="flex items-start gap-2 text-slate-300">
                  <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title={labels.revision} icon={Sparkles}>
            <ul className="space-y-2">
              {activeChapter.quickRevisionNotes?.map((note) => (
                <li key={note} className="flex items-start gap-2 text-slate-300">
                  <Stars className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title={labels.progress} icon={Target}>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{activeChapter.completionProgress?.status ?? 'Ready for revision'}</span>
                <span className="font-semibold text-cyan-300">{activeChapter.completionProgress?.percent ?? 0}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-800">
                <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${activeChapter.completionProgress?.percent ?? 0}%` }} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span>Target: {activeChapter.completionProgress?.target ?? 'Complete chapter practice'}</span>
                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-cyan-200">XP reward: {activeChapter.xpReward ?? 0}</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title={labels.activity} icon={NotebookPen}>
            <ul className="space-y-2">
              {activeChapter.activityHistory?.map((entry) => (
                <li key={entry} className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>{entry}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title={labels.summary} icon={Stars}>
            <p className="leading-7 text-slate-300">{activeChapter.chapterSummary}</p>
          </SectionCard>

          <SectionCard title={labels.ai} icon={BrainCircuit}>
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-slate-200">
              <p className="leading-7">{activeChapter.aiDoubtSolverPrompt}</p>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};
