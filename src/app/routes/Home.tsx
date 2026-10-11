import { useState, useRef, useEffect, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  useAnimationControls,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type PanInfo,
} from 'motion/react';
import { Terminal, LayoutDashboard, ArrowDown, MessageSquare, RotateCcw } from 'lucide-react';
import { Link } from 'react-router';
import { trackEvent } from "../../utils/analytics";
import { fireConfetti } from "../../utils/confetti";
import { transitionClick } from "../../utils/routeTransition";
import { FINE_POINTER, useMediaQuery } from "../../hooks/useMediaQuery";
import { useShake } from "../../hooks/useShake";
import { BootSequence } from "../components/BootSequence";
import { ContextMenu } from "../components/ContextMenu";
import { Toy, type ToyHandle } from "../components/home/Toy";
import { LiveTerminal, type LiveTerminalHandle } from "../components/home/LiveTerminal";
import { Marquee } from "../components/home/Marquee";
import { WiggleWord } from "../components/home/WiggleWord";
import { PathCard } from "../components/home/PathCard";
import { DeployButton } from "../components/home/DeployButton";

const TYPING_WORDS = ["Backend", "Infrastructure", "Glue Work"];
const TYPING_SPEED = 40;
const DELETING_SPEED = 20;
const PAUSE_AFTER_TYPE = 350;

const MARQUEE_WORDS = ["DEVOPS ENGINEER", "ORACLE EXPERT", "KUBERNETES", "ASSOCIATE CONSULTANT", "SYSTEM DESIGN", "OBSERVABILITY", "BASH", "JAVA", "PYTHON", "BRUH", "HOW COOL IS THIS??", "THIS IS AWESOME", "I AM A GENIUS", "WELL I SURVIVED ORACLE LAYOFFS"];

const WORD_REACTIONS: Record<string, { line?: string; toast?: string }> = {
  "DEVOPS ENGINEER": { line: "role=devops ✓ pipelines green" },
  "ORACLE EXPERT": { line: "SELECT * FROM skills WHERE vendor='oracle'" },
  "KUBERNETES": { line: "kubectl get nodes → 3 Ready" },
  "ASSOCIATE CONSULTANT": { line: "title loaded: associate consultant" },
  "SYSTEM DESIGN": { line: "drawing boxes and arrows..." },
  "OBSERVABILITY": { line: "traces: 100% sampled, 0 regrets" },
  "BASH": { line: "set -euo pipefail ✓" },
  "JAVA": { line: "AbstractSingletonProxyFactoryBean ok" },
  "PYTHON": { line: "import antigravity ✓" },
  "BRUH": { toast: "bruh." },
  "HOW COOL IS THIS??": { toast: "very. thanks for asking." },
  "THIS IS AWESOME": { toast: "agreed 🤝" },
  "I AM A GENIUS": { toast: "[citation needed]" },
  "WELL I SURVIVED ORACLE LAYOFFS": { toast: "🫡 respect." },
};

const NAV = {
  terminal: { to: "/terminal", color: "#FFC900", label: "booting shell…" },
  chat: { to: "/chat", color: "#FF90E8", label: "waking the bot…" },
  normal: { to: "/normal", color: "#38BDF8", label: "printing resume…" },
};

const IDLE_AFTER = 10000;
const ROLLBACK_SPEED = 1800;
const EDGE_MARGIN = 40;

const centerOf = (el: Element) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};
const contains = (el: Element, p: { x: number; y: number }) => {
  const r = el.getBoundingClientRect();
  return p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;
};

export function Home() {
  const reduceMotion = useReducedMotion();
  const finePointer = useMediaQuery(FINE_POINTER);
  const isMobile = useMediaQuery('(max-width: 639px)');
  const shadow = isMobile ? 4 : 8;

  const [logoClicks, setLogoClicks] = useState(0);
  const [logoToast, setLogoToast] = useState(false);
  const [bootDone, setBootDone] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);

  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const credibilityRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<LiveTerminalHandle>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = useCallback((text: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text });
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const onBootComplete = useCallback(() => setBootDone(true), []);

  // Typing animation (skipped entirely for reduced motion)
  useEffect(() => {
    if (reduceMotion) {
      setShowAll(true);
      return;
    }
    if (!bootDone || showAll) return;
    const currentWord = TYPING_WORDS[wordIdx];
    const wordDone = !isDeleting && typedText === currentWord;

    const timeout = window.setTimeout(() => {
      if (wordDone) {
        setIsDeleting(true);
      } else if (!isDeleting) {
        setTypedText(currentWord.slice(0, typedText.length + 1));
      } else if (typedText.length > 0) {
        setTypedText(typedText.slice(0, -1));
      } else {
        setIsDeleting(false);
        if (wordIdx < TYPING_WORDS.length - 1) setWordIdx(wordIdx + 1);
        else setShowAll(true);
      }
    }, wordDone ? PAUSE_AFTER_TYPE : isDeleting ? DELETING_SPEED : TYPING_SPEED);

    return () => window.clearTimeout(timeout);
  }, [typedText, isDeleting, wordIdx, showAll, bootDone, reduceMotion]);

  // Headline lands: shake the hero a little when the Infrastructure block hits
  const heroShake = useAnimationControls();
  useEffect(() => {
    if (!showAll || reduceMotion) return;
    const t = window.setTimeout(() => {
      heroShake.start({ x: [0, -6, 5, -3, 2, 0], y: [0, 2, -2, 1, 0, 0], transition: { duration: 0.35 } });
    }, 300);
    return () => window.clearTimeout(t);
  }, [showAll, reduceMotion, heroShake]);

  // Scroll-linked motion values: no React re-render per scroll frame
  const { scrollY, scrollYProgress } = useScroll();
  const flags = useRef({ isMobile, reduceMotion });
  flags.current = { isMobile, reduceMotion };
  const parallaxSource = useTransform(scrollY, (v) =>
    flags.current.reduceMotion ? 0 : flags.current.isMobile ? Math.min(v, 120) : v
  );
  const p10 = useTransform(parallaxSource, (v) => v * -0.1);
  const p15 = useTransform(parallaxSource, (v) => v * -0.15);
  const p20 = useTransform(parallaxSource, (v) => v * -0.2);
  const p25 = useTransform(parallaxSource, (v) => v * -0.25);
  const p30 = useTransform(parallaxSource, (v) => v * -0.3);
  const infraSway = useTransform(parallaxSource, [0, 600], [1, -2]);

  // Scroll depth analytics + terminal narration
  const scrollDepthFired = useRef(new Set<number>());
  const stagesFired = useRef(new Set<number>());
  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const pct = Math.round(progress * 100);
    [25, 50, 75, 100].forEach((threshold) => {
      if (pct >= threshold && !scrollDepthFired.current.has(threshold)) {
        scrollDepthFired.current.add(threshold);
        trackEvent('scroll_depth', { depth: threshold });
      }
    });

    const stage = progress >= 0.45 ? 2 : progress >= 0.12 ? 1 : 0;
    if (stage && !stagesFired.current.has(stage)) {
      stagesFired.current.add(stage);
      if (stage === 1) terminalRef.current?.push('traffic detected: 1 visitor (hi 👋)', 'normal');
      if (stage === 2) terminalRef.current?.push('✓ ready, choose a path ↓', 'ok');
    }
  });

  // Time to first interaction
  useEffect(() => {
    const startTime = Date.now();
    const trackFirst = () => {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      trackEvent('first_interaction', { seconds: elapsed });
    };
    window.addEventListener('click', trackFirst, { once: true });
    return () => window.removeEventListener('click', trackFirst);
  }, []);

  // Living dot grid: dots grow near the cursor and the grid drifts slightly against it
  useEffect(() => {
    const page = pageRef.current;
    if (!page || !finePointer || reduceMotion) return;
    let frame = 0;
    let last = { x: -999, y: -999 };
    const paint = () => {
      frame = 0;
      const rect = page.getBoundingClientRect();
      page.style.setProperty('--mx', `${last.x - rect.left}px`);
      page.style.setProperty('--my', `${last.y - rect.top}px`);
      page.style.setProperty('--px', `${(last.x / window.innerWidth - 0.5) * -10}px`);
      page.style.setProperty('--py', `${(last.y / window.innerHeight - 0.5) * -10}px`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const onMove = (e: PointerEvent) => { last = { x: e.clientX, y: e.clientY }; schedule(); };
    const onLeave = () => { last = { x: -999, y: -999 }; schedule(); };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', schedule);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, [finePointer, reduceMotion]);

  // ---- Toys ----
  const circleRef = useRef<ToyHandle>(null);
  const squareRef = useRef<ToyHandle>(null);
  const diamondRef = useRef<ToyHandle>(null);
  const ringRef = useRef<ToyHandle>(null);
  const barRef = useRef<ToyHandle>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const [messy, setMessy] = useState(false);
  const [circleText, setCircleText] = useState("Drag Me");
  const [circleAsleep, setCircleAsleep] = useState(false);
  const [circleDragging, setCircleDragging] = useState(false);
  const [zoneHot, setZoneHot] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [circleActivity, setCircleActivity] = useState(0);

  // Leave the circle alone for a while and it scales to zero
  useEffect(() => {
    if (!bootDone || reduceMotion) return;
    const t = window.setTimeout(() => {
      setCircleAsleep(true);
      setCircleText("idle… scaling to zero 💤");
    }, IDLE_AFTER);
    return () => window.clearTimeout(t);
  }, [bootDone, reduceMotion, circleActivity]);

  const wakeCircle = (text: string) => {
    setCircleActivity((n) => n + 1);
    if (circleAsleep) {
      setCircleAsleep(false);
      setCircleText(text);
    }
  };

  const tidyUp = useCallback(() => {
    [circleRef, squareRef, diamondRef, ringRef, barRef].forEach((r) => r.current?.reset());
    setMessy(false);
    trackEvent('hero_toys', { action: 'tidy_up' });
  }, []);
  useShake(tidyUp, messy);

  const markMoved = (object: string) => {
    setMessy(true);
    trackEvent("hero_drag", { object });
  };

  const deploy = useCallback(() => {
    if (deployed) {
      setCircleText("already in prod");
      terminalRef.current?.push('nothing to do: already deployed', 'muted');
      return;
    }
    setDeployed(true);
    setCircleText("SHIPPED 🚀");
    fireConfetti();
    terminalRef.current?.push('✓ deployed by visitor', 'ok');
    showToast("You shipped to prod. On a Friday. Respect.");
    trackEvent('easter_egg', { egg: 'deploy_zone' });
  }, [deployed, showToast]);

  const onCircleDrag = () => {
    const zone = zoneRef.current;
    const el = circleRef.current?.element();
    if (!zone || !el) return;
    const hot = contains(zone, centerOf(el));
    if (hot !== zoneHot) setZoneHot(hot);
  };

  const onCircleDragEnd = (info: PanInfo) => {
    setCircleDragging(false);
    markMoved("yellow_circle");
    const speed = Math.hypot(info.velocity.x, info.velocity.y);
    setCircleText(speed > ROLLBACK_SPEED ? "TOO FAST, ROLLBACK" : "OUCH.");
  };

  const onCircleLand = () => {
    setZoneHot(false);
    const el = circleRef.current?.element();
    const hero = heroRef.current;
    if (!el || !hero) return;
    const center = centerOf(el);
    if (zoneRef.current && contains(zoneRef.current, center)) {
      deploy();
      return;
    }
    const r = el.getBoundingClientRect();
    const h = hero.getBoundingClientRect();
    const nearEdge =
      r.left - h.left < EDGE_MARGIN || h.right - r.right < EDGE_MARGIN ||
      r.top - h.top < EDGE_MARGIN || h.bottom - r.bottom < EDGE_MARGIN;
    if (nearEdge) setCircleText("PAGED AT 3AM");
  };

  const onMarqueeWord = (word: string) => {
    const reaction = WORD_REACTIONS[word] ?? {};
    terminalRef.current?.push(reaction.line ?? `grep -i "${word.toLowerCase()}" → match ✓`, 'normal');
    if (reaction.toast) showToast(reaction.toast);
    trackEvent('marquee_click', { word });
  };

  const navLinkClass = "items-center gap-2 font-bold uppercase tracking-wider text-black px-3 py-1 border-2 border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group whitespace-nowrap";

  return (
    <>
      {!bootDone && <BootSequence onComplete={onBootComplete} />}
      <ContextMenu />
    <div
      ref={pageRef}
      className="min-h-screen bg-[#FFFDF9] text-black font-sans selection:bg-[#FFC900] selection:text-black flex flex-col relative"
      style={{
        backgroundImage: 'radial-gradient(rgba(0,0,0,0.15) 2px, transparent 2px)',
        backgroundSize: '32px 32px',
        backgroundPosition: 'var(--px, 0px) var(--py, 0px)',
      }}
    >
      {/* Dots near the cursor swell up */}
      {finePointer && !reduceMotion && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(0,0,0,0.45) 3.5px, transparent 3.5px)',
            backgroundSize: '32px 32px',
            backgroundPosition: 'var(--px, 0px) var(--py, 0px)',
            maskImage: 'radial-gradient(circle 170px at var(--mx, -999px) var(--my, -999px), #000 0%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(circle 170px at var(--mx, -999px) var(--my, -999px), #000 0%, transparent 100%)',
          }}
        />
      )}

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-black"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3 sm:py-4 flex justify-between items-center gap-4">
          <div
            onClick={() => {
              const next = logoClicks + 1;
              setLogoClicks(next);
              if (next >= 5 && !logoToast) {
                setLogoToast(true);
                fireConfetti();
                trackEvent('easter_egg', { egg: 'logo_click_5' });
                setTimeout(() => setLogoToast(false), 3000);
              }
            }}
            className="font-black text-base sm:text-xl uppercase tracking-widest bg-[#FFC900] px-2 sm:px-3 py-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-rotate-2 transition-transform flex-shrink cursor-pointer select-none relative"
          >
            Dhruv bhagatkar
            {logoToast && (
              <div className="absolute top-full left-0 mt-2 bg-black text-white font-bold text-sm px-3 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,201,0,1)] z-50 whitespace-nowrap">
                Stop poking the SRE.
              </div>
            )}
          </div>
          <nav className="flex items-center gap-4 sm:gap-6 shrink-0">
            <Link to={NAV.terminal.to} onClick={(e) => transitionClick(e, NAV.terminal.to, NAV.terminal.color, NAV.terminal.label)} className={`hidden md:inline-flex hover:bg-[#FFC900] ${navLinkClass}`}>
              <Terminal className="w-4 h-4 shrink-0 group-hover:rotate-12 transition-transform" />
              CLI Resume
            </Link>
            <Link to={NAV.chat.to} onClick={(e) => transitionClick(e, NAV.chat.to, NAV.chat.color, NAV.chat.label)} className={`hidden sm:inline-flex hover:bg-[#FF90E8] ${navLinkClass}`}>
              <MessageSquare className="w-4 h-4 shrink-0 group-hover:rotate-12 transition-transform" />
              Chat
            </Link>
            <Link to={NAV.normal.to} onClick={(e) => transitionClick(e, NAV.normal.to, NAV.normal.color, NAV.normal.label)} className="font-bold text-sm sm:text-base uppercase tracking-wider bg-[#38BDF8] px-3 sm:px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all inline-flex items-center gap-2 group whitespace-nowrap">
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              Resume
            </Link>
          </nav>
        </div>
      </motion.header>

      <Marquee words={MARQUEE_WORDS} onWord={onMarqueeWord} reduceMotion={reduceMotion} />

      {/* Main content */}
      <main className="flex-1 relative pb-32">
        <section ref={heroRef} className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full min-h-[calc(100vh-140px)] flex flex-col justify-center items-center pt-8 pb-16">

          {/* Deploy zone: drop the yellow circle here */}
          <div
            ref={zoneRef}
            aria-hidden="true"
            className={`absolute top-36 sm:top-auto sm:bottom-10 right-2 sm:right-[5%] w-24 h-16 sm:w-40 sm:h-28 border-4 border-dashed flex items-center justify-center text-center font-black uppercase tracking-widest text-[9px] sm:text-xs transition-all duration-300 z-0 ${
              deployed
                ? 'border-black bg-[#7CFF6B] opacity-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : zoneHot
                  ? 'border-black bg-[#7CFF6B]/60 opacity-100 scale-105'
                  : circleDragging
                    ? 'border-black opacity-100 animate-pulse'
                    : 'border-black/30 text-black/30 opacity-60'
            }`}
          >
            {deployed ? 'Deployed ✓' : zoneHot ? 'Release to ship!' : 'Deploy zone'}
          </div>

          <Toy
            ref={circleRef}
            constraintsRef={heroRef}
            reduceMotion={reduceMotion}
            parallax={p15}
            className="top-4 sm:top-12 right-2 sm:right-[10%] w-24 h-24 sm:w-48 sm:h-48"
            bodyClassName="bg-[#FFC900] border-4 border-black rounded-full flex items-center justify-center"
            shadow={shadow}
            hoverRotate={12}
            asleep={circleAsleep}
            onHoverStart={() => wakeCircle("huh? I'm up!")}
            onDragStart={() => {
              wakeCircle("WHEEEE!");
              setCircleDragging(true);
              setCircleText("WHEEEE!");
            }}
            onDrag={onCircleDrag}
            onDragEnd={onCircleDragEnd}
            onLand={onCircleLand}
          >
            <span className="font-black text-[8px] sm:text-xs uppercase rotate-12 bg-white px-1 sm:px-2 py-0.5 sm:py-1 border-2 border-black truncate max-w-[80%] text-center">{circleText}</span>
          </Toy>

          <Toy
            ref={squareRef}
            constraintsRef={heroRef}
            reduceMotion={reduceMotion}
            parallax={p25}
            className="bottom-32 sm:bottom-40 right-4 sm:right-[20%] w-16 h-16 sm:w-32 sm:h-32"
            bodyClassName="bg-[#38BDF8] border-4 border-black"
            shadow={shadow}
            rotate={12}
            hoverRotate={45}
            onDragEnd={() => markMoved("blue_square")}
          />

          <Toy
            ref={diamondRef}
            constraintsRef={heroRef}
            reduceMotion={reduceMotion}
            parallax={p10}
            className="top-24 sm:top-40 left-4 sm:left-[10%] w-8 h-8 sm:w-12 sm:h-12"
            bodyClassName="bg-black"
            rotate={45}
            hoverRotate={90}
            onDragEnd={() => markMoved("black_diamond")}
          />

          <Toy
            ref={ringRef}
            constraintsRef={heroRef}
            reduceMotion={reduceMotion}
            parallax={p30}
            className="bottom-40 sm:bottom-60 left-8 sm:left-[5%] w-10 h-10 sm:w-16 sm:h-16"
            bodyClassName="border-[4px] sm:border-8 border-black rounded-full"
            onDragEnd={() => markMoved("ring")}
          />

          <Toy
            ref={barRef}
            constraintsRef={heroRef}
            reduceMotion={reduceMotion}
            parallax={p20}
            className="hidden sm:block top-1/2 left-[15%] w-40 h-10"
            bodyClassName="bg-[#FF90E8] border-4 border-black"
            shadow={8}
            rotate={-6}
            hoverRotate={-6}
            onDragEnd={() => markMoved("pink_bar")}
          />

          <LiveTerminal
            ref={terminalRef}
            constraintsRef={heroRef}
            shadow={shadow}
            reduceMotion={reduceMotion}
            onDeployCommand={deploy}
          />

          <AnimatePresence>
            {messy && (
              <motion.button
                type="button"
                onClick={tidyUp}
                initial={{ opacity: 0, y: -10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.8 }}
                className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 bg-white border-2 border-black px-2.5 py-1 font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFC900] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                <RotateCcw className="w-3 h-3" />
                Tidy up<span className="sm:hidden normal-case font-bold tracking-normal">(or shake)</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Hero Content */}
          <motion.div animate={heroShake} className="max-w-4xl relative z-10 mx-auto text-center w-full flex flex-col items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-block"
            >
              <div className="bg-black text-white font-black px-4 sm:px-6 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,201,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(255,201,0,1)] mb-6 sm:mb-8 uppercase tracking-widest text-xs sm:text-lg rotate-[-1deg] whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                SYSTEMS + OBSERVABILITY
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase text-black leading-[0.85] tracking-tighter flex flex-col items-center"
            >
              {showAll ? (
                <>
                  <motion.span
                    initial={reduceMotion ? false : { opacity: 0, y: -140, rotate: -8 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 600, damping: 18 }}
                    className="block w-full text-center"
                  >
                    <WiggleWord text="Backend" reduceMotion={reduceMotion} className="pointer-events-auto hover:text-[#38BDF8] focus:text-[#38BDF8] transition-colors" />
                  </motion.span>
                  <motion.span
                    initial={reduceMotion ? false : { opacity: 0, y: -160 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 600, damping: 18, delay: 0.14 }}
                    style={{ rotate: infraSway }}
                    className="inline-block bg-[#FFC900] px-2 sm:px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-2 sm:mt-4 text-[8.5vw] sm:text-7xl lg:text-8xl text-center self-center z-10 relative"
                  >
                    Infrastructure
                  </motion.span>
                  <motion.span
                    initial={reduceMotion ? false : { opacity: 0, y: -140, rotate: 8 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 600, damping: 18, delay: 0.28 }}
                    className="block mt-4 sm:mt-5 w-full text-center"
                  >
                    <WiggleWord text="Glue Work" reduceMotion={reduceMotion} className="pointer-events-auto hover:text-[#FF90E8] focus:text-[#FF90E8] transition-colors" />
                  </motion.span>
                </>
              ) : (
                <span className="text-5xl sm:text-7xl lg:text-8xl">
                  {typedText}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block w-[3px] sm:w-1 h-[0.8em] bg-black ml-1 align-middle"
                  />
                </span>
              )}
            </motion.h1>

          </motion.div>

          {/* Scroll Indicator */}
          <motion.button
            type="button"
            aria-label="Scroll to the next section"
            animate={reduceMotion ? undefined : { y: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 cursor-pointer group z-50"
            onClick={() => credibilityRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })}
          >
            <span className="font-black uppercase tracking-widest text-xs sm:text-sm bg-white px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:bg-[#FFC900] transition-colors">Keep Scrolling</span>
            <div className="bg-[#FF90E8] p-2 sm:p-3 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-full group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:translate-y-[4px] transition-all">
              <ArrowDown className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
            </div>
          </motion.button>
        </section>


        <section ref={credibilityRef} className="max-w-7xl mx-auto px-6 lg:px-12 py-20 relative z-10 w-full min-h-[80vh] flex flex-col justify-center items-center">
          <div className="max-w-4xl relative z-10 mx-auto text-center w-full">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="bg-white border-4 border-black p-6 sm:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-2xl mx-auto transform rotate-[0.5deg] mb-16 sm:mb-24 relative"
            >
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#38BDF8] border-4 border-black rounded-full" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-[#FF90E8] border-4 border-black" />

              <p className="text-xl text-black font-bold leading-relaxed text-left">
                I have strong exposure to DevOps practices, backend development, and production support for enterprise systems. I am a continuous learner, passionate about designing scalable systems, writing robust backend code, and exploring new technologies. Choose how you want to explore my experience below.
              </p>
            </motion.div>

            {/* Path Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  kind: "chat" as const,
                  ...NAV.chat,
                  title: <>Interactive<br />Terminal</>,
                  description: "Chat with an AI assistant trained on my experience, projects, and technical skills.(YES ITS DESIGNED TO BRAG ABOUT ME A LOT)",
                  cta: "Start Chat",
                  ctaClassName: "bg-white group-hover:bg-black group-hover:text-white",
                  iconBoxClassName: "bg-black text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
                },
                {
                  kind: "manual" as const,
                  ...NAV.normal,
                  title: <>Manual<br />Mode</>,
                  description: "Browse my complete professional history, skill sets, and achievements in a standard layout.",
                  cta: "View Resume",
                  ctaClassName: "bg-[#FFC900] group-hover:bg-black group-hover:text-[#FFC900]",
                  iconBoxClassName: "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                },
                {
                  kind: "cli" as const,
                  ...NAV.terminal,
                  title: <>CLI<br />Resume</>,
                  description: "Type commands, inspect portfolio services, download the resume, and explore experience like a shell.",
                  cta: "Run Commands",
                  ctaClassName: "bg-white group-hover:bg-black group-hover:text-[#FFC900]",
                  iconBoxClassName: "bg-black text-[#7CFF6B] shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
                },
              ].map((card, i) => (
                <motion.div
                  key={card.kind}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: 0.1 * (i + 1) }}
                  style={{ perspective: 900 }}
                >
                  <PathCard {...card} tilt={finePointer} reduceMotion={reduceMotion} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-4 border-black mt-auto relative z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex flex-col gap-6">
              <p className="text-2xl font-black uppercase tracking-wider text-black">Get in touch</p>
              <div className="flex gap-4 flex-wrap">
                <a href="https://github.com/dhruv2003" target="_blank" rel="noreferrer" onClick={() => trackEvent('outbound_click', { destination: 'github' })} className="font-bold bg-[#FFC900] border-2 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-black">GitHub</a>
                <a href="https://www.linkedin.com/in/dhruv-bhagatkar-1b267995" target="_blank" rel="noreferrer" onClick={() => trackEvent('outbound_click', { destination: 'linkedin' })} className="font-bold bg-[#FF90E8] border-2 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-black">LinkedIn</a>
                <a href="mailto:bhagatkardhruv2003@gmail.com" onClick={() => trackEvent('outbound_click', { destination: 'email' })} className="font-bold bg-white border-2 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-black">Email</a>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <DeployButton />
            </div>
          </div>
        </div>
      </footer>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            role="status"
            initial={{ opacity: 0, y: 40, rotate: -4, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, rotate: -1, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="fixed top-[156px] left-1/2 -translate-x-1/2 z-[90] bg-black text-white font-black uppercase tracking-wider text-sm px-4 py-3 border-4 border-black shadow-[6px_6px_0px_0px_rgba(255,201,0,1)] whitespace-nowrap"
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
