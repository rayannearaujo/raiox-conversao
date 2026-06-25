type FAQ = {
  question: string;
  answer: string;
};

export default function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  return (
    <section id="faq" className="mt-16">
      <h2 className="text-3xl font-bold mb-6">Perguntas frequentes</h2>

      <div className="space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="rounded-xl border border-white/10 bg-white/5 p-5"
          >
            <summary className="cursor-pointer font-semibold text-white">
              {faq.question}
            </summary>
            <p className="mt-4 text-slate-300">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}