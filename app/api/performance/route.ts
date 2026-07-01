import { NextRequest, NextResponse } from "next/server";
import type { ResultadoPerformance } from "@/app/types";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

const PAGESPEED_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export async function POST(req: NextRequest) {
  try {
    const body     = await req.json();
    const urlInput = (body?.url || "").toString();
    const slug     = (body?.slug || "").toString().trim();

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

    const lcpMs  = audits?.["largest-contentful-paint"]?.numericValue;
    const fcpMs  = audits?.["first-contentful-paint"]?.numericValue;
    const clsVal = audits?.["cumulative-layout-shift"]?.numericValue;
    const ttfbMs = audits?.["server-response-time"]?.numericValue;
    const tbtMs  = audits?.["total-blocking-time"]?.numericValue;

    console.log("PAGESPEED — score:", typeof score === "number" ? Math.round(score * 100) : "n/a");

    const performanceData: ResultadoPerformance = {
      disponivel:  true,
      scoreMobile: typeof score === "number" ? Math.round(score * 100) : undefined,
      lcpMs:  typeof lcpMs  === "number" ? Math.round(lcpMs)  : undefined,
      fcpMs:  typeof fcpMs  === "number" ? Math.round(fcpMs)  : undefined,
      clsVal: typeof clsVal === "number" ? clsVal              : undefined,
      ttfbMs: typeof ttfbMs === "number" ? Math.round(ttfbMs) : undefined,
      tbtMs:  typeof tbtMs  === "number" ? Math.round(tbtMs)  : undefined,
      lcp:  audits?.["largest-contentful-paint"]?.displayValue,
      fcp:  audits?.["first-contentful-paint"]?.displayValue,
      cls:  audits?.["cumulative-layout-shift"]?.displayValue,
      ttfb: typeof audits?.["server-response-time"]?.numericValue === "number"
        ? `${Math.round(audits["server-response-time"].numericValue)} ms`
        : undefined,
      tbt:  audits?.["total-blocking-time"]?.displayValue,
    };

    if (slug && performanceData.scoreMobile !== undefined) {
      try {
        await getSupabase().from("analises").update({
          score_performance: performanceData.scoreMobile,
          lcp: performanceData.lcp,
          fcp: performanceData.fcp,
          cls: performanceData.cls,
          tbt: performanceData.tbt,
          ttfb: performanceData.ttfb,
        }).eq("slug", slug);
      } catch (err) {
        console.error("Erro ao salvar performance:", err);
      }
    }

    return NextResponse.json(performanceData);

  } catch (err) {
    console.log("PAGESPEED — erro geral:", err);
    return NextResponse.json({ disponivel: false } as ResultadoPerformance);
  }
}