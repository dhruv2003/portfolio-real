import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  clearRouteTransition,
  getRouteTransition,
  hackerFill,
  subscribeRouteTransition,
} from '../../utils/routeTransition';
import { getHackerMode } from '../../utils/hackerMode';
import { MatrixRain } from './HackerMode';

const EASE = [0.7, 0, 0.3, 1] as const;

// Bridges two routes: a colour flood from the click point, or in hacker mode a curtain of Matrix rain.
// Either way it navigates while the screen is covered, then wipes away.
export function RouteTransition({ navigate }: { navigate: (to: string) => void }) {
  const transition = useSyncExternalStore(subscribeRouteTransition, getRouteTransition);
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<'cover' | 'reveal'>('cover');

  useEffect(() => {
    if (!transition) return;
    if (reduceMotion) {
      navigate(transition.to);
      clearRouteTransition();
      return;
    }
    setPhase('cover');
  }, [transition, reduceMotion, navigate]);

  // Decide the style once per transition so toggling hacker mode mid-way can't swap it
  const hacker = useMemo(() => getHackerMode().active, [transition?.id]);

  if (!transition || reduceMotion) return null;

  const onDone = () => {
    if (phase === 'cover') {
      navigate(transition.to);
      window.scrollTo(0, 0);
      setPhase('reveal');
    } else {
      clearRouteTransition();
    }
  };

  if (hacker) {
    return (
      <motion.div
        key={transition.id}
        aria-hidden="true"
        className="fixed inset-0 z-[150] flex items-center justify-center"
        style={{ backgroundColor: '#000' }}
        // Rain curtain drops down over the page, then drains off the bottom
        initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
        animate={{ clipPath: phase === 'cover' ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)' }}
        transition={phase === 'cover' ? { duration: 0.55, ease: EASE } : { duration: 0.6, ease: EASE, delay: 0.15 }}
        onAnimationComplete={onDone}
      >
        <div className="absolute inset-0">
          <MatrixRain fast prefill />
        </div>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.2 }}
          className="relative font-mono font-bold text-lg sm:text-2xl text-[#00ff41] bg-black/85 px-5 py-3 border-2 border-[#00ff41] [text-shadow:0_0_12px_rgba(0,255,65,0.8)]"
        >
          &gt; cd {transition.to === '/' ? '~' : transition.to}
          <motion.span
            className="inline-block ml-1"
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
          >
            _
          </motion.span>
        </motion.p>
      </motion.div>
    );
  }

  const { x, y, color, label } = transition;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  return (
    <motion.div
      key={transition.id}
      aria-hidden="true"
      data-hk-fill={hackerFill(color)}
      className="fixed inset-0 z-[150] flex items-center justify-center border-black"
      style={{ backgroundColor: color }}
      initial={{ clipPath: `circle(0px at ${x}px ${y}px)`, y: '0%' }}
      animate={
        phase === 'cover'
          ? { clipPath: `circle(${radius}px at ${x}px ${y}px)` }
          : { y: '-100%' }
      }
      transition={
        phase === 'cover'
          ? { duration: 0.5, ease: EASE }
          : { duration: 0.45, ease: EASE, delay: 0.08 }
      }
      onAnimationComplete={onDone}
    >
      <motion.span
        initial={{ opacity: 0, scale: 0.8, rotate: -4 }}
        animate={{ opacity: 1, scale: 1, rotate: -2 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 500, damping: 20 }}
        className="font-black uppercase tracking-widest text-2xl sm:text-4xl bg-white text-black px-5 py-3 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        {label}
      </motion.span>
    </motion.div>
  );
}
