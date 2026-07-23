import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, ChevronRight, RotateCcw, Brain, Sparkles, HelpCircle, AlertCircle } from 'lucide-react';

interface Question {
  text: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: string;
  xpReward: number;
  questions: Question[];
}

const QUIZZES_DATABASE: Quiz[] = [
  {
    id: 'mechanics_quiz',
    title: 'Classical Kinematics & Mechanics',
    difficulty: 'Beginner',
    category: 'Mechanics',
    xpReward: 200,
    questions: [
      {
        text: 'A ball is thrown straight up. At the highest point of its trajectory, what is its velocity and acceleration?',
        options: [
          'Velocity is zero, acceleration is zero',
          'Velocity is zero, acceleration is g downwards',
          'Velocity is v₀, acceleration is g',
          'Velocity is zero, acceleration is g upwards'
        ],
        correctIdx: 1,
        explanation: 'At the peak, velocity is momentarily zero as it changes direction, but gravity is still pulling it down at 9.8 m/s². If acceleration were zero, it would float there forever!'
      },
      {
        text: 'If you double the speed of a car, what happens to its kinetic energy?',
        options: [
          'It doubles',
          'It triples',
          'It quadruples',
          'It remains the same'
        ],
        correctIdx: 2,
        explanation: 'Kinetic energy is proportional to the square of velocity (K = 1/2 m v²). Doubling velocity makes energy increase by 2² = 4 times.'
      },
      {
        text: 'A 5kg block is pulled with a net force of 20N. What is its acceleration?',
        options: [
          '4 m/s²',
          '100 m/s²',
          '0.25 m/s²',
          '15 m/s²'
        ],
        correctIdx: 0,
        explanation: 'Using F = ma, we solve for acceleration: a = F / m = 20 N / 5 kg = 4 m/s².'
      },
      {
        text: 'What is the work done by a centripetal force acting on an object in uniform circular motion?',
        options: [
          'Positive work',
          'Negative work',
          'Zero work',
          'Depends on mass'
        ],
        correctIdx: 2,
        explanation: 'Centripetal force is always perpendicular to the direction of displacement. Since W = F · d · cos(θ) and θ = 90°, cos(90°) = 0, so work done is zero.'
      },
      {
        text: "Which conservation law is a direct consequence of space translation symmetry (homogeneity of space) according to Noether's Theorem?",
        options: [
          'Conservation of Energy',
          'Conservation of Momentum',
          'Conservation of Angular Momentum',
          'Conservation of Charge'
        ],
        correctIdx: 1,
        explanation: "Noether's Theorem states that space translation symmetry leads to conservation of linear momentum, time translation symmetry leads to conservation of energy, and rotational symmetry leads to conservation of angular momentum."
      }
    ]
  },
  {
    id: 'em_quiz',
    title: 'Electromagnetism & Circuits',
    difficulty: 'Intermediate',
    category: 'Electromagnetism',
    xpReward: 300,
    questions: [
      {
        text: "According to Faraday's Law, what does a time-varying magnetic field induce?",
        options: [
          'An electric charge',
          'An electromotive force (voltage)',
          'A magnetic monopole',
          'Electrostatic potential'
        ],
        correctIdx: 1,
        explanation: "Faraday's Law of Induction states that a changing magnetic flux through a loop induces an electromotive force (EMF) in the loop, given by EMF = -dΦ/dt."
      },
      {
        text: 'What is the direction of the magnetic force on a positive charge moving east in a magnetic field pointing north?',
        options: [
          'Up, out of the page',
          'Down, into the page',
          'South',
          'West'
        ],
        correctIdx: 0,
        explanation: 'Using the Right-Hand Rule: point fingers in direction of velocity (East), curl them towards magnetic field (North). Your thumb points upwards (out of the page).'
      },
      {
        text: 'What happens to the capacitance of a parallel-plate capacitor if a dielectric material is inserted between the plates?',
        options: [
          'It decreases',
          'It increases',
          'It remains the same',
          'It drops to zero'
        ],
        correctIdx: 1,
        explanation: 'Inserting a dielectric with dielectric constant κ > 1 increases the capacitance by a factor of κ (C = κ C₀) by reducing the electric field between the plates.'
      },
      {
        text: "Which Maxwell's equation states that there are no magnetic monopoles?",
        options: [
          "Gauss's Law for Electricity",
          "Gauss's Law for Magnetism",
          "Faraday's Law of Induction",
          "Ampere's Law"
        ],
        correctIdx: 1,
        explanation: "Gauss's Law for Magnetism states ∇ · B = 0, meaning the net magnetic flux through any closed surface is zero, which implies magnetic monopoles do not exist."
      },
      {
        text: 'What is the phase relationship between voltage and current in a purely capacitive AC circuit?',
        options: [
          'Current leads voltage by 90 degrees',
          'Voltage leads current by 90 degrees',
          'They are in phase',
          'They are 180 degrees out of phase'
        ],
        correctIdx: 0,
        explanation: 'In a capacitor, current is proportional to the rate of change of voltage (i = C dv/dt). This causes the current waveform to lead the voltage waveform by exactly 90° (or π/2 radians).'
      }
    ]
  },
  {
    id: 'quantum_quiz',
    title: 'Quantum Mechanics & Modern Physics',
    difficulty: 'Advanced',
    category: 'Quantum',
    xpReward: 400,
    questions: [
      {
        text: 'The Heisenberg Uncertainty Principle states that we cannot simultaneously measure which two properties with absolute precision?',
        options: [
          'Mass and Velocity',
          'Position and Momentum',
          'Energy and Charge',
          'Spin and Wavelength'
        ],
        correctIdx: 1,
        explanation: 'The principle states Δx · Δp ≥ ℏ/2. The more precisely position is known, the less precisely momentum can be known, and vice versa.'
      },
      {
        text: 'What is a quantum of light energy called?',
        options: [
          'Electron',
          'Proton',
          'Photon',
          'Phonon'
        ],
        correctIdx: 2,
        explanation: 'Light energy is quantized into packets called photons, each carrying energy E = hf.'
      },
      {
        text: 'In the photoelectric effect, what does the kinetic energy of emitted electrons depend on?',
        options: [
          'Light intensity',
          'Light frequency',
          'Exposure time',
          'Surface area'
        ],
        correctIdx: 1,
        explanation: "According to Einstein's explanation, the kinetic energy of photoelectrons is K_max = hf - Φ. It depends linearly on frequency f. Intensity only affects the number of electrons emitted."
      },
      {
        text: 'What does the square of the absolute value of the wave function, |Ψ|², represent in quantum mechanics?',
        options: [
          'Energy density',
          'Probability density of finding the particle',
          'Momentum vectors',
          'Wave speed'
        ],
        correctIdx: 1,
        explanation: 'According to the Born Rule, |Ψ(x,t)|² represents the probability density of finding the particle at position x at time t.'
      },
      {
        text: 'What quantum phenomenon allows particles to pass through a potential barrier that they classically do not have enough energy to surmount?',
        options: [
          'Quantum Tunneling',
          'Quantum Entanglement',
          'Superposition',
          'Photoelectric Emission'
        ],
        correctIdx: 0,
        explanation: 'Quantum tunneling occurs because wave functions decay exponentially inside a thin potential barrier but remain non-zero on the other side, giving a finite probability of finding the particle there.'
      }
    ]
  }
];

interface QuizDashboardProps {
  onQuizCompleted: (xpEarned: number, quizTitle: string, scorePct: number) => void;
}

export const QuizDashboard: React.FC<QuizDashboardProps> = ({ onQuizCompleted }) => {
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setSelectedOptionIdx(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
  };

  const handleOptionSelect = (optIdx: number) => {
    if (isAnswered) return;
    setSelectedOptionIdx(optIdx);
  };

  const handleCheckAnswer = () => {
    if (selectedOptionIdx === null || isAnswered) return;
    setIsAnswered(true);

    const q = activeQuiz?.questions[currentQuestionIdx];
    if (q && selectedOptionIdx === q.correctIdx) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;

    if (currentQuestionIdx < activeQuiz.questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOptionIdx(null);
      setIsAnswered(false);
    } else {
      // Quiz complete
      setShowResults(true);
      // Calculate XP Earned
      const xpEarned = Math.round((score / activeQuiz.questions.length) * activeQuiz.xpReward);
      if (xpEarned > 0) {
        const scorePct = Math.round((score / activeQuiz.questions.length) * 100);
        onQuizCompleted(xpEarned, activeQuiz.title, scorePct);
      }
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/20 p-6 md:p-8 backdrop-blur-md">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl"></div>
        <div className="relative z-10 max-w-2xl space-y-2">
          <h2 className="text-2xl font-black text-white">Quantum Exam Prep</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Test your physical intuition and mathematical knowledge. Earn XP, level up your profile, and receive instant explanations from the physics engine.
          </p>
        </div>
      </div>

      {!activeQuiz ? (
        /* Quiz Selection Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {QUIZZES_DATABASE.map((quiz) => (
            <div
              key={quiz.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/10 p-6 hover:border-cyan-500/30 hover:bg-slate-900/20 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 h-16 w-16 bg-cyan-500/5 rounded-bl-full group-hover:bg-cyan-500/10 transition-colors"></div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    {quiz.category}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    quiz.difficulty === 'Advanced' 
                      ? 'text-purple-400 bg-purple-950/20 border-purple-800/40' 
                      : quiz.difficulty === 'Intermediate'
                      ? 'text-cyan-400 bg-cyan-950/20 border-cyan-800/40'
                      : 'text-amber-400 bg-amber-950/20 border-amber-800/40'
                  }`}>
                    {quiz.difficulty}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-white text-base leading-tight group-hover:text-cyan-400 transition-colors">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    5 Questions • {quiz.xpReward} Max XP
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleStartQuiz(quiz)}
                className="mt-6 flex w-full items-center justify-center space-x-2 rounded-xl bg-slate-900 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 py-3 text-xs font-bold text-slate-200 hover:text-white transition-all duration-150"
              >
                <span>Start Practice Exam</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : showResults ? (
        /* Quiz Results Screen */
        <div className="max-w-2xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/20 p-8 backdrop-blur-md text-center space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-950/50 border border-cyan-800/40 text-cyan-400 mb-2">
            <Award className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">Quiz Completed!</h3>
            <p className="text-xs text-slate-400 font-mono">
              Exam: {activeQuiz.title}
            </p>
          </div>

          {/* Score breakdown */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto py-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 text-center">
              <span className="text-xs text-slate-500 block">Accuracy</span>
              <span className="text-2xl font-bold font-mono text-cyan-400">
                {Math.round((score / activeQuiz.questions.length) * 100)}%
              </span>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 text-center">
              <span className="text-xs text-slate-500 block">XP Gained</span>
              <span className="text-2xl font-bold font-mono text-purple-400">
                +{Math.round((score / activeQuiz.questions.length) * activeQuiz.xpReward)} XP
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
            {score === activeQuiz.questions.length
              ? 'Flawless victory! You have achieved quantum resonance with this subject matter.'
              : 'Great effort! Review the step-by-step explanations below to master the concepts.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2 max-w-sm mx-auto">
            <button
              onClick={() => handleStartQuiz(activeQuiz)}
              className="flex items-center justify-center space-x-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-xs font-bold text-slate-200 hover:text-white transition-all"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Retry Exam</span>
            </button>
            <button
              onClick={() => setActiveQuiz(null)}
              className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition-all"
            >
              <span>Back to Exams</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Active Question Display */
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/20 backdrop-blur-md overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-slate-950">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300"
              style={{ width: `${((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100}%` }}
            ></div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Header telemetry */}
            <div className="flex justify-between items-center text-xs font-mono text-slate-400">
              <span>QUESTION {currentQuestionIdx + 1} OF {activeQuiz.questions.length}</span>
              <span className="text-cyan-400 font-bold">SCORE: {score}</span>
            </div>

            {/* Question Text */}
            <h3 className="text-lg md:text-xl font-bold text-white leading-relaxed">
              {activeQuiz.questions[currentQuestionIdx].text}
            </h3>

            {/* Options list */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {activeQuiz.questions[currentQuestionIdx].options.map((option, idx) => {
                const isSelected = selectedOptionIdx === idx;
                const isCorrectAnswer = idx === activeQuiz.questions[currentQuestionIdx].correctIdx;

                let optionStyle = 'border-slate-800 bg-slate-900/30 text-slate-300 hover:border-slate-700 hover:bg-slate-900/50';
                if (isSelected && !isAnswered) {
                  optionStyle = 'border-cyan-500 bg-cyan-950/20 text-cyan-300';
                } else if (isAnswered) {
                  if (isCorrectAnswer) {
                    optionStyle = 'border-emerald-500 bg-emerald-950/20 text-emerald-400';
                  } else if (isSelected) {
                    optionStyle = 'border-red-500 bg-red-950/20 text-red-400';
                  } else {
                    optionStyle = 'border-slate-800 bg-slate-900/10 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    disabled={isAnswered}
                    className={`flex items-center justify-between p-4 rounded-xl border text-left text-sm font-medium transition-all duration-150 ${optionStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswered && isCorrectAnswer && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 ml-3" />}
                    {isAnswered && isSelected && !isCorrectAnswer && <XCircle className="h-5 w-5 text-red-400 shrink-0 ml-3" />}
                  </button>
                );
              })}
            </div>

            {/* Actions / AI Explains */}
            <div className="pt-4 border-t border-slate-800/60 flex flex-col gap-4">
              {isAnswered && (
                /* AI Explanation Box */
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2 animate-fadeIn">
                  <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-cyan-400 uppercase">
                    <Brain className="h-4 w-4" />
                    <span>AI Physics Explanation</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeQuiz.questions[currentQuestionIdx].explanation}
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                {!isAnswered ? (
                  <button
                    onClick={handleCheckAnswer}
                    disabled={selectedOptionIdx === null}
                    className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/15 hover:shadow-cyan-500/25 disabled:opacity-50 transition-all"
                  >
                    <span>Verify Answer</span>
                    <Sparkles className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center space-x-2 rounded-xl bg-slate-900 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 px-6 py-3 text-xs font-bold text-slate-200 hover:text-white transition-all"
                  >
                    <span>
                      {currentQuestionIdx === activeQuiz.questions.length - 1 ? 'Finish Exam' : 'Next Question'}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
