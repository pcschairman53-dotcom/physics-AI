import React, { useEffect, useRef } from 'react';

interface Formula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  text: string;
  opacity: number;
  size: number;
  glowColor: string;
}

const PHYSICS_FORMULAS = [
  'E = mc²',
  'F = ma',
  'iℏ∂Ψ/∂t = ĤΨ',
  '∇ · E = ρ/ε₀',
  '∇ × B = μ₀J + μ₀ε₀∂E/∂t',
  'PV = nRT',
  'S = k ln Ω',
  'Gμν + Λgμν = (8πG/c⁴)Tμν',
  'F = G(m₁m₂)/r²',
  'λ = h/p',
  'V = IR',
  'Δp · Δx ≥ ℏ/2',
  'T = 2π√(L/g)',
  'a_c = v²/r',
  '∫F·dx = ΔK',
  'dE = TdS - PdV',
  'L = Iω',
  'Φ_E = ∮E·dA',
  'U = -G M m / r',
  'f_obs = f_s(v ± v_obs)/(v ∓ v_s)'
];

export const FormulaBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let formulas: Formula[] = [];
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Initialize formulas
    const glowColors = [
      'rgba(34, 211, 238, ',  // Cyan
      'rgba(168, 85, 247, ',  // Purple
      'rgba(59, 130, 246, ',  // Blue
      'rgba(16, 185, 129, ',  // Emerald
    ];

    const initFormulas = () => {
      formulas = [];
      const count = Math.min(25, Math.floor((width * height) / 60000)); // density based on screen size
      for (let i = 0; i < count; i++) {
        formulas.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          text: PHYSICS_FORMULAS[Math.floor(Math.random() * PHYSICS_FORMULAS.length)],
          opacity: Math.random() * 0.15 + 0.05,
          size: Math.floor(Math.random() * 8) + 12, // 12px to 20px
          glowColor: glowColors[Math.floor(Math.random() * glowColors.length)],
        });
      }
    };

    initFormulas();

    // Star/Particle network background
    const stars: { x: number; y: number; r: number; vx: number; vy: number; alpha: number }[] = [];
    const starCount = Math.min(60, Math.floor((width * height) / 25000));
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.3 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint technical coordinate grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.3)';
      ctx.lineWidth = 1;
      const gridSize = 100;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw starry particle network
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      stars.forEach((star) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();

        // move star
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0 || star.x > width) star.vx *= -1;
        if (star.y < 0 || star.y > height) star.vy *= -1;
      });

      // Draw constellation lines for close stars
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.04)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw floating physics formulas
      formulas.forEach((f) => {
        ctx.font = `italic 600 ${f.size}px monospace`;
        ctx.fillStyle = `${f.glowColor}${f.opacity})`;
        ctx.shadowColor = `${f.glowColor}${f.opacity * 2.0})`;
        ctx.shadowBlur = 4;
        ctx.fillText(f.text, f.x, f.y);
        ctx.shadowBlur = 0; // reset shadow for next draws

        // Update positions
        f.x += f.vx;
        f.y += f.vy;

        // Wrap around screen boundaries
        if (f.x < -150) f.x = width + 50;
        if (f.x > width + 150) f.x = -100;
        if (f.y < -50) f.y = height + 50;
        if (f.y > height + 50) f.y = -30;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 bg-slate-950 pointer-events-none"
    />
  );
};
