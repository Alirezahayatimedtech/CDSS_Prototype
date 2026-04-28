import { uniqueStrings } from './scoring.js';

export function planSpaceAgent(caseInput) {
  const { symptoms, history, mission, dataCompleteness } = caseInput;
  const selectedModules = [];
  const decisions = [];
  const dagFamilies = ['Medical Risk', 'Operations'];

  const addModule = (id, reason) => {
    if (!selectedModules.some((module) => module.id === id)) {
      selectedModules.push({ id, reason });
    }
  };

  addModule('syndromeClassifier', 'All cases require leading syndrome classification.');
  addModule('severityScorer', 'All cases require a triage and red-flag assessment.');
  addModule('biomarkerInterpreter', 'Biomarker scores need a cautious, non-diagnostic interpretation.');
  addModule('differentialDiagnosis', 'The system must compare infectious and non-infectious explanations.');
  addModule('protocolMatcher', 'Recommendations must map to mission-safe protocols.');
  addModule('downlinkGenerator', 'A structured downlink summary is always available for handoff.');
  addModule('uncertaintyEstimator', 'The prototype must report confidence and missing-data effects.');
  addModule('guardrailChecker', 'The verifier must enforce medication, triage, and feasibility guardrails.');

  if (symptoms.cough >= 4 || symptoms.dyspnea >= 4) {
    decisions.push('Respiratory symptom burden triggered respiratory syndrome and exposure-control reasoning.');
    dagFamilies.push('Immune Risk', 'Exposure Control');
  }

  if (symptoms.giBurden >= 5 || history.foodWaterConcern) {
    decisions.push('GI symptoms and food or water concern triggered gastrointestinal protocol review.');
  }

  if (symptoms.rashOrOralLesions >= 4 && caseInput.biomarkers.viralReactivationScore >= 6) {
    decisions.push('Rash or oral lesions plus viral-pattern signal triggered reactivation review.');
    dagFamilies.push('Immune Risk');
  }

  if (history.recentMedicationChange) {
    decisions.push('Recent medication change triggered medication-related mimic review.');
    dagFamilies.push('Medication Risk');
  }

  if (history.radiationAlert || history.habitatExposureConcern) {
    decisions.push('Exposure context triggered non-infectious mimic review.');
    dagFamilies.push('Radiation Risk', 'Environmental Exposure');
  }

  if (mission.communicationDelayMinutes >= 10 || !mission.groundSupportAvailable) {
    decisions.push('Communication delay triggered structured downlink prioritization.');
    dagFamilies.push('Communications');
  }

  if (!mission.cmoAvailable || mission.medKitStatus !== 'Nominal' || mission.isolationCapability !== 'Available') {
    decisions.push('Resource constraints triggered fallback feasibility review.');
    dagFamilies.push('Resource Feasibility');
  }

  if (dataCompleteness.missingVitals || dataCompleteness.missingLabs) {
    decisions.push('Missing vitals or labs triggered higher uncertainty handling.');
    dagFamilies.push('Validation');
  }

  const focusAreas = uniqueStrings([
    symptoms.cough >= 4 || symptoms.dyspnea >= 4 ? 'Respiratory syndrome' : null,
    symptoms.giBurden >= 5 ? 'Gastrointestinal syndrome' : null,
    symptoms.rashOrOralLesions >= 4 ? 'Rash or lesion review' : null,
    history.radiationAlert ? 'Radiation mimic' : null,
    history.recentMedicationChange ? 'Medication-related mimic' : null,
    !mission.cmoAvailable || mission.medKitStatus !== 'Nominal' || mission.isolationCapability !== 'Available'
      ? 'Operational constraints'
      : null,
    dataCompleteness.missingVitals || dataCompleteness.missingLabs ? 'Missing data' : null,
  ]);

  return {
    summary: `Planner selected ${selectedModules.length} deterministic modules for a ${focusAreas[0] || 'general'} case.`,
    selectedModules,
    decisions,
    focusAreas,
    dagFamilies: uniqueStrings(dagFamilies),
  };
}
