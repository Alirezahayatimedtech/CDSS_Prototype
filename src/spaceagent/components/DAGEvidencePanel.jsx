function Column({ title, items }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</div>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={`${item.label}-${item.state}`} className="rounded-2xl bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-950">{item.label}</div>
            <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{item.state}</div>
            <div className="mt-2 text-sm text-slate-700">{item.impact}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DAGEvidencePanel({ output }) {
  const inputs = output.dagEvidence.evidenceChain.filter((item) => item.type === 'input');
  const inferences = output.dagEvidence.evidenceChain.filter((item) => item.type === 'inference');
  const outcomes = output.dagEvidence.evidenceChain.filter((item) => item.type === 'outcome');

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Evidence view</div>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Simplified causal evidence map</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {output.dagEvidence.dagFamilies.map((family) => (
              <span key={family} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {family}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Column title="Inputs" items={inputs} />
        <Column title="Intermediate states" items={inferences} />
        <Column title="Outcomes" items={outcomes} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Column
          title="Strongest drivers"
          items={output.dagEvidence.strongestDrivers.map((item) => ({
            label: 'Driver',
            state: 'active',
            impact: item,
          }))}
        />
        <Column
          title="Uncertainty drivers"
          items={output.dagEvidence.uncertaintyDrivers.map((item) => ({
            label: 'Uncertainty',
            state: output.uncertainty.uncertaintyLevel,
            impact: item,
          }))}
        />
        <Column
          title="Triggered escalation nodes"
          items={output.dagEvidence.triggeredEscalationNodes.map((item) => ({
            label: 'Escalation',
            state: output.overallTriage.level,
            impact: item,
          }))}
        />
      </div>
    </div>
  );
}
