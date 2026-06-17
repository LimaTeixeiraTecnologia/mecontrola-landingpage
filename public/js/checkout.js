(() => {
  const ERROR_MESSAGE = 'Não foi possível iniciar o checkout. Tente novamente em instantes.';
  const root = document.querySelector('[data-backend-url]');
  const backendUrl = root ? root.getAttribute('data-backend-url') || '' : '';

  const findFeedback = (target) => {
    const next = target.nextElementSibling;
    return next instanceof HTMLElement && next.dataset.checkoutError ? next : null;
  };

  const showError = (target) => {
    let feedback = findFeedback(target);
    if (!feedback) {
      feedback = document.createElement('p');
      feedback.dataset.checkoutError = 'true';
      feedback.setAttribute('role', 'alert');
      feedback.style.cssText =
        'margin-top:0.75rem;text-align:center;font-weight:600;font-size:0.85rem;color:#ff6b6b';
      target.insertAdjacentElement('afterend', feedback);
    }
    feedback.textContent = ERROR_MESSAGE;
  };

  const clearError = (target) => {
    const feedback = findFeedback(target);
    if (feedback) feedback.textContent = '';
  };

  document.addEventListener('click', async (e) => {
    const target = e.target instanceof Element ? e.target.closest('[data-plan-id]') : null;
    if (!target) return;

    const planId = target.getAttribute('data-plan-id');
    if (!planId) return;

    e.preventDefault();
    clearError(target);

    const originalText = target.textContent ?? '';
    target.setAttribute('aria-busy', 'true');
    target.textContent = 'Aguarde…';

    try {
      const response = await fetch(`${backendUrl}/api/v1/onboarding/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ plan_id: planId }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const checkoutUrl =
        typeof data?.checkout_url === 'string' && data.checkout_url.length > 0
          ? data.checkout_url
          : null;

      if (!checkoutUrl) throw new Error('checkout_url ausente na resposta');

      window.location.href = checkoutUrl;
    } catch {
      showError(target);
      target.removeAttribute('aria-busy');
      target.textContent = originalText;
    }
  });
})();
