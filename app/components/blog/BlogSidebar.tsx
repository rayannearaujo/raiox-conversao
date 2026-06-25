import BlogCTA from "./BlogCTA";

type Item = {
  label: string;
  href: string;
};

export default function BlogSidebar({ items }: { items: Item[] }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-8 space-y-6">
        <nav className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-bold text-white mb-4">Neste artigo</p>

          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-sm text-slate-400 hover:text-amber-300"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <BlogCTA />
      </div>
    </aside>
  );
}