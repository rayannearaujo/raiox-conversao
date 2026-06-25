import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nome = (body?.nome || "").toString().trim();
    const email = (body?.email || "").toString().trim();
    const whatsapp = (body?.whatsapp || "").toString().trim();
    const url = (body?.url || "").toString().trim();
    const score = body?.score;
    const analise = body?.analise;

    const linhasAchados = analise?.achados
  ?.map((a: { ok: boolean; titulo: string; detalhe: string }) =>
    `${a.ok ? "✅" : "❌"} ${a.titulo}\n   ${a.detalhe}`
  )
  .join("\n\n") ?? "";

const emailBody = [
  `Novo lead capturado pelo Raio-X de Conversão`,
  ``,
  `Nome: ${nome || "(não informado)"}`,
  `E-mail: ${email}`,
  `WhatsApp: ${whatsapp}`,
  `Site analisado: ${url}`,
  `Score geral: ${score ?? "n/d"}`,
  `Data: ${new Date().toLocaleString("pt-BR", { timeZone: "America/Fortaleza" })}`,
  ``,
  `─────────────────────────────`,
  `RELATÓRIO COMPLETO`,
  `─────────────────────────────`,
  `Conversão: ${analise?.scoreConversao ?? "n/d"}`,
  `Clareza:   ${analise?.scoreClareza ?? "n/d"}`,
  `Confiança: ${analise?.scoreConfianca ?? "n/d"}`,
  `Visib.:    ${analise?.scoreVisibilidade ?? "n/d"}`,
  ``,
  linhasAchados,
].join("\n");

    if (!email || !email.includes("@") || !whatsapp) {
      return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const destinatario = process.env.LEAD_NOTIFICATION_EMAIL;

    if (!apiKey || !destinatario) {
      // Permite rodar localmente / sem env configurada sem quebrar o fluxo do usuário.
      console.log("LEAD CAPTURADO (Resend não configurado):", { nome, email, whatsapp, url, score });
      return NextResponse.json({ ok: true, aviso: "Resend não configurado, lead apenas logado." });
    }

    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: "Raio-X de Conversão <onboarding@resend.dev>",
      to: destinatario,
      subject: `Novo lead no Raio-X: ${url}`,
      text: emailBody,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro ao enviar lead:", err);
    // Mesmo se o envio de e-mail falhar, não bloqueamos a experiência do usuário.
    return NextResponse.json({ ok: true, aviso: "Lead processado com ressalvas." });
  }
}
