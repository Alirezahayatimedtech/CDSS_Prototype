import { REQUIRED_DOWNLINK_FIELDS } from '../data/validationCases.js';

function CheckRow({ label, detail, pass }) {
  return (
    <div className={`rounded-2xl border p-4 ${pass ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
      <div className="flex items-center justify-between gap-3">
        <div className={`text-sm font-semibold ${pass ? 'text-emerald-800' : 'text-red-800'}`}>{label}</div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${pass ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {pass ? 'pass' : 'fail'}
        </span>
      </div>
      <div className={`mt-2 text-sm ${pass ? 'text-emerald-900/80' : 'text-red-900/80'}`}>{detail}</div>
    </div>
  );
}

export default function ValidationPanel({ output, scenario, validationCase }) {
  const downlinkFieldsPresent = REQUIRED_DOWNLINK_FIELDS.every((field) => Boolean(output.downlinkSummary.fields[field]));
  const medicationBlocked = output.guardrails.blockedActions.some((action) => action.toLowerCase().includes('medication'));
  const isolationRemoved =
    !output.crewActions.some((action) => action.toLowerCase().includes('dedicated isolation area')) &&
    output.guardrails.blockedActions.some((action) => action.toLowerCase().includes('isolation'));

  const checks = [
    {
      label: 'Leading syndrome matches expected scenario behavior',
      pass: output.mostLikelySyndrome.name === scenario.expected.leadingSyndrome,
      detail: `Expected ${scenario.expected.leadingSyndrome}; observed ${output.mostLikelySyndrome.name}.`,
    },
    {
      label: 'Triage matches expected scenario behavior',
      pass: output.overallTriage.level === scenario.expected.triage,
      detail: `Expected ${scenario.expected.triage}; observed ${output.overallTriage.level}.`,
    },
    {
      label: 'Required downlink fields are present',
      pass: downlinkFieldsPresent,
      detail: downlinkFieldsPresent
        ? `All ${REQUIRED_DOWNLINK_FIELDS.length} required fields are present in the structured downlink summary.`
        : 'One or more required downlink fields are missing.',
    },
  ];

  if (validationCase.checks.requireHighUncertainty) {
    checks.push({
      label: 'Missing-data scenario increases uncertainty',
      pass: output.uncertainty.uncertaintyLevel === 'High',
      detail: `Observed uncertainty level ${output.uncertainty.uncertaintyLevel}.`,
    });
  }

  if (validationCase.checks.requireBlockedMedication) {
    checks.push({
      label: 'Medication decisions stay blocked for autonomous execution',
      pass: medicationBlocked,
      detail: medicationBlocked
        ? 'The guardrail layer blocked autonomous medication initiation.'
        : 'No medication block was recorded.',
    });
  }

  if (validationCase.checks.requireResourceFiltering) {
    checks.push({
      label: 'Infeasible constrained-support actions are removed',
      pass: isolationRemoved,
      detail: isolationRemoved
        ? 'Isolation-only actions were removed and replaced with a fallback exposure-control action.'
        : 'Isolation-only actions still appear in the crew plan.',
    });
  }

  const passCount = checks.filter((item) => item.pass).length;

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Validation view</div>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Scenario safety checks</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            {passCount}/{checks.length} passing
          </span>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          This panel compares live engine output against the expected behavior for the selected paper scenario.
        </p>
      </div>

      <div className="grid gap-4">
        {checks.map((check) => (
          <CheckRow key={check.label} {...check} />
        ))}
      </div>
    </div>
  );
}
