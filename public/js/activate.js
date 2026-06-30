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

    const result = await fetchTokenState(backendUrl, token);
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

    if (waBtn) {
      waBtn.href = data.wa_me_url;
      waBtn.addEventListener('click', () => sendBeacon(backendUrl, token, 'whatsapp_opened'), {
        once: true,
      });
    }
    if (botNumber && data.bot_number_display) {
      botNumber.textContent = `WhatsApp do bot: ${data.bot_number_display}`;
    }

    setSubtitle('Tudo certo! Abra o WhatsApp e envie uma mensagem.');
    setView('ready');
    sendBeacon(backendUrl, token, 'page_opened');

    let remaining = 3;
    const countEl = document.getElementById('activate-countdown');
    if (countEl) countEl.textContent = String(remaining);
    const interval = setInterval(() => {
      remaining -= 1;
      if (countEl) countEl.textContent = String(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        window.location.href = data.wa_me_url;
      }
    }, 1000);
  };

  void init();
})();
