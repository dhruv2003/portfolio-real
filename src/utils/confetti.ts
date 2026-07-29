import confetti from 'canvas-confetti';

export function fireConfetti() {
  const defaults = {
    spread: 60,
    ticks: 80,
    gravity: 1.2,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#FFC900', '#FF90E8', '#38BDF8', '#000000', '#FFFFFF'],
  };

  confetti({ ...defaults, particleCount: 40, scalar: 1.2, shapes: ['square'] });

  setTimeout(() => {
    confetti({ ...defaults, particleCount: 30, scalar: 0.8, shapes: ['square'], origin: { x: 0.2 } });
  }, 150);

  setTimeout(() => {
    confetti({ ...defaults, particleCount: 30, scalar: 0.8, shapes: ['square'], origin: { x: 0.8 } });
  }, 300);
}
