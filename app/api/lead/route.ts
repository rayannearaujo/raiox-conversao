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
      text: [
        `Novo lead capturado pelo Raio-X de Conversão`,
        ``,
        `Nome: ${nome || "(não informado)"}`,
        `E-mail: ${email}`,
        `WhatsApp: ${whatsapp}`,
        `Site analisado: ${url}`,
        `Score geral: ${score ?? "n/d"}`,
        ``,
        `Data: ${new Date().toLocaleString("pt-BR", { timeZone: "America/Fortaleza" })}`,
      ].join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro ao enviar lead:", err);
    // Mesmo se o envio de e-mail falhar, não bloqueamos a experiência do usuário.
    return NextResponse.json({ ok: true, aviso: "Lead processado com ressalvas." });
  }
}
