function Card({ title, children }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function CMOView({ output, caseInput }) {
  return (
    <div className="space-y-6">
      <Card title="Clinical summary">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Triage</div>
            <div className="mt-2 text-xl font-semibold text-slate-950">{output.overallTriage.level}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Leading syndrome</div>
            <div className="mt-2 text-sm font-semibold text-slate-950">{output.mostLikelySyndrome.name}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Confidence</div>
            <div className="mt-2 text-xl font-semibold text-slate-950">{output.uncertainty.confidenceLabel}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mission context</div>
            <div className="mt-2 text-sm text-slate-800">
              Delay {caseInput.mission.communicationDelayMinutes} min, CMO {caseInput.mission.cmoAvailable ? 'available' : 'unavailable'}
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
          {output.mostLikelySyndrome.rationale}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Differential diagnosis">
          <div className="space-y-3">
            {output.differentialDiagnosis.slice(0, 6).map((item) => (
              <div key={item.name} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-950">{item.name}</div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    {item.likelihood}
                  </span>
                </div>
                <div className="mt-3 text-sm text-slate-700">
                  {item.supportingEvidence[0] || 'No dominant supporting feature captured.'}
                </div>
                {item.missingInformation.length > 0 && (
                  <div className="mt-3 text-xs text-slate-500">Missing: {item.missingInformation.join('; ')}</div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Biomarker interpretation">
          <div className="space-y-3">
            {output.biomarkerInterpretation.markers.map((marker) => (
              <div key={marker.label} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-950">{marker.label}</div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    {marker.band}
                  </span>
                </div>
                <div className="mt-2 text-sm text-slate-700">{marker.interpretation}</div>
                <div className="mt-3 text-xs text-slate-500">Value {marker.value}</div>
              </div>
            ))}
            <div className="rounded-2xl bg-slate-950 p-4 text-sm leading-7 text-slate-100">
              {output.biomarkerInterpretation.interpretation}
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              Limitation: {output.biomarkerInterpretation.limitation}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Matched protocols and actions">
          <div className="space-y-4">
            {output.protocolMatches.map((protocol) => (
              <div key={protocol.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-950">{protocol.name}</div>
                <div className="mt-2 text-sm text-slate-700">{protocol.reason}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {protocol.dagFamilies.map((family) => (
                    <span key={`${protocol.id}-${family}`} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                      {family}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Crew-safe actions</div>
              <div className="mt-2 space-y-2">
                {output.crewActions.map((action, index) => (
                  <div key={`crew-${index}`} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{action}</div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">CMO review actions</div>
              <div className="mt-2 space-y-2">
                {output.cmoActions.map((action, index) => (
                  <div key={`cmo-${index}`} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{action}</div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Guardrails and downlink">
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Warnings</div>
              <div className="mt-3 space-y-2">
                {output.guardrails.warnings.map((warning, index) => (
                  <div key={`warning-${index}`} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
                    {warning}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Blocked actions</div>
              <div className="mt-3 space-y-2">
                {output.guardrails.blockedActions.length ? output.guardrails.blockedActions.map((action, index) => (
                  <div key={`blocked-${index}`} className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
                    {action}
                  </div>
                )) : <div className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">No blocked actions were needed for this case.</div>}
              </div>
            </div>
            <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              {output.downlinkSummary.text}
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
}
