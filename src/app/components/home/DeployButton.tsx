import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { trackEvent } from '../../../utils/analytics';

type Rocket = { id: number; x: number; y: number };

// Footer sign-off: launches a rocket that flies up the page while the page scrolls back to the top.
export function DeployButton() {
  const reduceMotion = useReducedMotion();
  const [rockets, setRockets] = useState<Rocket[]>([]);
  const [label, setLabel] = useState('READY TO DEPLOY.');
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const launch = (e: React.MouseEvent<HTMLButtonElement>) => {
    trackEvent('easter_egg', { egg: 'footer_rocket' });
    timers.current.forEach(window.clearTimeout);

    if (reduceMotion) {
      window.scrollTo({ top: 0 });
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    setRockets((r) => [...r, { id: Date.now(), x: rect.left + rect.width / 2, y: rect.top }]);
    setLabel('DEPLOYING…');
    timers.current = [
      window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 350),
      window.setTimeout(() => setLabel('DEPLOYED ✓'), 900),
      window.setTimeout(() => setLabel('READY TO DEPLOY.'), 3500),
    ];
  };

  return (
    <>
      <button
        type="button"
        onClick={launch}
        className="font-black border-4 border-black px-4 py-2 bg-black text-white shadow-[6px_6px_0px_0px_rgba(255,201,0,1)] uppercase hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(255,201,0,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all"
      >
        {label}
      </button>
      <AnimatePresence>
        {rockets.map((rocket) => (
          <motion.div
            key={rocket.id}
            aria-hidden="true"
            className="fixed z-[120] pointer-events-none"
            style={{ left: rocket.x, top: rocket.y }}
          >
            {/* Exhaust puffs left behind at the launch pad */}
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className="absolute w-5 h-5 rounded-full bg-white border-2 border-black"
                initial={{ x: -10, y: 0, scale: 0.4, opacity: 1 }}
                animate={{ x: -10 + (i - 1.5) * 18, y: 18 + i * 4, scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.8, delay: i * 0.06, ease: 'easeOut' }}
              />
            ))}
            <motion.span
              className="absolute -translate-x-1/2 text-4xl block"
              initial={{ y: 0, rotate: -45 }}
              animate={{ y: -(rocket.y + 200), x: [0, -8, 8, -4, 0] }}
              transition={{ duration: 1.3, ease: [0.5, 0, 0.9, 0.6] }}
              onAnimationComplete={() => setRockets((r) => r.filter((x) => x.id !== rocket.id))}
            >
              🚀
            </motion.span>
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}
