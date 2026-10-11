import type { MouseEvent } from 'react';

export type RouteTransition = {
  id: number;
  to: string;
  color: string;
  label: string;
  x: number;
  y: number;
};

let current: RouteTransition | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

export function subscribeRouteTransition(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRouteTransition() {
  return current;
}

export function startRouteTransition(to: string, color: string, label: string, x: number, y: number) {
  if (current) return;
  current = { id: Date.now(), to, color, label, x, y };
  emit();
}

export function clearRouteTransition() {
  current = null;
  emit();
}

// onClick handler for links: floods the screen with `color` from the click point, then navigates.
// Modified clicks (new tab, etc.) fall through to the browser.
export function transitionClick(e: MouseEvent<HTMLElement>, to: string, color: string, label: string) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();

  let { clientX: x, clientY: y } = e;
  if (e.detail === 0) {
    // Keyboard activation: start from the middle of the element
    const rect = e.currentTarget.getBoundingClientRect();
    x = rect.left + rect.width / 2;
    y = rect.top + rect.height / 2;
  }
  startRouteTransition(to, color, label, x, y);
}
