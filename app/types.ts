export type Pilar = "conversao" | "clareza" | "confianca" | "visibilidade";

export type TipoSite =
  | "landing"
  | "ecommerce"
  | "servico"
  | "curso"
  | "saas"
  | "institucional"
  | "desconhecido";

export interface Achado {
  pilar: Pilar;
  ok: boolean;
  titulo: string;
  detalhe: string;
}

export interface ResultadoAnalise {
  url: string;
  tipoSite: TipoSite;

  scoreGeral: number;
  scoreConversao: number;
  scoreClareza: number;
  scoreConfianca: number;
  scoreVisibilidade: number;

  pilarMaisFraco: Pilar;
  oportunidadePrincipal: string;

  achados: Achado[];

  erroAcesso?: boolean;
}

export interface ResultadoPerformance {
  disponivel: boolean;

  // Scores gerais
  scoreMobile?: number;
  scoreDesktop?: number;

  // Métricas com nome em português
  lcp?: string;           // "Tempo para carregar o conteúdo principal"
  fcp?: string;           // "Tempo para aparecer o primeiro conteúdo"
  cls?: string;           // "Estabilidade visual da página"
  tbt?: string;           // "Tempo em que a página ficou travada"
  ttfb?: string;          // "Tempo de resposta do servidor"
  speedIndex?: string;    // "Velocidade de carregamento visual"

  // Scores desktop (quando disponível)
  lcpDesktop?: string;
  fcpDesktop?: string;
  clsDesktop?: string;

  mensagem?: string;
}

export const PILAR_LABEL: Record<Pilar, string> = {
  conversao: "Conversão",
  clareza: "Clareza da oferta",
  confianca: "Confiança",
  visibilidade: "Visibilidade",
};

export const TIPO_SITE_LABEL: Record<TipoSite, string> = {
  landing: "Landing Page / Página de Captura",
  ecommerce: "Loja Virtual",
  servico: "Prestação de Serviços",
  curso: "Curso / Infoproduto",
  saas: "Software / Plataforma",
  institucional: "Site Institucional",
  desconhecido: "Não identificado",
};
