import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Terminal, FileText, Mail } from 'lucide-react';
import { trackEvent } from '../../utils/analytics';

const MENU_ITEMS = [
  { label: 'View Source (nice try)', icon: Terminal, action: () => window.open('https://github.com/dhruv2003', '_blank') },
  { label: 'Inspect Element (I see you)', icon: ExternalLink, action: () => {} },
  { label: 'Hire Dhruv (only valid option)', icon: FileText, action: () => window.location.href = 'mailto:bhagatkardhruv2003@gmail.com' },
  { label: 'Send Email', icon: Mail, action: () => window.location.href = 'mailto:bhagatkardhruv2003@gmail.com' },
];

export function ContextMenu() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [show, setShow] = useState(false);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    setPos({ x: e.clientX, y: e.clientY });
    setShow(true);
    trackEvent('context_menu_open');
  }, []);

  const close = useCallback(() => setShow(false), []);

  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', close);
    document.addEventListener('keydown', (e) => e.key === 'Escape' && close());
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', close);
    };
  }, [handleContextMenu, close]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.1 }}
          className="fixed z-[200] bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(255,201,0,1)] min-w-[240px]"
          style={{ left: pos.x, top: pos.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {MENU_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={() => { trackEvent('context_menu_click', { item: item.label }); item.action(); close(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left font-bold text-sm text-white hover:bg-[#FFC900] hover:text-black transition-colors border-b-2 border-black last:border-b-0"
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
