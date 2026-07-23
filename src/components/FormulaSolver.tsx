import React, { useState } from 'react';
import { Search, Zap, Info, HelpCircle, RefreshCw, Check, ArrowRight } from 'lucide-react';

interface FormulaVariable {
  symbol: string;
  name: string;
  unit: string;
  defaultValue: number;
}

interface FormulaItem {
  id: string;
  name: string;
  equation: string;
  category: 'mechanics' | 'electromagnetism' | 'thermo' | 'quantum' | 'optics';
  variables: FormulaVariable[];
  solveFn: (targetSymbol: string, values: { [key: string]: number }) => { result: number; steps: string };
  description: string;
}

const FORMULA_DATABASE: FormulaItem[] = [
  {
    id: 'f_ma',
    name: "Newton's Second Law",
    equation: "F = m · a",
    category: 'mechanics',
    description: "The acceleration of an object as produced by a net force is directly proportional to the magnitude of the net force, in the same direction as the net force, and inversely proportional to the mass of the object.",
    variables: [
      { symbol: 'F', name: 'Force', unit: 'N', defaultValue: 98 },
      { symbol: 'm', name: 'Mass', unit: 'kg', defaultValue: 10 },
      { symbol: 'a', name: 'Acceleration', unit: 'm/s²', defaultValue: 9.8 },
    ],
    solveFn: (targetSymbol, values) => {
      const { F, m, a } = values;
      if (targetSymbol === 'F') {
        const result = m * a;
        return {
          result,
          steps: `F = m · a\nF = ${m} kg · ${a} m/s²\nF = ${result.toFixed(2)} N`
        };
      } else if (targetSymbol === 'm') {
        const result = F / a;
        return {
          result,
          steps: `m = F / a\nm = ${F} N / ${a} m/s²\nm = ${result.toFixed(2)} kg`
        };
      } else {
        const result = F / m;
        return {
          result,
          steps: `a = F / m\na = ${F} N / ${m} kg\na = ${result.toFixed(2)} m/s²`
        };
      }
    }
  },
  {
    id: 'e_mc2',
    name: "Einstein's Mass-Energy Equivalence",
    equation: "E = m · c²",
    category: 'quantum',
    description: "Expresses the fact that mass and energy are the same physical entity and can be changed into each other.",
    variables: [
      { symbol: 'E', name: 'Energy', unit: 'J', defaultValue: 9e16 },
      { symbol: 'm', name: 'Mass', unit: 'kg', defaultValue: 1 },
      { symbol: 'c', name: 'Speed of Light', unit: 'm/s', defaultValue: 3e8 },
    ],
    solveFn: (targetSymbol, values) => {
      const { E, m, c } = values;
      if (targetSymbol === 'E') {
        const result = m * c * c;
        return {
          result,
          steps: `E = m · c²\nE = ${m} kg · (${c.toExponential(1)} m/s)²\nE = ${result.toExponential(4)} Joules`
        };
      } else if (targetSymbol === 'm') {
        const result = E / (c * c);
        return {
          result,
          steps: `m = E / c²\nm = ${E.toExponential(3)} J / (${c.toExponential(1)} m/s)²\nm = ${result.toExponential(4)} kg`
        };
      } else {
        const result = Math.sqrt(E / m);
        return {
          result,
          steps: `c = √(E / m)\nc = √(${E.toExponential(3)} J / ${m} kg)\nc = ${result.toExponential(4)} m/s`
        };
      }
    }
  },
  {
    id: 'f_gravity',
    name: "Newton's Law of Universal Gravitation",
    equation: "F = G · (m₁ · m₂) / r²",
    category: 'mechanics',
    description: "Calculates the attractive gravitational force between two point masses separated by distance r.",
    variables: [
      { symbol: 'F', name: 'Gravitational Force', unit: 'N', defaultValue: 3.7e-8 },
      { symbol: 'm1', name: 'Mass 1', unit: 'kg', defaultValue: 1000 },
      { symbol: 'm2', name: 'Mass 2', unit: 'kg', defaultValue: 5000 },
      { symbol: 'r', name: 'Distance', unit: 'm', defaultValue: 3 },
      { symbol: 'G', name: 'Gravitational Const', unit: 'N·m²/kg²', defaultValue: 6.674e-11 },
    ],
    solveFn: (targetSymbol, values) => {
      const { F, m1, m2, r, G } = values;
      if (targetSymbol === 'F') {
        const result = G * (m1 * m2) / (r * r);
        return {
          result,
          steps: `F = G · (m₁ · m₂) / r²\nF = (${G.toExponential(3)}) · (${m1} · ${m2}) / (${r})²\nF = ${result.toExponential(4)} N`
        };
      } else if (targetSymbol === 'm1') {
        const result = (F * r * r) / (G * m2);
        return {
          result,
          steps: `m₁ = (F · r²) / (G · m₂)\nm₁ = (${F.toExponential(3)} · ${r}²) / (${G.toExponential(3)} · ${m2})\nm₁ = ${result.toFixed(2)} kg`
        };
      } else if (targetSymbol === 'm2') {
        const result = (F * r * r) / (G * m1);
        return {
          result,
          steps: `m₂ = (F · r²) / (G · m₁)\nm₂ = (${F.toExponential(3)} · ${r}²) / (${G.toExponential(3)} · ${m1})\nm₂ = ${result.toFixed(2)} kg`
        };
      } else {
        const result = Math.sqrt((G * m1 * m2) / F);
        return {
          result,
          steps: `r = √(G · m₁ · m₂ / F)\nr = √(${G.toExponential(3)} · ${m1} · ${m2} / ${F.toExponential(3)})\nr = ${result.toFixed(3)} m`
        };
      }
    }
  },
  {
    id: 'ohms_law',
    name: "Ohm's Law",
    equation: "V = I · R",
    category: 'electromagnetism',
    description: "States that the current through a conductor between two points is directly proportional to the voltage across the two points.",
    variables: [
      { symbol: 'V', name: 'Voltage', unit: 'V', defaultValue: 12 },
      { symbol: 'I', name: 'Current', unit: 'A', defaultValue: 1.5 },
      { symbol: 'R', name: 'Resistance', unit: 'Ω', defaultValue: 8 },
    ],
    solveFn: (targetSymbol, values) => {
      const { V, I, R } = values;
      if (targetSymbol === 'V') {
        const result = I * R;
        return {
          result,
          steps: `V = I · R\nV = ${I} A · ${R} Ω\nV = ${result.toFixed(2)} V`
        };
      } else if (targetSymbol === 'I') {
        const result = V / R;
        return {
          result,
          steps: `I = V / R\nI = ${V} V / ${R} Ω\nI = ${result.toFixed(3)} A`
        };
      } else {
        const result = V / I;
        return {
          result,
          steps: `R = V / I\nR = ${V} V / ${I} A\nR = ${result.toFixed(2)} Ω`
        };
      }
    }
  },
  {
    id: 'coulomb',
    name: "Coulomb's Law",
    equation: "F = k_e · (|q₁| · |q₂|) / r²",
    category: 'electromagnetism',
    description: "Calculates the electrostatic force of attraction or repulsion between two point charges.",
    variables: [
      { symbol: 'F', name: 'Electrostatic Force', unit: 'N', defaultValue: 22.4 },
      { symbol: 'q1', name: 'Charge 1', unit: 'C', defaultValue: 5e-6 },
      { symbol: 'q2', name: 'Charge 2', unit: 'C', defaultValue: -4e-6 },
      { symbol: 'r', name: 'Distance', unit: 'm', defaultValue: 0.1 },
      { symbol: 'ke', name: 'Coulomb Const', unit: 'N·m²/C²', defaultValue: 8.988e9 },
    ],
    solveFn: (targetSymbol, values) => {
      const { F, q1, q2, r, ke } = values;
      const absQ1 = Math.abs(q1);
      const absQ2 = Math.abs(q2);
      if (targetSymbol === 'F') {
        const result = ke * (absQ1 * absQ2) / (r * r);
        return {
          result,
          steps: `F = k_e · (|q₁| · |q₂|) / r²\nF = (${ke.toExponential(3)}) · (${absQ1.toExponential(3)} · ${absQ2.toExponential(3)}) / (${r})²\nF = ${result.toExponential(4)} N`
        };
      } else if (targetSymbol === 'q1') {
        const result = (F * r * r) / (ke * absQ2);
        return {
          result,
          steps: `|q₁| = (F · r²) / (k_e · |q₂|)\n|q₁| = (${F.toFixed(2)} · ${r}²) / (${ke.toExponential(3)} · ${absQ2.toExponential(3)})\n|q₁| = ${result.toExponential(4)} C`
        };
      } else if (targetSymbol === 'q2') {
        const result = (F * r * r) / (ke * absQ1);
        return {
          result,
          steps: `|q₂| = (F · r²) / (k_e · |q₁|)\n|q₂| = (${F.toFixed(2)} · ${r}²) / (${ke.toExponential(3)} · ${absQ1.toExponential(3)})\n|q₂| = ${result.toExponential(4)} C`
        };
      } else {
        const result = Math.sqrt((ke * absQ1 * absQ2) / F);
        return {
          result,
          steps: `r = √(k_e · |q₁| · |q₂| / F)\nr = √(${ke.toExponential(3)} · ${absQ1.toExponential(3)} · ${absQ2.toExponential(3)} / ${F.toFixed(2)})\nr = ${result.toFixed(4)} m`
        };
      }
    }
  },
  {
    id: 'de_broglie',
    name: "De Broglie Wavelength",
    equation: "λ = h / p",
    category: 'quantum',
    description: "Associates a wave nature to all particles, stating that a particle's wavelength is inversely proportional to its momentum.",
    variables: [
      { symbol: 'lambda', name: 'Wavelength (λ)', unit: 'm', defaultValue: 6.6e-11 },
      { symbol: 'p', name: 'Momentum (p)', unit: 'kg·m/s', defaultValue: 1e-23 },
      { symbol: 'h', name: "Planck's Constant", unit: 'J·s', defaultValue: 6.626e-34 },
    ],
    solveFn: (targetSymbol, values) => {
      const { lambda, p, h } = values;
      if (targetSymbol === 'lambda') {
        const result = h / p;
        return {
          result,
          steps: `λ = h / p\nλ = ${h.toExponential(4)} J·s / ${p.toExponential(3)} kg·m/s\nλ = ${result.toExponential(4)} m`
        };
      } else if (targetSymbol === 'p') {
        const result = h / lambda;
        return {
          result,
          steps: `p = h / λ\np = ${h.toExponential(4)} J·s / ${lambda.toExponential(3)} m\np = ${result.toExponential(4)} kg·m/s`
        };
      } else {
        const result = lambda * p;
        return {
          result,
          steps: `h = λ · p\nh = ${lambda.toExponential(3)} m · ${p.toExponential(3)} kg·m/s\nh = ${result.toExponential(4)} J·s`
        };
      }
    }
  }
];

export const FormulaSolver: React.FC<{ onFormulaSolved?: (formulaName: string) => void }> = ({ onFormulaSolved }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'mechanics' | 'electromagnetism' | 'thermo' | 'quantum'>('all');
  const [expandedId, setExpandedId] = useState<string | null>('f_ma');
  const [targetVariable, setTargetVariable] = useState<{ [key: string]: string }>({
    f_ma: 'F',
    e_mc2: 'E',
    f_gravity: 'F',
    ohms_law: 'V',
    coulomb: 'F',
    de_broglie: 'lambda',
  });
  const [inputValues, setInputValues] = useState<{ [key: string]: { [varSymbol: string]: number } }>({
    f_ma: { F: 98, m: 10, a: 9.8 },
    e_mc2: { E: 9e16, m: 1, c: 3e8 },
    f_gravity: { F: 3.7e-8, m1: 1000, m2: 5000, r: 3, G: 6.674e-11 },
    ohms_law: { V: 12, I: 1.5, R: 8 },
    coulomb: { F: 22.4, q1: 5e-6, q2: -4e-6, r: 0.1, ke: 8.988e9 },
    de_broglie: { lambda: 6.626e-11, p: 1e-23, h: 6.626e-34 },
  });

  const [calculationResult, setCalculationResult] = useState<{ [key: string]: { result: number; steps: string } | null }>({});

  const handleVariableInputChange = (formulaId: string, varSymbol: string, val: number) => {
    setInputValues((prev) => ({
      ...prev,
      [formulaId]: {
        ...prev[formulaId],
        [varSymbol]: val,
      },
    }));
  };

  const handleSolve = (formula: FormulaItem) => {
    const target = targetVariable[formula.id] || formula.variables[0].symbol;
    const values = inputValues[formula.id];
    const res = formula.solveFn(target, values);

    setCalculationResult((prev) => ({
      ...prev,
      [formula.id]: res,
    }));
    onFormulaSolved?.(formula.name);
  };

  const filteredFormulas = FORMULA_DATABASE.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.equation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || f.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/20 p-6 md:p-8 backdrop-blur-md">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl"></div>
        <div className="relative z-10 max-w-2xl space-y-2">
          <h2 className="text-2xl font-black text-white">Quantum Formula Solver</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Select any standard physics formula, choose the variable you want to solve, enter the parameters, and watch the AI compute step-by-step mathematical substitution.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search formulas (e.g. F = ma, gravity)..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/40 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 w-full md:w-auto overflow-x-auto">
          {(['all', 'mechanics', 'electromagnetism', 'quantum'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold font-mono uppercase transition-all duration-150 shrink-0 ${
                activeCategory === cat
                  ? 'bg-slate-900 text-cyan-400 border border-slate-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Formula List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredFormulas.map((f) => {
          const isExpanded = expandedId === f.id;
          const currentTarget = targetVariable[f.id] || f.variables[0].symbol;
          const resultObj = calculationResult[f.id];

          return (
            <div
              key={f.id}
              className={`rounded-2xl border transition-all duration-300 ${
                isExpanded
                  ? 'border-cyan-500/30 bg-slate-900/30 shadow-lg shadow-cyan-950/20'
                  : 'border-slate-800 bg-slate-900/10 hover:border-slate-700 hover:bg-slate-900/20'
              }`}
            >
              {/* Formula Header Summary */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : f.id)}
                className="flex items-center justify-between p-5 cursor-pointer"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    {f.category}
                  </span>
                  <h3 className="font-bold text-white text-base">{f.name}</h3>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800/80 font-mono font-black text-sm text-cyan-400 shadow-inner">
                    {f.equation}
                  </div>
                  <span className="text-slate-500 text-xs">
                    {isExpanded ? 'Collapse' : 'Solve'}
                  </span>
                </div>
              </div>

              {/* Expanded Interactive Solver */}
              {isExpanded && (
                <div className="border-t border-slate-800/80 p-6 bg-slate-950/40 space-y-6">
                  <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                    {f.description}
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Form Parameters */}
                    <div className="lg:col-span-7 space-y-5">
                      {/* Solver Variable Target */}
                      <div className="space-y-2">
                        <label className="text-xs font-mono font-bold text-slate-400 uppercase">
                          Solve For:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {f.variables.map((v) => (
                            <button
                              key={v.symbol}
                              onClick={() => {
                                setTargetVariable((prev) => ({ ...prev, [f.id]: v.symbol }));
                                // Reset result on target change
                                setCalculationResult((prev) => ({ ...prev, [f.id]: null }));
                              }}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-bold font-mono transition-all duration-150 ${
                                currentTarget === v.symbol
                                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              {v.name} ({v.symbol})
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Inputs list */}
                      <div className="space-y-3.5 pt-2">
                        <label className="text-xs font-mono font-bold text-slate-400 uppercase block">
                          Enter Parameters:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {f.variables
                            .filter((v) => v.symbol !== currentTarget)
                            .map((v) => (
                              <div
                                key={v.symbol}
                                className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 flex items-center justify-between"
                              >
                                <div className="space-y-0.5">
                                  <span className="text-xs font-bold text-slate-200">
                                    {v.name} ({v.symbol})
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono block">
                                    Unit: {v.unit}
                                  </span>
                                </div>
                                <input
                                  type="number"
                                  value={inputValues[f.id]?.[v.symbol] ?? v.defaultValue}
                                  onChange={(e) =>
                                    handleVariableInputChange(f.id, v.symbol, Number(e.target.value))
                                  }
                                  className="w-28 text-right bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-cyan-500/40 focus:outline-none"
                                />
                              </div>
                            ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleSolve(f)}
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-bold text-white shadow-lg shadow-cyan-500/15 hover:shadow-cyan-500/25 transition-all duration-200"
                      >
                        <Zap className="h-4 w-4 text-white" />
                        <span>Solve Equation</span>
                      </button>
                    </div>

                    {/* Right Column: Step-by-Step Derivation */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-5 min-h-[180px] flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-slate-400 uppercase border-b border-slate-900 pb-2">
                            <Info className="h-3.5 w-3.5 text-cyan-400" />
                            <span>Step-by-Step Derivation</span>
                          </div>

                          {resultObj ? (
                            <pre className="font-mono text-xs text-cyan-400 leading-relaxed whitespace-pre-wrap pt-2">
                              {resultObj.steps}
                            </pre>
                          ) : (
                            <div className="text-xs text-slate-500 font-mono pt-4 leading-relaxed">
                              Configure parameters and click "Solve Equation" to view the mathematical derivation steps and final result.
                            </div>
                          )}
                        </div>

                        {resultObj && (
                          <div className="pt-4 border-t border-slate-900 flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400">Final Answer:</span>
                            <span className="text-emerald-400 font-bold text-sm bg-emerald-950/20 border border-emerald-900/40 px-3 py-1 rounded-lg">
                              {resultObj.result.toExponential(4).includes('e') && (resultObj.result > 1e4 || resultObj.result < 1e-3)
                                ? resultObj.result.toExponential(4)
                                : resultObj.result.toFixed(3)}{' '}
                              {f.variables.find((v) => v.symbol === currentTarget)?.unit}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
