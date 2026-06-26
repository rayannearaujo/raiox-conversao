"use client";

import ScoreGauge from "./ScoreGauge";
import {
  TIPO_SITE_LABEL,
  type Achado,
  type ResultadoAnalise,
  type ResultadoPerformance,
} from "@/app/types";

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_AGENDAMENTO_URL ||
  "https://calendly.com/ascendaweb/new-meeting";

function getNivel(score: number) {
  if (score < 50) return "Crítico";
  if (score < 90) return "Atenção";
  return "Saudável";
}

function corScore(score: number) {
  if (score >= 90) return "#34d399";
  if (score >= 50) return "#fbbf24";
  return "#f87171";
}

// ── Cores por métrica com base nos limites do Google ──────────────────────
function corLcp(ms?: number) {
  if (ms === undefined) return "#94a3b8";
  if (ms <= 2500) return "#34d399";   // bom
  if (ms <= 4000) return "#fbbf24";   // atenção
  return "#f87171";                    // ruim
}
function corFcp(ms?: number) {
  if (ms === undefined) return "#94a3b8";
  if (ms <= 1800) return "#34d399";
  if (ms <= 3000) return "#fbbf24";
  return "#f87171";
}
function corCls(val?: number) {
  if (val === undefined) return "#94a3b8";
  if (val <= 0.1)  return "#34d399";
  if (val <= 0.25) return "#fbbf24";
  return "#f87171";
}
function corTtfb(ms?: number) {
  if (ms === undefined) return "#94a3b8";
  if (ms <= 800)  return "#34d399";
  if (ms <= 1800) return "#fbbf24";
  return "#f87171";
}
function corTbt(ms?: number) {
  if (ms === undefined) return "#94a3b8";
  if (ms <= 200) return "#34d399";
  if (ms <= 600) return "#fbbf24";
  return "#f87171";
}

// ── Componentes base ──────────────────────────────────────────────────────

function BarraScore({
  titulo,
  score,
  darkMode,
}: {
  titulo: string;
  score: number;
  darkMode: boolean;
}) {
  return (
    <div>
      <div className="flex justify-between mb-2 gap-4">
        <span className={`text-sm font-medium ${darkMode ? "text-slate-100" : "text-slate-700"}`}>
          {titulo}
        </span>
        <span className={`text-sm font-bold ${darkMode ? "text-white" : "text-slate-950"}`}>
          {score}/100 · {getNivel(score)}
        </span>
      </div>
      <div className={`h-3 rounded-full overflow-hidden ${darkMode ? "bg-slate-800" : "bg-slate-200"}`}>
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${score}%`, background: corScore(score) }}
        />
      </div>
    </div>
  );
}

function ItemAchado({ achado, darkMode }: { achado: Achado; darkMode: boolean }) {
  return (
    <div
      className={`flex items-start gap-3 py-3 border-b last:border-0 ${
        darkMode ? "border-slate-800" : "border-slate-200"
      }`}
    >
      <span
        className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
          achado.ok
            ? "bg-emerald-400/20 text-emerald-500"
            : "bg-amber-400/20 text-amber-500"
        }`}
      >
        {achado.ok ? "✓" : "!"}
      </span>
      <div>
        <p className={`text-sm font-medium ${darkMode ? "text-slate-100" : "text-slate-950"}`}>
          {achado.titulo}
        </p>
        <p className={`text-sm mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
          {achado.detalhe}
        </p>
      </div>
    </div>
  );
}

function BlocoPilar({
  titulo,
  score,
  achados,
  darkMode,
}: {
  titulo: string;
  score: number;
  achados: Achado[];
  darkMode: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-6 border ${
        darkMode
          ? "bg-slate-900/60 border-slate-800"
          : "bg-white/85 border-slate-200 shadow-xl"
      }`}
    >
      <div className="mb-5">
        <BarraScore titulo={titulo} score={score} darkMode={darkMode} />
      </div>
      <div>
        {achados.map((a, i) => (
          <ItemAchado key={i} achado={a} darkMode={darkMode} />
        ))}
      </div>
    </div>
  );
}

// ── Card de métrica individual com valor colorido ─────────────────────────

function MetricaCard({
  valor,
  cor,
  rotulo,
  descricao,
  darkMode,
}: {
  valor?: string;
  cor: string;
  rotulo: string;
  descricao: string;
  darkMode: boolean;
}) {
  return (
    <div className={`rounded-2xl p-4 ${darkMode ? "bg-slate-950/70" : "bg-slate-50"}`}>
      <p className="text-2xl font-bold leading-none" style={{ color: cor }}>
        {valor ?? "—"}
      </p>
      <p className={`text-xs font-medium mt-1.5 ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
        {rotulo}
      </p>
      <p className={`text-xs mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
        {descricao}
      </p>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────

export default function ResultadoCompleto({
  resultado,
  performance,
  darkMode,
}: {
  resultado: ResultadoAnalise;
  performance: ResultadoPerformance | null;
  darkMode: boolean;
}) {
  const achadosConversao    = resultado.achados.filter((a) => a.pilar === "conversao");
  const achadosClareza      = resultado.achados.filter((a) => a.pilar === "clareza");
  const achadosConfianca    = resultado.achados.filter((a) => a.pilar === "confianca");
  const achadosVisibilidade = resultado.achados.filter((a) => a.pilar === "visibilidade");

  const carregando = performance === null;

  const scorePerformance =
    performance?.disponivel && typeof performance.scoreMobile === "number"
      ? performance.scoreMobile
      : 80;

  const potencialConversao = Math.round(
    resultado.scoreConversao    * 0.3  +
    resultado.scoreClareza      * 0.3  +
    resultado.scoreConfianca    * 0.15 +
    resultado.scoreVisibilidade * 0.05 +
    scorePerformance            * 0.2
  );

  const cardClass      = darkMode ? "bg-slate-900/60 border-slate-800"  : "bg-white/85 border-slate-200 shadow-xl";
  const innerCardClass = darkMode ? "bg-slate-950/70 border-slate-800"  : "bg-slate-50 border-slate-200";
  const titleClass     = darkMode ? "text-white"                        : "text-slate-950";
  const textClass      = darkMode ? "text-slate-400"                    : "text-slate-600";
  const softTextClass  = darkMode ? "text-slate-500"                    : "text-slate-500";

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in-up pb-20">

      {/* Cabeçalho */}
      <section className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold mb-3">
          Raio-X do seu site
        </p>
        <h1 className={`text-3xl sm:text-5xl font-bold max-w-3xl mx-auto leading-tight mb-4 ${titleClass}`}>
          Diagnóstico concluído.
        </h1>
        <p className={`max-w-2xl mx-auto text-base sm:text-lg ${textClass}`}>
          Analisamos os elementos que impactam conversão, clareza da oferta, confiança,
          visibilidade e velocidade para identificar oportunidades de melhoria.
        </p>
        <p className={`text-xs mt-4 break-all ${softTextClass}`}>{resultado.url}</p>
        <p className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-amber-300/10 border border-amber-300/30 text-amber-500 text-sm font-medium">
          {TIPO_SITE_LABEL[resultado.tipoSite]}
        </p>
      </section>

      {/* Score geral + potencial */}
      <section className="grid lg:grid-cols-[0.9fr_1.1fr] gap-5 mb-8">
        <div className={`border rounded-3xl p-7 text-center ${cardClass}`}>
          <p className={`text-sm mb-3 ${textClass}`}>Score geral do site</p>
          <ScoreGauge score={resultado.scoreGeral} size={170} label="Score geral" darkMode={darkMode} />
          <p className={`text-xs mt-4 ${softTextClass}`}>
            Mede fundamentos técnicos, sinais de confiança e visibilidade.
          </p>
        </div>

        <div
          className={`border rounded-3xl p-7 ${
            darkMode
              ? "bg-gradient-to-br from-amber-400/15 via-slate-900 to-slate-950 border-amber-400/30"
              : "bg-gradient-to-br from-amber-100 via-white to-slate-50 border-amber-200 shadow-xl"
          }`}
        >
          <p className="text-xs uppercase tracking-wide text-amber-500 font-semibold mb-3">
            Potencial de melhoria
          </p>
          <h2 className={`text-2xl sm:text-3xl font-bold mb-4 ${titleClass}`}>
            Encontramos pontos que comprometem a capacidade do seu site de gerar vendas.
          </h2>
          <p className={`text-sm mb-6 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
            O diagnóstico mostra onde a experiência do visitante precisa ser ajustada para facilitar
            a tomada de decisão, o contato e a compra.
          </p>
          <div className={`border rounded-2xl p-5 ${innerCardClass}`}>
            <BarraScore titulo="Potencial de resultados" score={potencialConversao} darkMode={darkMode} />
          </div>
        </div>
      </section>

      {/* Visão geral + Velocidade */}
      <section className="grid md:grid-cols-2 gap-5 mb-8">

        {/* Pilares */}
        <div className={`border rounded-3xl p-6 ${cardClass}`}>
          <h3 className={`text-xl font-semibold mb-6 ${titleClass}`}>Visão geral</h3>
          <div className="space-y-5">
            <BarraScore titulo="Conversão"         score={resultado.scoreConversao}    darkMode={darkMode} />
            <BarraScore titulo="Clareza da oferta" score={resultado.scoreClareza}      darkMode={darkMode} />
            <BarraScore titulo="Confiança"         score={resultado.scoreConfianca}    darkMode={darkMode} />
            <BarraScore titulo="Visibilidade"      score={resultado.scoreVisibilidade} darkMode={darkMode} />
            <BarraScore titulo="Velocidade"        score={scorePerformance}            darkMode={darkMode} />
          </div>
        </div>

        {/* Velocidade */}
        <div className={`border rounded-3xl p-6 ${cardClass}`}>
          <h3 className={`text-xl font-semibold mb-4 ${titleClass}`}>Velocidade do site</h3>

          {/* Carregando — spinner centralizado */}
          {carregando && (
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <div className="relative w-10 h-10">
                <div className={`absolute inset-0 rounded-full border-4 ${darkMode ? "border-slate-700" : "border-slate-200"}`} />
                <div className="absolute inset-0 rounded-full border-4 border-t-amber-400 border-r-amber-400 border-b-transparent border-l-transparent animate-spin" />
              </div>
              <p className={`text-sm ${textClass}`}>Medindo a velocidade…</p>
            </div>
          )}

          {/* Falhou */}
          {!carregando && !performance?.disponivel && (
            <p className={`text-sm ${textClass}`}>
              Não foi possível medir a velocidade agora. Refaça o teste.
            </p>
          )}

          {/* Sucesso */}
          {!carregando && performance?.disponivel && (
            <div className="space-y-3">

              {/* Score de celular em destaque */}
              {typeof performance.scoreMobile === "number" && (
                <div className={`flex items-center gap-4 p-4 rounded-2xl ${darkMode ? "bg-slate-950/70" : "bg-slate-50"}`}>
                  <div className="flex items-baseline gap-2">
  <span className="text-4xl font-bold leading-none" style={{ color: corScore(performance.scoreMobile) }}>
    {performance.scoreMobile}
  </span>
  <span className="text-sm font-semibold" style={{ color: corScore(performance.scoreMobile) }}>
    {getNivel(performance.scoreMobile)}
  </span>
</div>
<div>
  <p className={`text-sm font-medium ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
    Score no celular
  </p>
  <p className={`text-xs ${softTextClass}`}>
    Prioridade — mais de 70% dos acessos vêm do celular
  </p>
</div>
                </div>
              )}

              {/* Grade de métricas com cor no valor */}
              <div className="grid grid-cols-2 gap-3">
                <MetricaCard
                  valor={performance.ttfb}
                  cor={corTtfb(performance.ttfbMs)}
                  rotulo="Resposta do servidor"
                  descricao="Ideal: menos de 800ms"
                  darkMode={darkMode}
                />
                <MetricaCard
                  valor={performance.lcp}
                  cor={corLcp(performance.lcpMs)}
                  rotulo="Conteúdo principal carregou"
                  descricao="Ideal: menos de 2,5s"
                  darkMode={darkMode}
                />
                <MetricaCard
                  valor={performance.fcp}
                  cor={corFcp(performance.fcpMs)}
                  rotulo="Primeiro conteúdo apareceu"
                  descricao="Ideal: menos de 1,8s"
                  darkMode={darkMode}
                />
                <MetricaCard
                  valor={performance.tbt}
                  cor={corTbt(performance.tbtMs)}
                  rotulo="Página ficou travada por"
                  descricao="Ideal: menos de 200ms"
                  darkMode={darkMode}
                />
                <MetricaCard
                  valor={performance.cls}
                  cor={corCls(performance.clsVal)}
                  rotulo="Estabilidade visual"
                  descricao="Ideal: menos de 0,1 — quanto menor, melhor"
                  darkMode={darkMode}
                />
              </div>

            </div>
          )}
        </div>
      </section>

      {/* Blocos por pilar */}
      <section className="flex flex-col gap-5 mb-8">
        <BlocoPilar titulo="Conversão"         score={resultado.scoreConversao}    achados={achadosConversao}    darkMode={darkMode} />
        <BlocoPilar titulo="Clareza da oferta" score={resultado.scoreClareza}      achados={achadosClareza}      darkMode={darkMode} />
        <BlocoPilar titulo="Confiança"         score={resultado.scoreConfianca}    achados={achadosConfianca}    darkMode={darkMode} />
        <BlocoPilar titulo="Visibilidade"      score={resultado.scoreVisibilidade} achados={achadosVisibilidade} darkMode={darkMode} />
      </section>

      {/* CTA final */}
      <section
        className={`border rounded-3xl p-9 text-center ${
          darkMode
            ? "bg-gradient-to-br from-amber-300/20 via-slate-900 to-slate-950 border-amber-300/40"
            : "bg-gradient-to-br from-amber-100 via-white to-slate-50 border-amber-200 shadow-xl"
        }`}
      >
        <p className="text-xs uppercase tracking-[0.25em] text-amber-500 font-semibold mb-3">
          Próximo passo
        </p>
        <h2 className={`text-3xl font-bold mb-4 ${titleClass}`}>
          Receba um plano de ação para melhorar seus resultados.
        </h2>
        <p className={`mb-7 max-w-2xl mx-auto ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
          Em uma conversa gratuita, a Ascenda Web analisa os pontos encontrados e mostra quais ajustes
          priorizar para melhorar conversão, velocidade e geração de clientes.
        </p>
        <a
          href={CALENDLY_URL}
  target="_blank"
  rel="noopener noreferrer"
  className="relative inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white rounded-xl overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
  style={{
    background: "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
    boxShadow: "0 4px 24px rgba(4, 120, 87, 0.35)",
  }}
  onMouseEnter={e => {
    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 36px rgba(4, 120, 87, 0.55)";
    (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)";
  }}
  onMouseLeave={e => {
    (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(4, 120, 87, 0.35)";
    (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)";
  }}
>
  Agendar Diagnóstico Gratuito
  <span style={{ transition: "transform 0.3s ease" }}>→</span>
</a>
        <p className={`text-xs mt-4 ${softTextClass}`}>30 minutos · Online · Sem compromisso</p>
      </section>

    </div>
  );
}
