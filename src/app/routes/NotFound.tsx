import { useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, type PanInfo } from "motion/react";
import { Link } from "react-router";
import { Terminal } from "lucide-react";
import { trackEvent } from "../../utils/analytics";
import { transitionClick } from "../../utils/routeTransition";

const EVICT_SPEED = 1200;

export function NotFound() {
  const reduceMotion = useReducedMotion();
  const blockRef = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [restarts, setRestarts] = useState(0);
  const [escape, setEscape] = useState({ x: 0, y: 0, runs: 0 });

  // Thrown hard enough (or mostly off-screen) and the 404 gets evicted, then "restarted" from the top
  const onDragEnd = async (_: unknown, info: PanInfo) => {
    const el = blockRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const visibleW = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
    const visibleH = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
    const mostlyGone = visibleW * visibleH < (rect.width * rect.height) / 2;
    const speed = Math.hypot(info.velocity.x, info.velocity.y);
    if (!mostlyGone && speed < EVICT_SPEED) return;

    trackEvent("easter_egg", { egg: "404_evicted" });
    await Promise.all([
      animate(x, x.get() + info.velocity.x * 0.5, { duration: 0.35, ease: "easeIn" }),
      animate(y, y.get() + info.velocity.y * 0.5, { duration: 0.35, ease: "easeIn" }),
    ]);
    x.set(0);
    y.set(-window.innerHeight);
    setRestarts((n) => n + 1);
    animate(y, 0, { type: "spring", stiffness: 300, damping: 14 });
  };

  // The way home dodges the cursor exactly once, then gives up
  const dodge = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || e.pointerType !== "mouse" || escape.runs >= 2) return;
    if (escape.runs === 1) {
      setEscape((s) => ({ ...s, runs: 2 }));
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const room = window.innerWidth - rect.right > rect.left ? 1 : -1;
    setEscape({ x: room * (140 + Math.random() * 60), y: (Math.random() - 0.5) * 80, runs: 1 });
  };

  const buttonLabel = escape.runs === 0 ? "Return to production" : escape.runs === 1 ? "nope 🏃" : "ok fine, go home";

  return (
    <div className="min-h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-[#FFFDF9] text-black font-sans selection:bg-[#FFC900] selection:text-black p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-lg w-full text-center"
      >
        <div className="bg-black text-white border-4 border-black px-6 py-4 mb-8 shadow-[8px_8px_0px_0px_rgba(255,201,0,1)] inline-block">
          <p className="font-mono text-sm sm:text-base">
            <span className="text-[#FFC900]">root@cluster:~$</span> curl /this-page
          </p>
          <p className="font-mono text-sm sm:text-base mt-2 text-red-400">
            HTTP/1.1 404 Not Found
          </p>
          <p className="font-mono text-sm sm:text-base text-gray-400">
            {restarts === 0
              ? "Error: route crashed in production."
              : `↻ k8s restarted the 404 (restarts: ${restarts})`}
          </p>
        </div>

        <h1 className="text-6xl sm:text-8xl font-black uppercase tracking-tighter mb-2">
          <motion.span
            ref={blockRef}
            data-cursor="grab"
            drag
            dragMomentum={false}
            dragElastic={0}
            initial={{ rotate: -2 }}
            animate={{ rotate: -2 }}
            whileDrag={{ scale: 1.1, rotate: 4 }}
            onDragEnd={onDragEnd}
            style={{ x, y }}
            className="bg-[#FFC900] px-3 py-1 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] inline-block cursor-grab active:cursor-grabbing touch-none relative z-10"
          >
            404
          </motion.span>
        </h1>
        <p className="font-mono text-xs sm:text-sm font-bold text-gray-500 mb-6">
          psst: throw the 404 off the screen
        </p>

        <p className="text-xl sm:text-2xl font-bold leading-relaxed mb-8">
          This page was deployed to /dev/null.
          <br />
          No logs. No traces. No survivors.
        </p>

        <motion.div
          className="inline-block"
          animate={{ x: escape.x, y: escape.y }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          onPointerEnter={dodge}
        >
          <Link
            to="/"
            onClick={(e) => transitionClick(e, "/", "#FFC900", "back to prod…")}
            className="inline-flex items-center gap-2 font-black uppercase tracking-widest text-sm bg-[#FFC900] px-6 py-3 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all group"
          >
            <Terminal className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            {buttonLabel}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
