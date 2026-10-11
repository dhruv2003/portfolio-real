import { useEffect, useState, useSyncExternalStore } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  clearRouteTransition,
  getRouteTransition,
  hackerFill,
  subscribeRouteTransition,
} from '../../utils/routeTransition';

// Full-screen colour flood that bridges two routes: grows from the click point, navigates while covered, then wipes away.
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

  if (!transition || reduceMotion) return null;

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
          ? { duration: 0.5, ease: [0.7, 0, 0.3, 1] }
          : { duration: 0.45, ease: [0.7, 0, 0.3, 1], delay: 0.08 }
      }
      onAnimationComplete={() => {
        if (phase === 'cover') {
          navigate(transition.to);
          window.scrollTo(0, 0);
          setPhase('reveal');
        } else {
          clearRouteTransition();
        }
      }}
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
