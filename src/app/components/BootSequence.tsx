import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const BOOT_LINES = [
  { text: '> initializing portfolio v2.0...', delay: 0 },
  { text: '> loading personality module...', delay: 120 },
  { text: '> calibrating sass levels...', delay: 240 },
  { text: '> importing devops jokes...', delay: 360 },
  { text: '> checking for production incidents...', delay: 480 },
  { text: '> status: all systems nominal ✓', delay: 600 },
  { text: '> rendering dhruv...', delay: 750 },
];

const SESSION_KEY = 'boot_shown';

export function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      onComplete();
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach((line, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), line.delay));
    });

    timers.push(setTimeout(() => setFadeOut(true), 1000));
    timers.push(setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, '1');
      onComplete();
    }, 1300));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col justify-center px-8 sm:px-16 md:px-24"
        >
          <div className="max-w-2xl">
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className={`font-mono text-sm sm:text-base md:text-lg ${
                  i === BOOT_LINES.length - 1 && visibleLines === BOOT_LINES.length
                    ? 'text-[#FFC900]'
                    : 'text-[#38BDF8]'
                }`}
              >
                {line.text}
              </motion.p>
            ))}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-2 h-4 sm:h-5 bg-[#FFC900] mt-1"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
