declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_ID_PATTERN = /^G-[A-Z0-9]+$/i;

function gtag(...args: unknown[]) {
  if (typeof window.gtag === 'function') {
    window.gtag(...args);
  }
}

export const initGA = (measurementId: string | undefined) => {
  if (!measurementId || measurementId === 'your-google-analytics-id-here') {
    if (import.meta.env.DEV) {
      console.warn('Google Analytics: No Measurement ID provided');
    }
    return;
  }

  if (!GA_ID_PATTERN.test(measurementId)) {
    if (import.meta.env.DEV) {
      console.warn('Google Analytics: Invalid Measurement ID format');
    }
    return;
  }

  if (document.getElementById('ga-script')) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtagFn(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);

  const script = document.createElement('script');
  script.id = 'ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
};

export const trackPageView = (path: string) => {
  gtag('event', 'page_view', { page_path: path });
};

export const trackEvent = (
  eventName: string,
  eventParams: Record<string, string | number | boolean> = {}
) => {
  gtag('event', eventName, eventParams);
};
