import { motion, useAnimationControls } from 'motion/react';

const rand = (min: number, max: number) => min + Math.random() * (max - min);

type WiggleWordProps = {
  text: string;
  className?: string;
  reduceMotion?: boolean | null;
};

// A word whose letters hop on hover and scatter-then-regroup when tapped.
export function WiggleWord({ text, className = '', reduceMotion }: WiggleWordProps) {
  const controls = useAnimationControls();
  const letters = Array.from(text);

  const lift = () =>
    controls.start((i: number) => ({
      y: -10,
      rotate: i % 2 ? 6 : -6,
      transition: { type: 'spring', stiffness: 500, damping: 12, delay: i * 0.025 },
    }));

  const settle = () =>
    controls.start((i: number) => ({
      x: 0,
      y: 0,
      rotate: 0,
      transition: { type: 'spring', stiffness: 300, damping: 14, delay: i * 0.02 },
    }));

  const scatter = () => {
    controls.start(() => ({
      x: rand(-40, 40),
      y: rand(-50, 30),
      rotate: rand(-45, 45),
      transition: { type: 'spring', stiffness: 400, damping: 15 },
    }));
    window.setTimeout(settle, 380);
  };

  return (
    <motion.span
      role="button"
      tabIndex={0}
      aria-label={text}
      className={`cursor-pointer select-none focus:outline-none ${className}`}
      onHoverStart={reduceMotion ? undefined : lift}
      onHoverEnd={reduceMotion ? undefined : settle}
      onTap={reduceMotion ? undefined : scatter}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !reduceMotion && scatter()}
    >
      {letters.map((letter, i) => (
        <motion.span key={i} custom={i} animate={controls} aria-hidden="true" className="inline-block">
          {letter === ' ' ? ' ' : letter}
        </motion.span>
      ))}
    </motion.span>
  );
}
