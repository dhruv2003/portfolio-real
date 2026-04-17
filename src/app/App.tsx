import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { initGA, trackPageView } from '../utils/analytics';

export default function App() {
  useEffect(() => {
    // Initialize Google Analytics using your exact ID
    initGA(import.meta.env.VITE_GA_MEASUREMENT_ID);
    
    // Track initial and subsequent page views automatically
    trackPageView(window.location.pathname + window.location.search);
    const unsubscribeRouter = router.subscribe((state) => {
      trackPageView(state.location.pathname + state.location.search);
    });

    const originalTitle = "Dhruv | Backend + Infrastructure";

    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.title = "Production is down! 🔥";
      } else {
        document.title = originalTitle;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      unsubscribeRouter();
    };
  }, []);

  return <RouterProvider router={router} />;
}
