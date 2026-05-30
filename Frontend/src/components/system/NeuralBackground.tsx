import { useEffect, useRef, useCallback } from "react";

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

const PARTICLE_COUNT = 80;
const CONNECTION_DISTANCE = 150;
const MOUSE_RADIUS = 220;

export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    const hues = [188, 262, 160, 38, 348]; // cyan, violet, emerald, amber, rose
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const hueIndex = Math.floor(Math.random() * hues.length);
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.08,
        hue: hues[hueIndex],
        saturation: 65 + Math.random() * 25,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.005 + Math.random() * 0.01
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let dpr = Math.min(window.devicePixelRatio, 2);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      // Reset transform before applying new scale to avoid accumulation
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particlesRef.current.length === 0) {
        particlesRef.current = initParticles(w, h);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouse);

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    window.addEventListener("mouseleave", handleMouseLeave);

    if (particlesRef.current.length === 0) {
      particlesRef.current = initParticles(window.innerWidth, window.innerHeight);
    }
    const particles = particlesRef.current;

    const animate = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      timeRef.current += 1;
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      // Update & draw particles
      for (const p of particles) {
        // Mouse attraction (gentle pull) instead of pure repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          // Closer particles repel, farther ones attract (creates a ring)
          const direction = dist < MOUSE_RADIUS * 0.35 ? 1 : -0.3;
          p.vx += (dx / dist) * force * 0.015 * direction;
          p.vy += (dy / dist) * force * 0.015 * direction;
        }

        p.x += p.vx;
        p.y += p.vy;

        p.vx *= 0.997;
        p.vy *= 0.997;

        // Wrap
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Pulsing opacity
        p.pulsePhase += p.pulseSpeed;
        const pulse = 0.6 + 0.4 * Math.sin(p.pulsePhase);
        const finalOpacity = p.opacity * pulse;

        // Draw glow halo for larger particles
        if (p.radius > 1.4) {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 6);
          glow.addColorStop(0, `hsla(${p.hue}, ${p.saturation}%, 65%, ${finalOpacity * 0.25})`);
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.fillRect(p.x - p.radius * 6, p.y - p.radius * 6, p.radius * 12, p.radius * 12);
        }

        // Draw particle core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${p.saturation}%, 65%, ${finalOpacity})`;
        ctx.fill();
      }

      // Draw connections with gradient colors
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const ddx = a.x - b.x;
          const ddy = a.y - b.y;
          const d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < CONNECTION_DISTANCE) {
            const alpha = (1 - d / CONNECTION_DISTANCE) * 0.14;
            const avgHue = (a.hue + b.hue) / 2;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `hsla(${avgHue}, 60%, 55%, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Mouse glow — richer and brighter
      if (mouse.x > 0 && mouse.y > 0) {
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 260);
        gradient.addColorStop(0, "rgba(6, 182, 212, 0.07)");
        gradient.addColorStop(0.4, "rgba(139, 92, 246, 0.03)");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [initParticles]);

  return (
    <>
      {/* Layered gradient background */}
      <div
        className="fixed inset-0 -z-20"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 18% 8%, rgba(6, 182, 212, 0.14), transparent 50%),
            radial-gradient(ellipse 60% 50% at 82% 12%, rgba(139, 92, 246, 0.12), transparent 50%),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(16, 185, 129, 0.04), transparent 50%),
            radial-gradient(ellipse 70% 40% at 50% 90%, rgba(244, 63, 94, 0.07), transparent 50%),
            linear-gradient(180deg, #030712 0%, #060d1e 40%, #0a0f1c 70%, #030712 100%)
          `
        }}
      />
      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 -z-[15] opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px"
        }}
      />
      {/* Canvas particles */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10 pointer-events-none"
        aria-hidden="true"
      />
    </>
  );
}
