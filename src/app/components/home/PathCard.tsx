import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react';
import { ArrowUpRight, LayoutDashboard, MessageSquare, Terminal } from 'lucide-react';
import { Link } from 'react-router';
import { trackEvent } from '../../../utils/analytics';
import { hackerFill, transitionClick } from '../../../utils/routeTransition';

type Kind = 'chat' | 'manual' | 'cli';

type PathCardProps = {
  kind: Kind;
  to: string;
  color: string;
  label: string;
  title: ReactNode;
  description: string;
  cta: string;
  ctaClassName: string;
  iconBoxClassName: string;
  tilt: boolean;
  reduceMotion?: boolean | null;
};

const ICONS = { chat: MessageSquare, manual: LayoutDashboard, cli: Terminal };

// What each card's icon turns into while hovered: a peek at the mode behind it.
function IconPreview({ kind }: { kind: Kind }) {
  if (kind === 'chat') {
    return (
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 bg-current rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    );
  }
  if (kind === 'manual') {
    return (
      <div className="relative w-7 h-8" style={{ perspective: 200 }}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 bg-white border-2 border-black origin-left"
            animate={{ rotateY: [0, -160, -160, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2, times: [0, 0.35, 0.7, 1] }}
          />
        ))}
      </div>
    );
  }
  return (
    <span className="font-mono font-black text-xl">
      &gt;
      <motion.span animate={{ opacity: [1, 1, 0, 0] }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
        _
      </motion.span>
    </span>
  );
}

// One of the three "pick your path" cards: tilts toward the cursor and floods the screen in its colour on click.
export function PathCard({
  kind,
  to,
  color,
  label,
  title,
  description,
  cta,
  ctaClassName,
  iconBoxClassName,
  tilt,
  reduceMotion,
}: PathCardProps) {
  const [hovered, setHovered] = useState(false);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const springX = useSpring(px, { stiffness: 250, damping: 20 });
  const springY = useSpring(py, { stiffness: 250, damping: 20 });
  const rotateY = useTransform(springX, (v) => v * 12);
  const rotateX = useTransform(springY, (v) => v * -12);
  // Hard shadow slides away from the cursor, like light from the pointer
  const shadowX = useTransform(springX, (v) => 10 - v * 14);
  const shadowY = useTransform(springY, (v) => 10 - v * 14);
  const boxShadow = useMotionTemplate`${shadowX}px ${shadowY}px 0px 0px rgba(0,0,0,1)`;

  const Icon = ICONS[kind];
  const canTilt = tilt && !reduceMotion;

  return (
    <motion.div
      data-hk-fill={hackerFill(color)}
      className="h-full border-4 border-black group text-left"
      style={{ backgroundColor: color, boxShadow, rotateX: canTilt ? rotateX : 0, rotateY: canTilt ? rotateY : 0 }}
      whileHover={reduceMotion ? undefined : { y: -8 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97, y: 0 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => {
        setHovered(false);
        px.set(0);
        py.set(0);
      }}
      onPointerMove={(e) => {
        if (!canTilt || e.pointerType !== 'mouse') return;
        const rect = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - rect.left) / rect.width - 0.5);
        py.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
    >
      <Link
        to={to}
        onClick={(e) => {
          trackEvent('path_choice', { choice: kind === 'manual' ? 'manual' : kind === 'cli' ? 'terminal_resume' : 'chat' });
          transitionClick(e, to, color, label);
        }}
        className="p-8 h-full flex flex-col justify-between focus:outline-none focus-visible:ring-4 focus-visible:ring-black"
      >
        <div>
          <div
            className={`w-16 h-16 flex items-center justify-center border-4 border-black mb-6 group-hover:rotate-12 transition-transform ${iconBoxClassName}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={hovered && !reduceMotion ? 'preview' : 'icon'}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 30 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center"
              >
                {hovered && !reduceMotion ? <IconPreview kind={kind} /> : <Icon className="w-8 h-8" />}
              </motion.div>
            </AnimatePresence>
          </div>
          <h2 className="text-3xl font-black uppercase mb-4">{title}</h2>
          <p className="text-lg font-bold mb-8">{description}</p>
        </div>
        <div
          className={`flex items-center gap-2 font-black uppercase tracking-widest text-black border-2 border-black px-4 py-2 self-start shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors ${ctaClassName}`}
        >
          {cta} <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </div>
      </Link>
    </motion.div>
  );
}
