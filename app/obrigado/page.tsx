"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function ObrigadoContent() {
  const params = useSearchParams();
  const slug = params.get("slug");
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState("");

  async function baixarPDF() {
    if (!slug) return;
    setBaixando(true);
    setErro("");
    try {
      const res = await fetch("/api/gerar-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `plano-de-acao-${slug}.pdf`;
        a.click();
      } else {
        setErro("Não foi possível gerar o PDF. Verifique seu email.");
      }
    } catch {
      setErro("Erro ao baixar. Verifique seu email.");
    } finally {
      setBaixando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#070b14] flex items-center justify-center px-5">
      <div className="max-w-lg w-full text-center">
        <div className="text-5xl mb-6">🎯</div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Seu Plano de Ação está a caminho!
        </h1>

        <p className="text-slate-400 mb-4">
          Enviamos o PDF para o seu email. Verifique também a caixa de spam se não encontrar.
        </p>

        <p className="text-slate-500 text-sm mb-8">
          Prefere baixar agora? Clique no botão abaixo.
        </p>

        <button
          onClick={baixarPDF}
          disabled={baixando || !slug}
          className="bg-amber-300 hover:bg-amber-200 disabled:opacity-60 text-slate-950 font-semibold rounded-xl px-8 py-4 transition text-lg"
        >
          {baixando ? "Gerando PDF..." : "Baixar meu Plano de Ação"}
        </button>

        {erro && <p className="text-red-400 text-sm mt-4">{erro}</p>}

        <p className="text-slate-600 text-xs mt-8">
          Dúvidas? Fale com a gente em hello@ascendaweb.com
        </p>
      </div>
    </main>
  );
}

export default function ObrigadoPage() {
  return (
    <Suspense>
      <ObrigadoContent />
    </Suspense>
  );
}