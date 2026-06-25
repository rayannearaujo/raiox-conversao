import BlogHero from "./BlogHero";
import BlogSidebar from "./BlogSidebar";
import FAQAccordion from "./FAQAccordion";
import BlogCTA from "./BlogCTA";

type FAQ = {
  question: string;
  answer: string;
};

type SidebarItem = {
  label: string;
  href: string;
};

type BlogLayoutProps = {
  title: string;
  description: string;
  readingTime: string;
  sidebarItems: SidebarItem[];
  faqs: FAQ[];
  children: React.ReactNode;
};

export default function BlogLayout({
  title,
  description,
  readingTime,
  sidebarItems,
  faqs,
  children,
}: BlogLayoutProps) {
  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),_transparent_35%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070b14]/80 to-[#070b14]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5">
        <BlogHero
          title={title}
          description={description}
          readingTime={readingTime}
        />

        <section className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-6 mb-12">
          <p className="text-sm font-bold text-amber-300 mb-2">
            Resposta rápida
          </p>
          <p className="text-slate-200">
            Para analisar um site gratuitamente, avalie velocidade,
            experiência do usuário, clareza da oferta, confiança, chamadas para
            ação, SEO técnico e compatibilidade mobile.
          </p>
        </section>

        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <BlogSidebar items={sidebarItems} />

          <article className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-a:text-amber-300">
            {children}

            <FAQAccordion faqs={faqs} />

            <div className="mt-16">
              <BlogCTA />
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}