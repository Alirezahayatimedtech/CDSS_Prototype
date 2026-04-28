function Section({ title, items }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={`${title}-${item}`} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ModelCardPanel({ modelCard }) {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Model card</div>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">{modelCard.name}</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">{modelCard.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {modelCard.status.map((item) => (
            <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Intended use" items={modelCard.intendedUse} />
        <Section title="Non-intended use" items={modelCard.nonIntendedUse} />
        <Section title="Target users" items={modelCard.targetUsers} />
        <Section title="Inputs" items={modelCard.inputs} />
        <Section title="Outputs" items={modelCard.outputs} />
        <Section title="Safety rules" items={modelCard.safetyRules} />
        <Section title="Limitations" items={modelCard.limitations} />
        <Section title="Human oversight" items={modelCard.humanOversight} />
      </div>
    </div>
  );
}
