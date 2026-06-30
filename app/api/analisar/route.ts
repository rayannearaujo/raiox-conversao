import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import type { Achado, Pilar, ResultadoAnalise, TipoSite } from "@/app/types";
import { getSupabase } from '@/lib/supabase'

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Utilitários gerais
// ---------------------------------------------------------------------------

function normalizarUrl(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url;
}

async function buscarHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RaioXConversaoBot/1.0; +https://ascendaweb.com.br)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

function limitarScore(score: number, teto: number): number {
  return Math.max(0, Math.min(Math.round(score), teto));
}

function calcularScorePonderado(regras: Array<{ ok: boolean; peso: number }>): number {
  const total = regras.reduce((acc, r) => acc + r.peso, 0);
  const ganho = regras.reduce((acc, r) => acc + (r.ok ? r.peso : 0), 0);
  return Math.round((ganho / total) * 100);
}

// ---------------------------------------------------------------------------
// Detecção de tipo de site (sem alterações)
// ---------------------------------------------------------------------------

function detectarTipoSite(bodyText: string): TipoSite {
  let scoreLanding = 0;
  let scoreEcommerce = 0;
  let scoreServico = 0;
  let scoreCurso = 0;
  let scoreSaas = 0;

  if (bodyText.includes("diagnóstico gratuito")) scoreLanding += 6;
  if (bodyText.includes("análise gratuita")) scoreLanding += 6;
  if (bodyText.includes("receba")) scoreLanding += 3;
  if (bodyText.includes("preencha")) scoreLanding += 3;
  if (bodyText.includes("agende")) scoreLanding += 4;
  if (bodyText.includes("agendar")) scoreLanding += 4;
  if (bodyText.includes("fale comigo")) scoreLanding += 3;
  if (bodyText.includes("entre em contato")) scoreLanding += 3;
  if (bodyText.includes("gerar relatório")) scoreLanding += 5;
  if (bodyText.includes("solicitar orçamento")) scoreLanding += 4;

  if (bodyText.includes("adicionar ao carrinho")) scoreEcommerce += 6;
  if (bodyText.includes("carrinho")) scoreEcommerce += 4;
  if (bodyText.includes("checkout")) scoreEcommerce += 4;
  if (bodyText.includes("frete")) scoreEcommerce += 3;
  if (bodyText.includes("parcelamento")) scoreEcommerce += 2;
  if (bodyText.includes("troca")) scoreEcommerce += 2;

  if (bodyText.includes("consultoria")) scoreServico += 5;
  if (bodyText.includes("diagnóstico")) scoreServico += 4;
  if (bodyText.includes("orçamento")) scoreServico += 4;
  if (bodyText.includes("projeto")) scoreServico += 3;
  if (bodyText.includes("atendimento")) scoreServico += 3;
  if (bodyText.includes("serviço")) scoreServico += 4;
  if (bodyText.includes("soluções")) scoreServico += 3;

  if (bodyText.includes("curso")) scoreCurso += 5;
  if (bodyText.includes("aulas")) scoreCurso += 4;
  if (bodyText.includes("aluno")) scoreCurso += 3;
  if (bodyText.includes("certificado")) scoreCurso += 3;
  if (bodyText.includes("mentoria")) scoreCurso += 3;
  if (bodyText.includes("inscrição")) scoreCurso += 3;

  if (bodyText.includes("dashboard")) scoreSaas += 5;
  if (bodyText.includes("teste grátis")) scoreSaas += 5;
  if (bodyText.includes("free trial")) scoreSaas += 5;
  if (bodyText.includes("assinatura")) scoreSaas += 3;
  if (bodyText.includes("plano mensal")) scoreSaas += 4;
  if (bodyText.includes("software")) scoreSaas += 3;
  if (bodyText.includes("plataforma")) scoreSaas += 3;

  const scores = [
    { tipo: "landing" as TipoSite, score: scoreLanding },
    { tipo: "ecommerce" as TipoSite, score: scoreEcommerce },
    { tipo: "servico" as TipoSite, score: scoreServico },
    { tipo: "curso" as TipoSite, score: scoreCurso },
    { tipo: "saas" as TipoSite, score: scoreSaas },
  ];

  const maior = scores.sort((a, b) => b.score - a.score)[0];
  return maior.score <= 2 ? "institucional" : maior.tipo;
}

// ---------------------------------------------------------------------------
// NOVO — Detecção de pixels e ferramentas de rastreamento
// ---------------------------------------------------------------------------

interface DeteccaoRastreamento {
  temGTM: boolean;
  temGA4: boolean;
  temMetaPixel: boolean;
  temTiktokPixel: boolean;
  temHotjar: boolean;
  temClarity: boolean;
  temAnalyticsQualquer: boolean;
  ferramentasEncontradas: string[];
  ferramentasFaltando: string[];
}

function detectarRastreamento(html: string): DeteccaoRastreamento {
  const h = html.toLowerCase();

  const temGTM        = /googletagmanager\.com\/gtm\.js|gtm-[a-z0-9]+/i.test(html);
  const temGA4        = /gtag\s*\(|googletagmanager\.com\/gtag|g-[a-z0-9]{6,}/i.test(html);
  const temMetaPixel  = /connect\.facebook\.net|fbq\s*\(|facebook\.com\/tr/i.test(html);
  const temTiktokPixel = /analytics\.tiktok\.com|ttq\s*\.|tiktok.*pixel/i.test(html);
  const temHotjar     = /hotjar\.com|hjsettings|_hjSettings/i.test(html);
  const temClarity    = /clarity\.ms|microsoft.*clarity/i.test(h);

  const temAnalyticsQualquer = temGTM || temGA4 || temMetaPixel || temTiktokPixel;

  const ferramentasEncontradas: string[] = [];
  if (temGTM)          ferramentasEncontradas.push("Google Tag Manager");
  if (temGA4)          ferramentasEncontradas.push("Google Analytics");
  if (temMetaPixel)    ferramentasEncontradas.push("Meta Pixel (Facebook/Instagram)");
  if (temTiktokPixel)  ferramentasEncontradas.push("TikTok Pixel");
  if (temHotjar)       ferramentasEncontradas.push("Hotjar");
  if (temClarity)      ferramentasEncontradas.push("Microsoft Clarity");

  const ferramentasFaltando: string[] = [];
  if (!temGTM && !temGA4)   ferramentasFaltando.push("Google Analytics");
  if (!temMetaPixel)        ferramentasFaltando.push("Meta Pixel");
  if (!temHotjar && !temClarity) ferramentasFaltando.push("ferramenta de mapa de calor (Hotjar ou Clarity)");

  return {
    temGTM,
    temGA4,
    temMetaPixel,
    temTiktokPixel,
    temHotjar,
    temClarity,
    temAnalyticsQualquer,
    ferramentasEncontradas,
    ferramentasFaltando,
  };
}

// ---------------------------------------------------------------------------
// NOVO — Open Graph / redes sociais
// ---------------------------------------------------------------------------

interface DeteccaoOpenGraph {
  temOgTitle: boolean;
  temOgDescription: boolean;
  temOgImage: boolean;
  temTwitterCard: boolean;
  ogCompleto: boolean;
}

function detectarOpenGraph($: cheerio.CheerioAPI): DeteccaoOpenGraph {
  const temOgTitle       = !!$('meta[property="og:title"]').attr("content")?.trim();
  const temOgDescription = !!$('meta[property="og:description"]').attr("content")?.trim();
  const temOgImage       = !!$('meta[property="og:image"]').attr("content")?.trim();
  const temTwitterCard   = !!$('meta[name="twitter:card"]').attr("content")?.trim();
  const ogCompleto       = temOgTitle && temOgDescription && temOgImage;

  return { temOgTitle, temOgDescription, temOgImage, temTwitterCard, ogCompleto };
}

// ---------------------------------------------------------------------------
// NOVO — Robots meta (noindex)
// ---------------------------------------------------------------------------

interface DeteccaoRobots {
  temNoindex: boolean;
  conteudo: string;
}

function detectarRobotsMeta($: cheerio.CheerioAPI): DeteccaoRobots {
  const conteudo = $('meta[name="robots"]').attr("content")?.toLowerCase() ?? "";
  return {
    temNoindex: conteudo.includes("noindex"),
    conteudo,
  };
}

// ---------------------------------------------------------------------------
// NOVO — Imagens sem texto alternativo
// ---------------------------------------------------------------------------

interface DeteccaoImagens {
  total: number;
  semAlt: number;
  percentualComAlt: number;
  tudoOk: boolean;
}

function detectarImagensSemAlt($: cheerio.CheerioAPI): DeteccaoImagens {
  let total = 0;
  let semAlt = 0;

  $("img").each((_, el) => {
    total++;
    const alt = $(el).attr("alt");
    // alt ausente ou vazio conta como problema
    if (alt === undefined || alt === null || alt.trim() === "") semAlt++;
  });

  const percentualComAlt = total > 0 ? Math.round(((total - semAlt) / total) * 100) : 100;

  return {
    total,
    semAlt,
    percentualComAlt,
    tudoOk: semAlt === 0,
  };
}

// ---------------------------------------------------------------------------
// NOVO — Schema.org / JSON-LD
// ---------------------------------------------------------------------------

interface DeteccaoSchema {
  temSchema: boolean;
  tipos: string[];
  temFaq: boolean;
  temReview: boolean;
  temProduto: boolean;
  temOrganizacao: boolean;
}

function detectarSchema($: cheerio.CheerioAPI): DeteccaoSchema {
  const tipos: string[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).html() || "");
      const items = Array.isArray(parsed) ? parsed : [parsed];
      items.forEach((item: any) => {
        if (item["@type"]) tipos.push(item["@type"]);
      });
    } catch {
      // JSON inválido — ignora
    }
  });

  return {
    temSchema:       tipos.length > 0,
    tipos,
    temFaq:          tipos.includes("FAQPage"),
    temReview:       tipos.includes("Review") || tipos.includes("AggregateRating"),
    temProduto:      tipos.includes("Product"),
    temOrganizacao:  tipos.includes("Organization"),
  };
}

// ---------------------------------------------------------------------------
// NOVO — Canonical URL
// ---------------------------------------------------------------------------

interface DeteccaoCanonical {
  temCanonical: boolean;
  url: string;
}

function detectarCanonical($: cheerio.CheerioAPI): DeteccaoCanonical {
  const url = $('link[rel="canonical"]').attr("href")?.trim() ?? "";
  return {
    temCanonical: !!url,
    url,
  };
}

// ---------------------------------------------------------------------------
// NOVO — Política de privacidade / LGPD
// ---------------------------------------------------------------------------

interface DeteccaoPrivacidade {
  temPolitica: boolean;
  temTermos: boolean;
  temCookies: boolean;
}

function detectarPrivacidade($: cheerio.CheerioAPI): DeteccaoPrivacidade {
  const textoGeral  = $.text().toLowerCase();
  const linksHref: string[] = [];
  $("a[href]").each((_, el) => { linksHref.push(($(el).attr("href") ?? "").toLowerCase()); });

  const palavrasPrivacidade = ["privacidade", "privacy", "lgpd", "dados pessoais"];
  const palavrasTermos      = ["termos de uso", "terms of use", "termos e condições", "termos de serviço"];
  const palavrasCookies     = ["cookie", "cookies"];

  const temPolitica = palavrasPrivacidade.some(
    (p) => textoGeral.includes(p) || linksHref.some((l) => l.includes(p.replace(" ", "-")))
  );
  const temTermos  = palavrasTermos.some((p) => textoGeral.includes(p));
  const temCookies = palavrasCookies.some((p) => textoGeral.includes(p));

  return { temPolitica, temTermos, temCookies };
}

// ---------------------------------------------------------------------------
// NOVO — Garantia
// ---------------------------------------------------------------------------

function detectarGarantia(bodyText: string): boolean {
  const palavras = [
    "garantia", "garantido", "devolução", "reembolso", "refund",
    "satisfação garantida", "money back", "risco zero", "sem risco",
    "7 dias", "15 dias", "30 dias",
  ];
  return palavras.some((p) => bodyText.includes(p));
}

// ---------------------------------------------------------------------------
// NOVO — FAQ
// ---------------------------------------------------------------------------

function detectarFaq($: cheerio.CheerioAPI, bodyText: string): boolean {
  const palavras = ["faq", "perguntas frequentes", "dúvidas frequentes", "perguntas e respostas"];
  const temTexto  = palavras.some((p) => bodyText.includes(p));
  const temSchema = /\"faqpage\"/i.test($.html());
  const temClasse = /class="[^"]*(?:faq|accordion|perguntas)[^"]*"/i.test($.html());
  return temTexto || temSchema || temClasse;
}

// ---------------------------------------------------------------------------
// NOVO — Logos de clientes / prova social visual
// ---------------------------------------------------------------------------

function detectarLogosClientes($: cheerio.CheerioAPI, bodyText: string): boolean {
  const palavras = ["clientes", "parceiros", "quem confia", "empresas que confiam", "nossos clientes"];
  const temTexto = palavras.some((p) => bodyText.includes(p));

  let logosEmSecao = 0;
  $("[class*='client'], [class*='partner'], [class*='brand'], [class*='logo']").each((_, el) => {
    logosEmSecao += $(el).find("img").length;
  });

  return temTexto || logosEmSecao >= 3;
}

// ---------------------------------------------------------------------------
// NOVO — Selos de confiança
// ---------------------------------------------------------------------------

function detectarSelosConfianca($: cheerio.CheerioAPI, bodyText: string): boolean {
  const palavras = [
    "ssl", "site seguro", "compra segura", "certificado", "blindado",
    "ebit", "reclame aqui", "procon", "pagamento seguro", "site blindado",
    "norton", "mcafee", "comodo", "verified", "trusted",
  ];

  const alts: string[] = [];
  $("img[alt]").each((_, el) => { alts.push($(el).attr("alt")!.toLowerCase()); });

  return palavras.some((p) => bodyText.includes(p) || alts.some((a) => a.includes(p)));
}

// ---------------------------------------------------------------------------
// Análise principal
// ---------------------------------------------------------------------------

function analisarHtml(html: string, urlFinal: string): Omit<ResultadoAnalise, "url"> {
  const $ = cheerio.load(html);
  const bodyText  = $("body").text().toLowerCase();
  const bodyHtml  = ($("body").html() || "").toLowerCase();
  const primeiraDobra = ($.html().slice(0, 6000) || "").toLowerCase();

  const tipoSite = detectarTipoSite(bodyText);
  const achados: Achado[] = [];

  // --- sinais já existentes ---
  const h1Texto = $("h1").first().text().trim();
  const h1Claro = h1Texto.length >= 15 && h1Texto.length <= 120;

  const palavrasValor = [
    "clientes", "vendas", "resultado", "solução", "benefício", "ajudamos",
    "especialista", "crescer", "cresça", "aumentar", "economize", "melhore", "transforme",
  ];
  const propostaValor = palavrasValor.some((p) => bodyText.includes(p));

  const palavrasDiferencial = [
    "anos", "garantia", "especializado", "especialista", "personalizado",
    "exclusivo", "desde", "certificado", "premium", "sob medida",
  ];
  const diferencial = palavrasDiferencial.some((p) => bodyText.includes(p));
  const temNumeros  = /\d+/.test(primeiraDobra);

  const temWhatsapp  = /wa\.me|api\.whatsapp\.com|whatsapp/i.test(bodyHtml) || bodyText.includes("whatsapp");
  const temTelefone  = /tel:|telefone|\(\d{2}\)\s?\d{4,5}-?\d{4}/i.test(bodyHtml + bodyText);
  const palavrasCta  = [
    "comprar", "agende", "agendar", "fale conosco", "fale com", "contrate",
    "solicite", "saiba mais", "peça", "orçamento", "cadastre-se", "quero", "garanta",
  ];
  const ctaEncontrado =
    palavrasCta.some((p) => primeiraDobra.includes(p)) ||
    $("button, a").toArray().some((el) => {
      const t = $(el).text().toLowerCase().trim();
      return t.length > 0 && t.length < 40 && palavrasCta.some((p) => t.includes(p));
    });

  const totalForms         = $("form").length;
  const camposPrimeiroForm = totalForms > 0
    ? $("form").first().find("input, select, textarea").length
    : 0;
  const formularioOk = totalForms === 0 || camposPrimeiroForm <= 5;

  const provaSocial        = /depoimento|avaliaç|review|cliente satisfeito|nossos clientes|quem confia/i.test(bodyText);
  const https              = urlFinal.startsWith("https://");
  const infoInstitucional  = /sobre n[oó]s|quem somos|nossa hist[oó]ria|institucional/i.test(bodyText);
  const depoimentos        = /depoimento|relatos? de clientes/i.test(bodyText);
  const contatoVisivel     = /e-?mail|@.+\.(com|com\.br|net)|endereço|whatsapp|telefone/i.test(bodyText);
  const temCanalContatoDireto = temWhatsapp || temTelefone || totalForms > 0;

  const title           = $("title").text().trim();
  const titleOk         = title.length >= 15 && title.length <= 65;
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() || "";
  const metaOk          = metaDescription.length >= 50 && metaDescription.length <= 170;
  const h1Count         = $("h1").length;
  const h1Ok            = h1Count === 1;
  const viewport        = $('meta[name="viewport"]').attr("content");
  const viewportOk      = Boolean(viewport && viewport.includes("width"));

  // --- sinais NOVOS ---
  const rastreamento  = detectarRastreamento(html);
  const openGraph     = detectarOpenGraph($);
  const robots        = detectarRobotsMeta($);
  const imagens       = detectarImagensSemAlt($);
  const schema        = detectarSchema($);
  const canonical     = detectarCanonical($);
  const privacidade   = detectarPrivacidade($);
  const temGarantia   = detectarGarantia(bodyText);
  const temFaq        = detectarFaq($, bodyText);
  const temLogos      = detectarLogosClientes($, bodyText);
  const temSelos      = detectarSelosConfianca($, bodyText);

  // ===========================================================================
  // PILAR: CONVERSÃO
  // ===========================================================================

  achados.push(
    {
      pilar: "conversao",
      ok: ctaEncontrado,
      titulo: ctaEncontrado ? "Chamada para ação identificada" : "Próximo passo pouco claro",
      detalhe: ctaEncontrado
        ? "O site apresenta um caminho de ação para o visitante."
        : "O visitante precisa encontrar rapidamente o próximo passo para contato, compra ou solicitação.",
    },
    {
      pilar: "conversao",
      ok: temCanalContatoDireto,
      titulo: temCanalContatoDireto ? "Canal de contato disponível" : "Canal de contato pouco evidente",
      detalhe: temCanalContatoDireto
        ? "O site possui ao menos um caminho para o visitante avançar."
        : "Sem WhatsApp, telefone ou formulário, o visitante pode sair sem iniciar contato.",
    },
    {
      pilar: "conversao",
      ok: formularioOk,
      titulo: formularioOk ? "Formulário com poucos campos" : "Formulário com muitos campos",
      detalhe: formularioOk
        ? "A quantidade de campos não cria uma barreira excessiva para o visitante."
        : `O formulário tem ${camposPrimeiroForm} campos. Cada campo a mais reduz as chances de preenchimento. O ideal é até 5.`,
    },
    {
      pilar: "conversao",
      ok: provaSocial,
      titulo: provaSocial ? "Prova social presente" : "Prova social pouco evidente",
      detalhe: provaSocial
        ? "O site apresenta sinais de validação social."
        : "Depoimentos, avaliações e resultados ajudam o visitante a confiar antes de comprar ou entrar em contato.",
    },
    {
      pilar: "conversao",
      ok: temGarantia,
      titulo: temGarantia ? "Garantia identificada" : "Nenhuma garantia mencionada",
      detalhe: temGarantia
        ? "Oferecer garantia reduz o risco percebido pelo visitante e aumenta as conversões."
        : "Mencionar uma garantia — como devolução em 7 dias ou satisfação garantida — pode reduzir o medo de comprar e aumentar as conversões.",
    },
    {
      pilar: "conversao",
      ok: temFaq,
      titulo: temFaq ? "Seção de dúvidas frequentes presente" : "Sem seção de dúvidas frequentes",
      detalhe: temFaq
        ? "Responder dúvidas comuns na página reduz objeções antes mesmo do visitante precisar perguntar."
        : "Uma seção de perguntas frequentes ajuda o visitante a tirar dúvidas sem sair da página, aumentando a confiança e as conversões.",
    }
  );

  // Achados condicionais por tipo de site (sem alterações)
  if (tipoSite === "ecommerce") {
    const temCarrinho     = /carrinho|checkout|adicionar ao carrinho/i.test(bodyText + bodyHtml);
    const temFreteOuTroca = /frete|troca|devolução|parcelamento|pagamento/i.test(bodyText);
    achados.push({
      pilar: "conversao",
      ok: temCarrinho && temFreteOuTroca,
      titulo: temCarrinho && temFreteOuTroca ? "Elementos de compra encontrados" : "Informações de compra incompletas",
      detalhe: temCarrinho && temFreteOuTroca
        ? "O site apresenta elementos importantes para a decisão de compra."
        : "Lojas virtuais precisam deixar claros carrinho, frete, pagamento, troca e segurança de compra.",
    });
  }

  if (tipoSite === "servico" || tipoSite === "institucional") {
    const temAutoridade = /portfolio|portfólio|case|clientes|projetos|especialista|experiência/i.test(bodyText);
    achados.push({
      pilar: "conversao",
      ok: temAutoridade,
      titulo: temAutoridade ? "Autoridade comercial identificada" : "Poucos sinais de autoridade comercial",
      detalhe: temAutoridade
        ? "O site apresenta elementos que ajudam a justificar a contratação."
        : "Sites de serviço precisam mostrar experiência, portfólio, cases ou motivos claros para contratar.",
    });
  }

  if (tipoSite === "curso") {
    const temTransformacao = /aprenda|domine|certificado|método|aulas|mentoria|aluno/i.test(bodyText);
    achados.push({
      pilar: "conversao",
      ok: temTransformacao,
      titulo: temTransformacao ? "Transformação do curso identificada" : "Transformação pouco clara",
      detalhe: temTransformacao
        ? "O site apresenta sinais do que o aluno aprende ou conquista."
        : "Páginas de curso precisam deixar clara a transformação, o método e o resultado esperado.",
    });
  }

  if (tipoSite === "saas") {
    const temDemoTrial = /demo|teste grátis|free trial|planos|assinatura|comece agora/i.test(bodyText);
    achados.push({
      pilar: "conversao",
      ok: temDemoTrial,
      titulo: temDemoTrial ? "Caminho de teste ou demonstração identificado" : "Caminho de ativação pouco claro",
      detalhe: temDemoTrial
        ? "O site apresenta um caminho para o usuário experimentar ou conhecer a solução."
        : "Produtos SaaS precisam deixar claro como testar, assinar ou solicitar uma demonstração.",
    });
  }

  // ===========================================================================
  // PILAR: CLAREZA
  // ===========================================================================

  achados.push(
    {
      pilar: "clareza",
      ok: h1Claro,
      titulo: h1Claro ? "Título principal bem definido" : "Título principal pouco claro",
      detalhe: h1Claro
        ? "A página possui uma proposta principal identificável."
        : "O visitante pode ter dificuldade para entender rapidamente o que está sendo oferecido.",
    },
    {
      pilar: "clareza",
      ok: propostaValor,
      titulo: propostaValor ? "Proposta de valor identificada" : "Proposta de valor pouco evidente",
      detalhe: propostaValor
        ? "O visitante consegue perceber os benefícios da oferta."
        : "Não está claro qual transformação ou benefício o cliente recebe. Explique o que muda na vida de quem compra.",
    },
    {
      pilar: "clareza",
      ok: diferencial,
      titulo: diferencial ? "Diferenciais encontrados" : "Poucos diferenciais identificados",
      detalhe: diferencial
        ? "A página apresenta motivos para escolher sua empresa."
        : "O visitante pode ter dificuldade para entender por que escolher sua empresa em vez da concorrência.",
    },
    {
      pilar: "clareza",
      ok: temNumeros,
      titulo: temNumeros ? "Dados e números encontrados" : "Poucos dados concretos encontrados",
      detalhe: temNumeros
        ? "Existem informações concretas que ajudam na tomada de decisão."
        : "Números, resultados e métricas tornam a oferta mais convincente. Ex: '200 clientes atendidos', '98% de satisfação'.",
    }
  );

  // ===========================================================================
  // PILAR: CONFIANÇA
  // ===========================================================================

  achados.push(
    {
      pilar: "confianca",
      ok: https,
      titulo: https ? "Site com conexão segura (HTTPS)" : "Site sem conexão segura",
      detalhe: https
        ? "O site usa conexão segura. Isso é esperado pelos visitantes e pelos navegadores."
        : "Sem HTTPS, o navegador pode exibir o aviso 'site não seguro'. Isso afasta visitantes antes mesmo de lerem o conteúdo.",
    },
    {
      pilar: "confianca",
      ok: infoInstitucional,
      titulo: infoInstitucional ? "Informações sobre a empresa presentes" : "Falta uma seção sobre a empresa",
      detalhe: infoInstitucional
        ? "Existe conteúdo que apresenta a empresa e gera contexto para o visitante."
        : "Sem uma seção que explique quem é a empresa, o visitante tem menos motivos para confiar.",
    },
    {
      pilar: "confianca",
      ok: depoimentos || provaSocial,
      titulo: depoimentos || provaSocial ? "Depoimentos ou avaliações identificados" : "Sem depoimentos ou avaliações visíveis",
      detalhe: depoimentos || provaSocial
        ? "Relatos e avaliações de clientes ajudam a reduzir a insegurança de quem ainda não conhece a empresa."
        : "A ausência de depoimentos reais é um dos principais motivos de desconfiança. Adicionar 3 a 5 avaliações pode aumentar as conversões.",
    },
    {
      pilar: "confianca",
      ok: contatoVisivel || temCanalContatoDireto,
      titulo: contatoVisivel || temCanalContatoDireto ? "Informações de contato visíveis" : "Informações de contato pouco visíveis",
      detalhe: contatoVisivel || temCanalContatoDireto
        ? "O visitante consegue encontrar como falar com a empresa."
        : "Sem telefone, e-mail ou WhatsApp visíveis, o visitante pode desconfiar da seriedade do negócio.",
    },
    {
      pilar: "confianca",
      ok: temLogos,
      titulo: temLogos ? "Logos de clientes ou parceiros identificados" : "Sem logos de clientes ou parceiros",
      detalhe: temLogos
        ? "Exibir empresas que já contrataram ou parceiros reconhecidos aumenta a credibilidade."
        : "Mostrar logos de clientes conhecidos ou parceiros transmite autoridade. Se você já atendeu marcas reconhecidas, mostre isso.",
    },
    {
      pilar: "confianca",
      ok: temSelos,
      titulo: temSelos ? "Selos de segurança ou confiança identificados" : "Sem selos de segurança ou confiança",
      detalhe: temSelos
        ? "Selos de pagamento seguro, certificados ou premiações ajudam a reduzir o medo de comprar."
        : "Adicionar selos como 'Compra Segura', certificados de segurança ou premiações do setor aumenta a confiança, especialmente em e-commerces.",
    },
    {
      pilar: "confianca",
      ok: privacidade.temPolitica,
      titulo: privacidade.temPolitica ? "Política de privacidade identificada" : "Política de privacidade não encontrada",
      detalhe: privacidade.temPolitica
        ? "A política de privacidade está presente. Isso é exigido pela LGPD e transmite transparência."
        : "A Lei Geral de Proteção de Dados (LGPD) exige uma política de privacidade. Além da obrigação legal, ela mostra ao visitante que os dados dele serão tratados com respeito.",
    }
  );

  // ===========================================================================
  // PILAR: VISIBILIDADE
  // ===========================================================================

  achados.push(
    {
      pilar: "visibilidade",
      ok: titleOk,
      titulo: titleOk ? "Título da página bem dimensionado" : "Título da página fora do tamanho ideal",
      detalhe: titleOk
        ? "O título tem o tamanho certo para aparecer completo nos resultados de busca do Google."
        : title.length === 0
        ? "A página não tem título definido. O Google não consegue identificar o assunto da página."
        : title.length < 15
        ? "O título está muito curto e não comunica bem o conteúdo da página para o Google."
        : "O título está muito longo e será cortado nos resultados do Google, reduzindo os cliques.",
    },
    {
      pilar: "visibilidade",
      ok: metaOk,
      titulo: metaOk ? "Descrição para o Google configurada" : "Descrição para o Google ausente ou inadequada",
      detalhe: metaOk
        ? "Existe um resumo claro que aparece nos resultados do Google e ajuda a atrair cliques."
        : metaDescription.length === 0
        ? "Sem descrição, o Google vai exibir um trecho aleatório da página — que pode não ser o mais atraente para quem está buscando."
        : "A descrição está fora do tamanho ideal (entre 50 e 170 caracteres) e pode ser cortada no Google.",
    },
    {
      pilar: "visibilidade",
      ok: h1Ok,
      titulo: h1Ok ? "Estrutura de título principal correta" : "Estrutura de título principal com problemas",
      detalhe: h1Ok
        ? "A página tem um único título principal, o que ajuda o Google a entender o tema central."
        : h1Count === 0
        ? "A página não tem título principal (H1). O Google usa esse elemento para entender o que a página é. Isso prejudica o posicionamento."
        : `A página tem ${h1Count} títulos principais. O ideal é ter apenas um, focado no tema central da página.`,
    },
    {
      pilar: "visibilidade",
      ok: viewportOk,
      titulo: viewportOk ? "Site preparado para celular" : "Site pode não estar adaptado ao celular",
      detalhe: viewportOk
        ? "A página está configurada para se adaptar às telas de celular."
        : "Mais de 70% dos acessos acontecem pelo celular. Um site não adaptado afasta visitantes e prejudica o posicionamento no Google.",
    },
    {
      pilar: "visibilidade",
      ok: openGraph.ogCompleto,
      titulo: openGraph.ogCompleto
        ? "Compartilhamento em redes sociais configurado"
        : "Compartilhamento em redes sociais sem configuração",
      detalhe: openGraph.ogCompleto
        ? "O site está configurado para exibir título, descrição e imagem quando compartilhado no WhatsApp, Instagram ou LinkedIn."
        : "Quando alguém compartilha o link do site no WhatsApp ou nas redes sociais, nenhuma imagem ou descrição aparece. Isso reduz os cliques. Basta configurar as tags Open Graph.",
    },
    {
      pilar: "visibilidade",
      ok: schema.temSchema,
      titulo: schema.temSchema
        ? "Dados estruturados para o Google identificados"
        : "Sem dados estruturados para o Google",
      detalhe: schema.temSchema
        ? `Encontramos dados estruturados do tipo: ${schema.tipos.join(", ")}. Isso pode gerar resultados enriquecidos no Google (estrelas, FAQ, preço).`
        : "Dados estruturados permitem que o Google exiba informações extras nos resultados de busca, como estrelas de avaliação ou perguntas frequentes. Isso aumenta os cliques.",
    },
    {
      pilar: "visibilidade",
      ok: !robots.temNoindex,
      titulo: !robots.temNoindex
        ? "Página visível para o Google"
        : "⚠️ Página bloqueada para o Google (noindex)",
      detalhe: !robots.temNoindex
        ? "A página não está bloqueada para mecanismos de busca."
        : "A página está configurada com noindex, o que impede o Google de indexá-la. Isso significa que ela não aparece nas buscas. Verifique se isso é intencional.",
    },
    {
      pilar: "visibilidade",
      ok: canonical.temCanonical,
      titulo: canonical.temCanonical
        ? "URL canônica configurada"
        : "URL canônica não configurada",
      detalhe: canonical.temCanonical
        ? "A página informa ao Google qual é a versão oficial da URL, evitando problemas de conteúdo duplicado."
        : "Sem URL canônica, o Google pode entender versões diferentes da mesma página (com e sem www, com parâmetros) como páginas separadas. Isso pode prejudicar o posicionamento.",
    },
    {
      pilar: "visibilidade",
      ok: imagens.tudoOk,
      titulo: imagens.tudoOk
        ? "Imagens com descrição alternativa"
        : `${imagens.semAlt} ${imagens.semAlt === 1 ? "imagem sem descrição" : "imagens sem descrição"}`,
      detalhe: imagens.tudoOk
        ? "Todas as imagens têm texto alternativo, o que ajuda o Google a entendê-las e torna o site mais acessível."
        : `${imagens.semAlt} de ${imagens.total} imagens não têm texto alternativo (atributo alt). Isso prejudica o SEO e impede que pessoas com deficiência visual entendam o conteúdo.`,
    }
  );

  // NOVO — Achado de rastreamento (visibilidade, pois afeta a capacidade de otimizar)
  achados.push({
    pilar: "visibilidade",
    ok: rastreamento.temAnalyticsQualquer,
    titulo: rastreamento.temAnalyticsQualquer
      ? `Ferramentas de rastreamento instaladas (${rastreamento.ferramentasEncontradas.join(", ")})`
      : "Nenhuma ferramenta de rastreamento encontrada",
    detalhe: rastreamento.temAnalyticsQualquer
      ? `Identificamos: ${rastreamento.ferramentasEncontradas.join(", ")}. Com esses dados, é possível entender de onde vêm os visitantes e o que fazem no site.`
      : "Sem rastreamento, é impossível saber quantas pessoas visitam o site, de onde vêm ou o que fazem. Isso impede qualquer decisão baseada em dados. Instale o Google Analytics e o Meta Pixel.",
  });

  // ===========================================================================
  // Cálculo de scores
  // ===========================================================================

  let scoreConversao = calcularScorePonderado(
    achados.filter((a) => a.pilar === "conversao").map((a) => ({ ok: a.ok, peso: 20 }))
  );

  let scoreClareza = calcularScorePonderado([
    { ok: h1Claro,      peso: 30 },
    { ok: propostaValor, peso: 35 },
    { ok: diferencial,  peso: 20 },
    { ok: temNumeros,   peso: 15 },
  ]);

  let scoreConfianca = calcularScorePonderado([
    { ok: https,                          peso: 15 },
    { ok: infoInstitucional,              peso: 15 },
    { ok: depoimentos || provaSocial,     peso: 25 },
    { ok: contatoVisivel || temCanalContatoDireto, peso: 15 },
    { ok: temLogos,                       peso: 10 },
    { ok: temSelos,                       peso: 10 },
    { ok: privacidade.temPolitica,        peso: 10 },
  ]);

  let scoreVisibilidade = calcularScorePonderado([
    { ok: titleOk,                         peso: 20 },
    { ok: metaOk,                          peso: 20 },
    { ok: h1Ok,                            peso: 15 },
    { ok: viewportOk,                      peso: 15 },
    { ok: openGraph.ogCompleto,            peso: 10 },
    { ok: !robots.temNoindex,              peso: 10 },
    { ok: rastreamento.temAnalyticsQualquer, peso: 10 },
  ]);

  // Tetos dinâmicos
  let tetoGeral      = 100;
  let tetoConversao  = 85;
  let tetoConfianca  = 100;
  let tetoVisibilidade = 100;

  if (!ctaEncontrado)            { tetoGeral = Math.min(tetoGeral, 72); tetoConversao = Math.min(tetoConversao, 65); }
  if (!temCanalContatoDireto)    { tetoGeral = Math.min(tetoGeral, 68); tetoConversao = Math.min(tetoConversao, 55); }
  if (!provaSocial && !depoimentos) { tetoGeral = Math.min(tetoGeral, 78); tetoConfianca = Math.min(tetoConfianca, 65); }
  if (!infoInstitucional)        { tetoGeral = Math.min(tetoGeral, 82); tetoConfianca = Math.min(tetoConfianca, 72); }
  if (totalForms > 0 && camposPrimeiroForm > 5) { tetoGeral = Math.min(tetoGeral, 74); tetoConversao = Math.min(tetoConversao, 62); }
  if (scoreClareza < 70)         { tetoGeral = Math.min(tetoGeral, 78); }
  if (robots.temNoindex)         { tetoGeral = Math.min(tetoGeral, 40); tetoVisibilidade = Math.min(tetoVisibilidade, 20); }
  if (!rastreamento.temAnalyticsQualquer) { tetoGeral = Math.min(tetoGeral, 80); }

  scoreConversao   = limitarScore(scoreConversao, tetoConversao);
  scoreClareza     = limitarScore(scoreClareza, 100);
  scoreConfianca   = limitarScore(scoreConfianca, tetoConfianca);
  scoreVisibilidade = limitarScore(scoreVisibilidade, tetoVisibilidade);

  let scoreBase = Math.round(
    scoreConversao   * 0.30 +
    scoreClareza     * 0.30 +
    scoreConfianca   * 0.20 +
    scoreVisibilidade * 0.20
  );

  scoreBase = Math.min(scoreBase, 89);
  const scoreGeral = limitarScore(scoreBase, tetoGeral);

  // Pilar mais fraco
  const pilares: { nome: Pilar; score: number }[] = [
    { nome: "conversao",   score: scoreConversao },
    { nome: "clareza",     score: scoreClareza },
    { nome: "confianca",   score: scoreConfianca },
    { nome: "visibilidade", score: scoreVisibilidade },
  ];
  pilares.sort((a, b) => a.score - b.score);
  const pilarMaisFraco = pilares[0].nome;

  const primeiroProblemaDoPilarFraco = achados.find(
    (a) => a.pilar === pilarMaisFraco && !a.ok
  );
  const oportunidadePrincipal =
    primeiroProblemaDoPilarFraco?.detalhe ??
    "Existem oportunidades claras de melhoria que podem aumentar suas conversões.";

  return {
    tipoSite,
    scoreGeral,
    scoreConversao,
    scoreClareza,
    scoreConfianca,
    scoreVisibilidade,
    pilarMaisFraco,
    oportunidadePrincipal,
    achados,
  };
}

// ---------------------------------------------------------------------------
// Handler HTTP
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body     = await req.json();
    const urlInput = (body?.url || "").toString();

    if (!urlInput || urlInput.trim().length < 3) {
      return NextResponse.json({ erro: "URL inválida." }, { status: 400 });
    }

    const urlNormalizada = normalizarUrl(urlInput);
    let url: URL;

    try {
      url = new URL(urlNormalizada);
    } catch {
      return NextResponse.json({ erro: "URL inválida." }, { status: 400 });
    }

    try {
      const html     = await buscarHtml(url.toString());
      const analise  = analisarHtml(html, url.toString());
      const resultado: ResultadoAnalise = { url: url.toString(), ...analise };

// Salva no Supabase
const { data } = await getSupabase().from('analises').insert({
  url: resultado.url,
  tipo_site: resultado.tipoSite,
  score_geral: resultado.scoreGeral,
  score_conversao: resultado.scoreConversao,
  score_clareza: resultado.scoreClareza,
  score_confianca: resultado.scoreConfianca,
  score_visibilidade: resultado.scoreVisibilidade,
  pilar_mais_fraco: resultado.pilarMaisFraco,
  oportunidade_principal: resultado.oportunidadePrincipal,
  achados: resultado.achados,
}).select('id').single();

const id = data?.id ?? null;

return NextResponse.json({ ...resultado, id });
    } catch (err) {
  console.error('ERRO_BUSCAR_HTML:', err);
  const resultadoErro: ResultadoAnalise = {
        url: url.toString(),
        tipoSite: "desconhecido",
        scoreGeral: 0,
        scoreConversao: 0,
        scoreClareza: 0,
        scoreConfianca: 0,
        scoreVisibilidade: 0,
        pilarMaisFraco: "conversao",
        oportunidadePrincipal:
          "Não conseguimos acessar esse site automaticamente. Alguns sites bloqueiam análises automáticas por segurança. Um especialista pode analisar manualmente.",
        achados: [],
        erroAcesso: true,
      };
      return NextResponse.json(resultadoErro);
    }
  } catch {
    return NextResponse.json(
      { erro: "Não foi possível processar a solicitação." },
      { status: 500 }
    );
  }
}
