function SeverityBadge({ level }) {
  const styles = {
    Low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Watch: 'border-amber-200 bg-amber-50 text-amber-700',
    Urgent: 'border-orange-200 bg-orange-50 text-orange-700',
    Emergency: 'border-red-200 bg-red-50 text-red-700',
  };

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[level] || styles.Watch}`}>{level}</span>;
}

export default function CrewView({ output }) {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Crew view</div>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Do this now</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              Crew-facing guidance stays operational, concise, and explicit about when medical review is needed.
            </p>
          </div>
          <SeverityBadge level={output.overallTriage.level} />
        </div>

        <div className="mt-5 rounded-[24px] bg-slate-950 p-5 text-white">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Primary action</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            {output.crewActions[0] || 'Continue routine monitoring.'}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">
              {output.mostLikelySyndrome.name}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">
              Confidence {output.uncertainty.confidenceLabel}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">
              Medical review {output.overallTriage.requiresMedicalReview ? 'needed' : 'not needed now'}
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">What to watch</div>
            <div className="mt-2 text-sm font-medium text-slate-900">{output.mostLikelySyndrome.rationale}</div>
            <div className="mt-3 text-sm text-slate-700">
              Uncertainty: {output.uncertainty.uncertaintyLevel} ({Math.round(output.uncertainty.overallConfidence * 100)}% confidence)
            </div>
          </div>
          <div className={`rounded-2xl p-4 ${output.escalationTriggers.length ? 'bg-red-50 ring-1 ring-red-100' : 'bg-slate-50'}`}>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">When to escalate</div>
            <div className="mt-2 text-sm text-slate-800">
              {output.escalationTriggers[0] || 'No immediate escalation triggers are active.'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
          <h3 className="text-lg font-semibold text-slate-950">Action checklist</h3>
          <div className="mt-4 space-y-3">
            {output.crewActions.map((action, index) => (
              <div key={`${action}-${index}`} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-800">
                {action}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
          <h3 className="text-lg font-semibold text-slate-950">Reduce uncertainty</h3>
          <div className="mt-4 space-y-3">
            {output.uncertainty.recommendedReducers.map((item, index) => (
              <div key={`${item}-${index}`} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-800">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
