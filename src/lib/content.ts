// Conteúdo da Landing Page MeControla — transcrito literalmente do preview-landing-page-sprint-1.html

// ---------------------------------------------------------------------------
// Icon name union
// ---------------------------------------------------------------------------
export type IconName =
  | 'check'
  | 'whatsapp'
  | 'eye'
  | 'package'
  | 'trending'
  | 'heart'
  | 'plus'
  | 'close'
  | 'arrow-right'
  | 'instagram'
  | 'mascot-face';

// ---------------------------------------------------------------------------
// Shared building-block types
// ---------------------------------------------------------------------------
export interface BulletItem {
  icon: IconName;
  text: string;
}

export interface NavItem {
  label: string;
  href: string;
  trackId?: string;
}

// ---------------------------------------------------------------------------
// Section-level content types
// ---------------------------------------------------------------------------
export interface HeroContent {
  tag: string;
  headlinePre: string;
  headlineHighlight: string;
  sub: string;
  bullets: string[];
  ctaPrimary: { label: string; href: string; trackId: string };
  ctaSecondary: { label: string; href: string; trackId?: string };
}

export interface BenefitCard {
  emoji: string;
  title: string;
  body: string;
}

export interface HowItWorksStep {
  number: number;
  body: string;
}

export interface HowItWorksContent {
  heading: string;
  steps: HowItWorksStep[];
  closing: string;
}

export interface MeetMascotContent {
  image: string;
  tag: string;
  heading: string;
  headingHighlight: string;
  body: string;
  bullets: string[];
  cta: { label: string; href: string; trackId: string };
}

export interface ForWhomContent {
  heading: string;
  items: string[];
}

export interface Plan {
  id: string;
  name: string;
  priceLabel: string;
  periodLabel: string;
  equiv?: string;
  savings?: string;
  support: string;
  ctaLabel: string;
  ctaHref: string;
  planId: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  trackId: string;
  featured: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface MascotStripGoalContent {
  image: string;
  tag: string;
  heading: string;
  body: string;
}

export interface FinalCtaContent {
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  trackId?: string;
}

export interface FooterContent {
  tagline: string;
  legalLine: string;
}

export interface MobileStickyBarContent {
  copy: string;
  ctaLabel: string;
  ctaHref: string;
  trackId: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export const WHATSAPP_URL =
  'https://wa.me/5511936212870?text=Ol%C3%A1%2C%20quero%20conhecer%20o%20MeControla';
export const CHECKOUT_URL_MENSAL = 'https://pay.kiwify.com.br/ocPt7sv';
export const CHECKOUT_URL_TRIMESTRAL = 'https://pay.kiwify.com.br/Sh2upAU';
export const CHECKOUT_URL_ANUAL = 'https://pay.kiwify.com.br/HquleKA';
export const CONTACT_EMAIL = 'contato@limateixeira.com.br';
export const INSTAGRAM_URL = 'https://www.instagram.com/mecontrola/';
export const CNPJ = '52.162.759/0001-74';
export const LEGAL_NAME = 'Lima Teixeira Tecnologia LTDA';

// ---------------------------------------------------------------------------
// HEADER — <header> / .nav · data-track="cta_header_ver_planos"
// ---------------------------------------------------------------------------
export const nav: NavItem = {
  label: 'Ver planos',
  href: '#planos',
  trackId: 'cta_header_ver_planos',
};

// ---------------------------------------------------------------------------
// HERO — <section class="hero"> · data-track="cta_hero_ver_planos"
// ---------------------------------------------------------------------------
export const hero: HeroContent = {
  tag: 'Menos caos. Mais conquistas.',
  headlinePre: 'Sua vida financeira organizada, ',
  headlineHighlight: 'direto no WhatsApp.',
  sub: 'Sem planilha e sem sofrimento. O MeControla ajuda você a entender para onde seu dinheiro vai e a se organizar com mais leveza no dia a dia.',
  bullets: ['Sem app complicado', 'Sem julgamento', 'Sem precisar virar especialista em finanças'],
  ctaPrimary: {
    label: 'Ver planos',
    href: '#planos',
    trackId: 'cta_hero_ver_planos',
  },
  ctaSecondary: {
    label: 'Entender como funciona',
    href: '#como-funciona',
  },
};

// ---------------------------------------------------------------------------
// BLOCO 2 — APRESENTAÇÃO DO MASCOTE — <section class="meet"> · data-track="cta_meet_ver_planos"
// ---------------------------------------------------------------------------
export const meetMascot: MeetMascotContent = {
  image: 'brand-mascote-resumo-mes',
  tag: 'Conheça o MeControla',
  heading: 'Seu parceiro de finanças, ',
  headingHighlight: 'direto no WhatsApp.',
  body: 'Sem app pra baixar, sem planilha pra preencher e sem sermão de banco. Só uma conversa simples, do jeito que já faz parte do seu dia a dia.',
  bullets: [
    'Fala com você como gente fala',
    'Sempre online quando você precisar',
    'Te ajuda a chegar no fim do mês com mais leveza',
  ],
  cta: {
    label: 'Quero esse parceiro',
    href: '#planos',
    trackId: 'cta_meet_ver_planos',
  },
};

// ---------------------------------------------------------------------------
// BENEFÍCIOS — <section> (benefícios) · .cards
// ---------------------------------------------------------------------------
export const benefitsHeading = 'Menos aperto. Mais clareza. Mais chance de respirar no fim do mês.';

export const benefitCards: BenefitCard[] = [
  {
    emoji: '👀',
    title: 'Pare de sentir que o dinheiro some',
    body: 'Veja com mais clareza para onde sua grana está indo.',
  },
  {
    emoji: '📦',
    title: 'Organize sem complicação',
    body: 'Sem planilha, sem dashboard difícil, sem rotina impossível de manter.',
  },
  {
    emoji: '📈',
    title: 'Tenha pequenas vitórias de verdade',
    body: 'Comece a pagar contas com menos desespero e a enxergar progresso no mês.',
  },
];

// ---------------------------------------------------------------------------
// COMO FUNCIONA — <section id="como-funciona"> · .steps
// ---------------------------------------------------------------------------
export const howItWorks: HowItWorksContent = {
  heading: 'Como o MeControla funciona',
  steps: [
    { number: 1, body: 'Você escolhe seu plano' },
    { number: 2, body: 'Começa a usar pelo WhatsApp' },
    {
      number: 3,
      body: 'Recebe ajuda prática para se organizar melhor no dia a dia',
    },
  ],
  closing:
    'Sem burocracia. Sem precisar aprender finanças avançadas. Sem perder tempo com ferramenta difícil.',
};

// ---------------------------------------------------------------------------
// PARA QUEM É — <section class="para-quem"> · .quem-list
// ---------------------------------------------------------------------------
export const forWhom: ForWhomContent = {
  heading: 'O MeControla é para quem quer sair do sufoco sem complicar mais a própria vida.',
  items: [
    'Para quem vive no limite e quer organizar a vida financeira de um jeito possível',
    'Para quem já tentou app, planilha ou vídeo de finanças e não conseguiu manter',
    'Para quem quer clareza, apoio e progresso real no dia a dia',
  ],
};

// ---------------------------------------------------------------------------
// PLANOS — <section id="planos"> · .plans
// ---------------------------------------------------------------------------
export const plans: Plan[] = [
  {
    id: 'mensal',
    name: 'Mensal',
    priceLabel: 'R$ 29,90',
    periodLabel: '/mês',
    support: 'Ideal para começar com o menor compromisso.',
    ctaLabel: 'Quero o mensal',
    ctaHref: CHECKOUT_URL_MENSAL,
    planId: 'MONTHLY',
    trackId: 'plan_monthly_select',
    featured: false,
  },
  {
    id: 'trimestral',
    name: 'Trimestral',
    priceLabel: 'R$ 74,90',
    periodLabel: '/ 3 meses',
    equiv: 'Equivale a R$ 24,97/mês',
    savings: 'Economize R$ 14,80',
    support: 'Uma entrada mais leve para manter o ritmo.',
    ctaLabel: 'Quero o trimestral',
    ctaHref: CHECKOUT_URL_TRIMESTRAL,
    planId: 'QUARTERLY',
    trackId: 'plan_quarterly_select',
    featured: false,
  },
  {
    id: 'anual',
    name: 'Anual',
    priceLabel: 'R$ 239,90',
    periodLabel: '/ 12 meses',
    equiv: 'Equivale a R$ 19,99/mês',
    savings: 'Economize R$ 118,90',
    support: 'A escolha de quem quer economizar mais o ano todo.',
    ctaLabel: 'Quero economizar mais',
    ctaHref: CHECKOUT_URL_ANUAL,
    planId: 'ANNUAL',
    trackId: 'plan_yearly_select',
    featured: true,
  },
];

// ---------------------------------------------------------------------------
// FAQ — <section id="faq"> · details/summary
// ---------------------------------------------------------------------------
export const faq: FaqItem[] = [
  {
    question: 'Preciso baixar aplicativo?',
    answer: 'Não. A experiência principal acontece no WhatsApp, de um jeito simples e direto.',
  },
  {
    question: 'Qual plano vale mais a pena?',
    answer:
      'O anual tem o melhor custo-benefício. Se você quiser começar com um compromisso menor, o trimestral funciona como uma entrada mais leve.',
  },
  {
    question: 'Como eu pago?',
    answer: 'No checkout, você pode escolher a forma de pagamento disponível, como PIX ou cartão.',
  },
  {
    question: 'Isso é para quem entende de finanças?',
    answer:
      'Não. O MeControla foi pensado justamente para quem quer organizar a vida financeira sem virar especialista no assunto.',
  },
];

// ---------------------------------------------------------------------------
// FAIXA MASCOTE B — CONQUISTA REAL — <section class="mascote-strip reverse">
// ---------------------------------------------------------------------------
export const mascotStripGoal: MascotStripGoalContent = {
  image: 'brand-mascote-meta-concluida',
  tag: 'Pequenas vitórias de verdade',
  heading: 'Cada meta batida vira motivo pra continuar.',
  body: 'O celular novo, a viagem, a reserva pra emergência. O MeControla acompanha cada conquista com você e comemora junto, do jeito mais simples.',
};

// ---------------------------------------------------------------------------
// CTA FINAL — <section> · .final · data-track="cta_final_ver_planos"
// ---------------------------------------------------------------------------
export const finalCta: FinalCtaContent = {
  heading: 'Seu dinheiro não precisa continuar mandando na sua paz.',
  body: 'Comece com o plano que cabe no seu momento e veja sua vida financeira ficar mais clara, passo a passo.',
  ctaLabel: 'Ver planos e começar',
  ctaHref: '#planos',
  trackId: 'cta_final_ver_planos',
};

// ---------------------------------------------------------------------------
// FOOTER — <footer>
// ---------------------------------------------------------------------------
export const footer: FooterContent = {
  tagline: 'Menos caos. Mais conquistas.',
  legalLine: `CNPJ ${CNPJ} · ${CONTACT_EMAIL}`,
};

// ---------------------------------------------------------------------------
// BARRA FIXA MOBILE — .sticky-bar · data-track="cta_mobile_sticky_ver_planos"
// ---------------------------------------------------------------------------
export const mobileSticky: MobileStickyBarContent = {
  copy: 'Comece do jeito mais simples',
  ctaLabel: 'Ver planos',
  ctaHref: '#planos',
  trackId: 'cta_mobile_sticky_ver_planos',
};
