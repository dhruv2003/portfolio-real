import { useEffect } from 'react';
import { fireConfetti } from '../utils/confetti';
import { trackEvent } from '../utils/analytics';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export function useKonamiCode() {
  useEffect(() => {
    let buffer: string[] = [];

    const handleKeyDown = (e: KeyboardEvent) => {
      const expected = KONAMI[buffer.length];
      if (e.key === expected) {
        buffer.push(e.key);
      } else {
        buffer = e.key === KONAMI[0] ? [e.key] : [];
      }
      if (buffer.length === KONAMI.length) {
        buffer = [];
        fireConfetti();
        trackEvent('easter_egg', { egg: 'konami_code' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
