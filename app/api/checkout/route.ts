import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = (body?.slug || "").toString().trim();
    const email = (body?.email || "").toString().trim();

    if (!slug) {
      return NextResponse.json({ erro: "Slug não informado." }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const priceId = process.env.STRIPE_PRICE_ID!;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://raiox.ascendaweb.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      success_url: `${baseUrl}/resultado/${slug}?pago=true`,
      cancel_url: `${baseUrl}/resultado/${slug}`,
      metadata: { slug },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Erro ao criar checkout:", err);
    return NextResponse.json({ erro: "Não foi possível iniciar o pagamento." }, { status: 500 });
  }
}