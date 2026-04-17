export const initGA = (measurementId: string | undefined) => {
  if (!measurementId || measurementId === "your-google-analytics-id-here") {
    console.warn("Google Analytics: No Measurement ID provided in .env");
    return;
  }
  
  if (document.getElementById("ga-script")) return;

  const script = document.createElement("script");
  script.id = "ga-script";
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.async = true;
  document.head.appendChild(script);

  const dataLayerScript = document.createElement("script");
  dataLayerScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(dataLayerScript);
};

export const trackPageView = (path: string) => {
  // @ts-ignore
  if (typeof window !== "undefined" && window.gtag) {
    // @ts-ignore
    window.gtag("event", "page_view", {
      page_path: path,
    });
  }
};
