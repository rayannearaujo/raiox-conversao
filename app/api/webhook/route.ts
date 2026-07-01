import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature inválida:", err);
    return NextResponse.json({ erro: "Assinatura inválida." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const slug = session.metadata?.slug;
    const emailCliente = session.customer_email;

    if (slug) {
      // Marca como pago
      await getSupabase()
        .from("analises")
        .update({ pago: true })
        .eq("slug", slug);

      console.log(`Análise ${slug} marcada como paga.`);

      // Busca email do lead se não veio do Stripe
      let emailDestino = emailCliente;
      if (!emailDestino) {
        const { data: lead } = await getSupabase()
          .from("leads")
          .select("email")
          .eq("analise_id", slug)
          .order("criado_em", { ascending: false })
          .limit(1)
          .single();
        emailDestino = lead?.email ?? null;
      }

      // Gera o PDF
      if (emailDestino) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://raiox.ascendaweb.com";
          const pdfRes = await fetch(`${baseUrl}/api/gerar-pdf`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug }),
          });

          if (pdfRes.ok) {
            const pdfBuffer = await pdfRes.arrayBuffer();
            const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

            const resend = new Resend(process.env.RESEND_API_KEY!);
            await resend.emails.send({
              from: "Ascenda Web <hello@ascendaweb.com>",
              to: emailDestino,
              subject: "Seu Plano de Ação está aqui 🎯",
              text: `Olá! Aqui está o seu Plano de Ação personalizado com as melhorias para o seu site.\n\nO PDF está em anexo. Priorize os itens do pilar com menor score primeiro.\n\nQualquer dúvida, responda este email.\n\nAscenda Web\nhello@ascendaweb.com`,
              attachments: [
                {
                  filename: `plano-de-acao-${slug}.pdf`,
                  content: pdfBase64,
                },
              ],
            });

            console.log(`PDF enviado para ${emailDestino}`);
          }
        } catch (err) {
          console.error("Erro ao gerar/enviar PDF:", err);
        }
      }
    }
  }

  return NextResponse.json({ recebido: true });
}