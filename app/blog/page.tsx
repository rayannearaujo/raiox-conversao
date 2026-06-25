const posts = [
  {
    title: "Como analisar um site gratuitamente em 2026",
    description:
      "Aprenda a avaliar velocidade, UX, SEO, confiança e conversão para descobrir por que seu site pode estar perdendo clientes.",
    href: "/blog/como-analisar-um-site-gratuitamente",
    tag: "SEO + GEO",
    readingTime: "8 min",
  },
  {
    title: "Checklist de conversão para sites",
    description:
      "Veja os principais pontos que um site precisa ter para transformar visitantes em leads e clientes.",
    href: "/blog/checklist-de-conversao-para-sites",
    tag: "CRO",
    readingTime: "7 min",
  },
  {
    title: "20 erros que fazem um site perder clientes",
    description:
      "Conheça problemas comuns de UX, clareza, confiança e performance que reduzem as conversões.",
    href: "/blog/erros-que-fazem-um-site-perder-clientes",
    tag: "Conversão",
    readingTime: "9 min",
  },
];

export default function BlogPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020817] text-white">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">

  {/* Grid */}
  <div
    className="absolute inset-0 opacity-20"
    style={{
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
      `,
      backgroundSize: "80px 80px",
    }}
  />

  {/* Glow azul direita */}
  <div
    className="absolute inset-0"
    style={{
      background:
        "radial-gradient(circle at 80% 20%, rgba(0,100,255,0.15), transparent 35%)",
    }}
  />

  {/* Glow quente esquerda */}
  <div
    className="absolute inset-0"
    style={{
      background:
        "radial-gradient(circle at 15% 15%, rgba(255,170,0,0.08), transparent 35%)",
    }}
  />

  {/* Vinheta */}
  <div
    className="absolute inset-0"
    style={{
      background:
        "linear-gradient(to bottom, rgba(2,8,23,0.15), rgba(2,8,23,0.92))",
    }}
  />
</div>
<div className="absolute inset-0">

  <div
    className="absolute inset-0 opacity-30"
    style={{
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
      `,
      backgroundSize: "80px 80px",
    }}
  />

  <div
    className="absolute inset-0"
    style={{
      background:
        "radial-gradient(circle at center, rgba(0,90,255,0.18), transparent 60%)",
    }}
  />

  <div
    className="absolute inset-0"
    style={{
      background:
        "linear-gradient(to bottom, rgba(2,8,23,0.2), rgba(2,8,23,0.95))",
    }}
  />

</div>
      <section className="relative z-10 max-w-6xl mx-auto px-5 py-20">
        <a
          href="/"
          className="text-sm text-blue-300 hover:text-blue-200 transition"
        >
          ← Voltar para o Raio-X
        </a>

        <div className="mt-12 max-w-3xl">
          <span className="inline-flex rounded-full border border-yellow-400/20 bg-yellow-500/10 px-4 py-2 text-xs font-semibold text-yellow-300">
            Centro de Conhecimento
          </span>

          <h1 className="mt-6 text-4xl sm:text-6xl font-bold leading-tight">
            Conteúdos para sites que precisam{" "}
            <span>converter melhor</span>
          </h1>

          <p className="mt-6 text-lg text-[#8fb3d9] leading-relaxed">
            Guias práticos sobre SEO, GEO, UX e conversão para entender por que
            um site não gera clientes e como transformar visitantes em
            oportunidades reais de negócio.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <a
              key={post.href}
              href={post.href}
              className="group rounded-3xl border border-blue-500/15 bg-[#061a2f]/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:bg-[#08213d]"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                  {post.tag}
                </span>

                <span className="text-xs text-[#6f91b6]">
                  {post.readingTime}
                </span>
              </div>

              <h2 className="text-2xl font-bold leading-snug text-white group-hover:text-blue-300 transition-colors">
                {post.title}
              </h2>

              <p className="mt-4 text-sm text-[#8fb3d9] leading-relaxed">
                {post.description}
              </p>

              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-yellow-300">
                Ler artigo
                <span>→</span>
              </div>
            </a>
          ))}
        </div>

       <div className="mt-24 relative overflow-hidden rounded-[32px] border border-white/10 p-10 sm:p-12">
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute -top-24 right-0 h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-[120px]" />
    <div className="absolute -bottom-24 left-0 h-[360px] w-[360px] rounded-full bg-emerald-500/10 blur-[120px]" />
  </div>

  <div className="relative z-10 mx-auto text-center">
    <span className="inline-flex rounded-full border border-yellow-400/20 bg-yellow-500/10 px-4 py-2 text-xs font-semibold text-yellow-300">
      Diagnóstico gratuito
    </span>

    <h2 className="mx-auto text-center sm:text-5xl font-bold leading-tight">
      Descubra exatamente o que está impedindo seu site de vender mais.
    </h2>

    <p className="mx-auto text-center text-lg sm:text-xl leading-relaxed text-[#8fb3d9]">
      Receba uma análise gratuita mostrando problemas de conversão,
      experiência do usuário, SEO, confiança e performance que podem estar
      reduzindo seus resultados.
    </p>

   <div className="mt-10 flex flex-col items-center">
  <a
    href="/"
    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#FFD230] to-[#FFE57A] px-10 py-5 text-base sm:text-lg font-bold text-[#04101d] shadow-[0_10px_30px_rgba(255,210,48,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(255,210,48,0.45)]"
  >
    Analisar meu site agora →
  </a>

  <p className="mt-4 text-sm text-[#6f91b6]">
    100% gratuito · Resultado em segundos · Sem cartão
  </p>
</div>
  </div>
</div>
      </section>
    </main>
  );
}