import { useEffect } from 'react';
import { fireConfetti } from '../utils/confetti';
import { trackEvent } from '../utils/analytics';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export function useKonamiCode() {
  useEffect(() => {
    let buffer: string[] = [];
    let maxProgress = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      const expected = KONAMI[buffer.length];
      if (e.key === expected) {
        buffer.push(e.key);
        if (buffer.length > maxProgress) maxProgress = buffer.length;
      } else {
        if (buffer.length > 0 && buffer.length < KONAMI.length) {
          trackEvent('konami_progress', { keys: buffer.length, max_reached: maxProgress });
        }
        buffer = e.key === KONAMI[0] ? [e.key] : [];
      }
      if (buffer.length === KONAMI.length) {
        buffer = [];
        maxProgress = 0;
        fireConfetti();
        trackEvent('easter_egg', { egg: 'konami_code' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
