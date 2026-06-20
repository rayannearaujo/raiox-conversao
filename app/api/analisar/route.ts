import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import type { Achado, Pilar, ResultadoAnalise, TipoSite } from "@/app/types";

export const runtime = "nodejs";

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
  const total = regras.reduce((acc, regra) => acc + regra.peso, 0);
  const ganho = regras.reduce((acc, regra) => acc + (regra.ok ? regra.peso : 0), 0);
  return Math.round((ganho / total) * 100);
}

function detectarTipoSite(bodyText: string): TipoSite {
  let scoreLanding = 0;
  let scoreEcommerce = 0;
  let scoreServico = 0;
  let scoreCurso = 0;
  let scoreSaas = 0;

  // Landing Page
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

  // Ecommerce
  if (bodyText.includes("adicionar ao carrinho")) scoreEcommerce += 6;
  if (bodyText.includes("carrinho")) scoreEcommerce += 4;
  if (bodyText.includes("checkout")) scoreEcommerce += 4;
  if (bodyText.includes("frete")) scoreEcommerce += 3;
  if (bodyText.includes("parcelamento")) scoreEcommerce += 2;
  if (bodyText.includes("troca")) scoreEcommerce += 2;

  // Serviço
  if (bodyText.includes("consultoria")) scoreServico += 5;
  if (bodyText.includes("diagnóstico")) scoreServico += 4;
  if (bodyText.includes("orçamento")) scoreServico += 4;
  if (bodyText.includes("projeto")) scoreServico += 3;
  if (bodyText.includes("atendimento")) scoreServico += 3;
  if (bodyText.includes("serviço")) scoreServico += 4;
  if (bodyText.includes("soluções")) scoreServico += 3;

  // Curso
  if (bodyText.includes("curso")) scoreCurso += 5;
  if (bodyText.includes("aulas")) scoreCurso += 4;
  if (bodyText.includes("aluno")) scoreCurso += 3;
  if (bodyText.includes("certificado")) scoreCurso += 3;
  if (bodyText.includes("mentoria")) scoreCurso += 3;
  if (bodyText.includes("inscrição")) scoreCurso += 3;

  // SaaS
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

  if (maior.score <= 2) {
    return "institucional";
  }
console.log({
  scoreLanding,
  scoreEcommerce,
  scoreServico,
  scoreCurso,
  scoreSaas,
});
  return maior.tipo;
}

function analisarHtml(html: string, urlFinal: string): Omit<ResultadoAnalise, "url"> {
  const $ = cheerio.load(html);
  const bodyText = $("body").text().toLowerCase();
  const bodyHtml = ($("body").html() || "").toLowerCase();
  const primeiraDobra = ($.html().slice(0, 6000) || "").toLowerCase();

  const tipoSite = detectarTipoSite(bodyText);
  const achados: Achado[] = [];

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
  const temNumeros = /\d+/.test(primeiraDobra);

  const temWhatsapp =
    /wa\.me|api\.whatsapp\.com|whatsapp/i.test(bodyHtml) ||
    bodyText.includes("whatsapp");

  const temTelefone = /tel:|telefone|\(\d{2}\)\s?\d{4,5}-?\d{4}/i.test(bodyHtml + bodyText);

  const palavrasCta = [
    "comprar", "agende", "agendar", "fale conosco", "fale com", "contrate",
    "solicite", "saiba mais", "peça", "orçamento", "cadastre-se", "quero", "garanta",
  ];

  const ctaEncontrado =
    palavrasCta.some((p) => primeiraDobra.includes(p)) ||
    $("button, a").toArray().some((el) => {
      const t = $(el).text().toLowerCase().trim();
      return t.length > 0 && t.length < 40 && palavrasCta.some((p) => t.includes(p));
    });

  const totalForms = $("form").length;
  const camposPrimeiroForm =
    totalForms > 0 ? $("form").first().find("input, select, textarea").length : 0;
  const formularioOk = totalForms === 0 || camposPrimeiroForm <= 5;

  const provaSocial = /depoimento|avaliaç|review|cliente satisfeito|nossos clientes|quem confia/i.test(bodyText);
  const https = urlFinal.startsWith("https://");
  const infoInstitucional = /sobre n[oó]s|quem somos|nossa hist[oó]ria|institucional/i.test(bodyText);
  const depoimentos = /depoimento|"[^"]{15,}"|relatos? de clientes/i.test(bodyText);
  const contatoVisivel = /e-?mail|@.+\.(com|com\.br|net)|endereço|whatsapp|telefone/i.test(bodyText);

  const title = $("title").text().trim();
  const titleOk = title.length >= 15 && title.length <= 65;

  const metaDescription = $('meta[name="description"]').attr("content")?.trim() || "";
  const metaOk = metaDescription.length >= 50 && metaDescription.length <= 170;

  const h1Count = $("h1").length;
  const h1Ok = h1Count === 1;

  const viewport = $('meta[name="viewport"]').attr("content");
  const viewportOk = Boolean(viewport && viewport.includes("width"));

  const temCanalContatoDireto = temWhatsapp || temTelefone || totalForms > 0;

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
      titulo: temCanalContatoDireto ? "Canal de conversão disponível" : "Canal de conversão pouco evidente",
      detalhe: temCanalContatoDireto
        ? "O site possui ao menos um caminho para o visitante avançar."
        : "Sem WhatsApp, telefone ou formulário, o visitante pode sair sem iniciar contato.",
    },
    {
      pilar: "conversao",
      ok: formularioOk,
      titulo: formularioOk ? "Baixa fricção no formulário" : "Formulário com fricção elevada",
      detalhe: formularioOk
        ? "A quantidade de campos não cria uma barreira excessiva para o visitante."
        : `O formulário tem ${camposPrimeiroForm} campos. Formulários longos reduzem a taxa de conclusão.`,
    },
    {
      pilar: "conversao",
      ok: provaSocial,
      titulo: provaSocial ? "Prova social presente" : "Prova social pouco evidente",
      detalhe: provaSocial
        ? "O site apresenta sinais de validação social."
        : "Depoimentos, avaliações e resultados ajudam o visitante a confiar antes de comprar ou entrar em contato.",
    }
  );

  if (tipoSite === "ecommerce") {
    const temCarrinho = /carrinho|checkout|adicionar ao carrinho/i.test(bodyText + bodyHtml);
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
        ? "O visitante consegue perceber benefícios da oferta."
        : "Não está claro qual transformação ou benefício o cliente recebe.",
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
        : "Números, resultados e métricas ajudam a tornar a oferta mais convincente.",
    }
  );

  achados.push(
    {
      pilar: "confianca",
      ok: https,
      titulo: https ? "Conexão segura (HTTPS)" : "Site sem conexão segura (HTTPS)",
      detalhe: https
        ? "O site usa conexão segura, algo esperado pelos visitantes e navegadores."
        : "Sem HTTPS, navegadores podem exibir avisos de site não seguro.",
    },
    {
      pilar: "confianca",
      ok: infoInstitucional,
      titulo: infoInstitucional ? "Informações institucionais presentes" : "Falta uma seção sobre a empresa",
      detalhe: infoInstitucional
        ? "Existe conteúdo que apresenta a empresa e gera contexto para o visitante."
        : "Sem uma seção que explique quem é a empresa, o visitante tem menos elementos para confiar.",
    },
    {
      pilar: "confianca",
      ok: depoimentos || provaSocial,
      titulo: depoimentos || provaSocial ? "Sinais de validação social encontrados" : "Sem validação social clara",
      detalhe: depoimentos || provaSocial
        ? "Relatos, avaliações ou menções a clientes ajudam a reduzir insegurança."
        : "A falta de depoimentos, avaliações ou provas sociais reduz a confiança.",
    },
    {
      pilar: "confianca",
      ok: contatoVisivel || temCanalContatoDireto,
      titulo: contatoVisivel || temCanalContatoDireto ? "Informações de contato visíveis" : "Informações de contato escassas",
      detalhe: contatoVisivel || temCanalContatoDireto
        ? "O visitante consegue encontrar como falar com a empresa."
        : "Sem canais de contato claros, o visitante pode desconfiar da seriedade do negócio.",
    }
  );

  achados.push(
    {
      pilar: "visibilidade",
      ok: titleOk,
      titulo: titleOk ? "Título da página bem dimensionado" : "Título da página fora do ideal",
      detalhe: titleOk
        ? "O título ajuda o Google a entender e exibir a página nas buscas."
        : "O título está ausente, muito curto ou muito longo para aparecer bem nas buscas.",
    },
    {
      pilar: "visibilidade",
      ok: metaOk,
      titulo: metaOk ? "Descrição para o Google configurada" : "Descrição para o Google ausente ou inadequada",
      detalhe: metaOk
        ? "Existe um resumo claro que pode ajudar a atrair cliques."
        : "Sem uma boa descrição, o Google pode exibir um trecho aleatório da página.",
    },
    {
      pilar: "visibilidade",
      ok: h1Ok,
      titulo: h1Ok ? "Estrutura de título principal correta" : "Estrutura de título principal inconsistente",
      detalhe: h1Ok
        ? "A página tem um título principal único."
        : h1Count === 0
        ? "A página não define um título principal."
        : "A página tem múltiplos títulos principais, confundindo o foco da página.",
    },
    {
      pilar: "visibilidade",
      ok: viewportOk,
      titulo: viewportOk ? "Site preparado para celular" : "Site pode não estar adaptado ao celular",
      detalhe: viewportOk
        ? "A página está configurada para se adaptar corretamente a telas de celular."
        : "A maior parte dos acessos acontece pelo celular; sem adaptação, a experiência piora.",
    }
  );

  let scoreConversao = calcularScorePonderado(
    achados.filter((a) => a.pilar === "conversao").map((a) => ({ ok: a.ok, peso: 20 }))
  );

  let scoreClareza = calcularScorePonderado([
    { ok: h1Claro, peso: 30 },
    { ok: propostaValor, peso: 35 },
    { ok: diferencial, peso: 20 },
    { ok: temNumeros, peso: 15 },
  ]);

  let scoreConfianca = calcularScorePonderado([
    { ok: https, peso: 15 },
    { ok: infoInstitucional, peso: 25 },
    { ok: depoimentos || provaSocial, peso: 35 },
    { ok: contatoVisivel || temCanalContatoDireto, peso: 25 },
  ]);

  let scoreVisibilidade = calcularScorePonderado([
    { ok: titleOk, peso: 30 },
    { ok: metaOk, peso: 30 },
    { ok: h1Ok, peso: 25 },
    { ok: viewportOk, peso: 15 },
  ]);

  let tetoGeral = 100;
  let tetoConversao = 85;
  let tetoConfianca = 100;

  if (!ctaEncontrado) {
    tetoGeral = Math.min(tetoGeral, 72);
    tetoConversao = Math.min(tetoConversao, 65);
  }

  if (!temCanalContatoDireto) {
    tetoGeral = Math.min(tetoGeral, 68);
    tetoConversao = Math.min(tetoConversao, 55);
  }

  if (!provaSocial && !depoimentos) {
    tetoGeral = Math.min(tetoGeral, 78);
    tetoConfianca = Math.min(tetoConfianca, 65);
  }

  if (!infoInstitucional) {
    tetoGeral = Math.min(tetoGeral, 82);
    tetoConfianca = Math.min(tetoConfianca, 72);
  }

  if (totalForms > 0 && camposPrimeiroForm > 5) {
    tetoGeral = Math.min(tetoGeral, 74);
    tetoConversao = Math.min(tetoConversao, 62);
  }

  if (scoreClareza < 70) {
    tetoGeral = Math.min(tetoGeral, 78);
  }

  scoreConversao = limitarScore(scoreConversao, tetoConversao);
  scoreClareza = limitarScore(scoreClareza, 100);
  scoreConfianca = limitarScore(scoreConfianca, tetoConfianca);
  scoreVisibilidade = limitarScore(scoreVisibilidade, 100);

  let scoreBase = Math.round(
    scoreConversao * 0.3 +
      scoreClareza * 0.3 +
      scoreConfianca * 0.2 +
      scoreVisibilidade * 0.2
  );

  scoreBase = Math.min(scoreBase, 89);
  const scoreGeral = limitarScore(scoreBase, tetoGeral);

  const pilares: { nome: Pilar; score: number }[] = [
    { nome: "conversao", score: scoreConversao },
    { nome: "clareza", score: scoreClareza },
    { nome: "confianca", score: scoreConfianca },
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
      const html = await buscarHtml(url.toString());
      const analise = analisarHtml(html, url.toString());
      const resultado: ResultadoAnalise = { url: url.toString(), ...analise };
      return NextResponse.json(resultado);
    } catch {
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
          "Não conseguimos acessar esse site automaticamente, mas isso não significa que está tudo bem — alguns sites bloqueiam análises automáticas por segurança. Um especialista pode analisar manualmente.",
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