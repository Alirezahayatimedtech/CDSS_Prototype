export default function ScenarioSelector({ scenarios, selectedScenarioId, onSelect }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Scenario presets</div>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Paper-aligned simulation cases</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {scenarios.length} presets
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {scenarios.map((scenario) => {
          const selected = scenario.id === selectedScenarioId;
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onSelect(scenario.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                selected
                  ? 'border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-900/20'
                  : 'border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold">{scenario.label}</div>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${selected ? 'bg-white/10 text-slate-100 ring-1 ring-white/15' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}>
                    {scenario.expected.triage}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${selected ? 'bg-white/10 text-slate-100 ring-1 ring-white/15' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}>
                    {scenario.expected.leadingSyndrome}
                  </span>
                </div>
              </div>
              <p className={`mt-2 text-sm leading-6 ${selected ? 'text-slate-200' : 'text-slate-600'}`}>{scenario.summary}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
