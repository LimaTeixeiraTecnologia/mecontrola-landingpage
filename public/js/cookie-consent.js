(() => {
  const STORAGE_KEY = 'mecontrola_consent';

  const getConsent = () => {
    try {
      const val = localStorage.getItem(STORAGE_KEY);
      return val === 'accepted' || val === 'declined' ? val : null;
    } catch {
      return null;
    }
  };

  const setConsent = (state) => {
    try {
      localStorage.setItem(STORAGE_KEY, state);
    } catch {
      /* localStorage indisponível (modo privado) — degrada sem quebrar */
    }
  };

  const loadGA = (id) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);
    script.onload = () => {
      window.dataLayer = window.dataLayer ?? [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', id, { anonymize_ip: true });
    };
  };

  const hideBanner = () => {
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.hidden = true;
  };

  const showBanner = () => {
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.hidden = false;
  };

  const init = () => {
    const consent = getConsent();

    if (consent === 'accepted') {
      hideBanner();
      const gaId = document.getElementById('cookie-banner')?.dataset.gaId;
      if (gaId) loadGA(gaId);
      return;
    }

    if (consent === 'declined') {
      hideBanner();
      return;
    }

    showBanner();

    document.getElementById('consent-accept')?.addEventListener('click', () => {
      setConsent('accepted');
      hideBanner();
      const gaId = document.getElementById('cookie-banner')?.dataset.gaId;
      if (gaId) {
        loadGA(gaId);
        window.dispatchEvent(new CustomEvent('consent-granted'));
      }
    });

    document.getElementById('consent-decline')?.addEventListener('click', () => {
      setConsent('declined');
      hideBanner();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
