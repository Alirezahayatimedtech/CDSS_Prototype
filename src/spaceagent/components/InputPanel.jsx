const symptomFields = [
  { key: 'fever', label: 'Fever', min: 0, max: 10 },
  { key: 'cough', label: 'Cough', min: 0, max: 10 },
  { key: 'dyspnea', label: 'Dyspnea', min: 0, max: 10 },
  { key: 'fatigue', label: 'Fatigue', min: 0, max: 10 },
  { key: 'giBurden', label: 'GI burden', min: 0, max: 10 },
  { key: 'rashOrOralLesions', label: 'Rash or oral lesions', min: 0, max: 10 },
  { key: 'headacheOrNausea', label: 'Headache or nausea', min: 0, max: 10 },
];

const biomarkerFields = [
  { key: 'inflammatoryScore', label: 'Inflammatory score', min: 0, max: 10 },
  { key: 'interferonScore', label: 'Interferon score', min: 0, max: 10 },
  { key: 'viralReactivationScore', label: 'Viral-reactivation score', min: 0, max: 10 },
];

function Section({ title, children }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function TextField({ label, value, onChange }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition focus:border-slate-400"
      />
    </label>
  );
}

function NumericField({ label, value, min, max, step = 1, onChange }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
        <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full"
      />
    </label>
  );
}

function NumberInput({ label, value, min, max, step = 1, onChange }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
      />
    </label>
  );
}

function ToggleField({ label, value, onChange }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 flex gap-2">
        {[true, false].map((option) => (
          <button
            key={`${label}-${String(option)}`}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
              value === option
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
            }`}
          >
            {option ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
      >
        {options.map((option) => (
          <option key={`${label}-${option}`} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function InputPanel({
  caseInput,
  onRootFieldChange,
  onNestedFieldChange,
  onReset,
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Editable case input</div>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Live case builder</h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
        >
          Reset to scenario
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <Section title="Case metadata">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Case ID" value={caseInput.caseId} onChange={(value) => onRootFieldChange('caseId', value)} />
            <NumberInput
              label="Mission day"
              value={caseInput.missionDay}
              min={1}
              max={999}
              onChange={(value) => onRootFieldChange('missionDay', value)}
            />
            <TextField label="Crew role" value={caseInput.crewRole} onChange={(value) => onRootFieldChange('crewRole', value)} />
          </div>
          <TextAreaField
            label="User question"
            value={caseInput.userQuestion}
            onChange={(value) => onRootFieldChange('userQuestion', value)}
          />
        </Section>

        <Section title="Symptoms">
          <div className="grid gap-4 md:grid-cols-2">
            {symptomFields.map((field) => (
              <NumericField
                key={field.key}
                {...field}
                value={caseInput.symptoms[field.key]}
                onChange={(value) => onNestedFieldChange('symptoms', field.key, value)}
              />
            ))}
          </div>
        </Section>

        <Section title="Vitals and red flags">
          <div className="grid gap-4 md:grid-cols-2">
            <NumberInput
              label="Oxygen saturation"
              value={caseInput.vitals.oxygenSaturation}
              min={70}
              max={100}
              onChange={(value) => onNestedFieldChange('vitals', 'oxygenSaturation', value)}
            />
            <ToggleField
              label="Blood pressure stable"
              value={caseInput.vitals.bloodPressureStable}
              onChange={(value) => onNestedFieldChange('vitals', 'bloodPressureStable', value)}
            />
            <ToggleField
              label="Altered mental status"
              value={caseInput.vitals.alteredMentalStatus}
              onChange={(value) => onNestedFieldChange('vitals', 'alteredMentalStatus', value)}
            />
            <ToggleField
              label="Syncope"
              value={caseInput.vitals.syncope}
              onChange={(value) => onNestedFieldChange('vitals', 'syncope', value)}
            />
            <ToggleField
              label="Rapid worsening"
              value={caseInput.vitals.rapidWorsening}
              onChange={(value) => onNestedFieldChange('vitals', 'rapidWorsening', value)}
            />
            <ToggleField
              label="Dehydration"
              value={caseInput.vitals.dehydration}
              onChange={(value) => onNestedFieldChange('vitals', 'dehydration', value)}
            />
          </div>
        </Section>

        <Section title="Biomarkers">
          <div className="grid gap-4 md:grid-cols-2">
            {biomarkerFields.map((field) => (
              <NumericField
                key={field.key}
                {...field}
                value={caseInput.biomarkers[field.key]}
                onChange={(value) => onNestedFieldChange('biomarkers', field.key, value)}
              />
            ))}
          </div>
        </Section>

        <Section title="History and exposures">
          <div className="grid gap-4 md:grid-cols-2">
            <ToggleField
              label="Prior reactivation history"
              value={caseInput.history.priorReactivationHistory}
              onChange={(value) => onNestedFieldChange('history', 'priorReactivationHistory', value)}
            />
            <ToggleField
              label="Recent medication change"
              value={caseInput.history.recentMedicationChange}
              onChange={(value) => onNestedFieldChange('history', 'recentMedicationChange', value)}
            />
            <ToggleField
              label="Food or water concern"
              value={caseInput.history.foodWaterConcern}
              onChange={(value) => onNestedFieldChange('history', 'foodWaterConcern', value)}
            />
            <ToggleField
              label="Close-contact exposure"
              value={caseInput.history.closeContactExposure}
              onChange={(value) => onNestedFieldChange('history', 'closeContactExposure', value)}
            />
            <ToggleField
              label="Habitat exposure concern"
              value={caseInput.history.habitatExposureConcern}
              onChange={(value) => onNestedFieldChange('history', 'habitatExposureConcern', value)}
            />
            <ToggleField
              label="Radiation alert"
              value={caseInput.history.radiationAlert}
              onChange={(value) => onNestedFieldChange('history', 'radiationAlert', value)}
            />
          </div>
        </Section>

        <Section title="Mission and resources">
          <div className="grid gap-4 md:grid-cols-2">
            <NumberInput
              label="Communication delay (min)"
              value={caseInput.mission.communicationDelayMinutes}
              min={0}
              max={60}
              onChange={(value) => onNestedFieldChange('mission', 'communicationDelayMinutes', value)}
            />
            <ToggleField
              label="Ground support available"
              value={caseInput.mission.groundSupportAvailable}
              onChange={(value) => onNestedFieldChange('mission', 'groundSupportAvailable', value)}
            />
            <ToggleField
              label="CMO available"
              value={caseInput.mission.cmoAvailable}
              onChange={(value) => onNestedFieldChange('mission', 'cmoAvailable', value)}
            />
            <SelectField
              label="Med kit status"
              value={caseInput.mission.medKitStatus}
              options={['Nominal', 'Limited']}
              onChange={(value) => onNestedFieldChange('mission', 'medKitStatus', value)}
            />
            <SelectField
              label="Isolation capability"
              value={caseInput.mission.isolationCapability}
              options={['Available', 'Limited', 'Unavailable']}
              onChange={(value) => onNestedFieldChange('mission', 'isolationCapability', value)}
            />
          </div>
        </Section>

        <Section title="Data completeness">
          <div className="grid gap-4 md:grid-cols-2">
            <ToggleField
              label="Missing vitals"
              value={caseInput.dataCompleteness.missingVitals}
              onChange={(value) => onNestedFieldChange('dataCompleteness', 'missingVitals', value)}
            />
            <ToggleField
              label="Missing labs"
              value={caseInput.dataCompleteness.missingLabs}
              onChange={(value) => onNestedFieldChange('dataCompleteness', 'missingLabs', value)}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}
