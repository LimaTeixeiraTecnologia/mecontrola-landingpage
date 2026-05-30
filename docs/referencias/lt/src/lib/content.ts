export type IconName =
  | 'ai'
  | 'ux'
  | 'web'
  | 'app'
  | 'governance'
  | 'integration'
  | 'security'
  | 'performance'
  | 'support'
  | 'scale'
  | 'innovation'
  | 'arrow-right'
  | 'check'
  | 'health'
  | 'education'
  | 'logistics'
  | 'operations'
  | 'finance'
  | 'industry'
  | 'digital'
  | 'government'
  | 'strategy'
  | 'architecture'
  | 'development'
  | 'evolution'
  | 'reduce'
  | 'gain'
  | 'modernize'
  | 'integrate'
  | 'experience'
  | 'automate';

export type ServiceItem = {
  readonly icon: IconName;
  readonly title: string;
  readonly description: string;
};

export type MethodologyStep = {
  readonly number: string;
  readonly title: string;
  readonly description: string;
};

export type Segment = {
  readonly icon: IconName;
  readonly name: string;
};

export type Differential = {
  readonly icon: IconName;
  readonly title: string;
  readonly description: string;
};

export type ResultItem = {
  readonly icon: IconName;
  readonly title: string;
  readonly description: string;
};

export type ContentArticle = {
  readonly slug: string;
  readonly index: string;
  readonly category: string;
  readonly title: string;
  readonly subtitle: string;
  readonly paragraphs: readonly string[];
  readonly highlight: string;
  readonly applications: readonly string[];
  readonly conclusion: string;
  readonly sources: readonly string[];
};

export const hero = {
  title: 'Inteligência tecnológica para grandes operações.',
  subtitle:
    'Desenvolvemos soluções digitais inteligentes para governos e grandes empresas alcançarem mais eficiência, segurança e resultados.',
  ctaPrimary: 'Conhecer soluções',
  ctaSecondary: 'Falar com um especialista',
} as const;

export const credibility = {
  title: 'Tecnologia estratégica para operações complexas.',
  description:
    'A Lima Teixeira Consulting desenvolve soluções digitais inteligentes para modernizar operações, automatizar processos e impulsionar resultados em organizações públicas e privadas.',
} as const;

export const services = [
  {
    icon: 'ai',
    title: 'IA & Automação',
    description:
      'Aplicamos inteligência artificial e automação para reduzir processos manuais e aumentar a eficiência operacional.',
  },
  {
    icon: 'ux',
    title: 'UX Estratégico',
    description:
      'Projetamos experiências modernas e eficientes centradas no usuário, aumentando adoção e satisfação.',
  },
  {
    icon: 'web',
    title: 'Desenvolvimento Web',
    description:
      'Construímos plataformas web robustas, escaláveis e de alta performance para operações críticas.',
  },
  {
    icon: 'app',
    title: 'Aplicativos Corporativos',
    description:
      'Desenvolvemos aplicativos corporativos customizados integrados aos sistemas existentes.',
  },
  {
    icon: 'governance',
    title: 'Governança Digital',
    description:
      'Implementamos estruturas sólidas de governança digital para operações públicas e privadas.',
  },
  {
    icon: 'integration',
    title: 'Integrações Inteligentes',
    description: 'Conectamos sistemas legados e modernos com integrações inteligentes e seguras.',
  },
] as const satisfies readonly ServiceItem[];

export type Service = (typeof services)[number];

export const methodology = [
  {
    number: '01',
    title: 'Estratégia',
    description: 'Entendimento profundo da operação e objetivos do cliente.',
  },
  {
    number: '02',
    title: 'Arquitetura',
    description: 'Definição tecnológica orientada à escalabilidade.',
  },
  {
    number: '03',
    title: 'Desenvolvimento',
    description: 'Execução moderna com foco em eficiência e experiência.',
  },
  {
    number: '04',
    title: 'Evolução Contínua',
    description: 'Monitoramento, inovação e melhoria contínua.',
  },
] as const satisfies readonly MethodologyStep[];

export type Methodology = (typeof methodology)[number];

export const segments = [
  { icon: 'government', name: 'Governos e Prefeituras' },
  { icon: 'health', name: 'Saúde' },
  { icon: 'education', name: 'Educação' },
  { icon: 'logistics', name: 'Logística' },
  { icon: 'operations', name: 'Operações Corporativas' },
  { icon: 'finance', name: 'Serviços Financeiros' },
  { icon: 'industry', name: 'Indústria' },
  { icon: 'digital', name: 'Empresas em transformação digital' },
] as const satisfies readonly Segment[];

export type SegmentItem = (typeof segments)[number];

export const differentials = [
  {
    icon: 'ai',
    title: 'Inteligência aplicada',
    description: 'Tecnologia orientada a resultados reais.',
  },
  {
    icon: 'ux',
    title: 'UX estratégico',
    description: 'Experiências modernas e eficientes.',
  },
  {
    icon: 'scale',
    title: 'Escalabilidade',
    description: 'Projetos preparados para crescimento.',
  },
  {
    icon: 'security',
    title: 'Segurança e governança',
    description: 'Estrutura sólida para operações críticas.',
  },
  {
    icon: 'innovation',
    title: 'Inovação contínua',
    description: 'IA, automação e tendências aplicadas ao negócio.',
  },
] as const satisfies readonly Differential[];

export type DifferentialItem = (typeof differentials)[number];

export const results = [
  {
    icon: 'reduce',
    title: 'Redução de processos manuais',
    description: 'Automatizamos tarefas repetitivas para liberar capacidade operacional.',
  },
  {
    icon: 'gain',
    title: 'Ganho operacional',
    description: 'Aumento mensurável de produtividade em cada projeto entregue.',
  },
  {
    icon: 'modernize',
    title: 'Modernização digital',
    description: 'Sistemas legados transformados em plataformas modernas e ágeis.',
  },
  {
    icon: 'integrate',
    title: 'Integração de sistemas',
    description: 'Ecossistemas tecnológicos unificados e comunicando em tempo real.',
  },
  {
    icon: 'experience',
    title: 'Melhoria de experiência do usuário',
    description: 'Interfaces redesenhadas para máxima adoção e satisfação.',
  },
  {
    icon: 'automate',
    title: 'Automação inteligente',
    description: 'Processos críticos automatizados com IA e integração avançada.',
  },
] as const satisfies readonly ResultItem[];

export type Result = (typeof results)[number];

export const institutional = {
  mission: 'Desenvolver soluções digitais inteligentes com excelência.',
  vision: 'Ser referência nacional em transformação digital.',
  values: ['Inovação', 'Comprometimento', 'Transparência', 'Eficiência', 'Evolução contínua'],
} as const;

export const contentArticles = [
  {
    slug: 'ia-governos',
    index: '01',
    category: 'Setor público',
    title: 'IA aplicada a governos',
    subtitle:
      'Como a inteligência artificial está transformando a gestão pública e os serviços ao cidadão',
    paragraphs: [
      'A transformação digital no setor público deixou de ser tendência e passou a ser necessidade estratégica. Governos que adotam inteligência artificial conseguem reduzir burocracias, otimizar processos internos e oferecer serviços mais eficientes à população.',
      'A IA aplicada à gestão pública permite automação de atendimentos, análise de grandes volumes de dados, identificação de fraudes, otimização de recursos públicos e tomada de decisão baseada em dados.',
      'Organizações que adotam IA de forma estruturada apresentam ganhos significativos em produtividade e capacidade analítica. Isso significa menos filas, processos mais rápidos e maior transparência.',
    ],
    highlight:
      'Governos que adotam inteligência artificial conseguem reduzir burocracias, otimizar processos internos e oferecer serviços mais eficientes à população.',
    applications: [
      'Automação de atendimentos',
      'Análise de grandes volumes de dados',
      'Identificação de fraudes',
      'Otimização de recursos públicos',
      'Tomada de decisão baseada em dados',
    ],
    conclusion: 'Isso significa menos filas, processos mais rápidos e maior transparência.',
    sources: ['IBM Government AI', 'McKinsey Global Institute'],
  },
  {
    slug: 'ux-publica',
    index: '02',
    category: 'Design estratégico',
    title: 'UX em operações públicas',
    subtitle: 'Boas práticas de experiência do usuário em portais e sistemas governamentais',
    paragraphs: [
      'Experiência do usuário não é apenas estética. Em operações públicas, UX significa acessibilidade, clareza e eficiência para milhões de pessoas.',
      'Sistemas confusos geram aumento de chamados, retrabalho e baixa adesão digital.',
      'Um UX estratégico pode reduzir abandono de serviços, simplificar processos e ampliar inclusão digital.',
    ],
    highlight:
      'Em operações públicas, UX significa acessibilidade, clareza e eficiência para milhões de pessoas.',
    applications: [
      'Reduzir abandono de serviços',
      'Simplificar processos',
      'Ampliar inclusão digital',
    ],
    conclusion:
      'Um UX estratégico pode reduzir abandono de serviços, simplificar processos e ampliar inclusão digital.',
    sources: ['Nielsen Norman Group', 'Gov.br Design System'],
  },
  {
    slug: 'transformacao-digital',
    index: '03',
    category: 'Estratégia enterprise',
    title: 'Transformação digital',
    subtitle: 'Estratégias de modernização digital em grandes organizações',
    paragraphs: [
      'Transformação digital significa redesenhar operações com foco em eficiência, integração e inteligência estratégica.',
      'Grandes organizações enfrentam desafios como sistemas legados, baixa integração e excesso de processos manuais.',
      'Os pilares da transformação digital moderna incluem automação inteligente, integração de dados, cloud computing, UX estratégico e governança tecnológica.',
    ],
    highlight:
      'Transformação digital significa redesenhar operações com foco em eficiência, integração e inteligência estratégica.',
    applications: [
      'Automação inteligente',
      'Integração de dados',
      'Cloud computing',
      'UX estratégico',
      'Governança tecnológica',
    ],
    conclusion:
      'Os pilares da transformação digital moderna incluem automação inteligente, integração de dados, cloud computing, UX estratégico e governança tecnológica.',
    sources: ['Deloitte Digital Insights'],
  },
  {
    slug: 'automacao-corporativa',
    index: '04',
    category: 'Operações',
    title: 'Automação corporativa',
    subtitle: 'Como automatizar processos complexos e ganhar eficiência em larga escala',
    paragraphs: [
      'Processos manuais reduzem produtividade, aumentam erros e dificultam escalabilidade operacional.',
      'A automação corporativa permite reduzir retrabalho, acelerar operações e melhorar indicadores operacionais.',
      'Automação moderna conecta pessoas, dados, sistemas e decisões.',
    ],
    highlight:
      'A automação corporativa permite reduzir retrabalho, acelerar operações e melhorar indicadores operacionais.',
    applications: [
      'Reduzir retrabalho',
      'Acelerar operações',
      'Melhorar indicadores operacionais',
      'Conectar pessoas, dados, sistemas e decisões',
    ],
    conclusion: 'Automação moderna conecta pessoas, dados, sistemas e decisões.',
    sources: ['Microsoft Power Platform Insights'],
  },
  {
    slug: 'eficiencia-operacional',
    index: '05',
    category: 'Performance',
    title: 'Eficiência operacional',
    subtitle: 'Metodologias para identificar gargalos e otimizar fluxos em operações críticas',
    paragraphs: [
      'Operações ineficientes impactam diretamente custos, produtividade e crescimento.',
      'Eficiência operacional exige visibilidade sobre fluxos, indicadores e processos críticos.',
      'A análise estratégica de processos permite identificar gargalos e aumentar produtividade.',
    ],
    highlight:
      'Eficiência operacional exige visibilidade sobre fluxos, indicadores e processos críticos.',
    applications: ['Visibilidade sobre fluxos', 'Indicadores operacionais', 'Processos críticos'],
    conclusion:
      'A análise estratégica de processos permite identificar gargalos e aumentar produtividade.',
    sources: ['PwC Digital Operations Study'],
  },
  {
    slug: 'seguranca-digital',
    index: '06',
    category: 'Governança',
    title: 'Segurança digital',
    subtitle: 'Governança, compliance e boas práticas de segurança para operações enterprise',
    paragraphs: [
      'Segurança deixou de ser apenas responsabilidade técnica e passou a ser questão estratégica.',
      'Grandes organizações precisam proteger dados sensíveis e operações críticas.',
      'Boas práticas incluem gestão de acessos, monitoramento contínuo e conformidade com LGPD.',
    ],
    highlight:
      'Segurança deixou de ser apenas responsabilidade técnica e passou a ser questão estratégica.',
    applications: ['Gestão de acessos', 'Monitoramento contínuo', 'Conformidade com LGPD'],
    conclusion:
      'Boas práticas incluem gestão de acessos, monitoramento contínuo e conformidade com LGPD.',
    sources: ['IBM Cost of a Data Breach Report'],
  },
  {
    slug: 'experiencia-cidadao',
    index: '07',
    category: 'Serviços públicos',
    title: 'Experiência do cidadão',
    subtitle: 'Design centrado no cidadão para serviços públicos digitais',
    paragraphs: [
      'Serviços digitais públicos precisam ser simples, acessíveis e eficientes.',
      'Experiências digitais ruins aumentam filas presenciais e abandono de processos.',
      'O design centrado no cidadão busca simplificar jornadas e melhorar acessibilidade.',
    ],
    highlight: 'Experiências digitais ruins aumentam filas presenciais e abandono de processos.',
    applications: ['Simplificar jornadas', 'Melhorar acessibilidade'],
    conclusion:
      'O design centrado no cidadão busca simplificar jornadas e melhorar acessibilidade.',
    sources: ['OECD Digital Government Index'],
  },
] as const satisfies readonly ContentArticle[];

export const finalCta = {
  title: 'Sua operação está preparada para o próximo nível da transformação digital?',
  button: 'Agendar conversa estratégica',
} as const;

const whatsappNumber = '+55 (11) 99999-9999';
const whatsappMessage = 'Olá, gostaria de falar com um especialista da Lima Teixeira Consulting.';

export const contact = {
  // TODO: cliente — substituir placeholder
  email: 'contato@limateixeira.com.br',
  // TODO: cliente — substituir placeholder
  whatsapp: whatsappNumber,
  whatsappUrl: `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`,
  // TODO: cliente — substituir placeholder
  linkedin: 'https://linkedin.com/company/limateixeira',
} as const;

export const footer = {
  slogan: 'Inteligência tecnológica para grandes operações.',
  email: contact.email,
  linkedin: contact.linkedin,
  // TODO: cliente — substituir placeholder
  address: 'São Paulo, SP — Brasil',
  cnpj: '52.162.759/0001-74',
  nav: [
    { label: 'Home', href: '/#hero' },
    { label: 'Soluções', href: '/#solucoes' },
    { label: 'Segmentos', href: '/#segmentos' },
    { label: 'Sobre', href: '/#institucional' },
    { label: 'Conteúdo', href: '/#conteudo' },
    { label: 'Contato', href: '/#contato' },
  ],
  legal: [
    { label: 'Política de Privacidade', href: '/politica-de-privacidade/' },
    { label: 'LGPD', href: '/lgpd/' },
  ],
} as const;
