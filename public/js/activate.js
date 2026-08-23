(() => {
  const isRecord = (v) => typeof v === 'object' && v !== null;

  const sendBeacon = (backendUrl, token, eventName) => {
    const base = backendUrl.replace(/\/+$/, '');
    const url = `${base}/api/v1/onboarding/tokens/${encodeURIComponent(token)}/opened`;
    try {
      navigator.sendBeacon(
        url,
        new Blob([JSON.stringify({ event: eventName })], { type: 'application/json' }),
      );
    } catch (_) {}
  };

  const ERROR_MESSAGES = {
    expired: 'Seu link de ativação expirou. Fale conosco pelo WhatsApp para receber um novo link.',
    pending: 'Seu pagamento ainda está sendo processado. Aguarde alguns minutos e tente novamente.',
    not_found: 'Link inválido. Verifique o link do email ou fale conosco pelo WhatsApp.',
  };

  const parseTokenState = (raw) => {
    if (!isRecord(raw)) return null;
    const ready = raw.ready_to_activate;
    if (typeof ready !== 'boolean') return null;
    const support = typeof raw.support_url === 'string' ? raw.support_url : '';
    if (ready) {
      const wa = raw.wa_me_url;
      const bot = raw.bot_number_display;
      if (typeof wa !== 'string' || typeof bot !== 'string') return null;
      return {
        ready_to_activate: true,
        wa_me_url: wa,
        bot_number_display: bot,
        support_url: support,
      };
    }
    const reason = typeof raw.reason === 'string' ? raw.reason : '';
    const waMe = typeof raw.wa_me_url === 'string' ? raw.wa_me_url : '';
    const botD = typeof raw.bot_number_display === 'string' ? raw.bot_number_display : '';
    return {
      ready_to_activate: false,
      reason,
      wa_me_url: waMe,
      bot_number_display: botD,
      support_url: support,
    };
  };

  const fetchTokenState = async (backendUrl, token) => {
    const trimmed = token.trim();
    if (trimmed.length === 0) return { ok: false };
    const base = backendUrl.replace(/\/+$/, '');
    const url = `${base}/api/v1/onboarding/tokens/${encodeURIComponent(trimmed)}/state`;
    let response;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000);
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
    } catch (err) {
      if (err && err.name === 'AbortError') return { ok: false, timeout: true };
      return { ok: false };
    } finally {
      clearTimeout(id);
    }
    if (!response.ok) return { ok: false };
    let json;
    try {
      json = await response.json();
    } catch {
      return { ok: false };
    }
    const parsed = parseTokenState(json);
    if (!parsed) return { ok: false };
    return { ok: true, data: parsed };
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

  const fetchConsentRequirements = async (backendUrl) => {
    const base = backendUrl.replace(/\/+$/, '');
    const url = `${base}/api/v1/legal/consent-requirements`;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000);
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

  const CONSENT_POST_TIMEOUT_MS = 3000;
  const CONSENT_POST_TOTAL_BUDGET_MS = 4000;

  const postConsent = async (backendUrl, token, termsVersion, privacyVersion, budgetMs) => {
    const base = backendUrl.replace(/\/+$/, '');
    const url = `${base}/api/v1/onboarding/tokens/${encodeURIComponent(token)}/consent`;
    const controller = new AbortController();
    const budget = typeof budgetMs === 'number' ? budgetMs : CONSENT_POST_TIMEOUT_MS;
    const timeoutId = setTimeout(() => controller.abort(), budget);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ terms_version: termsVersion, privacy_version: privacyVersion }),
        signal: controller.signal,
      });
      if (response.status === 204) return { ok: true };
      if (response.status === 409) return { ok: false, conflict: true };
      return { ok: false, conflict: false };
    } catch {
      return { ok: false, conflict: false };
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const registerConsentWithRetry = async (backendUrl, token, termsVersion, privacyVersion) => {
    const startedAt = Date.now();
    const first = await postConsent(
      backendUrl,
      token,
      termsVersion,
      privacyVersion,
      CONSENT_POST_TIMEOUT_MS,
    );
    if (first.ok) return first;
    const remaining = CONSENT_POST_TOTAL_BUDGET_MS - (Date.now() - startedAt);
    if (remaining <= 0) return first;
    return postConsent(
      backendUrl,
      token,
      termsVersion,
      privacyVersion,
      Math.min(CONSENT_POST_TIMEOUT_MS, remaining),
    );
  };

  const setView = (state) => {
    const loading = document.getElementById('activate-loading');
    const ready = document.getElementById('activate-ready');
    const error = document.getElementById('activate-error');
    const consumed = document.getElementById('activate-consumed');
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
  };

  const setSubtitle = (text) => {
    const el = document.getElementById('activate-subtitle');
    if (el) el.textContent = text;
  };

  const setErrorMessage = (text) => {
    const el = document.getElementById('activate-error-msg');
    if (el) el.textContent = text;
  };

  const showError = (msg, supportUrl) => {
    setSubtitle('Algo deu errado');
    setErrorMessage(msg);
    if (supportUrl) {
      const btn = document.getElementById('activate-support-btn');
      if (btn) {
        btn.href = supportUrl;
        btn.classList.remove('hidden');
      }
    }
    setView('error');
  };

  const showErrorByReason = (reason, supportUrl) => {
    const msg = ERROR_MESSAGES[reason] || 'Não foi possível validar seu acesso.';
    showError(msg, supportUrl);
  };

  let activeCountdownInterval = null;

  const setCtaDisabled = (waBtn, disabled) => {
    if (!waBtn) return;
    if (disabled) {
      waBtn.setAttribute('aria-disabled', 'true');
      waBtn.classList.add('opacity-60', 'cursor-not-allowed');
      return;
    }
    waBtn.removeAttribute('aria-disabled');
    waBtn.classList.remove('opacity-60', 'cursor-not-allowed');
  };

  const revealCountdownNote = () => {
    const note = document.getElementById('activate-countdown-note');
    if (note) note.classList.remove('hidden');
  };

  const hideCountdownNote = () => {
    const note = document.getElementById('activate-countdown-note');
    if (note) note.classList.add('hidden');
  };

  const startCountdownAndRedirect = (waMeURL) => {
    if (activeCountdownInterval !== null) return;
    revealCountdownNote();
    let remaining = 3;
    const countEl = document.getElementById('activate-countdown');
    if (countEl) countEl.textContent = String(remaining);
    activeCountdownInterval = setInterval(() => {
      remaining -= 1;
      if (countEl) countEl.textContent = String(remaining);
      if (remaining <= 0) {
        clearInterval(activeCountdownInterval);
        activeCountdownInterval = null;
        window.location.href = waMeURL;
      }
    }, 1000);
  };

  const wireConsentGate = (backendUrl, token, waBtn, consentReq, waMeURL) => {
    const consentBlock = document.getElementById('activate-consent');
    const checkbox = document.getElementById('activate-consent-checkbox');
    const consentError = document.getElementById('activate-consent-error');
    const detailEl = document.getElementById('activate-error-detail');

    if (consentBlock) {
      consentBlock.classList.remove('hidden');
      consentBlock.classList.add('flex');
    }
    hideCountdownNote();
    setCtaDisabled(waBtn, true);

    let registering = false;
    let alreadyRegistered = false;

    if (checkbox) {
      checkbox.addEventListener('change', async () => {
        if (consentError) consentError.classList.add('hidden');
        if (!checkbox.checked) {
          if (!alreadyRegistered) setCtaDisabled(waBtn, true);
          return;
        }
        if (registering || alreadyRegistered) return;
        registering = true;
        checkbox.disabled = true;

        const outcome = await registerConsentWithRetry(
          backendUrl,
          token,
          consentReq.termsVersion,
          consentReq.privacyVersion,
        );

        checkbox.disabled = false;
        registering = false;

        if (!outcome.ok && detailEl) {
          detailEl.textContent = outcome.conflict
            ? 'Não conseguimos confirmar seu aceite agora. Vamos confirmar pelo WhatsApp.'
            : 'Não conseguimos registrar seu aceite agora. Vamos confirmar pelo WhatsApp.';
          detailEl.classList.remove('hidden');
        }

        if (outcome.ok) alreadyRegistered = true;
        setCtaDisabled(waBtn, false);
        startCountdownAndRedirect(waMeURL);
      });
    }
  };

  const init = async () => {
    const card = document.getElementById('activate-card');
    if (!card) return;
    const backendUrl = card.getAttribute('data-backend-url') ?? '';
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

    const [result, consentReq] = await Promise.all([
      fetchTokenState(backendUrl, token),
      fetchConsentRequirements(backendUrl),
    ]);

    if (!result.ok) {
      if (result.timeout) {
        showError(
          'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
        );
      } else {
        showError('Não foi possível validar seu acesso.');
      }
      return;
    }

    const data = result.data;

    if (!data.ready_to_activate) {
      if (data.reason === 'consumed') {
        setSubtitle('Sua conta já está ativa!');
        const waBtn = document.getElementById('activate-consumed-wa-btn');
        if (waBtn && data.wa_me_url) {
          waBtn.href = data.wa_me_url;
          waBtn.classList.remove('hidden');
          waBtn.classList.add('inline-flex');
        }
        setView('consumed');
        return;
      }
      showErrorByReason(data.reason, data.support_url);
      return;
    }

    const waBtn = document.getElementById('activate-wa-btn');
    const botNumber = document.getElementById('activate-bot-number');

    let beaconSent = false;
    if (waBtn) {
      waBtn.href = data.wa_me_url;
      waBtn.addEventListener('click', (evt) => {
        if (waBtn.getAttribute('aria-disabled') === 'true') {
          evt.preventDefault();
          const consentError = document.getElementById('activate-consent-error');
          if (consentError) consentError.classList.remove('hidden');
          const checkbox = document.getElementById('activate-consent-checkbox');
          if (checkbox) checkbox.focus();
          return;
        }
        if (!beaconSent) {
          beaconSent = true;
          sendBeacon(backendUrl, token, 'whatsapp_opened');
        }
      });
    }
    if (botNumber && data.bot_number_display) {
      botNumber.textContent = `WhatsApp do bot: ${data.bot_number_display}`;
    }

    setSubtitle('Tudo certo! Abra o WhatsApp e envie uma mensagem.');
    setView('ready');
    sendBeacon(backendUrl, token, 'page_opened');

    if (!consentReq.consentRequired) {
      startCountdownAndRedirect(data.wa_me_url);
      return;
    }

    wireConsentGate(backendUrl, token, waBtn, consentReq, data.wa_me_url);
  };

  void init();
})();
