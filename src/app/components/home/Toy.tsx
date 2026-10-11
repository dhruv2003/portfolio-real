import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  animate,
  motion,
  useAnimationControls,
  useDragControls,
  useMotionValue,
  type MotionValue,
  type PanInfo,
  type TargetAndTransition,
} from 'motion/react';

export type ToyHandle = {
  reset: () => void;
  element: () => HTMLDivElement | null;
};

type ToyProps = {
  constraintsRef: RefObject<Element | null>;
  /** Positioning + size of the toy inside the hero */
  className: string;
  /** Look of the toy itself (colour, border, radius...) */
  bodyClassName: string;
  parallax?: MotionValue<number>;
  /** Resting hard-shadow offset in px; 0 disables the shadow */
  shadow?: number;
  rotate?: number;
  hoverRotate?: number;
  asleep?: boolean;
  reduceMotion?: boolean | null;
  presence?: {
    initial?: TargetAndTransition;
    animate?: TargetAndTransition;
    exit?: TargetAndTransition;
  };
  onDragStart?: () => void;
  onDrag?: (info: PanInfo) => void;
  onDragEnd?: (info: PanInfo) => void;
  /** Fires once the toy has come to rest after a throw */
  onLand?: () => void;
  onHoverStart?: () => void;
  children?: ReactNode;
};

const shadowOf = (px: number) => `${px}px ${px}px 0px 0px rgba(0,0,0,1)`;

// A throwable prop: bounces off the hero edges, lifts its shadow while held and squashes when it lands.
export const Toy = forwardRef<ToyHandle, ToyProps>(function Toy(
  {
    constraintsRef,
    className,
    bodyClassName,
    parallax,
    shadow = 0,
    rotate = 0,
    hoverRotate = 0,
    asleep = false,
    reduceMotion,
    presence,
    onDragStart,
    onDrag,
    onDragEnd,
    onLand,
    onHoverStart,
    children,
  },
  ref
) {
  const dragRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const bodyControls = useAnimationControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const boxShadow = useMotionValue(shadowOf(shadow));
  const [lifted, setLifted] = useState(false);
  const landing = useRef<{ pending: boolean; timer?: number }>({ pending: false });

  useImperativeHandle(ref, () => ({
    reset: () => {
      animate(x, 0, { type: 'spring', stiffness: 260, damping: 18 });
      animate(y, 0, { type: 'spring', stiffness: 260, damping: 18 });
    },
    element: () => dragRef.current,
  }));

  useEffect(() => () => window.clearTimeout(landing.current.timer), []);

  const land = () => {
    if (!landing.current.pending) return;
    landing.current.pending = false;
    window.clearTimeout(landing.current.timer);
    if (!reduceMotion) {
      bodyControls.start({
        scaleX: [1, 1.18, 0.94, 1],
        scaleY: [1, 0.82, 1.06, 1],
        transition: { duration: 0.45, ease: 'easeOut' },
      });
      if (shadow) {
        animate(boxShadow, [shadowOf(0), shadowOf(shadow)], { duration: 0.35, ease: 'easeOut' });
      }
    }
    onLand?.();
  };

  const startDrag = (e: ReactPointerEvent) => {
    // Let buttons and inputs inside a toy (the terminal) work without starting a drag
    if ((e.target as HTMLElement).closest('button, input, a')) return;
    dragControls.start(e);
  };

  return (
    <motion.div
      className={`absolute ${className}`}
      style={{ y: parallax, zIndex: lifted ? 50 : 0 }}
      initial={presence?.initial}
      animate={presence?.animate}
      exit={presence?.exit}
    >
      <motion.div
        ref={dragRef}
        data-cursor="grab"
        drag
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={constraintsRef}
        dragElastic={0.35}
        dragTransition={{ power: 0.35, timeConstant: 260, bounceStiffness: 420, bounceDamping: 14 }}
        onPointerDown={startDrag}
        initial={false}
        animate={{ rotate }}
        whileDrag={{ scale: 1.08 }}
        whileHover={hoverRotate ? { rotate: rotate + hoverRotate } : undefined}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        onDragStart={() => {
          setLifted(true);
          window.clearTimeout(landing.current.timer);
          landing.current.pending = false;
          if (shadow) animate(boxShadow, shadowOf(shadow * 2), { duration: 0.15 });
          onDragStart?.();
        }}
        onDrag={(_, info) => onDrag?.(info)}
        onDragEnd={(_, info) => {
          setLifted(false);
          landing.current.pending = true;
          // Fallback in case the inertia animation never reports back
          landing.current.timer = window.setTimeout(land, 900);
          onDragEnd?.(info);
        }}
        onDragTransitionEnd={land}
        onHoverStart={onHoverStart}
        style={{ x, y }}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      >
        <motion.div
          className="w-full h-full"
          initial={false}
          animate={{ scale: asleep ? 0.72 : 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        >
          <motion.div animate={bodyControls} style={shadow ? { boxShadow } : undefined} className={`w-full h-full ${bodyClassName}`}>
            {children}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
});
