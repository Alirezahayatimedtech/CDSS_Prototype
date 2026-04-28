function TraceCard({ title, summary, items }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</div>
      <div className="mt-2 text-lg font-semibold text-slate-950">{summary}</div>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="rounded-2xl bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-950">{item.module || item.id || item.stage || `Step ${index + 1}`}</div>
            <div className="mt-2 text-sm text-slate-700">{item.detail || item.reason || item}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AgentTracePanel({ output }) {
  return (
    <div className="space-y-6">
      <TraceCard
        title="Planner"
        summary={output.agentTrace.planner.summary}
        items={[
          ...output.agentTrace.planner.selectedModules,
          ...output.agentTrace.planner.decisions.map((detail) => ({ module: 'decision', detail })),
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <TraceCard
          title="Executor"
          summary={output.agentTrace.executor.summary}
          items={output.agentTrace.executor.steps}
        />
        <TraceCard
          title="Verifier"
          summary={output.agentTrace.verifier.summary}
          items={[
            ...output.agentTrace.verifier.steps,
            ...output.agentTrace.verifier.questions.map((detail) => ({ module: 'question', detail })),
          ]}
        />
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Audit trail</div>
        <div className="mt-4 space-y-3">
          {output.auditTrail.map((item) => (
            <div key={`${item.stage}-${item.detail}`} className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-950">{item.stage}</div>
              <div className="mt-2 text-sm text-slate-700">{item.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
