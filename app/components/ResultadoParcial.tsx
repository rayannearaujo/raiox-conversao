"use client";

import { useState } from "react";
import ScoreGauge from "./ScoreGauge";
import { PILAR_LABEL, type ResultadoAnalise } from "@/app/types";

export default function ResultadoParcial({
  resultado,
  darkMode,
  onCapturado,
}: {
  resultado: ResultadoAnalise;
  darkMode: boolean;
  onCapturado: (dados: { nome: string; email: string; whatsapp: string }) => void;
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const cardClass = darkMode
    ? "bg-slate-900/60 border border-slate-800"
    : "bg-white/85 border border-slate-200 shadow-xl";

  const titleClass = darkMode ? "text-white" : "text-slate-950";
  const textClass = darkMode ? "text-slate-400" : "text-slate-600";
  const inputClass = darkMode
    ? "bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-300"
    : "bg-white border-slate-300 text-slate-950 placeholder:text-slate-400 focus:border-amber-500";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!nome.trim()) {
      setErro("Informe seu nome.");
      return;
    }

    if (!email.includes("@") || email.length < 5) {
      setErro("Informe um e-mail válido.");
      return;
    }

    if (whatsapp.replace(/\D/g, "").length < 10) {
      setErro("Informe um WhatsApp válido com DDD.");
      return;
    }

    setEnviando(true);

try {
  await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome,
      email,
      whatsapp,
      url: resultado.url,
      score: resultado.scoreGeral,
      analise: resultado,
    }),
  });
} catch {
  // Não bloqueia o usuário mesmo se o envio falhar.
} finally {
  setEnviando(false);
  onCapturado({ nome, email, whatsapp });
}
  }

  return (
    <div className="w-full max-w-xl mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
        <ScoreGauge
  score={resultado.scoreGeral}
  label="Score inicial do seu site"
  darkMode={darkMode}
/>
      </div>

      <div className={`${cardClass} rounded-2xl p-6 mb-8`}>
        <p className="text-xs uppercase tracking-wide text-amber-400 font-semibold mb-2">
          Pilar mais frágil: {PILAR_LABEL[resultado.pilarMaisFraco]}
        </p>
        <p className={`${titleClass} text-base leading-relaxed`}>
          {resultado.oportunidadePrincipal}
        </p>
      </div>

      <div className={`${cardClass} rounded-2xl p-6 sm:p-8`}>
        <h3 className={`text-xl font-semibold mb-2 ${titleClass}`}>
          Seu diagnóstico completo está pronto
        </h3>

        <p className={`text-sm mb-6 ${textClass}`}>
          Preencha os dados abaixo para liberar a análise completa e ver os principais pontos que
          podem estar limitando suas conversões.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            required
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={`border rounded-xl px-4 py-3 focus:outline-none transition-colors ${inputClass}`}
          />

          <input
            type="email"
            required
            placeholder="Seu melhor e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`border rounded-xl px-4 py-3 focus:outline-none transition-colors ${inputClass}`}
          />

         <div className="relative">
  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🇧🇷</span>
  <input
    type="tel"
    required
    placeholder="(11) 99999-9999"
    value={whatsapp}
    onChange={(e) => {
      const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
      let masked = digits;
      if (digits.length > 2) masked = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      if (digits.length > 7) masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
      setWhatsapp(masked);
    }}
    className={`w-full border rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-colors ${inputClass}`}
  />
</div>

          {erro && <p className="text-red-400 text-sm">{erro}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="mt-2 bg-amber-300 hover:bg-amber-200 disabled:opacity-60 text-slate-950 font-semibold rounded-xl px-6 py-3 transition-colors"
          >
            {enviando ? "Liberando diagnóstico..." : "Ver diagnóstico completo"}
          </button>
        </form>

        <p className={`text-xs mt-4 text-center ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
          Usamos seus dados apenas para liberar o diagnóstico e falar sobre melhorias no seu site.
        </p>
      </div>
    </div>
  );
}