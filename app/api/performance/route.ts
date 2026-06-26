import { NextRequest, NextResponse } from "next/server";
import type { ResultadoPerformance } from "@/app/types";

export const runtime = "nodejs";

const PAGESPEED_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export async function POST(req: NextRequest) {
  try {
    const body     = await req.json();
    const urlInput = (body?.url || "").toString();

    if (!urlInput) {
      return NextResponse.json({ disponivel: false } as ResultadoPerformance);
    }

    const apiKey = process.env.PAGESPEED_API_KEY;
    const params = new URLSearchParams({
      url:      urlInput,
      strategy: "mobile",
      category: "performance",
    });
    if (apiKey) params.set("key", apiKey);

    console.log("PAGESPEED — iniciando:", urlInput);

    let res: Response;
    try {
      res = await fetch(`${PAGESPEED_ENDPOINT}?${params.toString()}`);
    } catch (err) {
      console.log("PAGESPEED — erro de rede:", err);
      return NextResponse.json({ disponivel: false } as ResultadoPerformance);
    }

    if (!res.ok) {
      console.log("PAGESPEED — status:", res.status);
      return NextResponse.json({ disponivel: false } as ResultadoPerformance);
    }

    const data   = await res.json();
    const score  = data?.lighthouseResult?.categories?.performance?.score;
    const audits = data?.lighthouseResult?.audits;

    // Valores numéricos brutos (para calcular a cor no frontend)
    const lcpMs  = audits?.["largest-contentful-paint"]?.numericValue;
    const fcpMs  = audits?.["first-contentful-paint"]?.numericValue;
    const clsVal = audits?.["cumulative-layout-shift"]?.numericValue;
    const ttfbMs = audits?.["server-response-time"]?.numericValue;
    const tbtMs  = audits?.["total-blocking-time"]?.numericValue;

    console.log("PAGESPEED — score:", typeof score === "number" ? Math.round(score * 100) : "n/a");

    return NextResponse.json({
      disponivel:  true,
      scoreMobile: typeof score === "number" ? Math.round(score * 100) : undefined,
      // Valores brutos
      lcpMs:  typeof lcpMs  === "number" ? Math.round(lcpMs)  : undefined,
      fcpMs:  typeof fcpMs  === "number" ? Math.round(fcpMs)  : undefined,
      clsVal: typeof clsVal === "number" ? clsVal              : undefined,
      ttfbMs: typeof ttfbMs === "number" ? Math.round(ttfbMs) : undefined,
      tbtMs:  typeof tbtMs  === "number" ? Math.round(tbtMs)  : undefined,
      // displayValues formatados
      lcp:  audits?.["largest-contentful-paint"]?.displayValue,
      fcp:  audits?.["first-contentful-paint"]?.displayValue,
      cls:  audits?.["cumulative-layout-shift"]?.displayValue,
      ttfb: typeof audits?.["server-response-time"]?.numericValue === "number"
  ? `${Math.round(audits["server-response-time"].numericValue)} ms`
  : undefined,
      tbt:  audits?.["total-blocking-time"]?.displayValue,
    } as ResultadoPerformance);

  } catch (err) {
    console.log("PAGESPEED — erro geral:", err);
    return NextResponse.json({ disponivel: false } as ResultadoPerformance);
  }
}
