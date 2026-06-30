"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import LoadingState from "@/app/components/LoadingState";
import ResultadoParcial from "@/app/components/ResultadoParcial";
import ResultadoCompleto from "@/app/components/ResultadoCompleto";
import { getSupabase } from "@/lib/supabase";
import type { ResultadoAnalise, ResultadoPerformance } from "@/app/types";

type Estado = "loading" | "naoEncontrado" | "parcial" | "completo";

export default function ResultadoPage() {
  const params = useParams();
const slug = params?.slug as string;

  const [estado, setEstado] = useState<Estado>("loading");
  const [darkMode] = useState(true);
  const [resultado, setResultado] = useState<ResultadoAnalise | null>(null);
  const [performance, setPerformance] = useState<ResultadoPerformance | null>(null);

  useEffect(() => {
    async function buscar() {
      const { data, error } = await getSupabase()
        .from("analises")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        setEstado("naoEncontrado");
        return;
      }

      const achados = typeof data.achados === "string"
        ? JSON.parse(data.achados)
        : data.achados ?? [];

      const resultadoFormatado: ResultadoAnalise = {
        id: data.id,
        slug: data.slug,
        url: data.url,
        tipoSite: data.tipo_site,
        scoreGeral: data.score_geral,
        scoreConversao: data.score_conversao,
        scoreClareza: data.score_clareza,
        scoreConfianca: data.score_confianca,
        scoreVisibilidade: data.score_visibilidade,
        pilarMaisFraco: data.pilar_mais_fraco,
        oportunidadePrincipal: data.oportunidade_principal,
        achados,
      };

      setResultado(resultadoFormatado);
      setEstado(data.pago ? "completo" : "parcial");

      fetch("/api/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: data.url }),
      })
        .then((r) => r.json())
        .then((perf: ResultadoPerformance) => setPerformance(perf))
        .catch(() =>
          setPerformance({
            disponivel: false,
            mensagem: "Análise de velocidade em processamento.",
          })
        );
    }

    if (slug) buscar();
}, [slug]);

  const pageBg = darkMode ? "bg-[#070b14] text-white" : "bg-[#f7f4ef] text-slate-950";

  if (estado === "naoEncontrado") {
    return (
      <main className={`min-h-screen flex items-center justify-center ${pageBg}`}>
        <p className="text-center text-slate-400">
          Não encontramos essa análise. O link pode ter expirado ou estar incorreto.
        </p>
      </main>
    );
  }

  return (
    <main className={`relative min-h-screen overflow-hidden ${pageBg}`}>
      <div className="relative z-10 min-h-screen max-w-5xl mx-auto px-5 pt-[30px] pb-[70px] flex items-center justify-center">
        {estado === "loading" && <LoadingState />}

        {estado === "parcial" && resultado && (
          <ResultadoParcial
            resultado={resultado}
            darkMode={darkMode}
            onCapturado={() => setEstado("completo")}
          />
        )}

        {estado === "completo" && resultado && (
          <ResultadoCompleto
            resultado={resultado}
            performance={performance}
            darkMode={darkMode}
          />
        )}
      </div>
    </main>
  );
}
