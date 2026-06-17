export type PlanId = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

export interface CheckoutResponse {
  checkout_url: string;
}

export interface InitiateCheckoutOk {
  ok: true;
  checkoutUrl: string;
}

export interface InitiateCheckoutErr {
  ok: false;
  message: string;
}

export type InitiateCheckoutResult = InitiateCheckoutOk | InitiateCheckoutErr;

export interface TokenStateReady {
  ready_to_activate: true;
  wa_me_url: string;
  bot_number_display: string;
  telegram_deep_link?: string;
}

export interface TokenStateNotReady {
  ready_to_activate: false;
  reason?: string;
}

export type TokenState = TokenStateReady | TokenStateNotReady;

export interface FetchTokenStateOk {
  ok: true;
  data: TokenState;
}

export interface FetchTokenStateErr {
  ok: false;
  status: number;
  message: string;
}

export type FetchTokenStateResult = FetchTokenStateOk | FetchTokenStateErr;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const initiateCheckout = async (
  backendUrl: string,
  planId: PlanId,
  signal?: AbortSignal,
): Promise<InitiateCheckoutResult> => {
  const base = backendUrl.replace(/\/+$/, '');
  const url = `${base}/api/v1/onboarding/checkout`;

  let response: Response;
  try {
    const init: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ plan_id: planId }),
    };
    if (signal) init.signal = signal;
    response = await fetch(url, init);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'falha de rede';
    return { ok: false, message };
  }

  if (!response.ok) {
    return { ok: false, message: `HTTP ${response.status}` };
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return { ok: false, message: 'resposta inválida' };
  }

  if (
    !isRecord(json) ||
    typeof json['checkout_url'] !== 'string' ||
    (json['checkout_url'] as string).length === 0
  ) {
    return { ok: false, message: 'formato inesperado' };
  }

  return { ok: true, checkoutUrl: json['checkout_url'] as string };
};

const parseTokenState = (raw: unknown): TokenState | null => {
  if (!isRecord(raw)) return null;
  const ready = raw['ready_to_activate'];
  if (typeof ready !== 'boolean') return null;
  if (ready) {
    const wa = raw['wa_me_url'];
    const bot = raw['bot_number_display'];
    const tg = raw['telegram_deep_link'];
    if (typeof wa !== 'string' || typeof bot !== 'string') return null;
    const result: TokenStateReady = {
      ready_to_activate: true,
      wa_me_url: wa,
      bot_number_display: bot,
    };
    if (typeof tg === 'string' && tg.length > 0) {
      result.telegram_deep_link = tg;
    }
    return result;
  }
  const reason = raw['reason'];
  const result: TokenStateNotReady = { ready_to_activate: false };
  if (typeof reason === 'string' && reason.length > 0) {
    result.reason = reason;
  }
  return result;
};

export const fetchTokenState = async (
  backendUrl: string,
  token: string,
  signal?: AbortSignal,
): Promise<FetchTokenStateResult> => {
  const trimmed = token.trim();
  if (trimmed.length === 0) {
    return { ok: false, status: 0, message: 'token vazio' };
  }
  const base = backendUrl.replace(/\/+$/, '');
  const url = `${base}/api/v1/onboarding/tokens/${encodeURIComponent(trimmed)}/state`;

  let response: Response;
  try {
    const init: RequestInit = {
      method: 'GET',
      headers: { Accept: 'application/json' },
    };
    if (signal) init.signal = signal;
    response = await fetch(url, init);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'falha de rede';
    return { ok: false, status: 0, message };
  }

  if (!response.ok) {
    return { ok: false, status: response.status, message: `HTTP ${response.status}` };
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return { ok: false, status: response.status, message: 'resposta inválida' };
  }

  const parsed = parseTokenState(json);
  if (!parsed) {
    return { ok: false, status: response.status, message: 'formato inesperado' };
  }
  return { ok: true, data: parsed };
};
