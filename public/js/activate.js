(() => {
  const isRecord = (v) => typeof v === 'object' && v !== null;

  const parseTokenState = (raw) => {
    if (!isRecord(raw)) return null;
    const ready = raw.ready_to_activate;
    if (typeof ready !== 'boolean') return null;
    if (ready) {
      const wa = raw.wa_me_url;
      const bot = raw.bot_number_display;
      const tg = raw.telegram_deep_link;
      if (typeof wa !== 'string' || typeof bot !== 'string') return null;
      const result = { ready_to_activate: true, wa_me_url: wa, bot_number_display: bot };
      if (typeof tg === 'string' && tg.length > 0) result.telegram_deep_link = tg;
      return result;
    }
    return { ready_to_activate: false };
  };

  const fetchTokenState = async (backendUrl, token) => {
    const trimmed = token.trim();
    if (trimmed.length === 0) return { ok: false };
    const base = backendUrl.replace(/\/+$/, '');
    const url = `${base}/api/v1/onboarding/tokens/${encodeURIComponent(trimmed)}/state`;
    let response;
    try {
      response = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
    } catch {
      return { ok: false };
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
    if (!loading || !ready || !error) return;
    loading.classList.toggle('hidden', state !== 'loading');
    loading.classList.toggle('flex', state === 'loading');
    ready.classList.toggle('hidden', state !== 'ready');
    ready.classList.toggle('flex', state === 'ready');
    error.classList.toggle('hidden', state !== 'error');
    error.classList.toggle('flex', state === 'error');
  };

  const setSubtitle = (text) => {
    const el = document.getElementById('activate-subtitle');
    if (el) el.textContent = text;
  };

  const setErrorMessage = (text) => {
    const el = document.getElementById('activate-error-msg');
    if (el) el.textContent = text;
  };

  const showError = (msg) => {
    setSubtitle('Algo deu errado');
    setErrorMessage(msg);
    setView('error');
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
      showError('Não foi possível validar seu acesso.');
      return;
    }

    const data = result.data;
    if (!data.ready_to_activate) {
      showError('Não foi possível validar seu acesso.');
      return;
    }

    const waBtn = document.getElementById('activate-wa-btn');
    const tgBtn = document.getElementById('activate-tg-btn');
    const botNumber = document.getElementById('activate-bot-number');

    if (waBtn) waBtn.href = data.wa_me_url;
    if (botNumber && data.bot_number_display) {
      botNumber.textContent = `WhatsApp do bot: ${data.bot_number_display}`;
    }
    if (tgBtn) {
      if (data.telegram_deep_link) {
        tgBtn.href = data.telegram_deep_link;
        tgBtn.classList.remove('hidden');
      } else {
        tgBtn.classList.add('hidden');
      }
    }

    setSubtitle('Tudo certo! Escolha por onde quer começar:');
    setView('ready');
  };

  void init();
})();
