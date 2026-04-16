import React, { useMemo, useState } from 'react';

const PRESETS = {
  i4_nominal: {
    label: 'I4 Nominal',
    crewId: 'I4-CMO-01',
    missionDay: 2,
    mode: 'Routine Surveillance',
    scenarioType: 'Routine surveillance simulation',
    datasetGrounding:
      'Derived from Inspiration4-style OSDR processed signals: OSD-569 whole blood, OSD-570 PBMC, OSD-571 plasma, plus crew-entered symptoms and ops context.',
    lastReviewNote: 'No unresolved medical concerns. Continue routine surveillance cadence.',
    priorEpisodes: 0,
    priorViralReactivationHistory: 0,
    immuneBaselineShift: 0,
    recentCountermeasureUse: 'Routine hygiene + sleep plan',
    feverishness: 0,
    respiratorySymptoms: 0,
    giSymptoms: 0,
    rashOrDermatitis: 0,
    fatigue: 2,
    sleepQuality: 7,
    stressLoad: 4,
    closeContactExposure: 0,
    trendWorsening: 0,
    wholeBloodInflammation: 2,
    wholeBloodInterferon: 2,
    pbmcImmuneShift: 2,
    plasmaAcutePhase: 2,
    plasmaMetabolicStress: 3,
    salivaViralSignal: 0,
    cabinExposureConcern: 1,
    commDelayMinutes: 0,
    cmoAvailable: 1,
    medKitStatus: 'Nominal',
    isolationCapability: 'Available',
  },
  i4_watch: {
    label: 'I4 Watch',
    crewId: 'I4-CMO-02',
    missionDay: 3,
    mode: 'Watch List',
    scenarioType: 'Trend flag / watch list simulation',
    datasetGrounding:
      'Derived from Inspiration4-style OSDR processed signals: OSD-569 whole blood, OSD-570 PBMC, OSD-571 plasma, plus crew-entered symptoms and ops context.',
    lastReviewNote: 'Mild immune perturbation pattern emerging across serial checks.',
    priorEpisodes: 1,
    priorViralReactivationHistory: 1,
    immuneBaselineShift: 1,
    recentCountermeasureUse: 'Enhanced surveillance initiated',
    feverishness: 3,
    respiratorySymptoms: 3,
    giSymptoms: 1,
    rashOrDermatitis: 0,
    fatigue: 5,
    sleepQuality: 5,
    stressLoad: 6,
    closeContactExposure: 1,
    trendWorsening: 1,
    wholeBloodInflammation: 5,
    wholeBloodInterferon: 4,
    pbmcImmuneShift: 6,
    plasmaAcutePhase: 5,
    plasmaMetabolicStress: 5,
    salivaViralSignal: 4,
    cabinExposureConcern: 3,
    commDelayMinutes: 0,
    cmoAvailable: 1,
    medKitStatus: 'Nominal',
    isolationCapability: 'Available',
  },
  i4_event: {
    label: 'I4 Medical Event',
    crewId: 'I4-CMO-03',
    missionDay: 3,
    mode: 'Medical Event',
    scenarioType: 'Escalating medical event simulation',
    datasetGrounding:
      'Derived from Inspiration4-style OSDR processed signals: OSD-569 whole blood, OSD-570 PBMC, OSD-571 plasma, plus crew-entered symptoms and ops context.',
    lastReviewNote: 'Escalating inflammatory and viral-reactivation-like pattern with increasing symptoms.',
    priorEpisodes: 2,
    priorViralReactivationHistory: 1,
    immuneBaselineShift: 1,
    recentCountermeasureUse: 'Monitoring + infection-control',
    feverishness: 7,
    respiratorySymptoms: 6,
    giSymptoms: 3,
    rashOrDermatitis: 4,
    fatigue: 8,
    sleepQuality: 3,
    stressLoad: 8,
    closeContactExposure: 1,
    trendWorsening: 1,
    wholeBloodInflammation: 8,
    wholeBloodInterferon: 7,
    pbmcImmuneShift: 8,
    plasmaAcutePhase: 8,
    plasmaMetabolicStress: 7,
    salivaViralSignal: 8,
    cabinExposureConcern: 5,
    commDelayMinutes: 0,
    cmoAvailable: 1,
    medKitStatus: 'Nominal',
    isolationCapability: 'Available',
  },
  i4_respiratory: {
    label: 'I4 Respiratory',
    targetScenarioFamily: 'respiratory_syndrome',
    crewId: 'I4-CMO-04',
    missionDay: 3,
    mode: 'Medical Event',
    scenarioType: 'Respiratory infectious-risk simulation',
    datasetGrounding:
      'Derived from Inspiration4-style OSDR processed signals: OSD-569 whole blood, OSD-570 PBMC, OSD-571 plasma, plus crew-entered symptoms and ops context.',
    lastReviewNote: 'Respiratory complaints increasing after previous mild trend flag.',
    priorEpisodes: 1,
    priorViralReactivationHistory: 0,
    immuneBaselineShift: 1,
    recentCountermeasureUse: 'Monitoring + symptom log',
    feverishness: 5,
    respiratorySymptoms: 7,
    giSymptoms: 1,
    rashOrDermatitis: 0,
    fatigue: 6,
    sleepQuality: 4,
    stressLoad: 6,
    closeContactExposure: 1,
    trendWorsening: 1,
    wholeBloodInflammation: 6,
    wholeBloodInterferon: 5,
    pbmcImmuneShift: 6,
    plasmaAcutePhase: 6,
    plasmaMetabolicStress: 5,
    salivaViralSignal: 3,
    cabinExposureConcern: 4,
    commDelayMinutes: 0,
    cmoAvailable: 1,
    medKitStatus: 'Nominal',
    isolationCapability: 'Available',
  },
  i4_reactivation: {
    label: 'I4 Reactivation',
    targetScenarioFamily: 'reactivation_watch',
    crewId: 'I4-CMO-05',
    missionDay: 3,
    mode: 'Medical Event',
    scenarioType: 'Latent viral reactivation simulation',
    datasetGrounding:
      'Derived from Inspiration4-style OSDR processed signals: OSD-569 whole blood, OSD-570 PBMC, OSD-571 plasma, plus crew-entered symptoms and ops context.',
    lastReviewNote: 'Prior reactivation history with new rash and saliva signal.',
    priorEpisodes: 2,
    priorViralReactivationHistory: 1,
    immuneBaselineShift: 1,
    recentCountermeasureUse: 'Monitoring + skin symptom review',
    feverishness: 4,
    respiratorySymptoms: 2,
    giSymptoms: 0,
    rashOrDermatitis: 6,
    fatigue: 6,
    sleepQuality: 4,
    stressLoad: 7,
    closeContactExposure: 0,
    trendWorsening: 1,
    wholeBloodInflammation: 5,
    wholeBloodInterferon: 7,
    pbmcImmuneShift: 7,
    plasmaAcutePhase: 5,
    plasmaMetabolicStress: 5,
    salivaViralSignal: 8,
    cabinExposureConcern: 2,
    commDelayMinutes: 0,
    cmoAvailable: 1,
    medKitStatus: 'Nominal',
    isolationCapability: 'Available',
  },
  i4_delay: {
    label: 'I4 Delayed Downlink',
    targetScenarioFamily: 'delayed_support_event',
    crewId: 'I4-CMO-06',
    missionDay: 3,
    mode: 'Medical Event',
    scenarioType: 'Event with delayed ground consultation',
    datasetGrounding:
      'Derived from Inspiration4-style OSDR processed signals: OSD-569 whole blood, OSD-570 PBMC, OSD-571 plasma, plus crew-entered symptoms and ops context.',
    lastReviewNote: 'Moderate concern with delayed contact to ground support.',
    priorEpisodes: 1,
    priorViralReactivationHistory: 0,
    immuneBaselineShift: 1,
    recentCountermeasureUse: 'Enhanced surveillance',
    feverishness: 4,
    respiratorySymptoms: 5,
    giSymptoms: 1,
    rashOrDermatitis: 0,
    fatigue: 6,
    sleepQuality: 4,
    stressLoad: 7,
    closeContactExposure: 1,
    trendWorsening: 1,
    wholeBloodInflammation: 6,
    wholeBloodInterferon: 4,
    pbmcImmuneShift: 6,
    plasmaAcutePhase: 6,
    plasmaMetabolicStress: 5,
    salivaViralSignal: 3,
    cabinExposureConcern: 3,
    commDelayMinutes: 18,
    cmoAvailable: 1,
    medKitStatus: 'Nominal',
    isolationCapability: 'Available',
  },
  i4_constrained: {
    label: 'I4 Constrained',
    targetScenarioFamily: 'constrained_support_event',
    crewId: 'I4-CMO-07',
    missionDay: 3,
    mode: 'Medical Event',
    scenarioType: 'CMO unavailable / med-kit constrained simulation',
    datasetGrounding:
      'Derived from Inspiration4-style OSDR processed signals: OSD-569 whole blood, OSD-570 PBMC, OSD-571 plasma, plus crew-entered symptoms and ops context.',
    lastReviewNote: 'Escalation during constrained operational support window.',
    priorEpisodes: 2,
    priorViralReactivationHistory: 1,
    immuneBaselineShift: 1,
    recentCountermeasureUse: 'Monitoring + infection-control',
    feverishness: 6,
    respiratorySymptoms: 6,
    giSymptoms: 2,
    rashOrDermatitis: 2,
    fatigue: 8,
    sleepQuality: 3,
    stressLoad: 8,
    closeContactExposure: 1,
    trendWorsening: 1,
    wholeBloodInflammation: 7,
    wholeBloodInterferon: 6,
    pbmcImmuneShift: 8,
    plasmaAcutePhase: 7,
    plasmaMetabolicStress: 7,
    salivaViralSignal: 5,
    cabinExposureConcern: 4,
    commDelayMinutes: 12,
    cmoAvailable: 0,
    medKitStatus: 'Limited',
    isolationCapability: 'Unavailable',
  },
};

const SELF_TESTS = [
  { name: 'Nominal preset exists', pass: !!PRESETS.i4_nominal },
  { name: 'Watch preset exists', pass: !!PRESETS.i4_watch },
  { name: 'Constrained preset exists', pass: !!PRESETS.i4_constrained },
];

const severityStyles = {
  Low: 'bg-green-100 text-green-800 border-green-200',
  Moderate: 'bg-amber-100 text-amber-800 border-amber-200',
  High: 'bg-red-100 text-red-800 border-red-200',
};

const missionPriorityStyles = {
  Monitor: 'bg-slate-100 text-slate-700',
  Review: 'bg-amber-100 text-amber-800',
  Immediate: 'bg-red-100 text-red-800',
};

const SCENARIO_LIBRARY = {
  reactivation_watch: {
    id: 'reactivation_watch',
    name: 'Viral reactivation / immune dysregulation watch',
    goal: 'Detect watch-list cases early enough to repeat sampling, increase monitoring, and escalate before overt deterioration.',
    triggerSummary: 'Mild/mixed symptoms with immune baseline shift, reactivation history, and biomarker deviation.',
    triggerCriteria: [
      'Saliva viral signal >= 6 or prior viral reactivation history present.',
      'PBMC immune shift >= 5 or persistent immune baseline shift present.',
      'Rash/dermatitis >= 4 or mixed symptoms without a dominant respiratory pattern.',
    ],
    minimumRequiredInputs: ['Symptoms', 'Trend', 'PBMC/whole-blood/plasma features', 'Saliva viral signal', 'Exposure context'],
    dags: ['Immune Risk', 'Microhost Risk', 'Medical Risk'],
    redFlags: ['Worsening trend with high viral signal', 'High fatigue with feverishness', 'CMO unavailable'],
    allowedActions: ['Continue routine monitoring', 'Repeat check in X hours', 'Isolate / infection-control precautions', 'Escalate to CMO', 'Escalate to ground urgently'],
    neverEvents: ['No reassurance if viral signal and trend are both rising', 'No predefined support bundle if required inputs are missing'],
    confounders: ['Sleep debt and stress effects', 'Nonspecific inflammatory elevation'],
    validationTarget: 'Correctly route mild reactivation-like cases to watch/escalate without overcalling diagnosis.',
  },
  respiratory_syndrome: {
    id: 'respiratory_syndrome',
    name: 'Respiratory infectious syndrome',
    goal: 'Support monitor vs isolate vs onboard support vs urgent escalation for respiratory-like events.',
    triggerSummary: 'Feverishness + respiratory burden + worsening trend + exposure concern.',
    triggerCriteria: [
      'Respiratory symptoms >= 4.',
      'Feverishness >= 4 or whole-blood inflammation >= 5.',
      'Worsening trend, close-contact exposure, or cabin exposure concern present.',
    ],
    minimumRequiredInputs: ['Symptoms', 'Trend', 'Whole-blood inflammation/interferon', 'Exposure context', 'Ops constraints'],
    dags: ['Medical Risk', 'Microhost Risk', 'Immune Risk'],
    redFlags: ['Rapidly worsening respiratory burden', 'High fatigue with feverishness', 'Isolation unavailable'],
    allowedActions: ['Continue routine monitoring', 'Repeat check in X hours', 'Isolate / infection-control precautions', 'Start predefined countermeasure bundle', 'Escalate to CMO', 'Escalate to ground urgently'],
    neverEvents: ['No low-risk reassurance when respiratory red flags are active', 'No unsupported disease diagnosis'],
    confounders: ['Cabin irritant effects', 'Fatigue-only performance decline'],
    validationTarget: 'Prefer safer triage when respiratory symptoms, trend, and exposure cluster together.',
  },
  delayed_support_event: {
    id: 'delayed_support_event',
    name: 'Delayed-ground-support medical event',
    goal: 'Preserve safe decisions when ground support is delayed.',
    triggerSummary: 'Clinically relevant concern with comm delay that limits real-time consultation.',
    triggerCriteria: [
      'Communication delay >= 10 minutes, or any delay with moderate/high triage concern.',
      'Medical Event mode or worsening trend present.',
      'Onboard actions must be executable before ground response.',
    ],
    minimumRequiredInputs: ['Core symptoms', 'Trend', 'Biomarker severity', 'Comm delay', 'CMO and med-kit status'],
    dags: ['Medical Risk', 'Immune Risk', 'Pharm Risk'],
    redFlags: ['Long comm delay', 'High triage band', 'CMO unavailable'],
    allowedActions: ['Repeat check in X hours', 'Start predefined countermeasure bundle', 'Escalate to CMO', 'Escalate to ground urgently'],
    neverEvents: ['No recommendation that depends on real-time ground support when delay is high', 'No low-risk reassurance if red flags are active'],
    confounders: ['Delay-driven anxiety', 'Incomplete handoff to ground'],
    validationTarget: 'Escalate earlier when the same clinical state becomes riskier because support is delayed.',
  },
  constrained_support_event: {
    id: 'constrained_support_event',
    name: 'Resource-constrained infection event',
    goal: 'Deliver safest fallback actions with personnel/equipment constraints.',
    triggerSummary: 'CMO unavailable, med-kit limited, or isolation unavailable during infection concern.',
    triggerCriteria: [
      'CMO unavailable, med-kit limited, or isolation unavailable.',
      'Any moderate/high triage concern or worsening trend.',
      'Fallback plan must avoid actions that cannot be executed onboard.',
    ],
    minimumRequiredInputs: ['Core symptoms', 'Trend', 'Biomarker severity', 'CMO status', 'Med-kit and isolation status'],
    dags: ['Medical Risk', 'Pharm Risk', 'Immune Risk'],
    redFlags: ['CMO unavailable', 'Medical kit constrained', 'Isolation capability unavailable'],
    allowedActions: ['Repeat check in X hours', 'Isolate / infection-control precautions', 'Start predefined countermeasure bundle', 'Escalate to CMO', 'Escalate to ground urgently'],
    neverEvents: ['No action requiring unavailable resources', 'No reassurance when resource constraints block safe isolation or support'],
    confounders: ['Operational constraints masking clinical severity', 'Inability to isolate despite exposure concern'],
    validationTarget: 'Return the safest fallback plan under degraded operations.',
  },
};

const SCENARIO_IDS = Object.keys(SCENARIO_LIBRARY);

const MVP_SCOPE = {
  claim: 'Remote infection-event triage for respiratory-like or viral-reactivation-like presentations under delayed or constrained support.',
  primaryQuestion: 'What should the crew do right now, and what information would change that decision?',
  outputBoundary: 'Decision support for monitoring, repeat checks, precautions, predefined support bundles, and escalation. No bedside diagnosis claim.',
};

const VALIDATION_TARGETS = [
  'Correct scenario assignment against expert-authored cases.',
  'Safe escalation when red flags or operational constraints are present.',
  'No dangerous false reassurance when evidence is missing, inconsistent, or worsening.',
  'Clinician-rated usefulness of DAG explanations and node targets.',
  'Ablation comparison of scenario triage with and without DAG reasoning.',
];

const FEATURE_TABLE = [
  { feature: 'Feverishness', source: 'Crew symptom report', meaning: 'Potential systemic illness burden', scenarioUse: 'Respiratory triage and red-flag escalation', actionImplication: 'Increase reassessment urgency when paired with fatigue or worsening trend' },
  { feature: 'Respiratory symptoms', source: 'Crew symptom report', meaning: 'Respiratory-like presentation burden', scenarioUse: 'Respiratory syndrome routing', actionImplication: 'Supports precautions, repeat check, and escalation when trending worse' },
  { feature: 'PBMC immune shift', source: 'Derived PBMC feature', meaning: 'Immune-state deviation from expected baseline', scenarioUse: 'Reactivation / immune dysregulation watch', actionImplication: 'Supports repeat sampling and watch-list status' },
  { feature: 'Saliva viral signal', source: 'Derived saliva feature', meaning: 'Viral shedding/reactivation-like signal', scenarioUse: 'Reactivation watch and uncertainty reduction', actionImplication: 'Supports targeted reassessment and CMO escalation if worsening' },
  { feature: 'Comm delay', source: 'Operations context', meaning: 'Ground support latency', scenarioUse: 'Delayed-support event routing', actionImplication: 'Prioritizes onboard executable actions and early downlink packet' },
  { feature: 'CMO / med-kit / isolation status', source: 'Operations context', meaning: 'Execution capability constraints', scenarioUse: 'Constrained-support event routing', actionImplication: 'Blocks resource-dependent recommendations and triggers safer fallback plan' },
];

function scenarioCandidatesForState(state, band = 'Low') {
  return [
    {
      id: 'reactivation_watch',
      score:
        (state.salivaViralSignal >= 6 ? 3 : 0) +
        (state.priorViralReactivationHistory ? 2 : 0) +
        (state.rashOrDermatitis >= 4 ? 2 : 0) +
        (state.immuneBaselineShift ? 1 : 0) +
        (state.pbmcImmuneShift >= 5 ? 1 : 0),
    },
    {
      id: 'respiratory_syndrome',
      score:
        (state.respiratorySymptoms >= 4 ? 3 : 0) +
        (state.feverishness >= 4 ? 2 : 0) +
        (state.trendWorsening ? 2 : 0) +
        (state.closeContactExposure ? 1 : 0) +
        (state.wholeBloodInflammation >= 5 ? 1 : 0),
    },
    {
      id: 'delayed_support_event',
      score:
        (state.commDelayMinutes >= 10 ? 4 : state.commDelayMinutes > 0 ? 2 : 0) +
        (band === 'High' ? 2 : band === 'Moderate' ? 1 : 0) +
        (state.mode === 'Medical Event' ? 1 : 0),
    },
    {
      id: 'constrained_support_event',
      score:
        (!state.cmoAvailable ? 3 : 0) +
        (state.medKitStatus === 'Limited' ? 2 : 0) +
        (state.isolationCapability === 'Unavailable' ? 2 : 0) +
        (band === 'High' ? 2 : band === 'Moderate' ? 1 : 0),
    },
  ];
}

function routeScenarioIdFromCandidates(scenarioCandidates) {
  const scenarioById = Object.fromEntries(scenarioCandidates.map((candidate) => [candidate.id, candidate]));

  if (scenarioById.constrained_support_event.score >= 3) {
    return 'constrained_support_event';
  }
  if (scenarioById.delayed_support_event.score >= 4) {
    return 'delayed_support_event';
  }
  if (scenarioById.reactivation_watch.score >= scenarioById.respiratory_syndrome.score) {
    return 'reactivation_watch';
  }
  return 'respiratory_syndrome';
}

function routeScenarioIdForState(state, band = 'Low') {
  return routeScenarioIdFromCandidates(scenarioCandidatesForState(state, band));
}

const SCENARIO_SELF_TESTS = [
  { name: 'Four scenario families locked', pass: SCENARIO_IDS.length === 4 },
  { name: 'Scenario matrix fields present', pass: SCENARIO_IDS.every((id) => SCENARIO_LIBRARY[id].triggerCriteria?.length && SCENARIO_LIBRARY[id].minimumRequiredInputs?.length && SCENARIO_LIBRARY[id].allowedActions?.length && SCENARIO_LIBRARY[id].neverEvents?.length) },
  { name: 'Scenario actions stay bounded', pass: SCENARIO_IDS.every((id) => SCENARIO_LIBRARY[id].allowedActions.every((action) => ['Continue routine monitoring', 'Repeat check in X hours', 'Isolate / infection-control precautions', 'Start predefined countermeasure bundle', 'Escalate to CMO', 'Escalate to ground urgently'].includes(action))) },
  { name: 'Feature table present', pass: FEATURE_TABLE.length >= 6 },
  { name: 'I4 presets route to expected families', pass: Object.values(PRESETS).filter((preset) => preset.targetScenarioFamily).every((preset) => routeScenarioIdForState(preset) === preset.targetScenarioFamily) },
];

const SCENARIO_NODE_TARGETS = {
  reactivation_watch: {
    'Immune Risk': [
      'Clinically Significant Immune Dysregulation',
      'Persistent Subclinical Immune Dysregulation',
      'Medical Illness',
      'Microbial Virulence Factors',
      'Pharm (Risk)',
    ],
    'Microhost Risk': [
      'Immune (Risk)',
      'Microbial Virulence Factors',
      'Medical Treatment Capability',
      'Intervention Source Control',
    ],
    'Medical Risk': [
      'Medical Illness',
      'Medical Diagnostic Capability',
      'Medical Treatment Capability',
      'Detect Physiologic Changes',
    ],
  },
  respiratory_syndrome: {
    'Medical Risk': [
      'Medical Illness',
      'Environmental Conditions',
      'Detect Diagnosis',
      'Medical Diagnostic Capability',
      'Ground Support',
    ],
    'Microhost Risk': [
      'Air Contamination',
      'Surface Contamination',
      'Microbial Virulence Factors',
      'Immune (Risk)',
      'Intervention Source Control',
    ],
    'Immune Risk': [
      'Medical Illness',
      'Clinically Significant Immune Dysregulation',
      'Hypoxia, CO2 (Risks)',
      'Isolation and Confinement',
    ],
  },
  delayed_support_event: {
    'Medical Risk': [
      'Distance from Earth',
      'Communication Factors',
      'Ground Support',
      'Data Accessibility',
      'On-Board Expertise',
    ],
    'Immune Risk': [
      'Distance from Earth',
      'Crew Capability',
      'Medical Treatment Capability',
      'Medical Prevention Capability',
    ],
    'Pharm Risk': [
      'Distance from Earth',
      'Medical Treatment Capability',
      'Medical Diagnostic Capability',
      'Pharmaceutical Effectiveness',
    ],
  },
  constrained_support_event: {
    'Medical Risk': [
      'Crew Capability',
      'Medical Treatment Capability',
      'Medical Prevention Capability',
      'On-Board Expertise',
      'Loss of Mission Objectives',
    ],
    'Pharm Risk': [
      'Medical Treatment Capability',
      'Medical Prevention Capability',
      'Pharmaceutical Effectiveness',
      'Medication Compatibility',
    ],
    'Immune Risk': [
      'Crew Capability',
      'Medical Treatment Capability',
      'Medical Prevention Capability',
      'Loss of Mission Objectives',
    ],
  },
};

const DAG_SCENARIO_SELF_TESTS = [
  { name: 'Scenario DAG node targets configured', pass: SCENARIO_IDS.every((id) => SCENARIO_LIBRARY[id].dags.every((dagName) => SCENARIO_NODE_TARGETS[id]?.[dagName]?.length > 0)) },
];

function scoreBand(score) {
  if (score >= 50) return 'High';
  if (score >= 28) return 'Moderate';
  return 'Low';
}

function missionPriorityForBand(band) {
  if (band === 'High') return 'Immediate';
  if (band === 'Moderate') return 'Review';
  return 'Monitor';
}

export default function CDSSInfectionRiskPrototype() {
  const [state, setState] = useState(PRESETS.i4_watch);
  const [activeTab, setActiveTab] = useState('event');
  const [expandedAgents, setExpandedAgents] = useState({});
  const [copyFeedback, setCopyFeedback] = useState('idle');
  const [dagFocus, setDagFocus] = useState('Immune Risk');
  const [dagNodeFocus, setDagNodeFocus] = useState('');

  const toggleAgent = (name) => {
    setExpandedAgents((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const setField = (key, value) => {
    setState((prev) => {
      if (typeof value === 'number' && !Number.isFinite(value)) return prev;
      return { ...prev, [key]: value };
    });
  };

  const loadPreset = (presetKey) => {
    setState(PRESETS[presetKey]);
  };

  const biomarkerAgent = useMemo(() => {
    let score = 0;
    const drivers = [];
    const add = (points, label) => {
      score += points;
      drivers.push({ label, points, source: 'Biomarker agent' });
    };

    if (state.wholeBloodInflammation >= 8) add(18, 'Whole blood inflammatory signature strongly elevated');
    else if (state.wholeBloodInflammation >= 5) add(10, 'Whole blood inflammatory signature moderately elevated');

    if (state.wholeBloodInterferon >= 7) add(12, 'Whole blood antiviral/interferon signature elevated');
    else if (state.wholeBloodInterferon >= 4) add(6, 'Whole blood interferon pattern mildly elevated');

    if (state.pbmcImmuneShift >= 8) add(18, 'PBMC immune-state deviation strongly elevated');
    else if (state.pbmcImmuneShift >= 5) add(10, 'PBMC immune-state deviation moderately elevated');

    if (state.plasmaAcutePhase >= 8) add(16, 'Plasma acute-phase response elevated');
    else if (state.plasmaAcutePhase >= 5) add(8, 'Plasma acute-phase response mildly elevated');

    if (state.plasmaMetabolicStress >= 7) add(8, 'Plasma metabolic stress pattern elevated');
    else if (state.plasmaMetabolicStress >= 5) add(4, 'Mild metabolic stress signal');

    if (state.salivaViralSignal >= 7) add(18, 'Saliva viral shedding/reactivation signal elevated');
    else if (state.salivaViralSignal >= 4) add(10, 'Mild saliva viral signal detected');

    if (state.immuneBaselineShift) add(8, 'Persistent deviation from personal baseline');

    const clipped = Math.min(100, score);
    const topDrivers = [...drivers].sort((a, b) => b.points - a.points).slice(0, 4);

    let summary = 'Biomarker agent finds limited evidence of current infectious-risk escalation.';
    if (clipped >= 55) summary = 'Biomarker agent finds strong multimodal evidence of immune perturbation.';
    else if (clipped >= 30) summary = 'Biomarker agent finds moderate evidence of immune perturbation.';

    return { score: clipped, topDrivers, summary };
  }, [state]);

  const contextAgent = useMemo(() => {
    let score = 0;
    const drivers = [];
    const add = (points, label) => {
      score += points;
      drivers.push({ label, points, source: 'Context agent' });
    };

    if (state.feverishness >= 7) add(18, 'Crew reports strong feverishness');
    else if (state.feverishness >= 4) add(8, 'Crew reports mild feverishness');

    if (state.respiratorySymptoms >= 7) add(14, 'Respiratory symptom burden high');
    else if (state.respiratorySymptoms >= 4) add(7, 'Respiratory symptom burden moderate');

    if (state.giSymptoms >= 5) add(8, 'GI symptom burden notable');
    else if (state.giSymptoms >= 2) add(3, 'GI symptoms mild');

    if (state.rashOrDermatitis >= 4) add(7, 'Dermatitis/rash may be consistent with reactivation-related concern');

    if (state.fatigue >= 7) add(8, 'Fatigue burden high');
    else if (state.fatigue >= 4) add(4, 'Fatigue burden moderate');

    if (state.sleepQuality <= 3) add(8, 'Sleep degradation may increase susceptibility');
    else if (state.sleepQuality <= 5) add(4, 'Sleep quality reduced');

    if (state.stressLoad >= 8) add(8, 'Stress load high');
    else if (state.stressLoad >= 6) add(4, 'Stress load moderate');

    if (state.closeContactExposure) add(6, 'Recent close-contact exposure reported');
    if (state.trendWorsening) add(10, 'Symptoms worsening across serial checks');
    if (state.priorEpisodes >= 2) add(5, 'Multiple prior immune-risk episodes this mission');
    else if (state.priorEpisodes === 1) add(2, 'One prior immune-risk episode this mission');
    if (state.priorViralReactivationHistory) add(5, 'History of viral reactivation during mission');
    if (state.cabinExposureConcern >= 5) add(5, 'Cabin exposure concern elevated');
    else if (state.cabinExposureConcern >= 3) add(2, 'Cabin exposure concern mild');

    const clipped = Math.min(100, score);
    const topDrivers = [...drivers].sort((a, b) => b.points - a.points).slice(0, 4);

    let summary = 'Context agent finds limited operational evidence of acute infectious concern.';
    if (clipped >= 50) summary = 'Context agent finds strong symptom and exposure evidence of concern.';
    else if (clipped >= 28) summary = 'Context agent finds moderate symptom and exposure evidence of concern.';

    return { score: clipped, topDrivers, summary };
  }, [state]);

  const exposureAgent = useMemo(() => {
    let score = 0;
    const drivers = [];
    const add = (points, label) => {
      score += points;
      drivers.push({ label, points, source: 'Exposure agent' });
    };

    if (state.closeContactExposure) add(7, 'Recent close-contact exposure');
    if (state.trendWorsening) add(10, 'Worsening trend across serial checks');
    if (state.priorEpisodes >= 2) add(5, 'Multiple prior immune-risk episodes');
    else if (state.priorEpisodes === 1) add(2, 'One prior immune-risk episode');
    if (state.priorViralReactivationHistory) add(5, 'Prior viral reactivation history');
    if (state.cabinExposureConcern >= 5) add(6, 'Cabin exposure concern high');
    else if (state.cabinExposureConcern >= 3) add(3, 'Cabin exposure concern mild');

    const clipped = Math.min(100, score);
    const topDrivers = [...drivers].sort((a, b) => b.points - a.points).slice(0, 4);

    let summary = 'Exposure agent finds limited contextual exposure concern.';
    if (clipped >= 20) summary = 'Exposure agent finds moderate contextual exposure concern.';
    if (clipped >= 28) summary = 'Exposure agent finds strong trend and exposure concern.';

    return { score: clipped, topDrivers, summary };
  }, [state]);

  const syndromeAgent = useMemo(() => {
    const patterns = [];

    if (state.salivaViralSignal >= 7 && state.rashOrDermatitis >= 4) {
      patterns.push({ label: 'Possible viral reactivation event', confidence: 'High', reason: 'Strong saliva viral signal plus rash/dermatitis.' });
    }
    if (state.respiratorySymptoms >= 4 && state.wholeBloodInflammation >= 5) {
      patterns.push({ label: 'Possible respiratory infectious-risk pattern', confidence: 'Moderate', reason: 'Respiratory burden with inflammatory signature.' });
    }
    if (state.pbmcImmuneShift >= 5 || state.plasmaAcutePhase >= 5 || state.wholeBloodInflammation >= 5) {
      patterns.push({ label: 'Immune dysregulation / early infectious-risk watch', confidence: 'Moderate', reason: 'Immune-state deviation without a single dominant syndrome.' });
    }
    if (patterns.length === 0) {
      patterns.push({ label: 'No strong syndrome flag', confidence: 'Low', reason: 'Current inputs do not strongly match a predefined syndrome.' });
    }

    const topPattern = patterns[0];
    const score = topPattern.confidence === 'High' ? 80 : topPattern.confidence === 'Moderate' ? 55 : 20;
    return {
      score,
      topPattern: topPattern.label,
      summary: topPattern.reason,
      topDrivers: [{ label: topPattern.label, points: topPattern.confidence === 'High' ? 12 : topPattern.confidence === 'Moderate' ? 8 : 3, source: 'Syndrome agent' }],
    };
  }, [state]);

  const operationsAgent = useMemo(() => {
    let autonomyNeed = 0;
    const notes = [];

    if (state.commDelayMinutes >= 10) {
      autonomyNeed += 15;
      notes.push('Significant communication delay increases onboard autonomy requirement.');
    } else if (state.commDelayMinutes > 0) {
      autonomyNeed += 6;
      notes.push('Partial communication delay may slow ground consultation.');
    } else {
      notes.push('Near-real-time communication available.');
    }

    if (!state.cmoAvailable) {
      autonomyNeed += 15;
      notes.push('Crew Medical Officer unavailable, increasing need for guided support.');
    } else {
      notes.push('Crew Medical Officer available for guided execution.');
    }

    if (state.medKitStatus === 'Limited') {
      autonomyNeed += 8;
      notes.push('Medical kit constraints should affect recommendations.');
    } else {
      notes.push('Medical kit status nominal for current scenario.');
    }

    if (state.isolationCapability === 'Unavailable') {
      autonomyNeed += 6;
      notes.push('Isolation options constrained by vehicle operations.');
    } else {
      notes.push('Isolation and distancing options are available if needed.');
    }

    return {
      score: Math.min(100, autonomyNeed),
      notes,
      summary:
        autonomyNeed >= 20
          ? 'Operations agent indicates elevated need for onboard autonomous decision support.'
          : 'Operations agent indicates nominal onboard support conditions.',
    };
  }, [state]);

  const analysis = useMemo(() => {
    const biomarkerHandoff = {
      agent: 'Biomarker agent',
      score: biomarkerAgent.score,
      confidence: biomarkerAgent.score >= 55 ? 'High' : biomarkerAgent.score >= 30 ? 'Moderate' : 'Low',
      keySignals: biomarkerAgent.topDrivers.map((d) => d.label),
      assessment: biomarkerAgent.summary,
      reasoningTrace: [
        'Read whole-blood inflammatory and interferon-derived features.',
        'Read PBMC immune-shift feature against personal baseline.',
        'Read plasma acute-phase and metabolic-stress derived features.',
        'Integrated saliva viral signal into biomarker evidence summary.',
      ],
      recommendedNextStep: biomarkerAgent.score >= 55 ? 'Repeat biomarker confirmation and escalate for review.' : 'Continue biomarker trend tracking.',
    };

    const contextHandoff = {
      agent: 'Context agent',
      score: contextAgent.score,
      confidence: contextAgent.score >= 50 ? 'High' : contextAgent.score >= 28 ? 'Moderate' : 'Low',
      keySignals: contextAgent.topDrivers.map((d) => d.label),
      assessment: contextAgent.summary,
      reasoningTrace: [
        'Scored feverishness, respiratory, GI, dermatologic, and fatigue burden.',
        'Adjusted for sleep degradation and stress load.',
        'Integrated serial trend flag and recent symptom evolution.',
      ],
      recommendedNextStep: contextAgent.score >= 50 ? 'Prompt clinical review of reported symptoms and fatigue burden.' : 'Maintain symptom logging cadence.',
    };

    const exposureHandoff = {
      agent: 'Exposure agent',
      score: exposureAgent.score,
      confidence: exposureAgent.score >= 28 ? 'High' : exposureAgent.score >= 20 ? 'Moderate' : 'Low',
      keySignals: exposureAgent.topDrivers.map((d) => d.label),
      assessment: exposureAgent.summary,
      reasoningTrace: [
        'Checked recent close-contact and cabin-exposure indicators.',
        'Reviewed prior mission episodes and reactivation history.',
        'Weighted worsening trend across serial checks.',
      ],
      recommendedNextStep: exposureAgent.score >= 20 ? 'Review exposure chain and recent mission interactions.' : 'No major exposure-driven action indicated.',
    };

    const syndromeHandoff = {
      agent: 'Syndrome agent',
      score: syndromeAgent.score,
      confidence: syndromeAgent.score >= 80 ? 'High' : syndromeAgent.score >= 55 ? 'Moderate' : 'Low',
      keySignals: syndromeAgent.topDrivers.map((d) => d.label),
      assessment: syndromeAgent.summary,
      topPattern: syndromeAgent.topPattern,
      reasoningTrace: [
        'Matched current evidence against predefined infectious-risk scenarios.',
        'Checked for viral-reactivation pattern, respiratory pattern, and nonspecific immune dysregulation.',
        'Selected highest-priority syndrome candidate for orchestration.',
      ],
      recommendedNextStep: syndromeAgent.score >= 55 ? 'Use syndrome-specific checklist and targeted reassessment.' : 'Continue general infectious-risk surveillance.',
    };

    const operationsHandoff = {
      agent: 'Operations agent',
      score: operationsAgent.score,
      confidence: operationsAgent.score >= 20 ? 'High' : operationsAgent.score >= 8 ? 'Moderate' : 'Low',
      keySignals: operationsAgent.notes,
      assessment: operationsAgent.summary,
      reasoningTrace: [
        'Checked communication-delay impact on Earth support.',
        'Checked Crew Medical Officer availability and med-kit constraints.',
        'Checked isolation feasibility and vehicle operations constraints.',
      ],
      recommendedNextStep: operationsAgent.score >= 20 ? 'Prioritize autonomous onboard guidance due to operational constraints.' : 'Ground-assisted workflow remains feasible.',
    };

    const agentHandoffs = [biomarkerHandoff, contextHandoff, exposureHandoff, syndromeHandoff, operationsHandoff];
    const integratedScore = Math.min(100, Math.round(
      4.98 +
      biomarkerAgent.score * 0.41 +
      contextAgent.score * 0.34 +
      exposureAgent.score * 0.04 +
      operationsAgent.score * 0.06 +
      syndromeAgent.score * 0.20
    ));
    const evidenceCount = biomarkerAgent.topDrivers.length + contextAgent.topDrivers.length + exposureAgent.topDrivers.length + syndromeAgent.topDrivers.length;
    const agreementGap = Math.abs(biomarkerAgent.score - contextAgent.score);

    let confidence = 'Moderate';
    if (agreementGap <= 12 && evidenceCount >= 5) confidence = 'High';
    else if (agreementGap >= 28 || evidenceCount <= 2) confidence = 'Low';

    const modelBand = scoreBand(integratedScore);
    const syndrome = syndromeAgent.topPattern;

    const allDrivers = [...biomarkerAgent.topDrivers, ...contextAgent.topDrivers, ...exposureAgent.topDrivers, ...syndromeAgent.topDrivers]
      .sort((a, b) => b.points - a.points)
      .slice(0, 6);

    const redFlags = [
      state.trendWorsening && (state.feverishness >= 6 || state.respiratorySymptoms >= 6 || state.salivaViralSignal >= 7) ? 'Rapidly worsening trend with high symptom or viral burden' : null,
      state.fatigue >= 7 && state.feverishness >= 6 ? 'High fatigue with feverishness' : null,
      !state.cmoAvailable ? 'Crew Medical Officer unavailable' : null,
      state.medKitStatus === 'Limited' ? 'Medical kit constrained' : null,
      state.isolationCapability === 'Unavailable' ? 'Isolation capability unavailable' : null,
    ].filter(Boolean);

    const inputCoverage = [
      {
        label: 'Symptoms',
        available: [state.feverishness, state.respiratorySymptoms, state.giSymptoms, state.rashOrDermatitis, state.fatigue].every((value) => Number.isFinite(value)),
      },
      {
        label: 'Trend',
        available: Number.isFinite(state.trendWorsening),
      },
      {
        label: 'Biomarkers',
        available: [state.wholeBloodInflammation, state.wholeBloodInterferon, state.pbmcImmuneShift, state.plasmaAcutePhase, state.plasmaMetabolicStress, state.salivaViralSignal].every((value) => Number.isFinite(value)),
      },
      {
        label: 'Exposure context',
        available: Number.isFinite(state.cabinExposureConcern) && Number.isFinite(state.closeContactExposure),
      },
      {
        label: 'Operational constraints',
        available: Number.isFinite(state.commDelayMinutes) && typeof state.medKitStatus === 'string' && typeof state.isolationCapability === 'string',
      },
    ];

    const missingInputs = inputCoverage.filter((item) => !item.available).map((item) => item.label);
    const guardrailEscalationTriggered = redFlags.length > 0 && modelBand === 'Low';
    const band = guardrailEscalationTriggered ? 'Moderate' : modelBand;
    const missionPriority = missionPriorityForBand(band);

    const scenarioCandidates = scenarioCandidatesForState(state, band);
    const scenarioById = Object.fromEntries(scenarioCandidates.map((candidate) => [candidate.id, candidate]));
    const routedScenarioId = routeScenarioIdFromCandidates(scenarioCandidates);

    const routedScenario = SCENARIO_LIBRARY[routedScenarioId];
    const scenarioMatrix = SCENARIO_IDS.map((id) => ({
      ...SCENARIO_LIBRARY[id],
      score: scenarioById[id]?.score ?? 0,
      active: id === routedScenarioId,
    }));

    const alternativeExplanations = [
      state.sleepQuality <= 4 && state.stressLoad >= 6 ? 'Sleep and stress burden may amplify symptoms without a dominant infectious driver.' : null,
      state.cabinExposureConcern >= 4 && !state.closeContactExposure ? 'Environmental cabin factors may contribute to respiratory burden.' : null,
      state.plasmaMetabolicStress >= 6 && state.feverishness < 4 ? 'Metabolic stress could partially explain fatigue trend.' : null,
    ].filter(Boolean);

    if (!alternativeExplanations.length) {
      alternativeExplanations.push('No strong alternative explanation currently dominates the infectious interpretation.');
    }

    const uncertaintyReducers = [
      agreementGap >= 20 ? 'Repeat symptom and biomarker check to reconcile context-biomarker disagreement.' : null,
      confidence === 'Low' ? 'Increase reassessment cadence and request secondary reviewer confirmation.' : null,
      state.salivaViralSignal >= 4 && state.priorViralReactivationHistory ? 'Repeat saliva signal and targeted dermatologic review for reactivation confirmation.' : null,
      state.respiratorySymptoms >= 5 ? 'Reassess respiratory burden trajectory and exposure chain in the next check.' : null,
      state.commDelayMinutes >= 10 ? 'Prepare richer downlink packet early to reduce delay-related uncertainty.' : null,
    ].filter(Boolean);

    if (!uncertaintyReducers.length) {
      uncertaintyReducers.push('Current evidence coherence is acceptable; continue routine surveillance cadence.');
    }

    const strongestDrivers = allDrivers.slice(0, 4).map((driver) => `${driver.label} (+${driver.points})`);
    const dagEvidenceMap = {
      scenario: routedScenario.name,
      dagModels: routedScenario.dags,
      strongestDrivers,
      alternativeExplanations,
      uncertaintyReducers,
      confounders: routedScenario.confounders,
    };

    const rawDagNodeTargets = SCENARIO_NODE_TARGETS[routedScenarioId] || {};
    const dagNodeTargetsByGraph = Object.fromEntries(
      routedScenario.dags.map((dagName) => [dagName, rawDagNodeTargets[dagName] || []])
    );

    const confirmatoryActions =
      band === 'Low'
        ? ['Continue routine surveillance cadence.', 'Recheck crew-entered symptoms at next scheduled medical review.']
        : band === 'Moderate'
          ? ['Repeat symptom review within 12–24 hours.', 'Repeat available biomarker collection or simplified reassessment.', 'Review recent exposure chain and environmental hygiene status.']
          : ['Repeat confirmatory assessment as soon as feasible.', 'Review whether crew member should limit discretionary close contact.', 'Package case summary for expedited medical downlink.'];

    const reassessmentHours = redFlags.length > 0 || band === 'High' ? 4 : band === 'Moderate' ? 12 : 24;
    const boundedProtocolActions = [];
    if (missingInputs.length > 0) {
      boundedProtocolActions.push('Collect required inputs before starting a predefined support bundle.');
    }
    if (band === 'Low' && redFlags.length === 0) {
      boundedProtocolActions.push('Continue routine monitoring.');
    }
    boundedProtocolActions.push(`Repeat check in ${reassessmentHours} hours.`);
    if (band !== 'Low' || state.closeContactExposure || state.cabinExposureConcern >= 3) {
      boundedProtocolActions.push('Isolate / infection-control precautions.');
    }
    if (band === 'Moderate' || band === 'High') {
      boundedProtocolActions.push('Start predefined countermeasure bundle.');
    }
    if (band === 'High' || state.trendWorsening || !state.cmoAvailable) {
      boundedProtocolActions.push('Escalate to CMO.');
    }
    if (band === 'High' || state.commDelayMinutes >= 10 || !state.cmoAvailable || state.medKitStatus === 'Limited') {
      boundedProtocolActions.push('Escalate to ground urgently.');
    }

    const protocolActions = [...new Set(boundedProtocolActions)].slice(0, 6);
    const neverEvents = [
      {
        rule: 'No predefined support bundle if required inputs are missing.',
        triggered: missingInputs.length > 0,
      },
      {
        rule: 'No low-risk reassurance when red flags are present.',
        triggered: guardrailEscalationTriggered,
      },
      {
        rule: 'No reassurance when context and biomarker evidence are inconsistent.',
        triggered: agreementGap >= 28,
      },
    ];

    const neverEventViolations = neverEvents.filter((item) => item.triggered).map((item) => item.rule);
    const executionProtocol = {
      scenario: routedScenario.name,
      immediateAction: protocolActions[0] || confirmatoryActions[0] || 'Continue routine monitoring.',
      actions: protocolActions,
      allowedActions: routedScenario.allowedActions,
      reassessmentHours,
      redFlags,
      missingInputs,
      neverEvents,
    };

    const studyReadiness = {
      mvpClaim: MVP_SCOPE.claim,
      caseSetTarget: '20-30 synthetic or expert-authored cases before manuscript submission.',
      primaryOutcome: 'Did the system make the safer triage decision?',
      evaluationAxes: VALIDATION_TARGETS,
      currentCaseSignals: {
        scenarioAssigned: routedScenario.name,
        safeEscalation: protocolActions.some((action) => action.includes('Escalate')),
        falseReassuranceBlocked: neverEventViolations.length > 0 || band !== 'Low',
        dagExplanationAvailable: dagEvidenceMap.dagModels.length > 0 && dagEvidenceMap.strongestDrivers.length > 0,
      },
      ablationQuestion: 'Compare the same scenario router with DAG drivers hidden versus visible to rate explanation usefulness.',
    };

    const countermeasures =
      band === 'Low'
        ? ['Maintain routine hygiene, hydration, and sleep countermeasures.', 'No operational restriction indicated.', 'Continue normal work schedule with routine surveillance.']
        : band === 'Moderate'
          ? ['Increase monitoring frequency and symptom logging.', 'Adopt enhanced masking/distancing if operationally feasible.', 'Shift to conservative workload plan until next reassessment.', 'Prepare just-in-time review for infection-control procedures.']
          : ['Immediate Crew Medical Officer review.', 'Enhanced infection-control precautions and reduced close contact.', 'Prioritize downlink to ground medical support when communication permits.', 'Consider temporary task reassignment or workload reduction.'];

    const jitTraining =
      band === 'Low'
        ? ['Routine self-monitoring checklist']
        : band === 'Moderate'
          ? ['Symptom re-check protocol', 'Sample collection refresher', 'Infection-control checklist']
          : ['Medical event checklist', 'Repeat sample collection guide', 'Isolation / crew protection checklist', 'Ground handoff summary checklist'];

    const timeline = [
      { day: Math.max(0, state.missionDay - 2), label: 'Pre-flag review', score: Math.max(6, integratedScore - (state.trendWorsening ? 18 : 8)) },
      { day: Math.max(0, state.missionDay - 1), label: 'Prior surveillance', score: Math.max(10, integratedScore - (state.trendWorsening ? 10 : 4)) },
      { day: state.missionDay, label: 'Current assessment', score: integratedScore },
    ];

    const conopsScenarios = scenarioMatrix.map((scenario) => ({
      title: scenario.name,
      active: scenario.active,
      detail: scenario.triggerSummary,
    }));

    const modularBlocks = [
      'Input adapters: Inspiration4-style processed blood, PBMC, plasma, saliva, symptom logs, and operations context.',
      'Evidence agents: biomarker, context, exposure, syndrome, and operations.',
      `Reasoning layer: scenario router + DAG evidence map (${routedScenario.dags.join(', ')}).`,
      'Execution layer: bounded protocol actions with explicit guardrails and escalation rules.',
      'Orchestrator: weighted fusion, confidence, and mission-priority assignment.',
    ];

    const conopsFlow = [
      { step: 'Detect', status: 'complete', detail: 'Integrated system ingested current crew state and derived multimodal signals.' },
      { step: 'Characterize', status: 'complete', detail: `${syndrome} based on biomarker + symptom/context fusion.` },
      { step: 'Route scenario', status: 'complete', detail: `Scenario router selected: ${routedScenario.name}.` },
      { step: 'Reason', status: 'complete', detail: `DAG evidence map highlighted ${dagEvidenceMap.strongestDrivers[0] || 'no dominant driver'}.` },
      { step: 'Triage', status: 'complete', detail: `${band} triage band with ${confidence.toLowerCase()} confidence and ${missionPriority.toLowerCase()} mission priority.` },
      { step: 'Recommend', status: 'complete', detail: executionProtocol.immediateAction },
      { step: 'Execute', status: band === 'High' ? 'action' : band === 'Moderate' ? 'watch' : 'routine', detail: executionProtocol.immediateAction },
      { step: 'Communicate', status: state.commDelayMinutes > 0 || band === 'High' ? 'action' : 'routine', detail: state.commDelayMinutes > 0 ? `Ground support delayed by ~${state.commDelayMinutes} min.` : 'Downlink optional unless trend worsens.' },
    ];

    const patientHistory = [
      { label: 'Crew profile', value: state.label },
      { label: 'Scenario', value: state.scenarioType },
      { label: 'Mission mode', value: state.mode },
      { label: 'Dataset grounding', value: state.datasetGrounding },
      { label: 'Prior immune-risk episodes', value: String(state.priorEpisodes) },
      { label: 'Prior viral reactivation history', value: state.priorViralReactivationHistory ? 'Present' : 'Not documented' },
      { label: 'Persistent baseline shift', value: state.immuneBaselineShift ? 'Yes' : 'No' },
      { label: 'Recent countermeasure status', value: state.recentCountermeasureUse },
      { label: 'Last review note', value: state.lastReviewNote },
    ];

    const orchestratorHandoff = {
      orchestrator: 'Decision fusion layer',
      inputsReceived: agentHandoffs.map((a) => ({ agent: a.agent, score: a.score, confidence: a.confidence })),
      mergedAssessment: syndrome,
      triageBand: band,
      internalModelBand: modelBand,
      integratedScore,
      confidence,
      missionPriority,
      decisionSummary: `Scenario-specific ${band.toLowerCase()} triage support with ${confidence.toLowerCase()} confidence and ${missionPriority.toLowerCase()} mission priority.`,
      nextAction: executionProtocol.immediateAction,
      countermeasureLead: countermeasures[0],
      routedScenario: routedScenario.name,
      neverEventViolations,
    };

    const finalRecommendationObject = {
      recipient: 'Crew Medical Officer',
      scenario: state.scenarioType || state.mode,
      routedScenario: routedScenario.name,
      routedScenarioGoal: routedScenario.goal,
      dagModels: routedScenario.dags,
      crewId: state.crewId,
      missionDay: state.missionDay,
      syndromeSupportLabel: syndrome,
      triageBand: band,
      internalModelBand: modelBand,
      confidence,
      missionPriority,
      immediateAction: executionProtocol.immediateAction,
      immediateActions: executionProtocol.actions,
      reassessmentHours: executionProtocol.reassessmentHours,
      redFlags,
      neverEventViolations,
      boundedSupportPlan: countermeasures,
      jitTraining,
      communicationPlan: state.commDelayMinutes > 0 ? `Prepare onboard support plan first; expected ground delay ~${state.commDelayMinutes} min.` : 'Ground consultation available if escalation is needed.',
    };

    const downlink = [
      `Crew ID: ${state.crewId}`,
      `Mission day: ${state.missionDay}`,
      `Mode: ${state.mode}`,
      `Routed scenario: ${routedScenario.name}`,
      `DAG models: ${routedScenario.dags.join(', ')}`,
      `Triage band: ${band}`,
      `Internal model band (pre-guardrail): ${modelBand}`,
      `Internal fusion score: ${integratedScore}/100`,
      `Confidence: ${confidence}`,
      `Syndrome support label: ${syndrome}`,
      `Mission priority: ${missionPriority}`,
      `Top drivers: ${allDrivers.slice(0, 3).map((d) => d.label).join('; ') || 'none'}`,
      `Biomarker agent: ${biomarkerAgent.summary}`,
      `Context agent: ${contextAgent.summary}`,
      `Operations agent: ${operationsAgent.summary}`,
      `Immediate action: ${executionProtocol.immediateAction}`,
      `Primary support measure: ${countermeasures[0]}`,
      `Red flags: ${redFlags.length ? redFlags.join('; ') : 'none'}`,
      `Never-event violations: ${neverEventViolations.length ? neverEventViolations.join('; ') : 'none'}`,
    ].join('\n');

    return {
      integratedScore,
      band,
      modelBand,
      confidence,
      syndrome,
      missionPriority,
      allDrivers,
      confirmatoryActions,
      protocolActions,
      executionProtocol,
      redFlags,
      inputCoverage,
      missingInputs,
      neverEvents,
      neverEventViolations,
      routedScenario,
      scenarioMatrix,
      mvpScope: MVP_SCOPE,
      validationTargets: VALIDATION_TARGETS,
      featureTable: FEATURE_TABLE,
      studyReadiness,
      dagEvidenceMap,
      dagNodeTargetsByGraph,
      countermeasures,
      jitTraining,
      timeline,
      conopsScenarios,
      modularBlocks,
      conopsFlow,
      patientHistory,
      agentHandoffs,
      orchestratorHandoff,
      finalRecommendationObject,
      downlink,
    };
  }, [state, biomarkerAgent, contextAgent, exposureAgent, syndromeAgent, operationsAgent]);

  const appBaseUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new URL(import.meta.env.BASE_URL, window.location.origin).toString();
  }, []);

  const activeDagFocus = analysis.dagEvidenceMap.dagModels.includes(dagFocus)
    ? dagFocus
    : analysis.dagEvidenceMap.dagModels[0] || 'Immune Risk';
  const availableDagNodes = analysis.dagNodeTargetsByGraph[activeDagFocus] || [];
  const activeDagNodeFocus = availableDagNodes.includes(dagNodeFocus)
    ? dagNodeFocus
    : availableDagNodes[0] || '';

  const dagCatalogRoute = useMemo(() => {
    if (!appBaseUrl) return '';
    const url = new URL('dag-catalog/index.html', appBaseUrl);
    if (activeDagFocus) {
      url.searchParams.set('risk', activeDagFocus);
    }
    if (activeDagNodeFocus) {
      url.searchParams.set('node', activeDagNodeFocus);
    }
    return url.toString();
  }, [appBaseUrl, activeDagFocus, activeDagNodeFocus]);

  const handleCopySummary = async () => {
    if (!navigator?.clipboard?.writeText) {
      setCopyFeedback('unsupported');
      window.setTimeout(() => setCopyFeedback('idle'), 2500);
      return;
    }

    try {
      await navigator.clipboard.writeText(analysis.downlink);
      setCopyFeedback('copied');
    } catch {
      setCopyFeedback('error');
    }

    window.setTimeout(() => setCopyFeedback('idle'), 2500);
  };

  const card = 'rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200';
  const inputClass = 'w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400';

  const NumberField = ({ label, value, min = 0, max = 10, step = 1, onChange }) => (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === '') return;
          const parsed = Number(raw);
          if (!Number.isFinite(parsed)) return;
          const clamped = Math.min(max, Math.max(min, parsed));
          onChange(clamped);
        }}
        className={inputClass}
      />
    </label>
  );

  const ToggleField = ({ label, value, onChange }) => (
    <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button type="button" onClick={() => onChange(value ? 0 : 1)} className={`rounded-full px-3 py-1 text-sm font-medium ${value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
        {value ? 'Yes' : 'No'}
      </button>
    </label>
  );

  const SelectField = ({ label, value, options, onChange }) => (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );

  const ExpandableField = ({ title, items, active = false, badgeLabel }) => {
    const itemList = Array.isArray(items) ? items : [items];
    const badge = badgeLabel || `${itemList.length} ${itemList.length === 1 ? 'item' : 'items'}`;

    return (
      <details className={`rounded-2xl border ${active ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-white'}`}>
        <summary className={`flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wide ${active ? 'text-slate-200' : 'text-slate-600'}`}>
          <span>{title}</span>
          <span className={`rounded-full px-2 py-1 normal-case tracking-normal ${active ? 'bg-slate-100 text-slate-900' : 'bg-slate-100 text-slate-600'}`}>{badge}</span>
        </summary>
        <div className={`space-y-2 border-t px-3 py-3 text-sm normal-case tracking-normal ${active ? 'border-slate-700 text-slate-100' : 'border-slate-100 text-slate-700'}`}>
          {itemList.map((item, index) => (
            <div key={`${title}-${index}`} className={`rounded-xl px-3 py-2 ${active ? 'bg-slate-900/60' : 'bg-slate-50'}`}>
              {item}
            </div>
          ))}
        </div>
      </details>
    );
  };

  const TimelineBar = ({ item, current }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{item.label}</span>
        <span>FD {item.day}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${item.score >= 68 ? 'bg-red-500' : item.score >= 36 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${item.score}%` }} />
      </div>
      <div className="text-sm font-medium text-slate-700">{item.score}/100 {current ? '• current' : ''}</div>
    </div>
  );

  const SurveillanceView = () => (
    <>
      <div className="space-y-6 xl:col-span-2">
        <div className={card}>
          <h2 className="mb-4 text-xl font-semibold">Mission and crew context</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Crew ID</span>
              <input className={inputClass} value={state.crewId} onChange={(e) => setField('crewId', e.target.value)} />
            </label>
            <NumberField label="Mission day" value={state.missionDay} min={0} max={10} onChange={(v) => setField('missionDay', v)} />
            <SelectField label="Mission mode" value={state.mode} options={['Routine Surveillance', 'Watch List', 'Medical Event']} onChange={(v) => setField('mode', v)} />
            <NumberField label="Comm delay (min)" value={state.commDelayMinutes} min={0} max={30} onChange={(v) => setField('commDelayMinutes', v)} />
            <SelectField label="Medical kit status" value={state.medKitStatus} options={['Nominal', 'Limited']} onChange={(v) => setField('medKitStatus', v)} />
            <SelectField label="Isolation capability" value={state.isolationCapability} options={['Available', 'Unavailable']} onChange={(v) => setField('isolationCapability', v)} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <ToggleField label="Crew Medical Officer available" value={state.cmoAvailable} onChange={(v) => setField('cmoAvailable', v)} />
            <ToggleField label="Trend worsening across checks" value={state.trendWorsening} onChange={(v) => setField('trendWorsening', v)} />
          </div>
        </div>

        <div className={card}>
          <h2 className="mb-4 text-xl font-semibold">Crew-reported clinical presentation</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <NumberField label="Feverishness (0–10)" value={state.feverishness} onChange={(v) => setField('feverishness', v)} />
            <NumberField label="Respiratory symptoms (0–10)" value={state.respiratorySymptoms} onChange={(v) => setField('respiratorySymptoms', v)} />
            <NumberField label="GI symptoms (0–10)" value={state.giSymptoms} onChange={(v) => setField('giSymptoms', v)} />
            <NumberField label="Rash / dermatitis (0–10)" value={state.rashOrDermatitis} onChange={(v) => setField('rashOrDermatitis', v)} />
            <NumberField label="Fatigue (0–10)" value={state.fatigue} onChange={(v) => setField('fatigue', v)} />
            <NumberField label="Sleep quality (0–10)" value={state.sleepQuality} onChange={(v) => setField('sleepQuality', v)} />
            <NumberField label="Stress load (0–10)" value={state.stressLoad} onChange={(v) => setField('stressLoad', v)} />
            <NumberField label="Cabin exposure concern (0–10)" value={state.cabinExposureConcern} onChange={(v) => setField('cabinExposureConcern', v)} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <ToggleField label="Recent close-contact exposure" value={state.closeContactExposure} onChange={(v) => setField('closeContactExposure', v)} />
            <ToggleField label="Persistent immune baseline shift documented" value={state.immuneBaselineShift} onChange={(v) => setField('immuneBaselineShift', v)} />
          </div>
        </div>

        <div className={card}>
          <h2 className="mb-4 text-xl font-semibold">Derived Inspiration4-style biomarker features</h2>
          <p className="mb-4 text-sm text-slate-600">These are mission-facing derived scores rather than raw lab files: whole-blood, PBMC, plasma, and saliva-style signals abstracted from processed data into interpretable onboard features.</p>
          <div className="grid gap-4 md:grid-cols-3">
            <NumberField label="Whole blood inflammation" value={state.wholeBloodInflammation} onChange={(v) => setField('wholeBloodInflammation', v)} />
            <NumberField label="Whole blood interferon" value={state.wholeBloodInterferon} onChange={(v) => setField('wholeBloodInterferon', v)} />
            <NumberField label="PBMC immune shift" value={state.pbmcImmuneShift} onChange={(v) => setField('pbmcImmuneShift', v)} />
            <NumberField label="Plasma acute phase" value={state.plasmaAcutePhase} onChange={(v) => setField('plasmaAcutePhase', v)} />
            <NumberField label="Plasma metabolic stress" value={state.plasmaMetabolicStress} onChange={(v) => setField('plasmaMetabolicStress', v)} />
            <NumberField label="Saliva viral signal" value={state.salivaViralSignal} onChange={(v) => setField('salivaViralSignal', v)} />
            <NumberField label="Prior immune-risk episodes" value={state.priorEpisodes} min={0} max={5} onChange={(v) => setField('priorEpisodes', v)} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <ToggleField label="Prior viral reactivation history" value={state.priorViralReactivationHistory} onChange={(v) => setField('priorViralReactivationHistory', v)} />
          </div>
        </div>
      </div>

      <div className="space-y-6 xl:col-span-1">
        <div className={card}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Internal fusion score</h2>
            <div className={`rounded-2xl border px-3 py-1 text-sm font-semibold ${severityStyles[analysis.band]}`}>{analysis.band} triage</div>
          </div>
          <div className="mt-5">
            <div className="text-sm text-slate-500">Secondary model score</div>
            <div className="mt-1 text-5xl font-bold tracking-tight">{analysis.integratedScore}</div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full ${analysis.band === 'Low' ? 'bg-green-500' : analysis.band === 'Moderate' ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${analysis.integratedScore}%` }} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Confidence: {analysis.confidence}</div>
            <div className={`rounded-full px-3 py-1 text-xs font-semibold ${missionPriorityStyles[analysis.missionPriority]}`}>Priority: {analysis.missionPriority}</div>
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
            <div className="font-semibold text-slate-900">Syndrome support label</div>
            <p className="mt-2">{analysis.syndrome}</p>
          </div>
        </div>

        <div className={card}>
          <h3 className="text-lg font-semibold">Crew risk timeline</h3>
          <div className="mt-4 space-y-4">
            {analysis.timeline.map((item, idx) => <TimelineBar key={`${item.label}-${item.day}-${idx}`} item={item} current={idx === analysis.timeline.length - 1} />)}
          </div>
        </div>

        <div className={card}>
          <h3 className="text-lg font-semibold">Top drivers</h3>
          <div className="mt-4 space-y-3">
            {analysis.allDrivers.map((driver, index) => (
              <div key={`${driver.label}-${index}`} className="rounded-2xl bg-slate-50 px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-800">{driver.label}</span>
                  <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-semibold text-white">+{driver.points}</span>
                </div>
                <div className="mt-1 text-xs text-slate-500">{driver.source}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={card}>
          <h3 className="text-lg font-semibold">Agent view</h3>
          <div className="mt-4 space-y-4">
            {[
              { name: 'Biomarker agent', score: biomarkerAgent.score, summary: biomarkerAgent.summary, subtitle: 'Whole blood + PBMC + plasma + saliva-derived features' },
              { name: 'Context agent', score: contextAgent.score, summary: contextAgent.summary, subtitle: 'Symptoms + trends + sleep + stress + exposure' },
              { name: 'Exposure agent', score: exposureAgent.score, summary: exposureAgent.summary, subtitle: 'Exposure history + baseline deviation + serial trend' },
              { name: 'Syndrome agent', score: syndromeAgent.score, summary: syndromeAgent.summary, subtitle: 'Pattern classification across infectious scenarios' },
              { name: 'Operations agent', score: operationsAgent.score, summary: operationsAgent.summary, subtitle: 'Comms, CMO availability, med kit, isolation constraints' },
            ].map((agent) => (
              <div key={agent.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{agent.name}</div>
                    <div className="mt-1 text-xs text-slate-500">{agent.subtitle}</div>
                  </div>
                  <div className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">{agent.score}</div>
                </div>
                <p className="mt-3 text-sm text-slate-700">{agent.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6 xl:col-span-1">
        <div className={card}>
          <h3 className="text-lg font-semibold">ConOps scenario library</h3>
          <div className="mt-4 space-y-3">
            {analysis.conopsScenarios.map((scenario, index) => (
              <div key={`${scenario.title}-${index}`} className={`rounded-2xl px-4 py-3 ${scenario.active ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'}`}>
                <div className="text-sm font-semibold">{scenario.title}</div>
                <div className={`mt-1 text-sm ${scenario.active ? 'text-slate-200' : 'text-slate-600'}`}>{scenario.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={card}>
          <h3 className="text-lg font-semibold">Modular architecture</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            {analysis.modularBlocks.map((item, index) => <div key={`module-${index}`} className="rounded-2xl bg-slate-50 px-4 py-3">{item}</div>)}
          </div>
        </div>

        <div className={card}>
          <h3 className="text-lg font-semibold">ExMC-style medical operations flow</h3>
          <div className="mt-4 space-y-3">
            {analysis.conopsFlow.map((step, index) => (
              <div key={`${step.step}-${index}`} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-900">{step.step}</div>
                  <div className={`rounded-full px-2 py-1 text-xs font-semibold ${step.status === 'action' ? 'bg-red-100 text-red-700' : step.status === 'watch' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>{step.status}</div>
                </div>
                <p className="mt-2 text-sm text-slate-700">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const EventView = () => (
    <>
      <div className="space-y-6 xl:col-span-2">
        <div className={card}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">MVP decision card</div>
              <h2 className="mt-1 text-2xl font-semibold">Remote infection-event triage</h2>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">{analysis.mvpScope.primaryQuestion}</p>
            </div>
            <div className={`rounded-2xl border px-3 py-1 text-sm font-semibold ${severityStyles[analysis.band]}`}>{analysis.band} triage</div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Routed scenario</div>
              <div className="mt-2 text-lg font-medium text-slate-800">{analysis.routedScenario.name}</div>
              <div className="mt-2 text-sm text-slate-600">{analysis.routedScenario.goal}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Syndrome support label</div>
              <div className="mt-2 text-lg font-medium text-slate-800">{analysis.syndrome}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Confidence and priority</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Confidence: {analysis.confidence}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${missionPriorityStyles[analysis.missionPriority]}`}>Priority: {analysis.missionPriority}</span>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Immediate action</div>
              <div className="mt-2 text-lg font-medium text-slate-800">{analysis.executionProtocol.immediateAction}</div>
              <div className="mt-2 text-sm text-slate-600">Next reassessment: {analysis.executionProtocol.reassessmentHours} hours</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
              <div className="text-sm font-semibold text-slate-900">Internal fusion score</div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="text-3xl font-bold tracking-tight text-slate-900">{analysis.integratedScore}/100</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Internal model band: {analysis.modelBand}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Guardrailed band: {analysis.band}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full ${analysis.band === 'Low' ? 'bg-green-500' : analysis.band === 'Moderate' ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${analysis.integratedScore}%` }} />
              </div>
              <div className="mt-2 text-sm text-slate-600">{analysis.neverEventViolations.length ? 'Guardrail override active for safety.' : 'No guardrail override triggered.'}</div>
            </div>
          </div>
        </div>

        <div className={card}>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Scenario matrix</h2>
              <p className="mt-1 text-sm text-slate-600">Cards stay compact by default. Expand a field to inspect criteria, required inputs, actions, guardrails, or validation targets.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {analysis.scenarioMatrix.map((scenario) => (
              <div key={`scenario-router-${scenario.id}`} className={`rounded-2xl border p-4 ${scenario.active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">{scenario.name}</div>
                  <div className={`rounded-full px-2 py-1 text-xs font-semibold ${scenario.active ? 'bg-slate-100 text-slate-900' : 'bg-slate-200 text-slate-700'}`}>router score {scenario.score}</div>
                </div>
                <div className={`mt-2 text-sm ${scenario.active ? 'text-slate-200' : 'text-slate-600'}`}>{scenario.triggerSummary}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {scenario.dags.map((dag) => (
                    <span key={`${scenario.id}-${dag}`} className={`rounded-full px-3 py-1 text-xs font-semibold ${scenario.active ? 'bg-white/10 text-slate-100 ring-1 ring-white/20' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>
                      {dag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 grid gap-2">
                  <ExpandableField title="Trigger criteria" items={scenario.triggerCriteria} active={scenario.active} />
                  <ExpandableField title="Minimum inputs" items={scenario.minimumRequiredInputs} active={scenario.active} />
                  <ExpandableField title="DAGs used" items={scenario.dags} active={scenario.active} badgeLabel={`${scenario.dags.length} DAGs`} />
                  <ExpandableField title="Red flags" items={scenario.redFlags} active={scenario.active} />
                  <ExpandableField title="Allowed actions" items={scenario.allowedActions} active={scenario.active} badgeLabel={`${scenario.allowedActions.length} actions`} />
                  <ExpandableField title="Never-events" items={scenario.neverEvents} active={scenario.active} />
                  <ExpandableField title="Validation target" items={scenario.validationTarget} active={scenario.active} badgeLabel="1 target" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={card}>
          <h2 className="mb-4 text-xl font-semibold">DAG reasoning layer</h2>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <label className="block space-y-1 md:w-[340px]">
              <span className="text-sm font-medium text-slate-700">DAG focus</span>
              <select
                className={inputClass}
                value={activeDagFocus}
                onChange={(e) => {
                  setDagFocus(e.target.value);
                  setDagNodeFocus('');
                }}
              >
                {analysis.dagEvidenceMap.dagModels.map((dag) => (
                  <option key={`dag-focus-${dag}`} value={dag}>
                    {dag}
                  </option>
                ))}
              </select>
            </label>
            <a href={dagCatalogRoute} target="_blank" rel="noreferrer" className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Open DAG route
            </a>
          </div>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Node targets in {activeDagFocus}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {availableDagNodes.length ? (
                availableDagNodes.map((nodeName) => (
                  <button
                    key={`dag-node-target-${nodeName}`}
                    type="button"
                    onClick={() => setDagNodeFocus(nodeName)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      activeDagNodeFocus === nodeName
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-700 ring-1 ring-slate-200'
                    }`}
                  >
                    {nodeName}
                  </button>
                ))
              ) : (
                <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500 ring-1 ring-slate-200">No node targets configured</span>
              )}
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Strongest upstream drivers</div>
              <div className="mt-2 space-y-2 text-sm text-slate-700">
                {analysis.dagEvidenceMap.strongestDrivers.map((item, index) => <div key={`dag-driver-${index}`} className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">{item}</div>)}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Missing or required inputs</div>
              <div className="mt-2 space-y-2 text-sm text-slate-700">
                {(analysis.missingInputs.length ? analysis.missingInputs : analysis.routedScenario.minimumRequiredInputs).map((item, index) => <div key={`required-input-${index}`} className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">{item}</div>)}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Uncertainty reducers</div>
              <div className="mt-2 space-y-2 text-sm text-slate-700">
                {analysis.dagEvidenceMap.uncertaintyReducers.slice(0, 3).map((item, index) => <div key={`dag-uncertainty-${index}`} className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">{item}</div>)}
              </div>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            <iframe
              title={`Linked DAG: ${activeDagFocus}${activeDagNodeFocus ? ` -> ${activeDagNodeFocus}` : ''}`}
              src={dagCatalogRoute}
              className="h-[560px] w-full border-0"
            />
          </div>
        </div>

        <div className={card}>
          <h2 className="mb-4 text-xl font-semibold">Agent reasoning traces</h2>
          <div className="space-y-4">
            {analysis.agentHandoffs.map((handoff, index) => (
              <div key={`${handoff.agent}-trace-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{handoff.agent}</div>
                    <div className="mt-1 text-xs text-slate-500">Confidence {handoff.confidence}</div>
                  </div>
                  <button type="button" onClick={() => toggleAgent(handoff.agent)} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white">
                    {expandedAgents[handoff.agent] ? 'Hide trace' : 'Show trace'}
                  </button>
                </div>
                <div className="mt-3 text-sm text-slate-700">{handoff.assessment}</div>
                {expandedAgents[handoff.agent] && (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reasoning trace</div>
                      <ul className="mt-2 space-y-2 text-sm text-slate-700">
                        {handoff.reasoningTrace?.map((step, stepIndex) => <li key={`${handoff.agent}-step-${stepIndex}`} className="rounded-xl bg-slate-50 px-3 py-2">{step}</li>)}
                      </ul>
                    </div>
                    <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Key signals</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {handoff.keySignals.map((signal, signalIndex) => <span key={`${handoff.agent}-signal-${signalIndex}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{signal}</span>)}
                      </div>
                    </div>
                    <pre className="whitespace-pre-wrap rounded-2xl bg-white p-3 text-xs leading-6 text-slate-700 ring-1 ring-slate-200">{JSON.stringify(handoff, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6 xl:col-span-2">
        <div className={card}>
          <h2 className="mb-4 text-xl font-semibold">Dynamic medical operations flow</h2>
          <div className="space-y-3">
            {analysis.conopsFlow.map((step, index) => (
              <div key={`${step.step}-event-${index}`} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-900">{step.step}</div>
                  <div className={`rounded-full px-2 py-1 text-xs font-semibold ${step.status === 'action' ? 'bg-red-100 text-red-700' : step.status === 'watch' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>{step.status}</div>
                </div>
                <p className="mt-2 text-sm text-slate-700">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={card}>
          <h2 className="mb-4 text-xl font-semibold">Protocol actions and guardrails</h2>
          <div className="space-y-3">
            {analysis.executionProtocol.actions.map((action, index) => (
              <div key={`protocol-action-${index}`} className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">{action}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3">
            <ExpandableField title="Allowed action set" items={analysis.executionProtocol.allowedActions} badgeLabel={`${analysis.executionProtocol.allowedActions.length} actions`} />
          </div>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Red flags</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {analysis.executionProtocol.redFlags.length
                ? analysis.executionProtocol.redFlags.map((flag, index) => <span key={`red-flag-${index}`} className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">{flag}</span>)
                : <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">No active red flags</span>}
            </div>
          </div>
          <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <span>Never-events</span>
              <span className="rounded-full bg-white px-2 py-1 normal-case tracking-normal text-slate-600 ring-1 ring-slate-200">{analysis.executionProtocol.neverEvents.length} rules</span>
            </summary>
            <div className="space-y-2 border-t border-slate-200 px-4 py-3">
              {analysis.executionProtocol.neverEvents.map((item, index) => (
                <div key={`never-event-${index}`} className={`rounded-xl px-3 py-2 text-sm ${item.triggered ? 'bg-red-100 text-red-700' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}>
                  {item.rule}
                </div>
              ))}
            </div>
          </details>
        </div>

        <div className={card}>
          <h2 className="mb-4 text-xl font-semibold">Causal uncertainty map</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Alternative explanations</div>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                {analysis.dagEvidenceMap.alternativeExplanations.map((item, index) => <li key={`alt-${index}`} className="rounded-xl bg-slate-50 px-3 py-2">{item}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Uncertainty reducers</div>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                {analysis.dagEvidenceMap.uncertaintyReducers.map((item, index) => <li key={`uncertainty-${index}`} className="rounded-xl bg-slate-50 px-3 py-2">{item}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div className={card}>
          <h2 className="mb-4 text-xl font-semibold">Study readiness</h2>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">MVP claim</div>
            <div className="mt-2 text-sm text-slate-700">{analysis.studyReadiness.mvpClaim}</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">Primary outcome: {analysis.studyReadiness.primaryOutcome}</div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <ExpandableField title="Validation targets" items={analysis.validationTargets} badgeLabel={`${analysis.validationTargets.length} targets`} />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current case readiness</div>
              <div className="mt-2 space-y-2">
                {Object.entries(analysis.studyReadiness.currentCaseSignals).map(([key, value]) => (
                  <div key={`readiness-${key}`} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm">
                    <span className="text-slate-700">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${value ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{value ? 'yes' : 'needs review'}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{analysis.studyReadiness.ablationQuestion}</div>
            </div>
          </div>
          <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <span>Feature table</span>
              <span className="rounded-full bg-white px-2 py-1 normal-case tracking-normal text-slate-600 ring-1 ring-slate-200">{analysis.featureTable.length} features</span>
            </summary>
            <div className="overflow-auto border-t border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-white text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Feature</th>
                    <th className="px-3 py-2 font-semibold">Source</th>
                    <th className="px-3 py-2 font-semibold">Biological meaning</th>
                    <th className="px-3 py-2 font-semibold">Scenario use</th>
                    <th className="px-3 py-2 font-semibold">Action implication</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {analysis.featureTable.map((feature) => (
                    <tr key={`feature-${feature.feature}`}>
                      <td className="px-3 py-2 font-semibold text-slate-900">{feature.feature}</td>
                      <td className="px-3 py-2">{feature.source}</td>
                      <td className="px-3 py-2">{feature.meaning}</td>
                      <td className="px-3 py-2">{feature.scenarioUse}</td>
                      <td className="px-3 py-2">{feature.actionImplication}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>

        <div className={card}>
          <h2 className="mb-4 text-xl font-semibold">Final recommendation</h2>
          <details className="rounded-2xl border border-slate-200 bg-slate-50">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-800">
              <span>Structured recommendation object</span>
              <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 ring-1 ring-slate-200">expand JSON</span>
            </summary>
            <pre className="whitespace-pre-wrap border-t border-slate-200 p-4 text-xs leading-6 text-slate-700">{JSON.stringify(analysis.finalRecommendationObject, null, 2)}</pre>
          </details>
        </div>
      </div>
    </>
  );

  const CommunicationView = () => (
    <>
      <div className="space-y-6 xl:col-span-2">
        <div className={card}>
          <h2 className="mb-4 text-xl font-semibold">Communication and downlink</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Ground support posture</div>
              <div className="mt-2 text-sm text-slate-700">{state.commDelayMinutes > 0 ? `Delayed support expected (~${state.commDelayMinutes} min).` : 'Near-real-time consultation available.'}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Operational autonomy need</div>
              <div className="mt-2 text-sm text-slate-700">{operationsAgent.summary}</div>
            </div>
          </div>
        </div>

        <div className={card}>
          <h2 className="mb-4 text-xl font-semibold">Orchestrator handoff</h2>
          <pre className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-700">{JSON.stringify(analysis.orchestratorHandoff, null, 2)}</pre>
        </div>

        <div className={card}>
          <h2 className="mb-4 text-xl font-semibold">Downlink summary</h2>
          <div className="flex justify-end">
            <button type="button" onClick={handleCopySummary} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white">
              {copyFeedback === 'copied' ? 'Copied' : 'Copy summary'}
            </button>
          </div>
          {copyFeedback === 'copied' && <div className="mt-2 text-right text-xs text-green-700">Summary copied to clipboard.</div>}
          {copyFeedback === 'error' && <div className="mt-2 text-right text-xs text-red-700">Copy failed. Clipboard permission may be blocked.</div>}
          {copyFeedback === 'unsupported' && <div className="mt-2 text-right text-xs text-red-700">Clipboard API is unavailable in this context.</div>}
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-900 p-4 text-xs leading-6 text-slate-100">{analysis.downlink}</pre>
        </div>
      </div>

      <div className="space-y-6 xl:col-span-2">
        <div className={card}>
          <h2 className="mb-4 text-xl font-semibold">JIT training and execution support</h2>
          <div className="space-y-3">
            {analysis.jitTraining.map((item, index) => <div key={`comm-jit-${index}`} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{item}</div>)}
          </div>
        </div>

        <div className={card}>
          <h2 className="mb-4 text-xl font-semibold">Modular architecture map</h2>
          <div className="space-y-3 text-sm text-slate-700">
            {analysis.modularBlocks.map((item, index) => <div key={`comm-module-${index}`} className="rounded-2xl bg-slate-50 px-4 py-3">{item}</div>)}
          </div>
        </div>

        <div className={card}>
          <h2 className="mb-4 text-xl font-semibold">Patient history</h2>
          <div className="space-y-3 text-sm text-slate-700">
            {analysis.patientHistory.map((item, index) => (
              <div key={`comm-history-${index}`} className="rounded-2xl bg-slate-50 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</div>
                <div className="mt-1">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const allHealthChecks = [...SELF_TESTS, ...SCENARIO_SELF_TESTS, ...DAG_SCENARIO_SELF_TESTS];
  const failedHealthChecks = allHealthChecks.filter((test) => !test.pass);

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className={card}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Scenario-based MVP</div>
              <h1 className="text-3xl font-bold tracking-tight">Remote Infection-Event Triage CDSS</h1>
              <p className="mt-2 max-w-4xl text-sm text-slate-600">{analysis.mvpScope.claim} The CDSS returns bounded onboard actions, while the DAG panel explains upstream drivers, missing information, and uncertainty.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${severityStyles[analysis.band]}`}>{analysis.band} triage</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{analysis.routedScenario.name}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Recheck {analysis.executionProtocol.reassessmentHours}h</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:max-w-xl lg:justify-end">
              {Object.entries(PRESETS).map(([key, preset]) => {
                const isSelected = state.label === preset.label;
                const mappedScenario = preset.targetScenarioFamily ? SCENARIO_LIBRARY[preset.targetScenarioFamily]?.name : '';
                return (
                  <button key={key} type="button" onClick={() => loadPreset(key)} className={`rounded-2xl px-4 py-2 text-left text-sm font-medium ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    <span className="block">{preset.label}</span>
                    {mappedScenario && <span className={`mt-1 block text-[10px] font-semibold uppercase tracking-wide ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>{mappedScenario}</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'event', label: 'Event Management' },
                { id: 'surveillance', label: 'Surveillance' },
                { id: 'communication', label: 'Communication' },
              ].map((tab) => (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`rounded-2xl px-4 py-2 text-sm font-medium ${activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  {tab.label}
                </button>
              ))}
            </div>
            <details className="rounded-2xl border border-slate-200 bg-slate-50">
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-700">
                <span>Build checks</span>
                <span className={`rounded-full px-2 py-1 ${failedHealthChecks.length ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{failedHealthChecks.length ? `${failedHealthChecks.length} failing` : 'all passing'}</span>
              </summary>
              <div className="flex max-w-3xl flex-wrap gap-2 border-t border-slate-200 px-4 py-3">
                {allHealthChecks.map((test) => (
                  <div key={test.name} className={`rounded-full px-3 py-1 text-xs font-semibold ${test.pass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {test.name}
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-4">
          {activeTab === 'surveillance' && <SurveillanceView />}
          {activeTab === 'event' && <EventView />}
          {activeTab === 'communication' && <CommunicationView />}
        </div>
      </div>
    </div>
  );
}
