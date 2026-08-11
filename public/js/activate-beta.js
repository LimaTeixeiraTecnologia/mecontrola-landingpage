(() => {
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

  const activate = async (backendUrl, token) => {
    const base = backendUrl.replace(/\/+$/, '');
    const url = `${base}/api/v1/billing/beta-accesses/activate`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ activation_token: token }),
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

    const result = await activate(backendUrl, token.trim());

    if (!result.ok) {
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

  void init();
})();
