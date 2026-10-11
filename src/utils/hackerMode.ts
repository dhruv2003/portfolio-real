import { trackEvent } from './analytics';

export const HACKER_MODE_MS = 15000;

export type HackerModeState = {
  active: boolean;
  /** Stays on until the visitor exits */
  pinned: boolean;
  endsAt: number;
};

let state: HackerModeState = { active: false, pinned: false, endsAt: 0 };
let timer: number | undefined;
const listeners = new Set<() => void>();

const set = (next: Partial<HackerModeState>) => {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
};

const schedule = () => {
  window.clearTimeout(timer);
  timer = window.setTimeout(deactivateHackerMode, HACKER_MODE_MS);
  set({ endsAt: Date.now() + HACKER_MODE_MS });
};

export function subscribeHackerMode(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getHackerMode() {
  return state;
}

// Re-triggering while active just extends the session (the flip sensor fires repeatedly while upside down)
export function activateHackerMode() {
  if (state.active) {
    if (!state.pinned) schedule();
    return;
  }
  trackEvent('easter_egg', { egg: 'hacker_mode' });
  set({ active: true, pinned: false });
  schedule();
}

export function deactivateHackerMode() {
  window.clearTimeout(timer);
  if (state.active) set({ active: false, pinned: false });
}

export function pinHackerMode() {
  window.clearTimeout(timer);
  trackEvent('easter_egg', { egg: 'hacker_mode_pinned' });
  set({ pinned: true });
}

export function toggleHackerMode() {
  if (state.active) deactivateHackerMode();
  else activateHackerMode();
}
