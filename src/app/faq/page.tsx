const faqs = [
  {
    q: "How do I search for a candidate?",
    a: "Use Check a Candidate or the search bar. Filter by position, party, region, or election year.",
  },
  {
    q: "What do the color badges mean?",
    a: "Green = no serious issues on record. Orange = pending cases or allegations. Red = serious active cases.",
  },
  {
    q: "Are allegations the same as convictions?",
    a: "No. Allegations and pending cases are clearly marked. We show dismissals and resolutions when documented.",
  },
  {
    q: "Where does SALN data come from?",
    a: "From official filings via the Ombudsman, COMELEC, and legislature public disclosure portals, linked on each profile.",
  },
  {
    q: "How often is news updated?",
    a: "The feed refreshes every 30 minutes via our API. Production deployments can connect NewsAPI or GNews with source filters.",
  },
  {
    q: "Can I export a candidate profile?",
    a: "Yes. Use Export / Print PDF on any profile page for offline voter reference.",
  },
];

const glossary = [
  { term: "SALN", def: "Statement of Assets, Liabilities, and Net Worth — annual disclosure by public officials." },
  { term: "COMELEC", def: "Commission on Elections — manages voter registration and elections." },
  { term: "Sandiganbayan", def: "Anti-graft court handling cases against public officers." },
  { term: "Ombudsman", def: "Investigates public officials for graft and administrative offenses." },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">FAQ & Glossary</h1>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        <dl className="space-y-6">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold">{f.q}</dt>
              <dd className="mt-1 text-muted text-sm">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Glossary</h2>
        <dl className="space-y-4">
          {glossary.map((g) => (
            <div key={g.term}>
              <dt className="font-semibold text-accent">{g.term}</dt>
              <dd className="text-sm text-muted mt-0.5">{g.def}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
