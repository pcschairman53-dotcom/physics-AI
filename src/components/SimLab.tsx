import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Sliders, Info, Zap, Activity, ShieldAlert, Cpu, BookOpen, Image, ClipboardList, List, CheckCircle2, Globe, Award, Sparkles } from 'lucide-react';

interface Planet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  color: string;
  trail: { x: number; y: number }[];
}

interface GasParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export const SimLab: React.FC<{ onSimExplored: (simName?: string) => void; onOpenAssistant: (simName: string) => void }> = ({ onSimExplored, onOpenAssistant }) => {
  const [activeLab, setActiveLab] = useState<'orbital' | 'gas' | 'rlc'>('orbital');

  // 1. Orbital Mechanics State
  const [starMass, setStarMass] = useState(15000);
  const [planetMass, setPlanetMass] = useState(10);
  const [planetDist, setPlanetDist] = useState(120);
  const [planetVel, setPlanetVel] = useState(11);
  const [orbitalIsRunning, setOrbitalIsRunning] = useState(true);
  const planetsRef = useRef<Planet[]>([]);

  // 2. Gas Law State
  const [gasTemp, setGasTemp] = useState(300); // Kelvin
  const [gasVolume, setGasVolume] = useState(250); // width of chamber (px)
  const [gasCount, setGasCount] = useState(60);
  const [gasIsRunning, setGasIsRunning] = useState(true);
  const particlesRef = useRef<GasParticle[]>([]);
  const [pressureHistory, setPressureHistory] = useState<number[]>([]);

  // 3. RLC Circuit State
  const [rlcR, setRlcR] = useState(50); // Ohms
  const [rlcL, setRlcL] = useState(0.4); // Henries
  const [rlcC, setRlcC] = useState(40); // Microfarads
  const [rlcF, setRlcF] = useState(60); // Hz
  const [rlcV0, setRlcV0] = useState(120); // Volts
  const [rlcTime, setRlcTime] = useState(0);

  // Canvas Refs
  const orbitalCanvasRef = useRef<HTMLCanvasElement>(null);
  const gasCanvasRef = useRef<HTMLCanvasElement>(null);
  const rlcCanvasRef = useRef<HTMLCanvasElement>(null);

  const labNames: Record<'orbital' | 'gas' | 'rlc', string> = {
    orbital: 'Orbital Mechanics Lab',
    gas: 'Ideal Gas Law Chamber',
    rlc: 'RLC Circuit Lab',
  };

  type LabContent = {
    concept: string;
    applications: string[];
    workingPrinciple: string[];
    notes: string[];
    formulas: Array<{ formula: string; variables: string; units: string }>;
    solvedExamples: Array<{ question: string; solution: string }>;
    practiceQuestions: string[];
    mcqs: Array<{ question: string; options: string[]; answer: string }>;
    numericalProblems: Array<{ question: string; solution: string }>;
    mistakes: string[];
    tips: string[];
    diagrams: Array<{ src: string; caption: string }>;
    explanation: string;
    controlNotes: string[];
    relatedChapters: string[];
    relatedFormulas: string[];
    previousYearQuestions: string[];
    outcome: string;
  };

  const labContent: Record<'orbital' | 'gas' | 'rlc', LabContent> = {
    orbital: {
      concept: 'Orbital mechanics studies how objects move under gravity, including planets, satellites, and spacecraft. It connects Newton’s law of gravitation with circular and elliptical motion.',
      applications: [
        'Satellite navigation and GPS orbit design',
        'Spacecraft transfer between Earth and Moon',
        'Predicting planetary motion for astronomy',
        'Designing stable orbits for weather satellites',
        'Planning launch trajectories and re-entry paths',
      ],
      workingPrinciple: [
        'A central mass creates a gravitational field that attracts smaller bodies.',
        'The orbiting object is constantly falling toward the mass while moving sideways.',
        'The balance of centripetal force and gravity determines the orbit shape.',
      ],
      notes: [
        'The orbital speed depends on distance from the central mass.',
        'A higher central mass or smaller radius increases the gravitational pull.',
        'Real orbits are nearly elliptical and can be influenced by additional forces.',
      ],
      formulas: [
        { formula: 'F = G m₁ m₂ / r²', variables: 'F (force), m₁, m₂, r', units: 'N, kg, kg, m' },
        { formula: 'v = √(G M / r)', variables: 'v (velocity), G, M, r', units: 'm/s, N·m²/kg², kg, m' },
      ],
      solvedExamples: [
        { question: 'Find orbital speed for a 2000 kg satellite at 10000 km from a 5×10^24 kg planet.', solution: 'Use v = √(GM/r). Convert radius to meters and plug values to get the speed in m/s.' },
        { question: 'If the orbital radius doubles, how does the required speed change?', solution: 'Since v ∝ 1/√r, doubling r reduces speed by 1/√2, about 0.71 times the original speed.' },
      ],
      practiceQuestions: [
        'Why does a satellite remain in orbit instead of falling straight down?',
        'How does increasing central mass affect orbital velocity?',
        'What happens to orbital period when radius is larger?',
        'Why are orbits often close to circular for satellites?',
        'How does launch velocity influence orbit shape?',
      ],
      mcqs: [
        { question: 'What force keeps a satellite in orbit?', options: ['Friction', 'Electric force', 'Gravitational force', 'Magnetic force'], answer: 'Gravitational force' },
        { question: 'If orbital radius increases, orbital speed', options: ['Increases', 'Decreases', 'Remains same', 'Becomes zero'], answer: 'Decreases' },
        { question: 'The gravitational force between two masses is inversely proportional to', options: ['r', 'r²', 'r³', '√r'], answer: 'r²' },
        { question: 'A circular orbit requires centripetal acceleration toward the', options: ['velocity', 'orbit plane', 'central mass', 'outside direction'], answer: 'central mass' },
        { question: 'Kepler’s third law links orbital period and', options: ['mass', 'radius', 'charge', 'temperature'], answer: 'radius' },
        { question: 'A higher star mass at same radius produces', options: ['lower speed', 'higher speed', 'no change', 'negative speed'], answer: 'higher speed' },
        { question: 'Escape velocity is the speed needed to', options: ['stop orbiting', 'leave gravitational field', 'fall faster', 'increase altitude'], answer: 'leave gravitational field' },
        { question: 'An orbiting body continuously falls toward the center but never', options: ['slows down', 'reaches it', 'changes direction', 'loses mass'], answer: 'reaches it' },
        { question: 'In the formula F = G m₁ m₂ / r², G is called', options: ['electric constant', 'gravitational constant', 'gas constant', 'magnetic constant'], answer: 'gravitational constant' },
        { question: 'The shape of a stable satellite path under gravity is', options: ['straight line', 'circle or ellipse', 'parabola', 'zigzag'], answer: 'circle or ellipse' },
      ],
      numericalProblems: [
        { question: 'Calculate orbital speed for a satellite 8000 km from Earth center with M=5.97×10^24 kg.', solution: 'Use v = √(GM/r); convert 8000 km to 8.0×10^6 m and compute the value.' },
        { question: 'If a satellite radius changes from 7000 km to 14000 km, what is the speed factor?', solution: 'Speed changes by 1/√2, so it becomes about 0.71 times the initial speed.' },
        { question: 'Compute gravitational force between 1000 kg satellite and 5×10^24 kg planet at 1.5×10^7 m.', solution: 'Apply F = G m₁ m₂ / r² and evaluate with G = 6.67×10^-11.' },
        { question: 'Find the orbital period of a satellite at 10000 km radius assuming circular orbit.', solution: 'Use T = 2πr/v with v = √(GM/r).' },
        { question: 'A satellite gains speed. Its orbit becomes', solution: 'more elliptical or it may escape if speed is high enough.' },
      ],
      mistakes: [
        'Assuming orbital motion is due to fuel thrust rather than gravity.',
        'Using linear instead of inverse-square dependence on distance.',
        'Treating velocity and acceleration as the same quantity.',
        'Forgetting to convert kilometers to meters in formulas.',
      ],
      tips: [
        'Use consistent SI units before plugging into formulas.',
        'Remember v = √(GM/r) for circular orbit speed.',
        'Check whether the orbit is circular or elliptical first.',
        'Draw the gravitational force toward the central body.',
      ],
      diagrams: [
        { src: 'https://images.unsplash.com/photo-1512676667128-44f496fd6bdb?auto=format&fit=crop&w=900&q=80', caption: 'Orbital trajectory around a planetary body' },
        { src: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80', caption: 'Satellite orbit visualization' },
      ],
      explanation: 'Adjust star mass, orbital radius, and initial velocity. A heavier star pulls more strongly and requires faster orbital speed; a larger radius lowers speed and lengthens the orbit.',
      controlNotes: [
        'Star Mass: increases gravitational attraction and raises orbital velocity.',
        'Orbital Distance: sets the radius of the path around the central mass.',
        'Initial Velocity: controls whether the object settles into a stable orbit or escapes.',
      ],
      relatedChapters: ['Motion in a Straight Line', 'Newton’s Laws', 'Gravitation'],
      relatedFormulas: ['F = G m₁ m₂ / r²', 'v = √(GM/r)', 'T = 2π√(r³/GM)'],
      previousYearQuestions: [
        'Define gravitational force and state its dependence on distance.',
        'Explain why satellites stay in orbit around Earth.',
        'Calculate orbital speed for a circular orbit.',
        'State Kepler’s third law in words.',
        'Why does a higher orbit have a longer period?',
      ],
      outcome: 'You understand how gravity and circular motion create stable orbits, and how orbit size and central mass determine velocity.',
    },
    gas: {
      concept: 'The ideal gas law describes how pressure, volume, and temperature relate for gas particles, assuming random motion and elastic collisions.',
      applications: [
        'Design of car engines and combustion chambers',
        'Understanding weather balloon expansion',
        'Predicting pressure changes in gas cylinders',
        'Analyzing breathing and lung mechanics',
        'Working with refrigeration and air conditioning systems',
      ],
      workingPrinciple: [
        'Gas particles move randomly and collide with container walls.',
        'Each collision transfers momentum, creating pressure on the walls.',
        'Higher temperature increases particle speed and therefore pressure.',
      ],
      notes: [
        'Volume is the container size available to gas particles.',
        'Temperature measures average kinetic energy of particles.',
        'For the ideal gas, interactions between particles are negligible.',
      ],
      formulas: [
        { formula: 'PV = nRT', variables: 'P, V, n, R, T', units: 'Pa, m³, mol, J/(mol·K), K' },
        { formula: 'P = N k_B T / V', variables: 'P, N, k_B, T, V', units: 'Pa, count, J/K, K, m³' },
      ],
      solvedExamples: [
        { question: 'Find pressure if 2 mol of gas occupies 0.05 m³ at 300 K.', solution: 'Use PV=nRT with R=8.314, so P = 2×8.314×300/0.05.' },
        { question: 'If temperature doubles while volume is constant, how does pressure change?', solution: 'Pressure doubles according to P ∝ T at constant volume.' },
      ],
      practiceQuestions: [
        'What happens to pressure when volume decreases at fixed temperature?',
        'Why does increasing temperature raise pressure in a sealed container?',
        'How is pressure measured from particle collisions?',
        'When is the ideal gas law a good approximation?',
        'What is the effect of increasing molecule count at constant V and T?',
      ],
      mcqs: [
        { question: 'In the ideal gas law, increasing temperature at constant volume makes pressure', options: ['increase', 'decrease', 'stay same', 'become zero'], answer: 'increase' },
        { question: 'PV = nRT holds when gas behaves', options: ['ideally', 'as a liquid', 'as a solid', 'nonlinearly'], answer: 'ideally' },
        { question: 'Pressure arises from molecules hitting the', options: ['container walls', 'center of mass', 'each other only', 'outside air'], answer: 'container walls' },
        { question: 'If volume doubles at constant pressure, temperature must', options: ['double', 'halve', 'stay same', 'become zero'], answer: 'double' },
        { question: 'The gas constant R has units', options: ['J/K', 'J/(mol·K)', 'Pa·m³', 'kg/m³'], answer: 'J/(mol·K)' },
        { question: 'A sealed vessel with fixed moles and volume is an example of', options: ['isobaric', 'isochoric', 'isothermal', 'adiabatic'], answer: 'isochoric' },
        { question: 'Ideal gas particles are assumed to have', options: ['no volume', 'high volume', 'sticky surfaces', 'fixed positions'], answer: 'no volume' },
        { question: 'Gas pressure increases if temperature rises because', options: ['particles move faster', 'volume shrinks', 'moles change', 'gravity increases'], answer: 'particles move faster' },
        { question: 'If molecule count increases at constant T and V, pressure', options: ['increases', 'decreases', 'stays same', 'becomes negative'], answer: 'increases' },
        { question: 'The formula P = N k_B T / V uses k_B as', options: ['Boltzmann constant', 'gas constant', 'Coulomb constant', 'Planck constant'], answer: 'Boltzmann constant' },
      ],
      numericalProblems: [
        { question: 'Calculate pressure for 3 mol gas at 250 K in 0.1 m³.', solution: 'P = nRT/V = 3×8.314×250/0.1.' },
        { question: 'What is pressure if volume halves at constant T?', solution: 'Pressure doubles because P ∝ 1/V.' },
        { question: 'Find temperature if 1 mol gas at 101325 Pa occupies 0.024 m³.', solution: 'T = PV/nR.' },
        { question: 'If N doubles while V and T fixed, pressure', solution: 'doubles.' },
        { question: 'Compute pressure for 2 mol at 100 kPa in 0.02 m³.', solution: 'Use PV=nRT rearranged or numerical substitution.' },
      ],
      mistakes: [
        'Forgetting to convert temperature to kelvin.',
        'Treating n and N as the same quantity without conversion.',
        'Using volume in liters when formula requires m³.',
        'Assuming all gases are ideal at very high pressure.',
      ],
      tips: [
        'Use PV = nRT with SI units for exam calculations.',
        'At fixed volume, pressure is proportional to temperature.',
        'Check whether the problem gives moles or molecules before using formulas.',
        'Write down units for P, V, n, R, and T clearly.',
      ],
      diagrams: [
        { src: 'https://images.unsplash.com/photo-1542327897-2ec0d8eb48d2?auto=format&fit=crop&w=900&q=80', caption: 'Gas particles colliding inside a chamber' },
        { src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80', caption: 'Thermodynamic process in a piston' },
      ],
      explanation: 'Temperature controls particle speed, volume sets the container size, and particle count changes collision frequency. Together they determine the pressure reading.',
      controlNotes: [
        'Chamber Temperature: raises particle kinetic energy and increases pressure.',
        'Chamber Volume: larger volume gives more space, lowering collisions and pressure.',
        'Molecule Count: more particles produce more wall impacts and higher pressure.',
      ],
      relatedChapters: ['Units and Measurements', 'Kinetic Theory', 'Thermodynamics'],
      relatedFormulas: ['PV = nRT', 'P = N k_B T / V', 'ρ = m/V'],
      previousYearQuestions: [
        'State the ideal gas law and explain each symbol.',
        'How does pressure change when volume decreases at constant temperature?',
        'Calculate the pressure of a gas sample at given conditions.',
        'What is the effect of temperature on gas pressure?',
        'Why is kelvin used in gas law calculations?',
      ],
      outcome: 'You can explain how pressure, temperature, and volume are linked by particle motion and apply the ideal gas law correctly.',
    },
    rlc: {
      concept: 'RLC circuits combine resistance, inductance, and capacitance to shape AC current and voltage. Their behavior depends on impedance and resonance.',
      applications: [
        'Tuning radio frequencies in broadcast receivers',
        'Designing filters for audio and communication systems',
        'Building timing circuits in oscillators',
        'Measuring impedance in power electronics',
        'Studying resonant behavior in wireless charging systems',
      ],
      workingPrinciple: [
        'Resistance dissipates energy as heat and limits current.',
        'Inductance stores energy in the magnetic field and resists changes in current.',
        'Capacitance stores energy in the electric field and resists changes in voltage.',
      ],
      notes: [
        'Resonance occurs when inductive and capacitive reactance cancel each other.',
        'At resonance, circuit impedance is lowest and current is highest.',
        'Phase angle tells whether current leads or lags voltage.',
      ],
      formulas: [
        { formula: 'Z = √(R² + (X_L - X_C)²)', variables: 'Z, R, X_L, X_C', units: 'Ω, Ω, Ω, Ω' },
        { formula: 'X_L = 2πfL', variables: 'X_L, f, L', units: 'Ω, Hz, H' },
        { formula: 'X_C = 1 / (2πfC)', variables: 'X_C, f, C', units: 'Ω, Hz, F' },
      ],
      solvedExamples: [
        { question: 'Find impedance when R=50Ω, L=0.4H, C=40μF, f=60Hz.', solution: 'Compute X_L and X_C, then Z = √(R²+(X_L−X_C)²).' },
        { question: 'At resonance, what is the phase relationship between V and I?', solution: 'They are in phase because X_L = X_C and reactive effects cancel.' },
      ],
      practiceQuestions: [
        'How does increasing frequency affect inductive reactance?',
        'What happens when X_L equals X_C?',
        'Why does resistance still matter at resonance?',
        'How does capacitance influence current amplitude?',
        'What does the phase angle indicate in an RLC circuit?',
      ],
      mcqs: [
        { question: 'In an RLC circuit, resonance occurs when', options: ['R=0', 'X_L=X_C', 'V=I', 'f=0'], answer: 'X_L=X_C' },
        { question: 'Inductive reactance increases with', options: ['frequency', 'capacitance', 'resistance', 'voltage'], answer: 'frequency' },
        { question: 'Capacitive reactance is inversely proportional to', options: ['frequency', 'inductance', 'resistance', 'voltage'], answer: 'frequency' },
        { question: 'Impedance Z has the units of', options: ['A', 'V', 'Ω', 'W'], answer: 'Ω' },
        { question: 'At resonance, the circuit behaves like a', options: ['pure resistor', 'pure inductor', 'pure capacitor', 'battery'], answer: 'pure resistor' },
        { question: 'Phase angle is positive when circuit is', options: ['inductive', 'capacitive', 'resistive', 'open'], answer: 'inductive' },
        { question: 'A higher resistance causes current to', options: ['decrease', 'increase', 'stay same', 'reverse'], answer: 'decrease' },
        { question: 'If frequency is below resonance, the circuit is', options: ['capacitive', 'inductive', 'resistive', 'open'], answer: 'capacitive' },
        { question: 'Reactance X_C decreases when capacitance', options: ['increases', 'decreases', 'stays same', 'reverses'], answer: 'increases' },
        { question: 'The voltage across an inductor lags current by', options: ['90°', '0°', '45°', '180°'], answer: '90°' },
      ],
      numericalProblems: [
        { question: 'Calculate X_L for L=0.4 H at 60 Hz.', solution: 'X_L = 2πfL = 2π×60×0.4.' },
        { question: 'Calculate X_C for C=40 μF at 60 Hz.', solution: 'X_C = 1/(2πfC) with C in farads.' },
        { question: 'Find Z if R=50Ω, X_L=150Ω and X_C=100Ω.', solution: 'Z = √(50²+(150−100)²).' },
        { question: 'What is the resonant frequency for L=0.4 H and C=40 μF?', solution: 'f_0 = 1/(2π√(LC)).' },
        { question: 'If V₀=120 V and Z=100Ω, what is peak current?', solution: 'I₀ = V₀/Z = 120/100.' },
      ],
      mistakes: [
        'Confusing current and voltage phase relationships.',
        'Forgetting to convert microfarads to farads in X_C.',
        'Using DC formulas for AC reactance problems.',
        'Assuming resonance occurs at all frequencies.',
      ],
      tips: [
        'Always use C in farads and L in henries.',
        'Check whether the circuit is inductive or capacitive before answering phase questions.',
        'At resonance, current is determined mainly by R.',
        'Write X_L and X_C separately before combining them.',
      ],
      diagrams: [
        { src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80', caption: 'AC circuit components and waveform analysis' },
        { src: 'https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&w=900&q=80', caption: 'Resonant circuit diagram with oscilloscope' },
      ],
      explanation: 'Resistance dissipates energy, inductance resists current change, and capacitance resists voltage change. The balance of X_L and X_C determines whether the circuit is inductive, capacitive, or resonant.',
      controlNotes: [
        'Resistance: increases impedance and reduces current amplitude.',
        'Inductance: raises X_L and can make the circuit inductive.',
        'Capacitance: lowers X_C and can make the circuit capacitive.',
        'Frequency: moves the circuit toward or away from resonance.',
      ],
      relatedChapters: ['Alternating Current', 'Magnetic Fields', 'Electromagnetic Waves'],
      relatedFormulas: ['X_L = 2πfL', 'X_C = 1/(2πfC)', 'Z = √(R² + (X_L − X_C)²)'],
      previousYearQuestions: [
        'Define impedance in an RLC circuit.',
        'Explain resonance in terms of reactances.',
        'Calculate inductive reactance for a given frequency.',
        'What happens to current at resonance?',
        'State whether current leads or lags in a capacitive circuit.',
      ],
      outcome: 'You can identify the role of resistance, inductance, and capacitance and describe how resonance alters AC behavior in an RLC circuit.',
    },
  };

  const activeLabTitle = labNames[activeLab];
  const activeLabContent = labContent[activeLab];
  const handleOpenAiAssistant = () => {
    onOpenAssistant(activeLabTitle);
  };

  useEffect(() => {
    onSimExplored(labNames[activeLab]);
  }, [activeLab]);

  // -----------------------------------------------------------
  // 1. ORBITAL MECHANICS SIMULATION LOOP
  // -----------------------------------------------------------
  useEffect(() => {
    if (activeLab !== 'orbital') return;
    const canvas = orbitalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    const height = (canvas.height = 360);

    const starX = width / 2;
    const starY = height / 2;

    // Initialize planets if empty
    if (planetsRef.current.length === 0) {
      planetsRef.current = [
        {
          x: starX,
          y: starY - planetDist,
          vx: planetVel,
          vy: 0,
          mass: planetMass,
          color: '#22d3ee', // Cyan
          trail: [],
        },
      ];
    }

    const drawOrbital = () => {
      ctx.fillStyle = '#020617'; // slate-950
      ctx.fillRect(0, 0, width, height);

      // Draw faint space grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.3)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Star (Massive Center body)
      // Glowing aura
      const starRadius = Math.max(12, Math.min(30, 8 * Math.log(starMass / 100)));
      const gradient = ctx.createRadialGradient(starX, starY, 2, starX, starY, starRadius * 2);
      gradient.addColorStop(0, '#fef08a'); // yellow-200
      gradient.addColorStop(0.3, '#facc15'); // yellow-400
      gradient.addColorStop(1, 'rgba(234, 179, 8, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(starX, starY, starRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fbbf24'; // solid star core
      ctx.beginPath();
      ctx.arc(starX, starY, starRadius, 0, Math.PI * 2);
      ctx.fill();

      // Physics integration (Euler-Cromer or Verlet)
      const G = 0.1; // Gravitational constant scaled for screen

      planetsRef.current.forEach((p) => {
        // Draw orbital trail
        if (p.trail.length > 1) {
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let i = 1; i < p.trail.length; i++) {
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
          }
          ctx.stroke();
        }

        if (orbitalIsRunning) {
          const dt = 0.15; // time step

          // Distance vector from star to planet
          const dx = starX - p.x;
          const dy = starY - p.y;
          const r2 = dx * dx + dy * dy;
          const r = Math.sqrt(r2);

          if (r > starRadius) {
            // Gravitational Force: F = G * M * m / r^2
            // Acceleration: a = F / m = G * M / r^2
            const aMag = (G * starMass) / r2;
            const ax = aMag * (dx / r);
            const ay = aMag * (dy / r);

            // Update planet velocity
            p.vx += ax * dt;
            p.vy += ay * dt;

            // Update position
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Append to trail
            p.trail.push({ x: p.x, y: p.y });
            if (p.trail.length > 250) {
              p.trail.shift();
            }
          }
        }

        // Draw planet
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw vector arrows for velocity
        if (orbitalIsRunning) {
          ctx.strokeStyle = '#a855f7'; // Purple velocity arrow
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 2.5, p.y + p.vy * 2.5);
          ctx.stroke();
        }
      });

      // Info telemetry overlay
      if (planetsRef.current.length > 0) {
        const p = planetsRef.current[0];
        const dx = starX - p.x;
        const dy = starY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const velocity = Math.sqrt(p.vx * p.vx + p.vy * p.vy);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(10, 10, 200, 80, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText(`Orbit Dist (r): ${dist.toFixed(1)} AU`, 20, 28);
        ctx.fillText(`Velocity (v): ${velocity.toFixed(2)} km/s`, 20, 46);
        ctx.fillText(`Kepler Constant: ${(Math.pow(dist, 3) / Math.pow(365, 2)).toFixed(4)}`, 20, 64);
      }

      animationId = requestAnimationFrame(drawOrbital);
    };

    drawOrbital();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [activeLab, starMass, planetMass, planetDist, planetVel, orbitalIsRunning]);

  // Handle custom launch in orbital mechanics
  const handleOrbitalClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeLab !== 'orbital') return;
    const canvas = orbitalCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const starX = canvas.width / 2;
    const starY = canvas.height / 2;

    // Launch a new planet at the clicked coordinates, with tangential velocity
    const dx = clickX - starX;
    const dy = clickY - starY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Tangential direction: (-dy, dx) normalized
    const tx = -dy / dist;
    const ty = dx / dist;

    // Orbital speed estimate: v = sqrt(G*M/r)
    const vOrbital = Math.sqrt((0.1 * starMass) / dist);

    const newPlanet: Planet = {
      x: clickX,
      y: clickY,
      vx: tx * vOrbital * 1.0, // launch close to circular velocity
      vy: ty * vOrbital * 1.0,
      mass: 8,
      color: `hsl(${Math.random() * 360}, 85%, 65%)`,
      trail: [],
    };

    planetsRef.current.push(newPlanet);
  };

  // -----------------------------------------------------------
  // 2. THERMODYNAMICS IDEAL GAS LAW LOOP
  // -----------------------------------------------------------
  useEffect(() => {
    if (activeLab !== 'gas') return;
    const canvas = gasCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    const height = (canvas.height = 360);

    // Initialize gas particles
    if (particlesRef.current.length === 0 || particlesRef.current.length !== gasCount) {
      particlesRef.current = [];
      for (let i = 0; i < gasCount; i++) {
        // Particle speed scales with square root of temperature (kinetic molecular theory)
        const speedMultiplier = Math.sqrt(gasTemp / 100) * 1.2;
        const angle = Math.random() * Math.PI * 2;
        particlesRef.current.push({
          x: 20 + Math.random() * (gasVolume - 40),
          y: 20 + Math.random() * (height - 60),
          vx: Math.cos(angle) * speedMultiplier,
          vy: Math.sin(angle) * speedMultiplier,
          radius: 4,
          color: `hsl(${(240 - (gasTemp / 500) * 180)}, 85%, 60%)`, // Red for hot, Blue for cold
        });
      }
    }

    let wallCollisionsCount = 0;

    const drawGas = () => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Chamber coordinates
      const chamberLeft = 15;
      const chamberRight = chamberLeft + gasVolume;
      const chamberTop = 15;
      const chamberBottom = height - 35;

      // Draw Chamber Box (with glowing piston wall on the right)
      ctx.strokeStyle = '#334155'; // slate-700
      ctx.lineWidth = 3;
      ctx.strokeRect(chamberLeft, chamberTop, gasVolume, chamberBottom - chamberTop);

      // Piston Handle / Wall
      ctx.fillStyle = '#64748b'; // slate-500
      ctx.fillRect(chamberRight - 4, chamberTop - 4, 8, chamberBottom - chamberTop + 8);

      // Physics update: Particle motion & collision
      if (gasIsRunning) {
        // Temperature updates speeds dynamically if changed
        const targetSpeed = Math.sqrt(gasTemp / 100) * 1.5;

        particlesRef.current.forEach((p) => {
          // Slowly adjust speed toward target speed (thermalizing)
          const curSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (curSpeed > 0) {
            p.vx = (p.vx / curSpeed) * targetSpeed;
            p.vy = (p.vy / curSpeed) * targetSpeed;
          }

          p.x += p.vx;
          p.y += p.vy;

          // Wall collisions (elastic)
          if (p.x - p.radius <= chamberLeft) {
            p.x = chamberLeft + p.radius;
            p.vx *= -1;
            wallCollisionsCount++;
          }
          if (p.x + p.radius >= chamberRight) {
            p.x = chamberRight - p.radius;
            p.vx *= -1;
            wallCollisionsCount++;
          }
          if (p.y - p.radius <= chamberTop) {
            p.y = chamberTop + p.radius;
            p.vy *= -1;
            wallCollisionsCount++;
          }
          if (p.y + p.radius >= chamberBottom) {
            p.y = chamberBottom - p.radius;
            p.vy *= -1;
            wallCollisionsCount++;
          }

          // Render Particle
          ctx.fillStyle = `hsl(${(240 - (gasTemp / 550) * 240)}, 85%, 60%)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        });

        // Particle-Particle collisions (simplified grid or randomized pair check)
        // For efficiency in React, let's do a fast pair collision check
        for (let i = 0; i < particlesRef.current.length; i++) {
          for (let j = i + 1; j < particlesRef.current.length; j++) {
            const p1 = particlesRef.current[i];
            const p2 = particlesRef.current[j];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = p1.radius + p2.radius;

            if (dist < minDist) {
              // Simple elastic collision response (swap velocities)
              const tempVx = p1.vx;
              const tempVy = p1.vy;
              p1.vx = p2.vx;
              p1.vy = p2.vy;
              p2.vx = tempVx;
              p2.vy = tempVy;

              // Separate overlapping particles slightly
              const overlap = minDist - dist;
              const sx = (dx / dist) * overlap * 0.5;
              const sy = (dy / dist) * overlap * 0.5;
              p1.x -= sx;
              p1.y -= sy;
              p2.x += sx;
              p2.y += sy;
            }
          }
        }
      } else {
        // Draw static particles
        particlesRef.current.forEach((p) => {
          ctx.fillStyle = `hsl(${(240 - (gasTemp / 550) * 240)}, 85%, 60%)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Calculate Pressure: P = N * k_B * T / V
      // Scaled for simulation: P = count * Temp / Volume
      const calculatedPressure = (gasCount * gasTemp) / (gasVolume * 1.5);

      // Collect pressure history for a mini-graph
      if (gasIsRunning && Math.random() < 0.1) {
        setPressureHistory((prev) => {
          const next = [...prev, calculatedPressure];
          if (next.length > 50) next.shift();
          return next;
        });
      }

      // Draw Pressure Gauges and Telemetry (Right Column)
      const panelX = chamberRight + 20;
      const panelW = width - panelX - 15;

      if (panelW > 100) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(panelX, chamberTop, panelW, chamberBottom - chamberTop, 8);
        ctx.fill();
        ctx.stroke();

        // Title
        ctx.fillStyle = '#22d3ee';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('THERMODYNAMIC READOUT', panelX + 12, chamberTop + 20);

        // Values
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText(`Temp (T):   ${gasTemp} K`, panelX + 12, chamberTop + 45);
        ctx.fillText(`Volume (V): ${gasVolume} L`, panelX + 12, chamberTop + 65);
        ctx.fillText(`Amount (N): ${gasCount} mol`, panelX + 12, chamberTop + 85);

        // Pressure dial
        ctx.fillStyle = '#f87171'; // red-400
        ctx.fillText(`Pressure (P): ${calculatedPressure.toFixed(2)} kPa`, panelX + 12, chamberTop + 115);

        // Live pressure graph
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const graphX = panelX + 12;
        const graphY = chamberBottom - 40;
        const graphH = 50;
        const graphW = panelW - 24;

        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(graphX, graphY, graphW, graphH);

        ctx.strokeStyle = '#ef4444';
        if (pressureHistory.length > 1) {
          ctx.beginPath();
          for (let i = 0; i < pressureHistory.length; i++) {
            const px = graphX + (i / pressureHistory.length) * graphW;
            const py = graphY + graphH - (pressureHistory[i] / 120) * graphH;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
        ctx.fillStyle = '#475569';
        ctx.fillText('Pressure over Time', graphX, graphY - 5);
      }

      animationId = requestAnimationFrame(drawGas);
    };

    drawGas();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [activeLab, gasTemp, gasVolume, gasCount, gasIsRunning, pressureHistory]);

  // Adjust particle counts when slider changes
  useEffect(() => {
    particlesRef.current = [];
  }, [gasCount]);

  // -----------------------------------------------------------
  // 3. RLC CIRCUIT SIMULATION LOOP
  // -----------------------------------------------------------
  useEffect(() => {
    if (activeLab !== 'rlc') return;
    const canvas = rlcCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    const height = (canvas.height = 360);

    const drawRLC = () => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Math calculations for AC RLC Circuit
      const omega = 2 * Math.PI * rlcF;
      const XL = omega * rlcL; // Inductive Reactance
      const XC = 1 / (omega * (rlcC * 1e-6)); // Capacitive Reactance
      const X_net = XL - XC;
      const Z = Math.sqrt(rlcR * rlcR + X_net * X_net); // Total Impedance (Ohms)
      const I0 = rlcV0 / Z; // Peak Current (Amps)
      const phi = Math.atan2(X_net, rlcR); // Phase Angle (radians)

      // Oscilloscope Coordinates
      const oscX = 20;
      const oscY = 40;
      const oscW = width - 40;
      const oscH = 180;

      // Draw Oscilloscope Grid
      ctx.fillStyle = '#090d16';
      ctx.fillRect(oscX, oscY, oscW, oscH);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.strokeRect(oscX, oscY, oscW, oscH);

      // Faint grid lines
      ctx.strokeStyle = '#111827';
      for (let x = oscX + 40; x < oscX + oscW; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, oscY);
        ctx.lineTo(x, oscY + oscH);
        ctx.stroke();
      }
      for (let y = oscY + 30; y < oscY + oscH; y += 30) {
        ctx.beginPath();
        ctx.moveTo(oscX, y);
        ctx.lineTo(oscX + oscW, y);
        ctx.stroke();
      }

      // Center baseline
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
      ctx.beginPath();
      ctx.moveTo(oscX, oscY + oscH / 2);
      ctx.lineTo(oscX + oscW, oscY + oscH / 2);
      ctx.stroke();

      // Plot Voltage Waveform (Cyan)
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x < oscW; x++) {
        const t = rlcTime + (x / oscW) * 0.04; // 40ms sweep window
        const V = rlcV0 * Math.sin(omega * t);
        const plotY = oscY + oscH / 2 - (V / 180) * (oscH / 2.5);
        if (x === 0) ctx.moveTo(oscX + x, plotY);
        else ctx.lineTo(oscX + x, plotY);
      }
      ctx.stroke();

      // Plot Current Waveform (Purple)
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x < oscW; x++) {
        const t = rlcTime + (x / oscW) * 0.04;
        const I = I0 * Math.sin(omega * t - phi);
        // Scale current for display so it fits nicely
        const plotY = oscY + oscH / 2 - (I * 20) * (oscH / 2.5);
        if (x === 0) ctx.moveTo(oscX + x, plotY);
        else ctx.lineTo(oscX + x, plotY);
      }
      ctx.stroke();

      // Update Time (Frequency dependent)
      setRlcTime((prev) => prev + 0.0005);

      // Oscilloscope HUD Labels
      ctx.fillStyle = '#22d3ee';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`CH1 (V): ${rlcV0}V Peak`, oscX + 15, oscY + 20);

      ctx.fillStyle = '#a855f7';
      ctx.fillText(`CH2 (I): ${I0.toFixed(2)}A Peak`, oscX + 130, oscY + 20);

      ctx.fillStyle = '#64748b';
      ctx.fillText(`Phase Delay (φ): ${(phi * 180 / Math.PI).toFixed(1)}°`, oscX + 260, oscY + 20);

      // Draw Circuit Schematic diagram below oscilloscope
      const schY = oscY + oscH + 20;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(oscX, schY, oscW, height - schY - 15, 6);
      ctx.fill();
      ctx.stroke();

      // Text labels for circuit variables
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`Impedance (Z): ${Z.toFixed(1)} Ω`, oscX + 15, schY + 20);
      ctx.fillText(`Reactance (XL): ${XL.toFixed(1)} Ω`, oscX + 15, schY + 40);
      ctx.fillText(`Reactance (XC): ${XC.toFixed(1)} Ω`, oscX + 15, schY + 60);

      // Resonant frequency calculation: 1 / (2 * pi * sqrt(L * C))
      const f_res = 1 / (2 * Math.PI * Math.sqrt(rlcL * (rlcC * 1e-6)));
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`Resonant Freq (f_0): ${f_res.toFixed(1)} Hz`, oscX + 180, schY + 20);

      const status = rlcF < f_res - 5 
        ? 'Capacitive Circuit (Current Leads)' 
        : rlcF > f_res + 5 
        ? 'Inductive Circuit (Voltage Leads)' 
        : 'Resonant Circuit (In Phase!)';
      ctx.fillStyle = '#10b981';
      ctx.fillText(`State: ${status}`, oscX + 180, schY + 40);

      animationId = requestAnimationFrame(drawRLC);
    };

    drawRLC();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [activeLab, rlcR, rlcL, rlcC, rlcF, rlcV0, rlcTime]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
      {/* Sidebar: Lab Selectors */}
      <div className="lg:col-span-3 space-y-3">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/10 backdrop-blur-md">
          <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-3">
            Available Labs
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Select an advanced physics domain to load an interactive mathematical model.
          </p>

          <div className="space-y-2">
            {[
              { id: 'orbital', name: '🪐 Orbital Mechanics', desc: 'Gravitational orbits & Keplerian physics' },
              { id: 'gas', name: '💨 Ideal Gas Law', desc: 'Thermodynamic particle chamber' },
              { id: 'rlc', name: '⚡ RLC AC Circuits', desc: 'Oscilloscope phase waveform solver' },
            ].map((lab) => (
              <button
                key={lab.id}
                onClick={() => setActiveLab(lab.id as any)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                  activeLab === lab.id
                    ? 'bg-slate-900 text-cyan-400 border-cyan-500/40 shadow-md shadow-cyan-950/40'
                    : 'text-slate-300 hover:bg-slate-900/50 border-transparent hover:border-slate-800'
                }`}
              >
                <div className="font-bold text-xs">{lab.name}</div>
                <div className="text-[10px] text-slate-500 mt-1">{lab.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Technical Notice */}
        <div className="p-4 rounded-xl border border-slate-800/40 bg-slate-950/40 text-[10px] font-mono text-slate-500 leading-relaxed space-y-2">
          <div className="flex items-center space-x-1.5 text-slate-400 font-bold">
            <Info className="h-3 w-3 text-cyan-400" />
            <span>CALIBRATION NOTE</span>
          </div>
          <p>
            Values are calculated using Euler-Cromer integration step-sizes. To achieve physical resonance, align parameters to target formulas shown in readout.
          </p>
        </div>
      </div>

      {/* Main Sandbox Area */}
      <div className="lg:col-span-9 flex flex-col rounded-2xl border border-slate-800 bg-slate-900/20 backdrop-blur-md overflow-hidden">
        {/* Lab Header */}
        <div className="bg-slate-950/60 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950/50 border border-cyan-800/40">
              <Activity className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">
                {activeLab === 'orbital' && 'Keplerian Orbital Mechanics Laboratory'}
                {activeLab === 'gas' && 'Thermodynamic Gas Chamber Simulation'}
                {activeLab === 'rlc' && 'Oscilloscope AC Impedance Analyzer'}
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                {activeLab === 'orbital' && 'Equation: F = G · m₁m₂ / r²'}
                {activeLab === 'gas' && 'Equation: P = N · k_B · T / V'}
                {activeLab === 'rlc' && 'Equation: V(t) = V₀ · sin(ωt)'}
              </p>
            </div>
          </div>
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
        </div>

        {/* Canvas Render */}
        <div className="bg-slate-950 flex-1 relative overflow-hidden flex items-center justify-center min-h-[360px]">
          {activeLab === 'orbital' && (
            <canvas
              ref={orbitalCanvasRef}
              onClick={handleOrbitalClick}
              className="w-full h-full block cursor-crosshair"
            />
          )}
          {activeLab === 'gas' && (
            <canvas
              ref={gasCanvasRef}
              className="w-full h-full block"
            />
          )}
          {activeLab === 'rlc' && (
            <canvas
              ref={rlcCanvasRef}
              className="w-full h-full block"
            />
          )}
        </div>

        {/* Parameters Sliders Panel */}
        <div className="bg-slate-950/90 border-t border-slate-800 p-5">
          <div className="flex items-center space-x-2 mb-4 border-b border-slate-900 pb-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-widest">Lab Controls</span>
          </div>

          {/* Orbital Controls */}
          {activeLab === 'orbital' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Star Mass (M)</span>
                    <span className="text-cyan-400 font-bold">{starMass} kg</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="35000"
                    step="500"
                    value={starMass}
                    onChange={(e) => {
                      setStarMass(Number(e.target.value));
                      planetsRef.current = []; // clear orbits to trigger re-init
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Orbital Distance (r)</span>
                    <span className="text-cyan-400 font-bold">{planetDist} AU</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="180"
                    value={planetDist}
                    onChange={(e) => {
                      setPlanetDist(Number(e.target.value));
                      planetsRef.current = [];
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Initial Tangential Velocity (v)</span>
                    <span className="text-cyan-400 font-bold">{planetVel} km/s</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="22"
                    step="0.5"
                    value={planetVel}
                    onChange={(e) => {
                      setPlanetVel(Number(e.target.value));
                      planetsRef.current = [];
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setOrbitalIsRunning(!orbitalIsRunning)}
                    className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    {orbitalIsRunning ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                    <span>{orbitalIsRunning ? 'Pause' : 'Resume'}</span>
                  </button>
                  <button
                    onClick={() => {
                      planetsRef.current = [];
                    }}
                    className="flex items-center space-x-2 px-5 py-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset Orbit</span>
                  </button>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Click on canvas space to launch custom satellites!</span>
              </div>
            </div>
          )}

          {/* Gas Chamber Controls */}
          {activeLab === 'gas' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Chamber Temperature (T)</span>
                    <span className="text-red-400 font-bold">{gasTemp} K</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="550"
                    step="10"
                    value={gasTemp}
                    onChange={(e) => setGasTemp(Number(e.target.value))}
                    className="w-full accent-red-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Chamber Volume (V)</span>
                    <span className="text-blue-400 font-bold">{gasVolume} L</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="300"
                    step="10"
                    value={gasVolume}
                    onChange={(e) => setGasVolume(Number(e.target.value))}
                    className="w-full accent-blue-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Molecules Count (N)</span>
                    <span className="text-emerald-400 font-bold">{gasCount}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={gasCount}
                    onChange={(e) => setGasCount(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setGasIsRunning(!gasIsRunning)}
                  className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  {gasIsRunning ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                  <span>{gasIsRunning ? 'Pause' : 'Resume'}</span>
                </button>
                <button
                  onClick={() => {
                    particlesRef.current = [];
                    setPressureHistory([]);
                  }}
                  className="flex items-center space-x-2 px-5 py-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Chamber</span>
                </button>
              </div>
            </div>
          )}

          {/* RLC Controls */}
          {activeLab === 'rlc' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Resistance (R)</span>
                    <span className="text-purple-400 font-bold">{rlcR} Ω</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="150"
                    value={rlcR}
                    onChange={(e) => setRlcR(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Inductance (L)</span>
                    <span className="text-purple-400 font-bold">{rlcL.toFixed(2)} H</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.5"
                    step="0.05"
                    value={rlcL}
                    onChange={(e) => setRlcL(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Capacitance (C)</span>
                    <span className="text-purple-400 font-bold">{rlcC} μF</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={rlcC}
                    onChange={(e) => setRlcC(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">AC Freq (f)</span>
                    <span className="text-purple-400 font-bold">{rlcF} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    value={rlcF}
                    onChange={(e) => setRlcF(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Voltage Amp (V₀)</span>
                    <span className="text-purple-400 font-bold">{rlcV0} V</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="180"
                    value={rlcV0}
                    onChange={(e) => setRlcV0(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => {
                    setRlcR(50);
                    setRlcL(0.4);
                    setRlcC(40);
                    setRlcF(60);
                    setRlcV0(120);
                  }}
                  className="flex items-center space-x-2 px-5 py-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Circuit Values</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-12 space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-cyan-200">
                <BookOpen className="h-4 w-4" />
                SIM LAB GUIDE
              </div>
              <h3 className="text-2xl font-bold text-white">{activeLabTitle} — Learning Companion</h3>
              <p className="text-sm leading-6 text-slate-400">{activeLabContent.concept}</p>
            </div>
            <button
              onClick={handleOpenAiAssistant}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
            >
              <Sparkles className="h-4 w-4" />
              AI Explore
            </button>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                <Info className="h-4 w-4 text-cyan-300" /> Physics Concept
              </div>
              <p className="text-sm leading-6 text-slate-300">{activeLabContent.concept}</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                <Globe className="h-4 w-4 text-cyan-300" /> Real Life Applications
              </div>
              <ul className="space-y-3 text-sm leading-6 text-slate-300">
                {activeLabContent.applications.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                <ClipboardList className="h-4 w-4 text-cyan-300" /> Working Principle
              </div>
              <ol className="space-y-3 text-sm leading-6 text-slate-300 list-decimal list-inside">
                {activeLabContent.workingPrinciple.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                <List className="h-4 w-4 text-cyan-300" /> Interactive Notes
              </div>
              <ul className="space-y-3 text-sm leading-6 text-slate-300">
                {activeLabContent.notes.map((note) => (
                  <li key={note} className="flex items-start gap-2">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                <CheckCircle2 className="h-4 w-4 text-cyan-300" /> Important Formula
              </div>
              <div className="space-y-4 text-sm text-slate-300">
                {activeLabContent.formulas.map((item) => (
                  <div key={item.formula} className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-3">
                    <p className="font-semibold text-white">{item.formula}</p>
                    <p className="text-slate-400">Variables: {item.variables}</p>
                    <p className="text-slate-400">SI Units: {item.units}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                <Award className="h-4 w-4 text-cyan-300" /> Learning Outcome
              </div>
              <p className="text-sm leading-6 text-slate-300">{activeLabContent.outcome}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                <Zap className="h-4 w-4 text-cyan-300" /> Simulation Explanation
              </div>
              <p className="text-sm leading-6 text-slate-300">{activeLabContent.explanation}</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                {activeLabContent.controlNotes.map((note) => (
                  <li key={note} className="flex items-start gap-2">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                <Cpu className="h-4 w-4 text-cyan-300" /> Related Chapters & Formulas
              </div>
              <div className="space-y-4 text-sm text-slate-300">
                <div>
                  <p className="font-semibold text-white">Related Chapters</p>
                  <ul className="mt-3 space-y-2">
                    {activeLabContent.relatedChapters.map((chapter) => (
                      <li key={chapter} className="rounded-2xl border border-slate-800/70 bg-slate-950/40 px-3 py-2">{chapter}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-white">Related Formulas</p>
                  <ul className="mt-3 space-y-2">
                    {activeLabContent.relatedFormulas.map((formula) => (
                      <li key={formula} className="rounded-2xl border border-slate-800/70 bg-slate-950/40 px-3 py-2">{formula}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                <BookOpen className="h-4 w-4 text-cyan-300" /> Previous Year Questions
              </div>
              <ul className="space-y-3 text-sm leading-6 text-slate-300">
                {activeLabContent.previousYearQuestions.map((item) => (
                  <li key={item} className="rounded-2xl border border-slate-800/70 bg-slate-950/40 px-3 py-2">{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 xl:col-span-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                <Image className="h-4 w-4 text-cyan-300" /> Diagram Section
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {activeLabContent.diagrams.map((item) => (
                  <div key={item.src} className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/40">
                    <img loading="lazy" src={item.src} alt={item.caption} className="h-48 w-full object-cover" />
                    <div className="p-3 text-sm text-slate-300">{item.caption}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                <CheckCircle2 className="h-4 w-4 text-cyan-300" /> Practice Questions
              </div>
              <ul className="space-y-3 text-sm leading-6 text-slate-300">
                {activeLabContent.practiceQuestions.map((question) => (
                  <li key={question} className="rounded-2xl border border-slate-800/70 bg-slate-950/40 px-3 py-2">{question}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 xl:col-span-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                <ClipboardList className="h-4 w-4 text-cyan-300" /> MCQs
              </div>
              <div className="space-y-4 text-sm leading-6 text-slate-300">
                {activeLabContent.mcqs.map((item, idx) => (
                  <div key={`${item.question}-${idx}`} className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-3">
                    <p className="font-semibold text-white">{idx + 1}. {item.question}</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {item.options.map((option) => (
                        <div key={option} className="rounded-lg border border-slate-800/80 bg-slate-900 px-3 py-2 text-slate-300">{option}</div>
                      ))}
                    </div>
                    <p className="mt-2 text-sm font-medium text-cyan-300">Answer: {item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                <BookOpen className="h-4 w-4 text-cyan-300" /> Numerical Problems
              </div>
              <ul className="space-y-4 text-sm leading-6 text-slate-300">
                {activeLabContent.numericalProblems.map((item, idx) => (
                  <li key={`${item.question}-${idx}`} className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-3">
                    <p className="font-semibold text-white">{item.question}</p>
                    <p className="mt-2 text-slate-400">Solution: {item.solution}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                <ShieldAlert className="h-4 w-4 text-cyan-300" /> Common Mistakes
              </div>
              <ul className="space-y-3 text-sm leading-6 text-slate-300">
                {activeLabContent.mistakes.map((mistake) => (
                  <li key={mistake} className="rounded-2xl border border-slate-800/70 bg-slate-950/40 px-3 py-2">{mistake}</li>
                ))}
              </ul>
              <div className="mt-5 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
                <p className="font-semibold text-white mb-3">Exam Tips</p>
                <ul className="space-y-2 text-sm leading-6 text-slate-300">
                  {activeLabContent.tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
