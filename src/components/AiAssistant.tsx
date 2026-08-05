import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Play, Pause, RotateCcw, Info, Brain, Zap, HelpCircle, Layers, Sliders, ChevronDown } from 'lucide-react';
import { generateQuestions, type GeneratedQuestionSet, type GeminiQuestionRequest } from '../lib/GeminiService';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  simType?: 'projectile' | 'electrostatic' | 'pendulum' | 'waves';
  equations?: string[];
}

interface Charge {
  id: number;
  x: number;
  y: number;
  q: number; // charge value, positive or negative
}

interface AiAssistantProps {
  onSimExplored: (simName?: string) => void;
  selectedChapter?: { grade: '11' | '12'; title: string } | null;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ onSimExplored, selectedChapter }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Hello! I am your PCS Physics AI Assistant. I can explain complex physics concepts, derive formulas, and run interactive canvas simulations. \n\nSelect one of the topics below to launch an interactive laboratory simulation and receive a step-by-step mathematical breakdown!",
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeSim, setActiveSim] = useState<'projectile' | 'electrostatic' | 'pendulum' | 'waves'>('projectile');
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestionSet | null>(null);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  // Simulation Sliders / Parameters
  // 1. Projectile Parameters
  const [projAngle, setProjAngle] = useState(45);
  const [projVelocity, setProjVelocity] = useState(25);
  const [projGravity, setProjGravity] = useState(9.8);
  const [projDrag, setProjDrag] = useState(0.05);
  const [projIsRunning, setProjIsRunning] = useState(false);
  const projPath = useRef<{ x: number; y: number }[]>([]);
  const projPos = useRef({ x: 0, y: 0 });
  const projVel = useRef({ x: 0, y: 0 });

  // 2. Electrostatic Parameters
  const [charges, setCharges] = useState<Charge[]>([
    { id: 1, x: 150, y: 150, q: 5 },
    { id: 2, x: 350, y: 150, q: -5 },
  ]);
  const [selectedChargeId, setSelectedChargeId] = useState<number | null>(null);

  // 3. Pendulum Parameters
  const [pendLength, setPendLength] = useState(140);
  const [pendGravity, setPendGravity] = useState(9.8);
  const [pendDamping, setPendDamping] = useState(0.02);
  const [pendMass, setPendMass] = useState(15);
  const [pendAngle, setPendAngle] = useState(Math.PI / 4); // 45 degrees
  const [pendAngularVel, setPendAngularVel] = useState(0);
  const [pendIsRunning, setPendIsRunning] = useState(true);

  // 4. Wave Parameters
  const [waveWavelength, setWaveWavelength] = useState(25);
  const [waveSlitSpacing, setWaveSlitSpacing] = useState(45);
  const [waveDistance, setWaveDistance] = useState(160);
  const [wavePhase, setWavePhase] = useState(0);

  // Refs for Canvases
  const projCanvasRef = useRef<HTMLCanvasElement>(null);
  const electrostaticCanvasRef = useRef<HTMLCanvasElement>(null);
  const pendulumCanvasRef = useRef<HTMLCanvasElement>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Preset prompts
  const presets = [
    {
      title: '🚀 Projectile Motion',
      prompt: 'Simulate the trajectory of a projectile with air drag.',
      sim: 'projectile' as const,
      response: `### Trajectory of a Projectile with Air Resistance

When a projectile of mass $m$ is launched in a gravitational field with air resistance, it experiences two main forces:
1. **Gravity**: $F_g = m \\cdot g$ (acting downwards)
2. **Air Drag**: $F_d = -c \\cdot v^2$ or $-b \\cdot v$ (acting opposite to the velocity vector)

#### Governing Differential Equations:
With quadratic drag ($F_d = -\\frac{1}{2} C_d \\rho A v^2$), the equations of motion are:
*   **Horizontal**: $a_x = \\frac{dv_x}{dt} = -\\frac{k}{m} v v_x$
*   **Vertical**: $a_y = \\frac{dv_y}{dt} = -g - \\frac{k}{m} v v_y$

Where $k = \\frac{1}{2} C_d \\rho A$ is the drag coefficient, and $v = \\sqrt{v_x^2 + v_y^2}$ is the instantaneous speed.

#### Simulation Active:
Adjust the launch velocity ($v_0$), angle ($\\theta$), gravity ($g$), and drag coefficient ($k$) in the sidebar. Click **Launch** to see the trajectory, peak height ($H$), and range ($R$). Notice how air drag makes the trajectory asymmetrical compared to the parabolic path in a vacuum!`,
      equations: ['F_g = m · g', 'F_d = -k · v²', 'R = v_0^2 \\sin(2\\theta) / g \\text{ (No Drag)}']
    },
    {
      title: '⚡ Electrostatic Fields',
      prompt: 'Visualize electric field lines for positive and negative point charges.',
      sim: 'electrostatic' as const,
      response: `### Electrostatic Fields & Coulomb's Law

An electric charge alters the space around it, creating an electric field. The electric field vector $\\mathbf{E}$ at any point in space represents the force that a unit positive test charge would experience.

#### Coulomb's Law:
The electric field of a point charge is given by:
$$\\mathbf{E} = k_e \\frac{q}{r^2} \\hat{\\mathbf{r}}$$

Where:
*   $k_e = \\frac{1}{4\\pi \\varepsilon_0} \\approx 8.99 \\times 10^9 \\text{ N m}^2/\\text{C}^2$ (Coulomb's constant)
*   $q$ is the magnitude of the charge
*   $r$ is the distance from the charge to the point
*   $\\hat{\mathbf{r}}$ is the unit radial vector pointing away from the charge

#### Field Superposition:
For multiple charges, the net electric field is the vector sum of individual fields:
$$\\mathbf{E}_{net} = \\sum \\mathbf{E}_i$$

#### Simulation Active:
The visualizer shows field lines (arrows indicating direction) and equipotential glow. 
*   **Drag** charges around the grid to watch the field lines recalculate.
*   **Click** on a charge to change its magnitude or sign.
*   **Double-click** the grid to add a new charge!`,
      equations: ['E = k_e · q / r²', 'E_{net} = \\sum E_i', 'V = k_e · q / r']
    },
    {
      title: '⏱️ Harmonic Pendulum',
      prompt: 'Simulate a simple pendulum with damping.',
      sim: 'pendulum' as const,
      response: `### Simple Pendulum with Damping

A simple pendulum consists of a mass $m$ suspended from a pivot by a light string of length $L$. When displaced from equilibrium, gravity exerts a restoring torque.

#### Equation of Motion:
Applying Newton's Second Law for rotation, including a damping torque proportional to angular velocity ($\\theta'$):
$$I \\alpha = \\tau_{net} \\implies m L^2 \\frac{d^2\\theta}{dt^2} = -m g L \\sin\\theta - b L^2 \\frac{d\\theta}{dt}$$

Dividing by $m L^2$:
$$\\frac{d^2\\theta}{dt^2} + \\gamma \\frac{d\\theta}{dt} + \\frac{g}{L} \\sin\\theta = 0$$

Where $\\gamma = \\frac{b}{m}$ is the damping coefficient.

#### Energy Conservation:
*   **Kinetic Energy**: $K = \\frac{1}{2} m v^2 = \\frac{1}{2} m (L \\theta')^2$
*   **Potential Energy**: $U = m g L (1 - \\cos\\theta)$
*   **Total Energy**: $E = K + U$ (decays exponentially over time due to damping)

#### Simulation Active:
Watch the pendulum swing and observe the live energy bar chart on the right showing the transfer between kinetic and potential energy, and its dissipation over time.`,
      equations: ['θ\'\' + γθ\' + (g/L)\\sinθ = 0', 'K = \\frac{1}{2} m L^2 \\dot{\\theta}^2', 'U = m g L (1 - \\cos\\theta)']
    },
    {
      title: '🌊 Wave Interference',
      prompt: 'Simulate wave interference from a double-slit experiment.',
      sim: 'waves' as const,
      response: `### Wave Interference & Young's Double-Slit

When coherent light waves pass through two closely spaced slits, they emerge as spherical waves. As they propagate, they overlap and interfere, producing a pattern of bright and dark fringes on a distant screen.

#### Interference Condition:
*   **Constructive Interference (Bright Fringes)**: Path difference is an integer multiple of wavelength:
    $$d \\sin\\theta = m\\lambda, \\quad m \\in \\mathbb{Z}$$
*   **Destructive Interference (Dark Fringes)**: Path difference is a half-integer multiple:
    $$d \\sin\\theta = \\left(m + \\frac{1}{2}\\right)\\lambda, \\quad m \\in \\mathbb{Z}$$

Where $d$ is the slit spacing, $\\theta$ is the angle to the screen, and $\\lambda$ is the wavelength.

#### Intensity Profile:
The intensity $I$ on the screen at angle $\\theta$ is proportional to:
$$I(\\theta) \\propto \\cos^2\\left(\\frac{\\pi d \\sin\\theta}{\\lambda}\\right)$$

#### Simulation Active:
Observe the wave crests (cyan) and troughs (dark blue) propagating from the double slits. The rightmost column displays the final intensity distribution on the screen. Adjust wavelength (color), slit spacing, and distance to observe how the spacing of the fringes changes!`,
      equations: ['d \\sin\\theta = m\\lambda', 'y_m \\approx m L \\lambda / d', 'I \\propto \\cos^2(\\pi d y / \\lambda L)']
    }
  ];

  const simNames: Record<'projectile' | 'electrostatic' | 'pendulum' | 'waves', string> = {
    projectile: 'Projectile Trajectory Lab',
    electrostatic: 'Electrostatic Field Lines',
    pendulum: 'Simple Harmonic Pendulum',
    waves: 'Double Slit Wave Interference',
  };

  const renderQuestionCategory = (title: string, items: Array<{ question: string; answer?: string; options?: string[] }>) => {
    if (!items.length) return null;

    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-300">{title}</div>
        <div className="mt-2 space-y-2">
          {items.slice(0, 2).map((item, idx) => (
            <div key={`${title}-${idx}`} className="text-xs text-slate-300">
              <p className="font-medium text-slate-200">{item.question}</p>
              {item.options && item.options.length > 0 ? (
                <p className="mt-1 text-[11px] text-slate-400">{item.options.join(' • ')}</p>
              ) : item.answer ? (
                <p className="mt-1 text-[11px] text-cyan-400">Answer: {item.answer}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleGenerateChapterQuestions = async (showIntroMessage: boolean) => {
    if (!selectedChapter) return;

    const request: GeminiQuestionRequest = {
      className: selectedChapter.grade,
      chapter: selectedChapter.title,
      difficulty: 'Intermediate',
      numberOfQuestions: 5,
    };

    console.log('[AiAssistant] handleGenerateChapterQuestions start', { request, showIntroMessage });
    setIsGeneratingQuestions(true);
    try {
      const result = await generateQuestions(request);
      console.log('[AiAssistant] generateQuestions returned', result);
      setGeneratedQuestions(result);
      if (showIntroMessage) {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: `Here are some ${selectedChapter.title} practice questions for Class ${selectedChapter.grade}.`, equations: [] },
        ]);
      }
    } catch (error) {
      console.error('[AiAssistant] generateQuestions failed', error);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'I could not fetch chapter questions right now, but I can still help explain concepts.', equations: [] },
      ]);
    } finally {
      setIsTyping(false);
      setIsGeneratingQuestions(false);
    }
  };

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    const userMsg = inputMessage;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInputMessage('');
    setIsTyping(true);

    const shouldGenerateChapterQuestions = selectedChapter && /question|practice|generate|mcq|viva|numerical/i.test(userMsg);
    if (shouldGenerateChapterQuestions) {
      void handleGenerateChapterQuestions(true);
      return;
    }

    // AI response logic based on keywords
    setTimeout(() => {
      let text = '';
      let sim: typeof activeSim = 'projectile';
      let eq: string[] = [];

      const lower = userMsg.toLowerCase();
      if (lower.includes('charge') || lower.includes('electric') || lower.includes('coulomb') || lower.includes('field')) {
        sim = 'electrostatic';
        text = `### Electric Fields & Coulomb Force Analysis

Based on your query, I have loaded the **Electrostatic Field Visualizer**.

Electric fields describe the force per unit charge in space. For a positive point charge, field lines point outward radially. For a negative point charge, they point inward.

#### Key Concept:
The electric potential $V$ at distance $r$ is:
$$V = k_e \\frac{q}{r}$$

The electric field vector is the negative gradient of the potential:
$$\\mathbf{E} = -\\nabla V$$

#### Interactive Simulation:
You can now manipulate charges on the canvas to the right. Drag them around to see the electric field vectors update. Add new charges by double-clicking!`;
        eq = ['E = -\\nabla V', 'F = qE', 'V = k_e q / r'];
      } else if (lower.includes('pendulum') || lower.includes('harmonic') || lower.includes('damping') || lower.includes('oscillation')) {
        sim = 'pendulum';
        text = `### Damped Harmonic Motion Analysis

I have loaded the **Simple Pendulum Lab** to visualize your query.

Harmonic motion occurs when the restoring force is proportional to the displacement. In a real pendulum, damping (air drag and friction) forces energy to dissipate.

#### Angular Frequency:
For small angles, the undamped natural frequency is:
$$\\omega_0 = \\sqrt{\\frac{g}{L}}$$

With damping, the frequency decreases slightly:
$$\\omega_d = \\sqrt{\\omega_0^2 - \\beta^2}$$

Where $\\beta = \\frac{b}{2m}$ is the damping factor.

#### Interactive Simulation:
Adjust the sliders to change length ($L$), gravity ($g$), mass ($m$), and damping ($b$). Watch the energy shift from potential (purple) to kinetic (cyan) on the bar graphs!`;
        eq = ['\\omega_0 = \\sqrt{g/L}', 'E(t) = E_0 e^{-2\\beta t}', 'T = 2\\pi / \\omega_d'];
      } else if (lower.includes('wave') || lower.includes('slit') || lower.includes('interference') || lower.includes('diffraction') || lower.includes('young')) {
        sim = 'waves';
        text = `### Wave Interference & Double-Slit Diffraction

I have opened the **Double Slit Wave Simulator** to visualize wave interference.

When waves pass through two apertures, they act as coherent sources of secondary waves. These waves overlap, creating constructive interference (bright bands) where crests meet crests, and destructive interference (dark bands) where crests meet troughs.

#### Formula:
The path difference $\\Delta x$ between waves from the two slits to a point on the screen is:
$$\\Delta x = d \\sin\\theta$$

For small angles, the distance from the central maximum to the $m$-th bright fringe on a screen at distance $L$ is:
$$y_m = \\frac{m \\lambda L}{d}$$

#### Interactive Simulation:
Adjust the wavelength (color), slit distance, and spacing using the sliders to see how the interference bands compress or expand!`;
        eq = ['d \\sin\\theta = m\\lambda', 'y_m \\approx \\frac{m \\lambda L}{d}', 'I = I_0 \\cos^2(\\phi/2)'];
      } else {
        sim = 'projectile';
        text = `### Projectile Kinematics & Mechanics

I have loaded the **Projectile Trajectory Lab** to help you visualize motion.

In classical mechanics, a projectile's motion is split into independent horizontal and vertical components.

#### Vacuum Equations:
*   Horizontal position: $x(t) = v_0 \\cos(\\theta) t$
*   Vertical position: $y(t) = v_0 \\sin(\\theta) t - \\frac{1}{2} g t^2$

#### Air Resistance:
When drag is added, the terminal velocity $v_t$ is reached when the gravitational force equals the drag force:
$$v_t = \\sqrt{\\frac{2mg}{C_d \\rho A}}$$

#### Interactive Simulation:
Use the sliders on the right to set the launch parameters and click **Launch**!`;
        eq = ['x(t) = v_x t', 'y(t) = v_{0y}t - \\frac{1}{2}gt²', 'F_{drag} = \\frac{1}{2}C_d\\rho A v²'];
      }

      setActiveSim(sim);
      onSimExplored(simNames[sim]);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text, simType: sim, equations: eq },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  useEffect(() => {
    if (!selectedChapter) return;

    const request: GeminiQuestionRequest = {
      className: selectedChapter.grade,
      chapter: selectedChapter.title,
      difficulty: 'Intermediate',
      numberOfQuestions: 5,
    };

    let cancelled = false;
    setIsGeneratingQuestions(true);
    generateQuestions(request)
      .then((result) => {
        if (cancelled) return;
        setGeneratedQuestions(result);
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: `I have generated practice questions for ${selectedChapter.title} (Class ${selectedChapter.grade}). You can ask me for more chapter-specific explanation or use the existing simulations for visualization.`,
          },
        ]);
      })
      .catch(() => {
        if (cancelled) return;
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: 'I could not generate chapter questions at this time. Please check your Gemini API settings or try again later.',
          },
        ]);
      })
      .finally(() => {
        if (!cancelled) {
          setIsGeneratingQuestions(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedChapter]);

  useEffect(() => {
    console.log('[AiAssistant] render generatedQuestions', generatedQuestions);
  }, [generatedQuestions]);

  // -----------------------------------------------------------
  // ANIMATION LOOPS FOR EACH SIMULATION CANVAS
  // -----------------------------------------------------------

  // 1. Projectile Motion Loop
  useEffect(() => {
    if (activeSim !== 'projectile') return;
    const canvas = projCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    const height = (canvas.height = 360);

    const scale = 6; // pixels per meter
    const startX = 40;
    const startY = height - 40;

    // Reset projectile position if not running
    if (!projIsRunning && projPath.current.length === 0) {
      projPos.current = { x: startX, y: startY };
      const rad = (projAngle * Math.PI) / 180;
      projVel.current = {
        x: projVelocity * Math.cos(rad) * scale,
        y: -projVelocity * Math.sin(rad) * scale,
      };
    }

    const drawProjectile = () => {
      // Clear Canvas
      ctx.fillStyle = '#020617'; // slate-950
      ctx.fillRect(0, 0, width, height);

      // Draw Grid
      ctx.strokeStyle = '#1e293b'; // slate-800
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Ground
      ctx.strokeStyle = '#334155'; // slate-700
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, startY);
      ctx.lineTo(width, startY);
      ctx.stroke();

      // Launch Platform
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(startX, startY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw Trajectory Path
      if (projPath.current.length > 1) {
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.8)'; // cyan-400
        ctx.lineWidth = 2.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(projPath.current[0].x, projPath.current[0].y);
        for (let i = 1; i < projPath.current.length; i++) {
          ctx.lineTo(projPath.current[i].x, projPath.current[i].y);
        }
        ctx.stroke();
      }

      // Physics Update
      if (projIsRunning) {
        const dt = 0.016 * 1.5; // speed factor

        // Drag forces: Fd = -k * v * v_vec
        const vxMeters = projVel.current.x / scale;
        const vyMeters = projVel.current.y / scale;
        const speed = Math.sqrt(vxMeters * vxMeters + vyMeters * vyMeters);

        const dragForceX = -projDrag * speed * vxMeters;
        const dragForceY = -projDrag * speed * vyMeters;

        // Accelerations
        const ax = dragForceX;
        const ay = projGravity + dragForceY; // gravity is downwards (+) in canvas coords but we handle signs carefully

        // Update velocity (meters/sec)
        const newVxMeters = vxMeters + ax * dt;
        const newVyMeters = vyMeters + ay * dt;

        projVel.current.x = newVxMeters * scale;
        projVel.current.y = newVyMeters * scale;

        // Update positions
        projPos.current.x += projVel.current.x * dt;
        projPos.current.y += projVel.current.y * dt;

        // Append path
        projPath.current.push({ x: projPos.current.x, y: projPos.current.y });

        // Check ground impact
        if (projPos.current.y >= startY) {
          projPos.current.y = startY;
          setProjIsRunning(false);
        }
        // Check boundary
        if (projPos.current.x > width || projPos.current.x < 0) {
          setProjIsRunning(false);
        }
      }

      // Draw Projectile Ball
      ctx.fillStyle = '#a855f7'; // purple-500
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(projPos.current.x, projPos.current.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Draw Launch Angle Vector (if not running)
      if (!projIsRunning && projPath.current.length === 0) {
        const rad = (projAngle * Math.PI) / 180;
        const vecLen = 45;
        const vecX = startX + vecLen * Math.cos(rad);
        const vecY = startY - vecLen * Math.sin(rad);

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(vecX, vecY);
        ctx.stroke();

        // Arrow head
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(vecX, vecY, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw real-time statistics overlay
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(10, 10, 180, 85, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8'; // slate-400
      ctx.font = '10px monospace';
      const curX = ((projPos.current.x - startX) / scale).toFixed(1);
      const curY = ((startY - projPos.current.y) / scale).toFixed(1);
      const curV = (Math.sqrt(Math.pow(projVel.current.x, 2) + Math.pow(projVel.current.y, 2)) / scale).toFixed(1);

      ctx.fillText(`X (Range): ${curX} m`, 20, 28);
      ctx.fillText(`Y (Height): ${curY} m`, 20, 48);
      ctx.fillText(`Velocity: ${curV} m/s`, 20, 68);
      ctx.fillText(`Drag (k): ${projDrag.toFixed(2)}`, 20, 80);

      animationId = requestAnimationFrame(drawProjectile);
    };

    drawProjectile();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [activeSim, projAngle, projVelocity, projGravity, projDrag, projIsRunning]);

  // 2. Electrostatic Field Lines Loop
  useEffect(() => {
    if (activeSim !== 'electrostatic') return;
    const canvas = electrostaticCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    const height = (canvas.height = 360);

    const k_e = 1000; // Scaled Coulomb constant for visualization

    const drawElectrostatics = () => {
      ctx.fillStyle = '#020617'; // slate-950
      ctx.fillRect(0, 0, width, height);

      // Draw Equipotential Glow Background
      const pixelStep = 8;
      for (let x = 0; x < width; x += pixelStep) {
        for (let y = 0; y < height; y += pixelStep) {
          let potential = 0;
          charges.forEach((c) => {
            const dx = x - c.x;
            const dy = y - c.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 15) {
              potential += c.q / dist;
            }
          });

          // Map potential to color
          if (Math.abs(potential) > 0.02) {
            const opacity = Math.min(0.2, Math.abs(potential) * 2.5);
            ctx.fillStyle = potential > 0 
              ? `rgba(168, 85, 247, ${opacity})` // Positive: Purple
              : `rgba(34, 211, 238, ${opacity})`; // Negative: Cyan
            ctx.fillRect(x, y, pixelStep, pixelStep);
          }
        }
      }

      // Draw Grid Lines (faint)
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.2)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Field Lines
      // We trace lines starting from positive charges and ending at boundaries or negative charges
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;

      charges.forEach((charge) => {
        if (charge.q <= 0) return; // trace field lines outward from positive charges

        const numLines = Math.abs(charge.q) * 4; // lines proportional to charge strength
        for (let i = 0; i < numLines; i++) {
          const angle = (i * 2 * Math.PI) / numLines;
          let px = charge.x + 12 * Math.cos(angle);
          let py = charge.y + 12 * Math.sin(angle);

          ctx.beginPath();
          ctx.moveTo(px, py);

          let stepCount = 0;
          let reachedNegative = false;

          while (stepCount < 150 && px > 0 && px < width && py > 0 && py < height && !reachedNegative) {
            // Calculate Net E-Field Vector at (px, py)
            let Ex = 0;
            let Ey = 0;

            charges.forEach((c) => {
              const dx = px - c.x;
              const dy = py - c.y;
              const r2 = dx * dx + dy * dy;
              const r = Math.sqrt(r2);
              if (r < 10) {
                if (c.q < 0) reachedNegative = true;
                return;
              }
              const Emag = (k_e * c.q) / (r2 * r); // q / r^2 in vector form
              Ex += Emag * dx;
              Ey += Emag * dy;
            });

            const E = Math.sqrt(Ex * Ex + Ey * Ey);
            if (E < 0.001) break;

            // Step along field line (normalized field vector)
            const stepSize = 4;
            px += (Ex / E) * stepSize;
            py += (Ey / E) * stepSize;

            ctx.lineTo(px, py);

            // Draw a small directional arrow halfway
            if (stepCount === 20 || stepCount === 50 || stepCount === 90) {
              const arrowAngle = Math.atan2(Ey, Ex);
              ctx.stroke(); // commit current stroke
              
              ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
              ctx.beginPath();
              ctx.arc(px, py, 2.5, 0, Math.PI * 2);
              ctx.fill();

              ctx.beginPath();
              ctx.moveTo(px, py); // resume
            }

            stepCount++;
          }
          ctx.stroke();
        }
      });

      // Draw Charges
      charges.forEach((c) => {
        const isSelected = selectedChargeId === c.id;
        
        // Glow ring
        ctx.shadowColor = c.q > 0 ? '#a855f7' : '#22d3ee';
        ctx.shadowBlur = isSelected ? 18 : 8;

        ctx.fillStyle = c.q > 0 ? '#a855f7' : '#22d3ee';
        ctx.beginPath();
        ctx.arc(c.x, c.y, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0; // reset

        // Selection border
        if (isSelected) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(c.x, c.y, 18, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Label (+ or -)
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(c.q > 0 ? `+${c.q}` : `${c.q}`, c.x, c.y);
      });

      // Overlay Instructions
      ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.beginPath();
      ctx.roundRect(10, height - 35, width - 20, 25, 4);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Drag charges to move. Click to select/edit. Double-click grid to add a new charge.', width / 2, height - 22);

      animationId = requestAnimationFrame(drawElectrostatics);
    };

    drawElectrostatics();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [activeSim, charges, selectedChargeId]);

  // Mouse drag handler for electrostatic simulation
  const handleElectrostaticMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeSim !== 'electrostatic') return;
    const canvas = electrostaticCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked a charge
    const clickedCharge = charges.find((c) => {
      const dist = Math.sqrt((c.x - x) ** 2 + (c.y - y) ** 2);
      return dist < 18;
    });

    if (clickedCharge) {
      setSelectedChargeId(clickedCharge.id);
    } else {
      setSelectedChargeId(null);
    }
  };

  const handleElectrostaticMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeSim !== 'electrostatic' || selectedChargeId === null) return;
    const canvas = electrostaticCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(15, Math.min(canvas.width - 15, e.clientX - rect.left));
    const y = Math.max(15, Math.min(canvas.height - 15, e.clientY - rect.top));

    setCharges((prev) =>
      prev.map((c) => (c.id === selectedChargeId ? { ...c, x, y } : c))
    );
  };

  const handleElectrostaticDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeSim !== 'electrostatic') return;
    const canvas = electrostaticCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Add a new random charge
    const newCharge: Charge = {
      id: Date.now(),
      x,
      y,
      q: Math.random() > 0.5 ? 4 : -4,
    };
    setCharges((prev) => [...prev, newCharge]);
    setSelectedChargeId(newCharge.id);
  };

  const changeSelectedChargeValue = (amount: number) => {
    if (selectedChargeId === null) return;
    setCharges((prev) =>
      prev.map((c) => {
        if (c.id === selectedChargeId) {
          const newVal = c.q + amount;
          return { ...c, q: newVal === 0 ? (amount > 0 ? 1 : -1) : newVal };
        }
        return c;
      })
    );
  };

  const deleteSelectedCharge = () => {
    if (selectedChargeId === null || charges.length <= 1) return;
    setCharges((prev) => prev.filter((c) => c.id !== selectedChargeId));
    setSelectedChargeId(null);
  };

  // 3. Simple Damped Pendulum Loop
  useEffect(() => {
    if (activeSim !== 'pendulum') return;
    const canvas = pendulumCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    const height = (canvas.height = 360);

    const pivotX = width / 2;
    const pivotY = 50;

    const drawPendulum = () => {
      ctx.fillStyle = '#020617'; // slate-950
      ctx.fillRect(0, 0, width, height);

      // Draw faint grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Physics update
      if (pendIsRunning) {
        const dt = 0.016 * 2.0; // speed factor
        // Angular acceleration: alpha = -(g/L)*sin(theta) - (damping/m)*theta_dot
        const alpha = -(pendGravity / (pendLength / 10)) * Math.sin(pendAngle) - (pendDamping / (pendMass / 10)) * pendAngularVel;
        const newAngularVel = pendAngularVel + alpha * dt;
        const newAngle = pendAngle + newAngularVel * dt;

        setPendAngularVel(newAngularVel);
        setPendAngle(newAngle);
      }

      // Calculate bob position
      const bobX = pivotX + pendLength * Math.sin(pendAngle);
      const bobY = pivotY + pendLength * Math.cos(pendAngle);

      // Draw Pivot
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pivotX - 20, pivotY);
      ctx.lineTo(pivotX + 20, pivotY);
      ctx.stroke();

      // Draw String
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Draw Bob (Mass)
      // Radius proportional to mass cube root
      const radius = Math.max(8, Math.min(25, 4 * Math.pow(pendMass, 1/3)));
      ctx.fillStyle = '#a855f7'; // Purple
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(bobX, bobY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Velocity and Force Vectors (faint arrows)
      if (pendIsRunning) {
        // Velocity vector (perpendicular to string)
        const vMag = pendAngularVel * (pendLength / 10) * 4;
        const vx = vMag * Math.cos(pendAngle);
        const vy = -vMag * Math.sin(pendAngle);

        ctx.strokeStyle = '#22d3ee'; // cyan for velocity
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bobX, bobY);
        ctx.lineTo(bobX + vx, bobY + vy);
        ctx.stroke();
      }

      // Calculate Energies
      const g_scaled = pendGravity;
      const L_scaled = pendLength / 10;
      const h = L_scaled * (1 - Math.cos(pendAngle)); // height relative to lowest point
      const PE = (pendMass / 10) * g_scaled * h;
      const v = pendAngularVel * L_scaled;
      const KE = 0.5 * (pendMass / 10) * v * v;
      const totalE = KE + PE;

      // Draw Energy Bar Chart on the side
      const chartX = width - 110;
      const chartY = 30;
      const chartH = 140;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(chartX - 10, chartY - 10, 110, chartH + 30, 8);
      ctx.fill();
      ctx.stroke();

      // Max scale for energy
      const maxEnergy = 35; // arbitrary scale limit
      const peBarH = Math.min(chartH, (PE / maxEnergy) * chartH);
      const keBarH = Math.min(chartH, (KE / maxEnergy) * chartH);

      // Draw PE Bar (Purple)
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(chartX + 15, chartY + (chartH - peBarH), 20, peBarH);

      // Draw KE Bar (Cyan)
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(chartX + 55, chartY + (chartH - keBarH), 20, keBarH);

      // Labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PE', chartX + 25, chartY + chartH + 12);
      ctx.fillText('KE', chartX + 65, chartY + chartH + 12);

      // Numerical values
      ctx.textAlign = 'left';
      ctx.fillText(`Angle: ${(pendAngle * 180 / Math.PI).toFixed(0)}°`, 20, 28);
      ctx.fillText(`PE: ${PE.toFixed(1)} J`, 20, 43);
      ctx.fillText(`KE: ${KE.toFixed(1)} J`, 20, 58);
      ctx.fillText(`Total: ${totalE.toFixed(1)} J`, 20, 73);

      animationId = requestAnimationFrame(drawPendulum);
    };

    drawPendulum();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [activeSim, pendLength, pendGravity, pendDamping, pendMass, pendAngle, pendAngularVel, pendIsRunning]);

  // 4. Wave Interference Loop
  useEffect(() => {
    if (activeSim !== 'waves') return;
    const canvas = waveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    const height = (canvas.height = 360);

    const slitX = 60;
    const doubleSlitSpacing = waveSlitSpacing;
    const slitY1 = height / 2 - doubleSlitSpacing / 2;
    const slitY2 = height / 2 + doubleSlitSpacing / 2;

    const drawWaves = () => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Screen Position
      const screenX = width - 80;

      // Draw waves propagating in space
      const pixelStep = 5;
      for (let x = slitX; x < screenX; x += pixelStep) {
        for (let y = 0; y < height; y += pixelStep) {
          // Distance from slit 1 and slit 2
          const d1 = Math.sqrt((x - slitX) ** 2 + (y - slitY1) ** 2);
          const d2 = Math.sqrt((x - slitX) ** 2 + (y - slitY2) ** 2);

          // Wave equation: amplitude = cos(k*r - omega*t)
          const k = 2 * Math.PI / waveWavelength;
          const amp1 = Math.sin(k * d1 - wavePhase);
          const amp2 = Math.sin(k * d2 - wavePhase);

          // Total amplitude (superposition)
          const totalAmp = (amp1 + amp2) / 2;

          // Map amplitude to cyan/blue colors
          // amp ranges from -1 to 1.
          const intensity = (totalAmp + 1) / 2; // scale to 0-1
          const r = Math.floor(15 + intensity * 15);
          const g = Math.floor(23 + intensity * 120);
          const b = Math.floor(42 + intensity * 200);

          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(x, y, pixelStep, pixelStep);
        }
      }

      // Draw Slit Barrier
      ctx.fillStyle = '#1e293b'; // slate-800
      ctx.fillRect(slitX - 5, 0, 10, height);

      // Carve out the slits (draw background color over the barrier)
      ctx.fillStyle = '#020617';
      ctx.fillRect(slitX - 6, slitY1 - 4, 12, 8);
      ctx.fillRect(slitX - 6, slitY2 - 4, 12, 8);

      // Draw Screen Boundary
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(screenX, 0, width - screenX, height);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, height);
      ctx.stroke();

      // Draw Intensity Graph on Screen (right side)
      ctx.strokeStyle = '#22d3ee'; // cyan
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      for (let y = 0; y < height; y++) {
        // Calculate path difference at screen coordinate (screenX, y)
        const d1 = Math.sqrt((screenX - slitX) ** 2 + (y - slitY1) ** 2);
        const d2 = Math.sqrt((screenX - slitX) ** 2 + (y - slitY2) ** 2);
        const pathDiff = Math.abs(d1 - d2);

        // Intensity formula: I = I0 * cos^2(pi * pathDiff / lambda)
        const lambda = waveWavelength;
        const intensityVal = Math.pow(Math.cos(Math.PI * pathDiff / lambda), 2);

        // Plot intensity line
        const plotX = screenX + 5 + intensityVal * (width - screenX - 15);
        if (y === 0) {
          ctx.moveTo(plotX, y);
        } else {
          ctx.lineTo(plotX, y);
        }
      }
      ctx.stroke();

      // Wave source (behind barrier)
      ctx.fillStyle = 'rgba(34, 211, 238, 0.15)';
      ctx.fillRect(0, 0, slitX - 5, height);
      // Plane waves coming in
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
      ctx.lineWidth = 2;
      const k = 2 * Math.PI / waveWavelength;
      for (let x = 10; x < slitX - 5; x += waveWavelength) {
        const offset = (wavePhase * waveWavelength) / (2 * Math.PI);
        const waveX = x + (offset % waveWavelength);
        if (waveX < slitX - 5) {
          ctx.beginPath();
          ctx.moveTo(waveX, 0);
          ctx.lineTo(waveX, height);
          ctx.stroke();
        }
      }

      // Update wave phase (animation speed)
      setWavePhase((prev) => prev + 0.15);

      // Labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Slits', slitX - 25, 20);
      ctx.fillText('Screen', screenX - 50, 20);
      ctx.fillText('Intensity Graph', screenX + 5, 20);

      animationId = requestAnimationFrame(drawWaves);
    };

    drawWaves();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [activeSim, waveWavelength, waveSlitSpacing, waveDistance, wavePhase]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 items-stretch h-[calc(100vh-10rem)] min-h-[580px]">
      {/* Left Column: Chat Interface (lg:col-span-5) */}
      <div className="lg:col-span-5 flex flex-col rounded-2xl border border-slate-800 bg-slate-900/20 backdrop-blur-md overflow-hidden h-full">
        {/* Chat Header */}
        <div className="bg-slate-950/60 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950/50 border border-cyan-800/40">
              <Sparkles className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Physics AI Assistant</h3>
              <p className="text-[10px] text-slate-400 font-mono">v1.0 • Connected to Quantum Core</p>
            </div>
          </div>
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50"></span>
        </div>

        {/* Chat Bubbles Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm scrollbar-thin">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-4 leading-relaxed whitespace-pre-line border shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-500/30 rounded-tr-none'
                    : 'bg-slate-950/80 text-slate-200 border-slate-800 rounded-tl-none'
                }`}
              >
                {/* Format markdown titles nicely */}
                {msg.text.split('\n').map((line, lIdx) => {
                  if (line.startsWith('### ')) {
                    return <h4 key={lIdx} className="text-base font-bold text-cyan-400 mt-3 mb-1.5">{line.replace('### ', '')}</h4>;
                  }
                  if (line.startsWith('#### ')) {
                    return <h5 key={lIdx} className="text-sm font-bold text-purple-400 mt-2 mb-1">{line.replace('#### ', '')}</h5>;
                  }
                  if (line.startsWith('* ')) {
                    return <li key={lIdx} className="ml-4 list-disc text-slate-300">{line.replace('* ', '')}</li>;
                  }
                  return <p key={lIdx} className="mb-1 text-slate-300 text-xs leading-relaxed">{line}</p>;
                })}

                {/* Render formulas if present */}
                {msg.equations && msg.equations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Governing Formulas:</span>
                    <div className="flex flex-wrap gap-2">
                      {msg.equations.map((eqStr, eqIdx) => (
                        <div key={eqIdx} className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-400">
                          {eqStr}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">
                {msg.sender === 'user' ? 'You' : 'AI Assistant'}
              </span>
            </div>
          ))}

          {generatedQuestions && (
            <div className="flex flex-col items-start">
              <div className="max-w-[90%] rounded-2xl rounded-tl-none border border-slate-800 bg-slate-950/80 p-4 text-slate-200 shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-cyan-400">Practice Questions</h4>
                    <p className="text-[11px] text-slate-400">Generated from the current chapter context.</p>
                  </div>
                  <button
                    onClick={() => void handleGenerateChapterQuestions(false)}
                    className="rounded-lg border border-cyan-800/40 bg-cyan-950/40 px-2.5 py-1.5 text-[11px] font-medium text-cyan-300 transition hover:bg-cyan-900/50"
                  >
                    {isGeneratingQuestions ? 'Generating…' : 'Generate New'}
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  {renderQuestionCategory('MCQs', generatedQuestions.mcqs)}
                  {renderQuestionCategory('Short Questions', generatedQuestions.shortQuestions)}
                  {renderQuestionCategory('Long Questions', generatedQuestions.longQuestions)}
                  {renderQuestionCategory('Numerical Problems', generatedQuestions.numericalProblems)}
                  {renderQuestionCategory('Viva Questions', generatedQuestions.vivaQuestions)}
                </div>
              </div>
            </div>
          )}

          {isTyping && (
            <div className="flex flex-col items-start">
              <div className="bg-slate-950/80 rounded-2xl rounded-tl-none border border-slate-800 p-4 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="px-4 py-3 bg-slate-950/40 border-t border-slate-800/50 text-[11px] text-slate-400">
          Ask the AI for chapter practice questions or conceptual help. If you want chapter-aligned questions, select a chapter in the learning sidebar first and then ask for practice or MCQs.
        </div>

        {/* Text Area Input */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 shrink-0">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a physics question (e.g., 'simulate electric forces')..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-4 pr-12 py-3.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            />
            <button
              onClick={handleSend}
              className="absolute right-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 p-2 text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Sandbox (lg:col-span-7) */}
      <div className="lg:col-span-7 flex flex-col rounded-2xl border border-slate-800 bg-slate-900/20 backdrop-blur-md overflow-hidden h-full">
        {/* Sandbox Header with switcher tabs */}
        <div className="bg-slate-950/60 p-3 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-purple-950/50 border border-purple-800/40">
              <Layers className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Interactive Sandbox</h3>
              <p className="text-[10px] text-slate-400 font-mono">Real-time HTML5 Physics Solver</p>
            </div>
          </div>

          {/* Simulation Selectors */}
          <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 w-full sm:w-auto overflow-x-auto">
            {(['projectile', 'electrostatic', 'pendulum', 'waves'] as const).map((sim) => (
              <button
                key={sim}
                onClick={() => {
                  setActiveSim(sim);
                  onSimExplored(simNames[sim]);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-bold font-mono uppercase transition-all duration-150 shrink-0 ${
                  activeSim === sim
                    ? 'bg-slate-900 text-cyan-400 border border-slate-800'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sim === 'projectile' && '🚀 Trajectory'}
                {sim === 'electrostatic' && '⚡ E-Field'}
                {sim === 'pendulum' && '⏱️ Pendulum'}
                {sim === 'waves' && '🌊 Waves'}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Display */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center min-h-[300px]">
          {activeSim === 'projectile' && (
            <canvas
              ref={projCanvasRef}
              className="w-full h-full block cursor-crosshair"
            />
          )}
          {activeSim === 'electrostatic' && (
            <canvas
              ref={electrostaticCanvasRef}
              onMouseDown={handleElectrostaticMouseDown}
              onMouseMove={handleElectrostaticMouseMove}
              onDoubleClick={handleElectrostaticDoubleClick}
              className="w-full h-full block cursor-pointer"
            />
          )}
          {activeSim === 'pendulum' && (
            <canvas
              ref={pendulumCanvasRef}
              className="w-full h-full block"
            />
          )}
          {activeSim === 'waves' && (
            <canvas
              ref={waveCanvasRef}
              className="w-full h-full block"
            />
          )}
        </div>

        {/* Sliders and Controls Drawer */}
        <div className="bg-slate-950/90 border-t border-slate-800 p-5 shrink-0">
          <div className="flex items-center space-x-2 mb-4 border-b border-slate-900 pb-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-widest">Simulation Parameters</span>
          </div>

          {/* Projectile Controls */}
          {activeSim === 'projectile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Launch Angle (θ)</span>
                    <span className="text-cyan-400 font-bold">{projAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="85"
                    value={projAngle}
                    onChange={(e) => {
                      setProjAngle(Number(e.target.value));
                      projPath.current = [];
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Initial Velocity (v₀)</span>
                    <span className="text-cyan-400 font-bold">{projVelocity} m/s</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="45"
                    value={projVelocity}
                    onChange={(e) => {
                      setProjVelocity(Number(e.target.value));
                      projPath.current = [];
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Gravity (g)</span>
                    <span className="text-cyan-400 font-bold">{projGravity} m/s²</span>
                  </div>
                  <input
                    type="range"
                    min="1.6" // Moon
                    max="24.8" // Jupiter
                    step="0.1"
                    value={projGravity}
                    onChange={(e) => {
                      setProjGravity(Number(e.target.value));
                      projPath.current = [];
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Air Drag Coeff. (k)</span>
                    <span className="text-cyan-400 font-bold">{projDrag.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.4"
                    step="0.01"
                    value={projDrag}
                    onChange={(e) => {
                      setProjDrag(Number(e.target.value));
                      projPath.current = [];
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => {
                    projPath.current = [];
                    setProjIsRunning(true);
                  }}
                  disabled={projIsRunning}
                  className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Launch</span>
                </button>
                <button
                  onClick={() => {
                    setProjIsRunning(false);
                    projPath.current = [];
                  }}
                  className="flex items-center space-x-2 px-5 py-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          )}

          {/* Electrostatic Controls */}
          {activeSim === 'electrostatic' && (
            <div className="space-y-4">
              {selectedChargeId !== null ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">Selected Charge</span>
                    <div className="text-xs text-slate-300">
                      Adjust charge magnitude or delete it from the field.
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => changeSelectedChargeValue(-1)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-white font-bold text-xs"
                    >
                      -1 q
                    </button>
                    <button
                      onClick={() => changeSelectedChargeValue(1)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-white font-bold text-xs"
                    >
                      +1 q
                    </button>
                    <div className="h-6 w-[1px] bg-slate-800"></div>
                    <button
                      onClick={deleteSelectedCharge}
                      className="px-3 py-1.5 rounded-lg bg-red-650 hover:bg-red-600 border border-red-800 text-white font-bold text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/40 text-center text-xs text-slate-400">
                  Double-click on the canvas grid to place a new charge. Click and drag existing charges to manipulate the fields!
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setCharges([
                      { id: 1, x: 150, y: 150, q: 5 },
                      { id: 2, x: 350, y: 150, q: -5 },
                    ]);
                    setSelectedChargeId(null);
                  }}
                  className="flex items-center space-x-2 px-5 py-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Field Grid</span>
                </button>
              </div>
            </div>
          )}

          {/* Pendulum Controls */}
          {activeSim === 'pendulum' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">String Length (L)</span>
                    <span className="text-purple-400 font-bold">{(pendLength / 10).toFixed(1)} m</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="220"
                    value={pendLength}
                    onChange={(e) => setPendLength(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Bob Mass (m)</span>
                    <span className="text-purple-400 font-bold">{pendMass} kg</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="50"
                    value={pendMass}
                    onChange={(e) => setPendMass(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Gravity (g)</span>
                    <span className="text-purple-400 font-bold">{pendGravity} m/s²</span>
                  </div>
                  <input
                    type="range"
                    min="1.6"
                    max="25"
                    step="0.1"
                    value={pendGravity}
                    onChange={(e) => setPendGravity(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Damping (b)</span>
                    <span className="text-purple-400 font-bold">{pendDamping.toFixed(3)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.1"
                    step="0.001"
                    value={pendDamping}
                    onChange={(e) => setPendDamping(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setPendIsRunning(!pendIsRunning)}
                  className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  {pendIsRunning ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                  <span>{pendIsRunning ? 'Pause' : 'Resume'}</span>
                </button>
                <button
                  onClick={() => {
                    setPendAngle(Math.PI / 4);
                    setPendAngularVel(0);
                  }}
                  className="flex items-center space-x-2 px-5 py-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Swing</span>
                </button>
              </div>
            </div>
          )}

          {/* Wave Controls */}
          {activeSim === 'waves' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Wavelength (λ)</span>
                    <span className="text-cyan-400 font-bold">{waveWavelength} nm</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="45"
                    value={waveWavelength}
                    onChange={(e) => setWaveWavelength(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Slit Spacing (d)</span>
                    <span className="text-cyan-400 font-bold">{waveSlitSpacing} μm</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="70"
                    value={waveSlitSpacing}
                    onChange={(e) => setWaveSlitSpacing(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Distance (L)</span>
                    <span className="text-cyan-400 font-bold">{waveDistance} cm</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="220"
                    value={waveDistance}
                    onChange={(e) => setWaveDistance(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
