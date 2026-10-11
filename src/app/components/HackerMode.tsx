import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  deactivateHackerMode,
  getHackerMode,
  pinHackerMode,
  subscribeHackerMode,
} from '../../utils/hackerMode';

const GLYPHS =
  'アァカサタナハマヤャラワガザダバパイィキシチニヒミリギジヂビピウゥクスツヌフムユュルグズブプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロヲゴゾドボポン0123456789';
const SECRET = 'DHRUVBHAGATKAR';
const FONT_SIZE = 16;
const BURST_MS = 2000;
const THEME_SWAP_MS = 160;
const EXIT_MS = 450;

type Stage = 'off' | 'burst' | 'ambient' | 'exit';

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

// Canvas digital rain. Runs at 30fps during the intro burst and 15fps once it settles in the background.
function MatrixRain({ fast }: { fast: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fastRef = useRef(fast);
  fastRef.current = fast;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Capped DPR keeps the per-frame fade cheap on 3x phone screens
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = 0;
    let height = 0;
    let drops: number[] = [];
    let heads: string[] = [];
    // Some columns quietly spell the owner's name instead of random glyphs
    let secret: (number | null)[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `bold ${FONT_SIZE}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textBaseline = 'top';
      const columns = Math.ceil(width / FONT_SIZE);
      drops = Array.from({ length: columns }, (_, i) => drops[i] ?? -Math.floor(Math.random() * 40));
      heads = Array.from({ length: columns }, (_, i) => heads[i] ?? randomGlyph());
      secret = Array.from({ length: columns }, (_, i) => secret[i] ?? (Math.random() < 0.04 ? 0 : null));
    };
    resize();
    window.addEventListener('resize', resize);

    let frame = 0;
    let last = 0;
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      const interval = fastRef.current ? 33 : 66;
      if (now - last < interval) return;
      last = now;

      // Fade the previous frame toward black; on screen-blend black is see-through
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < drops.length; i++) {
        const y = drops[i] * FONT_SIZE;
        const x = i * FONT_SIZE;
        if (y >= 0) {
          // Previous head becomes part of the green trail, new head is near-white
          ctx.fillStyle = '#00ff41';
          ctx.fillText(heads[i], x, y - FONT_SIZE);
          const s = secret[i];
          heads[i] = s === null ? randomGlyph() : SECRET[s % SECRET.length];
          if (s !== null) secret[i] = s + 1;
          ctx.fillStyle = '#d9ffe0';
          ctx.fillText(heads[i], x, y);
        }
        drops[i] += 1;
        if (y > height && Math.random() > 0.975) {
          drops[i] = -Math.floor(Math.random() * 20);
          secret[i] = Math.random() < 0.04 ? 0 : null;
        }
      }
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
}

function useSecondsLeft(endsAt: number, running: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(t);
  }, [running, endsAt]);
  return Math.max(0, Math.ceil((endsAt - now) / 1000));
}

export function HackerMode() {
  const hacker = useSyncExternalStore(subscribeHackerMode, getHackerMode);
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>('off');
  const secondsLeft = useSecondsLeft(hacker.endsAt, hacker.active && !hacker.pinned);

  // Choreography: black out + rain, swap the theme while covered, then let the rain settle behind the page
  useEffect(() => {
    const root = document.documentElement;
    const timers: number[] = [];

    if (hacker.active) {
      if (reduceMotion) {
        root.classList.add('hacker-mode');
        setStage('ambient');
        return;
      }
      setStage('burst');
      timers.push(window.setTimeout(() => root.classList.add('hacker-mode'), THEME_SWAP_MS));
      timers.push(window.setTimeout(() => setStage('ambient'), BURST_MS));
    } else {
      if (!root.classList.contains('hacker-mode') || reduceMotion) {
        root.classList.remove('hacker-mode');
        setStage('off');
        return;
      }
      setStage('exit');
      timers.push(window.setTimeout(() => root.classList.remove('hacker-mode'), EXIT_MS / 3));
      timers.push(window.setTimeout(() => setStage('off'), EXIT_MS));
    }

    return () => timers.forEach(window.clearTimeout);
  }, [hacker.active, reduceMotion]);

  useEffect(() => {
    if (!hacker.active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') deactivateHackerMode();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hacker.active]);

  return (
    <>
      {/* Black-out behind the rain during the intro */}
      <AnimatePresence>
        {stage === 'burst' && (
          <motion.div
            key="blackout"
            aria-hidden="true"
            className="hk-overlay fixed inset-0 z-[180] pointer-events-none"
            style={{ backgroundColor: '#000' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.15 } }}
            exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeOut' } }}
          />
        )}
      </AnimatePresence>

      {/* Rain: full strength over the black-out, then a faint glow over the themed page */}
      <AnimatePresence>
        {stage !== 'off' && !reduceMotion && (
          <motion.div
            key="rain"
            aria-hidden="true"
            className="hk-overlay fixed inset-0 z-[181] pointer-events-none mix-blend-screen"
            initial={{ opacity: 1 }}
            animate={{
              opacity: stage === 'burst' ? 1 : stage === 'ambient' ? 0.22 : 0,
              transition: { duration: stage === 'exit' ? 0.25 : 0.9, ease: 'easeOut' },
            }}
            exit={{ opacity: 0 }}
          >
            <MatrixRain fast={stage === 'burst'} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === 'burst' && (
          <motion.div
            key="granted"
            aria-hidden="true"
            className="hk-overlay fixed inset-0 z-[182] flex items-center justify-center pointer-events-none"
            exit={{ opacity: 0, scale: 1.08, transition: { duration: 0.4 } }}
          >
            <p className="font-mono font-bold uppercase tracking-[0.3em] text-lg sm:text-3xl text-[#00ff41] bg-black/80 px-5 py-3 border-2 border-[#00ff41] [text-shadow:0_0_12px_rgba(0,255,65,0.8)]">
              {'ACCESS GRANTED'.split('').map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.4, 1] }}
                  transition={{ delay: 0.35 + i * 0.045, duration: 0.25 }}
                >
                  {ch === ' ' ? ' ' : ch}
                </motion.span>
              ))}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit: quick green flash hides the theme swap back */}
      <AnimatePresence>
        {stage === 'exit' && (
          <motion.div
            key="flash"
            aria-hidden="true"
            className="hk-overlay fixed inset-0 z-[182] bg-[#00ff41] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.55, 0], transition: { duration: EXIT_MS / 1000, times: [0, 0.3, 1] } }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hacker.active && stage !== 'burst' && (
          <motion.div
            key="chip"
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="hk-chip fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-[185] flex items-center font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest"
          >
            {/* Tapping the timer pins the mode too (the Stay button is hidden on phones) */}
            <button
              type="button"
              onClick={hacker.pinned ? undefined : pinHackerMode}
              aria-label={hacker.pinned ? 'Hacker mode pinned' : `Hacker mode, ${secondsLeft} seconds left. Tap to stay`}
              className="!border-l-0 flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 font-bold uppercase"
            >
              <motion.span
                className="w-2 h-2 rounded-full bg-[#00ff41]"
                animate={reduceMotion ? undefined : { opacity: [1, 0.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="hidden sm:inline">Hacker mode ·</span>
              {hacker.pinned ? '∞' : `0:${String(secondsLeft).padStart(2, '0')}`}
            </button>
            {!hacker.pinned && (
              <button type="button" onClick={pinHackerMode} className="hidden sm:block px-2 sm:px-3 py-1.5 sm:py-2 font-bold">
                Stay
              </button>
            )}
            <button type="button" onClick={deactivateHackerMode} className="px-2 sm:px-3 py-1.5 sm:py-2 font-bold">
              Exit
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
