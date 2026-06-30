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
  id?: string;
  slug?: string;
  url: string;

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

  scoreMobile?: number;
  scoreDesktop?: number;

  lcp?: string;
  fcp?: string;
  cls?: string;
  tbt?: string;
  ttfb?: string;
  speedIndex?: string;

  lcpMs?: number;
  fcpMs?: number;
  clsVal?: number;
  ttfbMs?: number;
  tbtMs?: number;

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
