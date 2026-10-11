import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { FINE_POINTER, useMediaQuery } from '../../hooks/useMediaQuery';

type Variant = 'hidden' | 'default' | 'text' | 'link' | 'grab' | 'grabbing';

const resolveVariant = (target: EventTarget | null): Variant => {
  if (!(target instanceof Element)) return 'default';
  if (target.closest('input, textarea, [contenteditable="true"]')) return 'text';
  if (target.closest('[data-cursor="grab"]')) return 'grab';
  if (target.closest('a, button, [role="button"], label, [tabindex]:not([tabindex="-1"])')) return 'link';
  return 'default';
};

export function CustomCursor() {
  const finePointer = useMediaQuery(FINE_POINTER);
  const [variant, setVariant] = useState<Variant>('hidden');
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 1200, damping: 60, mass: 0.25 });
  const springY = useSpring(y, { stiffness: 1200, damping: 60, mass: 0.25 });

  useEffect(() => {
    if (!finePointer) return;
    const root = document.documentElement;
    root.classList.add('has-custom-cursor');

    let pressedOnGrab = false;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') {
        setVariant('hidden');
        return;
      }
      x.set(e.clientX);
      y.set(e.clientY);
      setVariant((v) => (pressedOnGrab ? 'grabbing' : v === 'hidden' ? resolveVariant(e.target) : v));
    };
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && !pressedOnGrab) setVariant(resolveVariant(e.target));
    };
    const onDown = (e: PointerEvent) => {
      if (resolveVariant(e.target) === 'grab') {
        pressedOnGrab = true;
        setVariant('grabbing');
      }
    };
    const onUp = (e: PointerEvent) => {
      pressedOnGrab = false;
      setVariant(resolveVariant(e.target));
    };
    const onLeave = () => setVariant('hidden');

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);

    return () => {
      root.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, [finePointer, x, y]);

  if (!finePointer) return null;

  const isTag = variant === 'link' || variant === 'grab' || variant === 'grabbing';

  return (
    <motion.div
      aria-hidden="true"
      className="custom-cursor fixed top-0 left-0 z-[400] pointer-events-none"
      style={{ x: springX, y: springY }}
    >
      {/* Blend-mode dot: reads black on light surfaces and white on dark ones */}
      <motion.div
        className="absolute bg-white mix-blend-difference"
        initial={false}
        animate={{
          width: variant === 'text' ? 3 : 12,
          height: variant === 'text' ? 24 : 12,
          x: variant === 'text' ? -1.5 : -6,
          y: variant === 'text' ? -12 : -6,
          opacity: isTag || variant === 'hidden' ? 0 : 1,
          rotate: variant === 'default' ? 45 : 0,
        }}
        transition={{ type: 'spring', stiffness: 700, damping: 35 }}
      />
      <AnimatePresence>
        {isTag && (
          <motion.div
            key={variant === 'link' ? 'link' : 'grab'}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: variant === 'grabbing' ? 0.9 : 1, rotate: variant === 'grabbing' ? 6 : -6 }}
            exit={{ scale: 0, rotate: 20 }}
            transition={{ type: 'spring', stiffness: 600, damping: 22 }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 border-2 border-black font-black uppercase text-[10px] tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center whitespace-nowrap ${
              variant === 'link'
                ? 'w-8 h-8 bg-[#FFC900] text-black'
                : variant === 'grab'
                  ? 'px-2 py-1 bg-[#FFC900] text-black'
                  : 'px-2 py-1 bg-[#FF90E8] text-black'
            }`}
          >
            {variant === 'link' ? <ArrowUpRight className="w-5 h-5" /> : variant === 'grab' ? 'Grab' : 'Whee!'}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
