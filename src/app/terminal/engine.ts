// Shared types and helpers for the /terminal shell.

export type Tone = "out" | "muted" | "accent" | "ok" | "warn" | "err";

export type Line = {
  text: string;
  tone?: Tone;
  /** Preformatted block (ASCII art, tables): keeps spacing, scrolls sideways instead of wrapping */
  pre?: boolean;
};

export type LineInput = string | Line;

export const toLine = (line: LineInput): Line => (typeof line === "string" ? { text: line } : line);

export const pre = (text: string, tone?: Tone): Line => ({ text, tone, pre: true });
export const muted = (text: string): Line => ({ text, tone: "muted" });
export const accent = (text: string): Line => ({ text, tone: "accent" });
export const ok = (text: string): Line => ({ text, tone: "ok" });
export const warn = (text: string): Line => ({ text, tone: "warn" });
export const err = (text: string): Line => ({ text, tone: "err" });

/** A block of output that keeps changing (animations, streaming logs) until it ends */
export type Live = {
  set(lines: LineInput[]): void;
  push(...lines: LineInput[]): void;
  /** Runs `tick` every `ms` until the live block ends */
  every(ms: number, tick: () => void): void;
  after(ms: number, fn: () => void): void;
  /** Stops timers and moves the block into history (or drops it with keep: false) */
  end(opts?: { keep?: boolean }): void;
};

export type LiveOptions = {
  /** Any keypress stops it (tail -f); otherwise only Ctrl+C does */
  stopOnKey?: boolean;
  /** Lines added when the visitor interrupts it */
  onInterrupt?: () => LineInput[];
};

/** Takes over the prompt until it hands control back (vim, the incident game) */
export type Mode = {
  prompt: string;
  onInput(raw: string, ctx: Ctx): void;
  onInterrupt?(ctx: Ctx): void;
};

export type ThemeName = "green" | "amber" | "dracula" | "paper";

export type Ctx = {
  /** Text after the command name, as typed */
  args: string;
  print(...lines: LineInput[]): void;
  clear(): void;
  live(initial?: LineInput[], opts?: LiveOptions): Live;
  setMode(mode: Mode | null): void;
  setTheme(name: ThemeName): void;
  theme: ThemeName;
  glitch(ms: number): void;
  goHome(): void;
  history: readonly string[];
};

export type Command = {
  /** Canonical name; may contain spaces ("git log") */
  name: string;
  aliases?: string[];
  /** Shown in help when set */
  summary?: string;
  group?: "core" | "fun";
  run(ctx: Ctx): void;
};

export type Theme = { bg: string; fg: string; prompt: string } & Record<Tone, string>;

export const THEMES: Record<ThemeName, Theme> = {
  green: { bg: "#000000", fg: "#7CFF6B", prompt: "#38BDF8", out: "#7CFF6B", muted: "#8B8B8B", accent: "#FFC900", ok: "#7CFF6B", warn: "#FFC900", err: "#FF5F57" },
  amber: { bg: "#0D0A00", fg: "#FFB000", prompt: "#FFD580", out: "#FFB000", muted: "#9A7A3A", accent: "#FFE7B3", ok: "#FFB000", warn: "#FFD580", err: "#FF6B3D" },
  dracula: { bg: "#282A36", fg: "#F8F8F2", prompt: "#8BE9FD", out: "#F8F8F2", muted: "#6272A4", accent: "#FF79C6", ok: "#50FA7B", warn: "#F1FA8C", err: "#FF5555" },
  paper: { bg: "#FFFDF9", fg: "#111111", prompt: "#0369A1", out: "#111111", muted: "#6B7280", accent: "#B45309", ok: "#15803D", warn: "#B45309", err: "#B91C1C" },
};

export const isThemeName = (name: string): name is ThemeName => name in THEMES;

/** Finds the command whose name (or alias) is the longest prefix of the input */
export function resolve(commands: Command[], input: string): { command: Command; args: string } | null {
  const normalized = input.trim().replace(/\s+/g, " ");
  const lower = normalized.toLowerCase();
  let best: { command: Command; key: string } | null = null;
  for (const command of commands) {
    for (const key of [command.name, ...(command.aliases ?? [])]) {
      if ((lower === key || lower.startsWith(key + " ")) && (!best || key.length > best.key.length)) {
        best = { command, key };
      }
    }
  }
  return best && { command: best.command, args: normalized.slice(best.key.length).trim() };
}

function levenshtein(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

/** "skils" -> "skills"; only suggests commands listed in help so hidden ones stay hidden */
export function suggest(commands: Command[], input: string): string | null {
  const lower = input.trim().toLowerCase();
  let best: { name: string; distance: number } | null = null;
  for (const { name, summary } of commands) {
    if (!summary) continue;
    const distance = Math.min(levenshtein(lower, name), levenshtein(lower.split(" ")[0], name.split(" ")[0]));
    if (distance <= 2 && (!best || distance < best.distance)) best = { name, distance };
  }
  return best?.name ?? null;
}

/** Tab completion over help-listed commands */
export function complete(commands: Command[], input: string): string[] {
  const lower = input.toLowerCase();
  if (!lower) return [];
  return commands.filter((c) => c.summary && c.name.startsWith(lower)).map((c) => c.name);
}
