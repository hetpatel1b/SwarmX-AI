import { useEffect, useRef, useCallback, memo } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  hue: number;
  saturation: number;
  pulsePhase: number;
  pulseSpeed: number;
}

const PARTICLE_COUNT = 45;
const CONNECTION_DISTANCE = 130;
const MOUSE_RADIUS = 200;

export const NeuralBackground = memo(function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const isVisibleRef = useRef(true);

  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    const hues = [188, 262, 160, 38, 348];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.8 + 0.5,
        opacity: Math.random() * 0.45 + 0.08,
        hue: hues[Math.floor(Math.random() * hues.length)],
        saturation: 65 + Math.random() * 25,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.004 + Math.random() * 0.008
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;

    let dpr = Math.min(window.devicePixelRatio, 2);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particlesRef.current.length === 0) {
        particlesRef.current = initParticles(w, h);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    // Throttled mouse handler
    let mouseRaf = 0;
    const handleMouse = (e: MouseEvent) => {
      cancelAnimationFrame(mouseRaf);
      mouseRaf = requestAnimationFrame(() => {
        mouseRef.current = { x: e.clientX, y: e.clientY };
      });
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });
    const handleMouseLeave = () => { mouseRef.current = { x: -1000, y: -1000 }; };
    window.addEventListener("mouseleave", handleMouseLeave);

    // Pause when tab is hidden
    const handleVisibility = () => {
      isVisibleRef.current = !document.hidden;
      if (!document.hidden && !animationRef.current) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    if (particlesRef.current.length === 0) {
      particlesRef.current = initParticles(window.innerWidth, window.innerHeight);
    }
    const particles = particlesRef.current;

    const animate = () => {
      if (!isVisibleRef.current) {
        animationRef.current = 0;
        return;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;
      ctx.clearRect(0, 0, width, height);
      const mouse = mouseRef.current;

      for (const p of particles) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < MOUSE_RADIUS * MOUSE_RADIUS && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          const direction = dist < MOUSE_RADIUS * 0.35 ? 1 : -0.3;
          p.vx += (dx / dist) * force * 0.012 * direction;
          p.vy += (dy / dist) * force * 0.012 * direction;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.997;
        p.vy *= 0.997;

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        p.pulsePhase += p.pulseSpeed;
        const pulse = 0.6 + 0.4 * Math.sin(p.pulsePhase);
        const finalOpacity = p.opacity * pulse;

        if (p.radius > 1.5) {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 5);
          glow.addColorStop(0, `hsla(${p.hue}, ${p.saturation}%, 65%, ${finalOpacity * 0.2})`);
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.fillRect(p.x - p.radius * 5, p.y - p.radius * 5, p.radius * 10, p.radius * 10);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${p.saturation}%, 65%, ${finalOpacity})`;
        ctx.fill();
      }

      // Connections — use squared distance to avoid sqrt
      const connDistSq = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const ddx = a.x - b.x;
          const ddy = a.y - b.y;
          const dSq = ddx * ddx + ddy * ddy;
          if (dSq < connDistSq) {
            const d = Math.sqrt(dSq);
            const alpha = (1 - d / CONNECTION_DISTANCE) * 0.12;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `hsla(${(a.hue + b.hue) >> 1}, 55%, 50%, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      if (mouse.x > 0 && mouse.y > 0) {
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 240);
        gradient.addColorStop(0, "rgba(6, 182, 212, 0.06)");
        gradient.addColorStop(0.4, "rgba(139, 92, 246, 0.025)");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      cancelAnimationFrame(mouseRaf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [initParticles]);

  return (
    <>
      <div
        className="fixed inset-0 -z-20"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 18% 8%, rgba(6, 182, 212, 0.12), transparent 50%),
            radial-gradient(ellipse 60% 50% at 82% 12%, rgba(139, 92, 246, 0.1), transparent 50%),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(16, 185, 129, 0.03), transparent 50%),
            radial-gradient(ellipse 70% 40% at 50% 90%, rgba(244, 63, 94, 0.05), transparent 50%),
            linear-gradient(180deg, #030712 0%, #060d1e 40%, #0a0f1c 70%, #030712 100%)
          `
        }}
      />
      <div
        className="fixed inset-0 -z-[15] opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px"
        }}
      />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10 pointer-events-none"
        aria-hidden="true"
      />
    </>
  );
});
