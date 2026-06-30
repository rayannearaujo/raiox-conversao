import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabase } from "@/lib/supabase";

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
    const analiseId = (body?.analiseId || "").toString().trim() || null;

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

    // Salva o lead no Supabase
    try {
      await getSupabase().from("leads").insert({
        nome,
        email,
        whatsapp,
        url,
        score,
        analise_id: analiseId,
      });
    } catch (err) {
      console.error("Erro ao salvar lead no Supabase:", err);
      // Não bloqueia o fluxo do usuário se o Supabase falhar.
    }

    const apiKey = process.env.RESEND_API_KEY;
    const destinatario = process.env.LEAD_NOTIFICATION_EMAIL;

    if (!apiKey || !destinatario) {
      console.log("LEAD CAPTURADO (Resend não configurado):", { nome, email, whatsapp, url, score });
      return NextResponse.json({ ok: true, aviso: "Resend não configurado, lead apenas logado." });
    }

    const resend = new Resend(apiKey);

    const emailsTeste = ["ascendaweb@gmail.com"];

    if (emailsTeste.includes(email)) {
      console.log("EMAIL DE TESTE — não enviado ao Resend:", emailBody);
      return NextResponse.json({ ok: true, aviso: "Email de teste, não enviado." });
    }

    await resend.emails.send({
      from: "Raio-X de Conversão <onboarding@resend.dev>",
      to: destinatario,
      subject: `Novo lead no Raio-X: ${url}`,
      text: emailBody,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro ao enviar lead:", err);
    return NextResponse.json({ ok: true, aviso: "Lead processado com ressalvas." });
  }
}