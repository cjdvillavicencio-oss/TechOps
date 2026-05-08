'use client';

import { useEffect, useRef } from 'react';

/**
 * Animated motherboard / data universe background.
 * - Pure HTML5 canvas (no images, no 3D libs)
 * - Particles, nodes, pulses, parallax layers
 * - Pauses on document.hidden via Page Visibility API
 * - Honors prefers-reduced-motion
 * - Adjusts density on small screens
 */
export default function TechBackground() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const stateRef = useRef({
    width: 0,
    height: 0,
    dpr: 1,
    nodes: [],
    particles: [],
    pulses: [],
    mouse: { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 },
    running: false,
    reduced: false,
    last: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const S = stateRef.current;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    S.reduced = reduced;

    const isMobile = () => window.innerWidth < 768;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      S.width = w;
      S.height = h;
      S.dpr = dpr;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildScene();
    };

    const rand = (a, b) => a + Math.random() * (b - a);

    const buildScene = () => {
      const small = isMobile();
      const area = S.width * S.height;
      // density tuned per area
      const nodeCount = Math.min(small ? 22 : 60, Math.floor(area / 22000));
      const partCount = Math.min(small ? 40 : 130, Math.floor(area / 9000));

      S.nodes = Array.from({ length: nodeCount }).map(() => {
        const depth = Math.random();
        return {
          x: Math.random() * S.width,
          y: Math.random() * S.height,
          vx: rand(-0.04, 0.04),
          vy: rand(-0.04, 0.04),
          r: rand(1.2, 2.4) * (0.5 + depth),
          depth, // 0 far -> 1 near
          hue: Math.random() < 0.5 ? 195 : 280, // cyan or violet
          glow: 0,
        };
      });

      S.particles = Array.from({ length: partCount }).map(() => {
        const depth = Math.random();
        return {
          x: Math.random() * S.width,
          y: Math.random() * S.height,
          vx: rand(-0.15, 0.15) * (0.4 + depth),
          vy: rand(-0.15, 0.15) * (0.4 + depth),
          size: rand(0.5, 2.2) * (0.3 + depth),
          depth,
          alpha: rand(0.25, 0.9),
          shape: Math.random() < 0.85 ? 'dot' : 'tri',
        };
      });

      S.pulses = [];
    };

    const spawnPulse = () => {
      if (S.nodes.length < 2) return;
      const a = Math.floor(Math.random() * S.nodes.length);
      let b = Math.floor(Math.random() * S.nodes.length);
      if (b === a) b = (a + 1) % S.nodes.length;
      const na = S.nodes[a];
      const nb = S.nodes[b];
      const dx = na.x - nb.x;
      const dy = na.y - nb.y;
      if (dx * dx + dy * dy > 320 * 320) return;
      S.pulses.push({ a, b, t: 0, speed: rand(0.005, 0.014), hue: Math.random() < 0.5 ? 195 : 280 });
    };

    const onMouse = (e) => {
      S.mouse.tx = e.clientX / S.width;
      S.mouse.ty = e.clientY / S.height;
    };

    const draw = (ts) => {
      if (!S.running) return;
      rafRef.current = requestAnimationFrame(draw);
      const dt = Math.min(50, ts - S.last || 16);
      S.last = ts;

      // Smooth mouse follow
      S.mouse.x += (S.mouse.tx - S.mouse.x) * 0.04;
      S.mouse.y += (S.mouse.ty - S.mouse.y) * 0.04;
      const mx = (S.mouse.x - 0.5) * 30;
      const my = (S.mouse.y - 0.5) * 30;

      // Background gradient
      const g = ctx.createRadialGradient(
        S.width * (0.3 + (S.mouse.x - 0.5) * 0.1),
        S.height * (0.4 + (S.mouse.y - 0.5) * 0.1),
        0,
        S.width / 2,
        S.height / 2,
        Math.max(S.width, S.height) * 0.8,
      );
      g.addColorStop(0, 'rgba(20, 28, 56, 0.85)');
      g.addColorStop(0.55, 'rgba(7, 10, 24, 0.95)');
      g.addColorStop(1, 'rgba(2, 4, 12, 1)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, S.width, S.height);

      // Subtle grid (motherboard traces)
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.strokeStyle = '#5ad0ff';
      ctx.lineWidth = 1;
      const gridStep = 70;
      const ox = (mx * 0.4) % gridStep;
      const oy = (my * 0.4) % gridStep;
      ctx.beginPath();
      for (let x = ox; x < S.width; x += gridStep) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, S.height);
      }
      for (let y = oy; y < S.height; y += gridStep) {
        ctx.moveTo(0, y);
        ctx.lineTo(S.width, y);
      }
      ctx.stroke();
      ctx.restore();

      // Particles (background layer)
      for (const p of S.particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = S.width + 10;
        if (p.x > S.width + 10) p.x = -10;
        if (p.y < -10) p.y = S.height + 10;
        if (p.y > S.height + 10) p.y = -10;
        const px = p.x + mx * (0.2 + p.depth * 0.8);
        const py = p.y + my * (0.2 + p.depth * 0.8);
        ctx.globalAlpha = p.alpha * (0.4 + p.depth * 0.6);
        ctx.fillStyle = p.depth > 0.6 ? '#a78bfa' : '#67e8f9';
        if (p.shape === 'tri') {
          ctx.beginPath();
          ctx.moveTo(px, py - p.size);
          ctx.lineTo(px + p.size, py + p.size);
          ctx.lineTo(px - p.size, py + p.size);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Node connections
      const maxDist = isMobile() ? 110 : 160;
      const md2 = maxDist * maxDist;
      ctx.lineWidth = 1;
      for (let i = 0; i < S.nodes.length; i++) {
        const a = S.nodes[i];
        for (let j = i + 1; j < S.nodes.length; j++) {
          const b = S.nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < md2) {
            const alpha = (1 - d2 / md2) * 0.35;
            ctx.strokeStyle = `rgba(120, 200, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x + mx * a.depth * 0.5, a.y + my * a.depth * 0.5);
            ctx.lineTo(b.x + mx * b.depth * 0.5, b.y + my * b.depth * 0.5);
            ctx.stroke();
          }
        }
      }

      // Update + draw nodes
      for (const n of S.nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > S.width) n.vx *= -1;
        if (n.y < 0 || n.y > S.height) n.vy *= -1;
        n.glow = Math.max(0, n.glow - 0.02);
        const nx = n.x + mx * n.depth * 0.5;
        const ny = n.y + my * n.depth * 0.5;
        const radius = n.r + n.glow * 4;
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, radius * 6);
        grad.addColorStop(0, `hsla(${n.hue}, 100%, 75%, ${0.9})`);
        grad.addColorStop(0.4, `hsla(${n.hue}, 100%, 60%, ${0.25 + n.glow * 0.4})`);
        grad.addColorStop(1, 'hsla(0,0%,0%,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(nx, ny, radius * 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `hsl(${n.hue}, 100%, 80%)`;
        ctx.beginPath();
        ctx.arc(nx, ny, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pulses
      if (Math.random() < 0.08) spawnPulse();
      for (let i = S.pulses.length - 1; i >= 0; i--) {
        const pu = S.pulses[i];
        pu.t += pu.speed;
        if (pu.t >= 1) {
          S.nodes[pu.b] && (S.nodes[pu.b].glow = 1);
          S.pulses.splice(i, 1);
          continue;
        }
        const a = S.nodes[pu.a];
        const b = S.nodes[pu.b];
        if (!a || !b) {
          S.pulses.splice(i, 1);
          continue;
        }
        const x = a.x + (b.x - a.x) * pu.t + mx * 0.4;
        const y = a.y + (b.y - a.y) * pu.t + my * 0.4;
        ctx.fillStyle = `hsla(${pu.hue}, 100%, 80%, 0.95)`;
        ctx.shadowColor = `hsl(${pu.hue}, 100%, 70%)`;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const start = () => {
      if (S.running) return;
      S.running = true;
      S.last = performance.now();
      rafRef.current = requestAnimationFrame(draw);
    };

    const stop = () => {
      S.running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (!reduced) start();
    };

    resize();
    if (reduced) {
      // Static frame only
      // Run one paint then stop
      S.running = true;
      requestAnimationFrame((t) => {
        draw(t);
        stop();
      });
    } else {
      start();
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouse);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 -z-10"
      style={{ pointerEvents: 'none' }}
    />
  );
}
