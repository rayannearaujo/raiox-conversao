"use client";

import { useEffect, useState } from "react";

const MENSAGENS = [
  "Analisando sinais de conversão...",
  "Verificando elementos de confiança...",
  "Avaliando visibilidade do site...",
  "Executando análise avançada...",
];

export default function LoadingState() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % MENSAGENS.length);
    }, 1300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 animate-fade-in-up">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
        <div className="absolute inset-0 rounded-full border-4 border-t-emerald-400 border-r-emerald-400 border-b-transparent border-l-transparent animate-spin" />
      </div>
      <p className="text-lg text-slate-200 font-medium animate-pulse-soft min-h-[28px] text-center px-6">
        {MENSAGENS[index]}
      </p>
      <p className="text-sm text-slate-500">Isso leva só alguns segundos.</p>
    </div>
  );
}
