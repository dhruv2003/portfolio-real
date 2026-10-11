import { useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from 'motion/react';

// Percent of the track (two copies of the words) travelled per second
const BASE_VELOCITY = -0.8;

type MarqueeProps = {
  words: string[];
  onWord: (word: string) => void;
  reduceMotion?: boolean | null;
};

// Infinite ticker that speeds up and flips direction with scroll, and slows down under the cursor.
export function Marquee({ words, onWord, reduceMotion }: MarqueeProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
  const hoverTarget = useMotionValue(1);
  const hoverFactor = useSpring(hoverTarget, { stiffness: 120, damping: 20 });
  const direction = useRef(1);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduceMotion) return;
    let moveBy = direction.current * BASE_VELOCITY * (delta / 1000);
    const vf = velocityFactor.get();
    if (vf < 0) direction.current = -1;
    else if (vf > 0) direction.current = 1;
    moveBy += direction.current * moveBy * vf;
    baseX.set(baseX.get() + moveBy * hoverFactor.get());
  });

  const copy = (hidden: boolean) => (
    <div className="flex gap-8 items-center shrink-0 pr-8" aria-hidden={hidden || undefined}>
      {words.map((word) => (
        <div key={word} className="flex items-center gap-8">
          <motion.button
            type="button"
            tabIndex={hidden ? -1 : 0}
            whileTap={{ scale: 0.85, rotate: -3 }}
            onClick={() => onWord(word)}
            className="font-black tracking-widest text-xl uppercase hover:text-[#FFC900] focus-visible:text-[#FFC900] focus:outline-none transition-colors"
          >
            {word}
          </motion.button>
          <span className="text-[#FFC900]">///</span>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className="relative z-10 mt-[80px] bg-black text-white border-b-4 border-black overflow-hidden flex whitespace-nowrap py-4"
      onPointerEnter={(e) => e.pointerType === 'mouse' && hoverTarget.set(0.15)}
      onPointerLeave={() => hoverTarget.set(1)}
    >
      <motion.div style={{ x }} className="flex w-max will-change-transform">
        {copy(false)}
        {copy(true)}
      </motion.div>
    </div>
  );
}
