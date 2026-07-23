import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Sliders, Info, Zap, Activity, ShieldAlert, Cpu } from 'lucide-react';

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

export const SimLab: React.FC<{ onSimExplored: (simName?: string) => void }> = ({ onSimExplored }) => {
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
    </div>
  );
};
