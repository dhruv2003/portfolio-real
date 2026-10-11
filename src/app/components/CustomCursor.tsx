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

// Brutalist arrow: black fill with a white outline reads on light and dark surfaces alike,
// and the yellow hard shadow ties it to the site. Tip sits exactly on the pointer.
function Arrow() {
  return (
    <svg width="24" height="28" viewBox="0 0 24 28" className="block drop-shadow-[2px_2px_0_#FFC900]">
      <path
        d="M2 2 L2 23 L7.5 17.5 L11.5 26 L15.5 24.2 L11.6 15.8 L19.5 15.8 Z"
        fill="#000"
        stroke="#fff"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IBeam() {
  return (
    <svg width="12" height="26" viewBox="0 0 12 26" className="block -translate-x-1/2 -translate-y-1/2">
      <path d="M2 2 H10 M6 2 V24 M2 24 H10" stroke="#fff" strokeWidth="5" strokeLinecap="square" />
      <path d="M2 2 H10 M6 2 V24 M2 24 H10" stroke="#000" strokeWidth="2.5" strokeLinecap="square" />
    </svg>
  );
}

export function CustomCursor() {
  const finePointer = useMediaQuery(FINE_POINTER);
  const [variant, setVariant] = useState<Variant>('hidden');
  // Arrow glides after the mouse on a tight spring; the badge trails a touch further behind it
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 1200, damping: 60, mass: 0.25 });
  const springY = useSpring(y, { stiffness: 1200, damping: 60, mass: 0.25 });
  const badgeX = useSpring(x, { stiffness: 700, damping: 40, mass: 0.35 });
  const badgeY = useSpring(y, { stiffness: 700, damping: 40, mass: 0.35 });

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

  const hasBadge = variant === 'link' || variant === 'grab' || variant === 'grabbing';

  return (
    <div aria-hidden="true" className={`custom-cursor ${variant === 'hidden' ? 'opacity-0' : ''}`}>
      <motion.div className="fixed top-0 left-0 z-[400] pointer-events-none" style={{ x: springX, y: springY }}>
        {variant === 'text' ? (
          <IBeam />
        ) : (
          <motion.div
            className="origin-top-left"
            initial={false}
            animate={{
              scale: variant === 'grabbing' ? 0.85 : variant === 'link' || variant === 'grab' ? 1.12 : 1,
              rotate: variant === 'grabbing' ? -14 : variant === 'link' ? -10 : variant === 'grab' ? 8 : 0,
            }}
            transition={{ type: 'spring', stiffness: 600, damping: 18 }}
          >
            <Arrow />
          </motion.div>
        )}
      </motion.div>

      {/* Context badge: a hint next to the arrow, never a replacement for it */}
      <motion.div className="fixed top-0 left-0 z-[399] pointer-events-none" style={{ x: badgeX, y: badgeY }}>
        <AnimatePresence>
          {hasBadge && (
            <motion.div
              key={variant === 'link' ? 'link' : 'grab'}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: variant === 'grabbing' ? 6 : -6 }}
              exit={{ scale: 0, rotate: 20 }}
              transition={{ type: 'spring', stiffness: 600, damping: 22 }}
              className={`cursor-tag absolute left-5 top-6 origin-top-left border-2 border-black font-black uppercase text-[10px] tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center whitespace-nowrap text-black ${
                variant === 'link'
                  ? 'w-6 h-6 bg-[#FFC900]'
                  : variant === 'grab'
                    ? 'px-2 py-0.5 bg-[#FFC900]'
                    : 'px-2 py-0.5 bg-[#FF90E8]'
              }`}
            >
              {variant === 'link' ? <ArrowUpRight className="w-4 h-4" /> : variant === 'grab' ? 'Grab' : 'Whee!'}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
