import { NextRequest, NextResponse } from "next/server";
import type { ResultadoPerformance } from "@/app/types";

export const runtime = "nodejs";

const PAGESPEED_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

async function consultarPageSpeed(url: string, strategy: "mobile" | "desktop") {
  const apiKey = process.env.PAGESPEED_API_KEY;
  const params = new URLSearchParams({
    url,
    strategy,
    category: "performance",
  });
  if (apiKey) params.set("key", apiKey);

  const controller = new AbortController();
 const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(`${PAGESPEED_ENDPOINT}?${params.toString()}`, {
      signal: controller.signal,
    });
    if (!res.ok) {
  const erro = await res.text();
  console.log("PAGESPEED ERROR:");
  console.log(erro);
  return null;
}
    const data = await res.json();
    return data;
    } catch (error) {
    console.log("PAGESPEED FETCH FALHOU:", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function extrairMetricas(data: any) {
  const score = data?.lighthouseResult?.categories?.performance?.score;
  const audits = data?.lighthouseResult?.audits;
  return {
    score: typeof score === "number" ? Math.round(score * 100) : undefined,
    lcp: audits?.["largest-contentful-paint"]?.displayValue,
    cls: audits?.["cumulative-layout-shift"]?.displayValue,
    fcp: audits?.["first-contentful-paint"]?.displayValue,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const urlInput = (body?.url || "").toString();
    if (!urlInput) {
      return NextResponse.json({ disponivel: false, mensagem: "URL ausente." } as ResultadoPerformance);
    }

    const mobileData = await consultarPageSpeed(urlInput, "mobile");

    if (!mobileData) {
      const resultado: ResultadoPerformance = {
        disponivel: false,
        mensagem:
          "A análise de velocidade detalhada não pôde ser concluída agora, mas isso não impacta o restante do seu diagnóstico.",
      };
      return NextResponse.json(resultado);
    }

    const mobileMetrics = extrairMetricas(mobileData);
    const desktopMetrics = undefined;

    const resultado: ResultadoPerformance = {
  disponivel: true,
  scoreMobile: mobileMetrics.score,
  scoreDesktop: undefined,
  lcp: mobileMetrics.lcp,
  cls: mobileMetrics.cls,
  fcp: mobileMetrics.fcp,
};
    return NextResponse.json(resultado);
  } catch {
    const resultado: ResultadoPerformance = {
      disponivel: false,
      mensagem: "A análise de velocidade detalhada não pôde ser concluída agora.",
    };
    return NextResponse.json(resultado);
  }
}
