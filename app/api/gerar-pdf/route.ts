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

function wrapText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
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

    function checkPage(needed: number) {
      if (y + needed > 270) {
        doc.addPage();
        y = 20;
      }
    }

    // Fundo escuro
    doc.setFillColor(11, 17, 32);
    doc.rect(0, 0, 210, 297, "F");

    // Cabeçalho
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 50, "F");

    doc.setFontSize(22);
    doc.setTextColor(241, 245, 249);
    doc.setFont("helvetica", "bold");
    doc.text("Plano de Ação", margin, 22);

    doc.setFontSize(10);
    doc.setTextColor(251, 191, 36);
    doc.setFont("helvetica", "normal");
    doc.text("Ascenda Web · Raio-X de Conversão", margin, 30);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(analise.url, margin, 38);

    const data = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    doc.text(data, margin, 45);

    y = 62;

    // Introdução
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "normal");
    y = wrapText(doc, "Este relatório foi gerado a partir da análise do seu site pela ferramenta Raio-X de Conversão. Para cada problema identificado, você encontrará uma solução prática. Priorize os itens do pilar com menor score primeiro.", margin, y, contentW, 5);
    y += 8;

    // Score geral
    checkPage(30);
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(margin, y, contentW, 24, 4, 4, "F");
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text("Score Geral do Site", margin + 6, y + 8);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(248, 113, 113);
    if (analise.score_geral >= 90) doc.setTextColor(52, 211, 153);
    else if (analise.score_geral >= 50) doc.setTextColor(251, 191, 36);
    doc.text(`${analise.score_geral}/100 · ${getNivel(analise.score_geral)}`, margin + 6, y + 18);
    y += 30;

    // Scores por pilar
    checkPage(60);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(241, 245, 249);
    doc.text("Visão geral por pilar", margin, y);
    y += 8;

    for (const pilar of ["conversao", "clareza", "confianca", "visibilidade"]) {
      const score = scores[pilar];
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(203, 213, 225);
      doc.text(pilarLabel[pilar], margin, y);
      doc.setFont("helvetica", "bold");
      if (score >= 90) doc.setTextColor(52, 211, 153);
      else if (score >= 50) doc.setTextColor(251, 191, 36);
      else doc.setTextColor(248, 113, 113);
      doc.text(`${score}/100 · ${getNivel(score)}`, W - margin - 40, y);

      y += 4;
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(margin, y, contentW, 4, 2, 2, "F");
      const barW = (score / 100) * contentW;
      if (score >= 90) doc.setFillColor(52, 211, 153);
      else if (score >= 50) doc.setFillColor(251, 191, 36);
      else doc.setFillColor(248, 113, 113);
      doc.roundedRect(margin, y, barW, 4, 2, 2, "F");
      y += 10;
    }

    y += 6;

    // Problemas por pilar
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(241, 245, 249);
    checkPage(16);
    doc.text("O que corrigir e como fazer", margin, y);
    y += 10;

    for (const pilar of ["conversao", "clareza", "confianca", "visibilidade"]) {
      const itens = problemas.filter((a: any) => a.pilar === pilar);
      if (itens.length === 0) continue;

      checkPage(16);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(251, 191, 36);
      doc.text(pilarLabel[pilar], margin, y);
      y += 8;

      for (const item of itens) {
        const solucao = SOLUCOES[item.titulo] || item.detalhe;
        const solucaoLines = doc.splitTextToSize(solucao, contentW - 8);
        const boxH = 8 + solucaoLines.length * 5 + 10;

        checkPage(boxH);
        doc.setFillColor(30, 41, 59);
        doc.roundedRect(margin, y, contentW, boxH, 4, 4, "F");
        doc.setFillColor(251, 191, 36);
        doc.rect(margin, y, 3, boxH, "F");

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(241, 245, 249);
        doc.text(item.titulo, margin + 8, y + 7);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text(solucaoLines, margin + 8, y + 13);

        y += boxH + 5;
      }

      y += 4;
    }

    // Rodapé
    checkPage(20);
    doc.setFillColor(30, 41, 59);
    doc.rect(0, y, 210, 25, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("Precisa de ajuda para implementar essas melhorias?", margin, y + 8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(251, 191, 36);
    doc.text("Fale com a Ascenda Web · ascendaweb.com.br", margin, y + 15);

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