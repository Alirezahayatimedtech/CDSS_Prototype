import { uniqueStrings } from './scoring.js';

const ENFORCED_RULES = [
  'No autonomous medication initiation',
  'No unsupported diagnosis-only output',
  'No low triage if red flags exist',
  'No recommendation without escalation triggers',
  'No hiding uncertainty',
  'No ignoring resource constraints',
  'No implying clinical validation',
];

export function applyGuardrails({ caseInput, severityResult, syndromeResult, protocolResult, uncertaintyResult }) {
  const warnings = ['Research prototype only. Output is not clinically validated.'];
  const blockedActions = [];
  const crewActions = [];
  let filteredIsolationAction = false;
  let filteredMedicationAction = false;

  for (const action of protocolResult.crewActions) {
    if (action.toLowerCase().includes('dedicated isolation area') && caseInput.mission.isolationCapability === 'Unavailable') {
      filteredIsolationAction = true;
      continue;
    }

    if (action.toLowerCase().includes('pharmacologic') || action.toLowerCase().includes('medication')) {
      filteredMedicationAction = true;
      continue;
    }

    crewActions.push(action);
  }

  const cmoActions = [...protocolResult.cmoActions];
  let finalTriage = severityResult.level;

  if (severityResult.redFlags.length && finalTriage === 'Low') {
    finalTriage = 'Watch';
    warnings.push('Triage was lifted above low because red flags are active.');
  }

  if (filteredIsolationAction) {
    blockedActions.push('Dedicated isolation is unavailable, so that action was removed.');
    crewActions.push('Use masking, distancing, and task-level contact reduction because dedicated isolation is unavailable.');
  }

  if (caseInput.mission.medKitStatus !== 'Nominal') {
    warnings.push('Medical kit is limited. Recommendations are restricted to actions that remain executable onboard.');
  }

  if (!caseInput.mission.cmoAvailable) {
    warnings.push('Crew Medical Officer is unavailable. Prioritize an early structured downlink and conservative monitoring plan.');
  }

  if (!caseInput.mission.groundSupportAvailable || caseInput.mission.communicationDelayMinutes >= 10) {
    warnings.push('Communication latency or support loss requires a more complete onboard handoff package.');
  }

  if (
    syndromeResult.topSyndrome.name === 'Medication-related mimic' ||
    syndromeResult.topSyndrome.name === 'Viral reactivation syndrome'
  ) {
    filteredMedicationAction = true;
  }

  if (filteredMedicationAction) {
    blockedActions.push('Autonomous medication initiation is blocked pending medical review.');
  }

  if (uncertaintyResult.uncertaintyLevel === 'High') {
    warnings.push('High uncertainty is active. Missing information should be reduced before stronger claims are made.');
  }

  const escalationTriggers = uniqueStrings([
    ...protocolResult.escalationTriggers,
    ...(severityResult.redFlags.length ? severityResult.redFlags : []),
    protocolResult.escalationTriggers.length ? null : 'Any new worsening before the next reassessment.',
  ]);

  if (!escalationTriggers.length) {
    warnings.push('A fallback escalation trigger was added because none were present.');
  }

  return {
    passed: true,
    finalTriage,
    warnings: uniqueStrings(warnings),
    blockedActions: uniqueStrings(blockedActions),
    enforcedRules: ENFORCED_RULES,
    adjustedCrewActions: uniqueStrings(crewActions),
    adjustedCmoActions: uniqueStrings(cmoActions),
    escalationTriggers,
    restrictions: uniqueStrings(protocolResult.restrictions),
  };
}
