"use client";

function corPorScore(score: number) {
  if (score >= 90) return { ring: "#34d399", text: "text-emerald-400", label: "Saudável" };
  if (score >= 50) return { ring: "#fbbf24", text: "text-amber-400", label: "Atenção" };
  return { ring: "#f87171", text: "text-red-400", label: "Crítico" };
}

export default function ScoreGauge({
  score,
  size = 160,
  label,
  darkMode = true,
}: {
  score: number;
  size?: number;
  label?: string;
  darkMode?: boolean;
}) {
  const { ring, text, label: statusLabel } = corPorScore(score);
  const stroke = size * 0.09;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={darkMode ? "#1f2937" : "#e5e7eb"}
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ring}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${darkMode ? "text-white" : "text-slate-950"}`}>
            {score}
          </span>
          <span className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            / 100
          </span>
        </div>
      </div>

      {label && (
        <span className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
          {label}
        </span>
      )}

      <span className={`text-xs font-semibold uppercase tracking-wide ${text}`}>
        {statusLabel}
      </span>
    </div>
  );
}