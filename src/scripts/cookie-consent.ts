// Cookie consent gating — LGPD compliance
// GA4 never loads before explicit "Accept" click
const STORAGE_KEY = 'mecontrola_consent';
type ConsentState = 'accepted' | 'declined';

function getConsent(): ConsentState | null {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === 'accepted' || val === 'declined') return val;
    return null;
  } catch {
    return null;
  }
}

function setConsent(state: ConsentState): void {
  try {
    localStorage.setItem(STORAGE_KEY, state);
  } catch {
    // localStorage unavailable (private mode) — degrade gracefully
  }
}

function loadGA(id: string): void {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  script.onload = () => {
    (window as unknown as Record<string, unknown>).dataLayer =
      (window as unknown as Record<string, unknown>).dataLayer ?? [];
    function gtag(..._args: unknown[]) {
      ((window as unknown as Record<string, unknown>).dataLayer as unknown[]).push(arguments);
    }
    gtag('js', new Date());
    gtag('config', id, { anonymize_ip: true });
  };
}

function hideBanner(): void {
  const banner = document.getElementById('cookie-banner');
  if (banner) banner.hidden = true;
}

function showBanner(): void {
  const banner = document.getElementById('cookie-banner');
  if (banner) banner.hidden = false;
}

function init(): void {
  const consent = getConsent();

  if (consent === 'accepted') {
    hideBanner();
    const gaId = (document.getElementById('cookie-banner') as HTMLElement | null)?.dataset['gaId'];
    if (gaId) loadGA(gaId);
    return;
  }

  if (consent === 'declined') {
    hideBanner();
    return;
  }

  // No consent stored — show banner
  showBanner();

  document.getElementById('consent-accept')?.addEventListener('click', () => {
    setConsent('accepted');
    hideBanner();
    const gaId = (document.getElementById('cookie-banner') as HTMLElement | null)?.dataset['gaId'];
    if (gaId) {
      loadGA(gaId);
      window.dispatchEvent(new CustomEvent('consent-granted'));
    }
  });

  document.getElementById('consent-decline')?.addEventListener('click', () => {
    setConsent('declined');
    hideBanner();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
