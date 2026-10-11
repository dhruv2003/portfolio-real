import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Toy } from './Toy';
import { trackEvent } from '../../../utils/analytics';
import { fireConfetti } from '../../../utils/confetti';
import { startRouteTransition } from '../../../utils/routeTransition';

export type Tone = 'muted' | 'normal' | 'ok' | 'warn' | 'command';
export type LiveTerminalHandle = { push: (text: string, tone?: Tone) => void };

type Line = { id: number; text: string; tone: Tone };

const VISIBLE_LINES = 4;
const LOOP_INTERVAL = 1500;
const USER_PAUSE = 8000;

const LOOP: [string, Tone][] = [
  ['starting deployment', 'muted'],
  ['pulling image dhruv:latest', 'normal'],
  ['rolling update 1/3', 'normal'],
  ['rolling update 2/3', 'normal'],
  ['rolling update 3/3', 'normal'],
  ['✓ nodes ready', 'ok'],
  ['awaiting traffic...', 'muted'],
];

const TONE_CLASS: Record<Tone, string> = {
  muted: 'text-gray-500',
  normal: 'text-black',
  ok: 'text-green-700',
  warn: 'text-red-600',
  command: 'text-[#0284C7]',
};

type LiveTerminalProps = {
  constraintsRef: RefObject<Element | null>;
  shadow: number;
  reduceMotion?: boolean | null;
  onDeployCommand: () => void;
};

// The hero's draggable terminal: streams a fake deploy log, reacts to the page, and accepts a few commands.
export const LiveTerminal = forwardRef<LiveTerminalHandle, LiveTerminalProps>(function LiveTerminal(
  { constraintsRef, shadow, reduceMotion, onDeployCommand },
  ref
) {
  const nextId = useRef(0);
  const [lines, setLines] = useState<Line[]>(() =>
    LOOP.slice(0, VISIBLE_LINES).map(([text, tone]) => ({ id: nextId.current++, text, tone }))
  );
  const [typed, setTyped] = useState(Infinity);
  const [open, setOpen] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [restarts, setRestarts] = useState(0);
  const [input, setInput] = useState('');
  const loopIdx = useRef(VISIBLE_LINES);
  const lastUserInput = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const push = useCallback(
    (text: string, tone: Tone = 'normal') => {
      setLines((prev) => [...prev, { id: nextId.current++, text, tone }].slice(-VISIBLE_LINES));
      setTyped(reduceMotion ? Infinity : 0);
    },
    [reduceMotion]
  );

  useImperativeHandle(ref, () => ({ push }), [push]);

  // Type out the newest line
  const newest = lines[lines.length - 1];
  useEffect(() => {
    if (typed >= newest.text.length) return;
    const t = window.setTimeout(() => setTyped((n) => n + 1), 18);
    return () => window.clearTimeout(t);
  }, [typed, newest]);

  // Background deploy log, paused while the visitor is typing
  useEffect(() => {
    if (reduceMotion) return;
    const t = window.setInterval(() => {
      if (document.hidden || Date.now() - lastUserInput.current < USER_PAUSE) return;
      const [text, tone] = LOOP[loopIdx.current % LOOP.length];
      loopIdx.current += 1;
      push(text, tone);
    }, LOOP_INTERVAL);
    return () => window.clearInterval(t);
  }, [push, reduceMotion]);

  const close = () => {
    setOpen(false);
    trackEvent('terminal_window', { action: 'close' });
    window.setTimeout(() => {
      const n = restarts + 1;
      setRestarts(n);
      setMinimized(false);
      setOpen(true);
      push('↻ restarting pod...', 'muted');
      window.setTimeout(() => push(`✓ pod restarted (restarts: ${n})`, 'ok'), 700);
    }, 1600);
  };

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    lastUserInput.current = Date.now();
    push(`$ ${cmd}`, 'command');
    trackEvent('hero_terminal_command', { command: cmd.slice(0, 40) });

    const reply = (text: string, tone: Tone = 'normal', delay = 250) =>
      window.setTimeout(() => push(text, tone), delay);

    switch (cmd) {
      case 'help':
        reply('try: whoami, ls, deploy, sudo hire-dhruv', 'muted');
        reply('full shell → type "cd terminal"', 'muted', 900);
        break;
      case 'whoami':
        reply('visitor (probably a recruiter 👀)');
        break;
      case 'ls':
        reply('chat/  resume/  terminal/');
        break;
      case 'deploy':
        onDeployCommand();
        break;
      case 'sudo hire-dhruv':
      case 'sudo hire dhruv':
        fireConfetti();
        reply('✓ permission granted', 'ok');
        reply('→ bhagatkardhruv2003@gmail.com', 'normal', 800);
        break;
      case 'hire-dhruv':
      case 'hire dhruv':
        reply('permission denied. try sudo', 'warn');
        break;
      case 'clear':
        setLines([{ id: nextId.current++, text: '', tone: 'muted' }]);
        break;
      case 'exit':
        close();
        break;
      case 'cd terminal':
      case 'open terminal':
      case 'cd chat':
      case 'cd resume': {
        const target = cmd.split(' ')[1];
        const dest = {
          terminal: { to: '/terminal', color: '#FFC900', label: 'booting shell…' },
          chat: { to: '/chat', color: '#FF90E8', label: 'waking the bot…' },
          resume: { to: '/normal', color: '#38BDF8', label: 'printing resume…' },
        }[target]!;
        const rect = inputRef.current?.getBoundingClientRect();
        reply(`→ opening ${target}...`, 'ok', 0);
        window.setTimeout(
          () => startRouteTransition(dest.to, dest.color, dest.label, rect?.left ?? 0, rect?.top ?? 0),
          300
        );
        break;
      }
      default:
        reply(`command not found: ${cmd.split(' ')[0]}. try "help"`, 'warn');
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    run(input);
    setInput('');
  };

  return (
    <AnimatePresence>
      {open && (
        <Toy
          key={restarts}
          constraintsRef={constraintsRef}
          reduceMotion={reduceMotion}
          className="left-2 sm:left-[5%] bottom-28 sm:bottom-auto sm:top-[20%] w-44 sm:w-64"
          bodyClassName="bg-white border-4 border-black"
          shadow={shadow}
          rotate={-3}
          presence={{
            initial: reduceMotion ? undefined : { opacity: 0, scale: 0.6 },
            animate: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 18 } },
            exit: { opacity: 0, scale: 0.2, rotate: 25, skewX: 12, transition: { duration: 0.3, ease: 'easeIn' } },
          }}
        >
          <div className="bg-black text-white px-2 sm:px-3 py-1 sm:py-1.5 flex items-center justify-between gap-2 border-b-4 border-black">
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <button
                type="button"
                aria-label="Close terminal"
                onClick={close}
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FF5F57] border border-black hover:scale-125 transition-transform"
              />
              <button
                type="button"
                aria-label={minimized ? 'Expand terminal' : 'Minimize terminal'}
                onClick={() => setMinimized((m) => !m)}
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FFC900] border border-black hover:scale-125 transition-transform"
              />
              <button
                type="button"
                aria-label="Open the full CLI resume"
                onClick={(e) => {
                  trackEvent('terminal_window', { action: 'maximize' });
                  startRouteTransition('/terminal', '#FFC900', 'booting shell…', e.clientX, e.clientY);
                }}
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#28C840] border border-black hover:scale-125 transition-transform"
              />
            </div>
            <span className="font-black text-[8px] sm:text-[10px] tracking-widest truncate">root@cluster:~</span>
          </div>

          <motion.div
            initial={false}
            animate={{ height: minimized ? 0 : 'auto' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="overflow-hidden"
          >
            <div className="p-2 sm:p-4 font-mono text-[10px] sm:text-sm font-bold flex flex-col gap-1">
              <div aria-live="polite" className="flex flex-col gap-0.5 sm:gap-1 h-[64px] sm:h-[100px] justify-end overflow-hidden">
                {lines.map((line, i) => {
                  const isNewest = i === lines.length - 1;
                  const text = isNewest ? line.text.slice(0, typed) : line.text;
                  return (
                    <p key={line.id} className={`truncate leading-tight ${TONE_CLASS[line.tone]}`}>
                      {line.tone === 'command' || line.text === '' ? text : `❯ ${text}`}
                    </p>
                  );
                })}
              </div>
              <form onSubmit={onSubmit} className="hidden sm:flex items-center gap-1 border-t-2 border-dashed border-black pt-1 sm:pt-2 mt-1">
                <span className="text-[#38BDF8] shrink-0">$</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  // Keep global hotkeys (hacker mode, konami) from firing while typing here
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder='type "help"'
                  aria-label="Terminal command"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="w-full min-w-0 bg-transparent outline-none font-mono font-bold text-sm placeholder:text-gray-400 caret-[#FF90E8]"
                />
              </form>
            </div>
          </motion.div>
        </Toy>
      )}
    </AnimatePresence>
  );
});
