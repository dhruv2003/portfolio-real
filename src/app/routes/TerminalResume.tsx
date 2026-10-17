import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Download, Send, Terminal } from "lucide-react";
import { Link } from "react-router";
import { usePageMeta } from "../../hooks/usePageMeta";
import { trackEvent } from "../../utils/analytics";
import { startRouteTransition, transitionClick } from "../../utils/routeTransition";
import { commands } from "../terminal/commands";
import {
  complete,
  err,
  isThemeName,
  muted,
  resolve,
  suggest,
  THEMES,
  toLine,
  type Ctx,
  type Line,
  type LineInput,
  type Live,
  type LiveOptions,
  type Mode,
  type ThemeName,
} from "../terminal/engine";

type Entry = { id: number; prompt?: string; lines: Line[] };

type LiveState = { lines: Line[]; opts: LiveOptions; timers: number[]; ended: boolean; api: Live };

const TERMINAL_PROMPT = "visitor@portfolio:~$";
const THEME_KEY = "terminal_theme";
const MODIFIER_KEYS = ["Shift", "Control", "Alt", "Meta", "CapsLock"];

let nextId = 0;
const entry = (prompt: string | undefined, lines: LineInput[] = []): Entry => ({ id: nextId++, prompt, lines: lines.map(toLine) });

const readTheme = (): ThemeName => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved && isThemeName(saved) ? saved : "green";
  } catch {
    return "green";
  }
};

export function TerminalResume() {
  usePageMeta({ title: "Terminal | Dhruv Bhagatkar", path: "/terminal", noindex: true });
  const reduceMotion = useReducedMotion();
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<Entry[]>(() => [
    entry(undefined, [
      "DhruvOS terminal resume booted.",
      "Type 'help' to explore experience, skills, projects, and contact info.",
      muted("psst: there are fun commands too 👀 · ↑/↓ history · Tab completes"),
    ]),
  ]);
  const [liveLines, setLiveLines] = useState<Line[] | null>(null);
  const [mode, setModeState] = useState<Mode | null>(null);
  const [theme, setThemeState] = useState<ThemeName>(readTheme);
  const [glitching, setGlitching] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<LiveState | null>(null);
  const modeRef = useRef<Mode | null>(null);
  const themeRef = useRef(theme);
  const historyRef = useRef<string[]>([]);
  const historyIndex = useRef(0);
  const glitchTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [entries, liveLines]);

  // Stop animations and timers when leaving the page
  useEffect(
    () => () => {
      liveRef.current?.api.end({ keep: false });
      window.clearTimeout(glitchTimer.current);
    },
    [],
  );

  const pushEntry = useCallback((prompt: string | undefined, lines: LineInput[] = []) => {
    setEntries((prev) => [...prev, entry(prompt, lines)]);
  }, []);

  /** Output always belongs to the most recent prompt */
  const appendLines = useCallback((lines: LineInput[]) => {
    if (!lines.length) return;
    setEntries((prev) => {
      if (!prev.length) return [entry(undefined, lines)];
      const last = prev[prev.length - 1];
      return [...prev.slice(0, -1), { ...last, lines: [...last.lines, ...lines.map(toLine)] }];
    });
  }, []);

  const startLive = useCallback(
    (initial: LineInput[] = [], opts: LiveOptions = {}): Live => {
      liveRef.current?.api.end();
      const state = { lines: initial.map(toLine), opts, timers: [] as number[], ended: false } as LiveState;
      const api: Live = {
        set(lines) {
          if (state.ended) return;
          state.lines = lines.map(toLine);
          setLiveLines(state.lines);
        },
        push(...lines) {
          api.set([...state.lines, ...lines]);
        },
        every(ms, tick) {
          if (!state.ended) state.timers.push(window.setInterval(tick, ms));
        },
        after(ms, fn) {
          if (!state.ended) state.timers.push(window.setTimeout(fn, ms));
        },
        end({ keep = true } = {}) {
          if (state.ended) return;
          state.ended = true;
          state.timers.forEach((t) => {
            window.clearInterval(t);
            window.clearTimeout(t);
          });
          if (liveRef.current === state) {
            liveRef.current = null;
            setLiveLines(null);
          }
          if (keep) appendLines(state.lines);
        },
      };
      state.api = api;
      liveRef.current = state;
      setLiveLines(state.lines);
      return api;
    },
    [appendLines],
  );

  const interruptLive = () => {
    const state = liveRef.current;
    if (!state) return;
    const extra = state.opts.onInterrupt?.() ?? ["^C"];
    state.api.end();
    appendLines(extra);
  };

  const setMode = (next: Mode | null) => {
    modeRef.current = next;
    setModeState(next);
  };

  const makeCtx = (args: string): Ctx => ({
    args,
    print: (...lines) => appendLines(lines),
    clear: () => setEntries([]),
    live: startLive,
    setMode,
    setTheme(name) {
      themeRef.current = name;
      setThemeState(name);
      try {
        localStorage.setItem(THEME_KEY, name);
      } catch {
        // Private mode: the theme just won't stick
      }
    },
    get theme() {
      return themeRef.current;
    },
    glitch(ms) {
      setGlitching(true);
      window.clearTimeout(glitchTimer.current);
      glitchTimer.current = window.setTimeout(() => setGlitching(false), ms);
    },
    goHome() {
      window.setTimeout(() => startRouteTransition("/", "#FFC900", "back to base…", window.innerWidth / 2, window.innerHeight / 2), 400);
    },
    history: historyRef.current,
  });

  const runCommand = () => {
    if (liveRef.current) return;
    const raw = input.trim();
    setInput("");
    historyIndex.current = historyRef.current.length + (raw ? 1 : 0);

    const activeMode = modeRef.current;
    if (activeMode) {
      pushEntry(`${activeMode.prompt} ${raw}`);
      activeMode.onInput(raw, makeCtx(""));
      return;
    }

    pushEntry(`${TERMINAL_PROMPT} ${raw}`);
    if (!raw) return;
    historyRef.current.push(raw);

    if (/\b(claude|codex)\b/i.test(raw)) {
      trackEvent("terminal_resume_command", { command: "ai_rival" });
      appendLines([
        err("ERROR 503: External AI detected."),
        "This terminal runs on Dhruv-powered infrastructure.",
        "Please ask about Dhruv's work instead of summoning the competition.",
      ]);
      return;
    }

    const match = resolve(commands, raw);
    if (match) {
      // Only the command name goes to analytics, never what visitors type after it
      trackEvent("terminal_resume_command", { command: match.command.name });
      match.command.run(makeCtx(match.args));
      return;
    }

    trackEvent("terminal_resume_command", { command: "unknown" });
    const guess = suggest(commands, raw);
    appendLines([err(`command not found: ${raw.split(" ")[0]}`), muted(guess ? `did you mean '${guess}'?` : "type 'help' to see what I can do")]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const key = e.key.toLowerCase();
    const ctrlC = e.ctrlKey && key === "c";

    if (liveRef.current) {
      if (ctrlC || (liveRef.current.opts.stopOnKey && !MODIFIER_KEYS.includes(e.key))) {
        e.preventDefault();
        interruptLive();
      }
      return;
    }

    if (e.key === "Enter") {
      runCommand();
      return;
    }

    if (e.ctrlKey && key === "l") {
      e.preventDefault();
      setEntries([]);
      return;
    }

    // Ctrl+C with text selected still copies
    const el = e.currentTarget;
    if (ctrlC && el.selectionStart === el.selectionEnd) {
      e.preventDefault();
      const activeMode = modeRef.current;
      pushEntry(`${activeMode?.prompt ?? TERMINAL_PROMPT} ${input}^C`);
      setInput("");
      if (activeMode?.onInterrupt) activeMode.onInterrupt(makeCtx(""));
      else if (!activeMode) appendLines([muted("nice try. prod is still up.")]);
      return;
    }

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      const history = historyRef.current;
      if (!history.length) return;
      e.preventDefault();
      const next = Math.min(Math.max(historyIndex.current + (e.key === "ArrowUp" ? -1 : 1), 0), history.length);
      historyIndex.current = next;
      setInput(history[next] ?? "");
      return;
    }

    // Empty input: let Tab move focus as usual so keyboard users aren't trapped
    if (e.key === "Tab" && input.trim() && !modeRef.current) {
      e.preventDefault();
      const matches = complete(commands, input.trimStart());
      if (matches.length === 1) setInput(matches[0] + " ");
      else if (matches.length > 1) pushEntry(`${TERMINAL_PROMPT} ${input}`, [matches.join("    ")]);
    }
  };

  const palette = THEMES[theme];
  const prompt = mode?.prompt ?? TERMINAL_PROMPT;

  const renderLine = (line: Line, key: number) => (
    <p
      key={key}
      style={{ color: palette[line.tone ?? "out"] }}
      className={line.pre ? "leading-snug whitespace-pre overflow-x-auto" : "leading-relaxed whitespace-pre-wrap break-words"}
    >
      {line.text || " "}
    </p>
  );

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#FFFDF9] text-black font-sans selection:bg-[#FFC900] selection:text-black flex flex-col">
      <header className="shrink-0 z-50 bg-white border-b-4 border-black px-3 sm:px-6 lg:px-8 py-3 flex justify-between items-center gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link to="/" aria-label="Back to home" onClick={(e) => transitionClick(e, "/", "#FFC900", "back to base…")} className="shrink-0 bg-white border-2 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-black text-xs sm:text-lg uppercase tracking-widest bg-[#FFC900] px-2.5 sm:px-3 py-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] truncate">
            Terminal Resume //
          </h1>
          <div className="hidden md:inline-flex items-center gap-2 bg-black text-white border-2 border-black px-3 py-1 font-black uppercase tracking-widest text-xs">
            <Terminal className="w-3.5 h-3.5" /> Theatre mode
          </div>
        </div>
        <a href="/Dhruv_Bhagatkar_Resume.pdf" download onClick={() => trackEvent("resume_download", { source: "terminal_resume" })} className="shrink-0 inline-flex items-center gap-2 font-black uppercase bg-[#38BDF8] px-3 sm:px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-sm">
          <Download className="w-4 h-4" /> <span className="hidden sm:inline">Resume</span>
        </a>
      </header>

      <main className="flex-1 min-h-0 w-full px-2 sm:px-4 lg:px-6 py-2 sm:py-3 flex flex-col">
        <motion.section
          animate={glitching && !reduceMotion ? { x: [0, -8, 7, -5, 4, 0] } : { x: 0 }}
          transition={glitching ? { duration: 0.25, repeat: Infinity } : { duration: 0 }}
          style={{
            backgroundColor: palette.bg,
            color: palette.fg,
            filter: glitching ? "hue-rotate(140deg) saturate(2) contrast(1.4)" : undefined,
          }}
          className="relative flex-1 min-h-0 h-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,201,0,1)] overflow-hidden flex flex-col"
        >
          <div className="shrink-0 bg-[#FFC900] text-black border-b-4 border-black px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-black uppercase tracking-widest">dhruv-os</span>
              <span className="hidden sm:inline font-mono text-xs font-bold truncate">
                type help · neofetch · git log · incident · tail -f
              </span>
            </div>
            <div aria-hidden="true" className="flex gap-2 shrink-0">
              <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#FF90E8] border-2 border-black" />
              <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#38BDF8] border-2 border-black" />
              <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white border-2 border-black" />
            </div>
          </div>
          <div className="flex-1 min-h-0 p-3 sm:p-5 lg:p-6 font-mono text-sm sm:text-base overflow-y-auto" onClick={() => inputRef.current?.focus()}>
            <div role="log" aria-live="polite" aria-relevant="additions text">
              {entries.map((item) => (
                <div key={item.id} className="mb-4">
                  {item.prompt !== undefined && (
                    <p className="break-words" style={{ color: palette.prompt }}>
                      {item.prompt}
                    </p>
                  )}
                  {item.lines.map(renderLine)}
                </div>
              ))}
            </div>
            {/* Animations repaint many times a second; screen readers get the final result once it lands in the log */}
            {liveLines && (
              <div aria-hidden="true" className="mb-4 overflow-hidden">
                {liveLines.map(renderLine)}
              </div>
            )}
            <div className="flex items-center gap-2" style={{ opacity: liveLines ? 0.4 : 1 }}>
              <span className="shrink-0" style={{ color: palette.prompt }}>
                {prompt}
              </span>
              <input
                ref={inputRef}
                value={input}
                readOnly={!!liveLines}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                autoFocus
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                className="bg-transparent outline-none flex-1 min-w-0"
                style={{ color: palette.fg, caretColor: palette.fg }}
                aria-label="Terminal command"
              />
              <button
                onClick={() => (liveRef.current ? interruptLive() : runCommand())}
                aria-label="Run terminal command"
                className="sm:hidden bg-[#FFC900] text-black border-2 border-black p-1"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div ref={bottomRef} />
          </div>
        </motion.section>
      </main>
    </div>
  );
}
