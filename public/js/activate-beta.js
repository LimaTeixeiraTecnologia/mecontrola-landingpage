(() => {
  const isRecord = (v) => typeof v === 'object' && v !== null;

  const ERROR_MESSAGES = {
    activation_token_required: 'Link inválido: token de ativação ausente.',
    activation_token_too_long: 'Link inválido.',
    invalid_activation_token: 'Link inválido ou já utilizado. Solicite um novo acesso beta.',
    invalid_request: 'Não foi possível processar sua solicitação. Tente novamente.',
    request_id_too_long: 'Não foi possível processar sua solicitação. Tente novamente.',
    activation_token_expired:
      'Seu link de ativação expirou. Fale com o suporte para receber um novo acesso.',
    paid_entitlement_conflict: 'Você já possui uma assinatura ativa no MeControla.',
    invalid_payload: 'Não foi possível processar sua solicitação. Tente novamente.',
  };

  const DEFAULT_ERROR_MESSAGE = 'Não foi possível ativar seu acesso.';
  const RATE_LIMIT_MESSAGE = 'Muitas tentativas. Aguarde um momento e tente novamente.';
  const CONNECTION_ERROR_MESSAGE =
    'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';

  const setView = (state) => {
    const loading = document.getElementById('activate-beta-loading');
    const ready = document.getElementById('activate-beta-ready');
    const error = document.getElementById('activate-beta-error');
    const consumed = document.getElementById('activate-beta-consumed');
    const consent = document.getElementById('activate-beta-consent');
    if (!loading || !ready || !error) return;
    loading.classList.toggle('hidden', state !== 'loading');
    loading.classList.toggle('flex', state === 'loading');
    ready.classList.toggle('hidden', state !== 'ready');
    ready.classList.toggle('flex', state === 'ready');
    error.classList.toggle('hidden', state !== 'error');
    error.classList.toggle('flex', state === 'error');
    if (consumed) {
      consumed.classList.toggle('hidden', state !== 'consumed');
      consumed.classList.toggle('flex', state === 'consumed');
    }
    if (consent) {
      consent.classList.toggle('hidden', state !== 'consent');
      consent.classList.toggle('flex', state === 'consent');
    }
  };

  const setSubtitle = (text) => {
    const el = document.getElementById('activate-beta-subtitle');
    if (el) el.textContent = text;
  };

  const setErrorMessage = (text) => {
    const el = document.getElementById('activate-beta-error-msg');
    if (el) el.textContent = text;
  };

  const showError = (message) => {
    setSubtitle('Algo deu errado');
    setErrorMessage(message);
    setView('error');
  };

  const buildWaMeURL = (whatsappNumber) =>
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Oi! Ativei meu acesso beta ao MeControla.')}`;

  const parseErrorCode = async (response) => {
    if (response.status === 429) return { code: 'rate_limited', message: RATE_LIMIT_MESSAGE };
    try {
      const body = await response.json();
      const code =
        body && typeof body === 'object' && body.errors && typeof body.errors === 'object'
          ? body.errors.code
          : null;
      if (code === 'invalid_transition') return { code };
      if (typeof code === 'string' && ERROR_MESSAGES[code]) {
        return { code, message: ERROR_MESSAGES[code] };
      }
    } catch {
      // resposta sem corpo JSON, usa mensagem padrao
    }
    return { code: 'unknown', message: DEFAULT_ERROR_MESSAGE };
  };

  const ACTIVATE_TIMEOUT_MS = 10000;
  const ACTIVATE_TOTAL_BUDGET_MS = 11000;

  const activate = async (backendUrl, token, consent, budgetMs) => {
    const base = backendUrl.replace(/\/+$/, '');
    const url = `${base}/api/v1/billing/beta-accesses/activate`;
    const controller = new AbortController();
    const budget = typeof budgetMs === 'number' ? budgetMs : ACTIVATE_TIMEOUT_MS;
    const timeoutId = setTimeout(() => controller.abort(), budget);
    const payload = consent ? { activation_token: token, consent } : { activation_token: token };
    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (err) {
      if (err && err.name === 'AbortError') {
        return { ok: false, code: 'timeout', message: CONNECTION_ERROR_MESSAGE };
      }
      return { ok: false, code: 'network', message: CONNECTION_ERROR_MESSAGE };
    } finally {
      clearTimeout(timeoutId);
    }
    if (!response.ok) {
      const parsed = await parseErrorCode(response);
      return { ok: false, ...parsed };
    }
    return { ok: true };
  };

  const parseConsentRequirements = (raw) => {
    if (!isRecord(raw)) return { consentRequired: false };
    const required = raw.consent_required;
    if (typeof required !== 'boolean' || !required) return { consentRequired: false };
    const terms = raw.terms_version;
    const privacy = raw.privacy_version;
    if (typeof terms !== 'string' || terms.length === 0) return { consentRequired: false };
    if (typeof privacy !== 'string' || privacy.length === 0) return { consentRequired: false };
    return { consentRequired: true, termsVersion: terms, privacyVersion: privacy };
  };

  const CONSENT_REQUIREMENTS_TIMEOUT_MS = 1200;

  const fetchConsentRequirements = async (backendUrl) => {
    const base = backendUrl.replace(/\/+$/, '');
    const url = `${base}/api/v1/legal/consent-requirements`;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), CONSENT_REQUIREMENTS_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) return { consentRequired: false };
      const json = await response.json();
      return parseConsentRequirements(json);
    } catch {
      return { consentRequired: false };
    } finally {
      clearTimeout(id);
    }
  };

  const startCountdownAndRedirect = (waMeURL) => {
    let remaining = 3;
    const countEl = document.getElementById('activate-beta-countdown');
    if (countEl) countEl.textContent = String(remaining);
    const interval = setInterval(() => {
      remaining -= 1;
      if (countEl) countEl.textContent = String(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        window.location.href = waMeURL;
      }
    }, 1000);
  };

  const TRANSIENT_ERROR_CODES = ['network', 'timeout'];

  const activateWithRetry = async (backendUrl, token, consent) => {
    const startedAt = Date.now();
    const first = await activate(backendUrl, token, consent, ACTIVATE_TIMEOUT_MS);
    if (first.ok) return first;
    if (!TRANSIENT_ERROR_CODES.includes(first.code)) return first;
    const remaining = ACTIVATE_TOTAL_BUDGET_MS - (Date.now() - startedAt);
    if (remaining <= 0) return first;
    return activate(backendUrl, token, consent, Math.min(ACTIVATE_TIMEOUT_MS, remaining));
  };

  const setSubmitDisabled = (submitBtn, disabled) => {
    if (!submitBtn) return;
    if (disabled) {
      submitBtn.setAttribute('aria-disabled', 'true');
      submitBtn.classList.add('opacity-60', 'cursor-not-allowed');
      return;
    }
    submitBtn.removeAttribute('aria-disabled');
    submitBtn.classList.remove('opacity-60', 'cursor-not-allowed');
  };

  const init = async () => {
    const card = document.getElementById('activate-beta-card');
    if (!card) return;
    const backendUrl = card.getAttribute('data-backend-url') ?? '';
    const whatsappNumber = card.getAttribute('data-whatsapp-number') ?? '';
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token || token.trim().length === 0) {
      showError('Link inválido: token ausente.');
      return;
    }
    if (backendUrl.length === 0) {
      showError('Configuração do servidor ausente.');
      return;
    }

    const trimmedToken = token.trim();

    const restoreConsentControls = () => {
      const checkbox = document.getElementById('activate-beta-consent-checkbox');
      const submitBtn = document.getElementById('activate-beta-consent-submit');
      if (checkbox) checkbox.disabled = false;
      if (submitBtn) setSubmitDisabled(submitBtn, !(checkbox && checkbox.checked));
    };

    const doActivate = async (consent) => {
      const result = await activateWithRetry(backendUrl, trimmedToken, consent);

      if (!result.ok) {
        restoreConsentControls();
        if (result.code === 'invalid_transition') {
          setSubtitle('Sua conta já está ativa!');
          const waBtn = document.getElementById('activate-beta-consumed-wa-btn');
          if (waBtn && whatsappNumber) waBtn.href = buildWaMeURL(whatsappNumber);
          setView('consumed');
          return;
        }
        showError(result.message || DEFAULT_ERROR_MESSAGE);
        return;
      }

      const waMeURL = buildWaMeURL(whatsappNumber);
      const waBtn = document.getElementById('activate-beta-wa-btn');
      if (waBtn) waBtn.href = waMeURL;

      setSubtitle('Tudo certo! Abra o WhatsApp e envie uma mensagem.');
      setView('ready');
      startCountdownAndRedirect(waMeURL);
    };

    const consentReq = await fetchConsentRequirements(backendUrl);

    if (!consentReq.consentRequired) {
      await doActivate(undefined);
      return;
    }

    setView('consent');

    const checkbox = document.getElementById('activate-beta-consent-checkbox');
    const submitBtn = document.getElementById('activate-beta-consent-submit');
    const consentError = document.getElementById('activate-beta-consent-error');

    if (checkbox && submitBtn) {
      checkbox.addEventListener('change', () => {
        if (consentError) consentError.classList.add('hidden');
        setSubmitDisabled(submitBtn, !checkbox.checked);
      });
    }

    if (submitBtn) {
      let submitting = false;
      submitBtn.addEventListener('click', async () => {
        if (submitBtn.getAttribute('aria-disabled') === 'true') {
          if (consentError) consentError.classList.remove('hidden');
          if (checkbox) checkbox.focus();
          return;
        }
        if (submitting) return;
        submitting = true;
        setSubmitDisabled(submitBtn, true);
        if (checkbox) checkbox.disabled = true;

        await doActivate({
          terms_version: consentReq.termsVersion,
          privacy_version: consentReq.privacyVersion,
        });

        submitting = false;
      });
    }
  };

  void init();
})();
