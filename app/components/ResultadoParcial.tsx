"use client";

import { useState } from "react";
import ScoreGauge from "./ScoreGauge";
import { PILAR_LABEL, type ResultadoAnalise } from "@/app/types";

const paises = [
  { flag: "🇧🇷", ddi: "+55", codigo: "BR", placeholder: "(11) 99999-9999", maxDigits: 11 },
  { flag: "🇵🇹", ddi: "+351", codigo: "PT", placeholder: "912 345 678", maxDigits: 9 },
  { flag: "🇮🇪", ddi: "+353", codigo: "IE", placeholder: "87 123 4567", maxDigits: 9 },
  { flag: "🇬🇧", ddi: "+44", codigo: "GB", placeholder: "7911 123456", maxDigits: 10 },
  { flag: "🇺🇸", ddi: "+1", codigo: "US", placeholder: "(555) 000-0000", maxDigits: 10 },
];

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
  const [paisSelecionado, setPaisSelecionado] = useState(paises[0]);
  const [dropdownAberto, setDropdownAberto] = useState(false);

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

    if (whatsapp.replace(/\D/g, "").length < (paisSelecionado.codigo === "BR" ? 10 : 8)) {
      setErro("Informe um WhatsApp válido.");
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
  whatsapp: `${paisSelecionado.ddi} ${whatsapp}`,
  url: resultado.url,
  score: resultado.scoreGeral,
  analise: resultado,
  analiseId: resultado.id,
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
            {/* Botão da bandeira */}
            <button
              type="button"
              onClick={() => setDropdownAberto((v) => !v)}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-lg focus:outline-none"
            >
              {paisSelecionado.flag}
              <span className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>▾</span>
            </button>

            {/* Dropdown */}
            {dropdownAberto && (
              <div className={`absolute left-0 top-full mt-1 z-50 rounded-xl shadow-lg border overflow-hidden ${
                darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
              }`}>
                {paises.map((pais) => (
                  <button
                    key={pais.codigo}
                    type="button"
                    onClick={() => {
                      setPaisSelecionado(pais);
                      setDropdownAberto(false);
                      setWhatsapp("");
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-amber-300/20 transition-colors ${
                      darkMode ? "text-white" : "text-slate-950"
                    }`}
                  >
                    <span>{pais.flag}</span>
                    <span>{pais.ddi}</span>
                    <span className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{pais.codigo}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <input
              type="tel"
              required
              placeholder={paisSelecionado.placeholder}
              value={whatsapp}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, paisSelecionado.maxDigits);
                if (paisSelecionado.codigo === "BR") {
                  let masked = digits;
                  if (digits.length > 2) masked = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
                  if (digits.length > 7) masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
                  setWhatsapp(masked);
                } else {
                  setWhatsapp(digits);
                }
              }}
              className={`w-full border rounded-xl pl-16 pr-4 py-3 focus:outline-none transition-colors ${inputClass}`}
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