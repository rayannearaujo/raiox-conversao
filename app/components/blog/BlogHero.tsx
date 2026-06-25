type BlogHeroProps = {
  title: string;
  description: string;
  readingTime: string;
};

export default function BlogHero({
  title,
  description,
  readingTime,
}: BlogHeroProps) {
  return (
    <header className="pt-14 pb-12">
      <a href="/blog" className="text-sm text-amber-300 hover:underline">
        ← Voltar para o blog
      </a>

      <p className="mt-8 text-sm text-amber-300">
        Blog › Conversão › SEO e GEO
      </p>

      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center mt-6">
        <div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            {title}
          </h1>

          <p className="mt-6 text-lg text-slate-300 max-w-3xl leading-relaxed">
            {description}
          </p>

          <p className="mt-5 text-sm text-slate-500">
            Por Ascenda Web · Atualizado em 2026 · {readingTime}
          </p>
        </div>

        <div
          aria-label="Ilustração animada de análise de site"
          className="relative rounded-3xl border border-amber-300/20 bg-white/5 p-6 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,197,94,0.15),_transparent_60%)]" />

          <div className="relative rounded-2xl border border-white/10 bg-[#050816] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm text-slate-400">Analisando website</p>
                <h3 className="text-xl font-bold text-white mt-1">
                  SEO • GEO • UX
                </h3>
              </div>

              <div className="relative h-24 w-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />

                <div className="h-20 w-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                  <span className="text-3xl font-bold text-green-400">
                    100
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                ["🔍", "SEO Técnico"],
                ["🤖", "GEO"],
                ["🎯", "Conversão"],
                ["📱", "Mobile"],
              ].map(([icon, label]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span className="text-slate-300">
                    {icon} {label}
                  </span>

                  <span className="font-bold text-green-400">100</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-full bg-gradient-to-r from-green-400 to-green-500 animate-pulse" />
              </div>

              <p className="text-xs text-slate-500 mt-3">
                Análise concluída com sucesso
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}