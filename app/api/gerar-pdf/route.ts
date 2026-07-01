import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

const SOLUCOES: Record<string, string> = {
  "Próximo passo pouco claro": "Adicione um botão com uma ação clara na parte de cima da página, sem precisar rolar: 'Fale no WhatsApp', 'Solicite um orçamento' ou 'Compre agora'. Use uma cor que se destaque do restante da página e repita esse botão ao longo do conteúdo.",
  "Canal de contato pouco evidente": "Adicione seu WhatsApp ou telefone no topo e no rodapé da página. Se possível, coloque também um botão de WhatsApp fixo no canto inferior da tela — ele fica visível em qualquer parte do site, o tempo todo.",
  "Formulário com muitos campos": "Mantenha o formulário principal com no máximo 3 campos: nome, email e telefone. Campos extras podem ser coletados depois, numa etapa seguinte, quando o lead já demonstrou interesse.",
  "Prova social pouco evidente": "Adicione pelo menos 3 depoimentos reais com nome completo, foto e um resultado concreto que o cliente obteve. Se você tiver avaliações no Google, procure no painel administrativo do seu site a opção de incorporar o widget de avaliações diretamente na página.",
  "Nenhuma garantia mencionada": "Adicione uma frase de garantia visível próxima ao botão de compra ou contato: 'Satisfação garantida ou devolvemos seu dinheiro em 7 dias' ou 'Sem compromisso, cancele quando quiser'.",
  "Sem seção de dúvidas frequentes": "Crie uma seção de perguntas frequentes com as 5 perguntas mais comuns que você recebe dos seus clientes. No painel administrativo do seu site ou construtor de páginas, procure por um bloco de 'FAQ' ou 'Perguntas e Respostas'.",
  "Informações de compra incompletas": "Deixe visível na página do produto e no carrinho: formas de pagamento aceitas, prazo de entrega estimado e política de troca e devolução. Adicione os ícones dos meios de pagamento que você aceita — Pix, cartão, boleto.",
  "Poucos sinais de autoridade comercial": "Adicione uma seção com exemplos de trabalhos realizados, número de clientes atendidos, anos de experiência ou logos de empresas que você já atendeu. Uma foto sua com uma apresentação profissional também ajuda muito.",
  "Transformação pouco clara": "Reescreva o título e a descrição focando no resultado final. Adicione uma seção 'O que você vai aprender' com tópicos específicos e concretos.",
  "Caminho de ativação pouco claro": "Adicione um botão de 'Teste grátis' ou 'Agende uma demonstração' na área principal da página. Explique em 3 passos simples o que acontece depois que a pessoa clica.",
  "Título principal pouco claro": "Reescreva o título seguindo essa fórmula: o que você faz + pra quem + qual resultado. Exemplo: 'Sites que convertem visitantes em clientes para pequenas empresas.' Edite o texto em destaque no topo da página no painel do seu construtor de site.",
  "Proposta de valor pouco evidente": "Logo abaixo do título principal, adicione uma frase explicando a transformação que você entrega — não o que você faz, mas o que muda na vida do cliente depois de te contratar.",
  "Poucos diferenciais identificados": "Crie uma seção com 3 a 5 diferenciais reais e específicos. Evite genéricos como 'qualidade' e 'comprometimento'. Prefira: 'Entrega em 5 dias úteis', 'Atendimento via WhatsApp em até 2 horas', 'Garantia de 30 dias'.",
  "Poucos dados concretos encontrados": "Substitua frases vagas por dados reais: 'mais de 200 clientes atendidos', '98% de satisfação', 'atuando desde 2015'. Se não tiver métricas grandes, use o que você tem.",
  "Site sem conexão segura": "Entre em contato com a empresa onde seu site está hospedado e solicite a ativação do certificado de segurança SSL. Na maioria das hospedagens, esse serviço é gratuito e é ativado em minutos pelo painel de controle.",
  "Falta uma seção sobre a empresa": "Adicione uma página ou seção 'Quem somos' com a história da empresa e quem está por trás do negócio. Uma foto real sua ou da equipe aumenta muito a percepção de confiança.",
  "Sem depoimentos ou avaliações visíveis": "Entre em contato com seus melhores clientes via WhatsApp e peça um depoimento curto com nome completo e foto. Se tiver avaliações no Google, procure no painel do seu construtor de site a opção de exibir avaliações na página.",
  "Informações de contato pouco visíveis": "Coloque seu email, telefone ou WhatsApp no topo e no rodapé da página. Adicione também um botão de WhatsApp fixo que aparece em todas as páginas do site.",
  "Sem logos de clientes ou parceiros": "Crie uma seção 'Empresas que confiam na gente' e adicione os logos de clientes ou parceiros. Mesmo que sejam empresas menores, a presença visual de logos transmite credibilidade.",
  "Sem selos de segurança ou confiança": "Adicione elementos visuais de segurança próximos ao botão de compra: ícone de cadeado com 'Compra Segura', ícones dos meios de pagamento aceitos ou um selo de satisfação garantida.",
  "Política de privacidade não encontrada": "Crie uma página explicando quais dados você coleta e como usa. Adicione o link no rodapé do site. Busque por 'gerador de política de privacidade LGPD' online e adapte o texto gerado.",
  "Título da página fora do tamanho ideal": "Acesse o painel administrativo do seu site, vá até as configurações de SEO e reescreva o título com entre 15 e 65 caracteres, incluindo o nome do seu negócio e o serviço principal.",
  "Descrição para o Google ausente ou inadequada": "Acesse o painel administrativo do seu site, vá até as configurações de SEO e escreva uma descrição entre 50 e 170 caracteres explicando o que você oferece, terminando com uma chamada para ação.",
  "Estrutura de título principal com problemas": "Acesse o painel do seu construtor de site e certifique-se de que o texto em maior destaque no topo da página está marcado como 'Título Principal'. Cada página deve ter exatamente um título assim.",
  "Site pode não estar adaptado ao celular": "Acesse o painel do seu construtor de site e ative o modo de visualização mobile. Corrija textos cortados, botões pequenos demais e imagens que saem da tela.",
  "Compartilhamento em redes sociais sem configuração": "Acesse o painel administrativo do seu site, vá até as configurações de SEO ou redes sociais e preencha o título, a descrição e a imagem de compartilhamento (1200x630 pixels).",
  "Sem dados estruturados para o Google": "Acesse o painel administrativo do seu site e procure nas configurações de SEO a opção de 'dados estruturados' ou 'schema'. Se não encontrar, entre em contato com o suporte da plataforma.",
  "⚠️ Página bloqueada para o Google (noindex)": "Acesse o painel administrativo do seu site, vá até as configurações de privacidade ou visibilidade e desative qualquer opção como 'ocultar site dos mecanismos de busca'.",
  "URL canônica não configurada": "Acesse o painel administrativo do seu site, vá até as configurações de SEO e procure pela opção de 'URL preferida' ou 'endereço principal do site'. Defina qual é o endereço oficial e salve.",
  "Nenhuma ferramenta de rastreamento encontrada": "Acesse analytics.google.com, crie uma conta gratuita e instale o código de rastreamento no seu site. A maioria dos construtores tem um campo específico para isso nas configurações gerais. Instale também o Microsoft Clarity em clarity.microsoft.com.",
};

function getNivel(score: number): string {
  if (score < 50) return "Crítico";
  if (score < 90) return "Atenção";
  return "Saudável";
}

function corScore(score: number): [number, number, number] {
  if (score >= 90) return [22, 163, 74];
  if (score >= 50) return [217, 119, 6];
  return [220, 38, 38];
}

function newPage(doc: jsPDF): number {
  doc.addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, "F");
  return 20;
}

function checkPage(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 272) return newPage(doc);
  return y;
}

function renderCard(doc: jsPDF, y: number, titulo: string, solucao: string, margin: number, contentW: number): number {
  const solucaoLines = doc.splitTextToSize(solucao, contentW - 10);
  const boxH = 9 + solucaoLines.length * 5 + 8;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentW, boxH, 3, 3, "FD");
  doc.setFillColor(217, 119, 6);
  doc.rect(margin, y, 3, boxH, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(titulo, margin + 8, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(solucaoLines, margin + 8, y + 13);

  return y + boxH + 5;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = (body?.slug || "").toString().trim();

    if (!slug) {
      return NextResponse.json({ erro: "Slug não informado." }, { status: 400 });
    }

    const { data: analise, error } = await getSupabase()
      .from("analises")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !analise) {
      return NextResponse.json({ erro: "Análise não encontrada." }, { status: 404 });
    }

    if (!analise.pago) {
      return NextResponse.json({ erro: "Acesso não autorizado." }, { status: 403 });
    }

    const achados = typeof analise.achados === "string"
      ? JSON.parse(analise.achados)
      : analise.achados ?? [];

    const problemas = achados.filter((a: any) => !a.ok);
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = 210;
    const margin = 20;
    const contentW = W - margin * 2;
    let y = 20;

    const pilarLabel: Record<string, string> = {
      conversao: "Conversão",
      clareza: "Clareza da Oferta",
      confianca: "Confiança",
      visibilidade: "Visibilidade",
    };

    const scores: Record<string, number> = {
      conversao: analise.score_conversao,
      clareza: analise.score_clareza,
      confianca: analise.score_confianca,
      visibilidade: analise.score_visibilidade,
    };

    // Fundo branco página 1
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, "F");

    // Cabeçalho escuro
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 45, "F");

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Plano de Ação", margin, 20);

    doc.setFontSize(10);
    doc.setTextColor(180, 150, 80);
    doc.setFont("helvetica", "normal");
    doc.text("Ascenda Web · Raio-X de Conversão", margin, 29);

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(analise.url, margin, 37);
    const dataStr = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    doc.text(dataStr, W - margin - doc.getTextWidth(dataStr), 37);

    y = 58;

    // Introdução
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    const introLines = doc.splitTextToSize("Este relatório foi gerado a partir da análise do seu site pela ferramenta Raio-X de Conversão da Ascenda Web. Para cada problema identificado, você encontrará uma solução prática e direta. Priorize os itens do pilar com menor score primeiro.", contentW);
    doc.text(introLines, margin, y);
    y += introLines.length * 5 + 10;

    // Score geral
    y = checkPage(doc, y, 24);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentW, 22, 3, 3, "FD");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "normal");
    doc.text("Score Geral do Site", margin + 6, y + 8);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const [r, g, b] = corScore(analise.score_geral);
    doc.setTextColor(r, g, b);
    doc.text(`${analise.score_geral}/100 · ${getNivel(analise.score_geral)}`, margin + 6, y + 17);
    y += 28;

    // Scores por pilar
    y = checkPage(doc, y, 16);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Visão geral por pilar", margin, y);
    y += 8;

    const todosPilares = ["conversao", "clareza", "confianca", "visibilidade"];

    for (const pilar of todosPilares) {
      y = checkPage(doc, y, 14);
      const score = scores[pilar];
      const [pr, pg, pb] = corScore(score);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      doc.text(pilarLabel[pilar], margin, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(pr, pg, pb);
      const scoreText = `${score}/100 · ${getNivel(score)}`;
      doc.text(scoreText, W - margin - doc.getTextWidth(scoreText), y);
      y += 4;
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(margin, y, contentW, 4, 2, 2, "F");
      doc.setFillColor(pr, pg, pb);
      doc.roundedRect(margin, y, (score / 100) * contentW, 4, 2, 2, "F");
      y += 10;
    }

    // Velocidade
    if (analise.score_performance) {
      y = checkPage(doc, y, 14);
      const [vr, vg, vb] = corScore(analise.score_performance);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      doc.text("Velocidade", margin, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(vr, vg, vb);
      const vText = `${analise.score_performance}/100 · ${getNivel(analise.score_performance)}`;
      doc.text(vText, W - margin - doc.getTextWidth(vText), y);
      y += 4;
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(margin, y, contentW, 4, 2, 2, "F");
      doc.setFillColor(vr, vg, vb);
      doc.roundedRect(margin, y, (analise.score_performance / 100) * contentW, 4, 2, 2, "F");
      y += 14;
    }

    y += 6;

    // O que corrigir
    y = checkPage(doc, y, 16);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("O que corrigir e como fazer", margin, y);
    y += 10;

    for (const pilar of todosPilares) {
      const itens = problemas.filter((a: any) => a.pilar === pilar);
      if (itens.length === 0) continue;

      // Garante que título do pilar e pelo menos um card ficam juntos
      const primeiroSolucao = SOLUCOES[itens[0].titulo] || itens[0].detalhe;
      const primeiroLines = doc.splitTextToSize(primeiroSolucao, contentW - 10);
      const primeiroH = 9 + primeiroLines.length * 5 + 8;
      y = checkPage(doc, y, 20 + primeiroH);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(pilarLabel[pilar], margin, y);
      y += 2;
      doc.setDrawColor(217, 119, 6);
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin + contentW, y);
      y += 8;

      for (const item of itens) {
        const solucao = SOLUCOES[item.titulo] || item.detalhe;
        const solucaoLines = doc.splitTextToSize(solucao, contentW - 10);
        const boxH = 9 + solucaoLines.length * 5 + 8;
        y = checkPage(doc, y, boxH);
        y = renderCard(doc, y, item.titulo, solucao, margin, contentW);
      }

      y += 4;
    }

    // Velocidade — problemas e soluções
    if (analise.score_performance !== null) {
      const problemasVelocidade: { titulo: string; solucao: string }[] = [];

      if (analise.lcp) {
        const lcpMs = parseFloat(analise.lcp);
        if (lcpMs > 2.5 || analise.lcp.includes("s") && parseFloat(analise.lcp) > 2.5) {
          problemasVelocidade.push({
            titulo: `LCP: ${analise.lcp} — Conteúdo principal demorando para aparecer`,
            solucao: "O conteúdo principal da sua página está demorando para aparecer. Isso afasta visitantes e prejudica o posicionamento no Google. Comprima todas as imagens do site e converta para o formato WebP — imagens devem ter no máximo 200KB. Se o seu site usa um construtor, procure pela opção de otimização de imagens nas configurações. Ative também o cache da sua hospedagem ou instale o Cloudflare gratuitamente em cloudflare.com.",
          });
        }
      }

      if (analise.fcp) {
        problemasVelocidade.push({
          titulo: `FCP: ${analise.fcp} — Primeiro conteúdo demorando para aparecer`,
          solucao: "O primeiro elemento da sua página está demorando para aparecer na tela. Remova scripts e plugins desnecessários do seu site — cada ferramenta extra aumenta esse tempo. Ative o cache pelo painel da sua hospedagem e instale o Cloudflare em cloudflare.com para distribuir o conteúdo mais rápido.",
        });
      }

      if (analise.ttfb) {
        const ttfbMs = parseInt(analise.ttfb);
        if (ttfbMs > 800) {
          problemasVelocidade.push({
            titulo: `TTFB: ${analise.ttfb} — Servidor demorando para responder`,
            solucao: "Seu servidor está demorando para responder antes mesmo de qualquer conteúdo aparecer. Primeiro, ative o cache pelo painel da sua hospedagem — procure por 'cache' ou 'LiteSpeed Cache'. Em seguida, instale o Cloudflare gratuitamente em cloudflare.com. Se mesmo assim o problema persistir, considere trocar para uma hospedagem com suporte a LiteSpeed ou servidores no Brasil.",
          });
        }
      }

      if (analise.tbt) {
        const tbtMs = parseInt(analise.tbt);
        if (tbtMs > 200) {
          problemasVelocidade.push({
            titulo: `TBT: ${analise.tbt} — Página travando durante o carregamento`,
            solucao: "Sua página está travando por um período durante o carregamento, impedindo o visitante de interagir. Isso é causado por scripts pesados rodando em segundo plano. Remova plugins e ferramentas que você não usa mais. Se usar Google Tag Manager, verifique se não há tags antigas ou duplicadas. Cada ferramenta de rastreamento ou chat online que você adiciona contribui para esse problema.",
          });
        }
      }

      if (analise.cls) {
        const clsVal = parseFloat(analise.cls);
        if (clsVal > 0.1) {
          problemasVelocidade.push({
            titulo: `CLS: ${analise.cls} — Elementos se movendo durante o carregamento`,
            solucao: "Elementos da sua página estão se movendo enquanto carregam — botões, textos e imagens mudam de posição, fazendo o visitante clicar na coisa errada. Defina sempre o tamanho das imagens no seu construtor de site antes de publicar. Evite banners ou elementos que aparecem depois que a página já carregou, como popups que empurram o conteúdo.",
          });
        }
      }

      if (problemasVelocidade.length > 0) {
        const primeiroVH = 9 + doc.splitTextToSize(problemasVelocidade[0].solucao, contentW - 10).length * 5 + 8;
        y = checkPage(doc, y, 20 + primeiroVH);

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("Velocidade", margin, y);
        y += 2;
        doc.setDrawColor(217, 119, 6);
        doc.setLineWidth(0.5);
        doc.line(margin, y, margin + contentW, y);
        y += 8;

        for (const pv of problemasVelocidade) {
          const pvLines = doc.splitTextToSize(pv.solucao, contentW - 10);
          const pvH = 9 + pvLines.length * 5 + 8;
          y = checkPage(doc, y, pvH);
          y = renderCard(doc, y, pv.titulo, pv.solucao, margin, contentW);
        }

        y += 4;
      }
    }

    // Rodapé
    y = checkPage(doc, y, 22);
    doc.setFillColor(15, 23, 42);
    doc.rect(0, y, 210, 22, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(203, 213, 225);
    doc.text("Precisa de ajuda para implementar essas melhorias?", margin, y + 8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Fale com a Ascenda Web · hello@ascendaweb.com", margin, y + 16);

    const pdfBytes = doc.output("arraybuffer");

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="plano-de-acao-${slug}.pdf"`,
      },
    });

  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    return NextResponse.json({ erro: "Não foi possível gerar o PDF." }, { status: 500 });
  }
}