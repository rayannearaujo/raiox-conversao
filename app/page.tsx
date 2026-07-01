"use client";

import { useState } from "react";
import LoadingState from "./components/LoadingState";
import ResultadoParcial from "./components/ResultadoParcial";
import ResultadoCompleto from "./components/ResultadoCompleto";
import type { ResultadoAnalise, ResultadoPerformance } from "./types";

type Estado = "idle" | "loading" | "parcial" | "completo";

export default function Home() {
  const [estado, setEstado] = useState<Estado>("idle");
  const [darkMode, setDarkMode] = useState(true);
  const [urlInput, setUrlInput] = useState("");
  const [resultado, setResultado] = useState<ResultadoAnalise | null>(null);
  const [performance, setPerformance] = useState<ResultadoPerformance | null>(null);
  const [erroForm, setErroForm] = useState("");

  async function handleAnalisar(e: React.FormEvent) {
    e.preventDefault();
    setErroForm("");

    if (!urlInput || urlInput.trim().length < 3) {
      setErroForm("Digite o endereço do seu site.");
      return;
    }

    setEstado("loading");

    try {
      const res = await fetch("/api/analisar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });

      const data: ResultadoAnalise = await res.json();
      setResultado(data);
      setEstado("parcial");

      fetch("/api/performance", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url: data.url, slug: data.slug }),
})
        .then((r) => r.json())
        .then((perf: ResultadoPerformance) => setPerformance(perf))
        .catch(() =>
          setPerformance({
            disponivel: false,
            mensagem: "Análise de velocidade em processamento.",
          })
        );
    } catch {
      setErroForm("Não foi possível analisar agora. Tente novamente.");
      setEstado("idle");
    }
  }

  function handleNovaAnalise() {
    setEstado("idle");
    setUrlInput("");
    setResultado(null);
    setPerformance(null);
  }

  const pageBg = darkMode
    ? "bg-[#070b14] text-white"
    : "bg-[#f7f4ef] text-slate-950";

  return (
    <main
      className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${pageBg}`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={darkMode ? "conversion-bg-dark" : "conversion-bg-light"} />
        <div className={darkMode ? "conversion-grid-dark" : "conversion-grid-light"} />

        <div
          className={
            darkMode
              ? "absolute inset-0 bg-gradient-to-b from-[#070b14]/10 via-[#070b14]/60 to-[#070b14]"
              : "absolute inset-0 bg-gradient-to-b from-[#f7f4ef]/10 via-[#f7f4ef]/70 to-[#f7f4ef]"
          }
        />
      </div>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-5 right-5 z-50 rounded-full px-4 py-2 text-xs font-semibold border backdrop-blur-md transition ${
          darkMode
            ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            : "border-slate-300 bg-white/70 text-slate-800 hover:bg-white"
        }`}
      >
        {darkMode ? "☀️ Versão clara" : "🌙 Versão escura"}
      </button>

      <div className="relative z-10 min-h-screen max-w-5xl mx-auto px-5 pt-[30px] pb-[70px] flex items-center justify-center">
        {estado === "idle" && (
          <div className="w-full flex flex-col items-center text-center animate-fade-in-up">
            <span
              className={
                darkMode
                  ? "text-xs font-semibold tracking-widest uppercase text-amber-300 mb-4"
                  : "text-xs font-semibold tracking-widest uppercase text-amber-600 mb-4"
              }
            >
              Ascenda Web
            </span>

            <h1 className="text-3xl sm:text-6xl font-bold max-w-6xl leading-[1.05] mb-5">
              Descubra por que seu site não está gerando os clientes que deveria
            </h1>

            <p
              className={
                darkMode
                  ? "text-slate-400 text-base sm:text-lg max-w-2xl mb-10"
                  : "text-slate-600 text-base sm:text-lg max-w-2xl mb-10"
              }
            >
              Cole o endereço do seu site e descubra os principais fatores que estão impedindo você de vender mais.
            </p>

            <form
              onSubmit={handleAnalisar}
              className={`w-full max-w-2xl flex flex-col sm:flex-row gap-3 rounded-2xl p-2 border backdrop-blur-xl ${
                darkMode
                  ? "bg-slate-950/70 border-white/10"
                  : "bg-white/80 border-slate-200 shadow-xl"
              }`}
            >
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="www.seusite.com.br"
                className={`flex-1 rounded-xl px-5 py-4 text-base outline-none transition ${
                  darkMode
                    ? "bg-slate-900 text-white placeholder:text-slate-500 border border-slate-800 focus:border-amber-300"
                    : "bg-white text-slate-950 placeholder:text-slate-400 border border-slate-200 focus:border-amber-500"
                }`}
              />

              <button
                type="submit"
                className="bg-amber-300 hover:bg-amber-200 text-slate-950 font-semibold rounded-xl px-6 py-4 transition whitespace-nowrap"
              >
                Gerar meu Raio-X grátis
              </button>
            </form>

            {erroForm && <p className="text-red-400 text-sm mt-3">{erroForm}</p>}

            <p className="text-xs text-slate-500 mt-5">
              100% gratuito · Sem cartão de crédito · Resultado em segundos
            </p>
          </div>
        )}

        {estado === "loading" && <LoadingState />}

        {estado === "parcial" && resultado && (
          <ResultadoParcial
            resultado={resultado}
            darkMode={darkMode}
            onCapturado={() => setEstado("completo")}
          />
        )}

        {estado === "completo" && resultado && (
          <div className="w-full">
            <ResultadoCompleto
              resultado={resultado}
              performance={performance}
              darkMode={darkMode}
            />

            <div className="text-center -mt-10 pb-4">
              <button
                onClick={handleNovaAnalise}
                className={
                  darkMode
                    ? "text-sm text-slate-500 hover:text-slate-300 underline transition"
                    : "text-sm text-slate-500 hover:text-slate-800 underline transition"
                }
              >
                Analisar outro site
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .conversion-bg-dark,
        .conversion-bg-light {
          position: absolute;
          inset: 0;
        }

        .conversion-bg-dark {
          background:
            radial-gradient(circle at 18% 22%, rgba(251, 191, 36, 0.18), transparent 32%),
            radial-gradient(circle at 82% 30%, rgba(16, 185, 129, 0.12), transparent 30%),
            radial-gradient(circle at 50% 82%, rgba(96, 165, 250, 0.12), transparent 34%);
        }

        .conversion-bg-light {
          background:
            radial-gradient(circle at 18% 22%, rgba(251, 191, 36, 0.28), transparent 32%),
            radial-gradient(circle at 82% 30%, rgba(16, 185, 129, 0.18), transparent 30%),
            radial-gradient(circle at 50% 82%, rgba(96, 165, 250, 0.16), transparent 34%);
        }

        .conversion-grid-dark,
        .conversion-grid-light {
          position: absolute;
          inset: 0;
          background-size: 90px 90px;
          animation: gridMove 18s linear infinite;
        }

        .conversion-grid-dark {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
        }

        .conversion-grid-light {
          background-image:
            linear-gradient(rgba(15, 23, 42, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.07) 1px, transparent 1px);
        }

        @keyframes gridMove {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(90px);
          }
        }
      `}</style>
    </main>
  );
}