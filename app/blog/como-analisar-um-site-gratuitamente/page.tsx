import type { Metadata } from "next";
import BlogLayout from "@/app/components/blog/BlogLayout";

export const metadata: Metadata = {
  title: "Como Analisar um Site Gratuitamente em 2026 | Raio-X de Conversão",
  description:
    "Aprenda como analisar um site gratuitamente e identificar problemas de conversão, UX, velocidade, confiança e SEO que podem estar fazendo você perder clientes.",
  alternates: {
    canonical:
      "https://raiox.ascendaweb.com/blog/como-analisar-um-site-gratuitamente",
  },
  openGraph: {
    title: "Como Analisar um Site Gratuitamente em 2026",
    description:
      "Veja como avaliar conversão, UX, velocidade, confiança e SEO de um site.",
    url: "https://raiox.ascendaweb.com/blog/como-analisar-um-site-gratuitamente",
    type: "article",
  },
};

const sidebarItems = [
  { label: "Por que analisar um site?", href: "#por-que-analisar" },
  { label: "O que avaliar?", href: "#o-que-avaliar" },
  { label: "Sinais de perda de clientes", href: "#sinais" },
  { label: "Ferramenta gratuita", href: "#ferramenta" },
  { label: "Perguntas frequentes", href: "#faq" },
];

const faqs = [
  {
    question: "Como analisar um site gratuitamente?",
    answer:
      "Você pode analisar um site gratuitamente avaliando velocidade, UX, clareza da oferta, elementos de confiança, chamadas para ação, SEO técnico e compatibilidade mobile.",
  },
  {
    question: "O que é uma análise de conversão?",
    answer:
      "É uma avaliação dos fatores que influenciam a capacidade de um site transformar visitantes em contatos, leads ou clientes.",
  },
  {
    question: "Por que meu site recebe visitas mas não gera clientes?",
    answer:
      "Isso pode acontecer por falta de clareza na oferta, baixa confiança, problemas de carregamento, experiência ruim no mobile ou chamadas para ação pouco visíveis.",
  },
];

export default function Page() {
  return (
    <BlogLayout
      title="Como Analisar um Site Gratuitamente em 2026"
      description="Aprenda como analisar um site gratuitamente e descobrir problemas de conversão, UX, velocidade, confiança e SEO que podem estar fazendo você perder clientes."
      readingTime="8 min de leitura"
      sidebarItems={sidebarItems}
      faqs={faqs}
    >
      <h2 id="por-que-analisar">Por que analisar um site?</h2>

      <p>
        Analisar um site é importante porque nem todo problema de resultado está
        no tráfego. Muitas empresas recebem visitantes, mas perdem oportunidades
        por falhas na experiência, na mensagem ou na estrutura da página.
      </p>

      <p>
        Antes de investir mais em anúncios, SEO ou redes sociais, vale entender
        se o site está preparado para transformar visitantes em clientes.
      </p>

      <h2 id="o-que-avaliar">O que avaliar em uma análise de site?</h2>

      <p>
        Uma análise completa deve observar os principais pontos que influenciam a
        decisão do usuário.
      </p>

      <ul>
        <li>Velocidade de carregamento</li>
        <li>Experiência do usuário no desktop e no mobile</li>
        <li>Clareza da proposta de valor</li>
        <li>Elementos de confiança</li>
        <li>Chamadas para ação</li>
        <li>SEO técnico</li>
        <li>Estrutura do conteúdo</li>
        <li>Facilidade para entrar em contato</li>
      </ul>

      <h2 id="sinais">Como saber se meu site está perdendo clientes?</h2>

      <p>
        Alguns sinais mostram que o site pode estar afastando visitantes antes
        que eles entrem em contato.
      </p>

      <ul>
        <li>Muitas visitas e poucos leads</li>
        <li>Poucos cliques nos botões principais</li>
        <li>Usuários abandonando a página rapidamente</li>
        <li>Oferta pouco clara logo no início da página</li>
        <li>Formulários longos ou confusos</li>
        <li>Falta de provas, depoimentos ou sinais de confiança</li>
      </ul>

      <h2 id="ferramenta">Ferramenta gratuita para analisar um site</h2>

      <p>
        O Raio-X de Conversão foi criado para ajudar empresas, profissionais e
        prestadores de serviço a identificarem gargalos de conversão de forma
        rápida.
      </p>

      <p>
        A ferramenta avalia fatores como clareza, confiança, experiência do
        usuário, visibilidade e performance para indicar possíveis pontos de
        melhoria.
      </p>
    </BlogLayout>
  );
}