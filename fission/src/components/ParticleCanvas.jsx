import { useRef, useEffect, useCallback } from 'react';
import { DIFFICULTY } from '../utils/constants.js';

const STAR_COUNT = 40;
const ORB_COUNT = 12;
const CONFETTI_COUNT = 60;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function createStar(w, h) {
  return {
    x: random(0, w),
    y: random(0, h),
    size: random(0.5, 2),
    speedX: random(-0.08, 0.08),
    speedY: random(-0.04, 0.04),
    opacity: random(0.3, 0.8),
    phase: random(0, Math.PI * 2),
  };
}

function createOrb(w, h, palette) {
  const colors = palette === 'coral' ? ['255,106,95', '255,82,82', '255,130,120']
    : palette === 'gold' ? ['246,201,107', '255,220,150', '255,241,211']
    : ['69,223,247', '0,229,255', '100,235,255'];
  return {
    x: random(0, w),
    y: random(h * 0.2, h * 0.9),
    size: random(8, 22),
    speedY: random(-0.15, -0.4),
    speedX: random(-0.1, 0.1),
    opacity: random(0.08, 0.2),
    color: colors[Math.floor(Math.random() * colors.length)],
    phase: random(0, Math.PI * 2),
    pulseSpeed: random(1, 3),
  };
}

function createConfetti(w, h) {
  return {
    x: random(0, w),
    y: random(-h * 0.3, 0),
    size: random(2, 5),
    speedY: random(1, 3),
    speedX: random(-1.5, 1.5),
    rot: random(0, Math.PI * 2),
    rotSpeed: random(0.02, 0.06),
    color: `hsl(${random(40, 55)}, 100%, ${random(50, 75)}%)`,
    life: 1,
    decay: random(0.002, 0.006),
  };
}

export default function ParticleCanvas({ ambiance = 'menu', victory = false, thinking = false, difficulty = DIFFICULTY.NORMAL }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const frameRef = useRef(null);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = window.innerWidth;
    const h = canvas.height = window.innerHeight;

    const isMobile = w < 720;
    const diffScale = difficulty === DIFFICULTY.HARD ? 0.25 : 1;
    const starCount = isMobile ? Math.floor(STAR_COUNT * 0.4 * diffScale) : Math.floor(STAR_COUNT * diffScale);
    const orbCount = isMobile ? Math.floor(ORB_COUNT * 0.4 * diffScale) : Math.max(1, Math.floor(ORB_COUNT * diffScale));

    stateRef.current = {
      ctx,
      w,
      h,
      stars: Array.from({ length: starCount }, () => createStar(w, h)),
      orbs: Array.from({ length: orbCount }, () => createOrb(w, h, 'cyan')),
      confetti: [],
      time: 0,
      isMobile,
    };
  }, [difficulty]);

  useEffect(() => {
    init();

    const handleResize = () => {
      init();
    };
    const handleMouse = (e) => {
      mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouse);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouse);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [init]);

  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;

    const orbPalette = ambiance === 'game' ? 'cyan'
      : ambiance === 'gameover' && victory ? 'gold'
      : 'gold';

    state.orbs.forEach((orb) => {
      const colors = orbPalette === 'coral' ? ['255,106,95', '255,82,82', '255,130,120']
        : orbPalette === 'gold' ? ['246,201,107', '255,220,150', '255,241,211']
        : ['69,223,247', '0,229,255', '100,235,255'];
      orb.color = colors[Math.floor(Math.random() * colors.length)];
    });

    if (victory && state.confetti.length === 0) {
      const confettiCount = difficulty === DIFFICULTY.HARD ? Math.floor(CONFETTI_COUNT * 0.25) : CONFETTI_COUNT;
      state.confetti = Array.from({ length: confettiCount }, () => createConfetti(state.w, state.h));
    }

    if (!victory) {
      state.confetti = [];
    }
  }, [ambiance, victory, difficulty]);

  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    state.orbs.forEach((orb) => {
      if (thinking) {
        orb.pulseSpeed = random(4, 7);
      } else {
        orb.pulseSpeed = random(1, 3);
      }
    });
  }, [thinking]);

  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    let running = true;

    function loop() {
      if (!running) return;
      const { ctx, w, h, stars, orbs, confetti } = state;
      const { x: mx, y: my } = mouseRef.current;

      ctx.clearRect(0, 0, w, h);

      const parallaxX = (mx - 0.5) * 6;
      const parallaxY = (my - 0.5) * 4;

      for (const star of stars) {
        star.x += star.speedX;
        star.y += star.speedY;
        star.opacity = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(state.time * 0.02 + star.phase));

        if (star.x < 0) star.x = w;
        if (star.x > w) star.x = 0;
        if (star.y < 0) star.y = h;
        if (star.y > h) star.y = 0;

        ctx.beginPath();
        ctx.arc(star.x + parallaxX * 0.3, star.y + parallaxY * 0.3, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${star.opacity})`;
        ctx.fill();
      }

      for (const orb of orbs) {
        orb.y += orb.speedY;
        orb.x += orb.speedX + (mx - 0.5) * 0.1;

        if (orb.y < -30) {
          orb.y = h + 30;
          orb.x = random(0, w);
        }
        if (orb.x < -30) orb.x = w + 30;
        if (orb.x > w + 30) orb.x = -30;

        const pulse = 0.6 + 0.4 * Math.sin(state.time * 0.03 * orb.pulseSpeed + orb.phase);
        const radius = orb.size * pulse;

        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, radius);
        gradient.addColorStop(0, `rgba(${orb.color},${0.3 * pulse})`);
        gradient.addColorStop(0.5, `rgba(${orb.color},${0.12 * pulse})`);
        gradient.addColorStop(1, `rgba(${orb.color},0)`);

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      if (confetti.length > 0) {
        let live = false;
        for (const c of confetti) {
          c.x += c.speedX;
          c.y += c.speedY;
          c.rot += c.rotSpeed;
          c.life -= c.decay;
          c.speedY += 0.02;

          if (c.life > 0) {
            live = true;
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.rot);
            ctx.globalAlpha = Math.max(0, c.life);
            ctx.fillStyle = c.color;
            ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
            ctx.restore();
          }
        }
        if (!live) {
          state.confetti = [];
        }
      }

      state.time += 1;
      frameRef.current = requestAnimationFrame(loop);
    }

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas"
      aria-hidden="true"
    />
  );
}
